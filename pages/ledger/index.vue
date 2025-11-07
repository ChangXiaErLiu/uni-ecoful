<!-- 环保台账管理页面 -->
<template>
  <AppLayout current="pages/ledger/index">
    <view class="ledger">
      <!-- 页面头部 -->
      <view class="ledger__header">
        <view class="ledger__title-section">
          <text class="ledger__title">环保台账管理</text>
          <text class="ledger__subtitle">记录环境管理全过程，确保合规运营</text>
        </view>
        <view class="ledger__header-actions">
          <button class="ledger__button ledger__button--secondary" @tap="exportData">
            <uni-icons type="download" size="16" color="#3b82f6" />
            <text>导出台账</text>
          </button>
          <button class="ledger__button ledger__button--primary" @tap="addRecord">
            <uni-icons type="plus" size="16" color="#ffffff" />
            <text>新建记录</text>
          </button>
        </view>
      </view>

      <!-- 统计卡片 -->
      <view class="ledger__stats">
        <view class="ledger__stat-card">
          <view class="ledger__stat-icon" style="background: rgba(59, 130, 246, 0.1);">
            <uni-icons type="folder" size="24" color="#3b82f6" />
          </view>
          <view class="ledger__stat-content">
            <text class="ledger__stat-value">{{ stats.totalRecords }}</text>
            <text class="ledger__stat-label">总记录数</text>
          </view>
        </view>
        <view class="ledger__stat-card">
          <view class="ledger__stat-icon" style="background: rgba(16, 185, 129, 0.1);">
            <uni-icons type="checkmark" size="24" color="#10b981" />
          </view>
          <view class="ledger__stat-content">
            <text class="ledger__stat-value">{{ stats.completedRecords }}</text>
            <text class="ledger__stat-label">已完成</text>
          </view>
        </view>
        <view class="ledger__stat-card">
          <view class="ledger__stat-icon" style="background: rgba(245, 158, 11, 0.1);">
            <uni-icons type="clock" size="24" color="#f59e0b" />
          </view>
          <view class="ledger__stat-content">
            <text class="ledger__stat-value">{{ stats.pendingRecords }}</text>
            <text class="ledger__stat-label">待处理</text>
          </view>
        </view>
        <view class="ledger__stat-card">
          <view class="ledger__stat-icon" style="background: rgba(239, 68, 68, 0.1);">
            <uni-icons type="info" size="24" color="#ef4444" />
          </view>
          <view class="ledger__stat-content">
            <text class="ledger__stat-value">{{ stats.expiredRecords }}</text>
            <text class="ledger__stat-label">已过期</text>
          </view>
        </view>
      </view>

      <!-- 主要内容区域 -->
      <view class="ledger__content">
        <!-- 左侧台账分类 -->
        <view class="ledger__categories-panel">
          <view class="ledger__panel-header">
            <text class="ledger__panel-title">台账分类</text>
          </view>
          
          <scroll-view scroll-y class="ledger__scroll">
            <view
              v-for="category in ledgerCategories"
              :key="category.id"
              class="ledger__category-item"
              :class="{ 'ledger__category-item--active': category.id === activeCategoryId }"
              @tap="() => switchCategory(category.id)"
            >
              <view class="ledger__category-icon">
                <uni-icons :type="category.icon" size="20" :color="category.id === activeCategoryId ? '#3b82f6' : '#64748b'" />
              </view>
              <view class="ledger__category-content">
                <text class="ledger__category-name">{{ category.name }}</text>
                <text class="ledger__category-count">{{ category.count }} 条记录</text>
              </view>
              <view class="ledger__category-arrow">
                <uni-icons type="right" size="16" color="#94a3b8" />
              </view>
            </view>
          </scroll-view>
        </view>

        <!-- 右侧台账记录列表 -->
        <view class="ledger__records-panel">
          <view class="ledger__panel-header">
            <view class="ledger__records-header">
              <text class="ledger__panel-title">{{ activeCategory?.name }}记录</text>
              <text class="ledger__records-count">{{ currentRecords.length }} 条记录</text>
            </view>
            <view class="ledger__filter-actions">
              <button class="ledger__button ledger__button--outline" @tap="showFilter = !showFilter">
                <uni-icons type="funnel" size="16" color="#64748b" />
                <text>筛选</text>
              </button>
            </view>
          </view>

          <!-- 筛选条件 -->
          <view v-if="showFilter" class="ledger__filter-panel">
            <view class="ledger__filter-row">
              <view class="ledger__filter-item">
                <text class="ledger__filter-label">记录状态</text>
                <picker @change="onStatusFilterChange" :value="filters.status" :range="statusOptions" range-key="label">
                  <view class="ledger__filter-select">
                    <text>{{ statusOptions[filters.status]?.label || '全部状态' }}</text>
                    <uni-icons type="arrow-down" size="14" color="#64748b" />
                  </view>
                </picker>
              </view>
              <view class="ledger__filter-item">
                <text class="ledger__filter-label">时间范围</text>
                <picker mode="date" @change="onDateFilterChange">
                  <view class="ledger__filter-select">
                    <text>{{ filters.date || '选择日期' }}</text>
                    <uni-icons type="calendar" size="14" color="#64748b" />
                  </view>
                </picker>
              </view>
            </view>
          </view>

          <!-- 记录列表 -->
          <scroll-view scroll-y class="ledger__records-scroll">
            <view v-if="currentRecords.length > 0">
              <view
                v-for="record in currentRecords"
                :key="record.id"
                class="ledger__record-item"
                :class="`ledger__record-item--${record.status}`"
                @tap="() => viewRecordDetail(record.id)"
              >
                <view class="ledger__record-icon">
                  <uni-icons :type="getRecordIcon(record.type)" size="20" :color="getRecordColor(record.status)" />
                </view>
                <view class="ledger__record-content">
                  <view class="ledger__record-header">
                    <text class="ledger__record-title">{{ record.title }}</text>
                    <view class="ledger__record-badge" :class="`ledger__record-badge--${record.status}`">
                      {{ getStatusText(record.status) }}
                    </view>
                  </view>
                  <text class="ledger__record-desc">{{ record.description }}</text>
                  <view class="ledger__record-meta">
                    <view class="ledger__record-meta-item">
                      <uni-icons type="person" size="14" color="#94a3b8" />
                      <text class="ledger__record-meta-text">{{ record.responsiblePerson }}</text>
                    </view>
                    <view class="ledger__record-meta-item">
                      <uni-icons type="calendar" size="14" color="#94a3b8" />
                      <text class="ledger__record-meta-text">{{ record.recordDate }}</text>
                    </view>
                    <view v-if="record.dueDate" class="ledger__record-meta-item">
                      <uni-icons type="clock" size="14" color="#94a3b8" />
                      <text class="ledger__record-meta-text">{{ record.dueDate }}</text>
                    </view>
                  </view>
                </view>
                <view class="ledger__record-actions">
                  <view class="ledger__record-action" @tap.stop="() => editRecord(record.id)">
                    <uni-icons type="compose" size="16" color="#64748b" />
                  </view>
                  <view class="ledger__record-action" @tap.stop="() => deleteRecord(record.id)">
                    <uni-icons type="trash" size="16" color="#ef4444" />
                  </view>
                </view>
              </view>
            </view>
            
            <!-- 空状态 -->
            <view v-else class="ledger__empty">
              <uni-icons type="document" size="60" color="#cbd5e1" />
              <text class="ledger__empty-text">暂无台账记录</text>
              <text class="ledger__empty-subtext">点击上方按钮创建第一条记录</text>
              <button class="ledger__button ledger__button--primary" @tap="addRecord">
                <uni-icons type="plus" size="16" color="#ffffff" />
                <text>创建记录</text>
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
onShow(() => navTitle.setTitle('环保台账管理'))

