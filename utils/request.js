import {
	BASE_URL
} from './config.js'

/**
 * 请求拦截器类
 * 统一处理：token、loading、错误提示、超时
 * 包含了普通的http请求和WebSocket请求
 */
class Request {
	constructor(options = {}) {
		this.baseOptions = options
		// 请求队列（用于控制 loading）
		this.requestQueue = []
	}

	/**
	 * 核心请求方法
	 * @param {Object} config - 请求配置
	 * @returns {Promise}
	 */
	async request(config) {
		const {
			url,
			method = 'GET',
			data = {},
			header = {},
			hideLoading = false,
			timeout = 30000,
			showError = true
		} = config

		const token = uni.getStorageSync('token')
		if (token) header.Authorization = `Bearer ${token}`

		// 只在不是第一个请求时显示 loading
		if (!hideLoading) {
			this.showLoading()
		}

		const requestId = Date.now()
		this.requestQueue.push(requestId)

		// ✅ 关键：手动封装 Promise，避免 H5 平台混用
		return new Promise((resolve, reject) => {
			uni.request({
				url: url.startsWith('http') ? url : (BASE_URL + url),
				method,
				data,
				header: {
					'Content-Type': 'application/json',
					...this.baseOptions.header,
					...header
				},
				timeout,
				success: (res) => {
					this.hideLoading(requestId)
					
					this.hideLoading(requestId)
					  // console.log('=== 进入 success ===')
					  // console.log('config.responseType', config.responseType)   // 必须打印出 arraybuffer
					  // console.log('res.data类型', Object.prototype.toString.call(res.data))

					// 二进制流直接放行,试过了不一定行
					if (config.responseType === 'arraybuffer') {
						console.log('二进制直通', res.data.byteLength);
						return resolve(res) // 整包返回（含 statusCode、data）
					}

					if (!res) {
						reject(new Error('响应为空'))
						return
					}

					// 普通 JSON
					if (res.statusCode >= 200 && res.statusCode < 300) {
						resolve(res.data)
					} else {
						const error = {
							code: res.statusCode,
							message: res.data?.detail || '请求失败',
							data: res.data
						}
						if (showError) {
							uni.showToast({
								title: error.message,
								icon: 'none',
								duration: 2000
							})
						}
						reject(error)
					}
				},
				fail: (error) => {
					this.hideLoading(requestId)
					const netError = {
						code: 'NETWORK_ERROR',
						message: error.errMsg || '网络请求失败',
						originalError: error
					}
					if (showError) {
						uni.showToast({
							title: netError.message,
							icon: 'none',
							duration: 2000
						})
					}
					reject(netError)
				}
			})
		})
	}
	/**
	 * 显示 loading
	 */
	showLoading() {
		if (this.requestQueue.length === 1) { // 第一个请求才显示
			uni.showLoading({
				title: '加载中...',
				mask: true
			})
		}
	}

	/**
	 * 隐藏 loading
	 */
	hideLoading(requestId) {
		// 从队列中移除当前请求
		const index = this.requestQueue.indexOf(requestId)
		if (index > -1) {
			this.requestQueue.splice(index, 1)
		}

		// 队列为空时隐藏 loading
		if (this.requestQueue.length === 0) {
			uni.hideLoading()
		}
	}


	/**
	 * 流式请求（用于 AI 聊天、大文本生成等场景）
	 * @param {Object} config - 请求配置 { url, method, body }
	 * @param {Function} onDelta - 收到数据片段的回调
	 * @param {Function} onError - 错误回调
	 * @param {Function} onDone - 完成回调
	 * @returns {Function} cancel - 取消请求的函数
	 */
	chatStream(config, onDelta, onError, onDone) {
		const {
			url,
			method = 'POST',
			body = {}
		} = config

		// 1. 构建完整 URL（使用 WS_URL 基础地址）
		const fullUrl = (url.startsWith('ws') || url.startsWith('http')) ?
			url.replace(/^https?/, 'ws') // 自动转换 http/https 为 ws/wss
			:
			WS_URL + url // 使用相对路径

		// 2. 建立 WebSocket 连接
		const socket = uni.connectSocket({
			url: fullUrl,
			method,
			header: {
				'Content-Type': 'application/json',
				// 传递 token（如果需要）
				...(uni.getStorageSync('token') ? {
					Authorization: `Bearer ${uni.getStorageSync('token')}`
				} : {}),
				...this.baseOptions.header
			},
			success: () => {
				console.log('[WebSocket] 连接成功:', fullUrl)
			},
			fail: (err) => {
				console.error('[WebSocket] 连接失败:', err)
				onError?.(new Error('WebSocket 连接失败: ' + err.errMsg))
			}
		})

		// 3. 监听消息接收
		socket.onMessage((res) => {
			try {
				// 假设后端返回格式：{ type: 'delta', data: '...' } 或 { type: 'error', message: '...' }
				const message = JSON.parse(res.data)

				switch (message.type) {
					case 'delta':
						onDelta?.(message.data)
						break
					case 'error':
						onError?.(new Error(message.message || 'Stream error'))
						break
					case 'done':
						onDone?.()
						socket.close()
						break
					default:
						// 兼容纯文本格式
						if (typeof res.data === 'string') {
							onDelta?.(res.data)
						}
				}
			} catch (e) {
				// 解析失败，按纯文本处理
				onDelta?.(res.data)
			}
		})

		// 4. 监听错误
		socket.onError((err) => {
			console.error('[WebSocket] 错误:', err)
			onError?.(new Error('WebSocket 错误: ' + err.errMsg))
		})

		// 5. 监听连接关闭
		socket.onClose((res) => {
			console.log('[WebSocket] 连接关闭:', res.code, res.reason)
			if (res.code !== 1000) { // 1000 是正常关闭
				onError?.(new Error('连接异常关闭: ' + res.reason))
			}
		})

		// 6. 连接打开后发送请求体
		socket.onOpen(() => {
			socket.send({
				data: JSON.stringify(body)
			})
		})

		// 7. 返回取消函数
		const cancel = () => {
			console.log('[WebSocket] 主动取消请求')
			socket.close()
		}

		return cancel
	}


	// 快捷请求方法
	get(url, config = {}) {
		return this.request({
			...config,
			url,
			method: 'GET'
		})
	}

	post(url, data = {}, config = {}) {
		return this.request({
			...config,
			url,
			method: 'POST',
			data
		})
	}

	put(url, data = {}, config = {}) {
		return this.request({
			...config,
			url,
			method: 'PUT',
			data
		})
	}

	delete(url, config = {}) {
		return this.request({
			...config,
			url,
			method: 'DELETE'
		})
	}
}

// 导出单例
export const request = new Request()