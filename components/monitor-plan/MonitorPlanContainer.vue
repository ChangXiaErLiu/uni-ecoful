<template>
	<view class="monitor-plan-container">
		<view class="section-card">
			<view class="section-header">
				<uni-icons type="eye" size="20" color="#166534" />
				<text class="section-title">监测方案</text>
			</view>

			<view class="section-body">
				<!-- 空状态提示 -->
				<view class="empty-state">
					<uni-icons type="eye" size="48" color="#cbd5e1" />
					<text class="empty-text">AI帮您制定监测方案</text>
					<text class="empty-tip">请点击下方按钮为您生成智能检测方案</text>
				</view>

				<!-- 操作按钮 -->
				<view class="action-row">
					<button class="btn btn--primary" @tap="handleGenerate" :disabled="isGenerating">
						<uni-icons type="refresh-filled" size="16" color="#ffffff" />
						<text>生成监测方案</text>
					</button>

					<!-- 生成后显示下载按钮 -->
					<button v-if="canDownload" class="btn btn--primary" @tap="handleDownload">
						<uni-icons type="cloud-download-filled" size="16" color="#ffffff" />
						<text>下载监测方案</text>
					</button>
				</view>

				<!-- 预览卡片（生成后显示） -->
				<view v-if="plan" class="plan-preview">
					<view class="preview-header">
						<uni-icons type="checkmark-circle" size="18" color="#166534" />
						<text class="preview-title">环保验收监测方案已为您已生成，请点击下载！</text>
					</view>
					<!-- <view class="preview-content">
						<text class="preview-text">环保验收监测方案已生成，包含以下内容：</text>
						<view class="preview-sections">
							<text class="section-item">• 项目基本情况</text>
							<text class="section-item">• 环保设施建设情况</text>
							<text class="section-item">• 污染物详细情况</text>
							<text class="section-item">• 方案已生成，请点击下载</text>
						</view>
					</view> -->
				</view>
			</view>
		</view>

		<!-- 进度弹窗 -->
		<TaskProgressModal 
			ref="taskProgressModal"
			:title="taskProgressTitle"
			:progress="taskProgress"
			:statusText="taskStatusText"
			:state="taskState"
		/>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import { useMonitorPlan } from '@/composables/useMonitorPlan.js'
import TaskProgressModal from '@/components/message-pop-up/TaskProgressModal.vue'

const props = defineProps({
	// 项目ID
	projectId: {
		type: [Number, String],
		required: true
	},
	// 是否已提取项目信息
	hasExtracted: {
		type: Boolean,
		default: false
	}
})

const emit = defineEmits(['plan-generated'])

// 使用 composable
const {
	plan,
	canDownload,
	isGenerating,
	taskProgress,
	taskStatusText,
	taskState,
	generatePlan,
	downloadPlan
} = useMonitorPlan()

// 进度弹窗 ref
const taskProgressModal = ref(null)
const taskProgressTitle = ref('监测方案生成中')

// 生成监测方案
async function handleGenerate() {
	await generatePlan(
		props.projectId,
		props.hasExtracted,
		taskProgressModal.value
	)
	
	// 触发事件通知父组件
	emit('plan-generated')
}

// 下载监测方案
async function handleDownload() {
	await downloadPlan(props.projectId)
}
</script>

<style scoped lang="scss">
.monitor-plan-container {
	width: 100%;
}

.section-card {
	background: #ffffff;
	border-radius: 16rpx;
	overflow: hidden;
	box-shadow: 0 2rpx 12rpx rgba(15, 23, 42, 0.08);
}

.section-header {
	display: flex;
	align-items: center;
	gap: 10rpx;
	padding: 28rpx 24rpx;
	background: #ffffff;
	border-bottom: 1rpx solid #e2e8f0;
}

.section-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #166534;
}

.section-body {
	padding: 32rpx 24rpx;
}

.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 80rpx 40rpx;
	gap: 16rpx;
}

.empty-text {
	font-size: 32rpx;
	font-weight: 500;
	color: #64748b;
}

.empty-tip {
	font-size: 24rpx;
	color: #94a3b8;
	text-align: center;
}

.action-row {
	display: flex;
	gap: 16rpx;
	justify-content: center;
	margin-top: 32rpx;
}

.btn {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8rpx;
	// padding: 24rpx 48rpx;
	border-radius: 12rpx;
	font-size: 28rpx;
	font-weight: 500;
	transition: all 0.3s ease;
	border: none;
}

.btn--primary {
	background: #166534;
	color: #ffffff;
}

.btn--primary:active {
	opacity: 0.8;
	transform: scale(0.98);
}

.btn--primary:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.plan-preview {
	padding: 24rpx;
	background: #f0fdf4;
	border-radius: 12rpx;
	border: 1rpx solid #dcfce7;
	margin-top: 32rpx;
}

.preview-header {
	display: flex;
	align-items: center;
	gap: 8rpx;
	margin-bottom: 16rpx;
}

.preview-title {
	font-size: 28rpx;
	color: #166534;
	font-weight: 700;
}

.preview-content {
	display: flex;
	flex-direction: column;
	gap: 12rpx;
}

.preview-text {
	font-size: 24rpx;
	color: #374151;
}

.preview-sections {
	display: flex;
	flex-direction: column;
	gap: 8rpx;
	padding-left: 20rpx;
}

.section-item {
	font-size: 24rpx;
	color: #475569;
}

/* 响应式设计 */
@media (max-width: 768px) {
	.action-row {
		flex-direction: column;
	}

	.btn {
		width: 100%;
	}
}
</style>
