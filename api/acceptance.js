/**
 * api/acceptance.js
 * 验收报告页面，各个方法总结
 * author:zyg
 * date:2025.12.1
 */

import {
	BASE_URL
} from '@/utils/config.js'
import {
	request
} from '@/utils/request.js'

/**
 * 执行任务（提取项目信息）- 异步版本
 * @param {Object} options - 选项
 * @param {number} options.projectId - 项目ID（必填）
 * @param {string} options.projectFolder - 项目文件夹名（必填）
 * @param {Function} options.onProgress - 进度回调函数 (progress, status) => void
 * @param {number} options.pollInterval - 轮询间隔（毫秒，默认3秒）
 * @param {number} options.timeout - 超时时间（毫秒，默认30分钟）
 * @returns {Promise<Object>} 任务执行结果
 */
export async function runTask(options = {}) {
	const {
		projectId = null,
			projectFolder = null,
			onProgress = null,
			pollInterval = 3000, // 默认3秒轮询一次
			timeout = 1800000 // 默认30分钟
	} = options

	try {
		// 第一步：提交异步任务
		// console.log('📤 提交信息提取任务...')
		const submitResult = await request.post('/api/v1/completion/extract-info/async/start', {
			project_id: projectId,
			project_folder: projectFolder,
			project_data: {}
		}, {
			hideLoading: true // 已经有了自定义提示窗)
		})
		const taskId = submitResult.task_id
		// console.log(`✅ 任务已提交，Task ID: ${taskId}`)

		// 第二步：轮询任务状态
		const startTime = Date.now()

		return new Promise((resolve, reject) => {
			const pollStatus = async () => {
				try {
					// 检查是否超时
					if (Date.now() - startTime > timeout) {
						reject(new Error('任务超时，请稍后重试'))
						return
					}

					// 查询任务状态
					const statusResult = await request.get(`/api/v1/tasks/${taskId}/status`, {
						hideLoading: true // 已有自定义进度提示窗
					})

					const {
						status,
						progress = 0,
						current_step = '',
						task_result,
						error_message
					} = statusResult

					console.log(`[${status}] ${progress}% - ${current_step}`)

					// 调用进度回调
					if (onProgress && typeof onProgress === 'function') {
						onProgress(progress, current_step, status)
					}

					// 任务完成
					if (status === 'success') {
						// console.log('✅ 任务完成！')

						// 数据校验
						const data = task_result?.result || task_result
						if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
							reject(new Error('未提取到任何项目信息，请检查文件内容是否完整'))
							return
						}

						resolve({
							status: 'success',
							result: data
						})
						return
					}

					// 任务失败
					if (status === 'failed') {
						console.error('❌ 任务失败:', error_message)
						reject(new Error(error_message || '任务执行失败'))
						return
					}

					// 任务取消
					if (status === 'cancelled') {
						reject(new Error('任务已被取消'))
						return
					}

					// 继续轮询
					setTimeout(pollStatus, pollInterval)

				} catch (error) {
					console.error('查询任务状态失败:', error)
					reject(error)
				}
			}

			// 开始轮询
			pollStatus()
		})

	} catch (error) {
		// 错误分类处理
		if (error.code === 'NETWORK_ERROR' && error.message.includes('timeout')) {
			throw new Error('提取超时：文档过大或网络不稳定，请稍后重试')
		} else if (error.code === 'HTTP_ERROR' && error.message.includes('404')) {
			throw new Error('任务不存在，请联系管理员配置')
		} else {
			throw error
		}
	}
}

/**
 * 取消正在运行的任务
 * @param {string} taskId - 任务ID
 * @returns {Promise<Object>} 取消结果
 */
export async function cancelTask(taskId) {
	if (!taskId) {
		throw new Error('任务ID不能为空')
	}

	try {
		const result = await request.post(`/api/v1/tasks/${taskId}/cancel`)
		return result
	} catch (error) {
		throw new Error(error.message || '取消任务失败')
	}
}

