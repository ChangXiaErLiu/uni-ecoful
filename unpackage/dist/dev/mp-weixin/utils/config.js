"use strict";
exports.BASE_URL = "http://localhost:6039";
try {
  if (typeof globalThis !== "undefined" && globalThis.__UNI_API_BASE__) {
    exports.BASE_URL = String(globalThis.__UNI_API_BASE__);
  }
} catch (e) {
}
exports.WS_URL = exports.BASE_URL;
try {
  exports.WS_URL = /^https:\/\//i.test(exports.BASE_URL) ? exports.BASE_URL.replace(/^https/i, "wss") : exports.BASE_URL.replace(/^http/i, "ws");
} catch (e) {
  exports.WS_URL = exports.BASE_URL.replace(/^http/i, "ws");
}
exports.WS_URL = exports.WS_URL + "/chat/stream";
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/config.js.map
