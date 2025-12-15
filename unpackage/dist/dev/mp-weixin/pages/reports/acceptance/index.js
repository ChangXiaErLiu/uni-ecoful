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
      common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:947", "选择项目:", project.name);
      try {
        localStorage.setItem("acceptance_selected_project_id", project.id.toString());
        common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:952", "✅ 已保存项目选择到本地存储");
      } catch (e) {
        common_vendor.index.__f__("warn", "at pages/reports/acceptance/index.vue:954", "⚠️ 保存项目选择失败:", e);
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
      common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:983", "搜索关键词:", projectSearchKeyword.value);
    }
    function hasProcessingFiles() {
      return projectFiles.value.some(
        (file) => !["indexed", "failed"].includes(file.status)
      );
    }
    function startPollingFileStatus(projectId) {
      if (!hasProcessingFiles()) {
        common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:999", "✅ 所有文件已处理完成，无需轮询");
        return;
      }
      if (isPolling.value) {
        common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1005", "⚠️ 已在轮询中，跳过");
        return;
      }
      isPolling.value = true;
      pollingCount.value = 0;
      const processingCount = projectFiles.value.filter(
        (f) => !["indexed", "failed"].includes(f.status)
      ).length;
      common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1016", `🔄 开始轮询项目 ${projectId} 的文件状态...`);
      common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1017", `   还有 ${processingCount} 个文件正在处理`);
      pollingTimer.value = setInterval(async () => {
        pollingCount.value++;
        if (pollingCount.value > MAX_POLLING_COUNT) {
          common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1024", "⏰ 达到最大轮询次数，停止轮询");
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
            common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1040", "✅ 所有文件处理完成，停止轮询");
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
          common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:1057", "❌ 轮询文件状态失败:", error);
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
      common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1071", "⏹️ 轮询已停止");
    }
    async function loadProjects() {
      try {
        const {
          getProjects
        } = await "../../../api/project.js";
        const response = await getProjects();
        projectList.value = response || [];
        common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1084", "项目列表加载成功:", projectList.value.length, "个项目");
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:1086", "加载项目列表失败:", error);
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
        common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:1135", "加载项目文件失败:", error);
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
          common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1227", `✅ 已加载项目 ${projectId} 的缓存数据`);
          common_vendor.index.showToast({
            title: "已加载缓存数据",
            icon: "success",
            duration: 1500
          });
        } catch (error) {
          common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:1235", "解析缓存数据失败:", error);
          baseTable.value = [];
          extractionOk.value = false;
        }
      } else {
        baseTable.value = [];
        extractionOk.value = false;
        common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1243", `ℹ️ 项目 ${projectId} 暂无缓存数据`);
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
        content: "确定要清除当前项目的缓存数据吗？清除后需要重新提取信息。",
        success: (res) => {
          if (res.confirm) {
            const cacheKey = `project_base_info_${selectedProjectId.value}`;
            common_vendor.index.removeStorageSync(cacheKey);
            baseTable.value = [];
            extractionOk.value = false;
            common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1269", `🗑️ 已清除项目 ${selectedProjectId.value} 的缓存`);
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
        const savedProjectId = localStorage.getItem("acceptance_selected_project_id");
        if (savedProjectId) {
          const projectId = parseInt(savedProjectId);
          const project = projectList.value.find((p) => p.id === projectId);
          if (project) {
            common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1293", "🔄 恢复上次选择的项目:", project.name);
            selectedProjectId.value = project.id;
            selectedProject.value = project;
            await loadProjectFiles(project.id);
            startPollingFileStatus(project.id);
            loadProjectCache(project.id);
          } else {
            common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1308", "⚠️ 上次选择的项目已不存在，清除保存的ID");
            localStorage.removeItem("acceptance_selected_project_id");
          }
        }
      } catch (e) {
        common_vendor.index.__f__("warn", "at pages/reports/acceptance/index.vue:1313", "⚠️ 恢复项目选择失败:", e);
      }
    });
    common_vendor.onUnmounted(() => {
      stopPolling();
      common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1320", "📄 页面卸载，清理轮询定时器");
    });
    common_vendor.watch(selectedProjectId, (newId, oldId) => {
      if (oldId && newId !== oldId) {
        stopPolling();
        common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1327", "🔄 切换项目，停止旧项目的轮询");
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
        common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1358", `[进度真实更新] ${newProgress}% - ${statusText}`);
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
                common_vendor.index.__f__(
                  "log",
                  "at pages/reports/acceptance/index.vue:1388",
                  `[缓慢增长] 后端卡在 ${targetProgress}%，前端显示 ${Math.floor(currentDisplayProgress)}%`
                );
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
      var _a, _b, _c;
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
        common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1485", "准备提交任务，项目信息:");
        common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1486", "- projectId:", selectedProjectId.value);
        common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1487", "- selectedProject:", JSON.stringify(selectedProject.value, null, 2));
        common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1488", "- folder_name:", (_b = selectedProject.value) == null ? void 0 : _b.folder_name);
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
        common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1516", `✅ 项目 ${selectedProjectId.value} 的数据已缓存`);
        extractionOk.value = true;
      } catch (error) {
        clearProgressTimer();
        (_c = taskProgressModal.value) == null ? void 0 : _c.close();
        common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:1527", "[Extract] 提取失败:", error);
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
    async function saveMonitorPlan() {
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
      if (!extractionOk.value || baseTable.value.length === 0) {
        common_vendor.index.showModal({
          title: "提示",
          content: "请先提取项目基本信息",
          showCancel: false,
          confirmText: "知道了"
        });
        return;
      }
      clearProgressTimer();
      taskProgressTitle.value = "监测方案生成中";
      taskProgress.value = 0;
      taskStatusText.value = "正在提交任务...";
      taskState.value = "pending";
      (_a = taskProgressModal.value) == null ? void 0 : _a.open();
      try {
        const result = await api_acceptance.generateMonitorPlan({
          projectId: selectedProjectId.value,
          // 进度回调函数
          onProgress: (progress, statusText, state) => {
            updateProgressSmooth(progress, statusText, state);
          },
          pollInterval: 3e3,
          timeout: 18e5
          // 30分钟超时
        });
        updateProgressSmooth(100, "生成完成", "success");
        setTimeout(async () => {
          var _a2, _b2;
          try {
            const arrayBuffer = await api_acceptance.downloadMonitorPlan(selectedProjectId.value, "docx");
            await saveMonitorPlanFile(arrayBuffer);
            plan.value = true;
            (_a2 = taskProgressModal.value) == null ? void 0 : _a2.close();
            common_vendor.index.showToast({
              title: "监测方案已下载",
              icon: "success",
              duration: 2e3
            });
          } catch (downloadError) {
            common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:2062", "下载监测方案失败:", downloadError);
            (_b2 = taskProgressModal.value) == null ? void 0 : _b2.close();
            common_vendor.index.showModal({
              title: "下载失败",
              content: downloadError.message || "文件下载失败，请稍后重试",
              showCancel: false
            });
          }
        }, 1e3);
      } catch (error) {
        clearProgressTimer();
        (_b = taskProgressModal.value) == null ? void 0 : _b.close();
        common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:2078", "[MonitorPlan] 生成失败:", error);
        if (error.message.includes("超时") || error.message.includes("timeout")) {
          common_vendor.index.showModal({
            title: "生成超时",
            content: "监测方案生成时间过长，可能原因：\n1. 项目数据较多\n2. 网络不稳定\n3. 服务器繁忙\n\n建议稍后重试",
            showCancel: false,
            confirmText: "知道了"
          });
        } else if (error.message.includes("已有一个监测方案生成任务正在运行")) {
          common_vendor.index.showModal({
            title: "任务进行中",
            content: "您已有一个监测方案生成任务正在运行，请等待完成后再提交新任务",
            showCancel: false,
            confirmText: "知道了"
          });
        } else if (error.message.includes("项目提取结果文件不存在")) {
          common_vendor.index.showModal({
            title: "生成失败",
            content: "未找到项目提取结果，请先提取项目基本信息",
            showCancel: false,
            confirmText: "知道了"
          });
        } else {
          common_vendor.index.showModal({
            title: "生成失败",
            content: error.message || "监测方案生成失败，请稍后重试",
            showCancel: false,
            confirmText: "知道了"
          });
        }
      }
    }
    async function saveMonitorPlanFile(arrayBuffer) {
      return new Promise((resolve, reject) => {
        const fs = common_vendor.index.getFileSystemManager();
        const fileName = "监测方案.docx";
        const filePath = `${common_vendor.wx$1.env.USER_DATA_PATH}/${fileName}`;
        fs.writeFile({
          filePath,
          data: arrayBuffer,
          encoding: "binary",
          success: () => {
            common_vendor.index.openDocument({
              filePath,
              fileType: "docx",
              success: () => resolve(),
              fail: (err) => {
                common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:2152", "打开文档失败:", err);
                reject(new Error("文件已保存，但打开失败"));
              }
            });
          },
          fail: (err) => {
            common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:2158", "保存文件失败:", err);
            reject(new Error("保存文件失败"));
          }
        });
      });
    }
    const tizidanItems = common_vendor.ref([]);
    const downloadUrls = common_vendor.ref({
      acceptance_report: "",
      comparison_list: ""
    });
    async function fetchTizidanData() {
      try {
        common_vendor.index.showLoading({
          title: "加载中..."
        });
        common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:2184", "开始请求数据...");
        const response = await new Promise((resolve, reject) => {
          common_vendor.index.request({
            url: "http://172.16.1.61:8000/api/v1/completion/datasheet",
            method: "GET",
            timeout: 1e4,
            data: {
              memberId: 3
            },
            success: (res) => {
              common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:2196", "请求成功:", res);
              resolve(res);
            },
            fail: (err) => {
              common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:2200", "请求失败:", err);
              reject(err);
            }
          });
        });
        common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:2206", "完整响应对象:", response);
        common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:2207", "响应状态码:", response.statusCode);
        common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:2208", "响应数据:", response.data);
        if (response && response.statusCode === 200) {
          common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:2212", "状态码为200，开始解析数据");
          if (!response.data) {
            throw new Error("响应数据为空");
          }
          const data = response.data;
          common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:2220", "解析后的数据:", data);
          if (!data.items || !Array.isArray(data.items)) {
            throw new Error("数据格式不正确: items 不存在或不是数组");
          }
          tizidanItems.value = data.items;
          downloadUrls.value = data.download_urls || {};
          common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:2230", "最终设置的数据:", {
            items: tizidanItems.value,
            urls: downloadUrls.value
          });
          common_vendor.index.showToast({
            title: "数据加载成功",
            icon: "success"
          });
        } else {
          throw new Error(`请求失败，状态码：${(response == null ? void 0 : response.statusCode) || "未知"}`);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:2243", "获取提资单数据失败:", error);
        common_vendor.index.showToast({
          title: "加载失败，请重新刷新！",
          icon: "none",
          duration: 3e3
        });
        tizidanItems.value = [];
        downloadUrls.value = {
          acceptance_report: "",
          comparison_list: ""
        };
      } finally {
        common_vendor.index.hideLoading();
      }
      try {
        common_vendor.index.showLoading({
          title: "加载中..."
        });
        const response = await new Promise((resolve, reject) => {
          common_vendor.index.request({
            url: "http://172.16.1.61:8000/api/v1/completion/tzdDetail/datasheet",
            method: "GET",
            timeout: 1e4,
            data: {
              memberId: 3
            },
            success: (res) => {
              common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:2273", "请求成功:", res);
              resolve(res);
            },
            fail: (err) => {
              common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:2277", "请求失败:", err);
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
          common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:2291", "test", data.download_urls);
          const downloadUrlsData = data.download_urls || {};
          downloadUrls.value = {
            acceptance_report: formatDownloadUrl(downloadUrlsData.tzd_doc),
            comparison_list: formatDownloadUrl(downloadUrlsData.comparison_list)
          };
          common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:2299", "下载URL设置:", downloadUrls.value);
          common_vendor.index.showToast({
            title: "数据加载成功",
            icon: "success"
          });
        } else {
          throw new Error(`请求失败，状态码：${(response == null ? void 0 : response.statusCode) || "未知"}`);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:2309", "获取提资单数据失败:", error);
        common_vendor.index.showToast({
          title: "加载失败，请重新刷新！",
          icon: "none",
          duration: 3e3
        });
        tizidanItems.value = [];
        downloadUrls.value = {
          acceptance_report: "",
          comparison_list: ""
        };
      } finally {
        common_vendor.index.hideLoading();
      }
    }
    function formatDownloadUrl(url) {
      if (!url)
        return "";
      if (url.startsWith("/")) {
        return `http://172.16.1.61:8000${url}`;
      }
      if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
      }
      return url;
    }
    async function downloadFile(url, filename) {
      if (!url) {
        common_vendor.index.showToast({
          title: "下载链接不存在",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showLoading({
        title: "下载中...",
        mask: true
      });
      try {
        await downloadFileWechat(url, filename);
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "下载成功",
          icon: "success"
        });
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:2382", "下载失败:", error);
        common_vendor.index.showToast({
          title: "下载失败: " + (error.message || "未知错误"),
          icon: "none",
          duration: 3e3
        });
      }
    }
    function downloadFileWechat(url, filename) {
      return new Promise((resolve, reject) => {
        common_vendor.index.downloadFile({
          url,
          success: (res) => {
            if (res.statusCode === 200) {
              const filePath = res.tempFilePath;
              common_vendor.index.saveFile({
                tempFilePath: filePath,
                success: (saveRes) => {
                  common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:2424", "文件保存成功:", saveRes.savedFilePath);
                  resolve(saveRes);
                },
                fail: (saveErr) => {
                  reject(new Error("保存文件失败: " + (saveErr.errMsg || "未知错误")));
                }
              });
            } else {
              reject(new Error(`下载失败，状态码: ${res.statusCode}`));
            }
          },
          fail: (err) => {
            reject(new Error("下载请求失败: " + (err.errMsg || "未知错误")));
          }
        });
      });
    }
    async function submitTizidanItem(index) {
      common_vendor.index.showModal({
        title: "确认提交",
        content: "您确定要提交此项资料吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              common_vendor.index.showLoading({
                title: "提交中..."
              });
              common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:2475", "开始提交项目:", index, tizidanItems.value[index].text);
              const response = await new Promise((resolve, reject) => {
                common_vendor.index.request({
                  url: "http://172.16.1.61:8000/api/v1/completion/submit-item",
                  method: "POST",
                  header: {
                    "Content-Type": "application/json"
                  },
                  data: {
                    item_index: index,
                    item_text: tizidanItems.value[index].text
                  },
                  timeout: 1e4,
                  success: (res2) => {
                    common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:2491", "提交响应:", res2);
                    resolve(res2);
                  },
                  fail: (err) => {
                    common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:2495", "提交失败:", err);
                    reject(err);
                  }
                });
              });
              common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:2501", "提交完整响应:", response);
              if (response && response.statusCode === 200) {
                if (response.data && response.data.success) {
                  tizidanItems.value[index].submitted = true;
                  common_vendor.index.showToast({
                    title: "提交成功",
                    icon: "success",
                    duration: 2e3
                  });
                } else {
                  throw new Error(response.data.message || "提交失败");
                }
              } else {
                throw new Error(`提交失败，状态码：${(response == null ? void 0 : response.statusCode) || "未知"}`);
              }
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:2520", "提交失败:", error);
              common_vendor.index.showToast({
                title: "提交失败，请重试",
                icon: "none"
              });
            } finally {
              common_vendor.index.hideLoading();
            }
          }
        }
      });
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
    const fieldworkRecord = common_vendor.ref("");
    const fieldworkComparison = common_vendor.ref([]);
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
        title: `已生成比对清单（${comparison.length}项）`,
        icon: "success"
      });
    }
    function addComparisonItem() {
      fieldworkComparison.value.push({
        id: Date.now() + Math.random(),
        project: "",
        eiaRequirement: "",
        fieldSituation: "",
        difference: ""
      });
    }
    function removeComparisonItem(index) {
      fieldworkComparison.value.splice(index, 1);
    }
    function updateBaseInfo(shouldUpdate) {
      if (shouldUpdate) {
        fieldworkComparison.value.forEach((comparison) => {
          const baseItem = baseTable.value.find((item) => item.label === comparison.project);
          if (baseItem && comparison.fieldSituation) {
            baseItem.value = comparison.fieldSituation;
            baseItem.status = "verified";
          }
        });
        common_vendor.index.showToast({
          title: "基本信息已更新",
          icon: "success"
        });
      }
      currentStep.value = 3;
    }
    const reportType = common_vendor.ref("withoutData");
    const testReportFiles = common_vendor.ref([]);
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
    function generateAcceptanceReport() {
      if (!eiaFiles.value.length) {
        common_vendor.index.showToast({
          title: "请上传环评报告、批复文件等基本资料",
          icon: "none"
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
      setTimeout(() => {
        reportGenerated.value = true;
        common_vendor.index.showToast({
          title: "验收报告生成成功",
          icon: "success"
        });
      }, 1500);
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
          type: "folder",
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
                a: common_vendor.t(air.污染物名称 || "未提取到相关信息"),
                b: common_vendor.t(air.污染因子 || "未提取到污染因子"),
                c: common_vendor.t(air.污染治理措施 || "未提取到相关信息"),
                d: common_vendor.t(air.排放去向 || "未提取到相关信息"),
                e: common_vendor.t(air.执行标准 || "未提取到相关信息"),
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
            q: item.value.危险废物
          }, item.value.危险废物 ? {
            r: common_vendor.f([item.value.危险废物], (solid, index, i1) => {
              return {
                a: "hazard-" + index
              };
            }),
            s: common_vendor.t(item.value.危险废物.废物来源 || "无"),
            t: common_vendor.t(item.value.危险废物.废物名称 || "无"),
            v: common_vendor.t(item.value.危险废物.危险特性 || "无"),
            w: common_vendor.t(item.value.危险废物.危险废物类别 || "无"),
            x: common_vendor.t(item.value.危险废物.污染治理措施 || "无")
          } : {}, {
            y: selectMode.value
          }, selectMode.value ? {
            z: selectedIds.value.includes(item.id),
            A: common_vendor.o(() => toggleSelected(item.id), item.id)
          } : {}) : common_vendor.e({
            B: common_vendor.t(item.label),
            C: item.source === "extracted"
          }, item.source === "extracted" ? {} : {}, {
            D: "41308e16-15-" + i0 + ",41308e16-0",
            E: common_vendor.o(($event) => item.value = $event, item.id),
            F: common_vendor.p({
              placeholder: "请输入具体的值",
              clearable: true,
              modelValue: item.value
            }),
            G: selectMode.value
          }, selectMode.value ? {
            H: selectedIds.value.includes(item.id),
            I: common_vendor.o(() => toggleSelected(item.id), item.id)
          } : {}), {
            J: item.id
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
          type: "cloud-download-filled",
          size: "16",
          color: "#ffffff"
        }),
        ac: common_vendor.o(saveMonitorPlan),
        ad: plan.value
      }, plan.value ? {
        ae: common_vendor.p({
          type: "checkmark-circle",
          size: "18",
          color: "#166534"
        })
      } : {}, {
        af: currentStep.value === 1,
        ag: tizidanItems.value.length === 0
      }, tizidanItems.value.length === 0 ? {
        ah: common_vendor.p({
          type: "refresh",
          size: "48",
          color: "#cbd5e1"
        }),
        ai: common_vendor.p({
          type: "refresh",
          size: "16",
          color: "#ffffff"
        }),
        aj: common_vendor.o(fetchTizidanData)
      } : {
        ak: common_vendor.f(tizidanItems.value, (item, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(index + 1),
            b: common_vendor.t(item.text),
            c: common_vendor.t(item.submitted ? "已提交" : "未提交"),
            d: common_vendor.n(item.submitted ? "tizidan-submitted" : "tizidan-unsubmitted"),
            e: !item.submitted
          }, !item.submitted ? {
            f: common_vendor.o(($event) => submitTizidanItem(index), index)
          } : {}, {
            g: index
          });
        })
      }, {
        al: common_vendor.o(($event) => downloadFile(downloadUrls.value.acceptance_report, "验收报告提资单.docx")),
        am: !downloadUrls.value.acceptance_report,
        an: common_vendor.o(($event) => downloadFile(downloadUrls.value.comparison_list, "建设内容详细对比清单.docx")),
        ao: !downloadUrls.value.comparison_list,
        ap: currentStep.value === 2,
        aq: common_vendor.p({
          type: "map-pin-ellipse",
          size: "20",
          color: "#166534"
        }),
        ar: fieldworkRecord.value,
        as: common_vendor.o(($event) => fieldworkRecord.value = $event.detail.value),
        at: common_vendor.p({
          type: "list",
          size: "18",
          color: "#166534"
        }),
        av: common_vendor.p({
          type: "gear",
          size: "16",
          color: "#ffffff"
        }),
        aw: common_vendor.o(generateFieldworkComparison),
        ax: common_vendor.p({
          type: "plus",
          size: "16",
          color: "#155e3b"
        }),
        ay: common_vendor.o(addComparisonItem),
        az: fieldworkComparison.value.length
      }, fieldworkComparison.value.length ? {
        aA: common_vendor.f(fieldworkComparison.value, (item, index, i0) => {
          return {
            a: "41308e16-34-" + i0 + ",41308e16-0",
            b: common_vendor.o(($event) => item.project = $event, item.id),
            c: common_vendor.p({
              placeholder: "项目名称",
              modelValue: item.project
            }),
            d: "41308e16-35-" + i0 + ",41308e16-0",
            e: common_vendor.o(($event) => item.eiaRequirement = $event, item.id),
            f: common_vendor.p({
              placeholder: "环评要求",
              modelValue: item.eiaRequirement
            }),
            g: "41308e16-36-" + i0 + ",41308e16-0",
            h: common_vendor.o(($event) => item.fieldSituation = $event, item.id),
            i: common_vendor.p({
              placeholder: "现场情况",
              modelValue: item.fieldSituation
            }),
            j: "41308e16-37-" + i0 + ",41308e16-0",
            k: common_vendor.o(($event) => item.difference = $event, item.id),
            l: common_vendor.p({
              placeholder: "差异说明",
              modelValue: item.difference
            }),
            m: "41308e16-38-" + i0 + ",41308e16-0",
            n: common_vendor.o(() => removeComparisonItem(index), item.id),
            o: item.id
          };
        }),
        aB: common_vendor.p({
          type: "trash",
          size: "16",
          color: "#d92d20"
        })
      } : {
        aC: common_vendor.p({
          type: "map-pin-ellipse",
          size: "48",
          color: "#cbd5e1"
        })
      }, {
        aD: common_vendor.p({
          type: "refresh",
          size: "18",
          color: "#166534"
        }),
        aE: common_vendor.o(($event) => updateBaseInfo(false)),
        aF: common_vendor.o(($event) => updateBaseInfo(true)),
        aG: currentStep.value === 3,
        aH: common_vendor.p({
          type: "document",
          size: "20",
          color: "#166534"
        }),
        aI: common_vendor.f(reportTypes, (type, k0, i0) => {
          return {
            a: type.value,
            b: reportType.value === type.value,
            c: common_vendor.t(type.text),
            d: type.value
          };
        }),
        aJ: common_vendor.o(onReportTypeChange),
        aK: reportType.value === "withData"
      }, reportType.value === "withData" ? {
        aL: common_vendor.o(($event) => testReportFiles.value = $event),
        aM: common_vendor.p({
          fileMediatype: "all",
          ["auto-upload"]: false,
          limit: 3,
          modelValue: testReportFiles.value
        })
      } : {}, {
        aN: common_vendor.p({
          type: "cloud-download-filled",
          size: "16",
          color: "#ffffff"
        }),
        aO: common_vendor.o(generateAcceptanceReport),
        aP: reportGenerated.value
      }, reportGenerated.value ? common_vendor.e({
        aQ: common_vendor.p({
          type: "checkmark-circle",
          size: "18",
          color: "#166534"
        }),
        aR: reportType.value === "withData"
      }, reportType.value === "withData" ? {} : {}) : {}, {
        aS: currentStep.value === 4,
        aT: common_vendor.p({
          type: "left",
          size: "16",
          color: "#5b6b7b"
        }),
        aU: currentStep.value === 0,
        aV: common_vendor.o(prevStep),
        aW: common_vendor.p({
          type: "right",
          size: "16",
          color: "#ffffff"
        }),
        aX: currentStep.value === stepNames.length - 1,
        aY: common_vendor.o(nextStep),
        aZ: common_vendor.p({
          current: "pages/reports/acceptance/index"
        }),
        ba: common_vendor.o(($event) => newBaseInfoLabel.value = $event),
        bb: common_vendor.p({
          placeholder: "如：项目名称/单位名称",
          modelValue: newBaseInfoLabel.value
        }),
        bc: common_vendor.o(closeBaseInfo),
        bd: common_vendor.o(confirmAddBaseInfo),
        be: common_vendor.sr(newBaseInfoPopup, "41308e16-47", {
          "k": "newBaseInfoPopup"
        }),
        bf: common_vendor.p({
          type: "center"
        }),
        bg: common_vendor.sr(taskProgressModal, "41308e16-49", {
          "k": "taskProgressModal"
        }),
        bh: common_vendor.p({
          title: taskProgressTitle.value,
          progress: taskProgress.value,
          statusText: taskStatusText.value,
          state: taskState.value,
          cancelable: false
        }),
        bi: common_vendor.p({
          type: "close",
          size: "20",
          color: "#6b7280"
        }),
        bj: common_vendor.o(closeProjectPicker),
        bk: common_vendor.o(onSearchInput),
        bl: common_vendor.o(($event) => projectSearchKeyword.value = $event),
        bm: common_vendor.p({
          placeholder: "搜索项目名称...",
          prefixIcon: "search",
          clearable: true,
          modelValue: projectSearchKeyword.value
        }),
        bn: common_vendor.t(filteredProjects.value.length),
        bo: projectSearchKeyword.value
      }, projectSearchKeyword.value ? {} : {}, {
        bp: common_vendor.f(filteredProjects.value, (project, k0, i0) => {
          return common_vendor.e({
            a: "41308e16-53-" + i0 + ",41308e16-50",
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
            g: "41308e16-54-" + i0 + ",41308e16-50",
            h: common_vendor.p({
              type: "calendar",
              size: "14",
              color: "#9ca3af"
            }),
            i: common_vendor.t(project.folder_name)
          } : {}, {
            j: selectedProjectId.value === project.id
          }, selectedProjectId.value === project.id ? {
            k: "41308e16-55-" + i0 + ",41308e16-50",
            l: common_vendor.p({
              type: "checkmarkempty",
              size: "18",
              color: "#ffffff"
            })
          } : {
            m: "41308e16-56-" + i0 + ",41308e16-50",
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
        bq: filteredProjects.value.length === 0
      }, filteredProjects.value.length === 0 ? common_vendor.e({
        br: common_vendor.p({
          type: "search",
          size: "48",
          color: "#cbd5e1"
        }),
        bs: common_vendor.t(projectSearchKeyword.value ? "未找到匹配的项目" : "暂无项目"),
        bt: projectSearchKeyword.value
      }, projectSearchKeyword.value ? {} : {}) : {}, {
        bv: common_vendor.sr(projectPickerPopup, "41308e16-50", {
          "k": "projectPickerPopup"
        }),
        bw: common_vendor.p({
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
