<!-- 现场踏勘页面 -->
<template>
	<app-layout current="pages/reconnoitre/index">
		<view class="reconnoitre-page">
			<!-- Tab切换 -->
			<view class="reconnoitre-tabs">
				<view class="tabs-container">
					<view 
						v-for="(tab, index) in tabs" 
						:key="index" 
						class="tab-item"
						:class="{ 'tab-item--active': currentTab === index }"
						@tap="currentTab = index"
					>
						<text class="tab-label">{{ tab }}</text>
					</view>
				</view>
			</view>

			<!-- 主要内容区域 -->
			<view class="reconnoitre-content">
				<scroll-view class="content-scroll" scroll-y>
					<!-- Tab 0: 主要建设内容 -->
					<view v-show="currentTab === 0" class="content-section">
						<view class="section-card">
							<view class="section-header">
								<uni-icons type="list" size="20" color="#166534" />
								<text class="section-title">主要建设内容</text>
							</view>
							<view class="section-body">
								<view class="section-actions">
									<button class="btn btn--ghost" @tap="openAddMainContent">
										<uni-icons type="plus" size="16" color="#166534" />
										<text>新增</text>
									</button>

									<button v-if="selectModeMain" class="btn btn--danger" :disabled="!selectedMainIds.length" @tap="removeSelectedMain">
										<uni-icons type="trash" size="16" color="#ffffff" />
										<text>删除选中（{{ selectedMainIds.length }}）</text>
									</button>

									<button class="btn btn--secondary" @tap="toggleSelectModeMain">
										<uni-icons :type="selectModeMain ? 'clear' : 'checkbox'" size="16" color="#155e3b" />
										<text>{{ selectModeMain ? '取消' : '选择删除' }}</text>
									</button>
								</view>

								<view v-if="mainContentTable.length" class="form-grid form-grid--base">
									<view class="form-item" v-for="(item, idx) in mainContentTable" :key="item.id">
										<view class="baseinfo__row">
											<text class="form-item__label">{{ item.label }}</text>
											
											<!-- 图片类型字段 -->
											<view v-if="item.type === 'image'" class="form-item__image-upload">
												<uni-file-picker 
													v-model="item.value" 
													fileMediatype="image" 
													mode="grid"
													:limit="9"
													:auto-upload="false"
												/>
											</view>
											
											<!-- 普通文本字段 -->
											<uni-easyinput 
												v-else
												class="form-item__input" 
												v-model="item.value"
												placeholder="请输入具体的值" 
												:clearable="true" 
											/>

											<view v-if="selectModeMain" class="form-item__select">
												<checkbox :checked="selectedMainIds.includes(item.id)" @tap="() => toggleSelectedMain(item.id)" />
											</view>
										</view>
									</view>
								</view>

								<view v-else class="empty-state">
									<uni-icons type="list" size="48" color="#cbd5e1" />
									<text class="empty-text">暂无建设内容</text>
									<text class="empty-tip">点击新增按钮添加建设内容</text>
								</view>
							</view>
						</view>
					</view>


					<!-- Tab 1: 设备列表情况 -->
					<view v-show="currentTab === 1" class="content-section">
						<view class="section-card">
							<view class="section-header">
								<uni-icons type="gear" size="20" color="#166534" />
								<text class="section-title">设备列表情况</text>
							</view>
							<view class="section-body">
								<view class="section-actions">
									<button class="btn btn--ghost" @tap="addEquipment">
										<uni-icons type="plus" size="16" color="#166534" />
										<text>新增设备</text>
									</button>
								</view>

								<view v-if="equipmentList.length" class="data-table">
									<view class="table-header">
										<text class="table-th w200">设备名称</text>
										<text class="table-th w120">数量</text>
										<text class="table-th">备注</text>
										<text class="table-th w200">图片</text>
										<text class="table-th w80">操作</text>
									</view>
									<view class="table-body">
										<view class="table-row" v-for="(item, index) in equipmentList" :key="item.id">
											<uni-easyinput class="table-td w200" v-model="item.name" placeholder="设备名称" />
											<uni-easyinput class="table-td w120" v-model="item.quantity" placeholder="数量" />
											<uni-easyinput class="table-td" v-model="item.remark" placeholder="备注" />
											<view class="table-td w200">
												<uni-file-picker 
													v-model="item.images" 
													fileMediatype="image" 
													mode="grid"
													:limit="3"
													:auto-upload="false"
												/>
											</view>
											<view class="table-td w80">
												<button class="icon-btn icon-btn--danger" @tap="() => removeEquipment(index)">
													<uni-icons type="trash" size="16" color="#d92d20" />
												</button>
											</view>
										</view>
									</view>
								</view>

								<view v-else class="empty-state">
									<uni-icons type="gear" size="48" color="#cbd5e1" />
									<text class="empty-text">暂无设备信息</text>
									<text class="empty-tip">点击新增按钮添加设备</text>
								</view>
							</view>
						</view>
					</view>


					<!-- Tab 2: 污染物设施情况 -->
					<view v-show="currentTab === 2" class="content-section">
						<view class="section-card">
							<view class="section-header">
								<uni-icons type="flag" size="20" color="#166534" />
								<text class="section-title">污染物设施情况</text>
							</view>
							<view class="section-body">
								<view class="section-actions">
									<button class="btn btn--ghost" @tap="addPollutionFacility">
										<uni-icons type="plus" size="16" color="#166534" />
										<text>新增设施</text>
									</button>
								</view>

								<view v-if="pollutionFacilityList.length" class="data-table">
									<view class="table-header">
										<text class="table-th w200">设施名称</text>
										<text class="table-th w120">数量</text>
										<text class="table-th">备注</text>
										<text class="table-th w200">图片</text>
										<text class="table-th w80">操作</text>
									</view>
									<view class="table-body">
										<view class="table-row" v-for="(item, index) in pollutionFacilityList" :key="item.id">
											<uni-easyinput class="table-td w200" v-model="item.name" placeholder="设施名称" />
											<uni-easyinput class="table-td w120" v-model="item.quantity" placeholder="数量" />
											<uni-easyinput class="table-td" v-model="item.remark" placeholder="备注" />
											<view class="table-td w200">
												<uni-file-picker 
													v-model="item.images" 
													fileMediatype="image" 
													mode="grid"
													:limit="3"
													:auto-upload="false"
												/>
											</view>
											<view class="table-td w80">
												<button class="icon-btn icon-btn--danger" @tap="() => removePollutionFacility(index)">
													<uni-icons type="trash" size="16" color="#d92d20" />
												</button>
											</view>
										</view>
									</view>
								</view>

								<view v-else class="empty-state">
									<uni-icons type="flag" size="48" color="#cbd5e1" />
									<text class="empty-text">暂无污染物设施信息</text>
									<text class="empty-tip">点击新增按钮添加设施</text>
								</view>
							</view>
						</view>
					</view>


					<!-- Tab 3: 排污口情况 -->
					<view v-show="currentTab === 3" class="content-section">
						<view class="section-card">
							<view class="section-header">
								<uni-icons type="water" size="20" color="#166534" />
								<text class="section-title">排污口情况</text>
							</view>
							<view class="section-body">
								<view class="section-actions">
									<button class="btn btn--primary" @tap="generateOutletInfo">
										<uni-icons type="gear" size="16" color="#ffffff" />
										<text>生成排污口信息</text>
									</button>
								</view>

								<!-- 排污口标识牌信息列表 -->
								<view v-if="outletSignboard.sections && outletSignboard.sections.length" class="data-table">
									<view class="table-body">
										<template v-for="(sec, si) in outletSignboard.sections" :key="'s'+si">
											<view class="table-row table-row--simple">
												<text class="table-td table-td--section">{{ sec.block }}</text>
												<!-- 只有噪声才可以新增 -->
												<button v-if="sec.block == '噪声'" class="pw-ico icon-btn" @tap="() => addOutletItem(si)">
													<uni-icons type="plus" size="16" color="#166534" />
													<text>新增</text>
												</button>
											</view>
											<view class="form-grid form-grid--base">
												<!-- 按组渲染，每组 3 条，除了危废以外 -->
												<template v-for="(group, gi) in groupOutletItems(sec.items, sec.block)" :key="'g'+si+'-'+gi">
													<!-- 普通 3 条 -->
													<view class="form-item" v-for="(it, ii) in group" :key="'r'+si+'-'+gi+'-'+ii">
														<view class="form-item__row">
															<uni-easyinput v-model="it.title" placeholder="内容标题" />
															<uni-easyinput v-model="it.content" placeholder="请输入具体的值" />
														</view>
													</view>

													<!-- 删除按钮：只有「非危险废物」才显示 -->
													<view v-if="sec.block !== '危险废物'" class="form-item" style="margin-bottom:12px;">
														<view class="form-item__row" style="justify-content:flex-end;">
															<button class="icon-btn icon-btn--danger" @tap="() => removeOutletGroup(sec, gi)">
																<uni-icons type="trash" size="16" color="#d92d20" />
															</button>
														</view>
													</view>
												</template>
											</view>
										</template>
									</view>
								</view>

								<view v-else class="empty-state">
									<uni-icons type="water" size="48" color="#cbd5e1" />
									<text class="empty-text">暂无排污口信息</text>
									<text class="empty-tip">点击生成按钮获取排污口信息</text>
								</view>
							</view>
						</view>
					</view>
				</scroll-view>
			</view>
		</view>
	</app-layout>

	<!-- 新增主要建设内容弹窗 -->
	<uni-popup ref="newMainContentPopup" type="center">
		<view class="modal">
			<view class="modal-header">
				<text class="modal-title">新增建设内容</text>
			</view>
			<view class="modal-body">
				<text class="modal-description">请输入内容名称</text>
				<uni-easyinput v-model="newMainContentLabel" placeholder="如：项目名称/建设规模" />
			</view>
			<view class="modal-actions">
				<button class="btn btn--ghost" @tap="closeMainContent">取消</button>
				<button class="btn btn--primary" @tap="confirmAddMainContent">确定</button>
			</view>
		</view>
	</uni-popup>
