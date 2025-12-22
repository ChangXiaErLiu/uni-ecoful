<template>
	<view class="equipment-tab">
		<view class="section-card">
			<view class="section-header">
				<view class="header-left">
					<uni-icons type="gear" size="20" color="#166534" />
					<text class="section-title">设备列表情况</text>
				</view>
				<text class="record-count">共 {{ filteredEquipmentList.length }} 条记录</text>
			</view>

			<view class="section-body">
				<!-- 搜索和操作栏 -->
				<view class="search-action-bar">
					<view class="search-container">
						<uni-easyinput v-model="equipmentSearchKeyword" placeholder="搜索设备名称、数量或备注..."
							prefixIcon="search" :clearable="true" @input="onEquipmentSearchInput"
							class="search-input" />
						<text v-if="equipmentSearchKeyword" class="search-result">
							找到 {{ filteredEquipmentList.length }} 条结果
						</text>
					</view>

					<view class="action-buttons">
						<button class="btn btn-add" @tap="addEquipment">
							<uni-icons type="plus" size="18" color="#ffffff" />
							<text>新增</text>
						</button>
						<button class="btn btn-refresh" @tap="handleFetchEquipment" :disabled="loadingEquipment">
							<uni-icons :type="loadingEquipment ? 'spinner-cycle' : 'refresh'" size="18"
								:color="loadingEquipment ? '#94a3b8' : '#ffffff'" />
							<text>{{ loadingEquipment ? '加载' : '刷新' }}</text>
						</button>
					</view>
				</view>

				<!-- 加载状态 -->
				<view v-if="loadingEquipment" class="loading-container">
					<uni-icons type="spinner-cycle" size="48" color="#166534" class="loading-spinner" />
					<text class="loading-text">正在加载设备数据...</text>
				</view>

				<!-- 错误状态 -->
				<view v-else-if="fetchEquipmentError" class="error-container">
					<uni-icons type="close-circle" size="48" color="#dc2626" />
					<text class="error-message">加载失败: {{ fetchEquipmentError }}</text>
					<button class="btn btn-retry" @tap="handleFetchEquipment">
						<text>重新加载</text>
					</button>
				</view>

				<!-- 设备表格 -->
				<view v-else-if="filteredEquipmentList.length" class="equipment-table">
					<!-- 表格头部 - 在PC端显示 -->
					<view class="table-header">
						<view class="header-cell header-index">序号</view>
						<view class="header-cell header-name">设备名称</view>
						<view class="header-cell header-quantity">数量</view>
						<view class="header-cell header-remark">备注</view>
						<view class="header-cell header-photo">照片</view>
						<view class="header-cell header-action">操作</view>
					</view>

					<!-- 表格内容 -->
					<view class="table-body">
						<view v-for="(item, index) in paginatedEquipmentList" :key="item.id" class="table-row"
							:class="{ 'table-row--even': index % 2 === 0 }">
							<!-- 序号 -->
							<view class="body-cell cell-index">
								<view class="mobile-label">序号</view>
								<text class="index-number">{{ index + 1 }}</text>
							</view>

							<!-- 设备名称 -->
							<view class="body-cell cell-name">
								<view class="mobile-label">设备名称</view>
								<uni-easyinput disabled v-model="item.name" placeholder="请输入设备名称" :clearable="true" 
									class="cell-input" />
							</view>

							<!-- 数量 -->
							<view class="body-cell cell-quantity">
								<view class="mobile-label">数量</view>
								<uni-easyinput v-model="item.quantity" placeholder="数量" :clearable="true"
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
								<button class="btn-delete" @tap="() => removeEquipment(index)">
									<uni-icons type="trash" size="18" color="#ef4444" />
									<!-- <text class="delete-text">删除</text> -->
								</button>
							</view>
						</view>
					</view>
					<!-- 分页器 -->
					<view v-if="totalPages > 1" class="pagination">
						<button class="btn-pagination" :disabled="currentPage === 1" @tap="currentPage--">上一页</button>
						<text class="pagination-text">{{ currentPage }} / {{ totalPages }}</text>
						<button class="btn-pagination" :disabled="currentPage === totalPages"
							@tap="currentPage++">下一页</button>
					</view>

				</view>

				<!-- 空状态 -->
				<view v-else class="empty-container">
					<uni-icons :type="equipmentSearchKeyword ? 'search' : 'gear'" size="64" color="#e2e8f0" />
					<text class="empty-title">
						{{ equipmentSearchKeyword ? '未找到匹配的设备' : '暂无设备信息' }}
					</text>
					<text class="empty-tip">
						{{ equipmentSearchKeyword ? '试试其他关键词或清空搜索' : '点击"新增设备"按钮开始添加' }}
					</text>
					<button v-if="!equipmentSearchKeyword" class="btn btn-add-primary" @tap="addEquipment">
						<uni-icons type="plus" size="16" color="#ffffff" />
						<text>新增设备</text>
					</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		computed,
		ref
	} from 'vue'
	import {
		useFieldSurveyData
	} from '@/composables/useFieldSurveyData.js'

	// 组件信息传输
	const props = defineProps({
		userId: {
			type: [String, Number],
			required: true
		},
		projectId: {
			type: [String, Number],
			required: true
		}
	})

	const {
		equipmentSearchKeyword,
		filteredEquipmentList,
		loadingEquipment,
		fetchEquipmentError,
		onEquipmentSearchInput,
		fetchEquipmentData,
		addEquipment,
		removeEquipment
	} = useFieldSurveyData()

	// 处理刷新数据
	function handleFetchEquipment() {
		fetchEquipmentData(props.userId, props.projectId)
	}

	// 分页显示
	const currentPage = ref(1)
	const pageSize = 10

	const paginatedEquipmentList = computed(() => {
		const start = (currentPage.value - 1) * pageSize
		const end = start + pageSize
		return filteredEquipmentList.value.slice(start, end)
	})

	const totalPages = computed(() =>
		Math.ceil(filteredEquipmentList.value.length / pageSize)
	)
