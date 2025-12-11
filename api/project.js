/**
 * 项目管理接口方法
 * author:zyg
 * date:2025.12.1
 */
import {
	request
} from '@/utils/request.js'
import {
	BASE_URL
} from '@/utils/config.js'
/* ================== 1. 项目基础 ================== */
/**
 * 创建项目
 * @param {Object} data
 * @param {string} data.name          项目名称（必填）
 * @param {string} data.description   项目背景（可选）
 * @param {string} data.notes         备注（可选）
 * @param {number[]} data.member_ids  项目成员用户 ID 数组（可选）
 * @returns {Promise}
 */
export function createProjects(data) {
	return request.post('/api/v1/project/projects', data)
}

/**
 * 获取项目列表
 * @returns {Promise<Array>} 返回项目列表数组
 */
export function getProjects() {
	return request.get('/api/v1/project/projects')
}

/**
 * 获取项目详情
 * @param {number} projectId 项目ID
 * @returns {Promise<Object>} 返回项目详情对象
 */
export function getProjectDetail(projectId) {
	return request.get(`/api/v1/project/projects/${projectId}`)
}

/**
 * 更新项目
 * @param {number} projectId 项目ID
 * @param {Object} data 更新数据
 * @param {string} data.name          项目名称（可选）
 * @param {string} data.description   项目背景（可选）
 * @param {string} data.notes         备注（可选）
 * @param {number[]} data.member_ids  项目成员用户 ID 数组（可选，覆盖模式）
 * @returns {Promise<Object>} 返回更新后的项目信息
 */
export function updateProject(projectId, data) {
	return request.patch(`/api/v1/project/projects/${projectId}`, data)
}

/**
 * 删除项目
 * @param {number} projectId 项目ID
 * @returns {Promise<Object>} 返回删除结果
 */
export function deleteProject(projectId) {
	return request.delete(`/api/v1/project/projects/${projectId}`)
}


/* ================== 2. 成员管理 ================== */
/**
 * 获取项目成员列表
 * @param {number} projectId 项目ID
 * @returns {Promise<Object>} 返回成员列表和总数
 */
export function getProjectMembers(projectId) {
	return request.get(`/api/v1/project/projects/${projectId}/members`)
}

/**
 * 添加项目成员
 * @param {number} projectId 项目ID
 * @param {number} userId 用户ID
 * @returns {Promise<Object>} 返回添加结果
 */
export function addProjectMember(projectId, userId) {
	return request.post(`/api/v1/project/projects/${projectId}/members`, {
		user_id: userId
	})
}

/**
 * 移除项目成员
 * @param {number} projectId 项目ID
 * @param {number} userId 用户ID
 * @returns {Promise<Object>} 返回移除结果
 */
export function removeProjectMember(projectId, userId) {
	return request.delete(`/api/v1/project/projects/${projectId}/members/${userId}`)
}


/* ================== 3. 文件管理 ================== */
// 因为微信小程序和h5、图片、文件上传处理方法不一样，因此要区分
// 参考地址:https://uniapp.dcloud.net.cn/api/media/file.html#choosefile

/** 选择文件（H5、App、微信小程序通用）
 * 内部自动区分平台，返回统一格式 { path, name, size, type, file? }
 * 失败或取消返回 null
 */
export function pickProjectFile() {
	const isMp = () => process.env.UNI_PLATFORM === 'mp-weixin'
	const isH5 = () => process.env.UNI_PLATFORM === 'h5'

	/* 1. H5 使用原生 input 获取真正的 File 对象 */
	if (isH5()) {
		return new Promise(resolve => {
			const input = document.createElement('input')
			input.type = 'file'
			input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.md,.txt,.jpg,.jpeg,.png'
			
			input.onchange = (e) => {
				const file = e.target.files[0]
				if (!file) {
					resolve(null)
					return
				}
				
				const max = 500 * 1024 * 1024
				if (file.size > max) {
					uni.showToast({ title: '文件不能超过 500 MB', icon: 'none' })
					resolve(null)
					return
				}
				
				resolve({
					path: '',  // H5 不需要 path
					name: file.name,
					size: file.size,
					type: getFileExt(file.name),
					file: file  // 原生 File 对象
				})
			}
			
			input.click()
		})
	}

	/* 2. 微信小程序 / App：同步 API */
	let res
	try {
		if (isMp()) {
			res = wx.chooseMessageFile({
				count: 1,
				type: 'file'
			})
		} else {
			res = uni.chooseFile({
				count: 1,
				type: 'all',
				extension: []
			})
		}
	} catch (e) {
		return Promise.resolve(null)
	}
	return Promise.resolve(res).then(r => wrapFile(r.tempFiles[0]))
}

