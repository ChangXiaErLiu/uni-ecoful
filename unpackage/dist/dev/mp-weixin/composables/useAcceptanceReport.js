"use strict";
const common_vendor = require("../common/vendor.js");
const api_acceptance = require("../api/acceptance.js");
let instance = null;
function useAcceptanceReport() {
  if (instance) {
    return instance;
  }
  const reportGenerated = common_vendor.ref(false);
  const reportType = common_vendor.ref("withoutData");
  const testReportFiles = common_vendor.ref([]);
  const previewTitle = common_vendor.ref("");
  const isGenerating = common_vendor.ref(false);
  const taskProgress = common_vendor.ref(0);
  const taskStatusText = common_vendor.ref("");
  const taskState = common_vendor.ref("pending");
  const canDownloadReport = common_vendor.computed(() => reportGenerated.value);
  const reportTypes = [
    { value: "withoutData", text: "无检测数据报告" },
    { value: "withData", text: "有检测数据报告" }
  ];
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
          taskStatusText.value = "竣工验收报告生成完成";
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
  function changeReportType(type) {
    reportType.value = type;
  }
  async function generateReport(projectId, hasExtracted, modalRef) {
    var _a, _b, _c, _d;
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
    if (reportType.value === "withData" && !testReportFiles.value.length) {
      common_vendor.index.showToast({
        title: "有监测数据报告，必须要先上传监测报告",
        icon: "none"
      });
      return;
    }
    isGenerating.value = true;
    clearProgressTimer();
    if (modalRef) {
      modalRef.open();
    }
    try {
      await api_acceptance.generateReport({
        projectId,
        onProgress: (progress, statusText) => {
          updateProgressSmooth(progress, statusText);
        }
      });
      reportGenerated.value = true;
      previewTitle.value = reportType.value === "withoutData" ? "无监测数据的竣工验收报告已生成，请点击下载！" : "有监测数据的竣工验收报告已生成，请点击下载！";
      saveReportCache(projectId, {
        generated: true,
        type: reportType.value,
        previewTitle: previewTitle.value
      });
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
      common_vendor.index.__f__("error", "at composables/useAcceptanceReport.js:201", "生成报告失败", error, (_a = error.response) == null ? void 0 : _a.data);
      let msg = error.message || "请稍后重试";
      if (Array.isArray((_c = (_b = error.response) == null ? void 0 : _b.data) == null ? void 0 : _c.detail)) {
        msg = error.response.data.detail.map((d) => d.msg).join("；");
      } else if (typeof ((_d = error.response) == null ? void 0 : _d.data) === "string") {
        msg = error.response.data;
      }
      common_vendor.index.showModal({
        title: "生成失败",
        content: msg,
        showCancel: false
      });
    } finally {
      isGenerating.value = false;
    }
  }
  async function downloadReport(projectId) {
    if (!projectId) {
      common_vendor.index.showToast({
        title: "请先选择项目",
        icon: "none"
      });
      return;
    }
    common_vendor.index.showLoading({
      title: "正在下载竣工验收报告…",
      mask: true
    });
    try {
      const { ab, filename } = await api_acceptance.downloadReport(projectId);
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
  function saveReportCache(projectId, reportData) {
    try {
      const cacheKey = `acceptance_report_${projectId}`;
      const cacheData = {
        ...reportData,
        generatedAt: Date.now()
      };
      common_vendor.index.setStorageSync(cacheKey, JSON.stringify(cacheData));
      common_vendor.index.__f__("log", "at composables/useAcceptanceReport.js:324", `✅ 项目 ${projectId} 的竣工验收报告已缓存`);
    } catch (error) {
      common_vendor.index.__f__("error", "at composables/useAcceptanceReport.js:326", "保存竣工验收报告缓存失败:", error);
    }
  }
  function loadReportCache(projectId) {
    try {
      const cacheKey = `acceptance_report_${projectId}`;
      const cachedData = common_vendor.index.getStorageSync(cacheKey);
      if (cachedData) {
        const cacheData = JSON.parse(cachedData);
        reportGenerated.value = cacheData.generated || false;
        reportType.value = cacheData.type || "withoutData";
        previewTitle.value = cacheData.previewTitle || "";
        common_vendor.index.__f__("log", "at composables/useAcceptanceReport.js:344", `✅ 已加载项目 ${projectId} 的竣工验收报告缓存`);
      } else {
        reportGenerated.value = false;
        reportType.value = "withoutData";
        previewTitle.value = "";
        common_vendor.index.__f__("log", "at composables/useAcceptanceReport.js:349", `ℹ️ 项目 ${projectId} 暂无竣工验收报告缓存`);
      }
    } catch (error) {
      common_vendor.index.__f__("error", "at composables/useAcceptanceReport.js:352", "加载竣工验收报告缓存失败:", error);
      reportGenerated.value = false;
      reportType.value = "withoutData";
      previewTitle.value = "";
    }
  }
  function clearReportCache(projectId) {
    try {
      const cacheKey = `acceptance_report_${projectId}`;
      common_vendor.index.removeStorageSync(cacheKey);
      reportGenerated.value = false;
      reportType.value = "withoutData";
      previewTitle.value = "";
      testReportFiles.value = [];
      common_vendor.index.__f__("log", "at composables/useAcceptanceReport.js:371", `✅ 已清除项目 ${projectId} 的竣工验收报告缓存`);
    } catch (error) {
      common_vendor.index.__f__("error", "at composables/useAcceptanceReport.js:373", "清除竣工验收报告缓存失败:", error);
    }
  }
  function resetState() {
    reportGenerated.value = false;
    reportType.value = "withoutData";
    previewTitle.value = "";
    testReportFiles.value = [];
    isGenerating.value = false;
    clearProgressTimer();
  }
  instance = {
    // 状态
    reportGenerated,
    reportType,
    testReportFiles,
    previewTitle,
    canDownloadReport,
    isGenerating,
    taskProgress,
    taskStatusText,
    taskState,
    reportTypes,
    // 方法
    changeReportType,
    generateReport,
    downloadReport,
    loadReportCache,
    saveReportCache,
    clearReportCache,
    resetState
  };
  return instance;
}
exports.useAcceptanceReport = useAcceptanceReport;
//# sourceMappingURL=../../.sourcemap/mp-weixin/composables/useAcceptanceReport.js.map
