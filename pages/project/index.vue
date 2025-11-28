<template>
  <AppLayout current="pages/projects/index">
    <view class="projects">
      <!-- 页面头部 -->
      <view class="projects__header">
        <view class="projects__title-section">
          <text class="projects__title">项目管理</text>
          <text class="projects__subtitle">统筹环保项目执行，确保按时高质量完成</text>
        </view>
        <view class="projects__header-actions">
          
          
        </view>
      </view>

      <!-- 主要内容区域 -->
      <view class="projects__content">
        <!-- 左侧项目列表 -->
        <view class="projects__list-panel">
          <view class="projects__panel-header">
            <text class="projects__panel-title">项目列表</text>
			<button class="projects__button projects__button--primary" @tap="createProject">
			  <uni-icons type="plus" size="16" color="#ffffff" />
			  <text>新建项目</text>
			</button>
          </view>
          
          <scroll-view scroll-y class="projects__scroll">
            <view
              v-for="project in filteredProjects"
              :key="project.id"
              class="projects__item"
              :class="{ 
                'projects__item--active': project.id === activeProjectId,
                'projects__item--delayed': project.status === 'delayed'
              }"
              @tap="() => switchProject(project.id)"
            >
              <view class="projects__item-icon">
                <uni-icons :type="getProjectIcon(project.type)" size="20" :color="getProjectColor(project.status)" />
              </view>
              <view class="projects__item-content">
                <view class="projects__item-header">
                  <text class="projects__item-name">{{ project.name }}</text>
                  <view class="projects__item-badge" :class="`projects__item-badge--${project.status}`">
                    {{ getProjectStatusText(project.status) }}
                  </view>
                </view>
                <text class="projects__item-desc">{{ project.description }}</text>
                
                <!-- 项目进度条 -->
                <view class="projects__progress">
                  <view class="projects__progress-info">
                    <text class="projects__progress-text">项目进度</text>
                    <text class="projects__progress-percent">{{ project.progress }}%</text>
                  </view>
                  <view class="projects__progress-bar">
                    <view 
                      class="projects__progress-fill" 
                      :class="`projects__progress-fill--${project.status}`"
                      :style="{ width: `${project.progress}%` }"
                    ></view>
                  </view>
                </view>
                
                <view class="projects__item-meta">
                  <view class="projects__item-meta-item">
                    <uni-icons type="person" size="14" color="#94a3b8" />
                    <text class="projects__item-meta-text">{{ project.manager }}</text>
                  </view>
                  <view class="projects__item-meta-item">
                    <uni-icons type="calendar" size="14" color="#94a3b8" />
                    <text class="projects__item-meta-text">{{ project.deadline }}</text>
                  </view>
                </view>
              </view>
              <view class="projects__item-actions">
                <!-- 新增编辑按钮 -->
                <view class="projects__item-action" @tap.stop="() => editProject(project.id)">
                  <uni-icons type="compose" size="16" color="#64748b" />
                </view>
                <!-- 新增删除按钮 -->
                <view class="projects__item-action" @tap.stop="() => deleteProject(project.id)">
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
              <text class="projects__panel-title">项目详情</text>
              <view v-if="activeProject" class="projects__detail-status">
                {{ getProjectStatusText(activeProject.status) }}
              </view>
            </view>
            <view class="projects__detail-actions">
              <button class="projects__button projects__button--primary" @tap="uploadFile" :disabled="!activeProject">
                <uni-icons type="plus" size="16" color="#ffffff" />
                <text>上传项目文件</text>
              </button>
            </view>
          </view>

          <scroll-view scroll-y class="projects__detail-scroll">
            <view v-if="activeProject" class="projects__detail-content">
              <!-- 项目概览 -->
              <view class="projects__section">
                <view class="projects__section-header">
                  <uni-icons type="info" size="18" color="#3b82f6" />
                  <text class="projects__section-title">项目概览</text>
                </view>
                <view class="projects__overview-grid">
                  <view class="projects__overview-item">
                    <text class="projects__overview-label">项目编号</text>
                    <text class="projects__overview-value">{{ activeProject.code }}</text>
                  </view>
                  <view class="projects__overview-item">
                    <text class="projects__overview-label">负责人</text>
                    <text class="projects__overview-value">{{ activeProject.manager }}</text>
                  </view>
                  <view class="projects__overview-item">
                    <text class="projects__overview-label">开始日期</text>
                    <text class="projects__overview-value">{{ activeProject.startDate }}</text>
                  </view>
                  <view class="projects__overview-item">
                    <text class="projects__overview-label">截止日期</text>
                    <text class="projects__overview-value">{{ activeProject.deadline }}</text>
                  </view>
                  <view class="projects__overview-item">
                    <text class="projects__overview-label">项目预算</text>
                    <text class="projects__overview-value">{{ activeProject.budget }}</text>
                  </view>
                  <view class="projects__overview-item">
                    <text class="projects__overview-label">项目类型</text>
                    <text class="projects__overview-value">{{ getProjectTypeText(activeProject.type) }}</text>
                  </view>
                </view>
                <text class="projects__overview-desc">{{ activeProject.fullDescription }}</text>
              </view>

              <!-- 项目进度 -->
              <view class="projects__section">
                <view class="projects__section-header">
                  <uni-icons type="bars" size="18" color="#10b981" />
                  <text class="projects__section-title">项目进度</text>
                  <text class="projects__section-count">{{ activeProject.completedTasks }}/{{ activeProject.totalTasks }} 个任务</text>
                </view>
                <view class="projects__progress-detail">
                  <view class="projects__progress-visual">
                    <view 
                      class="projects__progress-circle" 
                      :style="{ '--progress': `${activeProject.progress}%` }"
                    >
                      <text class="projects__progress-circle-text">{{ activeProject.progress }}%</text>
                    </view>
                  </view>
                  <view class="projects__progress-stats">
                    <view class="projects__progress-stat">
                      <text class="projects__progress-stat-label">已完成</text>
                      <text class="projects__progress-stat-value">{{ activeProject.completedTasks }}</text>
                    </view>
                    <view class="projects__progress-stat">
                      <text class="projects__progress-stat-label">进行中</text>
                      <text class="projects__progress-stat-value">{{ activeProject.inProgressTasks }}</text>
                    </view>
                    <view class="projects__progress-stat">
                      <text class="projects__progress-stat-label">待处理</text>
                      <text class="projects__progress-stat-value">{{ activeProject.pendingTasks }}</text>
                    </view>
                    <view class="projects__progress-stat">
                      <text class="projects__progress-stat-label">总任务</text>
                      <text class="projects__progress-stat-value">{{ activeProject.totalTasks }}</text>
                    </view>
                  </view>
                </view>
              </view>

              <!-- 项目任务 -->
              <view class="projects__section">
                <view class="projects__section-header">
                  <uni-icons type="list" size="18" color="#f59e0b" />
                  <text class="projects__section-title">项目任务</text>
                  <text class="projects__section-count">{{ activeProject.tasks?.length || 0 }} 个任务</text>
                </view>
                <view v-if="activeProject.tasks && activeProject.tasks.length > 0" class="projects__tasks-list">
                  <view 
                    v-for="task in activeProject.tasks" 
                    :key="task.id"
                    class="projects__task-item"
                    :class="{ 'projects__task-item--completed': task.status === 'completed' }"
                  >
                    <view class="projects__task-checkbox" @tap.stop="() => toggleTask(task.id)">
                      <uni-icons 
                        :type="task.status === 'completed' ? 'checkmarkempty' : 'circle'" 
                        size="20" 
                        :color="task.status === 'completed' ? '#10b981' : '#64748b'" 
                      />
                    </view>
                    <view class="projects__task-content">
                      <view class="projects__task-header">
                        <text class="projects__task-title">{{ task.title }}</text>
                        <view class="projects__task-badge" :class="`projects__task-badge--${task.priority}`">
                          {{ getTaskPriorityText(task.priority) }}优先级
                        </view>
                      </view>
                      <text class="projects__task-desc">{{ task.description }}</text>
                      <view class="projects__task-meta">
                        <view class="projects__task-meta-item">
                          <uni-icons type="person" size="14" color="#94a3b8" />
                          <text class="projects__task-meta-text">{{ task.assignee }}</text>
                        </view>
                        <view class="projects__task-meta-item">
                          <uni-icons type="calendar" size="14" color="#94a3b8" />
                          <text class="projects__task-meta-text">{{ task.dueDate }}</text>
                        </view>
                      </view>
                    </view>
                    <view class="projects__task-actions">
                      <view class="projects__task-action" @tap.stop="() => editTask(task.id)">
                        <uni-icons type="compose" size="16" color="#64748b" />
                      </view>
                    </view>
                  </view>
                </view>
                <view v-else class="projects__empty-section">
                  <uni-icons type="list" size="32" color="#cbd5e1" />
                  <text class="projects__empty-section-text">暂无任务</text>
                </view>
              </view>

              <!-- 项目文档 -->
              <view class="projects__section">
                <view class="projects__section-header">
                  <uni-icons type="document" size="18" color="#8b5cf6" />
                  <text class="projects__section-title">项目文档</text>
                  <text class="projects__section-count">{{ activeProject.documents?.length || 0 }} 个文档</text>
                </view>
                <view v-if="activeProject.documents && activeProject.documents.length > 0" class="projects__documents-list">
                  <view 
                    v-for="document in activeProject.documents" 
                    :key="document.id"
                    class="projects__document-item"
                  >
                    <view class="projects__document-icon">
                      <uni-icons :type="getDocumentIcon(document.type)" size="20" color="#3b82f6" />
                    </view>
                    <view class="projects__document-content">
                      <text class="projects__document-name">{{ document.name }}</text>
                      <text class="projects__document-meta">{{ document.size }} • {{ document.uploadDate }}</text>
                    </view>
                    <view class="projects__document-actions">
                      <!-- 新增下载按钮 -->
                      <view class="projects__document-action" @tap.stop="() => downloadDocument(document)">
                        <uni-icons type="download" size="16" color="#64748b" />
                      </view>
                      <!-- 新增删除按钮 -->
                      <view class="projects__document-action" @tap.stop="() => deleteDocument(document.id)">
                        <uni-icons type="trash" size="16" color="#ef4444" />
                      </view>
                    </view>
                  </view>
                </view>
                <view v-else class="projects__empty-section">
                  <uni-icons type="document" size="32" color="#cbd5e1" />
                  <text class="projects__empty-section-text">暂无文档</text>
                </view>
              </view>
            </view>
            
            <!-- 空状态 -->
            <view v-else class="projects__empty-detail">
              <uni-icons type="folder" size="60" color="#cbd5e1" />
              <text class="projects__empty-text">请选择项目</text>
              <text class="projects__empty-subtext">点击左侧项目查看详情</text>
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
          <uni-icons type="close" size="20" color="#64748b" @tap="closeAddProjectModal" />
        </view>
        <view class="modal-content">
          <view class="form-group">
            <text class="form-label">项目名称</text>
            <input 
              v-model="newProjectForm.name" 
              class="form-input" 
              placeholder="请输入项目名称" 
              type="text"
            />
          </view>
          <view class="form-group">
            <text class="form-label">项目备注</text>
            <textarea 
              v-model="newProjectForm.description" 
              class="form-textarea" 
              placeholder="请输入项目备注" 
              maxlength="200"
            />
          </view>
          <view class="form-group">
            <text class="form-label">项目背景</text>
            <textarea 
              v-model="newProjectForm.fullDescription" 
              class="form-textarea" 
              placeholder="请输入项目背景信息" 
              maxlength="500"
            />
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
          <uni-icons type="close" size="20" color="#64748b" @tap="closeEditProjectModal" />
        </view>
        <view class="modal-content">
          <view class="form-group">
            <text class="form-label">项目名称</text>
            <input 
              v-model="editProjectForm.name" 
              class="form-input" 
              placeholder="请输入项目名称" 
              type="text"
            />
          </view>
          <view class="form-group">
            <text class="form-label">项目备注</text>
            <textarea 
              v-model="editProjectForm.description" 
              class="form-textarea" 
              placeholder="请输入项目备注" 
              maxlength="200"
            />
          </view>
          <view class="form-group">
            <text class="form-label">项目背景</text>
            <textarea 
              v-model="editProjectForm.fullDescription" 
              class="form-textarea" 
              placeholder="请输入项目背景信息" 
              maxlength="500"
            />
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
          <uni-icons type="close" size="20" color="#64748b" @tap="closeUploadModal" />
        </view>
        <view class="modal-content">
          <view class="upload-area" @tap="chooseFile">
            <uni-icons type="plus" size="48" color="#3b82f6" />
            <text class="upload-text">点击选择文件</text>
            <text class="upload-subtext">支持图片、文档、压缩包等格式</text>
          </view>
          <view v-if="selectedFile" class="selected-file">
            <uni-icons type="document" size="20" color="#3b82f6" />
            <text class="file-name">{{ selectedFile.name }}</text>
            <text class="file-size">{{ formatFileSize(selectedFile.size) }}</text>
          </view>
        </view>
        <view class="modal-actions">
          <button class="modal-button modal-button--cancel" @tap="closeUploadModal">取消</button>
          <button class="modal-button modal-button--confirm" @tap="confirmUpload" :disabled="!selectedFile">
            上传
          </button>
        </view>
      </view>
    </view>
  </AppLayout>
