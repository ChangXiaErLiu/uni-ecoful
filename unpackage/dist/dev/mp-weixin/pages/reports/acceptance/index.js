"use strict";
const common_vendor = require("../../../common/vendor.js");
const utils_platform = require("../../../utils/platform.js");
const composables_useFieldSurveyData = require("../../../composables/useFieldSurveyData.js");
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
  (_easycom_uni_data_select + _easycom_uni_icons + _easycom_uni_easyinput + FieldSurveyContainer + _easycom_uni_file_picker + AppLayout + _easycom_uni_popup + TaskProgressModal)();
}
const AppLayout = () => "../../../components/layout/AppLayout.js";
const TaskProgressModal = () => "../../../components/message-pop-up/TaskProgressModal.js";
const FieldSurveyContainer = () => "../../../components/field-survey/FieldSurveyContainer.js";
const MAX_POLLING_COUNT = 100;
const POLLING_INTERVAL = 3e3;
const eco_baseUrl = "http://172.16.1.61:8000";
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
          return fieldSurveyData.fieldworkComparison.value.length > 0;
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
        common_vendor.index.__f__("warn", "at pages/reports/acceptance/index.vue:1302", "⚠️ 保存项目选择失败:", e);
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
      common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1331", "搜索关键词:", projectSearchKeyword.value);
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
        common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1353", "⚠️ 已在轮询中，跳过");
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
          common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1372", "⏰ 达到最大轮询次数，停止轮询");
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
            common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1388", "✅ 所有文件处理完成，停止轮询");
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
          common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:1405", "❌ 轮询文件状态失败:", error);
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
        common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:1434", "加载项目列表失败:", error);
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
        common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:1483", "加载项目文件失败:", error);
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
          common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1575", `✅ 已加载项目 ${projectId} 的缓存数据`);
          fieldSurveyData.extractFacilitiesFromBaseTable(projectId, baseTable.value);
          common_vendor.index.showToast({
            title: "已加载缓存数据",
            icon: "success",
            duration: 1500
          });
        } catch (error) {
          common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:1586", "解析缓存数据失败:", error);
          baseTable.value = [];
          extractionOk.value = false;
        }
      } else {
        baseTable.value = [];
        extractionOk.value = false;
        common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1594", `ℹ️ 项目 ${projectId} 暂无缓存数据`);
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
            common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1634", `🗑️ 已清除项目缓存和选择`);
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
            common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1657", "🔄 恢复上次选择的项目:", project.name);
            selectedProjectId.value = project.id;
            selectedProject.value = project;
            await loadProjectFiles(project.id);
            startPollingFileStatus(project.id);
            loadProjectCache(project.id);
          } else {
            common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1672", "⚠️ 上次选择的项目已不存在，清除缓存");
            common_vendor.index.removeStorageSync("acceptance_project_id");
            common_vendor.index.removeStorageSync("acceptance_project_info");
          }
        }
      } catch (e) {
        common_vendor.index.__f__("warn", "at pages/reports/acceptance/index.vue:1678", "⚠️ 恢复项目选择失败:", e);
      }
    });
    common_vendor.onUnmounted(() => {
      stopPolling();
      common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1685", "📄 页面卸载，清理轮询定时器");
    });
    common_vendor.watch(selectedProjectId, (newId, oldId) => {
      if (oldId && newId !== oldId) {
        stopPolling();
        common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1692", "🔄 切换项目，停止旧项目的轮询");
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
        common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1723", `[进度真实更新] ${newProgress}% - ${statusText}`);
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
        common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1873", `✅ 项目 ${selectedProjectId.value} 的数据已缓存`);
        fieldSurveyData.extractFacilitiesFromPollutants(baseTable.value);
        extractionOk.value = true;
      } catch (error) {
        clearProgressTimer();
        (_b = taskProgressModal.value) == null ? void 0 : _b.close();
        common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:1887", "[Extract] 提取失败:", error);
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
      const HAZ_MAP = {
        // 只要和原始字段里出现过的英文括号写法完全一致，都要写进去
        "T（毒性）": "毒性",
        "T": "毒性",
        "毒性": "毒性",
        "In（感染性）": "感染性",
        "In": "感染性",
        "感染性": "感染性",
        "C（腐蚀性）": "腐蚀性",
        "C": "腐蚀性",
        "腐蚀性": "腐蚀性",
        "I（易燃性）": "易燃性",
        "I": "易燃性",
        "易燃性": "易燃性",
        "R（反应性）": "反应性",
        "R": "反应性",
        "反应性": "反应性"
      };
      function extractHazardCodes(str) {
        if (!str)
          return "";
        const set = new Set((str.match(/HW\d+/g) || []).map((s) => s.trim()));
        return [...set].join("、");
      }
      function extractHazardProperties(str) {
        if (!str)
          return "";
        const set = /* @__PURE__ */ new Set();
        const norm = str.replace(/[、,，]/g, "/");
        norm.split("/").forEach((s) => {
          const key = s.trim();
          if (HAZ_MAP[key])
            set.add(HAZ_MAP[key]);
        });
        const order = ["毒性", "腐蚀性", "易燃性", "反应性", "感染性"];
        return order.filter((ch) => set.has(ch)).join("、");
      }
      const hwList = emissionData["危险废物"] || [];
      function collectUnique(arr, key, extractor) {
        const set = /* @__PURE__ */ new Set();
        arr.forEach((it) => {
          const raw = it[key] || "";
          const cleaned = extractor ? extractor(raw) : raw.trim();
          if (cleaned)
            set.add(cleaned);
        });
        return [...set];
      }
      const categories = collectUnique(hwList, "危险废物类别", extractHazardCodes);
      const wasteNames = collectUnique(hwList, "废物名称", (s) => s.trim());
      const hazards = collectUnique(hwList, "危险特性", extractHazardProperties);
      const WFItems = [
        {
          title: "主要成分",
          content: categories.join("、") || "HW49"
        },
        {
          title: "化学名称",
          content: wasteNames.join("、") || "实验室废弃物、实验室废水污泥、医疗废物、废活性炭"
        },
        {
          title: "危险情况",
          content: hazards.join("、") || "毒性、腐蚀性"
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
    const project_id = common_vendor.index.getStorageSync("acceptance_project_id");
    const userInfoStr = common_vendor.index.getStorageSync("userInfo");
    const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
    const user_id = (userInfo == null ? void 0 : userInfo.id) || (userInfo == null ? void 0 : userInfo.user_id);
    common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:2532", "test userid", user_id);
    common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:2533", "test project_id", project_id);
    const tizidanItems = common_vendor.ref([]);
    common_vendor.ref({});
    async function toggleRequired(item) {
      var _a;
      if (!item || !item.record_id) {
        common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:2559", "切换复选框失败：item或record_id不存在");
        return;
      }
      try {
        const newRequired = !item.required;
        item.required = newRequired;
        common_vendor.index.showLoading({
          title: "保存中...",
          mask: true
        });
        const response = await new Promise((resolve, reject) => {
          common_vendor.index.request({
            url: eco_baseUrl + "/api/v1/completion/tzdDetail/update_require",
            method: "POST",
            header: {
              "Content-Type": "application/json"
            },
            data: {
              record_id: item.record_id,
              is_require: newRequired ? 1 : 0,
              user_id,
              project_id
            },
            success: (res) => {
              common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:2589", "更新is_require成功:", res);
              resolve(res);
            },
            fail: (err) => {
              common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:2593", "更新is_require失败:", err);
              reject(err);
            }
          });
        });
        if (response.statusCode === 200 && response.data.success) {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: newRequired ? "已标记为需要" : "已标记为不需要",
            icon: "success",
            duration: 1500
          });
        } else {
          throw new Error(((_a = response.data) == null ? void 0 : _a.message) || "更新失败");
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:2613", "切换复选框失败:", error);
        common_vendor.index.hideLoading();
        item.required = !item.required;
        common_vendor.index.showToast({
          title: `保存失败: ${error.message}`,
          icon: "none",
          duration: 2e3
        });
      }
    }
    function getItemsByLevel1(level1Name) {
      return tizidanItems.value.filter((item) => item.level1_name === level1Name);
    }
    function hasItemsByLevel1(level1Name) {
      return tizidanItems.value.some((item) => item.level1_name === level1Name);
    }
    function getSectionNumber(level1Name) {
      const level1Names = [
        "项目历史以来环评报告及批复",
        "项目相关环保验收资料",
        "（房地产项目提供）房地产相关证件",
        "污染治理设施设计方案",
        "厂区总平面图及各层平面图（CAD版本）",
        "厂区排水设计图（CAD版本）",
        "排污许可证",
        "排水许可证",
        "危废处置协议及相应处置资质",
        "其他需要提供的资料"
      ];
      return level1Names.indexOf(level1Name) + 1;
    }
    function getItemNumber(item) {
      const level1Name = item.level1_name;
      const level2Name = item.level2_name || "";
      if (level1Name === "项目历史以来环评报告及批复") {
        if (level2Name.includes("环评报告"))
          return "1-1";
        if (level2Name.includes("批复"))
          return "1-2";
      } else if (level1Name === "项目相关环保验收资料") {
        return "2";
      } else if (level1Name === "（房地产项目提供）房地产相关证件") {
        if (level2Name.includes("施工证"))
          return "3-1";
        if (level2Name.includes("规划许可证"))
          return "3-2";
        if (level2Name.includes("规划验收合格证"))
          return "3-3";
      } else {
        return getSectionNumber(level1Name);
      }
      return getSectionNumber(level1Name);
    }
    function getItemTitle(item) {
      if (item.level2_name && item.level2_name.trim()) {
        return item.level2_name;
      }
      return item.level1_name;
    }
    function getItemFiles(item) {
      const level1Name = item.level1_name;
      const level2Name = item.level2_name || "";
      if (level1Name === "项目历史以来环评报告及批复") {
        if (level2Name.includes("环评报告")) {
          return item.files1_1 || [];
        }
        if (level2Name.includes("批复")) {
          return item.files1_2 || [];
        }
      } else if (level1Name === "（房地产项目提供）房地产相关证件") {
        if (level2Name.includes("施工证")) {
          return item.files3_1 || [];
        }
        if (level2Name.includes("规划许可证")) {
          return item.files3_2 || [];
        }
        if (level2Name.includes("规划验收合格证")) {
          return item.files3_3 || [];
        }
      }
      return item.files || [];
    }
    function getFileKey(item) {
      const level1Name = item.level1_name;
      const level2Name = item.level2_name || "";
      if (level1Name === "项目历史以来环评报告及批复") {
        if (level2Name.includes("环评报告"))
          return "1_1";
        if (level2Name.includes("批复"))
          return "1_2";
      } else if (level1Name === "（房地产项目提供）房地产相关证件") {
        if (level2Name.includes("施工证"))
          return "3_1";
        if (level2Name.includes("规划许可证"))
          return "3_2";
        if (level2Name.includes("规划验收合格证"))
          return "3_3";
      }
      return null;
    }
    function getSubmittedStatus(item) {
      const level1Name = item.level1_name;
      const level2Name = item.level2_name || "";
      if (level1Name === "项目历史以来环评报告及批复") {
        if (level2Name.includes("环评报告")) {
          return item.submitted1_1 || false;
        }
        if (level2Name.includes("批复")) {
          return item.submitted1_2 || false;
        }
      } else if (level1Name === "（房地产项目提供）房地产相关证件") {
        if (level2Name.includes("施工证")) {
          return item.submitted3_1 || false;
        }
        if (level2Name.includes("规划许可证")) {
          return item.submitted3_2 || false;
        }
        if (level2Name.includes("规划验收合格证")) {
          return item.submitted3_3 || false;
        }
      }
      return item.submitted || false;
    }
    async function uploadTizidanFile(recordId, subType = null) {
      if (!recordId) {
        common_vendor.index.showToast({
          title: "记录ID不存在",
          icon: "none"
        });
        return;
      }
      common_vendor.index.chooseFile({
        count: 9,
        extension: [
          ".doc",
          ".docx",
          ".pdf",
          ".xls",
          ".xlsx",
          ".png",
          ".jpg",
          ".jpeg",
          ".zip",
          ".rar",
          ".dwg",
          ".dxf"
        ],
        success: async (chooseRes) => {
          const tempFiles = chooseRes.tempFiles;
          for (let i = 0; i < tempFiles.length; i++) {
            await uploadSingleFile(recordId, subType, tempFiles[i]);
          }
          await fetchTizidanData();
          common_vendor.index.showToast({
            title: `已成功上传${tempFiles.length}个文件`,
            icon: "success",
            duration: 3e3
          });
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:2895", "选择文件失败:", err);
          common_vendor.index.showToast({
            title: "选择文件失败",
            icon: "none"
          });
        }
      });
    }
    async function deleteTizidanFile(recordId, subType, fileIndex) {
      const item = tizidanItems.value.find((item2) => item2.record_id === recordId);
      if (!item) {
        common_vendor.index.showToast({
          title: "记录不存在",
          icon: "none"
        });
        return;
      }
      const files = getItemFiles(item);
      if (fileIndex >= files.length) {
        common_vendor.index.showToast({
          title: "文件不存在",
          icon: "none"
        });
        return;
      }
      const fileName = files[fileIndex].name;
      common_vendor.index.showModal({
        title: "确认删除",
        content: `确定要删除文件 "${fileName}" 吗？删除后不可恢复。`,
        success: async (res) => {
          var _a;
          if (res.confirm) {
            common_vendor.index.showLoading({
              title: "删除中..."
            });
            try {
              const response = await new Promise((resolve, reject) => {
                common_vendor.index.request({
                  url: eco_baseUrl + "/api/v1/completion/tzdDetail/delete_file_by_id",
                  method: "POST",
                  header: {
                    "Content-Type": "application/json"
                  },
                  data: {
                    record_id: recordId,
                    file_name: fileName,
                    user_id,
                    project_id
                  },
                  success: (res2) => resolve(res2),
                  fail: (err) => reject(err)
                });
              });
              if (response.statusCode === 200 && response.data.success) {
                await fetchTizidanData();
                common_vendor.index.showToast({
                  title: "文件删除成功",
                  icon: "success"
                });
              } else {
                throw new Error(((_a = response.data) == null ? void 0 : _a.message) || "删除失败");
              }
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:2970", "删除文件失败:", error);
              common_vendor.index.showToast({
                title: `删除失败: ${error.message}`,
                icon: "none"
              });
            } finally {
              common_vendor.index.hideLoading();
            }
          }
        }
      });
    }
    async function fetchTizidanData() {
      try {
        common_vendor.index.showLoading({
          title: "加载中..."
        });
        const response = await new Promise((resolve, reject) => {
          common_vendor.index.request({
            url: eco_baseUrl + "/api/v1/completion/tzdDetail/datasheet",
            method: "GET",
            data: {
              user_id,
              project_id
            },
            success: (res) => {
              common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:2999", "请求成功:", res);
              resolve(res);
            },
            fail: (err) => {
              common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:3003", "请求失败:", err);
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
          common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:3019", "提资单数据加载完成:", tizidanItems.value);
          common_vendor.index.showToast({
            title: "数据加载成功",
            icon: "success"
          });
        } else {
          throw new Error(`请求失败，状态码：${(response == null ? void 0 : response.statusCode) || "未知"}`);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:3029", "获取提资单数据失败:", error);
        common_vendor.index.showToast({
          title: "加载失败，请重新刷新！",
          icon: "none",
          duration: 3e3
        });
        tizidanItems.value = [];
      } finally {
        common_vendor.index.hideLoading();
      }
    }
    async function uploadSingleFile(recordId, subType, file) {
      common_vendor.index.showLoading({
        title: "上传文件中...",
        mask: true
      });
      try {
        const response = await new Promise((resolve, reject) => {
          common_vendor.index.uploadFile({
            url: eco_baseUrl + "/api/v1/completion/tzdDetail/upload_file_by_id",
            filePath: file.path,
            name: "file",
            formData: {
              record_id: recordId,
              user_id,
              project_id
            },
            success: (uploadRes) => {
              if (uploadRes.statusCode === 200) {
                try {
                  const data = JSON.parse(uploadRes.data);
                  resolve(data);
                } catch (e) {
                  reject(new Error("解析响应失败"));
                }
              } else {
                reject(new Error(`上传失败，状态码：${uploadRes.statusCode}`));
              }
            },
            fail: (err) => {
              reject(new Error("网络请求失败"));
            }
          });
        });
        if (!response.success) {
          throw new Error(response.message || "文件上传失败");
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:3084", `文件上传失败:`, error);
        common_vendor.index.showToast({
          title: `文件上传失败: ${error.message}`,
          icon: "none",
          duration: 3e3
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    }
    async function submitOtherMaterials(recordId) {
      const itemIndex = tizidanItems.value.findIndex((item2) => item2.record_id === recordId);
      if (itemIndex === -1) {
        common_vendor.index.showToast({
          title: "项目不存在",
          icon: "none"
        });
        return;
      }
      const item = tizidanItems.value[itemIndex];
      const memoContent = item.customText || "";
      if (!memoContent.trim()) {
        common_vendor.index.showToast({
          title: "请输入其他需要提供的资料",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showLoading({
        title: "提交中...",
        mask: true
      });
      try {
        const response = await new Promise((resolve, reject) => {
          common_vendor.index.request({
            url: eco_baseUrl + "/api/v1/completion/tzdDetail/update_memo",
            method: "POST",
            header: {
              "Content-Type": "application/json"
            },
            data: {
              record_id: recordId,
              memo: memoContent,
              user_id,
              project_id
            },
            success: (res) => resolve(res),
            fail: (err) => reject(err)
          });
        });
        if (response.statusCode === 200) {
          const data = response.data;
          if (data.success) {
            item.submitted = true;
            item.memo = memoContent;
            common_vendor.index.showToast({
              title: "提交成功",
              icon: "success",
              duration: 2e3
            });
            setTimeout(() => {
              fetchTizidanData();
            }, 1e3);
          } else {
            throw new Error(data.message || "提交失败");
          }
        } else if (response.statusCode === 422) {
          const errorData = response.data || {};
          let errorMsg = "提交失败: 数据格式错误";
          if (errorData.detail) {
            if (Array.isArray(errorData.detail)) {
              errorMsg = errorData.detail.map((d) => d.msg).join("; ");
            } else if (typeof errorData.detail === "string") {
              errorMsg = errorData.detail;
            }
          }
          throw new Error(errorMsg);
        } else {
          throw new Error(`服务器错误: ${response.statusCode}`);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:3181", "提交失败:", error);
        common_vendor.index.showToast({
          title: `提交失败: ${error.message}`,
          icon: "none",
          duration: 3e3
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    }
    common_vendor.ref({
      TiZiDan_Doc: "",
      comparison_list: ""
    });
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
        const url = eco_baseUrl + `/api/v1/completion/tzdDetail/download_tzd_doc?user_id=${user_id}&project_id=${project_id}`;
        const downloadTask = common_vendor.index.downloadFile({
          url,
          success: (res) => {
            if (res.statusCode === 200) {
              const filePath = res.tempFilePath;
              common_vendor.index.saveFile({
                tempFilePath: filePath,
                success: (saveRes) => {
                  common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:3254", "文件保存成功:", saveRes.savedFilePath);
                  common_vendor.index.showToast({
                    title: "文件已保存",
                    icon: "success"
                  });
                },
                fail: (saveErr) => {
                  common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:3261", "保存文件失败:", saveErr);
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
        common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:3304", "下载失败:", error);
        common_vendor.index.showToast({
          title: "下载失败: " + (error.message || "未知错误"),
          icon: "none",
          duration: 3e3
        });
      } finally {
        common_vendor.index.hideLoading();
      }
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
    const fieldSurveyData = composables_useFieldSurveyData.useFieldSurveyData();
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
        common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:3602", "生成报告失败", e, (_d = e.response) == null ? void 0 : _d.data);
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
        aj: common_vendor.p({
          type: "list",
          size: "20",
          color: "#166534"
        }),
        ak: tizidanItems.value.length === 0
      }, tizidanItems.value.length === 0 ? {
        al: common_vendor.p({
          type: "refresh",
          size: "48",
          color: "#cbd5e1"
        }),
        am: common_vendor.p({
          type: "refresh",
          size: "16",
          color: "#ffffff"
        }),
        an: common_vendor.o(fetchTizidanData)
      } : common_vendor.e({
        ao: common_vendor.f(getItemsByLevel1("项目历史以来环评报告及批复"), (item, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(getItemNumber(item)),
            b: common_vendor.t(getItemTitle(item)),
            c: item.required,
            d: common_vendor.o(() => toggleRequired(item), item.record_id),
            e: item.required
          }, item.required ? common_vendor.e({
            f: getItemFiles(item).length > 0
          }, getItemFiles(item).length > 0 ? {
            g: "41308e16-32-" + i0 + ",41308e16-0",
            h: common_vendor.p({
              type: "paperclip",
              size: "14",
              color: "#166534"
            }),
            i: common_vendor.t(getItemFiles(item).length)
          } : {}, {
            j: "41308e16-33-" + i0 + ",41308e16-0",
            k: common_vendor.p({
              type: "cloud-upload",
              size: "14",
              color: "#ffffff"
            }),
            l: common_vendor.t(item.submitted ? "重新上传" : "上传"),
            m: common_vendor.o(($event) => uploadTizidanFile(item.record_id, getFileKey(item)), item.record_id),
            n: getItemFiles(item).length > 0
          }, getItemFiles(item).length > 0 ? {
            o: common_vendor.f(getItemFiles(item), (file, fileIndex, i1) => {
              return {
                a: "41308e16-34-" + i0 + "-" + i1 + ",41308e16-0",
                b: common_vendor.t(file.name),
                c: common_vendor.t(formatFileSize(file.size)),
                d: "41308e16-35-" + i0 + "-" + i1 + ",41308e16-0",
                e: common_vendor.o(($event) => deleteTizidanFile(item.record_id, getFileKey(item), fileIndex), fileIndex),
                f: fileIndex
              };
            }),
            p: common_vendor.p({
              type: "paperclip",
              size: "16",
              color: "#166534"
            }),
            q: common_vendor.p({
              type: "trash",
              size: "16",
              color: "#dc2626"
            })
          } : {}) : {
            r: "41308e16-36-" + i0 + ",41308e16-0",
            s: common_vendor.p({
              type: "minus-circle",
              size: "18",
              color: "#9ca3af"
            })
          }, {
            t: item.record_id
          });
        }),
        ap: common_vendor.f(getItemsByLevel1("项目相关环保验收资料"), (item, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(getItemNumber(item)),
            b: common_vendor.t(getItemTitle(item)),
            c: item.required,
            d: common_vendor.o(() => toggleRequired(item), item.record_id),
            e: item.required
          }, item.required ? common_vendor.e({
            f: item.files && item.files.length > 0
          }, item.files && item.files.length > 0 ? {
            g: "41308e16-37-" + i0 + ",41308e16-0",
            h: common_vendor.p({
              type: "paperclip",
              size: "14",
              color: "#166534"
            }),
            i: common_vendor.t(item.files.length)
          } : {}, {
            j: "41308e16-38-" + i0 + ",41308e16-0",
            k: common_vendor.p({
              type: "cloud-upload",
              size: "14",
              color: "#ffffff"
            }),
            l: common_vendor.t(item.submitted ? "重新上传" : "上传"),
            m: common_vendor.o(($event) => uploadTizidanFile(item.record_id, null), item.record_id),
            n: item.files && item.files.length > 0
          }, item.files && item.files.length > 0 ? {
            o: common_vendor.f(item.files, (file, fileIndex, i1) => {
              return {
                a: "41308e16-39-" + i0 + "-" + i1 + ",41308e16-0",
                b: common_vendor.t(file.name),
                c: common_vendor.t(formatFileSize(file.size)),
                d: "41308e16-40-" + i0 + "-" + i1 + ",41308e16-0",
                e: common_vendor.o(($event) => deleteTizidanFile(item.record_id, null, fileIndex), fileIndex),
                f: fileIndex
              };
            }),
            p: common_vendor.p({
              type: "paperclip",
              size: "16",
              color: "#166534"
            }),
            q: common_vendor.p({
              type: "trash",
              size: "16",
              color: "#dc2626"
            })
          } : {}) : {
            r: "41308e16-41-" + i0 + ",41308e16-0",
            s: common_vendor.p({
              type: "minus-circle",
              size: "18",
              color: "#9ca3af"
            })
          }, {
            t: item.record_id
          });
        }),
        aq: common_vendor.f(getItemsByLevel1("（房地产项目提供）房地产相关证件"), (item, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(getItemNumber(item)),
            b: common_vendor.t(getItemTitle(item)),
            c: item.required,
            d: common_vendor.o(() => toggleRequired(item), item.record_id),
            e: item.required
          }, item.required ? common_vendor.e({
            f: getItemFiles(item).length > 0
          }, getItemFiles(item).length > 0 ? {
            g: "41308e16-42-" + i0 + ",41308e16-0",
            h: common_vendor.p({
              type: "paperclip",
              size: "14",
              color: "#166534"
            }),
            i: common_vendor.t(getItemFiles(item).length)
          } : {}, {
            j: "41308e16-43-" + i0 + ",41308e16-0",
            k: common_vendor.p({
              type: "cloud-upload",
              size: "14",
              color: "#ffffff"
            }),
            l: common_vendor.t(getSubmittedStatus(item) ? "重新上传" : "上传"),
            m: common_vendor.o(($event) => uploadTizidanFile(item.record_id, getFileKey(item)), item.record_id),
            n: getItemFiles(item).length > 0
          }, getItemFiles(item).length > 0 ? {
            o: common_vendor.f(getItemFiles(item), (file, fileIndex, i1) => {
              return {
                a: "41308e16-44-" + i0 + "-" + i1 + ",41308e16-0",
                b: common_vendor.t(file.name),
                c: common_vendor.t(formatFileSize(file.size)),
                d: "41308e16-45-" + i0 + "-" + i1 + ",41308e16-0",
                e: common_vendor.o(($event) => deleteTizidanFile(item.record_id, getFileKey(item), fileIndex), fileIndex),
                f: fileIndex
              };
            }),
            p: common_vendor.p({
              type: "paperclip",
              size: "16",
              color: "#166534"
            }),
            q: common_vendor.p({
              type: "trash",
              size: "16",
              color: "#dc2626"
            })
          } : {}) : {
            r: "41308e16-46-" + i0 + ",41308e16-0",
            s: common_vendor.p({
              type: "minus-circle",
              size: "18",
              color: "#9ca3af"
            })
          }, {
            t: item.record_id
          });
        }),
        ar: common_vendor.f(["污染治理设施设计方案", "厂区总平面图及各层平面图（CAD版本）", "厂区排水设计图（CAD版本）", "排污许可证", "排水许可证", "危废处置协议及相应处置资质"], (level1Name, k0, i0) => {
          return common_vendor.e({
            a: hasItemsByLevel1(level1Name)
          }, hasItemsByLevel1(level1Name) ? {
            b: common_vendor.t(getSectionNumber(level1Name)),
            c: common_vendor.t(level1Name),
            d: common_vendor.f(getItemsByLevel1(level1Name), (item, k1, i1) => {
              return common_vendor.e({
                a: common_vendor.t(getItemNumber(item)),
                b: common_vendor.t(getItemTitle(item)),
                c: item.required,
                d: common_vendor.o(() => toggleRequired(item), item.record_id),
                e: item.required
              }, item.required ? common_vendor.e({
                f: item.files && item.files.length > 0
              }, item.files && item.files.length > 0 ? {
                g: "41308e16-47-" + i0 + "-" + i1 + ",41308e16-0",
                h: common_vendor.p({
                  type: "paperclip",
                  size: "14",
                  color: "#166534"
                }),
                i: common_vendor.t(item.files.length)
              } : {}, {
                j: "41308e16-48-" + i0 + "-" + i1 + ",41308e16-0",
                k: common_vendor.p({
                  type: "cloud-upload",
                  size: "14",
                  color: "#ffffff"
                }),
                l: common_vendor.t(item.submitted ? "重新上传" : "上传"),
                m: common_vendor.o(($event) => uploadTizidanFile(item.record_id, null), item.record_id),
                n: item.files && item.files.length > 0
              }, item.files && item.files.length > 0 ? {
                o: common_vendor.f(item.files, (file, fileIndex, i2) => {
                  return {
                    a: "41308e16-49-" + i0 + "-" + i1 + "-" + i2 + ",41308e16-0",
                    b: common_vendor.t(file.name),
                    c: common_vendor.t(formatFileSize(file.size)),
                    d: "41308e16-50-" + i0 + "-" + i1 + "-" + i2 + ",41308e16-0",
                    e: common_vendor.o(($event) => deleteTizidanFile(item.record_id, null, fileIndex), fileIndex),
                    f: fileIndex
                  };
                }),
                p: common_vendor.p({
                  type: "paperclip",
                  size: "16",
                  color: "#166534"
                }),
                q: common_vendor.p({
                  type: "trash",
                  size: "16",
                  color: "#dc2626"
                })
              } : {}) : {
                r: "41308e16-51-" + i0 + "-" + i1 + ",41308e16-0",
                s: common_vendor.p({
                  type: "minus-circle",
                  size: "18",
                  color: "#9ca3af"
                })
              }, {
                t: item.record_id
              });
            })
          } : {}, {
            e: level1Name
          });
        }),
        as: hasItemsByLevel1("其他需要提供的资料")
      }, hasItemsByLevel1("其他需要提供的资料") ? {
        at: common_vendor.f(getItemsByLevel1("其他需要提供的资料"), (item, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(getItemNumber(item)),
            b: common_vendor.t(getItemTitle(item)),
            c: item.required,
            d: common_vendor.o(() => toggleRequired(item), item.record_id),
            e: item.required
          }, item.required ? common_vendor.e({
            f: "41308e16-52-" + i0 + ",41308e16-0",
            g: common_vendor.o(($event) => item.customText = $event, item.record_id),
            h: common_vendor.p({
              placeholder: "请输入其他需要提供的资料（以防万一以上资料不满足特殊项目要求）",
              type: "textarea",
              maxlength: 500,
              clearable: true,
              autoHeight: true,
              modelValue: item.customText
            }),
            i: common_vendor.o(($event) => submitOtherMaterials(item.record_id), item.record_id),
            j: item.files && item.files.length > 0
          }, item.files && item.files.length > 0 ? {
            k: "41308e16-53-" + i0 + ",41308e16-0",
            l: common_vendor.p({
              type: "paperclip",
              size: "14",
              color: "#166534"
            }),
            m: common_vendor.t(item.files.length)
          } : {}, {
            n: "41308e16-54-" + i0 + ",41308e16-0",
            o: common_vendor.p({
              type: "cloud-upload",
              size: "14",
              color: "#ffffff"
            }),
            p: common_vendor.t(item.submitted ? "重新上传" : "上传"),
            q: common_vendor.o(($event) => uploadTizidanFile(item.record_id, null), item.record_id),
            r: item.files && item.files.length > 0
          }, item.files && item.files.length > 0 ? {
            s: common_vendor.f(item.files, (file, fileIndex, i1) => {
              return {
                a: "41308e16-55-" + i0 + "-" + i1 + ",41308e16-0",
                b: common_vendor.t(file.name),
                c: common_vendor.t(formatFileSize(file.size)),
                d: "41308e16-56-" + i0 + "-" + i1 + ",41308e16-0",
                e: common_vendor.o(($event) => deleteTizidanFile(item.record_id, null, fileIndex), fileIndex),
                f: fileIndex
              };
            }),
            t: common_vendor.p({
              type: "paperclip",
              size: "16",
              color: "#166534"
            }),
            v: common_vendor.p({
              type: "trash",
              size: "16",
              color: "#dc2626"
            })
          } : {}) : {
            w: "41308e16-57-" + i0 + ",41308e16-0",
            x: common_vendor.p({
              type: "minus-circle",
              size: "18",
              color: "#9ca3af"
            })
          }, {
            y: item.record_id
          });
        })
      } : {}), {
        av: common_vendor.p({
          type: "download-filled",
          size: "16",
          color: "#ffffff"
        }),
        aw: common_vendor.o(downloadTizidanFile),
        ax: !selectedProjectId.value,
        ay: currentStep.value === 2,
        az: common_vendor.o(generateSignboard),
        aA: common_vendor.p({
          userId: common_vendor.unref(user_id),
          projectId: common_vendor.unref(project_id),
          signboard,
          baseTable: baseTable.value,
          datasheet: datasheet.value
        }),
        aB: currentStep.value === 3,
        aC: common_vendor.p({
          type: "calendar",
          size: "20",
          color: "#166534"
        }),
        aD: common_vendor.f(reportTypes, (type, k0, i0) => {
          return {
            a: type.value,
            b: reportType.value === type.value,
            c: common_vendor.t(type.text),
            d: type.value
          };
        }),
        aE: common_vendor.o(onReportTypeChange),
        aF: reportType.value === "withData"
      }, reportType.value === "withData" ? {
        aG: common_vendor.o(($event) => testReportFiles.value = $event),
        aH: common_vendor.p({
          fileMediatype: "all",
          ["auto-upload"]: false,
          limit: 3,
          modelValue: testReportFiles.value
        })
      } : {}, {
        aI: common_vendor.p({
          type: "refresh-filled",
          size: "16",
          color: "#ffffff"
        }),
        aJ: common_vendor.o(generateAcceptanceReport),
        aK: canDownloadReport.value
      }, canDownloadReport.value ? {
        aL: common_vendor.p({
          type: "cloud-download-filled",
          size: "16",
          color: "#ffffff"
        }),
        aM: common_vendor.o(downAcceptanceReport)
      } : {}, {
        aN: reportGenerated.value
      }, reportGenerated.value ? common_vendor.e({
        aO: common_vendor.p({
          type: "checkmarkempty",
          size: "18",
          color: "#166534"
        }),
        aP: common_vendor.t(previewTitle.value),
        aQ: reportType.value === "withData"
      }, reportType.value === "withData" ? {} : {}) : {}, {
        aR: currentStep.value === 4,
        aS: common_vendor.p({
          type: "left",
          size: "16",
          color: "#5b6b7b"
        }),
        aT: currentStep.value === 0,
        aU: common_vendor.o(prevStep),
        aV: common_vendor.p({
          type: "right",
          size: "16",
          color: "#ffffff"
        }),
        aW: currentStep.value === stepNames.length - 1,
        aX: common_vendor.o(nextStep),
        aY: common_vendor.p({
          current: "pages/reports/acceptance/index"
        }),
        aZ: common_vendor.o(($event) => newBaseInfoLabel.value = $event),
        ba: common_vendor.p({
          placeholder: "如：项目名称/单位名称",
          modelValue: newBaseInfoLabel.value
        }),
        bb: common_vendor.o(closeBaseInfo),
        bc: common_vendor.o(confirmAddBaseInfo),
        bd: common_vendor.sr(newBaseInfoPopup, "41308e16-67", {
          "k": "newBaseInfoPopup"
        }),
        be: common_vendor.p({
          type: "center"
        }),
        bf: common_vendor.sr(taskProgressModal, "41308e16-69", {
          "k": "taskProgressModal"
        }),
        bg: common_vendor.p({
          title: taskProgressTitle.value,
          progress: taskProgress.value,
          statusText: taskStatusText.value,
          state: taskState.value,
          cancelable: false
        }),
        bh: common_vendor.p({
          type: "close",
          size: "20",
          color: "#6b7280"
        }),
        bi: common_vendor.o(closeProjectPicker),
        bj: common_vendor.o(onSearchInput),
        bk: common_vendor.o(($event) => projectSearchKeyword.value = $event),
        bl: common_vendor.p({
          placeholder: "搜索项目名称...",
          prefixIcon: "search",
          clearable: true,
          modelValue: projectSearchKeyword.value
        }),
        bm: common_vendor.t(filteredProjects.value.length),
        bn: projectSearchKeyword.value
      }, projectSearchKeyword.value ? {} : {}, {
        bo: common_vendor.f(filteredProjects.value, (project, k0, i0) => {
          return common_vendor.e({
            a: "41308e16-73-" + i0 + ",41308e16-70",
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
            g: "41308e16-74-" + i0 + ",41308e16-70",
            h: common_vendor.p({
              type: "calendar",
              size: "14",
              color: "#9ca3af"
            }),
            i: common_vendor.t(project.folder_name)
          } : {}, {
            j: selectedProjectId.value === project.id
          }, selectedProjectId.value === project.id ? {
            k: "41308e16-75-" + i0 + ",41308e16-70",
            l: common_vendor.p({
              type: "checkmarkempty",
              size: "18",
              color: "#ffffff"
            })
          } : {
            m: "41308e16-76-" + i0 + ",41308e16-70",
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
        bp: filteredProjects.value.length === 0
      }, filteredProjects.value.length === 0 ? common_vendor.e({
        bq: common_vendor.p({
          type: "search",
          size: "48",
          color: "#cbd5e1"
        }),
        br: common_vendor.t(projectSearchKeyword.value ? "未找到匹配的项目" : "暂无项目"),
        bs: projectSearchKeyword.value
      }, projectSearchKeyword.value ? {} : {}) : {}, {
        bt: common_vendor.sr(projectPickerPopup, "41308e16-70", {
          "k": "projectPickerPopup"
        }),
        bv: common_vendor.p({
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
