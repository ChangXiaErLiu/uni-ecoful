<!-- 合规性审查界面 -->
<template>
  <AppLayout current="pages/compliance/index">
    <view class="compliance">
      <!-- 页面头部 -->
      <view class="compliance__header">
        <view class="compliance__title-section">
          <text class="compliance__title">合规性审查</text>
          <text class="compliance__subtitle">上传报告文档，系统将全面检查语义、政策引用、数据一致性等问题</text>
        </view>
      </view>

      <!-- 主要内容区域 -->
      <view class="compliance__content">
        <!-- 上传卡片 -->
        <view class="compliance__upload-card">
          <view class="compliance__section-header">
            <text class="compliance__section-title">上传待审查文档</text>
            <text class="compliance__section-tip">支持 PDF、Word、Excel 等格式</text>
          </view>
          
          <view class="compliance__dropzone" @tap="selectReport">
            <view class="compliance__dropzone-icon">
              <uni-icons type="cloud-upload" size="48" color="#3b82f6" />
            </view>
            <text class="compliance__dropzone-title">点击上传文档</text>
            <text class="compliance__dropzone-text">或将文件拖拽到此处</text>
          </view>

          <!-- 文件预览 -->
          <view v-if="reportFile" class="compliance__file-preview">
            <view class="compliance__file-info">
              <view class="compliance__file-icon">
                <uni-icons type="document" size="24" color="#3b82f6" />
              </view>
              <view class="compliance__file-details">
                <text class="compliance__file-name">{{ reportFile.name }}</text>
                <text class="compliance__file-meta">{{ reportFile.size }} • {{ reportFile.type }}</text>
              </view>
            </view>
            <view class="compliance__file-actions">
              <view class="compliance__file-action" @tap.stop="removeReport">
                <uni-icons type="trash" size="18" color="#ef4444" />
              </view>
            </view>
          </view>
        </view>

        <!-- 结果卡片 -->
        <view class="compliance__result-card">
          <view class="compliance__section-header">
            <text class="compliance__section-title">审查进度</text>
            <view class="compliance__status-indicator" :class="`compliance__status-indicator--${reviewStatus}`">
              {{ statusText }}
            </view>
          </view>

          <!-- 进度步骤 -->
          <view class="compliance__progress">
            <view 
              v-for="(step, index) in steps" 
              :key="step.id" 
              class="compliance__progress-item" 
              :class="`compliance__progress-item--${step.status}`"
            >
              <view class="compliance__progress-indicator">
                <view class="compliance__progress-dot">
                  <uni-icons v-if="step.status === 'completed'" type="checkmarkempty" size="14" color="#ffffff" />
                </view>
                <view v-if="index < steps.length - 1" class="compliance__progress-line"></view>
              </view>
              <view class="compliance__progress-content">
                <text class="compliance__progress-name">{{ step.name }}</text>
                <text class="compliance__progress-status">{{ step.statusLabel }}</text>
              </view>
            </view>
          </view>

          <!-- 操作按钮 -->
          <view class="compliance__actions">
            <button class="compliance__button compliance__button--secondary" @tap="resetReview">
              <uni-icons type="refresh" size="16" color="#64748b" />
              <text>重置</text>
            </button>
            <button class="compliance__button compliance__button--primary" @tap="startReview" :disabled="!reportFile">
              <uni-icons type="search" size="16" color="#ffffff" />
              <text>开始审查</text>
            </button>
          </view>

          <!-- 问题列表 -->
          <view class="compliance__issues">
            <view class="compliance__section-header">
              <text class="compliance__section-title">发现的问题</text>
              <text class="compliance__issues-count" v-if="issues.length > 0">{{ issues.length }} 个问题</text>
            </view>
            
            <scroll-view scroll-y class="compliance__issue-list" :style="{ maxHeight: issues.length > 0 ? '400rpx' : 'auto' }">
              <view v-if="issues.length > 0">
                <view 
                  v-for="issue in issues" 
                  :key="issue.id" 
                  class="compliance__issue-item"
                  :class="`compliance__issue-item--${issue.severity}`"
                >
                  <view class="compliance__issue-header">
                    <view class="compliance__issue-type-badge" :class="`compliance__issue-type-badge--${issue.type}`">
                      {{ getIssueTypeText(issue.type) }}
                    </view>
                    <text class="compliance__issue-location">{{ issue.location }}</text>
                  </view>
                  <text class="compliance__issue-desc">{{ issue.description }}</text>
                  <view class="compliance__issue-suggestion" v-if="issue.suggestion">
                    <text class="compliance__issue-suggestion-label">建议：</text>
                    <text class="compliance__issue-suggestion-text">{{ issue.suggestion }}</text>
                  </view>
                </view>
              </view>
              <view v-else class="compliance__empty-state">
                <uni-icons type="checkmarkcircle" size="48" color="#cbd5e1" />
                <text class="compliance__empty-text">暂无发现问题</text>
                <text class="compliance__empty-subtext">文档合规性良好</text>
              </view>
            </scroll-view>
          </view>

          <!-- 报告下载 -->
          <view v-if="reviewCompleted" class="compliance__report-section">
            <view class="compliance__section-header">
              <text class="compliance__section-title">审查报告</text>
            </view>
            <button class="compliance__download-button" @tap="downloadReport">
              <uni-icons type="download" size="20" color="#3b82f6" />
              <text>下载完整审查报告</text>
            </button>
          </view>
        </view>
      </view>
    </view>
  </AppLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'

