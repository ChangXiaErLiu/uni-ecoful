"use strict";
const common_vendor = require("../common/vendor.js");
const navTitleStore = common_vendor.defineStore("navTitle", {
  state: () => ({
    title: "粤风环保AI系统"
    // 默认标题
  }),
  actions: {
    setTitle(t) {
      this.title = t;
    }
  }
});
exports.navTitleStore = navTitleStore;
//# sourceMappingURL=../../.sourcemap/mp-weixin/stores/navTitle.js.map
