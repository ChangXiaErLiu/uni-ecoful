import App from './App'
import './uni.promisify.adaptor'
import { setupStore } from './api'
import { setupRouterGuard } from '@/common/router-guard.js'

// 在 H5 端将安全区写入 CSS 变量，供遮罩/抽屉等使用
function injectSafeAreaCssVars() {
  try {
    const info = uni.getSystemInfoSync()
    const top = Number((info.safeAreaInsets && info.safeAreaInsets.top) || info.statusBarHeight || 0)
    const bottom = Number((info.safeAreaInsets && info.safeAreaInsets.bottom) || 0)
    if (typeof document !== 'undefined') {
      const root = document.documentElement
      root.style.setProperty('--safe-top', top + 'px')
      root.style.setProperty('--safe-bottom', bottom + 'px')
    }
  } catch (e) {
    // 忽略错误，保证兼容性
  }
}

// #ifndef VUE3
import Vue from 'vue'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
  ...App
})
setupStore(app)
setupRouterGuard() // Vue2 也要启用路由守卫
injectSafeAreaCssVars()
// 兼容 Vue2 挂载写法
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  setupStore(app)
  setupRouterGuard() // vue3启动路由守卫
  injectSafeAreaCssVars()
  return {
    app
  }
}
// #endif
