"use strict";
const common_vendor = require("../common/vendor.js");
const utils_request = require("../utils/request.js");
const utils_config = require("../utils/config.js");
function createProjects(data) {
  return utils_request.request.post("/api/v1/project/projects", data);
}
function getProjects() {
  return utils_request.request.get("/api/v1/project/projects");
}
function getProjectDetail(projectId) {
  return utils_request.request.get(`/api/v1/project/projects/${projectId}`);
}
function updateProject(projectId, data) {
  return utils_request.request.patch(`/api/v1/project/projects/${projectId}`, data);
}
function deleteProject(projectId) {
  return utils_request.request.delete(`/api/v1/project/projects/${projectId}`);
}
async function uploadProjectFile(projectId, fileInfo) {
  if (!fileInfo)
    throw new Error("未选择文件");
  {
    return utils_request.request.upload(
      `/api/v1/project/projects/${projectId}/documents/upload`,
      fileInfo.path,
      {
        name: "file",
        formData: {
          filename: fileInfo.name
        },
        hideLoading: true
      }
    );
  }
}
function getProjectDocuments(projectId, params = {}) {
  return utils_request.request.get(`/api/v1/project/projects/${projectId}/documents`, {
    params
  });
}
async function downloadProjectFile(projectId, documentId) {
  {
    const token = common_vendor.index.getStorageSync("token");
    return new Promise((resolve, reject) => {
      common_vendor.index.downloadFile({
        url: `${utils_config.BASE_URL}/api/v1/project/projects/${projectId}/documents/${documentId}/download`,
        header: {
          "Authorization": token ? `Bearer ${token}` : ""
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.tempFilePath);
          } else {
            reject(new Error("下载失败"));
          }
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  }
}
async function removeProjectFile(projectId, documentId) {
  return utils_request.request.delete(
    `/api/v1/project/projects/${projectId}/documents/${documentId}`
  );
}
async function batchUploadProjectFiles(projectId, fileList) {
  throw new Error("小程序暂不支持批量上传，请使用单文件上传");
}
async function getTaskStatus(taskId) {
  return utils_request.request.get(`/api/v1/tasks/${taskId}/status`);
}
exports.batchUploadProjectFiles = batchUploadProjectFiles;
exports.createProjects = createProjects;
exports.deleteProject = deleteProject;
exports.downloadProjectFile = downloadProjectFile;
exports.getProjectDetail = getProjectDetail;
exports.getProjectDocuments = getProjectDocuments;
exports.getProjects = getProjects;
exports.getTaskStatus = getTaskStatus;
exports.removeProjectFile = removeProjectFile;
exports.updateProject = updateProject;
exports.uploadProjectFile = uploadProjectFile;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/project.js.map
