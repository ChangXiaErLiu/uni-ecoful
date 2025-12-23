<template>
	<view class="outlet-tab">
		<view class="section-card">
			<view class="section-header">
				<view class="header-left">
					<uni-icons type="map-pin-ellipse" size="20" color="#166534" />
					<text class="section-title">排污口情况</text>
				</view>
				<text class="record-count">共 {{ totalOutletCount }} 个排污口</text>
			</view>

			<view class="section-body">
				<!-- 搜索和操作栏 -->
				<view class="search-action-bar">
					<view class="search-container">
						<uni-easyinput v-model="searchKeyword" placeholder="搜索排污口编号或名称..." prefixIcon="search"
							:clearable="true" @input="onSearchInput" class="search-input" />
						<text v-if="searchKeyword" class="search-result">
							找到 {{ filteredTotalCount }} 个结果
						</text>
					</view>

					<view class="action-buttons">
						<button class="btn btn-refresh" @tap="handleExtractOutlets">
							<uni-icons type="refresh" size="18" color="#ffffff" />
							<text>刷新</text>
						</button>
					</view>
				</view>

				<!-- 废水排污口 -->
				<view class="outlet-section">
					<view class="section-title-bar">
						<view class="title-left">
							<!-- <uni-icons type="water" size="18" color="#0ea5e9" /> -->
							<text class="title-text">废水排污口</text>
							<text class="title-count">{{ filteredWastewaterOutlets.length }}</text>
						</view>
						<button class="btn-add-small" @tap="handleAddOutlet('wastewater')">
							<uni-icons type="plus" size="16" color="#ffffff" />
							<text>新增</text>
						</button>
					</view>

					<!-- 废水排污口表格 -->
					<view v-if="filteredWastewaterOutlets.length" class="outlet-table">
						<view class="table-header">
							<view class="header-cell header-index">序号</view>
							<view class="header-cell header-code">排污口编号</view>
							<view class="header-cell header-name">排污口名称</view>
							<view class="header-cell header-remark">备注</view>
							<view class="header-cell header-photo">照片(远近各一张)</view>
							<view class="header-cell header-action">操作</view>
						</view>

						<view class="table-body">
							<view v-for="(outlet, index) in filteredWastewaterOutlets" :key="outlet.id" class="table-row">
								<view class="body-cell cell-index">
									<view class="mobile-label">序号</view>
									<text class="index-number">{{ index + 1 }}</text>
								</view>

								<view class="body-cell cell-code">
									<view class="mobile-label">排污口编号</view>
									<uni-easyinput v-model="outlet.code" placeholder="如：DW001" :clearable="true"
										class="cell-input" />
								</view>

								<view class="body-cell cell-name">
									<view class="mobile-label">排污口名称</view>
									<uni-easyinput v-model="outlet.name" placeholder="请输入名称" :clearable="true"
										class="cell-input" />
								</view>

								<view class="body-cell cell-remark">
									<view class="mobile-label">备注</view>
									<uni-easyinput v-model="outlet.remark" placeholder="备注信息" :clearable="true"
										class="cell-input" />
								</view>

								<view class="body-cell cell-photo">
									<view class="mobile-label">照片(远近各一张)</view>
									<uni-file-picker v-model="outlet.images" fileMediatype="image" mode="grid" :limit="2"
										:auto-upload="false" class="photo-picker" />
								</view>

								<view class="body-cell cell-action">
									<view class="mobile-label">操作</view>
									<button class="btn-delete" @tap="handleRemoveOutlet('wastewater', index)">
										<uni-icons type="trash" size="18" color="#ef4444" />
									</button>
								</view>
							</view>
						</view>
					</view>

					<view v-else class="empty-section">
						<uni-icons type="clear" size="48" color="#e2e8f0" />
						<text class="empty-text">暂未提取到废水排污口</text>
					</view>
				</view>

				<!-- 废气排污口 -->
				<view class="outlet-section">
					<view class="section-title-bar">
						<view class="title-left">
							<!-- <uni-icons type="cloud" size="18" color="#8b5cf6" /> -->
							<text class="title-text">废气排污口</text>
							<text class="title-count">{{ filteredExhaustOutlets.length }}</text>
						</view>
						<button class="btn-add-small" @tap="handleAddOutlet('exhaust')">
							<uni-icons type="plus" size="16" color="#ffffff" />
							<text>新增</text>
						</button>
					</view>

					<!-- 废气排污口表格 -->
					<view v-if="filteredExhaustOutlets.length" class="outlet-table">
						<view class="table-header">
							<view class="header-cell header-index">序号</view>
							<view class="header-cell header-code">排污口编号</view>
							<view class="header-cell header-name">排污口名称</view>
							<view class="header-cell header-remark">备注</view>
							<view class="header-cell header-photo">照片(远近各一张)</view>
							<view class="header-cell header-action">操作</view>
						</view>

						<view class="table-body">
							<view v-for="(outlet, index) in filteredExhaustOutlets" :key="outlet.id" class="table-row">
								<view class="body-cell cell-index">
									<view class="mobile-label">序号</view>
									<text class="index-number">{{ index + 1 }}</text>
								</view>

								<view class="body-cell cell-code">
									<view class="mobile-label">排污口编号</view>
									<uni-easyinput v-model="outlet.code" placeholder="如：DA001" :clearable="true"
										class="cell-input" />
								</view>

								<view class="body-cell cell-name">
									<view class="mobile-label">排污口名称</view>
									<uni-easyinput v-model="outlet.name" placeholder="请输入名称" :clearable="true"
										class="cell-input" />
								</view>

								<view class="body-cell cell-remark">
									<view class="mobile-label">备注</view>
									<uni-easyinput v-model="outlet.remark" placeholder="备注信息" :clearable="true"
										class="cell-input" />
								</view>

								<view class="body-cell cell-photo">
									<view class="mobile-label">照片</view>
									<uni-file-picker v-model="outlet.images" fileMediatype="image" mode="grid" :limit="2"
										:auto-upload="false" class="photo-picker" />
								</view>

								<view class="body-cell cell-action">
									<view class="mobile-label">操作</view>
									<button class="btn-delete" @tap="handleRemoveOutlet('exhaust', index)">
										<uni-icons type="trash" size="18" color="#ef4444" />
									</button>
								</view>
							</view>
						</view>
					</view>

					<view v-else class="empty-section">
						<uni-icons type="clear" size="48" color="#e2e8f0" />
						<text class="empty-text">暂未提取到废气排污口</text>
					</view>
				</view>

				<!-- 噪声排污口 -->
				<view class="outlet-section">
					<view class="section-title-bar">
						<view class="title-left">
							<!-- <uni-icons type="sound" size="18" color="#f59e0b" /> -->
							<text class="title-text">噪声排污口</text>
							<text class="title-count">{{ filteredNoiseOutlets.length }}</text>
						</view>
						<button class="btn-add-small" @tap="handleAddOutlet('noise')">
							<uni-icons type="plus" size="16" color="#ffffff" />
							<text>新增</text>
						</button>
					</view>

					<!-- 噪声排污口表格 -->
					<view v-if="filteredNoiseOutlets.length" class="outlet-table">
						<view class="table-header">
							<view class="header-cell header-index">序号</view>
							<view class="header-cell header-code">排污口编号</view>
							<view class="header-cell header-name">排污口名称</view>
							<view class="header-cell header-remark">备注</view>
							<view class="header-cell header-photo">照片</view>
							<view class="header-cell header-action">操作</view>
						</view>

						<view class="table-body">
							<view v-for="(outlet, index) in filteredNoiseOutlets" :key="outlet.id" class="table-row">
								<view class="body-cell cell-index">
									<view class="mobile-label">序号</view>
									<text class="index-number">{{ index + 1 }}</text>
								</view>

								<view class="body-cell cell-code">
									<view class="mobile-label">排污口编号</view>
									<uni-easyinput v-model="outlet.code" placeholder="如：ZS-01" :clearable="true"
										class="cell-input" />
								</view>

								<view class="body-cell cell-name">
									<view class="mobile-label">排污口名称</view>
									<uni-easyinput v-model="outlet.name" placeholder="请输入名称" :clearable="true"
										class="cell-input" />
								</view>

								<view class="body-cell cell-remark">
									<view class="mobile-label">备注</view>
									<uni-easyinput v-model="outlet.remark" placeholder="备注信息" :clearable="true"
										class="cell-input" />
								</view>

								<view class="body-cell cell-photo">
									<view class="mobile-label">照片(远近各一张)</view>
									<uni-file-picker v-model="outlet.images" fileMediatype="image" mode="grid" :limit="2"
										:auto-upload="false" class="photo-picker" />
								</view>

								<view class="body-cell cell-action">
									<view class="mobile-label">操作</view>
									<button class="btn-delete" @tap="handleRemoveOutlet('noise', index)">
										<uni-icons type="trash" size="18" color="#ef4444" />
									</button>
								</view>
							</view>
						</view>
					</view>

					<view v-else class="empty-section">
						<uni-icons type="clear" size="48" color="#e2e8f0" />
						<text class="empty-text">未提取到噪声排污口</text>
					</view>
				</view>

				<!-- 全局空状态 -->
				<view v-if="totalOutletCount === 0 && !searchKeyword" class="empty-container">
					<uni-icons type="map-pin-ellipse" size="64" color="#e2e8f0" />
					<text class="empty-title">暂无排污口信息</text>
					<text class="empty-tip">点击"刷新"按钮自动提取排污口</text>
					<button class="btn btn-add-primary" @tap="handleExtractOutlets">
						<uni-icons type="refresh" size="16" color="#ffffff" />
						<text>刷新</text>
					</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		computed,
		onMounted,
		watch
	} from 'vue'
	import {
		useFieldSurveyData
	} from '@/composables/useFieldSurveyData.js'

	// 组件props
	const props = defineProps({
		projectId: {
			type: [String, Number],
			required: true
		},
		baseTable: {
			type: Array,
			default: () => []
		}
	})

	const {
		wastewaterOutlets,
		exhaustOutlets,
		noiseOutlets,
		loadOutletList,
		extractOutletsFromBaseTable,
		addOutlet,
		removeOutlet,
		updateOutletData
	} = useFieldSurveyData()

	// 搜索关键词
	const searchKeyword = ref('')

	// 搜索输入处理
	function onSearchInput() {
		console.log('搜索排污口关键词:', searchKeyword.value)
	}

	// 过滤排污口的通用函数
	function filterOutlets(outlets) {
		if (!searchKeyword.value) {
			return outlets
		}
		const keyword = searchKeyword.value.toLowerCase().trim()
		return outlets.filter(outlet => {
			const code = (outlet.code || '').toLowerCase()
			const name = (outlet.name || '').toLowerCase()
			const remark = (outlet.remark || '').toLowerCase()
			return code.includes(keyword) || name.includes(keyword) || remark.includes(keyword)
		})
	}

	// 过滤后的排污口列表
	const filteredWastewaterOutlets = computed(() => filterOutlets(wastewaterOutlets.value))
	const filteredExhaustOutlets = computed(() => filterOutlets(exhaustOutlets.value))
	const filteredNoiseOutlets = computed(() => filterOutlets(noiseOutlets.value))

	// 计算总排污口数量
	const totalOutletCount = computed(() => {
		return wastewaterOutlets.value.length + exhaustOutlets.value.length + noiseOutlets.value.length
	})

	// 计算过滤后的总数量
	const filteredTotalCount = computed(() => {
		return filteredWastewaterOutlets.value.length + filteredExhaustOutlets.value.length + filteredNoiseOutlets.value.length
	})

	// 处理新增排污口
	function handleAddOutlet(type) {
		addOutlet(type, props.projectId)
	}

	// 处理删除排污口
	function handleRemoveOutlet(type, index) {
		removeOutlet(type, index, props.projectId)
	}

	// 处理从项目信息提取排污口
	function handleExtractOutlets() {
		if (!props.baseTable || props.baseTable.length === 0) {
			uni.showToast({
				title: '请先提取项目基本信息',
				icon: 'none',
				duration: 2000
			})
			return
		}
		extractOutletsFromBaseTable(props.projectId, props.baseTable)
	}

	// 组件挂载时加载数据
	onMounted(() => {
		loadOutletList(props.projectId)
	})

	// 监听 baseTable 变化，自动提取排污口
	watch(
		() => props.baseTable,
		(newBaseTable) => {
			if (newBaseTable && newBaseTable.length > 0 && props.projectId) {
				// 检查是否有污染物数据且当前没有排污口数据
				const hasEmissionData = newBaseTable.some(item => item.id === 'pollutants_emission')
				if (hasEmissionData && totalOutletCount.value === 0) {
					console.log('检测到项目信息更新，自动提取排污口')
					extractOutletsFromBaseTable(props.projectId, newBaseTable)
				}
			}
		},
		{ deep: true, immediate: false }
	)

	// 监听排污口数据变化，自动保存
	watch(
		[wastewaterOutlets, exhaustOutlets, noiseOutlets],
		() => {
			if (props.projectId) {
				updateOutletData(props.projectId)
			}
		},
		{ deep: true }
	)
