<!-- 修改登录密码页面（UTF-8，中文注释） -->
<template>
  <AppLayout current="pages/profile/changePassword">
    <view class="profile-page">
      <view class="profile__card">
        <view class="profile__card-header">
          <uni-icons type="locked-filled" size="20" color="#276019" />
          <text class="profile__card-title">修改登录密码</text>
        </view>
        <view class="profile__card-content">
          <uni-forms :modelValue="form" :rules="rules" ref="formRef">
            <view class="form-row">
              <text class="form-label">旧密码</text>
              <uni-easyinput v-model="form.oldPwd" type="password" placeholder="请输入旧密码" :clearable="true" />
            </view>
            <view class="form-row">
              <text class="form-label">新密码</text>
              <uni-easyinput v-model="form.newPwd" type="password" placeholder="至少8位，含字母和数字" />
              <view class="hint-row">
                <text class="form-hint">强度：{{ strengthText }}</text>
              </view>
            </view>
            <view class="form-row">
              <text class="form-label">确认新密码</text>
              <uni-easyinput v-model="form.confirmPwd" type="password" placeholder="请再次输入新密码" />
            </view>
          </uni-forms>
        </view>
      </view>

      <view class="actions">
        <button class="profile__submit-btn" :disabled="submitting" @tap="handleSubmit">{{ submitting ? '提交中...' : '确认修改' }}</button>
      </view>

      <view class="safe-area-bottom" />
    </view>
  </AppLayout>
</template>

<script setup>
// UTF-8，中文注释
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import AppLayout from '@/components/layout/AppLayout.vue'
import { navTitleStore } from '@/stores/navTitle.js'
import { request } from '@/utils/request.js'

const navTitle = navTitleStore()
onShow(() => navTitle.setTitle('修改密码'))

const formRef = ref(null)
const form = ref({ oldPwd: '', newPwd: '', confirmPwd: '' })
const submitting = ref(false)

// 简易强度评估
const strengthText = computed(() => {
  const p = form.value.newPwd || ''
  let score = 0
  if (p.length >= 8) score++
  if (/[A-Z]/.test(p)) score++
  if (/[a-z]/.test(p)) score++
  if (/\d/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  return ['很弱','较弱','一般','较强','很强'][Math.max(0, Math.min(score-1, 4))]
})

const rules = {
  oldPwd: { required: true, errorMessage: '请输入旧密码' },
  newPwd: {
    required: true,
    errorMessage: '请输入新密码',
    validateFunction: (rule, value, data, callback) => {
      const v = String(value || '')
      if (v.length < 8) return callback('至少8位')
      if (!/[A-Za-z]/.test(v) || !/\d/.test(v)) return callback('需包含字母和数字')
      return callback()
    }
  },
  confirmPwd: {
    required: true,
    errorMessage: '请确认新密码',
    validateFunction: (rule, value, data, callback) => {
      if (String(value || '') !== String(form.value.newPwd || '')) return callback('两次输入不一致')
      return callback()
    }
  }
}

async function handleSubmit() {
  try {
    await formRef.value?.validate?.()
  } catch (e) {
    return
  }
  submitting.value = true
  try {
    await request({ url: '/user/password/change', method: 'POST', data: { oldPwd: form.value.oldPwd, newPwd: form.value.newPwd } })
    // 是否同时下线其他设备
    uni.showModal({
      title: '修改成功',
      content: '是否同时下线其他设备？',
      success: async (res) => {
        if (res.confirm) {
          try { await request({ url: '/user/sessions/logout-others', method: 'POST', data: {} }) } catch (e) {}
        }
        uni.showToast({ title: '密码已修改', icon: 'success' })
        setTimeout(() => uni.navigateBack({ delta: 1 }), 600)
      }
    })
  } catch (e) {
    uni.showToast({ title: '修改失败，请稍后重试', icon: 'none' })
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
.hint-row { padding: 0 32rpx 16rpx; }
.form-hint { font-size: 26rpx; color: #94a3b8; }
.actions { padding: 0 24rpx; }
.profile__submit-btn { width: 100%; background: #276019; color: #fff; border: none; border-radius: 16rpx; padding: 24rpx; font-size: 32rpx; font-weight: 600; }
.profile__submit-btn:active { opacity: .9; transform: scale(.98); }
.safe-area-bottom { height: env(safe-area-inset-bottom); min-height: 0rpx; }
</style>