</template>

<script setup>
import { computed, ref } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'

import { onShow } from '@dcloudio/uni-app'
import { navTitleStore } from '@/stores/navTitle.js'

// 设置头部导航栏title
const navTitle = navTitleStore()
onShow(() => navTitle.setTitle('项目管理'))

// 统计数据
const stats = ref({
  totalProjects: 18,
  completedProjects: 6,
  inProgressProjects: 8,
  delayedProjects: 4
})


const activeFilter = ref('all')

// 项目数据
const projects = ref([
  {
    id: 'project-1',
    name: '废水处理设施升级',
    code: 'EP-2024-001',
    description: '升级厂区废水处理系统，提高处理效率',
    fullDescription: '本项目旨在对现有废水处理设施进行技术升级，包括更换老旧设备、优化处理工艺、安装在线监测系统等，确保废水排放达标。',
    type: 'water',
    status: 'in-progress',
    progress: 65,
    manager: '张三',
    startDate: '2024-01-10',
    deadline: '2024-03-31',
    budget: '¥1,200,000',
    totalTasks: 12,
    completedTasks: 8,
    inProgressTasks: 3,
    pendingTasks: 1,
    tasks: [
      {
        id: 'task-1',
        title: '设备采购',
        description: '采购新型废水处理设备',
        status: 'completed',
        priority: 'high',
        assignee: '李四',
        dueDate: '2024-01-31'
      },
      {
        id: 'task-2',
        title: '设备安装',
        description: '安装并调试新设备',
        status: 'in-progress',
        priority: 'high',
        assignee: '王五',
        dueDate: '2024-02-28'
      },
      {
        id: 'task-3',
        title: '员工培训',
        description: '培训操作人员使用新设备',
        status: 'pending',
        priority: 'medium',
        assignee: '赵六',
        dueDate: '2024-03-15'
      }
    ],
    documents: [
      {
        id: 'doc-1',
        name: '项目方案书.pdf',
        type: 'pdf',
        size: '2.3 MB',
        uploadDate: '2024-01-08'
      },
      {
        id: 'doc-2',
        name: '设备采购清单.xlsx',
        type: 'excel',
        size: '856 KB',
        uploadDate: '2024-01-15'
      }
    ]
  },
  {
    id: 'project-2',
    name: '危废管理规范化',
    code: 'EP-2024-002',
    description: '建立规范的危废管理体系',
    fullDescription: '通过建立完善的危废分类、存储、转移和处理流程，确保企业危废管理符合环保法规要求。',
    type: 'waste',
    status: 'completed',
    progress: 100,
    manager: '李四',
    startDate: '2023-11-01',
    deadline: '2024-01-15',
    budget: '¥580,000',
    totalTasks: 8,
    completedTasks: 8,
    inProgressTasks: 0,
    pendingTasks: 0,
    tasks: [
      {
        id: 'task-4',
        title: '危废仓库改造',
        description: '按照规范改造危废暂存间',
        status: 'completed',
        priority: 'high',
        assignee: '王五',
        dueDate: '2023-11-30'
      }
    ],
    documents: [
      {
        id: 'doc-3',
        name: '危废管理方案.docx',
        type: 'word',
        size: '1.8 MB',
        uploadDate: '2023-10-28'
      }
    ]
  },
  {
    id: 'project-3',
    name: '废气治理设施维护',
    code: 'EP-2024-003',
    description: '定期维护废气处理设备',
    fullDescription: '对厂区所有废气处理设施进行定期检查、维护和保养，确保设备正常运行，废气达标排放。',
    type: 'air',
    status: 'delayed',
    progress: 40,
    manager: '王五',
    startDate: '2024-01-05',
    deadline: '2024-02-20',
    budget: '¥350,000',
    totalTasks: 6,
    completedTasks: 2,
    inProgressTasks: 2,
    pendingTasks: 2,
    tasks: [
      {
        id: 'task-5',
        title: '设备检查',
        description: '全面检查废气处理设备',
        status: 'completed',
        priority: 'medium',
        assignee: '赵六',
        dueDate: '2024-01-20'
      }
    ],
    documents: []
  },
  {
    id: 'project-4',
    name: '环保培训体系建设',
    code: 'EP-2024-004',
    description: '建立全员环保培训体系',
    fullDescription: '制定年度环保培训计划，建立培训课程体系，提高全体员工环保意识和操作技能。',
    type: 'training',
    status: 'in-progress',
    progress: 30,
    manager: '赵六',
    startDate: '2024-02-01',
    deadline: '2024-06-30',
    budget: '¥250,000',
    totalTasks: 10,
    completedTasks: 3,
    inProgressTasks: 2,
    pendingTasks: 5,
    tasks: [
      {
        id: 'task-6',
        title: '培训需求调研',
        description: '调研各部门培训需求',
        status: 'completed',
        priority: 'medium',
        assignee: '张三',
        dueDate: '2024-02-15'
      }
    ],
    documents: []
  }
])

