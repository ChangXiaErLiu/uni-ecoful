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
    const {
      isMobile
    } = utils_platform.usePlatformInfo();
    const stepNames = ["项目基本信息", "提资单比对", "监测方案", "生成竣工验收报告"];
    const currentStep = common_vendor.ref(0);
    common_vendor.computed(() => stepNames.map((n, i) => stepDone(i) ? n + " ✓" : n));
    const stepSelectOptions = common_vendor.computed(() => stepNames.map((n, i) => ({
      text: stepDone(i) ? n + " ✓" : n,
      value: i
    })));
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
        // 基本信息
        {
          id: now + 101,
          section: "基本信息",
          label: "建设项目名称",
          value: "",
          unit: "",
          source: "extract",
          required: true,
          status: "pending"
        },
        {
          id: now + 102,
          section: "基本信息",
          label: "建设单位名称",
          value: "",
          unit: "",
          source: "extract",
          required: true,
          status: "pending"
        },
        {
          id: now + 103,
          section: "基本信息",
          label: "建设项目性质",
          value: "新建 / 改扩建 / 技改 / 迁建（勾选其一）",
          unit: "",
          source: "extract",
          required: true,
          status: "pending"
        },
        {
          id: now + 104,
          section: "基本信息",
          label: "建设地点",
          value: "XX（中心经纬度：）",
          unit: "",
          source: "extract",
          required: true,
          status: "pending"
        },
        {
          id: now + 105,
          section: "基本信息",
          label: "经度",
          value: "",
          unit: "°",
          source: "extract",
          required: false,
          status: "pending"
        },
        {
          id: now + 106,
          section: "基本信息",
          label: "纬度",
          value: "",
          unit: "°",
          source: "extract",
          required: false,
          status: "pending"
        },
        // 产品与能力
        {
          id: now + 201,
          section: "产品及产能",
          label: "产品及产能",
          value: "（可直接使用环评中的产品产能表粘贴）",
          unit: "",
          source: "extract",
          required: true,
          status: "pending"
        },
        // 审批及编制信息
        {
          id: now + 301,
          section: "环评信息",
          label: "环评报表审批部门",
          value: "广州市生态环境局",
          unit: "",
          source: "extract",
          required: true,
          status: "pending"
        },
        {
          id: now + 302,
          section: "环评信息",
          label: "环评报告表编制单位",
          value: "",
          unit: "",
          source: "extract",
          required: true,
          status: "pending"
        },
        // 投资概算
        {
          id: now + 401,
          section: "投资概算",
          label: "投资总概算",
          value: "",
          unit: "万元",
          source: "extract",
          required: true,
          status: "pending"
        },
        {
          id: now + 402,
          section: "投资概算",
          label: "环保投资总概算",
          value: "",
          unit: "万元",
          source: "extract",
          required: true,
          status: "pending"
        },
        {
          id: now + 403,
          section: "投资概算",
          label: "环保投资比例",
          value: "",
          unit: "%",
          source: "extract",
          required: false,
          status: "pending"
        },
        // 建设内容与工艺
        {
          id: now + 501,
          section: "建设内容",
          label: "主要建设内容",
          value: "（可将环评内主要建设内容段落复制粘贴）",
          unit: "",
          source: "extract",
          required: true,
          status: "pending"
        },
        {
          id: now + 502,
          section: "建设内容",
          label: "改扩建项目变动情况",
          value: "（改扩建前后工程组成、产能变化的总览）",
          unit: "",
          source: "extract",
          required: false,
          status: "pending"
        },
        {
          id: now + 503,
          section: "建设内容",
          label: "生产工艺",
          value: "（可粘贴简化工艺流程/文字说明）",
          unit: "",
          source: "extract",
          required: true,
          status: "pending"
        },
        // 污染物产生情况（按你图中提示，允许直接粘贴表格）
        {
          id: now + 601,
          section: "污染物产生情况",
          label: "水污染物（产生环节/污染物名/治理措施/排放去向/执行标准）",
          value: "（可将环评里的水污染物表格粘贴在此）",
          unit: "",
          source: "extract",
          required: true,
          status: "pending"
        },
        {
          id: now + 602,
          section: "污染物产生情况",
          label: "大气污染物（产生环节/污染物名/治理措施/排放去向/执行标准）",
          value: "（可将环评里的大气污染物表格粘贴在此）",
          unit: "",
          source: "extract",
          required: true,
          status: "pending"
        },
        // 噪声与固废
        {
          id: now + 701,
          section: "环境标准",
          label: "噪声执行标准",
          value: "（填写相应标准，如 GB 12348 等，并注明类别限值）",
          unit: "",
          source: "extract",
          required: true,
          status: "pending"
        },
        {
          id: now + 702,
          section: "固体废物",
          label: "固体废物产生情况",
          value: "（可将环评里的固体废物表格粘贴过来）",
          unit: "",
          source: "extract",
          required: true,
          status: "pending"
        }
      ];
      extractionOk.value = true;
      common_vendor.index.showToast({
        title: `提取完成（示例 ${baseTable.value.length} 项）`,
        icon: "success"
      });
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
      common_vendor.index.showToast({
        title: "草稿已保存",
        icon: "success"
      });
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
        draftText.value = JSON.stringify({
          step: currentStep.value
        }, null, 2);
        (_b = (_a = draftPopup.value) == null ? void 0 : _a.open) == null ? void 0 : _b.call(_a);
      } catch (e) {
        common_vendor.index.showToast({
          title: "导出失败",
          icon: "none"
        });
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
        common_vendor.index.showToast({
          title: "导入完成",
          icon: "success"
        });
      } catch (e) {
        common_vendor.index.showToast({
          title: "JSON 不合法",
          icon: "none"
        });
      }
    }
    function copyExportDraft() {
      var _a, _b;
      try {
        common_vendor.index.setClipboardData({
          data: draftText.value || ""
        });
        common_vendor.index.showToast({
          title: "已复制",
          icon: "none"
        });
        (_b = (_a = draftPopup.value) == null ? void 0 : _a.close) == null ? void 0 : _b.call(_a);
      } catch (e) {
        common_vendor.index.showToast({
          title: "复制失败",
          icon: "none"
        });
      }
    }
    function clearDraft() {
      eiaFiles.value = [];
      extractionOk.value = false;
      currentStep.value = 0;
      common_vendor.index.showToast({
        title: "已清空",
        icon: "none"
      });
    }
    function exportDocx() {
      common_vendor.index.showToast({
        title: "导出Word（占位）",
        icon: "none"
      });
    }
    function exportPdf() {
      common_vendor.index.showToast({
        title: "导出PDF（占位）",
        icon: "none"
      });
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
        common_vendor.index.showToast({
          title: "请输入字段名称",
          icon: "none"
        });
        return;
      }
      baseTable.value.push({
        id: Date.now() + Math.random(),
        section: "",
        label,
        value: "",
        source: "manual",
        required: false
      });
      (_b = (_a = fieldPopup.value) == null ? void 0 : _a.close) == null ? void 0 : _b.call(_a);
    }
    const verifyOptions = [{
      text: "待核对",
      value: "pending"
    }, {
      text: "已核对",
      value: "verified"
    }, {
      text: "需补充",
      value: "require"
    }];
    const baseTable = common_vendor.ref([]);
    const datasheet = common_vendor.ref([]);
    const datasheetTypeOptions = [{
      text: "需再次提资",
      value: "requireMore"
    }, {
      text: "需业主核对",
      value: "ownerConfirm"
    }];
    function generateDatasheet() {
      const list = baseTable.value.filter((r) => r.required && !r.value || r.status !== "verified").map((r) => ({
        id: r.id,
        label: r.label || "未命名",
        value: r.value || "",
        type: r.required && !r.value ? "requireMore" : "ownerConfirm"
      }));
      datasheet.value = list;
      common_vendor.index.showToast({
        title: `已生成提资单（${list.length}项）`,
        icon: "none"
      });
    }
    function removeDatasheet(i) {
      datasheet.value.splice(i, 1);
    }
    function exportDatasheet() {
      common_vendor.index.showToast({
        title: "待对接：导出提资单",
        icon: "none"
      });
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
        common_vendor.index.showToast({
          title: "未选择",
          icon: "none"
        });
        return;
      }
      const names = baseTable.value.filter((r) => selectedIds.value.includes(r.id)).map((r) => (r.label || "（未命名）").trim());
      const preview = names.length === 1 ? `确认要删除「${names[0]}」吗？` : (() => {
        const max = 8;
        const head = names.slice(0, max).map((n) => `• ${n}`).join("\n");
        const tail = names.length > max ? `
… 等 ${names.length} 项` : "";
        return `确认要删除以下 ${names.length} 个信息吗？
${head}${tail}`;
      })();
      common_vendor.index.showModal({
        title: "确认删除",
        content: preview,
        confirmText: "删除",
        cancelText: "取消",
        success: (res) => {
          if (res.confirm) {
            baseTable.value = baseTable.value.filter(
              (r) => !selectedIds.value.includes(r.id)
            );
            selectedIds.value = [];
            selectMode.value = false;
            common_vendor.index.showToast({
              title: `已删除 ${names.length} 项`,
              icon: "none"
            });
          }
        }
      });
    }
    common_vendor.ref([]);
    common_vendor.ref([]);
    common_vendor.ref([]);
    const devices = common_vendor.ref([]);
    const outlets = common_vendor.ref([]);
    common_vendor.ref([]);
    const signboard = common_vendor.reactive({
      sections: [
        {
          block: "废水",
          items: [{
            title: "单位名称",
            content: ""
          }]
        },
        {
          block: "废气",
          items: [{
            title: "单位名称",
            content: ""
          }]
        },
        {
          block: "噪声",
          items: [{
            title: "单位名称",
            content: ""
          }]
        },
        {
          block: "危险污染物",
          items: [{
            title: "单位名称",
            content: ""
          }]
        }
      ]
    });
    function generateSignboard() {
      const unit = findBaseValue("单位名称") || findBaseValue("项目名称") || "";
      signboard.sections.forEach((sec) => {
        const item = sec.items.find((i) => i.title.includes("单位名称"));
        if (item)
          item.content = unit;
      });
      common_vendor.index.showToast({
        title: "已生成文案（示例）",
        icon: "none"
      });
    }
    function addSignItem(i) {
      signboard.sections[i].items.push({
        title: "",
        content: ""
      });
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
          issues.push({
            step: i,
            messages: m
          });
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
        b: completionPercent.value,
        c: common_vendor.t(completionPercent.value),
        d: common_vendor.p({
          type: "folder",
          size: "16",
          color: "#5b6b7b"
        }),
        e: common_vendor.o(saveDraft),
        f: common_vendor.p({
          type: "upload",
          size: "16",
          color: "#5b6b7b"
        }),
        g: common_vendor.o(openExportDraft),
        h: common_vendor.p({
          type: "download",
          size: "16",
          color: "#5b6b7b"
        }),
        i: common_vendor.o(openImportDraft),
        j: common_vendor.p({
          type: "trash",
          size: "16",
          color: "#d92d20"
        }),
        k: common_vendor.o(clearDraft),
        l: common_vendor.p({
          type: "file",
          size: "16",
          color: "#155e3b"
        }),
        m: common_vendor.o(exportDocx),
        n: common_vendor.p({
          type: "pdf",
          size: "16",
          color: "#ffffff"
        }),
        o: common_vendor.o(exportPdf),
        p: common_vendor.unref(isMobile)
      }, common_vendor.unref(isMobile) ? {
        q: common_vendor.o(($event) => currentStep.value = $event),
        r: common_vendor.p({
          localdata: stepSelectOptions.value,
          placeholder: "选择步骤",
          modelValue: currentStep.value
        })
      } : {
        s: common_vendor.f(stepNames, (step, index, i0) => {
          return common_vendor.e({
            a: stepDone(index)
          }, stepDone(index) ? {} : {
            b: common_vendor.t(index + 1)
          }, {
            c: common_vendor.t(step),
            d: index < stepNames.length - 1
          }, index < stepNames.length - 1 ? {} : {}, {
            e: index,
            f: currentStep.value === index ? 1 : "",
            g: stepDone(index) ? 1 : "",
            h: currentStep.value === index,
            i: common_vendor.o(($event) => currentStep.value = index, index)
          });
        })
      }, {
        t: common_vendor.p({
          type: "cloud-upload",
          size: "20",
          color: "#166534"
        }),
        v: common_vendor.o(($event) => eiaFiles.value = $event),
        w: common_vendor.p({
          fileMediatype: "all",
          ["auto-upload"]: false,
          limit: 6,
          modelValue: eiaFiles.value
        }),
        x: common_vendor.p({
          type: "search",
          size: "16",
          color: "#ffffff"
        }),
        y: common_vendor.o(simulateExtract),
        z: baseTable.value.length
      }, baseTable.value.length ? common_vendor.e({
        A: common_vendor.p({
          type: "list",
          size: "18",
          color: "#166534"
        }),
        B: common_vendor.p({
          type: "plus",
          size: "16",
          color: "#166534"
        }),
        C: common_vendor.o(openAddField),
        D: selectMode.value
      }, selectMode.value ? {
        E: common_vendor.p({
          type: "trash",
          size: "16",
          color: "#ffffff"
        }),
        F: common_vendor.t(selectedIds.value.length),
        G: !selectedIds.value.length,
        H: common_vendor.o(removeSelected)
      } : {}, {
        I: common_vendor.p({
          type: selectMode.value ? "clear" : "checkbox",
          size: "16",
          color: "#155e3b"
        }),
        J: common_vendor.t(selectMode.value ? "取消" : "选择删除"),
        K: common_vendor.o(toggleSelectMode),
        L: common_vendor.f(baseTable.value, (r, idx, i0) => {
          return common_vendor.e({
            a: common_vendor.t(r.label),
            b: "41308e16-15-" + i0 + ",41308e16-0",
            c: common_vendor.o(($event) => r.value = $event, r.id),
            d: common_vendor.p({
              placeholder: "请输入具体的值",
              modelValue: r.value
            })
          }, selectMode.value ? {
            e: selectedIds.value.includes(r.id),
            f: common_vendor.o(() => toggleSelected(r.id), r.id)
          } : {}, {
            g: r.id
          });
        }),
        M: selectMode.value,
        N: common_vendor.p({
          type: "list",
          size: "18",
          color: "#fb923c"
        }),
        O: common_vendor.p({
          type: "gear",
          size: "16",
          color: "#ffffff"
        }),
        P: common_vendor.o(() => {
          generateSignboard();
          showSignboardStep1.value = true;
        }),
        Q: showSignboardStep1.value
      }, showSignboardStep1.value ? {
        R: common_vendor.p({
          type: "right",
          size: "16",
          color: "#5b6b7b"
        }),
        S: common_vendor.o(($event) => currentStep.value = 4)
      } : {}, {
        T: showSignboardStep1.value
      }, showSignboardStep1.value ? {
        U: common_vendor.f(signboard.sections, (sec, si, i0) => {
          return {
            a: common_vendor.t(sec.block || "未命名"),
            b: "41308e16-19-" + i0 + ",41308e16-0",
            c: common_vendor.o(() => addSignItem(si), "s" + si),
            d: common_vendor.f(sec.items, (it, ii, i1) => {
              return {
                a: "41308e16-20-" + i0 + "-" + i1 + ",41308e16-0",
                b: common_vendor.o(($event) => it.title = $event, "r" + si + "-" + ii),
                c: common_vendor.p({
                  placeholder: "内容标题",
                  modelValue: it.title
                }),
                d: "41308e16-21-" + i0 + "-" + i1 + ",41308e16-0",
                e: common_vendor.o(($event) => it.content = $event, "r" + si + "-" + ii),
                f: common_vendor.p({
                  placeholder: "请输入具体的值",
                  modelValue: it.content
                }),
                g: "41308e16-22-" + i0 + "-" + i1 + ",41308e16-0",
                h: common_vendor.o(() => removeSignItem(si, ii), "r" + si + "-" + ii),
                i: "r" + si + "-" + ii
              };
            }),
            e: "s" + si
          };
        }),
        V: common_vendor.p({
          type: "plus",
          size: "16",
          color: "#166534"
        }),
        W: common_vendor.p({
          type: "trash",
          size: "16",
          color: "#d92d20"
        })
      } : {}) : {}, {
        X: currentStep.value === 0,
        Y: common_vendor.p({
          type: "clipboard",
          size: "20",
          color: "#166534"
        }),
        Z: common_vendor.p({
          type: "gear",
          size: "16",
          color: "#ffffff"
        }),
        aa: common_vendor.o(generateDatasheet),
        ab: common_vendor.p({
          type: "download",
          size: "16",
          color: "#155e3b"
        }),
        ac: common_vendor.o(exportDatasheet),
        ad: datasheet.value.length
      }, datasheet.value.length ? {
        ae: common_vendor.f(datasheet.value, (d, i, i0) => {
          return {
            a: "41308e16-26-" + i0 + ",41308e16-0",
            b: common_vendor.o(($event) => d.label = $event, d.id),
            c: common_vendor.p({
              placeholder: "字段名",
              modelValue: d.label
            }),
            d: "41308e16-27-" + i0 + ",41308e16-0",
            e: common_vendor.o(($event) => d.value = $event, d.id),
            f: common_vendor.p({
              placeholder: "值",
              modelValue: d.value
            }),
            g: "41308e16-28-" + i0 + ",41308e16-0",
            h: common_vendor.o(($event) => d.type = $event, d.id),
            i: common_vendor.p({
              localdata: datasheetTypeOptions,
              placeholder: "类型",
              modelValue: d.type
            }),
            j: "41308e16-29-" + i0 + ",41308e16-0",
            k: common_vendor.o(($event) => d.status = $event, d.id),
            l: common_vendor.p({
              localdata: verifyOptions,
              placeholder: "状态",
              modelValue: d.status
            }),
            m: "41308e16-30-" + i0 + ",41308e16-0",
            n: common_vendor.o(() => removeDatasheet(i), d.id),
            o: d.id
          };
        }),
        af: common_vendor.p({
          type: "trash",
          size: "16",
          color: "#d92d20"
        })
      } : {
        ag: common_vendor.p({
          type: "document",
          size: "48",
          color: "#cbd5e1"
        })
      }, {
        ah: currentStep.value === 1,
        ai: common_vendor.p({
          type: "left",
          size: "16",
          color: "#5b6b7b"
        }),
        aj: currentStep.value === 0,
        ak: common_vendor.o(prevStep),
        al: common_vendor.p({
          type: "right",
          size: "16",
          color: "#ffffff"
        }),
        am: currentStep.value === stepNames.length - 1,
        an: common_vendor.o(nextStep),
        ao: common_vendor.p({
          current: "pages/reports/acceptance/index"
        }),
        ap: common_vendor.t(draftMode.value === "export" ? "导出草稿" : "导入草稿"),
        aq: common_vendor.p({
          type: "close",
          size: "20",
          color: "#5b6b7b"
        }),
        ar: common_vendor.o(closeDraftPopup),
        as: common_vendor.t(draftMode.value === "export" ? "复制以下 JSON 数据以保存草稿" : "粘贴 JSON 数据以导入草稿"),
        at: draftMode.value === "export",
        av: draftText.value,
        aw: common_vendor.o(($event) => draftText.value = $event.detail.value),
        ax: common_vendor.o(closeDraftPopup),
        ay: draftMode.value === "import"
      }, draftMode.value === "import" ? {
        az: common_vendor.o(confirmImportDraft)
      } : {
        aA: common_vendor.o(copyExportDraft)
      }, {
        aB: common_vendor.sr(draftPopup, "41308e16-34", {
          "k": "draftPopup"
        }),
        aC: common_vendor.p({
          type: "center",
          ["background-color"]: "rgba(0,0,0,0.5)"
        }),
        aD: common_vendor.o(($event) => newFieldLabel.value = $event),
        aE: common_vendor.p({
          placeholder: "如：项目名称/单位名称",
          modelValue: newFieldLabel.value
        }),
        aF: common_vendor.o(closeFieldPopup),
        aG: common_vendor.o(confirmAddField),
        aH: common_vendor.sr(fieldPopup, "41308e16-36", {
          "k": "fieldPopup"
        }),
        aI: common_vendor.p({
          type: "center"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-41308e16"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/reports/acceptance/index.js.map
