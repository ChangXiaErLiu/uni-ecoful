"use strict";
const common_vendor = require("./vendor.js");
const WHITE_LIST = [
  "/pages/auth/login",
  "/pages/auth/register",
  "/pages/auth/forgot-password"
];
function isLoggedIn() {
  const token = common_vendor.index.getStorageSync("token");
  const userInfoStr = common_vendor.index.getStorageSync("userInfo");
  let userInfo = null;
  try {
    userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
  } catch (e) {
    common_vendor.index.__f__("warn", "at common/auth.js:22", "【auth】解析 userInfo 失败", e);
  }
  common_vendor.index.__f__("log", "at common/auth.js:25", "【auth】token:", token);
  common_vendor.index.__f__("log", "at common/auth.js:26", "【auth】当前用户信息:", userInfo);
  return !!token;
}
exports.WHITE_LIST = WHITE_LIST;
exports.isLoggedIn = isLoggedIn;
//# sourceMappingURL=../../.sourcemap/mp-weixin/common/auth.js.map
