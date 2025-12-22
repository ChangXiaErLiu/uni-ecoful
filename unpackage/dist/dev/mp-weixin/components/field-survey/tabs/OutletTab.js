"use strict";
const common_vendor = require("../../../common/vendor.js");
const composables_useFieldSurveyData = require("../../../composables/useFieldSurveyData.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  const _easycom_uni_file_picker2 = common_vendor.resolveComponent("uni-file-picker");
  (_easycom_uni_icons2 + _easycom_uni_easyinput2 + _easycom_uni_file_picker2)();
}
const _easycom_uni_icons = () => "../../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_easyinput = () => "../../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_uni_file_picker = () => "../../../uni_modules/uni-file-picker/components/uni-file-picker/uni-file-picker.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_easyinput + _easycom_uni_file_picker)();
}
const _sfc_main = {
  __name: "OutletTab",
  props: {
    projectId: {
      type: [String, Number],
      required: true
    },
    baseTable: {
      type: Array,
      default: () => []
    }
  },
  setup(__props) {
    const props = __props;
    const {
      wastewaterOutlets,
      exhaustOutlets,
      noiseOutlets,
      loadOutletList,
      extractOutletsFromBaseTable,
      addOutlet,
      removeOutlet
    } = composables_useFieldSurveyData.useFieldSurveyData();
    common_vendor.onMounted(() => {
      loadOutletList(props.projectId);
    });
    const searchKeyword = common_vendor.ref("");
    function onSearchInput() {
      common_vendor.index.__f__("log", "at components/field-survey/tabs/OutletTab.vue:237", "搜索排污口关键词:", searchKeyword.value);
    }
    function filterOutlets(outlets) {
      if (!searchKeyword.value) {
        return outlets;
      }
      const keyword = searchKeyword.value.toLowerCase().trim();
      return outlets.filter((outlet) => {
        const code = (outlet.code || "").toLowerCase();
        const name = (outlet.name || "").toLowerCase();
        return code.includes(keyword) || name.includes(keyword);
      });
    }
    const filteredWastewaterOutlets = common_vendor.computed(() => {
      return filterOutlets(wastewaterOutlets.value);
    });
    const filteredExhaustOutlets = common_vendor.computed(() => {
      return filterOutlets(exhaustOutlets.value);
    });
    const filteredNoiseOutlets = common_vendor.computed(() => {
      return filterOutlets(noiseOutlets.value);
    });
    const totalOutletCount = common_vendor.computed(() => {
      return wastewaterOutlets.value.length + exhaustOutlets.value.length + noiseOutlets.value.length;
    });
    const filteredTotalCount = common_vendor.computed(() => {
      return filteredWastewaterOutlets.value.length + filteredExhaustOutlets.value.length + filteredNoiseOutlets.value.length;
    });
    function handleAddOutlet(type) {
      addOutlet(type, props.projectId);
    }
    function handleRemoveOutlet(type, index) {
      removeOutlet(type, index, props.projectId);
    }
    function handleExtractOutlets() {
      if (!props.baseTable || props.baseTable.length === 0) {
        common_vendor.index.showToast({
          title: "请先提取项目基本信息",
          icon: "none",
          duration: 2e3
        });
        return;
      }
      extractOutletsFromBaseTable(props.projectId, props.baseTable);
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "map",
          size: "20",
          color: "#166534"
        }),
        b: common_vendor.t(filteredTotalCount.value),
        c: common_vendor.p({
          type: "download",
          size: "18",
          color: "#ffffff"
        }),
        d: common_vendor.o(handleExtractOutlets),
        e: totalOutletCount.value > 0
      }, totalOutletCount.value > 0 ? common_vendor.e({
        f: common_vendor.o(onSearchInput),
        g: common_vendor.o(($event) => searchKeyword.value = $event),
        h: common_vendor.p({
          placeholder: "搜索排污口编号或名称...",
          prefixIcon: "search",
          clearable: true,
          modelValue: searchKeyword.value
        }),
        i: searchKeyword.value
      }, searchKeyword.value ? {
        j: common_vendor.t(filteredTotalCount.value)
      } : {}) : {}, {
        k: common_vendor.p({
          type: "map",
          size: "18",
          color: "#0ea5e9"
        }),
        l: common_vendor.t(filteredWastewaterOutlets.value.length),
        m: common_vendor.p({
          type: "plus",
          size: "16",
          color: "#0ea5e9"
        }),
        n: common_vendor.o(($event) => handleAddOutlet("wastewater")),
        o: filteredWastewaterOutlets.value.length
      }, filteredWastewaterOutlets.value.length ? {
        p: common_vendor.f(filteredWastewaterOutlets.value, (outlet, index, i0) => {
          return {
            a: "d74124e6-5-" + i0,
            b: common_vendor.t(outlet.code),
            c: "d74124e6-6-" + i0,
            d: common_vendor.o(($event) => handleRemoveOutlet("wastewater", index), outlet.id),
            e: "d74124e6-7-" + i0,
            f: common_vendor.o(($event) => outlet.code = $event, outlet.id),
            g: common_vendor.p({
              placeholder: "如：DW001",
              clearable: true,
              modelValue: outlet.code
            }),
            h: "d74124e6-8-" + i0,
            i: common_vendor.o(($event) => outlet.name = $event, outlet.id),
            j: common_vendor.p({
              placeholder: "请输入排污口名称",
              clearable: true,
              modelValue: outlet.name
            }),
            k: "d74124e6-9-" + i0,
            l: common_vendor.o(($event) => outlet.images = $event, outlet.id),
            m: common_vendor.p({
              fileMediatype: "image",
              mode: "grid",
              limit: 5,
              ["auto-upload"]: false,
              modelValue: outlet.images
            }),
            n: outlet.id
          };
        }),
        q: common_vendor.p({
          type: "flag",
          size: "16",
          color: "#0ea5e9"
        }),
        r: common_vendor.p({
          type: "trash",
          size: "16",
          color: "#ef4444"
        })
      } : {
        s: common_vendor.p({
          type: "water",
          size: "32",
          color: "#e2e8f0"
        })
      }, {
        t: common_vendor.p({
          type: "cloud",
          size: "18",
          color: "#8b5cf6"
        }),
        v: common_vendor.t(filteredExhaustOutlets.value.length),
        w: common_vendor.p({
          type: "plus",
          size: "16",
          color: "#8b5cf6"
        }),
        x: common_vendor.o(($event) => handleAddOutlet("exhaust")),
        y: filteredExhaustOutlets.value.length
      }, filteredExhaustOutlets.value.length ? {
        z: common_vendor.f(filteredExhaustOutlets.value, (outlet, index, i0) => {
          return {
            a: "d74124e6-13-" + i0,
            b: common_vendor.t(outlet.code),
            c: "d74124e6-14-" + i0,
            d: common_vendor.o(($event) => handleRemoveOutlet("exhaust", index), outlet.id),
            e: "d74124e6-15-" + i0,
            f: common_vendor.o(($event) => outlet.code = $event, outlet.id),
            g: common_vendor.p({
              placeholder: "如：DA001",
              clearable: true,
              modelValue: outlet.code
            }),
            h: "d74124e6-16-" + i0,
            i: common_vendor.o(($event) => outlet.name = $event, outlet.id),
            j: common_vendor.p({
              placeholder: "请输入排污口名称",
              clearable: true,
              modelValue: outlet.name
            }),
            k: "d74124e6-17-" + i0,
            l: common_vendor.o(($event) => outlet.images = $event, outlet.id),
            m: common_vendor.p({
              fileMediatype: "image",
              mode: "grid",
              limit: 5,
              ["auto-upload"]: false,
              modelValue: outlet.images
            }),
            n: outlet.id
          };
        }),
        A: common_vendor.p({
          type: "flag",
          size: "16",
          color: "#8b5cf6"
        }),
        B: common_vendor.p({
          type: "trash",
          size: "16",
          color: "#ef4444"
        })
      } : {
        C: common_vendor.p({
          type: "cloud",
          size: "32",
          color: "#e2e8f0"
        })
      }, {
        D: common_vendor.p({
          type: "sound",
          size: "18",
          color: "#f59e0b"
        }),
        E: common_vendor.t(filteredNoiseOutlets.value.length),
        F: common_vendor.p({
          type: "plus",
          size: "16",
          color: "#f59e0b"
        }),
        G: common_vendor.o(($event) => handleAddOutlet("noise")),
        H: filteredNoiseOutlets.value.length
      }, filteredNoiseOutlets.value.length ? {
        I: common_vendor.f(filteredNoiseOutlets.value, (outlet, index, i0) => {
          return {
            a: "d74124e6-21-" + i0,
            b: common_vendor.t(outlet.code),
            c: "d74124e6-22-" + i0,
            d: common_vendor.o(($event) => handleRemoveOutlet("noise", index), outlet.id),
            e: "d74124e6-23-" + i0,
            f: common_vendor.o(($event) => outlet.code = $event, outlet.id),
            g: common_vendor.p({
              placeholder: "如：ZS-01",
              clearable: true,
              modelValue: outlet.code
            }),
            h: "d74124e6-24-" + i0,
            i: common_vendor.o(($event) => outlet.name = $event, outlet.id),
            j: common_vendor.p({
              placeholder: "请输入排污口名称",
              clearable: true,
              modelValue: outlet.name
            }),
            k: "d74124e6-25-" + i0,
            l: common_vendor.o(($event) => outlet.images = $event, outlet.id),
            m: common_vendor.p({
              fileMediatype: "image",
              mode: "grid",
              limit: 5,
              ["auto-upload"]: false,
              modelValue: outlet.images
            }),
            n: outlet.id
          };
        }),
        J: common_vendor.p({
          type: "flag",
          size: "16",
          color: "#f59e0b"
        }),
        K: common_vendor.p({
          type: "trash",
          size: "16",
          color: "#ef4444"
        })
      } : {
        L: common_vendor.p({
          type: "sound",
          size: "32",
          color: "#e2e8f0"
        })
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-d74124e6"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/components/field-survey/tabs/OutletTab.js.map
