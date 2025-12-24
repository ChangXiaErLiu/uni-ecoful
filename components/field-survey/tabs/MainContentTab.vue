<template>
	<view class="main-content-tab">
		<view class="section-card">
			<view class="section-header">
				<view class="header-left">
					<uni-icons type="list" size="20" color="#166534" />
					<text class="section-title">项目建设内容</text>
				</view>
				<text class="record-count">共 {{ filteredDisplayItems.length }} 项信息</text>
			</view>

			<view class="section-body">
				<!-- 搜索栏 -->
				<view v-if="displayItems.length > 0" class="search-bar">
					<uni-easyinput v-model="searchKeyword" placeholder="搜索项目信息..." prefixIcon="search" :clearable="true"
						@input="onSearchInput" class="search-input" />
					<text v-if="searchKeyword" class="search-result">
						找到 {{ filteredDisplayItems.length }} 条结果
					</text>
				</view>

				<!-- 基本信息区域 -->
				<view v-if="filteredDisplayItems.length > 0" class="info-container">
					<!-- 文本信息卡片 -->
					<view v-if="filteredTextItems.length > 0" class="info-section">
						<view class="section-title-bar">
							<uni-icons type="compose" size="18" color="#166534" />
							<text class="section-subtitle">基本信息</text>
						</view>
						<view class="info-grid">
							<view v-for="item in filteredTextItems" :key="item.id" class="info-item">
								<view class="info-label">
									<text class="label-text">{{ item.label }}</text>
								</view>
								<uni-easyinput v-model="item.value" :placeholder="`请输入${item.label}`" :clearable="true"
									class="info-input" />
							</view>
						</view>
					</view>
				</view>
				<!-- 基本信息空状态 -->
				<view v-else-if="displayItems.length === 0" class="empty-container">
					<uni-icons :type="searchKeyword ? 'search' : 'list'" size="64" color="#e2e8f0" />
					<text class="empty-title">
						{{ searchKeyword ? '未找到匹配的信息' : '暂无建设内容信息' }}
					</text>
					<text class="empty-tip">
						{{ searchKeyword ? '试试其他关键词或清空搜索' : '请先在竣工验收页面提取项目基本信息' }}
					</text>
				</view>

				<!-- 主体工程区域 -->
				<view class="construction-section">
					<view class="construction-header">
						<view class="header-title">
							<uni-icons type="home" size="20" color="#166534" />
							<text class="header-text">主要建设内容</text>
							<text class="construction-count">共 {{ filteredConstructionList.length }} 条</text>
						</view>
						<view class="header-actions">
							<button class="btn btn-add" @tap="addConstruction">
								<uni-icons type="plus" size="18" color="#ffffff" />
								<text>新增</text>
							</button>
							<button class="btn btn-refresh" @tap="handleFetchConstruction"
								:disabled="loadingConstruction">
								<uni-icons :type="loadingConstruction ? 'spinner-cycle' : 'refresh'" size="18"
									:color="loadingConstruction ? '#94a3b8' : '#ffffff'" />
								<text>{{ loadingConstruction ? '加载' : '刷新' }}</text>
							</button>
						</view>
					</view>

					<!-- 搜索栏 -->
					<view v-if="constructionList.length > 0" class="construction-search">
						<uni-easyinput v-model="constructionSearchKeyword" placeholder="搜索工程名称、内容或备注..."
							prefixIcon="search" :clearable="true" @input="onConstructionSearchInput"
							class="search-input" />
						<text v-if="constructionSearchKeyword" class="search-result">
							找到 {{ filteredConstructionList.length }} 条结果
						</text>
					</view>

					<!-- 加载状态 -->
					<view v-if="loadingConstruction" class="loading-container">
						<uni-icons type="spinner-cycle" size="48" color="#166534" class="loading-spinner" />
						<text class="loading-text">正在加载工程数据...</text>
					</view>

					<!-- 错误状态 -->
					<view v-else-if="fetchConstructionError" class="error-container">
						<uni-icons type="close-circle" size="48" color="#dc2626" />
						<text class="error-message">加载失败: {{ fetchConstructionError }}</text>
						<button class="btn btn-retry" @tap="handleFetchConstruction">
							<text>重新加载</text>
						</button>
					</view>

					<!-- 主体工程表格 -->
					<view v-else-if="filteredConstructionList.length" class="construction-table">
						<!-- 表格头部 - PC端显示 -->
						<view class="table-header">
							<view class="header-cell header-category">类别</view>
							<view class="header-cell header-name">工程名称</view>
							<view class="header-cell header-content">工程内容</view>
							<view class="header-cell header-remark">备注</view>
							<view class="header-cell header-photo">照片</view>
							<view class="header-cell header-action">操作</view>
						</view>

						<!-- 表格内容 -->
						<view class="table-body">
							<view v-for="(item, index) in paginatedConstructionList" :key="item.id" class="table-row"
								:class="{ 'table-row--even': index % 2 === 0 }">
								<!-- 类别 -->
								<view class="body-cell cell-category">
									<view class="mobile-label">类别</view>
									<uni-easyinput v-model="item.category" placeholder="类别" :clearable="true"
										class="cell-input" />
								</view>

								<!-- 工程名称 -->
								<view class="body-cell cell-name">
									<view class="mobile-label">工程名称</view>
									<uni-easyinput v-model="item.name" placeholder="请输入工程名称" :clearable="true"
										class="cell-input" />
								</view>

								<!-- 工程内容 -->
								<view class="body-cell cell-content">
									<view class="mobile-label">工程内容</view>
									<uni-easyinput v-model="item.content" placeholder="请输入工程内容" :clearable="true"
										class="cell-input" />
								</view>

								<!-- 备注 -->
								<view class="body-cell cell-remark">
									<view class="mobile-label">备注</view>
									<uni-easyinput v-model="item.remark" placeholder="备注信息" :clearable="true"
										class="cell-input" />
								</view>

								<!-- 照片 -->
								<view class="body-cell cell-photo">
									<view class="mobile-label">照片</view>
									<uni-file-picker v-model="item.images" fileMediatype="image" mode="grid" :limit="7"
										:auto-upload="false" class="photo-picker" />
								</view>

								<!-- 操作 -->
								<view class="body-cell cell-action">
									<view class="mobile-label">操作</view>
									<button class="btn-delete" @tap="() => removeConstruction(index)">
										<uni-icons type="trash" size="18" color="#ef4444" />
									</button>
								</view>
							</view>
						</view>

						<!-- 分页器 -->
						<view v-if="constructionTotalPages > 1" class="pagination">
							<button class="btn-pagination" :disabled="constructionCurrentPage === 1"
								@tap="constructionCurrentPage--">上一页</button>
							<text class="pagination-text">{{ constructionCurrentPage }} / {{ constructionTotalPages }}</text>
							<button class="btn-pagination" :disabled="constructionCurrentPage === constructionTotalPages"
								@tap="constructionCurrentPage++">下一页</button>
						</view>
					</view>

					<!-- 空状态 -->
					<view v-else class="empty-container">
						<uni-icons :type="constructionSearchKeyword ? 'search' : 'home'" size="64" color="#e2e8f0" />
						<text class="empty-title">
							{{ constructionSearchKeyword ? '未找到匹配的工程' : '暂无工程信息' }}
						</text>
						<text class="empty-tip">
							{{ constructionSearchKeyword ? '试试其他关键词或清空搜索' : '点击"新增"按钮开始添加或点击"刷新"加载数据' }}
						</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		computed,
		onMounted
	} from 'vue'
	import {
		useFieldSurveyData
	} from '@/composables/useFieldSurveyData.js'

	const props = defineProps({
		baseTable: {
			type: Array,
			default: () => []
		},
		userId: {
			type: [String, Number],
			required: true
		},
		projectId: {
			type: [String, Number],
			required: true
		}
	})

	// 搜索关键词
	const searchKeyword = ref('')

	// 搜索输入处理
	function onSearchInput() {
		console.log('搜索关键词:', searchKeyword.value)
	}

	// 过滤出需要显示的项目（排除污染物表格）
	const displayItems = computed(() => {
		return props.baseTable.filter(item => item.id !== 'pollutants_emission')
	})

	// 根据搜索关键词过滤
	const filteredDisplayItems = computed(() => {
		if (!searchKeyword.value) {
			return displayItems.value
		}
		const keyword = searchKeyword.value.toLowerCase().trim()
		return displayItems.value.filter(item => {
			const label = (item.label || '').toLowerCase()
			const value = (item.value || '').toString().toLowerCase()
			return label.includes(keyword) || value.includes(keyword)
		})
	})

	// 文本类型的字段
	const textItems = computed(() => {
		return displayItems.value.filter(item => item.type !== 'image')
	})

	// 过滤后的文本字段
	const filteredTextItems = computed(() => {
		return filteredDisplayItems.value.filter(item => item.type !== 'image')
	})

	// 图片类型的字段
	const imageItems = computed(() => {
		return displayItems.value.filter(item => item.type === 'image')
	})

	// 主体工程相关
	const {
		constructionList,
		constructionSearchKeyword,
		filteredConstructionList,
		loadingConstruction,
		fetchConstructionError,
		onConstructionSearchInput,
		fetchConstructionData,
		addConstruction,
		removeConstruction
	} = useFieldSurveyData()

	// 处理刷新主体工程数据
	function handleFetchConstruction() {
		fetchConstructionData(props.userId, props.projectId)
	}

	// 组件挂载时自动加载主体工程数据
	onMounted(() => {
		// 如果主体工程列表为空，自动加载数据
		if (!constructionList.value.length && props.userId && props.projectId) {
			// console.log('MainContentTab 挂载，自动加载主体工程数据')
			fetchConstructionData(props.userId, props.projectId)
		}
	})

	// 主体工程分页
	const constructionCurrentPage = ref(1)
	const constructionPageSize = 10

	const paginatedConstructionList = computed(() => {
		const start = (constructionCurrentPage.value - 1) * constructionPageSize
		const end = start + constructionPageSize
		return filteredConstructionList.value.slice(start, end)
	})

	const constructionTotalPages = computed(() =>
		Math.ceil(filteredConstructionList.value.length / constructionPageSize)
	)

	// 过滤后的图片字段
	const filteredImageItems = computed(() => {
		return filteredDisplayItems.value.filter(item => item.type === 'image')
	})
