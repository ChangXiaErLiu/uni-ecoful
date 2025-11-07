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
    common_vendor.onShow(() => navTitle.setTitle("环保台账管理"));
    const stats = common_vendor.ref({
      totalRecords: 156,
      completedRecords: 89,
      pendingRecords: 42,
      expiredRecords: 25
    });
    const ledgerCategories = common_vendor.ref([
      {
        id: "basic",
        name: "基础信息台账",
        icon: "home",
        count: 15,
        description: "企业基本信息和项目资料"
      },
      {
        id: "pollution",
        name: "污染物治理台账",
        icon: "cloudy",
        count: 68,
        description: "废水、废气、固废治理记录"
      },
      {
        id: "management",
        name: "环境管理台账",
        icon: "gear",
        count: 32,
        description: "培训、巡查、应急预案等"
      },
      {
        id: "monitoring",
        name: "监测报告台账",
        icon: "graph",
        count: 41,
        description: "监测数据和执行报告"
      }
    ]);
    const ledgerRecords = common_vendor.ref({
      basic: [
        {
          id: "record-1",
          title: "企业基本信息登记",
          description: "更新营业执照和环保负责人信息",
          type: "info",
          status: "completed",
          responsiblePerson: "张三",
          recordDate: "2024-01-15",
          dueDate: "",
          category: "basic"
        },
        {
          id: "record-2",
          title: "环评批复文件归档",
          description: "收集整理建设项目环评相关文件",
          type: "document",
          status: "pending",
          responsiblePerson: "李四",
          recordDate: "2024-01-10",
          dueDate: "2024-01-20",
          category: "basic"
        }
      ],
      pollution: [
        {
          id: "record-3",
          title: "废水处理设施运行记录",
          description: "记录本周废水处理设施运行参数和加药情况",
          type: "water",
          status: "completed",
          responsiblePerson: "王五",
          recordDate: "2024-01-16",
          dueDate: "",
          category: "pollution"
        },
        {
          id: "record-4",
          title: "危险废物转移记录",
          description: "本月危险废物转移至处置单位",
          type: "waste",
          status: "expired",
          responsiblePerson: "赵六",
          recordDate: "2024-01-05",
          dueDate: "2024-01-10",
          category: "pollution"
        }
      ],
      management: [
        {
          id: "record-5",
          title: "环保培训记录",
          description: "新员工环保法规和操作规范培训",
          type: "training",
          status: "pending",
          responsiblePerson: "钱七",
          recordDate: "2024-01-14",
          dueDate: "2024-01-25",
          category: "management"
        }
      ],
      monitoring: [
        {
          id: "record-6",
          title: "季度监测报告",
          description: "第三方检测机构出具的季度监测报告",
          type: "report",
          status: "completed",
          responsiblePerson: "孙八",
          recordDate: "2024-01-12",
          dueDate: "",
          category: "monitoring"
        }
      ]
    });
    const activeCategoryId = common_vendor.ref("basic");
    const showFilter = common_vendor.ref(false);
    const filters = common_vendor.ref({
      status: "",
      date: ""
    });
    const statusOptions = [
      { label: "全部状态", value: "" },
      { label: "已完成", value: "completed" },
      { label: "待处理", value: "pending" },
      { label: "已过期", value: "expired" }
    ];
    const activeCategory = common_vendor.computed(
      () => ledgerCategories.value.find((cat) => cat.id === activeCategoryId.value)
    );
    const currentRecords = common_vendor.computed(() => {
      let records = ledgerRecords.value[activeCategoryId.value] || [];
      if (filters.value.status) {
        records = records.filter((record) => record.status === filters.value.status);
      }
      if (filters.value.date) {
        records = records.filter((record) => record.recordDate === filters.value.date);
      }
      return records;
    });
    function switchCategory(categoryId) {
      activeCategoryId.value = categoryId;
      showFilter.value = false;
    }
    function addRecord() {
      common_vendor.index.showToast({
        title: "新建记录功能开发中",
        icon: "none"
      });
    }
    function editRecord(recordId) {
      common_vendor.index.__f__("log", "at pages/ledger/index.vue:370", "编辑记录", recordId);
      common_vendor.index.showToast({
        title: "编辑功能开发中",
        icon: "none"
      });
    }
    function deleteRecord(recordId) {
      common_vendor.index.showModal({
        title: "确认删除",
        content: "确定要删除这条台账记录吗？",
        success: (res) => {
          if (res.confirm) {
            const categoryId = activeCategoryId.value;
            ledgerRecords.value[categoryId] = ledgerRecords.value[categoryId].filter(
              (record) => record.id !== recordId
            );
            common_vendor.index.showToast({
              title: "删除成功",
              icon: "success"
            });
          }
        }
      });
    }
    function viewRecordDetail(recordId) {
      common_vendor.index.__f__("log", "at pages/ledger/index.vue:397", "查看记录详情", recordId);
      common_vendor.index.showToast({
        title: "详情功能开发中",
        icon: "none"
      });
    }
    function exportData() {
      common_vendor.index.showToast({
        title: "导出功能开发中",
        icon: "none"
      });
    }
    function onStatusFilterChange(e) {
      var _a;
      filters.value.status = ((_a = statusOptions[e.detail.value]) == null ? void 0 : _a.value) || "";
    }
    function onDateFilterChange(e) {
      filters.value.date = e.detail.value;
    }
    function getRecordIcon(type) {
      const iconMap = {
        info: "info",
        document: "document",
        water: "water",
        waste: "trash",
        training: "person",
        report: "graph"
      };
      return iconMap[type] || "document";
    }
    function getRecordColor(status) {
      const colorMap = {
        completed: "#10b981",
        pending: "#f59e0b",
        expired: "#ef4444"
      };
      return colorMap[status] || "#64748b";
    }
    function getStatusText(status) {
      const statusMap = {
        completed: "已完成",
        pending: "待处理",
        expired: "已过期"
      };
      return statusMap[status] || "未知";
    }
    return (_ctx, _cache) => {
      var _a, _b;
      return common_vendor.e({
        a: common_vendor.p({
          type: "download",
          size: "16",
          color: "#3b82f6"
        }),
        b: common_vendor.o(exportData),
        c: common_vendor.p({
          type: "plus",
          size: "16",
          color: "#ffffff"
        }),
        d: common_vendor.o(addRecord),
        e: common_vendor.p({
          type: "folder",
          size: "24",
          color: "#3b82f6"
        }),
        f: common_vendor.t(stats.value.totalRecords),
        g: common_vendor.p({
          type: "checkmark",
          size: "24",
          color: "#10b981"
        }),
        h: common_vendor.t(stats.value.completedRecords),
        i: common_vendor.p({
          type: "clock",
          size: "24",
          color: "#f59e0b"
        }),
        j: common_vendor.t(stats.value.pendingRecords),
        k: common_vendor.p({
          type: "info",
          size: "24",
          color: "#ef4444"
        }),
        l: common_vendor.t(stats.value.expiredRecords),
        m: common_vendor.f(ledgerCategories.value, (category, k0, i0) => {
          return {
            a: "54ba28ed-7-" + i0 + ",54ba28ed-0",
            b: common_vendor.p({
              type: category.icon,
              size: "20",
              color: category.id === activeCategoryId.value ? "#3b82f6" : "#64748b"
            }),
            c: common_vendor.t(category.name),
            d: common_vendor.t(category.count),
            e: "54ba28ed-8-" + i0 + ",54ba28ed-0",
            f: category.id,
            g: category.id === activeCategoryId.value ? 1 : "",
            h: common_vendor.o(() => switchCategory(category.id), category.id)
          };
        }),
        n: common_vendor.p({
          type: "right",
          size: "16",
          color: "#94a3b8"
        }),
        o: common_vendor.t((_a = activeCategory.value) == null ? void 0 : _a.name),
        p: common_vendor.t(currentRecords.value.length),
        q: common_vendor.p({
          type: "funnel",
          size: "16",
          color: "#64748b"
        }),
        r: common_vendor.o(($event) => showFilter.value = !showFilter.value),
        s: showFilter.value
      }, showFilter.value ? {
        t: common_vendor.t(((_b = statusOptions[filters.value.status]) == null ? void 0 : _b.label) || "全部状态"),
        v: common_vendor.p({
          type: "arrow-down",
          size: "14",
          color: "#64748b"
        }),
        w: common_vendor.o(onStatusFilterChange),
        x: filters.value.status,
        y: statusOptions,
        z: common_vendor.t(filters.value.date || "选择日期"),
        A: common_vendor.p({
          type: "calendar",
          size: "14",
          color: "#64748b"
        }),
        B: common_vendor.o(onDateFilterChange)
      } : {}, {
        C: currentRecords.value.length > 0
      }, currentRecords.value.length > 0 ? {
        D: common_vendor.f(currentRecords.value, (record, k0, i0) => {
          return common_vendor.e({
            a: "54ba28ed-12-" + i0 + ",54ba28ed-0",
            b: common_vendor.p({
              type: getRecordIcon(record.type),
              size: "20",
              color: getRecordColor(record.status)
            }),
            c: common_vendor.t(record.title),
            d: common_vendor.t(getStatusText(record.status)),
            e: common_vendor.n(`ledger__record-badge--${record.status}`),
            f: common_vendor.t(record.description),
            g: "54ba28ed-13-" + i0 + ",54ba28ed-0",
            h: common_vendor.t(record.responsiblePerson),
            i: "54ba28ed-14-" + i0 + ",54ba28ed-0",
            j: common_vendor.t(record.recordDate),
            k: record.dueDate
          }, record.dueDate ? {
            l: "54ba28ed-15-" + i0 + ",54ba28ed-0",
            m: common_vendor.p({
              type: "clock",
              size: "14",
              color: "#94a3b8"
            }),
            n: common_vendor.t(record.dueDate)
          } : {}, {
            o: "54ba28ed-16-" + i0 + ",54ba28ed-0",
            p: common_vendor.o(() => editRecord(record.id), record.id),
            q: "54ba28ed-17-" + i0 + ",54ba28ed-0",
            r: common_vendor.o(() => deleteRecord(record.id), record.id),
            s: record.id,
            t: common_vendor.n(`ledger__record-item--${record.status}`),
            v: common_vendor.o(() => viewRecordDetail(record.id), record.id)
          });
        }),
        E: common_vendor.p({
          type: "person",
          size: "14",
          color: "#94a3b8"
        }),
        F: common_vendor.p({
          type: "calendar",
          size: "14",
          color: "#94a3b8"
        }),
        G: common_vendor.p({
          type: "compose",
          size: "16",
          color: "#64748b"
        }),
        H: common_vendor.p({
          type: "trash",
          size: "16",
          color: "#ef4444"
        })
      } : {
        I: common_vendor.p({
          type: "document",
          size: "60",
          color: "#cbd5e1"
        }),
        J: common_vendor.p({
          type: "plus",
          size: "16",
          color: "#ffffff"
        }),
        K: common_vendor.o(addRecord)
      }, {
        L: common_vendor.p({
          current: "pages/ledger/index"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-54ba28ed"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/ledger/index.js.map
