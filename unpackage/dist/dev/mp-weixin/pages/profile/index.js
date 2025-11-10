"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
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
    common_vendor.onShow(() => navTitle.setTitle("个人中心"));
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
      common_vendor.index.showModal({
        title: "确认退出",
        content: "您确定要退出登录吗？",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.showLoading({ title: "退出中..." });
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
        b: common_vendor.p({
          type: "contact",
          size: "20",
          color: "#276019"
        }),
        c: common_vendor.p({
          type: "phone",
          size: "18",
          color: "#64748b"
        }),
        d: common_vendor.p({
          type: "right",
          size: "16",
          color: "#94a3b8"
        }),
        e: common_vendor.o(bindMobile),
        f: common_vendor.p({
          type: "weixin",
          size: "18",
          color: "#64748b"
        }),
        g: common_vendor.p({
          type: "right",
          size: "16",
          color: "#94a3b8"
        }),
        h: common_vendor.o(handleWechatBind),
        i: common_vendor.p({
          type: "calendar",
          size: "18",
          color: "#64748b"
        }),
        j: common_vendor.p({
          type: "locked",
          size: "20",
          color: "#276019"
        }),
        k: common_vendor.p({
          type: "phone",
          size: "18",
          color: "#64748b"
        }),
        l: common_vendor.p({
          type: "right",
          size: "16",
          color: "#94a3b8"
        }),
        m: common_vendor.o(manageDevices),
        n: common_vendor.p({
          type: "list",
          size: "18",
          color: "#64748b"
        }),
        o: common_vendor.p({
          type: "right",
          size: "16",
          color: "#94a3b8"
        }),
        p: common_vendor.o(viewLogs),
        q: common_vendor.p({
          type: "locked-filled",
          size: "18",
          color: "#64748b"
        }),
        r: common_vendor.p({
          type: "right",
          size: "16",
          color: "#94a3b8"
        }),
        s: common_vendor.o(handleChangePassword),
        t: common_vendor.p({
          type: "info",
          size: "20",
          color: "#276019"
        }),
        v: common_vendor.p({
          type: "info",
          size: "18",
          color: "#64748b"
        }),
        w: common_vendor.p({
          type: "right",
          size: "16",
          color: "#94a3b8"
        }),
        x: common_vendor.o(handleAbout),
        y: common_vendor.p({
          type: "help",
          size: "18",
          color: "#64748b"
        }),
        z: common_vendor.p({
          type: "right",
          size: "16",
          color: "#94a3b8"
        }),
        A: common_vendor.o(handleFeedback),
        B: common_vendor.o(handleLogout),
        C: common_vendor.p({
          current: "pages/profile/index"
        })
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-201c0da5"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/profile/index.js.map
