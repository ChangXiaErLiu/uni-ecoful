<template>
  <view class="privacy">
    <view class="privacy__container">
      <view class="privacy__header">
        <text class="privacy__title">隐私政策</text>
        <text class="privacy__subtitle">最后更新日期：{{ currentDate }}</text>
      </view>

      <scroll-view class="privacy__content" scroll-y :style="{ height: scrollViewHeight + 'px' }">
        <view class="privacy__section">
          <text class="privacy__section-title">引言</text>
          <text class="privacy__text">
            我们深知个人信息对您的重要性，并致力于保护您的个人信息安全。本隐私政策旨在向您说明我们如何收集、使用、存储、共享和保护您的个人信息，以及您如何行使您的个人信息权利。
          </text>
        </view>

        <view class="privacy__section">
          <text class="privacy__section-title">一、我们收集的信息</text>
          <text class="privacy__text">
            1.1 账户信息：当您注册账户时，我们会收集您的企业名称、姓名、手机号码、密码等信息。\n
            1.2 设备信息：我们会收集您使用的设备型号、操作系统版本、唯一设备标识符等信息。\n
            1.3 日志信息：当您使用我们的服务时，我们会自动收集您对我们服务的详细使用情况，作为有关网络日志保存。\n
            1.4 位置信息：当您使用与位置有关的服务时，我们可能会记录您设备所在的位置信息。
          </text>
        </view>

        <view class="privacy__section">
          <text class="privacy__section-title">二、我们如何使用信息</text>
          <text class="privacy__text">
            2.1 为您提供注册、登录验证服务；\n
            2.2 提供个性化服务，改善用户体验；\n
            2.3 安全保障，检测和防范网络安全事件；\n
            2.4 遵守和执行法律法规的要求。
          </text>
        </view>

        <view class="privacy__section">
          <text class="privacy__section-title">三、我们如何共享信息</text>
          <text class="privacy__text">
            3.1 我们不会与任何公司、组织和个人分享您的个人信息，但以下情况除外：\n
            • 获得您的明确授权；\n
            • 根据法律法规规定或政府部门的强制性要求；\n
            • 为保护我们及关联方、其他用户或公众的人身财产安全；\n
            • 与授权合作伙伴共享：仅为实现本政策中声明的目的，我们的某些服务将由授权合作伙伴提供。
          </text>
        </view>

        <view class="privacy__section">
          <text class="privacy__section-title">四、Cookie和同类技术</text>
          <text class="privacy__text">
            为确保网站正常运转，我们会在您的计算机或移动设备上存储名为Cookie的小数据文件。您可以根据自己的偏好管理或删除Cookie。但如果您这么做，需要在每一次访问我们的网站时亲自更改用户设置。
          </text>
        </view>

        <view class="privacy__section">
          <text class="privacy__section-title">五、我们如何保护信息</text>
          <text class="privacy__text">
            5.1 我们已使用符合业界标准的安全防护措施保护您提供的个人信息，防止数据遭到未经授权的访问、公开披露、使用、修改、损坏或丢失。\n
            5.2 我们会采取一切合理可行的措施，确保不收集无关的个人信息。\n
            5.3 互联网并非绝对安全的环境，请使用复杂密码，协助我们保证您的账号安全。
          </text>
        </view>

        <view class="privacy__section">
          <text class="privacy__section-title">六、您的权利</text>
          <text class="privacy__text">
            按照中国相关的法律、法规、标准，以及其他国家、地区的通行做法，我们保障您对自己的个人信息行使以下权利：\n
            • 访问您的个人信息；\n
            • 更正您的个人信息；\n
            • 删除您的个人信息；\n
            • 改变您授权同意的范围；\n
            • 个人信息主体注销账户；\n
            • 约束信息系统自动决策。
          </text>
        </view>

        <view class="privacy__section">
          <text class="privacy__section-title">七、我们如何处理儿童信息</text>
          <text class="privacy__text">
            我们的产品、网站和服务主要面向成人。如果没有父母或监护人的同意，儿童不应创建自己的个人信息主体账户。对于经父母同意而收集儿童个人信息的情况，我们只会在受到法律允许、父母或监护人明确同意或者保护儿童所必要的情况下使用或公开披露此信息。
          </text>
        </view>

        <view class="privacy__section">
          <text class="privacy__section-title">八、本政策如何更新</text>
          <text class="privacy__text">
            我们的隐私政策可能变更。未经您明确同意，我们不会削减您按照本隐私政策所应享有的权利。我们会在本页面上发布对本政策所做的任何变更。对于重大变更，我们还会提供更为显著的通知。
          </text>
        </view>

        <view class="privacy__section">
          <text class="privacy__section-title">九、如何联系我们</text>
          <text class="privacy__text">
            如果您对本隐私政策有任何疑问、意见或建议，通过以下方式与我们联系：\n
            个人信息保护负责人邮箱：privacy@yourcompany.com\n
            客服电话：400-xxx-xxxx\n
            一般情况下，我们将在十五个工作日内回复。
          </text>
        </view>
      </scroll-view>

      <view class="privacy__actions">
        <button class="privacy__button privacy__button--secondary" @tap="goBack">返回</button>
        <button class="privacy__button privacy__button--primary" @tap="agree">同意政策</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const currentDate = ref(new Date().toLocaleDateString('zh-CN'))
