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
  __name: "NavSider",
  props: {
    items: { type: Array, default: () => [] },
    current: { type: String, default: "" },
    collapsed: { type: Boolean, default: false }
  },
  emits: ["navigate"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    function emitNavigate(item) {
      emit("navigate", item);
    }
    return (_ctx, _cache) => {
      return {
        a: common_assets._imports_0$2,
        b: common_assets._imports_1$1,
        c: common_vendor.f(__props.items, (item, k0, i0) => {
          return {
            a: "bfd2289a-0-" + i0,
            b: common_vendor.p({
              type: item.icon,
              color: item.path === __props.current ? "#ffffff" : "#00aa00",
              size: "20"
            }),
            c: common_vendor.t(item.label),
            d: item.path,
            e: item.path === __props.current ? 1 : "",
            f: common_vendor.o(($event) => emitNavigate(item), item.path)
          };
        })
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-bfd2289a"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/layout/NavSider.js.map