</script>

<style scoped>
	/* 基础样式 */
	.main-content-tab {
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
	}

	/* 搜索栏 */
	.search-bar {
		position: relative;
		margin-bottom: 24rpx;
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

	.info-container {
		display: flex;
		flex-direction: column;
		gap: 32rpx;
	}

	/* 信息区块 */
	.info-section {
		background: #f8fafc;
		border-radius: 16rpx;
		padding: 24rpx;
		border: 1rpx solid #e2e8f0;
	}

	.section-title-bar {
		display: flex;
		align-items: center;
		gap: 12rpx;
		margin-bottom: 24rpx;
		padding-bottom: 16rpx;
		border-bottom: 2rpx solid #e2e8f0;
	}

	.section-subtitle {
		font-size: 30rpx;
		font-weight: 600;
		color: #334155;
	}

	/* 信息网格 */
	.info-grid {
		display: flex;
		flex-direction: column;
		gap: 24rpx;
	}

	.info-item {
		background: #ffffff;
		border-radius: 12rpx;
		padding: 20rpx;
		border: 1rpx solid #e2e8f0;
		transition: all 0.3s ease;
	}

	.info-item:hover {
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
	}

	.info-label {
		display: flex;
		align-items: center;
		gap: 12rpx;
		margin-bottom: 12rpx;
	}

	.label-text {
		font-size: 28rpx;
		font-weight: 500;
		color: #475569;
	}


	.info-input {
		background: #f8fafc;
		border-radius: 8rpx;
		border: 1rpx solid #e2e8f0;
	}

	.info-input :deep(.uni-easyinput__content) {
		background: transparent;
	}

	/* 空状态 */
	.empty-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 100rpx 32rpx;
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
		.section-body {
			padding: 40rpx;
		}

		.info-grid {
			display: grid;
			grid-template-columns: repeat(2, 1fr);
			gap: 24rpx;
		}

	}

	/* 大屏PC适配 */
	@media (min-width: 1200px) {
		.info-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	/* 主体工程样式 */
	.construction-section {
		margin-top: 32rpx;
		background: #f8fafc;
		border-radius: 16rpx;
		padding: 24rpx;
		border: 1rpx solid #e2e8f0;
	}

	.construction-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 24rpx;
		flex-wrap: wrap;
		gap: 16rpx;
	}

	.header-title {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.header-text {
		font-size: 30rpx;
		font-weight: 600;
		color: #334155;
	}

	.construction-count {
		font-size: 24rpx;
		color: #64748b;
		background: rgba(100, 116, 139, 0.1);
		padding: 4rpx 12rpx;
		border-radius: 12rpx;
	}

	.header-actions {
		display: flex;
		gap: 12rpx;
	}

	.btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8rpx;
		padding: 12rpx 20rpx;
		border-radius: 12rpx;
		font-size: 26rpx;
		font-weight: 500;
		border: none;
		transition: all 0.3s ease;
	}

	.btn:active {
		transform: translateY(2rpx);
	}

	.btn-add {
		background: #10b981;
		color: white;
	}

	.btn-refresh {
		background: #3b82f6;
		color: white;
	}

	.btn-refresh:disabled {
		background: #cbd5e1;
		color: #94a3b8;
		cursor: not-allowed;
	}

	.btn-retry {
		background: #ef4444;
		color: white;
		padding: 16rpx 32rpx;
		margin-top: 16rpx;
	}

	.construction-search {
		position: relative;
		margin-bottom: 24rpx;
	}

	/* 表格样式 */
	.construction-table {
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
	}

	.table-header {
		display: none;
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
		margin-bottom: 16rpx;
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
		height: 120rpx !important;
	}

	.photo-picker :deep(.is-add) {
		width: 120rpx !important;
		height: 120rpx !important;
	}

	.photo-picker :deep(.file-picker__item) {
		width: 120rpx !important;
		height: 120rpx !important;
		margin: 0 8rpx 8rpx 0 !important;
	}

	.photo-picker :deep(.file-image) {
		width: 120rpx !important;
		height: 120rpx !important;
	}

	.photo-picker :deep(.icon-del-box) {
		width: 32rpx !important;
		height: 32rpx !important;
		right: -8rpx !important;
		top: -8rpx !important;
	}

	.btn-delete {
		align-items: center;
		gap: 8rpx;
		padding: 12rpx 24rpx;
		background: rgba(239, 68, 68, 0.1);
		border-radius: 8rpx;
		color: #ef4444;
		font-size: 26rpx;
		border: 1rpx solid #fecaca;
	}

	/* 分页器样式 */
	.pagination {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 16rpx;
		padding: 32rpx;
	}

	.btn-pagination {
		padding: 12rpx 24rpx;
		background: #f1f5f9;
		border: 1rpx solid #cbd5e1;
		border-radius: 8rpx;
		font-size: 28rpx;
		color: #334155;
	}

	.btn-pagination:disabled {
		color: #94a3b8;
		background: #f8fafc;
	}

	.pagination-text {
		font-size: 28rpx;
		color: #475569;
	}

	/* 加载和错误状态 */
	.loading-container,
	.error-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 80rpx 32rpx;
		text-align: center;
	}

	.loading-spinner {
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}

		to {
			transform: rotate(360deg);
		}
	}

	.loading-text,
	.error-message {
		font-size: 28rpx;
		color: #475569;
		margin-top: 24rpx;
		font-weight: 500;
	}

	.error-message {
		color: #dc2626;
	}

	/* PC端适配 - 主体工程 */
	@media (min-width: 768px) {
		.table-header {
			display: flex;
			align-items: center;
			gap: 32rpx;
		}

		.header-category {
			flex: 0.8;
		}

		.header-name {
			flex: 1.5;
		}

		.header-content {
			flex: 2.5;
		}

		.header-remark {
			flex: 1.5;
		}

		.header-photo {
			flex: 2;
		}

		.header-action {
			flex: 0.5;
		}

		.table-row {
			flex-direction: row;
			align-items: center;
			gap: 16rpx;
			padding: 16rpx 32rpx;
		}

		.body-cell {
			padding: 0;
			display: block;
		}

		.mobile-label {
			display: none;
		}

		.cell-category {
			flex: 0.8;
		}

		.cell-name {
			flex: 1.5;
		}

		.cell-content {
			flex: 2.5;
		}

		.cell-remark {
			flex: 1.5;
		}

		.cell-photo {
			flex: 2;
		}

		.cell-action {
			flex: 0.5;
		}

		.btn-delete {
			padding: 8rpx 16rpx;
			background: transparent;
			border: none;
		}
	}
</style>