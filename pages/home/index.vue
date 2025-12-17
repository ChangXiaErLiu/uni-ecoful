<!-- 首页 - 环保AI工作台 -->
<template>
  <AppLayout current="pages/home/index">
    <view class="home">
      <!-- 顶部渐变背景 -->
      <view class="home__bg-gradient"></view>
      
      <!-- 用户信息卡片 -->
      <view class="home__user-card">
        <view class="user-card__left">
          <view class="user-card__avatar">
            <text class="user-card__avatar-text">{{ userInitial }}</text>
          </view>
          <view class="user-card__info">
            <text class="user-card__name">{{ userName || '未登录' }}</text>
            <text class="user-card__company">{{ userCompany || '暂无企业信息' }}</text>
          </view>
        </view>
        <view class="user-card__right" @tap="goToProfile">
          <uni-icons type="person" size="20" color="#166534" />
        </view>
      </view>

      <!-- 项目看板 -->
      <view v-if="currentProject" class="home__project-board">
        <view class="project-board__header">
          <view class="project-board__title-row">
            <uni-icons type="folder" size="18" color="#166534" />
            <text class="project-board__title">当前项目</text>
          </view>
          <view class="project-board__action" @tap="goToProject">
            <text class="project-board__action-text">查看详情</text>
            <uni-icons type="right" size="14" color="#166534" />
          </view>
        </view>
        <view class="project-board__content">
          <text class="project-board__name">{{ currentProject.name }}</text>
          <text v-if="currentProject.description" class="project-board__desc">
            {{ currentProject.description }}
          </text>
          <view class="project-board__meta">
            <view class="project-board__meta-item">
              <uni-icons type="calendar" size="14" color="#64748b" />
              <text class="project-board__meta-text">{{ currentProject.folder_name || '未知' }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 数据统计卡片 -->
      <view class="home__stats-grid">
        <view class="stats-card stats-card--green">
          <view class="stats-card__icon">
            <uni-icons type="folder-add" size="24" color="#ffffff" />
          </view>
          <view class="stats-card__content">
            <text class="stats-card__value">{{ statsData.projects }}</text>
            <text class="stats-card__label">项目总数</text>
          </view>
        </view>
        
        <view class="stats-card stats-card--blue">
          <view class="stats-card__icon">
            <uni-icons type="paperclip" size="24" color="#ffffff" />
          </view>
          <view class="stats-card__content">
            <text class="stats-card__value">{{ statsData.documents }}</text>
            <text class="stats-card__label">文档数量</text>
          </view>
        </view>
        
        <view class="stats-card stats-card--purple">
          <view class="stats-card__icon">
            <uni-icons type="checkmarkempty" size="24" color="#ffffff" />
          </view>
          <view class="stats-card__content">
            <text class="stats-card__value">{{ statsData.completed }}</text>
            <text class="stats-card__label">已完成</text>
          </view>
        </view>
      </view>

      <!-- 快速操作 -->
      <view class="home__quick-actions">
        <view class="quick-actions__header">
          <uni-icons type="star" size="18" color="#f59e0b" />
          <text class="quick-actions__title">快速操作</text>
        </view>
        <view class="quick-actions__list">
          <view class="quick-action-item" @tap="quickAction('newProject')">
            <view class="quick-action-item__icon" style="background: #dcfce7;">
              <uni-icons type="plus" size="20" color="#166534" />
            </view>
            <text class="quick-action-item__text">新建项目</text>
          </view>
          <view class="quick-action-item" @tap="quickAction('newProject')">
            <view class="quick-action-item__icon" style="background: #dbeafe;">
              <uni-icons type="cloud-upload" size="20" color="#2563eb" />
            </view>
            <text class="quick-action-item__text">上传文档</text>
          </view>
          <view class="quick-action-item" @tap="quickAction('viewReports')">
            <view class="quick-action-item__icon" style="background: #fef3c7;">
              <uni-icons type="compose" size="20" color="#d97706" />
            </view>
            <text class="quick-action-item__text">查看报告</text>
          </view>
          <view class="quick-action-item" @tap="quickAction('settings')">
            <view class="quick-action-item__icon" style="background: #f3e8ff;">
              <uni-icons type="gear" size="20" color="#7c3aed" />
            </view>
            <text class="quick-action-item__text">系统设置</text>
          </view>
        </view>
      </view>

      <!-- 搜索框 -->
      <view class="home__search">
        <uni-icons type="search" size="18" color="#94a3b8" />
        <input 
          v-model="keyword" 
          class="home__search-input" 
          placeholder="搜索功能或关键字" 
          placeholder-style="color: #94a3b8;"
        />
      </view>

      <!-- 快捷功能标题 -->
      <view class="home__section-header">
        <text class="home__section-title">快捷功能</text>
        <text class="home__section-subtitle">选择您需要的环保工具</text>
      </view>

      <!-- 功能卡片网格 -->
      <view class="home__grid">
        <view
          v-for="item in filteredCards"
          :key="item.id"
          class="home__card"
          :class="{
            'home__card--disabled': item.status === 'comingSoon' || item.status === 'disabled',
            'home__card--beta': item.status === 'beta'
          }"
          @tap="onCardTap(item)"
        >
          <view class="home__card-icon" :style="{ backgroundColor: getIconBgColor(item.color) }">
            <uni-icons :type="item.icon" size="28" :color="getIconColor(item.color)" />
          </view>
          <view class="home__card-body">
            <text class="home__card-title">{{ item.title }}</text>
            <text class="home__card-subtitle">{{ item.subtitle }}</text>
          </view>
          <view v-if="item.status === 'beta'" class="home__card-badge">Beta</view>
          <view v-if="item.status === 'comingSoon'" class="home__card-soon">即将上线</view>
        </view>
      </view>
      
      <!-- 空状态 -->
      <view v-if="filteredCards.length === 0" class="home__empty">
        <uni-icons type="search" size="60" color="#cbd5e1" />
        <text class="home__empty-text">未找到相关功能</text>
      </view>

      <!-- 最近活动 -->
      <view class="home__recent-activity">
        <view class="recent-activity__header">
          <view class="recent-activity__title-row">
            <uni-icons type="clock" size="18" color="#166534" />
            <text class="recent-activity__title">最近活动</text>
          </view>
          <text class="recent-activity__more" @tap="viewAllActivities">查看全部</text>
        </view>
        <view class="recent-activity__list">
          <view 
            v-for="(activity, index) in recentActivities" 
            :key="index"
            class="activity-item"
            @tap="onActivityTap(activity)"
          >
            <view class="activity-item__icon" :style="{ background: activity.iconBg }">
              <uni-icons :type="activity.icon" size="20" :color="activity.iconColor" />
            </view>
            <view class="activity-item__content">
              <text class="activity-item__title">{{ activity.title }}</text>
              <text class="activity-item__time">{{ activity.time }}</text>
            </view>
            <uni-icons type="right" size="14" color="#cbd5e1" />
          </view>
        </view>
        <view v-if="recentActivities.length === 0" class="activity-empty">
          <uni-icons type="info" size="40" color="#cbd5e1" />
          <text class="activity-empty__text">暂无最近活动</text>
        </view>
      </view>

      <!-- 环保小贴士 -->
      <view class="home__tips-card">
        <view class="tips-card__header">
          <view class="tips-card__icon">
            <uni-icons type="info" size="20" color="#16a34a" />
          </view>
          <text class="tips-card__title">环保小贴士</text>
        </view>
        <view class="tips-card__content">
          <text class="tips-card__text">{{ currentTip }}</text>
        </view>
        <view class="tips-card__footer">
          <text class="tips-card__refresh" @tap="refreshTip">
            <uni-icons type="refresh" size="14" color="#16a34a" />
            换一条
          </text>
        </view>
      </view>

      <!-- 系统公告（如果有） -->
      <view v-if="systemAnnouncement" class="home__announcement">
        <view class="announcement__icon">
          <uni-icons type="sound" size="18" color="#f59e0b" />
        </view>
        <text class="announcement__text">{{ systemAnnouncement }}</text>
        <view class="announcement__close" @tap="closeAnnouncement">
          <uni-icons type="close" size="16" color="#94a3b8" />
        </view>
      </view>
      
      <!-- 底部安全区域 -->
      <!-- #ifndef MP-WEIXIN -->
      <view class="home__safe-bottom"></view>
      <!-- #endif -->
    </view>
  </AppLayout>
