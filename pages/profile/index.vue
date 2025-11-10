<!-- 个人中心界面 -->
<template>
  <AppLayout current="pages/profile/index">
    <view class="profile">
      <!-- 用户信息头部 -->
      <view class="profile__header">
        <view class="profile__avatar-section">
          <view ><img src="@/static/avatars/user.jpg" class="profile__avatar" alt="" /></view>
          <view class="profile__info">
            <text class="profile__name">张三</text>
            <text class="profile__role">企业管理员</text>
          </view>
        </view>
      </view>

      <!-- 账号信息卡片 -->
      <view class="profile__card">
        <view class="profile__card-header">
          <uni-icons type="contact" size="20" color="#276019"></uni-icons>
          <text class="profile__card-title">账号信息</text>
        </view>
        <view class="profile__card-content">
          <view class="profile__card-row" @tap="bindMobile">
            <view class="profile__card-left">
              <uni-icons type="phone" size="18" color="#64748b"></uni-icons>
              <text class="profile__card-label">手机号</text>
            </view>
            <view class="profile__card-right">
              <text class="profile__card-value">138****8888</text>
              <uni-icons type="right" size="16" color="#94a3b8"></uni-icons>
            </view>
          </view>
          
          <view class="profile__card-row" @tap="handleWechatBind">
            <view class="profile__card-left">
              <uni-icons type="weixin" size="18" color="#64748b"></uni-icons>
              <text class="profile__card-label">微信绑定</text>
            </view>
            <view class="profile__card-right">
              <text class="profile__card-value profile__card-value--bound">已绑定</text>
              <uni-icons type="right" size="16" color="#94a3b8"></uni-icons>
            </view>
          </view>
          
          <view class="profile__card-row">
            <view class="profile__card-left">
              <uni-icons type="calendar" size="18" color="#64748b"></uni-icons>
              <text class="profile__card-label">最近登录</text>
            </view>
            <view class="profile__card-right">
              <text class="profile__card-value">2025-10-23 12:30</text>
            </view>
          </view>
        </view>
      </view>
	  
      <!-- 安全设置卡片 -->
      <view class="profile__card">
        <view class="profile__card-header">
          <uni-icons type="locked" size="20" color="#276019"></uni-icons>
          <text class="profile__card-title">安全设置</text>
        </view>
        <view class="profile__card-content">
          <view class="profile__card-row" @tap="manageDevices">
            <view class="profile__card-left">
              <uni-icons type="phone" size="18" color="#64748b"></uni-icons>
              <text class="profile__card-label">登录设备管理</text>
            </view>
            <view class="profile__card-right">
              <text class="profile__card-desc">查看并管理设备</text>
              <uni-icons type="right" size="16" color="#94a3b8"></uni-icons>
            </view>
          </view>
          
          <view class="profile__card-row" @tap="viewLogs">
            <view class="profile__card-left">
              <uni-icons type="list" size="18" color="#64748b"></uni-icons>
              <text class="profile__card-label">操作日志</text>
            </view>
            <view class="profile__card-right">
              <text class="profile__card-desc">记录重要操作</text>
              <uni-icons type="right" size="16" color="#94a3b8"></uni-icons>
            </view>
          </view>

          <view class="profile__card-row" @tap="handleChangePassword">
            <view class="profile__card-left">
              <uni-icons type="locked-filled" size="18" color="#64748b"></uni-icons>
              <text class="profile__card-label">修改密码</text>
            </view>
            <view class="profile__card-right">
              <uni-icons type="right" size="16" color="#94a3b8"></uni-icons>
            </view>
          </view>
        </view>
      </view>

      <!-- 系统功能卡片 -->
      <view class="profile__card">
        <view class="profile__card-header">
          <uni-icons type="info" size="20" color="#276019"></uni-icons>
          <text class="profile__card-title">系统功能</text>
        </view>
        <view class="profile__card-content">
          <view class="profile__card-row" @tap="handleAbout">
            <view class="profile__card-left">
              <uni-icons type="info" size="18" color="#64748b"></uni-icons>
              <text class="profile__card-label">关于系统</text>
            </view>
            <view class="profile__card-right">
              <text class="profile__card-version">v1.1.0</text>
              <uni-icons type="right" size="16" color="#94a3b8"></uni-icons>
            </view>
          </view>
          
          <view class="profile__card-row" @tap="handleFeedback">
            <view class="profile__card-left">
              <uni-icons type="help" size="18" color="#64748b"></uni-icons>
              <text class="profile__card-label">意见反馈</text>
            </view>
            <view class="profile__card-right">
              <uni-icons type="right" size="16" color="#94a3b8"></uni-icons>
            </view>
          </view>
        </view>
      </view>

      <!-- 退出登录 -->
      <view class="profile__actions">
        <button class="profile__logout-btn" @tap="handleLogout">退出登录</button>
      </view>

      <!-- 底部安全区域 -->
      <view class="safe-area-bottom"></view>
    </view>
  </AppLayout>
</template>