const activeProjectId = ref('project-1')

const activeProject = computed(() => 
  projects.value.find(project => project.id === activeProjectId.value)
)

const filteredProjects = computed(() => {
  if (activeFilter.value === 'all') {
    return projects.value
  }
  return projects.value.filter(project => project.status === activeFilter.value)
})

// 新增：模态框状态
const showAddProjectModal = ref(false)
const showEditProjectModal = ref(false)
const showUploadModal = ref(false)

// 新增：表单数据
const newProjectForm = ref({
  name: '',
  description: '',
  fullDescription: ''
})

const editProjectForm = ref({
  id: '',
  name: '',
  description: '',
  fullDescription: ''
})

const selectedFile = ref(null)

function switchFilter(filterId) {
  activeFilter.value = filterId
}

function switchProject(projectId) {
  activeProjectId.value = projectId
}

// 修改：createProject 函数，改为打开模态框
function createProject() {
  newProjectForm.value = {
    name: '',
    description: '',
    fullDescription: ''
  }
  showAddProjectModal.value = true
}

// 修改：editProject 函数，改为打开编辑模态框
function editProject(projectId) {
  const project = projects.value.find(p => p.id === projectId)
  if (project) {
    editProjectForm.value = {
      id: project.id,
      name: project.name,
      description: project.description,
      fullDescription: project.fullDescription
    }
    showEditProjectModal.value = true
  }
}

