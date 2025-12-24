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
  __name: "EquipmentTab",
  props: {
    userId: {
      type: [String, Number],
      required: true
    },
    projectId: {
      type: [String, Number],
      required: true
    }
  },
  setup(__props) {
    const props = __props;
    const {
      equipmentSearchKeyword,
      filteredEquipmentList,
      loadingEquipment,
      fetchEquipmentError,
      onEquipmentSearchInput,
      fetchEquipmentData,
      addEquipment,
      removeEquipment
    } = composables_useFieldSurveyData.useFieldSurveyData();
    function handleFetchEquipment() {
      fetchEquipmentData(props.userId, props.projectId);
    }
    common_vendor.onMounted(() => {
      if (!filteredEquipmentList.value.length && props.userId && props.projectId) {
        common_vendor.index.__f__("log", "at components/field-survey/tabs/EquipmentTab.vue:183", "EquipmentTab 挂载，自动加载设备数据");
        fetchEquipmentData(props.userId, props.projectId);
      }
    });
    const currentPage = common_vendor.ref(1);
    const paginatedEquipmentList = common_vendor.computed(() => {
      const start = (currentPage.value - 1) * pageSize;
      const end = start + pageSize;
      return filteredEquipmentList.value.slice(start, end);
    });
    const totalPages = common_vendor.computed(
      () => Math.ceil(filteredEquipmentList.value.length / pageSize)
    );
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "gear",
          size: "20",
          color: "#166534"
        }),
        b: common_vendor.t(common_vendor.unref(filteredEquipmentList).length),
        c: common_vendor.o(common_vendor.unref(onEquipmentSearchInput)),
        d: common_vendor.o(($event) => common_vendor.isRef(equipmentSearchKeyword) ? equipmentSearchKeyword.value = $event : null),
        e: common_vendor.p({
          placeholder: "搜索设备名称、数量或备注...",
          prefixIcon: "search",
          clearable: true,
          modelValue: common_vendor.unref(equipmentSearchKeyword)
        }),
        f: common_vendor.unref(equipmentSearchKeyword)
      }, common_vendor.unref(equipmentSearchKeyword) ? {
        g: common_vendor.t(common_vendor.unref(filteredEquipmentList).length)
      } : {}, {
        h: common_vendor.p({
          type: "plus",
          size: "18",
          color: "#ffffff"
        }),
        i: common_vendor.o((...args) => common_vendor.unref(addEquipment) && common_vendor.unref(addEquipment)(...args)),
        j: common_vendor.p({
          type: common_vendor.unref(loadingEquipment) ? "spinner-cycle" : "refresh",
          size: "18",
          color: common_vendor.unref(loadingEquipment) ? "#94a3b8" : "#ffffff"
        }),
        k: common_vendor.t(common_vendor.unref(loadingEquipment) ? "加载" : "刷新"),
        l: common_vendor.o(handleFetchEquipment),
        m: common_vendor.unref(loadingEquipment),
        n: common_vendor.unref(loadingEquipment)
      }, common_vendor.unref(loadingEquipment) ? {
        o: common_vendor.p({
          type: "spinner-cycle",
          size: "48",
          color: "#166534"
        })
      } : common_vendor.unref(fetchEquipmentError) ? {
        q: common_vendor.p({
          type: "close-circle",
          size: "48",
          color: "#dc2626"
        }),
        r: common_vendor.t(common_vendor.unref(fetchEquipmentError)),
        s: common_vendor.o(handleFetchEquipment)
      } : common_vendor.unref(filteredEquipmentList).length ? common_vendor.e({
        v: common_vendor.f(paginatedEquipmentList.value, (item, index, i0) => {
          return {
            a: common_vendor.t(index + 1),
            b: "52feeb38-6-" + i0,
            c: common_vendor.o(($event) => item.name = $event, item.id),
            d: common_vendor.p({
              disabled: true,
              placeholder: "请输入设备名称",
              clearable: true,
              modelValue: item.name
            }),
            e: "52feeb38-7-" + i0,
            f: common_vendor.o(($event) => item.quantity = $event, item.id),
            g: common_vendor.p({
              placeholder: "数量",
              clearable: true,
              modelValue: item.quantity
            }),
            h: "52feeb38-8-" + i0,
            i: common_vendor.o(($event) => item.remark = $event, item.id),
            j: common_vendor.p({
              placeholder: "备注信息",
              clearable: true,
              modelValue: item.remark
            }),
            k: "52feeb38-9-" + i0,
            l: common_vendor.o(($event) => item.images = $event, item.id),
            m: common_vendor.p({
              fileMediatype: "image",
              mode: "grid",
              limit: 7,
              ["auto-upload"]: false,
              modelValue: item.images
            }),
            n: "52feeb38-10-" + i0,
            o: common_vendor.o(() => common_vendor.unref(removeEquipment)(index), item.id),
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
          type: common_vendor.unref(equipmentSearchKeyword) ? "search" : "gear",
          size: "64",
          color: "#e2e8f0"
        }),
        F: common_vendor.t(common_vendor.unref(equipmentSearchKeyword) ? "未找到匹配的设备" : "暂无设备信息"),
        G: common_vendor.t(common_vendor.unref(equipmentSearchKeyword) ? "试试其他关键词或清空搜索" : '点击"新增设备"按钮开始添加'),
        H: !common_vendor.unref(equipmentSearchKeyword)
      }, !common_vendor.unref(equipmentSearchKeyword) ? {
        I: common_vendor.p({
          type: "plus",
          size: "16",
          color: "#ffffff"
        }),
        J: common_vendor.o((...args) => common_vendor.unref(addEquipment) && common_vendor.unref(addEquipment)(...args))
      } : {}), {
        p: common_vendor.unref(fetchEquipmentError),
        t: common_vendor.unref(filteredEquipmentList).length
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-52feeb38"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/components/field-survey/tabs/EquipmentTab.js.map
