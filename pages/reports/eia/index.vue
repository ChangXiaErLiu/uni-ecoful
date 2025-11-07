<!-- 环评报告占位页（UTF-8, 中文注释） -->
<template>
  <app-layout current="pages/reports/eia/index">
    <view class="placeholder">
      <view class="placeholder__card">
        <text class="placeholder__title">环评报告</text>
        <text class="placeholder__desc">这里将提供环评报告的智能生成与审查能力</text>
        <text class="placeholder__tip">当前为占位页面，后续将接入业务流程</text>
      </view>
    </view>
  </app-layout>
</template>

<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import { onShow } from '@dcloudio/uni-app'
import { navTitleStore } from '@/stores/navTitle.js'

const navTitle = navTitleStore()
onShow(() => navTitle.setTitle('环评报告'))
</script>

<style lang="scss" scoped>
.placeholder {
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx;
}

.placeholder__card {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 48rpx;
  box-shadow: 0 12rpx 40rpx rgba(15, 23, 42, 0.08);
  text-align: center;
}

.placeholder__title {
  font-size: 40rpx;
  font-weight: 600;
  color: #0f172a;
}

.placeholder__desc {
  margin-top: 12rpx;
  font-size: 26rpx;
  color: #64748b;
}

.placeholder__tip {
  margin-top: 18rpx;
  font-size: 24rpx;
  color: #94a3b8;
}
</style>

