"use strict";
const common_vendor = require("../../../common/vendor.js");
const utils_platform = require("../../../utils/platform.js");
const composables_useProjectInfo = require("../../../composables/useProjectInfo.js");
const composables_useFieldSurveyData = require("../../../composables/useFieldSurveyData.js");
const composables_useMonitorPlan = require("../../../composables/useMonitorPlan.js");
const composables_useAcceptanceReport = require("../../../composables/useAcceptanceReport.js");
const stores_navTitle = require("../../../stores/navTitle.js");
if (!Array) {
  const _easycom_uni_data_select2 = common_vendor.resolveComponent("uni-data-select");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  const _component_tizidan_footer = common_vendor.resolveComponent("tizidan-footer");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_data_select2 + _easycom_uni_icons2 + _easycom_uni_easyinput2 + _component_tizidan_footer + _easycom_uni_popup2)();
}
const _easycom_uni_data_select = () => "../../../uni_modules/uni-data-select/components/uni-data-select/uni-data-select.js";
const _easycom_uni_icons = () => "../../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_easyinput = () => "../../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_uni_popup = () => "../../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_data_select + ProjectInfoContainer + MonitorPlanContainer + _easycom_uni_icons + _easycom_uni_easyinput + FieldSurveyContainer + AcceptanceReportContainer + AppLayout + _easycom_uni_popup + TaskProgressModal)();
}
const AppLayout = () => "../../../components/layout/AppLayout.js";
const TaskProgressModal = () => "../../../components/message-pop-up/TaskProgressModal.js";
const ProjectInfoContainer = () => "../../../components/acceptance-report/ProjectInfoContainer.js";
const FieldSurveyContainer = () => "../../../components/field-survey/FieldSurveyContainer.js";
const MonitorPlanContainer = () => "../../../components/monitor-plan/MonitorPlanContainer.js";
const AcceptanceReportContainer = () => "../../../components/acceptance-report/AcceptanceReportContainer.js";
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
    const stepNames = ["选择项目与提取信息", "监测方案", "提资单比对", "现场踏勘比对", "竣工验收报告"];
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
    const projectInfoState = composables_useProjectInfo.useProjectInfo();
    const {
      selectedProjectId,
      filteredProjects,
      projectSearchKeyword
    } = projectInfoState;
    function stepDone(i) {
      switch (i) {
        case 0:
          return projectInfoState.extractionOk.value;
        case 1:
          return monitorPlanState.canDownload.value;
        case 2:
          return tizidanItems.value && tizidanItems.value.some((item) => item.submitted);
        case 3:
          return fieldSurveyData.fieldworkComparison && fieldSurveyData.fieldworkComparison.value && fieldSurveyData.fieldworkComparison.value.length > 0;
        case 4:
          return acceptanceReportState.canDownloadReport.value;
        default:
          return false;
      }
    }
    function handleExtractionComplete() {
    }
    common_vendor.onLoad(async () => {
      await projectInfoState.initialize();
      await common_vendor.nextTick$1();
      if (selectedProjectId.value) {
        common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:788", "📦 页面加载时恢复缓存，项目ID:", selectedProjectId.value);
        monitorPlanState.loadPlanCache(selectedProjectId.value);
        acceptanceReportState.loadReportCache(selectedProjectId.value);
      } else {
        common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:792", "ℹ️ 页面加载时无选中项目，跳过缓存加载");
      }
    });
    common_vendor.onUnmounted(() => {
      projectInfoState.cleanup();
    });
    const monitorPlanState = composables_useMonitorPlan.useMonitorPlan();
    function handlePlanGenerated() {
    }
    const fieldSurveyData = composables_useFieldSurveyData.useFieldSurveyData();
    const acceptanceReportState = composables_useAcceptanceReport.useAcceptanceReport();
    function handleReportGenerated() {
    }
    const project_id = common_vendor.index.getStorageSync("acceptance_project_id");
    const userInfoStr = common_vendor.index.getStorageSync("userInfo");
    const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
    const user_id = (userInfo == null ? void 0 : userInfo.id) || (userInfo == null ? void 0 : userInfo.user_id);
    const tizidanItems = common_vendor.ref([]);
    common_vendor.ref({});
    const contactPerson = common_vendor.ref("");
    const contactPhone = common_vendor.ref("");
    const contactEmail = common_vendor.ref("");
    async function generateAndDownloadTizidan() {
      if (!selectedProjectId.value) {
        common_vendor.index.showToast({
          title: "请先选择项目",
          icon: "none"
        });
        return;
      }
      if (!contactPerson.value.trim()) {
        common_vendor.index.showToast({
          title: "请输入接收资料的联系人",
          icon: "none"
        });
        return;
      }
      if (!contactPhone.value.trim()) {
        common_vendor.index.showToast({
          title: "请输入电话",
          icon: "none"
        });
        return;
      }
      if (!contactEmail.value.trim()) {
        common_vendor.index.showToast({
          title: "请输入邮箱",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showLoading({
        title: "正在生成文档…",
        mask: true
      });
      try {
        const url = eco_baseUrl + "/api/v1/completion/tzdDetail/generate_and_download_tzd_doc";
        const formData = {
          user_id,
          project_id,
          contact_person: contactPerson.value,
          contact_phone: contactPhone.value,
          contact_email: contactEmail.value
        };
        const response = await new Promise((resolve, reject) => {
          common_vendor.index.request({
            url,
            method: "POST",
            header: {
              "Content-Type": "application/json"
            },
            data: formData,
            success: (res) => resolve(res),
            fail: (err) => reject(err)
          });
        });
        if (response.statusCode === 200) {
          const data = response.data;
          if (data.success) {
            if (data.download_url) {
              setTimeout(() => {
                downloadGeneratedFile(data.download_url, data.file_name);
              }, 1e3);
              common_vendor.index.showToast({
                title: "文档生成成功，开始下载",
                icon: "success"
              });
            } else {
              common_vendor.index.showToast({
                title: data.message || "生成成功",
                icon: "success"
              });
            }
          } else {
            throw new Error(data.message || "生成文档失败");
          }
        } else {
          throw new Error(`请求失败，状态码：${response.statusCode}`);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:938", "生成提资单失败:", error);
        common_vendor.index.showToast({
          title: "生成失败: " + (error.message || "未知错误"),
          icon: "none",
          duration: 3e3
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    }
    async function downloadGeneratedFile(downloadUrl, fileName) {
      try {
        const fullUrl = eco_baseUrl + downloadUrl;
        common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:955", "开始下载文件:", fullUrl);
        common_vendor.index.showLoading({
          title: "正在下载文档…",
          mask: true
        });
        const downloadTask = common_vendor.index.downloadFile({
          url: fullUrl,
          success: (res) => {
            common_vendor.index.hideLoading();
            if (res.statusCode === 200) {
              const tempFilePath = res.tempFilePath;
              common_vendor.index.saveFile({
                tempFilePath,
                success: (saveRes) => {
                  common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:984", "文件保存成功:", saveRes.savedFilePath);
                  common_vendor.index.showToast({
                    title: "文件已保存",
                    icon: "success"
                  });
                },
                fail: (saveErr) => {
                  common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:991", "保存文件失败:", saveErr);
                  common_vendor.index.showToast({
                    title: "保存失败: " + (saveErr.errMsg || "未知错误"),
                    icon: "none"
                  });
                }
              });
            } else {
              common_vendor.index.showToast({
                title: `下载失败，状态码: ${res.statusCode}`,
                icon: "none"
              });
            }
          },
          fail: (err) => {
            common_vendor.index.hideLoading();
            common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:1007", "下载请求失败:", err);
            common_vendor.index.showToast({
              title: "下载请求失败: " + (err.errMsg || "未知错误"),
              icon: "none"
            });
          }
        });
        downloadTask.onProgressUpdate((res) => {
          common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1017", "下载进度", res.progress);
          common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1018", "已经下载的数据长度", res.totalBytesWritten);
          common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1019", "预期需要下载的数据总长度", res.totalBytesExpectedToWrite);
        });
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:1059", "下载文件失败:", error);
        common_vendor.index.showToast({
          title: "下载失败: " + (error.message || "未知错误"),
          icon: "none"
        });
      }
    }
    async function toggleRequired(item) {
      var _a;
      if (!item || !item.record_id) {
        common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:1084", "切换复选框失败：item或record_id不存在");
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
              common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1114", "更新is_require成功:", res);
              resolve(res);
            },
            fail: (err) => {
              common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:1118", "更新is_require失败:", err);
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
        common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:1138", "切换复选框失败:", error);
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
          common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:1420", "选择文件失败:", err);
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
              common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:1495", "删除文件失败:", error);
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
              common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1524", "请求成功:", res);
              resolve(res);
            },
            fail: (err) => {
              common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1528", "请求失败:", err);
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
          common_vendor.index.__f__("log", "at pages/reports/acceptance/index.vue:1544", "提资单数据加载完成:", tizidanItems.value);
          common_vendor.index.showToast({
            title: "数据加载成功",
            icon: "success"
          });
        } else {
          throw new Error(`请求失败，状态码：${(response == null ? void 0 : response.statusCode) || "未知"}`);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:1554", "获取提资单数据失败:", error);
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
        common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:1609", `文件上传失败:`, error);
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
        common_vendor.index.__f__("error", "at pages/reports/acceptance/index.vue:1706", "提交失败:", error);
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
    common_vendor.watch(currentStep, (newVal) => {
      if (newVal === 2) {
        fetchTizidanData();
      }
    });
    common_vendor.ref([]);
    common_vendor.ref([]);
    common_vendor.ref(false);
    common_vendor.ref([]);
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
        e: common_vendor.o(handleExtractionComplete),
        f: currentStep.value === 0,
        g: common_vendor.o(handlePlanGenerated),
        h: common_vendor.p({
          projectId: common_vendor.unref(selectedProjectId),
          hasExtracted: common_vendor.unref(projectInfoState).extractionOk.value
        }),
        i: currentStep.value === 1,
        j: common_vendor.p({
          type: "list",
          size: "20",
          color: "#166534"
        }),
        k: tizidanItems.value.length === 0
      }, tizidanItems.value.length === 0 ? {
        l: common_vendor.p({
          type: "refresh",
          size: "48",
          color: "#cbd5e1"
        }),
        m: common_vendor.p({
          type: "refresh",
          size: "16",
          color: "#ffffff"
        }),
        n: common_vendor.o(fetchTizidanData)
      } : common_vendor.e({
        o: common_vendor.f(getItemsByLevel1("项目历史以来环评报告及批复"), (item, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(getItemNumber(item)),
            b: common_vendor.t(getItemTitle(item)),
            c: item.required,
            d: common_vendor.o(() => toggleRequired(item), item.record_id),
            e: item.required
          }, item.required ? common_vendor.e({
            f: getItemFiles(item).length > 0
          }, getItemFiles(item).length > 0 ? {
            g: "41308e16-7-" + i0 + ",41308e16-0",
            h: common_vendor.p({
              type: "paperclip",
              size: "14",
              color: "#166534"
            }),
            i: common_vendor.t(getItemFiles(item).length)
          } : {}, {
            j: "41308e16-8-" + i0 + ",41308e16-0",
            k: common_vendor.p({
              type: "cloud-upload",
              size: "14",
              color: "#ffffff"
            }),
            l: common_vendor.t(item.submitted ? "继续上传" : "上传"),
            m: common_vendor.o(($event) => uploadTizidanFile(item.record_id, getFileKey(item)), item.record_id),
            n: getItemFiles(item).length > 0
          }, getItemFiles(item).length > 0 ? {
            o: common_vendor.f(getItemFiles(item), (file, fileIndex, i1) => {
              return {
                a: "41308e16-9-" + i0 + "-" + i1 + ",41308e16-0",
                b: common_vendor.t(file.name),
                c: common_vendor.t(_ctx.formatFileSize(file.size)),
                d: "41308e16-10-" + i0 + "-" + i1 + ",41308e16-0",
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
            r: "41308e16-11-" + i0 + ",41308e16-0",
            s: common_vendor.p({
              type: "minus-circle",
              size: "18",
              color: "#9ca3af"
            })
          }, {
            t: item.record_id
          });
        }),
        p: common_vendor.f(getItemsByLevel1("项目相关环保验收资料"), (item, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(getItemNumber(item)),
            b: common_vendor.t(getItemTitle(item)),
            c: item.required,
            d: common_vendor.o(() => toggleRequired(item), item.record_id),
            e: item.required
          }, item.required ? common_vendor.e({
            f: item.files && item.files.length > 0
          }, item.files && item.files.length > 0 ? {
            g: "41308e16-12-" + i0 + ",41308e16-0",
            h: common_vendor.p({
              type: "paperclip",
              size: "14",
              color: "#166534"
            }),
            i: common_vendor.t(item.files.length)
          } : {}, {
            j: "41308e16-13-" + i0 + ",41308e16-0",
            k: common_vendor.p({
              type: "cloud-upload",
              size: "14",
              color: "#ffffff"
            }),
            l: common_vendor.t(item.submitted ? "继续上传" : "上传"),
            m: common_vendor.o(($event) => uploadTizidanFile(item.record_id, null), item.record_id),
            n: item.files && item.files.length > 0
          }, item.files && item.files.length > 0 ? {
            o: common_vendor.f(item.files, (file, fileIndex, i1) => {
              return {
                a: "41308e16-14-" + i0 + "-" + i1 + ",41308e16-0",
                b: common_vendor.t(file.name),
                c: common_vendor.t(_ctx.formatFileSize(file.size)),
                d: "41308e16-15-" + i0 + "-" + i1 + ",41308e16-0",
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
            r: "41308e16-16-" + i0 + ",41308e16-0",
            s: common_vendor.p({
              type: "minus-circle",
              size: "18",
              color: "#9ca3af"
            })
          }, {
            t: item.record_id
          });
        }),
        q: common_vendor.f(getItemsByLevel1("（房地产项目提供）房地产相关证件"), (item, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(getItemNumber(item)),
            b: common_vendor.t(getItemTitle(item)),
            c: item.required,
            d: common_vendor.o(() => toggleRequired(item), item.record_id),
            e: item.required
          }, item.required ? common_vendor.e({
            f: getItemFiles(item).length > 0
          }, getItemFiles(item).length > 0 ? {
            g: "41308e16-17-" + i0 + ",41308e16-0",
            h: common_vendor.p({
              type: "paperclip",
              size: "14",
              color: "#166534"
            }),
            i: common_vendor.t(getItemFiles(item).length)
          } : {}, {
            j: "41308e16-18-" + i0 + ",41308e16-0",
            k: common_vendor.p({
              type: "cloud-upload",
              size: "14",
              color: "#ffffff"
            }),
            l: common_vendor.t(getSubmittedStatus(item) ? "继续上传" : "上传"),
            m: common_vendor.o(($event) => uploadTizidanFile(item.record_id, getFileKey(item)), item.record_id),
            n: getItemFiles(item).length > 0
          }, getItemFiles(item).length > 0 ? {
            o: common_vendor.f(getItemFiles(item), (file, fileIndex, i1) => {
              return {
                a: "41308e16-19-" + i0 + "-" + i1 + ",41308e16-0",
                b: common_vendor.t(file.name),
                c: common_vendor.t(_ctx.formatFileSize(file.size)),
                d: "41308e16-20-" + i0 + "-" + i1 + ",41308e16-0",
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
            r: "41308e16-21-" + i0 + ",41308e16-0",
            s: common_vendor.p({
              type: "minus-circle",
              size: "18",
              color: "#9ca3af"
            })
          }, {
            t: item.record_id
          });
        }),
        r: common_vendor.f(["污染治理设施设计方案", "厂区总平面图及各层平面图（CAD版本）", "厂区排水设计图（CAD版本）", "排污许可证", "排水许可证", "危废处置协议及相应处置资质"], (level1Name, k0, i0) => {
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
                g: "41308e16-22-" + i0 + "-" + i1 + ",41308e16-0",
                h: common_vendor.p({
                  type: "paperclip",
                  size: "14",
                  color: "#166534"
                }),
                i: common_vendor.t(item.files.length)
              } : {}, {
                j: "41308e16-23-" + i0 + "-" + i1 + ",41308e16-0",
                k: common_vendor.p({
                  type: "cloud-upload",
                  size: "14",
                  color: "#ffffff"
                }),
                l: common_vendor.t(item.submitted ? "继续上传" : "上传"),
                m: common_vendor.o(($event) => uploadTizidanFile(item.record_id, null), item.record_id),
                n: item.files && item.files.length > 0
              }, item.files && item.files.length > 0 ? {
                o: common_vendor.f(item.files, (file, fileIndex, i2) => {
                  return {
                    a: "41308e16-24-" + i0 + "-" + i1 + "-" + i2 + ",41308e16-0",
                    b: common_vendor.t(file.name),
                    c: common_vendor.t(_ctx.formatFileSize(file.size)),
                    d: "41308e16-25-" + i0 + "-" + i1 + "-" + i2 + ",41308e16-0",
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
                r: "41308e16-26-" + i0 + "-" + i1 + ",41308e16-0",
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
        s: hasItemsByLevel1("其他需要提供的资料")
      }, hasItemsByLevel1("其他需要提供的资料") ? {
        t: common_vendor.f(getItemsByLevel1("其他需要提供的资料"), (item, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(getItemNumber(item)),
            b: common_vendor.t(getItemTitle(item)),
            c: item.required,
            d: common_vendor.o(() => toggleRequired(item), item.record_id),
            e: item.required
          }, item.required ? common_vendor.e({
            f: "41308e16-27-" + i0 + ",41308e16-0",
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
            k: "41308e16-28-" + i0 + ",41308e16-0",
            l: common_vendor.p({
              type: "paperclip",
              size: "14",
              color: "#166534"
            }),
            m: common_vendor.t(item.files.length)
          } : {}, {
            n: "41308e16-29-" + i0 + ",41308e16-0",
            o: common_vendor.p({
              type: "cloud-upload",
              size: "14",
              color: "#ffffff"
            }),
            p: common_vendor.t(item.submitted ? "继续上传" : "上传"),
            q: common_vendor.o(($event) => uploadTizidanFile(item.record_id, null), item.record_id),
            r: item.files && item.files.length > 0
          }, item.files && item.files.length > 0 ? {
            s: common_vendor.f(item.files, (file, fileIndex, i1) => {
              return {
                a: "41308e16-30-" + i0 + "-" + i1 + ",41308e16-0",
                b: common_vendor.t(file.name),
                c: common_vendor.t(_ctx.formatFileSize(file.size)),
                d: "41308e16-31-" + i0 + "-" + i1 + ",41308e16-0",
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
            w: "41308e16-32-" + i0 + ",41308e16-0",
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
        v: common_vendor.p({
          type: "phone",
          size: "16",
          color: "#166534"
        }),
        w: common_vendor.o(($event) => contactPerson.value = $event),
        x: common_vendor.p({
          placeholder: "请输入联系人姓名",
          clearable: true,
          modelValue: contactPerson.value
        }),
        y: common_vendor.o(($event) => contactPhone.value = $event),
        z: common_vendor.p({
          placeholder: "请输入联系电话",
          clearable: true,
          modelValue: contactPhone.value
        }),
        A: common_vendor.o(($event) => contactEmail.value = $event),
        B: common_vendor.p({
          placeholder: "请输入电子邮箱",
          clearable: true,
          modelValue: contactEmail.value
        }),
        C: common_vendor.p({
          type: "download-filled",
          size: "16",
          color: "#ffffff"
        }),
        D: common_vendor.o(generateAndDownloadTizidan),
        E: currentStep.value === 2,
        F: common_vendor.o(common_vendor.unref(projectInfoState).generateSignboard),
        G: common_vendor.p({
          userId: common_vendor.unref(user_id),
          projectId: common_vendor.unref(selectedProjectId),
          signboard: common_vendor.unref(projectInfoState).signboard,
          baseTable: common_vendor.unref(projectInfoState).baseTable.value,
          datasheet: common_vendor.unref(projectInfoState).datasheet
        }),
        H: currentStep.value === 3,
        I: common_vendor.o(handleReportGenerated),
        J: common_vendor.p({
          projectId: common_vendor.unref(selectedProjectId),
          hasExtracted: common_vendor.unref(projectInfoState).extractionOk.value
        }),
        K: currentStep.value === 4,
        L: common_vendor.p({
          type: "left",
          size: "16",
          color: "#5b6b7b"
        }),
        M: currentStep.value === 0,
        N: common_vendor.o(prevStep),
        O: common_vendor.p({
          type: "right",
          size: "16",
          color: "#ffffff"
        }),
        P: currentStep.value === stepNames.length - 1,
        Q: common_vendor.o(nextStep),
        R: common_vendor.p({
          current: "pages/reports/acceptance/index"
        }),
        S: common_vendor.o(($event) => _ctx.newBaseInfoLabel = $event),
        T: common_vendor.p({
          placeholder: "如：项目名称/单位名称",
          modelValue: _ctx.newBaseInfoLabel
        }),
        U: common_vendor.o((...args) => _ctx.closeBaseInfo && _ctx.closeBaseInfo(...args)),
        V: common_vendor.o((...args) => _ctx.confirmAddBaseInfo && _ctx.confirmAddBaseInfo(...args)),
        W: common_vendor.sr("newBaseInfoPopup", "41308e16-43"),
        X: common_vendor.p({
          type: "center"
        }),
        Y: common_vendor.sr(taskProgressModal, "41308e16-45", {
          "k": "taskProgressModal"
        }),
        Z: common_vendor.p({
          title: taskProgressTitle.value,
          progress: taskProgress.value,
          statusText: taskStatusText.value,
          state: taskState.value,
          cancelable: false
        }),
        aa: common_vendor.p({
          type: "close",
          size: "20",
          color: "#6b7280"
        }),
        ab: common_vendor.o((...args) => _ctx.closeProjectPicker && _ctx.closeProjectPicker(...args)),
        ac: common_vendor.o(_ctx.onSearchInput),
        ad: common_vendor.o(($event) => common_vendor.isRef(projectSearchKeyword) ? projectSearchKeyword.value = $event : null),
        ae: common_vendor.p({
          placeholder: "搜索项目名称...",
          prefixIcon: "search",
          clearable: true,
          modelValue: common_vendor.unref(projectSearchKeyword)
        }),
        af: common_vendor.t(common_vendor.unref(filteredProjects).length),
        ag: common_vendor.unref(projectSearchKeyword)
      }, common_vendor.unref(projectSearchKeyword) ? {} : {}, {
        ah: common_vendor.f(common_vendor.unref(filteredProjects), (project, k0, i0) => {
          return common_vendor.e({
            a: "41308e16-49-" + i0 + ",41308e16-46",
            b: common_vendor.p({
              type: "folder",
              size: "22",
              color: common_vendor.unref(selectedProjectId) === project.id ? "#166534" : "#6b7280"
            }),
            c: common_vendor.t(project.name),
            d: project.description
          }, project.description ? {
            e: common_vendor.t(project.description)
          } : {}, {
            f: project.folder_name
          }, project.folder_name ? {
            g: "41308e16-50-" + i0 + ",41308e16-46",
            h: common_vendor.p({
              type: "calendar",
              size: "14",
              color: "#9ca3af"
            }),
            i: common_vendor.t(project.folder_name)
          } : {}, {
            j: common_vendor.unref(selectedProjectId) === project.id
          }, common_vendor.unref(selectedProjectId) === project.id ? {
            k: "41308e16-51-" + i0 + ",41308e16-46",
            l: common_vendor.p({
              type: "checkmarkempty",
              size: "18",
              color: "#ffffff"
            })
          } : {
            m: "41308e16-52-" + i0 + ",41308e16-46",
            n: common_vendor.p({
              type: "right",
              size: "16",
              color: "#d1d5db"
            })
          }, {
            o: project.id,
            p: common_vendor.unref(selectedProjectId) === project.id ? 1 : "",
            q: common_vendor.o(($event) => _ctx.selectProject(project), project.id)
          });
        }),
        ai: common_vendor.unref(filteredProjects).length === 0
      }, common_vendor.unref(filteredProjects).length === 0 ? common_vendor.e({
        aj: common_vendor.p({
          type: "search",
          size: "48",
          color: "#cbd5e1"
        }),
        ak: common_vendor.t(common_vendor.unref(projectSearchKeyword) ? "未找到匹配的项目" : "暂无项目"),
        al: common_vendor.unref(projectSearchKeyword)
      }, common_vendor.unref(projectSearchKeyword) ? {} : {}) : {}, {
        am: common_vendor.sr("projectPickerPopup", "41308e16-46"),
        an: common_vendor.p({
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
