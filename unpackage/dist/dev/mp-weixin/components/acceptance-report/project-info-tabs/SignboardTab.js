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
  (_easycom_uni_icons + _easycom_uni_easyinput)();
}
const _sfc_main = {
  __name: "SignboardTab",
  emits: ["complete"],
  setup(__props, { emit: __emit }) {
    const {
      signboard,
      showSignboard,
      // 方法
      generateSignboard,
      addSignItem,
      removeGroup,
      groupItems,
      downloadSignboard
    } = composables_useProjectInfo.useProjectInfo();
    const emit = __emit;
    function handleGenerate() {
      generateSignboard();
      showSignboard.value = true;
    }
    function handleDownload() {
      downloadSignboard();
    }
    function handleComplete() {
      emit("complete");
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "list",
          size: "18",
          color: "#fb923c"
        }),
        b: common_vendor.p({
          type: "eye-filled",
          size: "16",
          color: "#ffffff"
        }),
        c: common_vendor.o(handleGenerate),
        d: common_vendor.unref(showSignboard)
      }, common_vendor.unref(showSignboard) ? {
        e: common_vendor.p({
          type: "download-filled",
          size: "16",
          color: "#ffffff"
        }),
        f: common_vendor.o(handleDownload)
      } : {}, {
        g: common_vendor.unref(showSignboard)
      }, common_vendor.unref(showSignboard) ? {
        h: common_vendor.p({
          type: "redo-filled",
          size: "16",
          color: "#ffffff"
        }),
        i: common_vendor.o(handleComplete)
      } : {}, {
        j: common_vendor.unref(showSignboard)
      }, common_vendor.unref(showSignboard) ? {
        k: common_vendor.f(common_vendor.unref(signboard).sections, (sec, si, i0) => {
          return common_vendor.e({
            a: common_vendor.t(sec.block),
            b: sec.block == "噪声"
          }, sec.block == "噪声" ? {
            c: "bc8afd72-4-" + i0,
            d: common_vendor.p({
              type: "plus",
              size: "16",
              color: "#166534"
            }),
            e: common_vendor.o(() => common_vendor.unref(addSignItem)(si), "s" + si)
          } : {}, {
            f: common_vendor.f(common_vendor.unref(groupItems)(sec.items, sec.block), (group, gi, i1) => {
              return common_vendor.e({
                a: common_vendor.f(group, (it, ii, i2) => {
                  return {
                    a: "bc8afd72-5-" + i0 + "-" + i1 + "-" + i2,
                    b: common_vendor.o(($event) => it.title = $event, "r" + si + "-" + gi + "-" + ii),
                    c: common_vendor.p({
                      placeholder: "内容标题",
                      modelValue: it.title
                    }),
                    d: "bc8afd72-6-" + i0 + "-" + i1 + "-" + i2,
                    e: common_vendor.o(($event) => it.content = $event, "r" + si + "-" + gi + "-" + ii),
                    f: common_vendor.p({
                      placeholder: "请输入具体的值",
                      modelValue: it.content
                    }),
                    g: "r" + si + "-" + gi + "-" + ii
                  };
                })
              }, sec.block !== "危险废物" ? {
                b: "bc8afd72-7-" + i0 + "-" + i1,
                c: common_vendor.p({
                  type: "trash",
                  size: "20",
                  color: "#d92d20"
                }),
                d: common_vendor.o(() => common_vendor.unref(removeGroup)(sec, gi), "g" + si + "-" + gi)
              } : {}, {
                e: "g" + si + "-" + gi
              });
            }),
            g: sec.block !== "危险废物",
            h: "s" + si
          });
        })
      } : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-bc8afd72"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/components/acceptance-report/project-info-tabs/SignboardTab.js.map
