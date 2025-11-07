// 配置中心（UTF-8，中文注释）
// 目标：导出 BASE_URL 和 WS_URL，供请求与流式模块使用；允许按端/环境覆盖

let BASE_URL = 'http://localhost:6039'

// 统一运行时覆盖（H5/小程序/App 都可在启动时注入）：
// 例如在 App.vue onLaunch 中：globalThis.__UNI_API_BASE__ = 'https://api.example.com'
try {
  if (typeof globalThis !== 'undefined' && globalThis.__UNI_API_BASE__) {
    BASE_URL = String(globalThis.__UNI_API_BASE__)
  }
} catch (e) {}

// 计算 WS_URL：http -> ws，https -> wss
let WS_URL = BASE_URL
try {
  WS_URL = /^https:\/\//i.test(BASE_URL)
    ? BASE_URL.replace(/^https/i, 'wss')
    : BASE_URL.replace(/^http/i, 'ws')
} catch (e) {
  WS_URL = BASE_URL.replace(/^http/i, 'ws')
}
WS_URL = WS_URL + '/chat/stream'

export { BASE_URL, WS_URL }

