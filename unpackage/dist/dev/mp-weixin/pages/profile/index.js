"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const stores_navTitle = require("../../stores/navTitle.js");
const stores_user = require("../../stores/user.js");
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
    common_vendor.onShow(() => navTitle.setTitle("个人中心"));
    const userStore = stores_user.useUserStore();
    common_vendor.onShow(async () => {
      if (!userStore.token)
        return;
      try {
        await userStore.fetchUserInfo();
      } catch (e) {
        common_vendor.index.__f__("warn", "at pages/profile/index.vue:171", "获取最新用户信息失败", e);
      }
    });
    function bindMobile() {
      common_vendor.index.navigateTo({
        url: "/pages/profile/changePhone"
      });
    }
    function handleWechatBind() {
      common_vendor.index.showActionSheet({
        itemList: ["解绑微信", "取消"],
        success: (res) => {
          if (res.tapIndex === 0) {
            common_vendor.index.showModal({
              title: "确认解绑",
              content: "解绑后将无法使用微信登录",
              success: (res2) => {
                if (res2.confirm) {
                  common_vendor.index.showToast({
                    title: "解绑成功",
                    icon: "success"
                  });
                }
              }
            });
          }
        }
      });
    }
    function handleChangePassword() {
      common_vendor.index.navigateTo({
        url: "/pages/profile/changePassword"
      });
    }
    function manageDevices() {
      common_vendor.index.navigateTo({
        url: "/pages/profile/devices"
      });
    }
    function viewLogs() {
      common_vendor.index.navigateTo({
        url: "/pages/profile/operationLogs"
      });
    }
    function handleAbout() {
      common_vendor.index.navigateTo({
        url: "/pages/profile/about"
      });
    }
    function handleFeedback() {
      common_vendor.index.navigateTo({
        url: "/pages/profile/feedback"
      });
    }
    function handleLogout() {
      const userStore2 = stores_user.useUserStore();
      common_vendor.index.showModal({
        title: "确认退出",
        content: "您确定要退出登录吗？",
        success: async (res) => {
          if (res.confirm) {
            common_vendor.index.showLoading({
              title: "退出中..."
            });
            await userStore2.logout();
            setTimeout(() => {
              common_vendor.index.hideLoading();
              common_vendor.index.removeStorageSync("token");
              common_vendor.index.reLaunch({
                url: "/pages/auth/login"
              });
            }, 1e3);
          }
        }
      });
    }
    return (_ctx, _cache) => {
      return {
        a: common_assets._imports_0,
        b: common_vendor.t(common_vendor.unref(userStore).userName),
        c: common_vendor.t(common_vendor.unref(userStore).companyName),
        d: common_vendor.p({
          type: "contact",
          size: "20",
          color: "#276019"
        }),
        e: common_vendor.p({
          type: "phone",
          size: "18",
          color: "#64748b"
        }),
        f: common_vendor.t(common_vendor.unref(userStore).phoneNum),
        g: common_vendor.p({
          type: "right",
          size: "16",
          color: "#94a3b8"
        }),
        h: common_vendor.o(bindMobile),
        i: common_vendor.p({
          type: "weixin",
          size: "18",
          color: "#64748b"
        }),
        j: common_vendor.p({
          type: "right",
          size: "16",
          color: "#94a3b8"
        }),
        k: common_vendor.o(handleWechatBind),
        l: common_vendor.p({
          type: "calendar",
          size: "18",
          color: "#64748b"
        }),
        m: common_vendor.p({
          type: "locked",
          size: "20",
          color: "#276019"
        }),
        n: common_vendor.p({
          type: "phone",
          size: "18",
          color: "#64748b"
        }),
        o: common_vendor.p({
          type: "right",
          size: "16",
          color: "#94a3b8"
        }),
        p: common_vendor.o(manageDevices),
        q: common_vendor.p({
          type: "list",
          size: "18",
          color: "#64748b"
        }),
        r: common_vendor.p({
          type: "right",
          size: "16",
          color: "#94a3b8"
        }),
        s: common_vendor.o(viewLogs),
        t: common_vendor.p({
          type: "locked-filled",
          size: "18",
          color: "#64748b"
        }),
        v: common_vendor.p({
          type: "right",
          size: "16",
          color: "#94a3b8"
        }),
        w: common_vendor.o(handleChangePassword),
        x: common_vendor.p({
          type: "info",
          size: "20",
          color: "#276019"
        }),
        y: common_vendor.p({
          type: "info",
          size: "18",
          color: "#64748b"
        }),
        z: common_vendor.p({
          type: "right",
          size: "16",
          color: "#94a3b8"
        }),
        A: common_vendor.o(handleAbout),
        B: common_vendor.p({
          type: "help",
          size: "18",
          color: "#64748b"
        }),
        C: common_vendor.p({
          type: "right",
          size: "16",
          color: "#94a3b8"
        }),
        D: common_vendor.o(handleFeedback),
        E: common_vendor.o(handleLogout),
        F: common_vendor.p({
          current: "pages/profile/index"
        })
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-201c0da5"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/profile/index.js.map
