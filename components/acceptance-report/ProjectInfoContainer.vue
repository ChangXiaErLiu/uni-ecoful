<template>
	<view class="project-info-container">
		<!-- 步骤 1: 项目选择 -->
		<view class="section-card">
			<view class="section-header" :class="{ 'section-header--completed': projectSelected }">
				<view class="header-left">
					<view class="step-badge">
						<uni-icons v-if="projectSelected" type="checkmarkempty" size="16" color="#ffffff" />
						<text v-else class="step-number">1</text>
					</view>
					<uni-icons type="folder-add" size="20" :color="projectSelected ? '#10b981' : '#166534'" />
					<text class="section-title">选择项目</text>
				</view>
				<view v-if="projectSelected" class="status-badge status-badge--success">
					<uni-icons type="checkmarkempty" size="14" color="#10b981" />
					<text>已选择</text>
				</view>
			</view>
			
			<view class="section-body">
				<ProjectSelectionTab @open-picker="showPicker = true" />
			</view>
		</view>

		<!-- 步骤 2: 基本信息 (选择项目后显示) -->
		<view v-if="projectSelected" class="section-card" :class="{ 'section-card--fade-in': projectSelected }">
			<view class="section-header" :class="{ 'section-header--completed': extractionCompleted }">
				<view class="header-left">
					<view class="step-badge">
						<uni-icons v-if="extractionCompleted" type="checkmarkempty" size="16" color="#ffffff" />
						<text v-else class="step-number">2</text>
					</view>
					<uni-icons type="list" size="20" :color="extractionCompleted ? '#10b981' : '#166534'" />
					<text class="section-title">基本信息</text>
				</view>
				<view v-if="extractionCompleted" class="status-badge status-badge--success">
					<uni-icons type="checkmarkempty" size="14" color="#10b981" />
					<text>已提取</text>
				</view>
				<view v-else class="status-badge status-badge--pending">
					<uni-icons type="info" size="14" color="#f59e0b" />
					<text>待提取</text>
				</view>
			</view>
			
			<view class="section-body">
				<BaseInfoTab />
			</view>
		</view>

		<!-- 步骤 3: 标识牌 (基本信息提取后显示) -->
		<view v-if="extractionCompleted" class="section-card" :class="{ 'section-card--fade-in': extractionCompleted }">
			<view class="section-header">
				<view class="header-left">
					<view class="step-badge">
						<text class="step-number">3</text>
					</view>
					<uni-icons type="flag" size="20" color="#166534" />
					<text class="section-title">标识牌</text>
				</view>
				<view class="status-badge status-badge--info">
					<uni-icons type="compose" size="14" color="#3b82f6" />
					<text>可选</text>
				</view>
			</view>
			
			<view class="section-body">
				<SignboardTab @complete="handleComplete" />
			</view>
		</view>
		
		<!-- 项目选择弹窗 - 放在容器最外层 -->
		<view v-if="showPicker" class="global-popup-mask" @tap="handleClosePicker">
			<view class="global-popup-content" @tap.stop>
				<view class="project-picker-modal">
					<view class="picker-header">
						<text class="picker-title">选择项目</text>
						<view class="picker-close" @tap="handleClosePicker">
							<uni-icons type="close" size="20" color="#6b7280" />
						</view>
					</view>
					
					<!-- 搜索框 -->
					<view class="picker-search">
						<uni-easyinput 
							v-model="projectSearchKeyword" 
							placeholder="搜索项目名称..." 
							prefixIcon="search"
							:clearable="true" 
							@input="onSearchInput" />
					</view>
					
					<!-- 项目统计 -->
					<view class="picker-stats">
						<text class="stats-text">
							共 {{ filteredProjects.length }} 个项目
							<text v-if="projectSearchKeyword" class="stats-highlight">（搜索结果）</text>
						</text>
					</view>
					
					<!-- 项目列表 -->
					<scroll-view class="picker-list" scroll-y>
						<view 
							v-for="project in filteredProjects" 
							:key="project.id" 
							class="picker-item"
							:class="{ 'picker-item--active': selectedProjectId === project.id }"
							@tap="handleSelectProject(project)">
							<view class="picker-item-icon">
								<uni-icons 
									type="folder" 
									size="22"
									:color="selectedProjectId === project.id ? '#166534' : '#6b7280'" />
							</view>
							<view class="picker-item-content">
								<text class="picker-item-name">{{ project.name }}</text>
								<text v-if="project.description" class="picker-item-desc">
									{{ project.description }}
								</text>
								<view v-if="project.folder_name" class="picker-item-meta">
									<uni-icons type="calendar" size="14" color="#9ca3af" />
									<text class="meta-text">{{ project.folder_name }}</text>
								</view>
							</view>
							<view class="picker-item-action">
								<view v-if="selectedProjectId === project.id" class="selected-badge">
									<uni-icons type="checkmarkempty" size="18" color="#ffffff" />
								</view>
								<uni-icons v-else type="right" size="16" color="#d1d5db" />
							</view>
						</view>
						
						<!-- 空状态 -->
						<view v-if="filteredProjects.length === 0" class="picker-empty">
							<uni-icons type="search" size="48" color="#cbd5e1" />
							<text class="picker-empty-text">
								{{ projectSearchKeyword ? '未找到匹配的项目' : '暂无项目' }}
							</text>
							<text v-if="projectSearchKeyword" class="picker-empty-tip">
								试试其他关键词或清空搜索
							</text>
						</view>
					</scroll-view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		computed
	} from 'vue'
	import ProjectSelectionTab from './project-info-tabs/ProjectSelectionTab.vue'
	import BaseInfoTab from './project-info-tabs/BaseInfoTab.vue'
	import SignboardTab from './project-info-tabs/SignboardTab.vue'
	import {
		useProjectInfo
	} from '@/composables/useProjectInfo.js'

	// 从 composable 获取状态
	const {
		selectedProjectId,
		extractionOk,
		projectSearchKeyword,
		filteredProjects,
		selectProject,
		onSearchInput
	} = useProjectInfo()

	// 弹窗控制
	const showPicker = ref(false)

	// 计算属性：判断各步骤状态
	const projectSelected = computed(() => !!selectedProjectId.value)
	const extractionCompleted = computed(() => extractionOk.value)

	// 定义向上传递的事件
	const emit = defineEmits(['extraction-complete', 'project-selected'])

	// 关闭弹窗
	function handleClosePicker() {
		showPicker.value = false
	}

	// 选择项目
	async function handleSelectProject(project) {
		const success = await selectProject(project)
		if (success) {
			showPicker.value = false
		}
	}

	// 处理完成事件
	function handleComplete() {
		emit('extraction-complete')
	}
