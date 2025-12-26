<template>
	<view class="baseinfo-tab">
		<!-- 只有提取成功后才显示 -->
		<view v-if="baseTable.length > 0" class="subsection">
			<view class="subsection-head">
				<uni-icons type="list" size="18" color="#166534" />
				<text class="subsection-title">项目信息表</text>
			</view>
			
			<!-- 操作按钮 -->
			<view class="section-actions">
				<button class="btn btn--ghost" @tap="handleOpenAddBase">
					<uni-icons type="plus" size="16" color="#166534" />
					<text>新增</text>
				</button>
				
				<button 
					v-if="selectMode" 
					class="btn btn--danger"
					:disabled="!selectedIds.length" 
					@tap="removeSelected">
					<uni-icons type="trash" size="16" color="#ffffff" />
					<text>删除选中（{{ selectedIds.length }}）</text>
				</button>
				
				<button class="btn btn--secondary" @tap="toggleSelectMode">
					<uni-icons :type="selectMode ? 'clear' : 'checkbox'" size="16" color="#155e3b" />
					<text>{{ selectMode ? '取消' : '选择删除' }}</text>
				</button>
			</view>
			
			<!-- 项目信息表 -->
			<view class="form-grid form-grid--base">
				<view class="form-item" v-for="(item, idx) in baseTable" :key="item.id">
					<!-- 污染物表格特殊渲染 -->
					<view v-if="item.id === 'pollutants_emission' && item.type === 'table'" class="pollutants-container">
						<view class="pollutants_baseinfo_row">
							<text class="form-item__label">
								{{ item.label }}
								<text v-if="item.source === 'extracted'" class="extract-tag">已提取</text>
							</text>
						</view>

						<!-- 污染物表格 -->
						<view class="pollutants-table">
							<!-- 表格头部 -->
							<view class="pollutants-header">
								<view class="pollutants-col pollutants-col--type">污染物类型</view>
								<view class="pollutants-col pollutants-col--name">污染物名称</view>
								<view class="pollutants-col pollutants-col--name">污染因子</view>
								<view class="pollutants-col pollutants-col--measure">污染治理措施</view>
								<view class="pollutants-col pollutants-col--direction">排放去向</view>
								<view class="pollutants-col pollutants-col--standard">执行标准</view>
							</view>

							<!-- 表格内容 -->
							<view class="pollutants-body">
								<!-- 水污染物 -->
								<view v-if="item.value.水污染物 && item.value.水污染物.length"
									v-for="(water, index) in item.value.水污染物"
									:key="'water-' + index" class="pollutants-row">
									<view class="pollutants-col pollutants-col--type">水污染物</view>
									<view class="pollutants-col pollutants-col--name">
										{{ water.污染物名称 || '未提取到相关信息' }}
									</view>
									<view class="pollutants-col pollutants-col--name">
										{{ water.污染因子 || '未提取到污染因子' }}
									</view>
									<view class="pollutants-col pollutants-col--measure">
										{{ water.污染治理措施 || '未提取到相关信息' }}
									</view>
									<view class="pollutants-col pollutants-col--direction">
										{{ water.排放去向 || '未提取到相关信息' }}
									</view>
									<view class="pollutants-col pollutants-col--standard">
										{{ water.执行标准 || '未提取到相关信息' }}
									</view>
								</view>

								<!-- 大气污染物 -->
								<view v-if="item.value.大气污染物 && item.value.大气污染物.length"
									v-for="(air, index) in item.value.大气污染物"
									:key="'air-' + index" class="pollutants-row">
									<view class="pollutants-col pollutants-col--type">大气污染物</view>
									<view class="pollutants-col pollutants-col--name">
										{{ air.污染物名称 || '未提取到污染物名称' }}
									</view>
									<view class="pollutants-col pollutants-col--name">
										{{ air.污染因子 || '未提取到污染因子' }}
									</view>
									<view class="pollutants-col pollutants-col--measure">
										{{ air.污染治理措施 || '未提取到污染治理措施' }}
									</view>
									<view class="pollutants-col pollutants-col--direction">
										{{ air.排放去向 || '大气环境' }}
									</view>
									<view class="pollutants-col pollutants-col--standard">
										{{ air.执行标准 || '未提取到执行标准' }}
									</view>
								</view>

								<!-- 噪声 -->
								<view v-if="item.value.噪声 && item.value.噪声.length"
									v-for="(noise, index) in item.value.噪声"
									:key="'noise-' + index" class="pollutants-row">
									<view class="pollutants-col pollutants-col--type">噪声</view>
									<view class="pollutants-col pollutants-col--name">
										{{ noise.污染物名称 || '未提取到相关信息' }}
									</view>
									<view class="pollutants-col pollutants-col--name">
										{{ noise.污染因子 || '未提取到污染因子' }}
									</view>
									<view class="pollutants-col pollutants-col--measure">
										{{ noise.污染治理措施 || '未提取到相关信息' }}
									</view>
									<view class="pollutants-col pollutants-col--direction">
										{{ noise.排放去向 || '未提取到相关信息' }}
									</view>
									<view class="pollutants-col pollutants-col--standard">
										{{ noise.执行标准 || '未提取到相关信息' }}
									</view>
								</view>
							</view>
						</view>

						<!-- 选择模式下的复选框 -->
						<view v-if="selectMode" class="pollutants-select">
							<checkbox :checked="selectedIds.includes(item.id)"
								@tap="() => toggleSelected(item.id)" />
						</view>
					</view>

					<!-- 废物表格（固废 + 危废）-->
					<view v-if="item.id === 'pollutants_emission' && item.type === 'table'" class="pollutants-container">
						<view class="pollutants_baseinfo_row">
							<text class="form-item__label">
								固体废物产生情况
								<text v-if="item.source === 'extracted'" class="extract-tag">已提取</text>
							</text>
						</view>

						<!-- 危废污染物表格 -->
						<view class="pollutants-table">
							<!-- 表格头部 -->
							<view class="pollutants-header">
								<view class="pollutants-col pollutants-col--type">废物类型</view>
								<view class="pollutants-col pollutants-col--link">废物来源</view>
								<view class="pollutants-col pollutants-col--name">废物名称</view>
								<view class="pollutants-col pollutants-col--measure">危险特性</view>
								<view class="pollutants-col pollutants-col--direction">危险废物类别</view>
								<view class="pollutants-col pollutants-col--direction">污染治理措施</view>
							</view>

							<!-- 表格内容 -->
							<view class="pollutants-body">
								<!-- 固体废物 -->
								<view v-if="item.value.固体废物 && item.value.固体废物.length"
									v-for="(solid, index) in item.value.固体废物"
									:key="'solid-' + index" class="pollutants-row">
									<view class="pollutants-col pollutants-col--type">固体废物</view>
									<view class="pollutants-col pollutants-col--link">
										{{ solid.废物来源 || '无' }}
									</view>
									<view class="pollutants-col pollutants-col--name">
										{{ solid.废物名称 || '无' }}
									</view>
									<view class="pollutants-col pollutants-col--measure">
										{{ solid.危险特性 || '无' }}
									</view>
									<view class="pollutants-col pollutants-col--direction">
										{{ solid.危险废物类别 || '无' }}
									</view>
									<view class="pollutants-col pollutants-col--direction">
										{{ solid.污染治理措施 || '无' }}
									</view>
								</view>

								<!-- 危险废物 -->
								<view v-if="item.value.危险废物 && item.value.危险废物.length"
									v-for="(solid, index) in item.value.危险废物"
									:key="'hazard-' + index" class="pollutants-row">
									<view class="pollutants-col pollutants-col--type">危险废物</view>
									<view class="pollutants-col pollutants-col--link">
										{{ solid.废物来源 || '无' }}
									</view>
									<view class="pollutants-col pollutants-col--name">
										{{ solid.废物名称 || '无' }}
									</view>
									<view class="pollutants-col pollutants-col--measure">
										{{ solid.危险特性 || '无' }}
									</view>
									<view class="pollutants-col pollutants-col--direction">
										{{ solid.危险废物类别 || '无' }}
									</view>
									<view class="pollutants-col pollutants-col--direction">
										{{ solid.污染治理措施 || '无' }}
									</view>
								</view>
							</view>
						</view>

						<!-- 选择模式下的复选框 -->
						<view v-if="selectMode" class="pollutants-select">
							<checkbox :checked="selectedIds.includes(item.id)"
								@tap="() => toggleSelected(item.id)" />
						</view>
					</view>

					<!-- 除污染物外基本信息 -->
					<view v-else class="baseinfo__row">
						<text class="form-item__label">
							{{ item.label }}
							<!--  如果是提取的数据，显示绿色小标签 -->
							<text v-if="item.source === 'extracted'" class="extract-tag">已提取</text>
						</text>

						<uni-easyinput 
							class="form-item__input" 
							v-model="item.value"
							placeholder="请输入具体的值" 
							:clearable="true" />

						<view v-if="selectMode" class="form-item__select">
							<checkbox 
								:checked="selectedIds.includes(item.id)"
								@tap="() => toggleSelected(item.id)" />
						</view>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 未提取时的提示 -->
		<view v-else class="empty-state">
			<uni-icons type="info" size="48" color="#cbd5e1" />
			<text class="empty-text">请先在"项目选择"中提取项目信息</text>
		</view>
		
		<!-- 新增项目基本信息弹窗 -->
		<uni-popup ref="newBaseInfoPopup" type="center">
			<view class="modal">
				<view class="modal-header">
					<text class="modal-title">新增项目基本信息</text>
				</view>
				<view class="modal-body">
					<text class="modal-description">请在下方输入信息名称</text>
					<uni-easyinput v-model="newBaseInfoLabel" placeholder="如：项目名称/单位名称" />
				</view>
				<view class="modal-actions">
					<button class="btn btn--ghost" @tap="handleCloseBaseInfo">取消</button>
					<button class="btn btn--primary" @tap="handleConfirmAddBaseInfo">确定</button>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import { useProjectInfo } from '@/composables/useProjectInfo.js'