/**
 * 获取我的任务列表
 * @param {Object} options - 选项
 * @param {string} options.status - 状态过滤（pending/running/success/failed）
 * @param {string} options.taskType - 任务类型过滤
 * @param {number} options.limit - 返回数量
 * @returns {Promise<Object>} 任务列表
 */
export async function getMyTasks(options = {}) {
	const {
		status = null,
			taskType = null,
			limit = 20
	} = options

	try {
		const params = new URLSearchParams()
		if (status) params.append('status', status)
		if (taskType) params.append('task_type', taskType)
		params.append('limit', limit)

		const result = await request.get(`/api/v1/tasks/my-tasks?${params.toString()}`)
		return result
	} catch (error) {
		throw new Error(error.message || '获取任务列表失败')
	}
}

/**
 * 转换后端提取结果为 baseTable 格式（支持嵌套对象）
 * @param {Object} result - 后端返回的 result 对象
 * @returns {Array} baseTable 格式的数组
 */
export function transformExtractResult(result) {
	// 完整的字段映射表：后端中文 key -> 英文 id + 显示标签
	const FIELD_MAP = {
		// 基本信息
		'建设项目名称': {
			id: 'project_name',
			label: '建设项目名称'
		},
		'建设单位名称': {
			id: 'company_name',
			label: '建设单位名称'
		},
		'建设地点': {
			id: 'project_address',
			label: '建设地点'
		},
		'建设项目性质': {
			id: 'project_type',
			label: '建设项目性质'
		},
		'产品及产能': {
			id: 'product_scale',
			label: '产品及产能'
		},

		// 审批信息
		'环评报告表审批部门': {
			id: 'assessment_department',
			label: '环评报告表审批部门'
		},
		'环评报告表编制单位': {
			id: 'assessment_unit',
			label: '环评报告表编制单位'
		},

		// 投资信息
		'投资总概算(万元)': {
			id: 'investment',
			label: '投资总概算(万元)'
		},
		'环保投资总概算(万元)': {
			id: 'env_investment',
			label: '环保投资总概算(万元)'
		},
		'比例': {
			id: 'env_investment_ratio',
			label: '环保投资占比'
		},

		// 建设内容
		'主要建设内容': {
			id: 'construction_content',
			label: '主要建设内容'
		},
		'改扩建项目变动情况': {
			id: 'project_changes',
			label: '改扩建项目变动情况'
		},
		// 建设内容
		'单位联系人': {
			id: 'contact_person',
			label: '单位联系人'
		},
		'联系方式': {
			id: 'contact_phone',
			label: '联系方式'
		},
		'注册地址': {
			id: 'registered_address',
			label: '建设单位注册地址'
		},

		// 污染物
		'固体废物产生情况': {
			id: 'solid_generation',
			label: '固体废物产生情况'
		},
		'污染物产排情况': {
			id: 'pollutants_emission',
			label: '污染物产排情况',
			type: 'table' // 添加类型标识
		},

	}

	const baseTable = []

	// 遍历 result 对象
	Object.entries(result).forEach(([chineseKey, value]) => {
		// 如果有映射，按映射显示
		if (FIELD_MAP[chineseKey]) {
			const fieldConfig = FIELD_MAP[chineseKey]

			// ✅ 特殊处理表格类型数据
			if (fieldConfig.type === 'table') {
				baseTable.push({
					id: fieldConfig.id,
					label: fieldConfig.label,
					value: value, // 保留原始对象，不进行格式化
					source: 'extracted',
					type: 'table' // 前端通过这个类型来识别需要渲染表格
				})
			} else {
				// 普通字段正常处理
				baseTable.push({
					id: fieldConfig.id,
					label: fieldConfig.label,
					value: formatValue(value),
					source: 'extracted'
				})
			}
		}
		// 如果是嵌套对象（但不是表格类型），展开显示
		else if (typeof value === 'object' && value !== null) {
			Object.entries(value).forEach(([subKey, subValue]) => {
				baseTable.push({
					id: `${chineseKey}_${subKey}`,
					label: `${chineseKey} - ${subKey}`,
					value: formatValue(subValue),
					source: 'extracted'
				})
			})
		}
		// 如果没有映射，直接显示
		else {
			baseTable.push({
				id: chineseKey,
				label: chineseKey,
				value: formatValue(value),
				source: 'extracted'
			})
		}
	})

	// 按id顺序排序
	const ORDER = [
		'project_name', // 建设项目名称
		'company_name', // 建设单位名称
		'project_address', // 建设地点
		'project_type', // 建设项目性质
		'product_scale', // 产品及产能
		'assessment_department', // 环评报告表审批部门
		'assessment_unit', // 环评报告表编制单位
		'investment', // 投资总概算(万元)
		'env_investment', // 环保投资总概算(万元)
		'env_investment_ratio', // 比例
		'construction_content', // 主要建设内容
		'project_changes', // 改扩建项目变动情况
		'registered_address', // 注册地址
		'contact_person', // 联系人
		'contact_phone', // 联系方式
		'solid_generation', // 固体废物产生情况
		'pollutants_emission', // 污染物产排情况
	];
	return baseTable.sort((a, b) => {
		const aIndex = ORDER.indexOf(a.id)
		const bIndex = ORDER.indexOf(b.id)
		if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
		if (aIndex !== -1) return -1
		if (bIndex !== -1) return 1
		return 0
	})
}

