import { ref, computed } from 'vue'
import { fetchConstructionData as apiFetchConstructionData, fetchEquipmentData as apiFetchEquipmentData } from '@/api/fieldSurvey.js'

/**
 * 现场踏勘数据管理 Composable
 * 管理现场踏勘模块的所有状态和业务逻辑
 * 注意：网络请求在 /api/fieldSurvey.js
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

	//  Tab 0: 主要建设内容 
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

	// 主体工程列表
	const constructionList = ref([])
	const constructionSearchKeyword = ref('')
	const loadingConstruction = ref(false)
	const fetchConstructionError = ref('')

	// 过滤后的主体工程列表
	const filteredConstructionList = computed(() => {
		if (!constructionSearchKeyword.value) {
			return constructionList.value
		}
		const keyword = constructionSearchKeyword.value.toLowerCase().trim()
		return constructionList.value.filter(item => {
			const category = (item.category || '').toLowerCase()
			const name = (item.name || '').toLowerCase()
			const content = (item.content || '').toLowerCase()
			const remark = (item.remark || '').toLowerCase()
			return category.includes(keyword) || name.includes(keyword) || content.includes(keyword) || remark.includes(keyword)
		})
	})

	// 搜索输入处理
	function onConstructionSearchInput() {
		console.log('搜索主体工程关键词:', constructionSearchKeyword.value)
	}

	// 解析主体工程数据（新格式：column_1 里是二次 JSON 字符串）
	function parseConstructionData(apiData) {
		try {
			if (!apiData || !Array.isArray(apiData) || apiData.length === 0) {
				console.warn('主体工程数据为空或格式不正确')
				return []
			}

			// 检查第一个元素是否有 column_1
			const firstItem = apiData[0]
			if (!firstItem || !firstItem.column_1) {
				console.warn('主体工程数据缺少 column_1 字段')
				return []
			}

			// 1. 解析 JSON 字符串
			const raw = firstItem.column_1
			const table = JSON.parse(raw)

			// 2. 检查解析结果
			if (!table || !table.success) {
				console.warn('主体工程数据解析失败或 success 为 false')
				return []
			}

			const rows = table.data || []
			console.log(`✅ 成功解析主体工程数据，共 ${rows.length} 条记录`)

			// 3. 映射成前端需要的结构
			// 根据数据结构，提取有意义的行
			const parsedConstruction = []
			
			for (let i = 0; i < rows.length; i++) {
				const row = rows[i]
				
				// 获取所有字段值
				const col0 = row['表21本项白组成一宽表'] || ''
				const col1 = row['field_1'] || ''
				const col2 = row['field_2'] || ''
				const col3 = row['field_3'] || ''
				const col4 = row['field_4'] || ''
				const col5 = row['field_5'] || ''
				
				// 跳过表头行和空行
				if (i === 0 || (!col0 && !col1 && !col2 && !col3 && !col4 && !col5)) {
					continue
				}
				
				// 提取有效数据
				// 根据数据特点：
				// - col0 通常是序号或类别
				// - col1 是建筑名称或工程类型
				// - col2 是子类型
				// - col3 是楼层或位置
				// - col4 是工程内容
				// - col5 是面积等备注信息
				
				let category = col0.trim()
				let name = col1.trim() || col2.trim()
				let location = col3.trim()
				let content = col4.trim()
				let remark = col5.trim()
				
				// 如果有内容，就添加
				if (content || name) {
					parsedConstruction.push({
						id: 'const_' + Date.now() + '_' + i,
						category: category,
						name: name,
						location: location,
						content: content,
						remark: remark,
						images: []
					})
				}
			}

			console.log(`✅ 过滤后有效数据 ${parsedConstruction.length} 条`)
			return parsedConstruction
		} catch (e) {
			console.error('❌ 解析主体工程数据失败:', e)
			return []
		}
	}

	// 从接口获取主体工程数据
	async function fetchConstructionData(userId, projectId) {
		loadingConstruction.value = true
		fetchConstructionError.value = ''

		try {
			console.log(`🔄 开始获取主体工程数据 - userId: ${userId}, projectId: ${projectId}`)
			
			// request.js 已经处理过响应，直接使用返回的数据
			const resData = await apiFetchConstructionData(userId, projectId)

			if (resData && resData.data) {
				const apiData = resData.data
				console.log('📦 接收到主体工程数据:', apiData)

				if (apiData && Array.isArray(apiData) && apiData.length > 0) {
					const parsedData = parseConstructionData(apiData)
					console.log('✅ 解析后的主体工程数据:', parsedData)

					if (parsedData.length > 0) {
						constructionList.value = parsedData
						uni.showToast({
							title: `加载成功，共${parsedData.length}条工程`,
							icon: 'success',
							duration: 2000
						})
					} else {
						fetchConstructionError.value = '未找到有效的工程数据'
						uni.showToast({
							title: '未找到工程数据',
							icon: 'none',
							duration: 2000
						})
					}
				} else {
					fetchConstructionError.value = '接口返回的数据为空'
					uni.showToast({
						title: '工程数据为空',
						icon: 'none',
						duration: 2000
					})
				}
			} else {
				fetchConstructionError.value = resData?.message || '接口返回数据格式异常'
				uni.showToast({
					title: '获取工程数据失败',
					icon: 'none',
					duration: 2000
				})
			}
		} catch (error) {
			console.error('❌ 获取主体工程数据失败:', error)
			fetchConstructionError.value = error.message || '网络请求失败'
			uni.showToast({
				title: '网络请求失败',
				icon: 'none',
				duration: 2000
			})
		} finally {
			loadingConstruction.value = false
		}
	}

	// 增加主体工程记录
	function addConstruction() {
		const newConstruction = {
			id: 'const_' + Date.now(),
			category: '主体工程',
			name: '',
			content: '',
			remark: '',
			images: []
		}
		constructionList.value.push(newConstruction)
		uni.showToast({
			title: '已添加新工程',
			icon: 'success'
		})
	}

	// 删除主体工程记录
	function removeConstruction(index) {
		uni.showModal({
			title: '确认删除',
			content: '确定要删除这条工程记录吗？',
			success: (res) => {
				if (res.confirm) {
					constructionList.value.splice(index, 1)
					uni.showToast({
						title: '删除成功',
						icon: 'success'
					})
				}
			}
		})
	}

	//  Tab 1: 设备列表情况 
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
	// 解析设备数据（新格式：column_1 里是二次 JSON 字符串）
	function parseEquipmentData(apiData) {
		try {
			if (!apiData || !Array.isArray(apiData) || apiData.length === 0) {
				console.warn('设备数据为空或格式不正确')
				return []
			}

			// 检查第一个元素是否有 column_1
			const firstItem = apiData[0]
			if (!firstItem || !firstItem.column_1) {
				console.warn('设备数据缺少 column_1 字段')
				return []
			}

			// 1. 解析 JSON 字符串
			const raw = firstItem.column_1
			const table = JSON.parse(raw)

			// 2. 检查解析结果
			if (!table || !table.success) {
				console.warn('设备数据解析失败或 success 为 false')
				return []
			}

			const rows = table.data || []
			console.log(`✅ 成功解析设备数据，共 ${rows.length} 条记录`)

			// 3. 映射成前端需要的结构
			return rows
				.filter(r => r.col_设备名 && r.col_设备名.trim()) // 过滤掉空行
				.map((r, idx) => ({
					id: 'eq_' + Date.now() + '_' + idx,
					name: r.col_设备名 || '',
					model: r.col_型号 || '',
					quantity: r.col_数量 || '',
					purpose: r.col_用途 || '', // 用途
					location: r.col_所处实 || '', // 所处实验室
					remark: '', // 备注留空，供用户填写
					images: []
				}))
		} catch (e) {
			console.error('❌ 解析设备数据失败:', e)
			return []
		}
	}
	
	// 从接口获取设备数据
	async function fetchEquipmentData(userId, projectId) {
		loadingEquipment.value = true
		fetchEquipmentError.value = ''

		try {
			console.log(`🔄 开始获取设备数据 - userId: ${userId}, projectId: ${projectId}`)
			
			// request.js 已经处理过响应，直接使用返回的数据
			const resData = await apiFetchEquipmentData(userId, projectId)

			if (resData && resData.data) {
				const apiData = resData.data
				console.log('📦 接收到设备数据:', apiData)

				if (apiData && Array.isArray(apiData) && apiData.length > 0) {
					const parsedData = parseEquipmentData(apiData)
					console.log('✅ 解析后的设备数据:', parsedData)

					if (parsedData.length > 0) {
						equipmentList.value = parsedData
						uni.showToast({
							title: `加载成功，共${parsedData.length}条设备`,
							icon: 'success',
							duration: 2000
						})
					} else {
						fetchEquipmentError.value = '未找到有效的设备数据'
						uni.showToast({
							title: '未找到设备数据',
							icon: 'none',
							duration: 2000
						})
					}
				} else {
					fetchEquipmentError.value = '接口返回的数据为空'
					uni.showToast({
						title: '设备数据为空',
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
			console.error('❌ 获取设备数据失败:', error)
			fetchEquipmentError.value = error.message || '网络请求失败'
			uni.showToast({
				title: '网络请求失败',
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

	//  Tab 2: 污染物设施情况（从项目基本信息中提取）
	const pollutionFacilityList = ref([])
	const facilitySearchKeyword = ref('')
	const loadingFacility = ref(false)
	const fetchFacilityError = ref('')

	// 过滤后的设施列表
	const filteredFacilityList = computed(() => {
		if (!facilitySearchKeyword.value) {
			return pollutionFacilityList.value
		}
		const keyword = facilitySearchKeyword.value.toLowerCase().trim()
		return pollutionFacilityList.value.filter(facility => {
			const name = (facility.name || '').toLowerCase()
			const quantity = (facility.quantity || '').toLowerCase()
			const remark = (facility.remark || '').toLowerCase()
			return name.includes(keyword) || quantity.includes(keyword) || remark.includes(keyword)
		})
	})

	// 搜索输入处理
	function onFacilitySearchInput() {
		console.log('搜索设施关键词:', facilitySearchKeyword.value)
	}

	/**
	 * 从项目基本信息（baseTable）中提取治理设施
	 * @param {number|string} projectId - 项目ID
	 * @param {Array} baseTable - 项目基本信息表
	 */
	function extractFacilitiesFromBaseTable(projectId, baseTable) {
		try {
			loadingFacility.value = true
			fetchFacilityError.value = ''

			// 1. 查找污染物产排情况
			const emissionData = baseTable.find(x => x.id === 'pollutants_emission')?.value
			if (!emissionData || typeof emissionData !== 'object') {
				console.log('未找到污染物信息，跳过设施提取')
				pollutionFacilityList.value = []
				saveFacilityList(projectId, [])
				loadingFacility.value = false
				return
			}

			const facilityList = []

			// 2. 只提取水污染物、大气污染物、噪声的治理措施（不包括固体废物和危险废物）
			const pollutantTypes = ['水污染物', '大气污染物', '噪声']

			pollutantTypes.forEach(type => {
				const pollutants = emissionData[type]
				if (!pollutants) return

				// 处理数组类型的污染物
				if (Array.isArray(pollutants)) {
					pollutants.forEach((item, index) => {
						const pollutantName = item['污染物名称'] || item['废物名称'] || ''
						const treatmentMeasure = item['污染治理措施'] || item['治理措施'] || ''

						if (pollutantName.trim()) {
							facilityList.push({
								id: `facility_${type}_${index}_${Date.now()}`,
								name: pollutantName.trim(),
								quantity: treatmentMeasure.trim(),
								remark: '',
								images: [],
								pollutantType: type // 记录污染物类型
							})
						}
					})
				}
				// 处理对象类型的污染物
				else if (typeof pollutants === 'object') {
					const pollutantName = pollutants['污染物名称'] || pollutants['废物名称'] || ''
					const treatmentMeasure = pollutants['污染治理措施'] || pollutants['治理措施'] || ''

					if (pollutantName.trim()) {
						facilityList.push({
							id: `facility_${type}_${Date.now()}`,
							name: pollutantName.trim(),
							quantity: treatmentMeasure.trim(),
							remark: '',
							images: [],
							pollutantType: type
						})
					}
				}
			})

			// 3. 固定添加两条固废暂存间记录（处理工艺留空，由用户手动填写）
			facilityList.push({
				id: `facility_solid_waste_${Date.now()}`,
				name: '一般固废暂存间',
				quantity: '',
				remark: '',
				images: [],
				pollutantType: '固体废物'
			})

			facilityList.push({
				id: `facility_hazardous_waste_${Date.now()}`,
				name: '危废暂存间',
				quantity: '',
				remark: '',
				images: [],
				pollutantType: '危险废物'
			})

			// 4. 更新状态
			pollutionFacilityList.value = facilityList

			// 5. 保存到本地存储
			saveFacilityList(projectId, facilityList)

			console.log(`✅ 从项目 ${projectId} 提取了 ${facilityList.length} 条治理设施（含2条固废暂存间）`)

			if (facilityList.length > 0) {
				uni.showToast({
					title: `已提取 ${facilityList.length} 条设施`,
					icon: 'success',
					duration: 2000
				})
			}

		} catch (error) {
			console.error('提取治理设施失败:', error)
			fetchFacilityError.value = error.message || '提取失败'
			uni.showToast({
				title: '提取治理设施失败',
				icon: 'none',
				duration: 2000
			})
		} finally {
			loadingFacility.value = false
		}
	}

	/**
	 * 保存治理设施列表到本地存储
	 * @param {number|string} projectId - 项目ID
	 * @param {Array} facilityList - 设施列表
	 */
	function saveFacilityList(projectId, facilityList) {
		try {
			const cacheKey = `project_facility_list_${projectId}`
			uni.setStorageSync(cacheKey, JSON.stringify(facilityList))
			// console.log(`✅ 项目 ${projectId} 的治理设施已保存到本地`)
		} catch (error) {
			console.error('保存治理设施失败:', error)
		}
	}

	/**
	 * 从本地存储加载治理设施列表
	 * @param {number|string} projectId - 项目ID
	 */
	function loadFacilityList(projectId) {
		try {
			loadingFacility.value = true
			fetchFacilityError.value = ''

			const cacheKey = `project_facility_list_${projectId}`
			const cachedData = uni.getStorageSync(cacheKey)

			if (cachedData) {
				pollutionFacilityList.value = JSON.parse(cachedData)
				console.log(`✅ 已加载项目 ${projectId} 的治理设施，共 ${pollutionFacilityList.value.length} 条`)
			} else {
				pollutionFacilityList.value = []
				console.log(`ℹ️ 项目 ${projectId} 暂无治理设施数据`)
			}
		} catch (error) {
			console.error('加载治理设施失败:', error)
			pollutionFacilityList.value = []
			fetchFacilityError.value = error.message || '加载失败'
		} finally {
			loadingFacility.value = false
		}
	}

	/**
	 * 刷新治理设施（重新从baseTable提取）
	 * @param {number|string} projectId - 项目ID
	 * @param {Array} baseTable - 项目基本信息表
	 */
	function refreshFacilityData(projectId, baseTable) {
		extractFacilitiesFromBaseTable(projectId, baseTable)
	}

	// 增加设施记录
	function addPollutionFacility(projectId) {
		const newFacility = {
			id: 'pf_' + Date.now(),
			name: '',
			quantity: '',
			remark: '',
			images: []
		}
		pollutionFacilityList.value.push(newFacility)
		
		// 保存到本地存储
		if (projectId) {
			saveFacilityList(projectId, pollutionFacilityList.value)
		}
		
		uni.showToast({
			title: '已添加新设施',
			icon: 'success'
		})
	}

	// 删除设施记录
	function removePollutionFacility(index, projectId) {
		uni.showModal({
			title: '确认删除',
			content: '确定要删除这条设施记录吗？',
			success: (res) => {
				if (res.confirm) {
					pollutionFacilityList.value.splice(index, 1)
					
					// 保存到本地存储
					if (projectId) {
						saveFacilityList(projectId, pollutionFacilityList.value)
					}
					
					uni.showToast({
						title: '删除成功',
						icon: 'success'
					})
				}
			}
		})
	}

	// 更新设施数据（用于实时保存用户编辑）
	function updateFacilityData(projectId) {
		if (projectId) {
			saveFacilityList(projectId, pollutionFacilityList.value)
		}
	}

	//  Tab 3: 排污口情况（从项目基本信息中提取）
	const wastewaterOutlets = ref([])  // 废水排污口
	const exhaustOutlets = ref([])     // 废气排污口
	const noiseOutlets = ref([])       // 噪声排污口

	/**
	 * 从项目基本信息（baseTable）中提取排污口编号
	 * @param {number|string} projectId - 项目ID
	 * @param {Array} baseTable - 项目基本信息表
	 */
	function extractOutletsFromBaseTable(projectId, baseTable) {
		try {
			// 1. 查找污染物产排情况
			const emissionData = baseTable.find(x => x.id === 'pollutants_emission')?.value
			if (!emissionData || typeof emissionData !== 'object') {
				console.log('未找到污染物信息，跳过排污口提取')
				wastewaterOutlets.value = []
				exhaustOutlets.value = []
				noiseOutlets.value = []
				saveOutletList(projectId, [], [], [])
				return
			}

			const wastewaterList = []
			const exhaustList = []
			const noiseList = []

			/**
			 * 分割排污口编号字符串
			 * 支持分隔符：; , ， 、 空格
			 */
			function splitOutletCodes(codeString) {
				if (!codeString || typeof codeString !== 'string') return []
				
				// 使用正则分割，支持多种分隔符
				const codes = codeString
					.split(/[;,，、\s]+/)
					.map(code => code.trim())
					.filter(code => code && code.length > 0)
				
				return codes
			}

			// 2. 提取废水排污口（从水污染物）
			const waterPollutants = emissionData['水污染物']
			if (waterPollutants) {
				const pollutantArray = Array.isArray(waterPollutants) ? waterPollutants : [waterPollutants]
				
				pollutantArray.forEach(item => {
					const outletCode = item['排污口编号'] || item['排放口编号'] || ''
					const codes = splitOutletCodes(outletCode)
					
					codes.forEach(code => {
						// 避免重复
						if (!wastewaterList.some(o => o.code === code)) {
							wastewaterList.push({
								id: `outlet_wastewater_${code}_${Date.now()}`,
								code: code,
								name: '',
								remark: '',
								images: []
							})
						}
					})
				})
			}

			// 3. 提取废气排污口（从大气污染物）
			const airPollutants = emissionData['大气污染物']
			if (airPollutants) {
				const pollutantArray = Array.isArray(airPollutants) ? airPollutants : [airPollutants]
				
				pollutantArray.forEach(item => {
					const outletCode = item['排污口编号'] || item['排放口编号'] || ''
					const codes = splitOutletCodes(outletCode)
					
					codes.forEach(code => {
						if (!exhaustList.some(o => o.code === code)) {
							exhaustList.push({
								id: `outlet_exhaust_${code}_${Date.now()}`,
								code: code,
								name: '',
								remark: '',
								images: []
							})
						}
					})
				})
			}

			// 4. 提取噪声排污口（从噪声）
			const noisePollutants = emissionData['噪声']
			if (noisePollutants) {
				const pollutantArray = Array.isArray(noisePollutants) ? noisePollutants : [noisePollutants]
				
				pollutantArray.forEach(item => {
					const outletCode = item['排污口编号'] || item['排放口编号'] || ''
					const codes = splitOutletCodes(outletCode)
					
					codes.forEach(code => {
						if (!noiseList.some(o => o.code === code)) {
							noiseList.push({
								id: `outlet_noise_${code}_${Date.now()}`,
								code: code,
								name: '',
								remark: '',
								images: []
							})
						}
					})
				})
			}

			// 5. 更新状态
			wastewaterOutlets.value = wastewaterList
			exhaustOutlets.value = exhaustList
			noiseOutlets.value = noiseList

			// 6. 保存到本地存储
			saveOutletList(projectId, wastewaterList, exhaustList, noiseList)

			const totalCount = wastewaterList.length + exhaustList.length + noiseList.length
			console.log(`✅ 从项目 ${projectId} 提取了 ${totalCount} 个排污口`)

			if (totalCount > 0) {
				uni.showToast({
					title: `已提取 ${totalCount} 个排污口`,
					icon: 'success',
					duration: 2000
				})
			}

		} catch (error) {
			console.error('提取排污口失败:', error)
			uni.showToast({
				title: '提取排污口失败',
				icon: 'none',
				duration: 2000
			})
		}
	}

	/**
	 * 保存排污口列表到本地存储
	 * @param {number|string} projectId - 项目ID
	 * @param {Array} wastewaterList - 废水排污口列表
	 * @param {Array} exhaustList - 废气排污口列表
	 * @param {Array} noiseList - 噪声排污口列表
	 */
	function saveOutletList(projectId, wastewaterList, exhaustList, noiseList) {
		try {
			const cacheKey = `project_outlet_list_${projectId}`
			const outletData = {
				wastewater: wastewaterList,
				exhaust: exhaustList,
				noise: noiseList
			}
			uni.setStorageSync(cacheKey, JSON.stringify(outletData))
			console.log(`✅ 项目 ${projectId} 的排污口已保存到本地`)
		} catch (error) {
			console.error('保存排污口失败:', error)
		}
	}

	/**
	 * 从本地存储加载排污口列表
	 * @param {number|string} projectId - 项目ID
	 */
	function loadOutletList(projectId) {
		try {
			const cacheKey = `project_outlet_list_${projectId}`
			const cachedData = uni.getStorageSync(cacheKey)

			if (cachedData) {
				const outletData = JSON.parse(cachedData)
				wastewaterOutlets.value = outletData.wastewater || []
				exhaustOutlets.value = outletData.exhaust || []
				noiseOutlets.value = outletData.noise || []
				
				const totalCount = wastewaterOutlets.value.length + exhaustOutlets.value.length + noiseOutlets.value.length
				console.log(`✅ 已加载项目 ${projectId} 的排污口，共 ${totalCount} 个`)
			} else {
				wastewaterOutlets.value = []
				exhaustOutlets.value = []
				noiseOutlets.value = []
				console.log(`ℹ️ 项目 ${projectId} 暂无排污口数据`)
			}
		} catch (error) {
			console.error('加载排污口失败:', error)
			wastewaterOutlets.value = []
			exhaustOutlets.value = []
			noiseOutlets.value = []
		}
	}

	/**
	 * 刷新排污口（重新从baseTable提取）
	 * @param {number|string} projectId - 项目ID
	 * @param {Array} baseTable - 项目基本信息表
	 */
	function refreshOutletData(projectId, baseTable) {
		extractOutletsFromBaseTable(projectId, baseTable)
	}

	// 生成下一个排污口编号（用于手动新增）
	function generateOutletCode(type) {
		let outlets = []
		let prefix = ''
		
		if (type === 'wastewater') {
			outlets = wastewaterOutlets.value
			prefix = 'DW'
		} else if (type === 'exhaust') {
			outlets = exhaustOutlets.value
			prefix = 'DA'
		} else if (type === 'noise') {
			outlets = noiseOutlets.value
			prefix = 'ZS-'
		}

		// 找到最大编号
		let maxNum = 0
		outlets.forEach(outlet => {
			const match = outlet.code.match(/\d+/)
			if (match) {
				const num = parseInt(match[0], 10)
				if (num > maxNum) maxNum = num
			}
		})

		// 生成新编号
		const newNum = maxNum + 1
		if (type === 'noise') {
			return `${prefix}${String(newNum).padStart(2, '0')}`
		} else {
			return `${prefix}${String(newNum).padStart(3, '0')}`
		}
	}

	// 添加排污口
	function addOutlet(type, projectId) {
		const code = generateOutletCode(type)
		const newOutlet = {
			id: `outlet_${type}_${Date.now()}`,
			code: code,
			name: '',
			remark: '',
			images: []
		}

		if (type === 'wastewater') {
			wastewaterOutlets.value.push(newOutlet)
		} else if (type === 'exhaust') {
			exhaustOutlets.value.push(newOutlet)
		} else if (type === 'noise') {
			noiseOutlets.value.push(newOutlet)
		}

		// 保存到本地存储
		if (projectId) {
			saveOutletList(projectId, wastewaterOutlets.value, exhaustOutlets.value, noiseOutlets.value)
		}

		uni.showToast({
			title: '已添加新排污口',
			icon: 'success'
		})
	}

	// 删除排污口
	function removeOutlet(type, index, projectId) {
		let outlets = []
		let typeName = ''

		if (type === 'wastewater') {
			outlets = wastewaterOutlets.value
			typeName = '废水排污口'
		} else if (type === 'exhaust') {
			outlets = exhaustOutlets.value
			typeName = '废气排污口'
		} else if (type === 'noise') {
			outlets = noiseOutlets.value
			typeName = '噪声排污口'
		}

		const outlet = outlets[index]
		
		uni.showModal({
			title: '确认删除',
			content: `确定要删除${typeName} ${outlet.code} 吗？`,
			success: (res) => {
				if (res.confirm) {
					outlets.splice(index, 1)
					
					// 保存到本地存储
					if (projectId) {
						saveOutletList(projectId, wastewaterOutlets.value, exhaustOutlets.value, noiseOutlets.value)
					}
					
					uni.showToast({
						title: '删除成功',
						icon: 'success'
					})
				}
			}
		})
	}

	// 更新排污口数据（用于实时保存用户编辑）
	function updateOutletData(projectId) {
		if (projectId) {
			saveOutletList(projectId, wastewaterOutlets.value, exhaustOutlets.value, noiseOutlets.value)
		}
	}

	//  通用方法 
	
	// Tab切换处理
	function handleTabChange(index, userId, projectId, baseTable = null) {
		currentTab.value = index
		
		// 当切换到建设内容Tab时，自动获取主体工程数据
		if (index === 0 && !constructionList.value.length) {
			fetchConstructionData(userId, projectId)
		}
		
		// 当切换到设备情况Tab时，自动获取数据
		if (index === 1 && !equipmentList.value.length) {
			fetchEquipmentData(userId, projectId)
		}
		
		// 当切换到治理设施Tab时，自动加载本地数据
		if (index === 2) {
			loadFacilityList(projectId)
		}
		
		// 当切换到排污口Tab时，自动加载本地数据
		if (index === 3) {
			loadOutletList(projectId)
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
		
		// 主体工程
		constructionList,
		constructionSearchKeyword,
		filteredConstructionList,
		loadingConstruction,
		fetchConstructionError,
		onConstructionSearchInput,
		fetchConstructionData,
		addConstruction,
		removeConstruction,
		
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
		
		// 治理设施（新方法）
		pollutionFacilityList,
		facilitySearchKeyword,
		filteredFacilityList,
		loadingFacility,
		fetchFacilityError,
		onFacilitySearchInput,
		extractFacilitiesFromBaseTable,  // 新：从baseTable提取
		saveFacilityList,                // 新：保存到本地
		loadFacilityList,                // 新：从本地加载
		refreshFacilityData,             // 新：刷新数据
		updateFacilityData,              // 新：更新数据
		addPollutionFacility,
		removePollutionFacility,
		
		// 排污口（新方法）
		wastewaterOutlets,
		exhaustOutlets,
		noiseOutlets,
		extractOutletsFromBaseTable,  // 新：从baseTable提取
		saveOutletList,                // 新：保存到本地
		loadOutletList,                // 新：从本地加载
		refreshOutletData,             // 新：刷新数据
		updateOutletData,              // 新：更新数据
		addOutlet,
		removeOutlet,
		
		// 比对清单
		fieldworkComparison,
		generateFieldworkComparison
	}

	return instance
}
