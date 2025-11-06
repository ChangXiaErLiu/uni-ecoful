import { defineStore } from 'pinia'

// 中文注释：用户信息与鉴权状态管理
export const useUserStore = defineStore('user', {
  state: () => ({
    token: '',
    profile: null
  }),
  getters: {
    isLoggedIn(state) {
      return Boolean(state.token)
    }
  },
  actions: {
    setToken(token) {
      this.token = token
    },
    setProfile(profile) {
      this.profile = profile
    },
    reset() {
      this.token = ''
      this.profile = null
    }
  }
})
