// request.js（UTF-8，中文注释）
// 说明：统一请求与流式请求封装；基础地址从 utils/config.js 注入
import { BASE_URL, WS_URL } from './config.js'

// 统一请求（函数式工厂，保留灵活性）
export function createRequest(options = {}) {
  return function request(config) {
    const { url, method = 'GET', data = {}, header = {} } = config
    return new Promise((resolve, reject) => {
      uni.request({
        url: url.startsWith('http') ? url : (BASE_URL + url),
        method,
        data,
        header: {
          'Content-Type': 'application/json',
          ...options.header,
          ...header
        },
        success: (res) => {
          console.log('请求成功:', res.data)
          resolve(res.data)
        },
        fail: (error) => {
          console.error('请求失败:', error)
          reject(error)
        }
      })
    })
  }
}

export const request = createRequest()

/**
 * 聊天流式接口（H5 使用 SSE；小程序使用 WebSocket）
 * @param {Object} chatRequest - { model/modelName, messages:[{role,content}], stream:true }
 * @param {function(string)} onDelta - 每段增量回调
 * @param {function()} onDone - 完成回调
 * @param {function(Error)} onError - 出错回调
 * @returns {function} cancel - 取消函数
 */

// chatStream：跨端流式实现
export function chatStream(
  chatRequest,
  onDelta = () => {},
  onDone  = () => {},
  onError = () => {}
) {
  let cancelled = false
  let aborter = null

  // #ifdef MP
  // 小程序端：使用 WebSocket 实现
  try {
    // 若未使用 wss 提示（在发布前请确保为 wss:// 且配置合法域名）
    // #ifdef MP
    try {
      if (typeof WS_URL === 'string' && /^ws:\/\//i.test(WS_URL)) {
        console.warn('当前为 ws://，小程序需使用 wss:// 且配置合法域名:', WS_URL)
      }
    } catch(e) {}
    // #endif
    const socketTask = uni.connectSocket({ url: WS_URL, protocols: [], tcpNoDelay: true })
    let opened = false

    socketTask.onOpen(() => {
      opened = true
      try {
        socketTask.send({ data: JSON.stringify(chatRequest) })
      } catch (e) {
        onError && onError(e)
      }
    })

    socketTask.onMessage((evt) => {
      if (cancelled) return
      try {
        // 约定：服务端每条消息为一段纯文本，收到 "[DONE]" 表示结束
        const data = (evt?.data ?? '')
        if (!data) return
        if (data === '[DONE]') {
          onDone && onDone()
          return
        }
        onDelta && onDelta(String(data))
      } catch (err) {
        onError && onError(err)
      }
    })

    socketTask.onError((err) => {
      if (!cancelled) onError && onError(err)
    })

    socketTask.onClose(() => {
      if (!cancelled) onDone && onDone()
    })

    return () => {
      cancelled = true
      try { socketTask?.close?.() } catch (e) {}
    }
  } catch (err) {
    onError && onError(err)
  }
  // #endif

  // #ifdef H5
  ;(async () => {
    try {
      const controller = new AbortController()
      aborter = controller
      
      // H5 使用 fetch + SSE（服务端需返回 text/event-stream）
      const res = await fetch(BASE_URL + '/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify(chatRequest),
        signal: controller.signal,
        mode: 'cors',
      })
      
      if (!res.ok || !res.body) throw new Error(`流式请求失败: ${res.status}`)

      const reader = res.body.getReader()
      const decoder = new TextDecoder('utf-8')

      while (true) {
        const { value, done } = await reader.read()
        
        // 读取结束
        if (done) {
          onDone && onDone()
          break
        }

        const chunk = decoder.decode(value, { stream: true })
        
        const lines = chunk.replace(/\r/g, '').split('\n')

        for (const raw of lines) {
          const line = raw.trim()
          if (!line) continue

          let payload = ''
          if (line.startsWith('data:')) payload = line.slice(5).trim()
          else payload = line

          if (!payload) continue
          if (payload === '[DONE]') {
            console.log('收到 [DONE]，触发 onDone')
            onDone && onDone()
            continue
          }
          
          onDelta && onDelta(payload)
        }
      }
    } catch (err) {
      console.error('流式请求错误:', err)
      if (!cancelled) onError(err)
    }
  })()
  // #endif

  // #ifndef H5
  console.error('当前平台不支持流式请求（仅 H5 / 小程序）')
  onError(new Error('当前平台不支持流式请求（仅 H5 / 小程序）'))
  // #endif

  return () => {
    cancelled = true
    try { aborter && aborter.abort() } catch (e) {}
  }
}