</template>


<script setup>
import { ref, reactive } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import { onShow } from '@dcloudio/uni-app'
import { navTitleStore } from '@/stores/navTitle.js'

// 设置头部导航栏title
const navTitle = navTitleStore()
onShow(() => navTitle.setTitle('现场踏勘'))

// Tab定义
const tabs = ['建设内容', '设备情况', '污染物设施', '排污口情况']
const currentTab = ref(0)

// ========== Tab 0: 主要建设内容 ==========
const mainContentTable = ref([
	{ id: 'mc_1', label: '项目名称', value: '', type: 'text' },
	{ id: 'mc_2', label: '建设单位', value: '', type: 'text' },
	{ id: 'mc_3', label: '建设地点', value: '', type: 'text' },
	{ id: 'mc_4', label: '建设规模', value: '', type: 'text' },
	{ id: 'mc_5', label: '主体工程', value: [], type: 'image' }
])

const selectModeMain = ref(false)
const selectedMainIds = ref([])
const newMainContentPopup = ref(null)
const newMainContentLabel = ref('')

function toggleSelectModeMain() {
	selectModeMain.value = !selectModeMain.value
	if (!selectModeMain.value) selectedMainIds.value = []
}

function toggleSelectedMain(id) {
	const idx = selectedMainIds.value.indexOf(id)
	if (idx > -1) selectedMainIds.value.splice(idx, 1)
	else selectedMainIds.value.push(id)
}

