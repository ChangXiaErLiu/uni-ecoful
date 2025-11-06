<!-- 个人知识库界面 -->
<template>
  <AppLayout current="pages/knowledge/index">
    <view class="knowledge">
      <!-- 页面头部 -->
      <view class="knowledge__header">
        <view class="knowledge__title-section">
          <text class="knowledge__title">个人知识库</text>
          <text class="knowledge__subtitle">管理您的文档资料，构建专属知识体系</text>
        </view>
        <button class="knowledge__button knowledge__button--primary" @tap="createKnowledge">
          <uni-icons type="plus" size="16" color="#ffffff" />
          <text>新建知识库</text>
        </button>
      </view>

      <!-- 主要内容区域 -->
      <view class="knowledge__content">
        <!-- 左侧知识库列表 -->
        <view class="knowledge__list-panel">
          <view class="knowledge__panel-header">
            <text class="knowledge__panel-title">知识库列表</text>
            <text class="knowledge__panel-count">{{ knowledgeList.length }} 个知识库</text>
          </view>
          
          <scroll-view scroll-y class="knowledge__scroll">
            <view
              v-for="item in knowledgeList"
              :key="item.id"
              class="knowledge__item"
              :class="{ 
                'knowledge__item--active': item.id === activeKnowledgeId,
                'knowledge__item--default': item.default 
              }"
              @tap="() => switchKnowledge(item.id)"
            >
              <view class="knowledge__item-icon">
                <uni-icons :type="item.icon || 'folder'" size="24" :color="item.id === activeKnowledgeId ? '#3b82f6' : '#64748b'" />
              </view>
              <view class="knowledge__item-content">
                <view class="knowledge__item-header">
                  <text class="knowledge__item-name">{{ item.name }}</text>
                  <view v-if="item.default" class="knowledge__item-badge">默认</view>
                </view>
                <text class="knowledge__item-desc">{{ item.description }}</text>
                <view class="knowledge__item-stats">
                  <text class="knowledge__item-stat">{{ item.fileCount || 0 }} 个文件</text>
                  <text class="knowledge__item-stat">•</text>
                  <text class="knowledge__item-stat">{{ item.lastUpdate || '刚刚' }}</text>
                </view>
              </view>
              <view class="knowledge__item-actions">
                <view class="knowledge__item-action" @tap.stop="() => renameKnowledge(item.id)">
                  <uni-icons type="compose" size="16" color="#64748b" />
                </view>
                <view v-if="!item.default" class="knowledge__item-action" @tap.stop="() => removeKnowledge(item.id)">
                  <uni-icons type="trash" size="16" color="#ef4444" />
                </view>
              </view>
            </view>
            
            <!-- 空状态 -->
            <view v-if="knowledgeList.length === 0" class="knowledge__empty">
              <uni-icons type="folder" size="60" color="#cbd5e1" />
              <text class="knowledge__empty-text">暂无知识库</text>
              <text class="knowledge__empty-subtext">点击上方按钮创建第一个知识库</text>
            </view>
          </scroll-view>
        </view>

        <!-- 右侧文件列表 -->
        <view class="knowledge__files-panel">
          <view class="knowledge__panel-header">
            <view class="knowledge__files-header">
              <text class="knowledge__panel-title">文件列表</text>
              <text class="knowledge__files-count" v-if="currentFiles.length > 0">{{ currentFiles.length }} 个文件</text>
            </view>
            <button class="knowledge__button knowledge__button--upload" @tap="uploadFile" :disabled="!activeKnowledgeId">
              <uni-icons type="cloud-upload" size="16" color="#ffffff" />
              <text>上传文件</text>
            </button>
          </view>

          <scroll-view scroll-y class="knowledge__file-scroll">
            <view v-if="currentFiles.length > 0">
              <view v-for="file in currentFiles" :key="file.id" class="knowledge__file-item">
                <view class="knowledge__file-icon">
                  <uni-icons :type="getFileIcon(file.type)" size="24" :color="getFileColor(file.type)" />
                </view>
                <view class="knowledge__file-info">
                  <text class="knowledge__file-name">{{ file.name }}</text>
                  <view class="knowledge__file-meta">
                    <text class="knowledge__file-size">{{ file.size }}</text>
                    <text class="knowledge__file-dot">•</text>
                    <text class="knowledge__file-date">{{ file.uploadedAt }}</text>
                    <text class="knowledge__file-dot">•</text>
                    <text class="knowledge__file-status" :class="`knowledge__file-status--${file.status}`">
                      {{ file.status === 'processed' ? '已处理' : '待处理' }}
                    </text>
                  </view>
                </view>
                <view class="knowledge__file-actions">
                  <view class="knowledge__file-action" @tap.stop="() => previewFile(file.id)">
                    <uni-icons type="eye" size="18" color="#64748b" />
                    <text>预览</text>
                  </view>
                  <view class="knowledge__file-action" @tap.stop="() => remarkFile(file.id)">
                    <uni-icons type="chat" size="18" color="#64748b" />
                    <text>备注</text>
                  </view>
                  <view class="knowledge__file-action" @tap.stop="() => deleteFile(file.id)">
                    <uni-icons type="trash" size="18" color="#ef4444" />
                  </view>
                </view>
              </view>
            </view>
            
            <!-- 文件空状态 -->
            <view v-else class="knowledge__empty-files">
              <uni-icons type="document" size="60" color="#cbd5e1" />
              <text class="knowledge__empty-text">暂无文件</text>
              <text class="knowledge__empty-subtext">上传文档开始构建知识库</text>
              <button class="knowledge__button knowledge__button--outline" @tap="uploadFile" :disabled="!activeKnowledgeId">
                <uni-icons type="cloud-upload" size="16" color="#3b82f6" />
                <text>上传第一个文件</text>
              </button>
            </view>
          </scroll-view>
        </view>
      </view>
    </view>
  </AppLayout>
