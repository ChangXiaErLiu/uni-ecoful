<!-- 现场踏查管理页面 -->
<template>
  <AppLayout current="pages/investigation/index">
    <view class="investigation">
      <!-- 页面头部 -->
      <view class="investigation__header">
        <view class="investigation__title-section">
          <text class="investigation__title">现场踏查管理</text>
          <text class="investigation__subtitle">记录现场环境状况，发现并及时处理环境问题</text>
        </view>
        <view class="investigation__header-actions">
          <button class="investigation__button investigation__button--secondary" @tap="syncData">
            <uni-icons type="refresh" size="16" color="#3b82f6" />
            <text>同步数据</text>
          </button>
          <button class="investigation__button investigation__button--primary" @tap="startNewInvestigation">
            <uni-icons type="plus" size="16" color="#ffffff" />
            <text>开始踏查</text>
          </button>
        </view>
      </view>

      <!-- 统计卡片 -->
      <view class="investigation__stats">
        <view class="investigation__stat-card">
          <view class="investigation__stat-icon" style="background: rgba(59, 130, 246, 0.1);">
            <uni-icons type="location" size="24" color="#3b82f6" />
          </view>
          <view class="investigation__stat-content">
            <text class="investigation__stat-value">{{ stats.totalInvestigations }}</text>
            <text class="investigation__stat-label">踏查总数</text>
          </view>
        </view>
        <view class="investigation__stat-card">
          <view class="investigation__stat-icon" style="background: rgba(16, 185, 129, 0.1);">
            <uni-icons type="checkmark" size="24" color="#10b981" />
          </view>
          <view class="investigation__stat-content">
            <text class="investigation__stat-value">{{ stats.completedInvestigations }}</text>
            <text class="investigation__stat-label">已完成</text>
          </view>
        </view>
        <view class="investigation__stat-card">
          <view class="investigation__stat-icon" style="background: rgba(245, 158, 11, 0.1);">
            <uni-icons type="clock" size="24" color="#f59e0b" />
          </view>
          <view class="investigation__stat-content">
            <text class="investigation__stat-value">{{ stats.inProgressInvestigations }}</text>
            <text class="investigation__stat-label">进行中</text>
          </view>
        </view>
        <view class="investigation__stat-card">
          <view class="investigation__stat-icon" style="background: rgba(239, 68, 68, 0.1);">
            <uni-icons type="info" size="24" color="#ef4444" />
          </view>
          <view class="investigation__stat-content">
            <text class="investigation__stat-value">{{ stats.issuesFound }}</text>
            <text class="investigation__stat-label">发现问题</text>
          </view>
        </view>
      </view>

      <!-- 主要内容区域 -->
      <view class="investigation__content">
        <!-- 左侧踏查点位列表 -->
        <view class="investigation__points-panel">
          <view class="investigation__panel-header">
            <text class="investigation__panel-title">踏查点位</text>
            <button class="investigation__button investigation__button--outline" @tap="addPoint">
              <uni-icons type="plus" size="14" color="#3b82f6" />
              <text>添加点位</text>
            </button>
          </view>
          
          <scroll-view scroll-y class="investigation__scroll">
            <view
              v-for="point in investigationPoints"
              :key="point.id"
              class="investigation__point-item"
              :class="{ 
                'investigation__point-item--active': point.id === activePointId,
                'investigation__point-item--completed': point.status === 'completed'
              }"
              @tap="() => switchPoint(point.id)"
            >
              <view class="investigation__point-marker" :style="{ backgroundColor: getPointColor(point.status) }">
                <uni-icons :type="getPointIcon(point.type)" size="16" color="#ffffff" />
              </view>
              <view class="investigation__point-content">
                <view class="investigation__point-header">
                  <text class="investigation__point-name">{{ point.name }}</text>
                  <view class="investigation__point-badge" :class="`investigation__point-badge--${point.status}`">
                    {{ getPointStatusText(point.status) }}
                  </view>
                </view>
                <text class="investigation__point-desc">{{ point.description }}</text>
                <view class="investigation__point-meta">
                  <view class="investigation__point-meta-item">
                    <uni-icons type="person" size="12" color="#94a3b8" />
                    <text class="investigation__point-meta-text">{{ point.inspector }}</text>
                  </view>
                  <view class="investigation__point-meta-item">
                    <uni-icons type="calendar" size="12" color="#94a3b8" />
                    <text class="investigation__point-meta-text">{{ point.investigationDate }}</text>
                  </view>
                </view>
              </view>
              <view class="investigation__point-actions">
                <view class="investigation__point-action" @tap.stop="() => navigateToPoint(point)">
                  <uni-icons type="navigate" size="16" color="#3b82f6" />
                </view>
              </view>
            </view>
            
            <!-- 空状态 -->
            <view v-if="investigationPoints.length === 0" class="investigation__empty">
              <uni-icons type="location" size="60" color="#cbd5e1" />
              <text class="investigation__empty-text">暂无踏查点位</text>
              <text class="investigation__empty-subtext">点击添加点位开始踏查</text>
            </view>
          </scroll-view>
        </view>

        <!-- 右侧踏查详情 -->
        <view class="investigation__detail-panel">
          <view class="investigation__panel-header">
            <view class="investigation__detail-header">
              <text class="investigation__panel-title">踏查详情</text>
              <text class="investigation__detail-status" v-if="activePoint">
                {{ getPointStatusText(activePoint.status) }}
              </text>
            </view>
            <view class="investigation__detail-actions">
              <button class="investigation__button investigation__button--outline" @tap="takePhoto" :disabled="!activePoint">
                <uni-icons type="camera" size="16" color="#64748b" />
                <text>拍照</text>
              </button>
              <button class="investigation__button investigation__button--primary" @tap="recordFinding" :disabled="!activePoint">
                <uni-icons type="compose" size="16" color="#ffffff" />
                <text>记录问题</text>
              </button>
            </view>
          </view>

          <scroll-view scroll-y class="investigation__detail-scroll">
            <view v-if="activePoint" class="investigation__detail-content">
              <!-- 基本信息 -->
              <view class="investigation__section">
                <view class="investigation__section-header">
                  <uni-icons type="info" size="18" color="#3b82f6" />
                  <text class="investigation__section-title">点位信息</text>
                </view>
                <view class="investigation__info-grid">
                  <view class="investigation__info-item">
                    <text class="investigation__info-label">点位名称</text>
                    <text class="investigation__info-value">{{ activePoint.name }}</text>
                  </view>
                  <view class="investigation__info-item">
                    <text class="investigation__info-label">坐标位置</text>
                    <text class="investigation__info-value">{{ activePoint.coordinates }}</text>
                  </view>
                  <view class="investigation__info-item">
                    <text class="investigation__info-label">踏查人员</text>
                    <text class="investigation__info-value">{{ activePoint.inspector }}</text>
                  </view>
                  <view class="investigation__info-item">
                    <text class="investigation__info-label">踏查时间</text>
                    <text class="investigation__info-value">{{ activePoint.investigationDate }}</text>
                  </view>
                </view>
              </view>

              <!-- 环境状况 -->
              <view class="investigation__section">
                <view class="investigation__section-header">
                  <uni-icons type="eye" size="18" color="#10b981" />
                  <text class="investigation__section-title">环境状况</text>
                </view>
                <view class="investigation__environment-list">
                  <view 
                    v-for="item in activePoint.environmentConditions" 
                    :key="item.id"
                    class="investigation__environment-item"
                  >
                    <view class="investigation__environment-icon">
                      <uni-icons :type="item.icon" size="16" :color="item.status === 'normal' ? '#10b981' : '#ef4444'" />
                    </view>
                    <text class="investigation__environment-name">{{ item.name }}</text>
                    <view class="investigation__environment-status" :class="`investigation__environment-status--${item.status}`">
                      {{ item.status === 'normal' ? '正常' : '异常' }}
                    </view>
                  </view>
                </view>
              </view>

              <!-- 现场照片 -->
              <view class="investigation__section">
                <view class="investigation__section-header">
                  <uni-icons type="image" size="18" color="#f59e0b" />
                  <text class="investigation__section-title">现场照片</text>
                  <text class="investigation__section-count">{{ activePoint.photos?.length || 0 }} 张</text>
                </view>
                <scroll-view scroll-x class="investigation__photos-scroll">
                  <view class="investigation__photos-list">
                    <view 
                      v-for="(photo, index) in activePoint.photos" 
                      :key="index"
                      class="investigation__photo-item"
                      @tap="() => previewPhoto(photo)"
                    >
                      <image :src="photo.thumbnail" class="investigation__photo-image" mode="aspectFill" />
                      <text class="investigation__photo-time">{{ photo.time }}</text>
                    </view>
                    <view class="investigation__photo-upload" @tap="takePhoto">
                      <uni-icons type="plus" size="24" color="#cbd5e1" />
                      <text class="investigation__photo-upload-text">添加照片</text>
                    </view>
                  </view>
                </scroll-view>
              </view>

              <!-- 发现问题 -->
              <view class="investigation__section">
                <view class="investigation__section-header">
                  <uni-icons type="flag" size="18" color="#ef4444" />
                  <text class="investigation__section-title">发现问题</text>
                  <text class="investigation__section-count">{{ activePoint.findings?.length || 0 }} 个</text>
                </view>
                <view v-if="activePoint.findings && activePoint.findings.length > 0" class="investigation__findings-list">
                  <view 
                    v-for="finding in activePoint.findings" 
                    :key="finding.id"
                    class="investigation__finding-item"
                    :class="`investigation__finding-item--${finding.severity}`"
                  >
                    <view class="investigation__finding-header">
                      <text class="investigation__finding-title">{{ finding.title }}</text>
                      <view class="investigation__finding-severity" :class="`investigation__finding-severity--${finding.severity}`">
                        {{ getSeverityText(finding.severity) }}
                      </view>
                    </view>
                    <text class="investigation__finding-desc">{{ finding.description }}</text>
                    <view class="investigation__finding-meta">
                      <text class="investigation__finding-time">{{ finding.recordTime }}</text>
                      <text class="investigation__finding-action" @tap="() => resolveFinding(finding.id)">标记处理</text>
                    </view>
                  </view>
                </view>
                <view v-else class="investigation__empty-section">
                  <uni-icons type="checkmark" size="32" color="#cbd5e1" />
                  <text class="investigation__empty-section-text">未发现问题</text>
                </view>
              </view>
            </view>
            
            <!-- 空状态 -->
            <view v-else class="investigation__empty-detail">
              <uni-icons type="map" size="60" color="#cbd5e1" />
              <text class="investigation__empty-text">请选择踏查点位</text>
              <text class="investigation__empty-subtext">点击左侧点位查看详情</text>
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
onShow(() => navTitle.setTitle('现场踏查管理'))

