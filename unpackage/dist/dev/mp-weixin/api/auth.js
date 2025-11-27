"use strict";
const utils_request = require("../utils/request.js");
function loginByPassword(account, password) {
  return utils_request.request.post("/api/v1/auth/login", {
    account,
    password
  });
}
function loginByCode(phone, code) {
  return utils_request.request.post("/api/v1/auth/login/code", {
    phone,
    code
  });
}
function loginByWechat(code) {
  return utils_request.request.post("/api/v1/auth/login/wechat", {
    code
  });
}
function getUserInfo() {
  return utils_request.request.get("/api/v1/user/info");
}
function logout() {
  return utils_request.request.post("/api/v1/auth/logout");
}
exports.getUserInfo = getUserInfo;
exports.loginByCode = loginByCode;
exports.loginByPassword = loginByPassword;
exports.loginByWechat = loginByWechat;
exports.logout = logout;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/auth.js.map
