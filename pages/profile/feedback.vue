<!-- 意见反馈页面（UTF-8，中文注释） -->
<template>
  <AppLayout current="pages/profile/feedback">
    <view class="profile-page">
      <view class="profile__card">
        <view class="profile__card-header">
          <uni-icons type="help" size="20" color="#276019" />
          <text class="profile__card-title">意见反馈</text>
        </view>
        <view class="profile__card-content">
          <uni-forms :modelValue="form" :rules="rules" ref="formRef">
            <view class="form-row">
              <text class="form-label">问题类型</text>
              <picker mode="selector" :range="typeOptions" :value="typeIndex" @change="e=>typeIndex=Number(e.detail.value)">
                <view class="profile__picker">{{ typeOptions[typeIndex] }}</view>
              </picker>
            </view>
            <view class="form-row">
              <text class="form-label">问题描述</text>
              <uni-easyinput type="textarea" v-model="form.content" placeholder="请描述您遇到的问题或建议" />
            </view>
            <view class="form-row">
              <text class="form-label">联系方式</text>
              <uni-easyinput v-model="form.contact" placeholder="手机号或邮箱（选填）" />
            </view>
            <view class="form-row">
              <text class="form-label">截图/图片（最多6张）</text>
              <uni-file-picker v-model="files" fileMediatype="image" mode="grid" :limit="6" />
            </view>
          </uni-forms>
        </view>
      </view>

      <view class="actions">
        <button class="profile__submit-btn" :disabled="submitting" @tap="handleSubmit">{{ submitting ? '提交中...' : '提交反馈' }}</button>
      </view>

      <view class="safe-area-bottom" />
    </view>
  </AppLayout>
</template>

<script setup>
// UTF-8，中文注释
import { ref, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import AppLayout from '@/components/layout/AppLayout.vue'
import { navTitleStore } from '@/stores/navTitle.js'
import { request} from '@/utils/request.js'

const navTitle = navTitleStore()
onShow(() => navTitle.setTitle('意见反馈'))

const typeOptions = ['功能建议', 'BUG问题', '体验优化', '其他']
let typeIndex = ref(0)

const formRef = ref(null)
const form = ref({ type: typeOptions[0], content: '', contact: '' })
watch(typeIndex, (idx) => { form.value.type = typeOptions[idx] })

const files = ref([]) // uni-file-picker 绑定的文件列表
const submitting = ref(false)

const rules = {
  content: {
    required: true,
    errorMessage: '请填写问题描述',
    validateFunction: (rule, value, data, callback) => {
      const v = String(value || '').trim()
      if (v.length < 10) return callback('请至少填写10个字')
      callback()
    }
  }
}

async function uploadAll() {
  if (!files.value || files.value.length === 0) return []
  const list = []
  for (const f of files.value) {
    const path = f.url || f.path || f.tempFilePath
    if (!path) continue
    try {
      const res = await new Promise((resolve, reject) => {
        uni.uploadFile({
          url: BASE_URL + '/upload',
          filePath: path,
          name: 'file',
          success: (r) => {
            try {
              const data = JSON.parse(r.data || '{}')
              resolve(data)
            } catch (e) { resolve({ url: '' }) }
          },
          fail: reject
        })
      })
      if (res?.url) list.push({ url: res.url, id: res.id })
    } catch (e) {}
  }
  return list
}

async function handleSubmit() {
  try { await formRef.value?.validate?.() } catch (e) { return }
  submitting.value = true
  try {
    const images = await uploadAll()
    const payload = { ...form.value, images }
    const res = await request({ url: '/feedback/create', method: 'POST', data: payload })
    const ticket = res?.ticketId ? `（单号：${res.ticketId}）` : ''
    uni.showToast({ title: `提交成功${ticket}`, icon: 'success' })
    setTimeout(() => uni.navigateBack({ delta: 1 }), 800)
  } catch (e) {
    uni.showToast({ title: '提交失败，请稍后再试', icon: 'none' })
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.profile-page { display: flex; flex-direction: column; gap: 24rpx; background-color: #f5f7fa; }
.profile__card { background-color: #ffffff; border-radius: 20rpx; overflow: hidden; }
.profile__card-header { display: flex; align-items: center; gap: 16rpx; padding: 32rpx 32rpx 24rpx; border-bottom: 1rpx solid #f1f5f9; }
.profile__card-title { font-size: 30rpx; font-weight: 600; color: #0f172a; }
.profile__card-content { padding: 0; }

.form-row { display: flex; flex-direction: column; gap: 16rpx; padding: 24rpx 32rpx; }
.form-label { font-size: 28rpx; color: #334155; }
.profile__picker { padding: 16rpx 24rpx; border-radius: 16rpx; background-color: #f8fafc; color: #276019; font-size: 28rpx; font-weight: 500; min-width: 200rpx; text-align: left; }

.actions { padding: 0 24rpx; }
.profile__submit-btn { width: 100%; background: #276019; color: #fff; border: none; border-radius: 16rpx; padding: 24rpx; font-size: 32rpx; font-weight: 600; }
.profile__submit-btn:active { opacity: .9; transform: scale(.98); }
.safe-area-bottom { height: env(safe-area-inset-bottom); min-height: 0rpx; }
</style>

