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
const constructionPageSize = 10;
const _sfc_main = {
  __name: "MainContentTab",
  props: {
    baseTable: {
      type: Array,
      default: () => []
    },
    userId: {
      type: [String, Number],
      required: true
    },
    projectId: {
      type: [String, Number, null],
      default: null
    }
  },
  setup(__props) {
    const props = __props;
    const searchKeyword = common_vendor.ref("");
    function onSearchInput() {
      common_vendor.index.__f__("log", "at components/field-survey/tabs/MainContentTab.vue:224", "搜索关键词:", searchKeyword.value);
    }
    const displayItems = common_vendor.computed(() => {
      return props.baseTable.filter((item) => item.id !== "pollutants_emission");
    });
    const filteredDisplayItems = common_vendor.computed(() => {
      if (!searchKeyword.value) {
        return displayItems.value;
      }
      const keyword = searchKeyword.value.toLowerCase().trim();
      return displayItems.value.filter((item) => {
        const label = (item.label || "").toLowerCase();
        const value = (item.value || "").toString().toLowerCase();
        return label.includes(keyword) || value.includes(keyword);
      });
    });
    common_vendor.computed(() => {
      return displayItems.value.filter((item) => item.type !== "image");
    });
    const filteredTextItems = common_vendor.computed(() => {
      return filteredDisplayItems.value.filter((item) => item.type !== "image");
    });
    common_vendor.computed(() => {
      return displayItems.value.filter((item) => item.type === "image");
    });
    const {
      constructionList,
      constructionSearchKeyword,
      filteredConstructionList,
      loadingConstruction,
      fetchConstructionError,
      onConstructionSearchInput,
      fetchConstructionData,
      addConstruction,
      removeConstruction
    } = composables_useFieldSurveyData.useFieldSurveyData();
    function handleFetchConstruction() {
      fetchConstructionData(props.userId, props.projectId);
    }
    common_vendor.onMounted(() => {
      if (!constructionList.value.length && props.userId && props.projectId) {
        fetchConstructionData(props.userId, props.projectId);
      }
    });
    const constructionCurrentPage = common_vendor.ref(1);
    const paginatedConstructionList = common_vendor.computed(() => {
      const start = (constructionCurrentPage.value - 1) * constructionPageSize;
      const end = start + constructionPageSize;
      return filteredConstructionList.value.slice(start, end);
    });
    const constructionTotalPages = common_vendor.computed(
      () => Math.ceil(filteredConstructionList.value.length / constructionPageSize)
    );
    common_vendor.computed(() => {
      return filteredDisplayItems.value.filter((item) => item.type === "image");
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "list",
          size: "20",
          color: "#166534"
        }),
        b: common_vendor.t(filteredDisplayItems.value.length),
        c: displayItems.value.length > 0
      }, displayItems.value.length > 0 ? common_vendor.e({
        d: common_vendor.o(onSearchInput),
        e: common_vendor.o(($event) => searchKeyword.value = $event),
        f: common_vendor.p({
          placeholder: "搜索项目信息...",
          prefixIcon: "search",
          clearable: true,
          modelValue: searchKeyword.value
        }),
        g: searchKeyword.value
      }, searchKeyword.value ? {
        h: common_vendor.t(filteredDisplayItems.value.length)
      } : {}) : {}, {
        i: filteredDisplayItems.value.length > 0
      }, filteredDisplayItems.value.length > 0 ? common_vendor.e({
        j: filteredTextItems.value.length > 0
      }, filteredTextItems.value.length > 0 ? {
        k: common_vendor.p({
          type: "compose",
          size: "18",
          color: "#166534"
        }),
        l: common_vendor.f(filteredTextItems.value, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.label),
            b: "3191804b-3-" + i0,
            c: common_vendor.o(($event) => item.value = $event, item.id),
            d: common_vendor.p({
              placeholder: `请输入${item.label}`,
              clearable: true,
              modelValue: item.value
            }),
            e: item.id
          };
        })
      } : {}) : displayItems.value.length === 0 ? {
        n: common_vendor.p({
          type: searchKeyword.value ? "search" : "list",
          size: "64",
          color: "#e2e8f0"
        }),
        o: common_vendor.t(searchKeyword.value ? "未找到匹配的信息" : "暂无建设内容信息"),
        p: common_vendor.t(searchKeyword.value ? "试试其他关键词或清空搜索" : "请先在竣工验收页面提取项目基本信息")
      } : {}, {
        m: displayItems.value.length === 0,
        q: common_vendor.p({
          type: "home",
          size: "20",
          color: "#166534"
        }),
        r: common_vendor.t(common_vendor.unref(filteredConstructionList).length),
        s: common_vendor.p({
          type: "plus",
          size: "18",
          color: "#ffffff"
        }),
        t: common_vendor.o((...args) => common_vendor.unref(addConstruction) && common_vendor.unref(addConstruction)(...args)),
        v: common_vendor.p({
          type: common_vendor.unref(loadingConstruction) ? "spinner-cycle" : "refresh",
          size: "18",
          color: common_vendor.unref(loadingConstruction) ? "#94a3b8" : "#ffffff"
        }),
        w: common_vendor.t(common_vendor.unref(loadingConstruction) ? "加载" : "刷新"),
        x: common_vendor.o(handleFetchConstruction),
        y: common_vendor.unref(loadingConstruction),
        z: common_vendor.unref(constructionList).length > 0
      }, common_vendor.unref(constructionList).length > 0 ? common_vendor.e({
        A: common_vendor.o(common_vendor.unref(onConstructionSearchInput)),
        B: common_vendor.o(($event) => common_vendor.isRef(constructionSearchKeyword) ? constructionSearchKeyword.value = $event : null),
        C: common_vendor.p({
          placeholder: "搜索工程名称、内容或备注...",
          prefixIcon: "search",
          clearable: true,
          modelValue: common_vendor.unref(constructionSearchKeyword)
        }),
        D: common_vendor.unref(constructionSearchKeyword)
      }, common_vendor.unref(constructionSearchKeyword) ? {
        E: common_vendor.t(common_vendor.unref(filteredConstructionList).length)
      } : {}) : {}, {
        F: common_vendor.unref(loadingConstruction)
      }, common_vendor.unref(loadingConstruction) ? {
        G: common_vendor.p({
          type: "spinner-cycle",
          size: "48",
          color: "#166534"
        })
      } : common_vendor.unref(fetchConstructionError) ? {
        I: common_vendor.p({
          type: "close-circle",
          size: "48",
          color: "#dc2626"
        }),
        J: common_vendor.t(common_vendor.unref(fetchConstructionError)),
        K: common_vendor.o(handleFetchConstruction)
      } : common_vendor.unref(filteredConstructionList).length ? common_vendor.e({
        M: common_vendor.f(paginatedConstructionList.value, (item, index, i0) => {
          return {
            a: "3191804b-11-" + i0,
            b: common_vendor.o(($event) => item.category = $event, item.id),
            c: common_vendor.p({
              placeholder: "类别",
              clearable: true,
              modelValue: item.category
            }),
            d: "3191804b-12-" + i0,
            e: common_vendor.o(($event) => item.name = $event, item.id),
            f: common_vendor.p({
              placeholder: "请输入工程名称",
              clearable: true,
              modelValue: item.name
            }),
            g: "3191804b-13-" + i0,
            h: common_vendor.o(($event) => item.location = $event, item.id),
            i: common_vendor.p({
              placeholder: "位置",
              clearable: true,
              modelValue: item.location
            }),
            j: "3191804b-14-" + i0,
            k: common_vendor.o(($event) => item.content = $event, item.id),
            l: common_vendor.p({
              placeholder: "请输入工程内容",
              clearable: true,
              modelValue: item.content
            }),
            m: "3191804b-15-" + i0,
            n: common_vendor.o(($event) => item.remark = $event, item.id),
            o: common_vendor.p({
              placeholder: "请填写备注信息",
              clearable: true,
              modelValue: item.remark
            }),
            p: "3191804b-16-" + i0,
            q: common_vendor.o(($event) => item.images = $event, item.id),
            r: common_vendor.p({
              fileMediatype: "image",
              mode: "grid",
              limit: 7,
              ["auto-upload"]: false,
              modelValue: item.images
            }),
            s: "3191804b-17-" + i0,
            t: common_vendor.o(() => common_vendor.unref(removeConstruction)(index), item.id),
            v: item.id,
            w: index % 2 === 0 ? 1 : ""
          };
        }),
        N: common_vendor.p({
          type: "trash",
          size: "18",
          color: "#ef4444"
        }),
        O: constructionTotalPages.value > 1
      }, constructionTotalPages.value > 1 ? {
        P: constructionCurrentPage.value === 1,
        Q: common_vendor.o(($event) => constructionCurrentPage.value--),
        R: common_vendor.t(constructionCurrentPage.value),
        S: common_vendor.t(constructionTotalPages.value),
        T: constructionCurrentPage.value === constructionTotalPages.value,
        U: common_vendor.o(($event) => constructionCurrentPage.value++)
      } : {}) : {
        V: common_vendor.p({
          type: common_vendor.unref(constructionSearchKeyword) ? "search" : "home",
          size: "64",
          color: "#e2e8f0"
        }),
        W: common_vendor.t(common_vendor.unref(constructionSearchKeyword) ? "未找到匹配的工程" : "暂无工程信息"),
        X: common_vendor.t(common_vendor.unref(constructionSearchKeyword) ? "试试其他关键词或清空搜索" : '点击"新增"按钮开始添加或点击"刷新"加载数据')
      }, {
        H: common_vendor.unref(fetchConstructionError),
        L: common_vendor.unref(filteredConstructionList).length
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-3191804b"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/components/field-survey/tabs/MainContentTab.js.map