// 格式化值的辅助函数（处理数组、对象等）
function formatValue(value) {
	// 如果是数组，转成字符串
	if (Array.isArray(value)) {
		return value.length > 0 ? JSON.stringify(value, null, 2) : '未提取到相关信息'
	}
	// 如果是对象，转成字符串
	if (typeof value === 'object' && value !== null) {
		return JSON.stringify(value, null, 2)
	}
	// 如果是数字，直接返回
	if (typeof value === 'number') {
		return value
	}
	// 如果是字符串，去掉首尾空格
	if (typeof value === 'string') {
		return value.trim() || '未提取到相关信息'
	}
	// 其他情况
	return value || '未提取到相关信息'
}

/**
 * 标识牌下载
 * 纯前端数据 → 后端生成 Word
 * @param {Object} signboard - 标识牌数据
 * @param {number} projectId - 项目ID（必填）
 * @returns {Promise<ArrayBuffer>}
 */
export function downloadSignboardWord(signboard, projectId) {
	if (!projectId) {
		throw new Error('项目ID不能为空')
	}

	const payload = {
		project_id: projectId, // 添加项目ID
		sections: signboard.sections.map(sec => ({
			block: sec.block,
			items: sec.items.map(it => ({
				title: it.title,
				content: it.content
			}))
		}))
	};

	// #ifdef H5
	// H5 环境：uni.request 的 arraybuffer 不稳定，使用原生 fetch
	const token = uni.getStorageSync('token')
	const headers = {
		'Content-Type': 'application/json'
	}
	if (token) {
		headers['Authorization'] = `Bearer ${token}`
	}

	return fetch(BASE_URL + '/api/v1/completion/signboard/download', {
		method: 'POST',
		headers: headers,
		body: JSON.stringify(payload)
	}).then(res => {
		if (!res.ok) {
			// 处理不同的错误状态
			if (res.status === 403) {
				throw new Error('您不是该项目的成员，无权下载标识牌')
			} else if (res.status === 404) {
				throw new Error('项目提取结果文件不存在，请先提取项目信息')
			} else {
				throw new Error('生成失败')
			}
		}
		return res.arrayBuffer()
	})
	// #endif

	// #ifndef H5
	// 小程序/App 环境：直接使用 uni.request（因为 responseType 需要特殊处理）
	return new Promise((resolve, reject) => {
		const token = uni.getStorageSync('token')
		const header = {
			'Content-Type': 'application/json'
		}
		if (token) {
			header['Authorization'] = `Bearer ${token}`
		}

		uni.request({
			url: BASE_URL + '/api/v1/completion/signboard/download',
			method: 'POST',
			data: payload,
			header: header,
			responseType: 'arraybuffer',
			success: (res) => {
				console.log('标识牌下载响应:', res)
				if (res.statusCode === 200 && res.data) {
					// 检查是否是 ArrayBuffer
					if (res.data instanceof ArrayBuffer && res.data.byteLength > 0) {
						resolve(res.data)
					} else if (typeof res.data === 'string' && res.data.length > 0) {
						// 如果返回的是字符串，说明小程序没有正确处理 arraybuffer
						uni.showToast({
							title: '文件格式错误',
							icon: 'none'
						})
						reject(new Error('文件格式错误'))
					} else {
						reject(new Error('空文件'))
					}
				} else {
					reject(new Error('生成失败'))
				}
			},
			fail: (error) => {
				reject(new Error(error.errMsg || '网络请求失败'))
			}
		})
	})
	// #endif
}

