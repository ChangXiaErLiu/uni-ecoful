﻿﻿﻿﻿<template>
  <view class="auth">
    <view class="auth__card">
      <text class="auth__title">登录账户</text>
      <text class="auth__subtitle">使用手机号或微信登录，体验智能工作台</text>
      <view class="auth__form">
        <input v-model="mobile" class="auth__input" placeholder="请输入手机号" />
        <view class="auth__code-row">
          <input v-model="code" class="auth__input auth__input--code" placeholder="请输入验证码" />
          <button class="auth__button" @tap="sendCode">发送验证码</button>
        </view>
        <button class="auth__button auth__button--primary" @tap="loginWithMobile">手机号登录</button>
		<button class="auth__button auth__button--wechat" @tap="loginWithWeChat">
		<uni-icons type="weixin" size="20" color="white" ></uni-icons>
		微信登录
		</button>
        <button class="auth__link" @tap="goRegister">还没有账户？立即注册</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

// 中文注释：登录页提供手机号和微信登录入口，后续对接真实鉴权接口
const mobile = ref('')
const code = ref('')

function sendCode() {
  console.log('发送验证码')
}

function loginWithMobile() {
  console.log('手机号登录', mobile.value, code.value)
}

function loginWithWeChat() {
  // #ifdef MP-WEIXIN
  console.log('调用微信登录')
  // #endif
  // #ifndef MP-WEIXIN
  uni.showToast({ title: '请在微信小程序内登录', icon: 'none' })
  // #endif
}

function goRegister() {
  uni.navigateTo({ url: '/pages/auth/register' })
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
  line-height: 88rpx;
  font-size: 28rpx;
  border: none;
  background-color: #e2e8f0;
  color: #334155;
  margin-left: 0;
  margin-right: 0;
}

.auth__button--primary {
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  color: #ffffff;
}

.auth__button--wechat {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #ffffff;
}

.auth__link {
  background: transparent;
  color: #2563eb;
  text-align: center;
  font-size: 14rpx;
}
</style>
