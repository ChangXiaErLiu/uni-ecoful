<script setup>
	import {
		onHide,
		onLaunch,
		onShow
	} from '@dcloudio/uni-app'
	import {
		useUserStore
	} from '@/stores/user.js'
	
	// 用户信息
	const userStore = useUserStore()
	// 1. 把 token 读进内存（pinia 构造函数已做）
	// 2. 把 userInfo 读进内存
	userStore.initUserInfo()

</script>

<style lang="scss">
	@import '@/uni.scss';

	/* 中文注释：可在此编写全局样式或 CSS 变量 */

	/* #ifdef H5 */
	/* 中文注释：H5 端确保外层容器占满视口并禁止 body 滚动，滚动交由页面内容容器处理 */
	html,
	body,
	#app {
		height: 100%;
		overflow: hidden;
	}

	/* #endif */
</style>