// /stores/navTitle.js
import { defineStore } from 'pinia'

export const navTitleStore = defineStore('navTitle', {
  state: () => ({
    title: '粤风环保AI系统', // 默认标题
  }),
  actions: {
    setTitle(t) {
      this.title = t
    },
  },
})
