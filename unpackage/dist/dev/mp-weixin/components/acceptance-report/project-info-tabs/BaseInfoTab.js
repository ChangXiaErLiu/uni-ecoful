"use strict";
const common_vendor = require("../../../common/vendor.js");
const composables_useProjectInfo = require("../../../composables/useProjectInfo.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_icons2 + _easycom_uni_easyinput2 + _easycom_uni_popup2)();
}
const _easycom_uni_icons = () => "../../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_easyinput = () => "../../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_uni_popup = () => "../../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_easyinput + _easycom_uni_popup)();
}
const _sfc_main = {
  __name: "BaseInfoTab",
  setup(__props) {
    const {
      baseTable,
      selectMode,
      selectedIds,
      newBaseInfoLabel,
      // 方法
      toggleSelectMode,
      toggleSelected,
      removeSelected,
      confirmAddBaseInfo
    } = composables_useProjectInfo.useProjectInfo();
    const newBaseInfoPopup = common_vendor.ref(null);
    function handleOpenAddBase() {
      var _a;
      (_a = newBaseInfoPopup.value) == null ? void 0 : _a.open();
    }
    function handleCloseBaseInfo() {
      var _a;
      (_a = newBaseInfoPopup.value) == null ? void 0 : _a.close();
    }
    function handleConfirmAddBaseInfo() {
      var _a;
      const success = confirmAddBaseInfo();
      if (success) {
        (_a = newBaseInfoPopup.value) == null ? void 0 : _a.close();
      }
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.unref(baseTable).length > 0
      }, common_vendor.unref(baseTable).length > 0 ? common_vendor.e({
        b: common_vendor.p({
          type: "list",
          size: "18",
          color: "#166534"
        }),
        c: common_vendor.p({
          type: "plus",
          size: "16",
          color: "#166534"
        }),
        d: common_vendor.o(handleOpenAddBase),
        e: common_vendor.unref(selectMode)
      }, common_vendor.unref(selectMode) ? {
        f: common_vendor.p({
          type: "trash",
          size: "16",
          color: "#ffffff"
        }),
        g: common_vendor.t(common_vendor.unref(selectedIds).length),
        h: !common_vendor.unref(selectedIds).length,
        i: common_vendor.o((...args) => common_vendor.unref(removeSelected) && common_vendor.unref(removeSelected)(...args))
      } : {}, {
        j: common_vendor.p({
          type: common_vendor.unref(selectMode) ? "clear" : "checkbox",
          size: "16",
          color: "#155e3b"
        }),
        k: common_vendor.t(common_vendor.unref(selectMode) ? "取消" : "选择删除"),
        l: common_vendor.o((...args) => common_vendor.unref(toggleSelectMode) && common_vendor.unref(toggleSelectMode)(...args)),
        m: common_vendor.f(common_vendor.unref(baseTable), (item, idx, i0) => {
          var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p;
          return common_vendor.e({
            a: item.id === "pollutants_emission" && item.type === "table"
          }, item.id === "pollutants_emission" && item.type === "table" ? common_vendor.e({
            b: item.source === "extracted"
          }, item.source === "extracted" ? {} : {}, {
            c: ((_a = item.value.水污染物) == null ? void 0 : _a.length) || ((_b = item.value.大气污染物) == null ? void 0 : _b.length) || ((_c = item.value.噪声) == null ? void 0 : _c.length)
          }, ((_d = item.value.水污染物) == null ? void 0 : _d.length) || ((_e = item.value.大气污染物) == null ? void 0 : _e.length) || ((_f = item.value.噪声) == null ? void 0 : _f.length) ? common_vendor.e({
            d: item.value.水污染物 && item.value.水污染物.length
          }, item.value.水污染物 && item.value.水污染物.length ? {
            e: common_vendor.f(item.value.水污染物, (water, index, i1) => {
              return {
                a: common_vendor.t(water.污染物名称 || "-"),
                b: common_vendor.t(water.污染因子 || "-"),
                c: common_vendor.t(water.污染治理措施 || "-"),
                d: common_vendor.t(water.排放去向 || "-"),
                e: common_vendor.t(water.执行标准 || "-"),
                f: "water-" + index
              };
            })
          } : {}, {
            f: item.value.大气污染物 && item.value.大气污染物.length
          }, item.value.大气污染物 && item.value.大气污染物.length ? {
            g: common_vendor.f(item.value.大气污染物, (air, index, i1) => {
              return {
                a: common_vendor.t(air.污染物名称 || "-"),
                b: common_vendor.t(air.污染因子 || "-"),
                c: common_vendor.t(air.污染治理措施 || "-"),
                d: common_vendor.t(air.排放去向 || "-"),
                e: common_vendor.t(air.执行标准 || "-"),
                f: "air-" + index
              };
            })
          } : {}, {
            h: item.value.噪声 && item.value.噪声.length
          }, item.value.噪声 && item.value.噪声.length ? {
            i: common_vendor.f(item.value.噪声, (noise, index, i1) => {
              return {
                a: common_vendor.t(noise.污染物名称 || "-"),
                b: common_vendor.t(noise.污染因子 || "-"),
                c: common_vendor.t(noise.污染治理措施 || "-"),
                d: common_vendor.t(noise.排放去向 || "-"),
                e: common_vendor.t(noise.执行标准 || "-"),
                f: "noise-" + index
              };
            })
          } : {}, {
            j: !((_g = item.value.水污染物) == null ? void 0 : _g.length) && !((_h = item.value.大气污染物) == null ? void 0 : _h.length) && !((_i = item.value.噪声) == null ? void 0 : _i.length)
          }, !((_j = item.value.水污染物) == null ? void 0 : _j.length) && !((_k = item.value.大气污染物) == null ? void 0 : _k.length) && !((_l = item.value.噪声) == null ? void 0 : _l.length) ? {} : {}) : {}, {
            k: ((_m = item.value.固体废物) == null ? void 0 : _m.length) || ((_n = item.value.危险废物) == null ? void 0 : _n.length)
          }, ((_o = item.value.固体废物) == null ? void 0 : _o.length) || ((_p = item.value.危险废物) == null ? void 0 : _p.length) ? common_vendor.e({
            l: item.value.固体废物 && item.value.固体废物.length
          }, item.value.固体废物 && item.value.固体废物.length ? {
            m: common_vendor.f(item.value.固体废物, (solid, index, i1) => {
              return {
                a: common_vendor.t(solid.废物来源 || solid.产生环节 || "-"),
                b: common_vendor.t(solid.废物名称 || "-"),
                c: common_vendor.t(solid.危险特性 || "无"),
                d: common_vendor.t(solid.危险废物类别 || "无"),
                e: common_vendor.t(solid.污染治理措施 || solid.处置方式 || "-"),
                f: "solid-" + index
              };
            })
          } : {}, {
            n: item.value.危险废物 && item.value.危险废物.length
          }, item.value.危险废物 && item.value.危险废物.length ? {
            o: common_vendor.f(item.value.危险废物, (hazard, index, i1) => {
              return common_vendor.e({
                a: common_vendor.t(hazard.废物来源 || hazard.产生环节 || "-"),
                b: common_vendor.t(hazard.废物名称 || "-"),
                c: hazard.危险特性
              }, hazard.危险特性 ? {
                d: common_vendor.f(hazard.危险特性.includes("、") ? hazard.危险特性.split("、") : [hazard.危险特性], (prop, propIdx, i2) => {
                  return {
                    a: common_vendor.t(prop),
                    b: propIdx
                  };
                })
              } : {}, {
                e: common_vendor.t(hazard.危险废物类别 || "-"),
                f: common_vendor.t(hazard.污染治理措施 || hazard.处置方式 || "-"),
                g: "hazard-" + index
              });
            })
          } : {}) : {}, {
            p: common_vendor.unref(selectMode)
          }, common_vendor.unref(selectMode) ? {
            q: common_vendor.unref(selectedIds).includes(item.id),
            r: common_vendor.o(() => common_vendor.unref(toggleSelected)(item.id), item.id)
          } : {}) : item.id !== "pollutants_emission" && item.id !== "waste_production" ? common_vendor.e({
            t: common_vendor.t(item.label),
            v: item.source === "extracted"
          }, item.source === "extracted" ? {} : {}, {
            w: "fe6d06f0-4-" + i0,
            x: common_vendor.o(($event) => item.value = $event, item.id),
            y: common_vendor.p({
              placeholder: "请输入具体的值",
              clearable: true,
              modelValue: item.value
            }),
            z: common_vendor.unref(selectMode)
          }, common_vendor.unref(selectMode) ? {
            A: common_vendor.unref(selectedIds).includes(item.id),
            B: common_vendor.o(() => common_vendor.unref(toggleSelected)(item.id), item.id)
          } : {}) : {}, {
            s: item.id !== "pollutants_emission" && item.id !== "waste_production",
            C: item.id
          });
        })
      }) : {
        n: common_vendor.p({
          type: "info",
          size: "48",
          color: "#cbd5e1"
        })
      }, {
        o: common_vendor.o(($event) => common_vendor.isRef(newBaseInfoLabel) ? newBaseInfoLabel.value = $event : null),
        p: common_vendor.p({
          placeholder: "如：项目名称/单位名称",
          modelValue: common_vendor.unref(newBaseInfoLabel)
        }),
        q: common_vendor.o(handleCloseBaseInfo),
        r: common_vendor.o(handleConfirmAddBaseInfo),
        s: common_vendor.sr(newBaseInfoPopup, "fe6d06f0-6", {
          "k": "newBaseInfoPopup"
        }),
        t: common_vendor.p({
          type: "center"
        })
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-fe6d06f0"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/components/acceptance-report/project-info-tabs/BaseInfoTab.js.map