import { onShow } from '@dcloudio/uni-app'
import { navTitleStore } from '@/stores/navTitle.js'

// 设置头部导航栏title
const navTitle = navTitleStore()
onShow(() => navTitle.setTitle('文档合规性审查'))

// 中文注释：合规审查页面展示上传、进度与结果列表的基本框架
const reportFile = ref(null)
const steps = ref([
  { id: 'analysis', name: '语义理解', status: 'pending', statusLabel: '待开始' },
  { id: 'policy', name: '政策引用检查', status: 'pending', statusLabel: '待开始' },
  { id: 'data', name: '数据一致性', status: 'pending', statusLabel: '待开始' },
  { id: 'summary', name: '报告生成', status: 'pending', statusLabel: '待开始' }
])
const issues = ref([
  { 
    id: 'issue-1', 
    type: 'logic', 
    severity: 'high',
    location: '第3章 结论部分',
    description: '结论部分与前文数据分析结果存在不一致',
    suggestion: '建议重新核对数据并调整结论表述'
  },
  { 
    id: 'issue-2', 
    type: 'policy', 
    severity: 'medium',
    location: '第2章 政策引用',
    description: '引用的《环境保护法》条文版本已过期',
    suggestion: '更新为最新版本的环境保护法相关条文'
  },
  { 
    id: 'issue-3', 
    type: 'format', 
    severity: 'low',
    location: '全文格式',
    description: '部分图表编号格式不符合规范要求',
    suggestion: '按照规范要求统一图表编号格式'
  }
])

// 计算属性
const reviewStatus = computed(() => {
  const completedSteps = steps.value.filter(step => step.status === 'completed').length
  if (completedSteps === 0) return 'idle'
  if (completedSteps === steps.value.length) return 'completed'
  return 'processing'
})

const statusText = computed(() => {
  switch (reviewStatus.value) {
    case 'idle': return '待开始'
    case 'processing': return '审查中'
    case 'completed': return '审查完成'
    default: return '待开始'
  }
})

const reviewCompleted = computed(() => reviewStatus.value === 'completed')

function selectReport() {
  console.log('选择需要审查的报告')
  // 模拟文件选择
  reportFile.value = {
    name: '环境影响评估报告.pdf',
    size: '2.8 MB',
    type: 'PDF文档'
  }
}

function removeReport() {
  reportFile.value = null
  resetReview()
}

function startReview() {
  console.log('启动合规审查流程')
  // 模拟审查流程
  steps.value.forEach((step, index) => {
    setTimeout(() => {
      step.status = 'active'
      step.statusLabel = '进行中'
      
      setTimeout(() => {
        step.status = 'completed'
        step.statusLabel = '已完成'
      }, 1500)
    }, index * 2000)
  })
}

function resetReview() {
  steps.value.forEach(step => {
    step.status = 'pending'
    step.statusLabel = '待开始'
  })
}

function downloadReport() {
  console.log('下载审查报告')
  uni.showToast({
    title: '报告下载中',
    icon: 'success'
  })
}

function getIssueTypeText(type) {
  const typeMap = {
    logic: '逻辑',
    policy: '政策',
    data: '数据',
    format: '格式',
    semantic: '语义'
  }
  return typeMap[type] || '其他'
}
</script>