// 从 composable 获取状态和方法
const {
	baseTable,
	selectMode,
	selectedIds,
	newBaseInfoLabel,
	
	// 方法
	toggleSelectMode,
	toggleSelected,
	removeSelected,
	confirmAddBaseInfo,
} = useProjectInfo()

// 组件内部的 refs
const newBaseInfoPopup = ref(null)

// 打开新增弹窗
function handleOpenAddBase() {
	newBaseInfoPopup.value?.open()
}

// 关闭新增弹窗
function handleCloseBaseInfo() {
	newBaseInfoPopup.value?.close()
}

// 确认新增
function handleConfirmAddBaseInfo() {
	const success = confirmAddBaseInfo()
	if (success) {
		newBaseInfoPopup.value?.close()
	}
}
</script>


<style scoped lang="scss">
.baseinfo-tab {
	// width: 100%;
	padding: 24rpx;
}

.subsection {
	margin-bottom: 32rpx;
}

.subsection-head {
	display: flex;
	align-items: center;
	gap: 12rpx;
	padding: 16rpx 0;
	margin-bottom: 16rpx;
	border-bottom: 2rpx solid #e2e8f0;
}

.subsection-title {
	font-size: 28rpx;
	font-weight: 600;
	color: #166534;
}

// 操作按钮样式
.section-actions {
	display: flex;
	gap: 16rpx;
	margin-bottom: 24rpx;
	flex-wrap: wrap;
}