</script>

<style scoped>
	/* 基础样式 */
	.outlet-tab {
		width: 100%;
		min-height: 100vh;
		background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
		padding: 10rpx 0 0 0;
		box-sizing: border-box;
	}

	.section-card {
		background: #ffffff;
		border-radius: 20rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
		overflow: hidden;
		border: 1rpx solid #e2e8f0;
	}

	/* 头部样式 */
	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 28rpx 32rpx;
		background: linear-gradient(to right, #f0fdf4, #dcfce7);
		border-bottom: 1rpx solid #bbf7d0;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.section-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #166534;
		letter-spacing: 0.5rpx;
	}

	.record-count {
		font-size: 26rpx;
		color: #4ade80;
		background: rgba(34, 197, 94, 0.1);
		padding: 8rpx 16rpx;
		border-radius: 20rpx;
	}

	/* 主体内容 */
	.section-body {
		padding: 32rpx;
		display: flex;
		flex-direction: column;
		gap: 32rpx;
	}

	/* 搜索和操作栏 */
	.search-action-bar {
		display: flex;
		flex-direction: column;
		gap: 24rpx;
		padding-bottom: 24rpx;
		border-bottom: 1rpx solid #f1f5f9;
	}

	.search-container {
		position: relative;
	}

	.search-input {
		background: #f8fafc;
		border-radius: 12rpx;
		border: 1rpx solid #e2e8f0;
	}

	.search-result {
		position: absolute;
		right: 16rpx;
		top: 50%;
		transform: translateY(-50%);
		font-size: 24rpx;
		color: #64748b;
		background: rgba(100, 116, 139, 0.1);
		padding: 4rpx 12rpx;
		border-radius: 8rpx;
	}

	.action-buttons {
		display: flex;
		gap: 16rpx;
	}

	.btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8rpx;
		padding: 20rpx 32rpx;
		border-radius: 12rpx;
		font-size: 28rpx;
		font-weight: 500;
		border: none;
		transition: all 0.3s ease;
	}

	.btn:active {
		transform: translateY(2rpx);
	}

	.btn-refresh {
		background: #3b82f6;
		color: white;
		flex: 1;
	}

	.btn-add-primary {
		background: #10b981;
		color: white;
		padding: 20rpx 40rpx;
		margin-top: 24rpx;
	}

	/* 排污口分类区域 */
	.outlet-section {
		background: #f8fafc;
		border-radius: 16rpx;
		padding: 24rpx;
		border: 1rpx solid #e2e8f0;
	}

	.section-title-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
		width: 100%;
	}

	.title-left {
		display: flex;
		align-items: center;
		gap: 12rpx;
		flex: 1;
	}

	.title-text {
		font-size: 30rpx;
		font-weight: 600;
		color: #334155;
	}

	.title-count {
		font-size: 24rpx;
		color: #64748b;
		background: rgba(100, 116, 139, 0.1);
		padding: 4rpx 12rpx;
		border-radius: 12rpx;
	}

	.btn-add-small {
		display: flex;
		align-items: center;
		gap: 6rpx;
		padding: 12rpx 24rpx;
		background: #10b981;
		border: none;
		border-radius: 12rpx;
		font-size: 26rpx;
		font-weight: 500;
		transition: all 0.3s ease;
		color: #ffffff;
		flex-shrink: 0;
		margin-left: auto;
	}

	.btn-add-small:active {
		transform: scale(0.95);
	}

	/* 表格样式 */
	.outlet-table {
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
	}

	.table-header {
		display: none;
		/* 默认隐藏，PC端显示 */
		background: #f8fafc;
		border-bottom: 2rpx solid #e2e8f0;
		padding: 24rpx 32rpx;
	}

	.header-cell {
		font-size: 26rpx;
		font-weight: 600;
		color: #475569;
		text-align: left;
	}

	.table-body {
		min-width: 600rpx;
	}

	.table-row {
		display: flex;
		flex-direction: column;
		padding: 32rpx;
		border-bottom: 1rpx solid #f1f5f9;
		background: #ffffff;
		border-radius: 12rpx;
		margin-bottom: 8rpx;
	}

	.body-cell {
		padding: 16rpx 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.mobile-label {
		font-size: 28rpx;
		font-weight: 500;
		color: #334155;
		min-width: 140rpx;
	}

	.cell-input {
		flex: 1;
		background: #ffffff;
		border-radius: 8rpx;
		border: 1rpx solid #e2e8f0;
	}

	.cell-input :deep(.uni-easyinput__content) {
		background: transparent;
	}

	.photo-picker {
		flex: 1;
	}

	.photo-picker :deep(.uni-file-picker__container) {
		min-height: auto !important;
	}

	.photo-picker :deep(.file-picker__box) {
		width: 120rpx !important;
		/* height: 120rpx !important; */
	}

	.photo-picker :deep(.is-add) {
		width: 120rpx !important;
		/* height: 120rpx !important; */
		/* padding-top: 15.5% !important; */
	}

	.btn-delete {
		display: flex;
		align-items: center;
		gap: 8rpx;
		/* padding: 12rpx 24rpx; */
		background: rgba(239, 68, 68, 0.1);
		border-radius: 8rpx;
		color: #ef4444;
		font-size: 26rpx;
		border: 1rpx solid #fecaca;
	}

	.btn-delete:active {
		transform: scale(0.95);
	}

	.index-number {
		font-size: 28rpx;
		font-weight: 600;
		color: #10b981;
		background: rgba(16, 185, 129, 0.1);
		padding: 8rpx 16rpx;
		border-radius: 8rpx;
		min-width: 60rpx;
		text-align: center;
	}

	/* 空状态 */
	.empty-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 60rpx 32rpx;
		gap: 12rpx;
	}

	.empty-text {
		font-size: 26rpx;
		color: #94a3b8;
	}

	.empty-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 80rpx 32rpx;
		text-align: center;
	}

	.empty-title {
		font-size: 28rpx;
		color: #475569;
		margin-top: 24rpx;
		font-weight: 500;
	}

	.empty-tip {
		font-size: 26rpx;
		color: #94a3b8;
		margin-top: 12rpx;
		max-width: 500rpx;
	}

	/* PC端适配 */
	@media (min-width: 768px) {
		.search-action-bar {
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
		}

		.search-container {
			flex: 1;
			margin-right: 24rpx;
		}

		.action-buttons {
			flex-shrink: 0;
		}

		.btn {
			padding: 16rpx 24rpx;
		}

		/* PC端表格样式 */
		.table-header {
			display: flex;
			align-items: center;
			gap: 32rpx;
		}

		.header-index {
			flex: 0.2;
		}

		.header-code {
			flex: 0.8;
		}

		.header-name {
			flex: 1;
		}

		.header-remark {
			flex: 1.5;
		}

		.header-photo {
			flex: 2;
		}

		.header-action {
			flex: 0.2;
		}

		.table-row {
			flex-direction: row;
			align-items: center;
			gap: 16rpx;
			padding: 5rpx 32rpx;
		}

		.body-cell {
			padding: 0;
			display: block;
		}

		.mobile-label {
			display: none;
		}

		.cell-index {
			flex: 0.2;
		}

		.cell-code {
			flex: 0.8;
		}

		.cell-name {
			flex: 1;
		}

		.cell-remark {
			flex: 1.5;
		}

		.cell-photo {
			flex: 2;
		}

		.cell-action {
			flex: 0.2;
		}

		.cell-input :deep(.uni-easyinput__content) {
			border: 1px solid #e2e8f0;
			background: transparent;
		}

		.btn-delete {
			/* padding: 8rpx 16rpx; */
			background: transparent;
			border: none;
		}

		.photo-picker :deep(.uni-file-picker) {
			padding: 0;
		}

		.photo-picker :deep(.uni-file-picker__container) {
			margin: 0;
		}

		.photo-picker :deep(.file-picker__box) {
			width: 120rpx !important;
			height: 120rpx !important;
			padding-top: 15.5% !important;
		}
	}

	/* 大屏PC适配 */
	@media (min-width: 1200px) {
		.outlet-tab {
			margin: 0 auto;
		}

		.section-body {
			padding: 32rpx;
		}
	}
</style>
