/**
 * 配置中心
 * 根据运行环境自动切换 API 地址
 * 支持 H5、小程序、App 多端
 */

// 环境配置映射
const ENV_CONFIG = {
  development: 'http://172.16.1.61:8000',   //开发环境地址http://http://172.16.1.61:8000
  production: 'https://api.yourdomain.com' // 生产环境地址  172.16.1.176
}

// 根据 NODE_ENV 获取基础地址（HBuilderX 构建时自动注入）
const BASE_URL = ENV_CONFIG[process.env.NODE_ENV] || ENV_CONFIG.development

// 计算 WebSocket 地址：http -> ws，https -> wss
const WS_URL = BASE_URL.replace(/^http/, 'ws') + '/chat/stream'

// 开发环境日志提醒
if (process.env.NODE_ENV === 'development') {
  console.log('[Config] 当前 API 地址:', BASE_URL)
  console.log('[Config] 当前 WebSocket 地址:', WS_URL)
}

export { BASE_URL, WS_URL }


