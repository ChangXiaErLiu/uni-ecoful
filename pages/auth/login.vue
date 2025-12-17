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
import { useUserStore } from '@/stores/user.js'

// 用户状态管理
const userStore = useUserStore()

// 响应式数据
const activeTab = ref('password') // 默认验证码登录
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
  // 先停止之前的轮询
  stopPolling()
  
  activeTab.value = tab
  // 清空表单
  mobile.value = ''
  code.value = ''
  account.value = ''
  password.value = ''
  
  // 切换到微信登录时，只在没有二维码时生成
  if (tab === 'wechat' && !qrcodeId.value) {
    generateQRCode()
  }
}

// 二维码ID
const qrcodeId = ref('')
const pollingCount = ref(0) // 轮询次数计数
const MAX_POLLING_COUNT = 60 // 最多轮询60次（3分钟）

// 停止轮询
function stopPolling() {
  if (qrCodeTimer) {
    clearInterval(qrCodeTimer)
    qrCodeTimer = null
  }
  pollingCount.value = 0
  console.log('已停止二维码轮询')
}

// 生成二维码
async function generateQRCode() {
  // 先停止之前的轮询
  stopPolling()
  
  // 重置二维码ID
  qrcodeId.value = ''
  qrCodeUrl.value = ''
  
  // #ifdef H5
  // H5 端：生成二维码并轮询状态
  try {
    uni.showLoading({ title: '生成二维码中...' })
    
    const { getWeChatQRCode } = await import('@/api/auth.js')
    const res = await getWeChatQRCode()
    
    qrcodeId.value = res.qrcode_id
    qrCodeUrl.value = res.qrcode_url
    
    uni.hideLoading()
    
    console.log('二维码生成成功，ID:', qrcodeId.value)
    
    // 开始轮询二维码状态
    startPollingQRCode()
  } catch (error) {
    uni.hideLoading()
    console.error('生成二维码失败:', error)
    uni.showToast({ title: '生成二维码失败', icon: 'none' })
  }
  // #endif
  
  // #ifndef H5
  // 小程序端：直接调用微信授权
  uni.showToast({ 
    title: '小程序端请使用微信授权登录', 
    icon: 'none' 
  })
  // #endif
}

// 刷新二维码
function refreshQRCode() {
  console.log('用户手动刷新二维码')
  stopPolling()
  generateQRCode()
}

// 开始轮询二维码状态
async function startPollingQRCode() {
  // 确保之前的定时器已清理
  if (qrCodeTimer) {
    clearInterval(qrCodeTimer)
    qrCodeTimer = null
  }
  
  const { checkQRCodeStatus } = await import('@/api/auth.js')
  
  pollingCount.value = 0
  console.log('开始轮询二维码状态，ID:', qrcodeId.value)
  
  qrCodeTimer = setInterval(async () => {
    // 检查轮询次数
    pollingCount.value++
    console.log(`轮询二维码状态 [${pollingCount.value}/${MAX_POLLING_COUNT}]`)
    
    if (pollingCount.value > MAX_POLLING_COUNT) {
      stopPolling()
      uni.showToast({ title: '二维码已过期，请刷新', icon: 'none' })
      return
    }
    
    // 如果不在微信登录tab，停止轮询
    if (activeTab.value !== 'wechat') {
      console.log('已切换到其他登录方式，停止轮询')
      stopPolling()
      return
    }
    
    try {
      const res = await checkQRCodeStatus(qrcodeId.value)
      
      if (res.status === 'confirmed') {
        // 扫码确认，完成登录
        console.log('二维码已确认，开始登录')
        stopPolling()
        await handleWeChatLogin()
      } else if (res.status === 'expired') {
        // 二维码过期
        console.log('二维码已过期')
        stopPolling()
        uni.showToast({ title: '二维码已过期，请刷新', icon: 'none' })
      }
    } catch (error) {
      console.error('轮询二维码状态失败:', error)
      // 出错时停止轮询
      stopPolling()
      uni.showToast({ title: '网络错误，请刷新二维码', icon: 'none' })
    }
  }, 3000) // 每3秒轮询一次
}

