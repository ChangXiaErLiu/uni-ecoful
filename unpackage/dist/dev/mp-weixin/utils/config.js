"use strict";
const common_vendor = require("../common/vendor.js");
const ENV_CONFIG = {
  development: "http://172.16.1.61:8000",
  //开发环境地址http://http://172.16.1.61:8000
  production: "https://api.yourdomain.com"
  // 生产环境地址  172.16.1.176
};
const BASE_URL = ENV_CONFIG["development"];
const WS_URL = BASE_URL.replace(/^http/, "ws") + "/chat/stream";
{
  common_vendor.index.__f__("log", "at utils/config.js:21", "[Config] 当前 API 地址:", BASE_URL);
  common_vendor.index.__f__("log", "at utils/config.js:22", "[Config] 当前 WebSocket 地址:", WS_URL);
}
exports.BASE_URL = BASE_URL;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/config.js.map
