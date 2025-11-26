<template>
  <view class="auth">
    <view class="auth__card">
      <view class="auth__header">
        <text class="auth__title">登录账户</text>
        <text class="auth__subtitle">选择登录方式，体验智能工作台</text>
      </view>
      
      <!-- 登录方式切换 -->
      <view class="auth__tabs">
        <view 
          class="auth__tab" 
          :class="{ 'auth__tab--active': activeTab === 'code' }"
          @tap="switchTab('code')"
        >
          验证码登录
        </view>
        <view 
          class="auth__tab" 
          :class="{ 'auth__tab--active': activeTab === 'password' }"
          @tap="switchTab('password')"
        >
          密码登录
        </view>
        <view 
          class="auth__tab" 
          :class="{ 'auth__tab--active': activeTab === 'wechat' }"
          @tap="switchTab('wechat')"
        >
          微信登录
        </view>
      </view>
      
      <!-- 验证码登录 -->
      <view v-if="activeTab === 'code'" class="auth__form">
        <view class="auth__input-group">
          <uni-icons type="phone" size="20" color="#64748b" class="auth__input-icon"></uni-icons>
          <input 
            v-model="mobile" 
            class="auth__input" 
            placeholder="请输入手机号" 
            type="number"
            maxlength="11"
          />
        </view>
        
        <view class="auth__input-group">
          <uni-icons type="chat" size="20" color="#64748b" class="auth__input-icon"></uni-icons>
          <input 
            v-model="code" 
            class="auth__input auth__input--code" 
            placeholder="请输入验证码" 
            type="number"
            maxlength="6"
          />
          <button 
            class="auth__code-btn" 
            :disabled="codeCountdown > 0"
            @tap="sendCode"
          >
            {{ codeCountdown > 0 ? `${codeCountdown}s后重发` : '发送验证码' }}
          </button>
        </view>
        
        <button class="auth__button auth__button--primary" @tap="loginWithCode">登录</button>
      </view>
      
      <!-- 密码登录 -->
      <view v-if="activeTab === 'password'" class="auth__form">
        <view class="auth__input-group">
          <uni-icons type="person" size="20" color="#64748b" class="auth__input-icon"></uni-icons>
          <input 
            v-model="account" 
            class="auth__input" 
            placeholder="请输入手机号/用户名" 
          />
        </view>
        
        <view class="auth__input-group">
          <uni-icons type="locked" size="20" color="#64748b" class="auth__input-icon"></uni-icons>
          <input 
            v-model="password" 
            class="auth__input" 
            placeholder="请输入密码" 
            :type="showPassword ? 'text' : 'password'"
          />
          <uni-icons 
            :type="showPassword ? 'eye-slash' : 'eye'" 
            size="20" 
            color="#64748b" 
            class="auth__password-toggle"
            @tap="togglePassword"
          ></uni-icons>
        </view>
        
        <view class="auth__forgot">
          <a class="auth__link" @tap="goForgotPassword">忘记密码？</a>
        </view>
        
        <button class="auth__button auth__button--primary" @tap="loginWithPassword">登录</button>
      </view>
      
      <!-- 微信扫码登录 -->
      <view v-if="activeTab === 'wechat'" class="auth__wechat-scan">
        <view class="auth__qrcode-container">
          <view class="auth__qrcode-placeholder">
            <!-- 这里放置二维码，实际项目中替换为真实二维码 -->
            <uni-icons type="weixin" size="120" color="#22c55e"></uni-icons>
            <text class="auth__qrcode-text">微信扫码登录</text>
          </view>
          <text class="auth__qrcode-desc">请使用微信扫描二维码登录</text>
        </view>
        
        <view class="auth__wechat-tips">
          <text class="auth__wechat-tip">打开微信扫一扫</text>
          <text class="auth__wechat-tip">扫描上方二维码</text>
          <text class="auth__wechat-tip">点击授权登录</text>
        </view>
        
        <!-- 刷新二维码按钮 -->
        <button class="auth__refresh-btn" @tap="refreshQRCode">
          <uni-icons type="refresh" size="16" color="#2563eb"></uni-icons>
          刷新二维码
        </button>
      </view>
      
      <!-- 注册链接 -->
      <view class="auth__footer">
        <text class="auth__footer-text">还没有账户？</text>
        <a class="auth__link" @tap="goRegister">立即注册</a>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'

