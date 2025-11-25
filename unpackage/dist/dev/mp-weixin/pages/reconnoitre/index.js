"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_navTitle = require("../../stores/navTitle.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_file_picker2 = common_vendor.resolveComponent("uni-file-picker");
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_icons2 + _easycom_uni_file_picker2 + _easycom_uni_easyinput2 + _easycom_uni_popup2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_file_picker = () => "../../uni_modules/uni-file-picker/components/uni-file-picker/uni-file-picker.js";
const _easycom_uni_easyinput = () => "../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_file_picker + _easycom_uni_easyinput + AppLayout + _easycom_uni_popup)();
}
const AppLayout = () => "../../components/layout/AppLayout.js";
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const navTitle = stores_navTitle.navTitleStore();
    common_vendor.onShow(() => navTitle.setTitle("现场踏勘"));
    const tabs = ["建设内容", "设备情况", "污染物设施", "排污口情况"];
    const currentTab = common_vendor.ref(0);
    const mainContentTable = common_vendor.ref([
      { id: "mc_1", label: "项目名称", value: "", type: "text" },
      { id: "mc_2", label: "建设单位", value: "", type: "text" },
      { id: "mc_3", label: "建设地点", value: "", type: "text" },
      { id: "mc_4", label: "建设规模", value: "", type: "text" },
      { id: "mc_5", label: "主体工程", value: [], type: "image" }
    ]);
    const selectModeMain = common_vendor.ref(false);
    const selectedMainIds = common_vendor.ref([]);
    const newMainContentPopup = common_vendor.ref(null);
    const newMainContentLabel = common_vendor.ref("");
    function toggleSelectModeMain() {
      selectModeMain.value = !selectModeMain.value;
      if (!selectModeMain.value)
        selectedMainIds.value = [];
    }
    function toggleSelectedMain(id) {
      const idx = selectedMainIds.value.indexOf(id);
      if (idx > -1)
        selectedMainIds.value.splice(idx, 1);
      else
        selectedMainIds.value.push(id);
    }
    function removeSelectedMain() {
      mainContentTable.value = mainContentTable.value.filter((item) => !selectedMainIds.value.includes(item.id));
      selectedMainIds.value = [];
      selectModeMain.value = false;
      common_vendor.index.showToast({ title: "删除成功", icon: "success" });
    }
    function openAddMainContent() {
      var _a;
      newMainContentLabel.value = "";
      (_a = newMainContentPopup.value) == null ? void 0 : _a.open();
    }
    function closeMainContent() {
      var _a;
      (_a = newMainContentPopup.value) == null ? void 0 : _a.close();
    }
    function confirmAddMainContent() {
      if (!newMainContentLabel.value.trim()) {
        common_vendor.index.showToast({ title: "请输入内容名称", icon: "none" });
        return;
      }
      const newItem = {
        id: "mc_" + Date.now(),
        label: newMainContentLabel.value,
        value: "",
        type: "text"
      };
      mainContentTable.value.push(newItem);
      closeMainContent();
      common_vendor.index.showToast({ title: "添加成功", icon: "success" });
    }
    const equipmentList = common_vendor.ref([
      { id: "eq_1", name: "废水处理设备", quantity: "1", remark: "运行正常", images: [] },
      { id: "eq_2", name: "废气处理设备", quantity: "2", remark: "定期维护", images: [] }
    ]);
    function addEquipment() {
      const newEquipment = {
        id: "eq_" + Date.now(),
        name: "",
        quantity: "",
        remark: "",
        images: []
      };
      equipmentList.value.push(newEquipment);
      common_vendor.index.showToast({ title: "已添加新设备", icon: "success" });
    }
    function removeEquipment(index) {
      common_vendor.index.showModal({
        title: "确认删除",
        content: "确定要删除这条设备记录吗？",
        success: (res) => {
          if (res.confirm) {
            equipmentList.value.splice(index, 1);
            common_vendor.index.showToast({ title: "删除成功", icon: "success" });
          }
        }
      });
    }
    const pollutionFacilityList = common_vendor.ref([
      { id: "pf_1", name: "废水处理站", quantity: "1", remark: "处理能力100t/d", images: [] },
      { id: "pf_2", name: "危废暂存间", quantity: "1", remark: "面积50㎡", images: [] }
    ]);
    function addPollutionFacility() {
      const newFacility = {
        id: "pf_" + Date.now(),
        name: "",
        quantity: "",
        remark: "",
        images: []
      };
      pollutionFacilityList.value.push(newFacility);
      common_vendor.index.showToast({ title: "已添加新设施", icon: "success" });
    }
    function removePollutionFacility(index) {
      common_vendor.index.showModal({
        title: "确认删除",
        content: "确定要删除这条设施记录吗？",
        success: (res) => {
          if (res.confirm) {
            pollutionFacilityList.value.splice(index, 1);
            common_vendor.index.showToast({ title: "删除成功", icon: "success" });
          }
        }
      });
    }
    const outletSignboard = common_vendor.ref({
      sections: []
    });
    function generateOutletInfo() {
      outletSignboard.value = {
        sections: [
          {
            block: "废水排放口",
            items: [
              { title: "排放口编号", content: "WS-001" },
              { title: "排放口名称", content: "生产废水排放口" },
              { title: "排放去向", content: "市政污水管网" }
            ]
          },
          {
            block: "废气排放口",
            items: [
              { title: "排放口编号", content: "FQ-001" },
              { title: "排放口名称", content: "锅炉废气排放口" },
              { title: "排放高度", content: "15米" }
            ]
          },
          {
            block: "噪声",
            items: [
              { title: "监测点位", content: "厂界东侧" },
              { title: "主要噪声源", content: "生产设备" },
              { title: "执行标准", content: "2类标准" }
            ]
          },
          {
            block: "危险废物",
            items: [
              { title: "危废名称", content: "废机油" },
              { title: "危废代码", content: "HW08" },
              { title: "暂存位置", content: "危废暂存间" }
            ]
          }
        ]
      };
      common_vendor.index.showToast({ title: "排污口信息已生成", icon: "success" });
    }
    function addOutletItem(sectionIndex) {
      const section = outletSignboard.value.sections[sectionIndex];
      if (section) {
        section.items.push(
          { title: "", content: "" },
          { title: "", content: "" },
          { title: "", content: "" }
        );
      }
    }
    function groupOutletItems(items, blockName) {
      if (!items || items.length === 0)
        return [];
      if (blockName === "危险废物") {
        return [items];
      }
      const groups = [];
      for (let i = 0; i < items.length; i += 3) {
        groups.push(items.slice(i, i + 3));
      }
      return groups;
    }
    function removeOutletGroup(section, groupIndex) {
      common_vendor.index.showModal({
        title: "确认删除",
        content: "确定要删除这组信息吗？",
        success: (res) => {
          if (res.confirm) {
            section.items.splice(groupIndex * 3, 3);
            common_vendor.index.showToast({ title: "删除成功", icon: "success" });
          }
        }
      });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(tabs, (tab, index, i0) => {
          return {
            a: common_vendor.t(tab),
            b: index,
            c: currentTab.value === index ? 1 : "",
            d: common_vendor.o(($event) => currentTab.value = index, index)
          };
        }),
        b: common_vendor.p({
          type: "list",
          size: "20",
          color: "#166534"
        }),
        c: common_vendor.p({
          type: "plus",
          size: "16",
          color: "#166534"
        }),
        d: common_vendor.o(openAddMainContent),
        e: selectModeMain.value
      }, selectModeMain.value ? {
        f: common_vendor.p({
          type: "trash",
          size: "16",
          color: "#ffffff"
        }),
        g: common_vendor.t(selectedMainIds.value.length),
        h: !selectedMainIds.value.length,
        i: common_vendor.o(removeSelectedMain)
      } : {}, {
        j: common_vendor.p({
          type: selectModeMain.value ? "clear" : "checkbox",
          size: "16",
          color: "#155e3b"
        }),
        k: common_vendor.t(selectModeMain.value ? "取消" : "选择删除"),
        l: common_vendor.o(toggleSelectModeMain),
        m: mainContentTable.value.length
      }, mainContentTable.value.length ? {
        n: common_vendor.f(mainContentTable.value, (item, idx, i0) => {
          return common_vendor.e({
            a: common_vendor.t(item.label),
            b: item.type === "image"
          }, item.type === "image" ? {
            c: "10464b8b-5-" + i0 + ",10464b8b-0",
            d: common_vendor.o(($event) => item.value = $event, item.id),
            e: common_vendor.p({
              fileMediatype: "image",
              mode: "grid",
              limit: 9,
              ["auto-upload"]: false,
              modelValue: item.value
            })
          } : {
            f: "10464b8b-6-" + i0 + ",10464b8b-0",
            g: common_vendor.o(($event) => item.value = $event, item.id),
            h: common_vendor.p({
              placeholder: "请输入具体的值",
              clearable: true,
              modelValue: item.value
            })
          }, selectModeMain.value ? {
            i: selectedMainIds.value.includes(item.id),
            j: common_vendor.o(() => toggleSelectedMain(item.id), item.id)
          } : {}, {
            k: item.id
          });
        }),
        o: selectModeMain.value
      } : {
        p: common_vendor.p({
          type: "list",
          size: "48",
          color: "#cbd5e1"
        })
      }, {
        q: currentTab.value === 0,
        r: common_vendor.p({
          type: "gear",
          size: "20",
          color: "#166534"
        }),
        s: common_vendor.p({
          type: "plus",
          size: "16",
          color: "#166534"
        }),
        t: common_vendor.o(addEquipment),
        v: equipmentList.value.length
      }, equipmentList.value.length ? {
        w: common_vendor.f(equipmentList.value, (item, index, i0) => {
          return {
            a: "10464b8b-10-" + i0 + ",10464b8b-0",
            b: common_vendor.o(($event) => item.name = $event, item.id),
            c: common_vendor.p({
              placeholder: "设备名称",
              modelValue: item.name
            }),
            d: "10464b8b-11-" + i0 + ",10464b8b-0",
            e: common_vendor.o(($event) => item.quantity = $event, item.id),
            f: common_vendor.p({
              placeholder: "数量",
              modelValue: item.quantity
            }),
            g: "10464b8b-12-" + i0 + ",10464b8b-0",
            h: common_vendor.o(($event) => item.remark = $event, item.id),
            i: common_vendor.p({
              placeholder: "备注",
              modelValue: item.remark
            }),
            j: "10464b8b-13-" + i0 + ",10464b8b-0",
            k: common_vendor.o(($event) => item.images = $event, item.id),
            l: common_vendor.p({
              fileMediatype: "image",
              mode: "grid",
              limit: 3,
              ["auto-upload"]: false,
              modelValue: item.images
            }),
            m: "10464b8b-14-" + i0 + ",10464b8b-0",
            n: common_vendor.o(() => removeEquipment(index), item.id),
            o: item.id
          };
        }),
        x: common_vendor.p({
          type: "trash",
          size: "16",
          color: "#d92d20"
        })
      } : {
        y: common_vendor.p({
          type: "gear",
          size: "48",
          color: "#cbd5e1"
        })
      }, {
        z: currentTab.value === 1,
        A: common_vendor.p({
          type: "flag",
          size: "20",
          color: "#166534"
        }),
        B: common_vendor.p({
          type: "plus",
          size: "16",
          color: "#166534"
        }),
        C: common_vendor.o(addPollutionFacility),
        D: pollutionFacilityList.value.length
      }, pollutionFacilityList.value.length ? {
        E: common_vendor.f(pollutionFacilityList.value, (item, index, i0) => {
          return {
            a: "10464b8b-18-" + i0 + ",10464b8b-0",
            b: common_vendor.o(($event) => item.name = $event, item.id),
            c: common_vendor.p({
              placeholder: "设施名称",
              modelValue: item.name
            }),
            d: "10464b8b-19-" + i0 + ",10464b8b-0",
            e: common_vendor.o(($event) => item.quantity = $event, item.id),
            f: common_vendor.p({
              placeholder: "数量",
              modelValue: item.quantity
            }),
            g: "10464b8b-20-" + i0 + ",10464b8b-0",
            h: common_vendor.o(($event) => item.remark = $event, item.id),
            i: common_vendor.p({
              placeholder: "备注",
              modelValue: item.remark
            }),
            j: "10464b8b-21-" + i0 + ",10464b8b-0",
            k: common_vendor.o(($event) => item.images = $event, item.id),
            l: common_vendor.p({
              fileMediatype: "image",
              mode: "grid",
              limit: 3,
              ["auto-upload"]: false,
              modelValue: item.images
            }),
            m: "10464b8b-22-" + i0 + ",10464b8b-0",
            n: common_vendor.o(() => removePollutionFacility(index), item.id),
            o: item.id
          };
        }),
        F: common_vendor.p({
          type: "trash",
          size: "16",
          color: "#d92d20"
        })
      } : {
        G: common_vendor.p({
          type: "flag",
          size: "48",
          color: "#cbd5e1"
        })
      }, {
        H: currentTab.value === 2,
        I: common_vendor.p({
          type: "water",
          size: "20",
          color: "#166534"
        }),
        J: common_vendor.p({
          type: "gear",
          size: "16",
          color: "#ffffff"
        }),
        K: common_vendor.o(generateOutletInfo),
        L: outletSignboard.value.sections && outletSignboard.value.sections.length
      }, outletSignboard.value.sections && outletSignboard.value.sections.length ? {
        M: common_vendor.f(outletSignboard.value.sections, (sec, si, i0) => {
          return common_vendor.e({
            a: common_vendor.t(sec.block),
            b: sec.block == "噪声"
          }, sec.block == "噪声" ? {
            c: "10464b8b-26-" + i0 + ",10464b8b-0",
            d: common_vendor.p({
              type: "plus",
              size: "16",
              color: "#166534"
            }),
            e: common_vendor.o(() => addOutletItem(si), "s" + si)
          } : {}, {
            f: common_vendor.f(groupOutletItems(sec.items, sec.block), (group, gi, i1) => {
              return common_vendor.e({
                a: common_vendor.f(group, (it, ii, i2) => {
                  return {
                    a: "10464b8b-27-" + i0 + "-" + i1 + "-" + i2 + ",10464b8b-0",
                    b: common_vendor.o(($event) => it.title = $event, "r" + si + "-" + gi + "-" + ii),
                    c: common_vendor.p({
                      placeholder: "内容标题",
                      modelValue: it.title
                    }),
                    d: "10464b8b-28-" + i0 + "-" + i1 + "-" + i2 + ",10464b8b-0",
                    e: common_vendor.o(($event) => it.content = $event, "r" + si + "-" + gi + "-" + ii),
                    f: common_vendor.p({
                      placeholder: "请输入具体的值",
                      modelValue: it.content
                    }),
                    g: "r" + si + "-" + gi + "-" + ii
                  };
                })
              }, sec.block !== "危险废物" ? {
                b: "10464b8b-29-" + i0 + "-" + i1 + ",10464b8b-0",
                c: common_vendor.p({
                  type: "trash",
                  size: "16",
                  color: "#d92d20"
                }),
                d: common_vendor.o(() => removeOutletGroup(sec, gi), "g" + si + "-" + gi)
              } : {}, {
                e: "g" + si + "-" + gi
              });
            }),
            g: sec.block !== "危险废物",
            h: "s" + si
          });
        })
      } : {
        N: common_vendor.p({
          type: "water",
          size: "48",
          color: "#cbd5e1"
        })
      }, {
        O: currentTab.value === 3,
        P: common_vendor.p({
          current: "pages/reconnoitre/index"
        }),
        Q: common_vendor.o(($event) => newMainContentLabel.value = $event),
        R: common_vendor.p({
          placeholder: "如：项目名称/建设规模",
          modelValue: newMainContentLabel.value
        }),
        S: common_vendor.o(closeMainContent),
        T: common_vendor.o(confirmAddMainContent),
        U: common_vendor.sr(newMainContentPopup, "10464b8b-31", {
          "k": "newMainContentPopup"
        }),
        V: common_vendor.p({
          type: "center"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-10464b8b"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/reconnoitre/index.js.map
