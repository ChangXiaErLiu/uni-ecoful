"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_navTitle = require("../../stores/navTitle.js");
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
    common_vendor.ref({
      totalProjects: 18,
      completedProjects: 6,
      inProgressProjects: 8,
      delayedProjects: 4
    });
    const activeFilter = common_vendor.ref("all");
    const projects = common_vendor.ref([
      {
        id: "project-1",
        name: "废水处理设施升级",
        code: "EP-2024-001",
        description: "升级厂区废水处理系统，提高处理效率",
        fullDescription: "本项目旨在对现有废水处理设施进行技术升级，包括更换老旧设备、优化处理工艺、安装在线监测系统等，确保废水排放达标。",
        type: "water",
        status: "in-progress",
        progress: 65,
        manager: "张三",
        startDate: "2024-01-10",
        deadline: "2024-03-31",
        budget: "¥1,200,000",
        totalTasks: 12,
        completedTasks: 8,
        inProgressTasks: 3,
        pendingTasks: 1,
        tasks: [
          {
            id: "task-1",
            title: "设备采购",
            description: "采购新型废水处理设备",
            status: "completed",
            priority: "high",
            assignee: "李四",
            dueDate: "2024-01-31"
          },
          {
            id: "task-2",
            title: "设备安装",
            description: "安装并调试新设备",
            status: "in-progress",
            priority: "high",
            assignee: "王五",
            dueDate: "2024-02-28"
          },
          {
            id: "task-3",
            title: "员工培训",
            description: "培训操作人员使用新设备",
            status: "pending",
            priority: "medium",
            assignee: "赵六",
            dueDate: "2024-03-15"
          }
        ],
        documents: [
          {
            id: "doc-1",
            name: "项目方案书.pdf",
            type: "pdf",
            size: "2.3 MB",
            uploadDate: "2024-01-08"
          },
          {
            id: "doc-2",
            name: "设备采购清单.xlsx",
            type: "excel",
            size: "856 KB",
            uploadDate: "2024-01-15"
          }
        ]
      },
      {
        id: "project-2",
        name: "危废管理规范化",
        code: "EP-2024-002",
        description: "建立规范的危废管理体系",
        fullDescription: "通过建立完善的危废分类、存储、转移和处理流程，确保企业危废管理符合环保法规要求。",
        type: "waste",
        status: "completed",
        progress: 100,
        manager: "李四",
        startDate: "2023-11-01",
        deadline: "2024-01-15",
        budget: "¥580,000",
        totalTasks: 8,
        completedTasks: 8,
        inProgressTasks: 0,
        pendingTasks: 0,
        tasks: [
          {
            id: "task-4",
            title: "危废仓库改造",
            description: "按照规范改造危废暂存间",
            status: "completed",
            priority: "high",
            assignee: "王五",
            dueDate: "2023-11-30"
          }
        ],
        documents: [
          {
            id: "doc-3",
            name: "危废管理方案.docx",
            type: "word",
            size: "1.8 MB",
            uploadDate: "2023-10-28"
          }
        ]
      },
      {
        id: "project-3",
        name: "废气治理设施维护",
        code: "EP-2024-003",
        description: "定期维护废气处理设备",
        fullDescription: "对厂区所有废气处理设施进行定期检查、维护和保养，确保设备正常运行，废气达标排放。",
        type: "air",
        status: "delayed",
        progress: 40,
        manager: "王五",
        startDate: "2024-01-05",
        deadline: "2024-02-20",
        budget: "¥350,000",
        totalTasks: 6,
        completedTasks: 2,
        inProgressTasks: 2,
        pendingTasks: 2,
        tasks: [
          {
            id: "task-5",
            title: "设备检查",
            description: "全面检查废气处理设备",
            status: "completed",
            priority: "medium",
            assignee: "赵六",
            dueDate: "2024-01-20"
          }
        ],
        documents: []
      },
      {
        id: "project-4",
        name: "环保培训体系建设",
        code: "EP-2024-004",
        description: "建立全员环保培训体系",
        fullDescription: "制定年度环保培训计划，建立培训课程体系，提高全体员工环保意识和操作技能。",
        type: "training",
        status: "in-progress",
        progress: 30,
        manager: "赵六",
        startDate: "2024-02-01",
        deadline: "2024-06-30",
        budget: "¥250,000",
        totalTasks: 10,
        completedTasks: 3,
        inProgressTasks: 2,
        pendingTasks: 5,
        tasks: [
          {
            id: "task-6",
            title: "培训需求调研",
            description: "调研各部门培训需求",
            status: "completed",
            priority: "medium",
            assignee: "张三",
            dueDate: "2024-02-15"
          }
        ],
        documents: []
      }
    ]);
    const activeProjectId = common_vendor.ref("project-1");
    const activeProject = common_vendor.computed(
      () => projects.value.find((project) => project.id === activeProjectId.value)
    );
    const filteredProjects = common_vendor.computed(() => {
      if (activeFilter.value === "all") {
        return projects.value;
      }
      return projects.value.filter((project) => project.status === activeFilter.value);
    });
    const showAddProjectModal = common_vendor.ref(false);
    const showEditProjectModal = common_vendor.ref(false);
    const showUploadModal = common_vendor.ref(false);
    const newProjectForm = common_vendor.ref({
      name: "",
      description: "",
      fullDescription: ""
    });
    const editProjectForm = common_vendor.ref({
      id: "",
      name: "",
      description: "",
      fullDescription: ""
    });
    const selectedFile = common_vendor.ref(null);
    function switchProject(projectId) {
      activeProjectId.value = projectId;
    }
    function createProject() {
      newProjectForm.value = {
        name: "",
        description: "",
        fullDescription: ""
      };
      showAddProjectModal.value = true;
    }
    function editProject(projectId) {
      const project = projects.value.find((p) => p.id === projectId);
      if (project) {
        editProjectForm.value = {
          id: project.id,
          name: project.name,
          description: project.description,
          fullDescription: project.fullDescription
        };
        showEditProjectModal.value = true;
      }
    }
    function deleteProject(projectId) {
      common_vendor.index.showModal({
        title: "确认删除",
        content: "确定要删除这个项目吗？项目相关的所有文件和任务也将被删除，此操作不可恢复。",
        confirmColor: "#ef4444",
        success: (res) => {
          if (res.confirm) {
            const index = projects.value.findIndex((p) => p.id === projectId);
            if (index !== -1) {
              projects.value.splice(index, 1);
              if (activeProjectId.value === projectId && projects.value.length > 0) {
                activeProjectId.value = projects.value[0].id;
              } else if (projects.value.length === 0) {
                activeProjectId.value = null;
              }
              common_vendor.index.showToast({
                title: "项目删除成功",
                icon: "success"
              });
            }
          }
        }
      });
    }
    function confirmAddProject() {
      if (!newProjectForm.value.name.trim()) {
        common_vendor.index.showToast({
          title: "请输入项目名称",
          icon: "none"
        });
        return;
      }
      const newProject = {
        id: "project-" + Date.now(),
        name: newProjectForm.value.name,
        code: "EP-2024-" + (projects.value.length + 1).toString().padStart(3, "0"),
        description: newProjectForm.value.description || "请描述项目内容",
        fullDescription: newProjectForm.value.fullDescription || "请详细描述项目目标、范围和要求",
        type: "general",
        status: "planning",
        progress: 0,
        manager: "当前用户",
        startDate: (/* @__PURE__ */ new Date()).toLocaleDateString("zh-CN"),
        deadline: "待设定",
        budget: "待预算",
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        pendingTasks: 0,
        tasks: [],
        documents: []
      };
      projects.value.unshift(newProject);
      activeProjectId.value = newProject.id;
      closeAddProjectModal();
      common_vendor.index.showToast({
        title: "项目创建成功",
        icon: "success"
      });
    }
    function confirmEditProject() {
      if (!editProjectForm.value.name.trim()) {
        common_vendor.index.showToast({
          title: "请输入项目名称",
          icon: "none"
        });
        return;
      }
      const projectIndex = projects.value.findIndex((p) => p.id === editProjectForm.value.id);
      if (projectIndex !== -1) {
        projects.value[projectIndex].name = editProjectForm.value.name;
        projects.value[projectIndex].description = editProjectForm.value.description;
        projects.value[projectIndex].fullDescription = editProjectForm.value.fullDescription;
        closeEditProjectModal();
        common_vendor.index.showToast({
          title: "项目更新成功",
          icon: "success"
        });
      }
    }
    function closeAddProjectModal() {
      showAddProjectModal.value = false;
    }
    function closeEditProjectModal() {
      showEditProjectModal.value = false;
    }
    function uploadFile() {
      if (!activeProject.value) {
        common_vendor.index.showToast({
          title: "请先选择项目",
          icon: "none"
        });
        return;
      }
      selectedFile.value = null;
      showUploadModal.value = true;
    }
    function chooseFile() {
      common_vendor.index.chooseFile({
        count: 1,
        type: "all",
        success: (res) => {
          selectedFile.value = res.tempFiles[0];
        }
      });
    }
    function confirmUpload() {
      if (!selectedFile.value) {
        common_vendor.index.showToast({
          title: "请选择文件",
          icon: "none"
        });
        return;
      }
      const newDocument = {
        id: "doc-" + Date.now(),
        name: selectedFile.value.name,
        type: getFileType(selectedFile.value.name),
        size: formatFileSize(selectedFile.value.size),
        uploadDate: (/* @__PURE__ */ new Date()).toLocaleDateString("zh-CN")
      };
      if (!activeProject.value.documents) {
        activeProject.value.documents = [];
      }
      activeProject.value.documents.push(newDocument);
      closeUploadModal();
      common_vendor.index.showToast({
        title: "文件上传成功",
        icon: "success"
      });
    }
    function closeUploadModal() {
      showUploadModal.value = false;
      selectedFile.value = null;
    }
    function deleteDocument(documentId) {
      common_vendor.index.showModal({
        title: "确认删除",
        content: "确定要删除这个文件吗？此操作不可恢复。",
        confirmColor: "#ef4444",
        success: (res) => {
          if (res.confirm && activeProject.value && activeProject.value.documents) {
            const docIndex = activeProject.value.documents.findIndex((d) => d.id === documentId);
            if (docIndex !== -1) {
              activeProject.value.documents.splice(docIndex, 1);
              common_vendor.index.showToast({
                title: "文件删除成功",
                icon: "success"
              });
            }
          }
        }
      });
    }
    function getFileType(filename) {
      const ext = filename.split(".").pop().toLowerCase();
      if (["pdf"].includes(ext))
        return "pdf";
      if (["doc", "docx"].includes(ext))
        return "word";
      if (["xls", "xlsx"].includes(ext))
        return "excel";
      if (["jpg", "jpeg", "png", "gif", "bmp"].includes(ext))
        return "image";
      return "document";
    }
    function formatFileSize(bytes) {
      if (bytes === 0)
        return "0 B";
      const k = 1024;
      const sizes = ["B", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    }
    function downloadDocument(document) {
      common_vendor.index.showToast({
        title: `下载文档: ${document.name}`,
        icon: "none"
      });
    }
    function getProjectIcon(type) {
      const iconMap = {
        water: "water",
        waste: "trash",
        air: "cloudy",
        training: "person",
        general: "folder"
      };
      return iconMap[type] || "folder";
    }
    function getProjectColor(status) {
      const colorMap = {
        planning: "#64748b",
        "in-progress": "#3b82f6",
        completed: "#10b981",
        delayed: "#ef4444"
      };
      return colorMap[status] || "#64748b";
    }
    function getProjectTypeText(type) {
      const typeMap = {
        water: "水处理",
        waste: "固废管理",
        air: "废气治理",
        training: "环保培训",
        general: "综合项目"
      };
      return typeMap[type] || "其他";
    }
    function getDocumentIcon(type) {
      const iconMap = {
        pdf: "pdf",
        word: "document",
        excel: "stats-bars",
        image: "image"
      };
      return iconMap[type] || "document";
    }
    return (_ctx, _cache) => {
      var _a;
      return common_vendor.e({
        a: common_vendor.p({
          type: "plus",
          size: "16",
          color: "#ffffff"
        }),
        b: common_vendor.o(createProject),
        c: common_vendor.f(filteredProjects.value, (project, k0, i0) => {
          return {
            a: "47879d53-2-" + i0 + ",47879d53-0",
            b: common_vendor.p({
              type: getProjectIcon(project.type),
              size: "20",
              color: getProjectColor(project.status)
            }),
            c: common_vendor.t(project.name),
            d: common_vendor.t(project.description),
            e: "47879d53-3-" + i0 + ",47879d53-0",
            f: common_vendor.t(project.manager),
            g: "47879d53-4-" + i0 + ",47879d53-0",
            h: common_vendor.t(project.deadline),
            i: "47879d53-5-" + i0 + ",47879d53-0",
            j: common_vendor.o(() => editProject(project.id), project.id),
            k: "47879d53-6-" + i0 + ",47879d53-0",
            l: common_vendor.o(() => deleteProject(project.id), project.id),
            m: project.id,
            n: project.id === activeProjectId.value ? 1 : "",
            o: project.status === "delayed" ? 1 : "",
            p: common_vendor.o(() => switchProject(project.id), project.id)
          };
        }),
        d: common_vendor.p({
          type: "person",
          size: "14",
          color: "#94a3b8"
        }),
        e: common_vendor.p({
          type: "calendar",
          size: "14",
          color: "#94a3b8"
        }),
        f: common_vendor.p({
          type: "compose",
          size: "16",
          color: "#64748b"
        }),
        g: common_vendor.p({
          type: "trash",
          size: "16",
          color: "#ef4444"
        }),
        h: filteredProjects.value.length === 0
      }, filteredProjects.value.length === 0 ? {
        i: common_vendor.p({
          type: "folder",
          size: "60",
          color: "#cbd5e1"
        })
      } : {}, {
        j: common_vendor.p({
          type: "cloud-upload",
          size: "16",
          color: "#ffffff"
        }),
        k: common_vendor.o(uploadFile),
        l: !activeProject.value,
        m: activeProject.value
      }, activeProject.value ? common_vendor.e({
        n: common_vendor.p({
          type: "info",
          size: "18",
          color: "#3b82f6"
        }),
        o: common_vendor.t(activeProject.value.manager),
        p: common_vendor.t(activeProject.value.budget),
        q: common_vendor.t(getProjectTypeText(activeProject.value.type)),
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
            a: "47879d53-11-" + i0 + ",47879d53-0",
            b: common_vendor.p({
              type: getDocumentIcon(document.type),
              size: "20",
              color: "#3b82f6"
            }),
            c: common_vendor.t(document.name),
            d: common_vendor.t(document.size),
            e: common_vendor.t(document.uploadDate),
            f: "47879d53-12-" + i0 + ",47879d53-0",
            g: common_vendor.o(() => downloadDocument(document), document.id),
            h: "47879d53-13-" + i0 + ",47879d53-0",
            i: common_vendor.o(() => deleteDocument(document.id), document.id),
            j: document.id
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
          size: "20",
          color: "#64748b"
        }),
        D: newProjectForm.value.name,
        E: common_vendor.o(($event) => newProjectForm.value.name = $event.detail.value),
        F: newProjectForm.value.description,
        G: common_vendor.o(($event) => newProjectForm.value.description = $event.detail.value),
        H: newProjectForm.value.fullDescription,
        I: common_vendor.o(($event) => newProjectForm.value.fullDescription = $event.detail.value),
        J: common_vendor.o(closeAddProjectModal),
        K: common_vendor.o(confirmAddProject)
      } : {}, {
        L: showEditProjectModal.value
      }, showEditProjectModal.value ? {
        M: common_vendor.o(closeEditProjectModal),
        N: common_vendor.p({
          type: "close",
          size: "20",
          color: "#64748b"
        }),
        O: editProjectForm.value.name,
        P: common_vendor.o(($event) => editProjectForm.value.name = $event.detail.value),
        Q: editProjectForm.value.description,
        R: common_vendor.o(($event) => editProjectForm.value.description = $event.detail.value),
        S: editProjectForm.value.fullDescription,
        T: common_vendor.o(($event) => editProjectForm.value.fullDescription = $event.detail.value),
        U: common_vendor.o(closeEditProjectModal),
        V: common_vendor.o(confirmEditProject)
      } : {}, {
        W: showUploadModal.value
      }, showUploadModal.value ? common_vendor.e({
        X: common_vendor.o(closeUploadModal),
        Y: common_vendor.p({
          type: "close",
          size: "20",
          color: "#64748b"
        }),
        Z: common_vendor.p({
          type: "plus",
          size: "48",
          color: "#3b82f6"
        }),
        aa: common_vendor.o(chooseFile),
        ab: selectedFile.value
      }, selectedFile.value ? {
        ac: common_vendor.p({
          type: "document",
          size: "20",
          color: "#3b82f6"
        }),
        ad: common_vendor.t(selectedFile.value.name),
        ae: common_vendor.t(formatFileSize(selectedFile.value.size))
      } : {}, {
        af: common_vendor.o(closeUploadModal),
        ag: common_vendor.o(confirmUpload),
        ah: !selectedFile.value
      }) : {}, {
        ai: common_vendor.p({
          current: "pages/projects/index"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-47879d53"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/project/index.js.map
