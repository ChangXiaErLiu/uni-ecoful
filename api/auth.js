/**
 * author：zyg
 * date:2025.11.27
 * api/auth.js
 * 认证模块接口
 */

import { request } from '@/utils/request.js'

/**
 * 1. 密码登录
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
 * 2. 发送短信验证码
 * @param {string} phoneNum - 手机号
 * @param {string} purpose - 用途：login/register/reset_password
 * @returns {Promise}
 */
export function sendSmsCode(phoneNum, purpose = 'login') {
	return request.post('/api/v1/auth/send-code', {
		phone_num: phoneNum,
		purpose: purpose
	})
}

/**
 * 3. 验证码登录（首次登录自动注册）
 * @param {string} phoneNum - 手机号
 * @param {string} code - 验证码
 * @returns {Promise}
 */
export function loginByCode(phoneNum, code) {
	return request.post('/api/v1/auth/code-login', {
		phone_num: phoneNum,
		code: code
	})
}

/**
 * 4. 用户注册
 * @param {Object} data - 注册信息
 * @param {string} data.username - 用户名（姓名）
 * @param {string} data.password - 密码
 * @param {string} data.confirmPassword - 确认密码
 * @param {string} data.companyName - 企业名称（可选）
 * @param {string} data.phoneNum - 手机号
 * @param {string} data.code - 验证码
 * @returns {Promise}
 */
export function register(data) {
	return request.post('/api/v1/auth/register', {
		username: data.username,
		password: data.password,
		confirm_password: data.confirmPassword,
		company_name: data.companyName || null,
		phone_num: data.phoneNum,
		code: data.code
	})
}

/**
 * 5. 微信登录 - 生成二维码
 * @returns {Promise}
 */
export function getWeChatQRCode() {
	return request.get('/api/v1/auth/wechat/qrcode')
}

/**
 * 6. 微信登录 - 查询二维码扫码状态
 * @param {string} qrcodeId - 二维码ID
 * @returns {Promise}
 */
export function checkQRCodeStatus(qrcodeId) {
	return request.get(`/api/v1/auth/wechat/qrcode/${qrcodeId}/status`)
}

/**
 * 7. 微信登录 - 完成登录
 * @param {string} code - 微信授权码
 * @returns {Promise}
 */
export function loginByWechat(code) {
	return request.post('/api/v1/auth/wechat/login', {
		code: code
	})
}

/**
 * 8. 微信登录 - 模拟扫码（测试用）
 * @param {string} qrcodeId - 二维码ID
 * @returns {Promise}
 */
export function mockWeChatScan(qrcodeId) {
	return request.post('/api/v1/auth/wechat/mock-scan', {
		qrcode_id: qrcodeId
	})
}

/**
 * 9. 获取当前用户信息
 * @returns {Promise}
 */
export function getUserInfo() {
	return request.get('/api/v1/auth/profile')
}

/**
 * 10. 用户登出
 * @returns {Promise}
 */
export function logout() {
	return request.post('/api/v1/auth/logout')
}
