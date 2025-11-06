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
  __name: "ChatHeader",
  props: {
    conversation: {
      type: Object,
      default: () => ({})
    },
    showToggle: {
      type: Boolean,
      default: false
    }
  },
  emits: ["toggle-sidebar"],
  setup(__props) {
    return (_ctx, _cache) => {
      var _a;
      return common_vendor.e({
        a: __props.showToggle
      }, __props.showToggle ? {
        b: common_vendor.p({
          type: "bars",
          size: "20",
          color: "#374151"
        }),
        c: common_vendor.o(($event) => _ctx.$emit("toggle-sidebar"))
      } : {}, {
        d: common_vendor.t(((_a = __props.conversation) == null ? void 0 : _a.title) || "新对话")
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-9a40a12e"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/chat/ChatHeader.js.map