// 微信登录
async function handleWeChatLogin() {
  try {
    uni.showLoading({ title: '登录中...', mask: true })
    
    // 使用 mock_code 进行测试
    const result = await userStore.loginByWechat('mock_code')
    
    uni.hideLoading()
    
    if (result.success) {
      uni.showToast({ 
        title: '登录成功', 
        icon: 'success',
        duration: 1500
      })
      
      setTimeout(() => {
        uni.switchTab({ url: '/pages/home/index' })
      }, 1500)
    } else {
      uni.showToast({ 
        title: result.error?.message || '登录失败', 
        icon: 'none' 
      })
    }
  } catch (error) {
    uni.hideLoading()
    console.error('微信登录失败:', error)
    uni.showToast({ title: '登录失败', icon: 'none' })
  }
}

// 发送验证码
async function sendCode() {
  if (!mobile.value) {
    uni.showToast({ title: '请输入手机号', icon: 'none' })
    return
  }
  
  if (!/^1[3-9]\d{9}$/.test(mobile.value)) {
    uni.showToast({ title: '手机号格式不正确', icon: 'none' })
    return
  }
  
  try {
    // 调用发送验证码接口
    const { sendSmsCode } = await import('@/api/auth.js')
    await sendSmsCode(mobile.value, 'login')
    
    uni.showToast({ title: '验证码已发送', icon: 'success' })
    
    // 开始倒计时
    codeCountdown.value = 60
    countdownTimer = setInterval(() => {
      codeCountdown.value--
      if (codeCountdown.value <= 0) {
        clearInterval(countdownTimer)
      }
    }, 1000)
  } catch (error) {
    uni.showToast({ 
      title: error.message || error.detail || '发送失败', 
      icon: 'none' 
    })
  }
}

// 切换密码显示/隐藏
function togglePassword() {
  showPassword.value = !showPassword.value
}

// 验证码登录
async function loginWithCode() {
  if (!mobile.value) {
    uni.showToast({ title: '请输入手机号', icon: 'none' })
    return
  }
  
  if (!code.value) {
    uni.showToast({ title: '请输入验证码', icon: 'none' })
    return
  }
  
  uni.showLoading({ title: '登录中...', mask: true })
  
  try {
    const result = await userStore.loginByCode(mobile.value, code.value)
    
    uni.hideLoading()
    
    if (result.success) {
      uni.showToast({ 
        title: '登录成功', 
        icon: 'success',
        duration: 1500
      })
      
      // 延迟跳转
      setTimeout(() => {
        uni.switchTab({ url: '/pages/home/index' })
      }, 1500)
    } else {
      const errorMsg = result.error?.message || result.error?.data?.detail || '登录失败'
      uni.showToast({ 
        title: errorMsg, 
        icon: 'none',
        duration: 2000
      })
    }
  } catch (error) {
    uni.hideLoading()
    console.error('验证码登录异常:', error)
    uni.showToast({ 
      title: '登录失败，请稍后重试', 
      icon: 'none' 
    })
  }
}

// 密码登录
async function loginWithPassword() {
  // 表单验证
  if (!account.value) {
    uni.showToast({ title: '请输入账号', icon: 'none' })
    return
  }
  
  if (!password.value) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return
  }
  
  // 调用登录接口
  uni.showLoading({ title: '登录中...', mask: true })
  
  try {
    const result = await userStore.loginByPassword(account.value, password.value)
    
    uni.hideLoading()
    
    if (result.success) {
      uni.showToast({ 
        title: '登录成功', 
        icon: 'success',
        duration: 1500
      })
      
      // 延迟跳转，让用户看到成功提示
      setTimeout(() => {
        // 跳转到首页
        uni.switchTab({ 
          url: '/pages/home/index' 
        })
      }, 1500)
    } else {
      // 登录失败
      const errorMsg = result.error?.message || result.error?.data?.detail || '登录失败，请检查账号密码'
      uni.showToast({ 
        title: errorMsg, 
        icon: 'none',
        duration: 2000
      })
    }
  } catch (error) {
    uni.hideLoading()
    console.error('登录异常:', error)
    uni.showToast({ 
      title: '登录失败，请稍后重试', 
      icon: 'none' 
    })
  }
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
    countdownTimer = null
  }
  stopPolling()
})
</script>

<style lang="scss" scoped>
.auth {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  overflow: hidden;
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