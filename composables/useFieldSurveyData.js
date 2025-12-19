import { ref, computed } from 'vue'

/**
 * 现场踏勘数据管理 Composable
 * 管理现场踏勘模块的所有状态和业务逻辑
 */

// 创建单例状态（确保所有组件共享同一份数据）
let instance = null

export function useFieldSurveyData() {
	// 如果已经创建过实例，直接返回
	if (instance) {
		return instance
	}

	// Tab定义
	const tabs = ['建设内容', '设备情况', '治理设施', '排污口']
	const currentTab = ref(0)

	// 现场踏勘比对清单
	const fieldworkComparison = ref([])

	// ==================== Tab 0: 主要建设内容 ====================
	const mainContentTable = ref([
		{
			id: 'mc_1',
			label: '项目名称',
			value: '',
			type: 'text'
		},
		{
			id: 'mc_2',
			label: '建设单位',
			value: '',
			type: 'text'
		},
		{
			id: 'mc_3',
			label: '建设地点',
			value: '',
			type: 'text'
		},
		{
			id: 'mc_4',
			label: '建设规模',
			value: '',
			type: 'text'
		},
		{
			id: 'mc_5',
			label: '主体工程',
			value: [],
			type: 'image'
		}
	])

	const selectModeMain = ref(false)
	const selectedMainIds = ref([])

	function toggleSelectModeMain() {
		selectModeMain.value = !selectModeMain.value
		if (!selectModeMain.value) selectedMainIds.value = []
	}

	function toggleSelectedMain(id) {
		const idx = selectedMainIds.value.indexOf(id)
		if (idx > -1) selectedMainIds.value.splice(idx, 1)
		else selectedMainIds.value.push(id)
	}

	function removeSelectedMain() {
		mainContentTable.value = mainContentTable.value.filter(
			item => !selectedMainIds.value.includes(item.id)
		)
		selectedMainIds.value = []
		selectModeMain.value = false
		uni.showToast({
			title: '删除成功',
			icon: 'success'
		})
	}

	// ==================== Tab 1: 设备列表情况 ====================
	const equipmentList = ref([])
	const equipmentSearchKeyword = ref('')
	const loadingEquipment = ref(false)
	const fetchEquipmentError = ref('')

	// 过滤后的设备列表
	const filteredEquipmentList = computed(() => {
		if (!equipmentSearchKeyword.value) {
			return equipmentList.value
		}
		const keyword = equipmentSearchKeyword.value.toLowerCase().trim()
		return equipmentList.value.filter(equipment => {
			const name = (equipment.name || '').toLowerCase()
			const quantity = (equipment.quantity || '').toLowerCase()
			const remark = (equipment.remark || '').toLowerCase()
			return name.includes(keyword) || quantity.includes(keyword) || remark.includes(keyword)
		})
	})

	// 搜索输入处理
	function onEquipmentSearchInput() {
		console.log('搜索设备关键词:', equipmentSearchKeyword.value)
	}

	// 解析设备数据
	function parseEquipmentData(apiData) {
		try {
			const parsedEquipment = []

			if (!apiData || !Array.isArray(apiData) || apiData.length <= 1) {
				return []
			}

			// 跳过表头行，从索引1开始
			for (let i = 1; i < apiData.length; i++) {
				const row = apiData[i]

				if (row.column_1) {
					const columns = row.column_1.split('\\t')

					if (columns.length >= 4) {
						const deviceName = columns[1] || ''
						const quantity = columns[3] || ''

						if (deviceName.trim()) {
							parsedEquipment.push({
								id: 'eq_' + Date.now() + '_' + i,
								name: deviceName.trim(),
								quantity: quantity.trim(),
								remark: '',
								images: []
							})
						}
					} else {
						console.warn(`第${i+1}行数据列数不足:`, columns)
					}
				} else {
					console.warn(`第${i+1}行没有column_1字段:`, row)
				}
			}

			return parsedEquipment
		} catch (error) {
			console.error('解析设备数据失败:', error)
			return []
		}
	}

	// 从接口获取设备数据
	async function fetchEquipmentData(userId, projectId) {
		loadingEquipment.value = true
		fetchEquipmentError.value = ''

		try {
			const response = await new Promise((resolve, reject) => {
				uni.request({
					url: 'http://127.0.0.1:8000/api/v1/completion/tzdDetail/getDeviceDetail',
					method: 'GET',
					timeout: 10000,
					data: {
						user_id: userId,
						project_id: projectId,
					},
					success: (res) => {
						console.log('请求成功:', res)
						resolve(res)
					},
					fail: (err) => {
						console.log('请求失败:', err)
						reject(err)
					}
				})
			})

			let resData
			if (Array.isArray(response)) {
				resData = response[0]
			} else if (response && response.data) {
				resData = response.data
			} else {
				resData = response
			}

			console.log('接口返回完整数据:', resData)

			if (resData && resData.data) {
				const apiData = resData.data
				console.log('设备数据数组:', apiData)

				if (apiData && Array.isArray(apiData) && apiData.length > 1) {
					const parsedData = parseEquipmentData(apiData)
					console.log('解析后的设备数据:', parsedData)

					if (parsedData.length > 0) {
						equipmentList.value = parsedData
						uni.showToast({
							title: `加载成功，共${parsedData.length}条设备数据`,
							icon: 'success',
							duration: 2000
						})
					} else {
						fetchEquipmentError.value = '解析到的设备数据为空'
						uni.showToast({
							title: '设备数据解析为空',
							icon: 'none',
							duration: 2000
						})
					}
				} else {
					fetchEquipmentError.value = '接口返回的设备数据格式不正确'
					uni.showToast({
						title: '设备数据格式错误',
						icon: 'none',
						duration: 2000
					})
				}
			} else {
				fetchEquipmentError.value = resData?.message || '接口返回数据格式异常'
				uni.showToast({
					title: '获取设备数据失败',
					icon: 'none',
					duration: 2000
				})
			}
		} catch (error) {
			console.error('获取设备数据失败:', error)
			fetchEquipmentError.value = error.message || '网络请求失败'
			uni.showToast({
				title: '网络请求失败，请检查网络连接',
				icon: 'none',
				duration: 2000
			})
		} finally {
			loadingEquipment.value = false
		}
	}

	// 增加设备记录
	function addEquipment() {
		const newEquipment = {
			id: 'eq_' + Date.now(),
			name: '',
			quantity: '',
			remark: '',
			images: []
		}
		equipmentList.value.push(newEquipment)
		uni.showToast({
			title: '已添加新设备',
			icon: 'success'
		})
	}

	// 删除设备记录
	function removeEquipment(index) {
		uni.showModal({
			title: '确认删除',
			content: '确定要删除这条设备记录吗？',
			success: (res) => {
				if (res.confirm) {
					equipmentList.value.splice(index, 1)
					uni.showToast({
						title: '删除成功',
						icon: 'success'
					})
				}
			}
		})
	}

	// ==================== Tab 2: 污染物设施情况 ====================
	const pollutionFacilityList = ref([])

	/**
	 * 从污染物信息中智能提取治理设施
	 * 在提取项目基本信息成功后自动调用
	 */
	function extractFacilitiesFromPollutants(baseTable) {
		try {
			const emissionData = baseTable.find(x => x.id === 'pollutants_emission')?.value
			if (!emissionData || typeof emissionData !== 'object') {
				console.log('未找到污染物信息，跳过设施提取')
				return
			}

			const facilitiesMap = new Map()

			// 辅助函数：智能分割设施名称
			function splitFacilities(text) {
				if (!text || typeof text !== 'string') return []
				const cleaned = text
					.replace(/采用|通过|设置|建设|配备|安装|使用/g, '')
					.trim()
				const parts = cleaned.split(/[、，,；;]/)
				return parts
					.map(p => p.trim())
					.filter(p => p && p.length > 0 && p.length < 50)
			}

			// 辅助函数：提取核心设施名称
			function extractCoreName(text) {
				return text
					.replace(/\(.*?\)/g, '')
					.replace(/（.*?）/g, '')
					.replace(/\d+.*?(台|套|个|座|间|m³|m²|立方|平方).*/g, '')
					.replace(/\d+.*?吨.*/g, '')
					.trim()
			}

			// 遍历所有污染物类型
			const pollutantTypes = ['水污染物', '大气污染物', '噪声', '固体废物', '危险废物']

			pollutantTypes.forEach(type => {
				const pollutants = emissionData[type]
				if (!pollutants) return

				if (Array.isArray(pollutants)) {
					pollutants.forEach(item => {
						const measure = item['污染治理措施'] || item['治理措施'] || ''
						const facilities = splitFacilities(measure)

						facilities.forEach(facility => {
							const coreName = extractCoreName(facility)
							if (coreName && coreName.length >= 2) {
								if (!facilitiesMap.has(coreName)) {
									facilitiesMap.set(coreName, {
										types: new Set(),
										originalText: facility
									})
								}
								facilitiesMap.get(coreName).types.add(type)
							}
						})
					})
				} else if (typeof pollutants === 'object') {
					const measure = pollutants['污染治理措施'] || pollutants['治理措施'] || ''
					const facilities = splitFacilities(measure)

					facilities.forEach(facility => {
						const coreName = extractCoreName(facility)
						if (coreName && coreName.length >= 2) {
							if (!facilitiesMap.has(coreName)) {
								facilitiesMap.set(coreName, {
									types: new Set(),
									originalText: facility
								})
							}
							facilitiesMap.get(coreName).types.add(type)
						}
					})
				}
			})

			// 智能去重
			const existingNames = pollutionFacilityList.value.map(f => f.name.toLowerCase())

			function isSimilar(name1, name2) {
				const n1 = name1.toLowerCase()
				const n2 = name2.toLowerCase()
				return n1.includes(n2) || n2.includes(n1)
			}

			// 转换为设施列表格式并添加
			let addedCount = 0
			facilitiesMap.forEach((info, name) => {
				const isDuplicate = existingNames.some(existing => isSimilar(existing, name))

				if (!isDuplicate) {
					const typesArray = Array.from(info.types)
					const remark = typesArray.length > 0 ?
						`用于处理${typesArray.join('、')}` :
						''

					pollutionFacilityList.value.push({
						id: 'pf_extracted_' + Date.now() + '_' + Math.random(),
						name: name,
						quantity: '1',
						remark: remark,
						images: []
					})
					addedCount++
				}
			})
		} catch (error) {
			console.error('提取污染治理设施失败:', error)
		}
	}

	// 增加设施记录
	function addPollutionFacility() {
		const newFacility = {
			id: 'pf_' + Date.now(),
			name: '',
			quantity: '',
			remark: '',
			images: []
		}
		pollutionFacilityList.value.push(newFacility)
		uni.showToast({
			title: '已添加新设施',
			icon: 'success'
		})
	}

	// 删除设施记录
	function removePollutionFacility(index) {
		uni.showModal({
			title: '确认删除',
			content: '确定要删除这条设施记录吗？',
			success: (res) => {
				if (res.confirm) {
					pollutionFacilityList.value.splice(index, 1)
					uni.showToast({
						title: '删除成功',
						icon: 'success'
					})
				}
			}
		})
	}

	// ==================== 通用方法 ====================
	
	// Tab切换处理
	function handleTabChange(index, userId, projectId) {
		currentTab.value = index
		// 当切换到设备情况Tab时，自动获取数据
		if (index === 1 && !equipmentList.value.length) {
			fetchEquipmentData(userId, projectId)
		}
	}

	// 生成现场踏勘比对清单
	function generateFieldworkComparison(datasheet) {
		const comparison = datasheet.map(item => ({
			id: Date.now() + Math.random(),
			project: item.label,
			eiaRequirement: item.value || '待确认',
			fieldSituation: '',
			difference: '待现场核实'
		}))

		fieldworkComparison.value = comparison
		uni.showToast({
			title: `功能开发中`,
			icon: 'success'
		})
	}

	// 创建实例对象
	instance = {
		// Tab相关
		tabs,
		currentTab,
		handleTabChange,
		
		// 建设内容
		mainContentTable,
		selectModeMain,
		selectedMainIds,
		toggleSelectModeMain,
		toggleSelectedMain,
		removeSelectedMain,
		
		// 设备情况
		equipmentList,
		equipmentSearchKeyword,
		filteredEquipmentList,
		loadingEquipment,
		fetchEquipmentError,
		onEquipmentSearchInput,
		fetchEquipmentData,
		addEquipment,
		removeEquipment,
		
		// 治理设施
		pollutionFacilityList,
		extractFacilitiesFromPollutants,
		addPollutionFacility,
		removePollutionFacility,
		
		// 比对清单
		fieldworkComparison,
		generateFieldworkComparison
	}

	return instance
}
