"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "register",
  setup(__props) {
    const company = common_vendor.ref("");
    const name = common_vendor.ref("");
    const mobile = common_vendor.ref("");
    const code = common_vendor.ref("");
    function sendCode() {
      common_vendor.index.__f__("log", "at pages/auth/register.vue:31", "发送注册验证码");
    }
    function submit() {
      common_vendor.index.__f__("log", "at pages/auth/register.vue:35", "提交注册信息", company.value, name.value, mobile.value, code.value);
    }
    function goLogin() {
      common_vendor.index.navigateBack({ delta: 1 });
    }
    return (_ctx, _cache) => {
      return {
        a: company.value,
        b: common_vendor.o(($event) => company.value = $event.detail.value),
        c: name.value,
        d: common_vendor.o(($event) => name.value = $event.detail.value),
        e: mobile.value,
        f: common_vendor.o(($event) => mobile.value = $event.detail.value),
        g: code.value,
        h: common_vendor.o(($event) => code.value = $event.detail.value),
        i: common_vendor.o(sendCode),
        j: common_vendor.o(submit),
        k: common_vendor.o(goLogin)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-4bb68961"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/auth/register.js.map