// 统计数据
const stats = ref({
  totalRecords: 156,
  completedRecords: 89,
  pendingRecords: 42,
  expiredRecords: 25
})

// 台账分类
const ledgerCategories = ref([
  {
    id: 'basic',
    name: '基础信息台账',
    icon: 'home',
    count: 15,
    description: '企业基本信息和项目资料'
  },
  {
    id: 'pollution',
    name: '污染物治理台账',
    icon: 'cloudy',
    count: 68,
    description: '废水、废气、固废治理记录'
  },
  {
    id: 'management',
    name: '环境管理台账',
    icon: 'gear',
    count: 32,
    description: '培训、巡查、应急预案等'
  },
  {
    id: 'monitoring',
    name: '监测报告台账',
    icon: 'graph',
    count: 41,
    description: '监测数据和执行报告'
  }
])

// 台账记录数据
const ledgerRecords = ref({
  basic: [
    {
      id: 'record-1',
      title: '企业基本信息登记',
      description: '更新营业执照和环保负责人信息',
      type: 'info',
      status: 'completed',
      responsiblePerson: '张三',
      recordDate: '2024-01-15',
      dueDate: '',
      category: 'basic'
    },
    {
      id: 'record-2',
      title: '环评批复文件归档',
      description: '收集整理建设项目环评相关文件',
      type: 'document',
      status: 'pending',
      responsiblePerson: '李四',
      recordDate: '2024-01-10',
      dueDate: '2024-01-20',
      category: 'basic'
    }
  ],
  pollution: [
    {
      id: 'record-3',
      title: '废水处理设施运行记录',
      description: '记录本周废水处理设施运行参数和加药情况',
      type: 'water',
      status: 'completed',
      responsiblePerson: '王五',
      recordDate: '2024-01-16',
      dueDate: '',
      category: 'pollution'
    },
    {
      id: 'record-4',
      title: '危险废物转移记录',
      description: '本月危险废物转移至处置单位',
      type: 'waste',
      status: 'expired',
      responsiblePerson: '赵六',
      recordDate: '2024-01-05',
      dueDate: '2024-01-10',
      category: 'pollution'
    }
  ],
  management: [
    {
      id: 'record-5',
      title: '环保培训记录',
      description: '新员工环保法规和操作规范培训',
      type: 'training',
      status: 'pending',
      responsiblePerson: '钱七',
      recordDate: '2024-01-14',
      dueDate: '2024-01-25',
      category: 'management'
    }
  ],
  monitoring: [
    {
      id: 'record-6',
      title: '季度监测报告',
      description: '第三方检测机构出具的季度监测报告',
      type: 'report',
      status: 'completed',
      responsiblePerson: '孙八',
      recordDate: '2024-01-12',
      dueDate: '',
      category: 'monitoring'
    }
  ]
})

