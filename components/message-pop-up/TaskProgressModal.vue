<template>
	<uni-popup ref="popup" type="center" :mask-click="false">
		<view class="progress-modal">
			<!-- 标题 -->
			<view class="modal-header">
				<uni-icons type="spinner-cycle" size="24" color="#166534" class="spinning-icon" />
				<text class="modal-title">{{ title }}</text>
			</view>

			<!-- 进度条 -->
			<view class="progress-container">
				<view class="progress-bar">
					<view class="progress-fill" :style="{ width: progress + '%' }"></view>
				</view>
				<text class="progress-text">{{ progress }}%</text>
			</view>

			<!-- 状态信息 -->
			<view class="status-info">
				<view class="status-row">
					<text class="status-label">状态：</text>
					<text class="status-value" :class="'status-' + state">{{ stateText }}</text>
				</view>
				<view class="status-row">
					<text class="status-label">当前步骤：</text>
					<text class="status-value status-step">{{ statusText }}</text>
				</view>
				<view v-if="estimatedTime" class="status-row">
					<text class="status-label">预计剩余：</text>
					<text class="status-value status-time">{{ estimatedTime }}</text>
				</view>
			</view>

			<!-- 操作按钮（暂时隐藏取消功能）-->
	<!-- 		<view class="modal-actions">
				<button v-if="cancelable" class="btn-cancel" @tap="handleCancel">
					<uni-icons type="close" size="16" color="#dc2626" />
					<text>取消任务</text>
				</button>
			</view> -->
		</view>
	</uni-popup>
</template>

<script setup>
import { ref, computed } from 'vue'

// Props
const props = defineProps({
	title: {
		type: String,
		default: '任务执行中'
	},
	progress: {
		type: Number,
		default: 0
	},
	statusText: {
		type: String,
		default: '正在处理...'
	},
	state: {
		type: String,
		default: 'running' // pending/running/success/failed
	},
	cancelable: {
		type: Boolean,
		default: true
	}
})

// Emits
const emit = defineEmits(['cancel'])

// Refs
const popup = ref(null)

// 计算属性
const stateText = computed(() => {
	switch (props.state) {
		case 'pending': return '等待中'
		case 'running': return '运行中'
		case 'success': return '已完成'
		case 'failed': return '失败'
		default: return '处理中'
	}
})

// 预计剩余时间（简单估算）
const estimatedTime = computed(() => {
	if (props.progress >= 100) return null
	if (props.progress <= 0) return null
	
	// 假设任务总时长3分钟，根据当前进度估算剩余时间
	const totalSeconds = 180 // 3分钟
	const remainingPercent = 100 - props.progress
	const remainingSeconds = Math.ceil((remainingPercent / 100) * totalSeconds)
	
	if (remainingSeconds < 60) {
		return `${remainingSeconds}秒`
	} else {
		const minutes = Math.floor(remainingSeconds / 60)
		const seconds = remainingSeconds % 60
		return seconds > 0 ? `${minutes}分${seconds}秒` : `${minutes}分钟`
	}
})

// 方法
function open() {
	popup.value?.open()
}

function close() {
	popup.value?.close()
}

function handleCancel() {
	uni.showModal({
		title: '确认取消',
		content: '确定要取消当前任务吗？',
		confirmText: '确定取消',
		confirmColor: '#dc2626',
		success: (res) => {
			if (res.confirm) {
				emit('cancel')
			}
		}
	})
}

// 暴露方法给父组件
defineExpose({
	open,
	close
})
</script>

<style lang="scss" scoped>
.progress-modal {
	width: 600rpx;
	background: #ffffff;
	border-radius: 24rpx;
	padding: 48rpx 40rpx;
	box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.12);
}

.modal-header {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 16rpx;
	margin-bottom: 40rpx;
}

.spinning-icon {
	animation: spin 1s linear infinite;
}

@keyframes spin {
	from { transform: rotate(0deg); }
	to { transform: rotate(360deg); }
}

.modal-title {
	font-size: 36rpx;
	font-weight: 600;
	color: #166534;
}

.progress-container {
	margin-bottom: 32rpx;
}

.progress-bar {
	width: 100%;
	height: 16rpx;
	background: #e5e7eb;
	border-radius: 8rpx;
	overflow: hidden;
	margin-bottom: 16rpx;
}

.progress-fill {
	height: 100%;
	background: linear-gradient(90deg, #166534 0%, #22c55e 100%);
	border-radius: 8rpx;
	transition: width 0.3s ease;
}

.progress-text {
	display: block;
	text-align: center;
	font-size: 32rpx;
	font-weight: 600;
	color: #166534;
}

.status-info {
	background: #f9fafb;
	border-radius: 16rpx;
	padding: 24rpx;
	margin-bottom: 32rpx;
}

.status-row {
	display: flex;
	align-items: flex-start;
	margin-bottom: 16rpx;
	
	&:last-child {
		margin-bottom: 0;
	}
}

.status-label {
	font-size: 28rpx;
	color: #6b7280;
	min-width: 140rpx;
	flex-shrink: 0;
}

.status-value {
	font-size: 28rpx;
	color: #1f2937;
	flex: 1;
	word-break: break-all;
}

.status-running {
	color: #166534;
	font-weight: 500;
}

.status-pending {
	color: #f59e0b;
	font-weight: 500;
}

.status-success {
	color: #22c55e;
	font-weight: 500;
}

.status-failed {
	color: #dc2626;
	font-weight: 500;
}

.status-step {
	line-height: 1.6;
}

.status-time {
	color: #f59e0b;
	font-weight: 500;
}

.modal-actions {
	display: flex;
	justify-content: center;
}

.btn-cancel {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8rpx;
	padding: 20rpx 48rpx;
	background: #ffffff;
	border: 2rpx solid #dc2626;
	border-radius: 12rpx;
	font-size: 28rpx;
	color: #dc2626;
	
	&:active {
		opacity: 0.8;
		background: #fef2f2;
	}
}
</style>