// 响应式数据
const activeTab = ref('code') // 默认验证码登录
const mobile = ref('')
const code = ref('')
const account = ref('')
const password = ref('')
const showPassword = ref(false)
const codeCountdown = ref(0)
const qrCodeUrl = ref('') // 存储二维码URL
let countdownTimer = null
let qrCodeTimer = null // 用于轮询二维码状态

// 切换登录方式
function switchTab(tab) {
  activeTab.value = tab
  // 清空表单
  mobile.value = ''
  code.value = ''
  account.value = ''
  password.value = ''
  
  // 切换到微信登录时，生成二维码
  if (tab === 'wechat') {
    generateQRCode()
  } else {
    // 清除二维码轮询
    if (qrCodeTimer) {
      clearInterval(qrCodeTimer)
      qrCodeTimer = null
    }
  }
}

// 生成二维码（模拟）
function generateQRCode() {
  console.log('生成微信登录二维码')
  // 实际项目中这里应该调用后端接口生成二维码
  // 模拟生成二维码的过程
  uni.showLoading({ title: '生成二维码中...' })
  
  setTimeout(() => {
    uni.hideLoading()
    // 开始轮询二维码状态
    startPollingQRCode()
  }, 1000)
}

// 刷新二维码
function refreshQRCode() {
  if (qrCodeTimer) {
    clearInterval(qrCodeTimer)
  }
  generateQRCode()
}

// 开始轮询二维码状态
function startPollingQRCode() {
  // 实际项目中这里应该轮询后端接口检查扫码状态
  qrCodeTimer = setInterval(() => {
    console.log('检查二维码扫码状态...')
    // 模拟扫码成功
    // if (scanned) {
    //   clearInterval(qrCodeTimer)
    //   handleWeChatLoginSuccess()
    // }
  }, 3000)
}

// 微信登录成功处理
function handleWeChatLoginSuccess() {
  uni.showToast({ title: '微信登录成功', icon: 'success' })
  // 跳转到首页或其他页面
  // uni.switchTab({ url: '/pages/index/index' })
}

// 发送验证码
function sendCode() {
  if (!mobile.value) {
    uni.showToast({ title: '请输入手机号', icon: 'none' })
    return
  }
  
  if (!/^1[3-9]\d{9}$/.test(mobile.value)) {
    uni.showToast({ title: '手机号格式不正确', icon: 'none' })
    return
  }
  
  // 模拟发送验证码
  uni.showToast({ title: '验证码已发送', icon: 'success' })
  
  // 开始倒计时
  codeCountdown.value = 60
  countdownTimer = setInterval(() => {
    codeCountdown.value--
    if (codeCountdown.value <= 0) {
      clearInterval(countdownTimer)
    }
  }, 1000)
}

// 切换密码显示/隐藏
function togglePassword() {
  showPassword.value = !showPassword.value
}

// 验证码登录
function loginWithCode() {
  if (!mobile.value) {
    uni.showToast({ title: '请输入手机号', icon: 'none' })
    return
  }
  
  if (!code.value) {
    uni.showToast({ title: '请输入验证码', icon: 'none' })
    return
  }
  
  console.log('验证码登录', mobile.value, code.value)
  // 这里调用验证码登录API
  uni.showLoading({ title: '登录中...' })
  setTimeout(() => {
    uni.hideLoading()
    uni.showToast({ title: '登录成功', icon: 'success' })
  }, 1500)
}

// 密码登录
function loginWithPassword() {
  if (!account.value) {
    uni.showToast({ title: '请输入账号', icon: 'none' })
    return
  }
  
  if (!password.value) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return
  }
  
  console.log('密码登录', account.value, password.value)
  // 这里调用密码登录API
  uni.showLoading({ title: '登录中...' })
  setTimeout(() => {
    uni.hideLoading()
    uni.showToast({ title: '登录成功', icon: 'success' })
  }, 1500)
}

