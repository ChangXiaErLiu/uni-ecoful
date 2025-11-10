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
    common_vendor.onShow(() => navTitle.setTitle("环保 AI 工作台"));
    const TAB_PAGES = /* @__PURE__ */ new Set([
      "/pages/home/index",
      "/pages/knowledge/index",
      "/pages/profile/index"
    ]);
    const cards = common_vendor.ref([
      {
        id: "chat",
        title: "AI问答",
        subtitle: "环保领域智能问答",
        icon: "chat",
        path: "/pages/chat/index",
        isTab: false,
        color: "#10b981"
      },
      {
        id: "doc",
        title: "报告生成",
        subtitle: "模板+资料智能生成",
        icon: "compose",
        path: "/pages/doc-generator/index",
        isTab: false,
        color: "#3b82f6"
      },
      {
        id: "review",
        title: "合规审查",
        subtitle: "文档合规性智能审查",
        icon: "calendar",
        path: "/pages/compliance/index",
        isTab: false,
        color: "#f59e0b"
      },
      {
        id: "acceptance",
        title: "环评竣工验收",
        subtitle: "环评竣工验收全流程，包含验收报告生成",
        icon: "flag",
        path: "/pages/reports/acceptance/index",
        isTab: false,
        status: "beta",
        color: "#8b5cf6"
      },
      {
        id: "eia",
        title: "环评报告",
        subtitle: "环评行业报告辅助",
        icon: "paperplane",
        path: "/pages/reports/eia/index",
        isTab: false,
        status: "beta",
        color: "#ef4444"
      },
      {
        id: "kb",
        title: "知识库",
        subtitle: "资料管理与检索",
        icon: "folder-add",
        path: "/pages/knowledge/index",
        isTab: true,
        color: "#06b6d4"
      },
      {
        id: "reconnoitre",
        title: "现场踏查",
        subtitle: "根据建设项目情况及业务要求，生成现场踏勘指引。",
        icon: "map-pin-ellipse",
        path: "/pages/reconnoitre/index",
        isTab: true,
        color: "#aa55ff",
        status: "beta"
      },
      {
        id: "ledger",
        title: "环保台账",
        subtitle: "企业环境管理的基础，也是环保部门执法检查的重点内容",
        icon: "calendar",
        path: "/pages/ledger/index",
        isTab: true,
        color: "#00007f",
        status: "beta"
      },
      {
        id: "project",
        title: "项目管理",
        subtitle: "企业项目管理，包含项目新建、修改等",
        icon: "calendar",
        path: "/pages/project/index",
        isTab: true,
        color: "#aaaa00",
        status: "beta"
      }
    ]);
    const keyword = common_vendor.ref("");
    const filteredCards = common_vendor.computed(() => {
      const kw = keyword.value.trim();
      if (!kw)
        return cards.value;
      return cards.value.filter(
        (c) => [c.title, c.subtitle, c.id].some((t) => String(t).toLowerCase().includes(kw.toLowerCase()))
      );
    });
    function onCardTap(item) {
      if (!(item == null ? void 0 : item.path))
        return;
      const url = item.path.startsWith("/") ? item.path : `/${item.path}`;
      if (TAB_PAGES.has(url)) {
        common_vendor.index.switchTab({ url });
      } else {
        common_vendor.index.navigateTo({ url });
      }
    }
    function getIconBgColor(color) {
      if (!color)
        return "#f0fdf4";
      return `${color}15`;
    }
    function getIconColor(color) {
      return color || "#276019";
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "search",
          size: "18",
          color: "#94a3b8"
        }),
        b: keyword.value,
        c: common_vendor.o(($event) => keyword.value = $event.detail.value),
        d: common_vendor.f(filteredCards.value, (item, k0, i0) => {
          return common_vendor.e({
            a: "4978fed5-2-" + i0 + ",4978fed5-0",
            b: common_vendor.p({
              type: item.icon,
              size: "28",
              color: getIconColor(item.color)
            }),
            c: getIconBgColor(item.color),
            d: common_vendor.t(item.title),
            e: common_vendor.t(item.subtitle),
            f: item.status === "beta"
          }, item.status === "beta" ? {} : {}, {
            g: item.status === "comingSoon"
          }, item.status === "comingSoon" ? {} : {}, {
            h: item.id,
            i: item.status === "comingSoon" || item.status === "disabled" ? 1 : "",
            j: item.status === "beta" ? 1 : "",
            k: common_vendor.o(($event) => onCardTap(item), item.id)
          });
        }),
        e: filteredCards.value.length === 0
      }, filteredCards.value.length === 0 ? {
        f: common_vendor.p({
          type: "search",
          size: "60",
          color: "#cbd5e1"
        })
      } : {}, {
        g: common_vendor.p({
          current: "pages/home/index"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-4978fed5"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/home/index.js.map