<script setup>
import { ref } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import { onShow } from '@dcloudio/uni-app'
import { navTitleStore } from '@/stores/navTitle.js'

//设置头部导航栏title
const navTitle = navTitleStore()
onShow(() => navTitle.setTitle('个人中心'))

function bindMobile() {
  uni.navigateTo({
    url: '/pages/profile/changePhone'
  })
}

function handleWechatBind() {
  uni.showActionSheet({
    itemList: ['解绑微信', '取消'],
    success: (res) => {
      if (res.tapIndex === 0) {
        uni.showModal({
          title: '确认解绑',
          content: '解绑后将无法使用微信登录',
          success: (res) => {
            if (res.confirm) {
              uni.showToast({
                title: '解绑成功',
                icon: 'success'
              })
            }
          }
        })
      }
    }
  })
}

function handlePhoto() {
  uni.navigateTo({
    url: '/pages/profile/operationLogs'
  })
}

function handleReport() {
  uni.navigateTo({
    url: '/pages/profile/changePassword'
  })
}


function handleChangePassword() {
  uni.navigateTo({
    url: '/pages/profile/changePassword'
  })
}


function manageDevices() {
  uni.navigateTo({
    url: '/pages/profile/devices'
  })
}

function viewLogs() {
  uni.navigateTo({
    url: '/pages/profile/operationLogs'
  })
}

function handleAbout() {
  uni.navigateTo({
    url: '/pages/profile/about'
  })
}

function handleFeedback() {
  uni.navigateTo({
    url: '/pages/profile/feedback'
  })
}

function handleLogout() {
  uni.showModal({
    title: '确认退出',
    content: '您确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '退出中...' })
        setTimeout(() => {
          uni.hideLoading()
          // 清除登录状态
          uni.removeStorageSync('token')
          uni.reLaunch({
            url: '/pages/auth/login'
          })
        }, 1000)
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.profile {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  background-color: #f5f7fa;
}

/* 用户信息头部 */
.profile__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 30rpx ;
  border-radius: 24rpx;
  color: black;
  background-color: white;
}

.profile__avatar-section {
  display: flex;
  align-items: center;
  gap: 24rpx;
  flex: 1;
}

.profile__avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 20%;
  display: flex;
  border: 1rpx solid rgba(255, 255, 255, 0.3);
}

.profile__info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  flex: 1;
}

.profile__name {
  font-size: 36rpx;
  font-weight: 700;
  
}

.profile__role {
  font-size: 28rpx;
  border-radius: 20rpx;
  align-self: flex-start;
}

.profile__desc {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.4;
}

.profile__button {
  padding: 0 32rpx;
  height: 64rpx;
  border-radius: 32rpx;
  font-size: 26rpx;
  font-weight: 500;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  white-space: nowrap;
}

.profile__button--primary {
  background: rgba(255, 255, 255, 0.9);
  color: #276019;
  font-weight: 600;
}

/* 卡片样式 */
.profile__card {
  background-color: #ffffff;
  border-radius: 20rpx;
  overflow: hidden;
}

.profile__card-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 32rpx 32rpx 24rpx;
  border-bottom: 1rpx solid #f1f5f9;
}

.profile__card-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #0f172a;
}

.profile__card-content {
  padding: 0;
}

.profile__card-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 32rpx;
  border-bottom: 1rpx solid #f8fafc;
  transition: background-color 0.2s;
}

.profile__card-row:active {
  background-color: #f8fafc;
}

.profile__card-row:last-child {
  border-bottom: none;
}

.profile__card-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
  flex: 1;
}

.profile__card-label {
  font-size: 28rpx;
  color: #334155;
  font-weight: 500;
}

.profile__card-right {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.profile__card-value {
  font-size: 28rpx;
  color: #64748b;
}

.profile__card-value--bound {
  color: #276019;
  font-weight: 500;
}

.profile__card-desc {
  font-size: 26rpx;
  color: #94a3b8;
}

.profile__card-version {
  font-size: 26rpx;
  color: #64748b;
  background: #f1f5f9;
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
}

/* Picker 样式 */
.profile__picker {
  padding: 16rpx 24rpx;
  border-radius: 16rpx;
  background-color: #f8fafc;
  color: #276019;
  font-size: 28rpx;
  font-weight: 500;
  min-width: 200rpx;
  text-align: right;
}

/* 退出登录 */
.profile__logout-btn {
  width: 100%;
  background: green;
  color: white;
  border: none;
  border-radius: 16rpx;
  padding: 2rpx;
  font-size: 32rpx;
  font-weight: 600;
}

.profile__logout-btn:active {
  opacity: 0.9;
  transform: scale(0.98);
}

/* 安全区域 */
.safe-area-bottom {
  height: env(safe-area-inset-bottom);
  min-height: 0rpx;
}

/* 响应式适配 */
@media (max-width: 1023px) {
  .profile__header {
    flex-direction: column;
    align-items: stretch;
  }
  .profile__button {
    width: 100%;
  }
  .profile__cards {
    flex-direction: column;
  }
}

</style>