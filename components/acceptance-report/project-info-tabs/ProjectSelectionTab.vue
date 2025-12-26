<template>
	<view class="project-selection-tab">
		<!-- 项目选择器 -->
		<view class="form-group">
			<text class="form-label">请选择要进行竣工验收的项目</text>
			<text class="form-tip">项目文件已在项目管理模块上传并自动处理</text>
			
			<!-- 自定义项目选择器触发按钮 -->
			<view class="project-selector" @tap="handleOpenPicker">
				<view class="selector-content">
					<view v-if="selectedProject" class="selected-project">
						<uni-icons type="folder" size="20" color="#166534" />
						<view class="project-info">
							<text class="project-name">{{ selectedProject.name }}</text>
							<text v-if="selectedProject.description" class="project-desc">
								{{ selectedProject.description }}
							</text>
						</view>
					</view>
					<view v-else class="placeholder">
						<uni-icons type="folder-add" size="20" color="#9ca3af" />
						<text class="placeholder-text">请选择项目</text>
					</view>
				</view>
				<uni-icons type="down" size="16" color="#6b7280" />
			</view>
		</view>
		
		<!-- 项目文件列表（只读） -->
		<view v-if="selectedProjectId && projectFiles.length > 0" class="subsection">
			<view class="subsection-head">
				<uni-icons type="paperclip" size="18" color="#166534" />
				<text class="subsection-title">项目文件列表（{{ projectFiles.length }} 个文件）</text>
			</view>
			
			<view class="file-list">
				<view v-for="file in projectFiles" :key="file.document_id" class="file-item">
					<view class="file-info">
						<uni-icons :type="getFileIcon(file.file_extension)" size="20" color="#166534" />
						<view class="file-details">
							<text class="file-name">{{ file.filename }}</text>
							<text class="file-meta">
								{{ formatFileSize(file.size_bytes) }} · {{ formatFileStatus(file.status) }}
							</text>
						</view>
					</view>
					<view class="file-status">
						<text class="status-badge" :class="getStatusClass(file.status)">
							{{ getStatusText(file.status) }}
						</text>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 空状态提示 -->
		<view v-else-if="selectedProjectId && projectFiles.length === 0" class="empty-state">
			<uni-icons type="folder-add" size="48" color="#cbd5e1" />
			<text class="empty-text">该项目暂无文件</text>
			<text class="empty-tip">请先在项目管理模块上传文件</text>
		</view>
		
		<!-- 操作按钮 -->
		<view class="action-row">
			<button 
				class="btn btn--primary" 
				@tap="handleExtract"
				:disabled="!selectedProjectId || projectFiles.length === 0">
				<uni-icons type="search" size="16" color="#ffffff" />
				<text>提取项目基本信息</text>
			</button>
			
			<!-- 清除缓存按钮 -->
			<button v-if="baseTable.length > 0" class="btn btn--ghost" @tap="clearProjectCache">
				<uni-icons type="trash" size="16" color="#dc2626" />
				<text>清除缓存</text>
			</button>
		</view>

		<!-- 项目选择弹窗 -->
		
			<view v-if="showPicker" class="custom-popup-mask" @tap="handleClosePicker">
				<view class="custom-popup-content" @tap.stop>
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
		
		<!-- 任务进度弹窗 -->
		<TaskProgressModal 
			ref="taskProgressModal" 
			:title="taskProgressTitle"
			:progress="taskProgress" 
			:statusText="taskStatusText"
			:state="taskState" 
			:cancelable="false" />
	</view>
</template>

<script setup>
import { ref } from 'vue'
import { useProjectInfo } from '@/composables/useProjectInfo.js'
import TaskProgressModal from '@/components/message-pop-up/TaskProgressModal.vue'

// 从 composable 获取所有状态和方法
const {
	selectedProjectId,
	selectedProject,
	projectFiles,
	projectSearchKeyword,
	filteredProjects,
	baseTable,
	extractionOk,
	taskProgressTitle,
	taskProgress,
	taskStatusText,
	taskState,
	
	// 方法
	selectProject,
	onSearchInput,
	simulateExtract,
	clearProjectCache,
	getFileIcon,
	formatFileSize,
	formatFileStatus,
	getStatusText,
	getStatusClass
} = useProjectInfo()

// 组件内部的状态
const showPicker = ref(false)
const taskProgressModal = ref(null)

// 打开项目选择器
function handleOpenPicker() {
	showPicker.value = true
}

// 关闭项目选择器
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

