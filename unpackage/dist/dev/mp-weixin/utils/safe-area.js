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
        const topGap = cap.top - statusBarHeightPx.value;
        const capsuleHeight = cap.height;
        navBarHeightPx.value = capsuleHeight + topGap * 2;
        common_vendor.index.__f__("log", "at utils/safe-area.js:39", "=== 安全区调试信息 ===");
        common_vendor.index.__f__("log", "at utils/safe-area.js:40", "statusBarHeight:", statusBarHeightPx.value);
        common_vendor.index.__f__("log", "at utils/safe-area.js:41", "cap.top:", cap.top);
        common_vendor.index.__f__("log", "at utils/safe-area.js:42", "cap.bottom:", cap.bottom);
        common_vendor.index.__f__("log", "at utils/safe-area.js:43", "cap.height:", capsuleHeight);
        common_vendor.index.__f__("log", "at utils/safe-area.js:44", "topGap:", topGap);
        common_vendor.index.__f__("log", "at utils/safe-area.js:45", "计算公式: capsuleHeight + (topGap * 2) =", capsuleHeight, "+", topGap * 2);
        common_vendor.index.__f__("log", "at utils/safe-area.js:46", "navBarHeight:", navBarHeightPx.value);
        common_vendor.index.__f__("log", "at utils/safe-area.js:47", "totalNavHeight:", statusBarHeightPx.value + navBarHeightPx.value);
        common_vendor.index.__f__("log", "at utils/safe-area.js:48", "===================");
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
