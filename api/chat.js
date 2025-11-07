import { defineStore } from 'pinia'
import { chatStream } from '@/utils/request.js'

export const useChatStore = defineStore('chat', {
  state: () => ({
    sessions: [],
    activeSessionId: 'default',
    messageMap: {}
  }),
  
  getters: {
    activeSession(state) {
      return state.sessions.find((item) => item.id === state.activeSessionId) || null
    },
    messages(state) {
      return state.messageMap[state.activeSessionId] || []
    }
  },
  
  actions: {
	ensureSession(sessionId = this.activeSessionId) {
	  if (!this.sessions.find(s => s.id === sessionId)) {
	    this.sessions = [...this.sessions, { id: sessionId, title: '粤风AI助手' }]
	  }
	  if (!this.messageMap[sessionId]) {
	    // 确保有消息数组
	    this.messageMap[sessionId] = []
	  }
	},
    setSessions(list) { 
      this.sessions = list 
	  
    },
    
    setActiveSession(sessionId) { 
      this.activeSessionId = sessionId 
    },
    
    upsertMessages(sessionId, messages) { 
      this.messageMap[sessionId] = messages 
    },
	async sendMessage({ content }) {
	  const sessionId = this.activeSessionId || 'default'
	  this.ensureSession(sessionId) // <<< 关键：保证会话与消息数组存在
	
	  // 1) 先 push 用户消息
  const userMsg = { role: 'user', content, timestamp: Date.now() }
	  const list1 = [...(this.messageMap[sessionId] || [])]
	  list1.push(userMsg)
	  this.messageMap[sessionId] = list1
	
	  // 2) 再 push AI 占位
  const aiMsg = { role: 'assistant', content: '', timestamp: Date.now() }
	  const list2 = [...this.messageMap[sessionId]]
	  const aiIndex = list2.length
	  list2.push(aiMsg)
	  this.messageMap[sessionId] = list2
	
	  // 3) 开始流式
	  const cancel = chatStream(
	    {
	      url: '/chat/send',
	      method: 'POST',
	      body: {
	        model: 'qwen3-max',
	        modelName: 'qwen3-max',
	        messages: this.messageMap[sessionId].map(m => ({ role: m.role, content: m.content })),
	        stream: true
	      }
	    },
	    // onDelta
	    (delta) => {
	      aiMsg.content += delta
	      const arr = [...this.messageMap[sessionId]]
	      arr[aiIndex] = { ...aiMsg }
	      this.messageMap[sessionId] = arr
	      // console.log('delta:', delta)
	    },
	    // onError
	    (err) => {
	      aiMsg.content += '\n[错误] ' + (err?.message || err)
	      const arr = [...this.messageMap[sessionId]]
	      arr[aiIndex] = { ...aiMsg }
	      this.messageMap[sessionId] = arr
	    },
	    // onDone（可选）
	    () => {}
	  )
	
	  // 存一下 cancel 如需中断
	  this._cancel = cancel
	}

    
  }
})