/* 公用包装 */
function wrapFile(raw) {
  if (!raw) return null
  const max = 500 * 1024 * 1024
  if (raw.size > max) {
    uni.showToast({ title: '文件不能超过 500 MB', icon: 'none' })
    return null
  }
  return {
    path: raw.path || raw.tempFilePath,
    name: raw.name || 'unknown',
    size: raw.size,
    type: getFileExt(raw.name),
    file: raw
  }
}

/*** 选择图片（uni.chooseImage 封装）*/
export function pickProjectImage() {
	const isH5 = () => process.env.UNI_PLATFORM === 'h5'

	// ⚡️ H5 环境：使用原生 input 获取真正的 File 对象
	if (isH5()) {
		return new Promise(resolve => {
			const input = document.createElement('input')
			input.type = 'file'
			input.accept = 'image/jpeg,image/jpg,image/png'
			
			input.onchange = (e) => {
				const file = e.target.files[0]
				if (!file) {
					resolve(null)
					return
				}
				
				const max = 100 * 1024 * 1024
				if (file.size > max) {
					uni.showToast({
						title: '图片不能超过 100 MB',
						icon: 'none'
					})
					resolve(null)
					return
				}
				
				resolve({
					path: '',  // H5 不需要 path
					name: file.name,
					size: file.size,
					type: getFileExt(file.name),
					file: file  // 原生 File 对象
				})
			}
			
			input.click()
		})
	}

	// 微信小程序/App：同步 API
	let res
	try {
		res = uni.chooseImage({
			count: 1
		})
	} catch (e) {
		return Promise.resolve(null)
	}

	return Promise.resolve(res)
		.then(res => (res.tempFiles || [])[0])
		.then(raw => {
			if (!raw) return null

			const max = 100 * 1024 * 1024
			if (raw.size > max) {
				uni.showToast({
					title: '图片不能超过 100 MB',
					icon: 'none'
				})
				return null
			}

			return {
				path: raw.path || raw.tempFilePath,
				name: raw.name || 'image.jpg',
				size: raw.size,
				type: getFileExt(raw.name),
				file: raw
			}
		})
		.catch(() => null)
}

// 辅助函数
function getFileExt(filename) {
	if (!filename) return ''
	const parts = filename.split('.')
	return parts.length > 1 ? parts.pop().toLowerCase() : ''
}

/**
 * 真正上传（内部自动区分平台）
 * @param {Number} projectId
 * @param {Object} fileInfo 上面两个函数返回的对象
 * @returns {Promise<Object>} 后端返回的文档信息
 */
export async function uploadProjectFile(projectId, fileInfo) {
	if (!fileInfo) throw new Error('未选择文件')

	const isMp = () => process.env.UNI_PLATFORM === 'mp-weixin'
	const isH5 = () => process.env.UNI_PLATFORM === 'h5'

	// 小程序走 uploadFile
	if (isMp()) {
		return request.upload(
			`/api/v1/project/projects/${projectId}/documents/upload`,
			fileInfo.path, {
				name: 'file',
				formData: {
					filename: fileInfo.name
				},
				hideLoading: true
			}
		)
	}

	// H5 使用原生 fetch 上传
	if (isH5()) {
		const fd = new FormData()
		fd.append('file', fileInfo.file)
		
		const token = uni.getStorageSync('token')
		
		const response = await fetch(`${BASE_URL}/api/v1/project/projects/${projectId}/documents/upload`, {
			method: 'POST',
			headers: {
				'Authorization': token ? `Bearer ${token}` : ''
			},
			body: fd
		})
		
		if (!response.ok) {
			const error = await response.json()
			throw new Error(error.detail || '上传失败')
		}
		
		return await response.json()
	}

	// App 走 FormData（如果需要）
	const fd = new FormData()
	fd.append('file', fileInfo.file)
	return request.post(
		`/api/v1/project/projects/${projectId}/documents/upload`,
		fd, {
			headers: {
				'Content-Type': 'multipart/form-data'
			}
		}
	)
}

