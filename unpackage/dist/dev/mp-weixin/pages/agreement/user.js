"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "user",
  setup(__props) {
    const currentDate = common_vendor.ref((/* @__PURE__ */ new Date()).toLocaleDateString("zh-CN"));
    const scrollViewHeight = common_vendor.ref(0);
    const systemInfo = common_vendor.ref({});
    function calculateHeight() {
      systemInfo.value = common_vendor.index.getSystemInfoSync();
      const windowHeight = systemInfo.value.windowHeight;
      const windowWidth = systemInfo.value.windowWidth;
      if (windowWidth >= 1200) {
        scrollViewHeight.value = 600;
      } else if (windowWidth >= 768) {
        scrollViewHeight.value = windowHeight * 0.7;
      } else {
        scrollViewHeight.value = windowHeight - 280;
      }
    }
    common_vendor.onMounted(() => {
      calculateHeight();
    });
    common_vendor.onUnmounted(() => {
    });
    function goBack() {
      common_vendor.index.navigateBack();
    }
    function agree() {
      common_vendor.index.showToast({
        title: "已同意用户协议",
        icon: "success"
      });
      setTimeout(() => {
        common_vendor.index.navigateBack();
      }, 1500);
    }
    return (_ctx, _cache) => {
      return {
        a: common_vendor.t(currentDate.value),
        b: scrollViewHeight.value + "px",
        c: common_vendor.o(goBack),
        d: common_vendor.o(agree)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-ff1e87b4"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/agreement/user.js.map