// 统计数据
const stats = ref({
  totalInvestigations: 24,
  completedInvestigations: 16,
  inProgressInvestigations: 5,
  issuesFound: 8
})

// 踏查点位数据
const investigationPoints = ref([
  {
    id: 'point-1',
    name: '废水处理站',
    description: '厂区废水处理设施及排放口',
    type: 'water',
    status: 'completed',
    inspector: '张三',
    investigationDate: '2024-01-15 09:30',
    coordinates: '23.135°N, 113.264°E',
    environmentConditions: [
      { id: 'cond-1', name: '废水处理设施', icon: 'gear', status: 'normal' },
      { id: 'cond-2', name: '排放口水质', icon: 'water', status: 'normal' },
      { id: 'cond-3', name: '设备运行', icon: 'settings', status: 'normal' }
    ],
    photos: [
      { thumbnail: '/static/sample/photo1.jpg', time: '09:35', fullImage: '/static/sample/photo1.jpg' },
      { thumbnail: '/static/sample/photo2.jpg', time: '09:40', fullImage: '/static/sample/photo2.jpg' }
    ],
    findings: []
  },
  {
    id: 'point-2',
    name: '危废暂存间',
    description: '危险废物分类存放区域',
    type: 'waste',
    status: 'in-progress',
    inspector: '李四',
    investigationDate: '2024-01-16 10:15',
    coordinates: '23.136°N, 113.265°E',
    environmentConditions: [
      { id: 'cond-4', name: '危废标识', icon: 'flag', status: 'normal' },
      { id: 'cond-5', name: '分类存放', icon: 'folder', status: 'abnormal' },
      { id: 'cond-6', name: '防渗措施', icon: 'shield', status: 'normal' }
    ],
    photos: [
      { thumbnail: '/static/sample/photo3.jpg', time: '10:20', fullImage: '/static/sample/photo3.jpg' }
    ],
    findings: [
      {
        id: 'finding-1',
        title: '危废分类不规范',
        description: '部分危险废物未按规定分类存放，存在混放现象',
        severity: 'medium',
        recordTime: '10:25',
        resolved: false
      }
    ]
  },
  {
    id: 'point-3',
    name: '锅炉房',
    description: '生产用锅炉及废气处理设施',
    type: 'air',
    status: 'pending',
    inspector: '王五',
    investigationDate: '2024-01-17 14:00',
    coordinates: '23.137°N, 113.266°E',
    environmentConditions: [
      { id: 'cond-7', name: '废气处理', icon: 'cloudy', status: 'pending' },
      { id: 'cond-8', name: '设备运行', icon: 'gear', status: 'pending' }
    ],
    photos: [],
    findings: []
  },
  {
    id: 'point-4',
    name: '原料仓库',
    description: '化学品原料存储区域',
    type: 'chemical',
    status: 'completed',
    inspector: '赵六',
    investigationDate: '2024-01-14 11:20',
    coordinates: '23.138°N, 113.267°E',
    environmentConditions: [
      { id: 'cond-9', name: '防泄漏措施', icon: 'shield', status: 'normal' },
      { id: 'cond-10', name: '消防设施', icon: 'fire', status: 'normal' }
    ],
    photos: [
      { thumbnail: '/static/sample/photo4.jpg', time: '11:25', fullImage: '/static/sample/photo4.jpg' }
    ],
    findings: [
      {
        id: 'finding-2',
        title: '消防器材检查过期',
        description: '部分灭火器检查标签已过期，需及时更换',
        severity: 'high',
        recordTime: '11:30',
        resolved: true
      }
    ]
  }
])

