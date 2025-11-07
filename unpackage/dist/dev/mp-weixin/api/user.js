"use strict";
const common_vendor = require("../common/vendor.js");
const useUserStore = common_vendor.defineStore("user", {
  state: () => ({
    token: "",
    profile: null
  }),
  getters: {
    isLoggedIn(state) {
      return Boolean(state.token);
    }
  },
  actions: {
    setToken(token) {
      this.token = token;
    },
    setProfile(profile) {
      this.profile = profile;
    },
    reset() {
      this.token = "";
      this.profile = null;
    }
  }
});
exports.useUserStore = useUserStore;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/user.js.map