/**
 * 生成监测方案（异步任务）
 * @param {Object} options - 选项
 * @param {number} options.projectId - 项目ID（必填）
 * @param {Function} options.onProgress - 进度回调函数 (progress, status) => void
 * @param {number} options.pollInterval - 轮询间隔（毫秒，默认3秒）
 * @param {number} options.timeout - 超时时间（毫秒，默认30分钟）
 * @returns {Promise<Object>} 任务执行结果
 */
export async function generateMonitorPlan(options = {}) {
	const {
		projectId = null,
			onProgress = null,
			pollInterval = 3000,
			timeout = 1800000 // 默认30分钟
	} = options

	if (!projectId) {
		throw new Error('项目ID不能为空')
	}

	try {
		// 第一步：提交异步任务
		const submitResult = await request.post('/api/v1/completion/monitor-plan/async/start', {
			project_id: projectId
		})

		const taskId = submitResult.task_id
		// console.log(`✅ 监测方案任务已提交，Task ID: ${taskId}`)

		// 第二步：轮询任务状态
		const startTime = Date.now()

		return new Promise((resolve, reject) => {
			const pollStatus = async () => {
				try {
					// 检查是否超时
					if (Date.now() - startTime > timeout) {
						reject(new Error('任务超时，请稍后重试'))
						return
					}

					// 查询任务状态
					const statusResult = await request.get(`/api/v1/tasks/${taskId}/status`)

					const {
						status,
						progress = 0,
						current_step = '',
						task_result,
						error_message
					} = statusResult

					console.log(`[${status}] ${progress}% - ${current_step}`)

					// 调用进度回调
					if (onProgress && typeof onProgress === 'function') {
						onProgress(progress, current_step, status)
					}

					// 任务完成
					if (status === 'success') {
						console.log('✅ 监测方案生成完成！')
						resolve({
							status: 'success',
							result: task_result,
							project_id: projectId
						})
						return
					}

					// 任务失败
					if (status === 'failed') {
						console.error('❌ 任务失败:', error_message)
						reject(new Error(error_message || '监测方案生成失败'))
						return
					}

					// 任务取消
					if (status === 'cancelled') {
						reject(new Error('任务已被取消'))
						return
					}

					// 继续轮询
					setTimeout(pollStatus, pollInterval)

				} catch (error) {
					console.error('查询任务状态失败:', error)
					reject(error)
				}
			}

			// 开始轮询
			pollStatus()
		})

	} catch (error) {
		if (error.message && error.message.includes('已有一个监测方案生成任务正在运行')) {
			throw new Error('您已有一个监测方案生成任务正在运行，请等待完成')
		}
		throw error
	}
}

/**
 * 下载监测方案（不指定格式，完全信任后端返回的文件名）
 * @param {number} projectId - 项目ID
 * @returns {Promise<{ab:ArrayBuffer,filename:string}>} 文件流+真实文件名
 */
