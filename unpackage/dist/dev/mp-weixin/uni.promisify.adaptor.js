"use strict";
const common_vendor = require("./common/vendor.js");
common_vendor.index.addInterceptor({
  returnValue(res) {
    if (!(!!res && (typeof res === "object" || typeof res === "function") && typeof res.then === "function")) {
      return res;
    }
    return new Promise((resolve, reject) => {
      res.then((res2) => {
        if (!res2)
          return resolve(res2);
        return res2[0] ? reject(res2[0]) : resolve(res2[1]);
      });
    });
  }
});
//# sourceMappingURL=../.sourcemap/mp-weixin/uni.promisify.adaptor.js.map
