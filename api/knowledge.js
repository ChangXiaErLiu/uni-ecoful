import { defineStore } from 'pinia'

// 中文注释：个人知识库与文件管理状态
export const useKnowledgeStore = defineStore('knowledge', {
  state: () => ({
    knowledgeBases: [],
    fileMap: {}
  }),
  getters: {
    allFiles(state) {
      return state.knowledgeBases.flatMap((item) => state.fileMap[item.id] || [])
    }
  },
  actions: {
    setKnowledgeBases(list) {
      this.knowledgeBases = list
    },
    setFiles(kbId, files) {
      this.fileMap[kbId] = files
    }
  }
})
