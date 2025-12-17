import {
	createPinia
} from 'pinia'

/**
 * API 统一出口
 * 方便在页面中一次性导入所有接口
 */

// ai聊天界面相关
export * from './chat'

// 验收报告相关
export {
	runTask,
	transformExtractResult,
	downloadSignboardWord,
	downloadMonitorPlan
}
from './acceptance.js'

// 项目管理相关
export  * from './project'

let piniaInstance = null

// 对外提供统一的 pinia 安装入口，避免重复创建实例
export function setupStore(app) {
	if (!piniaInstance) {
		piniaInstance = createPinia()
	}
	app.use(piniaInstance)
	return piniaInstance
}

export function getPinia() {
	return piniaInstance
}