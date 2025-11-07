"use strict";
const common_vendor = require("../common/vendor.js");
function usePlatformInfo() {
  const windowWidth = common_vendor.ref(375);
  const windowHeight = common_vendor.ref(812);
  const platform = common_vendor.ref("web");
  function refreshSizeSync() {
    try {
      const info = common_vendor.index.getSystemInfoSync();
      windowWidth.value = info.windowWidth;
      windowHeight.value = info.windowHeight;
      platform.value = info.platform || "web";
    } catch (e) {
      if (typeof window !== "undefined") {
        windowWidth.value = window.innerWidth;
        windowHeight.value = window.innerHeight;
        platform.value = "web";
      }
    }
  }
  function handleResize(res) {
    try {
      if (res == null ? void 0 : res.size) {
        windowWidth.value = res.size.windowWidth;
        windowHeight.value = res.size.windowHeight;
      } else if (typeof window !== "undefined") {
        windowWidth.value = window.innerWidth;
        windowHeight.value = window.innerHeight;
      }
    } catch {
    }
  }
  refreshSizeSync();
  common_vendor.onMounted(() => {
    if (typeof common_vendor.index.onWindowResize === "function") {
      common_vendor.index.onWindowResize(handleResize);
    }
    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);
    }
  });
  common_vendor.onUnmounted(() => {
    if (typeof common_vendor.index.offWindowResize === "function") {
      common_vendor.index.offWindowResize(handleResize);
    }
    if (typeof window !== "undefined") {
      window.removeEventListener("resize", handleResize);
    }
  });
  const isDesktop = common_vendor.computed(() => windowWidth.value >= 1024);
  const isTablet = common_vendor.computed(() => windowWidth.value >= 768 && windowWidth.value < 1024);
  const isMobile = common_vendor.computed(() => windowWidth.value < 768);
  return { windowWidth, windowHeight, platform, isDesktop, isTablet, isMobile };
}
exports.usePlatformInfo = usePlatformInfo;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/platform.js.map
