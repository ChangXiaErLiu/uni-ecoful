/**
 * 现场踏勘相关 API
 * 负责所有现场踏勘模块的网络请求
 * author: zyg
 * date: 2025.12.19
 */
import { request } from '@/utils/request.js'

/**
 * 获取主体工程数据
 * @param {number|string} userId - 用户ID
 * @param {number|string} projectId - 项目ID
 * @returns {Promise} 返回主体工程数据
 */
export function fetchConstructionData(userId, projectId) {
	return request.get('/api/v1/completion/tzdDetail/getConstructContent', {
		data: {
			user_id: userId,
			project_id: projectId
		}
	})
}

/**
 * 获取设备列表数据
 * @param {number|string} userId - 用户ID
 * @param {number|string} projectId - 项目ID
 * @returns {Promise} 返回设备列表数据
 */
export function fetchEquipmentData(userId, projectId) {
	return request.get('/api/v1/completion/tzdDetail/getDeviceDetail', {
		data: {
			user_id: userId,
			project_id: projectId
		}
	})
}

// 治理设施数据已改为从项目基本信息中提取，不再调用后端接口
