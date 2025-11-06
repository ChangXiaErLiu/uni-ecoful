<!-- ai聊天界面的消息区域 -->
<template>
	<view class="chat-message" :class="{'user-message': isUser, 'ai-message': !isUser}">
		<!-- 头像，后续可以替换真实的 -->
		<view class="message-avatar">
			<image v-if="isUser" src="/static/avatars/user.jpg" class="avatar-img" mode="aspectFit" />

			<!-- ai头像 -->
			<image v-else src="/static/avatars/ai.jpg" class="avatar-img" mode="aspectFit" />
		</view>

		<!-- 消息内容 -->
		<view class="message-content">
			<!-- 消息头 -->
			<view class="message-header">
				<text class="sender-name">{{ isUser ? '我' : 'AI助手' }}</text>
				<text class="message-time">{{ formatTime(message?.timestamp) }}</text>
			</view>

			<!-- 消息体 -->
			<view class="message-body">
				<!-- 用户消息 -->
				<template v-if="isUser">
					<text class="message-text">
						{{ typeof message?.content === 'string' ? message.content : (message?.content?.content || '') }}
					</text>

					<!-- 附件显示（用户消息） -->
					<view v-if="message?.attachments && message.attachments.length" class="attachments">
						<view v-for="(attachment, idx) in message.attachments" :key="idx" class="attachment-item">
							<image
								v-if="/\\.(png|jpe?g|gif|bmp|webp|heic|heif)$/i.test(attachment?.name || attachment?.url || '')"
								:src="attachment.url" class="attachment-thumb" mode="aspectFill" />
							<template v-else>
								<uni-icons type="paperclip" size="14" color="#64748b" />
							</template>
							<text class="attachment-name">{{ attachment.name || '附件' }}</text>
						</view>
					</view>

					<view class="message-actions">
						<view class="action-btn" @tap="startEdit">
							<uni-icons type="compose" size="16" color="#ffffff" />
							<text>编辑</text>
						</view>
						<view class="action-btn" @tap="copyMessageSafe(message?.content)">
							<uni-icons type="paperclip" size="16" color="#ffffff" />
							<text>复制</text>
						</view>
					</view>
				</template>

				<!-- AI消息 -->
				<template v-else>
					<text class="message-text">
						{{ typeof message?.content === 'string' ? message.content : (message?.content?.content || ' ') }}
					</text>

					<!-- 附件显示 -->
					<view v-if="message?.attachments && message.attachments.length" class="attachments">
						<view v-for="(attachment, idx) in message.attachments" :key="idx" class="attachment-item">
							<uni-icons type="paperclip" size="14" color="#64748b" />
							<text class="attachment-name">{{ attachment.name }}</text>
						</view>
					</view>

					<!-- AI消息操作 -->
					<view class="message-actions">
						<view class="action-btn" :class="{'active': message?.feedback === 'like'}"
							@tap="handleFeedback('like')">
							<uni-icons :type="message?.feedback === 'like' ? 'hand-up-filled' : 'hand-up'" size="16"
								:color="message?.feedback === 'like' ? '#ffffff' : '#64748b'" />
							<text>有用</text>
						</view>
						<view class="action-btn" :class="{'active': message?.feedback === 'dislike'}"
							@tap="handleFeedback('dislike')">
							<uni-icons :type="message?.feedback === 'dislike' ? 'hand-down-filled' : 'hand-down'"
								size="16" :color="message?.feedback === 'dislike' ? '#ef4444' : '#64748b'" />
							<text>无用</text>
						</view>
						<view class="action-btn" @tap="copyMessageSafe(message?.content)">
							<uni-icons type="paperclip" size="16" color="#64748b" />
							<text>复制</text>
						</view>
					</view>
				</template>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		computed,
		onMounted,
		watch,
		nextTick
	} from 'vue'

	const props = defineProps({
		message: {
			type: Object,
			default: () => ({})
		}
	})

	const emit = defineEmits(['feedback', 'request-edit', 'edit'])
	const isUser = computed(() => props.message?.role === 'user')



	watch(() => props.message, (newMsg) => {
		// console.log('消息更新:', newMsg)
	}, {
		deep: true
	})

	onMounted(() => {
		// console.log('消息组件挂载，消息内容:', props.message)
	})


	const formatTime = (timestamp) => {
		if (!timestamp) return ''
		const date = new Date(timestamp)
		return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
	}

	const startEdit = () => {
		// 把整条消息抛给父组件，用于回填到输入框（文本 + 附件）
		emit('request-edit', {
			id: props.message?.id,
			content: typeof props.message?.content === 'string' ? props.message.content : (props.message
				?.content?.content || ''),
			attachments: props.message?.attachments || []
		})
	}



	const copyMessage = async (content) => {
		if (!content) return

		try {
			// #ifdef H5
			await navigator.clipboard.writeText(content)
			uni.showToast({
				title: '已复制到剪贴板',
				icon: 'success'
			})
			// #endif
			// #ifdef APP-PLUS || MP
			uni.setClipboardData({
				data: content,
				success: () => {
					uni.showToast({
						title: '已复制到剪贴板',
						icon: 'success'
					})
				}
			})
			// #endif
		} catch (error) {
			console.error('复制失败:', error)
			uni.showToast({
				title: '复制失败',
				icon: 'error'
			})
		}
	}

	// 跨端更稳的复制函数：兼容字符串/对象，含 H5 兜底
	const copyMessageSafe = async (input) => {
		let content = ''
		if (typeof input === 'string') content = input
		else if (input && typeof input === 'object') content = input.content || ''
		content = String(content || '').trim()
		if (!content) return

		try {
			await new Promise((resolve, reject) => {
				try {
					uni.setClipboardData({ data: content, success: resolve, fail: reject })
				} catch (e) { reject(e) }
			})
			uni.showToast({ title: '已复制到剪贴板', icon: 'success' })
			return
		} catch (_) {}

		try {
			if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
				await navigator.clipboard.writeText(content)
				uni.showToast({ title: '已复制到剪贴板', icon: 'success' })
				return
			}
		} catch (_) {}

		try {
			if (typeof document !== 'undefined') {
				const ta = document.createElement('textarea')
				ta.value = content
				ta.style.position = 'fixed'
				ta.style.opacity = '0'
				document.body.appendChild(ta)
				ta.select()
				const ok = document.execCommand('copy')
				document.body.removeChild(ta)
				if (ok) {
					uni.showToast({ title: '已复制到剪贴板', icon: 'success' })
					return
				}
			}
		} catch (_) {}

		uni.showToast({ title: '复制失败', icon: 'error' })
	}

	const handleFeedback = (type) => {
		if (!props.message?.id) return
		emit('feedback', props.message.id, type)
	}
