<template>
	<view class="outlet-tab">
		<view class="section-card">
			<view class="section-header">
				<view class="header-left">
					<uni-icons type="map" size="20" color="#166534" />
					<text class="section-title">排污口情况</text>
				</view>
				<text class="record-count">共 {{ filteredTotalCount }} 个排污口</text>
			</view>

			<view class="section-body">
				<!-- 操作栏 -->
				<view class="action-bar">
					<button class="btn btn-extract" @tap="handleExtractOutlets">
						<uni-icons type="download" size="18" color="#ffffff" />
						<text>从项目信息提取</text>
					</button>
				</view>

				<!-- 搜索栏 -->
				<view v-if="totalOutletCount > 0" class="search-bar">
					<uni-easyinput v-model="searchKeyword" placeholder="搜索排污口编号或名称..." prefixIcon="search"
						:clearable="true" @input="onSearchInput" class="search-input" />
					<text v-if="searchKeyword" class="search-result">
						找到 {{ filteredTotalCount }} 个排污口
					</text>
				</view>
				<!-- 废水排污口 -->
				<view class="outlet-category">
					<view class="category-header">
						<view class="category-title">
							<uni-icons type="map" size="18" color="#0ea5e9" />
							<text class="category-name">废水排污口</text>
							<text class="category-count">{{ filteredWastewaterOutlets.length }}</text>
						</view>
						<button class="btn-add-outlet" @tap="handleAddOutlet('wastewater')">
							<uni-icons type="plus" size="16" color="#0ea5e9" />
							<text>新增</text>
						</button>
					</view>

					<view v-if="filteredWastewaterOutlets.length" class="outlet-list">
						<view v-for="(outlet, index) in filteredWastewaterOutlets" :key="outlet.id" class="outlet-card">
							<view class="outlet-card-header">
								<view class="outlet-number">
									<uni-icons type="flag" size="16" color="#0ea5e9" />
									<text>{{ outlet.code }}</text>
								</view>
								<button class="btn-delete-outlet" @tap="handleRemoveOutlet('wastewater', index)">
									<uni-icons type="trash" size="16" color="#ef4444" />
								</button>
							</view>

							<view class="outlet-card-body">
								<view class="outlet-field">
									<text class="field-label">排污口编号</text>
									<uni-easyinput v-model="outlet.code" placeholder="如：DW001" :clearable="true"
										class="field-input" />
								</view>

								<view class="outlet-field">
									<text class="field-label">排污口名称</text>
									<uni-easyinput v-model="outlet.name" placeholder="请输入排污口名称" :clearable="true"
										class="field-input" />
								</view>

								<view class="outlet-field">
									<text class="field-label">现场照片</text>
									<uni-file-picker v-model="outlet.images" fileMediatype="image" mode="grid" :limit="5"
										:auto-upload="false" class="field-picker" />
								</view>
							</view>
						</view>
					</view>

					<view v-else class="empty-category">
						<uni-icons type="water" size="32" color="#e2e8f0" />
						<text class="empty-text">暂无废水排污口</text>
					</view>
				</view>

				<!-- 废气排污口 -->
				<view class="outlet-category">
					<view class="category-header">
						<view class="category-title">
							<uni-icons type="cloud" size="18" color="#8b5cf6" />
							<text class="category-name">废气排污口</text>
							<text class="category-count">{{ filteredExhaustOutlets.length }}</text>
						</view>
						<button class="btn-add-outlet" @tap="handleAddOutlet('exhaust')">
							<uni-icons type="plus" size="16" color="#8b5cf6" />
							<text>新增</text>
						</button>
					</view>

					<view v-if="filteredExhaustOutlets.length" class="outlet-list">
						<view v-for="(outlet, index) in filteredExhaustOutlets" :key="outlet.id" class="outlet-card">
							<view class="outlet-card-header">
								<view class="outlet-number">
									<uni-icons type="flag" size="16" color="#8b5cf6" />
									<text>{{ outlet.code }}</text>
								</view>
								<button class="btn-delete-outlet" @tap="handleRemoveOutlet('exhaust', index)">
									<uni-icons type="trash" size="16" color="#ef4444" />
								</button>
							</view>

							<view class="outlet-card-body">
								<view class="outlet-field">
									<text class="field-label">排污口编号</text>
									<uni-easyinput v-model="outlet.code" placeholder="如：DA001" :clearable="true"
										class="field-input" />
								</view>

								<view class="outlet-field">
									<text class="field-label">排污口名称</text>
									<uni-easyinput v-model="outlet.name" placeholder="请输入排污口名称" :clearable="true"
										class="field-input" />
								</view>

								<view class="outlet-field">
									<text class="field-label">现场照片</text>
									<uni-file-picker v-model="outlet.images" fileMediatype="image" mode="grid" :limit="5"
										:auto-upload="false" class="field-picker" />
								</view>
							</view>
						</view>
					</view>

					<view v-else class="empty-category">
						<uni-icons type="cloud" size="32" color="#e2e8f0" />
						<text class="empty-text">暂无废气排污口</text>
					</view>
				</view>

				<!-- 噪声排污口 -->
				<view class="outlet-category">
					<view class="category-header">
						<view class="category-title">
							<uni-icons type="sound" size="18" color="#f59e0b" />
							<text class="category-name">噪声排污口</text>
							<text class="category-count">{{ filteredNoiseOutlets.length }}</text>
						</view>
						<button class="btn-add-outlet" @tap="handleAddOutlet('noise')">
							<uni-icons type="plus" size="16" color="#f59e0b" />
							<text>新增</text>
						</button>
					</view>

					<view v-if="filteredNoiseOutlets.length" class="outlet-list">
						<view v-for="(outlet, index) in filteredNoiseOutlets" :key="outlet.id" class="outlet-card">
							<view class="outlet-card-header">
								<view class="outlet-number">
									<uni-icons type="flag" size="16" color="#f59e0b" />
									<text>{{ outlet.code }}</text>
								</view>
								<button class="btn-delete-outlet" @tap="handleRemoveOutlet('noise', index)">
									<uni-icons type="trash" size="16" color="#ef4444" />
								</button>
							</view>

							<view class="outlet-card-body">
								<view class="outlet-field">
									<text class="field-label">排污口编号</text>
									<uni-easyinput v-model="outlet.code" placeholder="如：ZS-01" :clearable="true"
										class="field-input" />
								</view>

								<view class="outlet-field">
									<text class="field-label">排污口名称</text>
									<uni-easyinput v-model="outlet.name" placeholder="请输入排污口名称" :clearable="true"
										class="field-input" />
								</view>

								<view class="outlet-field">
									<text class="field-label">现场照片</text>
									<uni-file-picker v-model="outlet.images" fileMediatype="image" mode="grid" :limit="5"
										:auto-upload="false" class="field-picker" />
								</view>
							</view>
						</view>
					</view>

					<view v-else class="empty-category">
						<uni-icons type="sound" size="32" color="#e2e8f0" />
						<text class="empty-text">暂无噪声排污口</text>
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
		removeOutlet
	} = useFieldSurveyData()

	// 组件挂载时加载数据
	onMounted(() => {
		loadOutletList(props.projectId)
	})

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
			return code.includes(keyword) || name.includes(keyword)
		})
	}

	// 过滤后的废水排污口
	const filteredWastewaterOutlets = computed(() => {
		return filterOutlets(wastewaterOutlets.value)
	})

	// 过滤后的废气排污口
	const filteredExhaustOutlets = computed(() => {
		return filterOutlets(exhaustOutlets.value)
	})

	// 过滤后的噪声排污口
	const filteredNoiseOutlets = computed(() => {
		return filterOutlets(noiseOutlets.value)
	})

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

	/* 操作栏 */
	.action-bar {
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

	.btn-extract {
		background: #10b981;
		color: white;
		flex: 1;
	}

	/* 搜索栏 */
	.search-bar {
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

	/* 分类样式 */
	.outlet-category {
		background: #f8fafc;
		border-radius: 16rpx;
		padding: 24rpx;
		border: 1rpx solid #e2e8f0;
	}

	.category-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 24rpx;
	}

	.category-title {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.category-name {
		font-size: 30rpx;
		font-weight: 600;
		color: #334155;
	}

	.category-count {
		font-size: 24rpx;
		color: #64748b;
		background: rgba(100, 116, 139, 0.1);
		padding: 4rpx 12rpx;
		border-radius: 12rpx;
	}

	.btn-add-outlet {
		display: flex;
		align-items: center;
		gap: 6rpx;
		padding: 12rpx 20rpx;
		background: #ffffff;
		border: 1rpx solid currentColor;
		border-radius: 12rpx;
		font-size: 26rpx;
		font-weight: 500;
		transition: all 0.3s ease;
	}

	.btn-add-outlet:active {
		transform: scale(0.95);
	}

	/* 排污口列表 */
	.outlet-list {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}

	/* 排污口卡片 */
	.outlet-card {
		background: #ffffff;
		border-radius: 12rpx;
		border: 1rpx solid #e2e8f0;
		overflow: hidden;
		transition: all 0.3s ease;
	}

	.outlet-card:hover {
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
	}

	.outlet-card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx 24rpx;
		background: linear-gradient(to right, #f8fafc, #f1f5f9);
		border-bottom: 1rpx solid #e2e8f0;
	}

	.outlet-number {
		display: flex;
		align-items: center;
		gap: 8rpx;
		font-size: 28rpx;
		font-weight: 600;
		color: #334155;
	}

	.btn-delete-outlet {
		display: flex;
		align-items: center;
		padding: 8rpx 16rpx;
		background: rgba(239, 68, 68, 0.1);
		border: 1rpx solid #fecaca;
		border-radius: 8rpx;
		transition: all 0.3s ease;
	}

	.btn-delete-outlet:active {
		transform: scale(0.95);
	}

	.outlet-card-body {
		padding: 24rpx;
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}

	/* 字段样式 */
	.outlet-field {
		display: flex;
		flex-direction: column;
		gap: 12rpx;
	}

	.field-label {
		font-size: 26rpx;
		font-weight: 500;
		color: #475569;
	}

	.field-input {
		background: #f8fafc;
		border-radius: 8rpx;
		border: 1rpx solid #e2e8f0;
	}

	.field-input :deep(.uni-easyinput__content) {
		background: transparent;
	}

	.field-picker :deep(.uni-file-picker__container) {
		min-height: auto !important;
	}

	.field-picker :deep(.file-picker__box) {
		width: 120rpx !important;
		height: 120rpx !important;
	}

	.field-picker :deep(.is-add) {
		width: 120rpx !important;
		height: 120rpx !important;
	}

	.field-picker :deep(.file-picker__item) {
		width: 120rpx !important;
		height: 120rpx !important;
		margin: 0 8rpx 8rpx 0 !important;
	}

	.field-picker :deep(.file-image) {
		width: 120rpx !important;
		height: 120rpx !important;
	}

	.field-picker :deep(.icon-del-box) {
		width: 32rpx !important;
		height: 32rpx !important;
		right: -8rpx !important;
		top: -8rpx !important;
	}

	/* 空状态 */
	.empty-category {
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

	/* PC端适配 */
	@media (min-width: 768px) {
		.section-body {
			padding: 40rpx;
		}

		.outlet-list {
			display: grid;
			grid-template-columns: repeat(2, 1fr);
			gap: 24rpx;
		}

		.outlet-card {
			height: 100%;
		}
	}

	/* 大屏PC适配 */
	@media (min-width: 1200px) {
		.outlet-list {
			grid-template-columns: repeat(3, 1fr);
		}
	}
</style>