<template>
	<view class="auth">
		<view class="auth__card">
			<view class="auth__header">
				<text class="auth__title">注册新账户</text>
				<text class="auth__subtitle">完善基础信息，开启智能办公新体验</text>
			</view>

			<view class="auth__form">
				<!-- 企业名称输入 -->
				<view class="auth__input-group">
					<uni-icons type="home" size="20" color="#64748b" class="auth__input-icon"></uni-icons>
					<input v-model="company" class="auth__input" placeholder="请输入企业或组织名称" />
				</view>

				<!-- 姓名输入 -->
				<view class="auth__input-group">
					<uni-icons type="person" size="20" color="#64748b" class="auth__input-icon"></uni-icons>
					<input v-model="name" class="auth__input" placeholder="请输入姓名" />
				</view>

				<!-- 手机号输入 -->
				<view class="auth__input-group">
					<uni-icons type="phone" size="20" color="#64748b" class="auth__input-icon"></uni-icons>
					<input v-model="mobile" class="auth__input" placeholder="请输入手机号" type="number" maxlength="11" />
				</view>

				<!-- 验证码输入 -->
				<view class="auth__input-group">
					<uni-icons type="chat" size="20" color="#64748b" class="auth__input-icon"></uni-icons>
					<input v-model="code" class="auth__input auth__input--code" placeholder="请输入验证码" type="number"
						maxlength="6" />
					<button class="auth__code-btn" :disabled="codeCountdown > 0" @tap="sendCode">
						{{ codeCountdown > 0 ? `${codeCountdown}s后重发` : '发送验证码' }}
					</button>
				</view>

				<!-- 密码输入 -->
				<view class="auth__input-group">
					<uni-icons type="locked" size="20" color="#64748b" class="auth__input-icon"></uni-icons>
					<input v-model="password" class="auth__input" placeholder="请输入密码"
						:type="showPassword ? 'text' : 'password'" />
					<uni-icons :type="showPassword ? 'eye-slash' : 'eye'" size="20" color="#64748b"
						class="auth__password-toggle" @tap="togglePassword"></uni-icons>
				</view>

				<!-- 确认密码输入 -->
				<view class="auth__input-group">
					<uni-icons type="locked" size="20" color="#64748b" class="auth__input-icon"></uni-icons>
					<input v-model="confirmPassword" class="auth__input" placeholder="请再次输入密码"
						:type="showConfirmPassword ? 'text' : 'password'" />
					<uni-icons :type="showConfirmPassword ? 'eye-slash' : 'eye'" size="20" color="#64748b"
						class="auth__password-toggle" @tap="toggleConfirmPassword"></uni-icons>
				</view>

				<!-- 密码强度提示 -->
				<view v-if="password" class="auth__password-strength">
					<text class="auth__password-strength-text">密码强度：</text>
					<view class="auth__password-strength-bar">
						<view class="auth__password-strength-segment" :class="getStrengthClass(1)"></view>
						<view class="auth__password-strength-segment" :class="getStrengthClass(2)"></view>
						<view class="auth__password-strength-segment" :class="getStrengthClass(3)"></view>
					</view>
					<text class="auth__password-strength-label">{{ getPasswordStrength() }}</text>
				</view>

				<!-- 密码匹配提示 -->
				<view v-if="confirmPassword && password !== confirmPassword" class="auth__password-match">
					<uni-icons type="info" size="16" color="#ef4444"></uni-icons>
					<text class="auth__password-match-text">两次输入的密码不一致</text>
				</view>

				<!-- 用户协议 -->
				<view class="auth__agreement">
					<view class="auth__agreement-checkbox" @tap="toggleAgreement">
						<uni-icons :type="agreed ? 'checkbox-filled' : 'circle'" size="20" 
							:color="agreed ? '#2563eb' : '#94a3b8'"></uni-icons>
					</view>
					<text class="auth__agreement-text">
						我已阅读并同意
						<text class="auth__agreement-link" @tap="goAgreement">《用户协议》</text>
						和
						<text class="auth__agreement-link" @tap="goPrivacy">《隐私政策》</text>
					</text>
				</view>

				<!-- 提交按钮 -->
				<button class="auth__button auth__button--primary" :disabled="!agreed" @tap="submit">提交注册</button>

				<!-- 去登录链接 -->
				<view class="auth__footer">
					<text class="auth__footer-text">已有账户？</text>
					<a class="auth__link" @tap="goLogin">去登录</a>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		onUnmounted,
		computed
	} from 'vue'
	import { useUserStore } from '@/stores/user.js'
	import { sendSmsCode } from '@/api/auth.js'

	// 用户状态管理
	const userStore = useUserStore()

	// 响应式数据
	const company = ref('')
	const name = ref('')
	const mobile = ref('')
	const code = ref('')
	const password = ref('')
	const confirmPassword = ref('')
	const codeCountdown = ref(0)
	const showPassword = ref(false)
	const showConfirmPassword = ref(false)
	const agreed = ref(false)
	let countdownTimer = null

	// 密码强度计算
	const passwordStrength = computed(() => {
		if (!password.value) return 0
		
		let strength = 0
		// 长度检查
		if (password.value.length >= 8) strength++
		// 包含小写字母
		if (/[a-z]/.test(password.value)) strength++
		// 包含大写字母
		if (/[A-Z]/.test(password.value)) strength++
		// 包含数字
		if (/\d/.test(password.value)) strength++
		// 包含特殊字符
		if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password.value)) strength++
		
		return Math.min(Math.floor(strength / 2), 3)
	})

	// 发送验证码
	async function sendCode() {
		if (!mobile.value) {
			uni.showToast({
				title: '请输入手机号',
				icon: 'none'
			})
			return
		}

		if (!/^1[3-9]\d{9}$/.test(mobile.value)) {
			uni.showToast({
				title: '手机号格式不正确',
				icon: 'none'
			})
			return
		}

		try {
			// 调用发送验证码接口
			await sendSmsCode(mobile.value, 'register')
			
			uni.showToast({
				title: '验证码已发送',
				icon: 'success'
			})

			// 开始倒计时
			codeCountdown.value = 60
			countdownTimer = setInterval(() => {
				codeCountdown.value--
				if (codeCountdown.value <= 0) {
					clearInterval(countdownTimer)
				}
			}, 1000)
		} catch (error) {
			uni.showToast({
				title: error.message || error.detail || '发送失败',
				icon: 'none'
			})
		}
	}

	// 切换密码显示/隐藏
	function togglePassword() {
		showPassword.value = !showPassword.value
	}

	// 切换确认密码显示/隐藏
	function toggleConfirmPassword() {
		showConfirmPassword.value = !showConfirmPassword.value
	}

	// 切换协议同意状态
	function toggleAgreement() {
		agreed.value = !agreed.value
	}

	// 获取密码强度等级
	function getPasswordStrength() {
		const strengths = ['弱', '中', '强', '很强']
		return strengths[passwordStrength.value] || '弱'
	}

	// 获取密码强度样式类
	function getStrengthClass(segment) {
		if (segment <= passwordStrength.value) {
			return `auth__password-strength-segment--${passwordStrength.value}`
		}
		return ''
	}

	// 提交注册
	async function submit() {
		// 表单验证
		if (!name.value) {
			uni.showToast({
				title: '请输入姓名',
				icon: 'none'
			})
			return
		}

		if (!mobile.value) {
			uni.showToast({
				title: '请输入手机号',
				icon: 'none'
			})
			return
		}

		if (!/^1[3-9]\d{9}$/.test(mobile.value)) {
			uni.showToast({
				title: '手机号格式不正确',
				icon: 'none'
			})
			return
		}

		if (!code.value) {
			uni.showToast({
				title: '请输入验证码',
				icon: 'none'
			})
			return
		}

		if (!password.value) {
			uni.showToast({
				title: '请输入密码',
				icon: 'none'
			})
			return
		}

		if (password.value.length < 6) {
			uni.showToast({
				title: '密码至少6个字符',
				icon: 'none'
			})
			return
		}

		if (password.value !== confirmPassword.value) {
			uni.showToast({
				title: '两次输入的密码不一致',
				icon: 'none'
			})
			return
		}

		if (!agreed.value) {
			uni.showToast({
				title: '请同意用户协议和隐私政策',
				icon: 'none'
			})
			return
		}

		// 调用注册接口
		uni.showLoading({ title: '注册中...', mask: true })

		try {
			const result = await userStore.register({
				username: name.value,        // 姓名作为用户名
				password: password.value,
				confirmPassword: confirmPassword.value,
				companyName: company.value || null,  // 企业名称可选
				phoneNum: mobile.value,
				code: code.value
			})

			uni.hideLoading()

			if (result.success) {
				uni.showToast({
					title: '注册成功',
					icon: 'success',
					duration: 1500
				})

				// 注册成功后直接跳转到首页（已自动登录）
				setTimeout(() => {
					uni.switchTab({ url: '/pages/home/index' })
				}, 1500)
			} else {
				const errorMsg = result.error?.message || result.error?.data?.detail || '注册失败'
				uni.showToast({
					title: errorMsg,
					icon: 'none',
					duration: 2000
				})
			}
		} catch (error) {
			uni.hideLoading()
			console.error('注册异常:', error)
			uni.showToast({
				title: '注册失败，请稍后重试',
				icon: 'none'
			})
		}
	}

	// 查看用户协议
	function goAgreement() {
		uni.navigateTo({
			url: '/pages/agreement/user'
		})
	}

	// 查看隐私政策
	function goPrivacy() {
		uni.navigateTo({
			url: '/pages/agreement/privacy'
		})
	}

	// 去登录
	function goLogin() {
		uni.navigateBack({
			delta: 1
		})
	}

	// 清理定时器
	onUnmounted(() => {
		if (countdownTimer) {
			clearInterval(countdownTimer)
		}
	})
