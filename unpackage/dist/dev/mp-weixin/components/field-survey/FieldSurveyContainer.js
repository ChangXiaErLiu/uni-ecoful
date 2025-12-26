"use strict";
const common_vendor = require("../../common/vendor.js");
const composables_useFieldSurveyData = require("../../composables/useFieldSurveyData.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_uni_icons + MainContentTab + EquipmentTab + FacilityTab + OutletTab)();
}
const MainContentTab = () => "./tabs/MainContentTab.js";
const EquipmentTab = () => "./tabs/EquipmentTab.js";
const FacilityTab = () => "./tabs/FacilityTab.js";
const OutletTab = () => "./tabs/OutletTab.js";
const _sfc_main = {
  __name: "FieldSurveyContainer",
  props: {
    // 用户ID和项目ID，用于设备数据获取
    userId: {
      type: [String, Number],
      required: true
    },
    projectId: {
      type: [String, Number, null],
      default: null
    },
    // 排污标识牌数据（来自步骤0）
    signboard: {
      type: Object,
      required: true
    },
    // 基本信息表（用于排污口Tab查找数据）- 必须是数组
    baseTable: {
      type: Array,
      default: () => [],
      validator: (value) => {
        if (!Array.isArray(value)) {
          common_vendor.index.__f__("error", "at components/field-survey/FieldSurveyContainer.vue:95", "❌ FieldSurveyContainer: baseTable 必须是数组，当前类型:", typeof value);
          return false;
        }
        return true;
      }
    },
    // 提资单数据（用于生成比对清单）
    datasheet: {
      type: Array,
      default: () => []
    }
  },
  emits: ["generate-signboard"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const {
      tabs,
      currentTab,
      handleTabChange,
      generateFieldworkComparison
    } = composables_useFieldSurveyData.useFieldSurveyData();
    function handleTabClick(index) {
      handleTabChange(index, props.userId, props.projectId, props.baseTable);
    }
    function handleGenerateComparison() {
      generateFieldworkComparison(props.datasheet);
    }
    return (_ctx, _cache) => {
      return {
        a: common_vendor.p({
          type: "map-pin-ellipse",
          size: "20",
          color: "#166534"
        }),
        b: common_vendor.f(common_vendor.unref(tabs), (tab, index, i0) => {
          return {
            a: common_vendor.t(tab),
            b: index,
            c: common_vendor.unref(currentTab) === index ? 1 : "",
            d: common_vendor.o(($event) => handleTabClick(index), index)
          };
        }),
        c: common_vendor.p({
          baseTable: __props.baseTable,
          userId: __props.userId,
          projectId: __props.projectId
        }),
        d: common_vendor.unref(currentTab) === 0,
        e: common_vendor.p({
          userId: __props.userId,
          projectId: __props.projectId
        }),
        f: common_vendor.unref(currentTab) === 1,
        g: common_vendor.p({
          userId: __props.userId,
          projectId: __props.projectId,
          baseTable: __props.baseTable
        }),
        h: common_vendor.unref(currentTab) === 2,
        i: common_vendor.o(($event) => _ctx.$emit("generate-signboard")),
        j: common_vendor.p({
          projectId: __props.projectId,
          baseTable: __props.baseTable
        }),
        k: common_vendor.unref(currentTab) === 3,
        l: common_vendor.p({
          type: "list",
          size: "18",
          color: "#166534"
        }),
        m: common_vendor.p({
          type: "gear",
          size: "16",
          color: "#ffffff"
        }),
        n: common_vendor.o(handleGenerateComparison)
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-09ef4bae"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/field-survey/FieldSurveyContainer.js.map
