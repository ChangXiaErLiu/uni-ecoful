<!-- ai聊天界面的输入区域 -->

<template>
	<view class="chat-input-area" :style="inputRootStyle">
		<!-- 附件预览 -->
		<view v-if="attachments.length" class="attachments-preview">
			<view v-for="(file, index) in attachments" :key="index" class="attachment-preview">
				<image v-if="checkIsImage(file)" :src="file.url" class="preview-image" mode="aspectFill" />
				<view v-else class="preview-file">
					<uni-icons type="paperclip" size="20" color="#64748b" />
					<text class="file-name">{{ file.name }}</text>
				</view>
				<view class="remove-btn" @tap="removeAttachment(index)">
					<uni-icons type="close" size="14" color="#ffffff" />
				</view>
			</view>
		</view>

		<!-- 输入框 -->
		<view class="input-container">
			
			<textarea v-model="inputText" class="message-input" placeholder="任何环保相关的问题都可以问我哦~" :maxlength="-1"
				:adjust-position="false" :show-confirm-bar="false" auto-height @confirm="handleMainAction" />
			
			<!-- 附件按钮（满额禁用） -->
			<view class="action-btn" :class="{ disabled: !canAddMore }" @tap="onAddTap">
				<uni-icons type="plus" size="24" :color="canAddMore ? '#82AE5D' : '#cbd5e1'" />
			</view>
			
			<!-- 主操作按钮：发送/停止 -->
			<view 
				class="main-action-btn" 
				:class="{ 
					'stop-btn': isGenerating, 
					'send-btn': !isGenerating,
					'disabled': !isGenerating && !canSend
				}" 
				@tap="handleMainAction" 
			>
				<uni-icons 
					:type="isGenerating ? 'circle-filled' : 'paperplane'" 
					size="20"
					:color="getMainButtonColor" 
				/>
			</view>
		</view>

		<!-- 底部操作栏 + 计数 -->
		<view class="input-actions">
			<view class="left">
				<text class="counter">最多上传10个附件，已上传：{{ attachments.length }}/10 个</text>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		computed,
		onMounted,
		onUnmounted,
		nextTick 
	} from 'vue'
	
	import { useSafeArea } from '@/utils/safe-area'

	const props = defineProps({
		isGenerating: {
			type: Boolean,
			default: false
		}
	})
	const emit = defineEmits(['send-message', 'stop-generating', 'clear-conversation', 'add-attachment'])

	const MAX_ATTACH = 10

	// 中文注释：底部安全区与键盘高度，用于确保输入区在任何设备上可见
	const { safeAreaBottomPx } = useSafeArea()
	const keyboardHeightPx = ref(0)

	// 中文注释：仅小程序监听键盘高度变化，动态预留底部空间，避免被键盘遮挡
	onMounted(() => {
		try {
			// #ifdef MP
			const handler = (res) => {
				keyboardHeightPx.value = Number(res?.height || 0)
			}
			uni.onKeyboardHeightChange && uni.onKeyboardHeightChange(handler)
			// 存储以便卸载时移除监听
			keyboardHeightPx._handler = handler
			// #endif
		} catch (e) {}
	})

	onUnmounted(() => {
		try {
			// #ifdef MP
			if (keyboardHeightPx._handler && typeof uni.offKeyboardHeightChange === 'function') {
				uni.offKeyboardHeightChange(keyboardHeightPx._handler)
			}
			// #endif
		} catch (e) {}
	})

	// 中文注释：输入区根容器样式——为不同端预留底部安全区/键盘空间
	const inputRootStyle = computed(() => {
		try {
			// #ifdef MP
			const kb = Number(keyboardHeightPx?.value || 0)
			const safe = Number(safeAreaBottomPx?.value || 0)
			// 中文注释：小程序端采用平移将输入区顶起至键盘之上，同时保留底部安全区内边距
			return `transform: translateY(-${kb}px); padding-bottom: ${safe}px; will-change: transform;`
			// #endif
			// #ifdef H5
			return `padding-bottom: var(--safe-bottom, 0px); padding-bottom: constant(safe-area-inset-bottom); padding-bottom: env(safe-area-inset-bottom);`
			// #endif
		} catch (e) {
			return ''
		}
	})

	const inputText = ref('')
	const attachments = ref([])
	
	 // 供父组件回填草稿：文本  附件
	 defineExpose({
	   setDraft(text = '', files = []) {
	     inputText.value = (text || '').toString()
	     attachments.value = Array.isArray(files) ? [...files] : []
	     // 某些端上回填后需要等一帧，确保 textarea 尺寸更新
	     nextTick()
	   }
	 })

	// 在模板中可用的函数
	const checkIsImage = (file) => {
		if (file?.isImage) return true
		if (file?.type && typeof file.type === 'string' && file.type.indexOf('image/') === 0) return true
		const name = (file?.name || '') + ' ' + (file?.url || '')
		return /\.(png|jpe?g|gif|bmp|webp|heic|heif)$/i.test(name)
	}

	const canSend = computed(() => {
	  // 只有在没有生成中，并且有输入内容或附件时才能发送
	  return !props.isGenerating && (inputText.value.trim() || attachments.value.length > 0)
	})
	
	const remainingSlots = computed(() => Math.max(0, MAX_ATTACH - attachments.value.length))
	const canAddMore = computed(() => remainingSlots.value > 0)
	
	// 主按钮颜色
	const getMainButtonColor = computed(() => {
		if (props.isGenerating) {
			return '#ffffff' // 停止按钮文字颜色
		}
		return canSend.value ? '#ffffff' : '#9ca3af' // 发送按钮文字颜色
	})

	// 主按钮点击处理
	const handleMainAction = () => {
		if (props.isGenerating) {
			// 生成中：点击停止
			stopGenerating()
		} else {
			// 非生成中：点击发送
			sendMessage()
		}
	}

	const sendMessage = () => {
	  if (!canSend.value) return
	  
	  // 确保发送正确的消息格式
	  const messageContent = inputText.value.trim()
	  
	  const message = {
	    content: messageContent, // 直接发送字符串
	    attachments: [...attachments.value]
	  }
	  
	  emit('send-message', message)
	  inputText.value = ''
	  attachments.value = []
	}

	const stopGenerating = () => emit('stop-generating')

	// 点击 + 按钮
	function onAddTap() {
		if (!canAddMore.value) {
			uni.showToast({
				title: '最多只能添加 10 个附件',
				icon: 'none'
			})
			return
		}
		showAttachmentMenu()
	}

	function showAttachmentMenu() {
		uni.showActionSheet({
			itemList: ['选择图片', '选择文件'],
			success: (res) => {
				if (res.tapIndex === 0) uploadImage()
				else uploadFile()
			}
		})
	}

	function pushFilesSafe(list) {
		for (const f of list) {
			if (attachments.value.length >= MAX_ATTACH) {
				uni.showToast({
					title: '已达 10 个附件上限',
					icon: 'none'
				})
				break
			}
			attachments.value.push(f)
		}
	}

	/** 选择图片：三端多选，按剩余名额限制个数 */
	function uploadImage() {
		const count = Math.min(9, remainingSlots.value) // uni.chooseImage 单次最多 9
		uni.chooseImage({
			count,
			sizeType: ['compressed'],
			sourceType: ['album', 'camera'],
			success: (res) => {
				// H5/小程序：tempFiles & tempFilePaths；App 结构类似
				const list = (res.tempFiles || []).map((t, idx) => ({
					type: t.type || 'image/*',
					isImage: true,
					name: t.name || `image_${Date.now()}_${idx}.jpg`,
					url: t.path || (res.tempFilePaths && res.tempFilePaths[idx]) || '',
					size: t.size || 0
				}))
				pushFilesSafe(list)
			}
		})
	}

	/** 选择任意文件：分别实现三端多选 */
	function uploadFile() {
		// ---- H5 ----
		// #ifdef H5
		const input = document.createElement('input')
		input.type = 'file'
		input.accept = '*/*'
		input.multiple = true
		input.onchange = (e) => {
			const files = Array.from(e.target.files || [])
			const allow = Math.min(files.length, remainingSlots.value)
			const list = files.slice(0, allow).map((file) => ({
				type: file.type || '',
				name: file.name,
				url: URL.createObjectURL(file),
				size: file.size,
				isImage: checkIsImage(file) // 使用 checkIsImage 函数
			}))
			pushFilesSafe(list)
		}
		input.click()
		// #endif

		// ---- App ----
		// #ifdef APP-PLUS
		// plus.gallery.pick 支持 multiple
		plus.gallery.pick(
			(res) => {
				const files = res.files || []
				const allow = Math.min(files.length, remainingSlots.value)
				const list = files.slice(0, allow).map((f, idx) => ({
					type: f.type || '',
					name: f.name || `file_${Date.now()}_${idx}`,
					url: f.path,
					size: f.size || 0,
					isImage: checkIsImage(f) // 使用 checkIsImage 函数
				}))
				pushFilesSafe(list)
			},
			(err) => {
				console.error('选择文件失败:', err)
			}, {
				multiple: true
			}
		)
		// #endif

		// ---- 小程序 ----
		// #ifdef MP
		uni.chooseMessageFile({
			count: Math.min(remainingSlots.value, 10),
			type: 'all', // image / video / file / all
			success: (res) => {
				const files = res.tempFiles || []
				const allow = Math.min(files.length, remainingSlots.value)
				const list = files.slice(0, allow).map((f, idx) => ({
					type: f.type || '',
					name: f.name || `file_${Date.now()}_${idx}`,
					url: f.path,
					size: f.size || 0,
					isImage: checkIsImage(f) // 使用 checkIsImage 函数
				}))
				pushFilesSafe(list)
			}
		})
		// #endif
	}

	const removeAttachment = (index) => attachments.value.splice(index, 1)