function removeSelectedMain() {
	mainContentTable.value = mainContentTable.value.filter(item => !selectedMainIds.value.includes(item.id))
	selectedMainIds.value = []
	selectModeMain.value = false
	uni.showToast({ title: '删除成功', icon: 'success' })
}

function openAddMainContent() {
	newMainContentLabel.value = ''
	newMainContentPopup.value?.open()
}

function closeMainContent() {
	newMainContentPopup.value?.close()
}

function confirmAddMainContent() {
	if (!newMainContentLabel.value.trim()) {
		uni.showToast({ title: '请输入内容名称', icon: 'none' })
		return
	}
	const newItem = {
		id: 'mc_' + Date.now(),
		label: newMainContentLabel.value,
		value: '',
		type: 'text'
	}
	mainContentTable.value.push(newItem)
	closeMainContent()
	uni.showToast({ title: '添加成功', icon: 'success' })
}


// ========== Tab 1: 设备列表情况 ==========
const equipmentList = ref([
	{ id: 'eq_1', name: '废水处理设备', quantity: '1', remark: '运行正常', images: [] },
	{ id: 'eq_2', name: '废气处理设备', quantity: '2', remark: '定期维护', images: [] }
])

function addEquipment() {
	const newEquipment = {
		id: 'eq_' + Date.now(),
		name: '',
		quantity: '',
		remark: '',
		images: []
	}
	equipmentList.value.push(newEquipment)
	uni.showToast({ title: '已添加新设备', icon: 'success' })
}

function removeEquipment(index) {
	uni.showModal({
		title: '确认删除',
		content: '确定要删除这条设备记录吗？',
		success: (res) => {
			if (res.confirm) {
				equipmentList.value.splice(index, 1)
				uni.showToast({ title: '删除成功', icon: 'success' })
			}
		}
	})
}

