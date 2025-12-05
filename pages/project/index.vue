<template>
	<AppLayout current="pages/projects/index">
		<view class="projects">
			<!-- 页面头部 -->
			<view class="projects__header">
				<view class="projects__title-section">
					<text class="projects__title">项目管理</text>
					<text class="projects__subtitle">统筹环保项目执行，确保按时高质量完成</text>
				</view>
			</view>

			<!-- 主要内容区域 -->
			<view class="projects__content">
				<!-- 左侧项目列表 -->
				<view class="projects__list-panel">
					<view class="projects__panel-header">
						<text class="projects__panel-title">项目列表</text>
						<button class="projects__button projects__button--primary" @tap="addProject">
							<uni-icons type="plus" size="16" color="#ffffff" />
							<text>新建项目</text>
						</button>
					</view>

					<scroll-view class="projects__scroll"> <!-- scroll-y -->
						<view v-for="project in filteredProjects" :key="project.id" class="projects__item" :class="{ 
							'projects__item--active': project.id === activeProjectId
							}" @tap="() => switchProject(project.id)">
							<view class="projects__item-icon">
								<uni-icons type="list" size="20" color="#43A761" />
							</view>
							<view class="projects__item-content">
								<view class="projects__item-header">
									<text class="projects__item-name">{{ project.name }}</text>
								</view>
								<text class="projects__item-desc">{{ project.description }}</text>
								<text class="projects__item-desc">{{ project.notes }}</text>
								<view class="projects__item-meta">
									<view class="projects__item-meta-item">
										<uni-icons type="person" size="14" color="#94a3b8" />
										<text class="projects__item-meta-text">{{ project.owner.username }}</text>
									</view>
									<view class="projects__item-meta-item">
										<uni-icons type="calendar" size="14" color="#94a3b8" />
										<text class="projects__item-meta-text">
											{{ project.created_at.slice(0, 10) }}
										</text>
									</view>
								</view>
							</view>
							<view class="projects__item-actions">
								<!-- 编辑按钮 -->
								<view class="projects__item-action" @tap.stop="() => editProject(project.id)">
									<uni-icons type="compose" size="16" color="#64748b" />
								</view>
								<!-- 删除按钮 -->
								<view class="projects__item-action" @tap.stop="() => delProject(project.id)">
									<uni-icons type="trash" size="16" color="#ef4444" />
								</view>
							</view>
						</view>

						<!-- 空状态 -->
						<view v-if="filteredProjects.length === 0" class="projects__empty">
							<uni-icons type="folder" size="60" color="#cbd5e1" />
							<text class="projects__empty-text">暂无项目</text>
							<text class="projects__empty-subtext">点击上方按钮创建第一个项目</text>
						</view>
					</scroll-view>
				</view>

				<!-- 右侧项目详情 -->
				<view class="projects__detail-panel">
					<view class="projects__panel-header">
						<view class="projects__detail-header">
							<text class="projects__panel-title">文档列表</text>
						</view>
						<view class="projects__detail-actions">
							<button class="projects__button projects__button--primary" @tap="uploadFile"
								:disabled="!activeProject">
								<uni-icons type="cloud-upload" size="16" color="#ffffff" />
								<text>上传项目文件</text>
							</button>
						</view>
					</view>

					<scroll-view scroll-y class="projects__detail-scroll">
						<view v-if="activeProject" class="projects__detail-content">
							<!-- 项目文档 -->
							<view class="projects__section">
								<view class="projects__section-header">
									<uni-icons type="document" size="18" color="#8b5cf6" />
									<text class="projects__section-title">项目文档</text>
									<text class="projects__section-count">{{ activeProject.documents?.length || 0 }}
										个文档</text>
								</view>
								<view v-if="activeProject.documents && activeProject.documents.length > 0"
									class="projects__documents-list">
									<view v-for="document in activeProject.documents" :key="document.id"
										class="projects__document-item">
										<view class="projects__document-icon">
											<image :src="getDocumentIcon(document.file_extension)"
												style="width:20px;height:20px;" />
										</view>
										<view class="projects__document-content">
											<text class="projects__document-name">{{ document.filename }}</text>
											<text class="projects__document-meta">{{ fmtSize(document.size_bytes) }} ·
												上传时间: {{ document.updated_at.slice(0, 10) }}</text>
										</view>
										<view class="projects__document-actions">
											<!-- 下载按钮 -->
											<view class="projects__document-action"
												@tap.stop="() => downloadDocument(document)">
												<uni-icons type="download" size="16" color="#64748b" />
											</view>
											<!-- 删除按钮 -->
											<view class="projects__document-action"
												@tap.stop="() => deleteDocument(document.id)">
												<uni-icons type="trash" size="16" color="#ef4444" />
											</view>
										</view>
									</view>
								</view>
								<!-- 空项目状态 -->
								<view v-else class="projects__empty-section">
									<uni-icons type="document" size="32" color="#cbd5e1" />
									<text class="projects__empty-section-text">暂无文档</text>
								</view>
							</view>
						</view>

						<!-- 未选择项目状态 -->
						<view v-else class="projects__empty-detail">
							<uni-icons type="folder" size="60" color="#cbd5e1" />
							<text class="projects__empty-text">请选择项目</text>
							<text class="projects__empty-subtext">点击对应项目查看详情</text>
						</view>
					</scroll-view>
				</view>
			</view>
		</view>

		<!-- 新增项目模态框 -->
		<view v-if="showAddProjectModal" class="modal-overlay">
			<view class="modal-container">
				<view class="modal-header">
					<text class="modal-title">新建项目</text>
					<uni-icons type="close" size="30" color="#64748b" @tap="closeAddProjectModal" />
				</view>
				<view class="modal-content">
					<view class="form-group">
						<text class="form-label">项目名称</text>
						<input v-model="newProjectForm.name" class="form-input" placeholder="请输入项目名称" type="text" />
					</view>
					<view class="form-group">
						<text class="form-label">项目背景</text>
						<textarea v-model="newProjectForm.description" class="form-textarea" placeholder="请输入项目背景"
							maxlength="1000" />
					</view>
					<view class="form-group">
						<text class="form-label">项目备注</text>
						<textarea v-model="newProjectForm.notes" class="form-textarea" placeholder="请输入项目项目备注"
							maxlength="1000" />
					</view>
					<view class="form-group">
						<text class="form-label">项目成员</text>
						<input v-model="newProjectForm.name" class="form-input" placeholder="请输入项目名称" type="text" />
					</view>
				</view>
				<view class="modal-actions">
					<button class="modal-button modal-button--cancel" @tap="closeAddProjectModal">取消</button>
					<button class="modal-button modal-button--confirm" @tap="confirmAddProject">确认</button>
				</view>
			</view>
		</view>

		<!-- 编辑项目模态框 -->
		<view v-if="showEditProjectModal" class="modal-overlay">
			<view class="modal-container">
				<view class="modal-header">
					<text class="modal-title">编辑项目</text>
					<uni-icons type="close" size="30" color="#64748b" @tap="closeEditProjectModal" />
				</view>
				<view class="modal-content">
					<view class="form-group">
						<text class="form-label">项目名称</text>
						<input v-model="editProjectForm.name" class="form-input" placeholder="请输入项目名称" type="text" />
					</view>
					<view class="form-group">
						<text class="form-label">项目背景</text>
						<textarea v-model="editProjectForm.description" class="form-textarea" placeholder="请输入项目项目背景"
							maxlength="200" />
					</view>
					<view class="form-group">
						<text class="form-label">项目备注</text>
						<textarea v-model="editProjectForm.notes" class="form-textarea" placeholder="请输入项目项目备注"
							maxlength="500" />
					</view>
				</view>
				<view class="modal-actions">
					<button class="modal-button modal-button--cancel" @tap="closeEditProjectModal">取消</button>
					<button class="modal-button modal-button--confirm" @tap="confirmEditProject">确认</button>
				</view>
			</view>
		</view>

		<!-- 文件上传模态框 -->
		<view v-if="showUploadModal" class="modal-overlay">
			<view class="modal-container">
				<view class="modal-header">
					<text class="modal-title">上传文件</text>
					<uni-icons type="close" size="30" color="#64748b" @tap="closeUploadModal" />
				</view>

				<view class="modal-content">
					<!-- 选文件 -->
					<view class="upload-area" @tap="chooseFile">
						<uni-icons type="cloud-upload" size="48" color="#3b82f6" />
						<text class="upload-text">点击选择文件</text>
					</view>

					<!-- 选图片 -->
					<view class="upload-area" @tap="chooseImage" style="margin-top: 20rpx;">
						<uni-icons type="image" size="48" color="#10b981" />
						<text class="upload-text">点击选择图片</text>
					</view>

					<text class="upload-subtext">支持图片、文档等格式，最大 500 MB</text>

					<!-- 已选文件 -->
					<view v-if="selectedFile" class="selected-file">
						<uni-icons type="document" size="20" color="#3b82f6" />
						<text class="file-name">{{ selectedFile.name }}</text>
						<text class="file-size">{{ fmtSize(selectedFile.size) }}</text>
					</view>
				</view>

				<view class="modal-actions">
					<button class="modal-button modal-button--cancel" @tap="closeUploadModal">取消</button>
					<button class="modal-button modal-button--confirm" @tap="confirmUpload"
						:disabled="!selectedFile">上传</button>
				</view>
			</view>
		</view>
	</AppLayout>