export function downloadMonitorPlan(projectId) {
	if (!projectId) throw new Error('项目ID不能为空')

	const url = `/api/v1/completion/monitor-plan/${projectId}/download`

	// #ifdef H5
	const token = uni.getStorageSync('token')
	const headers = {}
	if (token) headers.Authorization = `Bearer ${token}`
	return fetch(BASE_URL + url, {
			method: 'GET',
			headers
		})
		.then(res => {
			if (!res.ok) {
				if (res.status === 403) throw new Error('无权下载')
				if (res.status === 404) throw new Error('请先点击生成监测方案')
				throw new Error('下载失败')
			}
			// 安全获取响应头（兼容大小写）
			const contentDisposition = res.headers.get('content-disposition') ||
				res.headers.get('Content-Disposition') || ''
			const filename = extractFilename(contentDisposition)
			return res.arrayBuffer().then(ab => ({
				ab,
				filename
			}))
		})
	// #endif

	// #ifndef H5
	return new Promise((resolve, reject) => {
		const token = uni.getStorageSync('token')
		const header = {}
		if (token) header.Authorization = `Bearer ${token}`
		uni.request({
			url: BASE_URL + url,
			method: 'GET',
			header,
			responseType: 'arraybuffer',
			success: (res) => {
				if (res.statusCode === 200 && res.data instanceof ArrayBuffer) {
					// 安全获取响应头（兼容大小写）
					const contentDisposition = res.header?.['Content-Disposition'] ||
						res.header?.['content-disposition'] || ''
					const filename = extractFilename(contentDisposition)
					resolve({
						ab: res.data,
						filename
					})
				} else if (res.statusCode === 404) {
					reject(new Error('请先点击生成监测方案'))
				} else {
					reject(new Error('下载失败'))
				}
			},
			fail: (e) => reject(new Error(e.errMsg || '网络错误'))
		})
	})
	// #endif
}

/* 从 Content-Disposition 头里抠文件名 */
function extractFilename(str) {
	// 确保 str 是字符串，防止 null 或 undefined 导致错误
	if (!str || typeof str !== 'string') {
		return 'AI生成报告.docx'
	}

	// 优先匹配 RFC 5987 编码格式：filename*=UTF-8''encoded_name
	const rfc5987Match = str.match(/filename\*=UTF-8''([^;\n]+)/i)
	if (rfc5987Match && rfc5987Match[1]) {
		try {
			return decodeURIComponent(rfc5987Match[1])
		} catch {
			// 解码失败，继续尝试普通格式
		}
	}

	// 降级到普通格式：filename="name" 或 filename=name
	const normalMatch = str.match(/filename=["']?([^;"'\n]+)["']?/i)
	if (normalMatch && normalMatch[1]) {
		const name = normalMatch[1].trim()
		try {
			return decodeURIComponent(name)
		} catch {
			return name
		}
	}

	return 'AI生成报告.docx'
}



/**
 * 生成竣工验收报告
 * @param {Object} options - 选项
 * @param {number} options.projectId - 项目ID（必填）
 * @param {Function} options.onProgress - 进度回调函数 (progress, status) => void
 * @param {number} options.pollInterval - 轮询间隔（毫秒，默认3秒）
 * @param {number} options.timeout - 超时时间（毫秒，默认30分钟）
 * @returns {Promise<Object>} 任务执行结果
 */