</template>

<script setup>
import { computed, ref } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'

import { onShow } from '@dcloudio/uni-app'
import { navTitleStore } from '@/stores/navTitle.js'

// 设置头部导航栏title
const navTitle = navTitleStore()
onShow(() => navTitle.setTitle('个人知识库'))

// 中文注释：知识库页面包含左侧知识库列表与右侧文件管理区域
const knowledgeList = ref([
  { 
    id: 'kb-default', 
    name: '默认知识库', 
    description: '系统初始化的默认知识库',
    icon: 'home',
    default: true,
    fileCount: 3,
    lastUpdate: '2小时前'
  },
  { 
    id: 'kb-project', 
    name: '项目资料库', 
    description: '存放项目方案与需求文档',
    icon: 'folder',
    fileCount: 12,
    lastUpdate: '1天前'
  },
  { 
    id: 'kb-research', 
    name: '研究资料', 
    description: '行业研究和技术文档',
    icon: 'search',
    fileCount: 8,
    lastUpdate: '3天前'
  }
])

const knowledgeFiles = ref({
  'kb-default': [
    { 
      id: 'file-1', 
      name: '产品白皮书.pdf', 
      size: '2.1 MB', 
      type: 'pdf',
      uploadedAt: '2025-10-01',
      status: 'processed'
    },
    { 
      id: 'file-2', 
      name: '用户需求文档.docx', 
      size: '1.8 MB', 
      type: 'word',
      uploadedAt: '2025-10-02',
      status: 'processed'
    },
    { 
      id: 'file-3', 
      name: '项目规划表.xlsx', 
      size: '856 KB', 
      type: 'excel',
      uploadedAt: '2025-10-03',
      status: 'processing'
    }
  ],
  'kb-project': [
    { 
      id: 'file-4', 
      name: '技术架构图.png', 
      size: '3.2 MB', 
      type: 'image',
      uploadedAt: '2025-09-28',
      status: 'processed'
    }
  ],
  'kb-research': []
})

const activeKnowledgeId = ref(knowledgeList.value[0]?.id || '')

const currentFiles = computed(() => knowledgeFiles.value[activeKnowledgeId.value] || [])

function createKnowledge() {
  console.log('新建知识库')
  // 模拟新建知识库
  const newKb = {
    id: 'kb-new-' + Date.now(),
    name: '新建知识库',
    description: '这是一个新的知识库',
    icon: 'folder',
    fileCount: 0,
    lastUpdate: '刚刚'
  }
  knowledgeList.value.push(newKb)
  knowledgeFiles.value[newKb.id] = []
  activeKnowledgeId.value = newKb.id
}

function switchKnowledge(id) {
  activeKnowledgeId.value = id
}

function renameKnowledge(id) {
  console.log('重命名知识库', id)
  uni.showToast({
    title: '重命名功能开发中',
    icon: 'none'
  })
}

function removeKnowledge(id) {
  console.log('删除知识库', id)
  if (confirm('确定要删除这个知识库吗？')) {
    knowledgeList.value = knowledgeList.value.filter(kb => kb.id !== id)
    delete knowledgeFiles.value[id]
    if (activeKnowledgeId.value === id) {
      activeKnowledgeId.value = knowledgeList.value[0]?.id || ''
    }
  }
}

function uploadFile() {
  console.log('上传文件')
  if (!activeKnowledgeId.value) return
  
  // 模拟文件上传
  const newFile = {
    id: 'file-' + Date.now(),
    name: '示例文档.pdf',
    size: '1.5 MB',
    type: 'pdf',
    uploadedAt: '刚刚',
    status: 'processing'
  }
  knowledgeFiles.value[activeKnowledgeId.value].unshift(newFile)
  
  // 更新知识库统计
  const kb = knowledgeList.value.find(k => k.id === activeKnowledgeId.value)
  if (kb) {
    kb.fileCount = (kb.fileCount || 0) + 1
    kb.lastUpdate = '刚刚'
  }
}

