<!-- ai聊天界面的左边历史信息区域 -->
<template>
	
	<view class="chat-sidebar" :class="{'sidebar-collapsed': collapsed}">
		<!-- 头部 -->
		<view class="sidebar-header">
			<view class="header-main">
				<text class="sidebar-title">对话历史</text>
            <view class="header-actions">
                <view class="action-btn" @tap="toggleCollapse">
                    <uni-icons :type="collapsed ? 'right' : 'left'" size="20" color="#64748b" />
                </view>
            </view>
			</view>
		</view>

		<!-- 新建 -->
        <view class="sidebar-body">
            <button class="create-chat-btn" @tap="createChat">
                <uni-icons type="plusempty" size="18" color="#ffffff" />
                <text v-show="!collapsed" class="create-chat-font">新建对话</text>
            </button>
        </view>

		<!-- 列表 -->
        <scroll-view class="conversation-list" scroll-y>
            <view v-for="conv in conversations" :key="conv.id" class="conversation-item"
                :class="{'active': conv.id === currentConversationId}" @tap="selectConversation(conv.id)">
                <view class="conv-content">
                    <uni-icons type="chat" size="18" color="#64748b" />
                    <text class="conv-title">{{ conv.title || '新对话' }}</text>
                </view>

                <view class="conv-actions" v-if="!collapsed">
                    <view class="conv-action-btn" @tap.stop="editTitle(conv.id)">
                        <uni-icons type="compose" size="14" color="#94a3b8" />
                    </view>
                    <view class="conv-action-btn" @tap.stop="deleteConv(conv.id)">
                        <uni-icons type="trash" size="14" color="#94a3b8" />
                    </view>
                </view>
            </view>
        </scroll-view>
	</view>
</template>

<script setup>
	const props = defineProps({
		conversations: {
			type: Array,
			default: () => []
		},
		currentConversationId: {
			type: String,
			default: ''
		},
		collapsed: {
			type: Boolean,
			default: false
		} // 仅桌面端“窄/宽”
	})
	const emit = defineEmits([
		'create-chat',
		'select-conversation',
		'edit-conversation',
		'delete-conversation',
		'toggle-collapse'
	])

	const createChat = () => emit('create-chat')
	const selectConversation = id => emit('select-conversation', id)
	const toggleCollapse = () => emit('toggle-collapse')

	const editTitle = (id) => {
		uni.showModal({
			title: '编辑对话标题',
			content: '',
			editable: true,
			placeholderText: '输入新的对话标题',
			success: (res) => {
				if (res.confirm && res.content) emit('edit-conversation', id, res.content)
			}
		})
	}
	const deleteConv = (id) => {
		uni.showModal({
			title: '永久删除对话',
			content: '删除后，该对话将不可恢复。确认删除吗？',
			success: (res) => {
				if (res.confirm) emit('delete-conversation', id)
			}
		})
	}
</script>

<style lang="scss" scoped>
.chat-sidebar {
  width: 420rpx;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e2e8f0;
  min-width: 0;
  height: 90%;
  border-radius: 15rpx;
  // margin-top: 44px; 
  @media (min-width: 768px) {
    height: 100%;  // PC端
	}
  
  
}

	/* 头部 */
	.sidebar-header {
		padding: 28rpx 32rpx;
		border-bottom: 1px solid #e2e8f0;
	}

	.header-main {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.sidebar-title {
		font-size: 38rpx;
		color: #111827;
		font-weight: 600;
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: 8rpx;
	}

	.action-btn {
		width: 56rpx;
		height: 56rpx;
		border-radius: 12rpx;
		background: #f8fafc;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* 折叠（桌面窄栏） */
	.sidebar-collapsed {
		width: 124rpx;
	}

	/* 新建按钮 */
	.sidebar-body {
		padding: 16rpx;
	}

	.create-chat-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8rpx;
		width: 100%;
		height: 72rpx;
		border-radius: 12rpx;
		background: #00aa00;
		color: #fff;
		font-size: 26rpx;
		font-weight: 600;
	}

	/* 列表 */
	.conversation-list {
		/* 中文注释：仅列表区域滚动，头部与“新建”保持固定 */
		flex: 1;
		min-height: 0;
		padding: 8rpx 0;
		overflow-y: auto;
	}

	.conversation-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12rpx;
		padding: 16rpx;
		margin: 0 16rpx 8rpx;
		border-radius: 12rpx;
		transition: .2s;
		height: 30px;

		&.active {
			background: #f0f9ff;
			border: 1px solid #e0f2fe;

			.conv-title {
				color: #0369a1;
				font-weight: 500;
			}
		}

		&:active {
			background: #f8fafc;
		}
	}

	.conv-content {
		display: flex;
		align-items: center;
		gap: 12rpx;
		flex: 1;
		min-width: 0;
	}

	.conv-title {
		font-size: 32rpx;
		color: #374151;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		flex: 1;
	}

	.conv-actions {
		display: flex;
		align-items: center;
		gap: 8rpx;
		opacity: 0;
		transition: opacity .2s;

		.conversation-item:hover &,
		.conversation-item.active & {
			opacity: 1;
		}
	}

	.conv-action-btn {
		width: 36rpx;
		height: 36rpx;
		border-radius: 8rpx;
		background: #f8fafc;
		display: flex;
		align-items: center;
		justify-content: center;
		
	}
</style>