</script>

<style lang="scss" scoped>
	.chat-message {
		display: flex;
		margin-bottom: 32rpx;
		padding: 0 24rpx;
		/* 移除固定高度，让内容决定高度 */
		/* height: 70vh; */
		padding: 15rpx;

		&.user-message {
			flex-direction: row-reverse;

			.message-content {
				align-items: flex-end;
			}

			.message-body {
				background: #6FB052;
				color: white;
				border-radius: 24rpx 24rpx 8rpx 24rpx;
			}
		}

		&.ai-message {
			.message-body {
				background: #ffffff;
				border: 1px solid #e2e8f0;
				border-radius: 24rpx 24rpx 24rpx 8rpx;
			}
		}
	}

	.message-avatar {
		width: 64rpx;
		height: 64rpx;
		border-radius: 16rpx;
		overflow: hidden;
		margin: 0 16rpx;

		.avatar-img {
			width: 100%;
			height: 100%;
			background: #f1f5f9;
		}
	}

	.message-content {
		flex: 1;
		max-width: 80%;
		display: flex;
		flex-direction: column;
	}

	.message-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 12rpx;
		padding: 0 8rpx;
	}

	.sender-name {
		font-size: 26rpx;
		font-weight: 600;
		color: #374151;
	}

	.message-time {
		font-size: 22rpx;
		color: #9ca3af;
	}

	.message-body {
		padding: 24rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
	}

	.message-text {
		font-size: 28rpx;
		line-height: 1.6;
		white-space: pre-wrap;
		word-break: break-word;
		/* 确保文本可见 */
		min-height: 40rpx;
	}

	.attachments {
		margin-top: 16rpx;
		padding-top: 16rpx;
		border-top: 1px solid #f1f5f9;
		flex-wrap: wrap;
	}

	.attachment-item {
		display: flex;
		align-items: center;
		padding: 8rpx 0;

		.attachment-name {
			font-size: 24rpx;
			color: #64748b;
			margin-left: 8rpx;
		}
	}

	.attachment-thumb {
		width: 120rpx;
		height: 120rpx;
		border-radius: 12rpx;
		margin-right: 8rpx;
		object-fit: cover;
	}

	.message-actions {
		display: flex;
		align-items: center;
		gap: 24rpx;
		margin-top: 16rpx;
		padding-top: 16rpx;
		border-top: 1px solid rgba(255, 255, 255, 0.2);

		.user-message & {
			border-top-color: rgba(255, 255, 255, 0.2);
		}

		.ai-message & {
			border-top-color: #f1f5f9;
		}
	}

	.action-btn {
		display: flex;
		align-items: center;
		gap: 6rpx;
		padding: 8rpx 16rpx;
		border-radius: 20rpx;
		background: rgba(255, 255, 255, 0.1);
		transition: all 0.2s ease;
		cursor: pointer;      /* H5/PC 显示为可点 */
		pointer-events: auto; 

		.ai-message & {
			background: #f8fafc;
		}

		&.active {
			background: #10b981;

			text {
				color: white;
			}
		}

		text {
			font-size: 22rpx;
			color: #64748b;

			.user-message & {
				color: rgba(255, 255, 255, 0.8);
			}
		}

		&:active {
			transform: scale(0.95);
		}
	}
</style>