/**
 * 获取项目文件列表
 * @param {number} projectId 项目ID
 * @param {Object} params 查询参数（可选）
 * @param {number} params.page 页码
 * @param {number} params.size 每页数量
 * @returns {Promise<Object>} 返回文件列表和总数
 */
export function getProjectDocuments(projectId, params = {}) {
	return request.get(`/api/v1/project/projects/${projectId}/documents`, {
		params
	})
}

/**
 * 下载项目文件
 * @param {number} projectId 项目ID
 * @param {string} documentId 文件ID
 * @returns {Promise<Blob|String>} H5 返回 Blob，小程序返回临时文件路径
 */
export async function downloadProjectFile(projectId, documentId) {
	const isH5 = () => process.env.UNI_PLATFORM === 'h5'
	const isMp = () => process.env.UNI_PLATFORM === 'mp-weixin'
	
	// H5 使用原生 fetch 下载
	if (isH5()) {
		const token = uni.getStorageSync('token')
		
		const response = await fetch(`${BASE_URL}/api/v1/project/projects/${projectId}/documents/${documentId}/download`, {
			method: 'GET',
			headers: {
				'Authorization': token ? `Bearer ${token}` : ''
			}
		})
		
		if (!response.ok) {
			throw new Error('下载失败')
		}
		
		return await response.blob()
	}
	
	// 小程序使用 uni.downloadFile
	if (isMp()) {
		const token = uni.getStorageSync('token')
		
		return new Promise((resolve, reject) => {
			uni.downloadFile({
				url: `${BASE_URL}/api/v1/project/projects/${projectId}/documents/${documentId}/download`,
				header: {
					'Authorization': token ? `Bearer ${token}` : ''
				},
				success: (res) => {
					if (res.statusCode === 200) {
						resolve(res.tempFilePath)
					} else {
						reject(new Error('下载失败'))
					}
				},
				fail: (err) => {
					reject(err)
				}
			})
		})
	}
	
	// App 平台（如果需要）
	return request.get(
		`/api/v1/project/projects/${projectId}/documents/${documentId}/download`, {
			responseType: 'blob'
		}
	)
}

/**
 * 删除项目文件
 * @param {number} projectId 项目ID
 * @param {string} documentId 文件ID
 * @returns {Promise<Object>} 返回删除结果
 */
export async function removeProjectFile(projectId, documentId) {
	return request.delete(
		`/api/v1/project/projects/${projectId}/documents/${documentId}`
	)
}


/**
 * 批量上传项目文件
 * @param {number} projectId 项目ID
 * @param {Array} fileList 文件列表 [{file: File, name: string, size: number}, ...]
 * @returns {Promise<Object>} 返回 task_id 和任务信息
 */
export async function batchUploadProjectFiles(projectId, fileList) {
	const isH5 = () => process.env.UNI_PLATFORM === 'h5'
	
	// H5 使用原生 fetch 上传
	if (isH5()) {
		const fd = new FormData()
		
		// 添加所有文件
		fileList.forEach(fileInfo => {
			fd.append('files', fileInfo.file)
		})
		
		const token = uni.getStorageSync('token')
		
		const response = await fetch(`${BASE_URL}/api/v1/project/projects/${projectId}/documents/batch-upload`, {
			method: 'POST',
			headers: {
				'Authorization': token ? `Bearer ${token}` : ''
			},
			body: fd
		})
		
		if (!response.ok) {
			const error = await response.json()
			throw new Error(error.detail || '批量上传失败')
		}
		
		return await response.json()
	}
	
	// 小程序：逐个上传（因为小程序不支持批量上传接口）
	// 或者可以调用批量接口，但需要特殊处理
	throw new Error('小程序暂不支持批量上传，请使用单文件上传')
}

/**
 * 查询批量上传任务状态
 * @param {string} taskId 任务ID
 * @returns {Promise<Object>} 返回任务状态信息
 */
export async function getTaskStatus(taskId) {
	return request.get(`/api/v1/tasks/${taskId}/status`)
}