</template>

<script setup>
// UTF-8 编码；中文注释
import { computed, ref, onMounted } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import { onShow } from '@dcloudio/uni-app'
import { navTitleStore } from '@/stores/navTitle.js'

// 设置头部导航标题
const navTitle = navTitleStore()
onShow(() => {
  navTitle.setTitle('环保 AI 工作台')
  loadUserInfo()
  loadProjectInfo()
  loadStatsData()
  loadRecentActivities()
  initTip()
  loadAnnouncement()
})

// 用户信息
const userName = ref('')
const userCompany = ref('')
const userPhone = ref('')
const userId = ref(null)

// 项目信息
const currentProject = ref(null)

// 统计数据
const statsData = ref({
  projects: 0,
  documents: 0,
  completed: 0
})

// 最近活动
const recentActivities = ref([])

// 环保小贴士
const tips = [
  '建议企业定期开展环保培训，提高员工环保意识',
  '及时更新环保设施运行记录，确保台账完整',
  '定期检查污染防治设施运行状态，发现问题及时处理',
  '做好危险废物分类存储，规范转移联单管理',
  '建立健全环境管理制度，落实环保主体责任',
  '加强环境监测，及时掌握污染物排放情况',
  '积极配合环保部门检查，主动报告环境问题',
  '推进清洁生产，从源头减少污染物产生'
]
const currentTip = ref('')
const currentTipIndex = ref(0)