const activeCategoryId = ref('basic')
const showFilter = ref(false)
const filters = ref({
  status: '',
  date: ''
})

const statusOptions = [
  { label: '全部状态', value: '' },
  { label: '已完成', value: 'completed' },
  { label: '待处理', value: 'pending' },
  { label: '已过期', value: 'expired' }
]

const activeCategory = computed(() => 
  ledgerCategories.value.find(cat => cat.id === activeCategoryId.value)
)

const currentRecords = computed(() => {
  let records = ledgerRecords.value[activeCategoryId.value] || []
  
  // 应用筛选条件
  if (filters.value.status) {
    records = records.filter(record => record.status === filters.value.status)
  }
  if (filters.value.date) {
    records = records.filter(record => record.recordDate === filters.value.date)
  }
  
  return records
})

function switchCategory(categoryId) {
  activeCategoryId.value = categoryId
  showFilter.value = false
}

function addRecord() {
  uni.showToast({
    title: '新建记录功能开发中',
    icon: 'none'
  })
}

function editRecord(recordId) {
  console.log('编辑记录', recordId)
  uni.showToast({
    title: '编辑功能开发中',
    icon: 'none'
  })
}

function deleteRecord(recordId) {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这条台账记录吗？',
    success: (res) => {
      if (res.confirm) {
        const categoryId = activeCategoryId.value
        ledgerRecords.value[categoryId] = ledgerRecords.value[categoryId].filter(
          record => record.id !== recordId
        )
        uni.showToast({
          title: '删除成功',
          icon: 'success'
        })
      }
    }
  })
}

function viewRecordDetail(recordId) {
  console.log('查看记录详情', recordId)
  uni.showToast({
    title: '详情功能开发中',
    icon: 'none'
  })
}

function exportData() {
  uni.showToast({
    title: '导出功能开发中',
    icon: 'none'
  })
}

function onStatusFilterChange(e) {
  filters.value.status = statusOptions[e.detail.value]?.value || ''
}

function onDateFilterChange(e) {
  filters.value.date = e.detail.value
}

function getRecordIcon(type) {
  const iconMap = {
    info: 'info',
    document: 'document',
    water: 'water',
    waste: 'trash',
    training: 'person',
    report: 'graph'
  }
  return iconMap[type] || 'document'
}

function getRecordColor(status) {
  const colorMap = {
    completed: '#10b981',
    pending: '#f59e0b',
    expired: '#ef4444'
  }
  return colorMap[status] || '#64748b'
}

