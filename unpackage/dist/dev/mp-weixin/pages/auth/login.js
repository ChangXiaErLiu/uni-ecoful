"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_user = require("../../stores/user.js");
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
    const userStore = stores_user.useUserStore();
    const activeTab = common_vendor.ref("password");
    const mobile = common_vendor.ref("");
    const code = common_vendor.ref("");
    const account = common_vendor.ref("");
    const password = common_vendor.ref("");
    const showPassword = common_vendor.ref(false);
    const codeCountdown = common_vendor.ref(0);
    common_vendor.ref("");
    let countdownTimer = null;
    let qrCodeTimer = null;
    function switchTab(tab) {
      activeTab.value = tab;
      mobile.value = "";
      code.value = "";
      account.value = "";
      password.value = "";
      if (tab === "wechat") {
        generateQRCode();
      } else {
        if (qrCodeTimer) {
          clearInterval(qrCodeTimer);
          qrCodeTimer = null;
        }
      }
    }
    function generateQRCode() {
      common_vendor.index.__f__("log", "at pages/auth/login.vue:178", "生成微信登录二维码");
      common_vendor.index.showLoading({ title: "生成二维码中..." });
      setTimeout(() => {
        common_vendor.index.hideLoading();
        startPollingQRCode();
      }, 1e3);
    }
    function refreshQRCode() {
      if (qrCodeTimer) {
        clearInterval(qrCodeTimer);
      }
      generateQRCode();
    }
    function startPollingQRCode() {
      qrCodeTimer = setInterval(() => {
        common_vendor.index.__f__("log", "at pages/auth/login.vue:202", "检查二维码扫码状态...");
      }, 3e3);
    }
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
    function togglePassword() {
      showPassword.value = !showPassword.value;
    }
    function loginWithCode() {
      if (!mobile.value) {
        common_vendor.index.showToast({ title: "请输入手机号", icon: "none" });
        return;
      }
      if (!code.value) {
        common_vendor.index.showToast({ title: "请输入验证码", icon: "none" });
        return;
      }
      common_vendor.index.__f__("log", "at pages/auth/login.vue:260", "验证码登录", mobile.value, code.value);
      common_vendor.index.showLoading({ title: "登录中..." });
      setTimeout(() => {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({ title: "登录成功", icon: "success" });
      }, 1500);
    }
    async function loginWithPassword() {
      var _a, _b, _c;
      if (!account.value) {
        common_vendor.index.showToast({ title: "请输入账号", icon: "none" });
        return;
      }
      if (!password.value) {
        common_vendor.index.showToast({ title: "请输入密码", icon: "none" });
        return;
      }
      common_vendor.index.showLoading({ title: "登录中...", mask: true });
      try {
        const result = await userStore.loginByPassword(account.value, password.value);
        common_vendor.index.hideLoading();
        if (result.success) {
          common_vendor.index.showToast({
            title: "登录成功",
            icon: "success",
            duration: 1500
          });
          setTimeout(() => {
            common_vendor.index.switchTab({
              url: "/pages/home/index"
            });
          }, 1500);
        } else {
          const errorMsg = ((_a = result.error) == null ? void 0 : _a.message) || ((_c = (_b = result.error) == null ? void 0 : _b.data) == null ? void 0 : _c.detail) || "登录失败，请检查账号密码";
          common_vendor.index.showToast({
            title: errorMsg,
            icon: "none",
            duration: 2e3
          });
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/auth/login.vue:315", "登录异常:", error);
        common_vendor.index.showToast({
          title: "登录失败，请稍后重试",
          icon: "none"
        });
      }
    }
    function goForgotPassword() {
      common_vendor.index.navigateTo({ url: "/pages/auth/forgot-password" });
    }
    function goRegister() {
      common_vendor.index.navigateTo({ url: "/pages/auth/register" });
    }
    common_vendor.onUnmounted(() => {
      if (countdownTimer) {
        clearInterval(countdownTimer);
      }
      if (qrCodeTimer) {
        clearInterval(qrCodeTimer);
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: activeTab.value === "code" ? 1 : "",
        b: common_vendor.o(($event) => switchTab("code")),
        c: activeTab.value === "password" ? 1 : "",
        d: common_vendor.o(($event) => switchTab("password")),
        e: activeTab.value === "wechat" ? 1 : "",
        f: common_vendor.o(($event) => switchTab("wechat")),
        g: activeTab.value === "code"
      }, activeTab.value === "code" ? {
        h: common_vendor.p({
          type: "phone",
          size: "20",
          color: "#64748b"
        }),
        i: mobile.value,
        j: common_vendor.o(($event) => mobile.value = $event.detail.value),
        k: common_vendor.p({
          type: "chat",
          size: "20",
          color: "#64748b"
        }),
        l: code.value,
        m: common_vendor.o(($event) => code.value = $event.detail.value),
        n: common_vendor.t(codeCountdown.value > 0 ? `${codeCountdown.value}s后重发` : "发送验证码"),
        o: codeCountdown.value > 0,
        p: common_vendor.o(sendCode),
        q: common_vendor.o(loginWithCode)
      } : {}, {
        r: activeTab.value === "password"
      }, activeTab.value === "password" ? {
        s: common_vendor.p({
          type: "person",
          size: "20",
          color: "#64748b"
        }),
        t: account.value,
        v: common_vendor.o(($event) => account.value = $event.detail.value),
        w: common_vendor.p({
          type: "locked",
          size: "20",
          color: "#64748b"
        }),
        x: showPassword.value ? "text" : "password",
        y: password.value,
        z: common_vendor.o(($event) => password.value = $event.detail.value),
        A: common_vendor.o(togglePassword),
        B: common_vendor.p({
          type: showPassword.value ? "eye-slash" : "eye",
          size: "20",
          color: "#64748b"
        }),
        C: common_vendor.o(goForgotPassword),
        D: common_vendor.o(loginWithPassword)
      } : {}, {
        E: activeTab.value === "wechat"
      }, activeTab.value === "wechat" ? {
        F: common_vendor.p({
          type: "weixin",
          size: "120",
          color: "#22c55e"
        }),
        G: common_vendor.p({
          type: "refresh",
          size: "16",
          color: "#2563eb"
        }),
        H: common_vendor.o(refreshQRCode)
      } : {}, {
        I: common_vendor.o(goRegister)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-2cc9f8c3"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/auth/login.js.map