const scrollViewHeight = ref(0)
const systemInfo = ref({})

// 获取系统信息并计算高度
function calculateHeight() {
  systemInfo.value = uni.getSystemInfoSync()
  const windowHeight = systemInfo.value.windowHeight
  const windowWidth = systemInfo.value.windowWidth
  
  // 根据不同设备类型计算合适的高度
  if (windowWidth >= 1200) {
    // PC端 - 固定高度
    scrollViewHeight.value = 600
  } else if (windowWidth >= 768) {
    // 平板端 - 屏幕高度的70%
    scrollViewHeight.value = windowHeight * 0.7
  } else {
    // 手机端 - 屏幕高度减去固定值
    scrollViewHeight.value = windowHeight - 280
  }
}

// 监听窗口大小变化（H5环境）
function onResize() {
  calculateHeight()
}

onMounted(() => {
  calculateHeight()
  
  // 在H5环境下监听窗口大小变化
  // #ifdef H5
  window.addEventListener('resize', onResize)
  // #endif
})

onUnmounted(() => {
  // #ifdef H5
  window.removeEventListener('resize', onResize)
  // #endif
})

function goBack() {
  uni.navigateBack()
}

function agree() {
  uni.showToast({
    title: '已同意隐私政策',
    icon: 'success'
  })
  setTimeout(() => {
    uni.navigateBack()
  }, 1500)
}
</script>