// 系统公告
const systemAnnouncement = ref('')

// 计算用户名首字母（用于头像）
const userInitial = computed(() => {
  if (!userName.value) return '?'
  return userName.value.charAt(0).toUpperCase()
})

// 加载用户信息
function loadUserInfo() {
  try {
    const userInfoStr = uni.getStorageSync('userInfo')
    const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null
    
    if (userInfo) {
      userId.value = userInfo.id || userInfo.user_id
      userName.value = userInfo.username || userInfo.name || ''
      userPhone.value = userInfo.phone_num || userInfo.phone || ''
      userCompany.value = userInfo.company_name || userInfo.company || ''
      
      console.log('用户信息加载成功:', {
        userId: userId.value,
        userName: userName.value,
        userCompany: userCompany.value
      })
    }
  } catch (error) {
    console.error('加载用户信息失败:', error)
  }
}

// 加载项目信息
function loadProjectInfo() {
  try {
    // 尝试从多个可能的存储位置加载项目信息
    const projectId = uni.getStorageSync('acceptance_project_id')
    const projectInfoStr = uni.getStorageSync('acceptance_project_info')
    
    if (projectInfoStr) {
      currentProject.value = JSON.parse(projectInfoStr)
      console.log('项目信息加载成功:', currentProject.value)
    } else if (projectId) {
      // 如果只有 ID，显示简化信息
      currentProject.value = {
        id: projectId,
        name: `项目 #${projectId}`,
        description: '点击查看详情'
      }
    }
  } catch (error) {
    console.error('加载项目信息失败:', error)
  }
}

// 跳转到个人中心
function goToProfile() {
  uni.switchTab({ url: '/pages/profile/index' })
}

// 跳转到项目详情
function goToProject() {
  uni.navigateTo({ url: '/pages/project/index' })
}

