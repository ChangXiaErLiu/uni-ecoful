<template>
  <view class="auth">
    <view class="auth__card">
      <view class="auth__header">
        <text class="auth__title">注册新账户</text>
        <text class="auth__subtitle">完善基础信息，开启智能办公新体验</text>
      </view>
      
      <view class="auth__form">
        <!-- 企业名称输入 -->
        <view class="auth__input-group">
          <uni-icons type="home" size="20" color="#64748b" class="auth__input-icon"></uni-icons>
          <input 
            v-model="company" 
            class="auth__input" 
            placeholder="请输入企业或组织名称" 
          />
        </view>
        
        <!-- 姓名输入 -->
        <view class="auth__input-group">
          <uni-icons type="person" size="20" color="#64748b" class="auth__input-icon"></uni-icons>
          <input 
            v-model="name" 
            class="auth__input" 
            placeholder="请输入姓名" 
          />
        </view>
        
        <!-- 手机号输入 -->
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
        
        <!-- 验证码输入 -->
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
        
        <!-- 提交按钮 -->
        <button class="auth__button auth__button--primary" @tap="submit">提交注册</button>
        
        <!-- 去登录链接 -->
        <view class="auth__footer">
          <text class="auth__footer-text">已有账户？</text>
          <a class="auth__link" @tap="goLogin">去登录</a>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'

// 响应式数据
const company = ref('')
const name = ref('')
const mobile = ref('')
const code = ref('')
const codeCountdown = ref(0)
let countdownTimer = null

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

// 提交注册
function submit() {
  if (!company.value) {
    uni.showToast({ title: '请输入企业或组织名称', icon: 'none' })
    return
  }
  
  if (!name.value) {
    uni.showToast({ title: '请输入姓名', icon: 'none' })
    return
  }
  
  if (!mobile.value) {
    uni.showToast({ title: '请输入手机号', icon: 'none' })
    return
  }
  
  if (!code.value) {
    uni.showToast({ title: '请输入验证码', icon: 'none' })
    return
  }
  
  console.log('提交注册信息', company.value, name.value, mobile.value, code.value)
  
  // 模拟注册请求
  uni.showLoading({ title: '注册中...' })
  setTimeout(() => {
    uni.hideLoading()
    uni.showToast({ 
      title: '注册成功', 
      icon: 'success',
      success: () => {
        // 注册成功后跳转到登录页
        setTimeout(() => {
          uni.navigateBack({ delta: 1 })
        }, 1500)
      }
    })
  }, 2000)
}

// 去登录
function goLogin() {
  uni.navigateBack({ delta: 1 })
}

// 清理定时器
onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
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
  transition: border-color 0.3s ease;
  
  &:focus-within {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
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
  transition: all 0.3s ease;
  
  &:active {
    transform: translateY(2rpx);
  }
}

.auth__button--primary {
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  color: #ffffff;
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