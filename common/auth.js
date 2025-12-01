// 白名单：未登录也能访问的页面
export const WHITE_LIST = [
  '/pages/auth/login',
  '/pages/auth/register',
  '/pages/auth/forgot-password'
]

// // 获取登录状态
// export function isLoggedIn() {
//   return !!uni.getStorageSync('token')
// }

// 获取登录状态 + 打印完整用户信息
export function isLoggedIn() {
  const token = uni.getStorageSync('token')
  const userInfoStr = uni.getStorageSync('userInfo')

  let userInfo = null
  try {
    userInfo = userInfoStr ? JSON.parse(userInfoStr) : null
  } catch (e) {
    console.warn('【auth】解析 userInfo 失败', e)
  }

  console.log('【auth】token:', token)
  console.log('【auth】当前用户信息:', userInfo)

  return !!token
}