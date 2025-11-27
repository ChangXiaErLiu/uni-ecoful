/**
 * author：zyg
 * date:2025.11.27
 * api/auth.js
 * 认证模块接口，各个方法总结
 */

import { request } from '@/utils/request.js'

/**
 * 密码登录
 * @param {string} account - 用户名或手机号
 * @param {string} password - 密码
 * @returns {Promise}
 */
export function loginByPassword(account, password) {
	return request.post('/api/v1/auth/login', {
		account,
		password
	})
}

/**
 * 验证码登录（待后端接入短信服务）
 * @param {string} phone - 手机号
 * @param {string} code - 验证码
 * @returns {Promise}
 */
export function loginByCode(phone, code) {
	return request.post('/api/v1/auth/login/code', {
		phone,
		code
	})
}

/**
 * 微信登录（待后端接入微信开发平台）
 * @param {string} code - 微信登录凭证
 * @returns {Promise}
 */
export function loginByWechat(code) {
	return request.post('/api/v1/auth/login/wechat', {
		code
	})
}

/**
 * 发送短信验证码（待后端接入短信服务）
 * @param {string} phone - 手机号
 * @param {string} type - 类型：login/register
 * @returns {Promise}
 */
export function sendSmsCode(phone, type = 'login') {
	return request.post('/api/v1/auth/send-code', {
		phone,
		type
	})
}

/**
 * 注册
 * @param {Object} data - 注册信息
 * @returns {Promise}
 */
export function register(data) {
	return request.post('/api/v1/auth/register', data)
}

/**
 * 获取用户信息
 * @returns {Promise}
 */
export function getUserInfo() {
	return request.get('/api/v1/user/info')
}

/**
 * 登出
 * @returns {Promise}
 */
export function logout() {
	return request.post('/api/v1/auth/logout')
}
