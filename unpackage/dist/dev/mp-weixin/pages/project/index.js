"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_navTitle = require("../../stores/navTitle.js");
const api_project = require("../../api/project.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_uni_icons + AppLayout)();
}
const AppLayout = () => "../../components/layout/AppLayout.js";
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const navTitle = stores_navTitle.navTitleStore();
    common_vendor.onShow(() => navTitle.setTitle("项目管理"));
    const projects = common_vendor.ref([]);
    const activeProjectId = common_vendor.ref(null);
    const activeProject = common_vendor.ref(null);
    const documents = common_vendor.ref([]);
    const showAddProjectModal = common_vendor.ref(false);
    const showEditProjectModal = common_vendor.ref(false);
    const showUploadModal = common_vendor.ref(false);
    const newProjectForm = common_vendor.reactive({
      name: "",
      description: "",
      notes: "",
      member_ids: []
    });
    const editProjectForm = common_vendor.reactive({
      id: null,
      name: "",
      description: "",
      notes: "",
      member_ids: []
    });
    function quickAction(action) {
      switch (action) {
        case "viewReports":
          common_vendor.index.navigateTo({ url: "/pages/reports/acceptance/index" });
          break;
      }
    }
    const selectedFile = common_vendor.ref(null);
    const uploadProgress = common_vendor.ref(0);
    const isDragging = common_vendor.ref(false);
    const selectedFiles = common_vendor.ref([]);
    const batchUploading = common_vendor.ref(false);
    const batchProgress = common_vendor.ref(0);
    const batchTaskId = common_vendor.ref(null);
    const batchCurrent = common_vendor.ref(0);
    const batchTotal = common_vendor.ref(0);
    const batchMessage = common_vendor.ref("");
    const showUploadProgress = common_vendor.ref(false);
    let pollTimer = null;
    const filteredProjects = common_vendor.computed(() => {
      return projects.value.filter((project) => !project.is_deleted);
    });
    const projectTotal = common_vendor.ref("");
    const loadProjects = async () => {
      try {
        const response = await api_project.getProjects();
        projects.value = response;
        const total = response.length;
        common_vendor.index.setStorageSync("project_total_count", total);
        projectTotal.value = total;
        if (response.length > 0 && !activeProjectId.value) {
          await switchProject(response[0].id);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/project/index.vue:418", "加载项目列表失败:", error);
        common_vendor.index.showToast({
          title: "加载项目列表失败",
          icon: "error"
        });
      }
    };
    const loadProjectDetail = async (projectId) => {
      try {
        const response = await api_project.getProjectDetail(projectId);
        activeProject.value = response;
        await loadProjectDocuments(projectId);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/project/index.vue:435", "加载项目详情失败:", error);
        common_vendor.index.showToast({
          title: "加载项目详情失败",
          icon: "error"
        });
      }
    };
    const loadProjectDocuments = async (projectId) => {
      try {
        const response = await api_project.getProjectDocuments(projectId);
        documents.value = response.documents || [];
        if (activeProject.value) {
          activeProject.value.documents = documents.value;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/project/index.vue:455", "加载项目文档失败:", error);
      }
    };
    const switchProject = async (projectId) => {
      activeProjectId.value = projectId;
      await loadProjectDetail(projectId);
    };
    const addProject = () => {
      Object.assign(newProjectForm, {
        name: "",
        description: "",
        notes: "",
        member_ids: []
      });
      showAddProjectModal.value = true;
    };
    const confirmAddProject = async () => {
      try {
        if (!newProjectForm.name.trim()) {
          common_vendor.index.showToast({
            title: "请输入项目名称",
            icon: "error"
          });
          return;
        }
        const projectData = {
          name: newProjectForm.name.trim(),
          description: newProjectForm.description.trim(),
          notes: newProjectForm.notes.trim(),
          member_ids: newProjectForm.member_ids
        };
        const response = await api_project.createProjects(projectData);
        common_vendor.index.showToast({
          title: "项目创建成功",
          icon: "success"
        });
        closeAddProjectModal();
        await loadProjects();
        await switchProject(response.id);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/project/index.vue:512", "创建项目失败:", error);
        common_vendor.index.showToast({
          title: "创建项目失败",
          icon: "error"
        });
      }
    };
    const closeAddProjectModal = () => {
      showAddProjectModal.value = false;
    };
    const editProject = async (projectId) => {
      try {
        const project = projects.value.find((p) => p.id === projectId);
        if (!project)
          return;
        Object.assign(editProjectForm, {
          id: project.id,
          name: project.name,
          description: project.description || "",
          notes: project.notes || "",
          member_ids: []
        });
        showEditProjectModal.value = true;
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/project/index.vue:541", "编辑项目失败:", error);
        common_vendor.index.showToast({
          title: "编辑项目失败",
          icon: "error"
        });
      }
    };
    const confirmEditProject = async () => {
      try {
        if (!editProjectForm.name.trim()) {
          common_vendor.index.showToast({
            title: "请输入项目名称",
            icon: "error"
          });
          return;
        }
        const updateData = {
          name: editProjectForm.name.trim(),
          description: editProjectForm.description.trim(),
          notes: editProjectForm.notes.trim()
        };
        await api_project.updateProject(editProjectForm.id, updateData);
        common_vendor.index.showToast({
          title: "项目更新成功",
          icon: "success"
        });
        closeEditProjectModal();
        await loadProjects();
        await loadProjectDetail(editProjectForm.id);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/project/index.vue:580", "更新项目失败:", error);
        common_vendor.index.showToast({
          title: "更新项目失败",
          icon: "error"
        });
      }
    };
    const closeEditProjectModal = () => {
      showEditProjectModal.value = false;
    };
    const delProject = async (projectId) => {
      try {
        common_vendor.index.showModal({
          title: "确认删除",
          content: "确定要删除这个项目吗？删除后30天内可以恢复。",
          success: async (res) => {
            if (res.confirm) {
              await api_project.deleteProject(projectId);
              common_vendor.index.showToast({
                title: "项目删除成功",
                icon: "success"
              });
              await loadProjects();
              if (activeProjectId.value === projectId) {
                activeProjectId.value = null;
                activeProject.value = null;
                documents.value = [];
              }
            }
          }
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/project/index.vue:621", "删除项目失败:", error);
        common_vendor.index.showToast({
          title: "删除项目失败",
          icon: "error"
        });
      }
    };
    const uploadFile = () => {
      if (!activeProjectId.value) {
        common_vendor.index.showToast({
          title: "请先选择项目",
          icon: "error"
        });
        return;
      }
      selectedFile.value = null;
      selectedFiles.value = [];
      uploadProgress.value = 0;
      isDragging.value = false;
      showUploadModal.value = true;
    };
    const chooseFiles = () => {
      chooseFilesWechat();
    };
    const chooseFilesWechat = () => {
      common_vendor.index.chooseMessageFile({
        count: 9,
        type: "all",
        extension: [
          ".pdf",
          ".doc",
          ".docx",
          ".xls",
          ".xlsx",
          ".ppt",
          ".pptx",
          ".md",
          ".txt",
          ".jpg",
          ".jpeg",
          ".png"
        ],
        success: (res) => {
          const files = res.tempFiles.map((file) => ({
            name: file.name,
            size: file.size,
            path: file.path,
            type: file.name.split(".").pop().toLowerCase(),
            file
          }));
          handleSelectedFiles(files);
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/project/index.vue:702", "选择文件失败:", err);
        }
      });
    };
    const handleSelectedFiles = (files) => {
      if (!files || files.length === 0)
        return;
      const currentCount = selectedFiles.value.length;
      const newCount = files.length;
      const totalCount = currentCount + newCount;
      if (totalCount > 50) {
        common_vendor.index.showToast({
          title: `最多选择50个文件，当前已选${currentCount}个`,
          icon: "none",
          duration: 2e3
        });
        return;
      }
      const maxSize = 100 * 1024 * 1024;
      const invalidFiles = files.filter((f) => f.size > maxSize);
      if (invalidFiles.length > 0) {
        common_vendor.index.showToast({
          title: `有${invalidFiles.length}个文件超过100MB`,
          icon: "none",
          duration: 2e3
        });
        return;
      }
      let newFiles = [];
      newFiles = files;
      const allFiles = [...selectedFiles.value, ...newFiles];
      const uniqueFiles = allFiles.filter(
        (file, index, self) => index === self.findIndex(
          (f) => f.name === file.name && f.size === file.size
        )
      );
      const duplicateCount = allFiles.length - uniqueFiles.length;
      if (duplicateCount > 0) {
        common_vendor.index.showToast({
          title: `已过滤${duplicateCount}个重复文件`,
          icon: "none",
          duration: 1500
        });
      }
      selectedFiles.value = uniqueFiles;
      common_vendor.index.__f__("log", "at pages/project/index.vue:777", "已选择文件:", selectedFiles.value.length, "个");
    };
    const removeFile = (index) => {
      selectedFiles.value.splice(index, 1);
      common_vendor.index.showToast({
        title: "已移除",
        icon: "success",
        duration: 1e3
      });
    };
    const clearAllFiles = () => {
      if (selectedFiles.value.length === 0)
        return;
      common_vendor.index.showModal({
        title: "确认清空",
        content: `确定要清空所有已选文件吗？（共${selectedFiles.value.length}个）`,
        success: (res) => {
          if (res.confirm) {
            selectedFiles.value = [];
            common_vendor.index.showToast({
              title: "已清空",
              icon: "success",
              duration: 1e3
            });
          }
        }
      });
    };
    const confirmUpload = async () => {
      if (selectedFiles.value.length === 0) {
        common_vendor.index.showToast({
          title: "请先选择文件",
          icon: "none"
        });
        return;
      }
      const filesToUpload = [...selectedFiles.value];
      const totalFiles = filesToUpload.length;
      showUploadModal.value = false;
      selectedFile.value = null;
      selectedFiles.value = [];
      uploadProgress.value = 0;
      if (totalFiles === 1) {
        common_vendor.index.showLoading({
          title: "上传中...",
          mask: true
        });
        try {
          await api_project.uploadProjectFile(activeProjectId.value, filesToUpload[0]);
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: "上传成功",
            icon: "success",
            duration: 2e3
          });
          await loadProjectDocuments(activeProjectId.value);
        } catch (e) {
          common_vendor.index.hideLoading();
          common_vendor.index.showModal({
            title: "上传失败",
            content: e.message || "文件上传失败，请重试",
            showCancel: false
          });
        }
        return;
      }
      showUploadProgress.value = true;
      batchUploading.value = true;
      batchProgress.value = 0;
      batchCurrent.value = 0;
      batchTotal.value = totalFiles;
      batchMessage.value = "准备上传...";
      try {
        const result = await api_project.batchUploadProjectFiles(activeProjectId.value, filesToUpload);
        batchTaskId.value = result.task_id;
        batchMessage.value = "正在处理文件...";
        startPollingTaskStatus();
      } catch (e) {
        batchUploading.value = false;
        showUploadProgress.value = false;
        common_vendor.index.showModal({
          title: "上传失败",
          content: e.message || "批量上传失败，请重试",
          showCancel: false
        });
      }
    };
    const startPollingTaskStatus = () => {
      if (pollTimer) {
        clearInterval(pollTimer);
      }
      pollTimer = setInterval(async () => {
        try {
          const status = await api_project.getTaskStatus(batchTaskId.value);
          batchProgress.value = status.progress;
          batchCurrent.value = status.current;
          batchTotal.value = status.total;
          batchMessage.value = status.message;
          if (status.status === "success" || status.status === "failed") {
            stopPollingTaskStatus();
            batchUploading.value = false;
            await loadProjectDocuments(activeProjectId.value);
            if (status.status === "success") {
              const successCount = status.success_count || 0;
              const failedCount = status.failed_count || 0;
              const total = status.total || 0;
              common_vendor.index.__f__("log", "at pages/project/index.vue:941", "成功数量:", successCount, "失败数量:", failedCount, "总数:", total);
              let content = "";
              if (failedCount === 0) {
                content = `全部上传成功！共 ${successCount} 个文件`;
              } else {
                content = `上传完成！
成功：${successCount} 个
失败：${failedCount} 个`;
                if (status.failed_files && status.failed_files.length > 0) {
                  content += `

失败文件：
${status.failed_files.slice(0, 3).join("\n")}`;
                  if (status.failed_files.length > 3) {
                    content += `
...等${status.failed_files.length}个文件`;
                  }
                }
              }
              common_vendor.index.showModal({
                title: "上传结果",
                content,
                showCancel: false,
                confirmText: "知道了"
              });
            } else {
              common_vendor.index.showModal({
                title: "上传失败",
                content: status.message || "文件上传失败，请重试",
                showCancel: false
              });
            }
            setTimeout(() => {
              showUploadProgress.value = false;
            }, 1e3);
          }
        } catch (e) {
          common_vendor.index.__f__("error", "at pages/project/index.vue:976", "轮询任务状态失败:", e);
          stopPollingTaskStatus();
          batchUploading.value = false;
          showUploadProgress.value = false;
          common_vendor.index.showModal({
            title: "错误",
            content: "查询上传状态失败，请刷新页面查看结果",
            showCancel: false
          });
        }
      }, 3e3);
    };
    const stopPollingTaskStatus = () => {
      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
    };
    const closeUploadModal = () => {
      showUploadModal.value = false;
      selectedFile.value = null;
      selectedFiles.value = [];
      uploadProgress.value = 0;
    };
    const closeUploadProgress = () => {
      if (batchUploading.value) {
        common_vendor.index.showToast({
          title: "文件上传中，请稍候...",
          icon: "none"
        });
        return;
      }
      stopPollingTaskStatus();
      showUploadProgress.value = false;
      batchProgress.value = 0;
      batchTaskId.value = null;
      batchCurrent.value = 0;
      batchTotal.value = 0;
      batchMessage.value = "";
    };
    const downloadDocument = async (doc) => {
      common_vendor.index.showLoading({
        title: "下载中...",
        mask: true
      });
      try {
        const tempFilePath = await api_project.downloadProjectFile(activeProjectId.value, doc.document_id);
        common_vendor.index.hideLoading();
        common_vendor.index.openDocument({
          filePath: tempFilePath,
          showMenu: true,
          fileType: doc.file_extension.replace(".", ""),
          success: () => {
            common_vendor.index.showToast({
              title: "打开成功",
              icon: "success"
            });
          },
          fail: (err) => {
            common_vendor.index.__f__("log", "at pages/project/index.vue:1074", "打开文档失败:", err);
            common_vendor.index.showModal({
              title: "提示",
              content: "文件已下载，但当前文件类型不支持预览。文件已保存到微信文件中。",
              showCancel: false
            });
          }
        });
      } catch (e) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "下载失败",
          icon: "error"
        });
      }
    };
    const deleteDocument = async (documentId) => {
      common_vendor.index.showModal({
        title: "确认删除",
        content: "删除后 30 天内可恢复",
        success: async (res) => {
          if (!res.confirm)
            return;
          try {
            await api_project.removeProjectFile(activeProjectId.value, documentId);
            common_vendor.index.showToast({
              title: "已删除",
              icon: "success"
            });
            await loadProjectDocuments(activeProjectId.value);
          } catch (e) {
            common_vendor.index.showToast({
              title: "删除失败",
              icon: "error"
            });
          }
        }
      });
    };
    const getDocumentIcon = (ext) => {
      const map = {
        ".pdf": "/static/fileType/pdf.png",
        ".doc": "/static/fileType/word.png",
        ".docx": "/static/fileType/word.png",
        ".xls": "/static/fileType/excel.png",
        ".xlsx": "/static/fileType/excel.png",
        ".png": "/static/fileType/picture.png",
        ".jpg": "/static/fileType/picture.png",
        ".jpeg": "/static/fileType/picture.png",
        ".md": "/static/fileType/md.png",
        ".txt": "/static/fileType/txt.png"
      };
      return map[ext.toLowerCase()] || "/static/fileType/file.png";
    };
    const fmtSize = (b) => {
      if (!b)
        return "0 B";
      const k = 1024;
      const units = ["B", "KB", "MB", "GB"];
      let i = 0;
      while (b >= k && i < units.length - 1) {
        b /= k;
        i++;
      }
      return `${b.toFixed(i ? 1 : 0)} ${units[i]}`;
    };
    common_vendor.onMounted(() => {
      loadProjects();
    });
    return (_ctx, _cache) => {
      var _a;
      return common_vendor.e({
        a: common_vendor.p({
          type: "plus",
          size: "16",
          color: "#ffffff"
        }),
        b: common_vendor.o(addProject),
        c: common_vendor.f(filteredProjects.value, (project, k0, i0) => {
          return {
            a: "47879d53-2-" + i0 + ",47879d53-0",
            b: common_vendor.t(project.name),
            c: common_vendor.t(project.description),
            d: common_vendor.t(project.notes),
            e: "47879d53-3-" + i0 + ",47879d53-0",
            f: common_vendor.t(project.owner.username),
            g: "47879d53-4-" + i0 + ",47879d53-0",
            h: common_vendor.t(project.created_at.slice(0, 10)),
            i: "47879d53-5-" + i0 + ",47879d53-0",
            j: common_vendor.o(() => editProject(project.id), project.id),
            k: "47879d53-6-" + i0 + ",47879d53-0",
            l: common_vendor.o(() => delProject(project.id), project.id),
            m: project.id,
            n: project.id === activeProjectId.value ? 1 : "",
            o: common_vendor.o(() => switchProject(project.id), project.id)
          };
        }),
        d: common_vendor.p({
          type: "list",
          size: "20",
          color: "#43A761"
        }),
        e: common_vendor.p({
          type: "person",
          size: "14",
          color: "#94a3b8"
        }),
        f: common_vendor.p({
          type: "calendar",
          size: "14",
          color: "#94a3b8"
        }),
        g: common_vendor.p({
          type: "compose",
          size: "16",
          color: "#64748b"
        }),
        h: common_vendor.p({
          type: "trash",
          size: "16",
          color: "#ef4444"
        }),
        i: filteredProjects.value.length === 0
      }, filteredProjects.value.length === 0 ? {
        j: common_vendor.p({
          type: "folder",
          size: "60",
          color: "#cbd5e1"
        })
      } : {}, {
        k: common_vendor.p({
          type: "cloud-upload",
          size: "16",
          color: "#ffffff"
        }),
        l: common_vendor.o(uploadFile),
        m: !activeProject.value,
        n: common_vendor.p({
          type: "arrow-right",
          size: "16",
          color: "#ffffff"
        }),
        o: common_vendor.o(($event) => quickAction("viewReports")),
        p: !activeProject.value,
        q: activeProject.value
      }, activeProject.value ? common_vendor.e({
        r: common_vendor.p({
          type: "document",
          size: "18",
          color: "#8b5cf6"
        }),
        s: common_vendor.t(((_a = activeProject.value.documents) == null ? void 0 : _a.length) || 0),
        t: activeProject.value.documents && activeProject.value.documents.length > 0
      }, activeProject.value.documents && activeProject.value.documents.length > 0 ? {
        v: common_vendor.f(activeProject.value.documents, (document, k0, i0) => {
          return {
            a: getDocumentIcon(document.file_extension),
            b: common_vendor.t(document.filename),
            c: common_vendor.t(fmtSize(document.size_bytes)),
            d: common_vendor.t(document.updated_at.slice(0, 10)),
            e: "47879d53-11-" + i0 + ",47879d53-0",
            f: common_vendor.o(() => downloadDocument(document), document.id),
            g: "47879d53-12-" + i0 + ",47879d53-0",
            h: common_vendor.o(() => deleteDocument(document.document_id), document.id),
            i: document.id
          };
        }),
        w: common_vendor.p({
          type: "download",
          size: "16",
          color: "#64748b"
        }),
        x: common_vendor.p({
          type: "trash",
          size: "16",
          color: "#ef4444"
        })
      } : {
        y: common_vendor.p({
          type: "document",
          size: "32",
          color: "#cbd5e1"
        })
      }) : {
        z: common_vendor.p({
          type: "folder",
          size: "60",
          color: "#cbd5e1"
        })
      }, {
        A: showAddProjectModal.value
      }, showAddProjectModal.value ? {
        B: common_vendor.o(closeAddProjectModal),
        C: common_vendor.p({
          type: "close",
          size: "30",
          color: "#64748b"
        }),
        D: newProjectForm.name,
        E: common_vendor.o(($event) => newProjectForm.name = $event.detail.value),
        F: newProjectForm.description,
        G: common_vendor.o(($event) => newProjectForm.description = $event.detail.value),
        H: newProjectForm.notes,
        I: common_vendor.o(($event) => newProjectForm.notes = $event.detail.value),
        J: newProjectForm.name,
        K: common_vendor.o(($event) => newProjectForm.name = $event.detail.value),
        L: common_vendor.o(closeAddProjectModal),
        M: common_vendor.o(confirmAddProject)
      } : {}, {
        N: showEditProjectModal.value
      }, showEditProjectModal.value ? {
        O: common_vendor.o(closeEditProjectModal),
        P: common_vendor.p({
          type: "close",
          size: "30",
          color: "#64748b"
        }),
        Q: editProjectForm.name,
        R: common_vendor.o(($event) => editProjectForm.name = $event.detail.value),
        S: editProjectForm.description,
        T: common_vendor.o(($event) => editProjectForm.description = $event.detail.value),
        U: editProjectForm.notes,
        V: common_vendor.o(($event) => editProjectForm.notes = $event.detail.value),
        W: common_vendor.o(closeEditProjectModal),
        X: common_vendor.o(confirmEditProject)
      } : {}, {
        Y: showUploadModal.value
      }, showUploadModal.value ? common_vendor.e({
        Z: common_vendor.o(closeUploadModal),
        aa: common_vendor.p({
          type: "close",
          size: "30",
          color: "#64748b"
        }),
        ab: common_vendor.p({
          type: "cloud-upload",
          size: "48",
          color: "#3b82f6"
        }),
        ac: common_vendor.o(chooseFiles),
        ad: selectedFiles.value.length > 0
      }, selectedFiles.value.length > 0 ? {
        ae: common_vendor.t(selectedFiles.value.length),
        af: common_vendor.t(fmtSize(selectedFiles.value.reduce((sum, f) => sum + f.size, 0))),
        ag: common_vendor.p({
          type: "trash",
          size: "14",
          color: "#ef4444"
        }),
        ah: common_vendor.o(clearAllFiles),
        ai: common_vendor.f(selectedFiles.value, (file, index, i0) => {
          return {
            a: "47879d53-20-" + i0 + ",47879d53-0",
            b: common_vendor.t(file.name),
            c: common_vendor.t(fmtSize(file.size)),
            d: "47879d53-21-" + i0 + ",47879d53-0",
            e: common_vendor.o(($event) => removeFile(index), index),
            f: index
          };
        }),
        aj: common_vendor.p({
          type: "document",
          size: "16",
          color: "#3b82f6"
        }),
        ak: common_vendor.p({
          type: "close",
          size: "14",
          color: "#94a3b8"
        })
      } : {}, {
        al: common_vendor.o(closeUploadModal),
        am: common_vendor.t(selectedFiles.value.length > 0 ? `（${selectedFiles.value.length}个文件）` : ""),
        an: common_vendor.o(confirmUpload),
        ao: selectedFiles.value.length === 0
      }) : {}, {
        ap: showUploadProgress.value
      }, showUploadProgress.value ? common_vendor.e({
        aq: !batchUploading.value
      }, !batchUploading.value ? {
        ar: common_vendor.o(closeUploadProgress),
        as: common_vendor.p({
          type: "close",
          size: "20",
          color: "#64748b"
        })
      } : {}, {
        at: common_vendor.t(batchMessage.value),
        av: common_vendor.t(batchCurrent.value),
        aw: common_vendor.t(batchTotal.value),
        ax: batchProgress.value + "%",
        ay: common_vendor.t(batchProgress.value)
      }) : {}, {
        az: common_vendor.p({
          current: "pages/projects/index"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-47879d53"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/project/index.js.map