// 新增：删除项目函数
function deleteProject(projectId) {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这个项目吗？项目相关的所有文件和任务也将被删除，此操作不可恢复。',
    confirmColor: '#ef4444',
    success: (res) => {
      if (res.confirm) {
        const index = projects.value.findIndex(p => p.id === projectId)
        if (index !== -1) {
          projects.value.splice(index, 1)
          
          // 如果删除的是当前激活的项目，切换到第一个项目
          if (activeProjectId.value === projectId && projects.value.length > 0) {
            activeProjectId.value = projects.value[0].id
          } else if (projects.value.length === 0) {
            activeProjectId.value = null
          }
          
          uni.showToast({
            title: '项目删除成功',
            icon: 'success'
          })
        }
      }
    }
  })
}

// 新增：确认添加项目
function confirmAddProject() {
  if (!newProjectForm.value.name.trim()) {
    uni.showToast({
      title: '请输入项目名称',
      icon: 'none'
    })
    return
  }

  const newProject = {
    id: 'project-' + Date.now(),
    name: newProjectForm.value.name,
    code: 'EP-2024-' + (projects.value.length + 1).toString().padStart(3, '0'),
    description: newProjectForm.value.description || '请描述项目内容',
    fullDescription: newProjectForm.value.fullDescription || '请详细描述项目目标、范围和要求',
    type: 'general',
    status: 'planning',
    progress: 0,
    manager: '当前用户',
    startDate: new Date().toLocaleDateString('zh-CN'),
    deadline: '待设定',
    budget: '待预算',
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    pendingTasks: 0,
    tasks: [],
    documents: []
  }
  
  projects.value.unshift(newProject)
  activeProjectId.value = newProject.id
  closeAddProjectModal()
  
  uni.showToast({
    title: '项目创建成功',
    icon: 'success'
  })
}

