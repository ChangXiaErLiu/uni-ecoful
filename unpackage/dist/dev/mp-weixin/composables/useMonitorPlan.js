"use strict";
const common_vendor = require("../common/vendor.js");
const api_acceptance = require("../api/acceptance.js");
let instance = null;
function useMonitorPlan() {
  if (instance) {
    return instance;
  }
  const plan = common_vendor.ref(null);
  const isGenerating = common_vendor.ref(false);
  const taskProgress = common_vendor.ref(0);
  const taskStatusText = common_vendor.ref("");
  const taskState = common_vendor.ref("pending");
  const canDownload = common_vendor.computed(() => plan.value !== null);
  let smoothProgressTimer = null;
  let currentDisplayProgress = 0;
  let targetProgress = 0;
  let lastTargetProgress = 0;
  let lastUpdateTime = 0;
  function updateProgressSmooth(newProgress, statusText, state = "running") {
    const progressChanged = newProgress !== lastTargetProgress;
    targetProgress = newProgress;
    taskStatusText.value = statusText;
    taskState.value = state;
    if (progressChanged) {
      lastUpdateTime = Date.now();
      lastTargetProgress = newProgress;
    }
    if (!smoothProgressTimer) {
      smoothProgressTimer = setInterval(() => {
        const now = Date.now();
        const timeSinceLastUpdate = now - lastUpdateTime;
        if (currentDisplayProgress < targetProgress) {
          const diff = targetProgress - currentDisplayProgress;
          const step = Math.max(0.5, diff / 10);
          currentDisplayProgress = Math.min(currentDisplayProgress + step, targetProgress);
        } else if (currentDisplayProgress >= targetProgress && targetProgress < 100) {
          if (timeSinceLastUpdate > 5e3) {
            const maxAllowedProgress = Math.min(targetProgress + 5, 99);
            if (currentDisplayProgress < maxAllowedProgress) {
              currentDisplayProgress += 0.1;
            }
          }
        }
        taskProgress.value = Math.floor(currentDisplayProgress);
        if (currentDisplayProgress >= 99.9 && targetProgress >= 100) {
          clearInterval(smoothProgressTimer);
          smoothProgressTimer = null;
          currentDisplayProgress = 100;
          taskProgress.value = 100;
          taskState.value = "success";
          taskStatusText.value = "监测方案生成完成";
        }
      }, 50);
    }
  }
  function clearProgressTimer() {
    if (smoothProgressTimer) {
      clearInterval(smoothProgressTimer);
      smoothProgressTimer = null;
    }
    currentDisplayProgress = 0;
    targetProgress = 0;
    lastTargetProgress = 0;
    lastUpdateTime = 0;
    taskProgress.value = 0;
    taskStatusText.value = "正在初始化...";
    taskState.value = "running";
  }
  async function generatePlan(projectId, hasExtracted, modalRef) {
    if (!projectId) {
      common_vendor.index.showModal({
        title: "提示",
        content: "请先选择项目",
        showCancel: false
      });
      return;
    }
    if (!hasExtracted) {
      common_vendor.index.showModal({
        title: "提示",
        content: "请先提取项目信息",
        showCancel: false
      });
      return;
    }
    isGenerating.value = true;
    clearProgressTimer();
    if (modalRef) {
      modalRef.open();
    }
    try {
      await api_acceptance.generateMonitorPlan({
        projectId,
        onProgress: (progress, statusText) => {
          updateProgressSmooth(progress, statusText);
        }
      });
      common_vendor.index.__f__("log", "at composables/useMonitorPlan.js:145", "🎉 监测方案生成成功，设置 plan.value = true");
      plan.value = true;
      common_vendor.index.__f__("log", "at composables/useMonitorPlan.js:147", "📊 当前 plan.value:", plan.value);
      common_vendor.index.__f__("log", "at composables/useMonitorPlan.js:148", "📊 当前 canDownload.value:", canDownload.value);
      savePlanCache(projectId, true);
      if (modalRef) {
        setTimeout(() => {
          modalRef.close();
        }, 1e3);
      }
      common_vendor.index.showToast({
        title: "生成成功，可下载报告",
        icon: "success"
      });
    } catch (error) {
      clearProgressTimer();
      if (modalRef) {
        modalRef.close();
      }
      common_vendor.index.showModal({
        title: "生成失败",
        content: error.message || "请稍后重试",
        showCancel: false
      });
    } finally {
      isGenerating.value = false;
    }
  }
  async function downloadPlan(projectId) {
    if (!projectId) {
      common_vendor.index.showToast({
        title: "请先选择项目",
        icon: "none"
      });
      return;
    }
    common_vendor.index.showLoading({
      title: "正在下载监测方案…",
      mask: true
    });
    try {
      const { ab, filename } = await api_acceptance.downloadMonitorPlan(projectId);
      await saveArrayBuffer(ab, filename);
      common_vendor.index.hideLoading();
      common_vendor.index.showToast({
        title: "已保存：" + filename,
        icon: "success"
      });
    } catch (error) {
      common_vendor.index.hideLoading();
      common_vendor.index.showModal({
        title: "下载失败",
        content: error.message,
        showCancel: false
      });
    }
  }
  async function saveArrayBuffer(arrayBuffer, filename) {
    const fs = common_vendor.wx$1.getFileSystemManager();
    const filePath = `${common_vendor.wx$1.env.USER_DATA_PATH}/${filename}`;
    fs.writeFile({
      filePath,
      data: arrayBuffer,
      encoding: "binary",
      success: () => common_vendor.wx$1.openDocument({
        filePath,
        fileType: "docx"
      }),
      fail: () => common_vendor.index.showToast({
        title: "保存失败",
        icon: "error"
      })
    });
  }
  function savePlanCache(projectId, planData) {
    try {
      const cacheKey = `monitor_plan_${projectId}`;
      const cacheData = {
        plan: planData,
        generatedAt: Date.now()
      };
      common_vendor.index.setStorageSync(cacheKey, JSON.stringify(cacheData));
      common_vendor.index.__f__("log", "at composables/useMonitorPlan.js:285", `✅ 项目 ${projectId} 的监测方案已缓存`);
    } catch (error) {
      common_vendor.index.__f__("error", "at composables/useMonitorPlan.js:287", "保存监测方案缓存失败:", error);
    }
  }
  function loadPlanCache(projectId) {
    try {
      const cacheKey = `monitor_plan_${projectId}`;
      const cachedData = common_vendor.index.getStorageSync(cacheKey);
      if (cachedData) {
        const cacheData = JSON.parse(cachedData);
        plan.value = cacheData.plan;
        common_vendor.index.__f__("log", "at composables/useMonitorPlan.js:303", `✅ 已加载项目 ${projectId} 的监测方案缓存`);
      } else {
        plan.value = null;
        common_vendor.index.__f__("log", "at composables/useMonitorPlan.js:306", `ℹ️ 项目 ${projectId} 暂无监测方案缓存`);
      }
    } catch (error) {
      common_vendor.index.__f__("error", "at composables/useMonitorPlan.js:309", "加载监测方案缓存失败:", error);
      plan.value = null;
    }
  }
  function clearPlanCache(projectId) {
    try {
      const cacheKey = `monitor_plan_${projectId}`;
      common_vendor.index.removeStorageSync(cacheKey);
      plan.value = null;
      common_vendor.index.__f__("log", "at composables/useMonitorPlan.js:323", `✅ 已清除项目 ${projectId} 的监测方案缓存`);
    } catch (error) {
      common_vendor.index.__f__("error", "at composables/useMonitorPlan.js:325", "清除监测方案缓存失败:", error);
    }
  }
  function resetState() {
    plan.value = null;
    isGenerating.value = false;
    clearProgressTimer();
  }
  instance = {
    // 状态
    plan,
    canDownload,
    isGenerating,
    taskProgress,
    taskStatusText,
    taskState,
    // 方法
    generatePlan,
    downloadPlan,
    loadPlanCache,
    savePlanCache,
    clearPlanCache,
    resetState
  };
  return instance;
}
exports.useMonitorPlan = useMonitorPlan;
//# sourceMappingURL=../../.sourcemap/mp-weixin/composables/useMonitorPlan.js.map
