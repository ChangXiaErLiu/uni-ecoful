"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_platform = require("../../utils/platform.js");
const stores_navTitle = require("../../stores/navTitle.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_uni_icons + AppLayout)();
}
const AppLayout = () => "../../components/layout/AppLayout.js";
const _sfc_main = {
  __name: "index",
  setup(__props) {
    var _a;
    const navTitle = stores_navTitle.navTitleStore();
    common_vendor.onShow(() => navTitle.setTitle("文档智能生成"));
    const { isMobile } = utils_platform.usePlatformInfo();
    const templates = common_vendor.ref([
      {
        id: "finance",
        name: "金融行业-投研报告",
        description: "适用于证券、基金投研场景",
        icon: "stats-bars",
        recommended: true
      },
      {
        id: "manufacture",
        name: "制造业-周报模板",
        description: "适用于生产运营周报输出",
        icon: "gear"
      },
      {
        id: "environment",
        name: "环保监测报告",
        description: "环境监测数据分析报告",
        icon: "map"
      },
      {
        id: "project",
        name: "项目总结报告",
        description: "项目阶段性总结汇报",
        icon: "flag"
      }
    ]);
    const activeTemplateId = common_vendor.ref(((_a = templates.value[0]) == null ? void 0 : _a.id) || "");
    const files = common_vendor.ref([]);
    const steps = common_vendor.ref([
      { id: "upload", name: "资料校验", status: "pending", statusLabel: "待开始" },
      { id: "extract", name: "信息抽取", status: "pending", statusLabel: "待开始" },
      { id: "compose", name: "模板填充", status: "pending", statusLabel: "待开始" },
      { id: "review", name: "生成完成", status: "pending", statusLabel: "待开始" }
    ]);
    const layoutClass = common_vendor.computed(() => isMobile.value ? "doc-generator--mobile" : "");
    const canGenerate = common_vendor.computed(() => files.value.length > 0);
    function selectTemplate(id) {
      activeTemplateId.value = id;
    }
    function pickFiles() {
      common_vendor.index.__f__("log", "at pages/doc-generator/index.vue:192", "选择文件上传");
      files.value.push({
        id: Date.now(),
        name: "示例文档.pdf",
        type: "pdf",
        size: "2.4 MB",
        status: "success",
        statusLabel: "上传成功"
      });
    }
    function removeFile(id) {
      files.value = files.value.filter((file) => file.id !== id);
    }
    function reset() {
      files.value = [];
      steps.value.forEach((step) => {
        step.status = "pending";
        step.statusLabel = "待开始";
      });
    }
    function generate() {
      common_vendor.index.__f__("log", "at pages/doc-generator/index.vue:217", "开始生成文档");
      steps.value[0].status = "active";
      steps.value[0].statusLabel = "进行中";
    }
    function getFileIcon(fileType) {
      const iconMap = {
        pdf: "pdf",
        word: "document",
        image: "image",
        excel: "stats-bars",
        markdown: "compose"
      };
      return iconMap[fileType] || "document";
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(templates.value.length),
        b: common_vendor.f(templates.value, (template, k0, i0) => {
          return common_vendor.e({
            a: "dc41b1ac-1-" + i0 + ",dc41b1ac-0",
            b: common_vendor.p({
              type: template.icon || "compose",
              size: "24",
              color: template.id === activeTemplateId.value ? "#3b82f6" : "#64748b"
            }),
            c: common_vendor.t(template.name),
            d: template.recommended
          }, template.recommended ? {} : {}, {
            e: common_vendor.t(template.description),
            f: template.id === activeTemplateId.value
          }, template.id === activeTemplateId.value ? {
            g: "dc41b1ac-2-" + i0 + ",dc41b1ac-0",
            h: common_vendor.p({
              type: "checkmarkempty",
              size: "20",
              color: "#3b82f6"
            })
          } : {}, {
            i: template.id,
            j: template.id === activeTemplateId.value ? 1 : "",
            k: template.recommended ? 1 : "",
            l: common_vendor.o(() => selectTemplate(template.id), template.id)
          });
        }),
        c: common_vendor.p({
          type: "cloud-upload",
          size: "48",
          color: "#3b82f6"
        }),
        d: common_vendor.o(pickFiles),
        e: files.value.length > 0
      }, files.value.length > 0 ? {
        f: common_vendor.f(files.value, (file, k0, i0) => {
          return {
            a: "dc41b1ac-4-" + i0 + ",dc41b1ac-0",
            b: common_vendor.p({
              type: getFileIcon(file.type),
              size: "20",
              color: "#64748b"
            }),
            c: common_vendor.t(file.name),
            d: common_vendor.t(file.size),
            e: common_vendor.t(file.statusLabel),
            f: common_vendor.n(`doc-generator__file-status--${file.status}`),
            g: "dc41b1ac-5-" + i0 + ",dc41b1ac-0",
            h: common_vendor.o(() => removeFile(file.id), file.id),
            i: file.id
          };
        }),
        g: common_vendor.p({
          type: "trash",
          size: "18",
          color: "#94a3b8"
        })
      } : {}, {
        h: common_vendor.f(steps.value, (step, index, i0) => {
          return common_vendor.e({
            a: index < steps.value.length - 1
          }, index < steps.value.length - 1 ? {} : {}, {
            b: common_vendor.t(step.name),
            c: common_vendor.t(step.statusLabel),
            d: step.id,
            e: common_vendor.n(`doc-generator__step--${step.status}`)
          });
        }),
        i: common_vendor.p({
          type: "refresh",
          size: "16",
          color: "#64748b"
        }),
        j: common_vendor.o(reset),
        k: common_vendor.p({
          type: "paperplane",
          size: "16",
          color: "#ffffff"
        }),
        l: common_vendor.o(generate),
        m: !canGenerate.value,
        n: common_vendor.n(layoutClass.value),
        o: common_vendor.p({
          current: "pages/doc-generator/index"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-dc41b1ac"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/doc-generator/index.js.map
