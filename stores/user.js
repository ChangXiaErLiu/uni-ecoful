/**
 * 用户状态管理
 */
import { defineStore } from 'pinia'
import { 
	loginByPassword, 
	loginByCode, 
	loginByWechat, 
	register,
	getUserInfo, 
	logout as logoutApi 
} from '@/api/auth.js'

export const useUserStore = defineStore('user', {
	state: () => ({
		token: uni.getStorageSync('token') || '',
		userInfo: null
	}),

	getters: {
		// 是否已登录
		isLoggedIn: (state) => !!state.token,
		
		// 用户名
		userName: (state) => state.userInfo?.username || '请登录',
		
		// 企业名称
		companyName: (state) => state.userInfo?.company_name || '',
		
		// 手机号
		phoneNum: (state) => state.userInfo?.phone_num || ''
	},

	actions: {
		/**
		 * 密码登录
		 */
		async loginByPassword(account, password) {
			try {
				const res = await loginByPassword(account, password)
				
				// 保存 token
				this.token = res.access_token
				uni.setStorageSync('token', res.access_token)
				
				// 保存用户信息
				this.userInfo = res.user
				uni.setStorageSync('userInfo', JSON.stringify(res.user))
				
				return { success: true, data: res }
			} catch (error) {
				return { success: false, error }
			}
		},

		/**
		 * 验证码登录
		 */
		async loginByCode(phoneNum, code) {
			try {
				const res = await loginByCode(phoneNum, code)
				
				this.token = res.access_token
				uni.setStorageSync('token', res.access_token)
				
				this.userInfo = res.user
				uni.setStorageSync('userInfo', JSON.stringify(res.user))
				
				return { success: true, data: res }
			} catch (error) {
				return { success: false, error }
			}
		},

		/**
		 * 用户注册
		 */
		async register(data) {
			try {
				const res = await register(data)
				
				this.token = res.access_token
				uni.setStorageSync('token', res.access_token)
				
				this.userInfo = res.user
				uni.setStorageSync('userInfo', JSON.stringify(res.user))
				
				return { success: true, data: res }
			} catch (error) {
				return { success: false, error }
			}
		},

		/**
		 * 微信登录
		 */
		async loginByWechat(code) {
			try {
				const res = await loginByWechat(code)
				
				this.token = res.access_token
				uni.setStorageSync('token', res.access_token)
				
				this.userInfo = res.user
				uni.setStorageSync('userInfo', JSON.stringify(res.user))
				
				return { success: true, data: res }
			} catch (error) {
				return { success: false, error }
			}
		},

		/**
		 * 获取用户信息
		 */
		async fetchUserInfo() {
			try {
				const res = await getUserInfo()
				this.userInfo = res
				uni.setStorageSync('userInfo', JSON.stringify(res))
				return { success: true, data: res }
			} catch (error) {
				return { success: false, error }
			}
		},

		/**
		 * 登出
		 */
		async logout() {
			try {
				await logoutApi()
			} catch (error) {
				console.error('登出接口调用失败:', error)
			} finally {
				// 无论接口是否成功，都清除本地数据
				this.token = ''
				this.userInfo = null
				uni.removeStorageSync('token')
				uni.removeStorageSync('userInfo')
				
				// 跳转到登录页
				uni.reLaunch({
					url: '/pages/auth/login'
				})
			}
		},

		/**
		 * 初始化用户信息（从本地存储恢复）
		 */
		initUserInfo() {
			try {
				const userInfoStr = uni.getStorageSync('userInfo')
				if (userInfoStr) {
					this.userInfo = JSON.parse(userInfoStr)
				}
			} catch (error) {
				console.error('初始化用户信息失败:', error)
			}
		}
	}
})
