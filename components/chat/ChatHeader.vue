<!-- ai聊天界面的头部 -->

<template>
	<view class="chat-header">
		<view class="header-left">
        <view v-if="showToggle" class="sidebar-toggle" @tap="$emit('toggle-sidebar')">
            <uni-icons type="bars" size="20" color="#374151" />
        </view>
			<text class="conversation-title">{{ conversation?.title || '新对话' }}</text>
		</view>
	</view>
</template>

<script setup>
	const props = defineProps({
		conversation: {
			type: Object,
			default: () => ({})
		},
		showToggle: {
			type: Boolean,
			default: false
		}
	})
	defineEmits(['toggle-sidebar'])
</script>

<style lang="scss" scoped>
	.chat-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 32.6rpx 32rpx;
		background: #ffffff;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	.sidebar-toggle {
		width: 72rpx;
		height: 72rpx;
		border-radius: 16rpx;
		background: #f8fafc;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.conversation-title {
		font-size: 32rpx;
		color: #111827;
		font-weight: 600;
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	.header-btn {
		display: flex;
		align-items: center;
		gap: 8rpx;
		padding: 12rpx 20rpx;
		border-radius: 20rpx;
		background: #f8fafc;
		transition: .2s;

		text {
			font-size: 24rpx;
			color: #64748b;
			font-weight: 500;
		}

		&:active {
			background: #e2e8f0;
		}
	}
</style>