</script>

<style lang="scss" scoped>
	.auth {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		padding: 48rpx;
		background: linear-gradient(135deg, #e0f2fe, #ede9fe);
	}

	.auth__card {
		width: 100%;
		max-width: 640rpx;
		background-color: #ffffff;
		border-radius: 32rpx;
		padding: 48rpx;
		box-shadow: 0 24rpx 60rpx rgba(15, 23, 42, 0.12);
		display: flex;
		flex-direction: column;
		gap: 32rpx;
	}

	.auth__header {
		display: flex;
		flex-direction: column;
		gap: 12rpx;
		text-align: center;
	}

	.auth__title {
		font-size: 40rpx;
		font-weight: 600;
		color: #0f172a;
	}

	.auth__subtitle {
		font-size: 26rpx;
		color: #64748b;
	}

	.auth__form {
		display: flex;
		flex-direction: column;
		gap: 32rpx;
	}

	.auth__input-group {
		position: relative;
		display: flex;
		align-items: center;
		border: 1px solid rgba(148, 163, 184, 0.6);
		border-radius: 16rpx;
		overflow: hidden;
		transition: border-color 0.3s ease;

		&:focus-within {
			border-color: #2563eb;
			box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
		}
	}

	.auth__input-icon {
		padding: 0 24rpx;
	}

	.auth__input {
		flex: 1;
		height: 88rpx;
		padding: 0 24rpx;
		font-size: 28rpx;
		border: none;
		outline: none;
	}

	.auth__password-toggle {
		padding: 0 24rpx;
	}

	.auth__input--code {
		border-right: 1px solid rgba(148, 163, 184, 0.3);
	}

	.auth__code-btn {
		height: 88rpx;
		line-height: 88rpx;
		padding: 0 24rpx;
		font-size: 24rpx;
		background-color: transparent;
		color: #2563eb;
		border: none;
		white-space: nowrap;

		&[disabled] {
			color: #94a3b8;
		}
	}

	/* 密码强度指示器 */
	.auth__password-strength {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	.auth__password-strength-text {
		font-size: 24rpx;
		color: #64748b;
		white-space: nowrap;
	}

	.auth__password-strength-bar {
		display: flex;
		gap: 4rpx;
		flex: 1;
	}

	.auth__password-strength-segment {
		height: 8rpx;
		flex: 1;
		background-color: #e2e8f0;
		border-radius: 4rpx;
		transition: all 0.3s ease;

		&--0 {
			background-color: #ef4444;
		}

		&--1 {
			background-color: #f59e0b;
		}

		&--2 {
			background-color: #10b981;
		}

		&--3 {
			background-color: #10b981;
		}
	}

	.auth__password-strength-label {
		font-size: 24rpx;
		color: #64748b;
		white-space: nowrap;
	}

	/* 密码匹配提示 */
	.auth__password-match {
		display: flex;
		align-items: center;
		gap: 8rpx;
		padding: 16rpx 24rpx;
		background-color: #fef2f2;
		border: 1px solid #fecaca;
		border-radius: 12rpx;
	}

	.auth__password-match-text {
		font-size: 24rpx;
		color: #dc2626;
	}

	/* 用户协议 */
	.auth__agreement {
		display: flex;
		align-items: flex-start;
		gap: 12rpx;
	}

	.auth__agreement-checkbox {
		padding: 4rpx;
	}

	.auth__agreement-text {
		flex: 1;
		font-size: 24rpx;
		color: #64748b;
		line-height: 1.4;
	}

	.auth__agreement-link {
		color: #2563eb;
	}

	/* 按钮 */
	.auth__button {
		height: 88rpx;
		line-height: 88rpx;
		font-size: 28rpx;
		border: none;
		border-radius: 16rpx;
		background-color: #e2e8f0;
		color: #334155;
		margin-left: 0;
		margin-right: 0;
		transition: all 0.3s ease;

		&:active {
			transform: translateY(2rpx);
		}

		&[disabled] {
			background-color: #e2e8f0;
			color: #94a3b8;
			transform: none;
		}
	}

	.auth__button--primary {
		background: linear-gradient(135deg, #2563eb, #3b82f6);
		color: #ffffff;

		&[disabled] {
			background: #e2e8f0;
			color: #94a3b8;
		}
	}

	.auth__footer {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 12rpx;
		font-size: 26rpx;
	}

	.auth__footer-text {
		color: #64748b;
	}

	.auth__link {
		color: #2563eb;
		background: transparent;
		font-size: 26rpx;
	}
</style>