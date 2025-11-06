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
    var _a;
    const navTitle = stores_navTitle.navTitleStore();
    common_vendor.onShow(() => navTitle.setTitle("个人知识库"));
    const knowledgeList = common_vendor.ref([
      {
        id: "kb-default",
        name: "默认知识库",
        description: "系统初始化的默认知识库",
        icon: "home",
        default: true,
        fileCount: 3,
        lastUpdate: "2小时前"
      },
      {
        id: "kb-project",
        name: "项目资料库",
        description: "存放项目方案与需求文档",
        icon: "folder",
        fileCount: 12,
        lastUpdate: "1天前"
      },
      {
        id: "kb-research",
        name: "研究资料",
        description: "行业研究和技术文档",
        icon: "search",
        fileCount: 8,
        lastUpdate: "3天前"
      }
    ]);
    const knowledgeFiles = common_vendor.ref({
      "kb-default": [
        {
          id: "file-1",
          name: "产品白皮书.pdf",
          size: "2.1 MB",
          type: "pdf",
          uploadedAt: "2025-10-01",
          status: "processed"
        },
        {
          id: "file-2",
          name: "用户需求文档.docx",
          size: "1.8 MB",
          type: "word",
          uploadedAt: "2025-10-02",
          status: "processed"
        },
        {
          id: "file-3",
          name: "项目规划表.xlsx",
          size: "856 KB",
          type: "excel",
          uploadedAt: "2025-10-03",
          status: "processing"
        }
      ],
      "kb-project": [
        {
          id: "file-4",
          name: "技术架构图.png",
          size: "3.2 MB",
          type: "image",
          uploadedAt: "2025-09-28",
          status: "processed"
        }
      ],
      "kb-research": []
    });
    const activeKnowledgeId = common_vendor.ref(((_a = knowledgeList.value[0]) == null ? void 0 : _a.id) || "");
    const currentFiles = common_vendor.computed(() => knowledgeFiles.value[activeKnowledgeId.value] || []);
    function createKnowledge() {
      common_vendor.index.__f__("log", "at pages/knowledge/index.vue:220", "新建知识库");
      const newKb = {
        id: "kb-new-" + Date.now(),
        name: "新建知识库",
        description: "这是一个新的知识库",
        icon: "folder",
        fileCount: 0,
        lastUpdate: "刚刚"
      };
      knowledgeList.value.push(newKb);
      knowledgeFiles.value[newKb.id] = [];
      activeKnowledgeId.value = newKb.id;
    }
    function switchKnowledge(id) {
      activeKnowledgeId.value = id;
    }
    function renameKnowledge(id) {
      common_vendor.index.__f__("log", "at pages/knowledge/index.vue:240", "重命名知识库", id);
      common_vendor.index.showToast({
        title: "重命名功能开发中",
        icon: "none"
      });
    }
    function removeKnowledge(id) {
      var _a2;
      common_vendor.index.__f__("log", "at pages/knowledge/index.vue:248", "删除知识库", id);
      if (confirm("确定要删除这个知识库吗？")) {
        knowledgeList.value = knowledgeList.value.filter((kb) => kb.id !== id);
        delete knowledgeFiles.value[id];
        if (activeKnowledgeId.value === id) {
          activeKnowledgeId.value = ((_a2 = knowledgeList.value[0]) == null ? void 0 : _a2.id) || "";
        }
      }
    }
    function uploadFile() {
      common_vendor.index.__f__("log", "at pages/knowledge/index.vue:259", "上传文件");
      if (!activeKnowledgeId.value)
        return;
      const newFile = {
        id: "file-" + Date.now(),
        name: "示例文档.pdf",
        size: "1.5 MB",
        type: "pdf",
        uploadedAt: "刚刚",
        status: "processing"
      };
      knowledgeFiles.value[activeKnowledgeId.value].unshift(newFile);
      const kb = knowledgeList.value.find((k) => k.id === activeKnowledgeId.value);
      if (kb) {
        kb.fileCount = (kb.fileCount || 0) + 1;
        kb.lastUpdate = "刚刚";
      }
    }
    function previewFile(id) {
      common_vendor.index.__f__("log", "at pages/knowledge/index.vue:282", "预览文件", id);
      common_vendor.index.showToast({
        title: "预览功能开发中",
        icon: "none"
      });
    }
    function remarkFile(id) {
      common_vendor.index.__f__("log", "at pages/knowledge/index.vue:290", "添加备注", id);
      common_vendor.index.showToast({
        title: "备注功能开发中",
        icon: "none"
      });
    }
    function deleteFile(id) {
      common_vendor.index.__f__("log", "at pages/knowledge/index.vue:298", "删除文件", id);
      if (confirm("确定要删除这个文件吗？")) {
        const kbId = activeKnowledgeId.value;
        knowledgeFiles.value[kbId] = knowledgeFiles.value[kbId].filter((file) => file.id !== id);
        const kb = knowledgeList.value.find((k) => k.id === kbId);
        if (kb) {
          kb.fileCount = Math.max(0, (kb.fileCount || 0) - 1);
        }
      }
    }
    function getFileIcon(fileType) {
      const iconMap = {
        pdf: "pdf",
        word: "document",
        excel: "stats-bars",
        image: "image",
        text: "compose",
        ppt: "slides"
      };
      return iconMap[fileType] || "document";
    }
    function getFileColor(fileType) {
      const colorMap = {
        pdf: "#ef4444",
        word: "#3b82f6",
        excel: "#10b981",
        image: "#f59e0b",
        text: "#64748b",
        ppt: "#f97316"
      };
      return colorMap[fileType] || "#64748b";
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "plus",
          size: "16",
          color: "#ffffff"
        }),
        b: common_vendor.o(createKnowledge),
        c: common_vendor.t(knowledgeList.value.length),
        d: common_vendor.f(knowledgeList.value, (item, k0, i0) => {
          return common_vendor.e({
            a: "502b983e-2-" + i0 + ",502b983e-0",
            b: common_vendor.p({
              type: item.icon || "folder",
              size: "24",
              color: item.id === activeKnowledgeId.value ? "#3b82f6" : "#64748b"
            }),
            c: common_vendor.t(item.name),
            d: item.default
          }, item.default ? {} : {}, {
            e: common_vendor.t(item.description),
            f: common_vendor.t(item.fileCount || 0),
            g: common_vendor.t(item.lastUpdate || "刚刚"),
            h: "502b983e-3-" + i0 + ",502b983e-0",
            i: common_vendor.o(() => renameKnowledge(item.id), item.id),
            j: !item.default
          }, !item.default ? {
            k: "502b983e-4-" + i0 + ",502b983e-0",
            l: common_vendor.p({
              type: "trash",
              size: "16",
              color: "#ef4444"
            }),
            m: common_vendor.o(() => removeKnowledge(item.id), item.id)
          } : {}, {
            n: item.id,
            o: item.id === activeKnowledgeId.value ? 1 : "",
            p: item.default ? 1 : "",
            q: common_vendor.o(() => switchKnowledge(item.id), item.id)
          });
        }),
        e: common_vendor.p({
          type: "compose",
          size: "16",
          color: "#64748b"
        }),
        f: knowledgeList.value.length === 0
      }, knowledgeList.value.length === 0 ? {
        g: common_vendor.p({
          type: "folder",
          size: "60",
          color: "#cbd5e1"
        })
      } : {}, {
        h: currentFiles.value.length > 0
      }, currentFiles.value.length > 0 ? {
        i: common_vendor.t(currentFiles.value.length)
      } : {}, {
        j: common_vendor.p({
          type: "cloud-upload",
          size: "16",
          color: "#ffffff"
        }),
        k: common_vendor.o(uploadFile),
        l: !activeKnowledgeId.value,
        m: currentFiles.value.length > 0
      }, currentFiles.value.length > 0 ? {
        n: common_vendor.f(currentFiles.value, (file, k0, i0) => {
          return {
            a: "502b983e-7-" + i0 + ",502b983e-0",
            b: common_vendor.p({
              type: getFileIcon(file.type),
              size: "24",
              color: getFileColor(file.type)
            }),
            c: common_vendor.t(file.name),
            d: common_vendor.t(file.size),
            e: common_vendor.t(file.uploadedAt),
            f: common_vendor.t(file.status === "processed" ? "已处理" : "待处理"),
            g: common_vendor.n(`knowledge__file-status--${file.status}`),
            h: "502b983e-8-" + i0 + ",502b983e-0",
            i: common_vendor.o(() => previewFile(file.id), file.id),
            j: "502b983e-9-" + i0 + ",502b983e-0",
            k: common_vendor.o(() => remarkFile(file.id), file.id),
            l: "502b983e-10-" + i0 + ",502b983e-0",
            m: common_vendor.o(() => deleteFile(file.id), file.id),
            n: file.id
          };
        }),
        o: common_vendor.p({
          type: "eye",
          size: "18",
          color: "#64748b"
        }),
        p: common_vendor.p({
          type: "chat",
          size: "18",
          color: "#64748b"
        }),
        q: common_vendor.p({
          type: "trash",
          size: "18",
          color: "#ef4444"
        })
      } : {
        r: common_vendor.p({
          type: "document",
          size: "60",
          color: "#cbd5e1"
        }),
        s: common_vendor.p({
          type: "cloud-upload",
          size: "16",
          color: "#3b82f6"
        }),
        t: common_vendor.o(uploadFile),
        v: !activeKnowledgeId.value
      }, {
        w: common_vendor.p({
          current: "pages/knowledge/index"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-502b983e"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/knowledge/index.js.map
