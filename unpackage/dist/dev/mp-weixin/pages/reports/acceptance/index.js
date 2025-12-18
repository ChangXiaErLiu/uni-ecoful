"use strict";
const common_vendor = require("../../../common/vendor.js");
const utils_platform = require("../../../utils/platform.js");
const stores_navTitle = require("../../../stores/navTitle.js");
const api_acceptance = require("../../../api/acceptance.js");
if (!Array) {
  const _easycom_uni_data_select2 = common_vendor.resolveComponent("uni-data-select");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  const _easycom_uni_file_picker2 = common_vendor.resolveComponent("uni-file-picker");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_data_select2 + _easycom_uni_icons2 + _easycom_uni_easyinput2 + _easycom_uni_file_picker2 + _easycom_uni_popup2)();
}
const _easycom_uni_data_select = () => "../../../uni_modules/uni-data-select/components/uni-data-select/uni-data-select.js";
const _easycom_uni_icons = () => "../../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_easyinput = () => "../../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_uni_file_picker = () => "../../../uni_modules/uni-file-picker/components/uni-file-picker/uni-file-picker.js";
const _easycom_uni_popup = () => "../../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_data_select + _easycom_uni_icons + _easycom_uni_easyinput + _easycom_uni_file_picker + AppLayout + _easycom_uni_popup + TaskProgressModal)();
}
const AppLayout = () => "../../../components/layout/AppLayout.js";
const TaskProgressModal = () => "../../../components/message-pop-up/TaskProgressModal.js";
const MAX_POLLING_COUNT = 100;
const POLLING_INTERVAL = 3e3;
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const navTitle = stores_navTitle.navTitleStore();
    common_vendor.onShow(() => navTitle.setTitle("环评项目竣工验收"));
    const {
      isMobile
    } = utils_platform.usePlatformInfo();
    const taskProgressModal = common_vendor.ref(null);
    const taskProgressTitle = common_vendor.ref("信息提取中");
    const taskProgress = common_vendor.ref(0);
    const taskStatusText = common_vendor.ref("正在初始化...");
    const taskState = common_vendor.ref("running");
    const stepNames = ["资料上传与基本信息", "监测方案", "提资单比对", "现场踏勘比对", "竣工验收报告"];
    const currentStep = common_vendor.ref(0);
    common_vendor.computed(() => stepNames.map((n, i) => stepDone(i) ? n + " ✓" : n));
    const stepSelectOptions = common_vendor.computed(() => stepNames.map((n, i) => ({
      text: stepDone(i) ? n + " ✓" : n,
      value: i
    })));
    function prevStep() {
      if (currentStep.value > 0)
        currentStep.value -= 1;
    }
    function nextStep() {
      if (currentStep.value < stepNames.length - 1)
        currentStep.value += 1;
    }
    const extractionOk = common_vendor.ref(false);
    function stepDone(i) {
      switch (i) {
        case 0:
          return extractionOk.value;
        case 1:
          return datasheet.value.length > 0;
        case 2:
          return tizidanItems.value.some((item) => item.submitted);
        case 3:
          return fieldworkComparison.value.length > 0;
        case 4:
          return reportGenerated.value;
        default:
          return false;
      }
    }
    const selectedProjectId = common_vendor.ref(null);
    const selectedProject = common_vendor.ref(null);
    const projectList = common_vendor.ref([]);
    const projectFiles = common_vendor.ref([]);
    const projectSearchKeyword = common_vendor.ref("");
    const projectPickerPopup = common_vendor.ref(null);
    const pollingTimer = common_vendor.ref(null);
    const isPolling = common_vendor.ref(false);
    const pollingCount = common_vendor.ref(0);
    const filteredProjects = common_vendor.computed(() => {
      if (!projectSearchKeyword.value) {
        return projectList.value;
      }
      const keyword = projectSearchKeyword.value.toLowerCase().trim();
      return projectList.value.filter((project) => {
        const name = (project.name || "").toLowerCase();
        const desc = (project.description || "").toLowerCase();
        const folder = (project.folder_name || "").toLowerCase();
        return name.includes(keyword) || desc.includes(keyword) || folder.includes(keyword);
      });
    });
    function openProjectPicker() {
      var _a;
      if (projectList.value.length === 0) {
        common_vendor.index.showToast({
          title: "暂无项目，请先创建项目",
          icon: "none"
        });
        return;
      }
      projectSearchKeyword.value = "";
      (_a = projectPickerPopup.value) == null ? void 0 : _a.open();
    }
    function closeProjectPicker() {
      var _a;
      (_a = projectPickerPopup.value) == null ? void 0 : _a.close();
    }
    async function selectProject(project) {
      selectedProjectId.value = project.id;
      selectedProject.value = project;
      try {
        common_vendor.index.setStorageSync("acceptance_project_id", project.id);
        common_vendor.index.setStorageSync("acceptance_project_info", JSON.stringify({
          id: project.id,
          name: project.name,
          description: project.description,
          folder_name: project.folder_name
        }));
      } catch (e) {
        common_vendor.index.__f__("warn", "at pages/reports/acceptance/index.vue:1280", "⚠️ 保存项目选择失败:", e);
      }
      closeProjectPicker();
      stopPolling();
      await loadProjectFiles(project.id);
      startPollingFileStatus(project.id);
      loadProjectCache(project.id);
      common_vendor.index.showToast({
        title: `已选择：${project.name}`,
        icon: "success",
        duration: 1500
      });
    }
    function onSearchInput(e) {
      common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1309", "搜索关键词:", projectSearchKeyword.value);
    }
    function hasProcessingFiles() {
      return projectFiles.value.some(
        (file) => !["indexed", "failed"].includes(file.status)
      );
    }
    function startPollingFileStatus(projectId) {
      if (!hasProcessingFiles()) {
        return;
      }
      if (isPolling.value) {
        common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1331", "⚠️ 已在轮询中，跳过");
        return;
      }
      isPolling.value = true;
      pollingCount.value = 0;
      projectFiles.value.filter(
        (f) => !["indexed", "failed"].includes(f.status)
      ).length;
      pollingTimer.value = setInterval(async () => {
        pollingCount.value++;
        if (pollingCount.value > MAX_POLLING_COUNT) {
          common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1350", "⏰ 达到最大轮询次数，停止轮询");
          stopPolling();
          common_vendor.index.showToast({
            title: "文件处理超时，请手动刷新",
            icon: "none",
            duration: 2e3
          });
          return;
        }
        try {
          await loadProjectFiles(projectId, true);
          if (!hasProcessingFiles()) {
            common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1366", "✅ 所有文件处理完成，停止轮询");
            stopPolling();
            common_vendor.index.showToast({
              title: "文件处理完成",
              icon: "success",
              duration: 2e3
            });
          } else {
            const processing = projectFiles.value.filter(
              (f) => !["indexed", "failed"].includes(f.status)
            );
          }
        } catch (error) {
          common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:1383", "❌ 轮询文件状态失败:", error);
        }
      }, POLLING_INTERVAL);
    }
    function stopPolling() {
      if (pollingTimer.value) {
        clearInterval(pollingTimer.value);
        pollingTimer.value = null;
      }
      isPolling.value = false;
      pollingCount.value = 0;
    }
    async function loadProjects() {
      try {
        const {
          getProjects
        } = await "../../../api/project.js";
        const response = await getProjects();
        projectList.value = response || [];
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:1412", "加载项目列表失败:", error);
        common_vendor.index.showToast({
          title: "加载项目列表失败",
          icon: "none"
        });
      }
    }
    async function loadProjectFiles(projectId, silent = false) {
      try {
        if (!silent) {
          common_vendor.index.showLoading({
            title: "加载文件列表...",
            mask: true
          });
        }
        const {
          getProjectDocuments
        } = await "../../../api/project.js";
        const response = await getProjectDocuments(projectId);
        if (Array.isArray(response)) {
          projectFiles.value = response;
        } else if (response && Array.isArray(response.documents)) {
          projectFiles.value = response.documents;
        } else {
          projectFiles.value = [];
        }
        if (!silent) {
          common_vendor.index.hideLoading();
          if (projectFiles.value.length === 0) {
            common_vendor.index.showToast({
              title: "该项目暂无文件",
              icon: "none"
            });
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:1461", "加载项目文件失败:", error);
        if (!silent) {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: "加载文件列表失败",
            icon: "none"
          });
        }
        projectFiles.value = [];
      }
    }
    function getFileIcon(extension) {
      const ext = (extension || "").toLowerCase().replace(".", "");
      const iconMap = {
        "pdf": "paperplane",
        "doc": "compose",
        "docx": "compose",
        "xls": "bars",
        "xlsx": "bars",
        "ppt": "image",
        "pptx": "image",
        "md": "compose",
        "txt": "compose",
        "jpg": "image",
        "jpeg": "image",
        "png": "image",
        "gif": "image"
      };
      return iconMap[ext] || "paperclip";
    }
    function formatFileSize(bytes) {
      if (!bytes)
        return "0 B";
      const k = 1024;
      const sizes = ["B", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
    }
    function formatFileStatus(status) {
      const statusMap = {
        "uploaded": "已上传",
        "converting": "转换中",
        "converted": "已转换",
        "vectorizing": "向量化中",
        "indexed": "已索引",
        "failed": "处理失败"
      };
      return statusMap[status] || status;
    }
    function getStatusText(status) {
      const statusMap = {
        "uploaded": "已上传",
        "converting": "转换中",
        "converted": "已转换",
        "vectorizing": "处理中",
        "indexed": "✓ 已就绪",
        "failed": "失败"
      };
      return statusMap[status] || status;
    }
    function getStatusClass(status) {
      const classMap = {
        "uploaded": "status-uploaded",
        "converting": "status-processing",
        "converted": "status-processing",
        "vectorizing": "status-processing",
        "indexed": "status-success",
        "failed": "status-error"
      };
      return classMap[status] || "";
    }
    function loadProjectCache(projectId) {
      if (!projectId)
        return;
      const cacheKey = `project_base_info_${projectId}`;
      const cachedData = common_vendor.index.getStorageSync(cacheKey);
      if (cachedData) {
        try {
          baseTable.value = JSON.parse(cachedData);
          extractionOk.value = true;
          common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1553", `✅ 已加载项目 ${projectId} 的缓存数据`);
          extractFacilitiesFromPollutants();
          common_vendor.index.showToast({
            title: "已加载缓存数据",
            icon: "success",
            duration: 1500
          });
        } catch (error) {
          common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:1564", "解析缓存数据失败:", error);
          baseTable.value = [];
          extractionOk.value = false;
        }
      } else {
        baseTable.value = [];
        extractionOk.value = false;
        common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1572", `ℹ️ 项目 ${projectId} 暂无缓存数据`);
      }
    }
    function clearProjectCache() {
      if (!selectedProjectId.value) {
        common_vendor.index.showToast({
          title: "请先选择项目",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showModal({
        title: "清除缓存",
        content: "确定要清除当前项目的所有缓存数据吗？清除后需要重新提取信息。",
        success: (res) => {
          if (res.confirm) {
            const cacheKey = `project_base_info_${selectedProjectId.value}`;
            common_vendor.index.removeStorageSync(cacheKey);
            common_vendor.index.removeStorageSync("acceptance_project_id");
            common_vendor.index.removeStorageSync("acceptance_project_info");
            baseTable.value = [];
            signboard.value = {
              sections: []
            };
            showSignboard.value = false;
            extractionOk.value = false;
            selectedProjectId.value = null;
            selectedProject.value = null;
            projectFiles.value = [];
            common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1612", `🗑️ 已清除项目缓存和选择`);
            common_vendor.index.showToast({
              title: "缓存已清除",
              icon: "success"
            });
          }
        }
      });
    }
    common_vendor.onLoad(async () => {
      await loadProjects();
      try {
        const savedProjectId = common_vendor.index.getStorageSync("acceptance_project_id");
        if (savedProjectId) {
          const project = projectList.value.find((p) => p.id === savedProjectId);
          if (project) {
            common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1635", "🔄 恢复上次选择的项目:", project.name);
            selectedProjectId.value = project.id;
            selectedProject.value = project;
            await loadProjectFiles(project.id);
            startPollingFileStatus(project.id);
            loadProjectCache(project.id);
          } else {
            common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1650", "⚠️ 上次选择的项目已不存在，清除缓存");
            common_vendor.index.removeStorageSync("acceptance_project_id");
            common_vendor.index.removeStorageSync("acceptance_project_info");
          }
        }
      } catch (e) {
        common_vendor.index.__f__("warn", "at pages/reports/acceptance/index.vue:1656", "⚠️ 恢复项目选择失败:", e);
      }
    });
    common_vendor.onUnmounted(() => {
      stopPolling();
      common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1663", "📄 页面卸载，清理轮询定时器");
    });
    common_vendor.watch(selectedProjectId, (newId, oldId) => {
      if (oldId && newId !== oldId) {
        stopPolling();
        common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1670", "🔄 切换项目，停止旧项目的轮询");
      }
    });
    const extracting = common_vendor.ref(false);
    common_vendor.ref("");
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
        common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1701", `[进度真实更新] ${newProgress}% - ${statusText}`);
      }
      if (!smoothProgressTimer) {
        smoothProgressTimer = setInterval(() => {
          const now = Date.now();
          const timeSinceLastUpdate = now - lastUpdateTime;
          if (currentDisplayProgress < targetProgress) {
            const diff = targetProgress - currentDisplayProgress;
            const step = Math.max(0.5, diff / 10);
            currentDisplayProgress = Math.min(
              currentDisplayProgress + step,
              targetProgress
            );
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
            taskStatusText.value = "信息提取完成";
            setTimeout(() => {
              var _a;
              (_a = taskProgressModal.value) == null ? void 0 : _a.close();
              common_vendor.index.showToast({
                title: "信息提取完成",
                icon: "success",
                duration: 2e3
              });
            }, 1e3);
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
    async function simulateExtract() {
      var _a, _b;
      if (!selectedProjectId.value) {
        common_vendor.index.showModal({
          title: "提示",
          content: "请先选择一个项目",
          showCancel: false,
          confirmText: "知道了"
        });
        return;
      }
      if (projectFiles.value.length === 0) {
        common_vendor.index.showModal({
          title: "提示",
          content: "该项目暂无文件，请先在项目管理模块上传文件",
          showCancel: false,
          confirmText: "知道了"
        });
        return;
      }
      const hasIndexedFiles = projectFiles.value.some((file) => file.status === "indexed");
      if (!hasIndexedFiles) {
        common_vendor.index.showModal({
          title: "提示",
          content: "项目文件正在处理中，请稍后再试",
          showCancel: false,
          confirmText: "知道了"
        });
        return;
      }
      extracting.value = true;
      clearProgressTimer();
      taskProgressTitle.value = "信息提取中";
      taskProgress.value = 0;
      taskStatusText.value = "正在提交任务...";
      taskState.value = "pending";
      (_a = taskProgressModal.value) == null ? void 0 : _a.open();
      try {
        const result = await api_acceptance.runTask({
          projectId: selectedProjectId.value,
          projectFolder: selectedProject.value.folder_name,
          // 进度回调函数：每次后端更新进度时调用
          onProgress: (progress, statusText, state) => {
            updateProgressSmooth(progress, statusText, state);
          },
          pollInterval: 3e3,
          // 每3秒轮询一次
          timeout: 18e5
          // 30分钟超时
        });
        updateProgressSmooth(100, "任务完成", "success");
        if ((result == null ? void 0 : result.status) !== "success" || !result.result) {
          throw new Error((result == null ? void 0 : result.message) || "提取失败：后端未返回有效数据");
        }
        baseTable.value = api_acceptance.transformExtractResult(result.result);
        const cacheKey = `project_base_info_${selectedProjectId.value}`;
        common_vendor.index.setStorageSync(cacheKey, JSON.stringify(baseTable.value));
        common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1851", `✅ 项目 ${selectedProjectId.value} 的数据已缓存`);
        extractFacilitiesFromPollutants();
        extractionOk.value = true;
      } catch (error) {
        clearProgressTimer();
        (_b = taskProgressModal.value) == null ? void 0 : _b.close();
        common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:1865", "[Extract] 提取失败:", error);
        if (error.message.includes("超时") || error.message.includes("timeout")) {
          common_vendor.index.showModal({
            title: "提取超时了！",
            content: "任务执行时间过长，可能原因：\n1. 文档过大（建议<50MB）\n2. 网络不稳定\n3. 服务器繁忙\n\n建议稍后重试或联系管理员",
            showCancel: false,
            confirmText: "知道了"
          });
        } else if (error.message.includes("未提取到")) {
          common_vendor.index.showModal({
            title: "提取失败",
            content: "文档中未找到项目信息，请检查：\n1. 文件是否为完整的环评报告\n2. 文件内容是否清晰可读\n3. 文件格式是否正确",
            showCancel: false,
            confirmText: "知道了"
          });
        } else if (error.message.includes("已有任务在运行")) {
          common_vendor.index.showModal({
            title: "任务进行中",
            content: "您已有一个信息提取任务正在运行，请等待完成后再提交新任务",
            showCancel: false,
            confirmText: "知道了"
          });
        } else {
          common_vendor.index.showModal({
            title: "提取失败",
            content: error.message || "无法从文档中提取项目信息，请稍后重试",
            showCancel: false,
            confirmText: "知道了"
          });
        }
      } finally {
        extracting.value = false;
      }
    }
    const newBaseInfoPopup = common_vendor.ref(null);
    const newBaseInfoLabel = common_vendor.ref("");
    function openAddBase() {
      var _a, _b;
      newBaseInfoLabel.value = "";
      (_b = (_a = newBaseInfoPopup.value) == null ? void 0 : _a.open) == null ? void 0 : _b.call(_a);
    }
    function confirmAddBaseInfo() {
      var _a, _b;
      const label = (newBaseInfoLabel.value || "").trim();
      if (!label) {
        common_vendor.index.showToast({
          title: "请输入字段名称",
          icon: "none"
        });
        return;
      }
      baseTable.value.push({
        id: Date.now() + Math.random(),
        section: "",
        label,
        value: "",
        source: "manual",
        required: false
      });
      (_b = (_a = newBaseInfoPopup.value) == null ? void 0 : _a.close) == null ? void 0 : _b.call(_a);
    }
    function closeBaseInfo() {
      var _a, _b;
      (_b = (_a = newBaseInfoPopup.value) == null ? void 0 : _a.close) == null ? void 0 : _b.call(_a);
    }
    const showSignboard = common_vendor.ref(false);
    const signboard = common_vendor.reactive({
      sections: [
        {
          block: "废水",
          items: [{
            title: "",
            content: ""
          }]
        },
        {
          block: "废气",
          items: [{
            title: "",
            content: ""
          }]
        },
        {
          block: "噪声",
          items: [{
            title: "",
            content: ""
          }]
        },
        {
          block: "危险废物",
          items: [{
            title: "",
            content: ""
          }]
        }
      ]
    });
    function generateSignboard() {
      var _a;
      const unitName = findBaseValue("建设单位名称") || findBaseValue("单位名称") || "";
      findBaseValue("危废名称") || findBaseValue("危废") || "";
      const emissionData = (_a = baseTable.value.find((x) => x.id === "pollutants_emission")) == null ? void 0 : _a.value;
      if (!emissionData || typeof emissionData !== "object") {
        common_vendor.index.showToast({
          title: "未提取到污染物信息",
          icon: "none"
        });
        return;
      }
      signboard.sections.forEach((sec) => sec.items = []);
      function splitOutletCodes(codeStr) {
        if (!codeStr)
          return [];
        const invalidCodes = ["/", "信息待补充", ""];
        return codeStr.split(/[、,，]/).map((c) => c.trim()).filter((c) => c && !invalidCodes.includes(c));
      }
      function groupByOutletCode(list, blockType) {
        const outletMap = /* @__PURE__ */ new Map();
        list.forEach((item) => {
          const codes = splitOutletCodes(item["排污口编号"]);
          item["污染物名称"] || "";
          const wryz = item["污染因子"] || "";
          codes.forEach((code) => {
            if (!outletMap.has(code)) {
              outletMap.set(code, {
                pollutants: [],
                wryz: [],
                otherInfo: item
                // 保存其他信息（如执行标准、排放去向等）
              });
            }
            if (wryz) {
              outletMap.get(code).wryz.push(wryz);
            }
          });
        });
        return outletMap;
      }
      const waterList = emissionData["水污染物"] || [];
      const waterOutlets = groupByOutletCode(waterList);
      waterOutlets.forEach((data, code) => {
        const wryz = [...new Set(data.wryz)].join("、");
        signboard.sections.find((s) => s.block === "废水").items.push({
          title: "单位名称",
          content: unitName
        }, {
          title: "排放口编号",
          content: code
        }, {
          title: "污染因子",
          content: wryz
        });
      });
      const gasList = emissionData["大气污染物"] || [];
      const gasOutlets = groupByOutletCode(gasList);
      gasOutlets.forEach((data, code) => {
        const wryz = [...new Set(data.wryz)].join("、");
        signboard.sections.find((s) => s.block === "废气").items.push({
          title: "单位名称",
          content: unitName
        }, {
          title: "排放口编号",
          content: code
        }, {
          title: "污染因子",
          content: wryz
        });
      });
      const noiseList = emissionData["噪声"] || [];
      const noiseOutlets = groupByOutletCode(noiseList);
      noiseOutlets.forEach((data, code) => {
        [...new Set(data.wryz)].join("、");
        signboard.sections.find((s) => s.block === "噪声").items.push({
          title: "单位名称",
          content: unitName
        }, {
          title: "排放口编号",
          content: code
        }, {
          title: "污染因子",
          content: "设备噪声"
        });
      });
      function extractHazardCodes(str) {
        if (!str)
          return "";
        const matches = str.match(/HW\d+/g);
        if (!matches)
          return "";
        return [...new Set(matches)].join("、");
      }
      function extractHazardProperties(str) {
        if (!str)
          return "";
        const matches = str.match(/（([^）]+)）/g);
        if (!matches)
          return "";
        const properties = matches.map((m) => m.replace(/[（）]/g, ""));
        return [...new Set(properties)].join("、");
      }
      const hazardousWaste = emissionData["危险废物"] || {};
      const WFItems = [
        {
          title: "主要成分",
          content: extractHazardCodes(hazardousWaste["危险废物类别"]) || "HW49"
        },
        {
          title: "化学名称",
          content: hazardousWaste["废物名称"] || "实验室废弃物、实验室废水污泥、医疗废物、废活性炭"
        },
        {
          title: "危险情况",
          content: extractHazardProperties(hazardousWaste["危险特性"]) || "毒性、腐蚀性"
        },
        {
          title: "安全措施",
          content: "接触时佩戴个人防护用品（全面罩/丁晴手套）"
        },
        {
          title: "废物产生单位",
          content: unitName
        },
        {
          title: "地址",
          content: findBaseValue("建设地点")
        },
        {
          title: "电话",
          content: findBaseValue("联系方式")
        },
        {
          title: "联系人",
          content: findBaseValue("单位联系人")
        }
      ];
      signboard.sections.find((s) => s.block === "危险废物").items = WFItems;
      common_vendor.index.showToast({
        title: "已生成标识牌",
        icon: "success"
      });
    }
    function addSignItem(sectionIdx) {
      const sec = signboard.sections[sectionIdx];
      const block = sec.block;
      const unitName = findBaseValue("建设单位名称") || findBaseValue("单位名称") || "";
      if (block !== "噪声") {
        common_vendor.index.showToast({
          title: "只有噪声可以手动新增",
          icon: "none"
        });
        return;
      }
      let maxNum = 0;
      for (let i = 0; i < sec.items.length; i += 3) {
        const codeItem = sec.items[i + 1];
        if (codeItem && codeItem.title === "排放口编号") {
          const code2 = codeItem.content || "";
          const match = code2.match(/\d+/);
          if (match) {
            const num = parseInt(match[0], 10);
            if (num > maxNum)
              maxNum = num;
          }
        }
      }
      let code = "";
      if (block === "废水")
        code = `DW${String(maxNum + 1).padStart(3, "0")}`;
      else if (block === "废气")
        code = `DA${String(maxNum + 1).padStart(3, "0")}`;
      else if (block === "噪声")
        code = `ZS-${String(maxNum + 1).padStart(2, "0")}`;
      const group = [
        {
          title: "单位名称",
          content: unitName
        },
        {
          title: "排放口编号",
          content: code
        },
        {
          title: "污染因子",
          content: "设备噪声"
        }
      ];
      sec.items.push(...group);
      common_vendor.index.showToast({
        title: "已添加新排污口",
        icon: "success"
      });
    }
    function groupItems(items, block) {
      if (block === "危险废物")
        return [items];
      const groups = [];
      for (let i = 0; i < items.length; i += 3) {
        groups.push(items.slice(i, i + 3));
      }
      return groups;
    }
    function removeGroup(section, groupIndex) {
      const start = groupIndex * 3;
      const codeItem = section.items.slice(start, start + 3).find((it) => it.title === "排放口编号");
      const code = (codeItem == null ? void 0 : codeItem.content) || "未知编号";
      common_vendor.index.showModal({
        title: "永久删除",
        content: `确定删除排污口  ${code}  所有信息吗？`,
        confirmText: "确定",
        cancelText: "取消",
        success: (res) => {
          if (res.confirm) {
            section.items.splice(start, 3);
          }
        }
      });
    }
    function findBaseValue(label) {
      const r = baseTable.value.find((x) => x.label === label);
      return r ? r.value || "" : "";
    }
    function downBiaoShi() {
      if (!selectedProjectId.value) {
        common_vendor.index.showModal({
          title: "提示",
          content: "请先选择一个项目",
          showCancel: false
        });
        return;
      }
      common_vendor.index.showLoading({
        title: "正在生成文档…"
      });
      api_acceptance.downloadSignboardWord(signboard, selectedProjectId.value).then((buf) => {
        const fileName = "排污标识牌.docx";
        const filePath = `${common_vendor.wx$1.env.USER_DATA_PATH}/${fileName}`;
        common_vendor.wx$1.getFileSystemManager().writeFile({
          filePath,
          data: buf,
          encoding: "binary",
          success: () => common_vendor.wx$1.openDocument({
            filePath,
            fileType: "docx"
          }),
          fail: (e) => common_vendor.index.showToast({
            title: "保存失败",
            icon: "error"
          })
        });
      }).catch((err) => {
        common_vendor.index.showModal({
          content: err.message || "生成失败",
          showCancel: false
        });
      }).finally(() => common_vendor.index.hideLoading());
    }
    const plan = common_vendor.ref(false);
    const canDownload = common_vendor.ref(false);
    async function saveMonitorPlan() {
      var _a, _b, _c;
      if (!selectedProjectId.value)
        return common_vendor.index.showModal({
          title: "提示",
          content: "请先选择项目",
          showCancel: false
        });
      if (!extractionOk.value)
        return common_vendor.index.showModal({
          title: "提示",
          content: "请先提取项目信息",
          showCancel: false
        });
      clearProgressTimer();
      taskProgressTitle.value = "监测方案生成中";
      taskProgress.value = 0;
      taskState.value = "pending";
      (_a = taskProgressModal.value) == null ? void 0 : _a.open();
      try {
        await api_acceptance.generateMonitorPlan({
          projectId: selectedProjectId.value,
          onProgress: (p, txt) => updateProgressSmooth(p, txt)
        });
        canDownload.value = true;
        (_b = taskProgressModal.value) == null ? void 0 : _b.close();
        common_vendor.index.showToast({
          title: "生成成功，可下载报告",
          icon: "success"
        });
        plan.value = true;
      } catch (e) {
        clearProgressTimer();
        (_c = taskProgressModal.value) == null ? void 0 : _c.close();
        common_vendor.index.showModal({
          title: "生成失败",
          content: e.message || "请稍后重试",
          showCancel: false
        });
      }
    }
    async function downloadPlan() {
      common_vendor.index.showLoading({
        title: "正在下载监测方案…",
        mask: true
      });
      try {
        const {
          ab,
          filename
        } = await api_acceptance.downloadMonitorPlan(selectedProjectId.value);
        await saveArrayBuffer(ab, filename);
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "已保存：" + filename,
          icon: "success"
        });
      } catch (e) {
        common_vendor.index.hideLoading();
        common_vendor.index.showModal({
          title: "下载失败",
          content: e.message,
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
    async function uploadTizidanFile(index) {
      common_vendor.index.chooseFile({
        count: 1,
        // 只能选择一个文件
        extension: [".doc", ".docx", ".pdf", ".xls", ".xlsx", ".png", ".jpg", ".jpeg"],
        success: async (chooseRes) => {
          const tempFile = chooseRes.tempFiles[0];
          common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:2460", "选择的文件:", tempFile);
          common_vendor.index.showModal({
            title: "确认提交",
            content: `您确定要提交 "${tizidanItems.value[index].text}" 并上传文件 "${tempFile.name}" 吗？`,
            success: async (modalRes) => {
              if (modalRes.confirm) {
                await uploadAndSubmitFile(index, tempFile);
              }
            }
          });
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:2475", "选择文件失败:", err);
          common_vendor.index.showToast({
            title: "选择文件失败",
            icon: "none"
          });
        }
      });
    }
    async function uploadAndSubmitFile(index, file) {
      common_vendor.index.showLoading({
        title: "上传文件中...",
        mask: true
      });
      try {
        const uploadRes = await uploadFileToBackend(file, index);
        if (uploadRes.success) {
          tizidanItems.value[index].submitted = true;
          common_vendor.index.showToast({
            title: "提交成功",
            icon: "success",
            duration: 2e3
          });
          common_vendor.index.showModal({
            title: "提交成功",
            content: `文件 "${file.name}" 上传成功！`,
            showCancel: false,
            confirmText: "确定"
          });
        } else {
          throw new Error(uploadRes.message || "文件上传失败");
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:2517", "提交失败:", error);
        common_vendor.index.showToast({
          title: "提交失败：" + error.message,
          icon: "none",
          duration: 3e3
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    }
    function uploadFileToBackend(file, index) {
      return new Promise((resolve, reject) => {
        common_vendor.index.uploadFile({
          url: "http://127.0.0.1:8000/api/v1/completion/tzdDetail/upload_file",
          filePath: file.path,
          name: "file",
          formData: {
            item_index: index,
            item_text: tizidanItems.value[index].text,
            user_id,
            project_id
          },
          success: (uploadRes) => {
            common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:2543", "文件上传响应:", uploadRes);
            if (uploadRes.statusCode === 200) {
              try {
                const data = JSON.parse(uploadRes.data);
                resolve(data);
              } catch (e) {
                common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:2550", "解析响应失败:", e);
                reject(new Error("服务器响应格式错误"));
              }
            } else {
              reject(new Error(`上传失败，状态码：${uploadRes.statusCode}`));
            }
          },
          fail: (err) => {
            common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:2558", "上传请求失败:", err);
            reject(new Error("网络请求失败"));
          }
        });
      });
    }
    const tizidanItems = common_vendor.ref([]);
    const downloadUrls = common_vendor.ref({
      TiZiDan_Doc: "",
      comparison_list: ""
    });
    const project_id = common_vendor.index.getStorageSync("acceptance_project_id");
    const userInfoStr = common_vendor.index.getStorageSync("userInfo");
    const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
    const user_id = (userInfo == null ? void 0 : userInfo.id) || (userInfo == null ? void 0 : userInfo.user_id);
    async function fetchTizidanData() {
      try {
        common_vendor.index.showLoading({
          title: "加载中..."
        });
        const response = await new Promise((resolve, reject) => {
          common_vendor.index.request({
            url: "http://127.0.0.1:8000/api/v1/completion/tzdDetail/datasheet",
            method: "GET",
            timeout: 1e3,
            data: {
              user_id,
              project_id
            },
            success: (res) => {
              common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:2597", "请求成功:", res);
              resolve(res);
            },
            fail: (err) => {
              common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:2601", "请求失败:", err);
              reject(err);
            }
          });
        });
        if (response && response.statusCode === 200) {
          const data = response.data;
          if (!data.items || !Array.isArray(data.items)) {
            throw new Error("数据格式不正确: items 不存在或不是数组");
          }
          tizidanItems.value = data.items;
          common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:2615", "test", data.download_urls);
          const downloadUrlsData = data.download_urls || {};
          downloadUrls.value = {
            TiZiDan_Doc: formatDownloadUrl(downloadUrlsData.TiZiDan_Doc),
            comparison_list: formatDownloadUrl(downloadUrlsData.comparison_list)
          };
          common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:2625", "下载URL设置:", downloadUrls.value);
          common_vendor.index.showToast({
            title: "数据加载成功",
            icon: "success"
          });
        } else {
          throw new Error(`请求失败，状态码：${(response == null ? void 0 : response.statusCode) || "未知"}`);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:2635", "获取提资单数据失败:", error);
        common_vendor.index.showToast({
          title: "加载失败，请重新刷新！",
          icon: "none",
          duration: 3e3
        });
        tizidanItems.value = [];
        downloadUrls.value = {
          TiZiDan_Doc: "",
          comparison_list: ""
        };
      } finally {
        common_vendor.index.hideLoading();
      }
    }
    async function downloadTizidanFile() {
      if (!selectedProjectId.value) {
        common_vendor.index.showToast({
          title: "请先选择项目",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showLoading({
        title: "正在生成文档…",
        mask: true
      });
      try {
        const url = `http://127.0.0.1:8000/api/v1/completion/tzdDetail/download_tzd_doc?user_id=${user_id}&project_id=${project_id}`;
        const downloadTask = common_vendor.index.downloadFile({
          url,
          success: (res) => {
            if (res.statusCode === 200) {
              const filePath = res.tempFilePath;
              common_vendor.index.saveFile({
                tempFilePath: filePath,
                success: (saveRes) => {
                  common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:2689", "文件保存成功:", saveRes.savedFilePath);
                  common_vendor.index.showToast({
                    title: "文件已保存",
                    icon: "success"
                  });
                },
                fail: (saveErr) => {
                  common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:2696", "保存文件失败:", saveErr);
                  common_vendor.index.showToast({
                    title: "保存失败",
                    icon: "none"
                  });
                }
              });
            } else {
              throw new Error(`下载失败，状态码: ${res.statusCode}`);
            }
          },
          fail: (err) => {
            throw new Error("下载请求失败: " + (err.errMsg || "未知错误"));
          }
        });
        common_vendor.index.showToast({
          title: "开始下载",
          icon: "success"
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:2739", "下载失败:", error);
        common_vendor.index.showToast({
          title: "下载失败: " + (error.message || "未知错误"),
          icon: "none",
          duration: 3e3
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    }
    function formatDownloadUrl(url) {
      if (!url)
        return "";
      if (url.startsWith("/")) {
        return `http://127.0.0.1:8000${url}`;
      }
      if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
      }
      return url;
    }
    common_vendor.watch(currentStep, (newVal) => {
      if (newVal === 2) {
        fetchTizidanData();
      }
    });
    const baseTable = common_vendor.ref([]);
    const datasheet = common_vendor.ref([]);
    const selectMode = common_vendor.ref(false);
    const selectedIds = common_vendor.ref([]);
    function toggleSelectMode() {
      selectMode.value = !selectMode.value;
      if (!selectMode.value)
        selectedIds.value = [];
    }
    function toggleSelected(id) {
      const arr = selectedIds.value;
      const i = arr.indexOf(id);
      if (i >= 0)
        arr.splice(i, 1);
      else
        arr.push(id);
    }
    function removeSelected() {
      if (!selectedIds.value.length) {
        common_vendor.index.showToast({
          title: "未选择",
          icon: "none"
        });
        return;
      }
      const names = baseTable.value.filter((r) => selectedIds.value.includes(r.id)).map((r) => (r.label || "（未命名）").trim());
      const preview = names.length === 1 ? `确认要删除「${names[0]}」吗？` : (() => {
        const max = 8;
        const head = names.slice(0, max).map((n) => `• ${n}`).join("\n");
        const tail = names.length > max ? `
… 等 ${names.length} 项` : "";
        return `确认要删除以下 ${names.length} 个信息吗？
${head}${tail}`;
      })();
      common_vendor.index.showModal({
        title: "确认删除",
        content: preview,
        confirmText: "删除",
        cancelText: "取消",
        success: (res) => {
          if (res.confirm) {
            baseTable.value = baseTable.value.filter(
              (r) => !selectedIds.value.includes(r.id)
            );
            selectedIds.value = [];
            selectMode.value = false;
            common_vendor.index.showToast({
              title: `已删除 ${names.length} 项`,
              icon: "none"
            });
          }
        }
      });
    }
    const fieldworkComparison = common_vendor.ref([]);
    const tabs = ["建设内容", "设备情况", "治理设施", "排污口"];
    const currentTab = common_vendor.ref(0);
    const loadingEquipment = common_vendor.ref(false);
    const fetchEquipmentError = common_vendor.ref("");
    function handleTabChange(index) {
      currentTab.value = index;
      if (index === 1 && !equipmentList.value.length) {
        fetchEquipmentData();
      }
    }
    const mainContentTable = common_vendor.ref([
      {
        id: "mc_1",
        label: "项目名称",
        value: "",
        type: "text"
      },
      {
        id: "mc_2",
        label: "建设单位",
        value: "",
        type: "text"
      },
      {
        id: "mc_3",
        label: "建设地点",
        value: "",
        type: "text"
      },
      {
        id: "mc_4",
        label: "建设规模",
        value: "",
        type: "text"
      },
      {
        id: "mc_5",
        label: "主体工程",
        value: [],
        type: "image"
      }
    ]);
    const selectModeMain = common_vendor.ref(false);
    const selectedMainIds = common_vendor.ref([]);
    common_vendor.ref(null);
    common_vendor.ref("");
    function toggleSelectModeMain() {
      selectModeMain.value = !selectModeMain.value;
      if (!selectModeMain.value)
        selectedMainIds.value = [];
    }
    function toggleSelectedMain(id) {
      const idx = selectedMainIds.value.indexOf(id);
      if (idx > -1)
        selectedMainIds.value.splice(idx, 1);
      else
        selectedMainIds.value.push(id);
    }
    function removeSelectedMain() {
      mainContentTable.value = mainContentTable.value.filter((item) => !selectedMainIds.value.includes(item.id));
      selectedMainIds.value = [];
      selectModeMain.value = false;
      common_vendor.index.showToast({
        title: "删除成功",
        icon: "success"
      });
    }
    const equipmentList = common_vendor.ref([]);
    const equipmentSearchKeyword = common_vendor.ref("");
    const filteredEquipmentList = common_vendor.computed(() => {
      if (!equipmentSearchKeyword.value) {
        return equipmentList.value;
      }
      const keyword = equipmentSearchKeyword.value.toLowerCase().trim();
      return equipmentList.value.filter((equipment) => {
        const name = (equipment.name || "").toLowerCase();
        const quantity = (equipment.quantity || "").toLowerCase();
        const remark = (equipment.remark || "").toLowerCase();
        return name.includes(keyword) || quantity.includes(keyword) || remark.includes(keyword);
      });
    });
    function onEquipmentSearchInput(e) {
      common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:3062", "搜索设备关键词:", equipmentSearchKeyword.value);
    }
    function parseEquipmentData(apiData) {
      try {
        const parsedEquipment = [];
        if (!apiData || !Array.isArray(apiData) || apiData.length <= 1) {
          return [];
        }
        for (let i = 1; i < apiData.length; i++) {
          const row = apiData[i];
          if (row.column_1) {
            const columns = row.column_1.split("\\t");
            if (columns.length >= 4) {
              const deviceName = columns[1] || "";
              const quantity = columns[3] || "";
              if (deviceName.trim()) {
                parsedEquipment.push({
                  id: "eq_" + Date.now() + "_" + i,
                  name: deviceName.trim(),
                  quantity: quantity.trim(),
                  remark: "",
                  // 接口没有提供备注，留空
                  images: []
                });
              }
            } else {
              common_vendor.index.__f__("warn", "at pages/reports/acceptance/index.vue:3101", `第${i + 1}行数据列数不足:`, columns);
            }
          } else {
            common_vendor.index.__f__("warn", "at pages/reports/acceptance/index.vue:3104", `第${i + 1}行没有column_1字段:`, row);
          }
        }
        return parsedEquipment;
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:3110", "解析设备数据失败:", error);
        return [];
      }
    }
    async function fetchEquipmentData() {
      loadingEquipment.value = true;
      fetchEquipmentError.value = "";
      try {
        const response = await new Promise((resolve, reject) => {
          common_vendor.index.request({
            url: "http://127.0.0.1:8000/api/v1/completion/tzdDetail/getDeviceDetail",
            method: "GET",
            timeout: 1e4,
            data: {
              user_id,
              project_id
            },
            success: (res) => {
              common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:3133", "请求成功:", res);
              resolve(res);
            },
            fail: (err) => {
              common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:3137", "请求失败:", err);
              reject(err);
            }
          });
        });
        let resData;
        if (Array.isArray(response)) {
          resData = response[0];
        } else if (response && response.data) {
          resData = response.data;
        } else {
          resData = response;
        }
        common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:3158", "接口返回完整数据:", resData);
        if (resData && resData.data) {
          const apiData = resData.data;
          common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:3163", "设备数据数组:", apiData);
          if (apiData && Array.isArray(apiData) && apiData.length > 1) {
            const parsedData = parseEquipmentData(apiData);
            common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:3167", "解析后的设备数据:", parsedData);
            if (parsedData.length > 0) {
              equipmentList.value = parsedData;
              common_vendor.index.showToast({
                title: `加载成功，共${parsedData.length}条设备数据`,
                icon: "success",
                duration: 2e3
              });
            } else {
              fetchEquipmentError.value = "解析到的设备数据为空";
              common_vendor.index.showToast({
                title: "设备数据解析为空",
                icon: "none",
                duration: 2e3
              });
            }
          } else {
            fetchEquipmentError.value = "接口返回的设备数据格式不正确";
            common_vendor.index.showToast({
              title: "设备数据格式错误",
              icon: "none",
              duration: 2e3
            });
          }
        } else {
          fetchEquipmentError.value = (resData == null ? void 0 : resData.message) || "接口返回数据格式异常";
          common_vendor.index.showToast({
            title: "获取设备数据失败",
            icon: "none",
            duration: 2e3
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:3202", "获取设备数据失败:", error);
        fetchEquipmentError.value = error.message || "网络请求失败";
        common_vendor.index.showToast({
          title: "网络请求失败，请检查网络连接",
          icon: "none",
          duration: 2e3
        });
      } finally {
        loadingEquipment.value = false;
      }
    }
    function addEquipment() {
      const newEquipment = {
        id: "eq_" + Date.now(),
        name: "",
        quantity: "",
        remark: "",
        images: []
      };
      equipmentList.value.push(newEquipment);
      common_vendor.index.showToast({
        title: "已添加新设备",
        icon: "success"
      });
    }
    function removeEquipment(index) {
      common_vendor.index.showModal({
        title: "确认删除",
        content: "确定要删除这条设备记录吗？",
        success: (res) => {
          if (res.confirm) {
            equipmentList.value.splice(index, 1);
            common_vendor.index.showToast({
              title: "删除成功",
              icon: "success"
            });
          }
        }
      });
    }
    const pollutionFacilityList = common_vendor.ref([]);
    function extractFacilitiesFromPollutants() {
      var _a;
      try {
        let splitFacilities = function(text) {
          if (!text || typeof text !== "string")
            return [];
          const cleaned = text.replace(/采用|通过|设置|建设|配备|安装|使用/g, "").trim();
          const parts = cleaned.split(/[、，,；;]/);
          return parts.map((p) => p.trim()).filter((p) => p && p.length > 0 && p.length < 50);
        }, extractCoreName = function(text) {
          return text.replace(/\(.*?\)/g, "").replace(/（.*?）/g, "").replace(/\d+.*?(台|套|个|座|间|m³|m²|立方|平方).*/g, "").replace(/\d+.*?吨.*/g, "").trim();
        }, isSimilar = function(name1, name2) {
          const n1 = name1.toLowerCase();
          const n2 = name2.toLowerCase();
          return n1.includes(n2) || n2.includes(n1);
        };
        const emissionData = (_a = baseTable.value.find((x) => x.id === "pollutants_emission")) == null ? void 0 : _a.value;
        if (!emissionData || typeof emissionData !== "object") {
          common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:3259", "未找到污染物信息，跳过设施提取");
          return;
        }
        const facilitiesSet = /* @__PURE__ */ new Set();
        const facilitiesMap = /* @__PURE__ */ new Map();
        const pollutantTypes = ["水污染物", "大气污染物", "噪声", "固体废物", "危险废物"];
        pollutantTypes.forEach((type) => {
          const pollutants = emissionData[type];
          if (!pollutants)
            return;
          if (Array.isArray(pollutants)) {
            pollutants.forEach((item) => {
              const measure = item["污染治理措施"] || item["治理措施"] || "";
              const facilities = splitFacilities(measure);
              facilities.forEach((facility) => {
                const coreName = extractCoreName(facility);
                if (coreName && coreName.length >= 2) {
                  if (!facilitiesMap.has(coreName)) {
                    facilitiesMap.set(coreName, {
                      types: /* @__PURE__ */ new Set(),
                      originalText: facility
                    });
                  }
                  facilitiesMap.get(coreName).types.add(type);
                }
              });
            });
          } else if (typeof pollutants === "object") {
            const measure = pollutants["污染治理措施"] || pollutants["治理措施"] || "";
            const facilities = splitFacilities(measure);
            facilities.forEach((facility) => {
              const coreName = extractCoreName(facility);
              if (coreName && coreName.length >= 2) {
                if (!facilitiesMap.has(coreName)) {
                  facilitiesMap.set(coreName, {
                    types: /* @__PURE__ */ new Set(),
                    originalText: facility
                  });
                }
                facilitiesMap.get(coreName).types.add(type);
              }
            });
          }
        });
        const existingNames = pollutionFacilityList.value.map((f) => f.name.toLowerCase());
        let addedCount = 0;
        facilitiesMap.forEach((info, name) => {
          const isDuplicate = existingNames.some((existing) => isSimilar(existing, name));
          if (!isDuplicate) {
            const typesArray = Array.from(info.types);
            const remark = typesArray.length > 0 ? `用于处理${typesArray.join("、")}` : "";
            pollutionFacilityList.value.push({
              id: "pf_extracted_" + Date.now() + "_" + Math.random(),
              name,
              quantity: "1",
              // 默认数量为1
              remark,
              images: []
            });
            addedCount++;
          }
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:3377", "提取污染治理设施失败:", error);
      }
    }
    function addPollutionFacility() {
      const newFacility = {
        id: "pf_" + Date.now(),
        name: "",
        quantity: "",
        remark: "",
        images: []
      };
      pollutionFacilityList.value.push(newFacility);
      common_vendor.index.showToast({
        title: "已添加新设施",
        icon: "success"
      });
    }
    function removePollutionFacility(index) {
      common_vendor.index.showModal({
        title: "确认删除",
        content: "确定要删除这条设施记录吗？",
        success: (res) => {
          if (res.confirm) {
            pollutionFacilityList.value.splice(index, 1);
            common_vendor.index.showToast({
              title: "删除成功",
              icon: "success"
            });
          }
        }
      });
    }
    function generateFieldworkComparison() {
      const comparison = datasheet.value.map((item) => ({
        id: Date.now() + Math.random(),
        project: item.label,
        eiaRequirement: item.value || "待确认",
        fieldSituation: "",
        difference: "待现场核实"
      }));
      fieldworkComparison.value = comparison;
      common_vendor.index.showToast({
        title: `功能开发中`,
        icon: "success"
      });
    }
    const reportType = common_vendor.ref("withoutData");
    const testReportFiles = common_vendor.ref([]);
    const canDownloadReport = common_vendor.ref(false);
    const previewTitle = common_vendor.ref("");
    const reportGenerated = common_vendor.ref(false);
    const reportTypes = [
      {
        value: "withoutData",
        text: "无检测数据报告"
      },
      {
        value: "withData",
        text: "有检测数据报告"
      }
    ];
    function onReportTypeChange(e) {
      reportType.value = e.detail.value;
    }
    async function generateAcceptanceReport() {
      var _a, _b, _c, _d, _e, _f, _g;
      if (!selectedProjectId.value)
        return common_vendor.index.showModal({
          title: "提示",
          content: "请先选择项目",
          showCancel: false
        });
      if (!extractionOk.value)
        return common_vendor.index.showModal({
          title: "提示",
          content: "请先提取项目信息",
          showCancel: false
        });
      if (reportType.value === "withData" && !testReportFiles.value.length) {
        common_vendor.index.showToast({
          title: "有监测数据报告，必须要先上传监测报告",
          icon: "none"
        });
        return;
      }
      clearProgressTimer();
      taskProgressTitle.value = "竣工验收报告生成中";
      taskProgress.value = 0;
      taskState.value = "pending";
      (_a = taskProgressModal.value) == null ? void 0 : _a.open();
      try {
        await api_acceptance.generateReport({
          projectId: selectedProjectId.value,
          onProgress: (p, txt) => updateProgressSmooth(p, txt)
        });
        canDownloadReport.value = true;
        (_b = taskProgressModal.value) == null ? void 0 : _b.close();
        common_vendor.index.showToast({
          title: "生成成功，可下载报告",
          icon: "success"
        });
        previewTitle.value = "无监测数据的竣工验收报告已生成，请点击下载！";
        reportGenerated.value = true;
      } catch (e) {
        clearProgressTimer();
        (_c = taskProgressModal.value) == null ? void 0 : _c.close();
        common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:3501", "生成报告失败", e, (_d = e.response) == null ? void 0 : _d.data);
        let msg = e.message || "请稍后重试";
        if (Array.isArray((_f = (_e = e.response) == null ? void 0 : _e.data) == null ? void 0 : _f.detail)) {
          msg = e.response.data.detail.map((d) => d.msg).join("；");
        } else if (typeof ((_g = e.response) == null ? void 0 : _g.data) === "string") {
          msg = e.response.data;
        }
        common_vendor.index.showModal({
          title: "生成失败",
          content: msg,
          showCancel: false
        });
      }
    }
    async function downAcceptanceReport() {
      common_vendor.index.showLoading({
        title: "正在竣工验收报告…",
        mask: true
      });
      try {
        const {
          ab,
          filename
        } = await api_acceptance.downloadReport(selectedProjectId.value);
        await saveArrayBuffer(ab, filename);
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "已保存：" + filename,
          icon: "success"
        });
      } catch (e) {
        common_vendor.index.hideLoading();
        common_vendor.index.showModal({
          title: "下载失败",
          content: e.message,
          showCancel: false
        });
      }
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.unref(isMobile)
      }, common_vendor.unref(isMobile) ? {
        b: common_vendor.o(($event) => currentStep.value = $event),
        c: common_vendor.p({
          localdata: stepSelectOptions.value,
          placeholder: "选择步骤",
          modelValue: currentStep.value
        })
      } : {
        d: common_vendor.f(stepNames, (step, index, i0) => {
          return common_vendor.e({
            a: stepDone(index)
          }, stepDone(index) ? {} : {
            b: common_vendor.t(index + 1)
          }, {
            c: common_vendor.t(step),
            d: index < stepNames.length - 1
          }, index < stepNames.length - 1 ? {} : {}, {
            e: index,
            f: currentStep.value === index ? 1 : "",
            g: stepDone(index) ? 1 : "",
            h: currentStep.value === index,
            i: common_vendor.o(($event) => currentStep.value = index, index)
          });
        })
      }, {
        e: common_vendor.p({
          type: "folder-add",
          size: "20",
          color: "#166534"
        }),
        f: selectedProject.value
      }, selectedProject.value ? common_vendor.e({
        g: common_vendor.p({
          type: "folder",
          size: "20",
          color: "#166534"
        }),
        h: common_vendor.t(selectedProject.value.name),
        i: selectedProject.value.description
      }, selectedProject.value.description ? {
        j: common_vendor.t(selectedProject.value.description)
      } : {}) : {
        k: common_vendor.p({
          type: "folder-add",
          size: "20",
          color: "#9ca3af"
        })
      }, {
        l: common_vendor.p({
          type: "down",
          size: "16",
          color: "#6b7280"
        }),
        m: common_vendor.o(openProjectPicker),
        n: selectedProjectId.value && projectFiles.value.length > 0
      }, selectedProjectId.value && projectFiles.value.length > 0 ? {
        o: common_vendor.p({
          type: "paperclip",
          size: "18",
          color: "#166534"
        }),
        p: common_vendor.t(projectFiles.value.length),
        q: common_vendor.f(projectFiles.value, (file, k0, i0) => {
          return {
            a: "41308e16-7-" + i0 + ",41308e16-0",
            b: common_vendor.p({
              type: getFileIcon(file.file_extension),
              size: "20",
              color: "#166534"
            }),
            c: common_vendor.t(file.filename),
            d: common_vendor.t(formatFileSize(file.size_bytes)),
            e: common_vendor.t(formatFileStatus(file.status)),
            f: common_vendor.t(getStatusText(file.status)),
            g: common_vendor.n(getStatusClass(file.status)),
            h: file.document_id
          };
        })
      } : selectedProjectId.value && projectFiles.value.length === 0 ? {
        s: common_vendor.p({
          type: "folder-add",
          size: "48",
          color: "#cbd5e1"
        })
      } : {}, {
        r: selectedProjectId.value && projectFiles.value.length === 0,
        t: common_vendor.p({
          type: "search",
          size: "16",
          color: "#ffffff"
        }),
        v: common_vendor.o(simulateExtract),
        w: !selectedProjectId.value || projectFiles.value.length === 0,
        x: baseTable.value.length > 0
      }, baseTable.value.length > 0 ? {
        y: common_vendor.p({
          type: "trash",
          size: "16",
          color: "#dc2626"
        }),
        z: common_vendor.o(clearProjectCache)
      } : {}, {
        A: baseTable.value.length
      }, baseTable.value.length ? common_vendor.e({
        B: common_vendor.p({
          type: "list",
          size: "18",
          color: "#166534"
        }),
        C: common_vendor.p({
          type: "plus",
          size: "16",
          color: "#166534"
        }),
        D: common_vendor.o(openAddBase),
        E: selectMode.value
      }, selectMode.value ? {
        F: common_vendor.p({
          type: "trash",
          size: "16",
          color: "#ffffff"
        }),
        G: common_vendor.t(selectedIds.value.length),
        H: !selectedIds.value.length,
        I: common_vendor.o(removeSelected)
      } : {}, {
        J: common_vendor.p({
          type: selectMode.value ? "clear" : "checkbox",
          size: "16",
          color: "#155e3b"
        }),
        K: common_vendor.t(selectMode.value ? "取消" : "选择删除"),
        L: common_vendor.o(toggleSelectMode),
        M: common_vendor.f(baseTable.value, (item, idx, i0) => {
          return common_vendor.e({
            a: item.id === "pollutants_emission" && item.type === "table"
          }, item.id === "pollutants_emission" && item.type === "table" ? common_vendor.e({
            b: common_vendor.t(item.label),
            c: item.source === "extracted"
          }, item.source === "extracted" ? {} : {}, {
            d: item.value.水污染物 && item.value.水污染物.length
          }, item.value.水污染物 && item.value.水污染物.length ? {
            e: common_vendor.f(item.value.水污染物, (water, index, i1) => {
              return {
                a: common_vendor.t(water.污染物名称 || "未提取到相关信息"),
                b: common_vendor.t(water.污染因子 || "未提取到污染因子"),
                c: common_vendor.t(water.污染治理措施 || "未提取到相关信息"),
                d: common_vendor.t(water.排放去向 || "未提取到相关信息"),
                e: common_vendor.t(water.执行标准 || "未提取到相关信息"),
                f: "water-" + index
              };
            })
          } : {}, {
            f: item.value.大气污染物 && item.value.大气污染物.length
          }, item.value.大气污染物 && item.value.大气污染物.length ? {
            g: common_vendor.f(item.value.大气污染物, (air, index, i1) => {
              return {
                a: common_vendor.t(air.污染物名称 || "未提取到污染物名称"),
                b: common_vendor.t(air.污染因子 || "未提取到污染因子"),
                c: common_vendor.t(air.污染治理措施 || "未提取到污染治理措施"),
                d: common_vendor.t(air.排放去向 || "大气环境"),
                e: common_vendor.t(air.执行标准 || "未提取到执行标准"),
                f: "air-" + index
              };
            })
          } : {}, {
            h: item.value.噪声 && item.value.噪声.length
          }, item.value.噪声 && item.value.噪声.length ? {
            i: common_vendor.f(item.value.噪声, (noise, index, i1) => {
              return {
                a: common_vendor.t(noise.污染物名称 || "未提取到相关信息"),
                b: common_vendor.t(noise.污染因子 || "未提取到污染因子"),
                c: common_vendor.t(noise.污染治理措施 || "未提取到相关信息"),
                d: common_vendor.t(noise.排放去向 || "未提取到相关信息"),
                e: common_vendor.t(noise.执行标准 || "未提取到相关信息"),
                f: "noise-" + index
              };
            })
          } : {}, {
            j: selectMode.value
          }, selectMode.value ? {
            k: selectedIds.value.includes(item.id),
            l: common_vendor.o(() => toggleSelected(item.id), item.id)
          } : {}) : {}, {
            m: item.id === "pollutants_emission" && item.type === "table"
          }, item.id === "pollutants_emission" && item.type === "table" ? common_vendor.e({
            n: item.source === "extracted"
          }, item.source === "extracted" ? {} : {}, {
            o: item.value.固体废物 && item.value.固体废物.length
          }, item.value.固体废物 && item.value.固体废物.length ? {
            p: common_vendor.f(item.value.固体废物, (solid, index, i1) => {
              return {
                a: common_vendor.t(solid.废物来源 || "无"),
                b: common_vendor.t(solid.废物名称 || "无"),
                c: common_vendor.t(solid.危险特性 || "无"),
                d: common_vendor.t(solid.危险废物类别 || "无"),
                e: common_vendor.t(solid.污染治理措施 || "无"),
                f: "solid-" + index
              };
            })
          } : {}, {
            q: item.value.危险废物 && item.value.危险废物.length
          }, item.value.危险废物 && item.value.危险废物.length ? {
            r: common_vendor.f(item.value.危险废物, (solid, index, i1) => {
              return {
                a: common_vendor.t(solid.废物来源 || "无"),
                b: common_vendor.t(solid.废物名称 || "无"),
                c: common_vendor.t(solid.危险特性 || "无"),
                d: common_vendor.t(solid.危险废物类别 || "无"),
                e: common_vendor.t(solid.污染治理措施 || "无"),
                f: "hazard-" + index
              };
            })
          } : {}, {
            s: selectMode.value
          }, selectMode.value ? {
            t: selectedIds.value.includes(item.id),
            v: common_vendor.o(() => toggleSelected(item.id), item.id)
          } : {}) : common_vendor.e({
            w: common_vendor.t(item.label),
            x: item.source === "extracted"
          }, item.source === "extracted" ? {} : {}, {
            y: "41308e16-15-" + i0 + ",41308e16-0",
            z: common_vendor.o(($event) => item.value = $event, item.id),
            A: common_vendor.p({
              placeholder: "请输入具体的值",
              clearable: true,
              modelValue: item.value
            }),
            B: selectMode.value
          }, selectMode.value ? {
            C: selectedIds.value.includes(item.id),
            D: common_vendor.o(() => toggleSelected(item.id), item.id)
          } : {}), {
            E: item.id
          });
        }),
        N: common_vendor.p({
          type: "list",
          size: "18",
          color: "#fb923c"
        }),
        O: common_vendor.p({
          type: "eye-filled",
          size: "16",
          color: "#ffffff"
        }),
        P: common_vendor.o(() => {
          generateSignboard();
          showSignboard.value = true;
        }),
        Q: showSignboard.value
      }, showSignboard.value ? {
        R: common_vendor.p({
          type: "download-filled",
          size: "16",
          color: "#ffffff"
        }),
        S: common_vendor.o(downBiaoShi)
      } : {}, {
        T: showSignboard.value
      }, showSignboard.value ? {
        U: common_vendor.p({
          type: "redo-filled",
          size: "16",
          color: "#ffffff"
        }),
        V: common_vendor.o(($event) => currentStep.value = 1)
      } : {}, {
        W: showSignboard.value
      }, showSignboard.value ? {
        X: common_vendor.f(signboard.sections, (sec, si, i0) => {
          return common_vendor.e({
            a: common_vendor.t(sec.block),
            b: sec.block == "噪声"
          }, sec.block == "噪声" ? {
            c: "41308e16-20-" + i0 + ",41308e16-0",
            d: common_vendor.p({
              type: "plus",
              size: "16",
              color: "#166534"
            }),
            e: common_vendor.o(() => addSignItem(si), "s" + si)
          } : {}, {
            f: common_vendor.f(groupItems(sec.items, sec.block), (group, gi, i1) => {
              return common_vendor.e({
                a: common_vendor.f(group, (it, ii, i2) => {
                  return {
                    a: "41308e16-21-" + i0 + "-" + i1 + "-" + i2 + ",41308e16-0",
                    b: common_vendor.o(($event) => it.title = $event, "r" + si + "-" + gi + "-" + ii),
                    c: common_vendor.p({
                      placeholder: "内容标题",
                      modelValue: it.title
                    }),
                    d: "41308e16-22-" + i0 + "-" + i1 + "-" + i2 + ",41308e16-0",
                    e: common_vendor.o(($event) => it.content = $event, "r" + si + "-" + gi + "-" + ii),
                    f: common_vendor.p({
                      placeholder: "请输入具体的值",
                      modelValue: it.content
                    }),
                    g: "r" + si + "-" + gi + "-" + ii
                  };
                })
              }, sec.block !== "危险废物" ? {
                b: "41308e16-23-" + i0 + "-" + i1 + ",41308e16-0",
                c: common_vendor.p({
                  type: "trash",
                  size: "16",
                  color: "#d92d20"
                }),
                d: common_vendor.o(() => removeGroup(sec, gi), "g" + si + "-" + gi)
              } : {}, {
                e: "g" + si + "-" + gi
              });
            }),
            g: sec.block !== "危险废物",
            h: "s" + si
          });
        })
      } : {}) : {}, {
        Y: currentStep.value === 0,
        Z: common_vendor.p({
          type: "eye",
          size: "20",
          color: "#166534"
        }),
        aa: common_vendor.p({
          type: "eye",
          size: "48",
          color: "#cbd5e1"
        }),
        ab: common_vendor.p({
          type: "refresh-filled",
          size: "16",
          color: "#ffffff"
        }),
        ac: common_vendor.o(saveMonitorPlan),
        ad: canDownload.value
      }, canDownload.value ? {
        ae: common_vendor.p({
          type: "cloud-download-filled",
          size: "16",
          color: "#ffffff"
        }),
        af: common_vendor.o(downloadPlan)
      } : {}, {
        ag: plan.value
      }, plan.value ? {
        ah: common_vendor.p({
          type: "checkmark-circle",
          size: "18",
          color: "#166534"
        })
      } : {}, {
        ai: currentStep.value === 1,
        aj: tizidanItems.value.length === 0
      }, tizidanItems.value.length === 0 ? {
        ak: common_vendor.p({
          type: "refresh",
          size: "48",
          color: "#cbd5e1"
        }),
        al: common_vendor.p({
          type: "refresh",
          size: "16",
          color: "#ffffff"
        }),
        am: common_vendor.o(fetchTizidanData)
      } : {
        an: common_vendor.f(tizidanItems.value, (item, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(index + 1),
            b: common_vendor.t(item.text),
            c: common_vendor.t(item.submitted ? "已提交" : "未提交"),
            d: common_vendor.n(item.submitted ? "tizidan-submitted" : "tizidan-unsubmitted"),
            e: !item.submitted
          }, !item.submitted ? {
            f: common_vendor.o(($event) => uploadTizidanFile(index), index)
          } : {}, {
            g: item.submitted
          }, item.submitted ? {
            h: common_vendor.o(($event) => uploadTizidanFile(index), index)
          } : {}, {
            i: index
          });
        })
      }, {
        ao: common_vendor.o(downloadTizidanFile),
        ap: !selectedProjectId.value,
        aq: currentStep.value === 2,
        ar: common_vendor.p({
          type: "map-pin-ellipse",
          size: "20",
          color: "#166534"
        }),
        as: common_vendor.f(tabs, (tab, index, i0) => {
          return {
            a: common_vendor.t(tab),
            b: index,
            c: currentTab.value === index ? 1 : "",
            d: common_vendor.o(($event) => handleTabChange(index), index)
          };
        }),
        at: common_vendor.p({
          type: "list",
          size: "20",
          color: "#166534"
        }),
        av: selectModeMain.value
      }, selectModeMain.value ? {
        aw: common_vendor.p({
          type: "trash",
          size: "16",
          color: "#ffffff"
        }),
        ax: common_vendor.t(selectedMainIds.value.length),
        ay: !selectedMainIds.value.length,
        az: common_vendor.o(removeSelectedMain)
      } : {}, {
        aA: common_vendor.p({
          type: selectModeMain.value ? "clear" : "checkbox",
          size: "16",
          color: "#155e3b"
        }),
        aB: common_vendor.t(selectModeMain.value ? "取消" : "选择删除"),
        aC: common_vendor.o(toggleSelectModeMain),
        aD: mainContentTable.value.length
      }, mainContentTable.value.length ? {
        aE: common_vendor.f(mainContentTable.value, (item, idx, i0) => {
          return common_vendor.e({
            a: common_vendor.t(item.label),
            b: item.type === "image"
          }, item.type === "image" ? {
            c: "41308e16-35-" + i0 + ",41308e16-0",
            d: common_vendor.o(($event) => item.value = $event, item.id),
            e: common_vendor.p({
              fileMediatype: "image",
              mode: "grid",
              limit: 9,
              ["auto-upload"]: false,
              modelValue: item.value
            })
          } : {
            f: "41308e16-36-" + i0 + ",41308e16-0",
            g: common_vendor.o(($event) => item.value = $event, item.id),
            h: common_vendor.p({
              placeholder: "请输入具体的值",
              clearable: true,
              modelValue: item.value
            })
          }, selectModeMain.value ? {
            i: selectedMainIds.value.includes(item.id),
            j: common_vendor.o(() => toggleSelectedMain(item.id), item.id)
          } : {}, {
            k: item.id
          });
        }),
        aF: selectModeMain.value
      } : {
        aG: common_vendor.p({
          type: "list",
          size: "48",
          color: "#cbd5e1"
        })
      }, {
        aH: currentTab.value === 0,
        aI: common_vendor.p({
          type: "gear",
          size: "20",
          color: "#166534"
        }),
        aJ: common_vendor.o(onEquipmentSearchInput),
        aK: common_vendor.o(($event) => equipmentSearchKeyword.value = $event),
        aL: common_vendor.p({
          placeholder: "搜索设备名称、数量或备注...",
          prefixIcon: "search",
          clearable: true,
          modelValue: equipmentSearchKeyword.value
        }),
        aM: equipmentSearchKeyword.value
      }, equipmentSearchKeyword.value ? {
        aN: common_vendor.t(filteredEquipmentList.value.length)
      } : {}, {
        aO: common_vendor.p({
          type: "plus",
          size: "16",
          color: "#166534"
        }),
        aP: common_vendor.o(addEquipment),
        aQ: common_vendor.p({
          type: loadingEquipment.value ? "spinner-cycle" : "refresh",
          size: "16",
          color: "#ffffff"
        }),
        aR: common_vendor.t(loadingEquipment.value ? "加载中..." : "刷新数据"),
        aS: common_vendor.o(fetchEquipmentData),
        aT: loadingEquipment.value,
        aU: loadingEquipment.value
      }, loadingEquipment.value ? {
        aV: common_vendor.p({
          type: "spinner-cycle",
          size: "48",
          color: "#166534"
        })
      } : fetchEquipmentError.value ? {
        aX: common_vendor.p({
          type: "close-circle",
          size: "48",
          color: "#dc2626"
        }),
        aY: common_vendor.t(fetchEquipmentError.value),
        aZ: common_vendor.o(fetchEquipmentData)
      } : filteredEquipmentList.value.length ? {
        bb: common_vendor.f(filteredEquipmentList.value, (item, index, i0) => {
          return {
            a: "41308e16-44-" + i0 + ",41308e16-0",
            b: common_vendor.o(($event) => item.name = $event, item.id),
            c: common_vendor.p({
              placeholder: "请输入设备名称",
              clearable: true,
              modelValue: item.name
            }),
            d: "41308e16-45-" + i0 + ",41308e16-0",
            e: common_vendor.o(($event) => item.quantity = $event, item.id),
            f: common_vendor.p({
              placeholder: "数量",
              clearable: true,
              modelValue: item.quantity
            }),
            g: "41308e16-46-" + i0 + ",41308e16-0",
            h: common_vendor.o(($event) => item.remark = $event, item.id),
            i: common_vendor.p({
              placeholder: "备注信息",
              clearable: true,
              modelValue: item.remark
            }),
            j: "41308e16-47-" + i0 + ",41308e16-0",
            k: common_vendor.o(($event) => item.images = $event, item.id),
            l: common_vendor.p({
              fileMediatype: "image",
              mode: "grid",
              limit: 3,
              ["auto-upload"]: false,
              modelValue: item.images
            }),
            m: common_vendor.t(index + 1),
            n: "41308e16-48-" + i0 + ",41308e16-0",
            o: common_vendor.o(() => removeEquipment(index), item.id),
            p: item.id
          };
        }),
        bc: common_vendor.p({
          type: "trash",
          size: "16",
          color: "#ef4444"
        })
      } : {
        bd: common_vendor.p({
          type: equipmentSearchKeyword.value ? "search" : "gear",
          size: "48",
          color: "#cbd5e1"
        }),
        be: common_vendor.t(equipmentSearchKeyword.value ? "未找到匹配的设备" : "暂无设备信息"),
        bf: common_vendor.t(equipmentSearchKeyword.value ? "试试其他关键词或清空搜索" : "点击新增按钮添加设备，或刷新数据从接口获取")
      }, {
        aW: fetchEquipmentError.value,
        ba: filteredEquipmentList.value.length,
        bg: currentTab.value === 1,
        bh: common_vendor.p({
          type: "flag",
          size: "20",
          color: "#166534"
        }),
        bi: common_vendor.p({
          type: "plus",
          size: "16",
          color: "#166534"
        }),
        bj: common_vendor.o(addPollutionFacility),
        bk: pollutionFacilityList.value.length
      }, pollutionFacilityList.value.length ? {
        bl: common_vendor.f(pollutionFacilityList.value, (item, index, i0) => {
          return {
            a: "41308e16-52-" + i0 + ",41308e16-0",
            b: common_vendor.o(($event) => item.name = $event, item.id),
            c: common_vendor.p({
              placeholder: "请输入设施名称",
              clearable: true,
              modelValue: item.name
            }),
            d: "41308e16-53-" + i0 + ",41308e16-0",
            e: common_vendor.o(($event) => item.quantity = $event, item.id),
            f: common_vendor.p({
              placeholder: "数量",
              clearable: true,
              modelValue: item.quantity
            }),
            g: "41308e16-54-" + i0 + ",41308e16-0",
            h: common_vendor.o(($event) => item.remark = $event, item.id),
            i: common_vendor.p({
              placeholder: "备注信息",
              clearable: true,
              modelValue: item.remark
            }),
            j: "41308e16-55-" + i0 + ",41308e16-0",
            k: common_vendor.o(($event) => item.images = $event, item.id),
            l: common_vendor.p({
              fileMediatype: "image",
              mode: "grid",
              limit: 3,
              ["auto-upload"]: false,
              modelValue: item.images
            }),
            m: common_vendor.t(index + 1),
            n: "41308e16-56-" + i0 + ",41308e16-0",
            o: common_vendor.o(() => removePollutionFacility(index), item.id),
            p: item.id
          };
        }),
        bm: common_vendor.p({
          type: "trash",
          size: "16",
          color: "#ef4444"
        })
      } : {
        bn: common_vendor.p({
          type: "flag",
          size: "48",
          color: "#cbd5e1"
        })
      }, {
        bo: currentTab.value === 2,
        bp: common_vendor.p({
          type: "water",
          size: "20",
          color: "#166534"
        }),
        bq: common_vendor.p({
          type: "eye-filled",
          size: "16",
          color: "#ffffff"
        }),
        br: common_vendor.o(() => {
          generateSignboard();
          showSignboard.value = true;
        }),
        bs: showSignboard.value
      }, showSignboard.value ? {
        bt: common_vendor.f(signboard.sections, (sec, si, i0) => {
          return common_vendor.e({
            a: common_vendor.t(sec.block),
            b: sec.block == "噪声"
          }, sec.block == "噪声" ? {
            c: "41308e16-60-" + i0 + ",41308e16-0",
            d: common_vendor.p({
              type: "plus",
              size: "16",
              color: "#166534"
            }),
            e: common_vendor.o(() => addSignItem(si), "s" + si)
          } : {}, {
            f: common_vendor.f(groupItems(sec.items, sec.block), (group, gi, i1) => {
              return common_vendor.e({
                a: common_vendor.f(group, (it, ii, i2) => {
                  return {
                    a: "41308e16-61-" + i0 + "-" + i1 + "-" + i2 + ",41308e16-0",
                    b: common_vendor.o(($event) => it.title = $event, "r" + si + "-" + gi + "-" + ii),
                    c: common_vendor.p({
                      placeholder: "内容标题",
                      modelValue: it.title
                    }),
                    d: "41308e16-62-" + i0 + "-" + i1 + "-" + i2 + ",41308e16-0",
                    e: common_vendor.o(($event) => it.content = $event, "r" + si + "-" + gi + "-" + ii),
                    f: common_vendor.p({
                      placeholder: "请输入具体的值",
                      modelValue: it.content
                    }),
                    g: "r" + si + "-" + gi + "-" + ii
                  };
                })
              }, sec.block !== "危险废物" ? {
                b: "41308e16-63-" + i0 + "-" + i1 + ",41308e16-0",
                c: common_vendor.p({
                  type: "trash",
                  size: "16",
                  color: "#d92d20"
                }),
                d: common_vendor.o(() => removeGroup(sec, gi), "g" + si + "-" + gi)
              } : {}, {
                e: "g" + si + "-" + gi
              });
            }),
            g: sec.block !== "危险废物",
            h: "s" + si
          });
        })
      } : {
        bv: common_vendor.p({
          type: "water",
          size: "48",
          color: "#cbd5e1"
        })
      }, {
        bw: currentTab.value === 3,
        bx: common_vendor.p({
          type: "list",
          size: "18",
          color: "#166534"
        }),
        by: common_vendor.p({
          type: "gear",
          size: "16",
          color: "#ffffff"
        }),
        bz: common_vendor.o(generateFieldworkComparison),
        bA: currentStep.value === 3,
        bB: common_vendor.p({
          type: "calendar",
          size: "20",
          color: "#166534"
        }),
        bC: common_vendor.f(reportTypes, (type, k0, i0) => {
          return {
            a: type.value,
            b: reportType.value === type.value,
            c: common_vendor.t(type.text),
            d: type.value
          };
        }),
        bD: common_vendor.o(onReportTypeChange),
        bE: reportType.value === "withData"
      }, reportType.value === "withData" ? {
        bF: common_vendor.o(($event) => testReportFiles.value = $event),
        bG: common_vendor.p({
          fileMediatype: "all",
          ["auto-upload"]: false,
          limit: 3,
          modelValue: testReportFiles.value
        })
      } : {}, {
        bH: common_vendor.p({
          type: "refresh-filled",
          size: "16",
          color: "#ffffff"
        }),
        bI: common_vendor.o(generateAcceptanceReport),
        bJ: canDownloadReport.value
      }, canDownloadReport.value ? {
        bK: common_vendor.p({
          type: "cloud-download-filled",
          size: "16",
          color: "#ffffff"
        }),
        bL: common_vendor.o(downAcceptanceReport)
      } : {}, {
        bM: reportGenerated.value
      }, reportGenerated.value ? common_vendor.e({
        bN: common_vendor.p({
          type: "checkmarkempty",
          size: "18",
          color: "#166534"
        }),
        bO: common_vendor.t(previewTitle.value),
        bP: reportType.value === "withData"
      }, reportType.value === "withData" ? {} : {}) : {}, {
        bQ: currentStep.value === 4,
        bR: common_vendor.p({
          type: "left",
          size: "16",
          color: "#5b6b7b"
        }),
        bS: currentStep.value === 0,
        bT: common_vendor.o(prevStep),
        bU: common_vendor.p({
          type: "right",
          size: "16",
          color: "#ffffff"
        }),
        bV: currentStep.value === stepNames.length - 1,
        bW: common_vendor.o(nextStep),
        bX: common_vendor.p({
          current: "pages/reports/acceptance/index"
        }),
        bY: common_vendor.o(($event) => newBaseInfoLabel.value = $event),
        bZ: common_vendor.p({
          placeholder: "如：项目名称/单位名称",
          modelValue: newBaseInfoLabel.value
        }),
        ca: common_vendor.o(closeBaseInfo),
        cb: common_vendor.o(confirmAddBaseInfo),
        cc: common_vendor.sr(newBaseInfoPopup, "41308e16-74", {
          "k": "newBaseInfoPopup"
        }),
        cd: common_vendor.p({
          type: "center"
        }),
        ce: common_vendor.sr(taskProgressModal, "41308e16-76", {
          "k": "taskProgressModal"
        }),
        cf: common_vendor.p({
          title: taskProgressTitle.value,
          progress: taskProgress.value,
          statusText: taskStatusText.value,
          state: taskState.value,
          cancelable: false
        }),
        cg: common_vendor.p({
          type: "close",
          size: "20",
          color: "#6b7280"
        }),
        ch: common_vendor.o(closeProjectPicker),
        ci: common_vendor.o(onSearchInput),
        cj: common_vendor.o(($event) => projectSearchKeyword.value = $event),
        ck: common_vendor.p({
          placeholder: "搜索项目名称...",
          prefixIcon: "search",
          clearable: true,
          modelValue: projectSearchKeyword.value
        }),
        cl: common_vendor.t(filteredProjects.value.length),
        cm: projectSearchKeyword.value
      }, projectSearchKeyword.value ? {} : {}, {
        cn: common_vendor.f(filteredProjects.value, (project, k0, i0) => {
          return common_vendor.e({
            a: "41308e16-80-" + i0 + ",41308e16-77",
            b: common_vendor.p({
              type: "folder",
              size: "22",
              color: selectedProjectId.value === project.id ? "#166534" : "#6b7280"
            }),
            c: common_vendor.t(project.name),
            d: project.description
          }, project.description ? {
            e: common_vendor.t(project.description)
          } : {}, {
            f: project.folder_name
          }, project.folder_name ? {
            g: "41308e16-81-" + i0 + ",41308e16-77",
            h: common_vendor.p({
              type: "calendar",
              size: "14",
              color: "#9ca3af"
            }),
            i: common_vendor.t(project.folder_name)
          } : {}, {
            j: selectedProjectId.value === project.id
          }, selectedProjectId.value === project.id ? {
            k: "41308e16-82-" + i0 + ",41308e16-77",
            l: common_vendor.p({
              type: "checkmarkempty",
              size: "18",
              color: "#ffffff"
            })
          } : {
            m: "41308e16-83-" + i0 + ",41308e16-77",
            n: common_vendor.p({
              type: "right",
              size: "16",
              color: "#d1d5db"
            })
          }, {
            o: project.id,
            p: selectedProjectId.value === project.id ? 1 : "",
            q: common_vendor.o(($event) => selectProject(project), project.id)
          });
        }),
        co: filteredProjects.value.length === 0
      }, filteredProjects.value.length === 0 ? common_vendor.e({
        cp: common_vendor.p({
          type: "search",
          size: "48",
          color: "#cbd5e1"
        }),
        cq: common_vendor.t(projectSearchKeyword.value ? "未找到匹配的项目" : "暂无项目"),
        cr: projectSearchKeyword.value
      }, projectSearchKeyword.value ? {} : {}) : {}, {
        cs: common_vendor.sr(projectPickerPopup, "41308e16-77", {
          "k": "projectPickerPopup"
        }),
        ct: common_vendor.p({
          type: "center",
          ["mask-click"]: true
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-41308e16"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/reports/acceptance/index.js.map
