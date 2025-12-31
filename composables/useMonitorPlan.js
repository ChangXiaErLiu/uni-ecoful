import { ref, computed } from 'vue'
import { generateMonitorPlan as apiGenerateMonitorPlan, downloadMonitorPlan as apiDownloadMonitorPlan } from '@/api/acceptance.js'

/**
 * 监测方案管理 Composable
 * 管理监测方案的生成、下载、缓存等功能
 */

// 创建单例状态（确保所有组件共享同一份数据）
let instance = null

export function useMonitorPlan() {
	// 如果已经创建过实例，直接返回
	if (instance) {
		return instance
	}

	// 状态管理
	const plan = ref(null)                    // 方案数据（true 表示已生成）
	const isGenerating = ref(false)           // 是否正在生成
	const taskProgress = ref(0)               // 生成进度 0-100
	const taskStatusText = ref('')            // 当前步骤描述
	const taskState = ref('pending')          // 任务状态：pending/running/success/failed

	// 计算属性
	const canDownload = computed(() => plan.value !== null)

	// 进度平滑处理变量
	let smoothProgressTimer = null
	let currentDisplayProgress = 0
	let targetProgress = 0
	let lastTargetProgress = 0
	let lastUpdateTime = 0

	/**
	 * 平滑更新进度条
	 * @param {number} newProgress - 新进度值
	 * @param {string} statusText - 状态文本
	 * @param {string} state - 任务状态
	 */
	function updateProgressSmooth(newProgress, statusText, state = 'running') {
		const progressChanged = newProgress !== lastTargetProgress

		targetProgress = newProgress
		taskStatusText.value = statusText
		taskState.value = state

		if (progressChanged) {
			lastUpdateTime = Date.now()
			lastTargetProgress = newProgress
		}

		if (!smoothProgressTimer) {
			smoothProgressTimer = setInterval(() => {
				const now = Date.now()
				const timeSinceLastUpdate = now - lastUpdateTime

				if (currentDisplayProgress < targetProgress) {
					const diff = targetProgress - currentDisplayProgress
					const step = Math.max(0.5, diff / 10)
					currentDisplayProgress = Math.min(currentDisplayProgress + step, targetProgress)
				} else if (currentDisplayProgress >= targetProgress && targetProgress < 100) {
					if (timeSinceLastUpdate > 5000) {
						const maxAllowedProgress = Math.min(targetProgress + 5, 99)
						if (currentDisplayProgress < maxAllowedProgress) {
							currentDisplayProgress += 0.1
						}
					}
				}

				taskProgress.value = Math.floor(currentDisplayProgress)

				if (currentDisplayProgress >= 99.9 && targetProgress >= 100) {
					clearInterval(smoothProgressTimer)
					smoothProgressTimer = null
					currentDisplayProgress = 100
					taskProgress.value = 100
					taskState.value = 'success'
					taskStatusText.value = '监测方案生成完成'
				}
			}, 50)
		}
	}

	/**
	 * 清理进度计时器
	 */
	function clearProgressTimer() {
		if (smoothProgressTimer) {
			clearInterval(smoothProgressTimer)
			smoothProgressTimer = null
		}
		currentDisplayProgress = 0
		targetProgress = 0
		lastTargetProgress = 0
		lastUpdateTime = 0
		taskProgress.value = 0
		taskStatusText.value = '正在初始化...'
		taskState.value = 'running'
	}

	/**
	 * 生成监测方案
	 * @param {number} projectId - 项目ID
	 * @param {boolean} hasExtracted - 是否已提取项目信息
	 * @param {Object} modalRef - 进度弹窗的 ref
	 */
	async function generatePlan(projectId, hasExtracted, modalRef) {
		// 前置检查
		if (!projectId) {
			uni.showModal({
				title: '提示',
				content: '请先选择项目',
				showCancel: false
			})
			return
		}

		if (!hasExtracted) {
			uni.showModal({
				title: '提示',
				content: '请先提取项目信息',
				showCancel: false
			})
			return
		}

		isGenerating.value = true
		clearProgressTimer()

		// 打开进度弹窗
		if (modalRef) {
			modalRef.open()
		}

		try {
			await apiGenerateMonitorPlan({
				projectId: projectId,
				onProgress: (progress, statusText) => {
					updateProgressSmooth(progress, statusText)
				}
			})

			// 生成成功
			console.log('🎉 监测方案生成成功，设置 plan.value = true')
			plan.value = true
			console.log('📊 当前 plan.value:', plan.value)
			console.log('📊 当前 canDownload.value:', canDownload.value)
			
			savePlanCache(projectId, true)

			// 关闭弹窗
			if (modalRef) {
				setTimeout(() => {
					modalRef.close()
				}, 1000)
			}

			uni.showToast({
				title: '生成成功，可下载报告',
				icon: 'success'
			})

		} catch (error) {
			clearProgressTimer()
			
			if (modalRef) {
				modalRef.close()
			}

			uni.showModal({
				title: '生成失败',
				content: error.message || '请稍后重试',
				showCancel: false
			})
		} finally {
			isGenerating.value = false
		}
	}

	/**
	 * 下载监测方案
	 * @param {number} projectId - 项目ID
	 */
	async function downloadPlan(projectId) {
		if (!projectId) {
			uni.showToast({
				title: '请先选择项目',
				icon: 'none'
			})
			return
		}

		uni.showLoading({
			title: '正在下载监测方案…',
			mask: true
		})

		try {
			const { ab, filename } = await apiDownloadMonitorPlan(projectId)
			await saveArrayBuffer(ab, filename)
			
			uni.hideLoading()
			uni.showToast({
				title: '已保存：' + filename,
				icon: 'success'
			})
		} catch (error) {
			uni.hideLoading()
			uni.showModal({
				title: '下载失败',
				content: error.message,
				showCancel: false
			})
		}
	}

	/**
	 * 跨平台保存文件
	 * @param {ArrayBuffer} arrayBuffer - 文件数据
	 * @param {string} filename - 文件名
	 */
	async function saveArrayBuffer(arrayBuffer, filename) {
		// #ifdef H5
		const blob = new Blob([arrayBuffer], {
			type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
		})
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = filename
		document.body.appendChild(a)
		a.click()
		document.body.removeChild(a)
		URL.revokeObjectURL(url)
		// #endif

		// #ifdef MP-WEIXIN
		const fs = wx.getFileSystemManager()
		const filePath = `${wx.env.USER_DATA_PATH}/${filename}`
		fs.writeFile({
			filePath,
			data: arrayBuffer,
			encoding: 'binary',
			success: () => wx.openDocument({
				filePath,
				fileType: 'docx'
			}),
			fail: () => uni.showToast({
				title: '保存失败',
				icon: 'error'
			})
		})
		// #endif

		// #ifdef APP-PLUS
		plus.io.requestFileSystem(plus.io.PUBLIC_DOWNLOADS, fs => {
			fs.root.getFile(filename, {
				create: true
			}, entry => {
				entry.createWriter(writer => {
					writer.write(arrayBuffer)
					writer.onwrite = () => uni.showToast({
						title: '已保存到下载目录'
					})
				})
			})
		})
		// #endif
	}

	/**
	 * 保存方案缓存到本地
	 * @param {number} projectId - 项目ID
	 * @param {boolean} planData - 方案数据
	 */
	function savePlanCache(projectId, planData) {
		try {
			const cacheKey = `monitor_plan_${projectId}`
			const cacheData = {
				plan: planData,
				generatedAt: Date.now()
			}
			uni.setStorageSync(cacheKey, JSON.stringify(cacheData))
			console.log(`✅ 项目 ${projectId} 的监测方案已缓存`)
		} catch (error) {
			console.error('保存监测方案缓存失败:', error)
		}
	}

	/**
	 * 从本地加载方案缓存
	 * @param {number} projectId - 项目ID
	 */
	function loadPlanCache(projectId) {
		try {
			const cacheKey = `monitor_plan_${projectId}`
			const cachedData = uni.getStorageSync(cacheKey)

			if (cachedData) {
				const cacheData = JSON.parse(cachedData)
				plan.value = cacheData.plan
				console.log(`✅ 已加载项目 ${projectId} 的监测方案缓存`)
			} else {
				plan.value = null
				console.log(`ℹ️ 项目 ${projectId} 暂无监测方案缓存`)
			}
		} catch (error) {
			console.error('加载监测方案缓存失败:', error)
			plan.value = null
		}
	}

	/**
	 * 清除方案缓存
	 * @param {number} projectId - 项目ID
	 */
	function clearPlanCache(projectId) {
		try {
			const cacheKey = `monitor_plan_${projectId}`
			uni.removeStorageSync(cacheKey)
			plan.value = null
			console.log(`✅ 已清除项目 ${projectId} 的监测方案缓存`)
		} catch (error) {
			console.error('清除监测方案缓存失败:', error)
		}
	}

	/**
	 * 重置状态（切换项目时使用）
	 */
	function resetState() {
		plan.value = null
		isGenerating.value = false
		clearProgressTimer()
	}

	// 创建实例对象
	instance = {
		// 状态
		plan,
		canDownload,
		isGenerating,
		taskProgress,
		taskStatusText,
		taskState,

		// 方法
		generatePlan,
		downloadPlan,
		loadPlanCache,
		savePlanCache,
		clearPlanCache,
		resetState
	}

	return instance
}