</script>

<style lang="scss" scoped>
.chat-input-area {
  background: #ffffff;
  border-top: 1px solid #e2e8f0;
  padding: 24rpx;
  padding-bottom: calc(24rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));

}

	.attachments-preview {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
		margin-bottom: 24rpx;
	}

	.attachment-preview {
		position: relative;
		width: 120rpx;
		height: 120rpx;
		border-radius: 12rpx;
		overflow: hidden;
		background: #f8fafc;
		border: #888e8e 1rpx solid;
	}

	.preview-image {
		width: 100%;
		height: 100%;
	}

	.preview-file {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;

		.file-name {
			font-size: 20rpx;
			color: #64748b;
			margin-top: 8rpx;
			text-align: center;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			width: 100%;
		}
	}

	.remove-btn {
		position: absolute;
		top: 4rpx;
		right: 4rpx;
		width: 32rpx;
		height: 32rpx;
		border-radius: 50%;
		background: #ef4444;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.input-container {
		display: flex;
		align-items: flex-end;
		gap: 16rpx;
		margin-bottom: 20rpx;

	}

	.action-btn {
		width: 64rpx;
		height: 120rpx;
		border-radius: 16rpx;
		background: #f8fafc;
		display: flex;
		align-items: center;
		justify-content: center;

		&:active {
			background: #e2e8f0;
		}

		&.disabled {
			background: #f1f5f9;
		}
	}

	.message-input {
		flex: 1;
		min-height: 80rpx;
		max-height: 200rpx;
		padding: 20rpx;
		background: #f8fafc;
		border-radius: 20rpx;
		font-size: 28rpx;
		line-height: 1.5;
		border: 1px solid #e2e8f0;
		overflow: auto;

		&:focus {
			border-color: #3b82f6;
			background: #ffffff;
		}
	}

	/* 主操作按钮基础样式 */
	.main-action-btn {
		width: 64rpx;
		height: 120rpx;
		border-radius: 16rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: .2s;

		&:active:not(.disabled) {
			transform: scale(0.95);
		}
	}

	/* 发送按钮样式 */
	.send-btn {
		background: #00aa00;
		
		&.disabled {
			background: #f8fafc;
		}
	}

	/* 停止按钮样式 */
	.stop-btn {
		background: #ef4444; /* 红色表示停止 */
	}

	.input-actions {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-top: 20rpx;
		border-top: 1px solid #f1f5f9;
	}

	.counter {
		font-size: 24rpx;
		color: #94a3b8;
	}

	.action-item {
		display: flex;
		align-items: center;
		gap: 8rpx;
		border-radius: 20rpx;
		transition: .2s;
		

		text {
			font-size: 28rpx;
			color: #ff0000;
		}

		&:active {
			background: #f8fafc;
		}
	}
</style>
