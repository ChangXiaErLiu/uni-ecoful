"use strict";
const common_vendor = require("../../common/vendor.js");
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
    const navTitle = stores_navTitle.navTitleStore();
    common_vendor.onShow(() => navTitle.setTitle("文档合规性审查"));
    const reportFile = common_vendor.ref(null);
    const steps = common_vendor.ref([
      { id: "analysis", name: "语义理解", status: "pending", statusLabel: "待开始" },
      { id: "policy", name: "政策引用检查", status: "pending", statusLabel: "待开始" },
      { id: "data", name: "数据一致性", status: "pending", statusLabel: "待开始" },
      { id: "summary", name: "报告生成", status: "pending", statusLabel: "待开始" }
    ]);
    const issues = common_vendor.ref([
      {
        id: "issue-1",
        type: "logic",
        severity: "high",
        location: "第3章 结论部分",
        description: "结论部分与前文数据分析结果存在不一致",
        suggestion: "建议重新核对数据并调整结论表述"
      },
      {
        id: "issue-2",
        type: "policy",
        severity: "medium",
        location: "第2章 政策引用",
        description: "引用的《环境保护法》条文版本已过期",
        suggestion: "更新为最新版本的环境保护法相关条文"
      },
      {
        id: "issue-3",
        type: "format",
        severity: "low",
        location: "全文格式",
        description: "部分图表编号格式不符合规范要求",
        suggestion: "按照规范要求统一图表编号格式"
      }
    ]);
    const reviewStatus = common_vendor.computed(() => {
      const completedSteps = steps.value.filter((step) => step.status === "completed").length;
      if (completedSteps === 0)
        return "idle";
      if (completedSteps === steps.value.length)
        return "completed";
      return "processing";
    });
    const statusText = common_vendor.computed(() => {
      switch (reviewStatus.value) {
        case "idle":
          return "待开始";
        case "processing":
          return "审查中";
        case "completed":
          return "审查完成";
        default:
          return "待开始";
      }
    });
    const reviewCompleted = common_vendor.computed(() => reviewStatus.value === "completed");
    function selectReport() {
      common_vendor.index.__f__("log", "at pages/compliance/index.vue:209", "选择需要审查的报告");
      reportFile.value = {
        name: "环境影响评估报告.pdf",
        size: "2.8 MB",
        type: "PDF文档"
      };
    }
    function removeReport() {
      reportFile.value = null;
      resetReview();
    }
    function startReview() {
      common_vendor.index.__f__("log", "at pages/compliance/index.vue:224", "启动合规审查流程");
      steps.value.forEach((step, index) => {
        setTimeout(() => {
          step.status = "active";
          step.statusLabel = "进行中";
          setTimeout(() => {
            step.status = "completed";
            step.statusLabel = "已完成";
          }, 1500);
        }, index * 2e3);
      });
    }
    function resetReview() {
      steps.value.forEach((step) => {
        step.status = "pending";
        step.statusLabel = "待开始";
      });
    }
    function downloadReport() {
      common_vendor.index.__f__("log", "at pages/compliance/index.vue:247", "下载审查报告");
      common_vendor.index.showToast({
        title: "报告下载中",
        icon: "success"
      });
    }
    function getIssueTypeText(type) {
      const typeMap = {
        logic: "逻辑",
        policy: "政策",
        data: "数据",
        format: "格式",
        semantic: "语义"
      };
      return typeMap[type] || "其他";
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "cloud-upload",
          size: "48",
          color: "#3b82f6"
        }),
        b: common_vendor.o(selectReport),
        c: reportFile.value
      }, reportFile.value ? {
        d: common_vendor.p({
          type: "document",
          size: "24",
          color: "#3b82f6"
        }),
        e: common_vendor.t(reportFile.value.name),
        f: common_vendor.t(reportFile.value.size),
        g: common_vendor.t(reportFile.value.type),
        h: common_vendor.p({
          type: "trash",
          size: "18",
          color: "#ef4444"
        }),
        i: common_vendor.o(removeReport)
      } : {}, {
        j: common_vendor.t(statusText.value),
        k: common_vendor.n(`compliance__status-indicator--${reviewStatus.value}`),
        l: common_vendor.f(steps.value, (step, index, i0) => {
          return common_vendor.e({
            a: step.status === "completed"
          }, step.status === "completed" ? {
            b: "febd4183-4-" + i0 + ",febd4183-0",
            c: common_vendor.p({
              type: "checkmarkempty",
              size: "14",
              color: "#ffffff"
            })
          } : {}, {
            d: index < steps.value.length - 1
          }, index < steps.value.length - 1 ? {} : {}, {
            e: common_vendor.t(step.name),
            f: common_vendor.t(step.statusLabel),
            g: step.id,
            h: common_vendor.n(`compliance__progress-item--${step.status}`)
          });
        }),
        m: common_vendor.p({
          type: "refresh",
          size: "16",
          color: "#64748b"
        }),
        n: common_vendor.o(resetReview),
        o: common_vendor.p({
          type: "search",
          size: "16",
          color: "#ffffff"
        }),
        p: common_vendor.o(startReview),
        q: !reportFile.value,
        r: issues.value.length > 0
      }, issues.value.length > 0 ? {
        s: common_vendor.t(issues.value.length)
      } : {}, {
        t: issues.value.length > 0
      }, issues.value.length > 0 ? {
        v: common_vendor.f(issues.value, (issue, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(getIssueTypeText(issue.type)),
            b: common_vendor.n(`compliance__issue-type-badge--${issue.type}`),
            c: common_vendor.t(issue.location),
            d: common_vendor.t(issue.description),
            e: issue.suggestion
          }, issue.suggestion ? {
            f: common_vendor.t(issue.suggestion)
          } : {}, {
            g: issue.id,
            h: common_vendor.n(`compliance__issue-item--${issue.severity}`)
          });
        })
      } : {
        w: common_vendor.p({
          type: "checkmarkcircle",
          size: "48",
          color: "#cbd5e1"
        })
      }, {
        x: issues.value.length > 0 ? "400rpx" : "auto",
        y: reviewCompleted.value
      }, reviewCompleted.value ? {
        z: common_vendor.p({
          type: "download",
          size: "20",
          color: "#3b82f6"
        }),
        A: common_vendor.o(downloadReport)
      } : {}, {
        B: common_vendor.p({
          current: "pages/compliance/index"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-febd4183"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/compliance/index.js.map
