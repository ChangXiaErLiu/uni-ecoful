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
    const stats = common_vendor.ref({
      totalProjects: 18,
      completedProjects: 6,
      inProgressProjects: 8,
      delayedProjects: 4
    });
    const filterTabs = common_vendor.ref([
      { id: "all", name: "全部" },
      { id: "in-progress", name: "进行中" },
      { id: "completed", name: "已完成" },
      { id: "delayed", name: "已延期" }
    ]);
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
    function switchFilter(filterId) {
      activeFilter.value = filterId;
    }
    function switchProject(projectId) {
      activeProjectId.value = projectId;
    }
    function createProject() {
      const newProject = {
        id: "project-new-" + Date.now(),
        name: "新项目",
        code: "EP-2024-NEW",
        description: "请描述项目内容",
        fullDescription: "请详细描述项目目标、范围和要求",
        type: "general",
        status: "planning",
        progress: 0,
        manager: "当前用户",
        startDate: (/* @__PURE__ */ new Date()).toLocaleDateString(),
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
    }
    function editProject(projectId) {
      common_vendor.index.showToast({
        title: "编辑项目功能开发中",
        icon: "none"
      });
    }
    function addTask() {
      if (!activeProject.value)
        return;
      const newTask = {
        id: "task-new-" + Date.now(),
        title: "新任务",
        description: "请描述任务内容",
        status: "pending",
        priority: "medium",
        assignee: "待分配",
        dueDate: "待设定"
      };
      if (!activeProject.value.tasks) {
        activeProject.value.tasks = [];
      }
      activeProject.value.tasks.push(newTask);
      activeProject.value.totalTasks += 1;
      activeProject.value.pendingTasks += 1;
    }
    function editTask(taskId) {
      common_vendor.index.showToast({
        title: "编辑任务功能开发中",
        icon: "none"
      });
    }
    function toggleTask(taskId) {
      const task = activeProject.value.tasks.find((t) => t.id === taskId);
      if (task) {
        const oldStatus = task.status;
        task.status = task.status === "completed" ? "pending" : "completed";
        if (oldStatus === "completed") {
          activeProject.value.completedTasks -= 1;
          if (task.status === "pending") {
            activeProject.value.pendingTasks += 1;
          }
        } else {
          activeProject.value.completedTasks += 1;
          if (oldStatus === "pending") {
            activeProject.value.pendingTasks -= 1;
          } else if (oldStatus === "in-progress") {
            activeProject.value.inProgressTasks -= 1;
          }
        }
        updateProjectProgress();
      }
    }
    function updateProjectProgress() {
      if (!activeProject.value || !activeProject.value.tasks.length)
        return;
      const completedTasks = activeProject.value.tasks.filter((task) => task.status === "completed").length;
      const progress = Math.round(completedTasks / activeProject.value.tasks.length * 100);
      activeProject.value.progress = progress;
    }
    function updateProgress() {
      common_vendor.index.showToast({
        title: "更新进度功能开发中",
        icon: "none"
      });
    }
    function previewDocument(document) {
      common_vendor.index.showToast({
        title: `预览文档: ${document.name}`,
        icon: "none"
      });
    }
    function downloadDocument(document) {
      common_vendor.index.showToast({
        title: `下载文档: ${document.name}`,
        icon: "none"
      });
    }
    function exportProjects() {
      common_vendor.index.showToast({
        title: "导出项目数据",
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
    function getProjectStatusText(status) {
      const statusMap = {
        planning: "规划中",
        "in-progress": "进行中",
        completed: "已完成",
        delayed: "已延期"
      };
      return statusMap[status] || "未知";
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
    function getTaskPriorityText(priority) {
      const priorityMap = {
        low: "低",
        medium: "中",
        high: "高"
      };
      return priorityMap[priority] || "中";
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
      var _a, _b;
      return common_vendor.e({
        a: common_vendor.p({
          type: "download",
          size: "16",
          color: "#3b82f6"
        }),
        b: common_vendor.o(exportProjects),
        c: common_vendor.p({
          type: "plus",
          size: "16",
          color: "#ffffff"
        }),
        d: common_vendor.o(createProject),
        e: common_vendor.p({
          type: "folder",
          size: "24",
          color: "#3b82f6"
        }),
        f: common_vendor.t(stats.value.totalProjects),
        g: common_vendor.p({
          type: "checkmark",
          size: "24",
          color: "#10b981"
        }),
        h: common_vendor.t(stats.value.completedProjects),
        i: common_vendor.p({
          type: "gear",
          size: "24",
          color: "#f59e0b"
        }),
        j: common_vendor.t(stats.value.inProgressProjects),
        k: common_vendor.p({
          type: "clock",
          size: "24",
          color: "#ef4444"
        }),
        l: common_vendor.t(stats.value.delayedProjects),
        m: common_vendor.f(filterTabs.value, (tab, k0, i0) => {
          return {
            a: common_vendor.t(tab.name),
            b: tab.id,
            c: activeFilter.value === tab.id ? 1 : "",
            d: common_vendor.o(() => switchFilter(tab.id), tab.id)
          };
        }),
        n: common_vendor.f(filteredProjects.value, (project, k0, i0) => {
          return {
            a: "47879d53-7-" + i0 + ",47879d53-0",
            b: common_vendor.p({
              type: getProjectIcon(project.type),
              size: "20",
              color: getProjectColor(project.status)
            }),
            c: common_vendor.t(project.name),
            d: common_vendor.t(getProjectStatusText(project.status)),
            e: common_vendor.n(`projects__item-badge--${project.status}`),
            f: common_vendor.t(project.description),
            g: common_vendor.t(project.progress),
            h: common_vendor.n(`projects__progress-fill--${project.status}`),
            i: `${project.progress}%`,
            j: "47879d53-8-" + i0 + ",47879d53-0",
            k: common_vendor.t(project.manager),
            l: "47879d53-9-" + i0 + ",47879d53-0",
            m: common_vendor.t(project.deadline),
            n: "47879d53-10-" + i0 + ",47879d53-0",
            o: common_vendor.o(() => editProject(project.id), project.id),
            p: project.id,
            q: project.id === activeProjectId.value ? 1 : "",
            r: project.status === "delayed" ? 1 : "",
            s: common_vendor.o(() => switchProject(project.id), project.id)
          };
        }),
        o: common_vendor.p({
          type: "person",
          size: "14",
          color: "#94a3b8"
        }),
        p: common_vendor.p({
          type: "calendar",
          size: "14",
          color: "#94a3b8"
        }),
        q: common_vendor.p({
          type: "compose",
          size: "16",
          color: "#64748b"
        }),
        r: filteredProjects.value.length === 0
      }, filteredProjects.value.length === 0 ? {
        s: common_vendor.p({
          type: "folder",
          size: "60",
          color: "#cbd5e1"
        })
      } : {}, {
        t: activeProject.value
      }, activeProject.value ? {
        v: common_vendor.t(getProjectStatusText(activeProject.value.status))
      } : {}, {
        w: common_vendor.p({
          type: "plus",
          size: "16",
          color: "#64748b"
        }),
        x: common_vendor.o(addTask),
        y: !activeProject.value,
        z: common_vendor.p({
          type: "checkmark",
          size: "16",
          color: "#ffffff"
        }),
        A: common_vendor.o(updateProgress),
        B: !activeProject.value,
        C: activeProject.value
      }, activeProject.value ? common_vendor.e({
        D: common_vendor.p({
          type: "info",
          size: "18",
          color: "#3b82f6"
        }),
        E: common_vendor.t(activeProject.value.code),
        F: common_vendor.t(activeProject.value.manager),
        G: common_vendor.t(activeProject.value.startDate),
        H: common_vendor.t(activeProject.value.deadline),
        I: common_vendor.t(activeProject.value.budget),
        J: common_vendor.t(getProjectTypeText(activeProject.value.type)),
        K: common_vendor.t(activeProject.value.fullDescription),
        L: common_vendor.p({
          type: "graph",
          size: "18",
          color: "#10b981"
        }),
        M: common_vendor.t(activeProject.value.progress),
        N: common_vendor.t(activeProject.value.progress),
        O: common_vendor.t(activeProject.value.totalTasks),
        P: common_vendor.t(activeProject.value.completedTasks),
        Q: common_vendor.t(activeProject.value.inProgressTasks),
        R: common_vendor.t(activeProject.value.pendingTasks),
        S: common_vendor.p({
          type: "list",
          size: "18",
          color: "#f59e0b"
        }),
        T: common_vendor.t(((_a = activeProject.value.tasks) == null ? void 0 : _a.length) || 0),
        U: activeProject.value.tasks && activeProject.value.tasks.length > 0
      }, activeProject.value.tasks && activeProject.value.tasks.length > 0 ? {
        V: common_vendor.f(activeProject.value.tasks, (task, k0, i0) => {
          return {
            a: "47879d53-17-" + i0 + ",47879d53-0",
            b: common_vendor.p({
              type: task.status === "completed" ? "checkbox-filled" : "checkbox",
              size: "20",
              color: task.status === "completed" ? "#10b981" : "#cbd5e1"
            }),
            c: common_vendor.o(() => toggleTask(task.id), task.id),
            d: common_vendor.t(task.title),
            e: common_vendor.t(getTaskPriorityText(task.priority)),
            f: common_vendor.n(`projects__task-badge--${task.priority}`),
            g: common_vendor.t(task.description),
            h: "47879d53-18-" + i0 + ",47879d53-0",
            i: common_vendor.t(task.assignee),
            j: "47879d53-19-" + i0 + ",47879d53-0",
            k: common_vendor.t(task.dueDate),
            l: "47879d53-20-" + i0 + ",47879d53-0",
            m: common_vendor.o(() => editTask(task.id), task.id),
            n: task.id,
            o: common_vendor.n(`projects__task-item--${task.status}`)
          };
        }),
        W: common_vendor.p({
          type: "person",
          size: "12",
          color: "#94a3b8"
        }),
        X: common_vendor.p({
          type: "calendar",
          size: "12",
          color: "#94a3b8"
        }),
        Y: common_vendor.p({
          type: "compose",
          size: "16",
          color: "#64748b"
        })
      } : {
        Z: common_vendor.p({
          type: "list",
          size: "32",
          color: "#cbd5e1"
        })
      }, {
        aa: common_vendor.p({
          type: "document",
          size: "18",
          color: "#8b5cf6"
        }),
        ab: common_vendor.t(((_b = activeProject.value.documents) == null ? void 0 : _b.length) || 0),
        ac: activeProject.value.documents && activeProject.value.documents.length > 0
      }, activeProject.value.documents && activeProject.value.documents.length > 0 ? {
        ad: common_vendor.f(activeProject.value.documents, (document, k0, i0) => {
          return {
            a: "47879d53-23-" + i0 + ",47879d53-0",
            b: common_vendor.p({
              type: getDocumentIcon(document.type),
              size: "20",
              color: "#3b82f6"
            }),
            c: common_vendor.t(document.name),
            d: common_vendor.t(document.size),
            e: common_vendor.t(document.uploadDate),
            f: "47879d53-24-" + i0 + ",47879d53-0",
            g: common_vendor.o(() => previewDocument(document), document.id),
            h: "47879d53-25-" + i0 + ",47879d53-0",
            i: common_vendor.o(() => downloadDocument(document), document.id),
            j: document.id
          };
        }),
        ae: common_vendor.p({
          type: "eye",
          size: "16",
          color: "#64748b"
        }),
        af: common_vendor.p({
          type: "download",
          size: "16",
          color: "#64748b"
        })
      } : {
        ag: common_vendor.p({
          type: "document",
          size: "32",
          color: "#cbd5e1"
        })
      }) : {
        ah: common_vendor.p({
          type: "folder",
          size: "60",
          color: "#cbd5e1"
        })
      }, {
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
