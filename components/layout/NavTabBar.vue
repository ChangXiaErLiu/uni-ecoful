<!-- 移动端的导航栏 -->
<template>
  <view class="nav-tabbar">
    <view
      v-for="item in items"
      :key="item.path"
      class="nav-tabbar__item"
      :class="{ 'nav-tabbar__item--active': item.path === current }"
      @tap="emitNavigate(item)"
    >
      <uni-icons
        class="nav-tabbar__icon"
        :type="item.icon"
        :color="item.path === current ? '#2563eb' : '#94a3b8'"
        size="24"
      />
      <text class="nav-tabbar__label">{{ item.label }}</text>
    </view>
  </view>
</template>

<script setup>
// 底部导航栏（移动端）
const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  current: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['navigate'])

function emitNavigate(item) {
  emit('navigate', item)
}
</script>

<style lang="scss" scoped>
.nav-tabbar {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 12rpx 0;
  height: 100rpx;
  background-color: #ffffff;
  border-radius: 24rpx 24rpx 0 0;
  box-shadow: 0 -12rpx 30rpx rgba(15, 23, 42, 0.08);
}

.nav-tabbar__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: #64748b;
  font-size: 24rpx;
}

.nav-tabbar__item--active {
  color: #2563eb;
  font-weight: 600;
}

.nav-tabbar__icon {
  font-size: 30rpx;
  margin-bottom: 6rpx;
}
</style>
