"use strict";
const common_vendor = require("../common/vendor.js");
const utils_config = require("./config.js");
class Request {
  constructor(options = {}) {
    this.baseOptions = options;
    this.requestQueue = [];
  }
  /**
   * 核心请求方法
   * @param {Object} config - 请求配置
   * @returns {Promise}
   */
  async request(config) {
    const {
      url,
      method = "GET",
      data = {},
      header = {},
      hideLoading = false,
      timeout = 3e4,
      showError = true
    } = config;
    const token = common_vendor.index.getStorageSync("token");
    if (token)
      header.Authorization = `Bearer ${token}`;
    let requestId = null;
    if (!hideLoading) {
      requestId = Date.now();
      this.requestQueue.push(requestId);
      this.showLoading();
    }
    return new Promise((resolve, reject) => {
      common_vendor.index.request({
        url: url.startsWith("http") ? url : utils_config.BASE_URL + url,
        method,
        data,
        header: {
          "Content-Type": "application/json",
          ...this.baseOptions.header,
          ...header
        },
        timeout,
        success: (res) => {
          var _a, _b;
          if (requestId !== null) {
            this.hideLoading(requestId);
          }
          if (config.responseType === "arraybuffer") {
            common_vendor.index.__f__("log", "at utils/request.js:68", "二进制直通", res.data.byteLength);
            return resolve(res);
          }
          if (!res) {
            reject(new Error("响应为空"));
            return;
          }
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data);
          } else {
            const error = {
              code: res.statusCode,
              message: ((_a = res.data) == null ? void 0 : _a.detail) || "请求失败",
              data: res.data
            };
            if (showError) {
              common_vendor.index.showToast({
                title: String(error.message ?? ((_b = error.data) == null ? void 0 : _b.detail) ?? "请求失败"),
                // 强制字符串
                icon: "none",
                duration: 2e3
              });
            }
            reject(error);
          }
        },
        fail: (error) => {
          if (requestId !== null) {
            this.hideLoading(requestId);
          }
          const netError = {
            code: "NETWORK_ERROR",
            message: error.errMsg || "网络请求失败",
            originalError: error
          };
          if (showError) {
            common_vendor.index.showToast({
              title: netError.message,
              icon: "none",
              duration: 2e3
            });
          }
          reject(netError);
        }
      });
    });
  }
  /**
   * 显示 loading
   */
  showLoading() {
    if (this.requestQueue.length === 1) {
      common_vendor.index.showLoading({
        title: "加载中...",
        mask: true
      });
    }
  }
  /**
   * 隐藏 loading
   */
  hideLoading(requestId) {
    const index = this.requestQueue.indexOf(requestId);
    if (index > -1) {
      this.requestQueue.splice(index, 1);
    }
    if (this.requestQueue.length === 0) {
      common_vendor.index.hideLoading();
    }
  }
  /**
   * 流式请求（用于 AI 聊天、大文本生成等场景）
   * @param {Object} config - 请求配置 { url, method, body }
   * @param {Function} onDelta - 收到数据片段的回调
   * @param {Function} onError - 错误回调
   * @param {Function} onDone - 完成回调
   * @returns {Function} cancel - 取消请求的函数
   */
  chatStream(config, onDelta, onError, onDone) {
    const {
      url,
      method = "POST",
      body = {}
    } = config;
    const fullUrl = url.startsWith("ws") || url.startsWith("http") ? url.replace(/^https?/, "ws") : WS_URL + url;
    const socket = common_vendor.index.connectSocket({
      url: fullUrl,
      method,
      header: {
        "Content-Type": "application/json",
        // 传递 token（如果需要）
        ...common_vendor.index.getStorageSync("token") ? {
          Authorization: `Bearer ${common_vendor.index.getStorageSync("token")}`
        } : {},
        ...this.baseOptions.header
      },
      success: () => {
        common_vendor.index.__f__("log", "at utils/request.js:180", "[WebSocket] 连接成功:", fullUrl);
      },
      fail: (err) => {
        common_vendor.index.__f__("error", "at utils/request.js:183", "[WebSocket] 连接失败:", err);
        onError == null ? void 0 : onError(new Error("WebSocket 连接失败: " + err.errMsg));
      }
    });
    socket.onMessage((res) => {
      try {
        const message = JSON.parse(res.data);
        switch (message.type) {
          case "delta":
            onDelta == null ? void 0 : onDelta(message.data);
            break;
          case "error":
            onError == null ? void 0 : onError(new Error(message.message || "Stream error"));
            break;
          case "done":
            onDone == null ? void 0 : onDone();
            socket.close();
            break;
          default:
            if (typeof res.data === "string") {
              onDelta == null ? void 0 : onDelta(res.data);
            }
        }
      } catch (e) {
        onDelta == null ? void 0 : onDelta(res.data);
      }
    });
    socket.onError((err) => {
      common_vendor.index.__f__("error", "at utils/request.js:219", "[WebSocket] 错误:", err);
      onError == null ? void 0 : onError(new Error("WebSocket 错误: " + err.errMsg));
    });
    socket.onClose((res) => {
      common_vendor.index.__f__("log", "at utils/request.js:225", "[WebSocket] 连接关闭:", res.code, res.reason);
      if (res.code !== 1e3) {
        onError == null ? void 0 : onError(new Error("连接异常关闭: " + res.reason));
      }
    });
    socket.onOpen(() => {
      socket.send({
        data: JSON.stringify(body)
      });
    });
    const cancel = () => {
      common_vendor.index.__f__("log", "at utils/request.js:240", "[WebSocket] 主动取消请求");
      socket.close();
    };
    return cancel;
  }
  // 快捷请求方法
  get(url, config = {}) {
    return this.request({
      ...config,
      url,
      method: "GET"
    });
  }
  post(url, data = {}, config = {}) {
    return this.request({
      ...config,
      url,
      method: "POST",
      data
    });
  }
  put(url, data = {}, config = {}) {
    return this.request({
      ...config,
      url,
      method: "PUT",
      data
    });
  }
  delete(url, config = {}) {
    return this.request({
      ...config,
      url,
      method: "DELETE"
    });
  }
  /**
   * 文件上传方法
   * @param {String} url - 上传接口地址
   * @param {String} filePath - 文件路径
   * @param {Object} options - 配置项
   * @param {String} options.name - 文件对应的 key，默认 'file'
   * @param {Object} options.formData - 额外的表单数据
   * @param {Object} options.header - 额外的请求头
   * @param {Boolean} options.hideLoading - 是否隐藏 loading
   * @returns {Promise}
   */
  upload(url, filePath, options = {}) {
    const {
      name = "file",
      formData = {},
      header = {},
      hideLoading = false
    } = options;
    const token = common_vendor.index.getStorageSync("token");
    const uploadHeader = {
      ...this.baseOptions.header,
      ...header
    };
    if (token) {
      uploadHeader.Authorization = `Bearer ${token}`;
    }
    let requestId = null;
    if (!hideLoading) {
      requestId = Date.now();
      this.requestQueue.push(requestId);
      this.showLoading();
    }
    return new Promise((resolve, reject) => {
      common_vendor.index.uploadFile({
        url: url.startsWith("http") ? url : utils_config.BASE_URL + url,
        filePath,
        name,
        formData,
        header: uploadHeader,
        success: (res) => {
          if (requestId !== null) {
            this.hideLoading(requestId);
          }
          try {
            const data = typeof res.data === "string" ? JSON.parse(res.data) : res.data;
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(data);
            } else {
              const error = {
                code: res.statusCode,
                message: (data == null ? void 0 : data.detail) || "上传失败",
                data
              };
              common_vendor.index.showToast({
                title: error.message,
                icon: "none",
                duration: 2e3
              });
              reject(error);
            }
          } catch (e) {
            const parseError = {
              code: "PARSE_ERROR",
              message: "解析响应失败",
              originalError: e
            };
            common_vendor.index.showToast({
              title: parseError.message,
              icon: "none",
              duration: 2e3
            });
            reject(parseError);
          }
        },
        fail: (error) => {
          if (requestId !== null) {
            this.hideLoading(requestId);
          }
          const netError = {
            code: "UPLOAD_ERROR",
            message: error.errMsg || "上传失败",
            originalError: error
          };
          common_vendor.index.showToast({
            title: netError.message,
            icon: "none",
            duration: 2e3
          });
          reject(netError);
        }
      });
    });
  }
}
const request = new Request();
exports.request = request;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/request.js.map
