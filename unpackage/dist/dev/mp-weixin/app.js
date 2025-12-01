"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
const stores_user = require("./stores/user.js");
require("./uni.promisify.adaptor.js");
const api_index = require("./api/index.js");
const common_routerGuard = require("./common/router-guard.js");
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
  "./pages/agreement/user.js";
  "./pages/agreement/privacy.js";
}
const _sfc_main = {
  __name: "App",
  setup(__props) {
    const userStore = stores_user.useUserStore();
    userStore.initUserInfo();
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
  common_routerGuard.setupRouterGuard();
  injectSafeAreaCssVars();
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
