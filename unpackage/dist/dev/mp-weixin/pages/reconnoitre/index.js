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
    common_vendor.onShow(() => navTitle.setTitle("现场踏查管理"));
    const stats = common_vendor.ref({
      totalInvestigations: 24,
      completedInvestigations: 16,
      inProgressInvestigations: 5,
      issuesFound: 8
    });
    const investigationPoints = common_vendor.ref([
      {
        id: "point-1",
        name: "废水处理站",
        description: "厂区废水处理设施及排放口",
        type: "water",
        status: "completed",
        inspector: "张三",
        investigationDate: "2024-01-15 09:30",
        coordinates: "23.135°N, 113.264°E",
        environmentConditions: [
          { id: "cond-1", name: "废水处理设施", icon: "gear", status: "normal" },
          { id: "cond-2", name: "排放口水质", icon: "water", status: "normal" },
          { id: "cond-3", name: "设备运行", icon: "settings", status: "normal" }
        ],
        photos: [
          { thumbnail: "/static/sample/photo1.jpg", time: "09:35", fullImage: "/static/sample/photo1.jpg" },
          { thumbnail: "/static/sample/photo2.jpg", time: "09:40", fullImage: "/static/sample/photo2.jpg" }
        ],
        findings: []
      },
      {
        id: "point-2",
        name: "危废暂存间",
        description: "危险废物分类存放区域",
        type: "waste",
        status: "in-progress",
        inspector: "李四",
        investigationDate: "2024-01-16 10:15",
        coordinates: "23.136°N, 113.265°E",
        environmentConditions: [
          { id: "cond-4", name: "危废标识", icon: "flag", status: "normal" },
          { id: "cond-5", name: "分类存放", icon: "folder", status: "abnormal" },
          { id: "cond-6", name: "防渗措施", icon: "shield", status: "normal" }
        ],
        photos: [
          { thumbnail: "/static/sample/photo3.jpg", time: "10:20", fullImage: "/static/sample/photo3.jpg" }
        ],
        findings: [
          {
            id: "finding-1",
            title: "危废分类不规范",
            description: "部分危险废物未按规定分类存放，存在混放现象",
            severity: "medium",
            recordTime: "10:25",
            resolved: false
          }
        ]
      },
      {
        id: "point-3",
        name: "锅炉房",
        description: "生产用锅炉及废气处理设施",
        type: "air",
        status: "pending",
        inspector: "王五",
        investigationDate: "2024-01-17 14:00",
        coordinates: "23.137°N, 113.266°E",
        environmentConditions: [
          { id: "cond-7", name: "废气处理", icon: "cloudy", status: "pending" },
          { id: "cond-8", name: "设备运行", icon: "gear", status: "pending" }
        ],
        photos: [],
        findings: []
      },
      {
        id: "point-4",
        name: "原料仓库",
        description: "化学品原料存储区域",
        type: "chemical",
        status: "completed",
        inspector: "赵六",
        investigationDate: "2024-01-14 11:20",
        coordinates: "23.138°N, 113.267°E",
        environmentConditions: [
          { id: "cond-9", name: "防泄漏措施", icon: "shield", status: "normal" },
          { id: "cond-10", name: "消防设施", icon: "fire", status: "normal" }
        ],
        photos: [
          { thumbnail: "/static/sample/photo4.jpg", time: "11:25", fullImage: "/static/sample/photo4.jpg" }
        ],
        findings: [
          {
            id: "finding-2",
            title: "消防器材检查过期",
            description: "部分灭火器检查标签已过期，需及时更换",
            severity: "high",
            recordTime: "11:30",
            resolved: true
          }
        ]
      }
    ]);
    const activePointId = common_vendor.ref("point-1");
    const activePoint = common_vendor.computed(
      () => investigationPoints.value.find((point) => point.id === activePointId.value)
    );
    function switchPoint(pointId) {
      activePointId.value = pointId;
    }
    function startNewInvestigation() {
      common_vendor.index.showToast({
        title: "开始新的踏查任务",
        icon: "none"
      });
    }
    function addPoint() {
      const newPoint = {
        id: "point-new-" + Date.now(),
        name: "新踏查点位",
        description: "请描述点位位置和检查内容",
        type: "general",
        status: "pending",
        inspector: "当前用户",
        investigationDate: (/* @__PURE__ */ new Date()).toLocaleDateString(),
        coordinates: "待定位",
        environmentConditions: [],
        photos: [],
        findings: []
      };
      investigationPoints.value.unshift(newPoint);
      activePointId.value = newPoint.id;
    }
    function navigateToPoint(point) {
      common_vendor.index.showToast({
        title: `导航到 ${point.name}`,
        icon: "none"
      });
    }
    function takePhoto() {
      if (!activePoint.value)
        return;
      common_vendor.index.showToast({
        title: "拍照功能开发中",
        icon: "none"
      });
    }
    function recordFinding() {
      if (!activePoint.value)
        return;
      const newFinding = {
        id: "finding-new-" + Date.now(),
        title: "新发现问题",
        description: "请描述具体问题和位置",
        severity: "medium",
        recordTime: (/* @__PURE__ */ new Date()).toLocaleTimeString(),
        resolved: false
      };
      if (!activePoint.value.findings) {
        activePoint.value.findings = [];
      }
      activePoint.value.findings.push(newFinding);
      activePoint.value.status = "in-progress";
    }
    function previewPhoto(photo) {
      common_vendor.index.previewImage({
        urls: [photo.fullImage],
        current: 0
      });
    }
    function resolveFinding(findingId) {
      const finding = activePoint.value.findings.find((f) => f.id === findingId);
      if (finding) {
        finding.resolved = true;
        common_vendor.index.showToast({
          title: "问题已标记为已处理",
          icon: "success"
        });
      }
    }
    function syncData() {
      common_vendor.index.showToast({
        title: "数据同步中...",
        icon: "loading"
      });
      setTimeout(() => {
        common_vendor.index.showToast({
          title: "同步完成",
          icon: "success"
        });
      }, 1500);
    }
    function getPointColor(status) {
      const colorMap = {
        completed: "#10b981",
        "in-progress": "#f59e0b",
        pending: "#64748b"
      };
      return colorMap[status] || "#64748b";
    }
    function getPointIcon(type) {
      const iconMap = {
        water: "water",
        waste: "trash",
        air: "cloudy",
        chemical: "flask",
        general: "location"
      };
      return iconMap[type] || "location";
    }
    function getPointStatusText(status) {
      const statusMap = {
        completed: "已完成",
        "in-progress": "进行中",
        pending: "待踏查"
      };
      return statusMap[status] || "未知";
    }
    function getSeverityText(severity) {
      const severityMap = {
        low: "低风险",
        medium: "中风险",
        high: "高风险"
      };
      return severityMap[severity] || "未知";
    }
    return (_ctx, _cache) => {
      var _a, _b;
      return common_vendor.e({
        a: common_vendor.p({
          type: "refresh",
          size: "16",
          color: "#3b82f6"
        }),
        b: common_vendor.o(syncData),
        c: common_vendor.p({
          type: "plus",
          size: "16",
          color: "#ffffff"
        }),
        d: common_vendor.o(startNewInvestigation),
        e: common_vendor.p({
          type: "location",
          size: "24",
          color: "#3b82f6"
        }),
        f: common_vendor.t(stats.value.totalInvestigations),
        g: common_vendor.p({
          type: "checkmark",
          size: "24",
          color: "#10b981"
        }),
        h: common_vendor.t(stats.value.completedInvestigations),
        i: common_vendor.p({
          type: "clock",
          size: "24",
          color: "#f59e0b"
        }),
        j: common_vendor.t(stats.value.inProgressInvestigations),
        k: common_vendor.p({
          type: "info",
          size: "24",
          color: "#ef4444"
        }),
        l: common_vendor.t(stats.value.issuesFound),
        m: common_vendor.p({
          type: "plus",
          size: "14",
          color: "#3b82f6"
        }),
        n: common_vendor.o(addPoint),
        o: common_vendor.f(investigationPoints.value, (point, k0, i0) => {
          return {
            a: "10464b8b-8-" + i0 + ",10464b8b-0",
            b: common_vendor.p({
              type: getPointIcon(point.type),
              size: "16",
              color: "#ffffff"
            }),
            c: getPointColor(point.status),
            d: common_vendor.t(point.name),
            e: common_vendor.t(getPointStatusText(point.status)),
            f: common_vendor.n(`investigation__point-badge--${point.status}`),
            g: common_vendor.t(point.description),
            h: "10464b8b-9-" + i0 + ",10464b8b-0",
            i: common_vendor.t(point.inspector),
            j: "10464b8b-10-" + i0 + ",10464b8b-0",
            k: common_vendor.t(point.investigationDate),
            l: "10464b8b-11-" + i0 + ",10464b8b-0",
            m: common_vendor.o(() => navigateToPoint(point), point.id),
            n: point.id,
            o: point.id === activePointId.value ? 1 : "",
            p: point.status === "completed" ? 1 : "",
            q: common_vendor.o(() => switchPoint(point.id), point.id)
          };
        }),
        p: common_vendor.p({
          type: "person",
          size: "12",
          color: "#94a3b8"
        }),
        q: common_vendor.p({
          type: "calendar",
          size: "12",
          color: "#94a3b8"
        }),
        r: common_vendor.p({
          type: "navigate",
          size: "16",
          color: "#3b82f6"
        }),
        s: investigationPoints.value.length === 0
      }, investigationPoints.value.length === 0 ? {
        t: common_vendor.p({
          type: "location",
          size: "60",
          color: "#cbd5e1"
        })
      } : {}, {
        v: activePoint.value
      }, activePoint.value ? {
        w: common_vendor.t(getPointStatusText(activePoint.value.status))
      } : {}, {
        x: common_vendor.p({
          type: "camera",
          size: "16",
          color: "#64748b"
        }),
        y: common_vendor.o(takePhoto),
        z: !activePoint.value,
        A: common_vendor.p({
          type: "compose",
          size: "16",
          color: "#ffffff"
        }),
        B: common_vendor.o(recordFinding),
        C: !activePoint.value,
        D: activePoint.value
      }, activePoint.value ? common_vendor.e({
        E: common_vendor.p({
          type: "info",
          size: "18",
          color: "#3b82f6"
        }),
        F: common_vendor.t(activePoint.value.name),
        G: common_vendor.t(activePoint.value.coordinates),
        H: common_vendor.t(activePoint.value.inspector),
        I: common_vendor.t(activePoint.value.investigationDate),
        J: common_vendor.p({
          type: "eye",
          size: "18",
          color: "#10b981"
        }),
        K: common_vendor.f(activePoint.value.environmentConditions, (item, k0, i0) => {
          return {
            a: "10464b8b-17-" + i0 + ",10464b8b-0",
            b: common_vendor.p({
              type: item.icon,
              size: "16",
              color: item.status === "normal" ? "#10b981" : "#ef4444"
            }),
            c: common_vendor.t(item.name),
            d: common_vendor.t(item.status === "normal" ? "正常" : "异常"),
            e: common_vendor.n(`investigation__environment-status--${item.status}`),
            f: item.id
          };
        }),
        L: common_vendor.p({
          type: "image",
          size: "18",
          color: "#f59e0b"
        }),
        M: common_vendor.t(((_a = activePoint.value.photos) == null ? void 0 : _a.length) || 0),
        N: common_vendor.f(activePoint.value.photos, (photo, index, i0) => {
          return {
            a: photo.thumbnail,
            b: common_vendor.t(photo.time),
            c: index,
            d: common_vendor.o(() => previewPhoto(photo), index)
          };
        }),
        O: common_vendor.p({
          type: "plus",
          size: "24",
          color: "#cbd5e1"
        }),
        P: common_vendor.o(takePhoto),
        Q: common_vendor.p({
          type: "flag",
          size: "18",
          color: "#ef4444"
        }),
        R: common_vendor.t(((_b = activePoint.value.findings) == null ? void 0 : _b.length) || 0),
        S: activePoint.value.findings && activePoint.value.findings.length > 0
      }, activePoint.value.findings && activePoint.value.findings.length > 0 ? {
        T: common_vendor.f(activePoint.value.findings, (finding, k0, i0) => {
          return {
            a: common_vendor.t(finding.title),
            b: common_vendor.t(getSeverityText(finding.severity)),
            c: common_vendor.n(`investigation__finding-severity--${finding.severity}`),
            d: common_vendor.t(finding.description),
            e: common_vendor.t(finding.recordTime),
            f: common_vendor.o(() => resolveFinding(finding.id), finding.id),
            g: finding.id,
            h: common_vendor.n(`investigation__finding-item--${finding.severity}`)
          };
        })
      } : {
        U: common_vendor.p({
          type: "checkmark",
          size: "32",
          color: "#cbd5e1"
        })
      }) : {
        V: common_vendor.p({
          type: "map",
          size: "60",
          color: "#cbd5e1"
        })
      }, {
        W: common_vendor.p({
          current: "pages/investigation/index"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-10464b8b"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/reconnoitre/index.js.map
