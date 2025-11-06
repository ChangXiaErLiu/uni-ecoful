"use strict";
const common_vendor = require("../../../common/vendor.js");
const utils_platform = require("../../../utils/platform.js");
const stores_navTitle = require("../../../stores/navTitle.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_data_select2 = common_vendor.resolveComponent("uni-data-select");
  const _easycom_uni_file_picker2 = common_vendor.resolveComponent("uni-file-picker");
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_icons2 + _easycom_uni_data_select2 + _easycom_uni_file_picker2 + _easycom_uni_easyinput2 + _easycom_uni_popup2)();
}
const _easycom_uni_icons = () => "../../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_data_select = () => "../../../uni_modules/uni-data-select/components/uni-data-select/uni-data-select.js";
const _easycom_uni_file_picker = () => "../../../uni_modules/uni-file-picker/components/uni-file-picker/uni-file-picker.js";
const _easycom_uni_easyinput = () => "../../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_uni_popup = () => "../../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_data_select + _easycom_uni_file_picker + _easycom_uni_easyinput + AppLayout + _easycom_uni_popup)();
}
const AppLayout = () => "../../../components/layout/AppLayout.js";
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const navTitle = stores_navTitle.navTitleStore();
    common_vendor.onShow(() => navTitle.setTitle("验收报告"));
    const { isMobile } = utils_platform.usePlatformInfo();
    const stepNames = ["上传&提取", "提资单", "业主比对", "差异比对", "标识牌", "监测方案", "最终生成"];
    const currentStep = common_vendor.ref(0);
    common_vendor.computed(() => stepNames.map((n, i) => stepDone(i) ? n + " ✓" : n));
    const stepSelectOptions = common_vendor.computed(() => stepNames.map((n, i) => ({ text: stepDone(i) ? n + " ✓" : n, value: i })));
    function prevStep() {
      if (currentStep.value > 0)
        currentStep.value -= 1;
    }
    function nextStep() {
      if (currentStep.value < stepNames.length - 1)
        currentStep.value += 1;
    }
    const eiaFiles = common_vendor.ref([]);
    function simulateExtract() {
      const now = Date.now();
      baseTable.value = [
        { id: now + 1, label: "项目名称", value: "某产业园环保技改项目", unit: "", source: "extract", required: true, status: "pending" },
        { id: now + 2, label: "单位名称", value: "广州市南沙新区产业园区开发建设管理局", unit: "", source: "extract", required: true, status: "pending" },
        { id: now + 3, label: "项目地址", value: "广州市南沙区××路×号", unit: "", source: "extract", required: true, status: "pending" },
        { id: now + 4, label: "联系人", value: "张三", unit: "", source: "extract", required: false, status: "pending" },
        { id: now + 5, label: "联系电话", value: "123456789", unit: "", source: "extract", required: false, status: "require" },
        { id: now + 6, label: "环评/批复编号", value: "环批〔2024〕001号", unit: "", source: "extract", required: true, status: "pending" },
        { id: now + 7, label: "主要产品与规模", value: "产品A 年产1000吨", unit: "", source: "extract", required: true, status: "pending" },
        { id: now + 8, label: "纬度", value: "23.12", unit: "°", source: "extract", required: false, status: "pending" },
        { id: now + 9, label: "经度", value: "113.22", unit: "°", source: "extract", required: false, status: "pending" },
        { id: now + 10, section: "法规标准", label: "验收依据", value: "建设项目竣工环境保护验收暂行办法", unit: "", source: "extract", required: true, status: "pending" }
      ];
      extractionOk.value = true;
      common_vendor.index.showToast({ title: `提取完成（示例 ${baseTable.value.length} 项）`, icon: "success" });
    }
    function clearExtract() {
      eiaFiles.value = [];
      extractionOk.value = false;
      showSignboardStep1.value = false;
    }
    const extractionOk = common_vendor.ref(false);
    const showSignboardStep1 = common_vendor.ref(false);
    function stepDone(i) {
      switch (i) {
        case 0:
          return extractionOk.value;
        default:
          return false;
      }
    }
    function saveDraft() {
      common_vendor.index.showToast({ title: "草稿已保存", icon: "success" });
    }
    const draftPopup = common_vendor.ref(null);
    const draftMode = common_vendor.ref("export");
    const draftText = common_vendor.ref("");
    const fieldPopup = common_vendor.ref(null);
    const newFieldLabel = common_vendor.ref("");
    function openExportDraft() {
      var _a, _b;
      try {
        draftMode.value = "export";
        draftText.value = JSON.stringify({ step: currentStep.value }, null, 2);
        (_b = (_a = draftPopup.value) == null ? void 0 : _a.open) == null ? void 0 : _b.call(_a);
      } catch (e) {
        common_vendor.index.showToast({ title: "导出失败", icon: "none" });
      }
    }
    function openImportDraft() {
      var _a, _b;
      draftMode.value = "import";
      draftText.value = "";
      (_b = (_a = draftPopup.value) == null ? void 0 : _a.open) == null ? void 0 : _b.call(_a);
    }
    function closeDraftPopup() {
      var _a, _b;
      (_b = (_a = draftPopup.value) == null ? void 0 : _a.close) == null ? void 0 : _b.call(_a);
    }
    function confirmImportDraft() {
      var _a, _b;
      try {
        (_b = (_a = draftPopup.value) == null ? void 0 : _a.close) == null ? void 0 : _b.call(_a);
        common_vendor.index.showToast({ title: "导入完成", icon: "success" });
      } catch (e) {
        common_vendor.index.showToast({ title: "JSON 不合法", icon: "none" });
      }
    }
    function copyExportDraft() {
      var _a, _b;
      try {
        common_vendor.index.setClipboardData({ data: draftText.value || "" });
        common_vendor.index.showToast({ title: "已复制", icon: "none" });
        (_b = (_a = draftPopup.value) == null ? void 0 : _a.close) == null ? void 0 : _b.call(_a);
      } catch (e) {
        common_vendor.index.showToast({ title: "复制失败", icon: "none" });
      }
    }
    function clearDraft() {
      eiaFiles.value = [];
      extractionOk.value = false;
      currentStep.value = 0;
      common_vendor.index.showToast({ title: "已清空", icon: "none" });
    }
    function exportDocx() {
      common_vendor.index.showToast({ title: "导出Word（占位）", icon: "none" });
    }
    function exportPdf() {
      common_vendor.index.showToast({ title: "导出PDF（占位）", icon: "none" });
    }
    function openAddField() {
      var _a, _b;
      newFieldLabel.value = "";
      (_b = (_a = fieldPopup.value) == null ? void 0 : _a.open) == null ? void 0 : _b.call(_a);
    }
    function closeFieldPopup() {
      var _a, _b;
      (_b = (_a = fieldPopup.value) == null ? void 0 : _a.close) == null ? void 0 : _b.call(_a);
    }
    function confirmAddField() {
      var _a, _b;
      const label = (newFieldLabel.value || "").trim();
      if (!label) {
        common_vendor.index.showToast({ title: "请输入字段名称", icon: "none" });
        return;
      }
      baseTable.value.push({ id: Date.now() + Math.random(), section: "", label, value: "", unit: "", source: "manual", required: false, status: "pending" });
      (_b = (_a = fieldPopup.value) == null ? void 0 : _a.close) == null ? void 0 : _b.call(_a);
    }
    const verifyOptions = [{ text: "待核对", value: "pending" }, { text: "已核对", value: "verified" }, { text: "需补充", value: "require" }];
    const baseTable = common_vendor.ref([]);
    const datasheet = common_vendor.ref([]);
    const datasheetTypeOptions = [{ text: "需再次提资", value: "requireMore" }, { text: "需业主核对", value: "ownerConfirm" }];
    function generateDatasheet() {
      const list = baseTable.value.filter((r) => r.required && !r.value || r.status !== "verified").map((r) => ({ id: r.id, label: r.label || "未命名", value: r.value || "", type: r.required && !r.value ? "requireMore" : "ownerConfirm", status: "pending" }));
      datasheet.value = list;
      common_vendor.index.showToast({ title: `已生成提资单（${list.length}项）`, icon: "none" });
    }
    function removeDatasheet(i) {
      datasheet.value.splice(i, 1);
    }
    function exportDatasheet() {
      common_vendor.index.showToast({ title: "待对接：导出提资单", icon: "none" });
    }
    const selectMode = common_vendor.ref(false);
    const selectedIds = common_vendor.ref([]);
    function toggleSelectMode() {
      selectMode.value = !selectMode.value;
      if (!selectMode.value)
        selectedIds.value = [];
    }
    function toggleSelected(id) {
      const arr = selectedIds.value;
      const i = arr.indexOf(id);
      if (i >= 0)
        arr.splice(i, 1);
      else
        arr.push(id);
    }
    function removeSelected() {
      if (!selectedIds.value.length) {
        common_vendor.index.showToast({ title: "未选择字段", icon: "none" });
        return;
      }
      baseTable.value = baseTable.value.filter((r) => !selectedIds.value.includes(r.id));
      selectedIds.value = [];
      selectMode.value = false;
      common_vendor.index.showToast({ title: "已删除选中字段", icon: "none" });
    }
    common_vendor.ref([]);
    common_vendor.ref([]);
    common_vendor.ref([]);
    const devices = common_vendor.ref([]);
    const outlets = common_vendor.ref([]);
    common_vendor.ref([]);
    const signboard = common_vendor.reactive({ sections: [{ block: "废水", items: [{ title: "单位名称", content: "" }] }, { block: "噪声", items: [{ title: "单位名称", content: "" }] }, { block: "危险污染物", items: [{ title: "单位名称", content: "" }] }] });
    function generateSignboard() {
      const unit = findBaseValue("单位名称") || findBaseValue("项目名称") || "";
      signboard.sections.forEach((sec) => {
        const item = sec.items.find((i) => i.title.includes("单位名称"));
        if (item)
          item.content = unit;
      });
      common_vendor.index.showToast({ title: "已生成文案（示例）", icon: "none" });
    }
    function addSignItem(i) {
      signboard.sections[i].items.push({ title: "单位名称", content: "" });
    }
    function removeSignItem(i, j) {
      signboard.sections[i].items.splice(j, 1);
    }
    function findBaseValue(label) {
      const r = baseTable.value.find((x) => x.label === label);
      return r ? r.value || "" : "";
    }
    const plan = common_vendor.ref([]);
    common_vendor.computed(() => {
      const xs = validateAllSteps();
      if (!xs.length)
        return "已满足生成条件（示例）。";
      return xs.map((it) => `· ${stepNames[it.step]}：${it.messages.join("，")}`).join("\n");
    });
    function validateStep(i) {
      const misses = [];
      if (i === 0) {
        if (!eiaFiles.value.length && !extractionOk.value)
          misses.push("上传至少1个文件或使用示例提取");
      } else if (i === 1) {
        if (!baseTable.value.length)
          misses.push("未生成项目信息表");
      } else if (i === 3) {
        if (!devices.value.length && !outlets.value.length)
          misses.push("请完善设备或排放口");
      } else if (i === 4) {
        if (!signboard.sections.some((sec) => sec.items.some((it) => it.content)))
          misses.push("标识牌至少填写一项内容");
      } else if (i === 5) {
        if (!plan.value.length)
          misses.push("请新增或推荐至少1条方案");
      }
      return misses;
    }
    function validateAllSteps() {
      const issues = [];
      for (let i = 0; i < stepNames.length; i++) {
        const m = validateStep(i);
        if (m.length)
          issues.push({ step: i, messages: m });
      }
      return issues;
    }
    const completionPercent = common_vendor.computed(() => {
      let total = 0, done = 0;
      total += 1;
      if (extractionOk.value)
        done += 1;
      total += 1;
      if (baseTable.value.length > 0)
        done += 1;
      total += 1;
      done += 1;
      const pct = Math.round(done / Math.max(total, 7) * 100);
      return Math.min(100, Math.max(0, pct));
    });
    common_vendor.onLoad(() => {
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: completionPercent.value + "%",
        b: common_vendor.t(completionPercent.value),
        c: common_vendor.p({
          type: "folder",
          size: "16",
          color: "#64748b"
        }),
        d: common_vendor.o(saveDraft),
        e: common_vendor.p({
          type: "upload",
          size: "16",
          color: "#64748b"
        }),
        f: common_vendor.o(openExportDraft),
        g: common_vendor.p({
          type: "download",
          size: "16",
          color: "#64748b"
        }),
        h: common_vendor.o(openImportDraft),
        i: common_vendor.p({
          type: "trash",
          size: "16",
          color: "#ef4444"
        }),
        j: common_vendor.o(clearDraft),
        k: common_vendor.p({
          type: "file",
          size: "16",
          color: "#276019"
        }),
        l: common_vendor.o(exportDocx),
        m: common_vendor.p({
          type: "pdf",
          size: "16",
          color: "#ffffff"
        }),
        n: common_vendor.o(exportPdf),
        o: common_vendor.unref(isMobile)
      }, common_vendor.unref(isMobile) ? {
        p: common_vendor.o(($event) => currentStep.value = $event),
        q: common_vendor.p({
          localdata: stepSelectOptions.value,
          placeholder: "选择步骤",
          modelValue: currentStep.value
        })
      } : {
        r: common_vendor.f(stepNames, (step, index, i0) => {
          return common_vendor.e({
            a: stepDone(index)
          }, stepDone(index) ? {} : {
            b: common_vendor.t(index + 1)
          }, {
            c: common_vendor.t(step),
            d: stepDone(index)
          }, stepDone(index) ? {} : {}, {
            e: index,
            f: currentStep.value === index ? 1 : "",
            g: stepDone(index) ? 1 : "",
            h: common_vendor.o(($event) => currentStep.value = index, index)
          });
        })
      }, {
        s: common_vendor.p({
          type: "cloud-upload",
          size: "20",
          color: "#276019"
        }),
        t: common_vendor.o(($event) => eiaFiles.value = $event),
        v: common_vendor.p({
          fileMediatype: "all",
          ["auto-upload"]: false,
          limit: 6,
          modelValue: eiaFiles.value
        }),
        w: common_vendor.p({
          type: "search",
          size: "16",
          color: "#ffffff"
        }),
        x: common_vendor.o(simulateExtract),
        y: common_vendor.p({
          type: "clear",
          size: "16",
          color: "#64748b"
        }),
        z: common_vendor.o(clearExtract),
        A: baseTable.value.length
      }, baseTable.value.length ? common_vendor.e({
        B: common_vendor.p({
          type: "list",
          size: "18",
          color: "#276019"
        }),
        C: common_vendor.p({
          type: "plus",
          size: "16",
          color: "#276019"
        }),
        D: common_vendor.o(openAddField),
        E: common_vendor.p({
          type: selectMode.value ? "checkbox-filled" : "checkbox",
          size: "16",
          color: "#276019"
        }),
        F: common_vendor.t(selectMode.value ? "退出选择" : "选择删除"),
        G: common_vendor.o(toggleSelectMode),
        H: selectMode.value
      }, selectMode.value ? {
        I: common_vendor.p({
          type: "trash",
          size: "16",
          color: "#b91c1c"
        }),
        J: common_vendor.t(selectedIds.value.length),
        K: !selectedIds.value.length,
        L: common_vendor.o(removeSelected)
      } : {}, {
        M: common_vendor.f(baseTable.value, (r, idx, i0) => {
          return common_vendor.e({
            a: common_vendor.t(r.label),
            b: "41308e16-16-" + i0 + ",41308e16-0",
            c: common_vendor.o(($event) => r.value = $event, r.id),
            d: common_vendor.p({
              placeholder: "填写值",
              modelValue: r.value
            })
          }, selectMode.value ? {
            e: selectedIds.value.includes(r.id),
            f: common_vendor.o(() => toggleSelected(r.id), r.id)
          } : {}, {
            g: r.id
          });
        }),
        N: selectMode.value,
        O: common_vendor.p({
          type: "list",
          size: "18",
          color: "#f59e0b"
        }),
        P: common_vendor.p({
          type: "gear",
          size: "16",
          color: "#ffffff"
        }),
        Q: common_vendor.o(() => {
          generateSignboard();
          showSignboardStep1.value = true;
        }),
        R: showSignboardStep1.value
      }, showSignboardStep1.value ? {
        S: common_vendor.p({
          type: "right",
          size: "16",
          color: "#64748b"
        }),
        T: common_vendor.o(($event) => currentStep.value = 4)
      } : {}, {
        U: showSignboardStep1.value
      }, showSignboardStep1.value ? {
        V: common_vendor.f(signboard.sections, (sec, si, i0) => {
          return {
            a: common_vendor.t(sec.block || "未命名"),
            b: "41308e16-20-" + i0 + ",41308e16-0",
            c: common_vendor.o(() => addSignItem(si), "s" + si),
            d: common_vendor.f(sec.items, (it, ii, i1) => {
              return {
                a: "41308e16-21-" + i0 + "-" + i1 + ",41308e16-0",
                b: common_vendor.o(($event) => it.title = $event, "r" + si + "-" + ii),
                c: common_vendor.p({
                  placeholder: "内容标题",
                  modelValue: it.title
                }),
                d: "41308e16-22-" + i0 + "-" + i1 + ",41308e16-0",
                e: common_vendor.o(($event) => it.content = $event, "r" + si + "-" + ii),
                f: common_vendor.p({
                  placeholder: "内容",
                  modelValue: it.content
                }),
                g: "41308e16-23-" + i0 + "-" + i1 + ",41308e16-0",
                h: common_vendor.o(() => removeSignItem(si, ii), "r" + si + "-" + ii),
                i: "r" + si + "-" + ii
              };
            }),
            e: "s" + si
          };
        }),
        W: common_vendor.p({
          type: "plus",
          size: "16",
          color: "#276019"
        }),
        X: common_vendor.p({
          type: "trash",
          size: "16",
          color: "#ef4444"
        })
      } : {}) : {}, {
        Y: currentStep.value === 0,
        Z: common_vendor.p({
          type: "clipboard",
          size: "20",
          color: "#276019"
        }),
        aa: common_vendor.p({
          type: "gear",
          size: "16",
          color: "#ffffff"
        }),
        ab: common_vendor.o(generateDatasheet),
        ac: common_vendor.p({
          type: "clipboard",
          size: "18",
          color: "#f59e0b"
        }),
        ad: common_vendor.p({
          type: "download",
          size: "16",
          color: "#276019"
        }),
        ae: common_vendor.o(exportDatasheet),
        af: datasheet.value.length
      }, datasheet.value.length ? {
        ag: common_vendor.f(datasheet.value, (d, i, i0) => {
          return {
            a: "41308e16-28-" + i0 + ",41308e16-0",
            b: common_vendor.o(($event) => d.label = $event, d.id),
            c: common_vendor.p({
              placeholder: "字段名",
              modelValue: d.label
            }),
            d: "41308e16-29-" + i0 + ",41308e16-0",
            e: common_vendor.o(($event) => d.value = $event, d.id),
            f: common_vendor.p({
              placeholder: "值",
              modelValue: d.value
            }),
            g: "41308e16-30-" + i0 + ",41308e16-0",
            h: common_vendor.o(($event) => d.type = $event, d.id),
            i: common_vendor.p({
              localdata: datasheetTypeOptions,
              placeholder: "类型",
              modelValue: d.type
            }),
            j: "41308e16-31-" + i0 + ",41308e16-0",
            k: common_vendor.o(($event) => d.status = $event, d.id),
            l: common_vendor.p({
              localdata: verifyOptions,
              placeholder: "状态",
              modelValue: d.status
            }),
            m: "41308e16-32-" + i0 + ",41308e16-0",
            n: common_vendor.o(() => removeDatasheet(i), d.id),
            o: d.id
          };
        }),
        ah: common_vendor.p({
          type: "trash",
          size: "16",
          color: "#ef4444"
        })
      } : {
        ai: common_vendor.p({
          type: "document",
          size: "48",
          color: "#cbd5e1"
        })
      }, {
        aj: currentStep.value === 1,
        ak: common_vendor.p({
          type: "left",
          size: "16",
          color: "#64748b"
        }),
        al: currentStep.value === 0,
        am: common_vendor.o(prevStep),
        an: common_vendor.p({
          type: "right",
          size: "16",
          color: "#ffffff"
        }),
        ao: currentStep.value === stepNames.length - 1,
        ap: common_vendor.o(nextStep),
        aq: common_vendor.p({
          current: "pages/reports/acceptance/index"
        }),
        ar: common_vendor.t(draftMode.value === "export" ? "导出草稿" : "导入草稿"),
        as: common_vendor.p({
          type: "close",
          size: "20",
          color: "#64748b"
        }),
        at: common_vendor.o(closeDraftPopup),
        av: common_vendor.t(draftMode.value === "export" ? "复制以下JSON数据以保存草稿" : "粘贴JSON数据以导入草稿"),
        aw: draftMode.value === "export",
        ax: draftText.value,
        ay: common_vendor.o(($event) => draftText.value = $event.detail.value),
        az: common_vendor.o(closeDraftPopup),
        aA: draftMode.value === "import"
      }, draftMode.value === "import" ? {
        aB: common_vendor.o(confirmImportDraft)
      } : {
        aC: common_vendor.o(copyExportDraft)
      }, {
        aD: common_vendor.sr(draftPopup, "41308e16-36", {
          "k": "draftPopup"
        }),
        aE: common_vendor.p({
          type: "center",
          ["background-color"]: "rgba(0,0,0,0.5)"
        }),
        aF: common_vendor.p({
          type: "close",
          size: "20",
          color: "#64748b"
        }),
        aG: common_vendor.o(closeFieldPopup),
        aH: common_vendor.o(($event) => newFieldLabel.value = $event),
        aI: common_vendor.p({
          placeholder: "如：项目名称/单位名称",
          modelValue: newFieldLabel.value
        }),
        aJ: common_vendor.o(closeFieldPopup),
        aK: common_vendor.o(confirmAddField),
        aL: common_vendor.sr(fieldPopup, "41308e16-38", {
          "k": "fieldPopup"
        }),
        aM: common_vendor.p({
          type: "center",
          ["background-color"]: "rgba(0,0,0,0.5)"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-41308e16"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/reports/acceptance/index.js.map
