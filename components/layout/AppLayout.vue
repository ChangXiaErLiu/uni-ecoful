<!-- 主框架（UTF-8，中文注释） -->
<template>
	<view class="AppLayout" :class="layoutClass">
		<!-- 顶部安全区占位 + 导航（移动端显示） -->
		<uni-nav-bar :title="navTitle.title" v-if="!isDesktop" statusBar fixed :placeholder="true" :border="false"
			:shadow="false" height="42" :backgroundColor="'#ffffff'" :left-text="showBack ? '返回' : ''" :left-icon="showBack ? 'left' : ''"
			@clickLeft="goBackSafely" style="font-weight: bold;" />
		<view v-if="isDesktop" class="AppLayout__sider">
			<NavSider :items="navItemsPc" :current="activePath" @navigate="handleNavigate" />
		</view>

		<view class="AppLayout__main">
			<!-- #ifdef H5 -->
			<!-- H5 端外层是否滚动由 contentScroll 控制，避免双滚动容器 -->
			<view class="AppLayout__content" :class="{ 'AppLayout__content--no-scroll': !contentScroll }">
				<slot />
			</view>
			<!-- #endif -->

			<!-- #ifndef H5 -->
			<!-- App/小程序默认外层滚动；如页面需自管滚动，可通过 props 关闭 -->
			<template v-if="contentScroll">
				<scroll-view class="AppLayout__content" :scroll-y="true" enable-flex>
					<slot />
				</scroll-view>
			</template>
			<template v-else>
				<view class="AppLayout__content">
					<slot />
				</view>
			</template>
			<!-- #endif -->
		</view>
	</view>
</template>

<script setup>
	import {
		computed,
		ref,
		watch
	} from 'vue'
	import NavSider from './NavSider.vue'
	import {
		usePlatformInfo
	} from '@/utils/platform'
	import {
		useSafeArea
	} from '@/utils/safe-area'
	import {
		navTitleStore
	} from '@/stores/navTitle.js'
	const navTitle = navTitleStore()

	// 组件入参
	const props = defineProps({
		current: {
			type: String,
			required: true
		},
		// 非 H5 生效：是否由 AppLayout 外层承担滚动
		contentScroll: {
			type: Boolean,
			default: true
		}
	})

	const emit = defineEmits(['navigate'])
	const {
		isDesktop
	} = usePlatformInfo()
	const activePath = ref(props.current)
	const {
		totalNavHeightPx
	} = useSafeArea()

	watch(() => props.current, (value) => {
		activePath.value = value
	})

	const layoutClass = computed(() => (isDesktop.value ? 'AppLayout--desktop' : 'AppLayout--mobile'))

	// 顶部占位样式（避免 fixed 导航遮挡内容）
	const topSpacerStyle = computed(() => `height:${(totalNavHeightPx || { value: 64 }).value}px;`)

	// ====== 返回按钮判定与行为（仅优化返回功能，其他逻辑不改动）======
	// 中文注释：为避免影响现有功能，仅在移动端（!isDesktop）且非 Tab 页时显示返回图标
	// 规范化当前路径，确保以 / 开头，便于与 Tab 集合对比
	const currentUrl = computed(() => {
		const p = String(activePath.value || '').trim()
		return p.startsWith('/') ? p : '/' + p
	})

	// Tab 页集合：用于判断是否显示返回按钮（这些页面不显示返回）
	const TAB_PAGES = new Set([
		'/pages/home/index',
		'/pages/knowledge/index',
		'/pages/profile/index',
	])

	// 是否显示返回按钮（仅在移动端且非 Tab 页）
	const showBack = computed(() => !isDesktop.value && !TAB_PAGES.has(currentUrl.value))

	// 安全返回：优先使用历史返回；无历史栈时按分类兜底
	function goBackSafely() {
		// 优先返回上一级（存在历史栈）
		try {
			const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : []
			if (Array.isArray(pages) && pages.length > 1) {
				uni.navigateBack()
				return
			}
		} catch (e) {
			// 忽略异常，继续兜底逻辑
		}

		// 兜底：个人中心子页 → 我的 Tab；其他子页 → 首页 Tab
		const url = currentUrl.value
		if (url.startsWith('/pages/profile/') && url !== '/pages/profile/index') {
			try {
				uni.switchTab({
					url: '/pages/profile/index'
				})
			} catch (e) {
				uni.redirectTo({
					url: '/pages/profile/index'
				})
			}
		} else {
			try {
				uni.switchTab({
					url: '/pages/home/index'
				})
			} catch (e) {
				uni.redirectTo({
					url: '/pages/home/index'
				})
			}
		}
	}

	// 桌面侧栏导航项（新增首页；其余功能保留为快捷入口）
	const navItemsPc = [{
			path: 'pages/home/index',
			label: '首页',
			icon: 'home'
		},
		{
			path: 'pages/chat/index',
			label: 'AI问答',
			icon: 'chat'
		},
		{
			path: 'pages/doc-generator/index',
			label: '报告生成',
			icon: 'compose'
		},
		{
			path: 'pages/compliance/index',
			label: '报告审查',
			icon: 'calendar'
		},
		{
			path: 'pages/knowledge/index',
			label: '知识库',
			icon: 'folder-add'
		},
		{
			path: 'pages/profile/index',
			label: '个人中心',
			icon: 'person'
		},
	]

	// 统一跳转逻辑
	// - 目标为 tabBar 页面：使用 switchTab
	// - 其它页面：使用 redirectTo（可按需替换 navigateTo/reLaunch）
	function handleNavigate(item) {
		if (!item?.path || item.path === activePath.value) return
		emit('navigate', item.path)
		const url = item.path.startsWith('/') ? item.path : `/${item.path}`
		const tabPages = new Set([
			'/pages/home/index',
			'/pages/knowledge/index',
			'/pages/profile/index',
		])

		if (tabPages.has(url)) {
			try {
				uni.switchTab({
					url
				})
			} catch (e) {
				uni.redirectTo({
					url
				})
			}
		} else {
			uni.redirectTo({
				url
			})
		}
	}

	// 根据屏幕宽度控制官方 tabBar 显隐
	// - 桌面端（>=1024）隐藏底部 tabBar，仅显示左侧侧栏
	// - 移动端显示底部 tabBar
	watch(() => isDesktop.value, (val) => {
	  // 只在 TabBar 页面调用
	  if (!TAB_PAGES.has(currentUrl.value)) {
	    return
	  }
	  
	  try {
	    if (val) uni.hideTabBar()
	    else uni.showTabBar()
	  } catch (e) {}
	}, {
	  immediate: true
	})
