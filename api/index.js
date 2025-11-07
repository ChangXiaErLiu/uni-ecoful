import { createPinia } from 'pinia'

// 中文注释：导出所有 store，方便在业务模块中按需引用
export * from './chat'
export * from './user'
export * from './knowledge'

let piniaInstance = null

// 对外提供统一的 pinia 安装入口，避免重复创建实例
export function setupStore(app) {
  if (!piniaInstance) {
    piniaInstance = createPinia()
  }
  app.use(piniaInstance)
  return piniaInstance
}

export function getPinia() {
  return piniaInstance
}
