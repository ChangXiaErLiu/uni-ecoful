<!-- 登录设备/会话管理页面（UTF-8，中文注释） -->
<template>
  <AppLayout current="pages/profile/devices">
    <view class="profile-page">
      <view class="profile__card">
        <view class="profile__card-header">
          <uni-icons type="phone" size="20" color="#276019" />
          <text class="profile__card-title">登录设备管理</text>
        </view>
        <view class="profile__card-content">
          <view v-if="loading" class="list-hint">加载中...</view>
          <view v-else-if="list.length === 0" class="list-hint">暂无设备</view>

          <view v-for="(item, idx) in list" :key="item.id || idx" class="device-row">
            <view class="device-info">
              <view class="device-title">
                <text class="device-name">{{ item.device || '未知设备' }}</text>
                <text v-if="item.isCurrent" class="tag-current">当前设备</text>
              </view>
              <view class="device-sub">
                <text>{{ item.os || '-' }} · {{ item.browser || '-' }} · {{ item.ip || '-' }}</text>
              </view>
              <view class="device-time">最近活跃：{{ item.activeAt || '-' }}</view>
            </view>
            <view class="device-actions">
              <button class="btn-outline" :disabled="item.isCurrent || actingId===item.id" @tap="logoutOne(item)">{{ item.isCurrent ? '使用中' : (actingId===item.id ? '处理中' : '下线') }}</button>
            </view>
          </view>

          <view v-if="hasMore" class="load-more">
            <button class="btn-secondary" :disabled="loadingMore" @tap="loadMore">{{ loadingMore ? '加载中...' : '加载更多' }}</button>
          </view>
        </view>
      </view>

      <view class="actions">
        <button class="danger-btn" :disabled="actingAll" @tap="logoutOthers">一键下线其他设备</button>
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
onShow(() => {
  navTitle.setTitle('设备与会话')
  init()
})

const list = ref([])
const page = ref(1)
const pageSize = 20
const hasMore = ref(false)
const loading = ref(false)
const loadingMore = ref(false)
const actingId = ref(null)
const actingAll = ref(false)

async function init() {
  page.value = 1
  list.value = []
  await fetchList()
}

async function fetchList() {
  if (page.value === 1) loading.value = true
  try {
    const res = await request({ url: `/user/sessions?page=${page.value}&size=${pageSize}`, method: 'GET' })
    const rows = res?.list || []
    list.value = page.value === 1 ? rows : list.value.concat(rows)
    const total = res?.page?.total || 0
    const current = list.value.length
    hasMore.value = current < total
  } catch(e) {
    if (page.value === 1) list.value = []
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    if (page.value === 1) loading.value = false
    loadingMore.value = false
  }
}

function loadMore() {
  if (!hasMore.value || loadingMore.value) return
  loadingMore.value = true
  page.value += 1
  fetchList()
}

function logoutOne(item) {
  if (item.isCurrent) return
  uni.showModal({
    title: '确认下线',
    content: '确定将该设备下线吗？',
    success: async (res) => {
      if (!res.confirm) return
      actingId.value = item.id
      try {
        await request({ url: '/user/sessions/logout', method: 'POST', data: { id: item.id } })
        uni.showToast({ title: '已下线', icon: 'success' })
        // 刷新
        init()
      } catch(e) {
        uni.showToast({ title: '操作失败', icon: 'none' })
      } finally {
        actingId.value = null
      }
    }
  })
}

function logoutOthers() {
  uni.showModal({
    title: '批量下线',
    content: '确定下线除当前设备外的所有会话？',
    success: async (res) => {
      if (!res.confirm) return
      actingAll.value = true
      try {
        await request({ url: '/user/sessions/logout-others', method: 'POST', data: {} })
        uni.showToast({ title: '已下线其他设备', icon: 'success' })
        init()
      } catch(e) {
        uni.showToast({ title: '操作失败', icon: 'none' })
      } finally {
        actingAll.value = false
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.profile-page { display: flex; flex-direction: column; gap: 24rpx; background-color: #f5f7fa; }
.profile__card { background-color: #ffffff; border-radius: 20rpx; overflow: hidden; }
.profile__card-header { display: flex; align-items: center; gap: 16rpx; padding: 32rpx 32rpx 24rpx; border-bottom: 1rpx solid #f1f5f9; }
.profile__card-title { font-size: 30rpx; font-weight: 600; color: #0f172a; }
.profile__card-content { padding: 0; }

.device-row { display: flex; justify-content: space-between; gap: 16rpx; padding: 28rpx 32rpx; border-bottom: 1rpx solid #f8fafc; }
.device-info { flex: 1; min-width: 0; }
.device-title { display: flex; align-items: center; gap: 12rpx; }
.device-name { font-size: 28rpx; color: #0f172a; font-weight: 600; max-width: 520rpx; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tag-current { font-size: 22rpx; color: #276019; background: #e6f4ea; padding: 4rpx 10rpx; border-radius: 8rpx; }
.device-sub { font-size: 26rpx; color: #64748b; margin-top: 6rpx; }
.device-time { font-size: 24rpx; color: #94a3b8; margin-top: 6rpx; }

.device-actions { display: flex; align-items: center; }
.btn-outline { background: #fff; color: #276019; border: 1rpx solid #d1fae5; padding: 12rpx 20rpx; border-radius: 12rpx; font-size: 26rpx; }
.btn-outline:disabled { color: #94a3b8; border-color: #e2e8f0; }

.load-more { display: flex; justify-content: center; padding: 20rpx 0 28rpx; }
.btn-secondary { padding: 16rpx 24rpx; background: #f1f5f9; color: #276019; border: none; border-radius: 12rpx; font-size: 26rpx; }

.actions { padding: 0 24rpx; }
.danger-btn { width: 100%; background: #fee2e2; color: #b91c1c; border: none; border-radius: 16rpx; padding: 24rpx; font-size: 30rpx; font-weight: 600; }

.list-hint { padding: 32rpx; font-size: 28rpx; color: #94a3b8; text-align: center; }
.safe-area-bottom { height: env(safe-area-inset-bottom); min-height: 0rpx; }
</style>

