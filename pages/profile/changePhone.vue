<!-- 修改/绑定手机号页面（UTF-8，中文注释） -->
<template>
  <AppLayout current="pages/profile/changePhone">
    <view class="profile-page">
      <!-- 顶部说明 -->
      <view class="profile__card">
        <view class="profile__card-header">
          <uni-icons type="phone" size="20" color="#276019" />
          <text class="profile__card-title">更换手机号</text>
        </view>
        <view class="profile__card-content">
          <view class="profile__card-row">
            <view class="profile__card-left">
              <text class="profile__card-label">当前手机号</text>
            </view>
            <view class="profile__card-right">
              <text class="profile__card-value">{{ maskedCurrentPhone }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 表单区 -->
      <view class="profile__card">
        <view class="profile__card-header">
          <uni-icons type="compose" size="20" color="#276019" />
          <text class="profile__card-title">验证与绑定</text>
        </view>
        <view class="profile__card-content">
          <view class="form-row">
            <text class="form-label">新手机号</text>
            <uni-easyinput v-model="form.phone" type="number" placeholder="请输入新手机号" :clearable="true" />
          </view>

          <!-- 小程序：手机号快捷获取 -->
          <!-- #ifdef MP-WEIXIN -->
          <view class="form-row">
            <text class="form-hint">也可使用微信授权快速获取手机号</text>
            <button class="btn-secondary" open-type="getPhoneNumber" @getphonenumber="onGetPhoneNumber">微信快捷获取</button>
          </view>
          <!-- #endif -->

          <view class="form-row">
            <text class="form-label">验证码</text>
            <view class="code-row">
              <uni-easyinput v-model="form.code" type="number" placeholder="请输入验证码" />
              <button class="btn-code" :disabled="countdown>0 || sending" @tap="sendCode">
                {{ countdown>0 ? `${countdown}s` : (sending ? '发送中' : '获取验证码') }}
              </button>
            </view>
          </view>
        </view>
      </view>

      <!-- 提交按钮 -->
      <view class="actions">
        <button class="profile__submit-btn" :disabled="submitting" @tap="handleSubmit">{{ submitting ? '提交中...' : '确认绑定' }}</button>
      </view>

      <view class="safe-area-bottom" />
    </view>
  </AppLayout>
  
</template>

<script setup>
// UTF-8，中文注释
import { ref, computed, onUnmounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import AppLayout from '@/components/layout/AppLayout.vue'
import { navTitleStore } from '@/stores/navTitle.js'
import { request } from '@/utils/request.js'
import { useUserStore } from '@/api/user.js'

const navTitle = navTitleStore()
onShow(() => navTitle.setTitle('更换手机号'))

const userStore = useUserStore?.() || { profile: null }
const currentPhone = ref(userStore?.profile?.phone || '')
const maskedCurrentPhone = computed(() => {
  const p = currentPhone.value
  if (!p) return '未绑定'
  return String(p).replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
})

const form = ref({ phone: '', code: '' })
const countdown = ref(0)
const sending = ref(false)
const submitting = ref(false)
let timer = null

function validatePhone(phone) {
  return /^1\d{10}$/.test(String(phone || '').trim())
}

function startCountdown(sec = 60) {
  countdown.value = sec
  timer && clearInterval(timer)
  timer = setInterval(() => {
    if (countdown.value <= 1) {
      clearInterval(timer)
      countdown.value = 0
    } else {
      countdown.value -= 1
    }
  }, 1000)
}

async function sendCode() {
  if (!validatePhone(form.value.phone)) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return
  }
  if (countdown.value > 0 || sending.value) return
  sending.value = true
  try {
    await request({ url: '/user/phone/sendCode', method: 'POST', data: { phone: form.value.phone } })
    uni.showToast({ title: '验证码已发送', icon: 'success' })
    startCountdown(60)
  } catch (e) {
    uni.showToast({ title: '发送失败，请稍后重试', icon: 'none' })
  } finally {
    sending.value = false
  }
}

// 小程序：微信快捷获取手机号
function onGetPhoneNumber(e) {
  // #ifdef MP-WEIXIN
  const code = e?.detail?.code
  if (!code) {
    uni.showToast({ title: '获取失败，请手动输入', icon: 'none' })
    return
  }
  uni.showLoading({ title: '获取中' })
  request({ url: '/user/phone/weapp', method: 'POST', data: { code } })
    .then((res) => {
      const phone = res?.phone
      if (validatePhone(phone)) {
        form.value.phone = phone
        uni.showToast({ title: '已获取手机号', icon: 'success' })
      } else {
        uni.showToast({ title: '获取失败，请手动输入', icon: 'none' })
      }
    })
    .catch(() => {
      uni.showToast({ title: '获取失败，请手动输入', icon: 'none' })
    })
    .finally(() => {
      uni.hideLoading()
    })
  // #endif
}

async function handleSubmit() {
  if (!validatePhone(form.value.phone)) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return
  }
  if (!/^\d{4,8}$/.test(String(form.value.code))) {
    uni.showToast({ title: '请输入正确的验证码', icon: 'none' })
    return
  }
  submitting.value = true
  try {
    await request({ url: '/user/phone/bind', method: 'POST', data: { phone: form.value.phone, code: form.value.code } })
    uni.showToast({ title: '绑定成功', icon: 'success' })
    setTimeout(() => {
      uni.navigateBack({ delta: 1 })
    }, 600)
  } catch (e) {
    uni.showToast({ title: '绑定失败，请稍后重试', icon: 'none' })
  } finally {
    submitting.value = false
  }
}