<style lang="scss" scoped>
.privacy {
  min-height: 100vh;
  background-color: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx;
  
  /* 手机端样式 */
  @media (max-width: 767px) {
    padding: 24rpx;
    align-items: flex-start;
    background: linear-gradient(135deg, #e0f2fe, #ede9fe);
  }
  
  /* 平板端样式 */
  @media (min-width: 768px) and (max-width: 1199px) {
    padding: 48rpx;
  }
  
  /* PC端样式 */
  @media (min-width: 1200px) {
    padding: 60rpx;
  }
}

.privacy__container {
  width: 100%;
  height: 100%;
  background-color: #ffffff;
  border-radius: 24rpx;
  box-shadow: 0 20rpx 60rpx rgba(15, 23, 42, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  
  /* 手机端样式 */
  @media (max-width: 767px) {
    border-radius: 32rpx;
    min-height: 80vh;
    max-height: 90vh;
  }
  
  /* 平板端样式 */
  @media (min-width: 768px) and (max-width: 1199px) {
    max-width: 90%;
    max-height: 90vh;
  }
  
  /* PC端样式 */
  @media (min-width: 1200px) {
    max-width: 800px;
    max-height: 80vh;
  }
}

.privacy__header {
  padding: 48rpx 48rpx 32rpx;
  border-bottom: 1rpx solid #e2e8f0;
  background: linear-gradient(135deg, #f8fafc, #ffffff);
  flex-shrink: 0;
  
  /* 手机端样式 */
  @media (max-width: 767px) {
    padding: 40rpx 40rpx 24rpx;
  }
}

.privacy__title {
  font-size: 40rpx;
  font-weight: 600;
  color: #0f172a;
  display: block;
  margin-bottom: 16rpx;
  
  /* 手机端样式 */
  @media (max-width: 767px) {
    font-size: 36rpx;
  }
  
  /* PC端样式 */
  @media (min-width: 1200px) {
    font-size: 44rpx;
  }
}

.privacy__subtitle {
  font-size: 26rpx;
  color: #64748b;
  
  /* 手机端样式 */
  @media (max-width: 767px) {
    font-size: 24rpx;
  }
}

.privacy__content {
  flex: 1;
  padding: 32rpx 48rpx;
  
  /* 手机端样式 */
  @media (max-width: 767px) {
    padding: 24rpx 40rpx;
  }
}

.privacy__section {
  margin-bottom: 48rpx;
  
  /* 手机端样式 */
  @media (max-width: 767px) {
    margin-bottom: 40rpx;
  }
}

.privacy__section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #0f172a;
  display: block;
  margin-bottom: 24rpx;
  
  /* 手机端样式 */
  @media (max-width: 767px) {
    font-size: 30rpx;
    margin-bottom: 20rpx;
  }
  
  /* PC端样式 */
  @media (min-width: 1200px) {
    font-size: 34rpx;
  }
}

.privacy__text {
  font-size: 28rpx;
  color: #475569;
  line-height: 1.6;
  display: block;
  white-space: pre-line;
  
  /* 手机端样式 */
  @media (max-width: 767px) {
    font-size: 26rpx;
    line-height: 1.5;
  }
  
  /* PC端样式 */
  @media (min-width: 1200px) {
    font-size: 30rpx;
    line-height: 1.7;
  }
}

.privacy__actions {
  padding: 32rpx 48rpx;
  border-top: 1rpx solid #e2e8f0;
  display: flex;
  gap: 24rpx;
  flex-shrink: 0;
  
  /* 手机端样式 */
  @media (max-width: 767px) {
    padding: 24rpx 40rpx;
    gap: 20rpx;
  }
  
  /* PC端样式 */
  @media (min-width: 1200px) {
    padding: 40rpx 48rpx;
  }
}

.privacy__button {
  flex: 1;
  height: 88rpx;
  line-height: 88rpx;
  font-size: 28rpx;
  border: none;
  border-radius: 16rpx;
  transition: all 0.3s ease;
  
  &:active {
    transform: translateY(2rpx);
  }
  
  /* 手机端样式 */
  @media (max-width: 767px) {
    height: 80rpx;
    line-height: 80rpx;
    font-size: 26rpx;
  }
  
  /* PC端样式 */
  @media (min-width: 1200px) {
    height: 96rpx;
    line-height: 96rpx;
    font-size: 30rpx;
    
    &:hover {
      opacity: 0.9;
    }
  }
  
  &--secondary {
    background-color: #f1f5f9;
    color: #475569;
    
    /* PC端样式 */
    @media (min-width: 1200px) {
      &:hover {
        background-color: #e2e8f0;
      }
    }
  }
  
  &--primary {
    background: linear-gradient(135deg, #2563eb, #3b82f6);
    color: #ffffff;
    
    /* PC端样式 */
    @media (min-width: 1200px) {
      &:hover {
        background: linear-gradient(135deg, #1d4ed8, #2563eb);
      }
    }
  }
}
</style>