.btn {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8rpx;
	// padding: 20rpx 24rpx;
	font-size: 26rpx;
	font-weight: 500;
	border-radius: 12rpx;
	border: none;
	cursor: pointer;
	transition: all 0.3s ease;
}

.btn--ghost {
	background: transparent;
	color: #166534;
	border: 2rpx solid #166534;
}

.btn--ghost:active {
	background: #f0fdf4;
}

.btn--danger {
	background: #dc2626;
	color: #ffffff;
}

.btn--danger:active {
	background: #b91c1c;
}

.btn--danger:disabled {
	background: #cbd5e1;
	color: #94a3b8;
	cursor: not-allowed;
}

.btn--secondary {
	background: #f0fdf4;
	color: #155e3b;
	border: 2rpx solid #166534;
}

.btn--secondary:active {
	background: #dcfce7;
}

.btn--primary {
	background: #166534;
	color: #ffffff;
}

.btn--primary:active {
	background: #14532d;
}

// 表单网格样式
.form-grid {
	display: flex;
	flex-direction: column;
	gap: 24rpx;
}

.form-item {
	width: 100%;
}

// 基本信息行样式
.baseinfo__row {
	display: flex;
	align-items: center;
	gap: 16rpx;
	padding: 24rpx;
	background: #f8fafc;
	border-radius: 12rpx;
	border: 1rpx solid #e2e8f0;
}