function previewFile(id) {
  console.log('预览文件', id)
  uni.showToast({
    title: '预览功能开发中',
    icon: 'none'
  })
}

function remarkFile(id) {
  console.log('添加备注', id)
  uni.showToast({
    title: '备注功能开发中',
    icon: 'none'
  })
}

function deleteFile(id) {
  console.log('删除文件', id)
  if (confirm('确定要删除这个文件吗？')) {
    const kbId = activeKnowledgeId.value
    knowledgeFiles.value[kbId] = knowledgeFiles.value[kbId].filter(file => file.id !== id)
    
    // 更新知识库统计
    const kb = knowledgeList.value.find(k => k.id === kbId)
    if (kb) {
      kb.fileCount = Math.max(0, (kb.fileCount || 0) - 1)
    }
  }
}

function getFileIcon(fileType) {
  const iconMap = {
    pdf: 'pdf',
    word: 'document',
    excel: 'stats-bars',
    image: 'image',
    text: 'compose',
    ppt: 'slides'
  }
  return iconMap[fileType] || 'document'
}

function getFileColor(fileType) {
  const colorMap = {
    pdf: '#ef4444',
    word: '#3b82f6',
    excel: '#10b981',
    image: '#f59e0b',
    text: '#64748b',
    ppt: '#f97316'
  }
  return colorMap[fileType] || '#64748b'
}
</script>

<style lang="scss" scoped>
.knowledge {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
  min-height: 100vh;
  padding: 32rpx;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.knowledge__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24rpx;
}

.knowledge__title-section {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  flex: 1;
}

.knowledge__title {
  font-size: 48rpx;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.2;
}

.knowledge__subtitle {
  font-size: 28rpx;
  color: #64748b;
  line-height: 1.4;
}

.knowledge__content {
  display: flex;
  gap: 32rpx;
  flex: 1;
}

/* 面板通用样式 */
.knowledge__list-panel {
  width: 480rpx;
  min-width: 400rpx;
  background: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(15, 23, 42, 0.08);
  border: 1rpx solid #f1f5f9;
  display: flex;
  flex-direction: column;
}

.knowledge__files-panel {
  flex: 1;
  background: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(15, 23, 42, 0.08);
  border: 1rpx solid #f1f5f9;
  display: flex;
  flex-direction: column;
}

.knowledge__panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.knowledge__panel-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #0f172a;
}

.knowledge__panel-count,
.knowledge__files-count {
  font-size: 24rpx;
  color: #64748b;
}

.knowledge__files-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

/* 按钮样式 */
.knowledge__button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 0 24rpx;
  height: 72rpx;
  border-radius: 16rpx;
  font-size: 26rpx;
  font-weight: 600;
  border: none;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.knowledge__button:active {
  transform: translateY(2rpx);
}

.knowledge__button--primary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #ffffff;
  box-shadow: 0 4rpx 16rpx rgba(59, 130, 246, 0.3);
}

.knowledge__button--primary:active {
  box-shadow: 0 2rpx 8rpx rgba(59, 130, 246, 0.4);
}

.knowledge__button--upload {
  background: linear-gradient(135deg, #10b981, #059669);
  color: #ffffff;
  box-shadow: 0 4rpx 16rpx rgba(16, 185, 129, 0.3);
}

.knowledge__button--upload:active {
  box-shadow: 0 2rpx 8rpx rgba(16, 185, 129, 0.4);
}

.knowledge__button--upload:disabled {
  background: #cbd5e1;
  box-shadow: none;
  transform: none;
}

.knowledge__button--outline {
  background: transparent;
  color: #3b82f6;
  border: 2rpx solid #3b82f6;
}

.knowledge__button--outline:active {
  background: rgba(59, 130, 246, 0.1);
}

.knowledge__button--outline:disabled {
  color: #cbd5e1;
  border-color: #cbd5e1;
  transform: none;
}

/* 知识库列表样式 */
.knowledge__scroll {
  flex: 1;
}

.knowledge__item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 24rpx;
  border-radius: 16rpx;
  background: #f8fafc;
  border: 2rpx solid transparent;
  margin-bottom: 16rpx;
  transition: all 0.3s ease;
  position: relative;
}

.knowledge__item:active {
  transform: translateY(2rpx);
  background: #f1f5f9;
}

.knowledge__item--active {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(59, 130, 246, 0.04));
  border-color: #3b82f6;
  box-shadow: 0 4rpx 16rpx rgba(59, 130, 246, 0.12);
}

