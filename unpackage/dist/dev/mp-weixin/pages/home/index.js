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
    common_vendor.onShow(() => {
      navTitle.setTitle("环保 AI 工作台");
      loadUserInfo();
      loadProjectInfo();
      loadStatsData();
      initTip();
      loadAnnouncement();
    });
    const userName = common_vendor.ref("");
    const userCompany = common_vendor.ref("");
    const userPhone = common_vendor.ref("");
    const userId = common_vendor.ref(null);
    const currentProject = common_vendor.ref(null);
    const statsData = common_vendor.ref({
      projects: 0,
      documents: 0,
      completed: 0
    });
    common_vendor.ref([]);
    const tips = [
      "建议企业定期开展环保培训，提高员工环保意识",
      "及时更新环保设施运行记录，确保台账完整",
      "定期检查污染防治设施运行状态，发现问题及时处理",
      "做好危险废物分类存储，规范转移联单管理",
      "建立健全环境管理制度，落实环保主体责任",
      "加强环境监测，及时掌握污染物排放情况",
      "积极配合环保部门检查，主动报告环境问题",
      "推进清洁生产，从源头减少污染物产生"
    ];
    const currentTip = common_vendor.ref("");
    const currentTipIndex = common_vendor.ref(0);
    const systemAnnouncement = common_vendor.ref("");
    const userInitial = common_vendor.computed(() => {
      if (!userName.value)
        return "?";
      return userName.value.charAt(0).toUpperCase();
    });
    function loadUserInfo() {
      try {
        const userInfoStr = common_vendor.index.getStorageSync("userInfo");
        const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
        if (userInfo) {
          userId.value = userInfo.id || userInfo.user_id;
          userName.value = userInfo.username || userInfo.name || "";
          userPhone.value = userInfo.phone_num || userInfo.phone || "";
          userCompany.value = userInfo.company_name || userInfo.company || "";
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/home/index.vue:283", "加载用户信息失败:", error);
      }
    }
    function loadProjectInfo() {
      try {
        const projectId = common_vendor.index.getStorageSync("acceptance_project_id");
        const projectInfoStr = common_vendor.index.getStorageSync("acceptance_project_info");
        if (projectInfoStr) {
          currentProject.value = JSON.parse(projectInfoStr);
        } else if (projectId) {
          currentProject.value = {
            id: projectId,
            name: `项目 #${projectId}`,
            description: "点击查看详情"
          };
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/home/index.vue:306", "加载项目信息失败:", error);
      }
    }
    function goToProfile() {
      common_vendor.index.switchTab({
        url: "/pages/profile/index"
      });
    }
    function loadStatsData() {
      try {
        statsData.value = {
          projects: common_vendor.index.getStorageSync("project_total_count") || 0,
          documents: Math.floor(Math.random() * 50) + 10,
          completed: Math.floor(Math.random() * 15) + 1
        };
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/home/index.vue:335", "加载统计数据失败:", error);
      }
    }
    function quickAction(action) {
      switch (action) {
        case "newProject":
          common_vendor.index.navigateTo({
            url: "/pages/project/index"
          });
          break;
        case "uploadDoc":
          common_vendor.index.showToast({
            title: "功能开发中",
            icon: "none"
          });
          break;
        case "viewReports":
          common_vendor.index.navigateTo({
            url: "/pages/reports/acceptance/index"
          });
          break;
        case "settings":
          common_vendor.index.switchTab({
            url: "/pages/profile/index"
          });
          break;
      }
    }
    function refreshTip() {
      currentTipIndex.value = (currentTipIndex.value + 1) % tips.length;
      currentTip.value = tips[currentTipIndex.value];
    }
    function initTip() {
      currentTipIndex.value = Math.floor(Math.random() * tips.length);
      currentTip.value = tips[currentTipIndex.value];
    }
    function loadAnnouncement() {
      try {
        const hasAnnouncement = Math.random() > 0.5;
        if (hasAnnouncement) {
          systemAnnouncement.value = "系统测试";
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/home/index.vue:390", "加载系统公告失败:", error);
      }
    }
    function closeAnnouncement() {
      systemAnnouncement.value = "";
    }
    const TAB_PAGES = /* @__PURE__ */ new Set([
      "/pages/home/index",
      "/pages/knowledge/index",
      "/pages/profile/index"
    ]);
    const cards = common_vendor.ref([
      // {
      //   id: 'chat',
      //   title: 'AI问答',
      //   subtitle: '环保领域智能问答',
      //   icon: 'chat',
      //   path: '/pages/chat/index',
      //   isTab: false,
      //   color: '#10b981'
      // },
      // {
      //   id: 'doc',
      //   title: '报告生成',
      //   subtitle: '模板+资料智能生成',
      //   icon: 'compose',
      //   path: '/pages/doc-generator/index',
      //   isTab: false,
      //   color: '#3b82f6'
      // },
      // {
      //   id: 'review',
      //   title: '合规审查',
      //   subtitle: '文档合规性智能审查',
      //   icon: 'calendar',
      //   path: '/pages/compliance/index',
      //   isTab: false,
      //   color: '#f59e0b'
      // },
      {
        id: "project",
        title: "项目管理",
        subtitle: "企业项目管理，包含项目新建、修改等",
        icon: "calendar",
        path: "/pages/project/index",
        isTab: true,
        color: "#aaaa00"
        // status: 'beta',
      },
      {
        id: "acceptance",
        title: "环评竣工验收",
        subtitle: "环评竣工验收全流程，包含验收报告生成",
        icon: "flag",
        path: "/pages/reports/acceptance/index",
        isTab: false,
        // status: 'beta',
        color: "#8b5cf6"
      }
      // {
      //   id: 'eia',
      //   title: '环评报告',
      //   subtitle: '环评行业报告辅助',
      //   icon: 'paperplane',
      //   path: '/pages/reports/eia/index',
      //   isTab: false,
      //   status: 'beta',
      //   color: '#ef4444'
      // },
      // {
      //   id: 'kb',
      //   title: '知识库',
      //   subtitle: '资料管理与检索',
      //   icon: 'folder-add',
      //   path: '/pages/knowledge/index',
      //   isTab: true,
      //   color: '#06b6d4'
      // },
      //  {
      //    id: 'reconnoitre',
      //    title: '现场踏查',
      //    subtitle: '根据建设项目情况及业务要求，生成现场踏勘指引。',
      //    icon: 'map-pin-ellipse',
      //    path: '/pages/reconnoitre/index',
      //    isTab: true,
      //    color: '#aa55ff',
      // status: 'beta',
      //  },
      // {
      //   id: 'ledger',
      //   title: '环保台账',
      //   subtitle: '企业环境管理的基础，也是环保部门执法检查的重点内容',
      //   icon: 'calendar',
      //   path: '/pages/ledger/index',
      //   isTab: true,
      //   color: '#00007f',
      // 	status: 'beta',
      // },
    ]);
    const keyword = common_vendor.ref("");
    const filteredCards = common_vendor.computed(() => {
      const kw = keyword.value.trim();
      if (!kw)
        return cards.value;
      return cards.value.filter((c) => [c.title, c.subtitle, c.id].some((t) => String(t).toLowerCase().includes(
        kw.toLowerCase()
      )));
    });
    function onCardTap(item) {
      if (!(item == null ? void 0 : item.path))
        return;
      const url = item.path.startsWith("/") ? item.path : `/${item.path}`;
      if (TAB_PAGES.has(url)) {
        common_vendor.index.switchTab({
          url
        });
      } else {
        common_vendor.index.navigateTo({
          url
        });
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
        a: common_vendor.t(userInitial.value),
        b: common_vendor.t(userName.value || "未登录"),
        c: common_vendor.t(userCompany.value || "暂无企业信息"),
        d: common_vendor.p({
          type: "person",
          size: "20",
          color: "#166534"
        }),
        e: common_vendor.o(goToProfile),
        f: common_vendor.p({
          type: "star",
          size: "18",
          color: "#f59e0b"
        }),
        g: common_vendor.p({
          type: "plus",
          size: "20",
          color: "#166534"
        }),
        h: common_vendor.o(($event) => quickAction("newProject")),
        i: common_vendor.p({
          type: "cloud-upload",
          size: "20",
          color: "#2563eb"
        }),
        j: common_vendor.o(($event) => quickAction("newProject")),
        k: common_vendor.p({
          type: "compose",
          size: "20",
          color: "#d97706"
        }),
        l: common_vendor.o(($event) => quickAction("viewReports")),
        m: common_vendor.p({
          type: "gear",
          size: "20",
          color: "#7c3aed"
        }),
        n: common_vendor.o(($event) => quickAction("settings")),
        o: common_vendor.f(filteredCards.value, (item, k0, i0) => {
          return common_vendor.e({
            a: "4978fed5-7-" + i0 + ",4978fed5-0",
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
        p: filteredCards.value.length === 0
      }, filteredCards.value.length === 0 ? {
        q: common_vendor.p({
          type: "search",
          size: "60",
          color: "#cbd5e1"
        })
      } : {}, {
        r: common_vendor.p({
          type: "info",
          size: "20",
          color: "#16a34a"
        }),
        s: common_vendor.t(currentTip.value),
        t: common_vendor.p({
          type: "refresh",
          size: "14",
          color: "#16a34a"
        }),
        v: common_vendor.o(refreshTip),
        w: systemAnnouncement.value
      }, systemAnnouncement.value ? {
        x: common_vendor.p({
          type: "sound",
          size: "18",
          color: "#f59e0b"
        }),
        y: common_vendor.t(systemAnnouncement.value),
        z: common_vendor.p({
          type: "close",
          size: "16",
          color: "#94a3b8"
        }),
        A: common_vendor.o(closeAnnouncement)
      } : {}, {
        B: common_vendor.p({
          current: "pages/home/index"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-4978fed5"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/home/index.js.map
