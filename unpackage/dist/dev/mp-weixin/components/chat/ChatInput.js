"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_safeArea = require("../../utils/safe-area.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const MAX_ATTACH = 10;
const _sfc_main = {
  __name: "ChatInput",
  props: {
    isGenerating: {
      type: Boolean,
      default: false
    }
  },
  emits: ["send-message", "stop-generating", "clear-conversation", "add-attachment"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const { safeAreaBottomPx } = utils_safeArea.useSafeArea();
    const keyboardHeightPx = common_vendor.ref(0);
    common_vendor.onMounted(() => {
      try {
        const handler = (res) => {
          keyboardHeightPx.value = Number((res == null ? void 0 : res.height) || 0);
        };
        common_vendor.index.onKeyboardHeightChange && common_vendor.index.onKeyboardHeightChange(handler);
        keyboardHeightPx._handler = handler;
      } catch (e) {
      }
    });
    common_vendor.onUnmounted(() => {
      try {
        if (keyboardHeightPx._handler && typeof common_vendor.index.offKeyboardHeightChange === "function") {
          common_vendor.index.offKeyboardHeightChange(keyboardHeightPx._handler);
        }
      } catch (e) {
      }
    });
    const inputRootStyle = common_vendor.computed(() => {
      try {
        const kb = Number((keyboardHeightPx == null ? void 0 : keyboardHeightPx.value) || 0);
        const safe = Number((safeAreaBottomPx == null ? void 0 : safeAreaBottomPx.value) || 0);
        return `transform: translateY(-${kb}px); padding-bottom: ${safe}px; will-change: transform;`;
      } catch (e) {
        return "";
      }
    });
    const inputText = common_vendor.ref("");
    const attachments = common_vendor.ref([]);
    __expose({
      setDraft(text = "", files = []) {
        inputText.value = (text || "").toString();
        attachments.value = Array.isArray(files) ? [...files] : [];
        common_vendor.nextTick$1();
      }
    });
    const checkIsImage = (file) => {
      if (file == null ? void 0 : file.isImage)
        return true;
      if ((file == null ? void 0 : file.type) && typeof file.type === "string" && file.type.indexOf("image/") === 0)
        return true;
      const name = ((file == null ? void 0 : file.name) || "") + " " + ((file == null ? void 0 : file.url) || "");
      return /\.(png|jpe?g|gif|bmp|webp|heic|heif)$/i.test(name);
    };
    const canSend = common_vendor.computed(() => {
      return !props.isGenerating && (inputText.value.trim() || attachments.value.length > 0);
    });
    const remainingSlots = common_vendor.computed(() => Math.max(0, MAX_ATTACH - attachments.value.length));
    const canAddMore = common_vendor.computed(() => remainingSlots.value > 0);
    const getMainButtonColor = common_vendor.computed(() => {
      if (props.isGenerating) {
        return "#ffffff";
      }
      return canSend.value ? "#ffffff" : "#9ca3af";
    });
    const handleMainAction = () => {
      if (props.isGenerating) {
        stopGenerating();
      } else {
        sendMessage();
      }
    };
    const sendMessage = () => {
      if (!canSend.value)
        return;
      const messageContent = inputText.value.trim();
      const message = {
        content: messageContent,
        // 直接发送字符串
        attachments: [...attachments.value]
      };
      emit("send-message", message);
      inputText.value = "";
      attachments.value = [];
    };
    const stopGenerating = () => emit("stop-generating");
    function onAddTap() {
      if (!canAddMore.value) {
        common_vendor.index.showToast({
          title: "最多只能添加 10 个附件",
          icon: "none"
        });
        return;
      }
      showAttachmentMenu();
    }
    function showAttachmentMenu() {
      common_vendor.index.showActionSheet({
        itemList: ["选择图片", "选择文件"],
        success: (res) => {
          if (res.tapIndex === 0)
            uploadImage();
          else
            uploadFile();
        }
      });
    }
    function pushFilesSafe(list) {
      for (const f of list) {
        if (attachments.value.length >= MAX_ATTACH) {
          common_vendor.index.showToast({
            title: "已达 10 个附件上限",
            icon: "none"
          });
          break;
        }
        attachments.value.push(f);
      }
    }
    function uploadImage() {
      const count = Math.min(9, remainingSlots.value);
      common_vendor.index.chooseImage({
        count,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          const list = (res.tempFiles || []).map((t, idx) => ({
            type: t.type || "image/*",
            isImage: true,
            name: t.name || `image_${Date.now()}_${idx}.jpg`,
            url: t.path || res.tempFilePaths && res.tempFilePaths[idx] || "",
            size: t.size || 0
          }));
          pushFilesSafe(list);
        }
      });
    }
    function uploadFile() {
      common_vendor.index.chooseMessageFile({
        count: Math.min(remainingSlots.value, 10),
        type: "all",
        // image / video / file / all
        success: (res) => {
          const files = res.tempFiles || [];
          const allow = Math.min(files.length, remainingSlots.value);
          const list = files.slice(0, allow).map((f, idx) => ({
            type: f.type || "",
            name: f.name || `file_${Date.now()}_${idx}`,
            url: f.path,
            size: f.size || 0,
            isImage: checkIsImage(f)
            // 使用 checkIsImage 函数
          }));
          pushFilesSafe(list);
        }
      });
    }
    const removeAttachment = (index) => attachments.value.splice(index, 1);
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: attachments.value.length
      }, attachments.value.length ? {
        b: common_vendor.f(attachments.value, (file, index, i0) => {
          return common_vendor.e({
            a: checkIsImage(file)
          }, checkIsImage(file) ? {
            b: file.url
          } : {
            c: "13887a87-0-" + i0,
            d: common_vendor.p({
              type: "paperclip",
              size: "20",
              color: "#64748b"
            }),
            e: common_vendor.t(file.name)
          }, {
            f: "13887a87-1-" + i0,
            g: common_vendor.o(($event) => removeAttachment(index), index),
            h: index
          });
        }),
        c: common_vendor.p({
          type: "close",
          size: "14",
          color: "#ffffff"
        })
      } : {}, {
        d: -1,
        e: common_vendor.o(handleMainAction),
        f: inputText.value,
        g: common_vendor.o(($event) => inputText.value = $event.detail.value),
        h: common_vendor.p({
          type: "plus",
          size: "24",
          color: canAddMore.value ? "#82AE5D" : "#cbd5e1"
        }),
        i: !canAddMore.value ? 1 : "",
        j: common_vendor.o(onAddTap),
        k: common_vendor.p({
          type: __props.isGenerating ? "circle-filled" : "paperplane",
          size: "20",
          color: getMainButtonColor.value
        }),
        l: __props.isGenerating ? 1 : "",
        m: !__props.isGenerating ? 1 : "",
        n: !__props.isGenerating && !canSend.value ? 1 : "",
        o: common_vendor.o(handleMainAction),
        p: common_vendor.t(attachments.value.length),
        q: common_vendor.s(inputRootStyle.value)
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-13887a87"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/chat/ChatInput.js.map
