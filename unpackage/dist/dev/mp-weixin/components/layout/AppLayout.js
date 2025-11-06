"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_platform = require("../../utils/platform.js");
const utils_safeArea = require("../../utils/safe-area.js");
const stores_navTitle = require("../../stores/navTitle.js");
if (!Array) {
  const _easycom_uni_nav_bar2 = common_vendor.resolveComponent("uni-nav-bar");
  _easycom_uni_nav_bar2();
}
const _easycom_uni_nav_bar = () => "../../uni_modules/uni-nav-bar/components/uni-nav-bar/uni-nav-bar.js";
if (!Math) {
  (_easycom_uni_nav_bar + NavSider)();
}
const NavSider = () => "./NavSider.js";
const _sfc_main = {
  __name: "AppLayout",
  props: {
    current: {
      type: String,
      required: true
    },
    // 非 H5 生效：是否由 AppLayout 外层承担滚动
    contentScroll: {
      type: Boolean,
      default: true
    }
  },
  emits: ["navigate"],
  setup(__props, { emit: __emit }) {
    const navTitle = stores_navTitle.navTitleStore();
    const props = __props;
    const emit = __emit;
    const {
      isDesktop
    } = utils_platform.usePlatformInfo();
    const activePath = common_vendor.ref(props.current);
    const {
      totalNavHeightPx
    } = utils_safeArea.useSafeArea();
    common_vendor.watch(() => props.current, (value) => {
      activePath.value = value;
    });
    const layoutClass = common_vendor.computed(() => isDesktop.value ? "AppLayout--desktop" : "AppLayout--mobile");
    common_vendor.computed(() => `height:${(totalNavHeightPx || { value: 64 }).value}px;`);
    const currentUrl = common_vendor.computed(() => {
      const p = String(activePath.value || "").trim();
      return p.startsWith("/") ? p : "/" + p;
    });
    const TAB_PAGES = /* @__PURE__ */ new Set([
      "/pages/home/index",
      "/pages/knowledge/index",
      "/pages/profile/index"
    ]);
    const showBack = common_vendor.computed(() => !isDesktop.value && !TAB_PAGES.has(currentUrl.value));
    function goBackSafely() {
      try {
        const pages = typeof getCurrentPages === "function" ? getCurrentPages() : [];
        if (Array.isArray(pages) && pages.length > 1) {
          common_vendor.index.navigateBack();
          return;
        }
      } catch (e) {
      }
      const url = currentUrl.value;
      if (url.startsWith("/pages/profile/") && url !== "/pages/profile/index") {
        try {
          common_vendor.index.switchTab({
            url: "/pages/profile/index"
          });
        } catch (e) {
          common_vendor.index.redirectTo({
            url: "/pages/profile/index"
          });
        }
      } else {
        try {
          common_vendor.index.switchTab({
            url: "/pages/home/index"
          });
        } catch (e) {
          common_vendor.index.redirectTo({
            url: "/pages/home/index"
          });
        }
      }
    }
    const navItemsPc = [
      {
        path: "pages/home/index",
        label: "首页",
        icon: "home"
      },
      {
        path: "pages/chat/index",
        label: "AI问答",
        icon: "chat"
      },
      {
        path: "pages/doc-generator/index",
        label: "报告生成",
        icon: "compose"
      },
      {
        path: "pages/compliance/index",
        label: "报告审查",
        icon: "calendar"
      },
      {
        path: "pages/knowledge/index",
        label: "知识库",
        icon: "folder-add"
      },
      {
        path: "pages/profile/index",
        label: "个人中心",
        icon: "person"
      }
    ];
    function handleNavigate(item) {
      if (!(item == null ? void 0 : item.path) || item.path === activePath.value)
        return;
      emit("navigate", item.path);
      const url = item.path.startsWith("/") ? item.path : `/${item.path}`;
      const tabPages = /* @__PURE__ */ new Set([
        "/pages/home/index",
        "/pages/knowledge/index",
        "/pages/profile/index"
      ]);
      if (tabPages.has(url)) {
        try {
          common_vendor.index.switchTab({
            url
          });
        } catch (e) {
          common_vendor.index.redirectTo({
            url
          });
        }
      } else {
        common_vendor.index.redirectTo({
          url
        });
      }
    }
    common_vendor.watch(() => isDesktop.value, (val) => {
      try {
        if (val)
          common_vendor.index.hideTabBar();
        else
          common_vendor.index.showTabBar();
      } catch (e) {
      }
    }, {
      immediate: true
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: !common_vendor.unref(isDesktop)
      }, !common_vendor.unref(isDesktop) ? {
        b: common_vendor.o(goBackSafely),
        c: common_vendor.p({
          title: common_vendor.unref(navTitle).title,
          statusBar: true,
          fixed: true,
          placeholder: true,
          border: false,
          shadow: false,
          height: "42",
          backgroundColor: "#ffffff",
          ["left-icon"]: showBack.value ? "left" : ""
        })
      } : {}, {
        d: common_vendor.unref(isDesktop)
      }, common_vendor.unref(isDesktop) ? {
        e: common_vendor.o(handleNavigate),
        f: common_vendor.p({
          items: navItemsPc,
          current: activePath.value
        })
      } : {}, {
        g: __props.contentScroll
      }, __props.contentScroll ? {} : {}, {
        h: common_vendor.n(layoutClass.value)
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-4ce3c322"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/layout/AppLayout.js.map
