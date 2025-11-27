<template>
  <view class="agreement">
    <view class="agreement__container">
      <view class="agreement__header">
        <text class="agreement__title">用户协议</text>
        <text class="agreement__subtitle">最后更新日期：{{ currentDate }}</text>
      </view>

      <scroll-view class="agreement__content" scroll-y :style="{ height: scrollViewHeight + 'px' }">
        <view class="agreement__section">
          <text class="agreement__section-title">一、总则</text>
          <text class="agreement__text">
            1.1 欢迎使用我们的产品和服务。在注册成为用户之前，请认真阅读本用户协议（以下简称"本协议"）。\n
            1.2 您通过页面点击"同意"本协议并完成注册程序，即表示您已充分阅读、理解并接受本协议的全部内容，本协议即产生法律约束力。\n
            1.3 我们有权根据需要不时地修改本协议，更新后的协议条款一旦公布即代替原来的协议条款。
          </text>
        </view>

        <view class="agreement__section">
          <text class="agreement__section-title">二、账户注册与使用</text>
          <text class="agreement__text">
            2.1 您确认，在您完成注册程序时，您应当是具备完全民事权利能力和完全民事行为能力的自然人、法人或其他组织。\n
            2.2 您有义务提供真实、准确、完整、合法的注册资料，并及时更新。\n
            2.3 您的账户和密码由您自行保管，您应当对您账户进行的所有活动和事件负法律责任。\n
            2.4 您不得将账户转让、出售或借给他人使用，否则我们有权暂停或终止向您提供服务。
          </text>
        </view>

        <view class="agreement__section">
          <text class="agreement__section-title">三、用户行为规范</text>
          <text class="agreement__text">
            3.1 您在使用我们的服务时，必须遵守中华人民共和国相关法律法规的规定。\n
            3.2 您不得利用我们的服务从事以下行为：\n
            • 违反国家法律法规的；\n
            • 危害国家安全、泄露国家秘密的；\n
            • 侵犯他人合法权益的；\n
            • 其他我们认为不适当的行为。\n
            3.3 如您违反本协议规定，我们有权独立判断并立即终止向您提供服务。
          </text>
        </view>

        <view class="agreement__section">
          <text class="agreement__section-title">四、服务内容</text>
          <text class="agreement__text">
            4.1 我们向您提供智能工作台服务，包括但不限于任务管理、团队协作、文档处理等功能。\n
            4.2 我们保留随时变更、中断或终止部分或全部服务的权利。\n
            4.3 我们会对服务进行更新和维护，期间可能造成服务的中断。
          </text>
        </view>

        <view class="agreement__section">
          <text class="agreement__section-title">五、知识产权</text>
          <text class="agreement__text">
            5.1 我们提供服务时所用的软件、技术、程序、代码、界面等所有内容的知识产权均归我们所有。\n
            5.2 您在使用服务过程中产生的内容，其知识产权归您或相关权利人所有。\n
            5.3 未经我们书面同意，您不得复制、修改、传播我们的任何知识产权内容。
          </text>
        </view>

        <view class="agreement__section">
          <text class="agreement__section-title">六、免责声明</text>
          <text class="agreement__text">
            6.1 我们会尽最大努力保证服务的稳定性和安全性，但无法保证服务不会中断或没有错误。\n
            6.2 对于因不可抗力或我们不能控制的原因造成的服务中断或其他缺陷，我们不承担责任。\n
            6.3 您理解并同意，使用我们的服务下载或获取任何资料的行为均出于您的个人判断，并由您承担全部风险。
          </text>
        </view>

        <view class="agreement__section">
          <text class="agreement__section-title">七、协议修改与终止</text>
          <text class="agreement__text">
            7.1 我们有权随时修改本协议条款，修改后的协议将在公布时立即生效。\n
            7.2 如果您不同意修改后的协议，您有权停止使用我们的服务。\n
            7.3 我们有权根据实际情况终止向您提供服务，而无需承担任何责任。
          </text>
        </view>

        <view class="agreement__section">
          <text class="agreement__section-title">八、法律适用与争议解决</text>
          <text class="agreement__text">
            8.1 本协议的订立、执行和解释及争议的解决均适用中华人民共和国法律。\n
            8.2 如双方就本协议内容或其执行发生任何争议，应尽量友好协商解决；协商不成时，任何一方均可向我们所在地有管辖权的人民法院提起诉讼。
          </text>
        </view>

        <view class="agreement__section">
          <text class="agreement__section-title">九、联系我们</text>
          <text class="agreement__text">
            如果您对本协议有任何疑问、意见或建议，请通过以下方式联系我们：\n
            客服电话：400-xxx-xxxx\n
            客服邮箱：service@yourcompany.com\n
            办公地址：[您的公司地址]
          </text>
        </view>
      </scroll-view>

      <view class="agreement__actions">
        <button class="agreement__button agreement__button--secondary" @tap="goBack">返回</button>
        <button class="agreement__button agreement__button--primary" @tap="agree">同意协议</button>
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
    title: '已同意用户协议',
    icon: 'success'
  })
  setTimeout(() => {
    uni.navigateBack()
  }, 1500)
}
</script>

<style lang="scss" scoped>
.agreement {
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

.agreement__container {
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

.agreement__header {
  padding: 48rpx 48rpx 32rpx;
  border-bottom: 1rpx solid #e2e8f0;
  background: linear-gradient(135deg, #f8fafc, #ffffff);
  flex-shrink: 0;
  
  /* 手机端样式 */
  @media (max-width: 767px) {
    padding: 40rpx 40rpx 24rpx;
  }
}

.agreement__title {
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

.agreement__subtitle {
  font-size: 26rpx;
  color: #64748b;
  
  /* 手机端样式 */
  @media (max-width: 767px) {
    font-size: 24rpx;
  }
}

.agreement__content {
  flex: 1;
  padding: 32rpx 48rpx;
  
  /* 手机端样式 */
  @media (max-width: 767px) {
    padding: 24rpx 40rpx;
  }
}

.agreement__section {
  margin-bottom: 48rpx;
  
  /* 手机端样式 */
  @media (max-width: 767px) {
    margin-bottom: 40rpx;
  }
}

.agreement__section-title {
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

.agreement__text {
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

.agreement__actions {
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

.agreement__button {
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