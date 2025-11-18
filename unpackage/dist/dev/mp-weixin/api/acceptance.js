"use strict";
const common_vendor = require("../common/vendor.js");
const utils_config = require("../utils/config.js");
const utils_request = require("../utils/request.js");
async function uploadFileToBackend(file) {
  return new Promise((resolve, reject) => {
    const filePath = file.url || file.path || file.tempFilePath;
    file.name || "环评报告.pdf";
    if (!filePath) {
      reject(new Error("文件路径无效"));
      return;
    }
    common_vendor.index.uploadFile({
      url: utils_config.BASE_URL + "/api/v1/documents/upload",
      filePath,
      name: "file",
      formData: {
        category: "eia_report"
        // 标记为环评报告
      },
      success: (res) => {
        try {
          const data = JSON.parse(res.data);
          if (res.statusCode === 200) {
            resolve({
              success: true,
              document_id: data.document_id,
              filename: data.filename,
              size_bytes: data.size_bytes,
              upload_time: data.upload_time
            });
          } else {
            reject(new Error(data.detail || "上传失败"));
          }
        } catch (e) {
          reject(new Error("解析响应失败"));
        }
      },
      fail: (error) => {
        reject(new Error("网络请求失败"));
      }
    });
  });
}
async function rebuildIndex(options = {}) {
  const {
    hideLoading = false
  } = options;
  const TEST_SOURCE_DIR = "./storage/project_completion_and_acceptance/uploads";
  return utils_request.request.post("/api/v1/index/build", {
    source_dir: TEST_SOURCE_DIR,
    split_by_heading: true
  }, {
    hideLoading,
    timeout: 9e5
    // 增加：15分钟超时（900秒）
  });
}
async function runTask(taskName, options = {}) {
  const {
    hideLoading = false,
    timeout = 6e5
    // 默认10分钟
  } = options;
  try {
    const result = await utils_request.request.get(`/api/v1/tasks/${taskName}/run`, {
      timeout,
      hideLoading
    });
    if (!result || result.status !== "success") {
      throw new Error((result == null ? void 0 : result.message) || "任务执行失败");
    }
    if (!result.result || Object.keys(result.result).length === 0) {
      throw new Error("未提取到任何项目信息，请检查文件内容是否完整");
    }
    return result;
  } catch (error) {
    if (error.code === "NETWORK_ERROR" && error.message.includes("timeout")) {
      throw new Error("提取超时：文档过大或网络不稳定，请稍后重试");
    } else if (error.code === "HTTP_ERROR" && error.message.includes("404")) {
      throw new Error(`任务 ${taskName} 不存在，请联系管理员配置`);
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
    // 污染物
    "生产工艺": {
      id: "production_process",
      label: "生产工艺"
    },
    "噪声执行标准": {
      id: "noise_standard",
      label: "噪声标准"
    },
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
    "production_process",
    // 生产工艺
    "noise_standard",
    // 噪声执行标准
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
    return value.length > 0 ? JSON.stringify(value, null, 2) : "-";
  }
  if (typeof value === "object" && value !== null) {
    return JSON.stringify(value, null, 2);
  }
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    return value.trim() || "-";
  }
  return value || "";
}
function downloadSignboardWord(signboard) {
  const payload = {
    sections: signboard.sections.map((sec) => ({
      block: sec.block,
      items: sec.items.map((it) => ({ title: it.title, content: it.content }))
    }))
  };
  return new Promise((resolve, reject) => {
    common_vendor.index.request({
      url: utils_config.BASE_URL + "/api/v1/download/signageborad",
      method: "POST",
      data: payload,
      header: { "Content-Type": "application/json" },
      responseType: "arraybuffer",
      success: (res) => {
        if (res.statusCode === 200 && res.data && res.data.byteLength > 0) {
          resolve(res.data);
        } else {
          reject(new Error("空文件"));
        }
      },
      fail: reject
    });
  });
}
exports.downloadSignboardWord = downloadSignboardWord;
exports.rebuildIndex = rebuildIndex;
exports.runTask = runTask;
exports.transformExtractResult = transformExtractResult;
exports.uploadFileToBackend = uploadFileToBackend;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/acceptance.js.map