</script>

<style scoped lang="scss">
	.project-info-container {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 24rpx;
	}

	.section-card {
		background: #ffffff;
		border-radius: 16rpx;
		overflow: hidden;
		box-shadow: 0 2rpx 12rpx rgba(15, 23, 42, 0.08);
		border: 2rpx solid #e2e8f0;
		transition: all 0.3s ease;
	}

	// 淡入动画
	.section-card--fade-in {
		animation: fadeInUp 0.5s ease-out;
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(20rpx);
		}

		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 28rpx 32rpx;
		border-bottom: 2rpx solid #e2e8f0;
		transition: all 0.3s ease;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	// 步骤徽章
	.step-badge {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 48rpx;
		height: 48rpx;
		background: #166534;
		border-radius: 50%;
		margin-right: 4rpx;
	}

	.section-header--completed .step-badge {
		background: #10b981;
	}

	.step-number {
		font-size: 24rpx;
		font-weight: 700;
		color: #ffffff;
	}

	.section-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #166534;
		letter-spacing: 0.5rpx;
	}

	// 状态徽章
	.status-badge {
		display: flex;
		align-items: center;
		gap: 6rpx;
		padding: 8rpx 16rpx;
		border-radius: 20rpx;
		font-size: 24rpx;
		font-weight: 500;
	}

	.status-badge--success {
		background: rgba(16, 185, 129, 0.1);
		color: #10b981;
	}

	.status-badge--pending {
		background: rgba(245, 158, 11, 0.1);
		color: #f59e0b;
	}

	.status-badge--info {
		background: rgba(59, 130, 246, 0.1);
		color: #3b82f6;
	}

	.section-body {
		padding: 0;
	}

	// 响应式设计 - 移动端
	@media (max-width: 768px) {
		.project-info-container {
			gap: 20rpx;
		}

		.section-card {
			border-radius: 12rpx;
		}

		.section-header {
			padding: 24rpx 24rpx;
		}

		.step-badge {
			width: 44rpx;
			height: 44rpx;
		}

		.section-title {
			font-size: 30rpx;
		}

		.status-badge {
			font-size: 22rpx;
			padding: 6rpx 12rpx;
		}
	}
	
	// 全局弹窗样式
	.global-popup-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 9999;
		animation: fadeIn 0.3s ease;
	}

	.global-popup-content {
		animation: slideUp 0.3s ease;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(50rpx);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	// 项目选择弹窗样式
	.project-picker-modal {
		width: 90vw;
		max-width: 800rpx;
		height: 80vh;
		max-height: 1000rpx;
		background: #ffffff;
		border-radius: 16rpx;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.3);
	}

	.picker-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 32rpx 24rpx;
		border-bottom: 1rpx solid #e2e8f0;
		flex-shrink: 0;
	}

	.picker-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #1e293b;
	}

	.picker-close {
		padding: 8rpx;
		cursor: pointer;
		transition: transform 0.2s ease;
	}

	.picker-close:active {
		transform: scale(0.9);
	}

	.picker-search {
		padding: 24rpx;
		border-bottom: 1rpx solid #e2e8f0;
		flex-shrink: 0;
	}

	.picker-stats {
		padding: 16rpx 24rpx;
		background: #f8fafc;
		border-bottom: 1rpx solid #e2e8f0;
		flex-shrink: 0;
	}

	.stats-text {
		font-size: 24rpx;
		color: #64748b;
	}

	.stats-highlight {
		color: #166534;
		font-weight: 500;
	}

	.picker-list {
		flex: 1;
		overflow-y: auto;
		min-height: 0;
	}

	.picker-item {
		display: flex;
		align-items: center;
		gap: 16rpx;
		padding: 24rpx;
		border-bottom: 1rpx solid #e2e8f0;
		cursor: pointer;
		transition: background 0.3s ease;
	}

	.picker-item:active {
		background: #f8fafc;
	}

	.picker-item--active {
		background: #f0fdf4;
		border-left: 4rpx solid #166534;
	}

	.picker-item-icon {
		flex-shrink: 0;
	}

	.picker-item-content {
		flex: 1;
		min-width: 0;
	}

	.picker-item-name {
		display: block;
		font-size: 28rpx;
		font-weight: 500;
		color: #1e293b;
		margin-bottom: 4rpx;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.picker-item-desc {
		display: block;
		font-size: 24rpx;
		color: #64748b;
		margin-bottom: 8rpx;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.picker-item-meta {
		display: flex;
		align-items: center;
		gap: 8rpx;
	}

	.meta-text {
		font-size: 22rpx;
		color: #9ca3af;
	}

	.picker-item-action {
		flex-shrink: 0;
	}

	.selected-badge {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 48rpx;
		height: 48rpx;
		background: #166534;
		border-radius: 50%;
	}

	.picker-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 80rpx 40rpx;
		text-align: center;
		min-height: 400rpx;
	}

	.picker-empty-text {
		display: block;
		font-size: 28rpx;
		font-weight: 500;
		color: #64748b;
		margin-top: 24rpx;
		margin-bottom: 8rpx;
	}

	.picker-empty-tip {
		display: block;
		font-size: 24rpx;
		color: #94a3b8;
	}

	// 响应式 - 弹窗
	@media (max-width: 768px) {
		.project-picker-modal {
			width: 95vw;
			height: 85vh;
		}
	}
</style>