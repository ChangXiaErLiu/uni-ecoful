"use strict";
const common_vendor = require("../common/vendor.js");
const api_auth = require("../api/auth.js");
const useUserStore = common_vendor.defineStore("user", {
  state: () => ({
    token: common_vendor.index.getStorageSync("token") || "",
    userInfo: null
  }),
  getters: {
    // 是否已登录
    isLoggedIn: (state) => !!state.token,
    // 用户名
    userName: (state) => {
      var _a;
      return ((_a = state.userInfo) == null ? void 0 : _a.username) || "未登录";
    },
    // 企业名称
    companyName: (state) => {
      var _a;
      return ((_a = state.userInfo) == null ? void 0 : _a.company_name) || "";
    },
    // 手机号
    phoneNum: (state) => {
      var _a;
      return ((_a = state.userInfo) == null ? void 0 : _a.phone_num) || "";
    }
  },
  actions: {
    /**
     * 密码登录
     */
    async loginByPassword(account, password) {
      try {
        const res = await api_auth.loginByPassword(account, password);
        this.token = res.access_token;
        common_vendor.index.setStorageSync("token", res.access_token);
        this.userInfo = res.user;
        common_vendor.index.setStorageSync("userInfo", JSON.stringify(res.user));
        return { success: true, data: res };
      } catch (error) {
        return { success: false, error };
      }
    },
    /**
     * 验证码登录
     */
    async loginByCode(phoneNum, code) {
      try {
        const res = await api_auth.loginByCode(phoneNum, code);
        this.token = res.access_token;
        common_vendor.index.setStorageSync("token", res.access_token);
        this.userInfo = res.user;
        common_vendor.index.setStorageSync("userInfo", JSON.stringify(res.user));
        return { success: true, data: res };
      } catch (error) {
        return { success: false, error };
      }
    },
    /**
     * 用户注册
     */
    async register(data) {
      try {
        const res = await api_auth.register(data);
        this.token = res.access_token;
        common_vendor.index.setStorageSync("token", res.access_token);
        this.userInfo = res.user;
        common_vendor.index.setStorageSync("userInfo", JSON.stringify(res.user));
        return { success: true, data: res };
      } catch (error) {
        return { success: false, error };
      }
    },
    /**
     * 微信登录
     */
    async loginByWechat(code) {
      try {
        const res = await api_auth.loginByWechat(code);
        this.token = res.access_token;
        common_vendor.index.setStorageSync("token", res.access_token);
        this.userInfo = res.user;
        common_vendor.index.setStorageSync("userInfo", JSON.stringify(res.user));
        return { success: true, data: res };
      } catch (error) {
        return { success: false, error };
      }
    },
    /**
     * 获取用户信息
     */
    async fetchUserInfo() {
      try {
        const res = await api_auth.getUserInfo();
        this.userInfo = res;
        common_vendor.index.setStorageSync("userInfo", JSON.stringify(res));
        return { success: true, data: res };
      } catch (error) {
        return { success: false, error };
      }
    },
    /**
     * 登出
     */
    async logout() {
      try {
        await api_auth.logout();
      } catch (error) {
        common_vendor.index.__f__("error", "at stores/user.js:134", "登出接口调用失败:", error);
      } finally {
        this.token = "";
        this.userInfo = null;
        common_vendor.index.removeStorageSync("token");
        common_vendor.index.removeStorageSync("userInfo");
        common_vendor.index.reLaunch({
          url: "/pages/auth/login"
        });
      }
    },
    /**
     * 初始化用户信息（从本地存储恢复）
     */
    initUserInfo() {
      try {
        const userInfoStr = common_vendor.index.getStorageSync("userInfo");
        if (userInfoStr) {
          this.userInfo = JSON.parse(userInfoStr);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at stores/user.js:159", "初始化用户信息失败:", error);
      }
    }
  }
});
exports.useUserStore = useUserStore;
//# sourceMappingURL=../../.sourcemap/mp-weixin/stores/user.js.map
