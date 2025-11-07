<!-- 项目管理页面 -->
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
          <button class="projects__button projects__button--secondary" @tap="exportProjects">
            <uni-icons type="download" size="16" color="#3b82f6" />
            <text>导出项目</text>
          </button>
          <button class="projects__button projects__button--primary" @tap="createProject">
            <uni-icons type="plus" size="16" color="#ffffff" />
            <text>新建项目</text>
          </button>
        </view>
      </view>

      <!-- 统计卡片 -->
      <view class="projects__stats">
        <view class="projects__stat-card">
          <view class="projects__stat-icon" style="background: rgba(59, 130, 246, 0.1);">
            <uni-icons type="folder" size="24" color="#3b82f6" />
          </view>
          <view class="projects__stat-content">
            <text class="projects__stat-value">{{ stats.totalProjects }}</text>
            <text class="projects__stat-label">项目总数</text>
          </view>
        </view>
        <view class="projects__stat-card">
          <view class="projects__stat-icon" style="background: rgba(16, 185, 129, 0.1);">
            <uni-icons type="checkmark" size="24" color="#10b981" />
          </view>
          <view class="projects__stat-content">
            <text class="projects__stat-value">{{ stats.completedProjects }}</text>
            <text class="projects__stat-label">已完成</text>
          </view>
        </view>
        <view class="projects__stat-card">
          <view class="projects__stat-icon" style="background: rgba(245, 158, 11, 0.1);">
            <uni-icons type="gear" size="24" color="#f59e0b" />
          </view>
          <view class="projects__stat-content">
            <text class="projects__stat-value">{{ stats.inProgressProjects }}</text>
            <text class="projects__stat-label">进行中</text>
          </view>
        </view>
        <view class="projects__stat-card">
          <view class="projects__stat-icon" style="background: rgba(239, 68, 68, 0.1);">
            <uni-icons type="clock" size="24" color="#ef4444" />
          </view>
          <view class="projects__stat-content">
            <text class="projects__stat-value">{{ stats.delayedProjects }}</text>
            <text class="projects__stat-label">已延期</text>
          </view>
        </view>
      </view>

      <!-- 主要内容区域 -->
      <view class="projects__content">
        <!-- 左侧项目列表 -->
        <view class="projects__list-panel">
          <view class="projects__panel-header">
            <text class="projects__panel-title">项目列表</text>
            <view class="projects__filter-tabs">
              <view 
                v-for="tab in filterTabs" 
                :key="tab.id"
                class="projects__filter-tab"
                :class="{ 'projects__filter-tab--active': activeFilter === tab.id }"
                @tap="() => switchFilter(tab.id)"
              >
                <text>{{ tab.name }}</text>
              </view>
            </view>
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
                
                <!-- 进度条 -->
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
                <view class="projects__item-action" @tap.stop="() => editProject(project.id)">
                  <uni-icons type="compose" size="16" color="#64748b" />
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
              <text class="projects__detail-status" v-if="activeProject">
                {{ getProjectStatusText(activeProject.status) }}
              </text>
            </view>
            <view class="projects__detail-actions">
              <button class="projects__button projects__button--outline" @tap="addTask" :disabled="!activeProject">
                <uni-icons type="plus" size="16" color="#64748b" />
                <text>添加任务</text>
              </button>
              <button class="projects__button projects__button--primary" @tap="updateProgress" :disabled="!activeProject">
                <uni-icons type="checkmark" size="16" color="#ffffff" />
                <text>更新进度</text>
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
                  <uni-icons type="graph" size="18" color="#10b981" />
                  <text class="projects__section-title">项目进度</text>
                  <text class="projects__section-count">{{ activeProject.progress }}%</text>
                </view>
                <view class="projects__progress-detail">
                  <view class="projects__progress-visual">
                    <view class="projects__progress-circle">
                      <text class="projects__progress-circle-text">{{ activeProject.progress }}%</text>
                    </view>
                  </view>
                  <view class="projects__progress-stats">
                    <view class="projects__progress-stat">
                      <text class="projects__progress-stat-label">总任务数</text>
                      <text class="projects__progress-stat-value">{{ activeProject.totalTasks }}</text>
                    </view>
                    <view class="projects__progress-stat">
                      <text class="projects__progress-stat-label">已完成</text>
                      <text class="projects__progress-stat-value">{{ activeProject.completedTasks }}</text>
                    </view>
                    <view class="projects__progress-stat">
                      <text class="projects__progress-stat-label">进行中</text>
                      <text class="projects__progress-stat-value">{{ activeProject.inProgressTasks }}</text>
                    </view>
                    <view class="projects__progress-stat">
                      <text class="projects__progress-stat-label">待开始</text>
                      <text class="projects__progress-stat-value">{{ activeProject.pendingTasks }}</text>
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
                    :class="`projects__task-item--${task.status}`"
                  >
                    <view class="projects__task-checkbox" @tap="() => toggleTask(task.id)">
                      <uni-icons 
                        :type="task.status === 'completed' ? 'checkbox-filled' : 'checkbox'" 
                        size="20" 
                        :color="task.status === 'completed' ? '#10b981' : '#cbd5e1'" 
                      />
                    </view>
                    <view class="projects__task-content">
                      <view class="projects__task-header">
                        <text class="projects__task-title">{{ task.title }}</text>
                        <view class="projects__task-badge" :class="`projects__task-badge--${task.priority}`">
                          {{ getTaskPriorityText(task.priority) }}
                        </view>
                      </view>
                      <text class="projects__task-desc">{{ task.description }}</text>
                      <view class="projects__task-meta">
                        <view class="projects__task-meta-item">
                          <uni-icons type="person" size="12" color="#94a3b8" />
                          <text class="projects__task-meta-text">{{ task.assignee }}</text>
                        </view>
                        <view class="projects__task-meta-item">
                          <uni-icons type="calendar" size="12" color="#94a3b8" />
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
                      <view class="projects__document-action" @tap.stop="() => previewDocument(document)">
                        <uni-icons type="eye" size="16" color="#64748b" />
                      </view>
                      <view class="projects__document-action" @tap.stop="() => downloadDocument(document)">
                        <uni-icons type="download" size="16" color="#64748b" />
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

