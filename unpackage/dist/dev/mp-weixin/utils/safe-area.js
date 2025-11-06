"use strict";
const common_vendor = require("../common/vendor.js");
function useSafeArea() {
  const statusBarHeightPx = common_vendor.ref(0);
  const navBarHeightPx = common_vendor.ref(44);
  const safeAreaBottomPx = common_vendor.ref(0);
  const totalNavHeightPx = common_vendor.computed(() => Number(statusBarHeightPx.value || 0) + Number(navBarHeightPx.value || 0));
  function refresh() {
    try {
      const info = common_vendor.index.getSystemInfoSync();
      statusBarHeightPx.value = Number(info.statusBarHeight || 0);
      try {
        const screenH = Number(info.screenHeight || 0);
        const safeBottom = Number(info.safeArea && info.safeArea.bottom || 0);
        const insetBottom = Math.max(0, screenH - safeBottom);
        safeAreaBottomPx.value = isNaN(insetBottom) ? 0 : insetBottom;
      } catch (e) {
        safeAreaBottomPx.value = 0;
      }
      try {
        const cap = common_vendor.index.getMenuButtonBoundingClientRect();
        navBarHeightPx.value = cap.bottom - statusBarHeightPx.value + (cap.top - statusBarHeightPx.value);
      } catch (e) {
        navBarHeightPx.value = 44;
      }
    } catch (e) {
      statusBarHeightPx.value = 20;
      navBarHeightPx.value = 44;
      safeAreaBottomPx.value = 0;
    }
  }
  common_vendor.onMounted(refresh);
  refresh();
  return {
    statusBarHeightPx,
    navBarHeightPx,
    totalNavHeightPx,
    safeAreaBottomPx
  };
}
exports.useSafeArea = useSafeArea;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/safe-area.js.map
