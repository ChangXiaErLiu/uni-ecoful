<!-- ai问答界面 -->
<template>
	<!-- 中文注释：聊天页自行管理滚动，因此关闭 AppLayout 外层滚动（非 H5 有效） -->
	<AppLayout current="pages/chat/index" :content-scroll="false">
		<view class="chat-page" :class="isDesktop ? 'layout-desktop' : 'layout-mobile'" :style="!isDesktop ? { height: `calc(100vh - ${totalNavHeightPx}px)` } : {}">
			<!-- 桌面端：并排布局 -->
			<template v-if="isDesktop">
				<ChatSidebar :conversations="conversations" :current-conversation-id="currentConversationId"
					:collapsed="sidebarCollapsed" @create-chat="createNewChat" @select-conversation="selectConversation"
					@edit-conversation="editConversationTitle" @delete-conversation="deleteConversation"
					@toggle-collapse="sidebarCollapsed = !sidebarCollapsed" />

				<view class="chat-main">
					<ChatHeader :conversation="currentConversation" :show-toggle="false" @toggle-sidebar="noop" />

					<!-- 添加消息列表容器，遍历每条消息 -->
					<view class="message-list-container" ref="h5MessageListRef">
						<ChatMessage v-for="(msg, index) in currentMessages" :key="msg.id || index" :message="msg"
							@feedback="handleMessageFeedback" @edit="handleMessageEdit"
							@request-edit="handleRequestEdit" />
						<!-- 底部锚点：用于滚动到底（H5/MP 通用） -->
						<view :id="bottomAnchorId" style="height:1px;width:100%;"></view>

					</view>
					<!-- 遍历结束 -->

					<!-- 输入组件 -->
					<ChatInput ref="chatInputRef" :is-generating="isGenerating" @send-message="handleSendMessage"
						@stop-generating="stopGenerating" @clear-conversation="clearCurrentConversation"
						@add-attachment="handleAddAttachment" />
				</view>
			</template>

			<!-- 移动端：顶部 Header + 抽屉 + 聊天区 -->
			<template v-else>
				<ChatHeader :conversation="currentConversation" :show-toggle="true"
					@toggle-sidebar="toggleMobileSidebar" />

				<view class="mobile-chat-container">
					<!-- 使用官方 uni-popup 统一抽屉与遮罩（跨端更稳） -->
					<uni-popup ref="sidebarPopup" type="left" :is-mask-click="false" @change="onSidebarPopupChange">
						<view class="popup-drawer" :style="popupDrawerStyle">
							<!-- 抽屉场景不使用 collapsed -->
							<ChatSidebar :conversations="conversations" :current-conversation-id="currentConversationId"
								:collapsed="false" @create-chat="handleMobileCreateChat"
								@select-conversation="handleMobileSelectConversation"
								@edit-conversation="editConversationTitle" @delete-conversation="deleteConversation"
								@toggle-collapse="closeMobileSidebar" />
						</view>
					</uni-popup>

					<!-- 聊天区域 -->
					<view class="mobile-chat-main">
						<!--添加消息列表容器，遍历每条消息 -->

						<!-- 
			   <view class="debug-info" style="padding: 10rpx; background: #f0f0f0; color: red; font-size: 24rpx;">
			     <text>调试: 消息数量 {{ currentMessages.length }}</text>
			   </view>
			   -->
						<!-- #ifdef MP -->
						<!-- 中文注释：小程序端使用 scroll-view 作为消息列表滚动容器，保证头部与输入固定 -->
						<scroll-view class="message-list-container" scroll-y enable-flex
							:scroll-into-view="scrollIntoView" :scroll-top="mpScrollTop" :lower-threshold="80"
							@scroll="onMpScroll" @scrolltolower="onMpScrollToLower">
							<ChatMessage v-for="(msg, index) in currentMessages" :key="msg.id || index" :message="msg"
								@feedback="handleMessageFeedback" @edit="handleMessageEdit"
								@request-edit="handleRequestEdit" />
							<view :id="bottomAnchorId" style="height:1px;width:100%;"></view>
						</scroll-view>
						<!-- #endif -->

						<!-- #ifndef MP -->
						<!-- 中文注释：H5/APP 端由容器自身滚动 -->
						<view class="message-list-container" ref="h5MessageListRef">
							<ChatMessage v-for="(msg, index) in currentMessages" :key="msg.id || index" :message="msg"
								@feedback="handleMessageFeedback" @request-edit="handleRequestEdit" />
							<view :id="bottomAnchorId" style="height:1px;width:100%;"></view>
						</view>
						<!-- #endif -->
						<!-- 遍历结束 -->

						<ChatInput ref="chatInputRef" :is-generating="isGenerating" @send-message="handleSendMessage"
							@stop-generating="stopGenerating" @clear-conversation="clearCurrentConversation"
							@add-attachment="handleAddAttachment" />
					</view>
				</view>
			</template>
		</view>

		<!-- 添加调试信息 -->
		<view v-if="false" class="debug-info"
			style="position: fixed; top: 10px; left: 10px; background: rgba(0,0,0,0.8); color: white; padding: 10px; z-index: 9999;">
			<text>当前消息数: {{ currentMessages.length }}</text>
			<text v-for="(msg, index) in currentMessages" :key="index">
				{{ index }}: {{ msg.role }} -
				{{ typeof msg.content === 'string' ? msg.content.substring(0, 20) : '对象' }}
			</text>
		</view>
	</AppLayout>
