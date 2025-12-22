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
      removeOutlet,
      updateOutletData
    } = composables_useFieldSurveyData.useFieldSurveyData();
    const searchKeyword = common_vendor.ref("");
    function onSearchInput() {
      common_vendor.index.__f__("log", "at components/field-survey/tabs/OutletTab.vue:301", "搜索排污口关键词:", searchKeyword.value);
    }
    function filterOutlets(outlets) {
      if (!searchKeyword.value) {
        return outlets;
      }
      const keyword = searchKeyword.value.toLowerCase().trim();
      return outlets.filter((outlet) => {
        const code = (outlet.code || "").toLowerCase();
        const name = (outlet.name || "").toLowerCase();
        const remark = (outlet.remark || "").toLowerCase();
        return code.includes(keyword) || name.includes(keyword) || remark.includes(keyword);
      });
    }
    const filteredWastewaterOutlets = common_vendor.computed(() => filterOutlets(wastewaterOutlets.value));
    const filteredExhaustOutlets = common_vendor.computed(() => filterOutlets(exhaustOutlets.value));
    const filteredNoiseOutlets = common_vendor.computed(() => filterOutlets(noiseOutlets.value));
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
    common_vendor.onMounted(() => {
      loadOutletList(props.projectId);
    });
    common_vendor.watch(
      () => props.baseTable,
      (newBaseTable) => {
        if (newBaseTable && newBaseTable.length > 0 && props.projectId) {
          const hasEmissionData = newBaseTable.some((item) => item.id === "pollutants_emission");
          if (hasEmissionData && totalOutletCount.value === 0) {
            common_vendor.index.__f__("log", "at components/field-survey/tabs/OutletTab.vue:369", "检测到项目信息更新，自动提取排污口");
            extractOutletsFromBaseTable(props.projectId, newBaseTable);
          }
        }
      },
      { deep: true, immediate: false }
    );
    common_vendor.watch(
      [wastewaterOutlets, exhaustOutlets, noiseOutlets],
      () => {
        if (props.projectId) {
          updateOutletData(props.projectId);
        }
      },
      { deep: true }
    );
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "map-pin-ellipse",
          size: "20",
          color: "#166534"
        }),
        b: common_vendor.t(totalOutletCount.value),
        c: common_vendor.o(onSearchInput),
        d: common_vendor.o(($event) => searchKeyword.value = $event),
        e: common_vendor.p({
          placeholder: "搜索排污口编号或名称...",
          prefixIcon: "search",
          clearable: true,
          modelValue: searchKeyword.value
        }),
        f: searchKeyword.value
      }, searchKeyword.value ? {
        g: common_vendor.t(filteredTotalCount.value)
      } : {}, {
        h: common_vendor.p({
          type: "refresh",
          size: "18",
          color: "#ffffff"
        }),
        i: common_vendor.o(handleExtractOutlets),
        j: common_vendor.t(filteredWastewaterOutlets.value.length),
        k: common_vendor.p({
          type: "plus",
          size: "16",
          color: "#ffffff"
        }),
        l: common_vendor.o(($event) => handleAddOutlet("wastewater")),
        m: filteredWastewaterOutlets.value.length
      }, filteredWastewaterOutlets.value.length ? {
        n: common_vendor.f(filteredWastewaterOutlets.value, (outlet, index, i0) => {
          return {
            a: common_vendor.t(index + 1),
            b: "d74124e6-4-" + i0,
            c: common_vendor.o(($event) => outlet.code = $event, outlet.id),
            d: common_vendor.p({
              placeholder: "如：DW001",
              clearable: true,
              modelValue: outlet.code
            }),
            e: "d74124e6-5-" + i0,
            f: common_vendor.o(($event) => outlet.name = $event, outlet.id),
            g: common_vendor.p({
              placeholder: "请输入名称",
              clearable: true,
              modelValue: outlet.name
            }),
            h: "d74124e6-6-" + i0,
            i: common_vendor.o(($event) => outlet.remark = $event, outlet.id),
            j: common_vendor.p({
              placeholder: "备注信息",
              clearable: true,
              modelValue: outlet.remark
            }),
            k: "d74124e6-7-" + i0,
            l: common_vendor.o(($event) => outlet.images = $event, outlet.id),
            m: common_vendor.p({
              fileMediatype: "image",
              mode: "grid",
              limit: 2,
              ["auto-upload"]: false,
              modelValue: outlet.images
            }),
            n: "d74124e6-8-" + i0,
            o: common_vendor.o(($event) => handleRemoveOutlet("wastewater", index), outlet.id),
            p: outlet.id
          };
        }),
        o: common_vendor.p({
          type: "trash",
          size: "18",
          color: "#ef4444"
        })
      } : {
        p: common_vendor.p({
          type: "clear",
          size: "48",
          color: "#e2e8f0"
        })
      }, {
        q: common_vendor.t(filteredExhaustOutlets.value.length),
        r: common_vendor.p({
          type: "plus",
          size: "16",
          color: "#ffffff"
        }),
        s: common_vendor.o(($event) => handleAddOutlet("exhaust")),
        t: filteredExhaustOutlets.value.length
      }, filteredExhaustOutlets.value.length ? {
        v: common_vendor.f(filteredExhaustOutlets.value, (outlet, index, i0) => {
          return {
            a: common_vendor.t(index + 1),
            b: "d74124e6-11-" + i0,
            c: common_vendor.o(($event) => outlet.code = $event, outlet.id),
            d: common_vendor.p({
              placeholder: "如：DA001",
              clearable: true,
              modelValue: outlet.code
            }),
            e: "d74124e6-12-" + i0,
            f: common_vendor.o(($event) => outlet.name = $event, outlet.id),
            g: common_vendor.p({
              placeholder: "请输入名称",
              clearable: true,
              modelValue: outlet.name
            }),
            h: "d74124e6-13-" + i0,
            i: common_vendor.o(($event) => outlet.remark = $event, outlet.id),
            j: common_vendor.p({
              placeholder: "备注信息",
              clearable: true,
              modelValue: outlet.remark
            }),
            k: "d74124e6-14-" + i0,
            l: common_vendor.o(($event) => outlet.images = $event, outlet.id),
            m: common_vendor.p({
              fileMediatype: "image",
              mode: "grid",
              limit: 2,
              ["auto-upload"]: false,
              modelValue: outlet.images
            }),
            n: "d74124e6-15-" + i0,
            o: common_vendor.o(($event) => handleRemoveOutlet("exhaust", index), outlet.id),
            p: outlet.id
          };
        }),
        w: common_vendor.p({
          type: "trash",
          size: "18",
          color: "#ef4444"
        })
      } : {
        x: common_vendor.p({
          type: "clear",
          size: "48",
          color: "#e2e8f0"
        })
      }, {
        y: common_vendor.t(filteredNoiseOutlets.value.length),
        z: common_vendor.p({
          type: "plus",
          size: "16",
          color: "#ffffff"
        }),
        A: common_vendor.o(($event) => handleAddOutlet("noise")),
        B: filteredNoiseOutlets.value.length
      }, filteredNoiseOutlets.value.length ? {
        C: common_vendor.f(filteredNoiseOutlets.value, (outlet, index, i0) => {
          return {
            a: common_vendor.t(index + 1),
            b: "d74124e6-18-" + i0,
            c: common_vendor.o(($event) => outlet.code = $event, outlet.id),
            d: common_vendor.p({
              placeholder: "如：ZS-01",
              clearable: true,
              modelValue: outlet.code
            }),
            e: "d74124e6-19-" + i0,
            f: common_vendor.o(($event) => outlet.name = $event, outlet.id),
            g: common_vendor.p({
              placeholder: "请输入名称",
              clearable: true,
              modelValue: outlet.name
            }),
            h: "d74124e6-20-" + i0,
            i: common_vendor.o(($event) => outlet.remark = $event, outlet.id),
            j: common_vendor.p({
              placeholder: "备注信息",
              clearable: true,
              modelValue: outlet.remark
            }),
            k: "d74124e6-21-" + i0,
            l: common_vendor.o(($event) => outlet.images = $event, outlet.id),
            m: common_vendor.p({
              fileMediatype: "image",
              mode: "grid",
              limit: 2,
              ["auto-upload"]: false,
              modelValue: outlet.images
            }),
            n: "d74124e6-22-" + i0,
            o: common_vendor.o(($event) => handleRemoveOutlet("noise", index), outlet.id),
            p: outlet.id
          };
        }),
        D: common_vendor.p({
          type: "trash",
          size: "18",
          color: "#ef4444"
        })
      } : {
        E: common_vendor.p({
          type: "clear",
          size: "48",
          color: "#e2e8f0"
        })
      }, {
        F: totalOutletCount.value === 0 && !searchKeyword.value
      }, totalOutletCount.value === 0 && !searchKeyword.value ? {
        G: common_vendor.p({
          type: "map-pin-ellipse",
          size: "64",
          color: "#e2e8f0"
        }),
        H: common_vendor.p({
          type: "refresh",
          size: "16",
          color: "#ffffff"
        }),
        I: common_vendor.o(handleExtractOutlets)
      } : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-d74124e6"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/components/field-survey/tabs/OutletTab.js.map
