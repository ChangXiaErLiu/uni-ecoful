"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_navTitle = require("../../stores/navTitle.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  const _easycom_uni_file_picker2 = common_vendor.resolveComponent("uni-file-picker");
  const _easycom_uni_forms2 = common_vendor.resolveComponent("uni-forms");
  (_easycom_uni_icons2 + _easycom_uni_easyinput2 + _easycom_uni_file_picker2 + _easycom_uni_forms2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_easyinput = () => "../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_uni_file_picker = () => "../../uni_modules/uni-file-picker/components/uni-file-picker/uni-file-picker.js";
const _easycom_uni_forms = () => "../../uni_modules/uni-forms/components/uni-forms/uni-forms.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_easyinput + _easycom_uni_file_picker + _easycom_uni_forms + AppLayout)();
}
const AppLayout = () => "../../components/layout/AppLayout.js";
const _sfc_main = {
  __name: "feedback",
  setup(__props) {
    const navTitle = stores_navTitle.navTitleStore();
    common_vendor.onShow(() => navTitle.setTitle("意见反馈"));
    const typeOptions = ["功能建议", "BUG问题", "体验优化", "其他"];
    let typeIndex = common_vendor.ref(0);
    const formRef = common_vendor.ref(null);
    const form = common_vendor.ref({ type: typeOptions[0], content: "", contact: "" });
    common_vendor.watch(typeIndex, (idx) => {
      form.value.type = typeOptions[idx];
    });
    const files = common_vendor.ref([]);
    const submitting = common_vendor.ref(false);
    const rules = {
      content: {
        required: true,
        errorMessage: "请填写问题描述",
        validateFunction: (rule, value, data, callback) => {
          const v = String(value || "").trim();
          if (v.length < 10)
            return callback("请至少填写10个字");
          callback();
        }
      }
    };
    async function uploadAll() {
      if (!files.value || files.value.length === 0)
        return [];
      const list = [];
      for (const f of files.value) {
        const path = f.url || f.path || f.tempFilePath;
        if (!path)
          continue;
        try {
          const res = await new Promise((resolve, reject) => {
            common_vendor.index.uploadFile({
              url: BASE_URL + "/upload",
              filePath: path,
              name: "file",
              success: (r) => {
                try {
                  const data = JSON.parse(r.data || "{}");
                  resolve(data);
                } catch (e) {
                  resolve({ url: "" });
                }
              },
              fail: reject
            });
          });
          if (res == null ? void 0 : res.url)
            list.push({ url: res.url, id: res.id });
        } catch (e) {
        }
      }
      return list;
    }
    async function handleSubmit() {
      var _a, _b;
      try {
        await ((_b = (_a = formRef.value) == null ? void 0 : _a.validate) == null ? void 0 : _b.call(_a));
      } catch (e) {
        return;
      }
      submitting.value = true;
      try {
        const images = await uploadAll();
        const payload = { ...form.value, images };
        const res = await utils_request.request({ url: "/feedback/create", method: "POST", data: payload });
        const ticket = (res == null ? void 0 : res.ticketId) ? `（单号：${res.ticketId}）` : "";
        common_vendor.index.showToast({ title: `提交成功${ticket}`, icon: "success" });
        setTimeout(() => common_vendor.index.navigateBack({ delta: 1 }), 800);
      } catch (e) {
        common_vendor.index.showToast({ title: "提交失败，请稍后再试", icon: "none" });
      } finally {
        submitting.value = false;
      }
    }
    return (_ctx, _cache) => {
      return {
        a: common_vendor.p({
          type: "help",
          size: "20",
          color: "#276019"
        }),
        b: common_vendor.t(typeOptions[common_vendor.unref(typeIndex)]),
        c: typeOptions,
        d: common_vendor.unref(typeIndex),
        e: common_vendor.o((e) => common_vendor.isRef(typeIndex) ? typeIndex.value = Number(e.detail.value) : typeIndex = Number(e.detail.value)),
        f: common_vendor.o(($event) => form.value.content = $event),
        g: common_vendor.p({
          type: "textarea",
          placeholder: "请描述您遇到的问题或建议",
          modelValue: form.value.content
        }),
        h: common_vendor.o(($event) => form.value.contact = $event),
        i: common_vendor.p({
          placeholder: "手机号或邮箱（选填）",
          modelValue: form.value.contact
        }),
        j: common_vendor.o(($event) => files.value = $event),
        k: common_vendor.p({
          fileMediatype: "image",
          mode: "grid",
          limit: 6,
          modelValue: files.value
        }),
        l: common_vendor.sr(formRef, "aaa18740-2,aaa18740-0", {
          "k": "formRef"
        }),
        m: common_vendor.p({
          modelValue: form.value,
          rules
        }),
        n: common_vendor.t(submitting.value ? "提交中..." : "提交反馈"),
        o: submitting.value,
        p: common_vendor.o(handleSubmit),
        q: common_vendor.p({
          current: "pages/profile/feedback"
        })
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-aaa18740"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/profile/feedback.js.map
