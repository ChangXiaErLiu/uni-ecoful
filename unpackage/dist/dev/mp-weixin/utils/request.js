"use strict";
const common_vendor = require("../common/vendor.js");
const utils_config = require("./config.js");
function createRequest(options = {}) {
  return function request2(config) {
    const { url, method = "GET", data = {}, header = {} } = config;
    return new Promise((resolve, reject) => {
      common_vendor.index.request({
        url: url.startsWith("http") ? url : utils_config.BASE_URL + url,
        method,
        data,
        header: {
          "Content-Type": "application/json",
          ...options.header,
          ...header
        },
        success: (res) => {
          common_vendor.index.__f__("log", "at utils/request.js:20", "请求成功:", res.data);
          resolve(res.data);
        },
        fail: (error) => {
          common_vendor.index.__f__("error", "at utils/request.js:24", "请求失败:", error);
          reject(error);
        }
      });
    });
  };
}
const request = createRequest();
function chatStream(chatRequest, onDelta = () => {
}, onDone = () => {
}, onError = () => {
}) {
  let cancelled = false;
  let aborter = null;
  try {
    try {
      if (typeof utils_config.WS_URL === "string" && /^ws:\/\//i.test(utils_config.WS_URL)) {
        common_vendor.index.__f__("warn", "at utils/request.js:60", "当前为 ws://，小程序需使用 wss:// 且配置合法域名:", utils_config.WS_URL);
      }
    } catch (e) {
    }
    const socketTask = common_vendor.index.connectSocket({ url: utils_config.WS_URL, protocols: [], tcpNoDelay: true });
    let opened = false;
    socketTask.onOpen(() => {
      opened = true;
      try {
        socketTask.send({ data: JSON.stringify(chatRequest) });
      } catch (e) {
        onError && onError(e);
      }
    });
    socketTask.onMessage((evt) => {
      if (cancelled)
        return;
      try {
        const data = (evt == null ? void 0 : evt.data) ?? "";
        if (!data)
          return;
        if (data === "[DONE]") {
          onDone && onDone();
          return;
        }
        onDelta && onDelta(String(data));
      } catch (err) {
        onError && onError(err);
      }
    });
    socketTask.onError((err) => {
      if (!cancelled)
        onError && onError(err);
    });
    socketTask.onClose(() => {
      if (!cancelled)
        onDone && onDone();
    });
    return () => {
      var _a;
      cancelled = true;
      try {
        (_a = socketTask == null ? void 0 : socketTask.close) == null ? void 0 : _a.call(socketTask);
      } catch (e) {
      }
    };
  } catch (err) {
    onError && onError(err);
  }
  common_vendor.index.__f__("error", "at utils/request.js:171", "当前平台不支持流式请求（仅 H5 / 小程序）");
  onError(new Error("当前平台不支持流式请求（仅 H5 / 小程序）"));
  return () => {
    cancelled = true;
    try {
      aborter && aborter.abort();
    } catch (e) {
    }
  };
}
exports.chatStream = chatStream;
exports.request = request;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/request.js.map
