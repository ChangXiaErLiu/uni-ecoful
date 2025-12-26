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
const pageSize = 10;
const _sfc_main = {
  __name: "FacilityTab",
  props: {
    userId: {
      type: [String, Number],
      required: true
    },
    projectId: {
      type: [String, Number, null],
      default: null
    },
    baseTable: {
      type: Array,
      default: () => []
    }
  },
  setup(__props) {
    const props = __props;
    const {
      facilitySearchKeyword,
      filteredFacilityList,
      loadingFacility,
      fetchFacilityError,
      onFacilitySearchInput,
      loadFacilityList,
      extractFacilitiesFromBaseTable,
      addPollutionFacility,
      removePollutionFacility
    } = composables_useFieldSurveyData.useFieldSurveyData();
    function handleRefreshFacility() {
      if (!props.baseTable || props.baseTable.length === 0) {
        common_vendor.index.showToast({
          title: "请先提取项目基本信息",
          icon: "none",
          duration: 2e3
        });
        return;
      }
      extractFacilitiesFromBaseTable(props.projectId, props.baseTable);
    }
    function handleAddFacility() {
      addPollutionFacility(props.projectId);
    }
    function handleRemoveFacility(index) {
      removePollutionFacility(index, props.projectId);
    }
    common_vendor.onMounted(() => {
      loadFacilityList(props.projectId);
    });
    const currentPage = common_vendor.ref(1);
    const paginatedFacilityList = common_vendor.computed(() => {
      const start = (currentPage.value - 1) * pageSize;
      const end = start + pageSize;
      return filteredFacilityList.value.slice(start, end);
    });
    const totalPages = common_vendor.computed(
      () => Math.ceil(filteredFacilityList.value.length / pageSize)
    );
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "flag",
          size: "20",
          color: "#166534"
        }),
        b: common_vendor.t(common_vendor.unref(filteredFacilityList).length),
        c: common_vendor.o(common_vendor.unref(onFacilitySearchInput)),
        d: common_vendor.o(($event) => common_vendor.isRef(facilitySearchKeyword) ? facilitySearchKeyword.value = $event : null),
        e: common_vendor.p({
          placeholder: "搜索设施名称、处理工艺或备注...",
          prefixIcon: "search",
          clearable: true,
          modelValue: common_vendor.unref(facilitySearchKeyword)
        }),
        f: common_vendor.unref(facilitySearchKeyword)
      }, common_vendor.unref(facilitySearchKeyword) ? {
        g: common_vendor.t(common_vendor.unref(filteredFacilityList).length)
      } : {}, {
        h: common_vendor.p({
          type: "plus",
          size: "18",
          color: "#ffffff"
        }),
        i: common_vendor.o(handleAddFacility),
        j: common_vendor.p({
          type: common_vendor.unref(loadingFacility) ? "spinner-cycle" : "refresh",
          size: "18",
          color: common_vendor.unref(loadingFacility) ? "#94a3b8" : "#ffffff"
        }),
        k: common_vendor.t(common_vendor.unref(loadingFacility) ? "加载" : "刷新"),
        l: common_vendor.o(handleRefreshFacility),
        m: common_vendor.unref(loadingFacility),
        n: common_vendor.unref(loadingFacility)
      }, common_vendor.unref(loadingFacility) ? {
        o: common_vendor.p({
          type: "spinner-cycle",
          size: "48",
          color: "#166534"
        })
      } : common_vendor.unref(fetchFacilityError) ? {
        q: common_vendor.p({
          type: "close-circle",
          size: "48",
          color: "#dc2626"
        }),
        r: common_vendor.t(common_vendor.unref(fetchFacilityError)),
        s: common_vendor.o((...args) => _ctx.handleFetchFacility && _ctx.handleFetchFacility(...args))
      } : common_vendor.unref(filteredFacilityList).length ? common_vendor.e({
        v: common_vendor.f(paginatedFacilityList.value, (item, index, i0) => {
          return {
            a: common_vendor.t(index + 1),
            b: "4bdbf4c5-6-" + i0,
            c: common_vendor.o(($event) => item.name = $event, item.id),
            d: common_vendor.p({
              placeholder: "请输入设施名称",
              clearable: true,
              modelValue: item.name
            }),
            e: "4bdbf4c5-7-" + i0,
            f: common_vendor.o(($event) => item.quantity = $event, item.id),
            g: common_vendor.p({
              placeholder: "处理工艺",
              clearable: true,
              modelValue: item.quantity
            }),
            h: "4bdbf4c5-8-" + i0,
            i: common_vendor.o(($event) => item.remark = $event, item.id),
            j: common_vendor.p({
              placeholder: "备注信息",
              clearable: true,
              modelValue: item.remark
            }),
            k: "4bdbf4c5-9-" + i0,
            l: common_vendor.o(($event) => item.images = $event, item.id),
            m: common_vendor.p({
              fileMediatype: "image",
              mode: "grid",
              limit: 7,
              ["auto-upload"]: false,
              modelValue: item.images
            }),
            n: "4bdbf4c5-10-" + i0,
            o: common_vendor.o(() => handleRemoveFacility(index), item.id),
            p: item.id,
            q: index % 2 === 0 ? 1 : ""
          };
        }),
        w: common_vendor.p({
          type: "trash",
          size: "18",
          color: "#ef4444"
        }),
        x: totalPages.value > 1
      }, totalPages.value > 1 ? {
        y: currentPage.value === 1,
        z: common_vendor.o(($event) => currentPage.value--),
        A: common_vendor.t(currentPage.value),
        B: common_vendor.t(totalPages.value),
        C: currentPage.value === totalPages.value,
        D: common_vendor.o(($event) => currentPage.value++)
      } : {}) : common_vendor.e({
        E: common_vendor.p({
          type: common_vendor.unref(facilitySearchKeyword) ? "search" : "flag",
          size: "64",
          color: "#e2e8f0"
        }),
        F: common_vendor.t(common_vendor.unref(facilitySearchKeyword) ? "未找到匹配的设施" : "暂无设施信息"),
        G: common_vendor.t(common_vendor.unref(facilitySearchKeyword) ? "试试其他关键词或清空搜索" : '点击"新增设施"按钮开始添加'),
        H: !common_vendor.unref(facilitySearchKeyword)
      }, !common_vendor.unref(facilitySearchKeyword) ? {
        I: common_vendor.p({
          type: "plus",
          size: "16",
          color: "#ffffff"
        }),
        J: common_vendor.o(handleAddFacility)
      } : {}), {
        p: common_vendor.unref(fetchFacilityError),
        t: common_vendor.unref(filteredFacilityList).length
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-4bdbf4c5"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/components/field-survey/tabs/FacilityTab.js.map