// ========== Tab 2: 污染物设施情况 ==========
const pollutionFacilityList = ref([
	{ id: 'pf_1', name: '废水处理站', quantity: '1', remark: '处理能力100t/d', images: [] },
	{ id: 'pf_2', name: '危废暂存间', quantity: '1', remark: '面积50㎡', images: [] }
])

function addPollutionFacility() {
	const newFacility = {
		id: 'pf_' + Date.now(),
		name: '',
		quantity: '',
		remark: '',
		images: []
	}
	pollutionFacilityList.value.push(newFacility)
	uni.showToast({ title: '已添加新设施', icon: 'success' })
}

function removePollutionFacility(index) {
	uni.showModal({
		title: '确认删除',
		content: '确定要删除这条设施记录吗？',
		success: (res) => {
			if (res.confirm) {
				pollutionFacilityList.value.splice(index, 1)
				uni.showToast({ title: '删除成功', icon: 'success' })
			}
		}
	})
}


// ========== Tab 3: 排污口情况 ==========
const outletSignboard = ref({
	sections: []
})

function generateOutletInfo() {
	// 模拟生成排污口信息（参考验收页面的标识牌结构）
	outletSignboard.value = {
		sections: [
			{
				block: '废水排放口',
				items: [
					{ title: '排放口编号', content: 'WS-001' },
					{ title: '排放口名称', content: '生产废水排放口' },
					{ title: '排放去向', content: '市政污水管网' }
				]
			},
			{
				block: '废气排放口',
				items: [
					{ title: '排放口编号', content: 'FQ-001' },
					{ title: '排放口名称', content: '锅炉废气排放口' },
					{ title: '排放高度', content: '15米' }
				]
			},
			{
				block: '噪声',
				items: [
					{ title: '监测点位', content: '厂界东侧' },
					{ title: '主要噪声源', content: '生产设备' },
					{ title: '执行标准', content: '2类标准' }
				]
			},
			{
				block: '危险废物',
				items: [
					{ title: '危废名称', content: '废机油' },
					{ title: '危废代码', content: 'HW08' },
					{ title: '暂存位置', content: '危废暂存间' }
				]
			}
		]
	}
	uni.showToast({ title: '排污口信息已生成', icon: 'success' })
}

function addOutletItem(sectionIndex) {
	const section = outletSignboard.value.sections[sectionIndex]
	if (section) {
		section.items.push(
			{ title: '', content: '' },
			{ title: '', content: '' },
			{ title: '', content: '' }
		)
	}
}

function groupOutletItems(items, blockName) {
	if (!items || items.length === 0) return []
	// 危险废物不分组，其他每3个一组
	if (blockName === '危险废物') {
		return [items]
	}
	const groups = []
	for (let i = 0; i < items.length; i += 3) {
		groups.push(items.slice(i, i + 3))
	}
	return groups
}

function removeOutletGroup(section, groupIndex) {
	uni.showModal({
		title: '确认删除',
		content: '确定要删除这组信息吗？',
		success: (res) => {
			if (res.confirm) {
				section.items.splice(groupIndex * 3, 3)
				uni.showToast({ title: '删除成功', icon: 'success' })
			}
		}
	})
}
</script>


<style lang="scss" scoped>
.reconnoitre-page {
	display: flex;
	flex-direction: column;
	height: 100vh;
	width: 100%;
	max-width: 100vw;
	overflow: hidden;
	background: #f8fafc;
	box-sizing: border-box;
}

/* Tab切换样式 */
.reconnoitre-tabs {
	flex-shrink: 0;
	background: #ffffff;
	border-bottom: 1px solid #e2e8f0;
	padding: 0 32rpx;
	box-shadow: 0 2rpx 8rpx rgba(15, 23, 42, 0.05);
	z-index: 100;
}

.tabs-container {
	display: flex;
	align-items: center;
	gap: 8rpx;
}

.tab-item {
	flex: 1;
	padding: 24rpx 16rpx;
	text-align: center;
	position: relative;
	transition: all 0.3s ease;
	cursor: pointer;
}

.tab-item:active {
	background: #f8fafc;
}

.tab-item--active {
	color: #166534;
}

.tab-item--active::after {
	content: '';
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	height: 4rpx;
	background: #166534;
	border-radius: 2rpx 2rpx 0 0;
}