// 加载统计数据（模拟数据，实际应从后端API获取）
function loadStatsData() {
  try {
    // 这里可以从 localStorage 或后端 API 获取真实数据
    // 目前使用模拟数据
    statsData.value = {
      projects: uni.getStorageSync('project_total_count') || 0,
      documents: Math.floor(Math.random() * 50) + 10,
      completed: Math.floor(Math.random() * 15) + 1
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 快速操作
function quickAction(action) {
  switch (action) {
    case 'newProject':
      uni.navigateTo({ url: '/pages/project/index' })
      break
    case 'uploadDoc':
      uni.showToast({
        title: '功能开发中',
        icon: 'none'
      })
      break
    case 'viewReports':
      uni.navigateTo({ url: '/pages/reports/acceptance/index' })
      break
    case 'settings':
      uni.switchTab({ url: '/pages/profile/index' })
      break
    default:
      break
  }
}

// 加载最近活动（模拟数据）
function loadRecentActivities() {
  try {
    // 这里可以从后端API获取真实数据
    const mockActivities = [
      {
        id: 1,
        title: '完成了项目信息提取',
        time: '2小时前',
        icon: 'checkmarkempty',
        iconColor: '#16a34a',
        iconBg: '#dcfce7',
        type: 'extract'
      },
      {
        id: 2,
        title: '生成了监测方案',
        time: '5小时前',
        icon: 'compose',
        iconColor: '#2563eb',
        iconBg: '#dbeafe',
        type: 'plan'
      },
      {
        id: 3,
        title: '上传了环评报告',
        time: '1天前',
        icon: 'cloud-upload',
        iconColor: '#7c3aed',
        iconBg: '#f3e8ff',
        type: 'upload'
      }
    ]
    
    recentActivities.value = mockActivities
  } catch (error) {
    console.error('加载最近活动失败:', error)
  }
}

// 点击活动项
function onActivityTap(activity) {
  console.log('点击活动:', activity)
  // 根据活动类型跳转到对应页面
  switch (activity.type) {
    case 'extract':
    case 'plan':
      uni.navigateTo({ url: '/pages/reports/acceptance/index' })
      break
    case 'upload':
      uni.navigateTo({ url: '/pages/project/index' })
      break
    default:
      break
  }
}

// 查看全部活动
function viewAllActivities() {
  uni.showToast({
    title: '功能开发中',
    icon: 'none'
  })
}

// 刷新环保小贴士
function refreshTip() {
  currentTipIndex.value = (currentTipIndex.value + 1) % tips.length
  currentTip.value = tips[currentTipIndex.value]
}

// 初始化小贴士
function initTip() {
  currentTipIndex.value = Math.floor(Math.random() * tips.length)
  currentTip.value = tips[currentTipIndex.value]
}

// 加载系统公告
function loadAnnouncement() {
  try {
    // 这里可以从后端API获取真实公告
    // 示例：显示一条公告
    const hasAnnouncement = Math.random() > 0.5
    if (hasAnnouncement) {
      systemAnnouncement.value = '系统测试'
    }
  } catch (error) {
    console.error('加载系统公告失败:', error)
  }
}

// 关闭公告
function closeAnnouncement() {
  systemAnnouncement.value = ''
}

// Tab 页集合：用于判断是否使用 switchTab
const TAB_PAGES = new Set([
  '/pages/home/index',
  '/pages/knowledge/index',
  '/pages/profile/index',
])

// 功能卡片配置（可后续服务端下发）
const cards = ref([
  // {
  //   id: 'chat',
  //   title: 'AI问答',
  //   subtitle: '环保领域智能问答',
  //   icon: 'chat',
  //   path: '/pages/chat/index',
  //   isTab: false,
  //   color: '#10b981'
  // },
  // {
  //   id: 'doc',
  //   title: '报告生成',
  //   subtitle: '模板+资料智能生成',
  //   icon: 'compose',
  //   path: '/pages/doc-generator/index',
  //   isTab: false,
  //   color: '#3b82f6'
  // },
  // {
  //   id: 'review',
  //   title: '合规审查',
  //   subtitle: '文档合规性智能审查',
  //   icon: 'calendar',
  //   path: '/pages/compliance/index',
  //   isTab: false,
  //   color: '#f59e0b'
  // },
  {
    id: 'project',
    title: '项目管理',
    subtitle: '企业项目管理，包含项目新建、修改等',
    icon: 'calendar',
    path: '/pages/project/index',
    isTab: true,
    color: '#aaaa00',
  	// status: 'beta',
  },
  {
    id: 'acceptance',
    title: '环评竣工验收',
    subtitle: '环评竣工验收全流程，包含验收报告生成',
    icon: 'flag',
    path: '/pages/reports/acceptance/index',
    isTab: false,
    // status: 'beta',
    color: '#8b5cf6'
  },
  // {
  //   id: 'eia',
  //   title: '环评报告',
  //   subtitle: '环评行业报告辅助',
  //   icon: 'paperplane',
  //   path: '/pages/reports/eia/index',
  //   isTab: false,
  //   status: 'beta',
  //   color: '#ef4444'
  // },
  // {
  //   id: 'kb',
  //   title: '知识库',
  //   subtitle: '资料管理与检索',
  //   icon: 'folder-add',
  //   path: '/pages/knowledge/index',
  //   isTab: true,
  //   color: '#06b6d4'
  // },
 //  {
 //    id: 'reconnoitre',
 //    title: '现场踏查',
 //    subtitle: '根据建设项目情况及业务要求，生成现场踏勘指引。',
 //    icon: 'map-pin-ellipse',
 //    path: '/pages/reconnoitre/index',
 //    isTab: true,
 //    color: '#aa55ff',
	// status: 'beta',
 //  },
  // {
  //   id: 'ledger',
  //   title: '环保台账',
  //   subtitle: '企业环境管理的基础，也是环保部门执法检查的重点内容',
  //   icon: 'calendar',
  //   path: '/pages/ledger/index',
  //   isTab: true,
  //   color: '#00007f',
  // 	status: 'beta',
  // },
  
])

const keyword = ref('')
const filteredCards = computed(() => {
  const kw = keyword.value.trim()
  if (!kw) return cards.value
  return cards.value.filter((c) =>
    [c.title, c.subtitle, c.id].some((t) => String(t).toLowerCase().includes(kw.toLowerCase()))
  )
})

function onCardTap(item) {
  if (!item?.path) return
  const url = item.path.startsWith('/') ? item.path : `/${item.path}`
  // Tab 页使用 switchTab，否则 navigateTo
  if (TAB_PAGES.has(url)) {
    uni.switchTab({ url })
  } else {
    uni.navigateTo({ url })
  }
}

// 获取图标背景颜色
function getIconBgColor(color) {
  if (!color) return '#f0fdf4'
  return `${color}15` // 添加透明度
}

// 获取图标颜色
function getIconColor(color) {
  return color || '#276019'
}
</script>

<style lang="scss" scoped>
.home {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 32rpx;
  background-color: #f8faf9;
  padding: 32rpx;
  min-height: 100vh;
}

// 顶部渐变背景
.home__bg-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 400rpx;
  background: linear-gradient(135deg, #166534 0%, #15803d 50%, #16a34a 100%);
  opacity: 0.08;
  z-index: 0;
  pointer-events: none;
}

// 用户信息卡片
.home__user-card {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  background: linear-gradient(135deg, #166534 0%, #15803d 100%);
  border-radius: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(22, 101, 52, 0.2);
}

.user-card__left {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.user-card__avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10rpx);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3rpx solid rgba(255, 255, 255, 0.3);
}

.user-card__avatar-text {
  font-size: 40rpx;
  font-weight: 700;
  color: #ffffff;
}

.user-card__info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.user-card__name {
  font-size: 36rpx;
  font-weight: 600;
  color: #ffffff;
  line-height: 1.2;
}

.user-card__company {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.3;
}

.user-card__right {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10rpx);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.user-card__right:active {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 0.3);
}

// 项目看板
.home__project-board {
  position: relative;
  z-index: 1;
  background: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(15, 23, 42, 0.08);
  border: 1rpx solid #e5e7eb;
}

.project-board__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.project-board__title-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.project-board__title {
  font-size: 28rpx;
  font-weight: 600;
  color: #166534;
}

.project-board__action {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 20rpx;
  background: #f0fdf4;
  border-radius: 12rpx;
  transition: all 0.2s ease;
}

.project-board__action:active {
  background: #dcfce7;
  transform: scale(0.98);
}

.project-board__action-text {
  font-size: 24rpx;
  color: #166534;
  font-weight: 500;
}

.project-board__content {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.project-board__name {
  font-size: 32rpx;
  font-weight: 600;
  color: #0f172a;
  line-height: 1.3;
}

.project-board__desc {
  font-size: 26rpx;
  color: #64748b;
  line-height: 1.5;
}

.project-board__meta {
  display: flex;
  align-items: center;
  gap: 24rpx;
  margin-top: 8rpx;
}

.project-board__meta-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.project-board__meta-text {
  font-size: 24rpx;
  color: #64748b;
}

// 数据统计卡片
.home__stats-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
}

.stats-card {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 28rpx;
  border-radius: 20rpx;
  background: #ffffff;
  box-shadow: 0 4rpx 20rpx rgba(15, 23, 42, 0.08);
  transition: all 0.3s ease;
}

.stats-card:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 10rpx rgba(15, 23, 42, 0.12);
}

.stats-card__icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stats-card--green .stats-card__icon {
  background: linear-gradient(135deg, #166534 0%, #16a34a 100%);
}

.stats-card--blue .stats-card__icon {
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
}

.stats-card--purple .stats-card__icon {
  background: linear-gradient(135deg, #6d28d9 0%, #8b5cf6 100%);
}

.stats-card__content {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  flex: 1;
  min-width: 0;
}

.stats-card__value {
  font-size: 36rpx;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.2;
}

.stats-card__label {
  font-size: 22rpx;
  color: #64748b;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

// 快速操作
.home__quick-actions {
  position: relative;
  z-index: 1;
  background: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(15, 23, 42, 0.08);
  border: 1rpx solid #f1f5f9;
}

.quick-actions__header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 24rpx;
}

.quick-actions__title {
  font-size: 28rpx;
  font-weight: 600;
  color: #0f172a;
}

.quick-actions__list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24rpx;
}

.quick-action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  transition: all 0.2s ease;
}

.quick-action-item:active {
  transform: scale(0.95);
}

.quick-action-item__icon {
  width: 88rpx;
  height: 88rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.quick-action-item:active .quick-action-item__icon {
  transform: scale(0.9);
}

.quick-action-item__text {
  font-size: 24rpx;
  color: #475569;
  text-align: center;
  line-height: 1.3;
}

// 搜索框
.home__search {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 16rpx;
  height: 88rpx;
  border-radius: 20rpx;
  padding: 0 28rpx;
  background: #ffffff;
  box-shadow: 0 4rpx 20rpx rgba(15, 23, 42, 0.08);
  border: 1rpx solid #e2e8f0;
  transition: all 0.2s ease;
}

.home__search:focus-within {
  box-shadow: 0 4rpx 24rpx rgba(22, 101, 52, 0.15);
  border-color: #16a34a;
}

.home__search-input {
  flex: 1;
  height: 100%;
  font-size: 28rpx;
  color: #0f172a;
}

// 功能区标题
.home__section-header {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  margin-top: 16rpx;
}

.home__section-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.2;
}

.home__section-subtitle {
  font-size: 26rpx;
  color: #64748b;
  line-height: 1.4;
}

// 功能卡片网格
.home__grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;

  // 桌面端更高密度
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 32rpx;
  }
}

