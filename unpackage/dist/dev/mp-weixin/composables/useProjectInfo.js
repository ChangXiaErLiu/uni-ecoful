"use strict";
const common_vendor = require("../common/vendor.js");
const api_acceptance = require("../api/acceptance.js");
const composables_useMonitorPlan = require("./useMonitorPlan.js");
const composables_useFieldSurveyData = require("./useFieldSurveyData.js");
let instance = null;
function useProjectInfo() {
  if (instance) {
    return instance;
  }
  const selectedProjectId = common_vendor.ref(null);
  const selectedProject = common_vendor.ref(null);
  const projectList = common_vendor.ref([]);
  const projectFiles = common_vendor.ref([]);
  const projectSearchKeyword = common_vendor.ref("");
  common_vendor.ref(null);
  const pollingTimer = common_vendor.ref(null);
  const isPolling = common_vendor.ref(false);
  const pollingCount = common_vendor.ref(0);
  const MAX_POLLING_COUNT = 100;
  const POLLING_INTERVAL = 3e3;
  const extracting = common_vendor.ref(false);
  const extractionOk = common_vendor.ref(false);
  const baseTable = common_vendor.ref([]);
  const taskProgressTitle = common_vendor.ref("信息提取中");
  const taskProgress = common_vendor.ref(0);
  const taskStatusText = common_vendor.ref("正在初始化...");
  const taskState = common_vendor.ref("running");
  common_vendor.ref(null);
  const newBaseInfoLabel = common_vendor.ref("");
  const selectMode = common_vendor.ref(false);
  const selectedIds = common_vendor.ref([]);
  const showSignboard = common_vendor.ref(false);
  const signboard = common_vendor.reactive({
    sections: [
      { block: "废水", items: [{ title: "", content: "" }] },
      { block: "废气", items: [{ title: "", content: "" }] },
      { block: "噪声", items: [{ title: "", content: "" }] },
      { block: "危险废物", items: [{ title: "", content: "" }] }
    ]
  });
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
  async function loadProjects() {
    try {
      const { getProjects } = await "../api/project.js";
      const response = await getProjects();
      projectList.value = response || [];
    } catch (error) {
      common_vendor.index.__f__("error", "at composables/useProjectInfo.js:89", "加载项目列表失败:", error);
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
      const { getProjectDocuments } = await "../api/project.js";
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
      common_vendor.index.__f__("error", "at composables/useProjectInfo.js:128", "加载项目文件失败:", error);
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
      common_vendor.index.__f__("log", "at composables/useProjectInfo.js:154", "⚠️ 已在轮询中，跳过");
      return;
    }
    isPolling.value = true;
    pollingCount.value = 0;
    pollingTimer.value = setInterval(async () => {
      pollingCount.value++;
      if (pollingCount.value > MAX_POLLING_COUNT) {
        common_vendor.index.__f__("log", "at composables/useProjectInfo.js:165", "⏰ 达到最大轮询次数，停止轮询");
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
          common_vendor.index.__f__("log", "at composables/useProjectInfo.js:179", "✅ 所有文件处理完成，停止轮询");
          stopPolling();
          common_vendor.index.showToast({
            title: "文件处理完成",
            icon: "success",
            duration: 2e3
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at composables/useProjectInfo.js:188", "❌ 轮询文件状态失败:", error);
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
  function openProjectPicker() {
    if (projectList.value.length === 0) {
      common_vendor.index.showToast({
        title: "暂无项目，请先创建项目",
        icon: "none"
      });
      return;
    }
    projectSearchKeyword.value = "";
    return true;
  }
  function closeProjectPicker() {
    return true;
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
      common_vendor.index.__f__("warn", "at composables/useProjectInfo.js:237", "⚠️ 保存项目选择失败:", e);
    }
    stopPolling();
    await loadProjectFiles(project.id);
    startPollingFileStatus(project.id);
    loadProjectCache(project.id);
    common_vendor.index.showToast({
      title: `已选择：${project.name}`,
      icon: "success",
      duration: 1500
    });
    return true;
  }
  function onSearchInput() {
    common_vendor.index.__f__("log", "at composables/useProjectInfo.js:256", "搜索关键词:", projectSearchKeyword.value);
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
        const parsedData = JSON.parse(cachedData);
        if (Array.isArray(parsedData)) {
          baseTable.value = parsedData;
        } else if (typeof parsedData === "object" && parsedData !== null) {
          const converted = api_acceptance.transformExtractResult(parsedData);
          if (Array.isArray(converted)) {
            baseTable.value = converted;
            common_vendor.index.setStorageSync(cacheKey, JSON.stringify(baseTable.value));
          } else {
            baseTable.value = [];
          }
        } else {
          baseTable.value = [];
        }
        if (!Array.isArray(baseTable.value)) {
          baseTable.value = [];
          extractionOk.value = false;
          return;
        }
        extractionOk.value = true;
        common_vendor.index.__f__("log", "at composables/useProjectInfo.js:368", `✅ 已加载项目 ${projectId} 的缓存数据，共 ${baseTable.value.length} 条`);
        const fieldSurveyData = composables_useFieldSurveyData.useFieldSurveyData();
        fieldSurveyData.extractFacilitiesFromBaseTable(projectId, baseTable.value);
        const monitorPlanState = composables_useMonitorPlan.useMonitorPlan();
        monitorPlanState.loadPlanCache(projectId);
        common_vendor.index.showToast({
          title: "已加载缓存数据",
          icon: "success",
          duration: 1500
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at composables/useProjectInfo.js:384", "解析缓存数据失败:", error);
        baseTable.value = [];
        extractionOk.value = false;
      }
    } else {
      baseTable.value = [];
      extractionOk.value = false;
      common_vendor.index.__f__("log", "at composables/useProjectInfo.js:391", `ℹ️ 项目 ${projectId} 暂无缓存数据`);
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
          const monitorPlanState = composables_useMonitorPlan.useMonitorPlan();
          monitorPlanState.clearPlanCache(selectedProjectId.value);
          composables_useFieldSurveyData.useFieldSurveyData();
          const facilityKey = `project_facility_list_${selectedProjectId.value}`;
          const outletKey = `project_outlet_list_${selectedProjectId.value}`;
          common_vendor.index.removeStorageSync(facilityKey);
          common_vendor.index.removeStorageSync(outletKey);
          baseTable.value = [];
          signboard.sections.forEach((sec) => sec.items = []);
          showSignboard.value = false;
          extractionOk.value = false;
          selectedProjectId.value = null;
          selectedProject.value = null;
          projectFiles.value = [];
          common_vendor.index.__f__("log", "at composables/useProjectInfo.js:435", `🗑️ 已清除项目缓存和选择`);
          common_vendor.index.showToast({
            title: "缓存已清除",
            icon: "success"
          });
        }
      }
    });
  }
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
      common_vendor.index.__f__("log", "at composables/useProjectInfo.js:466", `[进度真实更新] ${newProgress}% - ${statusText}`);
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
          taskStatusText.value = "信息提取完成";
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
  async function simulateExtract(taskProgressModalRef) {
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
    if (taskProgressModalRef) {
      taskProgressModalRef.open();
    }
    try {
      const result = await api_acceptance.runTask({
        projectId: selectedProjectId.value,
        projectFolder: selectedProject.value.folder_name,
        onProgress: (progress, statusText, state) => {
          updateProgressSmooth(progress, statusText, state);
        },
        pollInterval: 3e3,
        timeout: 18e5
      });
      updateProgressSmooth(100, "任务完成", "success");
      if ((result == null ? void 0 : result.status) !== "success" || !result.result) {
        throw new Error((result == null ? void 0 : result.message) || "提取失败：后端未返回有效数据");
      }
      const transformed = api_acceptance.transformExtractResult(result.result);
      if (!Array.isArray(transformed)) {
        common_vendor.index.__f__("error", "at composables/useProjectInfo.js:582", "❌ transformExtractResult 返回的不是数组:", typeof transformed);
        throw new Error("数据转换失败：结果不是数组格式");
      }
      baseTable.value = transformed;
      common_vendor.index.__f__("log", "at composables/useProjectInfo.js:587", "✅ 信息提取成功，baseTable 长度:", baseTable.value.length);
      const cacheKey = `project_base_info_${selectedProjectId.value}`;
      common_vendor.index.setStorageSync(cacheKey, JSON.stringify(baseTable.value));
      common_vendor.index.__f__("log", "at composables/useProjectInfo.js:591", `✅ 项目 ${selectedProjectId.value} 的数据已缓存`);
      extractionOk.value = true;
      if (taskProgressModalRef) {
        setTimeout(() => {
          taskProgressModalRef.close();
          common_vendor.index.showToast({
            title: "信息提取完成",
            icon: "success",
            duration: 2e3
          });
        }, 1e3);
      }
    } catch (error) {
      clearProgressTimer();
      if (taskProgressModalRef) {
        taskProgressModalRef.close();
      }
      common_vendor.index.__f__("error", "at composables/useProjectInfo.js:613", "[Extract] 提取失败:", error);
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
  function openAddBase() {
    newBaseInfoLabel.value = "";
    return true;
  }
  function confirmAddBaseInfo() {
    const label = (newBaseInfoLabel.value || "").trim();
    if (!label) {
      common_vendor.index.showToast({
        title: "请输入字段名称",
        icon: "none"
      });
      return false;
    }
    baseTable.value.push({
      id: Date.now() + Math.random(),
      section: "",
      label,
      value: "",
      source: "manual",
      required: false
    });
    return true;
  }
  function closeBaseInfo() {
    return true;
  }
  function toggleSelectMode() {
    selectMode.value = !selectMode.value;
    if (!selectMode.value)
      selectedIds.value = [];
  }
  function toggleSelected(id) {
    const idx = selectedIds.value.indexOf(id);
    if (idx > -1)
      selectedIds.value.splice(idx, 1);
    else
      selectedIds.value.push(id);
  }
  function removeSelected() {
    if (selectedIds.value.length === 0) {
      common_vendor.index.showToast({
        title: "请先选择要删除的项",
        icon: "none"
      });
      return;
    }
    common_vendor.index.showModal({
      title: "确认删除",
      content: `确定要删除选中的 ${selectedIds.value.length} 项吗？`,
      success: (res) => {
        if (res.confirm) {
          baseTable.value = baseTable.value.filter(
            (item) => !selectedIds.value.includes(item.id)
          );
          selectedIds.value = [];
          selectMode.value = false;
          common_vendor.index.showToast({
            title: "删除成功",
            icon: "success"
          });
        }
      }
    });
  }
  function findBaseValue(label) {
    const r = baseTable.value.find((x) => x.label === label);
    return r ? r.value || "" : "";
  }
  function generateSignboard() {
    var _a;
    const unitName = findBaseValue("建设单位名称") || findBaseValue("单位名称") || "";
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
      return codeStr.split(/[、,，;；]/).map((c) => c.trim()).filter((c) => c && !invalidCodes.includes(c));
    }
    function groupByOutletCode(list) {
      const outletMap = /* @__PURE__ */ new Map();
      list.forEach((item) => {
        const codes = splitOutletCodes(item["排污口编号"]);
        const wryz = item["污染因子"] || "";
        codes.forEach((code) => {
          if (!outletMap.has(code)) {
            outletMap.set(code, {
              factors: /* @__PURE__ */ new Set(),
              otherInfo: item
            });
          }
          if (wryz) {
            const factors = wryz.split(/[、,，;；]/).map((f) => f.trim()).filter((f) => f);
            factors.forEach((factor) => outletMap.get(code).factors.add(factor));
          }
        });
      });
      return outletMap;
    }
    function generateSignboardItems(pollutantList, blockName) {
      const outlets = groupByOutletCode(pollutantList);
      const section = signboard.sections.find((s) => s.block === blockName);
      outlets.forEach((data, code) => {
        const factors = Array.from(data.factors).join("、");
        section.items.push(
          { title: "单位名称", content: unitName },
          { title: "排放口编号", content: code },
          { title: "污染因子", content: factors || (blockName === "噪声" ? "设备噪声" : "未提取到污染因子") }
        );
      });
    }
    const waterList = emissionData["水污染物"] || [];
    if (waterList.length > 0) {
      generateSignboardItems(waterList, "废水");
    }
    const gasList = emissionData["大气污染物"] || [];
    if (gasList.length > 0) {
      generateSignboardItems(gasList, "废气");
    }
    const noiseList = emissionData["噪声"] || [];
    if (noiseList.length > 0) {
      generateSignboardItems(noiseList, "噪声");
    }
    const hazardousWasteList = emissionData["危险废物"] || [];
    function extractWasteNames(wasteList) {
      if (!Array.isArray(wasteList) || wasteList.length === 0) {
        return "实验室废弃物、实验室废水污泥、医疗废物、废活性炭";
      }
      const names = /* @__PURE__ */ new Set();
      wasteList.forEach((item) => {
        const name = item["废物名称"] || "";
        if (name)
          names.add(name.trim());
      });
      return names.size > 0 ? Array.from(names).join("、") : "实验室废弃物、实验室废水污泥、医疗废物、废活性炭";
    }
    function extractAllHazardCodes(wasteList) {
      if (!Array.isArray(wasteList) || wasteList.length === 0) {
        return "HW49";
      }
      const codes = /* @__PURE__ */ new Set();
      wasteList.forEach((item) => {
        const category = item["危险废物类别"] || "";
        if (category) {
          const matches = category.match(/HW\d+/g);
          if (matches) {
            matches.forEach((code) => codes.add(code));
          }
        }
      });
      return codes.size > 0 ? Array.from(codes).join("、") : "HW49";
    }
    function extractAllHazardProperties(wasteList) {
      if (!Array.isArray(wasteList) || wasteList.length === 0) {
        return "毒性、腐蚀性";
      }
      const properties = /* @__PURE__ */ new Set();
      wasteList.forEach((item) => {
        const hazard = item["危险特性"] || "";
        if (hazard) {
          const matches = hazard.match(/（([^）]+)）/g);
          if (matches) {
            matches.forEach((m) => {
              const prop = m.replace(/[（）]/g, "").trim();
              if (prop)
                properties.add(prop);
            });
          }
        }
      });
      return properties.size > 0 ? Array.from(properties).join("、") : "毒性、腐蚀性";
    }
    const WFItems = [
      { title: "主要成分", content: extractAllHazardCodes(hazardousWasteList) },
      { title: "化学名称", content: extractWasteNames(hazardousWasteList) },
      { title: "危险情况", content: extractAllHazardProperties(hazardousWasteList) },
      { title: "安全措施", content: "接触时佩戴个人防护用品（全面罩/丁晴手套）" },
      { title: "废物产生单位", content: unitName },
      { title: "地址", content: findBaseValue("建设地点") },
      { title: "电话", content: findBaseValue("联系方式") },
      { title: "联系人", content: findBaseValue("单位联系人") }
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
      { title: "单位名称", content: unitName },
      { title: "排放口编号", content: code },
      { title: "污染因子", content: "设备噪声" }
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
  function downloadSignboard() {
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
  async function initialize() {
    await loadProjects();
    try {
      const savedProjectId = common_vendor.index.getStorageSync("acceptance_project_id");
      if (savedProjectId) {
        const project = projectList.value.find((p) => p.id === savedProjectId);
        if (project) {
          common_vendor.index.__f__("log", "at composables/useProjectInfo.js:1048", "🔄 恢复上次选择的项目:", project.name);
          selectedProjectId.value = project.id;
          selectedProject.value = project;
          await loadProjectFiles(project.id);
          startPollingFileStatus(project.id);
          loadProjectCache(project.id);
        } else {
          common_vendor.index.__f__("log", "at composables/useProjectInfo.js:1056", "⚠️ 上次选择的项目已不存在，清除缓存");
          common_vendor.index.removeStorageSync("acceptance_project_id");
          common_vendor.index.removeStorageSync("acceptance_project_info");
        }
      }
    } catch (e) {
      common_vendor.index.__f__("warn", "at composables/useProjectInfo.js:1062", "⚠️ 恢复项目选择失败:", e);
    }
  }
  function cleanup() {
    stopPolling();
    common_vendor.index.__f__("log", "at composables/useProjectInfo.js:1069", "📄 页面卸载，清理轮询定时器");
  }
  common_vendor.watch(selectedProjectId, (newId, oldId) => {
    if (oldId && newId !== oldId) {
      stopPolling();
      common_vendor.index.__f__("log", "at composables/useProjectInfo.js:1076", "🔄 切换项目，停止旧项目的轮询");
    }
    if (newId) {
      const monitorPlanState = composables_useMonitorPlan.useMonitorPlan();
      monitorPlanState.loadPlanCache(newId);
    }
  });
  instance = {
    // ===== 状态 =====
    // 项目选择
    selectedProjectId,
    selectedProject,
    projectList,
    projectFiles,
    projectSearchKeyword,
    filteredProjects,
    // 信息提取
    extracting,
    extractionOk,
    baseTable,
    taskProgressTitle,
    taskProgress,
    taskStatusText,
    taskState,
    // 基本信息表
    newBaseInfoLabel,
    selectMode,
    selectedIds,
    // 标识牌
    showSignboard,
    signboard,
    // ===== 方法 =====
    // 项目选择
    loadProjects,
    loadProjectFiles,
    openProjectPicker,
    closeProjectPicker,
    selectProject,
    onSearchInput,
    // 文件轮询
    startPollingFileStatus,
    stopPolling,
    hasProcessingFiles,
    // 文件工具
    getFileIcon,
    formatFileSize,
    formatFileStatus,
    getStatusText,
    getStatusClass,
    // 缓存管理
    loadProjectCache,
    clearProjectCache,
    // 信息提取
    simulateExtract,
    updateProgressSmooth,
    clearProgressTimer,
    // 基本信息表
    openAddBase,
    confirmAddBaseInfo,
    closeBaseInfo,
    toggleSelectMode,
    toggleSelected,
    removeSelected,
    // 标识牌
    generateSignboard,
    addSignItem,
    groupItems,
    removeGroup,
    downloadSignboard,
    findBaseValue,
    // 生命周期
    initialize,
    cleanup
  };
  return instance;
}
exports.useProjectInfo = useProjectInfo;
//# sourceMappingURL=../../.sourcemap/mp-weixin/composables/useProjectInfo.js.map
