/**
 * api/acceptance.js
 * 验收报告页面，各个方法总结
 */

import {
	BASE_URL
} from '@/utils/config.js'
import {
	request
} from '@/utils/request.js'

//---------- 文件上传、文件处理方法----------------//
/**
 * 上传单个文件到后端
 * @param {Object} file - uni-file-picker返回的文件对象
 * @returns {Promise} 上传结果
 */
export async function uploadFileToBackend(file) {
	return new Promise((resolve, reject) => {
		// 获取文件路径
		const filePath = file.url || file.path || file.tempFilePath
		const fileName = file.name || '环评报告.pdf'

		if (!filePath) {
			reject(new Error('文件路径无效'))
			return
		}

		uni.uploadFile({
			url: BASE_URL + '/api/v1/documents/upload',
			filePath: filePath,
			name: 'file',
			formData: {
				category: 'eia_report' // 标记为环评报告
			},
			success: (res) => {
				try {
					const data = JSON.parse(res.data)
					if (res.statusCode === 200) {
						resolve({
							success: true,
							document_id: data.document_id,
							filename: data.filename,
							size_bytes: data.size_bytes,
							upload_time: data.upload_time
						})

					} else {
						reject(new Error(data.detail || '上传失败'))
					}
				} catch (e) {
					reject(new Error('解析响应失败'))
				}
			},
			fail: (error) => {
				reject(new Error('网络请求失败'))
			}
		})
	})
}

/**
 * 批量上传文件
 * @param {Array} files - 文件数组
 * @returns {Promise} 上传结果数组
 */
export async function uploadMultipleFiles(files) {
	if (!files || files.length === 0) {
		throw new Error('没有选择文件')
	}

	const uploadPromises = files.map(file => uploadFileToBackend(file))
	return await Promise.all(uploadPromises)
}


/**
 * 获取已上传文件列表
 * @returns {Promise<Array>} 格式化后的文件列表
 */
export async function fetchUploadedFiles() {
  try {
    const res = await request.get('/api/v1/documents?skip=0&limit=1000')
    if (Array.isArray(res)) {
      return res.map(file => ({
        name: file.filename,
        ext: file.metadata?.file_extension || '',
        url: `BASE_URL/${file.file_path.replace(/\\\\/g, '/')}`, // 构造预览地址（可选）
        document_id: file.document_id,
        size: file.size_bytes,
        upload_time: file.upload_time
      }))
    }
    return []
  } catch (error) {
    console.error('自动刷新文件列表失败:', error)
    return []
  }
}

/**
 * 删除指定上传的文件
 * @param {string} document_id
 * @returns {Promise<void>}
 */
export async function deleteFile(document_id) {
  if (!document_id) throw new Error('document_id 不能为空')
  await request.delete(`/api/v1/documents/${document_id}`)
}

/**
 * 临时测试构建向量方案：硬编码 source_dir，后端需要优化
 * @param {Object} options - 选项
 * @param {boolean} options.hideLoading - 是否隐藏 loading（默认 false）
 */
export async function rebuildIndex(options = {}) {
	const {
		hideLoading = false
	} = options;

	const TEST_SOURCE_DIR = './storage/project_completion_and_acceptance/uploads'

	return request.post('/api/v1/index/build', {
		source_dir: TEST_SOURCE_DIR,
		split_by_heading: true
	}, {
		hideLoading,
		timeout: 900000 // 增加：15分钟超时（900秒）
	});
}

/**
 * 执行任务（提取项目信息）
 * @param {Object} options - 选项
 * @param {boolean} options.hideLoading - 是否隐藏 loading
 * @param {number} options.timeout - 超时时间（毫秒）
 * @returns {Promise<Object>} 任务执行结果
 */
export async function runTask(options = {}) {
	const {
		hideLoading = false,
			timeout = 600000 // 默认10分钟
	} = options

	try {
		const result = await request.get(`/api/v1/index-parallel-extract-info/EIA`, {
			timeout,
			hideLoading
		})

		// 数据校验
		if (!result || result.status !== 'success') {
			throw new Error(result?.message || '任务执行失败')
		}

		// 适配新接口：从 extract_info.result 中提取数据
		if (!result.extract_info?.result || Object.keys(result.extract_info.result).length === 0) {
			throw new Error('未提取到任何项目信息，请检查文件内容是否完整')
		}

		// 返回前端期望的格式（保持向后兼容）
		return {
			status: result.status,
			result: result.extract_info.result
		}
	} catch (error) {
		// 错误分类处理
		if (error.code === 'NETWORK_ERROR' && error.message.includes('timeout')) {
			throw new Error('提取超时：文档过大或网络不稳定，请稍后重试')
		} else if (error.code === 'HTTP_ERROR' && error.message.includes('404')) {
			throw new Error('任务不存在，请联系管理员配置')
		} else {
			throw error
		}
	}
}

/**
 * 转换后端提取结果为 baseTable 格式（支持嵌套对象）
 * @param {Object} result - 后端返回的 result 对象
 * @returns {Array} baseTable 格式的数组
 */