// 新增：确认编辑项目
function confirmEditProject() {
  if (!editProjectForm.value.name.trim()) {
    uni.showToast({
      title: '请输入项目名称',
      icon: 'none'
    })
    return
  }

  const projectIndex = projects.value.findIndex(p => p.id === editProjectForm.value.id)
  if (projectIndex !== -1) {
    projects.value[projectIndex].name = editProjectForm.value.name
    projects.value[projectIndex].description = editProjectForm.value.description
    projects.value[projectIndex].fullDescription = editProjectForm.value.fullDescription
    
    closeEditProjectModal()
    
    uni.showToast({
      title: '项目更新成功',
      icon: 'success'
    })
  }
}

// 新增：关闭模态框函数
function closeAddProjectModal() {
  showAddProjectModal.value = false
}

function closeEditProjectModal() {
  showEditProjectModal.value = false
}

// 修改：uploadFile 函数
function uploadFile() {
  if (!activeProject.value) {
    uni.showToast({
      title: '请先选择项目',
      icon: 'none'
    })
    return
  }
  
  selectedFile.value = null
  showUploadModal.value = true
}

// 新增：选择文件
function chooseFile() {
  uni.chooseFile({
    count: 1,
    type: 'all',
    success: (res) => {
      selectedFile.value = res.tempFiles[0]
    }
  })
}