.tab-label {
	font-size: 28rpx;
	font-weight: 500;
	color: #64748b;
	transition: color 0.3s ease;
}

.tab-item--active .tab-label {
	color: #166534;
	font-weight: 600;
}

/* 内容区域 */
.reconnoitre-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	min-height: 0;
	width: 100%;
	max-width: 100%;
	overflow: hidden;
	box-sizing: border-box;
}

.content-scroll {
	flex: 1;
	padding: 32rpx;
	width: 100%;
	max-width: 100%;
	height: 100%;
	overflow-x: hidden;
	box-sizing: border-box;
}

.content-section {
	width: 100%;
	max-width: 100%;
	box-sizing: border-box;
}

/* 卡片样式 */
.section-card {
	background: #ffffff;
	border-radius: 16rpx;
	box-shadow: 0 2rpx 12rpx rgba(15, 23, 42, 0.06);
	width: 100%;
	max-width: 100%;
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
}

.section-header {
	display: flex;
	align-items: center;
	gap: 12rpx;
	padding: 32rpx;
	border-bottom: 1px solid #f1f5f9;
	background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
	flex-shrink: 0;
}

.section-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #0f172a;
}

.section-body {
	padding: 32rpx;
	width: 100%;
	max-width: 100%;
	box-sizing: border-box;
	flex: 1;
	min-height: 0;
}

.section-actions {
	display: flex;
	align-items: center;
	gap: 16rpx;
	margin-bottom: 24rpx;
	flex-wrap: wrap;
}

/* 按钮
样式 */
.btn {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8rpx;
	padding: 0 24rpx;
	height: 64rpx;
	border-radius: 12rpx;
	font-size: 28rpx;
	font-weight: 500;
	border: none;
	transition: all 0.2s ease;
	white-space: nowrap;
}

.btn:active {
	opacity: 0.8;
	transform: translateY(1rpx);
}

.btn[disabled] {
	opacity: 0.6;
	pointer-events: none;
}

.btn--primary {
	background: linear-gradient(135deg, #166534 0%, #15803d 100%);
	color: #ffffff;
	box-shadow: 0 4rpx 12rpx rgba(22, 101, 52, 0.2);
}

.btn--secondary {
	background: #f8fafc;
	color: #155e3b;
	border: 1px solid #e2e8f0;
}

.btn--ghost {
	background: #ffffff;
	color: #166534;
	border: 1px solid #166534;
}

.btn--danger {
	background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
	color: #ffffff;
	box-shadow: 0 4rpx 12rpx rgba(220, 38, 38, 0.2);
}

/* 表单网格 */
.form-grid {
	display: grid;
	gap: 24rpx;
	width: 100%;
	max-width: 100%;
	box-sizing: border-box;
}

.form-grid--base {
	grid-template-columns: repeat(auto-fill, minmax(300rpx, 1fr));
}

.form-item {
	display: flex;
	flex-direction: column;
	gap: 12rpx;
	width: 100%;
	max-width: 100%;
	box-sizing: border-box;
}

.baseinfo__row,
.form-item__row {
	display: flex;
	align-items: center;
	gap: 16rpx;
	padding: 20rpx;
	background: #f8fafc;
	border-radius: 12rpx;
	border: 1px solid #e2e8f0;
	transition: all 0.2s ease;
	width: 100%;
	max-width: 100%;
	box-sizing: border-box;
	overflow: hidden;
}

.baseinfo__row:hover,
.form-item__row:hover {
	background: #ffffff;
	border-color: #cbd5e1;
	box-shadow: 0 2rpx 8rpx rgba(15, 23, 42, 0.06);
}

.form-item__label {
	font-size: 28rpx;
	color: #0f172a;
	font-weight: 500;
	min-width: 160rpx;
	max-width: 200rpx;
	flex-shrink: 0;
	word-break: break-word;
}

.form-item__input {
	flex: 1;
	min-width: 0;
	max-width: 100%;
}

.form-item__select {
	flex-shrink: 0;
}

.form-item__image-upload {
	flex: 1;
	min-width: 0;
	max-width: 100%;
	overflow: hidden;
}

/* 表格样式 */
.data-table {
	background: #ffffff;
	border: 1px solid #e2e8f0;
	border-radius: 12rpx;
	overflow-x: auto;
	overflow-y: hidden;
	width: 100%;
	max-width: 100%;
	box-sizing: border-box;
}

.table-header {
	display: flex;
	align-items: center;
	background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
	border-bottom: 1px solid #e2e8f0;
	padding: 20rpx 16rpx;
	box-sizing: border-box;
}

.table-th {
	flex: 1;
	font-size: 26rpx;
	color: #64748b;
	font-weight: 600;
	text-align: center;
}

.table-th.w80 { width: 80rpx; flex: none; }
.table-th.w120 { width: 120rpx; flex: none; }
.table-th.w200 { width: 200rpx; flex: none; }

.table-body {
	display: flex;
	flex-direction: column;
}

.table-row {
	display: flex;
	align-items: center;
	padding: 16rpx;
	border-bottom: 1px solid #f1f5f9;
	transition: background 0.2s ease;
	box-sizing: border-box;
}

.table-row:last-child {
	border-bottom: none;
}

.table-row:hover {
	background: #f8fafc;
}

.table-row--simple {
	background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
	padding: 20rpx 24rpx;
	border-bottom: 2px solid #e2e8f0;
	justify-content: space-between;
}

.table-td {
	flex: 1;
	font-size: 26rpx;
	color: #0f172a;
	padding: 0 8rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.table-td.w80 { width: 80rpx; flex: none; }
.table-td.w120 { width: 120rpx; flex: none; }
.table-td.w200 { width: 200rpx; flex: none; }

.table-td--section {
	font-size: 30rpx;
	font-weight: 600;
	color: #166534;
	text-align: left;
	justify-content: flex-start;
}

/* 图标按钮 */
.icon-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 6rpx;
	padding: 12rpx 16rpx;
	border-radius: 8rpx;
	background: #f8fafc;
	border: 1px solid #e2e8f0;
	font-size: 24rpx;
	color: #64748b;
	transition: all 0.2s ease;
}

.icon-btn:active {
	transform: scale(0.95);
}

.icon-btn--danger {
	background: #fef2f2;
	border-color: #fecaca;
	color: #dc2626;
}

.icon-btn--danger:active {
	background: #fee2e2;
}

.pw-ico {
	background: #ffffff;
	border: 1px solid #166534;
	color: #166534;
}

/* 空状态 */
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 80rpx 32rpx;
	gap: 16rpx;
}

