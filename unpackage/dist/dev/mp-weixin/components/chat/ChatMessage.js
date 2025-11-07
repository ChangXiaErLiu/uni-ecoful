"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = {
  __name: "ChatMessage",
  props: {
    message: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ["feedback", "request-edit", "edit"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const isUser = common_vendor.computed(() => {
      var _a;
      return ((_a = props.message) == null ? void 0 : _a.role) === "user";
    });
    common_vendor.watch(() => props.message, (newMsg) => {
    }, {
      deep: true
    });
    common_vendor.onMounted(() => {
    });
    const formatTime = (timestamp) => {
      if (!timestamp)
        return "";
      const date = new Date(timestamp);
      return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
    };
    const startEdit = () => {
      var _a, _b, _c, _d, _e;
      emit("request-edit", {
        id: (_a = props.message) == null ? void 0 : _a.id,
        content: typeof ((_b = props.message) == null ? void 0 : _b.content) === "string" ? props.message.content : ((_d = (_c = props.message) == null ? void 0 : _c.content) == null ? void 0 : _d.content) || "",
        attachments: ((_e = props.message) == null ? void 0 : _e.attachments) || []
      });
    };
    const copyMessageSafe = async (input) => {
      var _a;
      let content = "";
      if (typeof input === "string")
        content = input;
      else if (input && typeof input === "object")
        content = input.content || "";
      content = String(content || "").trim();
      if (!content)
        return;
      try {
        await new Promise((resolve, reject) => {
          try {
            common_vendor.index.setClipboardData({ data: content, success: resolve, fail: reject });
          } catch (e) {
            reject(e);
          }
        });
        common_vendor.index.showToast({ title: "已复制到剪贴板", icon: "success" });
        return;
      } catch (_) {
      }
      try {
        if (typeof navigator !== "undefined" && ((_a = navigator.clipboard) == null ? void 0 : _a.writeText)) {
          await navigator.clipboard.writeText(content);
          common_vendor.index.showToast({ title: "已复制到剪贴板", icon: "success" });
          return;
        }
      } catch (_) {
      }
      try {
        if (typeof document !== "undefined") {
          const ta = document.createElement("textarea");
          ta.value = content;
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.select();
          const ok = document.execCommand("copy");
          document.body.removeChild(ta);
          if (ok) {
            common_vendor.index.showToast({ title: "已复制到剪贴板", icon: "success" });
            return;
          }
        }
      } catch (_) {
      }
      common_vendor.index.showToast({ title: "复制失败", icon: "error" });
    };
    const handleFeedback = (type) => {
      var _a;
      if (!((_a = props.message) == null ? void 0 : _a.id))
        return;
      emit("feedback", props.message.id, type);
    };
    return (_ctx, _cache) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q;
      return common_vendor.e({
        a: isUser.value
      }, isUser.value ? {
        b: common_assets._imports_0
      } : {
        c: common_assets._imports_1
      }, {
        d: common_vendor.t(isUser.value ? "我" : "AI助手"),
        e: common_vendor.t(formatTime((_a = __props.message) == null ? void 0 : _a.timestamp)),
        f: isUser.value
      }, isUser.value ? common_vendor.e({
        g: common_vendor.t(typeof ((_b = __props.message) == null ? void 0 : _b.content) === "string" ? __props.message.content : ((_d = (_c = __props.message) == null ? void 0 : _c.content) == null ? void 0 : _d.content) || ""),
        h: ((_e = __props.message) == null ? void 0 : _e.attachments) && __props.message.attachments.length
      }, ((_f = __props.message) == null ? void 0 : _f.attachments) && __props.message.attachments.length ? {
        i: common_vendor.f(__props.message.attachments, (attachment, idx, i0) => {
          return common_vendor.e({
            a: /\\.(png|jpe?g|gif|bmp|webp|heic|heif)$/i.test((attachment == null ? void 0 : attachment.name) || (attachment == null ? void 0 : attachment.url) || "")
          }, /\\.(png|jpe?g|gif|bmp|webp|heic|heif)$/i.test((attachment == null ? void 0 : attachment.name) || (attachment == null ? void 0 : attachment.url) || "") ? {
            b: attachment.url
          } : {
            c: "352d0af0-0-" + i0,
            d: common_vendor.p({
              type: "paperclip",
              size: "14",
              color: "#64748b"
            })
          }, {
            e: common_vendor.t(attachment.name || "附件"),
            f: idx
          });
        })
      } : {}, {
        j: common_vendor.p({
          type: "compose",
          size: "16",
          color: "#ffffff"
        }),
        k: common_vendor.o(startEdit),
        l: common_vendor.p({
          type: "paperclip",
          size: "16",
          color: "#ffffff"
        }),
        m: common_vendor.o(($event) => {
          var _a2;
          return copyMessageSafe((_a2 = __props.message) == null ? void 0 : _a2.content);
        })
      }) : common_vendor.e({
        n: common_vendor.t(typeof ((_g = __props.message) == null ? void 0 : _g.content) === "string" ? __props.message.content : ((_i = (_h = __props.message) == null ? void 0 : _h.content) == null ? void 0 : _i.content) || " "),
        o: ((_j = __props.message) == null ? void 0 : _j.attachments) && __props.message.attachments.length
      }, ((_k = __props.message) == null ? void 0 : _k.attachments) && __props.message.attachments.length ? {
        p: common_vendor.f(__props.message.attachments, (attachment, idx, i0) => {
          return {
            a: "352d0af0-3-" + i0,
            b: common_vendor.t(attachment.name),
            c: idx
          };
        }),
        q: common_vendor.p({
          type: "paperclip",
          size: "14",
          color: "#64748b"
        })
      } : {}, {
        r: common_vendor.p({
          type: ((_l = __props.message) == null ? void 0 : _l.feedback) === "like" ? "hand-up-filled" : "hand-up",
          size: "16",
          color: ((_m = __props.message) == null ? void 0 : _m.feedback) === "like" ? "#ffffff" : "#64748b"
        }),
        s: ((_n = __props.message) == null ? void 0 : _n.feedback) === "like" ? 1 : "",
        t: common_vendor.o(($event) => handleFeedback("like")),
        v: common_vendor.p({
          type: ((_o = __props.message) == null ? void 0 : _o.feedback) === "dislike" ? "hand-down-filled" : "hand-down",
          size: "16",
          color: ((_p = __props.message) == null ? void 0 : _p.feedback) === "dislike" ? "#ef4444" : "#64748b"
        }),
        w: ((_q = __props.message) == null ? void 0 : _q.feedback) === "dislike" ? 1 : "",
        x: common_vendor.o(($event) => handleFeedback("dislike")),
        y: common_vendor.p({
          type: "paperclip",
          size: "16",
          color: "#64748b"
        }),
        z: common_vendor.o(($event) => {
          var _a2;
          return copyMessageSafe((_a2 = __props.message) == null ? void 0 : _a2.content);
        })
      }), {
        A: isUser.value ? 1 : "",
        B: !isUser.value ? 1 : ""
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-352d0af0"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/chat/ChatMessage.js.map
