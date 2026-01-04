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

				<button v-if="selectMode" class="btn btn--danger" :disabled="!selectedIds.length" @tap="removeSelected">
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
					<!-- 污染物产排情况表 -->
					<view v-if="item.id === 'pollutants_emission' && item.type === 'table'"
						class="pollutants-container">
						<view class="table-title-container">
							<text class="table-title">
								污染物产排情况表
								<text v-if="item.source === 'extracted'" class="extract-tag">已提取</text>
							</text>
							<view class="table-subtitle">包含废水、废气、噪声、固体废物、危险废物等信息</view>
						</view>

						<!-- 污染物表格（废水、废气、噪声） -->
						<view class="enhanced-table-wrapper"
							v-if="item.value.水污染物?.length || item.value.大气污染物?.length || item.value.噪声?.length">
							<!-- 表格头部 -->
							<view class="enhanced-table-header">
								<view class="enhanced-table-col enhanced-table-col--type">污染物类型</view>
								<view class="enhanced-table-col enhanced-table-col--name">污染物名称</view>
								<view class="enhanced-table-col enhanced-table-col--factor">污染因子</view>
								<view class="enhanced-table-col enhanced-table-col--measure">污染治理措施</view>
								<view class="enhanced-table-col enhanced-table-col--direction">排放去向</view>
								<view class="enhanced-table-col enhanced-table-col--standard">执行标准</view>
							</view>

							<!-- 表格内容 -->
							<view class="enhanced-table-body">
								<!-- 水污染物 -->
								<view v-if="item.value.水污染物 && item.value.水污染物.length"
									v-for="(water, index) in item.value.水污染物" :key="'water-' + index"
									class="enhanced-table-row enhanced-table-row--water">
									<view class="enhanced-table-col enhanced-table-col--type">
										<view class="type-badge type-badge--water">水污染物</view>
									</view>
									<view class="enhanced-table-col enhanced-table-col--name">
										<text class="cell-content">{{ water.污染物名称 || '-' }}</text>
									</view>
									<view class="enhanced-table-col enhanced-table-col--factor">
										<text class="cell-content">{{ water.污染因子 || '-' }}</text>
									</view>
									<view class="enhanced-table-col enhanced-table-col--measure">
										<text class="cell-content">{{ water.污染治理措施 || '-' }}</text>
									</view>
									<view class="enhanced-table-col enhanced-table-col--direction">
										<text class="cell-content">{{ water.排放去向 || '-' }}</text>
									</view>
									<view class="enhanced-table-col enhanced-table-col--standard">
										<text class="cell-content">{{ water.执行标准 || '-' }}</text>
									</view>
								</view>

								<!-- 大气污染物 -->
								<view v-if="item.value.大气污染物 && item.value.大气污染物.length"
									v-for="(air, index) in item.value.大气污染物" :key="'air-' + index"
									class="enhanced-table-row enhanced-table-row--air">
									<view class="enhanced-table-col enhanced-table-col--type">
										<view class="type-badge type-badge--air">大气污染物</view>
									</view>
									<view class="enhanced-table-col enhanced-table-col--name">
										<text class="cell-content">{{ air.污染物名称 || '-' }}</text>
									</view>
									<view class="enhanced-table-col enhanced-table-col--factor">
										<text class="cell-content">{{ air.污染因子 || '-' }}</text>
									</view>
									<view class="enhanced-table-col enhanced-table-col--measure">
										<text class="cell-content">{{ air.污染治理措施 || '-' }}</text>
									</view>
									<view class="enhanced-table-col enhanced-table-col--direction">
										<text class="cell-content">{{ air.排放去向 || '-' }}</text>
									</view>
									<view class="enhanced-table-col enhanced-table-col--standard">
										<text class="cell-content">{{ air.执行标准 || '-' }}</text>
									</view>
								</view>

								<!-- 噪声 -->
								<view v-if="item.value.噪声 && item.value.噪声.length"
									v-for="(noise, index) in item.value.噪声" :key="'noise-' + index"
									class="enhanced-table-row">
									<view class="enhanced-table-col enhanced-table-col--type">
										<view class="type-badge type-badge--noise">噪声</view>
									</view>
									<view class="enhanced-table-col enhanced-table-col--name">
										<text class="cell-content">{{ noise.污染物名称 || '-' }}</text>
									</view>
									<view class="enhanced-table-col enhanced-table-col--factor">
										<text class="cell-content">{{ noise.污染因子 || '-' }}</text>
									</view>
									<view class="enhanced-table-col enhanced-table-col--measure">
										<text class="cell-content">{{ noise.污染治理措施 || '-' }}</text>
									</view>
									<view class="enhanced-table-col enhanced-table-col--direction">
										<text class="cell-content">{{ noise.排放去向 || '-' }}</text>
									</view>
									<view class="enhanced-table-col enhanced-table-col--standard">
										<text class="cell-content">{{ noise.执行标准 || '-' }}</text>
									</view>
								</view>

								<!-- 空数据提示 -->
								<view
									v-if="!item.value.水污染物?.length && !item.value.大气污染物?.length && !item.value.噪声?.length"
									class="enhanced-table-row enhanced-table-row--empty">
									<view class="enhanced-table-col" style="flex: 1;">
										<text class="empty-data-text">暂无污染物数据</text>
									</view>
								</view>
							</view>
						</view>

						<!-- 废物表格（固体废物、危险废物） -->
						<view class="enhanced-table-wrapper waste-table"
							v-if="item.value.固体废物?.length || item.value.危险废物?.length">
							<!-- 表格头部 -->
							<view class="enhanced-table-header">
								<view class="enhanced-table-col enhanced-table-col--waste-type">废物类型</view>
								<view class="enhanced-table-col enhanced-table-col--source">废物来源</view>
								<view class="enhanced-table-col enhanced-table-col--name">废物名称</view>
								<view class="enhanced-table-col enhanced-table-col--property">危险特性</view>
								<view class="enhanced-table-col enhanced-table-col--category">危险废物类别</view>
								<view class="enhanced-table-col enhanced-table-col--measure">污染治理措施</view>
							</view>

							<!-- 表格内容 -->
							<view class="enhanced-table-body">
								<!-- 固体废物 -->
								<view v-if="item.value.固体废物 && item.value.固体废物.length"
									v-for="(solid, index) in item.value.固体废物" :key="'solid-' + index"
									class="enhanced-table-row enhanced-table-row--solid">
									<view class="enhanced-table-col enhanced-table-col--waste-type">
										<view class="type-badge type-badge--solid">固体废物</view>
									</view>
									<view class="enhanced-table-col enhanced-table-col--source">
										<text class="cell-content">{{ solid.废物来源 || solid.产生环节 || '-' }}</text>
									</view>
									<view class="enhanced-table-col enhanced-table-col--name">
										<text class="cell-content">{{ solid.废物名称 || '-' }}</text>
									</view>
									<view class="enhanced-table-col enhanced-table-col--property">
										<text class="cell-content">{{ solid.危险特性 || '无' }}</text>
									</view>
									<view class="enhanced-table-col enhanced-table-col--category">
										<text class="cell-content">{{ solid.危险废物类别 || '无' }}</text>
									</view>
									<view class="enhanced-table-col enhanced-table-col--measure">
										<text class="cell-content">{{ solid.污染治理措施 || solid.处置方式 || '-' }}</text>
									</view>
								</view>

								<!-- 危险废物 -->
								<view v-if="item.value.危险废物 && item.value.危险废物.length"
									v-for="(hazard, index) in item.value.危险废物" :key="'hazard-' + index"
									class="enhanced-table-row ">
									<view class="enhanced-table-col enhanced-table-col--waste-type">
										<view class="type-badge type-badge--hazard">危险废物</view>
									</view>
									<view class="enhanced-table-col enhanced-table-col--source">
										<text class="cell-content">{{ hazard.废物来源 || hazard.产生环节 || '-' }}</text>
									</view>
									<view class="enhanced-table-col enhanced-table-col--name">
										<text class="cell-content">{{ hazard.废物名称 || '-' }}</text>
									</view>
									<view class="enhanced-table-col enhanced-table-col--property">
										<view v-if="hazard.危险特性">
											<view
												v-for="(prop, propIdx) in (hazard.危险特性.includes('、') ? hazard.危险特性.split('、') : [hazard.危险特性])"
												:key="propIdx">
												{{ prop }}
											</view>
										</view>
										<text v-else class="cell-content">-</text>
									</view>
									<view class="enhanced-table-col enhanced-table-col--category">
										<text class="cell-content">{{ hazard.危险废物类别 || '-' }}</text>
									</view>
									<view class="enhanced-table-col enhanced-table-col--measure">
										<text class="cell-content">{{ hazard.污染治理措施 || hazard.处置方式 || '-' }}</text>
									</view>
								</view>
							</view>
						</view>

						<!-- 选择模式下的复选框 -->
						<view v-if="selectMode" class="pollutants-select">
							<checkbox :checked="selectedIds.includes(item.id)" @tap="() => toggleSelected(item.id)" />
						</view>
					</view>

					<!-- 除污染物外基本信息 -->
					<view v-else-if="item.id !== 'pollutants_emission' && item.id !== 'waste_production'"
						class="baseinfo__row">
						<text class="form-item__label">
							{{ item.label }}
							<!--  如果是提取的数据，显示绿色小标签 -->
							<text v-if="item.source === 'extracted'" class="extract-tag">已提取</text>
						</text>

						<uni-easyinput class="form-item__input" v-model="item.value" placeholder="请输入具体的值"
							:clearable="true" />

						<view v-if="selectMode" class="form-item__select">
							<checkbox :checked="selectedIds.includes(item.id)" @tap="() => toggleSelected(item.id)" />
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
	import {
		ref
	} from 'vue'
	import {
		useProjectInfo
	} from '@/composables/useProjectInfo.js'

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
		gap: 16rpx;
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

	// 表格容器样式
	.pollutants-container {
		padding: 24rpx;
		background: #f8fafc;
		border-radius: 16rpx;
		border: 1rpx solid #e2e8f0;
		position: relative;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
	}

	.table-title-container {
		margin-bottom: 20rpx;
	}

	.table-title {
		font-size: 28rpx;
		font-weight: 600;
		color: #1e293b;
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.table-subtitle {
		font-size: 24rpx;
		color: #64748b;
		margin-top: 8rpx;
	}

	.pollutants-select {
		position: absolute;
		top: 24rpx;
		right: 24rpx;
	}

	// 增强版表格样式
	.enhanced-table-wrapper {
		width: 100%;
		overflow-x: auto;
		background: #ffffff;
		border-radius: 12rpx;
		border: 1rpx solid #e2e8f0;
		box-shadow: 0 1rpx 6rpx rgba(0, 0, 0, 0.05);

		&.waste-table {
			margin-top: 24rpx;
		}
	}

	.enhanced-table-header {
		display: flex;
		background: #1ec553;
		border-bottom: 2rpx solid #14532d;
	}

	.enhanced-table-body {
		display: flex;
		flex-direction: column;
	}

	.enhanced-table-row {
		display: flex;
		border-bottom: 1rpx solid #f1f5f9;
		transition: background-color 0.2s ease;

		&:last-child {
			border-bottom: none;
		}

		&:hover {
			background-color: #f8fafc;
		}

		&--water {
			background-color: rgba(14, 165, 233, 0.02);
		}

		&--air {
			background-color: rgba(34, 197, 94, 0.02);
		}

		&--noise {
			background-color: rgba(249, 115, 22, 0.02);
		}

		&--solid {
			background-color: rgba(139, 92, 246, 0.02);
		}

		&--hazard {
			background-color: rgba(239, 68, 68, 0.02);
		}

		&--empty {
			justify-content: center;
			padding: 40rpx 20rpx;
		}
	}

	.enhanced-table-col {
		padding: 24rpx 16rpx;
		font-size: 24rpx;
		word-break: break-word;
		display: flex;
		align-items: center;
		justify-content: center;
		border-right: 1rpx solid #f1f5f9;
		min-height: 80rpx;

		&:last-child {
			border-right: none;
		}
	}

	.enhanced-table-header .enhanced-table-col {
		font-weight: 600;
		color: #ffffff;
		font-size: 26rpx;
		text-align: center;
		white-space: nowrap;
		padding: 28rpx 16rpx;
	}

	.enhanced-table-body .enhanced-table-col {
		color: #334155;
		text-align: center;
	}

	.cell-content {
		display: block;
		width: 100%;
		text-align: center;
		line-height: 1.4;
	}

	.empty-data-text {
		color: #94a3b8;
		font-size: 26rpx;
		text-align: center;
	}

	// 污染物表格列宽设置
	.enhanced-table-col--type {
		flex: 0 0 140rpx;
		min-width: 140rpx;
	}

	.enhanced-table-col--name {
		flex: 0 0 220rpx;
		min-width: 220rpx;
	}

	.enhanced-table-col--factor {
		flex: 0 0 240rpx;
		min-width: 240rpx;
	}

	.enhanced-table-col--measure {
		flex: 1;
		min-width: 280rpx;
	}

	.enhanced-table-col--direction {
		flex: 0 0 200rpx;
		min-width: 200rpx;
	}

	.enhanced-table-col--standard {
		flex: 1;
		min-width: 320rpx;
	}

	// 废物表格列宽设置
	.enhanced-table-col--waste-type {
		flex: 0 0 180rpx;
		min-width: 180rpx;
	}

	.enhanced-table-col--source {
		flex: 0 0 380rpx;
		min-width: 380rpx;
	}

	.enhanced-table-col--property {
		flex: 0 0 380rpx;
		min-width: 380rpx;
	}

	.enhanced-table-col--category {
		flex: 0 0 380rpx;
		min-width: 380rpx;
	}

	// 类型徽章样式
	.type-badge {
		display: inline-block;
		padding: 6rpx 16rpx;
		border-radius: 20rpx;
		font-size: 22rpx;
		font-weight: 500;
		color: #ffffff;
		white-space: nowrap;

		&--water {
			background: linear-gradient(135deg, #0ea5e9, #3b82f6);
		}

		&--air {
			background: linear-gradient(135deg, #22c55e, #16a34a);
		}

		&--noise {
			background: linear-gradient(135deg, #f97316, #ea580c);
		}

		&--solid {
			background: linear-gradient(135deg, #8b5cf6, #7c3aed);
		}

		&--hazard {
			background: linear-gradient(135deg, #ef4444, #dc2626);
		}
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

		.section-actions {
			flex-direction: column;
		}

		.btn {
			width: 100%;
		}

		// 移动端表格优化
		.enhanced-table-header {
			width: 84.5vh;
		}

		.enhanced-table-wrapper {
			font-size: 24rpx;
		}

		.enhanced-table-col {
			padding: 20rpx 12rpx;
			min-height: 70rpx;
		}

		.enhanced-table-header .enhanced-table-col {
			padding: 24rpx 12rpx;
			font-size: 24rpx;
		}

		// 移动端列宽调整
		.enhanced-table-col--type,
		.enhanced-table-col--waste-type {
			flex: 0 0 120rpx;
			min-width: 120rpx;
		}

		.enhanced-table-col--name,
		.enhanced-table-col--source {
			flex: 0 0 180rpx;
			min-width: 180rpx;
		}

		.enhanced-table-col--factor {
			flex: 0 0 200rpx;
			min-width: 200rpx;
		}

		.enhanced-table-col--direction,
		.enhanced-table-col--property {
			flex: 0 0 160rpx;
			min-width: 160rpx;
		}

		.enhanced-table-col--category {
			flex: 0 0 180rpx;
			min-width: 180rpx;
		}

		// 移动端标签调整
		.type-badge {
			padding: 4rpx 12rpx;
			font-size: 20rpx;
		}

		.property-tag {
			padding: 2rpx 8rpx;
			font-size: 20rpx;
		}
	}

	// 针对小程序和H5的特殊优化
	/* #ifdef H5 */
	.enhanced-table-wrapper {
		-webkit-overflow-scrolling: touch;
	}

	/* #endif */

	/* #ifdef MP-WEIXIN */
	.pollutants-container {
		box-shadow: none;
	}

	.enhanced-table-wrapper {
		border-radius: 8rpx;
	}

	/* #endif */

	// 横屏适配
	@media (orientation: landscape) {
		.enhanced-table-wrapper {
			font-size: 22rpx;
		}

	}
</style>