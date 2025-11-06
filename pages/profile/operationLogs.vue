<!-- 操作/登录日志页面（UTF-8，中文注释） -->
<template>
  <AppLayout current="pages/profile/operationLogs">
    <view class="profile-page">
      <view class="profile__card">
        <view class="profile__card-header">
          <uni-icons type="list" size="20" color="#276019" />
          <text class="profile__card-title">操作日志</text>
        </view>
        <view class="profile__card-content">
          <view v-if="loading && page===1" class="list-hint">加载中...</view>
          <view v-else-if="list.length===0" class="list-hint">暂无日志</view>

          <view v-for="(item, idx) in list" :key="item.id || idx" class="log-row">
            <view class="log-main">
              <text class="log-type">{{ item.type || '操作' }}</text>
              <text class="log-time">{{ item.time || '-' }}</text>
            </view>
            <view class="log-sub">{{ (item.device || '-') + ' · ' + (item.ip || '-') + ' · ' + (item.result || '-') }}</view>
          </view>

          <view v-if="hasMore" class="load-more">
            <button class="btn-secondary" :disabled="loadingMore" @tap="loadMore">{{ loadingMore ? '加载中...' : '加载更多' }}</button>
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
onShow(() => {
  navTitle.setTitle('操作日志')
  init()
})

const list = ref([])
const page = ref(1)
const pageSize = 20
const hasMore = ref(false)
const loading = ref(false)
const loadingMore = ref(false)

async function init() {
  page.value = 1
  list.value = []
  await fetchList()
}

async function fetchList() {
  if (page.value === 1) loading.value = true
  try {
    const res = await request({ url: `/user/logs?page=${page.value}&size=${pageSize}`, method: 'GET' })
    const rows = res?.list || []
    list.value = page.value === 1 ? rows : list.value.concat(rows)
    const total = res?.page?.total || 0
    const current = list.value.length
    hasMore.value = current < total
  } catch (e) {
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
</script>

<style lang="scss" scoped>
.profile-page { display: flex; flex-direction: column; gap: 24rpx; background-color: #f5f7fa; }
.profile__card { background-color: #ffffff; border-radius: 20rpx; overflow: hidden; }
.profile__card-header { display: flex; align-items: center; gap: 16rpx; padding: 32rpx 32rpx 24rpx; border-bottom: 1rpx solid #f1f5f9; }
.profile__card-title { font-size: 30rpx; font-weight: 600; color: #0f172a; }
.profile__card-content { padding: 0; }

.log-row { padding: 24rpx 32rpx; border-bottom: 1rpx solid #f8fafc; }
.log-main { display: flex; justify-content: space-between; gap: 16rpx; }
.log-type { font-size: 28rpx; color: #0f172a; font-weight: 600; }
.log-time { font-size: 26rpx; color: #64748b; }
.log-sub { margin-top: 8rpx; font-size: 26rpx; color: #94a3b8; }

.load-more { display: flex; justify-content: center; padding: 20rpx 0 28rpx; }
.btn-secondary { padding: 16rpx 24rpx; background: #f1f5f9; color: #276019; border: none; border-radius: 12rpx; font-size: 26rpx; }

.list-hint { padding: 32rpx; font-size: 28rpx; color: #94a3b8; text-align: center; }
.safe-area-bottom { height: env(safe-area-inset-bottom); min-height: 0rpx; }
</style>