export function transformExtractResult(result) {
	// 完整的字段映射表：后端中文 key -> 英文 id + 显示标签
	const FIELD_MAP = {
		// 基本信息
		'建设项目名称': {
			id: 'project_name',
			label: '建设项目名称'
		},
		'建设单位名称': {
			id: 'company_name',
			label: '建设单位名称'
		},
		'建设地点': {
			id: 'project_address',
			label: '建设地点'
		},
		'建设项目性质': {
			id: 'project_type',
			label: '建设项目性质'
		},
		'产品及产能': {
			id: 'product_scale',
			label: '产品及产能'
		},

		// 审批信息
		'环评报告表审批部门': {
			id: 'assessment_department',
			label: '环评报告表审批部门'
		},
		'环评报告表编制单位': {
			id: 'assessment_unit',
			label: '环评报告表编制单位'
		},

		// 投资信息
		'投资总概算(万元)': {
			id: 'investment',
			label: '投资总概算(万元)'
		},
		'环保投资总概算(万元)': {
			id: 'env_investment',
			label: '环保投资总概算(万元)'
		},
		'比例': {
			id: 'env_investment_ratio',
			label: '环保投资占比'
		},

		// 建设内容
		'主要建设内容': {
			id: 'construction_content',
			label: '主要建设内容'
		},
		'改扩建项目变动情况': {
			id: 'project_changes',
			label: '改扩建项目变动情况'
		},

		// 污染物
		'生产工艺': {
			id: 'production_process',
			label: '生产工艺'
		},
		'噪声执行标准': {
			id: 'noise_standard',
			label: '噪声标准'
		},
		'固体废物产生情况': {
			id: 'solid_generation',
			label: '固体废物产生情况'
		},
		'污染物产排情况': {
			id: 'pollutants_emission',
			label: '污染物产排情况',
			type: 'table' // 添加类型标识
		},

	}

	const baseTable = []

	// 遍历 result 对象
	Object.entries(result).forEach(([chineseKey, value]) => {
		// 如果有映射，按映射显示
		if (FIELD_MAP[chineseKey]) {
			const fieldConfig = FIELD_MAP[chineseKey]

			// ✅ 特殊处理表格类型数据
			if (fieldConfig.type === 'table') {
				baseTable.push({
					id: fieldConfig.id,
					label: fieldConfig.label,
					value: value, // 保留原始对象，不进行格式化
					source: 'extracted',
					type: 'table' // 前端通过这个类型来识别需要渲染表格
				})
			} else {
				// 普通字段正常处理
				baseTable.push({
					id: fieldConfig.id,
					label: fieldConfig.label,
					value: formatValue(value),
					source: 'extracted'
				})
			}
		}
		// 如果是嵌套对象（但不是表格类型），展开显示
		else if (typeof value === 'object' && value !== null) {
			Object.entries(value).forEach(([subKey, subValue]) => {
				baseTable.push({
					id: `${chineseKey}_${subKey}`,
					label: `${chineseKey} - ${subKey}`,
					value: formatValue(subValue),
					source: 'extracted'
				})
			})
		}
		// 如果没有映射，直接显示
		else {
			baseTable.push({
				id: chineseKey,
				label: chineseKey,
				value: formatValue(value),
				source: 'extracted'
			})
		}
	})



	// 按id顺序排序
	const ORDER = [
		'project_name', // 建设项目名称
		'company_name', // 建设单位名称
		'project_address', // 建设地点
		'project_type', // 建设项目性质
		'product_scale', // 产品及产能
		'assessment_department', // 环评报告表审批部门
		'assessment_unit', // 环评报告表编制单位
		'investment', // 投资总概算(万元)
		'env_investment', // 环保投资总概算(万元)
		'env_investment_ratio', // 比例
		'construction_content', // 主要建设内容
		'project_changes', // 改扩建项目变动情况
		'production_process', // 生产工艺
		'noise_standard', // 噪声执行标准
		'solid_generation', // 固体废物产生情况
		'pollutants_emission', // 污染物产排情况
	];
	return baseTable.sort((a, b) => {
		const aIndex = ORDER.indexOf(a.id)
		const bIndex = ORDER.indexOf(b.id)
		if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
		if (aIndex !== -1) return -1
		if (bIndex !== -1) return 1
		return 0
	})
}

// 格式化值的辅助函数（处理数组、对象等）
function formatValue(value) {
	// 如果是数组，转成字符串
	if (Array.isArray(value)) {
		return value.length > 0 ? JSON.stringify(value, null, 2) : '-'
	}
	// 如果是对象，转成字符串
	if (typeof value === 'object' && value !== null) {
		return JSON.stringify(value, null, 2)
	}
	// 如果是数字，直接返回
	if (typeof value === 'number') {
		return value
	}
	// 如果是字符串，去掉首尾空格
	if (typeof value === 'string') {
		return value.trim() || '-'
	}
	// 其他情况
	return value || ''
}

/**
 * 标识牌下载
 * 纯前端数据 → 后端生成 Word
 * @param {Object} signboard  
 * @returns {Promise<ArrayBuffer>}
 */
export function downloadSignboardWord(signboard) {
  const payload = {
    sections: signboard.sections.map(sec => ({
      block: sec.block,
      items: sec.items.map(it => ({ title: it.title, content: it.content }))
    }))
  };

  // #ifdef H5
  // H5 用 fetch 保证 arrayBuffer
  // uni.request 在H5环境中不稳定，使用原生的 fetch API 是一个可靠且推荐的方案
  return fetch(BASE_URL + '/api/v1/download/signageborad', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).then(res => {
    if (!res.ok) throw new Error('生成失败');
    return res.arrayBuffer();   // 浏览器原生一定返回 ArrayBuffer
  });
  // #endif

  // #ifndef H5
  // 小程序、App 用 uni.request
  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + '/api/v1/download/signageborad',
      method: 'POST',
      data: payload,
      header: { 'Content-Type': 'application/json' },
      responseType: 'arraybuffer',
      success: (res) => {
        if (res.statusCode === 200 && res.data && res.data.byteLength > 0) {
          resolve(res.data);
        } else {
          reject(new Error('空文件'));
        }
      },
      fail: reject
    });
  });
  // #endif
}

