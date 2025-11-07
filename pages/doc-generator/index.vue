<!-- 报告生成界面 -->
<template>
  <AppLayout current="pages/doc-generator/index">
    <view class="doc-generator">
      <view class="doc-generator__header">
        <view class="doc-generator__title-section">
          <text class="doc-generator__title">文档智能生成</text>
          <text class="doc-generator__subtitle">选择模板并上传资料，系统将自动整理为结构化报告</text>
        </view>
      </view>
      
      <view class="doc-generator__content" :class="layoutClass">
        <!-- 左侧模板选择 -->
        <view class="doc-generator__left-panel">
          <view class="doc-generator__section">
            <view class="doc-generator__section-header">
              <text class="doc-generator__section-title">行业模板</text>
              <text class="doc-generator__section-count">{{ templates.length }} 个模板</text>
            </view>
            <scroll-view class="doc-generator__template-list" scroll-y>
              <view 
                v-for="template in templates" 
                :key="template.id" 
                class="doc-generator__template" 
                :class="{ 
                  'doc-generator__template--active': template.id === activeTemplateId,
                  'doc-generator__template--recommended': template.recommended
                }" 
                @tap="() => selectTemplate(template.id)"
              >
                <view class="doc-generator__template-icon">
                  <uni-icons :type="template.icon || 'compose'" size="24" :color="template.id === activeTemplateId ? '#3b82f6' : '#64748b'" />
                </view>
                <view class="doc-generator__template-content">
                  <view class="doc-generator__template-header">
                    <text class="doc-generator__template-name">{{ template.name }}</text>
                    <view v-if="template.recommended" class="doc-generator__template-badge">推荐</view>
                  </view>
                  <text class="doc-generator__template-desc">{{ template.description }}</text>
                </view>
                <view class="doc-generator__template-check">
                  <view v-if="template.id === activeTemplateId" class="doc-generator__template-checked">
                    <uni-icons type="checkmarkempty" size="20" color="#3b82f6" />
                  </view>
                </view>
              </view>
            </scroll-view>
          </view>
        </view>

        <!-- 右侧主要内容 -->
        <view class="doc-generator__main-panel">
          <!-- 上传资料区域 -->
          <view class="doc-generator__section">
            <view class="doc-generator__section-header">
              <text class="doc-generator__section-title">上传资料</text>
              <text class="doc-generator__section-tip">最多支持10个文件</text>
            </view>
            
            <view class="doc-generator__uploader" @tap="pickFiles">
              <view class="doc-generator__uploader-icon">
                <uni-icons type="cloud-upload" size="48" color="#3b82f6" />
              </view>
              <text class="doc-generator__uploader-title">点击上传文件</text>
              <text class="doc-generator__uploader-text">支持 PDF、Word、图片、表格、Markdown 等格式</text>
            </view>

            <!-- 文件列表 -->
            <view v-if="files.length > 0" class="doc-generator__file-list">
              <view v-for="file in files" :key="file.id" class="doc-generator__file-item">
                <view class="doc-generator__file-info">
                  <view class="doc-generator__file-icon">
                    <uni-icons :type="getFileIcon(file.type)" size="20" color="#64748b" />
                  </view>
                  <view class="doc-generator__file-details">
                    <text class="doc-generator__file-name">{{ file.name }}</text>
                    <text class="doc-generator__file-size">{{ file.size }}</text>
                  </view>
                </view>
                <view class="doc-generator__file-actions">
                  <text class="doc-generator__file-status" :class="`doc-generator__file-status--${file.status}`">
                    {{ file.statusLabel }}
                  </text>
                  <view class="doc-generator__file-action" @tap.stop="() => removeFile(file.id)">
                    <uni-icons type="trash" size="18" color="#94a3b8" />
                  </view>
                </view>
              </view>
            </view>
          </view>

          <!-- 生成进度 -->
          <view class="doc-generator__section">
            <view class="doc-generator__section-header">
              <text class="doc-generator__section-title">生成进度</text>
            </view>
            
            <view class="doc-generator__steps">
              <view 
                v-for="(step, index) in steps" 
                :key="step.id" 
                class="doc-generator__step" 
                :class="`doc-generator__step--${step.status}`"
              >
                <view class="doc-generator__step-indicator">
                  <view class="doc-generator__step-dot"></view>
                  <view v-if="index < steps.length - 1" class="doc-generator__step-line"></view>
                </view>
                <view class="doc-generator__step-content">
                  <text class="doc-generator__step-name">{{ step.name }}</text>
                  <text class="doc-generator__step-status">{{ step.statusLabel }}</text>
                </view>
              </view>
            </view>
          </view>

          <!-- 操作按钮 -->
          <view class="doc-generator__actions">
            <button class="doc-generator__button doc-generator__button--secondary" @tap="reset">
              <uni-icons type="refresh" size="16" color="#64748b" />
              <text>重置</text>
            </button>
            <button class="doc-generator__button doc-generator__button--primary" @tap="generate" :disabled="!canGenerate">
              <uni-icons type="paperplane" size="16" color="#ffffff" />
              <text>开始生成</text>
            </button>
          </view>
        </view>
      </view>
    </view>
  </AppLayout>