.home__card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  padding: 32rpx;
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 4rpx 24rpx rgba(15, 23, 42, 0.08);
  border: 1rpx solid #f1f5f9;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.home__card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4rpx;
  background: linear-gradient(90deg, #166534, #16a34a);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.home__card:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 12rpx rgba(15, 23, 42, 0.12);
}

.home__card--disabled {
  opacity: 0.5;
}

.home__card--beta::before {
  opacity: 1;
}

.home__card-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.home__card:active .home__card-icon {
  transform: scale(0.95);
}

.home__card-body {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  flex: 1;
}

.home__card-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #0f172a;
  line-height: 1.3;
}

.home__card-subtitle {
  font-size: 26rpx;
  color: #64748b;
  line-height: 1.4;
}

.home__card-badge {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  font-size: 20rpx;
  font-weight: 600;
  padding: 6rpx 12rpx;
  border-radius: 8rpx;
  background: linear-gradient(135deg, #166534 0%, #16a34a 100%);
  color: #ffffff;
  box-shadow: 0 2rpx 8rpx rgba(22, 101, 52, 0.3);
}

.home__card-soon {
  position: absolute;
  right: 20rpx;
  bottom: 20rpx;
  font-size: 22rpx;
  color: #94a3b8;
  font-weight: 500;
}

.home__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24rpx;
  padding: 120rpx 0;
  color: #94a3b8;
}

