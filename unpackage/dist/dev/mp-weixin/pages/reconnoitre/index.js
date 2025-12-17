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
    const loadingEquipment = common_vendor.ref(false);
    const fetchEquipmentError = common_vendor.ref("");
    function handleTabChange(index) {
      currentTab.value = index;
      if (index === 1 && !equipmentList.value.length) {
        fetchEquipmentData();
      }
    }
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
    const equipmentList = common_vendor.ref([]);
    function parseEquipmentData(apiData) {
      try {
        const parsedEquipment = [];
        if (!apiData || !Array.isArray(apiData) || apiData.length <= 1) {
          return [];
        }
        for (let i = 1; i < apiData.length; i++) {
          const row = apiData[i];
          if (row.column_1) {
            const columns = row.column_1.split("\\t");
            if (columns.length >= 4) {
              const deviceName = columns[1] || "";
              const quantity = columns[3] || "";
              if (deviceName.trim()) {
                parsedEquipment.push({
                  id: "eq_" + Date.now() + "_" + i,
                  name: deviceName.trim(),
                  quantity: quantity.trim(),
                  remark: "",
                  // 接口没有提供备注，留空
                  images: []
                });
              }
            } else {
              common_vendor.index.__f__("warn", "at pages/reconnoitre/index.vue:482", `第${i + 1}行数据列数不足:`, columns);
            }
          } else {
            common_vendor.index.__f__("warn", "at pages/reconnoitre/index.vue:485", `第${i + 1}行没有column_1字段:`, row);
          }
        }
        return parsedEquipment;
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/reconnoitre/index.vue:491", "解析设备数据失败:", error);
        return [];
      }
    }
    async function fetchEquipmentData() {
      loadingEquipment.value = true;
      fetchEquipmentError.value = "";
      try {
        const response = await new Promise((resolve, reject) => {
          common_vendor.index.request({
            url: "http://127.0.0.1:8000/api/v1/completion/tzdDetail/getDeviceDetail",
            method: "GET",
            timeout: 1e4,
            data: {
              memberId: 3
            },
            success: (res) => {
              common_vendor.index.__f__("log", "at pages/reconnoitre/index.vue:513", "请求成功:", res);
              resolve(res);
            },
            fail: (err) => {
              common_vendor.index.__f__("log", "at pages/reconnoitre/index.vue:517", "请求失败:", err);
              reject(err);
            }
          });
        });
        let resData;
        if (Array.isArray(response)) {
          resData = response[0];
        } else if (response && response.data) {
          resData = response.data;
        } else {
          resData = response;
        }
        common_vendor.index.__f__("log", "at pages/reconnoitre/index.vue:538", "接口返回完整数据:", resData);
        if (resData && resData.data) {
          const apiData = resData.data;
          common_vendor.index.__f__("log", "at pages/reconnoitre/index.vue:543", "设备数据数组:", apiData);
          if (apiData && Array.isArray(apiData) && apiData.length > 1) {
            const parsedData = parseEquipmentData(apiData);
            common_vendor.index.__f__("log", "at pages/reconnoitre/index.vue:547", "解析后的设备数据:", parsedData);
            if (parsedData.length > 0) {
              equipmentList.value = parsedData;
              common_vendor.index.showToast({
                title: `加载成功，共${parsedData.length}条设备数据`,
                icon: "success",
                duration: 2e3
              });
            } else {
              fetchEquipmentError.value = "解析到的设备数据为空";
              common_vendor.index.showToast({
                title: "设备数据解析为空",
                icon: "none",
                duration: 2e3
              });
            }
          } else {
            fetchEquipmentError.value = "接口返回的设备数据格式不正确";
            common_vendor.index.showToast({
              title: "设备数据格式错误",
              icon: "none",
              duration: 2e3
            });
          }
        } else {
          fetchEquipmentError.value = (resData == null ? void 0 : resData.message) || "接口返回数据格式异常";
          common_vendor.index.showToast({
            title: "获取设备数据失败",
            icon: "none",
            duration: 2e3
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/reconnoitre/index.vue:582", "获取设备数据失败:", error);
        fetchEquipmentError.value = error.message || "网络请求失败";
        common_vendor.index.showToast({
          title: "网络请求失败，请检查网络连接",
          icon: "none",
          duration: 2e3
        });
      } finally {
        loadingEquipment.value = false;
      }
    }
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
            d: common_vendor.o(($event) => handleTabChange(index), index)
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
        v: common_vendor.p({
          type: loadingEquipment.value ? "spinner-cycle" : "refresh",
          size: "16",
          color: "#ffffff"
        }),
        w: common_vendor.t(loadingEquipment.value ? "加载中..." : "刷新数据"),
        x: common_vendor.o(fetchEquipmentData),
        y: loadingEquipment.value,
        z: loadingEquipment.value
      }, loadingEquipment.value ? {
        A: common_vendor.p({
          type: "spinner-cycle",
          size: "48",
          color: "#166534"
        })
      } : fetchEquipmentError.value ? {
        C: common_vendor.p({
          type: "close-circle",
          size: "48",
          color: "#dc2626"
        }),
        D: common_vendor.t(fetchEquipmentError.value),
        E: common_vendor.o(fetchEquipmentData)
      } : equipmentList.value.length ? {
        G: common_vendor.f(equipmentList.value, (item, index, i0) => {
          return {
            a: "10464b8b-13-" + i0 + ",10464b8b-0",
            b: common_vendor.o(($event) => item.name = $event, item.id),
            c: common_vendor.p({
              placeholder: "设备名称",
              clearable: true,
              modelValue: item.name
            }),
            d: "10464b8b-14-" + i0 + ",10464b8b-0",
            e: common_vendor.o(($event) => item.quantity = $event, item.id),
            f: common_vendor.p({
              placeholder: "数量",
              clearable: true,
              modelValue: item.quantity
            }),
            g: "10464b8b-15-" + i0 + ",10464b8b-0",
            h: common_vendor.o(($event) => item.remark = $event, item.id),
            i: common_vendor.p({
              placeholder: "备注",
              clearable: true,
              modelValue: item.remark
            }),
            j: "10464b8b-16-" + i0 + ",10464b8b-0",
            k: common_vendor.o(($event) => item.images = $event, item.id),
            l: common_vendor.p({
              fileMediatype: "image",
              mode: "grid",
              limit: 3,
              ["auto-upload"]: false,
              modelValue: item.images
            }),
            m: "10464b8b-17-" + i0 + ",10464b8b-0",
            n: common_vendor.o(() => removeEquipment(index), item.id),
            o: item.id
          };
        }),
        H: common_vendor.p({
          type: "trash",
          size: "16",
          color: "#d92d20"
        })
      } : {
        I: common_vendor.p({
          type: "gear",
          size: "48",
          color: "#cbd5e1"
        })
      }, {
        B: fetchEquipmentError.value,
        F: equipmentList.value.length,
        J: currentTab.value === 1,
        K: common_vendor.p({
          type: "flag",
          size: "20",
          color: "#166534"
        }),
        L: common_vendor.p({
          type: "plus",
          size: "16",
          color: "#166534"
        }),
        M: common_vendor.o(addPollutionFacility),
        N: pollutionFacilityList.value.length
      }, pollutionFacilityList.value.length ? {
        O: common_vendor.f(pollutionFacilityList.value, (item, index, i0) => {
          return {
            a: "10464b8b-21-" + i0 + ",10464b8b-0",
            b: common_vendor.o(($event) => item.name = $event, item.id),
            c: common_vendor.p({
              placeholder: "设施名称",
              clearable: true,
              modelValue: item.name
            }),
            d: "10464b8b-22-" + i0 + ",10464b8b-0",
            e: common_vendor.o(($event) => item.quantity = $event, item.id),
            f: common_vendor.p({
              placeholder: "数量",
              clearable: true,
              modelValue: item.quantity
            }),
            g: "10464b8b-23-" + i0 + ",10464b8b-0",
            h: common_vendor.o(($event) => item.remark = $event, item.id),
            i: common_vendor.p({
              placeholder: "备注",
              clearable: true,
              modelValue: item.remark
            }),
            j: "10464b8b-24-" + i0 + ",10464b8b-0",
            k: common_vendor.o(($event) => item.images = $event, item.id),
            l: common_vendor.p({
              fileMediatype: "image",
              mode: "grid",
              limit: 3,
              ["auto-upload"]: false,
              modelValue: item.images
            }),
            m: "10464b8b-25-" + i0 + ",10464b8b-0",
            n: common_vendor.o(() => removePollutionFacility(index), item.id),
            o: item.id
          };
        }),
        P: common_vendor.p({
          type: "trash",
          size: "16",
          color: "#d92d20"
        })
      } : {
        Q: common_vendor.p({
          type: "flag",
          size: "48",
          color: "#cbd5e1"
        })
      }, {
        R: currentTab.value === 2,
        S: common_vendor.p({
          type: "water",
          size: "20",
          color: "#166534"
        }),
        T: common_vendor.p({
          type: "gear",
          size: "16",
          color: "#ffffff"
        }),
        U: common_vendor.o(generateOutletInfo),
        V: outletSignboard.value.sections && outletSignboard.value.sections.length
      }, outletSignboard.value.sections && outletSignboard.value.sections.length ? {
        W: common_vendor.f(outletSignboard.value.sections, (sec, si, i0) => {
          return common_vendor.e({
            a: common_vendor.t(sec.block),
            b: sec.block == "噪声"
          }, sec.block == "噪声" ? {
            c: "10464b8b-29-" + i0 + ",10464b8b-0",
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
                    a: "10464b8b-30-" + i0 + "-" + i1 + "-" + i2 + ",10464b8b-0",
                    b: common_vendor.o(($event) => it.title = $event, "r" + si + "-" + gi + "-" + ii),
                    c: common_vendor.p({
                      placeholder: "内容标题",
                      modelValue: it.title
                    }),
                    d: "10464b8b-31-" + i0 + "-" + i1 + "-" + i2 + ",10464b8b-0",
                    e: common_vendor.o(($event) => it.content = $event, "r" + si + "-" + gi + "-" + ii),
                    f: common_vendor.p({
                      placeholder: "请输入具体的值",
                      modelValue: it.content
                    }),
                    g: "r" + si + "-" + gi + "-" + ii
                  };
                })
              }, sec.block !== "危险废物" ? {
                b: "10464b8b-32-" + i0 + "-" + i1 + ",10464b8b-0",
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
        X: common_vendor.p({
          type: "water",
          size: "48",
          color: "#cbd5e1"
        })
      }, {
        Y: currentTab.value === 3,
        Z: common_vendor.p({
          current: "pages/reconnoitre/index"
        }),
        aa: common_vendor.o(($event) => newMainContentLabel.value = $event),
        ab: common_vendor.p({
          placeholder: "如：项目名称/建设规模",
          modelValue: newMainContentLabel.value
        }),
        ac: common_vendor.o(closeMainContent),
        ad: common_vendor.o(confirmAddMainContent),
        ae: common_vendor.sr(newMainContentPopup, "10464b8b-34", {
          "k": "newMainContentPopup"
        }),
        af: common_vendor.p({
          type: "center"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-10464b8b"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/reconnoitre/index.js.map