function getStatusText(status) {
  const statusMap = {
    completed: '已完成',
    pending: '待处理',
    expired: '已过期'
  }
  return statusMap[status] || '未知'
}
</script>

<style lang="scss" scoped>
.ledger {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
  min-height: 100vh;
  padding: 32rpx;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.ledger__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24rpx;
}

.ledger__title-section {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  flex: 1;
}

.ledger__title {
  font-size: 48rpx;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.2;
}

.ledger__subtitle {
  font-size: 28rpx;
  color: #64748b;
  line-height: 1.4;
}

.ledger__header-actions {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

/* 统计卡片 */
.ledger__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200rpx, 1fr));
  gap: 20rpx;
}

.ledger__stat-card {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 24rpx;
  background: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(15, 23, 42, 0.06);
  border: 1rpx solid #f1f5f9;
}

.ledger__stat-icon {
  width: 56rpx;
  height: 56rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ledger__stat-content {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.ledger__stat-value {
  font-size: 32rpx;
  font-weight: 700;
  color: #0f172a;
  line-height: 1;
}

.ledger__stat-label {
  font-size: 24rpx;
  color: #64748b;
}

/* 主要内容区域 */
.ledger__content {
  display: flex;
  gap: 32rpx;
  flex: 1;
}

/* 面板通用样式 */
.ledger__categories-panel {
  width: 360rpx;
  min-width: 300rpx;
  background: #ffffff;
  border-radius: 20rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 24rpx rgba(15, 23, 42, 0.08);
  border: 1rpx solid #f1f5f9;
  display: flex;
  flex-direction: column;
}

.ledger__records-panel {
  flex: 1;
  background: #ffffff;
  border-radius: 20rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 24rpx rgba(15, 23, 42, 0.08);
  border: 1rpx solid #f1f5f9;
  display: flex;
  flex-direction: column;
}

.ledger__panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.ledger__panel-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #0f172a;
}

.ledger__records-count {
  font-size: 24rpx;
  color: #64748b;
}

.ledger__records-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.ledger__filter-actions {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

/* 按钮样式 */
.ledger__button {
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

.ledger__button:active {
  transform: translateY(2rpx);
}

.ledger__button--primary {
  background: linear-gradient(135deg, #10b981, #059669);
  color: #ffffff;
  box-shadow: 0 4rpx 16rpx rgba(16, 185, 129, 0.3);
}

.ledger__button--primary:active {
  box-shadow: 0 2rpx 8rpx rgba(16, 185, 129, 0.4);
}

.ledger__button--secondary {
  background: transparent;
  color: #3b82f6;
  border: 2rpx solid #3b82f6;
}

.ledger__button--secondary:active {
  background: rgba(59, 130, 246, 0.1);
}

.ledger__button--outline {
  background: transparent;
  color: #64748b;
  border: 2rpx solid #e2e8f0;
}

.ledger__button--outline:active {
  background: #f8fafc;
}

/* 分类列表样式 */
.ledger__scroll {
  flex: 1;
}

.ledger__category-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx;
  border-radius: 12rpx;
  background: #f8fafc;
  border: 2rpx solid transparent;
  margin-bottom: 12rpx;
  transition: all 0.3s ease;
}

.ledger__category-item:active {
  transform: translateY(2rpx);
  background: #f1f5f9;
}

.ledger__category-item--active {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(59, 130, 246, 0.04));
  border-color: #3b82f6;
  box-shadow: 0 4rpx 16rpx rgba(59, 130, 246, 0.12);
}

.ledger__category-icon {
  width: 40rpx;
  height: 40rpx;
  border-radius: 8rpx;
  background: rgba(59, 130, 246, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ledger__category-item--active .ledger__category-icon {
  background: rgba(59, 130, 246, 0.2);
}

.ledger__category-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.ledger__category-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #0f172a;
}

.ledger__category-item--active .ledger__category-name {
  color: #3b82f6;
}

.ledger__category-count {
  font-size: 22rpx;
  color: #64748b;
}

.ledger__category-arrow {
  opacity: 0.6;
}

/* 筛选面板 */
.ledger__filter-panel {
  background: #f8fafc;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.ledger__filter-row {
  display: flex;
  gap: 20rpx;
}

.ledger__filter-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.ledger__filter-label {
  font-size: 24rpx;
  color: #64748b;
  font-weight: 500;
}

.ledger__filter-select {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 20rpx;
  background: #ffffff;
  border: 1rpx solid #e2e8f0;
  border-radius: 8rpx;
  font-size: 26rpx;
  color: #0f172a;
}

/* 记录列表样式 */
.ledger__records-scroll {
  flex: 1;
}

.ledger__record-item {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  padding: 24rpx;
  border-radius: 16rpx;
  background: #f8fafc;
  border: 1rpx solid #e2e8f0;
  margin-bottom: 16rpx;
  transition: all 0.2s ease;
  position: relative;
}

.ledger__record-item:active {
  background: #f1f5f9;
}

.ledger__record-item--completed {
  border-left: 4rpx solid #10b981;
}

.ledger__record-item--pending {
  border-left: 4rpx solid #f59e0b;
}

.ledger__record-item--expired {
  border-left: 4rpx solid #ef4444;
}

.ledger__record-icon {
  width: 40rpx;
  height: 40rpx;
  border-radius: 8rpx;
  background: #ffffff;
  border: 1rpx solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 4rpx;
}

.ledger__record-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.ledger__record-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12rpx;
}

.ledger__record-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #0f172a;
  line-height: 1.3;
  flex: 1;
}

.ledger__record-badge {
  font-size: 20rpx;
  padding: 6rpx 12rpx;
  border-radius: 6rpx;
  font-weight: 500;
  white-space: nowrap;
}

.ledger__record-badge--completed {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.ledger__record-badge--pending {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}

.ledger__record-badge--expired {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.ledger__record-desc {
  font-size: 24rpx;
  color: #64748b;
  line-height: 1.4;
}

.ledger__record-meta {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex-wrap: wrap;
}

.ledger__record-meta-item {
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.ledger__record-meta-text {
  font-size: 22rpx;
  color: #94a3b8;
}

.ledger__record-actions {
  display: flex;
  align-items: center;
  gap: 8rpx;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.ledger__record-item:active .ledger__record-actions {
  opacity: 1;
}

.ledger__record-action {
  padding: 8rpx;
  border-radius: 6rpx;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ledger__record-action:active {
  background: #f1f5f9;
}

/* 空状态样式 */
.ledger__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  padding: 80rpx 32rpx;
  color: #cbd5e1;
  text-align: center;
}

.ledger__empty-text {
  font-size: 28rpx;
  color: #64748b;
  font-weight: 600;
}

.ledger__empty-subtext {
  font-size: 24rpx;
  color: #94a3b8;
  line-height: 1.4;
}

/* 响应式设计 */
@media (max-width: 1023px) {
  .ledger {
    padding: 24rpx;
    gap: 24rpx;
  }
  
  .ledger__content {
    flex-direction: column;
  }
  
  .ledger__categories-panel {
    width: 100%;
    min-width: auto;
  }
  
  .ledger__header {
    flex-direction: column;
    align-items: stretch;
    gap: 16rpx;
  }
  
  .ledger__header-actions {
    justify-content: flex-start;
  }
  
  .ledger__stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .ledger__filter-row {
    flex-direction: column;
    gap: 16rpx;
  }
}

@media (max-width: 767px) {
  .ledger__stats {
    grid-template-columns: 1fr;
  }
  
  .ledger__header-actions {
    flex-direction: column;
    align-items: stretch;
  }
}

/* 桌面端悬停效果 */
@media (min-width: 768px) {
  .ledger__category-item:hover {
    transform: translateY(-2rpx);
    box-shadow: 0 8rpx 24rpx rgba(15, 23, 42, 0.12);
  }
  
  .ledger__record-item:hover {
    background: #f1f5f9;
    transform: translateY(-1rpx);
    box-shadow: 0 4rpx 16rpx rgba(15, 23, 42, 0.08);
  }
  
  .ledger__record-item:hover .ledger__record-actions {
    opacity: 1;
  }
  
  .ledger__button--primary:hover {
    box-shadow: 0 6rpx 20rpx rgba(16, 185, 129, 0.4);
  }
  
  .ledger__button--secondary:hover {
    background: rgba(59, 130, 246, 0.1);
  }
  
  .ledger__button--outline:hover {
    background: #f8fafc;
  }
  
  .ledger__record-action:hover {
    background: #f1f5f9;
  }
}
</style>