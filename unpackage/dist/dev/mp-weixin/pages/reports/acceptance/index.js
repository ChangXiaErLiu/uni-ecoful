"use strict";
const common_vendor = require("../../../common/vendor.js");
const utils_platform = require("../../../utils/platform.js");
const stores_navTitle = require("../../../stores/navTitle.js");
const api_acceptance = require("../../../api/acceptance.js");
if (!Array) {
  const _easycom_uni_data_select2 = common_vendor.resolveComponent("uni-data-select");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_file_picker2 = common_vendor.resolveComponent("uni-file-picker");
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_data_select2 + _easycom_uni_icons2 + _easycom_uni_file_picker2 + _easycom_uni_easyinput2 + _easycom_uni_popup2)();
}
const _easycom_uni_data_select = () => "../../../uni_modules/uni-data-select/components/uni-data-select/uni-data-select.js";
const _easycom_uni_icons = () => "../../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_file_picker = () => "../../../uni_modules/uni-file-picker/components/uni-file-picker/uni-file-picker.js";
const _easycom_uni_easyinput = () => "../../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_uni_popup = () => "../../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_data_select + _easycom_uni_icons + _easycom_uni_file_picker + _easycom_uni_easyinput + AppLayout + _easycom_uni_popup)();
}
const AppLayout = () => "../../../components/layout/AppLayout.js";
const MAX_FILES = 100;
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const navTitle = stores_navTitle.navTitleStore();
    common_vendor.onShow(() => navTitle.setTitle("环评项目竣工验收"));
    const {
      isMobile
    } = utils_platform.usePlatformInfo();
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
          return fieldworkComparison.value.length > 0;
        case 3:
          return plan.value.length > 0;
        case 4:
          return reportGenerated.value;
        default:
          return false;
      }
    }
    const ALLOWED_EXTS = [
      "pdf",
      "doc",
      "docx",
      "txt",
      "md",
      "jpg",
      "jpeg",
      "png",
      "gif",
      "bmp",
      "webp"
    ];
    const eiaFiles = common_vendor.ref([]);
    const uploadedDocuments = common_vendor.ref([]);
    const extracting = common_vendor.ref(false);
    common_vendor.ref("");
    function showUploadResult({
      successCount,
      failCount,
      supported,
      nonSupported,
      total
    }) {
      const hasSupported = supported > 0;
      const hasNonSupported = nonSupported > 0;
      if (failCount === 0 && successCount === total) {
        let title = `全部上传成功 (${successCount}个)`;
        if (hasSupported) {
          title = `上传成功: ${supported}个文档已解析, ${nonSupported}个附件`;
        } else if (hasNonSupported) {
          title = `${successCount}个文件已上传（暂不支持自动解析）`;
        }
        common_vendor.index.showToast({
          title,
          icon: hasSupported ? "success" : "none",
          duration: 2500
        });
      } else if (failCount === total) {
        common_vendor.index.showToast({
          title: `全部上传失败 (${failCount}个)`,
          icon: "none"
        });
      } else {
        common_vendor.index.showToast({
          title: `完成: 成功${successCount}, 失败${failCount}`,
          icon: "none"
        });
      }
    }
    let uploadProgressTimer = null;
    let currentUploadPercent = 0;
    let sprintTimer = null;
    let progressDone = false;
    function startUploadFakeProgress(totalSlowTime = 6e4) {
      currentUploadPercent = 0;
      progressDone = false;
      const step = 99 / (totalSlowTime / 200);
      uploadProgressTimer = setInterval(() => {
        if (progressDone) {
          clearInterval(uploadProgressTimer);
          uploadProgressTimer = null;
          return;
        }
        currentUploadPercent += step;
        if (currentUploadPercent >= 99) {
          currentUploadPercent = 99;
          clearInterval(uploadProgressTimer);
          uploadProgressTimer = null;
        }
        common_vendor.index.showLoading({
          title: `正在解析文档… ${Math.floor(currentUploadPercent)}%`,
          mask: true
        });
      }, 200);
    }
    function sprintToComplete() {
      progressDone = true;
      if (uploadProgressTimer) {
        clearInterval(uploadProgressTimer);
        uploadProgressTimer = null;
      }
      const startPercent = currentUploadPercent;
      const targetPercent = 100;
      const duration = 2e3;
      const stepTime = 10;
      const totalSteps = duration / stepTime;
      const stepValue = (targetPercent - startPercent) / totalSteps;
      let currentStep2 = 0;
      sprintTimer = setInterval(() => {
        currentStep2++;
        currentUploadPercent = startPercent + stepValue * currentStep2;
        if (currentUploadPercent >= 100) {
          currentUploadPercent = 100;
          clearInterval(sprintTimer);
          sprintTimer = null;
          common_vendor.index.showLoading({
            title: `文件解析成功，解析进度：100%`,
            mask: true
          });
          setTimeout(() => {
            common_vendor.index.hideLoading();
            common_vendor.index.showToast({
              title: "文档解析完成",
              icon: "success",
              duration: 1500
            });
          }, 1e3);
          return;
        }
        common_vendor.index.showLoading({
          title: `正在解析文档，请稍等，解析进度：${Math.floor(currentUploadPercent)}%`,
          mask: true
        });
      }, stepTime);
    }
    async function handleFileSelect(e) {
      const selectedFiles = e.tempFiles || (e.tempFile ? [e.tempFile] : []);
      if (!(selectedFiles == null ? void 0 : selectedFiles.length))
        return;
      const remaining = MAX_FILES - eiaFiles.value.length;
      if (remaining <= 0) {
        common_vendor.index.showToast({
          title: `最多只能上传${MAX_FILES}个文件`,
          icon: "none"
        });
        return;
      }
      const unsupportedFiles = [];
      const supportedFiles = selectedFiles.filter((file) => {
        const ext = (file.name || file.filename || "").split(".").pop().toLowerCase();
        const isAllowed = ALLOWED_EXTS.includes(ext);
        if (!isAllowed)
          unsupportedFiles.push(file.name || file.filename);
        return isAllowed;
      }).slice(0, remaining);
      if (unsupportedFiles.length > 0) {
        const names = unsupportedFiles.slice(0, 3).join(", ");
        const more = unsupportedFiles.length > 3 ? ` 等${unsupportedFiles.length}个` : "文件";
        common_vendor.index.showModal({
          title: "不支持的文件格式",
          content: `以下${more}不支持上传：
${names}${unsupportedFiles.length > 3 ? "..." : ""}`,
          showCancel: false,
          confirmText: "知道了"
        });
      }
      if (supportedFiles.length > 0) {
        eiaFiles.value = [...eiaFiles.value, ...supportedFiles];
      }
      if (supportedFiles.length === 0)
        return;
      startUploadFakeProgress(15e4);
      const stats = {
        successCount: 0,
        failCount: 0,
        supported: 0,
        nonSupported: 0,
        total: supportedFiles.length
      };
      for (let i = 0; i < supportedFiles.length; i++) {
        const file = supportedFiles[i];
        try {
          const result = await api_acceptance.uploadFileToBackend(file);
          uploadedDocuments.value.push(result.document_id);
          stats.successCount++;
          const ext = (result.filename || file.name || "").split(".").pop().toLowerCase();
          const parseableExts = [
            "pdf",
            "doc",
            "docx",
            "txt",
            "md",
            "jpg",
            "jpeg",
            "png",
            "gif",
            "bmp",
            "webp"
          ];
          if (parseableExts.includes(ext)) {
            stats.supported++;
            common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:924", `文件已上传并支持解析: ${result.filename}`);
          } else {
            stats.nonSupported++;
            common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:927", `文件已上传（暂不支持解析）: ${result.filename}`);
          }
        } catch (error) {
          stats.failCount++;
          common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:931", `❌ 文件 ${i + 1} 上传失败:`, error);
          progressDone = true;
          if (uploadProgressTimer) {
            clearInterval(uploadProgressTimer);
            uploadProgressTimer = null;
          }
          if (sprintTimer) {
            clearInterval(sprintTimer);
            sprintTimer = null;
          }
          common_vendor.index.hideLoading();
          if (supportedFiles.length === 1) {
            common_vendor.index.showToast({
              title: error.message || "上传失败",
              icon: "none"
            });
            return;
          }
        }
      }
      showUploadResult(stats);
      if (stats.supported > 0) {
        common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:960", `[AutoIndex] 检测到 ${stats.supported} 个可解析文件，开始自动索引...`);
        await handleAutoIndexBuild(stats.supported);
      } else {
        progressDone = true;
        if (uploadProgressTimer) {
          clearInterval(uploadProgressTimer);
          uploadProgressTimer = null;
        }
        common_vendor.index.hideLoading();
      }
    }
    async function handleAutoIndexBuild(supportedCount) {
      try {
        const result = await api_acceptance.rebuildIndex({
          hideLoading: true
        });
        common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:980", "[AutoIndex] 成功:", result);
        sprintToComplete();
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:986", "[AutoIndex] 失败:", error);
        progressDone = true;
        if (uploadProgressTimer) {
          clearInterval(uploadProgressTimer);
          uploadProgressTimer = null;
        }
        if (sprintTimer) {
          clearInterval(sprintTimer);
          sprintTimer = null;
        }
        common_vendor.index.hideLoading();
        common_vendor.index.showModal({
          title: "自动解析失败",
          content: "文档已上传，但索引构建失败。\n\n错误：" + (error.message || "未知错误"),
          showCancel: false,
          confirmText: "知道了"
        });
      }
    }
    function handleFileDelete(e) {
      const {
        index,
        tempFile
      } = e;
      if (uploadedDocuments.value[index]) {
        uploadedDocuments.value.splice(index, 1);
      }
      if (eiaFiles.value[index]) {
        eiaFiles.value.splice(index, 1);
      }
    }
    let extractProgressTimer = null;
    let extractCurrentPercent = 0;
    let extractSprintTimer = null;
    let extractProgressDone = false;
    function startExtractFakeProgress(totalTime = 15e4) {
      extractCurrentPercent = 0;
      extractProgressDone = false;
      const step = 99 / (totalTime / 200);
      extractProgressTimer = setInterval(() => {
        if (extractProgressDone) {
          clearInterval(extractProgressTimer);
          extractProgressTimer = null;
          return;
        }
        extractCurrentPercent += step;
        if (extractCurrentPercent >= 99) {
          extractCurrentPercent = 99;
          clearInterval(extractProgressTimer);
          extractProgressTimer = null;
        }
        common_vendor.index.showLoading({
          title: `正在提取项目信息，提取进度：${Math.floor(extractCurrentPercent)}%`,
          mask: true
        });
      }, 200);
    }
    function sprintExtractToComplete() {
      extractProgressDone = true;
      if (extractProgressTimer) {
        clearInterval(extractProgressTimer);
        extractProgressTimer = null;
      }
      const startPercent = extractCurrentPercent;
      const targetPercent = 100;
      const duration = 2e3;
      const stepTime = 10;
      const totalSteps = duration / stepTime;
      const stepValue = (targetPercent - startPercent) / totalSteps;
      let currentStep2 = 0;
      extractSprintTimer = setInterval(() => {
        currentStep2++;
        extractCurrentPercent = startPercent + stepValue * currentStep2;
        if (extractCurrentPercent >= 100) {
          extractCurrentPercent = 100;
          clearInterval(extractSprintTimer);
          extractSprintTimer = null;
          common_vendor.index.showLoading({
            title: `提取成功，提取进度：100%`,
            mask: true
          });
          setTimeout(() => {
            common_vendor.index.hideLoading();
            common_vendor.index.showToast({
              title: "信息提取完成",
              icon: "success",
              duration: 2e3
            });
          }, 1e3);
          return;
        }
        common_vendor.index.showLoading({
          title: `正在提取项目信息，提取进度：${Math.floor(extractCurrentPercent)}%`,
          mask: true
        });
      }, stepTime);
    }
    async function simulateExtract() {
      if (uploadedDocuments.value.length === 0) {
        common_vendor.index.showModal({
          title: "提示",
          content: "请先上传环评报告文件",
          showCancel: false,
          confirmText: "知道了"
        });
        return;
      }
      extracting.value = true;
      startExtractFakeProgress(15e4);
      common_vendor.index.showLoading({
        title: "请稍作等待，正在提取项目信息，预计2~3分钟哦",
        mask: true
      });
      try {
        const result = await api_acceptance.runTask("task1", {
          hideLoading: true,
          // 我们用uni.showLoading，所以这里隐藏
          timeout: 9e5
          // 15分钟，足够解析100页PDF
        });
        sprintExtractToComplete();
        if ((result == null ? void 0 : result.status) !== "success" || !result.result) {
          throw new Error((result == null ? void 0 : result.message) || "提取失败：后端未返回有效数据");
        }
        baseTable.value = api_acceptance.transformExtractResult(result.result);
        common_vendor.index.setStorageSync("project_base_info", JSON.stringify(baseTable.value));
        common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1163", "[Extract] 提取成功:", result);
        common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1164", "[Debug] baseTable:", baseTable.value.水污染物);
      } catch (error) {
        extractProgressDone = true;
        if (extractProgressTimer) {
          clearInterval(extractProgressTimer);
          extractProgressTimer = null;
        }
        if (extractSprintTimer) {
          clearInterval(extractSprintTimer);
          extractSprintTimer = null;
        }
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:1180", "[Extract] 提取失败:", error);
        if (error.message.includes("超时")) {
          common_vendor.index.showModal({
            title: "提取超时",
            content: "文档过大或网络较慢，建议：\n1. 拆分成多个文件上传\n2. 检查网络连接\n3. 联系管理员",
            showCancel: false,
            confirmText: "知道了"
          });
        } else if (error.message.includes("未提取到")) {
          common_vendor.index.showModal({
            title: "提取失败",
            content: "文档中未找到项目信息，请检查：\n1. 文件是否为完整的环评报告\n2. 文件内容是否清晰可读",
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
          block: "危险污染物",
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
      const emissionData = (_a = baseTable.value.find((x) => x.id === "pollutants_emission")) == null ? void 0 : _a.value;
      if (!emissionData || typeof emissionData !== "object") {
        common_vendor.index.showToast({
          title: "未提取到污染物信息",
          icon: "none"
        });
        return;
      }
      signboard.sections.forEach((sec) => sec.items = []);
      const waterList = emissionData["水污染物"] || [];
      waterList.forEach((w, index) => {
        const code = `DW${String(index + 1).padStart(3, "0")}`;
        signboard.sections.find((s) => s.block === "废水").items.push({
          title: "单位名称",
          content: unitName
        }, {
          title: "排放口编号",
          content: code
        }, {
          title: "污染物种类",
          content: w["污染物名称"]
        });
      });
      const gasList = emissionData["大气污染物"] || [];
      gasList.forEach((g, index) => {
        const code = `DA${String(index + 1).padStart(3, "0")}`;
        signboard.sections.find((s) => s.block === "废气").items.push({
          title: "单位名称",
          content: unitName
        }, {
          title: "排放口编号",
          content: code
        }, {
          title: "污染物种类",
          content: g["污染物名称"]
        });
      });
      const noiseList = emissionData["噪声"] || [];
      noiseList.forEach((n, index) => {
        const code = `ZS-${String(index + 1).padStart(2, "0")}`;
        signboard.sections.find((s) => s.block === "噪声").items.push({
          title: "单位名称",
          content: unitName
        }, {
          title: "排放口编号",
          content: code
        }, {
          title: "污染物种类",
          content: "设备噪声"
        });
      });
      const WFItems = [
        {
          title: "主要成分",
          content: "HW49其他废物"
        },
        {
          title: "化学名称",
          content: "实验室废弃物、实验室废水污泥、医疗废物、废活性炭"
        },
        {
          title: "危险情况",
          content: "毒性/腐蚀性"
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
          content: findBaseValue("建设地点") || "-"
        },
        {
          title: "电话",
          content: ""
        },
        {
          title: "联系人",
          content: ""
        }
      ];
      signboard.sections.find((s) => s.block === "危险污染物").items = WFItems;
      common_vendor.index.showToast({
        title: "已生成标识牌",
        icon: "success"
      });
    }
    function addSignItem(sectionIdx) {
      const sec = signboard.sections[sectionIdx];
      const block = sec.block;
      const unitName = findBaseValue("建设单位名称") || findBaseValue("单位名称") || "";
      const groupCount = Math.floor(sec.items.length / 3) + 1;
      let code = "";
      if (block === "废水")
        code = `DW${String(groupCount).padStart(3, "0")}`;
      else if (block === "废气")
        code = `DA${String(groupCount).padStart(3, "0")}`;
      else if (block === "噪声")
        code = `ZS-${String(groupCount).padStart(2, "0")}`;
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
          title: "污染物种类",
          content: block === "噪声" ? "设备噪声" : ""
        }
      ];
      sec.items.push(...group);
    }
    function groupItems(items) {
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
        content: `确定删除排污口 ${code} 吗？`,
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
    const verifyOptions = [{
      text: "待核对",
      value: "pending"
    }, {
      text: "已核对",
      value: "verified"
    }, {
      text: "需补充",
      value: "require"
    }];
    const baseTable = common_vendor.ref([]);
    const datasheet = common_vendor.ref([]);
    const datasheetTypeOptions = [{
      text: "需再次提资",
      value: "requireMore"
    }, {
      text: "需业主核对",
      value: "ownerConfirm"
    }];
    function generateDatasheet() {
      const list = baseTable.value.filter((r) => r.required && !r.value || r.status !== "verified").map((r) => ({
        id: r.id,
        label: r.label || "未命名",
        value: r.value || "",
        type: r.required && !r.value ? "requireMore" : "ownerConfirm"
      }));
      datasheet.value = list;
      common_vendor.index.showToast({
        title: `已生成提资单（${list.length}项）`,
        icon: "none"
      });
    }
    function removeDatasheet(i) {
      datasheet.value.splice(i, 1);
    }
    function exportDatasheet() {
      common_vendor.index.showToast({
        title: "待对接：导出提资单",
        icon: "none"
      });
    }
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
    const plan = common_vendor.ref([]);
    function recommendPlan() {
      const hasWW = baseTable.value.some(
        (item) => item.label.includes("废水") || item.label.includes("污水")
      );
      const hasWA = baseTable.value.some(
        (item) => item.label.includes("废气") || item.label.includes("烟气")
      );
      const hasNoise = baseTable.value.some(
        (item) => item.label.includes("噪声")
      );
      const now = Date.now();
      plan.value = [];
      if (hasWW) {
        plan.value.push({
          id: now + 1,
          factor: "COD",
          point: "废水总排口",
          method: "GB/T 11914-2020",
          frequency: "3天×2次/天",
          qaqc: "平行/空白",
          remark: "化学需氧量"
        });
        plan.value.push({
          id: now + 2,
          factor: "氨氮",
          point: "废水总排口",
          method: "HJ 535-2009",
          frequency: "3天×2次/天",
          qaqc: "平行",
          remark: ""
        });
      }
      if (hasWA) {
        plan.value.push({
          id: now + 3,
          factor: "颗粒物",
          point: "废气排放口",
          method: "HJ 836-2017",
          frequency: "2天×3次/天",
          qaqc: "平行",
          remark: ""
        });
      }
      if (hasNoise) {
        plan.value.push({
          id: now + 4,
          factor: "噪声",
          point: "厂界四角",
          method: "GB 12348-2008",
          frequency: "昼/夜各1次",
          qaqc: "",
          remark: "连续2天"
        });
      }
      if (plan.value.length === 0) {
        plan.value.push({
          id: now + 5,
          factor: "常规监测",
          point: "主要产污环节",
          method: "按标准执行",
          frequency: "1天×2次",
          qaqc: "质控样",
          remark: "请根据实际情况调整"
        });
      }
      common_vendor.index.showToast({
        title: `已推荐${plan.value.length}项监测方案`,
        icon: "success"
      });
    }
    function addPlanItem() {
      plan.value.push({
        id: Date.now() + Math.random(),
        factor: "",
        point: "",
        method: "",
        frequency: "",
        qaqc: "",
        remark: ""
      });
    }
    function removePlanItem(i) {
      plan.value.splice(i, 1);
    }
    function duplicatePlanItem(i) {
      try {
        const src = plan.value[i];
        plan.value.splice(i + 1, 0, {
          ...JSON.parse(JSON.stringify(src)),
          id: Date.now() + Math.random()
        });
      } catch (e) {
      }
    }
    function movePlanItem(i, dir) {
      if (i + dir < 0 || i + dir >= plan.value.length)
        return;
      const it = plan.value.splice(i, 1)[0];
      plan.value.splice(i + dir, 0, it);
    }
    function downloadMonitorTemplate() {
      common_vendor.index.showToast({
        title: "监测方案模板下载成功",
        icon: "success"
      });
    }
    function saveMonitorPlan() {
      common_vendor.index.showToast({
        title: "监测方案已保存",
        icon: "success"
      });
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
      if (!baseTable.value.length) {
        common_vendor.index.showToast({
          title: "请先完成项目基本信息",
          icon: "none"
        });
        return;
      }
      if (reportType.value === "withData" && !testReportFiles.value.length) {
        common_vendor.index.showToast({
          title: "请上传检测报告",
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
    function previewReport() {
      common_vendor.index.showToast({
        title: "报告预览功能待开发",
        icon: "none"
      });
    }
    function exportReport() {
      const typeText = reportType.value === "withData" ? "有检测数据" : "无检测数据";
      common_vendor.index.showToast({
        title: `${typeText}报告导出成功`,
        icon: "success"
      });
    }
    common_vendor.computed(() => {
      let totalSteps = stepNames.length;
      let completedSteps = stepNames.reduce((count, _, index) => {
        return count + (stepDone(index) ? 1 : 0);
      }, 0);
      return Math.round(completedSteps / totalSteps * 100);
    });
    common_vendor.onLoad(() => {
      const cached = common_vendor.index.getStorageSync("project_base_info");
      if (cached) {
        try {
          baseTable.value = JSON.parse(cached);
          common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1840", "[Cache] 恢复缓存的项目信息，共", baseTable.value.length, "条");
          common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1841", "baseTable项目信息，", baseTable.value);
        } catch (e) {
          common_vendor.index.__f__("warn", "at pages/reports/acceptance/index.vue:1843", "[Cache] 缓存数据解析失败:", e);
        }
      }
    });
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
          type: "cloud-upload",
          size: "9",
          color: "#166534"
        }),
        f: common_vendor.o(handleFileSelect),
        g: common_vendor.o(handleFileDelete),
        h: common_vendor.o(($event) => eiaFiles.value = $event),
        i: common_vendor.p({
          fileMediatype: "all",
          ["auto-upload"]: false,
          limit: 100,
          modelValue: eiaFiles.value
        }),
        j: common_vendor.p({
          type: "search",
          size: "16",
          color: "#ffffff"
        }),
        k: common_vendor.o(simulateExtract),
        l: baseTable.value.length
      }, baseTable.value.length ? common_vendor.e({
        m: common_vendor.p({
          type: "list",
          size: "18",
          color: "#166534"
        }),
        n: common_vendor.p({
          type: "plus",
          size: "16",
          color: "#166534"
        }),
        o: common_vendor.o(openAddBase),
        p: selectMode.value
      }, selectMode.value ? {
        q: common_vendor.p({
          type: "trash",
          size: "16",
          color: "#ffffff"
        }),
        r: common_vendor.t(selectedIds.value.length),
        s: !selectedIds.value.length,
        t: common_vendor.o(removeSelected)
      } : {}, {
        v: common_vendor.p({
          type: selectMode.value ? "clear" : "checkbox",
          size: "16",
          color: "#155e3b"
        }),
        w: common_vendor.t(selectMode.value ? "取消" : "选择删除"),
        x: common_vendor.o(toggleSelectMode),
        y: common_vendor.f(baseTable.value, (item, idx, i0) => {
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
                a: common_vendor.t(water.产生环节 || "-"),
                b: common_vendor.t(water.污染物名称 || "-"),
                c: common_vendor.t(water.污染治理措施 || "-"),
                d: common_vendor.t(water.排放去向 || "-"),
                e: common_vendor.t(water.执行标准 || "-"),
                f: "water-" + index
              };
            })
          } : {}, {
            f: item.value.大气污染物 && item.value.大气污染物.length
          }, item.value.大气污染物 && item.value.大气污染物.length ? {
            g: common_vendor.f(item.value.大气污染物, (air, index, i1) => {
              return {
                a: common_vendor.t(air.产生环节 || "-"),
                b: common_vendor.t(air.污染物名称 || "-"),
                c: common_vendor.t(air.污染治理措施 || "-"),
                d: common_vendor.t(air.排放去向 || "-"),
                e: common_vendor.t(air.执行标准 || "-"),
                f: "air-" + index
              };
            })
          } : {}, {
            h: item.value.噪声 && item.value.噪声.length
          }, item.value.噪声 && item.value.噪声.length ? {
            i: common_vendor.f(item.value.噪声, (noise, index, i1) => {
              return {
                a: common_vendor.t(noise.产生环节 || "-"),
                b: common_vendor.t(noise.污染物名称 || "-"),
                c: common_vendor.t(noise.污染治理措施 || "-"),
                d: common_vendor.t(noise.排放去向 || "-"),
                e: common_vendor.t(noise.执行标准 || "-"),
                f: "noise-" + index
              };
            })
          } : {}, {
            j: selectMode.value
          }, selectMode.value ? {
            k: selectedIds.value.includes(item.id),
            l: common_vendor.o(() => toggleSelected(item.id), item.id)
          } : {}) : common_vendor.e({
            m: common_vendor.t(item.label),
            n: item.source === "extracted"
          }, item.source === "extracted" ? {} : {}, {
            o: "41308e16-9-" + i0 + ",41308e16-0",
            p: common_vendor.o(($event) => item.value = $event, item.id),
            q: common_vendor.p({
              placeholder: "请输入具体的值",
              clearable: true,
              modelValue: item.value
            }),
            r: selectMode.value
          }, selectMode.value ? {
            s: selectedIds.value.includes(item.id),
            t: common_vendor.o(() => toggleSelected(item.id), item.id)
          } : {}), {
            v: item.id
          });
        }),
        z: common_vendor.p({
          type: "list",
          size: "18",
          color: "#fb923c"
        }),
        A: common_vendor.p({
          type: "eye-filled",
          size: "16",
          color: "#ffffff"
        }),
        B: common_vendor.o(() => {
          generateSignboard();
          showSignboard.value = true;
        }),
        C: showSignboard.value
      }, showSignboard.value ? {
        D: common_vendor.p({
          type: "download-filled",
          size: "16",
          color: "#ffffff"
        }),
        E: common_vendor.o((...args) => _ctx.downBiaoShi && _ctx.downBiaoShi(...args))
      } : {}, {
        F: showSignboard.value
      }, showSignboard.value ? {
        G: common_vendor.p({
          type: "redo-filled",
          size: "16",
          color: "#ffffff"
        }),
        H: common_vendor.o(($event) => currentStep.value = 1)
      } : {}, {
        I: showSignboard.value
      }, showSignboard.value ? {
        J: common_vendor.f(signboard.sections, (sec, si, i0) => {
          return {
            a: common_vendor.t(sec.block),
            b: "41308e16-14-" + i0 + ",41308e16-0",
            c: common_vendor.o(() => addSignItem(si), "s" + si),
            d: common_vendor.f(groupItems(sec.items), (group, gi, i1) => {
              return {
                a: common_vendor.f(group, (it, ii, i2) => {
                  return {
                    a: "41308e16-15-" + i0 + "-" + i1 + "-" + i2 + ",41308e16-0",
                    b: common_vendor.o(($event) => it.title = $event, "r" + si + "-" + gi + "-" + ii),
                    c: common_vendor.p({
                      placeholder: "内容标题",
                      modelValue: it.title
                    }),
                    d: "41308e16-16-" + i0 + "-" + i1 + "-" + i2 + ",41308e16-0",
                    e: common_vendor.o(($event) => it.content = $event, "r" + si + "-" + gi + "-" + ii),
                    f: common_vendor.p({
                      placeholder: "请输入具体的值",
                      modelValue: it.content
                    }),
                    g: "r" + si + "-" + gi + "-" + ii
                  };
                }),
                b: "41308e16-17-" + i0 + "-" + i1 + ",41308e16-0",
                c: common_vendor.o(() => removeGroup(sec, gi), "g" + si + "-" + gi),
                d: "g" + si + "-" + gi
              };
            }),
            e: "s" + si
          };
        }),
        K: common_vendor.p({
          type: "plus",
          size: "16",
          color: "#166534"
        }),
        L: common_vendor.p({
          type: "trash",
          size: "16",
          color: "#d92d20"
        })
      } : {}) : {}, {
        M: currentStep.value === 0,
        N: common_vendor.p({
          type: "clipboard",
          size: "20",
          color: "#166534"
        }),
        O: common_vendor.p({
          type: "gear",
          size: "16",
          color: "#ffffff"
        }),
        P: common_vendor.o(generateDatasheet),
        Q: common_vendor.p({
          type: "download",
          size: "16",
          color: "#155e3b"
        }),
        R: common_vendor.o(exportDatasheet),
        S: datasheet.value.length
      }, datasheet.value.length ? {
        T: common_vendor.f(datasheet.value, (d, i, i0) => {
          return {
            a: "41308e16-21-" + i0 + ",41308e16-0",
            b: common_vendor.o(($event) => d.label = $event, d.id),
            c: common_vendor.p({
              placeholder: "字段名",
              modelValue: d.label
            }),
            d: "41308e16-22-" + i0 + ",41308e16-0",
            e: common_vendor.o(($event) => d.value = $event, d.id),
            f: common_vendor.p({
              placeholder: "值",
              modelValue: d.value
            }),
            g: "41308e16-23-" + i0 + ",41308e16-0",
            h: common_vendor.o(($event) => d.type = $event, d.id),
            i: common_vendor.p({
              localdata: datasheetTypeOptions,
              placeholder: "类型",
              modelValue: d.type
            }),
            j: "41308e16-24-" + i0 + ",41308e16-0",
            k: common_vendor.o(($event) => d.status = $event, d.id),
            l: common_vendor.p({
              localdata: verifyOptions,
              placeholder: "状态",
              modelValue: d.status
            }),
            m: "41308e16-25-" + i0 + ",41308e16-0",
            n: common_vendor.o(() => removeDatasheet(i), d.id),
            o: d.id
          };
        }),
        U: common_vendor.p({
          type: "trash",
          size: "16",
          color: "#d92d20"
        })
      } : {
        V: common_vendor.p({
          type: "document",
          size: "48",
          color: "#cbd5e1"
        })
      }, {
        W: currentStep.value === 1,
        X: common_vendor.p({
          type: "map-pin-ellipse",
          size: "20",
          color: "#166534"
        }),
        Y: fieldworkRecord.value,
        Z: common_vendor.o(($event) => fieldworkRecord.value = $event.detail.value),
        aa: common_vendor.p({
          type: "list",
          size: "18",
          color: "#166534"
        }),
        ab: common_vendor.p({
          type: "gear",
          size: "16",
          color: "#ffffff"
        }),
        ac: common_vendor.o(generateFieldworkComparison),
        ad: common_vendor.p({
          type: "plus",
          size: "16",
          color: "#155e3b"
        }),
        ae: common_vendor.o(addComparisonItem),
        af: fieldworkComparison.value.length
      }, fieldworkComparison.value.length ? {
        ag: common_vendor.f(fieldworkComparison.value, (item, index, i0) => {
          return {
            a: "41308e16-31-" + i0 + ",41308e16-0",
            b: common_vendor.o(($event) => item.project = $event, item.id),
            c: common_vendor.p({
              placeholder: "项目名称",
              modelValue: item.project
            }),
            d: "41308e16-32-" + i0 + ",41308e16-0",
            e: common_vendor.o(($event) => item.eiaRequirement = $event, item.id),
            f: common_vendor.p({
              placeholder: "环评要求",
              modelValue: item.eiaRequirement
            }),
            g: "41308e16-33-" + i0 + ",41308e16-0",
            h: common_vendor.o(($event) => item.fieldSituation = $event, item.id),
            i: common_vendor.p({
              placeholder: "现场情况",
              modelValue: item.fieldSituation
            }),
            j: "41308e16-34-" + i0 + ",41308e16-0",
            k: common_vendor.o(($event) => item.difference = $event, item.id),
            l: common_vendor.p({
              placeholder: "差异说明",
              modelValue: item.difference
            }),
            m: "41308e16-35-" + i0 + ",41308e16-0",
            n: common_vendor.o(() => removeComparisonItem(index), item.id),
            o: item.id
          };
        }),
        ah: common_vendor.p({
          type: "trash",
          size: "16",
          color: "#d92d20"
        })
      } : {
        ai: common_vendor.p({
          type: "map-pin-ellipse",
          size: "48",
          color: "#cbd5e1"
        })
      }, {
        aj: common_vendor.p({
          type: "refresh",
          size: "18",
          color: "#166534"
        }),
        ak: common_vendor.o(($event) => updateBaseInfo(false)),
        al: common_vendor.o(($event) => updateBaseInfo(true)),
        am: currentStep.value === 2,
        an: common_vendor.p({
          type: "eye",
          size: "20",
          color: "#166534"
        }),
        ao: common_vendor.p({
          type: "magic",
          size: "16",
          color: "#ffffff"
        }),
        ap: common_vendor.o(recommendPlan),
        aq: common_vendor.p({
          type: "plus",
          size: "16",
          color: "#155e3b"
        }),
        ar: common_vendor.o(addPlanItem),
        as: common_vendor.p({
          type: "download",
          size: "16",
          color: "#5b6b7b"
        }),
        at: common_vendor.o(downloadMonitorTemplate),
        av: plan.value.length
      }, plan.value.length ? {
        aw: common_vendor.f(plan.value, (item, index, i0) => {
          return {
            a: "41308e16-42-" + i0 + ",41308e16-0",
            b: common_vendor.o(($event) => item.factor = $event, item.id),
            c: common_vendor.p({
              placeholder: "监测因子",
              modelValue: item.factor
            }),
            d: "41308e16-43-" + i0 + ",41308e16-0",
            e: common_vendor.o(($event) => item.point = $event, item.id),
            f: common_vendor.p({
              placeholder: "监测点位",
              modelValue: item.point
            }),
            g: "41308e16-44-" + i0 + ",41308e16-0",
            h: common_vendor.o(($event) => item.method = $event, item.id),
            i: common_vendor.p({
              placeholder: "监测方法",
              modelValue: item.method
            }),
            j: "41308e16-45-" + i0 + ",41308e16-0",
            k: common_vendor.o(($event) => item.frequency = $event, item.id),
            l: common_vendor.p({
              placeholder: "监测频次",
              modelValue: item.frequency
            }),
            m: "41308e16-46-" + i0 + ",41308e16-0",
            n: common_vendor.o(($event) => item.qaqc = $event, item.id),
            o: common_vendor.p({
              placeholder: "质控要求",
              modelValue: item.qaqc
            }),
            p: "41308e16-47-" + i0 + ",41308e16-0",
            q: common_vendor.o(($event) => item.remark = $event, item.id),
            r: common_vendor.p({
              placeholder: "备注",
              modelValue: item.remark
            }),
            s: "41308e16-48-" + i0 + ",41308e16-0",
            t: common_vendor.o(() => duplicatePlanItem(index), item.id),
            v: "41308e16-49-" + i0 + ",41308e16-0",
            w: common_vendor.o(() => movePlanItem(index, -1), item.id),
            x: index === 0,
            y: "41308e16-50-" + i0 + ",41308e16-0",
            z: common_vendor.o(() => movePlanItem(index, 1), item.id),
            A: index === plan.value.length - 1,
            B: "41308e16-51-" + i0 + ",41308e16-0",
            C: common_vendor.o(() => removePlanItem(index), item.id),
            D: item.id
          };
        }),
        ax: common_vendor.p({
          type: "copy",
          size: "16",
          color: "#166534"
        }),
        ay: common_vendor.p({
          type: "arrow-up",
          size: "16",
          color: "#166534"
        }),
        az: common_vendor.p({
          type: "arrow-down",
          size: "16",
          color: "#166534"
        }),
        aA: common_vendor.p({
          type: "trash",
          size: "16",
          color: "#d92d20"
        })
      } : {
        aB: common_vendor.p({
          type: "eye",
          size: "48",
          color: "#cbd5e1"
        })
      }, {
        aC: common_vendor.p({
          type: "checkmark",
          size: "16",
          color: "#ffffff"
        }),
        aD: common_vendor.o(saveMonitorPlan),
        aE: currentStep.value === 3,
        aF: common_vendor.p({
          type: "document",
          size: "20",
          color: "#166534"
        }),
        aG: common_vendor.f(reportTypes, (type, k0, i0) => {
          return {
            a: type.value,
            b: reportType.value === type.value,
            c: common_vendor.t(type.text),
            d: type.value
          };
        }),
        aH: common_vendor.o(onReportTypeChange),
        aI: reportType.value === "withData"
      }, reportType.value === "withData" ? {
        aJ: common_vendor.o(($event) => testReportFiles.value = $event),
        aK: common_vendor.p({
          fileMediatype: "all",
          ["auto-upload"]: false,
          limit: 3,
          modelValue: testReportFiles.value
        })
      } : {}, {
        aL: common_vendor.p({
          type: "gear",
          size: "16",
          color: "#ffffff"
        }),
        aM: common_vendor.o(generateAcceptanceReport),
        aN: common_vendor.p({
          type: "eye",
          size: "16",
          color: "#155e3b"
        }),
        aO: common_vendor.o(previewReport),
        aP: !reportGenerated.value,
        aQ: common_vendor.p({
          type: "download",
          size: "16",
          color: "#5b6b7b"
        }),
        aR: common_vendor.o(exportReport),
        aS: !reportGenerated.value,
        aT: reportGenerated.value
      }, reportGenerated.value ? common_vendor.e({
        aU: common_vendor.p({
          type: "checkmark-circle",
          size: "18",
          color: "#166534"
        }),
        aV: reportType.value === "withData"
      }, reportType.value === "withData" ? {} : {}) : {
        aW: common_vendor.p({
          type: "document",
          size: "48",
          color: "#cbd5e1"
        })
      }, {
        aX: currentStep.value === 4,
        aY: common_vendor.p({
          type: "left",
          size: "16",
          color: "#5b6b7b"
        }),
        aZ: currentStep.value === 0,
        ba: common_vendor.o(prevStep),
        bb: common_vendor.p({
          type: "right",
          size: "16",
          color: "#ffffff"
        }),
        bc: currentStep.value === stepNames.length - 1,
        bd: common_vendor.o(nextStep),
        be: common_vendor.p({
          current: "pages/reports/acceptance/index"
        }),
        bf: common_vendor.o(($event) => newBaseInfoLabel.value = $event),
        bg: common_vendor.p({
          placeholder: "如：项目名称/单位名称",
          modelValue: newBaseInfoLabel.value
        }),
        bh: common_vendor.o(closeBaseInfo),
        bi: common_vendor.o(confirmAddBaseInfo),
        bj: common_vendor.sr(newBaseInfoPopup, "41308e16-63", {
          "k": "newBaseInfoPopup"
        }),
        bk: common_vendor.p({
          type: "center"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-41308e16"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/reports/acceptance/index.js.map
