"use strict";
const common_vendor = require("../../../common/vendor.js");
const stores_navTitle = require("../../../stores/navTitle.js");
if (!Math) {
  AppLayout();
}
const AppLayout = () => "../../../components/layout/AppLayout.js";
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const navTitle = stores_navTitle.navTitleStore();
    common_vendor.onShow(() => navTitle.setTitle("环评报告"));
    return (_ctx, _cache) => {
      return {
        a: common_vendor.p({
          current: "pages/reports/eia/index"
        })
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-bacf38a3"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/reports/eia/index.js.map
