import { ref, computed } from 'vue'
import { generateReport as apiGenerateReport, downloadReport as apiDownloadReport } from '@/api/acceptance.js'

/**
 * 竣工验收报告管理 Composable
 * 管理竣工验收报告的生成、下载、缓存等功能
 */

// 创建单例状态（确保所有组件共享同一份数据）
let instance = null

export function useAcceptanceReport() {
	// 如果已经创建过实例，直接返回
	if (instance) {
		return instance
	}

	// 状态管理
	const reportGenerated = ref(false)        // 报告是否已生成
	const reportType = ref('withoutData')     // 报告类型：withoutData/withData
	const testReportFiles = ref([])           // 监测报告文件列表
	const previewTitle = ref('')              // 预览标题
	const isGenerating = ref(false)           // 是否正在生成
	const taskProgress = ref(0)               // 生成进度 0-100
	const taskStatusText = ref('')            // 当前步骤描述
	const taskState = ref('pending')          // 任务状态：pending/running/success/failed

	// 计算属性
	const canDownloadReport = computed(() => reportGenerated.value)

	// 报告类型选项
	const reportTypes = [
		{ value: 'withoutData', text: '无检测数据报告' },
		{ value: 'withData', text: '有检测数据报告' }
	]

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
					taskStatusText.value = '竣工验收报告生成完成'
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
	 * 切换报告类型
	 * @param {string} type - 报告类型
	 */
	function changeReportType(type) {
		reportType.value = type
	}

	/**
	 * 生成竣工验收报告
	 * @param {number} projectId - 项目ID
	 * @param {boolean} hasExtracted - 是否已提取项目信息
	 * @param {Object} modalRef - 进度弹窗的 ref
	 */
	async function generateReport(projectId, hasExtracted, modalRef) {
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

		if (reportType.value === 'withData' && !testReportFiles.value.length) {
			uni.showToast({
				title: '有监测数据报告，必须要先上传监测报告',
				icon: 'none'
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
			await apiGenerateReport({
				projectId: projectId,
				onProgress: (progress, statusText) => {
					updateProgressSmooth(progress, statusText)
				}
			})

			// 生成成功
			console.log('🎉 竣工验收报告生成成功，设置 reportGenerated.value = true')
			reportGenerated.value = true
			previewTitle.value = reportType.value === 'withoutData' 
				? '无监测数据的竣工验收报告已生成，请点击下载！'
				: '有监测数据的竣工验收报告已生成，请点击下载！'
			
			console.log('📊 当前 reportGenerated.value:', reportGenerated.value)
			console.log('📊 当前 canDownloadReport.value:', canDownloadReport.value)
			
			saveReportCache(projectId, {
				generated: true,
				type: reportType.value,
				previewTitle: previewTitle.value
			})

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

			// 错误处理
			console.error('生成报告失败', error, error.response?.data)

			let msg = error.message || '请稍后重试'
			if (Array.isArray(error.response?.data?.detail)) {
				msg = error.response.data.detail.map(d => d.msg).join('；')
			} else if (typeof error.response?.data === 'string') {
				msg = error.response.data
			}

			uni.showModal({
				title: '生成失败',
				content: msg,
				showCancel: false
			})
		} finally {
			isGenerating.value = false
		}
	}

	/**
	 * 下载竣工验收报告
	 * @param {number} projectId - 项目ID
	 */
	async function downloadReport(projectId) {
		if (!projectId) {
			uni.showToast({
				title: '请先选择项目',
				icon: 'none'
			})
			return
		}

		uni.showLoading({
			title: '正在下载竣工验收报告…',
			mask: true
		})

		try {
			const { ab, filename } = await apiDownloadReport(projectId)
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
	 * 保存报告缓存到本地
	 * @param {number} projectId - 项目ID
	 * @param {Object} reportData - 报告数据
	 */
	function saveReportCache(projectId, reportData) {
		try {
			const cacheKey = `acceptance_report_${projectId}`
			const cacheData = {
				...reportData,
				generatedAt: Date.now()
			}
			uni.setStorageSync(cacheKey, JSON.stringify(cacheData))
			console.log(`✅ 项目 ${projectId} 的竣工验收报告已缓存`)
		} catch (error) {
			console.error('保存竣工验收报告缓存失败:', error)
		}
	}

	/**
	 * 从本地加载报告缓存
	 * @param {number} projectId - 项目ID
	 */
	function loadReportCache(projectId) {
		try {
			const cacheKey = `acceptance_report_${projectId}`
			const cachedData = uni.getStorageSync(cacheKey)

			if (cachedData) {
				const cacheData = JSON.parse(cachedData)
				reportGenerated.value = cacheData.generated || false
				reportType.value = cacheData.type || 'withoutData'
				previewTitle.value = cacheData.previewTitle || ''
				console.log(`✅ 已加载项目 ${projectId} 的竣工验收报告缓存`)
			} else {
				reportGenerated.value = false
				reportType.value = 'withoutData'
				previewTitle.value = ''
				console.log(`ℹ️ 项目 ${projectId} 暂无竣工验收报告缓存`)
			}
		} catch (error) {
			console.error('加载竣工验收报告缓存失败:', error)
			reportGenerated.value = false
			reportType.value = 'withoutData'
			previewTitle.value = ''
		}
	}

	/**
	 * 清除报告缓存
	 * @param {number} projectId - 项目ID
	 */
	function clearReportCache(projectId) {
		try {
			const cacheKey = `acceptance_report_${projectId}`
			uni.removeStorageSync(cacheKey)
			reportGenerated.value = false
			reportType.value = 'withoutData'
			previewTitle.value = ''
			testReportFiles.value = []
			console.log(`✅ 已清除项目 ${projectId} 的竣工验收报告缓存`)
		} catch (error) {
			console.error('清除竣工验收报告缓存失败:', error)
		}
	}

	/**
	 * 重置状态（切换项目时使用）
	 */
	function resetState() {
		reportGenerated.value = false
		reportType.value = 'withoutData'
		previewTitle.value = ''
		testReportFiles.value = []
		isGenerating.value = false
		clearProgressTimer()
	}

	// 创建实例对象
	instance = {
		// 状态
		reportGenerated,
		reportType,
		testReportFiles,
		previewTitle,
		canDownloadReport,
		isGenerating,
		taskProgress,
		taskStatusText,
		taskState,
		reportTypes,

		// 方法
		changeReportType,
		generateReport,
		downloadReport,
		loadReportCache,
		saveReportCache,
		clearReportCache,
		resetState
	}

	return instance
}
