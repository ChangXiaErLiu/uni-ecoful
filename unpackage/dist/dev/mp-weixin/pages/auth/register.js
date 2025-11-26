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
  __name: "register",
  setup(__props) {
    const company = common_vendor.ref("");
    const name = common_vendor.ref("");
    const mobile = common_vendor.ref("");
    const code = common_vendor.ref("");
    const codeCountdown = common_vendor.ref(0);
    let countdownTimer = null;
    function sendCode() {
      if (!mobile.value) {
        common_vendor.index.showToast({ title: "请输入手机号", icon: "none" });
        return;
      }
      if (!/^1[3-9]\d{9}$/.test(mobile.value)) {
        common_vendor.index.showToast({ title: "手机号格式不正确", icon: "none" });
        return;
      }
      common_vendor.index.showToast({ title: "验证码已发送", icon: "success" });
      codeCountdown.value = 60;
      countdownTimer = setInterval(() => {
        codeCountdown.value--;
        if (codeCountdown.value <= 0) {
          clearInterval(countdownTimer);
        }
      }, 1e3);
    }
    function submit() {
      if (!company.value) {
        common_vendor.index.showToast({ title: "请输入企业或组织名称", icon: "none" });
        return;
      }
      if (!name.value) {
        common_vendor.index.showToast({ title: "请输入姓名", icon: "none" });
        return;
      }
      if (!mobile.value) {
        common_vendor.index.showToast({ title: "请输入手机号", icon: "none" });
        return;
      }
      if (!code.value) {
        common_vendor.index.showToast({ title: "请输入验证码", icon: "none" });
        return;
      }
      common_vendor.index.__f__("log", "at pages/auth/register.vue:132", "提交注册信息", company.value, name.value, mobile.value, code.value);
      common_vendor.index.showLoading({ title: "注册中..." });
      setTimeout(() => {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "注册成功",
          icon: "success",
          success: () => {
            setTimeout(() => {
              common_vendor.index.navigateBack({ delta: 1 });
            }, 1500);
          }
        });
      }, 2e3);
    }
    function goLogin() {
      common_vendor.index.navigateBack({ delta: 1 });
    }
    common_vendor.onUnmounted(() => {
      if (countdownTimer) {
        clearInterval(countdownTimer);
      }
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.p({
          type: "home",
          size: "20",
          color: "#64748b"
        }),
        b: company.value,
        c: common_vendor.o(($event) => company.value = $event.detail.value),
        d: common_vendor.p({
          type: "person",
          size: "20",
          color: "#64748b"
        }),
        e: name.value,
        f: common_vendor.o(($event) => name.value = $event.detail.value),
        g: common_vendor.p({
          type: "phone",
          size: "20",
          color: "#64748b"
        }),
        h: mobile.value,
        i: common_vendor.o(($event) => mobile.value = $event.detail.value),
        j: common_vendor.p({
          type: "chat",
          size: "20",
          color: "#64748b"
        }),
        k: code.value,
        l: common_vendor.o(($event) => code.value = $event.detail.value),
        m: common_vendor.t(codeCountdown.value > 0 ? `${codeCountdown.value}s后重发` : "发送验证码"),
        n: codeCountdown.value > 0,
        o: common_vendor.o(sendCode),
        p: common_vendor.o(submit),
        q: common_vendor.o(goLogin)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-4bb68961"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/auth/register.js.map
