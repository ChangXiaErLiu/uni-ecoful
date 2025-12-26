"use strict";
const common_vendor = require("../../common/vendor.js");
const composables_useAcceptanceReport = require("../../composables/useAcceptanceReport.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_file_picker2 = common_vendor.resolveComponent("uni-file-picker");
  (_easycom_uni_icons2 + _easycom_uni_file_picker2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_file_picker = () => "../../uni_modules/uni-file-picker/components/uni-file-picker/uni-file-picker.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_file_picker + TaskProgressModal)();
}
const TaskProgressModal = () => "../message-pop-up/TaskProgressModal.js";
const _sfc_main = {
  __name: "AcceptanceReportContainer",
  props: {
    // 项目ID
    projectId: {
      type: [Number, String],
      required: true
    },
    // 是否已提取项目信息
    hasExtracted: {
      type: Boolean,
      default: false
    }
  },
  emits: ["report-generated"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const {
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
      changeReportType,
      generateReport,
      downloadReport
    } = composables_useAcceptanceReport.useAcceptanceReport();
    const taskProgressModal = common_vendor.ref(null);
    const taskProgressTitle = common_vendor.ref("竣工验收报告生成中");
    function handleReportTypeChange(e) {
      changeReportType(e.detail.value);
    }
    async function handleGenerate() {
      await generateReport(
        props.projectId,
        props.hasExtracted,
        taskProgressModal.value
      );
      emit("report-generated");
    }
    async function handleDownload() {
      await downloadReport(props.projectId);
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: !__props.projectId
      }, !__props.projectId ? {
        b: common_vendor.p({
          type: "folder-add",
          size: "48",
          color: "#cbd5e1"
        })
      } : common_vendor.e({
        c: common_vendor.p({
          type: "calendar",
          size: "20",
          color: "#166534"
        }),
        d: common_vendor.f(common_vendor.unref(reportTypes), (type, k0, i0) => {
          return {
            a: type.value,
            b: common_vendor.unref(reportType) === type.value,
            c: common_vendor.t(type.text),
            d: type.value
          };
        }),
        e: common_vendor.o(handleReportTypeChange),
        f: common_vendor.unref(reportType) === "withData"
      }, common_vendor.unref(reportType) === "withData" ? {
        g: common_vendor.o(($event) => common_vendor.isRef(testReportFiles) ? testReportFiles.value = $event : null),
        h: common_vendor.p({
          fileMediatype: "all",
          ["auto-upload"]: false,
          limit: 3,
          modelValue: common_vendor.unref(testReportFiles)
        })
      } : {}, {
        i: common_vendor.p({
          type: "refresh-filled",
          size: "16",
          color: "#ffffff"
        }),
        j: common_vendor.o(handleGenerate),
        k: common_vendor.unref(isGenerating),
        l: common_vendor.unref(canDownloadReport)
      }, common_vendor.unref(canDownloadReport) ? {
        m: common_vendor.p({
          type: "cloud-download-filled",
          size: "16",
          color: "#ffffff"
        }),
        n: common_vendor.o(handleDownload)
      } : {}, {
        o: common_vendor.unref(reportGenerated)
      }, common_vendor.unref(reportGenerated) ? common_vendor.e({
        p: common_vendor.p({
          type: "checkmarkempty",
          size: "18",
          color: "#166534"
        }),
        q: common_vendor.t(common_vendor.unref(previewTitle)),
        r: common_vendor.unref(reportType) === "withData"
      }, common_vendor.unref(reportType) === "withData" ? {} : {}) : {}), {
        s: common_vendor.sr(taskProgressModal, "c696c0de-6", {
          "k": "taskProgressModal"
        }),
        t: common_vendor.p({
          title: taskProgressTitle.value,
          progress: common_vendor.unref(taskProgress),
          statusText: common_vendor.unref(taskStatusText),
          state: common_vendor.unref(taskState)
        })
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-c696c0de"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/acceptance-report/AcceptanceReportContainer.js.map
