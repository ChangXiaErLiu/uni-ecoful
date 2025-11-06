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
  __name: "devices",
  setup(__props) {
    const navTitle = stores_navTitle.navTitleStore();
    common_vendor.onShow(() => {
      navTitle.setTitle("设备与会话");
      init();
    });
    const list = common_vendor.ref([]);
    const page = common_vendor.ref(1);
    const hasMore = common_vendor.ref(false);
    const loading = common_vendor.ref(false);
    const loadingMore = common_vendor.ref(false);
    const actingId = common_vendor.ref(null);
    const actingAll = common_vendor.ref(false);
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
        const res = await utils_request.request({ url: `/user/sessions?page=${page.value}&size=${pageSize}`, method: "GET" });
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
    function logoutOne(item) {
      if (item.isCurrent)
        return;
      common_vendor.index.showModal({
        title: "确认下线",
        content: "确定将该设备下线吗？",
        success: async (res) => {
          if (!res.confirm)
            return;
          actingId.value = item.id;
          try {
            await utils_request.request({ url: "/user/sessions/logout", method: "POST", data: { id: item.id } });
            common_vendor.index.showToast({ title: "已下线", icon: "success" });
            init();
          } catch (e) {
            common_vendor.index.showToast({ title: "操作失败", icon: "none" });
          } finally {
            actingId.value = null;
          }
        }
      });
    }
    function logoutOthers() {
      common_vendor.index.showModal({
        title: "批量下线",
        content: "确定下线除当前设备外的所有会话？",
        success: async (res) => {
          if (!res.confirm)
            return;
          actingAll.value = true;
          try {
            await utils_request.request({ url: "/user/sessions/logout-others", method: "POST", data: {} });
            common_vendor.index.showToast({ title: "已下线其他设备", icon: "success" });
            init();
          } catch (e) {
            common_vendor.index.showToast({ title: "操作失败", icon: "none" });
          } finally {
            actingAll.value = false;
          }
        }
      });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "phone",
          size: "20",
          color: "#276019"
        }),
        b: loading.value
      }, loading.value ? {} : list.value.length === 0 ? {} : {}, {
        c: list.value.length === 0,
        d: common_vendor.f(list.value, (item, idx, i0) => {
          return common_vendor.e({
            a: common_vendor.t(item.device || "未知设备"),
            b: item.isCurrent
          }, item.isCurrent ? {} : {}, {
            c: common_vendor.t(item.os || "-"),
            d: common_vendor.t(item.browser || "-"),
            e: common_vendor.t(item.ip || "-"),
            f: common_vendor.t(item.activeAt || "-"),
            g: common_vendor.t(item.isCurrent ? "使用中" : actingId.value === item.id ? "处理中" : "下线"),
            h: item.isCurrent || actingId.value === item.id,
            i: common_vendor.o(($event) => logoutOne(item), item.id || idx),
            j: item.id || idx
          });
        }),
        e: hasMore.value
      }, hasMore.value ? {
        f: common_vendor.t(loadingMore.value ? "加载中..." : "加载更多"),
        g: loadingMore.value,
        h: common_vendor.o(loadMore)
      } : {}, {
        i: actingAll.value,
        j: common_vendor.o(logoutOthers),
        k: common_vendor.p({
          current: "pages/profile/devices"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-8e5d2267"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/profile/devices.js.map
