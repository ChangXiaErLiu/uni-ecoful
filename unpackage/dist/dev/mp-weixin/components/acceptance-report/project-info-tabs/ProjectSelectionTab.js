"use strict";
const common_vendor = require("../../../common/vendor.js");
const composables_useProjectInfo = require("../../../composables/useProjectInfo.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  (_easycom_uni_icons2 + _easycom_uni_easyinput2)();
}
const _easycom_uni_icons = () => "../../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_easyinput = () => "../../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_easyinput + TaskProgressModal)();
}
const TaskProgressModal = () => "../../message-pop-up/TaskProgressModal.js";
const _sfc_main = {
  __name: "ProjectSelectionTab",
  setup(__props) {
    const {
      selectedProjectId,
      selectedProject,
      projectFiles,
      projectSearchKeyword,
      filteredProjects,
      baseTable,
      extractionOk,
      taskProgressTitle,
      taskProgress,
      taskStatusText,
      taskState,
      // 方法
      selectProject,
      onSearchInput,
      simulateExtract,
      clearProjectCache,
      getFileIcon,
      formatFileSize,
      formatFileStatus,
      getStatusText,
      getStatusClass
    } = composables_useProjectInfo.useProjectInfo();
    const showPicker = common_vendor.ref(false);
    const taskProgressModal = common_vendor.ref(null);
    function handleOpenPicker() {
      showPicker.value = true;
    }
    function handleClosePicker() {
      showPicker.value = false;
    }
    async function handleSelectProject(project) {
      const success = await selectProject(project);
      if (success) {
        showPicker.value = false;
      }
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
        v: showPicker.value
      }, showPicker.value ? common_vendor.e({
        w: common_vendor.p({
          type: "close",
          size: "20",
          color: "#6b7280"
        }),
        x: common_vendor.o(handleClosePicker),
        y: common_vendor.o(common_vendor.unref(onSearchInput)),
        z: common_vendor.o(($event) => common_vendor.isRef(projectSearchKeyword) ? projectSearchKeyword.value = $event : null),
        A: common_vendor.p({
          placeholder: "搜索项目名称...",
          prefixIcon: "search",
          clearable: true,
          modelValue: common_vendor.unref(projectSearchKeyword)
        }),
        B: common_vendor.t(common_vendor.unref(filteredProjects).length),
        C: common_vendor.unref(projectSearchKeyword)
      }, common_vendor.unref(projectSearchKeyword) ? {} : {}, {
        D: common_vendor.f(common_vendor.unref(filteredProjects), (project, k0, i0) => {
          return common_vendor.e({
            a: "7034a124-10-" + i0,
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
            g: "7034a124-11-" + i0,
            h: common_vendor.p({
              type: "calendar",
              size: "14",
              color: "#9ca3af"
            }),
            i: common_vendor.t(project.folder_name)
          } : {}, {
            j: common_vendor.unref(selectedProjectId) === project.id
          }, common_vendor.unref(selectedProjectId) === project.id ? {
            k: "7034a124-12-" + i0,
            l: common_vendor.p({
              type: "checkmarkempty",
              size: "18",
              color: "#ffffff"
            })
          } : {
            m: "7034a124-13-" + i0,
            n: common_vendor.p({
              type: "right",
              size: "16",
              color: "#d1d5db"
            })
          }, {
            o: project.id,
            p: common_vendor.unref(selectedProjectId) === project.id ? 1 : "",
            q: common_vendor.o(($event) => handleSelectProject(project), project.id)
          });
        }),
        E: common_vendor.unref(filteredProjects).length === 0
      }, common_vendor.unref(filteredProjects).length === 0 ? common_vendor.e({
        F: common_vendor.p({
          type: "search",
          size: "48",
          color: "#cbd5e1"
        }),
        G: common_vendor.t(common_vendor.unref(projectSearchKeyword) ? "未找到匹配的项目" : "暂无项目"),
        H: common_vendor.unref(projectSearchKeyword)
      }, common_vendor.unref(projectSearchKeyword) ? {} : {}) : {}, {
        I: common_vendor.o(() => {
        }),
        J: common_vendor.o(handleClosePicker)
      }) : {}, {
        K: common_vendor.sr(taskProgressModal, "7034a124-15", {
          "k": "taskProgressModal"
        }),
        L: common_vendor.p({
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