const activePointId = ref('point-1')

const activePoint = computed(() => 
  investigationPoints.value.find(point => point.id === activePointId.value)
)

function switchPoint(pointId) {
  activePointId.value = pointId
}

function startNewInvestigation() {
  uni.showToast({
    title: '开始新的踏查任务',
    icon: 'none'
  })
}

function addPoint() {
  const newPoint = {
    id: 'point-new-' + Date.now(),
    name: '新踏查点位',
    description: '请描述点位位置和检查内容',
    type: 'general',
    status: 'pending',
    inspector: '当前用户',
    investigationDate: new Date().toLocaleDateString(),
    coordinates: '待定位',
    environmentConditions: [],
    photos: [],
    findings: []
  }
  investigationPoints.value.unshift(newPoint)
  activePointId.value = newPoint.id
}

function navigateToPoint(point) {
  uni.showToast({
    title: `导航到 ${point.name}`,
    icon: 'none'
  })
}

function takePhoto() {
  if (!activePoint.value) return
  
  uni.showToast({
    title: '拍照功能开发中',
    icon: 'none'
  })
}

function recordFinding() {
  if (!activePoint.value) return
  
  const newFinding = {
    id: 'finding-new-' + Date.now(),
    title: '新发现问题',
    description: '请描述具体问题和位置',
    severity: 'medium',
    recordTime: new Date().toLocaleTimeString(),
    resolved: false
  }
  
  if (!activePoint.value.findings) {
    activePoint.value.findings = []
  }
  activePoint.value.findings.push(newFinding)
  
  // 更新点位状态为进行中
  activePoint.value.status = 'in-progress'
}

