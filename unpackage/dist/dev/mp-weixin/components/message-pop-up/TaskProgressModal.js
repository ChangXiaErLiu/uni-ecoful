"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_icons2 + _easycom_uni_popup2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_popup)();
}
const _sfc_main = {
  __name: "TaskProgressModal",
  props: {
    title: {
      type: String,
      default: "任务执行中"
    },
    progress: {
      type: Number,
      default: 0
    },
    statusText: {
      type: String,
      default: "正在处理..."
    },
    state: {
      type: String,
      default: "running"
      // pending/running/success/failed
    },
    cancelable: {
      type: Boolean,
      default: true
    }
  },
  emits: ["cancel"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const props = __props;
    const popup = common_vendor.ref(null);
    const stateText = common_vendor.computed(() => {
      switch (props.state) {
        case "pending":
          return "等待中";
        case "running":
          return "运行中";
        case "success":
          return "已完成";
        case "failed":
          return "失败";
        default:
          return "处理中";
      }
    });
    const estimatedTime = common_vendor.computed(() => {
      if (props.progress >= 100)
        return null;
      if (props.progress <= 0)
        return null;
      const totalSeconds = 180;
      const remainingPercent = 100 - props.progress;
      const remainingSeconds = Math.ceil(remainingPercent / 100 * totalSeconds);
      if (remainingSeconds < 60) {
        return `${remainingSeconds}秒`;
      } else {
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
        return seconds > 0 ? `${minutes}分${seconds}秒` : `${minutes}分钟`;
      }
    });
    function open() {
      var _a;
      (_a = popup.value) == null ? void 0 : _a.open();
    }
    function close() {
      var _a;
      (_a = popup.value) == null ? void 0 : _a.close();
    }
    __expose({
      open,
      close
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "spinner-cycle",
          size: "24",
          color: "#166534"
        }),
        b: common_vendor.t(__props.title),
        c: __props.progress + "%",
        d: common_vendor.t(__props.progress),
        e: common_vendor.t(stateText.value),
        f: common_vendor.n("status-" + __props.state),
        g: common_vendor.t(__props.statusText),
        h: estimatedTime.value
      }, estimatedTime.value ? {
        i: common_vendor.t(estimatedTime.value)
      } : {}, {
        j: common_vendor.sr(popup, "903d0a6c-0", {
          "k": "popup"
        }),
        k: common_vendor.p({
          type: "center",
          ["mask-click"]: false
        })
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-903d0a6c"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/message-pop-up/TaskProgressModal.js.map