</template>

<script setup>
	import {
		ref,
		reactive,
		onMounted,
		computed
	} from 'vue'
	import AppLayout from '@/components/layout/AppLayout.vue'

	import {
		onShow
	} from '@dcloudio/uni-app'
	import {
		navTitleStore
	} from '@/stores/navTitle.js'
	import {
		createProjects,
		getProjects,
		getProjectDetail,
		updateProject,
		deleteProject,
		getProjectDocuments,
		pickProjectFile,
		pickProjectImage,
		uploadProjectFile,
		downloadProjectFile,
		removeProjectFile
	} from '@/api/project.js'

	// 设置头部导航栏title
	const navTitle = navTitleStore()
	onShow(() => navTitle.setTitle('项目管理'))


	// 数据状态
	const projects = ref([])
	const activeProjectId = ref(null)
	const activeProject = ref(null)
	const documents = ref([])

	// 模态框状态
	const showAddProjectModal = ref(false) // 增加项目
	const showEditProjectModal = ref(false) // 修改项目
	const showUploadModal = ref(false) // 文件上传

	// 表单数据
	const newProjectForm = reactive({
		name: '',
		description: '',
		notes: '',
		member_ids: []
	})

	const editProjectForm = reactive({
		id: null,
		name: '',
		description: '',
		notes: '',
		member_ids: []
	})

	// 文件上传相关
	const selectedFile = ref(null)
	const uploadProgress = ref(0)

	// 计算属性：过滤项目列表
	const filteredProjects = computed(() => {
		return projects.value.filter(project => !project.is_deleted)
	})

	// 初始化加载数据
	const loadProjects = async () => {
		try {
			const response = await getProjects()
			projects.value = response
			// console.log("项目：", response)

			// 如果有项目，默认选中第一个
			if (response.length > 0 && !activeProjectId.value) {
				await switchProject(response[0].id)
			}
		} catch (error) {
			console.error('加载项目列表失败:', error)
			uni.showToast({
				title: '加载项目列表失败',
				icon: 'error'
			})
		}
	}

	// 加载项目详情
	const loadProjectDetail = async (projectId) => {
		try {
			const response = await getProjectDetail(projectId)
			activeProject.value = response

			// 加载项目文档
			await loadProjectDocuments(projectId)
		} catch (error) {
			console.error('加载项目详情失败:', error)
			uni.showToast({
				title: '加载项目详情失败',
				icon: 'error'
			})
		}
	}

	// 加载项目文档
	const loadProjectDocuments = async (projectId) => {
		try {
			const response = await getProjectDocuments(projectId)
			documents.value = response.documents || []

			// 将文档数据添加到项目对象中
			if (activeProject.value) {
				activeProject.value.documents = documents.value
				// console.log("文档：", documents.value)
			}
		} catch (error) {
			console.error('加载项目文档失败:', error)
		}
	}

	// 切换项目
	const switchProject = async (projectId) => {
		activeProjectId.value = projectId
		await loadProjectDetail(projectId)
	}

	// 新增项目
	const addProject = () => {
		// 重置表单
		Object.assign(newProjectForm, {
			name: '',
			description: '',
			notes: '',
			member_ids: []
		})
		showAddProjectModal.value = true
	}

	// 确认新建项目
	const confirmAddProject = async () => {
		try {
			// 表单验证
			if (!newProjectForm.name.trim()) {
				uni.showToast({
					title: '请输入项目名称',
					icon: 'error'
				})
				return
			}

			const projectData = {
				name: newProjectForm.name.trim(),
				description: newProjectForm.description.trim(),
				notes: newProjectForm.notes.trim(),
				member_ids: newProjectForm.member_ids
			}

			// 调用创建项目接口
			const response = await createProjects(projectData)

			uni.showToast({
				title: '项目创建成功',
				icon: 'success'
			})

			// 关闭模态框并刷新列表
			closeAddProjectModal()
			await loadProjects()

			// 切换到新创建的项目
			await switchProject(response.id)

		} catch (error) {
			console.error('创建项目失败:', error)
			uni.showToast({
				title: '创建项目失败',
				icon: 'error'
			})
		}
	}

	// 关闭新建项目窗口
	const closeAddProjectModal = () => {
		showAddProjectModal.value = false
	}

	// 编辑项目
	const editProject = async (projectId) => {
		try {
			const project = projects.value.find(p => p.id === projectId)
			if (!project) return

			Object.assign(editProjectForm, {
				id: project.id,
				name: project.name,
				description: project.description || '',
				notes: project.notes || '',
				member_ids: []
			})

			showEditProjectModal.value = true
		} catch (error) {
			console.error('编辑项目失败:', error)
			uni.showToast({
				title: '编辑项目失败',
				icon: 'error'
			})
		}
	}

	// 确认编辑项目
	const confirmEditProject = async () => {
		try {
			if (!editProjectForm.name.trim()) {
				uni.showToast({
					title: '请输入项目名称',
					icon: 'error'
				})
				return
			}

			const updateData = {
				name: editProjectForm.name.trim(),
				description: editProjectForm.description.trim(),
				notes: editProjectForm.notes.trim()
			}

			// 调用更新项目接口
			await updateProject(editProjectForm.id, updateData)

			uni.showToast({
				title: '项目更新成功',
				icon: 'success'
			})

			// 关闭模态框并刷新数据
			closeEditProjectModal()
			await loadProjects()
			await loadProjectDetail(editProjectForm.id)

		} catch (error) {
			console.error('更新项目失败:', error)
			uni.showToast({
				title: '更新项目失败',
				icon: 'error'
			})
		}
	}

	// 关闭编辑项目窗口
	const closeEditProjectModal = () => {
		showEditProjectModal.value = false
	}

	// 删除项目
	const delProject = async (projectId) => {
		try {
			uni.showModal({
				title: '确认删除',
				content: '确定要删除这个项目吗？删除后30天内可以恢复。',
				success: async (res) => {
					if (res.confirm) {
						await deleteProject(projectId)

						uni.showToast({
							title: '项目删除成功',
							icon: 'success'
						})

						// 重新加载项目列表
						await loadProjects()

						// 如果删除的是当前选中的项目，清空选中状态
						if (activeProjectId.value === projectId) {
							activeProjectId.value = null
							activeProject.value = null
							documents.value = []
						}
					}
				}
			})
		} catch (error) {
			console.error('删除项目失败:', error)
			uni.showToast({
				title: '删除项目失败',
				icon: 'error'
			})
		}
	}

	// 文件上传相关
	const uploadFile = () => {
		if (!activeProjectId.value) {
			uni.showToast({
				title: '请先选择项目',
				icon: 'error'
			})
			return
		}
		selectedFile.value = null
		uploadProgress.value = 0
		showUploadModal.value = true
	}

	// 获取文件扩展名
	const getFileExtension = (filename) => {
		if (!filename) return ''
		const parts = filename.split('.')
		return parts.length > 1 ? '.' + parts.pop().toLowerCase() : ''
	}

	// 选择文件
	const chooseFile = () => {
		pickProjectFile()
			.then(file => {
				if (file) selectedFile.value = file
			})
			.catch(() => {})
	}

	// 选图片
	const chooseImage = () => {
		pickProjectImage().then(file => {
			if (file) selectedFile.value = file
		}).catch(() => {})
	}

	// 确认上传文件
	const confirmUpload = async () => {
		if (!selectedFile.value) return
		uni.showLoading({
			title: '上传中...',
			mask: true
		})
		try {
			await uploadProjectFile(activeProjectId.value, selectedFile.value)
			uni.showToast({
				title: '上传成功',
				icon: 'success'
			})
			closeUploadModal()
			await loadProjectDocuments(activeProjectId.value) // 刷新列表
		} catch (e) {
			uni.showToast({
				title: e.message || '上传失败',
				icon: 'error'
			})
		} finally {
			uni.hideLoading()
		}
	}

	// 关闭上传窗口
	const closeUploadModal = () => {
		showUploadModal.value = false
		selectedFile.value = null
		uploadProgress.value = 0
	}

	// 下载项目文档
	const downloadDocument = async (doc) => {
		uni.showLoading({
			title: '准备下载...',
			mask: true
		})
		try {
			const blob = await downloadProjectFile(activeProjectId.value, doc.document_id)
			// 保存并打开（H5 示例，小程序用 uni.saveFile + uni.openDocument）
			const url = URL.createObjectURL(blob)
			const link = document.createElement('a')
			link.href = url
			link.download = doc.name
			link.click()
			URL.revokeObjectURL(url)
			uni.showToast({
				title: '下载成功',
				icon: 'success'
			})
		} catch (e) {
			uni.showToast({
				title: '下载失败',
				icon: 'error'
			})
		} finally {
			uni.hideLoading()
		}
	}

	// 删除项目文档
	const deleteDocument = async (documentId) => {
		uni.showModal({
			title: '确认删除',
			content: '删除后 30 天内可恢复',
			success: async (res) => {
				if (!res.confirm) return
				try {
					await removeProjectFile(activeProjectId.value, documentId)
					uni.showToast({
						title: '已删除',
						icon: 'success'
					})
					await loadProjectDocuments(activeProjectId.value)
				} catch (e) {
					uni.showToast({
						title: '删除失败',
						icon: 'error'
					})
				}
			}
		})
	}

	// 辅助函数
	const getDocumentIcon = (ext) => {
		const map = {
			'.pdf': '/static/fileType/pdf.png',
			'.doc': '/static/fileType/word.png',
			'.docx': '/static/fileType/word.png',
			'.xls': '/static/fileType/excel.png',
			'.xlsx': '/static/fileType/excel.png',
			'.png': '/static/fileType/picture.png',
			'.jpg': '/static/fileType/image.png',
			'.jpeg': '/static/fileType/image.png',
			'.md': '/static/fileType/md.png',
			'.txt': '/static/fileType/txt.png',
		}
		return map[ext.toLowerCase()] || '/static/fileType/file.png'
	}

	// 比特 → B/KB/MB/GB
	const fmtSize = b => {
		if (!b) return '0 B'
		const k = 1024
		const units = ['B', 'KB', 'MB', 'GB']
		let i = 0
		while (b >= k && i < units.length - 1) {
			b /= k;
			i++
		}
		return `${b.toFixed(i ? 1 : 0)} ${units[i]}`
	}


	// 组件挂载时加载数据
	onMounted(() => {
		loadProjects()
	})
