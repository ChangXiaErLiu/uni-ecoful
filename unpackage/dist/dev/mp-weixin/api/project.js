"use strict";
const common_vendor = require("../common/vendor.js");
const utils_request = require("../utils/request.js");
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
function pickProjectFile() {
  const isMp = () => true;
  let res;
  try {
    if (isMp()) {
      res = common_vendor.wx$1.chooseMessageFile({
        count: 1,
        type: "file"
      });
    }
  } catch (e) {
    return Promise.resolve(null);
  }
  return Promise.resolve(res).then((r) => wrapFile(r.tempFiles[0]));
}
function wrapFile(raw) {
  if (!raw)
    return null;
  const max = 500 * 1024 * 1024;
  if (raw.size > max) {
    common_vendor.index.showToast({ title: "文件不能超过 500 MB", icon: "none" });
    return null;
  }
  return {
    path: raw.path || raw.tempFilePath,
    name: raw.name || "unknown",
    size: raw.size,
    type: getFileExt(raw.name),
    file: raw
  };
}
function pickProjectImage() {
  let res;
  try {
    res = common_vendor.index.chooseImage({
      count: 1
    });
  } catch (e) {
    return Promise.resolve(null);
  }
  return Promise.resolve(res).then((res2) => (res2.tempFiles || [])[0]).then((raw) => {
    if (!raw)
      return null;
    const max = 100 * 1024 * 1024;
    if (raw.size > max) {
      common_vendor.index.showToast({
        title: "图片不能超过 100 MB",
        icon: "none"
      });
      return null;
    }
    return {
      path: raw.path || raw.tempFilePath,
      name: raw.name || "image.jpg",
      size: raw.size,
      type: getFileExt(raw.name),
      file: raw
    };
  }).catch(() => null);
}
function getFileExt(filename) {
  if (!filename)
    return "";
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop().toLowerCase() : "";
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
  return utils_request.request.get(
    `/api/v1/project/projects/${projectId}/documents/${documentId}/download`,
    {
      responseType: "blob"
    }
  );
}
async function removeProjectFile(projectId, documentId) {
  return utils_request.request.delete(
    `/api/v1/project/projects/${projectId}/documents/${documentId}`
  );
}
exports.createProjects = createProjects;
exports.deleteProject = deleteProject;
exports.downloadProjectFile = downloadProjectFile;
exports.getProjectDetail = getProjectDetail;
exports.getProjectDocuments = getProjectDocuments;
exports.getProjects = getProjects;
exports.pickProjectFile = pickProjectFile;
exports.pickProjectImage = pickProjectImage;
exports.removeProjectFile = removeProjectFile;
exports.updateProject = updateProject;
exports.uploadProjectFile = uploadProjectFile;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/project.js.map
