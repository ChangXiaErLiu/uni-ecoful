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
    const qrCodeUrl = common_vendor.ref("");
    let countdownTimer = null;
    function switchTab(tab) {
      stopPolling();
      activeTab.value = tab;
      mobile.value = "";
      code.value = "";
      account.value = "";
      password.value = "";
      if (tab === "wechat" && !qrcodeId.value) {
        generateQRCode();
      }
    }
    const qrcodeId = common_vendor.ref("");
    const pollingCount = common_vendor.ref(0);
    function stopPolling() {
      pollingCount.value = 0;
      common_vendor.index.__f__("log", "at pages/auth/login.vue:155", "已停止二维码轮询");
    }
    async function generateQRCode() {
      stopPolling();
      qrcodeId.value = "";
      qrCodeUrl.value = "";
      common_vendor.index.showToast({
        title: "小程序端请使用微信授权登录",
        icon: "none"
      });
    }
    function refreshQRCode() {
      common_vendor.index.__f__("log", "at pages/auth/login.vue:209", "用户手动刷新二维码");
      stopPolling();
      generateQRCode();
    }
    async function sendCode() {
      if (!mobile.value) {
        common_vendor.index.showToast({
          title: "请输入手机号",
          icon: "none"
        });
        return;
      }
      if (!/^1[3-9]\d{9}$/.test(mobile.value)) {
        common_vendor.index.showToast({
          title: "手机号格式不正确",
          icon: "none"
        });
        return;
      }
      try {
        const {
          sendSmsCode
        } = await "../../api/auth.js";
        await sendSmsCode(mobile.value, "login");
        common_vendor.index.showToast({
          title: "验证码已发送",
          icon: "success"
        });
        codeCountdown.value = 60;
        countdownTimer = setInterval(() => {
          codeCountdown.value--;
          if (codeCountdown.value <= 0) {
            clearInterval(countdownTimer);
          }
        }, 1e3);
      } catch (error) {
        common_vendor.index.showToast({
          title: error.message || error.detail || "发送失败",
          icon: "none"
        });
      }
    }
    function togglePassword() {
      showPassword.value = !showPassword.value;
    }
    async function loginWithCode() {
      var _a, _b, _c;
      if (!mobile.value) {
        common_vendor.index.showToast({
          title: "请输入手机号",
          icon: "none"
        });
        return;
      }
      if (!code.value) {
        common_vendor.index.showToast({
          title: "请输入验证码",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showLoading({
        title: "登录中...",
        mask: true
      });
      try {
        const result = await userStore.loginByCode(mobile.value, code.value);
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
          const errorMsg = ((_a = result.error) == null ? void 0 : _a.message) || ((_c = (_b = result.error) == null ? void 0 : _b.data) == null ? void 0 : _c.detail) || "登录失败";
          common_vendor.index.showToast({
            title: errorMsg,
            icon: "none",
            duration: 2e3
          });
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/auth/login.vue:422", "验证码登录异常:", error);
        common_vendor.index.showToast({
          title: "登录失败，请稍后重试",
          icon: "none"
        });
      }
    }
    async function loginWithPassword() {
      var _a, _b, _c;
      if (!account.value) {
        common_vendor.index.showToast({
          title: "请输入账号",
          icon: "none"
        });
        return;
      }
      if (!password.value) {
        common_vendor.index.showToast({
          title: "请输入密码",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showLoading({
        title: "登录中...",
        mask: true
      });
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
        common_vendor.index.__f__("error", "at pages/auth/login.vue:485", "登录异常:", error);
        common_vendor.index.showToast({
          title: "登录失败，请稍后重试",
          icon: "none"
        });
      }
    }
    common_vendor.onMounted(() => {
    });
    common_vendor.onUnmounted(() => {
    });
    function goForgotPassword() {
      common_vendor.index.navigateTo({
        url: "/pages/auth/forgot-password"
      });
    }
    function goRegister() {
      common_vendor.index.navigateTo({
        url: "/pages/auth/register"
      });
    }
    common_vendor.onUnmounted(() => {
      if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
      }
      stopPolling();
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
        i: common_vendor.o(loginWithCode),
        j: mobile.value,
        k: common_vendor.o(($event) => mobile.value = $event.detail.value),
        l: common_vendor.p({
          type: "chat",
          size: "20",
          color: "#64748b"
        }),
        m: common_vendor.o(loginWithCode),
        n: code.value,
        o: common_vendor.o(($event) => code.value = $event.detail.value),
        p: common_vendor.t(codeCountdown.value > 0 ? `${codeCountdown.value}s后重发` : "发送验证码"),
        q: codeCountdown.value > 0,
        r: common_vendor.o(sendCode),
        s: common_vendor.o(loginWithCode)
      } : {}, {
        t: activeTab.value === "password"
      }, activeTab.value === "password" ? {
        v: common_vendor.p({
          type: "person",
          size: "20",
          color: "#64748b"
        }),
        w: common_vendor.o(loginWithPassword),
        x: account.value,
        y: common_vendor.o(($event) => account.value = $event.detail.value),
        z: common_vendor.p({
          type: "locked",
          size: "20",
          color: "#64748b"
        }),
        A: showPassword.value ? "text" : "password",
        B: common_vendor.o(loginWithPassword),
        C: password.value,
        D: common_vendor.o(($event) => password.value = $event.detail.value),
        E: common_vendor.o(togglePassword),
        F: common_vendor.p({
          type: showPassword.value ? "eye-slash" : "eye",
          size: "20",
          color: "#64748b"
        }),
        G: common_vendor.o(goForgotPassword),
        H: common_vendor.o(loginWithPassword)
      } : {}, {
        I: activeTab.value === "wechat"
      }, activeTab.value === "wechat" ? {
        J: common_vendor.p({
          type: "weixin",
          size: "120",
          color: "#22c55e"
        }),
        K: common_vendor.p({
          type: "refresh",
          size: "16",
          color: "#2563eb"
        }),
        L: common_vendor.o(refreshQRCode)
      } : {}, {
        M: common_vendor.o(goRegister)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-2cc9f8c3"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/auth/login.js.map
