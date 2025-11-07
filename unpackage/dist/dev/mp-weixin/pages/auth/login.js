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
  __name: "login",
  setup(__props) {
    const mobile = common_vendor.ref("");
    const code = common_vendor.ref("");
    function sendCode() {
      common_vendor.index.__f__("log", "at pages/auth/login.vue:31", "发送验证码");
    }
    function loginWithMobile() {
      common_vendor.index.__f__("log", "at pages/auth/login.vue:35", "手机号登录", mobile.value, code.value);
    }
    function loginWithWeChat() {
      common_vendor.index.__f__("log", "at pages/auth/login.vue:40", "调用微信登录");
    }
    function goRegister() {
      common_vendor.index.navigateTo({ url: "/pages/auth/register" });
    }
    return (_ctx, _cache) => {
      return {
        a: mobile.value,
        b: common_vendor.o(($event) => mobile.value = $event.detail.value),
        c: code.value,
        d: common_vendor.o(($event) => code.value = $event.detail.value),
        e: common_vendor.o(sendCode),
        f: common_vendor.o(loginWithMobile),
        g: common_vendor.p({
          type: "weixin",
          size: "20",
          color: "white"
        }),
        h: common_vendor.o(loginWithWeChat),
        i: common_vendor.o(goRegister)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-2cc9f8c3"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/auth/login.js.map
