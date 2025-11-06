"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_navTitle = require("../../stores/navTitle.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  const _easycom_uni_forms2 = common_vendor.resolveComponent("uni-forms");
  (_easycom_uni_icons2 + _easycom_uni_easyinput2 + _easycom_uni_forms2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_easyinput = () => "../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_uni_forms = () => "../../uni_modules/uni-forms/components/uni-forms/uni-forms.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_easyinput + _easycom_uni_forms + AppLayout)();
}
const AppLayout = () => "../../components/layout/AppLayout.js";
const _sfc_main = {
  __name: "changePassword",
  setup(__props) {
    const navTitle = stores_navTitle.navTitleStore();
    common_vendor.onShow(() => navTitle.setTitle("修改密码"));
    const formRef = common_vendor.ref(null);
    const form = common_vendor.ref({ oldPwd: "", newPwd: "", confirmPwd: "" });
    const submitting = common_vendor.ref(false);
    const strengthText = common_vendor.computed(() => {
      const p = form.value.newPwd || "";
      let score = 0;
      if (p.length >= 8)
        score++;
      if (/[A-Z]/.test(p))
        score++;
      if (/[a-z]/.test(p))
        score++;
      if (/\d/.test(p))
        score++;
      if (/[^A-Za-z0-9]/.test(p))
        score++;
      return ["很弱", "较弱", "一般", "较强", "很强"][Math.max(0, Math.min(score - 1, 4))];
    });
    const rules = {
      oldPwd: { required: true, errorMessage: "请输入旧密码" },
      newPwd: {
        required: true,
        errorMessage: "请输入新密码",
        validateFunction: (rule, value, data, callback) => {
          const v = String(value || "");
          if (v.length < 8)
            return callback("至少8位");
          if (!/[A-Za-z]/.test(v) || !/\d/.test(v))
            return callback("需包含字母和数字");
          return callback();
        }
      },
      confirmPwd: {
        required: true,
        errorMessage: "请确认新密码",
        validateFunction: (rule, value, data, callback) => {
          if (String(value || "") !== String(form.value.newPwd || ""))
            return callback("两次输入不一致");
          return callback();
        }
      }
    };
    async function handleSubmit() {
      var _a, _b;
      try {
        await ((_b = (_a = formRef.value) == null ? void 0 : _a.validate) == null ? void 0 : _b.call(_a));
      } catch (e) {
        return;
      }
      submitting.value = true;
      try {
        await utils_request.request({ url: "/user/password/change", method: "POST", data: { oldPwd: form.value.oldPwd, newPwd: form.value.newPwd } });
        common_vendor.index.showModal({
          title: "修改成功",
          content: "是否同时下线其他设备？",
          success: async (res) => {
            if (res.confirm) {
              try {
                await utils_request.request({ url: "/user/sessions/logout-others", method: "POST", data: {} });
              } catch (e) {
              }
            }
            common_vendor.index.showToast({ title: "密码已修改", icon: "success" });
            setTimeout(() => common_vendor.index.navigateBack({ delta: 1 }), 600);
          }
        });
      } catch (e) {
        common_vendor.index.showToast({ title: "修改失败，请稍后重试", icon: "none" });
      } finally {
        submitting.value = false;
      }
    }
    return (_ctx, _cache) => {
      return {
        a: common_vendor.p({
          type: "locked-filled",
          size: "20",
          color: "#276019"
        }),
        b: common_vendor.o(($event) => form.value.oldPwd = $event),
        c: common_vendor.p({
          type: "password",
          placeholder: "请输入旧密码",
          clearable: true,
          modelValue: form.value.oldPwd
        }),
        d: common_vendor.o(($event) => form.value.newPwd = $event),
        e: common_vendor.p({
          type: "password",
          placeholder: "至少8位，含字母和数字",
          modelValue: form.value.newPwd
        }),
        f: common_vendor.t(strengthText.value),
        g: common_vendor.o(($event) => form.value.confirmPwd = $event),
        h: common_vendor.p({
          type: "password",
          placeholder: "请再次输入新密码",
          modelValue: form.value.confirmPwd
        }),
        i: common_vendor.sr(formRef, "ccf8a176-2,ccf8a176-0", {
          "k": "formRef"
        }),
        j: common_vendor.p({
          modelValue: form.value,
          rules
        }),
        k: common_vendor.t(submitting.value ? "提交中..." : "确认修改"),
        l: submitting.value,
        m: common_vendor.o(handleSubmit),
        n: common_vendor.p({
          current: "pages/profile/changePassword"
        })
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-ccf8a176"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/profile/changePassword.js.map