// 新增：确认上传文件
function confirmUpload() {
  if (!selectedFile.value) {
    uni.showToast({
      title: '请选择文件',
      icon: 'none'
    })
    return
  }

  // 模拟文件上传
  const newDocument = {
    id: 'doc-' + Date.now(),
    name: selectedFile.value.name,
    type: getFileType(selectedFile.value.name),
    size: formatFileSize(selectedFile.value.size),
    uploadDate: new Date().toLocaleDateString('zh-CN')
  }

  if (!activeProject.value.documents) {
    activeProject.value.documents = []
  }
  
  activeProject.value.documents.push(newDocument)
  closeUploadModal()
  
  uni.showToast({
    title: '文件上传成功',
    icon: 'success'
  })
}

// 新增：关闭上传模态框
function closeUploadModal() {
  showUploadModal.value = false
  selectedFile.value = null
}

// 新增：删除文档
function deleteDocument(documentId) {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这个文件吗？此操作不可恢复。',
    confirmColor: '#ef4444',
    success: (res) => {
      if (res.confirm && activeProject.value && activeProject.value.documents) {
        const docIndex = activeProject.value.documents.findIndex(d => d.id === documentId)
        if (docIndex !== -1) {
          activeProject.value.documents.splice(docIndex, 1)
          uni.showToast({
            title: '文件删除成功',
            icon: 'success'
          })
        }
      }
    }
  })
}