</template>

<script setup>
import { computed, ref } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import { usePlatformInfo } from '@/utils/platform'

import { onShow } from '@dcloudio/uni-app'
import { navTitleStore } from '@/stores/navTitle.js'

// 设置头部导航栏title
const navTitle = navTitleStore()
onShow(() => navTitle.setTitle('文档智能生成'))

// 中文注释：该页面提供模板选择、文件上传、生成进度的初步布局
const { isMobile } = usePlatformInfo()
const templates = ref([
  { 
    id: 'finance', 
    name: '金融行业-投研报告', 
    description: '适用于证券、基金投研场景',
    icon: 'stats-bars',
    recommended: true
  },
  { 
    id: 'manufacture', 
    name: '制造业-周报模板', 
    description: '适用于生产运营周报输出',
    icon: 'gear'
  },
  { 
    id: 'environment', 
    name: '环保监测报告', 
    description: '环境监测数据分析报告',
    icon: 'map'
  },
  { 
    id: 'project', 
    name: '项目总结报告', 
    description: '项目阶段性总结汇报',
    icon: 'flag'
  }
])
const activeTemplateId = ref(templates.value[0]?.id || '')
const files = ref([])
const steps = ref([
  { id: 'upload', name: '资料校验', status: 'pending', statusLabel: '待开始' },
  { id: 'extract', name: '信息抽取', status: 'pending', statusLabel: '待开始' },
  { id: 'compose', name: '模板填充', status: 'pending', statusLabel: '待开始' },
  { id: 'review', name: '生成完成', status: 'pending', statusLabel: '待开始' }
])

const layoutClass = computed(() => (isMobile.value ? 'doc-generator--mobile' : ''))
const canGenerate = computed(() => files.value.length > 0)

function selectTemplate(id) {
  activeTemplateId.value = id
}

function pickFiles() {
  console.log('选择文件上传')
  // 模拟文件上传
  files.value.push({
    id: Date.now(),
    name: '示例文档.pdf',
    type: 'pdf',
    size: '2.4 MB',
    status: 'success',
    statusLabel: '上传成功'
  })
}

function removeFile(id) {
  files.value = files.value.filter(file => file.id !== id)
}

function reset() {
  files.value = []
  steps.value.forEach(step => {
    step.status = 'pending'
    step.statusLabel = '待开始'
  })
}

function generate() {
  console.log('开始生成文档')
  // 模拟生成进度
  steps.value[0].status = 'active'
  steps.value[0].statusLabel = '进行中'
}

function getFileIcon(fileType) {
  const iconMap = {
    pdf: 'pdf',
    word: 'document',
    image: 'image',
    excel: 'stats-bars',
    markdown: 'compose'
  }
  return iconMap[fileType] || 'document'
}
</script>