.form-item__label {
	flex-shrink: 0;
	min-width: 200rpx;
	font-size: 26rpx;
	font-weight: 500;
	color: #1e293b;
}

.extract-tag {
	display: inline-block;
	margin-left: 8rpx;
	padding: 4rpx 12rpx;
	font-size: 20rpx;
	font-weight: 500;
	color: #166534;
	background: #dcfce7;
	border-radius: 6rpx;
}

.form-item__input {
	flex: 1;
}

.form-item__select {
	flex-shrink: 0;
}

// 污染物容器样式
.pollutants-container {
	padding: 24rpx;
	background: #f8fafc;
	border-radius: 12rpx;
	border: 1rpx solid #e2e8f0;
	position: relative;
}

.pollutants_baseinfo_row {
	margin-bottom: 16rpx;
}

.pollutants-select {
	position: absolute;
	top: 24rpx;
	right: 24rpx;
}

// 污染物表格样式
.pollutants-table {
	width: 100%;
	overflow-x: auto;
	background: #ffffff;
	border-radius: 8rpx;
	border: 1rpx solid #e2e8f0;
}

.pollutants-header {
	display: flex;
	background: #f0fdf4;
	border-bottom: 2rpx solid #166534;
}

.pollutants-body {
	display: flex;
	flex-direction: column;
}

.pollutants-row {
	display: flex;
	border-bottom: 1rpx solid #e2e8f0;
}

.pollutants-row:last-child {
	border-bottom: none;
}

.pollutants-col {
	padding: 16rpx 12rpx;
	font-size: 24rpx;
	word-break: break-word;
	border-right: 1rpx solid #e2e8f0;
}

.pollutants-col:last-child {
	border-right: none;
}

.pollutants-header .pollutants-col {
	font-weight: 600;
	color: #166534;
	text-align: center;
}

.pollutants-body .pollutants-col {
	color: #1e293b;
}

.pollutants-col--type {
	flex: 0 0 120rpx;
	min-width: 120rpx;
}

.pollutants-col--link {
	flex: 0 0 180rpx;
	min-width: 180rpx;
}

.pollutants-col--name {
	flex: 0 0 200rpx;
	min-width: 200rpx;
}

.pollutants-col--measure {
	flex: 1;
	min-width: 250rpx;
}

.pollutants-col--direction {
	flex: 0 0 180rpx;
	min-width: 180rpx;
}

.pollutants-col--standard {
	flex: 1;
	min-width: 300rpx;
}

// 空状态样式
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 120rpx 40rpx;
	text-align: center;
}

.empty-text {
	display: block;
	font-size: 28rpx;
	font-weight: 500;
	color: #64748b;
	margin-top: 24rpx;
}

// 弹窗样式
.modal {
	width: 80vw;
	max-width: 500rpx;
	background: #ffffff;
	border-radius: 16rpx;
	overflow: hidden;
}

.modal-header {
	padding: 32rpx 24rpx;
	border-bottom: 1rpx solid #e2e8f0;
}

.modal-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #1e293b;
}

.modal-body {
	padding: 32rpx 24rpx;
}

.modal-description {
	display: block;
	font-size: 26rpx;
	color: #64748b;
	margin-bottom: 16rpx;
}

.modal-actions {
	display: flex;
	gap: 16rpx;
	padding: 24rpx;
	border-top: 1rpx solid #e2e8f0;
}

.modal-actions .btn {
	flex: 1;
}

// 响应式设计
@media (max-width: 768px) {
	.baseinfo__row {
		display: block;
	}
	.pollutants-table {
		font-size: 22rpx;
	}
	
	.pollutants-col {
		padding: 12rpx 8rpx;
	}
	
	.section-actions {
		flex-direction: column;
	}
	
	.btn {
		width: 100%;
	}
}
</style>
