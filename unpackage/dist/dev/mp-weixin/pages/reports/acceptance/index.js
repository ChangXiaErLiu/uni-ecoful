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
  (_easycom_uni_data_select + _easycom_uni_icons + ecoFilePicker + _easycom_uni_easyinput + _easycom_uni_file_picker + AppLayout + _easycom_uni_popup)();
}
const AppLayout = () => "../../../components/layout/AppLayout.js";
const ecoFilePicker = () => "../../../components/eco-file-picker/uni-file-picker.js";
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
          return tizidanItems.value.some((item) => item.submitted);
        case 3:
          return fieldworkComparison.value.length > 0;
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
    async function loadFileListOnMount() {
      const files = await api_acceptance.fetchUploadedFiles();
      eiaFiles.value = files;
    }
    const extracting = common_vendor.ref(false);
    common_vendor.ref("");
    function showUploadResult({
      successCount,
      failCount,
      total
    }) {
      if (failCount === 0 && successCount === total) {
        common_vendor.index.showToast({
          title: `上传成功 (${successCount}个文件)`,
          icon: "success",
          duration: 2e3
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
      common_vendor.index.showLoading({
        title: "正在上传文件...",
        mask: true
      });
      const stats = {
        successCount: 0,
        failCount: 0,
        total: supportedFiles.length
      };
      for (let i = 0; i < supportedFiles.length; i++) {
        const file = supportedFiles[i];
        try {
          const result = await api_acceptance.uploadFileToBackend(file);
          stats.successCount++;
          await loadFileListOnMount();
          common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:776", `文件已上传: ${result.filename}`);
        } catch (error) {
          stats.failCount++;
          common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:779", `❌ 文件 ${i + 1} 上传失败:`, error);
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
      common_vendor.index.hideLoading();
      showUploadResult(stats);
    }
    async function handleFileDelete(e) {
      const file = e.tempFile;
      if (!file || !file.document_id)
        return;
      const confirm = await new Promise((resolve) => {
        common_vendor.index.showModal({
          title: "确认删除？",
          content: `确定删除文件 "${file.name}" 吗？`,
          confirmText: "删除",
          confirmColor: "#E64340",
          success: (res) => resolve(res.confirm)
        });
      });
      if (!confirm) {
        await loadFileListOnMount();
        return;
      }
      try {
        await api_acceptance.deleteFile(file.document_id);
        await loadFileListOnMount();
        common_vendor.index.showToast({
          title: "文件已删除",
          icon: "success"
        });
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:835", "删除失败:", err);
        await loadFileListOnMount();
        common_vendor.index.showToast({
          title: "删除失败，请重试",
          icon: "none"
        });
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
      common_vendor.index.showLoading({
        title: "检查文件...",
        mask: true
      });
      await loadFileListOnMount();
      common_vendor.index.hideLoading();
      if (eiaFiles.value.length === 0) {
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
        const result = await api_acceptance.runTask({
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
        common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:989", "[Extract] 提取成功:", result);
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
        common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:1006", "[Extract] 提取失败:", error);
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
      common_vendor.index.showLoading({
        title: "正在生成文档…"
      });
      api_acceptance.downloadSignboardWord(signboard).then((buf) => {
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
    let monitorProgressTimer = null;
    let monitorCurrentPercent = 0;
    let monitorSprintTimer = null;
    let monitorProgressDone = false;
    function startMonitorFakeProgress(totalTime = 18e4) {
      monitorCurrentPercent = 0;
      monitorProgressDone = false;
      const step = 99 / (totalTime / 200);
      monitorProgressTimer = setInterval(() => {
        if (monitorProgressDone) {
          clearInterval(monitorProgressTimer);
          monitorProgressTimer = null;
          return;
        }
        monitorCurrentPercent += step;
        if (monitorCurrentPercent >= 99) {
          monitorCurrentPercent = 99;
          clearInterval(monitorProgressTimer);
          monitorProgressTimer = null;
        }
        common_vendor.index.showLoading({
          title: `正在生成监测方案... ${Math.floor(monitorCurrentPercent)}%`,
          mask: true
        });
      }, 200);
    }
    function sprintMonitorToComplete() {
      monitorProgressDone = true;
      if (monitorProgressTimer) {
        clearInterval(monitorProgressTimer);
        monitorProgressTimer = null;
      }
      const startPercent = monitorCurrentPercent;
      const targetPercent = 100;
      const duration = 1e3;
      const stepTime = 10;
      const totalSteps = duration / stepTime;
      const stepValue = (targetPercent - startPercent) / totalSteps;
      let currentStep2 = 0;
      monitorSprintTimer = setInterval(() => {
        currentStep2++;
        monitorCurrentPercent = startPercent + stepValue * currentStep2;
        if (monitorCurrentPercent >= 100) {
          monitorCurrentPercent = 100;
          clearInterval(monitorSprintTimer);
          monitorSprintTimer = null;
          common_vendor.index.showLoading({
            title: `正在生成监测方案... 100%`,
            mask: true
          });
          setTimeout(() => {
            common_vendor.index.hideLoading();
            common_vendor.index.showModal({
              title: "监测方案已下载",
              content: "文件已下载，请到下载目录或保存路径查看！",
              showCancel: false,
              confirmText: "确定"
            });
          }, 500);
          plan.value = true;
          return;
        }
        common_vendor.index.showLoading({
          title: `正在生成监测方案... ${Math.floor(monitorCurrentPercent)}%`,
          mask: true
        });
      }, stepTime);
    }
    async function saveMonitorPlan() {
      startMonitorFakeProgress(18e4);
      try {
        const arrayBuffer = await api_acceptance.downloadMonitorPlan({
          timeout: 3e5
        });
        sprintMonitorToComplete();
        await saveMonitorPlanFile(arrayBuffer);
      } catch (error) {
        monitorProgressDone = true;
        if (monitorProgressTimer) {
          clearInterval(monitorProgressTimer);
          monitorProgressTimer = null;
        }
        if (monitorSprintTimer) {
          clearInterval(monitorSprintTimer);
          monitorSprintTimer = null;
        }
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:1476", "生成监测方案失败:", error);
        common_vendor.index.showModal({
          title: "生成失败",
          content: error.message || "监测方案生成失败，请稍后重试",
          showCancel: false
        });
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
                common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:1525", "打开文档失败:", err);
                reject(new Error("文件已保存，但打开失败"));
              }
            });
          },
          fail: (err) => {
            common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:1531", "保存文件失败:", err);
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
        common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1557", "开始请求数据...");
        const response = await new Promise((resolve, reject) => {
          common_vendor.index.request({
            url: "http://172.16.1.61:8000/api/v1/completion/datasheet",
            method: "GET",
            timeout: 1e4,
            data: {
              memberId: 3
            },
            success: (res) => {
              common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1569", "请求成功:", res);
              resolve(res);
            },
            fail: (err) => {
              common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1573", "请求失败:", err);
              reject(err);
            }
          });
        });
        common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1579", "完整响应对象:", response);
        common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1580", "响应状态码:", response.statusCode);
        common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1581", "响应数据:", response.data);
        if (response && response.statusCode === 200) {
          common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1585", "状态码为200，开始解析数据");
          if (!response.data) {
            throw new Error("响应数据为空");
          }
          const data = response.data;
          common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1593", "解析后的数据:", data);
          if (!data.items || !Array.isArray(data.items)) {
            throw new Error("数据格式不正确: items 不存在或不是数组");
          }
          tizidanItems.value = data.items;
          downloadUrls.value = data.download_urls || {};
          common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1603", "最终设置的数据:", {
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
        common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:1616", "获取提资单数据失败:", error);
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
            url: "http://127.0.0.1:8000/api/v1/completion/tzdDetail/datasheet",
            method: "GET",
            timeout: 1e4,
            data: {
              memberId: 3
            },
            success: (res) => {
              common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1646", "请求成功:", res);
              resolve(res);
            },
            fail: (err) => {
              common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1650", "请求失败:", err);
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
          common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1664", "test", data.download_urls);
          const downloadUrlsData = data.download_urls || {};
          downloadUrls.value = {
            acceptance_report: formatDownloadUrl(downloadUrlsData.tzd_doc),
            comparison_list: formatDownloadUrl(downloadUrlsData.comparison_list)
          };
          common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1672", "下载URL设置:", downloadUrls.value);
          common_vendor.index.showToast({
            title: "数据加载成功",
            icon: "success"
          });
        } else {
          throw new Error(`请求失败，状态码：${(response == null ? void 0 : response.statusCode) || "未知"}`);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:1682", "获取提资单数据失败:", error);
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
        return `http://127.0.0.1:8000${url}`;
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
        common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:1755", "下载失败:", error);
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
                  common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1797", "文件保存成功:", saveRes.savedFilePath);
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
              common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1848", "开始提交项目:", index, tizidanItems.value[index].text);
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
                    common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1864", "提交响应:", res2);
                    resolve(res2);
                  },
                  fail: (err) => {
                    common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1868", "提交失败:", err);
                    reject(err);
                  }
                });
              });
              common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1874", "提交完整响应:", response);
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
              common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:1893", "提交失败:", error);
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
    common_vendor.onLoad(() => {
      loadFileListOnMount();
      const cached = common_vendor.index.getStorageSync("project_base_info");
      if (cached) {
        try {
          baseTable.value = JSON.parse(cached);
          common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:2151", "[Cache] 恢复缓存的项目信息，共", baseTable.value.length, "条");
        } catch (e) {
          common_vendor.index.__f__("warn", "at pages/reports/acceptance/index.vue:2154", "[Cache] 缓存数据解析失败:", e);
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
          size: "20",
          color: "#166534"
        }),
        f: common_vendor.o(handleFileSelect),
        g: common_vendor.o(handleFileDelete),
        h: common_vendor.o(($event) => eiaFiles.value = $event),
        i: common_vendor.p({
          ["file-mediatype"]: "all",
          ["file-extname"]: "pdf,docx,md,doc,ppt,pptx,png,jpg,jpeg",
          fileMediatype: "all",
          ["auto-upload"]: false,
          limit: "50",
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
        E: common_vendor.o(downBiaoShi)
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
          return common_vendor.e({
            a: common_vendor.t(sec.block),
            b: sec.block == "噪声"
          }, sec.block == "噪声" ? {
            c: "41308e16-14-" + i0 + ",41308e16-0",
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
                })
              }, sec.block !== "危险废物" ? {
                b: "41308e16-17-" + i0 + "-" + i1 + ",41308e16-0",
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
        K: currentStep.value === 0,
        L: common_vendor.p({
          type: "eye",
          size: "20",
          color: "#166534"
        }),
        M: common_vendor.p({
          type: "eye",
          size: "48",
          color: "#cbd5e1"
        }),
        N: common_vendor.p({
          type: "cloud-download-filled",
          size: "16",
          color: "#ffffff"
        }),
        O: common_vendor.o(saveMonitorPlan),
        P: plan.value
      }, plan.value ? {
        Q: common_vendor.p({
          type: "checkmark-circle",
          size: "18",
          color: "#166534"
        })
      } : {}, {
        R: currentStep.value === 1,
        S: tizidanItems.value.length === 0
      }, tizidanItems.value.length === 0 ? {
        T: common_vendor.p({
          type: "refresh",
          size: "48",
          color: "#cbd5e1"
        }),
        U: common_vendor.p({
          type: "refresh",
          size: "16",
          color: "#ffffff"
        }),
        V: common_vendor.o(fetchTizidanData)
      } : {
        W: common_vendor.f(tizidanItems.value, (item, index, i0) => {
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
        X: common_vendor.o(($event) => downloadFile(downloadUrls.value.acceptance_report, "验收报告提资单.docx")),
        Y: !downloadUrls.value.acceptance_report,
        Z: common_vendor.o(($event) => downloadFile(downloadUrls.value.comparison_list, "建设内容详细对比清单.docx")),
        aa: !downloadUrls.value.comparison_list,
        ab: currentStep.value === 2,
        ac: common_vendor.p({
          type: "map-pin-ellipse",
          size: "20",
          color: "#166534"
        }),
        ad: fieldworkRecord.value,
        ae: common_vendor.o(($event) => fieldworkRecord.value = $event.detail.value),
        af: common_vendor.p({
          type: "list",
          size: "18",
          color: "#166534"
        }),
        ag: common_vendor.p({
          type: "gear",
          size: "16",
          color: "#ffffff"
        }),
        ah: common_vendor.o(generateFieldworkComparison),
        ai: common_vendor.p({
          type: "plus",
          size: "16",
          color: "#155e3b"
        }),
        aj: common_vendor.o(addComparisonItem),
        ak: fieldworkComparison.value.length
      }, fieldworkComparison.value.length ? {
        al: common_vendor.f(fieldworkComparison.value, (item, index, i0) => {
          return {
            a: "41308e16-28-" + i0 + ",41308e16-0",
            b: common_vendor.o(($event) => item.project = $event, item.id),
            c: common_vendor.p({
              placeholder: "项目名称",
              modelValue: item.project
            }),
            d: "41308e16-29-" + i0 + ",41308e16-0",
            e: common_vendor.o(($event) => item.eiaRequirement = $event, item.id),
            f: common_vendor.p({
              placeholder: "环评要求",
              modelValue: item.eiaRequirement
            }),
            g: "41308e16-30-" + i0 + ",41308e16-0",
            h: common_vendor.o(($event) => item.fieldSituation = $event, item.id),
            i: common_vendor.p({
              placeholder: "现场情况",
              modelValue: item.fieldSituation
            }),
            j: "41308e16-31-" + i0 + ",41308e16-0",
            k: common_vendor.o(($event) => item.difference = $event, item.id),
            l: common_vendor.p({
              placeholder: "差异说明",
              modelValue: item.difference
            }),
            m: "41308e16-32-" + i0 + ",41308e16-0",
            n: common_vendor.o(() => removeComparisonItem(index), item.id),
            o: item.id
          };
        }),
        am: common_vendor.p({
          type: "trash",
          size: "16",
          color: "#d92d20"
        })
      } : {
        an: common_vendor.p({
          type: "map-pin-ellipse",
          size: "48",
          color: "#cbd5e1"
        })
      }, {
        ao: common_vendor.p({
          type: "refresh",
          size: "18",
          color: "#166534"
        }),
        ap: common_vendor.o(($event) => updateBaseInfo(false)),
        aq: common_vendor.o(($event) => updateBaseInfo(true)),
        ar: currentStep.value === 3,
        as: common_vendor.p({
          type: "document",
          size: "20",
          color: "#166534"
        }),
        at: common_vendor.f(reportTypes, (type, k0, i0) => {
          return {
            a: type.value,
            b: reportType.value === type.value,
            c: common_vendor.t(type.text),
            d: type.value
          };
        }),
        av: common_vendor.o(onReportTypeChange),
        aw: reportType.value === "withData"
      }, reportType.value === "withData" ? {
        ax: common_vendor.o(($event) => testReportFiles.value = $event),
        ay: common_vendor.p({
          fileMediatype: "all",
          ["auto-upload"]: false,
          limit: 3,
          modelValue: testReportFiles.value
        })
      } : {}, {
        az: common_vendor.p({
          type: "cloud-download-filled",
          size: "16",
          color: "#ffffff"
        }),
        aA: common_vendor.o(generateAcceptanceReport),
        aB: reportGenerated.value
      }, reportGenerated.value ? common_vendor.e({
        aC: common_vendor.p({
          type: "checkmark-circle",
          size: "18",
          color: "#166534"
        }),
        aD: reportType.value === "withData"
      }, reportType.value === "withData" ? {} : {}) : {}, {
        aE: currentStep.value === 4,
        aF: common_vendor.p({
          type: "left",
          size: "16",
          color: "#5b6b7b"
        }),
        aG: currentStep.value === 0,
        aH: common_vendor.o(prevStep),
        aI: common_vendor.p({
          type: "right",
          size: "16",
          color: "#ffffff"
        }),
        aJ: currentStep.value === stepNames.length - 1,
        aK: common_vendor.o(nextStep),
        aL: common_vendor.p({
          current: "pages/reports/acceptance/index"
        }),
        aM: common_vendor.o(($event) => newBaseInfoLabel.value = $event),
        aN: common_vendor.p({
          placeholder: "如：项目名称/单位名称",
          modelValue: newBaseInfoLabel.value
        }),
        aO: common_vendor.o(closeBaseInfo),
        aP: common_vendor.o(confirmAddBaseInfo),
        aQ: common_vendor.sr(newBaseInfoPopup, "41308e16-41", {
          "k": "newBaseInfoPopup"
        }),
        aR: common_vendor.p({
          type: "center"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-41308e16"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/reports/acceptance/index.js.map
