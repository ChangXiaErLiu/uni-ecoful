<!-- web端的导航栏 -->
<template>
  <view class="nav-sider">
    <view class="nav-sider__brand">
      <image class="nav-sider__logo" src="/static/logo.jpg" mode="aspectFit" />
      <image class="nav-sider__ecoful" src="/static/ecoful.png" mode="aspectFit" />
      <!-- <text class="nav-sider__brand-text">粤风环保</text> -->
    </view>

    <!-- 菜单区（无滚动条） -->
    <view class="nav-sider__menu">
      <view
        v-for="item in items"
        :key="item.path"
        class="nav-sider__item"
        :class="{ 'nav-sider__item--active': item.path === current }"
        @tap="emitNavigate(item)"
      >
        <view class="nav-sider__icon-wrapper">
          <uni-icons
            class="nav-sider__icon"
            :type="item.icon"
            :color="item.path === current ? '#ffffff' : '#00aa00'"
            size="20"
          />
        </view>
        <text class="nav-sider__label">{{ item.label }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  items: { type: Array, default: () => [] },
  current: { type: String, default: '' },
  collapsed: { type: Boolean, default: false }
})
const emit = defineEmits(['navigate'])

function toggle() {
  collapsed.value = !collapsed.value
}

function emitNavigate(item) {
  emit('navigate', item)
}
</script>

<style lang="scss" scoped>
.nav-sider {
  display: flex;
  flex-direction: column;
  height: 100%;
  box-shadow: 4rpx 0 20rpx rgba(0, 170, 0, 0.08);
  transition: width 180ms ease;
}

/* 品牌区 */
.nav-sider__brand {
  display: flex;
  align-items: center;
  padding: 32rpx 24rpx;
  gap: 16rpx;
  background: #ffffff;
}

.nav-sider__logo {
  width: 98rpx;
  height: 98rpx;
  border-radius: 8rpx;
}

.nav-sider__ecoful {
  width: 198rpx;
  height: 98rpx;
  border-radius: 8rpx;
}

.nav-sider__brand-text {
  font-size: 28rpx;
  font-weight: bolder;
  color: #00aa00;
  letter-spacing: 0.5rpx;
}

/* 菜单容器：无滚动条、溢出隐藏 */
.nav-sider__menu {
  flex: 1;
  padding: 24rpx 16rpx;
  overflow: hidden; 
  /* H5 隐藏滚动条（即便 overflow 改成 auto 也不会显示） */
  &::-webkit-scrollbar {
    width: 0;
    height: 0;
    display: none;
  }
}

/* 菜单项 */
.nav-sider__item {
  position: relative;
  display: flex;
  align-items: center;
  padding: 20rpx 18rpx;
  margin: 8rpx 0;
  border-radius: 16rpx;
  font-size: 28rpx;
  line-height: 1.2;
  color: #475569;
  background-color: #ffffff;
  border: 1px solid transparent;
  transition: all 200ms ease-out;
  cursor: pointer;
}

.nav-sider__item:not(.nav-sider__item--active):hover {
  background-color: #f0fff0;
  border-color: rgba(0, 170, 0, 0.1);
  transform: translateY(-1rpx);
  box-shadow: 0 4rpx 12rpx rgba(0, 170, 0, 0.1);
}

/* 激活态：使用主题色 */
.nav-sider__item--active {
  color: #ffffff;
  background: #00aa00;
}

/* 图标容器 */
.nav-sider__icon-wrapper {
  width: 48rpx;
  height: 48rpx;
  min-width: 48rpx;
  min-height: 48rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 12rpx;
  margin-right: 16rpx;
  background-color: #f0fff0;
  transition: all 200ms ease-out;
}

.nav-sider__item--active .nav-sider__icon-wrapper {
  background: rgba(255, 255, 255, 0.2);
}

.nav-sider__item:not(.nav-sider__item--active):hover .nav-sider__icon-wrapper {
  background: #e0ffe0;
  transform: scale(1.05);
}

/* 标签文本：收起态隐藏，仅显示图标 */
.nav-sider__label {
  flex: 1;
  font-weight: 500;
  color: currentColor;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: all 180ms ease;

}

/* 小屏微调（H5 有效，小程序忽略也不影响） */
@media (max-width: 1024px) {
  .nav-sider__item {
    padding: 18rpx 16rpx;
    font-size: 26rpx;
    border-radius: 14rpx;
  }
  
  .nav-sider__icon-wrapper {
    width: 44rpx;
    height: 44rpx;
    margin-right: 14rpx;
    border-radius: 10rpx;
  }
  
  .nav-sider__brand {
    padding: 28rpx 20rpx;
  }
  
  .nav-sider__logo {
    width: 44rpx;
    height: 44rpx;
  }
  
  .nav-sider__brand-text {
    font-size: 26rpx;
  }
}
</style>