<style lang="scss" scoped>
.compliance {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
  min-height: 100vh;
  padding: 32rpx;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.compliance__header {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.compliance__title-section {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.compliance__title {
  font-size: 48rpx;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.2;
}

.compliance__subtitle {
  font-size: 28rpx;
  color: #64748b;
  line-height: 1.4;
}

.compliance__content {
  display: flex;
  gap: 32rpx;
  flex: 1;
}

/* 上传卡片样式 */
.compliance__upload-card {
  flex: 1;
  background: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(15, 23, 42, 0.08);
  border: 1rpx solid #f1f5f9;
  max-width: 480rpx;
}

.compliance__result-card {
  flex: 2;
  background: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(15, 23, 42, 0.08);
  border: 1rpx solid #f1f5f9;
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.compliance__section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.compliance__section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #0f172a;
}

.compliance__section-tip,
.compliance__issues-count {
  font-size: 24rpx;
  color: #64748b;
}

/* 上传区域样式 */
.compliance__dropzone {
  border: 2rpx dashed #cbd5e1;
  border-radius: 24rpx;
  padding: 60rpx 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
  background: #fafafa;
  transition: all 0.3s ease;
  margin-top: 16rpx;
}

.compliance__dropzone:active {
  background: #f1f5f9;
  border-color: #3b82f6;
}

.compliance__dropzone-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: rgba(59, 130, 246, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.compliance__dropzone-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #0f172a;
}

.compliance__dropzone-text {
  font-size: 26rpx;
  color: #64748b;
  text-align: center;
}

/* 文件预览样式 */
.compliance__file-preview {
  margin-top: 24rpx;
  padding: 24rpx;
  border-radius: 16rpx;
  background: #f8fafc;
  border: 1rpx solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s ease;
}

.compliance__file-preview:active {
  background: #f1f5f9;
}

.compliance__file-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex: 1;
}

.compliance__file-icon {
  width: 48rpx;
  height: 48rpx;
  border-radius: 12rpx;
  background: rgba(59, 130, 246, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.compliance__file-details {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.compliance__file-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #0f172a;
}

.compliance__file-meta {
  font-size: 24rpx;
  color: #64748b;
}

.compliance__file-actions {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.compliance__file-action {
  padding: 12rpx;
  border-radius: 8rpx;
  transition: all 0.2s ease;
}

.compliance__file-action:active {
  background: #f1f5f9;
}

/* 状态指示器 */
.compliance__status-indicator {
  font-size: 24rpx;
  font-weight: 600;
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
}

.compliance__status-indicator--idle {
  background: #f1f5f9;
  color: #64748b;
}

.compliance__status-indicator--processing {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.compliance__status-indicator--completed {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

/* 进度步骤样式 */
.compliance__progress {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.compliance__progress-item {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
  padding: 32rpx 0;
  position: relative;
}

.compliance__progress-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  flex-shrink: 0;
}

.compliance__progress-dot {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  background: #e2e8f0;
  border: 4rpx solid #ffffff;
  box-shadow: 0 0 0 2rpx #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.compliance__progress-line {
  width: 2rpx;
  flex: 1;
  background: #e2e8f0;
  margin: 8rpx 0;
  transition: all 0.3s ease;
}

.compliance__progress-item--active .compliance__progress-dot {
  background: #3b82f6;
  box-shadow: 0 0 0 2rpx #3b82f6;
  animation: pulse 2s infinite;
}

.compliance__progress-item--completed .compliance__progress-dot {
  background: #10b981;
  box-shadow: 0 0 0 2rpx #10b981;
}

.compliance__progress-item--completed .compliance__progress-line {
  background: #10b981;
}

.compliance__progress-content {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  padding-top: 4rpx;
}

.compliance__progress-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #0f172a;
}

.compliance__progress-status {
  font-size: 24rpx;
  color: #64748b;
}

.compliance__progress-item--active .compliance__progress-name {
  color: #3b82f6;
}

.compliance__progress-item--completed .compliance__progress-name {
  color: #10b981;
}

.compliance__progress-item--completed .compliance__progress-status {
  color: #10b981;
}

/* 操作按钮样式 */
.compliance__actions {
  display: flex;
  justify-content: flex-end;
  gap: 20rpx;
}

.compliance__button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 0 40rpx;
  height: 88rpx;
  border-radius: 20rpx;
  font-size: 28rpx;
  font-weight: 600;
  border: none;
  transition: all 0.3s ease;
}

.compliance__button:active {
  transform: translateY(2rpx);
}

.compliance__button--primary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #ffffff;
  box-shadow: 0 4rpx 20rpx rgba(59, 130, 246, 0.3);
}

.compliance__button--primary:active {
  box-shadow: 0 2rpx 12rpx rgba(59, 130, 246, 0.4);
}

.compliance__button--primary:disabled {
  background: #cbd5e1;
  box-shadow: none;
  transform: none;
}

.compliance__button--secondary {
  background: #ffffff;
  color: #64748b;
  border: 2rpx solid #e2e8f0;
}

.compliance__button--secondary:active {
  background: #f8fafc;
}

/* 问题列表样式 */
.compliance__issues {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.compliance__issue-list {
  border-radius: 16rpx;
  background: #f8fafc;
  padding: 0;
}

.compliance__issue-item {
  padding: 24rpx;
  border-bottom: 1rpx solid #e2e8f0;
  transition: all 0.2s ease;
}

.compliance__issue-item:active {
  background: #f1f5f9;
}

.compliance__issue-item:last-child {
  border-bottom: none;
}

.compliance__issue-item--high {
  border-left: 4rpx solid #ef4444;
}

.compliance__issue-item--medium {
  border-left: 4rpx solid #f59e0b;
}

.compliance__issue-item--low {
  border-left: 4rpx solid #3b82f6;
}

.compliance__issue-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.compliance__issue-type-badge {
  font-size: 22rpx;
  font-weight: 600;
  padding: 6rpx 12rpx;
  border-radius: 6rpx;
}

.compliance__issue-type-badge--logic {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.compliance__issue-type-badge--policy {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}

.compliance__issue-type-badge--data {
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
}

.compliance__issue-type-badge--format {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
}

.compliance__issue-type-badge--semantic {
  background: rgba(139, 92, 246, 0.1);
  color: #7c3aed;
}

.compliance__issue-location {
  font-size: 24rpx;
  color: #64748b;
}

.compliance__issue-desc {
  font-size: 28rpx;
  color: #0f172a;
  line-height: 1.5;
  margin-bottom: 12rpx;
  display: block;
}

.compliance__issue-suggestion {
  display: flex;
  gap: 8rpx;
  padding: 16rpx;
  background: rgba(16, 185, 129, 0.05);
  border-radius: 8rpx;
  border-left: 4rpx solid #10b981;
}

.compliance__issue-suggestion-label {
  font-size: 24rpx;
  font-weight: 600;
  color: #059669;
  flex-shrink: 0;
}

.compliance__issue-suggestion-text {
  font-size: 24rpx;
  color: #059669;
  line-height: 1.4;
}

/* 空状态样式 */
.compliance__empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  padding: 80rpx 32rpx;
  color: #cbd5e1;
}

.compliance__empty-text {
  font-size: 28rpx;
  color: #64748b;
  font-weight: 600;
}

.compliance__empty-subtext {
  font-size: 24rpx;
  color: #94a3b8;
}

/* 报告下载区域 */
.compliance__report-section {
  padding-top: 24rpx;
  border-top: 1rpx solid #f1f5f9;
}

.compliance__download-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  width: 100%;
  height: 88rpx;
  background: rgba(59, 130, 246, 0.1);
  border: 2rpx dashed #3b82f6;
  border-radius: 16rpx;
  color: #3b82f6;
  font-size: 28rpx;
  font-weight: 600;
  transition: all 0.3s ease;
}

.compliance__download-button:active {
  background: rgba(59, 130, 246, 0.2);
}

/* 动画 */
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10rpx rgba(59, 130, 246, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
  }
}

/* 响应式设计 */
@media (max-width: 1023px) {
  .compliance {
    padding: 24rpx;
    gap: 24rpx;
  }
  
  .compliance__content {
    flex-direction: column;
  }
  
  .compliance__upload-card {
    max-width: none;
  }
  
  .compliance__result-card {
    gap: 24rpx;
  }
}

/* 桌面端悬停效果 */
@media (min-width: 768px) {
  .compliance__dropzone:hover {
    border-color: #3b82f6;
    background: #f8fafc;
  }
  
  .compliance__file-preview:hover {
    background: #f1f5f9;
  }
  
  .compliance__button--primary:hover {
    box-shadow: 0 6rpx 24rpx rgba(59, 130, 246, 0.4);
  }
  
  .compliance__button--secondary:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
  }
  
  .compliance__issue-item:hover {
    background: #f1f5f9;
  }
  
  .compliance__download-button:hover {
    background: rgba(59, 130, 246, 0.2);
  }
}
</style>