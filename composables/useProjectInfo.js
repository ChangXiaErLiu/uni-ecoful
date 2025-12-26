import { ref, reactive, computed, watch, onUnmounted } from 'vue'
import { runTask, transformExtractResult, downloadSignboardWord } from '@/api/acceptance.js'
import { useMonitorPlan } from '@/composables/useMonitorPlan.js'
import { useFieldSurveyData } from '@/composables/useFieldSurveyData.js'

/**
 * 项目信息管理 Composable
 * 管理验收报告第一步（项目选择、信息提取、标识牌）的所有状态和业务逻辑
 */

// 创建单例状态（确保所有组件共享同一份数据）
let instance = null

export function useProjectInfo() {
	// 如果已经创建过实例，直接返回
	if (instance) {
		return instance
	}

	// ===== 项目选择相关状态 =====
	const selectedProjectId = ref(null) // 选中的项目ID
	const selectedProject = ref(null) // 选中的项目对象
	const projectList = ref([]) // 完整项目列表
	const projectFiles = ref([]) // 项目文件列表
	const projectSearchKeyword = ref('') // 搜索关键词
	const projectPickerPopup = ref(null) // 弹窗引用

	// 文件状态轮询相关
	const pollingTimer = ref(null) // 轮询定时器
	const isPolling = ref(false) // 是否正在轮询
	const pollingCount = ref(0) // 轮询次数
	const MAX_POLLING_COUNT = 100 // 最多轮询100次（约5分钟）
	const POLLING_INTERVAL = 3000 // 轮询间隔（3秒）

	// ===== 信息提取相关状态 =====
	const extracting = ref(false) // 提取状态
	const extractionOk = ref(false) // 提取完成标志
	const baseTable = ref([]) // 项目基本信息表 - 必须是数组

	// 任务进度弹窗相关状态
	const taskProgressTitle = ref('信息提取中')
	const taskProgress = ref(0)
	const taskStatusText = ref('正在初始化...')
	const taskState = ref('running')

	// 新增项目基本信息弹窗
	const newBaseInfoPopup = ref(null)
	const newBaseInfoLabel = ref('')

	// 选择删除模式
	const selectMode = ref(false)
	const selectedIds = ref([])

	// ===== 标识牌相关状态 =====
	const showSignboard = ref(false)
	const signboard = reactive({
		sections: [
			{ block: '废水', items: [{ title: '', content: '' }] },
			{ block: '废气', items: [{ title: '', content: '' }] },
			{ block: '噪声', items: [{ title: '', content: '' }] },
			{ block: '危险废物', items: [{ title: '', content: '' }] }
		]
	})

	// ===== 计算属性 =====
	// 过滤后的项目列表（根据搜索关键词）
	const filteredProjects = computed(() => {
		if (!projectSearchKeyword.value) {
			return projectList.value
		}
		const keyword = projectSearchKeyword.value.toLowerCase().trim()
		return projectList.value.filter(project => {
			const name = (project.name || '').toLowerCase()
			const desc = (project.description || '').toLowerCase()
			const folder = (project.folder_name || '').toLowerCase()
			return name.includes(keyword) || desc.includes(keyword) || folder.includes(keyword)
		})
	})

	// ===== 项目选择相关方法 =====
	
	// 加载项目列表
	async function loadProjects() {
		try {
			const { getProjects } = await import('@/api/project.js')
			const response = await getProjects()
			projectList.value = response || []
		} catch (error) {
			console.error('加载项目列表失败:', error)
			uni.showToast({
				title: '加载项目列表失败',
				icon: 'none'
			})
		}
	}

	// 加载项目文件列表
	async function loadProjectFiles(projectId, silent = false) {
		try {
			if (!silent) {
				uni.showLoading({
					title: '加载文件列表...',
					mask: true
				})
			}

			const { getProjectDocuments } = await import('@/api/project.js')
			const response = await getProjectDocuments(projectId)

			if (Array.isArray(response)) {
				projectFiles.value = response
			} else if (response && Array.isArray(response.documents)) {
				projectFiles.value = response.documents
			} else {
				projectFiles.value = []
			}

			if (!silent) {
				uni.hideLoading()
				if (projectFiles.value.length === 0) {
					uni.showToast({
						title: '该项目暂无文件',
						icon: 'none'
					})
				}
			}
		} catch (error) {
			console.error('加载项目文件失败:', error)
			if (!silent) {
				uni.hideLoading()
				uni.showToast({
					title: '加载文件列表失败',
					icon: 'none'
				})
			}
			projectFiles.value = []
		}
	}

	// 检查是否有文件正在处理
	function hasProcessingFiles() {
		return projectFiles.value.some(file =>
			!['indexed', 'failed'].includes(file.status)
		)
	}

	// 开始轮询文件状态
	function startPollingFileStatus(projectId) {
		if (!hasProcessingFiles()) {
			return
		}

		if (isPolling.value) {
			console.log('⚠️ 已在轮询中，跳过')
			return
		}

		isPolling.value = true
		pollingCount.value = 0

		pollingTimer.value = setInterval(async () => {
			pollingCount.value++

			if (pollingCount.value > MAX_POLLING_COUNT) {
				console.log('⏰ 达到最大轮询次数，停止轮询')
				stopPolling()
				uni.showToast({
					title: '文件处理超时，请手动刷新',
					icon: 'none',
					duration: 2000
				})
				return
			}

			try {
				await loadProjectFiles(projectId, true)

				if (!hasProcessingFiles()) {
					console.log('✅ 所有文件处理完成，停止轮询')
					stopPolling()
					uni.showToast({
						title: '文件处理完成',
						icon: 'success',
						duration: 2000
					})
				}
			} catch (error) {
				console.error('❌ 轮询文件状态失败:', error)
			}
		}, POLLING_INTERVAL)
	}

	// 停止轮询
	function stopPolling() {
		if (pollingTimer.value) {
			clearInterval(pollingTimer.value)
			pollingTimer.value = null
		}
		isPolling.value = false
		pollingCount.value = 0
	}

	// 打开项目选择器弹窗
	function openProjectPicker() {
		if (projectList.value.length === 0) {
			uni.showToast({
				title: '暂无项目，请先创建项目',
				icon: 'none'
			})
			return
		}
		projectSearchKeyword.value = ''
		// 注意：弹窗的打开需要在组件中通过 ref 调用
		return true
	}

	// 关闭项目选择器弹窗
	function closeProjectPicker() {
		// 注意：弹窗的关闭需要在组件中通过 ref 调用
		return true
	}

	// 选择项目
	async function selectProject(project) {
		selectedProjectId.value = project.id
		selectedProject.value = project

		try {
			uni.setStorageSync('acceptance_project_id', project.id)
			uni.setStorageSync('acceptance_project_info', JSON.stringify({
				id: project.id,
				name: project.name,
				description: project.description,
				folder_name: project.folder_name
			}))
		} catch (e) {
			console.warn('⚠️ 保存项目选择失败:', e)
		}

		stopPolling()
		await loadProjectFiles(project.id)
		startPollingFileStatus(project.id)
		loadProjectCache(project.id)

		uni.showToast({
			title: `已选择：${project.name}`,
			icon: 'success',
			duration: 1500
		})

		return true // 返回true表示选择成功，组件可以关闭弹窗
	}

	// 搜索输入处理
	function onSearchInput() {
		console.log('搜索关键词:', projectSearchKeyword.value)
	}

	// ===== 文件工具方法 =====
	
	// 文件图标映射
	function getFileIcon(extension) {
		const ext = (extension || '').toLowerCase().replace('.', '')
		const iconMap = {
			'pdf': 'paperplane',
			'doc': 'compose',
			'docx': 'compose',
			'xls': 'bars',
			'xlsx': 'bars',
			'ppt': 'image',
			'pptx': 'image',
			'md': 'compose',
			'txt': 'compose',
			'jpg': 'image',
			'jpeg': 'image',
			'png': 'image',
			'gif': 'image'
		}
		return iconMap[ext] || 'paperclip'
	}

	// 格式化文件大小
	function formatFileSize(bytes) {
		if (!bytes) return '0 B'
		const k = 1024
		const sizes = ['B', 'KB', 'MB', 'GB']
		const i = Math.floor(Math.log(bytes) / Math.log(k))
		return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
	}

	// 格式化文件状态
	function formatFileStatus(status) {
		const statusMap = {
			'uploaded': '已上传',
			'converting': '转换中',
			'converted': '已转换',
			'vectorizing': '向量化中',
			'indexed': '已索引',
			'failed': '处理失败'
		}
		return statusMap[status] || status
	}

	// 获取状态文本
	function getStatusText(status) {
		const statusMap = {
			'uploaded': '已上传',
			'converting': '转换中',
			'converted': '已转换',
			'vectorizing': '处理中',
			'indexed': '✓ 已就绪',
			'failed': '失败'
		}
		return statusMap[status] || status
	}

	// 获取状态样式类
	function getStatusClass(status) {
		const classMap = {
			'uploaded': 'status-uploaded',
			'converting': 'status-processing',
			'converted': 'status-processing',
			'vectorizing': 'status-processing',
			'indexed': 'status-success',
			'failed': 'status-error'
		}
		return classMap[status] || ''
	}

	// ===== 缓存管理方法 =====
	
	// 加载项目缓存数据
	function loadProjectCache(projectId) {
		if (!projectId) return

		const cacheKey = `project_base_info_${projectId}`
		const cachedData = uni.getStorageSync(cacheKey)

		if (cachedData) {
			try {
				const parsedData = JSON.parse(cachedData)
				
				// ✅ 数据格式验证：确保是数组
				if (Array.isArray(parsedData)) {
					baseTable.value = parsedData
				} else if (typeof parsedData === 'object' && parsedData !== null) {
					// 如果是旧格式的对象，转换为数组格式
					const converted = transformExtractResult(parsedData)
					if (Array.isArray(converted)) {
						baseTable.value = converted
						// 更新缓存为新格式
						uni.setStorageSync(cacheKey, JSON.stringify(baseTable.value))
					} else {
						baseTable.value = []
					}
				} else {
					baseTable.value = []
				}
				
				// 最终验证：确保 baseTable.value 是数组
				if (!Array.isArray(baseTable.value)) {
					baseTable.value = []
					extractionOk.value = false
					return
				}
				
				extractionOk.value = true
				console.log(`✅ 已加载项目 ${projectId} 的缓存数据，共 ${baseTable.value.length} 条`)

				// 自动提取污染治理设施到现场踏勘
				const fieldSurveyData = useFieldSurveyData()
				fieldSurveyData.extractFacilitiesFromBaseTable(projectId, baseTable.value)

				// 加载监测方案缓存
				const monitorPlanState = useMonitorPlan()
				monitorPlanState.loadPlanCache(projectId)

				uni.showToast({
					title: '已加载缓存数据',
					icon: 'success',
					duration: 1500
				})
			} catch (error) {
				console.error('解析缓存数据失败:', error)
				baseTable.value = []
				extractionOk.value = false
			}
		} else {
			baseTable.value = []
			extractionOk.value = false
			console.log(`ℹ️ 项目 ${projectId} 暂无缓存数据`)
		}
	}

	// 清除当前项目的缓存
	function clearProjectCache() {
		if (!selectedProjectId.value) {
			uni.showToast({
				title: '请先选择项目',
				icon: 'none'
			})
			return
		}

		uni.showModal({
			title: '清除缓存',
			content: '确定要清除当前项目的所有缓存数据吗？清除后需要重新提取信息。',
			success: (res) => {
				if (res.confirm) {
					const cacheKey = `project_base_info_${selectedProjectId.value}`
					uni.removeStorageSync(cacheKey)
					uni.removeStorageSync('acceptance_project_id')
					uni.removeStorageSync('acceptance_project_info')

					// 清除监测方案缓存
					const monitorPlanState = useMonitorPlan()
					monitorPlanState.clearPlanCache(selectedProjectId.value)
					
					// 清除现场踏勘相关缓存
					const fieldSurveyData = useFieldSurveyData()
					const facilityKey = `project_facility_list_${selectedProjectId.value}`
					const outletKey = `project_outlet_list_${selectedProjectId.value}`
					uni.removeStorageSync(facilityKey)
					uni.removeStorageSync(outletKey)

					// 重置状态为空数组（不是对象！）
					baseTable.value = []
					signboard.sections.forEach(sec => (sec.items = []))
					showSignboard.value = false
					extractionOk.value = false
					selectedProjectId.value = null
					selectedProject.value = null
					projectFiles.value = []

					console.log(`🗑️ 已清除项目缓存和选择`)

					uni.showToast({
						title: '缓存已清除',
						icon: 'success'
					})
				}
			}
		})
	}

	// ===== 信息提取相关方法 =====
	
	// 进度平滑处理变量
	let smoothProgressTimer = null
	let currentDisplayProgress = 0
	let targetProgress = 0
	let lastTargetProgress = 0
	let lastUpdateTime = 0

	// 平滑更新进度条
	function updateProgressSmooth(newProgress, statusText, state = 'running') {
		const progressChanged = newProgress !== lastTargetProgress

		targetProgress = newProgress
		taskStatusText.value = statusText
		taskState.value = state

		if (progressChanged) {
			lastUpdateTime = Date.now()
			lastTargetProgress = newProgress
			console.log(`[进度真实更新] ${newProgress}% - ${statusText}`)
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
					taskStatusText.value = '信息提取完成'
				}
			}, 50)
		}
	}

	// 清理进度计时器
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

	// 提取信息到项目基本表
	async function simulateExtract(taskProgressModalRef) {
		if (!selectedProjectId.value) {
			uni.showModal({
				title: '提示',
				content: '请先选择一个项目',
				showCancel: false,
				confirmText: '知道了'
			})
			return
		}

		if (projectFiles.value.length === 0) {
			uni.showModal({
				title: '提示',
				content: '该项目暂无文件，请先在项目管理模块上传文件',
				showCancel: false,
				confirmText: '知道了'
			})
			return
		}

		const hasIndexedFiles = projectFiles.value.some(file => file.status === 'indexed')
		if (!hasIndexedFiles) {
			uni.showModal({
				title: '提示',
				content: '项目文件正在处理中，请稍后再试',
				showCancel: false,
				confirmText: '知道了'
			})
			return
		}

		extracting.value = true
		clearProgressTimer()

		taskProgressTitle.value = '信息提取中'
		taskProgress.value = 0
		taskStatusText.value = '正在提交任务...'
		taskState.value = 'pending'
		
		if (taskProgressModalRef) {
			taskProgressModalRef.open()
		}

		try {
			const result = await runTask({
				projectId: selectedProjectId.value,
				projectFolder: selectedProject.value.folder_name,
				onProgress: (progress, statusText, state) => {
					updateProgressSmooth(progress, statusText, state)
				},
				pollInterval: 3000,
				timeout: 1800000
			})

			updateProgressSmooth(100, '任务完成', 'success')

			if (result?.status !== 'success' || !result.result) {
				throw new Error(result?.message || '提取失败：后端未返回有效数据')
			}

			const transformed = transformExtractResult(result.result)
			
			// 验证转换结果是数组
			if (!Array.isArray(transformed)) {
				console.error('❌ transformExtractResult 返回的不是数组:', typeof transformed)
				throw new Error('数据转换失败：结果不是数组格式')
			}
			
			baseTable.value = transformed
			console.log('✅ 信息提取成功，baseTable 长度:', baseTable.value.length)

			const cacheKey = `project_base_info_${selectedProjectId.value}`
			uni.setStorageSync(cacheKey, JSON.stringify(baseTable.value))
			console.log(`✅ 项目 ${selectedProjectId.value} 的数据已缓存`)

			extractionOk.value = true

			// 关闭弹窗
			if (taskProgressModalRef) {
				setTimeout(() => {
					taskProgressModalRef.close()
					uni.showToast({
						title: '信息提取完成',
						icon: 'success',
						duration: 2000
					})
				}, 1000)
			}

		} catch (error) {
			clearProgressTimer()
			if (taskProgressModalRef) {
				taskProgressModalRef.close()
			}

			console.error('[Extract] 提取失败:', error)

			if (error.message.includes('超时') || error.message.includes('timeout')) {
				uni.showModal({
					title: '提取超时了！',
					content: '任务执行时间过长，可能原因：\n1. 文档过大（建议<50MB）\n2. 网络不稳定\n3. 服务器繁忙\n\n建议稍后重试或联系管理员',
					showCancel: false,
					confirmText: '知道了'
				})
			} else if (error.message.includes('未提取到')) {
				uni.showModal({
					title: '提取失败',
					content: '文档中未找到项目信息，请检查：\n1. 文件是否为完整的环评报告\n2. 文件内容是否清晰可读\n3. 文件格式是否正确',
					showCancel: false,
					confirmText: '知道了'
				})
			} else if (error.message.includes('已有任务在运行')) {
				uni.showModal({
					title: '任务进行中',
					content: '您已有一个信息提取任务正在运行，请等待完成后再提交新任务',
					showCancel: false,
					confirmText: '知道了'
				})
			} else {
				uni.showModal({
					title: '提取失败',
					content: error.message || '无法从文档中提取项目信息，请稍后重试',
					showCancel: false,
					confirmText: '知道了'
				})
			}
		} finally {
			extracting.value = false
		}
	}

	// ===== 基本信息表相关方法 =====
	
	// 打开新增项目基本信息弹窗
	function openAddBase() {
		newBaseInfoLabel.value = ''
		return true // 返回true表示可以打开弹窗
	}

	// 确认新增项目基本信息
	function confirmAddBaseInfo() {
		const label = (newBaseInfoLabel.value || '').trim()
		if (!label) {
			uni.showToast({
				title: '请输入字段名称',
				icon: 'none'
			})
			return false
		}
		baseTable.value.push({
			id: Date.now() + Math.random(),
			section: '',
			label,
			value: '',
			source: 'manual',
			required: false,
		})
		return true // 返回true表示可以关闭弹窗
	}

	// 关闭新增项目基本信息弹窗
	function closeBaseInfo() {
		return true
	}

	// 切换选择删除模式
	function toggleSelectMode() {
		selectMode.value = !selectMode.value
		if (!selectMode.value) selectedIds.value = []
	}

	// 切换选中状态
	function toggleSelected(id) {
		const idx = selectedIds.value.indexOf(id)
		if (idx > -1) selectedIds.value.splice(idx, 1)
		else selectedIds.value.push(id)
	}

	// 删除选中项
	function removeSelected() {
		if (selectedIds.value.length === 0) {
			uni.showToast({
				title: '请先选择要删除的项',
				icon: 'none'
			})
			return
		}

		uni.showModal({
			title: '确认删除',
			content: `确定要删除选中的 ${selectedIds.value.length} 项吗？`,
			success: (res) => {
				if (res.confirm) {
					baseTable.value = baseTable.value.filter(
						item => !selectedIds.value.includes(item.id)
					)
					selectedIds.value = []
					selectMode.value = false
					uni.showToast({
						title: '删除成功',
						icon: 'success'
					})
				}
			}
		})
	}

	// ===== 标识牌相关方法 =====
	
	// 从baseTable中提取基本信息
	function findBaseValue(label) {
		const r = baseTable.value.find(x => x.label === label)
		return r ? (r.value || '') : ''
	}

	// 生成标识牌信息(从项目基本信息提取)
	function generateSignboard() {
		const unitName = findBaseValue('建设单位名称') || findBaseValue('单位名称') || ''
		const emissionData = baseTable.value.find(x => x.id === 'pollutants_emission')?.value

		if (!emissionData || typeof emissionData !== 'object') {
			uni.showToast({
				title: '未提取到污染物信息',
				icon: 'none'
			})
			return
		}

		// 清空旧数据
		signboard.sections.forEach(sec => (sec.items = []))

		// 辅助函数：拆分排污口编号
		function splitOutletCodes(codeStr) {
			if (!codeStr) return []
			const invalidCodes = ['/', '信息待补充', '']
			return codeStr
				.split(/[、,，;；]/)
				.map(c => c.trim())
				.filter(c => c && !invalidCodes.includes(c))
		}

		// 辅助函数：按排污口编号分组并合并污染因子
		function groupByOutletCode(list) {
			const outletMap = new Map()
			list.forEach(item => {
				const codes = splitOutletCodes(item['排污口编号'])
				const wryz = item['污染因子'] || ''

				codes.forEach(code => {
					if (!outletMap.has(code)) {
						outletMap.set(code, {
							factors: new Set(),
							otherInfo: item
						})
					}
					if (wryz) {
						const factors = wryz.split(/[、,，;；]/).map(f => f.trim()).filter(f => f)
						factors.forEach(factor => outletMap.get(code).factors.add(factor))
					}
				})
			})
			return outletMap
		}

		// 辅助函数：生成标识牌项
		function generateSignboardItems(pollutantList, blockName) {
			const outlets = groupByOutletCode(pollutantList)
			const section = signboard.sections.find(s => s.block === blockName)

			outlets.forEach((data, code) => {
				const factors = Array.from(data.factors).join('、')
				section.items.push(
					{ title: '单位名称', content: unitName },
					{ title: '排放口编号', content: code },
					{ title: '污染因子', content: factors || (blockName === '噪声' ? '设备噪声' : '未提取到污染因子') }
				)
			})
		}

		// 生成废水标识牌
		const waterList = emissionData['水污染物'] || []
		if (waterList.length > 0) {
			generateSignboardItems(waterList, '废水')
		}

		// 生成废气标识牌
		const gasList = emissionData['大气污染物'] || []
		if (gasList.length > 0) {
			generateSignboardItems(gasList, '废气')
		}

		// 生成噪声标识牌
		const noiseList = emissionData['噪声'] || []
		if (noiseList.length > 0) {
			generateSignboardItems(noiseList, '噪声')
		}

		// 危险废物
		const hazardousWasteList = emissionData['危险废物'] || []

		function extractWasteNames(wasteList) {
			if (!Array.isArray(wasteList) || wasteList.length === 0) {
				return '实验室废弃物、实验室废水污泥、医疗废物、废活性炭'
			}
			const names = new Set()
			wasteList.forEach(item => {
				const name = item['废物名称'] || ''
				if (name) names.add(name.trim())
			})
			return names.size > 0 ? Array.from(names).join('、') : '实验室废弃物、实验室废水污泥、医疗废物、废活性炭'
		}

		function extractAllHazardCodes(wasteList) {
			if (!Array.isArray(wasteList) || wasteList.length === 0) {
				return 'HW49'
			}
			const codes = new Set()
			wasteList.forEach(item => {
				const category = item['危险废物类别'] || ''
				if (category) {
					const matches = category.match(/HW\d+/g)
					if (matches) {
						matches.forEach(code => codes.add(code))
					}
				}
			})
			return codes.size > 0 ? Array.from(codes).join('、') : 'HW49'
		}

		function extractAllHazardProperties(wasteList) {
			if (!Array.isArray(wasteList) || wasteList.length === 0) {
				return '毒性、腐蚀性'
			}
			const properties = new Set()
			wasteList.forEach(item => {
				const hazard = item['危险特性'] || ''
				if (hazard) {
					const matches = hazard.match(/（([^）]+)）/g)
					if (matches) {
						matches.forEach(m => {
							const prop = m.replace(/[（）]/g, '').trim()
							if (prop) properties.add(prop)
						})
					}
				}
			})
			return properties.size > 0 ? Array.from(properties).join('、') : '毒性、腐蚀性'
		}

		const WFItems = [
			{ title: '主要成分', content: extractAllHazardCodes(hazardousWasteList) },
			{ title: '化学名称', content: extractWasteNames(hazardousWasteList) },
			{ title: '危险情况', content: extractAllHazardProperties(hazardousWasteList) },
			{ title: '安全措施', content: '接触时佩戴个人防护用品（全面罩/丁晴手套）' },
			{ title: '废物产生单位', content: unitName },
			{ title: '地址', content: findBaseValue('建设地点') },
			{ title: '电话', content: findBaseValue('联系方式') },
			{ title: '联系人', content: findBaseValue('单位联系人') },
		]
		signboard.sections.find(s => s.block === '危险废物').items = WFItems

		uni.showToast({
			title: '已生成标识牌',
			icon: 'success'
		})
	}

	// 添加一组排污标识牌（只允许噪声新增）
	function addSignItem(sectionIdx) {
		const sec = signboard.sections[sectionIdx]
		const block = sec.block
		const unitName = findBaseValue('建设单位名称') || findBaseValue('单位名称') || ''

		if (block !== '噪声') {
			uni.showToast({
				title: '只有噪声可以手动新增',
				icon: 'none'
			})
			return
		}

		let maxNum = 0
		for (let i = 0; i < sec.items.length; i += 3) {
			const codeItem = sec.items[i + 1]
			if (codeItem && codeItem.title === '排放口编号') {
				const code = codeItem.content || ''
				const match = code.match(/\d+/)
				if (match) {
					const num = parseInt(match[0], 10)
					if (num > maxNum) maxNum = num
				}
			}
		}

		let code = ''
		if (block === '废水') code = `DW${String(maxNum + 1).padStart(3,'0')}`
		else if (block === '废气') code = `DA${String(maxNum + 1).padStart(3,'0')}`
		else if (block === '噪声') code = `ZS-${String(maxNum + 1).padStart(2,'0')}`

		const group = [
			{ title: '单位名称', content: unitName },
			{ title: '排放口编号', content: code },
			{ title: '污染因子', content: '设备噪声' }
		]

		sec.items.push(...group)

		uni.showToast({
			title: '已添加新排污口',
			icon: 'success'
		})
	}

	// 按块决定是否 3 条一组
	function groupItems(items, block) {
		if (block === '危险废物') return [items]
		const groups = []
		for (let i = 0; i < items.length; i += 3) {
			groups.push(items.slice(i, i + 3))
		}
		return groups
	}

	// 删除指定组标识牌信息
	function removeGroup(section, groupIndex) {
		const start = groupIndex * 3
		const codeItem = section.items.slice(start, start + 3)
			.find(it => it.title === '排放口编号')
		const code = codeItem?.content || '未知编号'

		uni.showModal({
			title: '永久删除',
			content: `确定删除排污口  ${code}  所有信息吗？`,
			confirmText: '确定',
			cancelText: '取消',
			success: (res) => {
				if (res.confirm) {
					section.items.splice(start, 3)
				}
			}
		})
	}

	// 标识牌下载
	function downloadSignboard() {
		if (!selectedProjectId.value) {
			uni.showModal({
				title: '提示',
				content: '请先选择一个项目',
				showCancel: false
			})
			return
		}

		uni.showLoading({
			title: '正在生成文档…'
		})
		
		downloadSignboardWord(signboard, selectedProjectId.value)
			.then(buf => {
				const fileName = '排污标识牌.docx'
				// #ifdef H5
				const blob = new Blob([buf], {
					type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
				})
				const url = URL.createObjectURL(blob)
				const a = document.createElement('a')
				a.href = url
				a.download = '排污标识牌.docx'
				document.body.appendChild(a)
				a.click()
				document.body.removeChild(a)
				URL.revokeObjectURL(url)
				// #endif

				// #ifdef MP-WEIXIN
				const filePath = `${wx.env.USER_DATA_PATH}/${fileName}`
				wx.getFileSystemManager().writeFile({
					filePath,
					data: buf,
					encoding: 'binary',
					success: () => wx.openDocument({
						filePath,
						fileType: 'docx'
					}),
					fail: e => uni.showToast({
						title: '保存失败',
						icon: 'error'
					})
				})
				// #endif

				// #ifdef APP-PLUS
				plus.io.requestFileSystem(plus.io.PUBLIC_DOWNLOADS, fs => {
					const fileEntry = fs.root.getFile(fileName, {
						create: true
					}, entry => {
						entry.createWriter(writer => {
							writer.write(buf)
							writer.onwrite = () => uni.showToast({
								title: '已保存到下载目录'
							})
						})
					})
				})
				// #endif
			})
			.catch(err => {
				uni.showModal({
					content: err.message || '生成失败',
					showCancel: false
				})
			})
			.finally(() => uni.hideLoading())
	}

	// ===== 初始化和生命周期方法 =====
	
	// 初始化：页面加载时调用
	async function initialize() {
		await loadProjects()

		// 尝试恢复上次选择的项目
		try {
			const savedProjectId = uni.getStorageSync('acceptance_project_id')

			if (savedProjectId) {
				const project = projectList.value.find(p => p.id === savedProjectId)

				if (project) {
					console.log('🔄 恢复上次选择的项目:', project.name)
					selectedProjectId.value = project.id
					selectedProject.value = project

					await loadProjectFiles(project.id)
					startPollingFileStatus(project.id)
					loadProjectCache(project.id)
				} else {
					console.log('⚠️ 上次选择的项目已不存在，清除缓存')
					uni.removeStorageSync('acceptance_project_id')
					uni.removeStorageSync('acceptance_project_info')
				}
			}
		} catch (e) {
			console.warn('⚠️ 恢复项目选择失败:', e)
		}
	}

	// 清理：页面卸载时调用
	function cleanup() {
		stopPolling()
		console.log('📄 页面卸载，清理轮询定时器')
	}

	// 监听项目切换
	watch(selectedProjectId, (newId, oldId) => {
		if (oldId && newId !== oldId) {
			stopPolling()
			console.log('🔄 切换项目，停止旧项目的轮询')
		}

		if (newId) {
			const monitorPlanState = useMonitorPlan()
			monitorPlanState.loadPlanCache(newId)
		}
	})

	// 创建实例对象
	instance = {
		// ===== 状态 =====
		// 项目选择
		selectedProjectId,
		selectedProject,
		projectList,
		projectFiles,
		projectSearchKeyword,
		filteredProjects,
		
		// 信息提取
		extracting,
		extractionOk,
		baseTable,
		taskProgressTitle,
		taskProgress,
		taskStatusText,
		taskState,
		
		// 基本信息表
		newBaseInfoLabel,
		selectMode,
		selectedIds,
		
		// 标识牌
		showSignboard,
		signboard,

		// ===== 方法 =====
		// 项目选择
		loadProjects,
		loadProjectFiles,
		openProjectPicker,
		closeProjectPicker,
		selectProject,
		onSearchInput,
		
		// 文件轮询
		startPollingFileStatus,
		stopPolling,
		hasProcessingFiles,
		
		// 文件工具
		getFileIcon,
		formatFileSize,
		formatFileStatus,
		getStatusText,
		getStatusClass,
		
		// 缓存管理
		loadProjectCache,
		clearProjectCache,
		
		// 信息提取
		simulateExtract,
		updateProgressSmooth,
		clearProgressTimer,
		
		// 基本信息表
		openAddBase,
		confirmAddBaseInfo,
		closeBaseInfo,
		toggleSelectMode,
		toggleSelected,
		removeSelected,
		
		// 标识牌
		generateSignboard,
		addSignItem,
		groupItems,
		removeGroup,
		downloadSignboard,
		findBaseValue,
		
		// 生命周期
		initialize,
		cleanup
	}

	return instance
}
