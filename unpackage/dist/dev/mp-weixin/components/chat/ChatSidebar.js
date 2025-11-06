"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = {
  __name: "ChatSidebar",
  props: {
    conversations: {
      type: Array,
      default: () => []
    },
    currentConversationId: {
      type: String,
      default: ""
    },
    collapsed: {
      type: Boolean,
      default: false
    }
    // 仅桌面端“窄/宽”
  },
  emits: [
    "create-chat",
    "select-conversation",
    "edit-conversation",
    "delete-conversation",
    "toggle-collapse"
  ],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const createChat = () => emit("create-chat");
    const selectConversation = (id) => emit("select-conversation", id);
    const toggleCollapse = () => emit("toggle-collapse");
    const editTitle = (id) => {
      common_vendor.index.showModal({
        title: "编辑对话标题",
        content: "",
        editable: true,
        placeholderText: "输入新的对话标题",
        success: (res) => {
          if (res.confirm && res.content)
            emit("edit-conversation", id, res.content);
        }
      });
    };
    const deleteConv = (id) => {
      common_vendor.index.showModal({
        title: "永久删除对话",
        content: "删除后，该对话将不可恢复。确认删除吗？",
        success: (res) => {
          if (res.confirm)
            emit("delete-conversation", id);
        }
      });
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.p({
          type: __props.collapsed ? "right" : "left",
          size: "20",
          color: "#64748b"
        }),
        b: common_vendor.o(toggleCollapse),
        c: common_vendor.p({
          type: "plusempty",
          size: "18",
          color: "#ffffff"
        }),
        d: common_vendor.o(createChat),
        e: common_vendor.f(__props.conversations, (conv, k0, i0) => {
          return common_vendor.e({
            a: "e23d1a63-2-" + i0,
            b: common_vendor.t(conv.title || "新对话")
          }, !__props.collapsed ? {
            c: "e23d1a63-3-" + i0,
            d: common_vendor.p({
              type: "compose",
              size: "14",
              color: "#94a3b8"
            }),
            e: common_vendor.o(($event) => editTitle(conv.id), conv.id),
            f: "e23d1a63-4-" + i0,
            g: common_vendor.p({
              type: "trash",
              size: "14",
              color: "#94a3b8"
            }),
            h: common_vendor.o(($event) => deleteConv(conv.id), conv.id)
          } : {}, {
            i: conv.id,
            j: conv.id === __props.currentConversationId ? 1 : "",
            k: common_vendor.o(($event) => selectConversation(conv.id), conv.id)
          });
        }),
        f: common_vendor.p({
          type: "chat",
          size: "18",
          color: "#64748b"
        }),
        g: !__props.collapsed,
        h: __props.collapsed ? 1 : ""
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-e23d1a63"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/chat/ChatSidebar.js.map
