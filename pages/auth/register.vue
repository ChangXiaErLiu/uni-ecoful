<template>
  <view class="auth">
    <view class="auth__card">
      <text class="auth__title">注册新账户</text>
      <text class="auth__subtitle">完善基础信息，开启智能办公新体验</text>
      <view class="auth__form">
        <input v-model="company" class="auth__input" placeholder="请输入企业或组织名称" />
        <input v-model="name" class="auth__input" placeholder="请输入姓名" />
        <input v-model="mobile" class="auth__input" placeholder="请输入手机号" />
        <view class="auth__code-row">
          <input v-model="code" class="auth__input auth__input--code" placeholder="请输入验证码" />
          <button class="auth__button" @tap="sendCode">发送验证码</button>
        </view>
        <button class="auth__button auth__button--primary" @tap="submit">提交注册</button>
        <button class="auth__link" @tap="goLogin">已有账户？去登录</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

// 中文注释：注册页占位，后续与后端注册流程打通
const company = ref('')
const name = ref('')
const mobile = ref('')
const code = ref('')

function sendCode() {
  console.log('发送注册验证码')
}

function submit() {
  console.log('提交注册信息', company.value, name.value, mobile.value, code.value)
}

function goLogin() {
  uni.navigateBack({ delta: 1 })
}
</script>

<style lang="scss" scoped>
.auth {
  display: flex;
  align-items: center;
  justify-content: center;
  /* 中文注释：避免使用 vh，高度随内容与父容器伸展 */
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
  gap: 24rpx;
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
  gap: 24rpx;
}

.auth__input {
  height: 88rpx;
  border-radius: 16rpx;
  border: 1px solid rgba(148, 163, 184, 0.6);
  padding: 0 24rpx;
  font-size: 28rpx;
}

.auth__code-row {
  display: flex;
  gap: 16rpx;
}

.auth__input--code {
  flex: 1;
}

.auth__button {
  height: 88rpx;
  border-radius: 999px;
  font-size: 28rpx;
  border: none;
  background-color: #e2e8f0;
  color: #334155;
}

.auth__button--primary {
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  color: #ffffff;
}

.auth__link {
  background: transparent;
  color: #2563eb;
  text-align: center;
}
</style>
