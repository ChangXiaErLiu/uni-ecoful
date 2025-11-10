"use strict";
const common_vendor = require("../../../common/vendor.js");
const utils_platform = require("../../../utils/platform.js");
const stores_navTitle = require("../../../stores/navTitle.js");
if (!Array) {
  const _easycom_uni_data_select2 = common_vendor.resolveComponent("uni-data-select");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_file_picker2 = common_vendor.resolveComponent("uni-file-picker");
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_data_select2 + _easycom_uni_icons2 + _easycom_uni_file_picker2 + _easycom_uni_easyinput2 + _easycom_uni_popup2)();
}
const _easycom_uni_data_select = () => "../../../uni_modules/uni-data-select/components/uni-data-select/uni-data-select.js";
const _easycom_uni_icons = () => "../../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_file_picker = () => "../../../uni_modules/uni-file-picker/components/uni-file-picker/uni-file-picker.js";
const _easycom_uni_easyinput = () => "../../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_uni_popup = () => "../../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_data_select + _easycom_uni_icons + _easycom_uni_file_picker + _easycom_uni_easyinput + AppLayout + _easycom_uni_popup)();
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
    const stepNames = ["资料上传与基本信息", "提资单比对", "现场踏勘比对", "监测方案", "竣工验收报告"];
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
        case 1:
          return datasheet.value.length > 0;
        case 2:
          return fieldworkComparison.value.length > 0;
        case 3:
          return plan.value.length > 0;
        case 4:
          return reportGenerated.value;
        default:
          return false;
      }
    }
    const draftPopup = common_vendor.ref(null);
    const draftMode = common_vendor.ref("export");
    const draftText = common_vendor.ref("");
    const fieldPopup = common_vendor.ref(null);
    const newFieldLabel = common_vendor.ref("");
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
    const fieldworkRecord = common_vendor.ref("");
    const fieldworkComparison = common_vendor.ref([]);
    function generateFieldworkComparison() {
      const comparison = datasheet.value.map((item) => ({
        id: Date.now() + Math.random(),
        project: item.label,
        eiaRequirement: item.value || "待确认",
        fieldSituation: "",
        difference: "待现场核实"
      }));
      fieldworkComparison.value = comparison;
      common_vendor.index.showToast({
        title: `已生成比对清单（${comparison.length}项）`,
        icon: "success"
      });
    }
    function addComparisonItem() {
      fieldworkComparison.value.push({
        id: Date.now() + Math.random(),
        project: "",
        eiaRequirement: "",
        fieldSituation: "",
        difference: ""
      });
    }
    function removeComparisonItem(index) {
      fieldworkComparison.value.splice(index, 1);
    }
    function updateBaseInfo(shouldUpdate) {
      if (shouldUpdate) {
        fieldworkComparison.value.forEach((comparison) => {
          const baseItem = baseTable.value.find((item) => item.label === comparison.project);
          if (baseItem && comparison.fieldSituation) {
            baseItem.value = comparison.fieldSituation;
            baseItem.status = "verified";
          }
        });
        common_vendor.index.showToast({
          title: "基本信息已更新",
          icon: "success"
        });
      }
      currentStep.value = 3;
    }
    const plan = common_vendor.ref([]);
    function recommendPlan() {
      const hasWW = baseTable.value.some(
        (item) => item.label.includes("废水") || item.label.includes("污水")
      );
      const hasWA = baseTable.value.some(
        (item) => item.label.includes("废气") || item.label.includes("烟气")
      );
      const hasNoise = baseTable.value.some(
        (item) => item.label.includes("噪声")
      );
      const now = Date.now();
      plan.value = [];
      if (hasWW) {
        plan.value.push({
          id: now + 1,
          factor: "COD",
          point: "废水总排口",
          method: "GB/T 11914-2020",
          frequency: "3天×2次/天",
          qaqc: "平行/空白",
          remark: "化学需氧量"
        });
        plan.value.push({
          id: now + 2,
          factor: "氨氮",
          point: "废水总排口",
          method: "HJ 535-2009",
          frequency: "3天×2次/天",
          qaqc: "平行",
          remark: ""
        });
      }
      if (hasWA) {
        plan.value.push({
          id: now + 3,
          factor: "颗粒物",
          point: "废气排放口",
          method: "HJ 836-2017",
          frequency: "2天×3次/天",
          qaqc: "平行",
          remark: ""
        });
      }
      if (hasNoise) {
        plan.value.push({
          id: now + 4,
          factor: "噪声",
          point: "厂界四角",
          method: "GB 12348-2008",
          frequency: "昼/夜各1次",
          qaqc: "",
          remark: "连续2天"
        });
      }
      if (plan.value.length === 0) {
        plan.value.push({
          id: now + 5,
          factor: "常规监测",
          point: "主要产污环节",
          method: "按标准执行",
          frequency: "1天×2次",
          qaqc: "质控样",
          remark: "请根据实际情况调整"
        });
      }
      common_vendor.index.showToast({
        title: `已推荐${plan.value.length}项监测方案`,
        icon: "success"
      });
    }
    function addPlanItem() {
      plan.value.push({
        id: Date.now() + Math.random(),
        factor: "",
        point: "",
        method: "",
        frequency: "",
        qaqc: "",
        remark: ""
      });
    }
    function removePlanItem(i) {
      plan.value.splice(i, 1);
    }
    function duplicatePlanItem(i) {
      try {
        const src = plan.value[i];
        plan.value.splice(i + 1, 0, {
          ...JSON.parse(JSON.stringify(src)),
          id: Date.now() + Math.random()
        });
      } catch (e) {
      }
    }
    function movePlanItem(i, dir) {
      if (i + dir < 0 || i + dir >= plan.value.length)
        return;
      const it = plan.value.splice(i, 1)[0];
      plan.value.splice(i + dir, 0, it);
    }
    function downloadMonitorTemplate() {
      common_vendor.index.showToast({
        title: "监测方案模板下载成功",
        icon: "success"
      });
    }
    function saveMonitorPlan() {
      common_vendor.index.showToast({
        title: "监测方案已保存",
        icon: "success"
      });
    }
    const reportType = common_vendor.ref("withoutData");
    const testReportFiles = common_vendor.ref([]);
    const reportGenerated = common_vendor.ref(false);
    const reportTypes = [
      {
        value: "withoutData",
        text: "无检测数据报告"
      },
      {
        value: "withData",
        text: "有检测数据报告"
      }
    ];
    function onReportTypeChange(e) {
      reportType.value = e.detail.value;
    }
    function generateAcceptanceReport() {
      if (!baseTable.value.length) {
        common_vendor.index.showToast({
          title: "请先完成项目基本信息",
          icon: "none"
        });
        return;
      }
      if (reportType.value === "withData" && !testReportFiles.value.length) {
        common_vendor.index.showToast({
          title: "请上传检测报告",
          icon: "none"
        });
        return;
      }
      setTimeout(() => {
        reportGenerated.value = true;
        common_vendor.index.showToast({
          title: "验收报告生成成功",
          icon: "success"
        });
      }, 1500);
    }
    function previewReport() {
      common_vendor.index.showToast({
        title: "报告预览功能待开发",
        icon: "none"
      });
    }
    function exportReport() {
      const typeText = reportType.value === "withData" ? "有检测数据" : "无检测数据";
      common_vendor.index.showToast({
        title: `${typeText}报告导出成功`,
        icon: "success"
      });
    }
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
        title: "已生成标识牌文案",
        icon: "success"
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
    common_vendor.computed(() => {
      let totalSteps = stepNames.length;
      let completedSteps = stepNames.reduce((count, _, index) => {
        return count + (stepDone(index) ? 1 : 0);
      }, 0);
      return Math.round(completedSteps / totalSteps * 100);
    });
    common_vendor.onLoad(() => {
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.unref(isMobile)
      }, common_vendor.unref(isMobile) ? {
        b: common_vendor.o(($event) => currentStep.value = $event),
        c: common_vendor.p({
          localdata: stepSelectOptions.value,
          placeholder: "选择步骤",
          modelValue: currentStep.value
        })
      } : {
        d: common_vendor.f(stepNames, (step, index, i0) => {
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
        e: common_vendor.p({
          type: "cloud-upload",
          size: "20",
          color: "#166534"
        }),
        f: common_vendor.o(($event) => eiaFiles.value = $event),
        g: common_vendor.p({
          fileMediatype: "all",
          ["auto-upload"]: false,
          limit: 20,
          modelValue: eiaFiles.value
        }),
        h: common_vendor.p({
          type: "search",
          size: "16",
          color: "#ffffff"
        }),
        i: common_vendor.o(simulateExtract),
        j: baseTable.value.length
      }, baseTable.value.length ? common_vendor.e({
        k: common_vendor.p({
          type: "list",
          size: "18",
          color: "#166534"
        }),
        l: common_vendor.p({
          type: "plus",
          size: "16",
          color: "#166534"
        }),
        m: common_vendor.o(openAddField),
        n: selectMode.value
      }, selectMode.value ? {
        o: common_vendor.p({
          type: "trash",
          size: "16",
          color: "#ffffff"
        }),
        p: common_vendor.t(selectedIds.value.length),
        q: !selectedIds.value.length,
        r: common_vendor.o(removeSelected)
      } : {}, {
        s: common_vendor.p({
          type: selectMode.value ? "clear" : "checkbox",
          size: "16",
          color: "#155e3b"
        }),
        t: common_vendor.t(selectMode.value ? "取消" : "选择删除"),
        v: common_vendor.o(toggleSelectMode),
        w: common_vendor.f(baseTable.value, (r, idx, i0) => {
          return common_vendor.e({
            a: common_vendor.t(r.label),
            b: "41308e16-9-" + i0 + ",41308e16-0",
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
        x: selectMode.value,
        y: common_vendor.p({
          type: "list",
          size: "18",
          color: "#fb923c"
        }),
        z: common_vendor.p({
          type: "eye-filled",
          size: "16",
          color: "#ffffff"
        }),
        A: common_vendor.o(() => {
          generateSignboard();
          showSignboardStep1.value = true;
        }),
        B: showSignboardStep1.value
      }, showSignboardStep1.value ? {
        C: common_vendor.p({
          type: "download-filled",
          size: "16",
          color: "#ffffff"
        }),
        D: common_vendor.o((...args) => _ctx.downBiaoShi && _ctx.downBiaoShi(...args))
      } : {}, {
        E: showSignboardStep1.value
      }, showSignboardStep1.value ? {
        F: common_vendor.p({
          type: "redo-filled",
          size: "16",
          color: "#ffffff"
        }),
        G: common_vendor.o(($event) => currentStep.value = 3)
      } : {}, {
        H: showSignboardStep1.value
      }, showSignboardStep1.value ? {
        I: common_vendor.f(signboard.sections, (sec, si, i0) => {
          return {
            a: common_vendor.t(sec.block || "未命名"),
            b: "41308e16-14-" + i0 + ",41308e16-0",
            c: common_vendor.o(() => addSignItem(si), "s" + si),
            d: common_vendor.f(sec.items, (it, ii, i1) => {
              return {
                a: "41308e16-15-" + i0 + "-" + i1 + ",41308e16-0",
                b: common_vendor.o(($event) => it.title = $event, "r" + si + "-" + ii),
                c: common_vendor.p({
                  placeholder: "内容标题",
                  modelValue: it.title
                }),
                d: "41308e16-16-" + i0 + "-" + i1 + ",41308e16-0",
                e: common_vendor.o(($event) => it.content = $event, "r" + si + "-" + ii),
                f: common_vendor.p({
                  placeholder: "请输入具体的值",
                  modelValue: it.content
                }),
                g: "41308e16-17-" + i0 + "-" + i1 + ",41308e16-0",
                h: common_vendor.o(() => removeSignItem(si, ii), "r" + si + "-" + ii),
                i: "r" + si + "-" + ii
              };
            }),
            e: "s" + si
          };
        }),
        J: common_vendor.p({
          type: "plus",
          size: "16",
          color: "#166534"
        }),
        K: common_vendor.p({
          type: "trash",
          size: "16",
          color: "#d92d20"
        })
      } : {}) : {}, {
        L: currentStep.value === 0,
        M: common_vendor.p({
          type: "clipboard",
          size: "20",
          color: "#166534"
        }),
        N: common_vendor.p({
          type: "gear",
          size: "16",
          color: "#ffffff"
        }),
        O: common_vendor.o(generateDatasheet),
        P: common_vendor.p({
          type: "download",
          size: "16",
          color: "#155e3b"
        }),
        Q: common_vendor.o(exportDatasheet),
        R: datasheet.value.length
      }, datasheet.value.length ? {
        S: common_vendor.f(datasheet.value, (d, i, i0) => {
          return {
            a: "41308e16-21-" + i0 + ",41308e16-0",
            b: common_vendor.o(($event) => d.label = $event, d.id),
            c: common_vendor.p({
              placeholder: "字段名",
              modelValue: d.label
            }),
            d: "41308e16-22-" + i0 + ",41308e16-0",
            e: common_vendor.o(($event) => d.value = $event, d.id),
            f: common_vendor.p({
              placeholder: "值",
              modelValue: d.value
            }),
            g: "41308e16-23-" + i0 + ",41308e16-0",
            h: common_vendor.o(($event) => d.type = $event, d.id),
            i: common_vendor.p({
              localdata: datasheetTypeOptions,
              placeholder: "类型",
              modelValue: d.type
            }),
            j: "41308e16-24-" + i0 + ",41308e16-0",
            k: common_vendor.o(($event) => d.status = $event, d.id),
            l: common_vendor.p({
              localdata: verifyOptions,
              placeholder: "状态",
              modelValue: d.status
            }),
            m: "41308e16-25-" + i0 + ",41308e16-0",
            n: common_vendor.o(() => removeDatasheet(i), d.id),
            o: d.id
          };
        }),
        T: common_vendor.p({
          type: "trash",
          size: "16",
          color: "#d92d20"
        })
      } : {
        U: common_vendor.p({
          type: "document",
          size: "48",
          color: "#cbd5e1"
        })
      }, {
        V: currentStep.value === 1,
        W: common_vendor.p({
          type: "map-pin-ellipse",
          size: "20",
          color: "#166534"
        }),
        X: fieldworkRecord.value,
        Y: common_vendor.o(($event) => fieldworkRecord.value = $event.detail.value),
        Z: common_vendor.p({
          type: "list",
          size: "18",
          color: "#166534"
        }),
        aa: common_vendor.p({
          type: "gear",
          size: "16",
          color: "#ffffff"
        }),
        ab: common_vendor.o(generateFieldworkComparison),
        ac: common_vendor.p({
          type: "plus",
          size: "16",
          color: "#155e3b"
        }),
        ad: common_vendor.o(addComparisonItem),
        ae: fieldworkComparison.value.length
      }, fieldworkComparison.value.length ? {
        af: common_vendor.f(fieldworkComparison.value, (item, index, i0) => {
          return {
            a: "41308e16-31-" + i0 + ",41308e16-0",
            b: common_vendor.o(($event) => item.project = $event, item.id),
            c: common_vendor.p({
              placeholder: "项目名称",
              modelValue: item.project
            }),
            d: "41308e16-32-" + i0 + ",41308e16-0",
            e: common_vendor.o(($event) => item.eiaRequirement = $event, item.id),
            f: common_vendor.p({
              placeholder: "环评要求",
              modelValue: item.eiaRequirement
            }),
            g: "41308e16-33-" + i0 + ",41308e16-0",
            h: common_vendor.o(($event) => item.fieldSituation = $event, item.id),
            i: common_vendor.p({
              placeholder: "现场情况",
              modelValue: item.fieldSituation
            }),
            j: "41308e16-34-" + i0 + ",41308e16-0",
            k: common_vendor.o(($event) => item.difference = $event, item.id),
            l: common_vendor.p({
              placeholder: "差异说明",
              modelValue: item.difference
            }),
            m: "41308e16-35-" + i0 + ",41308e16-0",
            n: common_vendor.o(() => removeComparisonItem(index), item.id),
            o: item.id
          };
        }),
        ag: common_vendor.p({
          type: "trash",
          size: "16",
          color: "#d92d20"
        })
      } : {
        ah: common_vendor.p({
          type: "map-pin-ellipse",
          size: "48",
          color: "#cbd5e1"
        })
      }, {
        ai: common_vendor.p({
          type: "refresh",
          size: "18",
          color: "#166534"
        }),
        aj: common_vendor.o(($event) => updateBaseInfo(false)),
        ak: common_vendor.o(($event) => updateBaseInfo(true)),
        al: currentStep.value === 2,
        am: common_vendor.p({
          type: "eye",
          size: "20",
          color: "#166534"
        }),
        an: common_vendor.p({
          type: "magic",
          size: "16",
          color: "#ffffff"
        }),
        ao: common_vendor.o(recommendPlan),
        ap: common_vendor.p({
          type: "plus",
          size: "16",
          color: "#155e3b"
        }),
        aq: common_vendor.o(addPlanItem),
        ar: common_vendor.p({
          type: "download",
          size: "16",
          color: "#5b6b7b"
        }),
        as: common_vendor.o(downloadMonitorTemplate),
        at: plan.value.length
      }, plan.value.length ? {
        av: common_vendor.f(plan.value, (item, index, i0) => {
          return {
            a: "41308e16-42-" + i0 + ",41308e16-0",
            b: common_vendor.o(($event) => item.factor = $event, item.id),
            c: common_vendor.p({
              placeholder: "监测因子",
              modelValue: item.factor
            }),
            d: "41308e16-43-" + i0 + ",41308e16-0",
            e: common_vendor.o(($event) => item.point = $event, item.id),
            f: common_vendor.p({
              placeholder: "监测点位",
              modelValue: item.point
            }),
            g: "41308e16-44-" + i0 + ",41308e16-0",
            h: common_vendor.o(($event) => item.method = $event, item.id),
            i: common_vendor.p({
              placeholder: "监测方法",
              modelValue: item.method
            }),
            j: "41308e16-45-" + i0 + ",41308e16-0",
            k: common_vendor.o(($event) => item.frequency = $event, item.id),
            l: common_vendor.p({
              placeholder: "监测频次",
              modelValue: item.frequency
            }),
            m: "41308e16-46-" + i0 + ",41308e16-0",
            n: common_vendor.o(($event) => item.qaqc = $event, item.id),
            o: common_vendor.p({
              placeholder: "质控要求",
              modelValue: item.qaqc
            }),
            p: "41308e16-47-" + i0 + ",41308e16-0",
            q: common_vendor.o(($event) => item.remark = $event, item.id),
            r: common_vendor.p({
              placeholder: "备注",
              modelValue: item.remark
            }),
            s: "41308e16-48-" + i0 + ",41308e16-0",
            t: common_vendor.o(() => duplicatePlanItem(index), item.id),
            v: "41308e16-49-" + i0 + ",41308e16-0",
            w: common_vendor.o(() => movePlanItem(index, -1), item.id),
            x: index === 0,
            y: "41308e16-50-" + i0 + ",41308e16-0",
            z: common_vendor.o(() => movePlanItem(index, 1), item.id),
            A: index === plan.value.length - 1,
            B: "41308e16-51-" + i0 + ",41308e16-0",
            C: common_vendor.o(() => removePlanItem(index), item.id),
            D: item.id
          };
        }),
        aw: common_vendor.p({
          type: "copy",
          size: "16",
          color: "#166534"
        }),
        ax: common_vendor.p({
          type: "arrow-up",
          size: "16",
          color: "#166534"
        }),
        ay: common_vendor.p({
          type: "arrow-down",
          size: "16",
          color: "#166534"
        }),
        az: common_vendor.p({
          type: "trash",
          size: "16",
          color: "#d92d20"
        })
      } : {
        aA: common_vendor.p({
          type: "eye",
          size: "48",
          color: "#cbd5e1"
        })
      }, {
        aB: common_vendor.p({
          type: "checkmark",
          size: "16",
          color: "#ffffff"
        }),
        aC: common_vendor.o(saveMonitorPlan),
        aD: currentStep.value === 3,
        aE: common_vendor.p({
          type: "document",
          size: "20",
          color: "#166534"
        }),
        aF: common_vendor.f(reportTypes, (type, k0, i0) => {
          return {
            a: type.value,
            b: reportType.value === type.value,
            c: common_vendor.t(type.text),
            d: type.value
          };
        }),
        aG: common_vendor.o(onReportTypeChange),
        aH: reportType.value === "withData"
      }, reportType.value === "withData" ? {
        aI: common_vendor.o(($event) => testReportFiles.value = $event),
        aJ: common_vendor.p({
          fileMediatype: "all",
          ["auto-upload"]: false,
          limit: 3,
          modelValue: testReportFiles.value
        })
      } : {}, {
        aK: common_vendor.p({
          type: "gear",
          size: "16",
          color: "#ffffff"
        }),
        aL: common_vendor.o(generateAcceptanceReport),
        aM: common_vendor.p({
          type: "eye",
          size: "16",
          color: "#155e3b"
        }),
        aN: common_vendor.o(previewReport),
        aO: !reportGenerated.value,
        aP: common_vendor.p({
          type: "download",
          size: "16",
          color: "#5b6b7b"
        }),
        aQ: common_vendor.o(exportReport),
        aR: !reportGenerated.value,
        aS: reportGenerated.value
      }, reportGenerated.value ? common_vendor.e({
        aT: common_vendor.p({
          type: "checkmark-circle",
          size: "18",
          color: "#166534"
        }),
        aU: reportType.value === "withData"
      }, reportType.value === "withData" ? {} : {}) : {
        aV: common_vendor.p({
          type: "document",
          size: "48",
          color: "#cbd5e1"
        })
      }, {
        aW: currentStep.value === 4,
        aX: common_vendor.p({
          type: "left",
          size: "16",
          color: "#5b6b7b"
        }),
        aY: currentStep.value === 0,
        aZ: common_vendor.o(prevStep),
        ba: common_vendor.p({
          type: "right",
          size: "16",
          color: "#ffffff"
        }),
        bb: currentStep.value === stepNames.length - 1,
        bc: common_vendor.o(nextStep),
        bd: common_vendor.p({
          current: "pages/reports/acceptance/index"
        }),
        be: common_vendor.t(draftMode.value === "export" ? "导出草稿" : "导入草稿"),
        bf: common_vendor.p({
          type: "close",
          size: "20",
          color: "#5b6b7b"
        }),
        bg: common_vendor.o(closeDraftPopup),
        bh: common_vendor.t(draftMode.value === "export" ? "复制以下 JSON 数据以保存草稿" : "粘贴 JSON 数据以导入草稿"),
        bi: draftMode.value === "export",
        bj: draftText.value,
        bk: common_vendor.o(($event) => draftText.value = $event.detail.value),
        bl: common_vendor.o(closeDraftPopup),
        bm: draftMode.value === "import"
      }, draftMode.value === "import" ? {
        bn: common_vendor.o(confirmImportDraft)
      } : {
        bo: common_vendor.o(copyExportDraft)
      }, {
        bp: common_vendor.sr(draftPopup, "41308e16-63", {
          "k": "draftPopup"
        }),
        bq: common_vendor.p({
          type: "center",
          ["background-color"]: "rgba(0,0,0,0.5)"
        }),
        br: common_vendor.o(($event) => newFieldLabel.value = $event),
        bs: common_vendor.p({
          placeholder: "如：项目名称/单位名称",
          modelValue: newFieldLabel.value
        }),
        bt: common_vendor.o(closeFieldPopup),
        bv: common_vendor.o(confirmAddField),
        bw: common_vendor.sr(fieldPopup, "41308e16-65", {
          "k": "fieldPopup"
        }),
        bx: common_vendor.p({
          type: "center"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-41308e16"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/reports/acceptance/index.js.map
