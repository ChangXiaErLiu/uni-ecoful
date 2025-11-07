"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_navTitle = require("../../stores/navTitle.js");
const utils_request = require("../../utils/request.js");
const api_user = require("../../api/user.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  (_easycom_uni_icons2 + _easycom_uni_easyinput2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_easyinput = () => "../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_easyinput + AppLayout)();
}
const AppLayout = () => "../../components/layout/AppLayout.js";
const _sfc_main = {
  __name: "changePhone",
  setup(__props) {
    var _a, _b;
    const navTitle = stores_navTitle.navTitleStore();
    common_vendor.onShow(() => navTitle.setTitle("更换手机号"));
    const userStore = ((_a = api_user.useUserStore) == null ? void 0 : _a.call(api_user)) || { profile: null };
    const currentPhone = common_vendor.ref(((_b = userStore == null ? void 0 : userStore.profile) == null ? void 0 : _b.phone) || "");
    const maskedCurrentPhone = common_vendor.computed(() => {
      const p = currentPhone.value;
      if (!p)
        return "未绑定";
      return String(p).replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
    });
    const form = common_vendor.ref({ phone: "", code: "" });
    const countdown = common_vendor.ref(0);
    const sending = common_vendor.ref(false);
    const submitting = common_vendor.ref(false);
    let timer = null;
    function validatePhone(phone) {
      return /^1\d{10}$/.test(String(phone || "").trim());
    }
    function startCountdown(sec = 60) {
      countdown.value = sec;
      timer && clearInterval(timer);
      timer = setInterval(() => {
        if (countdown.value <= 1) {
          clearInterval(timer);
          countdown.value = 0;
        } else {
          countdown.value -= 1;
        }
      }, 1e3);
    }
    async function sendCode() {
      if (!validatePhone(form.value.phone)) {
        common_vendor.index.showToast({ title: "请输入正确的手机号", icon: "none" });
        return;
      }
      if (countdown.value > 0 || sending.value)
        return;
      sending.value = true;
      try {
        await utils_request.request({ url: "/user/phone/sendCode", method: "POST", data: { phone: form.value.phone } });
        common_vendor.index.showToast({ title: "验证码已发送", icon: "success" });
        startCountdown(60);
      } catch (e) {
        common_vendor.index.showToast({ title: "发送失败，请稍后重试", icon: "none" });
      } finally {
        sending.value = false;
      }
    }
    function onGetPhoneNumber(e) {
      var _a2;
      const code = (_a2 = e == null ? void 0 : e.detail) == null ? void 0 : _a2.code;
      if (!code) {
        common_vendor.index.showToast({ title: "获取失败，请手动输入", icon: "none" });
        return;
      }
      common_vendor.index.showLoading({ title: "获取中" });
      utils_request.request({ url: "/user/phone/weapp", method: "POST", data: { code } }).then((res) => {
        const phone = res == null ? void 0 : res.phone;
        if (validatePhone(phone)) {
          form.value.phone = phone;
          common_vendor.index.showToast({ title: "已获取手机号", icon: "success" });
        } else {
          common_vendor.index.showToast({ title: "获取失败，请手动输入", icon: "none" });
        }
      }).catch(() => {
        common_vendor.index.showToast({ title: "获取失败，请手动输入", icon: "none" });
      }).finally(() => {
        common_vendor.index.hideLoading();
      });
    }
    async function handleSubmit() {
      if (!validatePhone(form.value.phone)) {
        common_vendor.index.showToast({ title: "请输入正确的手机号", icon: "none" });
        return;
      }
      if (!/^\d{4,8}$/.test(String(form.value.code))) {
        common_vendor.index.showToast({ title: "请输入正确的验证码", icon: "none" });
        return;
      }
      submitting.value = true;
      try {
        await utils_request.request({ url: "/user/phone/bind", method: "POST", data: { phone: form.value.phone, code: form.value.code } });
        common_vendor.index.showToast({ title: "绑定成功", icon: "success" });
        setTimeout(() => {
          common_vendor.index.navigateBack({ delta: 1 });
        }, 600);
      } catch (e) {
        common_vendor.index.showToast({ title: "绑定失败，请稍后重试", icon: "none" });
      } finally {
        submitting.value = false;
      }
    }
    common_vendor.onUnmounted(() => {
      timer && clearInterval(timer);
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.p({
          type: "phone",
          size: "20",
          color: "#276019"
        }),
        b: common_vendor.t(maskedCurrentPhone.value),
        c: common_vendor.p({
          type: "compose",
          size: "20",
          color: "#276019"
        }),
        d: common_vendor.o(($event) => form.value.phone = $event),
        e: common_vendor.p({
          type: "number",
          placeholder: "请输入新手机号",
          clearable: true,
          modelValue: form.value.phone
        }),
        f: common_vendor.o(onGetPhoneNumber),
        g: common_vendor.o(($event) => form.value.code = $event),
        h: common_vendor.p({
          type: "number",
          placeholder: "请输入验证码",
          modelValue: form.value.code
        }),
        i: common_vendor.t(countdown.value > 0 ? `${countdown.value}s` : sending.value ? "发送中" : "获取验证码"),
        j: countdown.value > 0 || sending.value,
        k: common_vendor.o(sendCode),
        l: common_vendor.t(submitting.value ? "提交中..." : "确认绑定"),
        m: submitting.value,
        n: common_vendor.o(handleSubmit),
        o: common_vendor.p({
          current: "pages/profile/changePhone"
        })
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1ac8c0f9"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/profile/changePhone.js.map
