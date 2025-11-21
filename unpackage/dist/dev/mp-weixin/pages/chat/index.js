"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_platform = require("../../utils/platform.js");
const utils_safeArea = require("../../utils/safe-area.js");
const stores_navTitle = require("../../stores/navTitle.js");
if (!Array) {
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  _easycom_uni_popup2();
}
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (ChatSidebar + ChatHeader + ChatMessage + ChatInput + _easycom_uni_popup + AppLayout)();
}
const AppLayout = () => "../../components/layout/AppLayout.js";
const ChatSidebar = () => "../../components/chat/ChatSidebar.js";
const ChatHeader = () => "../../components/chat/ChatHeader.js";
const ChatMessage = () => "../../components/chat/ChatMessage.js";
const ChatInput = () => "../../components/chat/ChatInput.js";
const bottomAnchorId = "chat-bottom-anchor";
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const navTitle = stores_navTitle.navTitleStore();
    common_vendor.onShow(() => navTitle.setTitle("环保通用AI问答"));
    const {
      isDesktop
    } = utils_platform.usePlatformInfo();
    const {
      statusBarHeightPx,
      navBarHeightPx,
      totalNavHeightPx
    } = utils_safeArea.useSafeArea();
    const conversations = common_vendor.ref([]);
    const currentConversationId = common_vendor.ref("");
    const isGenerating = common_vendor.ref(false);
    const sidebarCollapsed = common_vendor.ref(false);
    const mobileSidebarVisible = common_vendor.ref(false);
    const sidebarPopup = common_vendor.ref(null);
    const cancelGenerate = common_vendor.ref(null);
    const chatInputRef = common_vendor.ref(null);
    const currentConversation = common_vendor.computed(() => {
      return conversations.value.find((c) => c.id === currentConversationId.value) || {
        id: "",
        title: "新对话",
        messages: []
      };
    });
    const currentMessages = common_vendor.computed(() => currentConversation.value.messages || []);
    common_vendor.ref(null);
    const scrollIntoView = common_vendor.ref("");
    const mpScrollTop = common_vendor.ref(0);
    const mpLastScrollTop = common_vendor.ref(0);
    const autoFollow = common_vendor.ref(true);
    const scrollPositions = common_vendor.ref({});
    function scrollToBottom() {
      try {
        scrollIntoView.value = "";
        common_vendor.nextTick$1(() => {
          scrollIntoView.value = bottomAnchorId;
        });
      } catch (e) {
      }
    }
    function saveScrollPos(id) {
      try {
        const key = id || currentConversationId.value;
        if (!key)
          return;
        scrollPositions.value[key] = {
          top: Number(mpLastScrollTop.value || 0)
        };
      } catch (e) {
      }
    }
    function restoreScrollPos(id) {
      try {
        const key = id || currentConversationId.value;
        const saved = key && scrollPositions.value[key] ? Number(scrollPositions.value[key].top || 0) : null;
        if (saved != null && saved > 0) {
          scrollIntoView.value = "";
          mpScrollTop.value = saved;
        } else {
          if (autoFollow.value)
            scrollToBottom();
        }
      } catch (e) {
      }
    }
    function onMpScroll(e) {
      var _a;
      try {
        const top = Number(((_a = e == null ? void 0 : e.detail) == null ? void 0 : _a.scrollTop) || 0);
        if (top + 30 < mpLastScrollTop.value)
          autoFollow.value = false;
        mpLastScrollTop.value = top;
        if (currentConversationId.value) {
          scrollPositions.value[currentConversationId.value] = {
            top
          };
        }
      } catch (e2) {
      }
    }
    function onMpScrollToLower() {
      autoFollow.value = true;
    }
    common_vendor.watch(isDesktop, (d) => {
      var _a, _b;
      if (d) {
        mobileSidebarVisible.value = false;
        try {
          (_b = (_a = sidebarPopup.value) == null ? void 0 : _a.close) == null ? void 0 : _b.call(_a);
        } catch (e) {
        }
      }
    });
    common_vendor.watch(currentConversationId, (newId, oldId) => {
      try {
        if (oldId)
          saveScrollPos(oldId);
      } catch (e) {
      }
      common_vendor.nextTick$1(() => restoreScrollPos(newId));
    });
    const toggleMobileSidebar = () => {
      var _a, _b, _c, _d;
      if (mobileSidebarVisible.value) {
        try {
          (_b = (_a = sidebarPopup.value) == null ? void 0 : _a.close) == null ? void 0 : _b.call(_a);
        } catch (e) {
        }
      } else {
        try {
          (_d = (_c = sidebarPopup.value) == null ? void 0 : _c.open) == null ? void 0 : _d.call(_c, "left");
        } catch (e) {
        }
      }
    };
    const closeMobileSidebar = () => {
      var _a, _b;
      try {
        (_b = (_a = sidebarPopup.value) == null ? void 0 : _a.close) == null ? void 0 : _b.call(_a);
      } catch (e) {
      }
    };
    const onSidebarPopupChange = (e) => {
      if (e && typeof e.show === "boolean") {
        mobileSidebarVisible.value = !!e.show;
      }
    };
    const noop = () => {
    };
    const popupDrawerStyle = common_vendor.computed(() => {
      try {
        return `padding-top: ${Number((totalNavHeightPx == null ? void 0 : totalNavHeightPx.value) || 0)}px;`;
      } catch (e) {
        return "";
      }
    });
    common_vendor.onMounted(() => {
      loadConversations();
      if (conversations.value.length === 0) {
        createNewChat();
      } else {
        common_vendor.index.__f__("log", "at pages/chat/index.vue:366", "初始化：使用已有对话，数量:", conversations.value.length);
      }
    });
    common_vendor.watch(isGenerating, (newVal) => {
    });
    common_vendor.watch(currentMessages, () => {
      common_vendor.nextTick$1(() => {
        if (autoFollow.value)
          scrollToBottom();
      });
    }, {
      deep: true
    });
    common_vendor.onMounted(() => {
      common_vendor.nextTick$1(() => {
        autoFollow.value = true;
        scrollToBottom();
      });
    });
    common_vendor.onUnmounted(() => {
    });
    function loadConversations() {
      var _a;
      try {
        const saved = common_vendor.index.getStorageSync("chat_conversations");
        if (saved) {
          conversations.value = JSON.parse(saved);
          if (conversations.value.length > 0) {
            currentConversationId.value = ((_a = conversations.value[0]) == null ? void 0 : _a.id) || "";
          }
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/chat/index.vue:409", e);
      }
    }
    function saveConversations() {
      try {
        conversations.value = [...conversations.value];
        common_vendor.index.setStorageSync("chat_conversations", JSON.stringify(conversations.value));
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/chat/index.vue:421", "保存对话失败:", e);
      }
    }
    function createNewChat() {
      const existingEmptyConv = conversations.value.find(
        (conv) => !conv.title || conv.title === "新对话" || conv.messages.length === 0
      );
      if (existingEmptyConv) {
        common_vendor.index.__f__("log", "at pages/chat/index.vue:433", "已有空对话，切换到:", existingEmptyConv.id);
        currentConversationId.value = existingEmptyConv.id;
        return;
      }
      const chat = {
        id: "conv_" + Date.now(),
        title: "新对话",
        createdAt: Date.now(),
        messages: []
      };
      conversations.value.unshift(chat);
      currentConversationId.value = chat.id;
      saveConversations();
      common_vendor.index.__f__("log", "at pages/chat/index.vue:447", "创建新对话:", chat.id);
    }
    function selectConversation(id) {
      currentConversationId.value = id;
    }
    function handleMobileCreateChat() {
      createNewChat();
      closeMobileSidebar();
    }
    function handleMobileSelectConversation(id) {
      selectConversation(id);
      closeMobileSidebar();
    }
    function editConversationTitle(id, newTitle) {
      const conv = conversations.value.find((c) => c.id === id);
      if (conv) {
        conv.title = newTitle;
        saveConversations();
      }
    }
    function deleteConversation(id) {
      var _a;
      const i = conversations.value.findIndex((c) => c.id === id);
      if (i !== -1) {
        conversations.value.splice(i, 1);
        if (currentConversationId.value === id)
          currentConversationId.value = ((_a = conversations.value[0]) == null ? void 0 : _a.id) || "";
        saveConversations();
      }
    }
    async function handleSendMessage(messageData) {
      const conv = conversations.value.find((c) => c.id === currentConversationId.value);
      if (!conv)
        return;
      const content = typeof messageData === "string" ? messageData : messageData.content || "";
      const attachments = messageData.attachments || [];
      const userMsg = {
        id: "msg_" + Date.now(),
        role: "user",
        content,
        // 直接使用字符串
        attachments,
        timestamp: Date.now()
      };
      conv.messages.push(userMsg);
      isGenerating.value = true;
      if (!conv.title || conv.title === "新对话") {
        conv.title = generateTitleFromText(userMsg.content);
      }
      saveConversations();
      await common_vendor.nextTick$1();
      await generateAIResponse(conv);
    }
    async function generateAIResponse(conv, userMsg) {
      const aiMsg = {
        id: "msg_" + Date.now(),
        role: "assistant",
        content: "",
        timestamp: Date.now()
      };
      conv.messages.push(aiMsg);
      saveConversations();
      await common_vendor.nextTick$1();
      function normalizeMessagesForBackend(messages) {
        return messages.map((m) => {
          if (typeof m.content === "string") {
            return {
              role: m.role,
              content: m.content.trim()
            };
          }
          const {
            content = "",
            attachments = []
          } = m.content || {};
          const attachText = attachments.length ? attachments.map((a) => `
[附件：${a.name || a.url}]`).join("") : "";
          return {
            role: m.role,
            content: (content + attachText).trim()
          };
        }).filter((m) => m.content && m.content.length > 0).slice(-30);
      }
      const body = {
        model: "qwen3-max",
        modelName: "qwen3-max",
        messages: normalizeMessagesForBackend(conv.messages),
        stream: true
      };
      try {
        let flushUI = function() {
          const messageIndex = conv.messages.findIndex((m) => m.id === aiMsg.id);
          if (messageIndex !== -1) {
            const newMessages = [...conv.messages];
            newMessages[messageIndex] = {
              ...aiMsg
            };
            conv.messages = newMessages;
          }
          uiTimer = null;
          const now = Date.now();
          if (now - lastSave > 500) {
            lastSave = now;
            saveConversations();
          }
        };
        let uiTimer = null;
        let lastSave = 0;
        cancelGenerate.value = utils_request.request.chatStream(
          body,
          (delta) => {
            aiMsg.content += delta;
            if (!uiTimer) {
              uiTimer = setTimeout(flushUI, 80);
            }
          },
          () => {
            try {
              if (uiTimer) {
                clearTimeout(uiTimer);
                uiTimer = null;
              }
              flushUI();
            } catch (e) {
            }
            isGenerating.value = false;
            cancelGenerate.value = null;
            saveConversations();
          },
          (err) => {
            common_vendor.index.__f__("error", "at pages/chat/index.vue:625", "AI回复错误:", err);
            aiMsg.content += `
[错误] ${(err == null ? void 0 : err.message) || err}`;
            try {
              if (uiTimer) {
                clearTimeout(uiTimer);
                uiTimer = null;
              }
              flushUI();
            } catch (e) {
            }
            isGenerating.value = false;
            cancelGenerate.value = null;
            saveConversations();
          }
        );
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/chat/index.vue:640", "生成AI回复时发生异常:", error);
        isGenerating.value = false;
        cancelGenerate.value = null;
      }
    }
    function stopGenerating() {
      isGenerating.value = false;
      if (cancelGenerate.value) {
        try {
          cancelGenerate.value();
        } catch (e) {
        }
        cancelGenerate.value = null;
      }
    }
    function clearCurrentConversation() {
      const conv = conversations.value.find((c) => c.id === currentConversationId.value);
      if (conv) {
        conv.messages = [];
        saveConversations();
      }
    }
    function handleMessageFeedback(messageId, feedback) {
      const conv = conversations.value.find((c) => c.id === currentConversationId.value);
      if (!conv)
        return;
      const i = conv.messages.findIndex((m) => m.id === messageId);
      if (i !== -1) {
        conv.messages[i].feedback = feedback;
        saveConversations();
      }
    }
    function handleMessageEdit(messageId, newContent) {
      const conv = conversations.value.find((c) => c.id === currentConversationId.value);
      if (!conv)
        return;
      const i = conv.messages.findIndex((m) => m.id === messageId);
      if (i !== -1) {
        conv.messages[i].content = newContent;
        saveConversations();
      }
    }
    function handleRequestEdit(msg) {
      var _a;
      try {
        (_a = chatInputRef.value) == null ? void 0 : _a.setDraft((msg == null ? void 0 : msg.content) || "", (msg == null ? void 0 : msg.attachments) || []);
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/chat/index.vue:693", "回填草稿失败:", e);
      }
    }
    function generateTitleFromText(text = "") {
      let s = (text || "").trim().replace(/\s/g, " ");
      const firstEnd = s.search(/[。！？!?\.]/);
      if (firstEnd > 0)
        s = s.slice(0, firstEnd);
      s = s.replace(/^[~#\-\s、，,。!?！?【】\[\]\(\)（）]|[~#\-\s、，,。!?！?【】\[\]\(\)（）]$/g, "");
      const maxLen = 10;
      if (s.length > maxLen)
        s = s.slice(0, maxLen) + "…";
      return s || "新对话";
    }
    function handleAddAttachment(file) {
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.unref(isDesktop)
      }, common_vendor.unref(isDesktop) ? {
        b: common_vendor.o(createNewChat),
        c: common_vendor.o(selectConversation),
        d: common_vendor.o(editConversationTitle),
        e: common_vendor.o(deleteConversation),
        f: common_vendor.o(($event) => sidebarCollapsed.value = !sidebarCollapsed.value),
        g: common_vendor.p({
          conversations: conversations.value,
          ["current-conversation-id"]: currentConversationId.value,
          collapsed: sidebarCollapsed.value
        }),
        h: common_vendor.o(noop),
        i: common_vendor.p({
          conversation: currentConversation.value,
          ["show-toggle"]: false
        }),
        j: common_vendor.f(currentMessages.value, (msg, index, i0) => {
          return {
            a: msg.id || index,
            b: common_vendor.o(handleMessageFeedback, msg.id || index),
            c: common_vendor.o(handleMessageEdit, msg.id || index),
            d: common_vendor.o(handleRequestEdit, msg.id || index),
            e: "5a559478-3-" + i0 + ",5a559478-0",
            f: common_vendor.p({
              message: msg
            })
          };
        }),
        k: bottomAnchorId,
        l: common_vendor.sr(chatInputRef, "5a559478-4,5a559478-0", {
          "k": "chatInputRef"
        }),
        m: common_vendor.o(handleSendMessage),
        n: common_vendor.o(stopGenerating),
        o: common_vendor.o(clearCurrentConversation),
        p: common_vendor.o(handleAddAttachment),
        q: common_vendor.p({
          ["is-generating"]: isGenerating.value
        })
      } : {
        r: common_vendor.o(toggleMobileSidebar),
        s: common_vendor.p({
          conversation: currentConversation.value,
          ["show-toggle"]: true
        }),
        t: common_vendor.o(handleMobileCreateChat),
        v: common_vendor.o(handleMobileSelectConversation),
        w: common_vendor.o(editConversationTitle),
        x: common_vendor.o(deleteConversation),
        y: common_vendor.o(closeMobileSidebar),
        z: common_vendor.p({
          conversations: conversations.value,
          ["current-conversation-id"]: currentConversationId.value,
          collapsed: false
        }),
        A: common_vendor.s(popupDrawerStyle.value),
        B: common_vendor.sr(sidebarPopup, "5a559478-6,5a559478-0", {
          "k": "sidebarPopup"
        }),
        C: common_vendor.o(onSidebarPopupChange),
        D: common_vendor.p({
          type: "left",
          ["is-mask-click"]: false
        }),
        E: common_vendor.f(currentMessages.value, (msg, index, i0) => {
          return {
            a: msg.id || index,
            b: common_vendor.o(handleMessageFeedback, msg.id || index),
            c: common_vendor.o(handleMessageEdit, msg.id || index),
            d: common_vendor.o(handleRequestEdit, msg.id || index),
            e: "5a559478-8-" + i0 + ",5a559478-0",
            f: common_vendor.p({
              message: msg
            })
          };
        }),
        F: bottomAnchorId,
        G: scrollIntoView.value,
        H: mpScrollTop.value,
        I: common_vendor.o(onMpScroll),
        J: common_vendor.o(onMpScrollToLower),
        K: common_vendor.sr(chatInputRef, "5a559478-9,5a559478-0", {
          "k": "chatInputRef"
        }),
        L: common_vendor.o(handleSendMessage),
        M: common_vendor.o(stopGenerating),
        N: common_vendor.o(clearCurrentConversation),
        O: common_vendor.o(handleAddAttachment),
        P: common_vendor.p({
          ["is-generating"]: isGenerating.value
        })
      }, {
        Q: common_vendor.n(common_vendor.unref(isDesktop) ? "layout-desktop" : "layout-mobile"),
        R: common_vendor.s(!common_vendor.unref(isDesktop) ? {
          height: `calc(100vh - ${common_vendor.unref(totalNavHeightPx)}px)`
        } : {})
      }, {}, {
        U: common_vendor.p({
          current: "pages/chat/index",
          ["content-scroll"]: false
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-5a559478"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/chat/index.js.map
