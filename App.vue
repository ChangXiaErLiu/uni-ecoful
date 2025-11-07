<script setup>
import { onHide, onLaunch, onShow } from '@dcloudio/uni-app'

// 应用生命周期中记录关键节点，后续可接入埋点
onLaunch(() => {
  console.log('应用启动')
})

onShow(() => {
  console.log('应用进入前台')
})

onHide(() => {
  console.log('应用进入后台')
})
</script>

<style lang="scss">
@import '@/uni.scss';

/* 中文注释：可在此编写全局样式或 CSS 变量 */

/* #ifdef H5 */
/* 中文注释：H5 端确保外层容器占满视口并禁止 body 滚动，滚动交由页面内容容器处理 */
html, body, #app {
  height: 100%;
  overflow: hidden;
}
/* #endif */
</style>