function previewPhoto(photo) {
  uni.previewImage({
    urls: [photo.fullImage],
    current: 0
  })
}

function resolveFinding(findingId) {
  const finding = activePoint.value.findings.find(f => f.id === findingId)
  if (finding) {
    finding.resolved = true
    uni.showToast({
      title: '问题已标记为已处理',
      icon: 'success'
    })
  }
}

function syncData() {
  uni.showToast({
    title: '数据同步中...',
    icon: 'loading'
  })
  
  setTimeout(() => {
    uni.showToast({
      title: '同步完成',
      icon: 'success'
    })
  }, 1500)
}

function getPointColor(status) {
  const colorMap = {
    completed: '#10b981',
    'in-progress': '#f59e0b',
    pending: '#64748b'
  }
  return colorMap[status] || '#64748b'
}

function getPointIcon(type) {
  const iconMap = {
    water: 'water',
    waste: 'trash',
    air: 'cloudy',
    chemical: 'flask',
    general: 'location'
  }
  return iconMap[type] || 'location'
}

function getPointStatusText(status) {
  const statusMap = {
    completed: '已完成',
    'in-progress': '进行中',
    pending: '待踏查'
  }
  return statusMap[status] || '未知'
}

function getSeverityText(severity) {
  const severityMap = {
    low: '低风险',
    medium: '中风险',
    high: '高风险'
  }
  return severityMap[severity] || '未知'
}
</script>