</script>

<style scoped>
	/* 基础样式 */
	.uni-input-input {
		color: black !important;
	}
	.equipment-tab {
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

	/* 搜索和操作栏 */
	.search-action-bar {
		display: flex;
		flex-direction: column;
		gap: 24rpx;
		padding: 32rpx;
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
		padding: 5rpx 8rpx;
		border-radius: 12rpx;
		font-size: 32rpx;
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
		flex: 1;
	}

	.btn-refresh {
		background: #3b82f6;
		color: white;
		flex: 1;
	}

	.btn-refresh:disabled {
		background: #cbd5e1;
		color: #94a3b8;
		cursor: not-allowed;
	}

	.btn-add-primary {
		background: #10b981;
		color: white;
		padding: 20rpx 40rpx;
		margin-top: 24rpx;
	}

	.btn-retry {
		background: #ef4444;
		color: white;
		padding: 16rpx 32rpx;
		margin-top: 16rpx;
	}

	/* 加载和错误状态 */
	.loading-container,
	.error-container,
	.empty-container {
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
	.error-message,
	.empty-title {
		font-size: 28rpx;
		color: #475569;
		margin-top: 24rpx;
		font-weight: 500;
	}

	.error-message {
		color: #dc2626;
	}

	.empty-tip {
		font-size: 26rpx;
		color: #94a3b8;
		margin-top: 12rpx;
		max-width: 500rpx;
	}

	/* 表格样式 */
	.equipment-table {
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
		position: relative;
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
		color: black;
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
		/* padding-top: 15.5% !important; */
	}

	.photo-picker :deep(.is-add) {
		width: 120rpx !important;
		height: 120rpx !important;
	}

	.btn-delete {
		/* display: flex; */
		align-items: center;
		gap: 8rpx;
		padding: 12rpx 24rpx;
		background: rgba(239, 68, 68, 0.1);
		border-radius: 8rpx;
		color: #ef4444;
		font-size: 26rpx;
	}

	.delete-text {
		display: none;
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

	/* PC端适配 */
	@media (min-width: 768px) {
		.equipment-tab {
			padding: 10rpx 0 0 0;
		}

		.section-card {
			border-radius: 24rpx;
		}

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

		.header-name {
			flex: 0.75;
		}

		.header-quantity {
			flex: 0.8;
		}

		.header-remark {
			flex: 1.85;
		}

		.header-photo {
			flex: 2.2;
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

		.cell-index { flex: 0.2; }
		.cell-name {
			flex: 1.0;
		}

		.cell-quantity {
			flex: 1.2;
		}

		.cell-remark {
			flex: 2.2;
		}

		.cell-photo {
			flex: 2.9;
		}

		.cell-action {
			flex: 0.3;
		}

		.cell-input :deep(.uni-easyinput__content) {
			border: 1px solid black;
			background: transparent;
			color: black;
		}

		.btn-delete {
			padding: 8rpx 16rpx;
			background: transparent;
			border: none;
		}

		.delete-text {
			display: inline;
		}

		.photo-picker :deep(.uni-file-picker) {
			padding: 0;
		}

		.photo-picker :deep(.uni-file-picker__container) {
			margin: 0;
		}
		
		/* 图片上传框 */
		.photo-picker :deep(.file-picker__box) {
			width: 120rpx !important;
			height: 120rpx !important;
			padding-top: 15.5% !important;
		}
	}

	/* 大屏PC适配 */
	@media (min-width: 1200px) {
		.equipment-tab {
			/* max-width: 1400rpx; */
			margin: 0 auto;
		}

		.section-body {
			padding: 32rpx;
		}
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
</style>