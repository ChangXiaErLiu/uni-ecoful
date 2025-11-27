"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_user = require("../../stores/user.js");
const api_auth = require("../../api/auth.js");
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
    const userStore = stores_user.useUserStore();
    const company = common_vendor.ref("");
    const name = common_vendor.ref("");
    const mobile = common_vendor.ref("");
    const code = common_vendor.ref("");
    const password = common_vendor.ref("");
    const confirmPassword = common_vendor.ref("");
    const codeCountdown = common_vendor.ref(0);
    const showPassword = common_vendor.ref(false);
    const showConfirmPassword = common_vendor.ref(false);
    const agreed = common_vendor.ref(false);
    let countdownTimer = null;
    const passwordStrength = common_vendor.computed(() => {
      if (!password.value)
        return 0;
      let strength = 0;
      if (password.value.length >= 8)
        strength++;
      if (/[a-z]/.test(password.value))
        strength++;
      if (/[A-Z]/.test(password.value))
        strength++;
      if (/\d/.test(password.value))
        strength++;
      if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password.value))
        strength++;
      return Math.min(Math.floor(strength / 2), 3);
    });
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
        await api_auth.sendSmsCode(mobile.value, "register");
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
    function toggleConfirmPassword() {
      showConfirmPassword.value = !showConfirmPassword.value;
    }
    function toggleAgreement() {
      agreed.value = !agreed.value;
    }
    function getPasswordStrength() {
      const strengths = ["弱", "中", "强", "很强"];
      return strengths[passwordStrength.value] || "弱";
    }
    function getStrengthClass(segment) {
      if (segment <= passwordStrength.value) {
        return `auth__password-strength-segment--${passwordStrength.value}`;
      }
      return "";
    }
    async function submit() {
      var _a, _b, _c;
      if (!name.value) {
        common_vendor.index.showToast({
          title: "请输入姓名",
          icon: "none"
        });
        return;
      }
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
      if (!code.value) {
        common_vendor.index.showToast({
          title: "请输入验证码",
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
      if (password.value.length < 6) {
        common_vendor.index.showToast({
          title: "密码至少6个字符",
          icon: "none"
        });
        return;
      }
      if (password.value !== confirmPassword.value) {
        common_vendor.index.showToast({
          title: "两次输入的密码不一致",
          icon: "none"
        });
        return;
      }
      if (!agreed.value) {
        common_vendor.index.showToast({
          title: "请同意用户协议和隐私政策",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showLoading({ title: "注册中...", mask: true });
      try {
        const result = await userStore.register({
          username: name.value,
          // 姓名作为用户名
          password: password.value,
          confirmPassword: confirmPassword.value,
          companyName: company.value || null,
          // 企业名称可选
          phoneNum: mobile.value,
          code: code.value
        });
        common_vendor.index.hideLoading();
        if (result.success) {
          common_vendor.index.showToast({
            title: "注册成功",
            icon: "success",
            duration: 1500
          });
          setTimeout(() => {
            common_vendor.index.switchTab({ url: "/pages/home/index" });
          }, 1500);
        } else {
          const errorMsg = ((_a = result.error) == null ? void 0 : _a.message) || ((_c = (_b = result.error) == null ? void 0 : _b.data) == null ? void 0 : _c.detail) || "注册失败";
          common_vendor.index.showToast({
            title: errorMsg,
            icon: "none",
            duration: 2e3
          });
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/auth/register.vue:319", "注册异常:", error);
        common_vendor.index.showToast({
          title: "注册失败，请稍后重试",
          icon: "none"
        });
      }
    }
    function goAgreement() {
      common_vendor.index.navigateTo({
        url: "/pages/agreement/user"
      });
    }
    function goPrivacy() {
      common_vendor.index.navigateTo({
        url: "/pages/agreement/privacy"
      });
    }
    function goLogin() {
      common_vendor.index.navigateBack({
        delta: 1
      });
    }
    common_vendor.onUnmounted(() => {
      if (countdownTimer) {
        clearInterval(countdownTimer);
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
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
        p: common_vendor.p({
          type: "locked",
          size: "20",
          color: "#64748b"
        }),
        q: showPassword.value ? "text" : "password",
        r: password.value,
        s: common_vendor.o(($event) => password.value = $event.detail.value),
        t: common_vendor.o(togglePassword),
        v: common_vendor.p({
          type: showPassword.value ? "eye-slash" : "eye",
          size: "20",
          color: "#64748b"
        }),
        w: common_vendor.p({
          type: "locked",
          size: "20",
          color: "#64748b"
        }),
        x: showConfirmPassword.value ? "text" : "password",
        y: confirmPassword.value,
        z: common_vendor.o(($event) => confirmPassword.value = $event.detail.value),
        A: common_vendor.o(toggleConfirmPassword),
        B: common_vendor.p({
          type: showConfirmPassword.value ? "eye-slash" : "eye",
          size: "20",
          color: "#64748b"
        }),
        C: password.value
      }, password.value ? {
        D: common_vendor.n(getStrengthClass(1)),
        E: common_vendor.n(getStrengthClass(2)),
        F: common_vendor.n(getStrengthClass(3)),
        G: common_vendor.t(getPasswordStrength())
      } : {}, {
        H: confirmPassword.value && password.value !== confirmPassword.value
      }, confirmPassword.value && password.value !== confirmPassword.value ? {
        I: common_vendor.p({
          type: "info",
          size: "16",
          color: "#ef4444"
        })
      } : {}, {
        J: common_vendor.p({
          type: agreed.value ? "checkbox-filled" : "circle",
          size: "20",
          color: agreed.value ? "#2563eb" : "#94a3b8"
        }),
        K: common_vendor.o(toggleAgreement),
        L: common_vendor.o(goAgreement),
        M: common_vendor.o(goPrivacy),
        N: !agreed.value,
        O: common_vendor.o(submit),
        P: common_vendor.o(goLogin)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-4bb68961"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/auth/register.js.map