// 筛选标签
const filterTabs = ref([
  { id: 'all', name: '全部' },
  { id: 'in-progress', name: '进行中' },
  { id: 'completed', name: '已完成' },
  { id: 'delayed', name: '已延期' }
])

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

function switchFilter(filterId) {
  activeFilter.value = filterId
}

function switchProject(projectId) {
  activeProjectId.value = projectId
}

function createProject() {
  const newProject = {
    id: 'project-new-' + Date.now(),
    name: '新项目',
    code: 'EP-2024-NEW',
    description: '请描述项目内容',
    fullDescription: '请详细描述项目目标、范围和要求',
    type: 'general',
    status: 'planning',
    progress: 0,
    manager: '当前用户',
    startDate: new Date().toLocaleDateString(),
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
}

function editProject(projectId) {
  uni.showToast({
    title: '编辑项目功能开发中',
    icon: 'none'
  })
}

function addTask() {
  if (!activeProject.value) return
  
  const newTask = {
    id: 'task-new-' + Date.now(),
    title: '新任务',
    description: '请描述任务内容',
    status: 'pending',
    priority: 'medium',
    assignee: '待分配',
    dueDate: '待设定'
  }
  
  if (!activeProject.value.tasks) {
    activeProject.value.tasks = []
  }
  activeProject.value.tasks.push(newTask)
  
  // 更新项目统计
  activeProject.value.totalTasks += 1
  activeProject.value.pendingTasks += 1
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

function exportProjects() {
  uni.showToast({
    title: '导出项目数据',
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

/* 统计卡片 */
.projects__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200rpx, 1fr));
  gap: 20rpx;
}

.projects__stat-card {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 24rpx;
  background: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(15, 23, 42, 0.06);
  border: 1rpx solid #f1f5f9;
}

.projects__stat-icon {
  width: 56rpx;
  height: 56rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.projects__stat-content {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.projects__stat-value {
  font-size: 32rpx;
  font-weight: 700;
  color: #0f172a;
  line-height: 1;
}

.projects__stat-label {
  font-size: 24rpx;
  color: #64748b;
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

/* 筛选标签 */
.projects__filter-tabs {
  display: flex;
  align-items: center;
  gap: 8rpx;
  background: #f1f5f9;
  border-radius: 8rpx;
  padding: 4rpx;
}

.projects__filter-tab {
  padding: 8rpx 16rpx;
  border-radius: 6rpx;
  font-size: 24rpx;
  color: #64748b;
  font-weight: 500;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.projects__filter-tab--active {
  background: #ffffff;
  color: #3b82f6;
  box-shadow: 0 2rpx 8rpx rgba(15, 23, 42, 0.08);
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
    width: 100%;
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
  
  .projects__stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .projects__panel-header {
    flex-direction: column;
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

@media (max-width: 767px) {
  .projects__stats {
    grid-template-columns: 1fr;
  }
  
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
  
  .projects__filter-tabs {
    flex-wrap: wrap;
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