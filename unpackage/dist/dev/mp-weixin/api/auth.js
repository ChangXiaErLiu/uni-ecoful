"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const utils_request = require("../utils/request.js");
function loginByPassword(account, password) {
  return utils_request.request.post("/api/v1/auth/login", {
    account,
    password
  });
}
function sendSmsCode(phoneNum, purpose = "login") {
  return utils_request.request.post("/api/v1/auth/send-code", {
    phone_num: phoneNum,
    purpose
  });
}
function loginByCode(phoneNum, code) {
  return utils_request.request.post("/api/v1/auth/code-login", {
    phone_num: phoneNum,
    code
  });
}
function register(data) {
  return utils_request.request.post("/api/v1/auth/register", {
    username: data.username,
    password: data.password,
    confirm_password: data.confirmPassword,
    company_name: data.companyName || null,
    phone_num: data.phoneNum,
    code: data.code
  });
}
function loginByWechat(code) {
  return utils_request.request.post("/api/v1/auth/wechat/login", {
    code
  });
}
function getUserInfo() {
  return utils_request.request.get("/api/v1/auth/profile");
}
function logout() {
  return utils_request.request.post("/api/v1/auth/logout");
}
exports.getUserInfo = getUserInfo;
exports.loginByCode = loginByCode;
exports.loginByPassword = loginByPassword;
exports.loginByWechat = loginByWechat;
exports.logout = logout;
exports.register = register;
exports.sendSmsCode = sendSmsCode;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/auth.js.map