export async function generateReport(options = {}) {
	const {
		projectId = null,
			onProgress = null,
			pollInterval = 3000,
			timeout = 1800000 // 默认30分钟
	} = options

	if (!projectId) {
		throw new Error('项目ID不能为空')
	}

	try {
		// 第一步：提交异步任务
		 const submitResult = await request.post(
		   `/api/v1/completion/char/batch/merge/async?project_id=${projectId}`,
		   {} // body 为空
		 )

		const taskId = submitResult.task_id
		// console.log(`竣工验收报告生成任务已提交，Task ID: ${taskId}`)

		// 第二步：轮询任务状态
		const startTime = Date.now()

		return new Promise((resolve, reject) => {
			const pollStatus = async () => {
				try {
					// 检查是否超时
					if (Date.now() - startTime > timeout) {
						reject(new Error('任务超时，请稍后重试'))
						return
					}

					// 查询任务状态
					const statusResult = await request.get(`/api/v1/tasks/${taskId}/status`)

					const {
						status,
						progress = 0,
						current_step = '',
						task_result,
						error_message
					} = statusResult

					console.log(`[${status}] ${progress}% - ${current_step}`)

					// 调用进度回调
					if (onProgress && typeof onProgress === 'function') {
						onProgress(progress, current_step, status)
					}

					// 任务完成
					if (status === 'success') {
						console.log('✅ 竣工验收报告已生成！')
						resolve({
							status: 'success',
							result: task_result,
							project_id: projectId
						})
						return
					}

					// 任务失败
					if (status === 'failed') {
						console.error('❌ 任务失败:', error_message)
						reject(new Error(error_message || '竣工验收报告生成失败'))
						return
					}

					// 任务取消
					if (status === 'cancelled') {
						reject(new Error('任务已被取消'))
						return
					}

					// 继续轮询
					setTimeout(pollStatus, pollInterval)

				} catch (error) {
					console.error('查询任务状态失败:', error)
					reject(error)
				}
			}

			// 开始轮询
			pollStatus()
		})

	} catch (error) {
		if (error.message && error.message.includes('已有一个竣工验收报告生成任务正在运行')) {
			throw new Error('您已有一个竣工验收报告生成任务正在运行，请等待完成')
		}
		throw error
	}
}

/**
 * 下载竣工验收报告
 * @param {number} projectId - 项目ID
 * @returns {Promise<{ab:ArrayBuffer,filename:string}>} 文件流+真实文件名
 */
export function downloadReport(projectId) {
	if (!projectId) throw new Error('项目ID不能为空')

	const url = `/api/v1/completion/char/batch/merge/download?project_id=${projectId}`
	// #ifdef H5
	const token = uni.getStorageSync('token')
	const headers = {}
	if (token) headers.Authorization = `Bearer ${token}`
	return fetch(BASE_URL + url, {
			method: 'GET',
			headers
		})
		.then(res => {
			if (!res.ok) {
				if (res.status === 403) throw new Error('无权下载')
				if (res.status === 404) throw new Error('请先点击生成竣工验收报告')
				throw new Error('下载失败')
			}
			// 安全获取响应头（兼容大小写）
			const contentDisposition = res.headers.get('content-disposition') ||
				res.headers.get('Content-Disposition') || ''
			const filename = extractFilename(contentDisposition)
			return res.arrayBuffer().then(ab => ({
				ab,
				filename
			}))
		})
	// #endif

	// #ifndef H5
	return new Promise((resolve, reject) => {
		const token = uni.getStorageSync('token')
		const header = {}
		if (token) header.Authorization = `Bearer ${token}`
		uni.request({
			url: BASE_URL + url,
			method: 'GET',
			header,
			responseType: 'arraybuffer',
			success: (res) => {
				if (res.statusCode === 200 && res.data instanceof ArrayBuffer) {
					// 安全获取响应头（兼容大小写）
					const contentDisposition = res.header?.['Content-Disposition'] ||
						res.header?.['content-disposition'] || ''
					const filename = extractFilename(contentDisposition)
					resolve({
						ab: res.data,
						filename
					})
				} else if (res.statusCode === 404) {
					reject(new Error('请先点击生成竣工验收报告'))
				} else {
					reject(new Error('下载失败'))
				}
			},
			fail: (e) => reject(new Error(e.errMsg || '网络错误'))
		})
	})
	// #endif
}