// 新增：文件类型判断
function getFileType(filename) {
  const ext = filename.split('.').pop().toLowerCase()
  if (['pdf'].includes(ext)) return 'pdf'
  if (['doc', 'docx'].includes(ext)) return 'word'
  if (['xls', 'xlsx'].includes(ext)) return 'excel'
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext)) return 'image'
  return 'document'
}

// 新增：文件大小格式化
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}


function editTask(taskId) {
  uni.showToast({
    title: '编辑任务功能开发中',
    icon: 'none'
  })
}

function toggleTask(taskId) {
  const task = activeProject.value.tasks.find(t => t.id === taskId)
  if (task) {
    const oldStatus = task.status
    task.status = task.status === 'completed' ? 'pending' : 'completed'
    
    // 更新项目统计
    if (oldStatus === 'completed') {
      activeProject.value.completedTasks -= 1
      if (task.status === 'pending') {
        activeProject.value.pendingTasks += 1
      }
    } else {
      activeProject.value.completedTasks += 1
      if (oldStatus === 'pending') {
        activeProject.value.pendingTasks -= 1
      } else if (oldStatus === 'in-progress') {
        activeProject.value.inProgressTasks -= 1
      }
    }
    
    // 更新项目进度
    updateProjectProgress()
  }
}

function updateProjectProgress() {
  if (!activeProject.value || !activeProject.value.tasks.length) return
  
  const completedTasks = activeProject.value.tasks.filter(task => task.status === 'completed').length
  const progress = Math.round((completedTasks / activeProject.value.tasks.length) * 100)
  activeProject.value.progress = progress
}

function updateProgress() {
  uni.showToast({
    title: '更新进度功能开发中',
    icon: 'none'
  })
}

function previewDocument(document) {
  uni.showToast({
    title: `预览文档: ${document.name}`,
    icon: 'none'
  })
}

function downloadDocument(document) {
  uni.showToast({
    title: `下载文档: ${document.name}`,
    icon: 'none'
  })
}



function getProjectIcon(type) {
  const iconMap = {
    water: 'water',
    waste: 'trash',
    air: 'cloudy',
    training: 'person',
    general: 'folder'
  }
  return iconMap[type] || 'folder'
}

function getProjectColor(status) {
  const colorMap = {
    planning: '#64748b',
    'in-progress': '#3b82f6',
    completed: '#10b981',
    delayed: '#ef4444'
  }
  return colorMap[status] || '#64748b'
}

function getProjectStatusText(status) {
  const statusMap = {
    planning: '规划中',
    'in-progress': '进行中',
    completed: '已完成',
    delayed: '已延期'
  }
  return statusMap[status] || '未知'
}

function getProjectTypeText(type) {
  const typeMap = {
    water: '水处理',
    waste: '固废管理',
    air: '废气治理',
    training: '环保培训',
    general: '综合项目'
  }
  return typeMap[type] || '其他'
}

function getTaskPriorityText(priority) {
  const priorityMap = {
    low: '低',
    medium: '中',
    high: '高'
  }
  return priorityMap[priority] || '中'
}

function getDocumentIcon(type) {
  const iconMap = {
    pdf: 'pdf',
    word: 'document',
    excel: 'stats-bars',
    image: 'image'
  }
  return iconMap[type] || 'document'
}
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
  width: 480rpx;
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

.projects__detail-status {
  font-size: 24rpx;
  padding: 6rpx 12rpx;
  border-radius: 6rpx;
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  font-weight: 500;
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
  opacity: 0;
  transition: opacity 0.3s ease;
}

.projects__item:active .projects__item-actions {
  opacity: 1;
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
  background: rgba(59, 130, 246, 0.1);
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
  opacity: 0;
  transition: opacity 0.3s ease;
}

.projects__document-item:active .projects__document-actions {
  opacity: 1;
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
  max-width: 600rpx;
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
  width: 100%;
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
  width: 100%;
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
    opacity: 1;
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