<style lang="scss" scoped>
.investigation {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
  min-height: 100vh;
  padding: 32rpx;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.investigation__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24rpx;
}

.investigation__title-section {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  flex: 1;
}

.investigation__title {
  font-size: 48rpx;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.2;
}

.investigation__subtitle {
  font-size: 28rpx;
  color: #64748b;
  line-height: 1.4;
}

.investigation__header-actions {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

/* 统计卡片 */
.investigation__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200rpx, 1fr));
  gap: 20rpx;
}

.investigation__stat-card {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 24rpx;
  background: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(15, 23, 42, 0.06);
  border: 1rpx solid #f1f5f9;
}

.investigation__stat-icon {
  width: 56rpx;
  height: 56rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.investigation__stat-content {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.investigation__stat-value {
  font-size: 32rpx;
  font-weight: 700;
  color: #0f172a;
  line-height: 1;
}

.investigation__stat-label {
  font-size: 24rpx;
  color: #64748b;
}

/* 主要内容区域 */
.investigation__content {
  display: flex;
  gap: 32rpx;
  flex: 1;
}

/* 面板通用样式 */
.investigation__points-panel {
  width: 420rpx;
  min-width: 350rpx;
  background: #ffffff;
  border-radius: 20rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 24rpx rgba(15, 23, 42, 0.08);
  border: 1rpx solid #f1f5f9;
  display: flex;
  flex-direction: column;
}

.investigation__detail-panel {
  flex: 1;
  background: #ffffff;
  border-radius: 20rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 24rpx rgba(15, 23, 42, 0.08);
  border: 1rpx solid #f1f5f9;
  display: flex;
  flex-direction: column;
}

.investigation__panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.investigation__panel-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #0f172a;
}

.investigation__detail-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.investigation__detail-status {
  font-size: 24rpx;
  padding: 6rpx 12rpx;
  border-radius: 6rpx;
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  font-weight: 500;
}

.investigation__detail-actions {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

/* 按钮样式 */
.investigation__button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 0 20rpx;
  height: 64rpx;
  border-radius: 12rpx;
  font-size: 26rpx;
  font-weight: 500;
  border: none;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.investigation__button:active {
  transform: translateY(2rpx);
}

.investigation__button--primary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #ffffff;
  box-shadow: 0 4rpx 16rpx rgba(59, 130, 246, 0.3);
}

.investigation__button--primary:active {
  box-shadow: 0 2rpx 8rpx rgba(59, 130, 246, 0.4);
}

.investigation__button--primary:disabled {
  background: #cbd5e1;
  box-shadow: none;
  transform: none;
}

.investigation__button--secondary {
  background: transparent;
  color: #3b82f6;
  border: 2rpx solid #3b82f6;
}

.investigation__button--secondary:active {
  background: rgba(59, 130, 246, 0.1);
}

.investigation__button--outline {
  background: transparent;
  color: #64748b;
  border: 2rpx solid #e2e8f0;
}

.investigation__button--outline:active {
  background: #f8fafc;
}

.investigation__button--outline:disabled {
  color: #cbd5e1;
  border-color: #cbd5e1;
  transform: none;
}

/* 点位列表样式 */
.investigation__scroll {
  flex: 1;
}

.investigation__point-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx;
  border-radius: 12rpx;
  background: #f8fafc;
  border: 2rpx solid transparent;
  margin-bottom: 12rpx;
  transition: all 0.3s ease;
  position: relative;
}

