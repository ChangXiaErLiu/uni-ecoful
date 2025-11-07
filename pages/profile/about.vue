<!-- 关于系统页面（UTF-8，中文注释） -->
<template>
  <AppLayout current="pages/profile/about">
    <view class="profile-page">
      <!-- 顶部信息卡片 -->
      <view class="profile__card">
        <view class="about-top">
          <image class="about-logo" src="/static/logo.png" mode="aspectFit" />
          <view class="about-title">
            <text class="name">{{ info.name || '环保AI系统' }}</text>
            <text class="ver">v{{ info.version || '-' }} ({{ info.build || '-' }})</text>
            <text class="time">更新于：{{ info.updatedAt || '-' }}</text>
          </view>
        </view>
      </view>

      <!-- 详情卡片 -->
      <view class="profile__card">
        <view class="profile__card-header">
          <uni-icons type="info" size="20" color="#276019" />
          <text class="profile__card-title">相关信息</text>
        </view>
        <view class="profile__card-content">
          <view class="profile__card-row" @tap="openNotes">
            <view class="profile__card-left">
              <uni-icons type="flag" size="18" color="#64748b" />
              <text class="profile__card-label">更新日志</text>
            </view>
            <view class="profile__card-right">
              <uni-icons type="right" size="16" color="#94a3b8" />
            </view>
          </view>
          <view class="profile__card-row" @tap="openAgreement('user')">
            <view class="profile__card-left">
              <uni-icons type="checkbox" size="18" color="#64748b" />
              <text class="profile__card-label">用户协议</text>
            </view>
            <view class="profile__card-right">
              <uni-icons type="right" size="16" color="#94a3b8" />
            </view>
          </view>
          <view class="profile__card-row" @tap="openAgreement('privacy')">
            <view class="profile__card-left">
              <uni-icons type="help" size="18" color="#64748b" />
              <text class="profile__card-label">隐私政策</text>
            </view>
            <view class="profile__card-right">
              <uni-icons type="right" size="16" color="#94a3b8" />
            </view>
          </view>
        </view>
      </view>

      <view class="safe-area-bottom" />
    </view>
  </AppLayout>
</template>

<script setup>
// UTF-8，中文注释
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import AppLayout from '@/components/layout/AppLayout.vue'
import { navTitleStore } from '@/stores/navTitle.js'
import { request } from '@/utils/request.js'

const navTitle = navTitleStore()
const info = ref({})

onShow(async () => {
  navTitle.setTitle('关于系统')
  await fetchInfo()
})

async function fetchInfo() {
  try {
    const res = await request({ url: '/app/version', method: 'GET' })
    info.value = res || {}
  } catch (e) {
    info.value = {}
  }
}

function openURLSmart(url) {
  if (!url) {
    uni.showToast({ title: '暂无链接', icon: 'none' })
    return
  }
  // H5/Web 直接打开；小程序复制到剪贴板
  // #ifdef H5
  window?.open?.(url, '_blank')
  // #endif
  // #ifdef MP
  uni.setClipboardData({ data: url, success: () => uni.showToast({ title: '已复制链接', icon: 'success' }) })
  // #endif
}

function openNotes() {
  openURLSmart(info.value?.notesUrl)
}

function openAgreement(type) {
  // 若服务端下发协议链接，可从接口扩展字段获取
  const url = (type === 'user') ? info.value?.userAgreementUrl : info.value?.privacyUrl
  openURLSmart(url)
}
</script>

<style lang="scss" scoped>
.profile-page { display: flex; flex-direction: column; gap: 24rpx; background-color: #f5f7fa; }
.profile__card { background-color: #ffffff; border-radius: 20rpx; overflow: hidden; }
.profile__card-header { display: flex; align-items: center; gap: 16rpx; padding: 32rpx 32rpx 24rpx; border-bottom: 1rpx solid #f1f5f9; }
.profile__card-title { font-size: 30rpx; font-weight: 600; color: #0f172a; }
.profile__card-content { padding: 0; }

.about-top { display: flex; align-items: center; gap: 24rpx; padding: 32rpx; }
.about-logo { width: 120rpx; height: 120rpx; border-radius: 20rpx; border: 1rpx solid #f1f5f9; background: #fff; }
.about-title { display: flex; flex-direction: column; gap: 8rpx; }
.about-title .name { font-size: 34rpx; font-weight: 700; color: #0f172a; }
.about-title .ver { font-size: 26rpx; color: #64748b; }
.about-title .time { font-size: 24rpx; color: #94a3b8; }

.profile__card-row { display: flex; align-items: center; justify-content: space-between; padding: 28rpx 32rpx; border-bottom: 1rpx solid #f8fafc; }
.profile__card-row:last-child { border-bottom: none; }
.profile__card-left { display: flex; align-items: center; gap: 20rpx; flex: 1; }
.profile__card-label { font-size: 28rpx; color: #334155; font-weight: 500; }
.profile__card-right { display: flex; align-items: center; gap: 16rpx; }

.safe-area-bottom { height: env(safe-area-inset-bottom); min-height: 0rpx; }
</style>

