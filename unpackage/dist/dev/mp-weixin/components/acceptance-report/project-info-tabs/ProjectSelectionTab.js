"use strict";
const common_vendor = require("../../../common/vendor.js");
const composables_useProjectInfo = require("../../../composables/useProjectInfo.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_uni_icons + TaskProgressModal)();
}
const TaskProgressModal = () => "../../message-pop-up/TaskProgressModal.js";
const _sfc_main = {
  __name: "ProjectSelectionTab",
  emits: ["open-picker"],
  setup(__props, { emit: __emit }) {
    const {
      selectedProjectId,
      selectedProject,
      projectFiles,
      baseTable,
      extractionOk,
      taskProgressTitle,
      taskProgress,
      taskStatusText,
      taskState,
      // 方法
      simulateExtract,
      clearProjectCache,
      getFileIcon,
      formatFileSize,
      formatFileStatus,
      getStatusText,
      getStatusClass
    } = composables_useProjectInfo.useProjectInfo();
    const emit = __emit;
    const taskProgressModal = common_vendor.ref(null);
    function handleOpenPicker() {
      emit("open-picker");
    }
    async function handleExtract() {
      await simulateExtract(taskProgressModal.value);
      if (extractionOk.value) {
        common_vendor.index.showToast({
          title: "信息提取成功，请查看下方基本信息",
          icon: "success",
          duration: 2e3
        });
      }
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.unref(selectedProject)
      }, common_vendor.unref(selectedProject) ? common_vendor.e({
        b: common_vendor.p({
          type: "folder",
          size: "20",
          color: "#166534"
        }),
        c: common_vendor.t(common_vendor.unref(selectedProject).name),
        d: common_vendor.unref(selectedProject).description
      }, common_vendor.unref(selectedProject).description ? {
        e: common_vendor.t(common_vendor.unref(selectedProject).description)
      } : {}) : {
        f: common_vendor.p({
          type: "folder-add",
          size: "20",
          color: "#9ca3af"
        })
      }, {
        g: common_vendor.p({
          type: "down",
          size: "16",
          color: "#6b7280"
        }),
        h: common_vendor.o(handleOpenPicker),
        i: common_vendor.unref(selectedProjectId) && common_vendor.unref(projectFiles).length > 0
      }, common_vendor.unref(selectedProjectId) && common_vendor.unref(projectFiles).length > 0 ? {
        j: common_vendor.p({
          type: "paperclip",
          size: "18",
          color: "#166534"
        }),
        k: common_vendor.t(common_vendor.unref(projectFiles).length),
        l: common_vendor.f(common_vendor.unref(projectFiles), (file, k0, i0) => {
          return {
            a: "7034a124-4-" + i0,
            b: common_vendor.p({
              type: common_vendor.unref(getFileIcon)(file.file_extension),
              size: "20",
              color: "#166534"
            }),
            c: common_vendor.t(file.filename),
            d: common_vendor.t(common_vendor.unref(formatFileSize)(file.size_bytes)),
            e: common_vendor.t(common_vendor.unref(formatFileStatus)(file.status)),
            f: common_vendor.t(common_vendor.unref(getStatusText)(file.status)),
            g: common_vendor.n(common_vendor.unref(getStatusClass)(file.status)),
            h: file.document_id
          };
        })
      } : common_vendor.unref(selectedProjectId) && common_vendor.unref(projectFiles).length === 0 ? {
        n: common_vendor.p({
          type: "folder-add",
          size: "48",
          color: "#cbd5e1"
        })
      } : {}, {
        m: common_vendor.unref(selectedProjectId) && common_vendor.unref(projectFiles).length === 0,
        o: common_vendor.p({
          type: "search",
          size: "16",
          color: "#ffffff"
        }),
        p: common_vendor.o(handleExtract),
        q: !common_vendor.unref(selectedProjectId) || common_vendor.unref(projectFiles).length === 0,
        r: common_vendor.unref(baseTable).length > 0
      }, common_vendor.unref(baseTable).length > 0 ? {
        s: common_vendor.p({
          type: "trash",
          size: "16",
          color: "#dc2626"
        }),
        t: common_vendor.o((...args) => common_vendor.unref(clearProjectCache) && common_vendor.unref(clearProjectCache)(...args))
      } : {}, {
        v: common_vendor.sr(taskProgressModal, "7034a124-8", {
          "k": "taskProgressModal"
        }),
        w: common_vendor.p({
          title: common_vendor.unref(taskProgressTitle),
          progress: common_vendor.unref(taskProgress),
          statusText: common_vendor.unref(taskStatusText),
          state: common_vendor.unref(taskState),
          cancelable: false
        })
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-7034a124"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/components/acceptance-report/project-info-tabs/ProjectSelectionTab.js.map