</script>

<style lang="scss" scoped>
	.projects {
		display: flex;
		flex-direction: column;
		gap: 32rpx;
		min-height: 100vh;
		padding: 32rpx;
		background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
	}

	.projects__header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 24rpx;
	}

	.projects__title-section {
		display: flex;
		flex-direction: column;
		gap: 8rpx;
		flex: 1;
	}

	.projects__title {
		font-size: 48rpx;
		font-weight: 700;
		color: #0f172a;
		line-height: 1.2;
	}

	.projects__subtitle {
		font-size: 28rpx;
		color: #64748b;
		line-height: 1.4;
	}

	.projects__header-actions {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	/* 主要内容区域 */
	.projects__content {
		display: flex;
		gap: 32rpx;
		flex: 1;
	}

	/* 面板通用样式 */
	.projects__list-panel {
		width: 510rpx;
		min-width: 400rpx;
		background: #ffffff;
		border-radius: 20rpx;
		padding: 24rpx;
		box-shadow: 0 4rpx 24rpx rgba(15, 23, 42, 0.08);
		border: 1rpx solid #f1f5f9;
		display: flex;
		flex-direction: column;
	}

	.projects__detail-panel {
		flex: 1;
		background: #ffffff;
		border-radius: 20rpx;
		padding: 24rpx;
		box-shadow: 0 4rpx 24rpx rgba(15, 23, 42, 0.08);
		border: 1rpx solid #f1f5f9;
		display: flex;
		flex-direction: column;
	}

	.projects__panel-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 24rpx;
		gap: 16rpx;
	}

	.projects__panel-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #0f172a;
	}

	.projects__detail-header {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.projects__detail-actions {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}



	/* 按钮样式 */
	.projects__button {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8rpx;
		padding: 0 20rpx;
		height: 64rpx;
		border-radius: 12rpx;
		font-size: 26rpx;
		font-weight: 500;
		border: none;
		transition: all 0.3s ease;
		white-space: nowrap;
	}

	.projects__button:active {
		transform: translateY(2rpx);
	}

	.projects__button--primary {
		background: linear-gradient(135deg, #3b82f6, #2563eb);
		color: #ffffff;
		box-shadow: 0 4rpx 16rpx rgba(59, 130, 246, 0.3);
	}

	.projects__button--primary:active {
		box-shadow: 0 2rpx 8rpx rgba(59, 130, 246, 0.4);
	}

	.projects__button--primary:disabled {
		background: #cbd5e1;
		box-shadow: none;
		transform: none;
	}

	.projects__button--secondary {
		background: transparent;
		color: #3b82f6;
		border: 2rpx solid #3b82f6;
	}

	.projects__button--secondary:active {
		background: rgba(59, 130, 246, 0.1);
	}

	.projects__button--outline {
		background: transparent;
		color: #64748b;
		border: 2rpx solid #e2e8f0;
	}

	.projects__button--outline:active {
		background: #f8fafc;
	}

	.projects__button--outline:disabled {
		color: #cbd5e1;
		border-color: #cbd5e1;
		transform: none;
	}

	/* 项目列表样式 */
	.projects__scroll {
		flex: 1;
	}

	.projects__item {
		display: flex;
		align-items: flex-start;
		gap: 16rpx;
		padding: 24rpx;
		border-radius: 16rpx;
		background: #f8fafc;
		border: 2rpx solid transparent;
		margin-bottom: 16rpx;
		transition: all 0.3s ease;
		position: relative;
		margin-top: 10rpx;
	}

	.projects__item:active {
		transform: translateY(2rpx);
		background: #f1f5f9;
	}

	.projects__item--active {
		background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(59, 130, 246, 0.04));
		border-color: #3b82f6;
		box-shadow: 0 4rpx 16rpx rgba(59, 130, 246, 0.12);
	}

	.projects__item--delayed {
		border-left: 4rpx solid #ef4444;
	}

	.projects__item-icon {
		width: 40rpx;
		height: 40rpx;
		border-radius: 8rpx;
		background: rgba(59, 130, 246, 0.1);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		margin-top: 4rpx;
	}

	.projects__item--active .projects__item-icon {
		background: rgba(59, 130, 246, 0.2);
	}

	.projects__item-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 12rpx;
	}

	.projects__item-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 8rpx;
	}

	.projects__item-name {
		font-size: 28rpx;
		font-weight: 600;
		color: #0f172a;
		line-height: 1.3;
		flex: 1;
	}

	.projects__item-badge {
		font-size: 20rpx;
		padding: 6rpx 12rpx;
		border-radius: 6rpx;
		font-weight: 500;
		white-space: nowrap;
	}

	.projects__item-badge--planning {
		background: rgba(100, 116, 139, 0.1);
		color: #64748b;
	}

	.projects__item-badge--in-progress {
		background: rgba(59, 130, 246, 0.1);
		color: #3b82f6;
	}

	.projects__item-badge--completed {
		background: rgba(16, 185, 129, 0.1);
		color: #059669;
	}

	.projects__item-badge--delayed {
		background: rgba(239, 68, 68, 0.1);
		color: #dc2626;
	}

	.projects__item-desc {
		font-size: 24rpx;
		color: #64748b;
		line-height: 1.4;
	}

	/* 进度条样式 */
	.projects__progress {
		display: flex;
		flex-direction: column;
		gap: 8rpx;
	}

	.projects__progress-info {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.projects__progress-text {
		font-size: 22rpx;
		color: #64748b;
	}

	.projects__progress-percent {
		font-size: 22rpx;
		color: #0f172a;
		font-weight: 600;
	}

	.projects__progress-bar {
		height: 8rpx;
		background: #e2e8f0;
		border-radius: 4rpx;
		overflow: hidden;
	}

	.projects__progress-fill {
		height: 100%;
		border-radius: 4rpx;
		transition: width 0.3s ease;
	}

	.projects__progress-fill--planning {
		background: #64748b;
	}

	.projects__progress-fill--in-progress {
		background: #3b82f6;
	}

	.projects__progress-fill--completed {
		background: #10b981;
	}

	.projects__progress-fill--delayed {
		background: #ef4444;
	}

	.projects__item-meta {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	.projects__item-meta-item {
		display: flex;
		align-items: center;
		gap: 4rpx;
	}

	.projects__item-meta-text {
		font-size: 22rpx;
		color: #94a3b8;
	}

	.projects__item-actions {
		display: flex;
		align-items: center;
		gap: 8rpx;
		// opacity: 0;
		transition: opacity 0.3s ease;
	}

	.projects__item:active .projects__item-actions {
		// opacity: 1;
	}

	.projects__item-action {
		padding: 8rpx;
		border-radius: 6rpx;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.projects__item-action:active {
		background: #f1f5f9;
	}

	/* 详情内容样式 */
	.projects__detail-scroll {
		flex: 1;
	}

	.projects__detail-content {
		display: flex;
		flex-direction: column;
		gap: 24rpx;
	}

	.projects__section {
		background: #f8fafc;
		border-radius: 12rpx;
		padding: 20rpx;
		border: 1rpx solid #e2e8f0;
	}

	.projects__section-header {
		display: flex;
		align-items: center;
		gap: 8rpx;
		margin-bottom: 16rpx;
	}

	.projects__section-title {
		font-size: 28rpx;
		font-weight: 600;
		color: #0f172a;
	}

	.projects__section-count {
		font-size: 22rpx;
		color: #64748b;
		margin-left: auto;
	}

	/* 项目概览网格 */
	.projects__overview-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250rpx, 1fr));
		gap: 16rpx;
		margin-bottom: 16rpx;
	}

	.projects__overview-item {
		display: flex;
		flex-direction: column;
		gap: 4rpx;
	}

	.projects__overview-label {
		font-size: 24rpx;
		color: #64748b;
		font-weight: 500;
	}

	.projects__overview-value {
		font-size: 26rpx;
		color: #0f172a;
		font-weight: 600;
	}

	.projects__overview-desc {
		font-size: 24rpx;
		color: #64748b;
		line-height: 1.5;
	}

	/* 进度详情 */
	.projects__progress-detail {
		display: flex;
		align-items: center;
		gap: 32rpx;
	}

	.projects__progress-visual {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.projects__progress-circle {
		width: 120rpx;
		height: 120rpx;
		border-radius: 50%;
		background: conic-gradient(#3b82f6 0% var(--progress), #e2e8f0 var(--progress) 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
	}

	.projects__progress-circle::before {
		content: '';
		position: absolute;
		width: 100rpx;
		height: 100rpx;
		background: #ffffff;
		border-radius: 50%;
	}

	.projects__progress-circle-text {
		font-size: 24rpx;
		font-weight: 700;
		color: #0f172a;
		position: relative;
		z-index: 1;
	}

	.projects__progress-stats {
		flex: 1;
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 16rpx;
	}

	.projects__progress-stat {
		display: flex;
		flex-direction: column;
		gap: 4rpx;
	}

	.projects__progress-stat-label {
		font-size: 22rpx;
		color: #64748b;
	}

	.projects__progress-stat-value {
		font-size: 28rpx;
		font-weight: 700;
		color: #0f172a;
	}

	/* 任务列表 */
	.projects__tasks-list {
		display: flex;
		flex-direction: column;
		gap: 12rpx;
	}

	.projects__task-item {
		display: flex;
		align-items: flex-start;
		gap: 12rpx;
		padding: 16rpx;
		background: #ffffff;
		border-radius: 8rpx;
		border: 1rpx solid #e2e8f0;
		transition: all 0.2s ease;
	}

	.projects__task-item:active {
		background: #f1f5f9;
	}

	.projects__task-item--completed {
		opacity: 0.7;
	}

	.projects__task-checkbox {
		padding: 4rpx;
		border-radius: 6rpx;
		transition: all 0.2s ease;
		margin-top: 4rpx;
	}

	.projects__task-checkbox:active {
		background: #f1f5f9;
	}

	.projects__task-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 6rpx;
	}

	.projects__task-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 8rpx;
	}

	.projects__task-title {
		font-size: 26rpx;
		font-weight: 600;
		color: #0f172a;
		flex: 1;
		text-decoration: var(--text-decoration, none);
	}

	.projects__task-item--completed .projects__task-title {
		--text-decoration: line-through;
		color: #94a3b8;
	}

	.projects__task-badge {
		font-size: 20rpx;
		padding: 4rpx 8rpx;
		border-radius: 4rpx;
		font-weight: 500;
		white-space: nowrap;
	}

	.projects__task-badge--low {
		background: rgba(16, 185, 129, 0.1);
		color: #059669;
	}

	.projects__task-badge--medium {
		background: rgba(245, 158, 11, 0.1);
		color: #d97706;
	}

	.projects__task-badge--high {
		background: rgba(239, 68, 68, 0.1);
		color: #dc2626;
	}

	.projects__task-desc {
		font-size: 24rpx;
		color: #64748b;
		line-height: 1.4;
	}

	.projects__task-item--completed .projects__task-desc {
		color: #cbd5e1;
	}

	.projects__task-meta {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.projects__task-meta-item {
		display: flex;
		align-items: center;
		gap: 4rpx;
	}

	.projects__task-meta-text {
		font-size: 22rpx;
		color: #94a3b8;
	}

	.projects__task-actions {
		display: flex;
		align-items: center;
		gap: 8rpx;
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.projects__task-item:active .projects__task-actions {
		opacity: 1;
	}

	.projects__task-action {
		padding: 8rpx;
		border-radius: 6rpx;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.projects__task-action:active {
		background: #f1f5f9;
	}

	/* 文档列表 */
	.projects__documents-list {
		display: flex;
		flex-direction: column;
		gap: 12rpx;
	}

	.projects__document-item {
		display: flex;
		align-items: center;
		gap: 12rpx;
		padding: 16rpx;
		background: #ffffff;
		border-radius: 8rpx;
		border: 1rpx solid #e2e8f0;
		transition: all 0.2s ease;
	}

	.projects__document-item:active {
		background: #f1f5f9;
	}

	.projects__document-icon {
		width: 40rpx;
		height: 40rpx;
		border-radius: 6rpx;
		background: rgba(238, 238, 246, 0.1);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.projects__document-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 4rpx;
	}

	.projects__document-name {
		font-size: 26rpx;
		color: #0f172a;
		font-weight: 500;
	}

	.projects__document-meta {
		font-size: 22rpx;
		color: #94a3b8;
	}

	.projects__document-actions {
		display: flex;
		align-items: center;
		gap: 8rpx;
		// opacity: 0;
		transition: opacity 0.3s ease;
	}

	.projects__document-item:active .projects__document-actions {
		// opacity: 1;
	}

	.projects__document-action {
		padding: 8rpx;
		border-radius: 6rpx;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.projects__document-action:active {
		background: #f1f5f9;
	}

	/* 空状态样式 */
	.projects__empty,
	.projects__empty-detail,
	.projects__empty-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 16rpx;
		padding: 80rpx 32rpx;
		color: #cbd5e1;
		text-align: center;
	}

	.projects__empty-section {
		padding: 40rpx 32rpx;
	}

	.projects__empty-text {
		font-size: 28rpx;
		color: #64748b;
		font-weight: 600;
	}

	.projects__empty-subtext {
		font-size: 24rpx;
		color: #94a3b8;
		line-height: 1.4;
	}

	.projects__empty-section-text {
		font-size: 24rpx;
		color: #94a3b8;
	}

	/* 新增模态框样式 */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(15, 23, 42, 0.6);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 32rpx;
	}

	.modal-container {
		background: #ffffff;
		border-radius: 20rpx;
		width: 100%;
		max-width: 1000rpx;
		max-height: 80vh;
		overflow: hidden;
		box-shadow: 0 20rpx 60rpx rgba(15, 23, 42, 0.2);
		animation: modalSlideIn 0.3s ease;
	}

	@keyframes modalSlideIn {
		from {
			opacity: 0;
			transform: translateY(-40rpx) scale(0.95);
		}

		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 32rpx 32rpx 0;
		margin-bottom: 24rpx;
	}

	.modal-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #0f172a;
	}

	.modal-content {
		padding: 0 32rpx;
		max-height: 60vh;
		overflow-y: auto;
	}

	.form-group {
		margin-bottom: 24rpx;
	}

	.form-label {
		display: block;
		font-size: 26rpx;
		font-weight: 500;
		color: #0f172a;
		margin-bottom: 8rpx;
	}

	.form-input {
		width: 95%;
		height: 80rpx;
		padding: 0 20rpx;
		border: 2rpx solid #e2e8f0;
		border-radius: 12rpx;
		font-size: 26rpx;
		color: #0f172a;
		background: #ffffff;
		transition: all 0.2s ease;
	}

	.form-input:focus {
		border-color: #3b82f6;
		outline: none;
	}

	.form-textarea {
		width: 95%;
		min-height: 160rpx;
		padding: 20rpx;
		border: 2rpx solid #e2e8f0;
		border-radius: 12rpx;
		font-size: 26rpx;
		color: #0f172a;
		background: #ffffff;
		transition: all 0.2s ease;
		resize: none;
	}

	.form-textarea:focus {
		border-color: #3b82f6;
		outline: none;
	}

	.upload-area {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 80rpx 32rpx;
		border: 2rpx dashed #cbd5e1;
		border-radius: 12rpx;
		background: #f8fafc;
		transition: all 0.3s ease;
		text-align: center;
	}

	.upload-area:active {
		border-color: #3b82f6;
		background: rgba(59, 130, 246, 0.05);
	}

	.upload-text {
		font-size: 28rpx;
		color: #0f172a;
		font-weight: 500;
		margin-top: 16rpx;
	}

	.upload-subtext {
		font-size: 24rpx;
		color: #64748b;
		margin-top: 8rpx;
	}

	.selected-file {
		display: flex;
		align-items: center;
		gap: 12rpx;
		padding: 20rpx;
		background: #f1f5f9;
		border-radius: 12rpx;
		margin-top: 16rpx;
	}

	.file-name {
		flex: 1;
		font-size: 26rpx;
		color: #0f172a;
		font-weight: 500;
	}

	.file-size {
		font-size: 22rpx;
		color: #64748b;
	}

	.modal-actions {
		display: flex;
		gap: 16rpx;
		padding: 24rpx 32rpx;
		border-top: 1rpx solid #e2e8f0;
		margin-top: 24rpx;
	}

	.modal-button {
		flex: 1;
		height: 80rpx;
		line-height: 80rpx;
		border-radius: 12rpx;
		font-size: 26rpx;
		font-weight: 500;
		border: none;
		transition: all 0.3s ease;
	}

	.modal-button--cancel {
		background: transparent;
		color: #64748b;
		border: 2rpx solid #e2e8f0;
	}

	.modal-button--cancel:active {
		background: #f8fafc;
	}

	.modal-button--confirm {
		background: linear-gradient(135deg, #3b82f6, #2563eb);
		color: #ffffff;
		box-shadow: 0 4rpx 16rpx rgba(59, 130, 246, 0.3);
	}

	.modal-button--confirm:active {
		box-shadow: 0 2rpx 8rpx rgba(59, 130, 246, 0.4);
		transform: translateY(2rpx);
	}

	.modal-button--confirm:disabled {
		background: #cbd5e1;
		box-shadow: none;
		transform: none;
	}

	/* 响应式设计 */
	@media (max-width: 1023px) {
		.projects {
			padding: 24rpx;
			gap: 24rpx;
		}

		.projects__content {
			flex-direction: column;
		}

		.projects__list-panel {
			width: 93%;
			min-width: auto;
		}

		.projects__header {
			flex-direction: column;
			align-items: stretch;
			gap: 16rpx;
		}

		.projects__header-actions {
			justify-content: flex-start;
		}


		.projects__panel-header {
			// flex-direction: column;
			align-items: stretch;
			gap: 16rpx;
		}

		.projects__detail-actions {
			justify-content: flex-start;
		}

		.projects__progress-detail {
			flex-direction: column;
			align-items: stretch;
			gap: 24rpx;
		}

		.projects__progress-stats {
			grid-template-columns: repeat(4, 1fr);
		}
	}

	@media (max-width: 768px) {
		.projects__header-actions {
			flex-direction: column;
			align-items: stretch;
		}

		.projects__overview-grid {
			grid-template-columns: 1fr;
		}

		.projects__progress-stats {
			grid-template-columns: repeat(2, 1fr);
		}


	}

	/* 桌面端悬停效果 */
	@media (min-width: 768px) {
		.projects__item:hover {
			transform: translateY(-2rpx);
			box-shadow: 0 8rpx 24rpx rgba(15, 23, 42, 0.12);
		}

		.projects__item:hover .projects__item-actions {
			opacity: 1;
		}

		.projects__task-item:hover {
			background: #f1f5f9;
			transform: translateY(-1rpx);
		}

		.projects__task-item:hover .projects__task-actions {
			opacity: 1;
		}

		.projects__document-item:hover {
			background: #f1f5f9;
			transform: translateY(-1rpx);
		}

		.projects__document-item:hover .projects__document-actions {
			// opacity: 1;
		}

		.projects__button--primary:hover {
			box-shadow: 0 6rpx 20rpx rgba(59, 130, 246, 0.4);
		}

		.projects__button--secondary:hover {
			background: rgba(59, 130, 246, 0.1);
		}

		.projects__button--outline:hover {
			background: #f8fafc;
		}

		.projects__filter-tab:hover {
			background: rgba(255, 255, 255, 0.5);
		}

		.projects__item-action:hover {
			background: #f1f5f9;
		}

		.projects__task-action:hover {
			background: #f1f5f9;
		}

		.projects__document-action:hover {
			background: #f1f5f9;
		}
	}
</style>