"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
require("./uni.promisify.adaptor.js");
const api_index = require("./api/index.js");
if (!Math) {
  "./pages/home/index.js";
  "./pages/chat/index.js";
  "./pages/doc-generator/index.js";
  "./pages/compliance/index.js";
  "./pages/knowledge/index.js";
  "./pages/profile/index.js";
  "./pages/reports/acceptance/index.js";
  "./pages/reports/eia/index.js";
  "./pages/reconnoitre/index.js";
  "./pages/ledger/index.js";
  "./pages/project/index.js";
  "./pages/auth/login.js";
  "./pages/auth/register.js";
  "./pages/profile/changePhone.js";
  "./pages/profile/changePassword.js";
  "./pages/profile/devices.js";
  "./pages/profile/operationLogs.js";
  "./pages/profile/about.js";
  "./pages/profile/feedback.js";
}
const _sfc_main = {
  __name: "App",
  setup(__props) {
    common_vendor.onLaunch(() => {
      common_vendor.index.__f__("log", "at App.vue:6", "应用启动");
    });
    common_vendor.onShow(() => {
      common_vendor.index.__f__("log", "at App.vue:10", "应用进入前台");
    });
    common_vendor.onHide(() => {
      common_vendor.index.__f__("log", "at App.vue:14", "应用进入后台");
    });
    return () => {
    };
  }
};
function injectSafeAreaCssVars() {
  try {
    const info = common_vendor.index.getSystemInfoSync();
    const top = Number(info.safeAreaInsets && info.safeAreaInsets.top || info.statusBarHeight || 0);
    const bottom = Number(info.safeAreaInsets && info.safeAreaInsets.bottom || 0);
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.style.setProperty("--safe-top", top + "px");
      root.style.setProperty("--safe-bottom", bottom + "px");
    }
  } catch (e) {
  }
}
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  api_index.setupStore(app);
  injectSafeAreaCssVars();
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