</script>

<style lang="scss" scoped>
	.AppLayout {
		display: flex;
		width: 100%;
		background-color: #f5f7fa;
		color: #1f2329;
	}

	.AppLayout__sider {
		width: 350rpx;
		max-width: 320px;
		background-color: #ffffff;
		border-right: 1px solid rgba(0, 0, 0, 0.08);
		box-shadow: 4rpx 0 12rpx rgba(15, 23, 42, 0.04);
	}

	.AppLayout__main {
		flex: 1;
		display: flex;
		flex-direction: column;
		// background-color: #f5f7fa;
		height: 100%;
		min-height: 0;
		overflow: hidden;
	}

	.AppLayout__content {
		flex: 1;
		// padding: 24rpx;
		box-sizing: border-box;
		height: 100%;
		min-height: 0;
		overflow: auto;
		background-color: white;
	}

	/* 当页面声明由自身管理滚动（如聊天页），H5 端需关闭外层滚动 */
	.AppLayout__content--no-scroll {
		overflow: hidden;
	}

	.AppLayout--mobile {
		flex-direction: column;
	}

	/* #ifdef H5 */
	/* H5 高度策略：优先使用 100dvh，兼容 iOS Safari 地址栏收缩；提供 100vh 回退 */
	.AppLayout {
		height: 100dvh;
		height: 100vh;
		overflow: hidden;
	}

	/* #endif */

	/* #ifdef MP-WEIXIN */
	/* 让小程序根节点有参照高度，百分比高度才能生效 */
	page {
		height: 100%;
	}

	.AppLayout {
		height: 100dvh;
		height: 100vh;
		display: flex;
		flex-direction: column;
	}

	/* #endif */
</style>