import { isLoggedIn, WHITE_LIST } from './auth.js'

export function setupRouterGuard() {
  const guard = (route) => {
    const url = route.url || route
    const path = url.split('?')[0]

    const loggedIn = isLoggedIn()

    if (!loggedIn && !WHITE_LIST.includes(path)) {
      uni.reLaunch({ url: '/pages/auth/login' })
      return false
    }

    if (loggedIn && WHITE_LIST.includes(path)) {
      uni.switchTab({ url: '/pages/home/index' })
      return false
    }

    return true
  }

  uni.addInterceptor('navigateTo', { invoke: guard })
  uni.addInterceptor('switchTab', { invoke: guard })
  uni.addInterceptor('redirectTo', { invoke: guard })
}