// 处理提取
async function handleExtract() {
	await simulateExtract(taskProgressModal.value)
	
	// 提取成功后，基本信息区域会自动显示（通过 v-if 控制）
	if (extractionOk.value) {
		uni.showToast({
			title: '信息提取成功，请查看下方基本信息',
			icon: 'success',
			duration: 2000
		})
	}
}
</script>


<style scoped lang="scss">
.project-selection-tab {
	// width: 100%;
	padding: 24rpx;
}

.form-group {
	margin-bottom: 32rpx;
}

.form-label {
	display: block;
	font-size: 28rpx;
	font-weight: 600;
	color: #1e293b;
	margin-bottom: 8rpx;
}

.form-tip {
	display: block;
	font-size: 24rpx;
	color: #64748b;
	margin-bottom: 16rpx;
}

// 项目选择器样式
.project-selector {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 24rpx;
	background: #ffffff;
	border: 2rpx solid #e2e8f0;
	border-radius: 12rpx;
	cursor: pointer;
	transition: all 0.3s ease;
}

.project-selector:active {
	background: #f8fafc;
	border-color: #166534;
}

.selector-content {
	flex: 1;
}

.selected-project {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.project-info {
	flex: 1;
}

.project-name {
	display: block;
	font-size: 28rpx;
	font-weight: 600;
	color: #1e293b;
	margin-bottom: 4rpx;
}

.project-desc {
	display: block;
	font-size: 24rpx;
	color: #64748b;
}

.placeholder {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.placeholder-text {
	font-size: 28rpx;
	color: #9ca3af;
}

// 文件列表样式
.subsection {
	margin-bottom: 32rpx;
}

.subsection-head {
	display: flex;
	align-items: center;
	gap: 12rpx;
	padding: 16rpx 0;
	margin-bottom: 16rpx;
	border-bottom: 2rpx solid #e2e8f0;
}

.subsection-title {
	font-size: 28rpx;
	font-weight: 600;
	color: #166534;
}

.file-list {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.file-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx;
	background: #f8fafc;
	border-radius: 12rpx;
	border: 1rpx solid #e2e8f0;
}

.file-info {
	display: flex;
	align-items: center;
	gap: 16rpx;
	flex: 1;
}

.file-details {
	flex: 1;
}

.file-name {
	display: block;
	font-size: 26rpx;
	font-weight: 500;
	color: #1e293b;
	margin-bottom: 4rpx;
}

.file-meta {
	display: block;
	font-size: 22rpx;
	color: #64748b;
}

.file-status {
	flex-shrink: 0;
}

.status-badge {
	display: inline-block;
	padding: 8rpx 16rpx;
	font-size: 22rpx;
	font-weight: 500;
	border-radius: 8rpx;
	white-space: nowrap;
}

.status-uploaded {
	background: #dbeafe;
	color: #1e40af;
}

.status-processing {
	background: #fef3c7;
	color: #92400e;
}

.status-success {
	background: #dcfce7;
	color: #166534;
}

.status-error {
	background: #fee2e2;
	color: #991b1b;
}

// 空状态样式
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 80rpx 40rpx;
	text-align: center;
}

.empty-text {
	display: block;
	font-size: 28rpx;
	font-weight: 500;
	color: #64748b;
	margin-top: 24rpx;
	margin-bottom: 8rpx;
}

.empty-tip {
	display: block;
	font-size: 24rpx;
	color: #94a3b8;
}

// 操作按钮样式
.action-row {
	display: flex;
	gap: 16rpx;
	margin-top: 32rpx;
}

.btn {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8rpx;
	// padding: 24rpx 32rpx;
	font-size: 28rpx;
	font-weight: 500;
	border-radius: 12rpx;
	border: none;
	cursor: pointer;
	transition: all 0.3s ease;
}

.btn--primary {
	background: #166534;
	color: #ffffff;
}

.btn--primary:active {
	background: #14532d;
}

.btn--primary:disabled {
	background: #cbd5e1;
	color: #94a3b8;
	cursor: not-allowed;
}

.btn--ghost {
	background: transparent;
	color: #dc2626;
	border: 2rpx solid #dc2626;
}

.btn--ghost:active {
	background: #fef2f2;
}


// 自定义弹窗样式
.custom-popup-mask {
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

.custom-popup-content {
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
	min-height: 0; /* 重要：确保 flex 子元素可以正确滚动 */
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
	min-width: 0; /* 防止文本溢出 */
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

// 响应式设计
@media (max-width: 768px) {
	.project-picker-modal {
		width: 95vw;
		height: 85vh;
	}
	
	.action-row {
		flex-direction: column;
	}
	
	.btn {
		width: 100%;
	}
}
</style>