.knowledge__item--default::before {
  content: '';
  position: absolute;
  top: -2rpx;
  left: -2rpx;
  right: -2rpx;
  height: 4rpx;
  background: linear-gradient(90deg, #10b981, #3b82f6);
  border-radius: 16rpx 16rpx 0 0;
}

.knowledge__item-icon {
  width: 56rpx;
  height: 56rpx;
  border-radius: 12rpx;
  background: rgba(59, 130, 246, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.knowledge__item--active .knowledge__item-icon {
  background: rgba(59, 130, 246, 0.2);
}

.knowledge__item-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.knowledge__item-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.knowledge__item-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #0f172a;
}

.knowledge__item--active .knowledge__item-name {
  color: #3b82f6;
}

.knowledge__item-badge {
  font-size: 20rpx;
  padding: 4rpx 8rpx;
  border-radius: 6rpx;
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
  font-weight: 500;
}

.knowledge__item-desc {
  font-size: 24rpx;
  color: #64748b;
  line-height: 1.4;
}

.knowledge__item-stats {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.knowledge__item-stat {
  font-size: 22rpx;
  color: #94a3b8;
}

.knowledge__item-actions {
  display: flex;
  align-items: center;
  gap: 8rpx;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.knowledge__item:hover .knowledge__item-actions,
.knowledge__item:active .knowledge__item-actions {
  opacity: 1;
}

.knowledge__item-action {
  padding: 8rpx;
  border-radius: 8rpx;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.knowledge__item-action:active {
  background: #f1f5f9;
}

/* 文件列表样式 */
.knowledge__file-scroll {
  flex: 1;
}

.knowledge__file-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 24rpx;
  border-radius: 16rpx;
  background: #f8fafc;
  border: 1rpx solid #e2e8f0;
  margin-bottom: 12rpx;
  transition: all 0.2s ease;
}

.knowledge__file-item:active {
  background: #f1f5f9;
}

.knowledge__file-icon {
  width: 48rpx;
  height: 48rpx;
  border-radius: 12rpx;
  background: #ffffff;
  border: 1rpx solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.knowledge__file-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.knowledge__file-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #0f172a;
  line-height: 1.3;
}

.knowledge__file-meta {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.knowledge__file-size,
.knowledge__file-date {
  font-size: 24rpx;
  color: #64748b;
}

.knowledge__file-dot {
  font-size: 20rpx;
  color: #cbd5e1;
}

.knowledge__file-status {
  font-size: 22rpx;
  font-weight: 500;
  padding: 4rpx 8rpx;
  border-radius: 6rpx;
}

.knowledge__file-status--processed {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.knowledge__file-status--processing {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.knowledge__file-actions {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.knowledge__file-action {
  display: flex;
  align-items: center;
  gap: 4rpx;
  padding: 8rpx 12rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  color: #64748b;
  transition: all 0.2s ease;
}

.knowledge__file-action:active {
  background: #f1f5f9;
}

.knowledge__file-action:last-child {
  color: #ef4444;
}

/* 空状态样式 */
.knowledge__empty,
.knowledge__empty-files {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  padding: 80rpx 32rpx;
  color: #cbd5e1;
  text-align: center;
}

.knowledge__empty-text {
  font-size: 28rpx;
  color: #64748b;
  font-weight: 600;
}

.knowledge__empty-subtext {
  font-size: 24rpx;
  color: #94a3b8;
  line-height: 1.4;
}

/* 响应式设计 */
@media (max-width: 1023px) {
  .knowledge {
    padding: 24rpx;
    gap: 24rpx;
  }
  
  .knowledge__content {
    flex-direction: column;
  }
  
  .knowledge__list-panel {
    width: 90%;
    min-width: auto;
  }
  
  .knowledge__header {
    flex-direction: column;
    align-items: stretch;
    gap: 16rpx;
  }
  
  .knowledge__button {
    align-self: flex-start;
  }
}

/* 桌面端悬停效果 */
@media (min-width: 768px) {
  .knowledge__item:hover {
    transform: translateY(-2rpx);
    box-shadow: 0 8rpx 24rpx rgba(15, 23, 42, 0.12);
  }
  
  .knowledge__item:hover .knowledge__item-actions {
    opacity: 1;
  }
  
  .knowledge__file-item:hover {
    background: #f1f5f9;
    transform: translateY(-1rpx);
  }
  
  .knowledge__button--primary:hover {
    box-shadow: 0 6rpx 20rpx rgba(59, 130, 246, 0.4);
  }
  
  .knowledge__button--upload:hover {
    box-shadow: 0 6rpx 20rpx rgba(16, 185, 129, 0.4);
  }
  
  .knowledge__button--outline:hover {
    background: rgba(59, 130, 246, 0.1);
  }
  
  .knowledge__file-action:hover {
    background: #f1f5f9;
  }
}
</style>