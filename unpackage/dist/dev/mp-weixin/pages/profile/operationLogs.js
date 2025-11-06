"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_navTitle = require("../../stores/navTitle.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_uni_icons + AppLayout)();
}
const AppLayout = () => "../../components/layout/AppLayout.js";
const pageSize = 20;
const _sfc_main = {
  __name: "operationLogs",
  setup(__props) {
    const navTitle = stores_navTitle.navTitleStore();
    common_vendor.onShow(() => {
      navTitle.setTitle("操作日志");
      init();
    });
    const list = common_vendor.ref([]);
    const page = common_vendor.ref(1);
    const hasMore = common_vendor.ref(false);
    const loading = common_vendor.ref(false);
    const loadingMore = common_vendor.ref(false);
    async function init() {
      page.value = 1;
      list.value = [];
      await fetchList();
    }
    async function fetchList() {
      var _a;
      if (page.value === 1)
        loading.value = true;
      try {
        const res = await utils_request.request({ url: `/user/logs?page=${page.value}&size=${pageSize}`, method: "GET" });
        const rows = (res == null ? void 0 : res.list) || [];
        list.value = page.value === 1 ? rows : list.value.concat(rows);
        const total = ((_a = res == null ? void 0 : res.page) == null ? void 0 : _a.total) || 0;
        const current = list.value.length;
        hasMore.value = current < total;
      } catch (e) {
        if (page.value === 1)
          list.value = [];
        common_vendor.index.showToast({ title: "加载失败", icon: "none" });
      } finally {
        if (page.value === 1)
          loading.value = false;
        loadingMore.value = false;
      }
    }
    function loadMore() {
      if (!hasMore.value || loadingMore.value)
        return;
      loadingMore.value = true;
      page.value += 1;
      fetchList();
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "list",
          size: "20",
          color: "#276019"
        }),
        b: loading.value && page.value === 1
      }, loading.value && page.value === 1 ? {} : list.value.length === 0 ? {} : {}, {
        c: list.value.length === 0,
        d: common_vendor.f(list.value, (item, idx, i0) => {
          return {
            a: common_vendor.t(item.type || "操作"),
            b: common_vendor.t(item.time || "-"),
            c: common_vendor.t((item.device || "-") + " · " + (item.ip || "-") + " · " + (item.result || "-")),
            d: item.id || idx
          };
        }),
        e: hasMore.value
      }, hasMore.value ? {
        f: common_vendor.t(loadingMore.value ? "加载中..." : "加载更多"),
        g: loadingMore.value,
        h: common_vendor.o(loadMore)
      } : {}, {
        i: common_vendor.p({
          current: "pages/profile/operationLogs"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-d3bd09b9"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/profile/operationLogs.js.map