.home__empty-text {
  font-size: 28rpx;
  color: #64748b;
}

// 最近活动
.home__recent-activity {
  position: relative;
  z-index: 1;
  background: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(15, 23, 42, 0.08);
  border: 1rpx solid #f1f5f9;
}

.recent-activity__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.recent-activity__title-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.recent-activity__title {
  font-size: 28rpx;
  font-weight: 600;
  color: #0f172a;
}

.recent-activity__more {
  font-size: 24rpx;
  color: #166534;
  font-weight: 500;
}

.recent-activity__list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 20rpx;
  border-radius: 16rpx;
  background: #f8faf9;
  transition: all 0.2s ease;
}

.activity-item:active {
  background: #f0fdf4;
  transform: scale(0.98);
}

.activity-item__icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-item__content {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  flex: 1;
  min-width: 0;
}

.activity-item__title {
  font-size: 28rpx;
  color: #0f172a;
  font-weight: 500;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.activity-item__time {
  font-size: 24rpx;
  color: #94a3b8;
  line-height: 1.3;
}

.activity-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  padding: 60rpx 0;
}

.activity-empty__text {
  font-size: 26rpx;
  color: #94a3b8;
}

// 环保小贴士
.home__tips-card {
  position: relative;
  z-index: 1;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-radius: 24rpx;
  padding: 32rpx;
  border: 2rpx solid #bbf7d0;
}

