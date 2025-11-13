"use strict";
const common_vendor = require("../common/vendor.js");
require("./chat.js");
require("../utils/config.js");
let piniaInstance = null;
function setupStore(app) {
  if (!piniaInstance) {
    piniaInstance = common_vendor.createPinia();
  }
  app.use(piniaInstance);
  return piniaInstance;
}
exports.setupStore = setupStore;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/index.js.map