// 忘记密码
function goForgotPassword() {
  uni.navigateTo({ url: '/pages/auth/forgot-password' })
}

// 注册
function goRegister() {
  uni.navigateTo({ url: '/pages/auth/register' })
}

// 清理定时器
onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
  if (qrCodeTimer) {
    clearInterval(qrCodeTimer)
  }
})
</script>

<style lang="scss" scoped>
.auth {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 48rpx;
  background: linear-gradient(135deg, #e0f2fe, #ede9fe);
}

.auth__card {
  width: 100%;
  max-width: 640rpx;
  background-color: #ffffff;
  border-radius: 32rpx;
  padding: 48rpx;
  box-shadow: 0 24rpx 60rpx rgba(15, 23, 42, 0.12);
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.auth__header {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  text-align: center;
}

.auth__title {
  font-size: 40rpx;
  font-weight: 600;
  color: #0f172a;
}

.auth__subtitle {
  font-size: 26rpx;
  color: #64748b;
}

.auth__tabs {
  display: flex;
  background-color: #f8fafc;
  border-radius: 16rpx;
  padding: 8rpx;
}

.auth__tab {
  flex: 1;
  text-align: center;
  padding: 20rpx;
  font-size: 28rpx;
  color: #64748b;
  border-radius: 12rpx;
  transition: all 0.3s ease;
}

.auth__tab--active {
  background-color: #ffffff;
  color: #2563eb;
  font-weight: 500;
  box-shadow: 0 4rpx 12rpx rgba(37, 99, 235, 0.1);
}

.auth__form {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.auth__input-group {
  position: relative;
  display: flex;
  align-items: center;
  border: 1px solid rgba(148, 163, 184, 0.6);
  border-radius: 16rpx;
  overflow: hidden;
}

.auth__input-icon {
  padding: 0 24rpx;
}

.auth__input {
  flex: 1;
  height: 88rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  border: none;
  outline: none;
}

.auth__input--code {
  border-right: 1px solid rgba(148, 163, 184, 0.3);
}

.auth__code-btn {
  height: 88rpx;
  line-height: 88rpx;
  padding: 0 24rpx;
  font-size: 24rpx;
  background-color: transparent;
  color: #2563eb;
  border: none;
  white-space: nowrap;
  
  &[disabled] {
    color: #94a3b8;
  }
}

.auth__password-toggle {
  padding: 0 24rpx;
}

.auth__forgot {
  text-align: right;
}

.auth__button {
  height: 88rpx;
  line-height: 88rpx;
  font-size: 28rpx;
  border: none;
  border-radius: 16rpx;
  background-color: #e2e8f0;
  color: #334155;
  margin-left: 0;
  margin-right: 0;
}

.auth__button--primary {
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  color: #ffffff;
}

/* 微信扫码登录样式 */
.auth__wechat-scan {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40rpx;
}

.auth__qrcode-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
}

.auth__qrcode-placeholder {
  width: 400rpx;
  height: 400rpx;
  border: 2rpx dashed #e2e8f0;
  border-radius: 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24rpx;
  background-color: #f8fafc;
}

.auth__qrcode-text {
  font-size: 28rpx;
  color: #475569;
}

.auth__qrcode-desc {
  font-size: 26rpx;
  color: #64748b;
}

.auth__wechat-tips {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.auth__wechat-tip {
  font-size: 26rpx;
  color: #64748b;
  position: relative;
  padding-left: 40rpx;
  
  &::before {
    content: "•";
    position: absolute;
    left: 20rpx;
    color: #22c55e;
  }
}

.auth__refresh-btn {
  display: flex;
  align-items: center;
  gap: 12rpx;
  background-color: transparent;
  color: #2563eb;
  border: none;
  font-size: 26rpx;
  padding: 20rpx 40rpx;
  border-radius: 16rpx;
  border: 1rpx solid #2563eb;
}

.auth__footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12rpx;
  font-size: 26rpx;
}

.auth__footer-text {
  color: #64748b;
}

.auth__link {
  color: #2563eb;
  background: transparent;
  font-size: 26rpx;
}
</style>