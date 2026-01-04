"use strict";
const common_vendor = require("../../common/vendor.js");
const composables_useMonitorPlan = require("../../composables/useMonitorPlan.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_uni_icons + TaskProgressModal)();
}
const TaskProgressModal = () => "../message-pop-up/TaskProgressModal.js";
const _sfc_main = {
  __name: "MonitorPlanContainer",
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
  emits: ["plan-generated"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const {
      plan,
      canDownload,
      isGenerating,
      taskProgress,
      taskStatusText,
      taskState,
      generatePlan,
      downloadPlan
    } = composables_useMonitorPlan.useMonitorPlan();
    const taskProgressModal = common_vendor.ref(null);
    const taskProgressTitle = common_vendor.ref("监测方案生成中");
    async function handleGenerate() {
      await generatePlan(
        props.projectId,
        props.hasExtracted,
        taskProgressModal.value
      );
      emit("plan-generated");
      await common_vendor.nextTick$1();
      common_vendor.index.__f__("log", "at components/monitor-plan/MonitorPlanContainer.vue:108", "🔄 UI 更新后 - plan:", plan.value, "canDownload:", canDownload.value);
    }
    async function handleDownload() {
      await downloadPlan(props.projectId);
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
          type: "eye",
          size: "20",
          color: "#166534"
        }),
        d: !common_vendor.unref(plan)
      }, !common_vendor.unref(plan) ? {
        e: common_vendor.p({
          type: "eye",
          size: "48",
          color: "#cbd5e1"
        })
      } : {}, {
        f: common_vendor.p({
          type: "refresh-filled",
          size: "16",
          color: "#ffffff"
        }),
        g: common_vendor.o(handleGenerate),
        h: common_vendor.unref(isGenerating),
        i: common_vendor.unref(canDownload)
      }, common_vendor.unref(canDownload) ? {
        j: common_vendor.p({
          type: "cloud-download-filled",
          size: "16",
          color: "#ffffff"
        }),
        k: common_vendor.o(handleDownload)
      } : {}, {
        l: common_vendor.unref(plan)
      }, common_vendor.unref(plan) ? {
        m: common_vendor.p({
          type: "checkmark-circle",
          size: "18",
          color: "#166534"
        })
      } : {}), {
        n: common_vendor.sr(taskProgressModal, "1b27c0d6-6", {
          "k": "taskProgressModal"
        }),
        o: common_vendor.p({
          title: taskProgressTitle.value,
          progress: common_vendor.unref(taskProgress),
          statusText: common_vendor.unref(taskStatusText),
          state: common_vendor.unref(taskState)
        })
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1b27c0d6"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/monitor-plan/MonitorPlanContainer.js.map