</template>

<script setup>
	import {
		request
	} from '@/utils/request.js'
	import {
		ref,
		computed,
		onMounted,
		onUnmounted,
		watch,
		nextTick
	} from 'vue'
	import {
		usePlatformInfo
	} from '@/utils/platform'
	import {
		useSafeArea
	} from '@/utils/safe-area'
	import AppLayout from '@/components/layout/AppLayout.vue'
	import ChatSidebar from '@/components/chat/ChatSidebar.vue'
	import ChatHeader from '@/components/chat/ChatHeader.vue'
	import ChatMessage from '@/components/chat/ChatMessage.vue'
	import ChatInput from '@/components/chat/ChatInput.vue'

	import {
		onShow
	} from '@dcloudio/uni-app'
	import {
		navTitleStore
	} from '@/stores/navTitle.js'

	//设置头部导航栏title
	const navTitle = navTitleStore()
	onShow(() => navTitle.setTitle('环保通用AI问答'))

	const {
		isDesktop
	} = usePlatformInfo()
	// 中文注释：安全区信息，用于顶部（状态栏+自定义导航）与 H5 安全区计算
	const {
		statusBarHeightPx,
		navBarHeightPx,
		totalNavHeightPx
	} = useSafeArea()

	// ====== 状态 ======
	const conversations = ref([])
	const currentConversationId = ref('')
	const isGenerating = ref(false)
	const sidebarCollapsed = ref(false) // 仅桌面端使用
	const mobileSidebarVisible = ref(false) // 仅移动端使用
	const sidebarPopup = ref(null) // 仅移动端：uni-popup 抽屉实例
	const cancelGenerate = ref(null) // 用于停止对话生成

	const chatInputRef = ref(null)


	// ====== 计算 ======
	const currentConversation = computed(() => {
		return (
			conversations.value.find((c) => c.id === currentConversationId.value) || {
				id: '',
				title: '新对话',
				messages: [],
			}
		)
	})
	const currentMessages = computed(() => currentConversation.value.messages || [])

	// ====== 滚动与定位（仅消息区域滚动）======
	// 中文注释：H5/PC 使用普通容器滚动；小程序使用 scroll-view
	const h5MessageListRef = ref(null) // H5/PC 消息列表容器引用
	const bottomAnchorId = 'chat-bottom-anchor' // 底部锚点ID
	const scrollIntoView = ref('') // 小程序滚动到锚点
	const mpScrollTop = ref(0) // 小程序滚动位置（用于恢复指定位置）
	const mpLastScrollTop = ref(0)
	const autoFollow = ref(true) // 是否跟随新消息自动滚动到底
	const scrollPositions = ref({}) // 每个对话的滚动位置记录：{ [id]: { top } }

	function isNearBottom(el, threshold = 60) {
		try {
			const remain = el.scrollHeight - el.scrollTop - el.clientHeight
			return remain <= threshold
		} catch (e) {
			return true
		}
	}

	function scrollToBottom() {
		try {
			// #ifdef MP
			// 中文注释：通过锚点滚到底，更稳
			scrollIntoView.value = ''
			nextTick(() => {
				scrollIntoView.value = bottomAnchorId
			})
			// #endif
			// #ifndef MP
			const el = h5MessageListRef.value
			if (el) el.scrollTop = el.scrollHeight
			// #endif
		} catch (e) {}
	}

	function saveScrollPos(id) {
		try {
			const key = id || currentConversationId.value
			if (!key) return
			// #ifdef MP
			scrollPositions.value[key] = {
				top: Number(mpLastScrollTop.value || 0)
			}
			// #endif
			// #ifndef MP
			const el = h5MessageListRef.value
			scrollPositions.value[key] = {
				top: el ? Number(el.scrollTop || 0) : 0
			}
			// #endif
		} catch (e) {}
	}

	function restoreScrollPos(id) {
		try {
			const key = id || currentConversationId.value
			const saved = (key && scrollPositions.value[key]) ? Number(scrollPositions.value[key].top || 0) : null
			if (saved != null && saved > 0) {
				// #ifdef MP
				scrollIntoView.value = ''
				mpScrollTop.value = saved
				// #endif
				// #ifndef MP
				const el = h5MessageListRef.value
				if (el) el.scrollTop = saved
				// #endif
			} else {
				if (autoFollow.value) scrollToBottom()
			}
		} catch (e) {}
	}

	// 小程序滚动事件：上滑暂停自动跟随；到底恢复自动跟随
	function onMpScroll(e) {
		try {
			const top = Number(e?.detail?.scrollTop || 0)
			if (top + 30 < mpLastScrollTop.value) autoFollow.value = false
			mpLastScrollTop.value = top
			if (currentConversationId.value) {
				scrollPositions.value[currentConversationId.value] = {
					top
				}
			}
		} catch (e) {}
	}

	function onMpScrollToLower() {
		autoFollow.value = true
	}

	// H5/PC 监听容器滚动，计算是否在底部
	let h5ScrollHandler = null

	function bindH5ScrollListener() {
		try {
			// #ifdef H5
			const el = h5MessageListRef.value
			if (!el) return
			if (h5ScrollHandler) el.removeEventListener('scroll', h5ScrollHandler)
			h5ScrollHandler = () => {
				try {
					const near = isNearBottom(el)
					autoFollow.value = near
					if (currentConversationId.value) {
						scrollPositions.value[currentConversationId.value] = {
							top: Number(el.scrollTop || 0)
						}
					}
				} catch (e) {}
			}
			el.addEventListener('scroll', h5ScrollHandler)
			// #endif
		} catch (e) {}
	}

	function unbindH5ScrollListener() {
		try {
			// #ifdef H5
			const el = h5MessageListRef.value
			if (el && h5ScrollHandler) el.removeEventListener('scroll', h5ScrollHandler)
			h5ScrollHandler = null
			// #endif
		} catch (e) {}
	}

	// 桌面/移动切换时，切到桌面强制关闭抽屉，避免残留挡点击
	watch(isDesktop, (d) => {
		// 中文注释：切到桌面端强制关闭移动抽屉，避免残留遮罩挡点击
		if (d) {
			mobileSidebarVisible.value = false
			try {
				sidebarPopup.value?.close?.()
			} catch (e) {}
		}
	})

	// 切换会话：保存旧会话滚动，恢复新会话滚动
	watch(currentConversationId, (newId, oldId) => {
		try {
			if (oldId) saveScrollPos(oldId)
		} catch (e) {}
		nextTick(() => restoreScrollPos(newId))
	})

	// 中文注释：抽屉开关统一通过 uni-popup 控制，保证跨端遮罩/定位稳定
	const toggleMobileSidebar = () => {
		if (mobileSidebarVisible.value) {
			try {
				sidebarPopup.value?.close?.()
			} catch (e) {}
		} else {
			try {
				sidebarPopup.value?.open?.('left')
			} catch (e) {}
		}
	}
	const closeMobileSidebar = () => {
		try {
			sidebarPopup.value?.close?.()
		} catch (e) {}
	}
	const onSidebarPopupChange = (e) => {
		// e = { show: Boolean }
		if (e && typeof e.show === 'boolean') {
			mobileSidebarVisible.value = !!e.show
		}
	}
	const noop = () => {}

	// 中文注释：抽屉顶部安全区内边距样式（MP 使用状态栏高度，H5 使用 CSS 变量/环境变量）
	const popupDrawerStyle = computed(() => {
		try {
			// #ifdef MP
			// 中文注释：抽屉顶部预留总导航高度，避免被状态栏/胶囊遮挡
			return `padding-top: ${Number(totalNavHeightPx?.value || 0)}px;`
			// #endif
			// #ifdef H5
			// 中文注释：H5 顶部同时考虑状态栏安全区与自定义导航高度（统一按 44px 兜底）
			const navH = Number(navBarHeightPx?.value || 44)
			return `padding-top: calc(${navH}px + constant(safe-area-inset-top)); padding-top: calc(${navH}px + env(safe-area-inset-top));`
			// #endif
		} catch (e) {
			return ''
		}
	})

	// 初始化，if没有对话就自动创建新对话
	onMounted(() => {
		loadConversations()
		// 只有在完全没有对话数据时才创建新对话
		// 避免重复创建
		if (conversations.value.length === 0) {
			createNewChat()
		} else {
			console.log('初始化：使用已有对话，数量:', conversations.value.length)
		}
	})

	watch(isGenerating, (newVal) => {
		// console.log('isGenerating 状态变化:', newVal)
	})

	watch(currentMessages, () => {
		// 中文注释：有新消息且开启自动跟随时滚动到底
		nextTick(() => {
			if (autoFollow.value) scrollToBottom()
		})
	}, {
		deep: true
	})

	// 中文注释：初次进入自动滚到底，并绑定 H5 滚动监听
	onMounted(() => {
		nextTick(() => {
			autoFollow.value = true
			scrollToBottom()
			bindH5ScrollListener()
		})
	})

	onUnmounted(() => {
		unbindH5ScrollListener()
	})


	// ====== 对话 CRUD ======
	function loadConversations() {
		try {
			const saved = uni.getStorageSync('chat_conversations')
			if (saved) {
				conversations.value = JSON.parse(saved)
				// 确保当前对话ID有效
				if (conversations.value.length > 0) {
					currentConversationId.value = conversations.value[0]?.id || ''
				}
			}
		} catch (e) {
			console.error(e)
		}
	}

	// 修改 saveConversations 函数确保触发响应式更新
	function saveConversations() {
		try {
			// 强制触发响应式更新
			conversations.value = [...conversations.value]
			uni.setStorageSync('chat_conversations', JSON.stringify(conversations.value))
			// console.log('保存对话完成，当前消息:', currentMessages.value)
		} catch (e) {
			console.error('保存对话失败:', e)
		}
	}

	// create新对话
	function createNewChat() {
		// 检查是否已经有空对话，避免重复创建
		const existingEmptyConv = conversations.value.find(conv =>
			!conv.title || conv.title === '新对话' || conv.messages.length === 0
		)

		if (existingEmptyConv) {
			console.log('已有空对话，切换到:', existingEmptyConv.id)
			currentConversationId.value = existingEmptyConv.id
			return
		}

		const chat = {
			id: 'conv_' + Date.now(),
			title: '新对话',
			createdAt: Date.now(),
			messages: [],
		}
		conversations.value.unshift(chat)
		currentConversationId.value = chat.id
		saveConversations()
		console.log('创建新对话:', chat.id)
	}


	function selectConversation(id) {
		currentConversationId.value = id
	}

	function handleMobileCreateChat() {
		createNewChat()
		closeMobileSidebar()
	}

	function handleMobileSelectConversation(id) {
		selectConversation(id)
		closeMobileSidebar()
	}

	function editConversationTitle(id, newTitle) {
		const conv = conversations.value.find((c) => c.id === id)
		if (conv) {
			conv.title = newTitle
			saveConversations()
		}
	}

	function deleteConversation(id) {
		const i = conversations.value.findIndex((c) => c.id === id)
		if (i !== -1) {
			conversations.value.splice(i, 1)
			if (currentConversationId.value === id)
				currentConversationId.value = conversations.value[0]?.id || ''
			saveConversations()
		}
	}

	// 发送消息
	async function handleSendMessage(messageData) {
		const conv = conversations.value.find((c) => c.id === currentConversationId.value)
		if (!conv) return


		// 修复：正确提取 content 和 attachments
		const content = typeof messageData === 'string' ?
			messageData :
			(messageData.content || '')

		const attachments = messageData.attachments || []

		// 创建用户消息 - 确保 content 是字符串
		const userMsg = {
			id: 'msg_' + Date.now(),
			role: 'user',
			content: content, // 直接使用字符串
			attachments,
			timestamp: Date.now(),
		}


		// 添加到消息列表
		conv.messages.push(userMsg)
		isGenerating.value = true

		// 如果是新对话或默认标题，根据输入自动生成标题
		if (!conv.title || conv.title === '新对话') {
			conv.title = generateTitleFromText(userMsg.content)
		}

		// 立即保存，确保用户消息显示
		saveConversations()

		// 等待DOM更新
		await nextTick()

		// 调用AI生成回复
		await generateAIResponse(conv, userMsg)
	}

	// ai问答接口
	async function generateAIResponse(conv, userMsg) {

		// 1) 先推一个空的 AI 消息用于前端累加展示
		const aiMsg = {
			id: 'msg_' + Date.now(),
			role: 'assistant',
			content: '',
			timestamp: Date.now()
		}
		conv.messages.push(aiMsg)


		// 立即保存到存储，确保消息列表更新
		saveConversations()

		// 等待DOM更新
		await nextTick()
		// console.log('DOM更新后检查消息列表')

		// 2) 规范化消息函数保持不变...
		function normalizeMessagesForBackend(messages) {
			return messages
				.map(m => {
					if (typeof m.content === 'string') {
						return {
							role: m.role,
							content: m.content.trim()
						}
					}
					const {
						content = '', attachments = []
					} = m.content || {}
					const attachText = attachments.length ?
						attachments.map(a => `\n[附件：${a.name || a.url}]`).join('') :
						''
					return {
						role: m.role,
						content: (content + attachText).trim()
					}
				})
				.filter(m => m.content && m.content.length > 0)
				.slice(-30)
		}

		const body = {
			model: 'qwen3-max',
			modelName: 'qwen3-max',
			messages: normalizeMessagesForBackend(conv.messages),
			stream: true
		}

		// console.log('发送给后端的消息:', body)

		// 4) 调用后端流式接口
		try {
			// 中文注释：在流式回调中做 UI 与存储节流，减少频繁重渲染与磁盘写入
			let uiTimer = null
			let lastSave = 0

			function flushUI() {
				const messageIndex = conv.messages.findIndex(m => m.id === aiMsg.id)
				if (messageIndex !== -1) {
					const newMessages = [...conv.messages]
					newMessages[messageIndex] = {
						...aiMsg
					}
					conv.messages = newMessages
				}
				uiTimer = null
				// 存储节流：500ms 至少落盘一次
				const now = Date.now()
				if (now - lastSave > 500) {
					lastSave = now
					saveConversations()
				}
			}

			cancelGenerate.value = request.chatStream(
				body,
				(delta) => { // onDelta
					aiMsg.content += delta
					if (!uiTimer) {
						uiTimer = setTimeout(flushUI, 80) // 约 12fps 刷新
					}
				},
				() => {
					// 结束前强制刷新与保存，确保最终内容一致
					try {
						if (uiTimer) {
							clearTimeout(uiTimer);
							uiTimer = null
						}
						flushUI()
					} catch (e) {}
					isGenerating.value = false
					cancelGenerate.value = null
					saveConversations()
				},
				(err) => {
					console.error('AI回复错误:', err)
					aiMsg.content += `\n[错误] ${err?.message || err}`
					try {
						if (uiTimer) {
							clearTimeout(uiTimer);
							uiTimer = null
						}
						flushUI()
					} catch (e) {}
					isGenerating.value = false
					cancelGenerate.value = null
					saveConversations()
				}
			)
		} catch (error) {
			console.error('生成AI回复时发生异常:', error)
			// 异常情况下也要重置状态
			isGenerating.value = false
			cancelGenerate.value = null
		}

	}

	// 停止对话生成
	function stopGenerating() {
		isGenerating.value = false
		if (cancelGenerate.value) {
			try {
				cancelGenerate.value()
			} catch (e) {}
			cancelGenerate.value = null
		}
	}


	function clearCurrentConversation() {
		const conv = conversations.value.find((c) => c.id === currentConversationId.value)
		if (conv) {
			conv.messages = []
			saveConversations()
		}
	}

	function handleMessageFeedback(messageId, feedback) {
		const conv = conversations.value.find((c) => c.id === currentConversationId.value)
		if (!conv) return
		const i = conv.messages.findIndex((m) => m.id === messageId)
		if (i !== -1) {
			conv.messages[i].feedback = feedback
			saveConversations()
		}
	}

	function handleMessageEdit(messageId, newContent) {
		const conv = conversations.value.find((c) => c.id === currentConversationId.value)
		if (!conv) return
		const i = conv.messages.findIndex((m) => m.id === messageId)
		if (i !== -1) {
			conv.messages[i].content = newContent
			saveConversations()
		}
	}

	// 点击“编辑”→ 回填到输入框（文本 + 附件）
	function handleRequestEdit(msg) {
		try {
			chatInputRef.value?.setDraft(msg?.content || '', msg?.attachments || [])
		} catch (e) {
			console.error('回填草稿失败:', e)
		}
	}

	// 根据用户输入生成会话标题
	function generateTitleFromText(text = '') {
		// 取第一行/第一句，移除多空格与换行
		let s = (text || '').trim().replace(/\s/g, ' ')
		// 如果包含中文标点或句号，截取第一句
		const firstEnd = s.search(/[。！？!?\.]/)
		if (firstEnd > 0) s = s.slice(0, firstEnd)
		// 去除首尾标点
		s = s.replace(/^[~#\-\s、，,。!?！?【】\[\]\(\)（）]|[~#\-\s、，,。!?！?【】\[\]\(\)（）]$/g, '')
		// 限制长度（例如 20～24 个字符）
		const maxLen = 10
		if (s.length > maxLen) s = s.slice(0, maxLen) + '…'
		// 兜底：如为空
		return s || '新对话'
	}

	function handleAddAttachment(file) {
		// 附件逻辑可直接接上
	}
</script>

<style lang="scss" scoped>
	.chat-page {
		display: flex;
		flex: 1;
		min-height: 0;
		background: #ffffff;
		border-radius: 15rpx;
		height: 100vh;
		overflow: hidden;
		
	}

	/* 桌面：右侧聊天主区域 */
	.chat-main {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-width: 0;
		min-height: 0;
		height: 100%;
	}

	/* 桌面：左右并排；移动：上下（Header + 内容） */
	.chat-page.layout-desktop {
		flex-direction: row;
	}

	.chat-page.layout-mobile {
		flex-direction: column;
		/* height 由内联样式动态设置，适配所有机型 */
		overflow: hidden;
	}

	/* 移动端容器（扣掉 header 高度） */
	.mobile-chat-container {
		flex: 1;
		/* 关键：跟随父容器纵向伸展 */
		position: relative;
		display: flex;
		flex-direction: column;
		min-height: 0;
	}

	/* 抽屉容器（uni-popup 内容区），统一宽度与背景 */
	.popup-drawer {
		max-width: 640rpx;
		height: 100dvh;
		height: 100vh;
		/* 回退 */
		background: #ffffff;
	}

	/* 顶部安全区：H5 使用 env/变量；MP 通过内联样式设置 */
	.popup-drawer {
		padding-top: var(--safe-top, 0px);
		padding-top: constant(safe-area-inset-top);
		padding-top: env(safe-area-inset-top);
	}

	/* 移动端聊天区域 */
	.mobile-chat-main {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-height: 0;
		min-width: 0;
		overflow: hidden;
	}


	.message-list-container {
		flex: 1;
		min-height: 0;
		/* 中文注释：中间消息列表承担滚动 */
		overflow-y: auto;
		/* 中文注释：H5 防止滚动穿透/链式滚动，提升滚动体验 */
		overscroll-behavior: contain;
		-webkit-overflow-scrolling: touch;
	}

	/* 确保滚动正常工作 */
	.message-list-container::-webkit-scrollbar {
		width: 6rpx;
	}

	.message-list-container::-webkit-scrollbar-thumb {
		background: #cbd5e1;
		border-radius: 3rpx;
	}

	.message-list-container::-webkit-scrollbar-thumb:hover {
		background: #94a3b8;
	}
</style>