.empty-text {
	font-size: 28rpx;
	color: #64748b;
	font-weight: 500;
}

.empty-tip {
	font-size: 24rpx;
	color: #94a3b8;
}

/* 弹窗样式 */
.modal {
	width: 600rpx;
	background: #ffffff;
	border-radius: 16rpx;
	overflow: hidden;
	box-shadow: 0 20rpx 60rpx rgba(15, 23, 42, 0.2);
}

.modal-header {
	padding: 32rpx;
	border-bottom: 1px solid #f1f5f9;
	background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
}

.modal-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #0f172a;
}

.modal-body {
	padding: 32rpx;
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.modal-description {
	font-size: 26rpx;
	color: #64748b;
	margin-bottom: 8rpx;
}

.modal-actions {
	display: flex;
	align-items: center;
	gap: 16rpx;
	padding: 24rpx 32rpx;
	border-top: 1px solid #f1f5f9;
	background: #f8fafc;
}

.modal-actions .btn {
	flex: 1;
}

/* 响应式：移动端优化 */
@media (max-width: 768px) {
	.reconnoitre-page {
		height: 89.6vh;

	}
	
	.reconnoitre-tabs {
		padding: 0 16rpx;
		overflow-x: auto;
	}

	.tabs-container {
		overflow-x: auto;
	}

	.tab-item {
		padding: 20rpx 8rpx;
		min-width: 120rpx;
	}

	.tab-label {
		font-size: 24rpx;
	}

	.content-scroll {
		padding: 16rpx;
	}

	.section-header {
		padding: 24rpx 16rpx;
	}

	.section-body {
		padding: 24rpx 16rpx;
	}

	.section-actions {
		flex-wrap: wrap;
	}

	.form-grid--base {
		grid-template-columns: 1fr;
	}

	.form-item__label {
		min-width: 120rpx;
		max-width: 150rpx;
		font-size: 26rpx;
	}

	.baseinfo__row,
	.form-item__row {
		flex-direction: column;
		align-items: flex-start;
		gap: 12rpx;
	}

	.form-item__label {
		width: 100%;
		max-width: 100%;
	}

	.form-item__input,
	.form-item__image-upload {
		width: 100%;
	}

	.modal {
		width: 90vw;
		max-width: 90vw;
	}
}
</style>
