﻿// utils/platform.js
// 判断屏幕大小，确定web还是移动端
import { computed, onMounted, onUnmounted, ref } from 'vue'

export function usePlatformInfo() {
  const windowWidth = ref(375)
  const windowHeight = ref(812)
  const platform = ref('web')

  function refreshSizeSync() {
    try {
      const info = uni.getSystemInfoSync()
      windowWidth.value = info.windowWidth
      windowHeight.value = info.windowHeight
      platform.value = info.platform || 'web'
    } catch (e) {
      // H5 兜底
      if (typeof window !== 'undefined') {
        windowWidth.value = window.innerWidth
        windowHeight.value = window.innerHeight
        platform.value = 'web'
      }
    }
  }

  function handleResize(res) {
    try {
      if (res?.size) {
        windowWidth.value = res.size.windowWidth
        windowHeight.value = res.size.windowHeight
      } else if (typeof window !== 'undefined') {
        windowWidth.value = window.innerWidth
        windowHeight.value = window.innerHeight
      }
    } catch {}
  }

  // 立即初始化一次（避免首屏误判）
  refreshSizeSync()

  onMounted(() => {
    // 优先用 uni.onWindowResize
    if (typeof uni.onWindowResize === 'function') {
      uni.onWindowResize(handleResize)
    }
    // H5 兜底：部分版本/环境 uni.onWindowResize 不触发
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize)
    }
  })

  onUnmounted(() => {
    if (typeof uni.offWindowResize === 'function') {
      uni.offWindowResize(handleResize)
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', handleResize)
    }
  })

  const isDesktop = computed(() => windowWidth.value >= 1024)
  const isTablet  = computed(() => windowWidth.value >= 768 && windowWidth.value < 1024)
  const isMobile  = computed(() => windowWidth.value < 768)

  return { windowWidth, windowHeight, platform, isDesktop, isTablet, isMobile }
}
