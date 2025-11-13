"use strict";
const common_vendor = require("../common/vendor.js");
const utils_request = require("../utils/request.js");
common_vendor.defineStore("chat", {
  state: () => ({
    sessions: [],
    activeSessionId: "default",
    messageMap: {}
  }),
  getters: {
    activeSession(state) {
      return state.sessions.find((item) => item.id === state.activeSessionId) || null;
    },
    messages(state) {
      return state.messageMap[state.activeSessionId] || [];
    }
  },
  actions: {
    ensureSession(sessionId = this.activeSessionId) {
      if (!this.sessions.find((s) => s.id === sessionId)) {
        this.sessions = [...this.sessions, { id: sessionId, title: "粤风AI助手" }];
      }
      if (!this.messageMap[sessionId]) {
        this.messageMap[sessionId] = [];
      }
    },
    setSessions(list) {
      this.sessions = list;
    },
    setActiveSession(sessionId) {
      this.activeSessionId = sessionId;
    },
    upsertMessages(sessionId, messages) {
      this.messageMap[sessionId] = messages;
    },
    async sendMessage({ content }) {
      const sessionId = this.activeSessionId || "default";
      this.ensureSession(sessionId);
      const userMsg = { role: "user", content, timestamp: Date.now() };
      this.messageMap[sessionId] = [...this.messageMap[sessionId], userMsg];
      const aiMsg = { role: "assistant", content: "", timestamp: Date.now() };
      const aiIndex = this.messageMap[sessionId].length;
      this.messageMap[sessionId] = [...this.messageMap[sessionId], aiMsg];
      try {
        const cancel = utils_request.request.chatStream(
          {
            url: "/chat/stream",
            // 使用相对路径，会自动拼接 WS_URL
            method: "POST",
            body: {
              model: "qwen3-max",
              messages: this.messageMap[sessionId].map((m) => ({
                role: m.role,
                content: m.content
              })),
              stream: true
            }
          },
          // onDelta: 收到数据片段
          (delta) => {
            aiMsg.content += delta;
            const arr = [...this.messageMap[sessionId]];
            arr[aiIndex] = { ...aiMsg };
            this.messageMap[sessionId] = arr;
          },
          // onError: 流式错误
          (err) => {
            aiMsg.content += "\n[流式错误] " + ((err == null ? void 0 : err.message) || err);
            const arr = [...this.messageMap[sessionId]];
            arr[aiIndex] = { ...aiMsg };
            this.messageMap[sessionId] = arr;
          },
          // onDone: 流式完成
          () => {
            common_vendor.index.__f__("log", "at api/chat.js:86", "[Chat] 流式响应完成");
          }
        );
        this._cancel = cancel;
      } catch (error) {
        aiMsg.content += "\n[连接失败] " + error.message;
        const arr = [...this.messageMap[sessionId]];
        arr[aiIndex] = { ...aiMsg };
        this.messageMap[sessionId] = arr;
      }
    },
    // 新增：中断聊天
    cancelChat() {
      if (this._cancel) {
        this._cancel();
        this._cancel = null;
        return true;
      }
      return false;
    }
  }
});
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/chat.js.map