<style lang="scss" scoped>
.doc-generator {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
  min-height: 100vh;
  padding: 32rpx;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.doc-generator__header {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.doc-generator__title-section {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.doc-generator__title {
  font-size: 48rpx;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.2;
}

.doc-generator__subtitle {
  font-size: 28rpx;
  color: #64748b;
  line-height: 1.4;
}

.doc-generator__content {
  display: flex;
  gap: 32rpx;
  flex: 1;
}

.doc-generator__left-panel {
  width: 480rpx;
  min-width: 400rpx;
  background: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(15, 23, 42, 0.08);
  border: 1rpx solid #f1f5f9;
}

.doc-generator__main-panel {
  flex: 1;
  background: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(15, 23, 42, 0.08);
  border: 1rpx solid #f1f5f9;
  display: flex;
  flex-direction: column;
  gap: 40rpx;
}

.doc-generator__section {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.doc-generator__section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.doc-generator__section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #0f172a;
}

.doc-generator__section-count,
.doc-generator__section-tip {
  font-size: 24rpx;
  color: #64748b;
}

/* 模板列表样式 */
.doc-generator__template-list {
  max-height: 600rpx;
}

.doc-generator__template {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 28rpx 24rpx;
  margin-bottom: 16rpx;
  border-radius: 20rpx;
  background: #f8fafc;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;
  position: relative;
}

.doc-generator__template:active {
  transform: translateY(2rpx);
}

.doc-generator__template--active {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(59, 130, 246, 0.04));
  border-color: #3b82f6;
  box-shadow: 0 4rpx 20rpx rgba(59, 130, 246, 0.12);
}

.doc-generator__template--recommended::before {
  content: '';
  position: absolute;
  top: -2rpx;
  left: -2rpx;
  right: -2rpx;
  height: 4rpx;
  background: linear-gradient(90deg, #10b981, #3b82f6);
  border-radius: 20rpx 20rpx 0 0;
}

.doc-generator__template-icon {
  width: 56rpx;
  height: 56rpx;
  border-radius: 16rpx;
  background: rgba(59, 130, 246, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.doc-generator__template--active .doc-generator__template-icon {
  background: rgba(59, 130, 246, 0.2);
}

.doc-generator__template-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.doc-generator__template-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.doc-generator__template-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #0f172a;
}

.doc-generator__template--active .doc-generator__template-name {
  color: #3b82f6;
}

.doc-generator__template-badge {
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #ffffff;
  font-weight: 500;
}

.doc-generator__template-desc {
  font-size: 24rpx;
  color: #64748b;
  line-height: 1.4;
}

.doc-generator__template-checked {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  background: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 上传区域样式 */
.doc-generator__uploader {
  border: 2rpx dashed #cbd5e1;
  border-radius: 24rpx;
  padding: 60rpx 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
  background: #fafafa;
  transition: all 0.3s ease;
}

.doc-generator__uploader:active {
  background: #f1f5f9;
  border-color: #3b82f6;
}

.doc-generator__uploader-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: rgba(59, 130, 246, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.doc-generator__uploader-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #0f172a;
}

.doc-generator__uploader-text {
  font-size: 26rpx;
  color: #64748b;
  text-align: center;
  line-height: 1.5;
}

/* 文件列表样式 */
.doc-generator__file-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.doc-generator__file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  background: #f8fafc;
  border-radius: 16rpx;
  border: 1rpx solid #e2e8f0;
  transition: all 0.2s ease;
}

.doc-generator__file-item:active {
  background: #f1f5f9;
}

.doc-generator__file-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex: 1;
}

.doc-generator__file-icon {
  width: 48rpx;
  height: 48rpx;
  border-radius: 12rpx;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1rpx solid #e2e8f0;
}

.doc-generator__file-details {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.doc-generator__file-name {
  font-size: 28rpx;
  font-weight: 500;
  color: #0f172a;
}

.doc-generator__file-size {
  font-size: 24rpx;
  color: #64748b;
}

.doc-generator__file-actions {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.doc-generator__file-status {
  font-size: 24rpx;
  font-weight: 500;
  padding: 6rpx 12rpx;
  border-radius: 6rpx;
}

.doc-generator__file-status--success {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.doc-generator__file-status--uploading {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.doc-generator__file-action {
  padding: 8rpx;
  border-radius: 8rpx;
  transition: all 0.2s ease;
}

.doc-generator__file-action:active {
  background: #f1f5f9;
}

/* 步骤进度样式 */
.doc-generator__steps {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.doc-generator__step {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
  padding: 32rpx 0;
  position: relative;
}

.doc-generator__step-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  flex-shrink: 0;
}

.doc-generator__step-dot {
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  background: #e2e8f0;
  border: 4rpx solid #ffffff;
  box-shadow: 0 0 0 2rpx #e2e8f0;
  transition: all 0.3s ease;
}

.doc-generator__step-line {
  width: 2rpx;
  flex: 1;
  background: #e2e8f0;
  margin: 8rpx 0;
  transition: all 0.3s ease;
}

.doc-generator__step--active .doc-generator__step-dot {
  background: #3b82f6;
  box-shadow: 0 0 0 2rpx #3b82f6;
}

.doc-generator__step--completed .doc-generator__step-dot {
  background: #10b981;
  box-shadow: 0 0 0 2rpx #10b981;
}

.doc-generator__step--completed .doc-generator__step-line {
  background: #10b981;
}

.doc-generator__step-content {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  padding-top: 4rpx;
}

.doc-generator__step-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #0f172a;
}

.doc-generator__step-status {
  font-size: 24rpx;
  color: #64748b;
}

.doc-generator__step--active .doc-generator__step-name {
  color: #3b82f6;
}

.doc-generator__step--completed .doc-generator__step-name {
  color: #10b981;
}

.doc-generator__step--completed .doc-generator__step-status {
  color: #10b981;
}

/* 操作按钮样式 */
.doc-generator__actions {
  display: flex;
  justify-content: flex-end;
  gap: 20rpx;
  margin-top: auto;
  padding-top: 32rpx;
  border-top: 1rpx solid #f1f5f9;
}

.doc-generator__button {
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

.doc-generator__button:active {
  transform: translateY(2rpx);
}

.doc-generator__button--primary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #ffffff;
  box-shadow: 0 4rpx 20rpx rgba(59, 130, 246, 0.3);
}

.doc-generator__button--primary:active {
  box-shadow: 0 2rpx 12rpx rgba(59, 130, 246, 0.4);
}

.doc-generator__button--primary:disabled {
  background: #cbd5e1;
  box-shadow: none;
  transform: none;
}

.doc-generator__button--secondary {
  background: #ffffff;
  color: #64748b;
  border: 2rpx solid #e2e8f0;
}

.doc-generator__button--secondary:active {
  background: #f8fafc;
}

/* 响应式设计 */
@media (max-width: 1023px) {
  .doc-generator {
    padding: 24rpx;
    gap: 24rpx;
  }
  
  .doc-generator__content {
    flex-direction: column;
  }
  
  .doc-generator__left-panel {
    width: 100%;
    min-width: auto;
  }
  
  .doc-generator__main-panel {
    gap: 32rpx;
  }
  
  .doc-generator__template-list {
    max-height: 400rpx;
  }
}

/* 桌面端悬停效果 */
@media (min-width: 768px) {
  .doc-generator__template:hover {
    transform: translateY(-2rpx);
    box-shadow: 0 8rpx 24rpx rgba(15, 23, 42, 0.12);
  }
  
  .doc-generator__uploader:hover {
    border-color: #3b82f6;
    background: #f8fafc;
  }
  
  .doc-generator__file-item:hover {
    background: #f1f5f9;
  }
  
  .doc-generator__button--primary:hover {
    box-shadow: 0 6rpx 24rpx rgba(59, 130, 246, 0.4);
  }
  
  .doc-generator__button--secondary:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
  }
}
</style>