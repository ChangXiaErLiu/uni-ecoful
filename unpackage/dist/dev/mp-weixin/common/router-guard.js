"use strict";
const common_vendor = require("./vendor.js");
const common_auth = require("./auth.js");
function setupRouterGuard() {
  const guard = (route) => {
    const url = route.url || route;
    const path = url.split("?")[0];
    const loggedIn = common_auth.isLoggedIn();
    if (!loggedIn && !common_auth.WHITE_LIST.includes(path)) {
      common_vendor.index.reLaunch({ url: "/pages/auth/login" });
      return false;
    }
    if (loggedIn && common_auth.WHITE_LIST.includes(path)) {
      common_vendor.index.switchTab({ url: "/pages/home/index" });
      return false;
    }
    return true;
  };
  common_vendor.index.addInterceptor("navigateTo", { invoke: guard });
  common_vendor.index.addInterceptor("switchTab", { invoke: guard });
  common_vendor.index.addInterceptor("redirectTo", { invoke: guard });
}
exports.setupRouterGuard = setupRouterGuard;
//# sourceMappingURL=../../.sourcemap/mp-weixin/common/router-guard.js.map
