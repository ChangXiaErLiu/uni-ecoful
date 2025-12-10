"use strict";
const common_vendor = require("../common/vendor.js");
const utils_config = require("../utils/config.js");
const utils_request = require("../utils/request.js");
async function uploadFileToBackend(file) {
  const filePath = file.url || file.path || file.tempFilePath;
  if (!filePath) {
    throw new Error("文件路径无效");
  }
  try {
    const data = await utils_request.request.upload("/api/v1/completion/documents/upload", filePath, {
      name: "file",
      formData: {
        category: "eia_report"
        // 标记为环评报告
      }
    });
    return {
      success: true,
      document_id: data.document_id,
      filename: data.filename,
      size_bytes: data.size_bytes,
      upload_time: data.upload_time
    };
  } catch (error) {
    throw new Error(error.message || "上传失败");
  }
}
async function fetchUploadedFiles() {
  try {
    const res = await utils_request.request.get("/api/v1/completion/documents?skip=0&limit=100");
    if (Array.isArray(res)) {
      return res.map((file) => {
        var _a;
        return {
          name: file.filename,
          ext: ((_a = file.metadata) == null ? void 0 : _a.file_extension) || "",
          document_id: file.document_id,
          size: file.size_bytes,
          upload_time: file.upload_time
        };
      });
    }
    return [];
  } catch (error) {
    common_vendor.index.__f__("error", "at api/acceptance.js:83", "自动刷新文件列表失败:", error);
    return [];
  }
}
async function deleteFile(document_id) {
  if (!document_id)
    throw new Error("document_id 不能为空");
  await utils_request.request.delete(`/api/v1/completion/documents/${document_id}`);
}
async function runTask(options = {}) {
  const {
    onProgress = null,
    pollInterval = 3e3,
    // 默认3秒轮询一次
    timeout = 18e5
    // 默认30分钟
  } = options;
  try {
    const submitResult = await utils_request.request.post("/api/v1/completion/extract-info/async/start", {
      project_data: {}
    });
    const taskId = submitResult.task_id;
    const startTime = Date.now();
    return new Promise((resolve, reject) => {
      const pollStatus = async () => {
        try {
          if (Date.now() - startTime > timeout) {
            reject(new Error("任务超时，请稍后重试"));
            return;
          }
          const statusResult = await utils_request.request.get(`/api/v1/tasks/${taskId}/status`);
          const {
            status,
            progress = 0,
            current_step = "",
            task_result,
            error_message
          } = statusResult;
          common_vendor.index.__f__("log", "at api/acceptance.js:147", `[${status}] ${progress}% - ${current_step}`);
          if (onProgress && typeof onProgress === "function") {
            onProgress(progress, current_step, status);
          }
          if (status === "success") {
            const data = (task_result == null ? void 0 : task_result.result) || task_result;
            if (!data || typeof data !== "object" || Object.keys(data).length === 0) {
              reject(new Error("未提取到任何项目信息，请检查文件内容是否完整"));
              return;
            }
            resolve({
              status: "success",
              result: data
            });
            return;
          }
          if (status === "failed") {
            common_vendor.index.__f__("error", "at api/acceptance.js:174", "❌ 任务失败:", error_message);
            reject(new Error(error_message || "任务执行失败"));
            return;
          }
          if (status === "cancelled") {
            reject(new Error("任务已被取消"));
            return;
          }
          setTimeout(pollStatus, pollInterval);
        } catch (error) {
          common_vendor.index.__f__("error", "at api/acceptance.js:189", "查询任务状态失败:", error);
          reject(error);
        }
      };
      pollStatus();
    });
  } catch (error) {
    if (error.code === "NETWORK_ERROR" && error.message.includes("timeout")) {
      throw new Error("提取超时：文档过大或网络不稳定，请稍后重试");
    } else if (error.code === "HTTP_ERROR" && error.message.includes("404")) {
      throw new Error("任务不存在，请联系管理员配置");
    } else {
      throw error;
    }
  }
}
function transformExtractResult(result) {
  const FIELD_MAP = {
    // 基本信息
    "建设项目名称": {
      id: "project_name",
      label: "建设项目名称"
    },
    "建设单位名称": {
      id: "company_name",
      label: "建设单位名称"
    },
    "建设地点": {
      id: "project_address",
      label: "建设地点"
    },
    "建设项目性质": {
      id: "project_type",
      label: "建设项目性质"
    },
    "产品及产能": {
      id: "product_scale",
      label: "产品及产能"
    },
    // 审批信息
    "环评报告表审批部门": {
      id: "assessment_department",
      label: "环评报告表审批部门"
    },
    "环评报告表编制单位": {
      id: "assessment_unit",
      label: "环评报告表编制单位"
    },
    // 投资信息
    "投资总概算(万元)": {
      id: "investment",
      label: "投资总概算(万元)"
    },
    "环保投资总概算(万元)": {
      id: "env_investment",
      label: "环保投资总概算(万元)"
    },
    "比例": {
      id: "env_investment_ratio",
      label: "环保投资占比"
    },
    // 建设内容
    "主要建设内容": {
      id: "construction_content",
      label: "主要建设内容"
    },
    "改扩建项目变动情况": {
      id: "project_changes",
      label: "改扩建项目变动情况"
    },
    // 建设内容
    "单位联系人": {
      id: "contact_person",
      label: "单位联系人"
    },
    "联系方式": {
      id: "contact_phone",
      label: "联系方式"
    },
    "注册地址": {
      id: "registered_address",
      label: "建设单位注册地址"
    },
    // 污染物
    "固体废物产生情况": {
      id: "solid_generation",
      label: "固体废物产生情况"
    },
    "污染物产排情况": {
      id: "pollutants_emission",
      label: "污染物产排情况",
      type: "table"
      // 添加类型标识
    }
  };
  const baseTable = [];
  Object.entries(result).forEach(([chineseKey, value]) => {
    if (FIELD_MAP[chineseKey]) {
      const fieldConfig = FIELD_MAP[chineseKey];
      if (fieldConfig.type === "table") {
        baseTable.push({
          id: fieldConfig.id,
          label: fieldConfig.label,
          value,
          // 保留原始对象，不进行格式化
          source: "extracted",
          type: "table"
          // 前端通过这个类型来识别需要渲染表格
        });
      } else {
        baseTable.push({
          id: fieldConfig.id,
          label: fieldConfig.label,
          value: formatValue(value),
          source: "extracted"
        });
      }
    } else if (typeof value === "object" && value !== null) {
      Object.entries(value).forEach(([subKey, subValue]) => {
        baseTable.push({
          id: `${chineseKey}_${subKey}`,
          label: `${chineseKey} - ${subKey}`,
          value: formatValue(subValue),
          source: "extracted"
        });
      });
    } else {
      baseTable.push({
        id: chineseKey,
        label: chineseKey,
        value: formatValue(value),
        source: "extracted"
      });
    }
  });
  const ORDER = [
    "project_name",
    // 建设项目名称
    "company_name",
    // 建设单位名称
    "project_address",
    // 建设地点
    "project_type",
    // 建设项目性质
    "product_scale",
    // 产品及产能
    "assessment_department",
    // 环评报告表审批部门
    "assessment_unit",
    // 环评报告表编制单位
    "investment",
    // 投资总概算(万元)
    "env_investment",
    // 环保投资总概算(万元)
    "env_investment_ratio",
    // 比例
    "construction_content",
    // 主要建设内容
    "project_changes",
    // 改扩建项目变动情况
    "registered_address",
    // 注册地址
    "contact_person",
    // 联系人
    "contact_phone",
    // 联系方式
    "solid_generation",
    // 固体废物产生情况
    "pollutants_emission"
    // 污染物产排情况
  ];
  return baseTable.sort((a, b) => {
    const aIndex = ORDER.indexOf(a.id);
    const bIndex = ORDER.indexOf(b.id);
    if (aIndex !== -1 && bIndex !== -1)
      return aIndex - bIndex;
    if (aIndex !== -1)
      return -1;
    if (bIndex !== -1)
      return 1;
    return 0;
  });
}
function formatValue(value) {
  if (Array.isArray(value)) {
    return value.length > 0 ? JSON.stringify(value, null, 2) : "未提取到相关信息";
  }
  if (typeof value === "object" && value !== null) {
    return JSON.stringify(value, null, 2);
  }
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    return value.trim() || "未提取到相关信息";
  }
  return value || "未提取到相关信息";
}
function downloadSignboardWord(signboard) {
  const payload = {
    sections: signboard.sections.map((sec) => ({
      block: sec.block,
      items: sec.items.map((it) => ({
        title: it.title,
        content: it.content
      }))
    }))
  };
  return new Promise((resolve, reject) => {
    common_vendor.index.request({
      url: utils_config.BASE_URL + "/api/v1/completion/signboard/download",
      method: "POST",
      data: payload,
      header: {
        "Content-Type": "application/json"
      },
      responseType: "arraybuffer",
      success: (res) => {
        common_vendor.index.__f__("log", "at api/acceptance.js:490", "标识牌下载响应:", res);
        if (res.statusCode === 200 && res.data) {
          if (res.data instanceof ArrayBuffer && res.data.byteLength > 0) {
            resolve(res.data);
          } else if (typeof res.data === "string" && res.data.length > 0) {
            common_vendor.index.showToast({ title: "文件格式错误", icon: "none" });
            reject(new Error("文件格式错误"));
          } else {
            reject(new Error("空文件"));
          }
        } else {
          reject(new Error("生成失败"));
        }
      },
      fail: (error) => {
        reject(new Error(error.errMsg || "网络请求失败"));
      }
    });
  });
}
function downloadMonitorPlan(options = {}) {
  const {
    hideLoading = false,
    timeout = 6e5
    // 默认10分钟，因为涉及 RAG 检索 + LLM 生成
  } = options;
  return new Promise((resolve, reject) => {
    const requestTask = common_vendor.index.request({
      url: utils_config.BASE_URL + "/api/v1/completion/monitor-plan/generate",
      method: "GET",
      responseType: "arraybuffer",
      timeout,
      success: (res) => {
        common_vendor.index.__f__("log", "at api/acceptance.js:558", "监测方案下载响应:", res);
        if (res.statusCode === 200 && res.data) {
          if (res.data instanceof ArrayBuffer && res.data.byteLength > 0) {
            resolve(res.data);
          } else if (typeof res.data === "string" && res.data.length > 0) {
            common_vendor.index.showToast({ title: "文件格式错误", icon: "none" });
            reject(new Error("文件格式错误"));
          } else {
            reject(new Error("空文件"));
          }
        } else {
          reject(new Error("生成失败"));
        }
      },
      fail: (error) => {
        reject(new Error(error.errMsg || "网络请求失败"));
      }
    });
    setTimeout(() => {
      requestTask.abort();
      reject(new Error("请求超时，监测方案生成时间较长，请稍后重试"));
    }, timeout);
  });
}
exports.deleteFile = deleteFile;
exports.downloadMonitorPlan = downloadMonitorPlan;
exports.downloadSignboardWord = downloadSignboardWord;
exports.fetchUploadedFiles = fetchUploadedFiles;
exports.runTask = runTask;
exports.transformExtractResult = transformExtractResult;
exports.uploadFileToBackend = uploadFileToBackend;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/acceptance.js.map
