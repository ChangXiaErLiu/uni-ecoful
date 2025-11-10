<!-- 首页：功能入口卡片网格（UTF-8, 中文注释） -->
<template>
  <AppLayout current="pages/home/index">
    <view class="home">
      <!-- 头部标题与搜索 -->
      <view class="home__header">
        <view class="home__title-section">
          <text class="home__title">环保 AI 工作台</text>
          <text class="home__subtitle">智能环保助手，提升工作效率</text>
        </view>
        <view class="home__search">
          <uni-icons type="search" size="18" color="#94a3b8" />
          <input 
            v-model="keyword" 
            class="home__search-input" 
            placeholder="搜索功能或关键字" 
            placeholder-style="color: #94a3b8;"
          />
        </view>
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
      
     <!-- #ifndef MP-WEIXIN -->
     <view class="home__safe-bottom"></view>
     <!-- #endif -->
    </view>
  </AppLayout>
</template>

<script setup>
// UTF-8 编码；中文注释
import { computed, ref } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import { onShow } from '@dcloudio/uni-app'
import { navTitleStore } from '@/stores/navTitle.js'

// 设置头部导航标题
const navTitle = navTitleStore()
onShow(() => navTitle.setTitle('环保 AI 工作台'))

// Tab 页集合：用于判断是否使用 switchTab
const TAB_PAGES = new Set([
  '/pages/home/index',
  '/pages/knowledge/index',
  '/pages/profile/index',
])

// 功能卡片配置（可后续服务端下发）
const cards = ref([
  {
    id: 'chat',
    title: 'AI问答',
    subtitle: '环保领域智能问答',
    icon: 'chat',
    path: '/pages/chat/index',
    isTab: false,
    color: '#10b981'
  },
  {
    id: 'doc',
    title: '报告生成',
    subtitle: '模板+资料智能生成',
    icon: 'compose',
    path: '/pages/doc-generator/index',
    isTab: false,
    color: '#3b82f6'
  },
  {
    id: 'review',
    title: '合规审查',
    subtitle: '文档合规性智能审查',
    icon: 'calendar',
    path: '/pages/compliance/index',
    isTab: false,
    color: '#f59e0b'
  },
  {
    id: 'acceptance',
    title: '环评竣工验收',
    subtitle: '环评竣工验收全流程，包含验收报告生成',
    icon: 'flag',
    path: '/pages/reports/acceptance/index',
    isTab: false,
    status: 'beta',
    color: '#8b5cf6'
  },
  {
    id: 'eia',
    title: '环评报告',
    subtitle: '环评行业报告辅助',
    icon: 'paperplane',
    path: '/pages/reports/eia/index',
    isTab: false,
    status: 'beta',
    color: '#ef4444'
  },
  {
    id: 'kb',
    title: '知识库',
    subtitle: '资料管理与检索',
    icon: 'folder-add',
    path: '/pages/knowledge/index',
    isTab: true,
    color: '#06b6d4'
  },
  {
    id: 'reconnoitre',
    title: '现场踏查',
    subtitle: '根据建设项目情况及业务要求，生成现场踏勘指引。',
    icon: 'map-pin-ellipse',
    path: '/pages/reconnoitre/index',
    isTab: true,
    color: '#aa55ff',
	status: 'beta',
  },
  {
    id: 'ledger',
    title: '环保台账',
    subtitle: '企业环境管理的基础，也是环保部门执法检查的重点内容',
    icon: 'calendar',
    path: '/pages/ledger/index',
    isTab: true,
    color: '#00007f',
  	status: 'beta',
  },
  {
    id: 'project',
    title: '项目管理',
    subtitle: '企业项目管理，包含项目新建、修改等',
    icon: 'calendar',
    path: '/pages/project/index',
    isTab: true,
    color: '#aaaa00',
  	status: 'beta',
  },
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
  display: flex;
  flex-direction: column;
  gap: 32rpx;
  // min-height: 100vh;
  padding: 32rpx;
}

.home__header {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.home__title-section {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.home__title {
  font-size: 48rpx;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.2;
}

.home__subtitle {
  font-size: 28rpx;
  color: #64748b;
  line-height: 1.4;
}

.home__search {
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
  box-shadow: 0 4rpx 24rpx rgba(15, 23, 42, 0.12);
  border-color: #3b82f6;
}

.home__search-input {
  flex: 1;
  height: 100%;
  font-size: 28rpx;
  color: #0f172a;
}

.home__grid {
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
  background: linear-gradient(90deg, #10b981, #3b82f6);
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
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

.home__safe-bottom {
  height: env(safe-area-inset-bottom);
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
}
</style>