.investigation__point-item:active {
  transform: translateY(2rpx);
  background: #f1f5f9;
}

.investigation__point-item--active {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(59, 130, 246, 0.04));
  border-color: #3b82f6;
  box-shadow: 0 4rpx 16rpx rgba(59, 130, 246, 0.12);
}

.investigation__point-item--completed {
  opacity: 0.8;
}

.investigation__point-marker {
  width: 32rpx;
  height: 32rpx;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.investigation__point-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.investigation__point-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8rpx;
}

.investigation__point-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #0f172a;
  line-height: 1.3;
}

.investigation__point-badge {
  font-size: 20rpx;
  padding: 4rpx 8rpx;
  border-radius: 4rpx;
  font-weight: 500;
  white-space: nowrap;
}

.investigation__point-badge--completed {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.investigation__point-badge--in-progress {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}

.investigation__point-badge--pending {
  background: rgba(100, 116, 139, 0.1);
  color: #64748b;
}

.investigation__point-desc {
  font-size: 24rpx;
  color: #64748b;
  line-height: 1.4;
}

.investigation__point-meta {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 4rpx;
}

.investigation__point-meta-item {
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.investigation__point-meta-text {
  font-size: 22rpx;
  color: #94a3b8;
}

.investigation__point-actions {
  display: flex;
  align-items: center;
  gap: 8rpx;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.investigation__point-item:active .investigation__point-actions {
  opacity: 1;
}

.investigation__point-action {
  padding: 8rpx;
  border-radius: 6rpx;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.investigation__point-action:active {
  background: #f1f5f9;
}

/* 详情内容样式 */
.investigation__detail-scroll {
  flex: 1;
}

.investigation__detail-content {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.investigation__section {
  background: #f8fafc;
  border-radius: 12rpx;
  padding: 20rpx;
  border: 1rpx solid #e2e8f0;
}

.investigation__section-header {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 16rpx;
}

.investigation__section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #0f172a;
}

.investigation__section-count {
  font-size: 22rpx;
  color: #64748b;
  margin-left: auto;
}

/* 信息网格 */
.investigation__info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250rpx, 1fr));
  gap: 16rpx;
}

.investigation__info-item {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.investigation__info-label {
  font-size: 24rpx;
  color: #64748b;
  font-weight: 500;
}

.investigation__info-value {
  font-size: 26rpx;
  color: #0f172a;
  font-weight: 600;
}

/* 环境状况列表 */
.investigation__environment-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.investigation__environment-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx;
  background: #ffffff;
  border-radius: 8rpx;
  border: 1rpx solid #e2e8f0;
}

.investigation__environment-icon {
  width: 32rpx;
  height: 32rpx;
  border-radius: 6rpx;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.investigation__environment-name {
  flex: 1;
  font-size: 26rpx;
  color: #0f172a;
  font-weight: 500;
}

.investigation__environment-status {
  font-size: 22rpx;
  padding: 4rpx 8rpx;
  border-radius: 4rpx;
  font-weight: 500;
}

.investigation__environment-status--normal {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.investigation__environment-status--abnormal {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.investigation__environment-status--pending {
  background: rgba(100, 116, 139, 0.1);
  color: #64748b;
}

/* 照片列表 */
.investigation__photos-scroll {
  width: 100%;
}

.investigation__photos-list {
  display: flex;
  gap: 12rpx;
  padding: 4rpx 0;
}

.investigation__photo-item {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  width: 160rpx;
  flex-shrink: 0;
}

.investigation__photo-image {
  width: 160rpx;
  height: 120rpx;
  border-radius: 8rpx;
  background: #e2e8f0;
}

.investigation__photo-time {
  font-size: 22rpx;
  color: #64748b;
  text-align: center;
}

.investigation__photo-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  width: 160rpx;
  height: 120rpx;
  border: 2rpx dashed #cbd5e1;
  border-radius: 8rpx;
  color: #cbd5e1;
  transition: all 0.3s ease;
}

.investigation__photo-upload:active {
  border-color: #3b82f6;
  color: #3b82f6;
}

.investigation__photo-upload-text {
  font-size: 22rpx;
  color: inherit;
}

/* 发现问题列表 */
.investigation__findings-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.investigation__finding-item {
  padding: 16rpx;
  background: #ffffff;
  border-radius: 8rpx;
  border-left: 4rpx solid #e2e8f0;
}

.investigation__finding-item--low {
  border-left-color: #10b981;
}

.investigation__finding-item--medium {
  border-left-color: #f59e0b;
}

.investigation__finding-item--high {
  border-left-color: #ef4444;
}

.investigation__finding-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8rpx;
  margin-bottom: 8rpx;
}

.investigation__finding-title {
  font-size: 26rpx;
  font-weight: 600;
  color: #0f172a;
  flex: 1;
}

.investigation__finding-severity {
  font-size: 20rpx;
  padding: 4rpx 8rpx;
  border-radius: 4rpx;
  font-weight: 500;
  white-space: nowrap;
}

.investigation__finding-severity--low {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.investigation__finding-severity--medium {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}

.investigation__finding-severity--high {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.investigation__finding-desc {
  font-size: 24rpx;
  color: #64748b;
  line-height: 1.4;
  margin-bottom: 8rpx;
}

.investigation__finding-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8rpx;
}

.investigation__finding-time {
  font-size: 22rpx;
  color: #94a3b8;
}

.investigation__finding-action {
  font-size: 22rpx;
  color: #3b82f6;
  font-weight: 500;
}

.investigation__finding-action:active {
  color: #2563eb;
}

/* 空状态样式 */
.investigation__empty,
.investigation__empty-detail,
.investigation__empty-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  padding: 80rpx 32rpx;
  color: #cbd5e1;
  text-align: center;
}

.investigation__empty-section {
  padding: 40rpx 32rpx;
}

.investigation__empty-text {
  font-size: 28rpx;
  color: #64748b;
  font-weight: 600;
}

.investigation__empty-subtext {
  font-size: 24rpx;
  color: #94a3b8;
  line-height: 1.4;
}

.investigation__empty-section-text {
  font-size: 24rpx;
  color: #94a3b8;
}

/* 响应式设计 */
@media (max-width: 1023px) {
  .investigation {
    padding: 24rpx;
    gap: 24rpx;
  }
  
  .investigation__content {
    flex-direction: column;
  }
  
  .investigation__points-panel {
    width: 100%;
    min-width: auto;
  }
  
  .investigation__header {
    flex-direction: column;
    align-items: stretch;
    gap: 16rpx;
  }
  
  .investigation__header-actions {
    justify-content: flex-start;
  }
  
  .investigation__stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .investigation__panel-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16rpx;
  }
  
  .investigation__detail-actions {
    justify-content: flex-start;
  }
}

@media (max-width: 767px) {
  .investigation__stats {
    grid-template-columns: 1fr;
  }
  
  .investigation__header-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .investigation__info-grid {
    grid-template-columns: 1fr;
  }
}

/* 桌面端悬停效果 */
@media (min-width: 768px) {
  .investigation__point-item:hover {
    transform: translateY(-2rpx);
    box-shadow: 0 8rpx 24rpx rgba(15, 23, 42, 0.12);
  }
  
  .investigation__point-item:hover .investigation__point-actions {
    opacity: 1;
  }
  
  .investigation__button--primary:hover {
    box-shadow: 0 6rpx 20rpx rgba(59, 130, 246, 0.4);
  }
  
  .investigation__button--secondary:hover {
    background: rgba(59, 130, 246, 0.1);
  }
  
  .investigation__button--outline:hover {
    background: #f8fafc;
  }
  
  .investigation__point-action:hover {
    background: #f1f5f9;
  }
  
  .investigation__photo-upload:hover {
    border-color: #3b82f6;
    color: #3b82f6;
  }
  
  .investigation__finding-action:hover {
    color: #2563eb;
  }
}
</style>