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
    const selectedFile = common_vendor.ref(null);
    const uploadProgress = common_vendor.ref(0);
    const filteredProjects = common_vendor.computed(() => {
      return projects.value.filter((project) => !project.is_deleted);
    });
    const loadProjects = async () => {
      try {
        const response = await api_project.getProjects();
        projects.value = response;
        if (response.length > 0 && !activeProjectId.value) {
          await switchProject(response[0].id);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/project/index.vue:329", "加载项目列表失败:", error);
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
        common_vendor.index.__f__("error", "at pages/project/index.vue:346", "加载项目详情失败:", error);
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
        common_vendor.index.__f__("error", "at pages/project/index.vue:366", "加载项目文档失败:", error);
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
        common_vendor.index.__f__("error", "at pages/project/index.vue:423", "创建项目失败:", error);
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
        common_vendor.index.__f__("error", "at pages/project/index.vue:452", "编辑项目失败:", error);
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
        common_vendor.index.__f__("error", "at pages/project/index.vue:491", "更新项目失败:", error);
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
        common_vendor.index.__f__("error", "at pages/project/index.vue:532", "删除项目失败:", error);
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
      uploadProgress.value = 0;
      showUploadModal.value = true;
    };
    const chooseFile = () => {
      api_project.pickProjectFile().then((file) => {
        if (file)
          selectedFile.value = file;
      }).catch(() => {
      });
    };
    const chooseImage = () => {
      api_project.pickProjectImage().then((file) => {
        if (file)
          selectedFile.value = file;
      }).catch(() => {
      });
    };
    const confirmUpload = async () => {
      if (!selectedFile.value)
        return;
      common_vendor.index.showLoading({
        title: "上传中...",
        mask: true
      });
      try {
        await api_project.uploadProjectFile(activeProjectId.value, selectedFile.value);
        common_vendor.index.showToast({
          title: "上传成功",
          icon: "success"
        });
        closeUploadModal();
        await loadProjectDocuments(activeProjectId.value);
      } catch (e) {
        common_vendor.index.showToast({
          title: e.message || "上传失败",
          icon: "error"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const closeUploadModal = () => {
      showUploadModal.value = false;
      selectedFile.value = null;
      uploadProgress.value = 0;
    };
    const downloadDocument = async (doc) => {
      common_vendor.index.showLoading({
        title: "准备下载...",
        mask: true
      });
      try {
        const blob = await api_project.downloadProjectFile(activeProjectId.value, doc.document_id);
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = doc.name;
        link.click();
        URL.revokeObjectURL(url);
        common_vendor.index.showToast({
          title: "下载成功",
          icon: "success"
        });
      } catch (e) {
        common_vendor.index.showToast({
          title: "下载失败",
          icon: "error"
        });
      } finally {
        common_vendor.index.hideLoading();
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
        ".jpg": "/static/fileType/image.png",
        ".jpeg": "/static/fileType/image.png",
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
        n: activeProject.value
      }, activeProject.value ? common_vendor.e({
        o: common_vendor.p({
          type: "document",
          size: "18",
          color: "#8b5cf6"
        }),
        p: common_vendor.t(((_a = activeProject.value.documents) == null ? void 0 : _a.length) || 0),
        q: activeProject.value.documents && activeProject.value.documents.length > 0
      }, activeProject.value.documents && activeProject.value.documents.length > 0 ? {
        r: common_vendor.f(activeProject.value.documents, (document2, k0, i0) => {
          return {
            a: getDocumentIcon(document2.file_extension),
            b: common_vendor.t(document2.filename),
            c: common_vendor.t(fmtSize(document2.size_bytes)),
            d: common_vendor.t(document2.updated_at.slice(0, 10)),
            e: "47879d53-10-" + i0 + ",47879d53-0",
            f: common_vendor.o(() => downloadDocument(document2), document2.id),
            g: "47879d53-11-" + i0 + ",47879d53-0",
            h: common_vendor.o(() => deleteDocument(document2.id), document2.id),
            i: document2.id
          };
        }),
        s: common_vendor.p({
          type: "download",
          size: "16",
          color: "#64748b"
        }),
        t: common_vendor.p({
          type: "trash",
          size: "16",
          color: "#ef4444"
        })
      } : {
        v: common_vendor.p({
          type: "document",
          size: "32",
          color: "#cbd5e1"
        })
      }) : {
        w: common_vendor.p({
          type: "folder",
          size: "60",
          color: "#cbd5e1"
        })
      }, {
        x: showAddProjectModal.value
      }, showAddProjectModal.value ? {
        y: common_vendor.o(closeAddProjectModal),
        z: common_vendor.p({
          type: "close",
          size: "30",
          color: "#64748b"
        }),
        A: newProjectForm.name,
        B: common_vendor.o(($event) => newProjectForm.name = $event.detail.value),
        C: newProjectForm.description,
        D: common_vendor.o(($event) => newProjectForm.description = $event.detail.value),
        E: newProjectForm.notes,
        F: common_vendor.o(($event) => newProjectForm.notes = $event.detail.value),
        G: newProjectForm.name,
        H: common_vendor.o(($event) => newProjectForm.name = $event.detail.value),
        I: common_vendor.o(closeAddProjectModal),
        J: common_vendor.o(confirmAddProject)
      } : {}, {
        K: showEditProjectModal.value
      }, showEditProjectModal.value ? {
        L: common_vendor.o(closeEditProjectModal),
        M: common_vendor.p({
          type: "close",
          size: "30",
          color: "#64748b"
        }),
        N: editProjectForm.name,
        O: common_vendor.o(($event) => editProjectForm.name = $event.detail.value),
        P: editProjectForm.description,
        Q: common_vendor.o(($event) => editProjectForm.description = $event.detail.value),
        R: editProjectForm.notes,
        S: common_vendor.o(($event) => editProjectForm.notes = $event.detail.value),
        T: common_vendor.o(closeEditProjectModal),
        U: common_vendor.o(confirmEditProject)
      } : {}, {
        V: showUploadModal.value
      }, showUploadModal.value ? common_vendor.e({
        W: common_vendor.o(closeUploadModal),
        X: common_vendor.p({
          type: "close",
          size: "30",
          color: "#64748b"
        }),
        Y: common_vendor.p({
          type: "cloud-upload",
          size: "48",
          color: "#3b82f6"
        }),
        Z: common_vendor.o(chooseFile),
        aa: common_vendor.p({
          type: "image",
          size: "48",
          color: "#10b981"
        }),
        ab: common_vendor.o(chooseImage),
        ac: selectedFile.value
      }, selectedFile.value ? {
        ad: common_vendor.p({
          type: "document",
          size: "20",
          color: "#3b82f6"
        }),
        ae: common_vendor.t(selectedFile.value.name),
        af: common_vendor.t(fmtSize(selectedFile.value.size))
      } : {}, {
        ag: common_vendor.o(closeUploadModal),
        ah: common_vendor.o(confirmUpload),
        ai: !selectedFile.value
      }) : {}, {
        aj: common_vendor.p({
          current: "pages/projects/index"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-47879d53"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/project/index.js.map