.tips-card__header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.tips-card__icon {
  width: 48rpx;
  height: 48rpx;
  border-radius: 12rpx;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tips-card__title {
  font-size: 28rpx;
  font-weight: 600;
  color: #166534;
}

.tips-card__content {
  margin-bottom: 20rpx;
}

.tips-card__text {
  font-size: 26rpx;
  color: #15803d;
  line-height: 1.6;
}

.tips-card__footer {
  display: flex;
  justify-content: flex-end;
}

.tips-card__refresh {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 24rpx;
  color: #16a34a;
  font-weight: 500;
  padding: 12rpx 20rpx;
  background: #ffffff;
  border-radius: 12rpx;
  transition: all 0.2s ease;
}

.tips-card__refresh:active {
  background: #f0fdf4;
  transform: scale(0.95);
}

// 系统公告
.home__announcement {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 24rpx 28rpx;
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border-radius: 20rpx;
  border: 2rpx solid #fde68a;
}

.announcement__icon {
  flex-shrink: 0;
}

.announcement__text {
  flex: 1;
  font-size: 26rpx;
  color: #92400e;
  line-height: 1.5;
}

.announcement__close {
  flex-shrink: 0;
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.announcement__close:active {
  background: rgba(0, 0, 0, 0.05);
  transform: scale(0.9);
}

.home__safe-bottom {
  height: env(safe-area-inset-bottom);
}

/* 响应式布局 */
@media (max-width: 768px) {
  .home__stats-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 16rpx;
  }
  
  .stats-card {
    flex-direction: column;
    padding: 24rpx 16rpx;
    gap: 12rpx;
  }
  
  .stats-card__icon {
    width: 56rpx;
    height: 56rpx;
  }
  
  .stats-card__value {
    font-size: 32rpx;
  }
  
  .stats-card__label {
    font-size: 20rpx;
    text-align: center;
  }
  
  .quick-actions__list {
    grid-template-columns: repeat(4, 1fr);
    gap: 20rpx;
  }
  
  .quick-action-item__icon {
    width: 72rpx;
    height: 72rpx;
  }
  
  .quick-action-item__text {
    font-size: 22rpx;
  }
  
  .recent-activity__list {
    gap: 12rpx;
  }
  
  .activity-item {
    padding: 16rpx;
  }
  
  .activity-item__icon {
    width: 56rpx;
    height: 56rpx;
  }
}

/* 桌面端悬停效果 */
@media (min-width: 768px) {
  .home__card:hover {
    transform: translateY(-4rpx);
    box-shadow: 0 12rpx 40rpx rgba(15, 23, 42, 0.15);
    border-color: #e2e8f0;
  }
  
  .home__card:hover::before {
    opacity: 1;
  }
  
  .home__card:hover .home__card-icon {
    transform: scale(1.05);
  }
  
  .stats-card:hover {
    transform: translateY(-2rpx);
    box-shadow: 0 8rpx 32rpx rgba(15, 23, 42, 0.12);
  }
  
  .quick-action-item:hover {
    transform: scale(1.05);
  }
  
  .quick-action-item:hover .quick-action-item__icon {
    transform: scale(1.1);
  }
  
  .activity-item:hover {
    background: #f0fdf4;
    transform: translateX(4rpx);
  }
  
  .tips-card__refresh:hover {
    background: #f0fdf4;
    transform: scale(1.05);
  }
  
  .user-card__right:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.05);
  }
  
  .project-board__action:hover {
    background: #dcfce7;
    transform: scale(1.02);
  }
  
  .recent-activity__more:hover {
    text-decoration: underline;
  }
}
</style>