onUnmounted(() => { timer && clearInterval(timer) })
</script>

<style lang="scss" scoped>
.profile-page { display: flex; flex-direction: column; gap: 24rpx; background-color: #f5f7fa; }

/* 复用个人中心卡片视觉 */
.profile__card { background-color: #ffffff; border-radius: 20rpx; overflow: hidden; }
.profile__card-header { display: flex; align-items: center; gap: 16rpx; padding: 32rpx 32rpx 24rpx; border-bottom: 1rpx solid #f1f5f9; }
.profile__card-title { font-size: 30rpx; font-weight: 600; color: #0f172a; }
.profile__card-content { padding: 0; }
.profile__card-row { display: flex; align-items: center; justify-content: space-between; padding: 28rpx 32rpx; border-bottom: 1rpx solid #f8fafc; }
.profile__card-row:last-child { border-bottom: none; }
.profile__card-left { display: flex; align-items: center; gap: 20rpx; flex: 1; }
.profile__card-label { font-size: 28rpx; color: #334155; font-weight: 500; }
.profile__card-right { display: flex; align-items: center; gap: 16rpx; }
.profile__card-value { font-size: 28rpx; color: #64748b; }

.form-row { display: flex; flex-direction: column; gap: 16rpx; padding: 24rpx 32rpx; }
.form-label { font-size: 28rpx; color: #334155; }
.form-hint { font-size: 26rpx; color: #94a3b8; }
.code-row { display: flex; align-items: center; gap: 16rpx; }

.btn-code { padding: 16rpx 24rpx; background: #276019; color: #fff; border: none; border-radius: 12rpx; font-size: 26rpx; }
.btn-code:disabled { opacity: .6; }
.btn-secondary { padding: 16rpx 24rpx; background: #f1f5f9; color: #276019; border: none; border-radius: 12rpx; font-size: 26rpx; }

.actions { padding: 0 24rpx; }
.profile__submit-btn { width: 100%; background: #276019; color: #fff; border: none; border-radius: 16rpx; padding: 24rpx; font-size: 32rpx; font-weight: 600; }
.profile__submit-btn:active { opacity: .9; transform: scale(.98); }

.safe-area-bottom { height: env(safe-area-inset-bottom); min-height: 0rpx; }

@media (max-width: 1023px) {
  .profile__card-header { padding: 28rpx 28rpx 22rpx; }
  .profile__card-row { padding: 24rpx 28rpx; }
}
</style>

