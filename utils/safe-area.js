// utf-8
// 中文注释：安全区与导航栏尺寸工具，统一获取状态栏、胶囊与底部安全区，跨端兜底
import { ref, computed, onMounted } from 'vue'

export function useSafeArea() {
  const statusBarHeightPx = ref(0)
  // 中文注释：兜底导航栏高度（iOS 通常 44px）
  const navBarHeightPx = ref(44)
  // 中文注释：底部安全区高度（适配全面屏/Home 指示条）
  const safeAreaBottomPx = ref(0)
  // 中文注释：总导航高度（状态栏 + 自定义导航高度）
  const totalNavHeightPx = computed(() => Number(statusBarHeightPx.value || 0) + Number(navBarHeightPx.value || 0))

  function refresh() {
    try {
      const info = uni.getSystemInfoSync()
      statusBarHeightPx.value = Number(info.statusBarHeight || 0)

      // 中文注释：计算底部安全区（以 screenHeight 与 safeArea.bottom 差值为准）
      try {
        const screenH = Number(info.screenHeight || 0)
        const safeBottom = Number((info.safeArea && info.safeArea.bottom) || 0)
        const insetBottom = Math.max(0, screenH - safeBottom)
        safeAreaBottomPx.value = isNaN(insetBottom) ? 0 : insetBottom
      } catch (e) {
        safeAreaBottomPx.value = 0
      }

      // #ifdef MP-WEIXIN
      try {
        const cap = uni.getMenuButtonBoundingClientRect()
        // 中文注释：导航栏高度 = 胶囊高度 + 上下边距（上下对称）
        const topGap = cap.top - statusBarHeightPx.value
        const capsuleHeight = cap.height
        // 导航栏高度 = 胶囊高度 + 上下边距（topGap * 2）
        navBarHeightPx.value = capsuleHeight + (topGap * 2)
        
        // 调试日志：输出所有关键数据
        console.log('=== 安全区调试信息 ===')
        console.log('statusBarHeight:', statusBarHeightPx.value)
        console.log('cap.top:', cap.top)
        console.log('cap.bottom:', cap.bottom)
        console.log('cap.height:', capsuleHeight)
        console.log('topGap:', topGap)
        console.log('计算公式: capsuleHeight + (topGap * 2) =', capsuleHeight, '+', topGap * 2)
        console.log('navBarHeight:', navBarHeightPx.value)
        console.log('totalNavHeight:', statusBarHeightPx.value + navBarHeightPx.value)
        console.log('===================')
      } catch (e) {
        navBarHeightPx.value = 44
      }
      // #endif

      // #ifndef MP-WEIXIN
      // 中文注释：其他端给出一个合理的默认值
      if (!navBarHeightPx.value || isNaN(navBarHeightPx.value)) {
        navBarHeightPx.value = 44
      }
      // #endif
    } catch (e) {
      statusBarHeightPx.value = 20
      navBarHeightPx.value = 44
      safeAreaBottomPx.value = 0
    }
  }

  onMounted(refresh)
  refresh()

  return {
    statusBarHeightPx,
    navBarHeightPx,
    totalNavHeightPx,
    safeAreaBottomPx,
  }
}

