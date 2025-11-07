"use strict";
const common_vendor = require("../common/vendor.js");
common_vendor.defineStore("knowledge", {
  state: () => ({
    knowledgeBases: [],
    fileMap: {}
  }),
  getters: {
    allFiles(state) {
      return state.knowledgeBases.flatMap((item) => state.fileMap[item.id] || []);
    }
  },
  actions: {
    setKnowledgeBases(list) {
      this.knowledgeBases = list;
    },
    setFiles(kbId, files) {
      this.fileMap[kbId] = files;
    }
  }
});
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/knowledge.js.map
