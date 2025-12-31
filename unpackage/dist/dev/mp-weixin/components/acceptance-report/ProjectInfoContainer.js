"use strict";
const common_vendor = require("../../common/vendor.js");
const composables_useProjectInfo = require("../../composables/useProjectInfo.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  (_easycom_uni_icons2 + _easycom_uni_easyinput2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_easyinput = () => "../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
if (!Math) {
  (_easycom_uni_icons + ProjectSelectionTab + BaseInfoTab + SignboardTab + _easycom_uni_easyinput)();
}
const ProjectSelectionTab = () => "./project-info-tabs/ProjectSelectionTab.js";
const BaseInfoTab = () => "./project-info-tabs/BaseInfoTab.js";
const SignboardTab = () => "./project-info-tabs/SignboardTab.js";
const _sfc_main = {
  __name: "ProjectInfoContainer",
  emits: ["extraction-complete", "project-selected"],
  setup(__props, { emit: __emit }) {
    const {
      selectedProjectId,
      extractionOk,
      projectSearchKeyword,
      filteredProjects,
      selectProject,
      onSearchInput
    } = composables_useProjectInfo.useProjectInfo();
    const showPicker = common_vendor.ref(false);
    const projectSelected = common_vendor.computed(() => !!selectedProjectId.value);
    const extractionCompleted = common_vendor.computed(() => extractionOk.value);
    const emit = __emit;
    function handleClosePicker() {
      showPicker.value = false;
    }
    async function handleSelectProject(project) {
      const success = await selectProject(project);
      if (success) {
        showPicker.value = false;
      }
    }
    function handleComplete() {
      emit("extraction-complete");
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: projectSelected.value
      }, projectSelected.value ? {
        b: common_vendor.p({
          type: "checkmarkempty",
          size: "16",
          color: "#ffffff"
        })
      } : {}, {
        c: common_vendor.p({
          type: "folder-add",
          size: "20",
          color: projectSelected.value ? "#10b981" : "#166534"
        }),
        d: projectSelected.value
      }, projectSelected.value ? {
        e: common_vendor.p({
          type: "checkmarkempty",
          size: "14",
          color: "#10b981"
        })
      } : {}, {
        f: projectSelected.value ? 1 : "",
        g: common_vendor.o(($event) => showPicker.value = true),
        h: projectSelected.value
      }, projectSelected.value ? common_vendor.e({
        i: extractionCompleted.value
      }, extractionCompleted.value ? {
        j: common_vendor.p({
          type: "checkmarkempty",
          size: "16",
          color: "#ffffff"
        })
      } : {}, {
        k: common_vendor.p({
          type: "list",
          size: "20",
          color: extractionCompleted.value ? "#10b981" : "#166534"
        }),
        l: extractionCompleted.value
      }, extractionCompleted.value ? {
        m: common_vendor.p({
          type: "checkmarkempty",
          size: "14",
          color: "#10b981"
        })
      } : {
        n: common_vendor.p({
          type: "info",
          size: "14",
          color: "#f59e0b"
        })
      }, {
        o: extractionCompleted.value ? 1 : "",
        p: projectSelected.value ? 1 : ""
      }) : {}, {
        q: extractionCompleted.value
      }, extractionCompleted.value ? {
        r: common_vendor.p({
          type: "flag",
          size: "20",
          color: "#166534"
        }),
        s: common_vendor.o(handleComplete),
        t: extractionCompleted.value ? 1 : ""
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
            a: "abb50b5f-13-" + i0,
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
            g: "abb50b5f-14-" + i0,
            h: common_vendor.p({
              type: "calendar",
              size: "14",
              color: "#9ca3af"
            }),
            i: common_vendor.t(project.folder_name)
          } : {}, {
            j: common_vendor.unref(selectedProjectId) === project.id
          }, common_vendor.unref(selectedProjectId) === project.id ? {
            k: "abb50b5f-15-" + i0,
            l: common_vendor.p({
              type: "checkmarkempty",
              size: "18",
              color: "#ffffff"
            })
          } : {
            m: "abb50b5f-16-" + i0,
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
      }) : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-abb50b5f"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/acceptance-report/ProjectInfoContainer.js.map
