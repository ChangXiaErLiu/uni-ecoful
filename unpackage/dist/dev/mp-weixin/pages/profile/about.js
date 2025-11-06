"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const stores_navTitle = require("../../stores/navTitle.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_uni_icons + AppLayout)();
}
const AppLayout = () => "../../components/layout/AppLayout.js";
const _sfc_main = {
  __name: "about",
  setup(__props) {
    const navTitle = stores_navTitle.navTitleStore();
    const info = common_vendor.ref({});
    common_vendor.onShow(async () => {
      navTitle.setTitle("关于系统");
      await fetchInfo();
    });
    async function fetchInfo() {
      try {
        const res = await utils_request.request({ url: "/app/version", method: "GET" });
        info.value = res || {};
      } catch (e) {
        info.value = {};
      }
    }
    function openURLSmart(url) {
      if (!url) {
        common_vendor.index.showToast({ title: "暂无链接", icon: "none" });
        return;
      }
      common_vendor.index.setClipboardData({ data: url, success: () => common_vendor.index.showToast({ title: "已复制链接", icon: "success" }) });
    }
    function openNotes() {
      var _a;
      openURLSmart((_a = info.value) == null ? void 0 : _a.notesUrl);
    }
    function openAgreement(type) {
      var _a, _b;
      const url = type === "user" ? (_a = info.value) == null ? void 0 : _a.userAgreementUrl : (_b = info.value) == null ? void 0 : _b.privacyUrl;
      openURLSmart(url);
    }
    return (_ctx, _cache) => {
      return {
        a: common_assets._imports_0$1,
        b: common_vendor.t(info.value.name || "环保AI系统"),
        c: common_vendor.t(info.value.version || "-"),
        d: common_vendor.t(info.value.build || "-"),
        e: common_vendor.t(info.value.updatedAt || "-"),
        f: common_vendor.p({
          type: "info",
          size: "20",
          color: "#276019"
        }),
        g: common_vendor.p({
          type: "flag",
          size: "18",
          color: "#64748b"
        }),
        h: common_vendor.p({
          type: "right",
          size: "16",
          color: "#94a3b8"
        }),
        i: common_vendor.o(openNotes),
        j: common_vendor.p({
          type: "checkbox",
          size: "18",
          color: "#64748b"
        }),
        k: common_vendor.p({
          type: "right",
          size: "16",
          color: "#94a3b8"
        }),
        l: common_vendor.o(($event) => openAgreement("user")),
        m: common_vendor.p({
          type: "help",
          size: "18",
          color: "#64748b"
        }),
        n: common_vendor.p({
          type: "right",
          size: "16",
          color: "#94a3b8"
        }),
        o: common_vendor.o(($event) => openAgreement("privacy")),
        p: common_vendor.p({
          current: "pages/profile/about"
        })
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-c0d14513"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/profile/about.js.map
