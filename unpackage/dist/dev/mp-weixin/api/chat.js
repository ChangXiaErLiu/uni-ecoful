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
      const list1 = [...this.messageMap[sessionId] || []];
      list1.push(userMsg);
      this.messageMap[sessionId] = list1;
      const aiMsg = { role: "assistant", content: "", timestamp: Date.now() };
      const list2 = [...this.messageMap[sessionId]];
      const aiIndex = list2.length;
      list2.push(aiMsg);
      this.messageMap[sessionId] = list2;
      const cancel = utils_request.chatStream(
        {
          url: "/chat/send",
          method: "POST",
          body: {
            model: "qwen3-max",
            modelName: "qwen3-max",
            messages: this.messageMap[sessionId].map((m) => ({ role: m.role, content: m.content })),
            stream: true
          }
        },
        // onDelta
        (delta) => {
          aiMsg.content += delta;
          const arr = [...this.messageMap[sessionId]];
          arr[aiIndex] = { ...aiMsg };
          this.messageMap[sessionId] = arr;
        },
        // onError
        (err) => {
          aiMsg.content += "\n[错误] " + ((err == null ? void 0 : err.message) || err);
          const arr = [...this.messageMap[sessionId]];
          arr[aiIndex] = { ...aiMsg };
          this.messageMap[sessionId] = arr;
        },
        // onDone（可选）
        () => {
        }
      );
      this._cancel = cancel;
    }
  }
});
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/chat.js.map
