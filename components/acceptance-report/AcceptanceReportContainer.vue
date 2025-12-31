<template>
	<view class="acceptance-report-container">
			<!-- 未选项目时：组件内部空状态 -->
			<view v-if="!projectId" class="empty-state">
				<uni-icons type="folder-add" size="48" color="#cbd5e1" />
				<text class="empty-text">请先选择项目</text>
				<text class="empty-tip">请在第一步选择项目后，即可生成竣工验收报告</text>
			</view>
			<!-- 已选项目：原来的完整界面 -->
			<view v-else class="section-card">
				<view class="section-header">
					<uni-icons type="calendar" size="20" color="#166534" />
					<text class="section-title">竣工验收报告</text>
				</view>

				<view class="section-body">
					<view class="report-generation">
						<!-- 报告类型选择 -->
						<view class="generation-options">
							<view class="option-group">
								<text class="option-label">请选择要生成的报告类型</text>
								<radio-group class="radio-group" @change="handleReportTypeChange">
									<label class="radio-item" v-for="type in reportTypes" :key="type.value">
										<radio :value="type.value" :checked="reportType === type.value"
											color="#166534" />
										<text class="radio-text">{{ type.text }}</text>
									</label>
								</radio-group>
							</view>

							<!-- 有监测数据时显示文件上传 -->
							<view class="option-group" v-if="reportType === 'withData'">
								<text class="option-label">上传监测报告</text>
								<uni-file-picker v-model="testReportFiles" fileMediatype="all" :auto-upload="false"
									:limit="3" />
							</view>
						</view>

						<!-- 操作按钮 -->
						<view class="generation-actions">
							<button class="btn btn--primary" @tap="handleGenerate" :disabled="isGenerating">
								<uni-icons type="refresh-filled" size="16" color="#ffffff" />
								<text>生成验收报告</text>
							</button>

							<!-- 生成后显示下载按钮 -->
							<button v-if="canDownloadReport" class="btn btn--primary" @tap="handleDownload">
								<uni-icons type="cloud-download-filled" size="16" color="#ffffff" />
								<text>下载竣工验收报告</text>
							</button>
						</view>

						<!-- 预览卡片（生成后显示） -->
						<view v-if="reportGenerated" class="report-preview">
							<view class="preview-header">
								<uni-icons type="checkmarkempty" size="18" color="#166534" />
								<text class="preview-title">{{ previewTitle }}</text>
							</view>
							<view class="preview-content">
								<text class="preview-text">竣工验收报告已生成，包含以下内容：</text>
								<view class="preview-sections">
									<text class="section-item">• 项目基本情况</text>
									<text class="section-item">• 环保设施建设情况</text>
									<text class="section-item">• 监测结果分析</text>
									<text class="section-item">• 验收结论</text>
									<text v-if="reportType === 'withData'" class="section-item">• 检测数据附件</text>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 进度弹窗 -->
			<TaskProgressModal ref="taskProgressModal" :title="taskProgressTitle" :progress="taskProgress"
				:statusText="taskStatusText" :state="taskState" />
		</view>
</template>

<script setup>
	import {
		ref,
		nextTick
	} from 'vue'
	import {
		useAcceptanceReport
	} from '@/composables/useAcceptanceReport.js'
	import TaskProgressModal from '@/components/message-pop-up/TaskProgressModal.vue'

	const props = defineProps({
		// 项目ID
		projectId: {
			type: [Number, String],
			required: true
		},
		// 是否已提取项目信息
		hasExtracted: {
			type: Boolean,
			default: false
		}
	})

	const emit = defineEmits(['report-generated'])

	// 使用 composable
	const {
		reportGenerated,
		reportType,
		testReportFiles,
		previewTitle,
		canDownloadReport,
		isGenerating,
		taskProgress,
		taskStatusText,
		taskState,
		reportTypes,
		changeReportType,
		generateReport,
		downloadReport
	} = useAcceptanceReport()

	// 进度弹窗 ref
	const taskProgressModal = ref(null)
	const taskProgressTitle = ref('竣工验收报告生成中')

	// 切换报告类型
	function handleReportTypeChange(e) {
		changeReportType(e.detail.value)
	}

	// 生成竣工验收报告
	async function handleGenerate() {
		await generateReport(
			props.projectId,
			props.hasExtracted,
			taskProgressModal.value
		)

		// 触发事件通知父组件
		emit('report-generated')
		
		// 强制等待下一个 tick 确保 UI 更新
		await nextTick()
		console.log('🔄 UI 更新后 - reportGenerated:', reportGenerated.value, 'canDownloadReport:', canDownloadReport.value)
	}

	// 下载竣工验收报告
	async function handleDownload() {
		await downloadReport(props.projectId)
	}
</script>

<style scoped lang="scss">
	.acceptance-report-container {
		width: 100%;
	}
	.empty-state{
	  display:flex;
	  flex-direction:column;
	  align-items:center;
	  justify-content:center;
	  padding:80rpx 40rpx;
	  gap:16rpx;
	}
	.empty-text{
	  font-size:32rpx;
	  color:#64748b;
	  font-weight:500;
	}
	.empty-tip{
	  font-size:24rpx;
	  color:#94a3b8;
	}

	.section-card {
		background: #ffffff;
		border-radius: 16rpx;
		overflow: hidden;
		box-shadow: 0 2rpx 12rpx rgba(15, 23, 42, 0.08);
	}

	.section-header {
		display: flex;
		align-items: center;
		gap: 10rpx;
		padding: 28rpx 24rpx;
		background: #ffffff;
		border-bottom: 1rpx solid #e2e8f0;
	}

	.section-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #166534;
	}

	.section-body {
		padding: 32rpx 24rpx;
	}

	.report-generation {
		display: flex;
		flex-direction: column;
		gap: 24rpx;
	}

	.generation-options {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}

	.option-group {
		display: flex;
		flex-direction: column;
		gap: 12rpx;
	}

	.option-label {
		font-size: 26rpx;
		color: #0f172a;
		font-weight: 600;
	}

	.radio-group {
		display: flex;
		gap: 24rpx;
	}

	.radio-item {
		display: flex;
		align-items: center;
		gap: 8rpx;
	}

	.radio-text {
		font-size: 24rpx;
		color: #5b6b7b;
	}

	.generation-actions {
		display: flex;
		gap: 12rpx;
		flex-wrap: wrap;
	}

	.btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8rpx;
		// padding: 24rpx 48rpx;
		border-radius: 12rpx;
		font-size: 28rpx;
		font-weight: 500;
		transition: all 0.3s ease;
		border: none;
	}

	.btn--primary {
		background: #166534;
		color: #ffffff;
	}

	.btn--primary:active {
		opacity: 0.8;
		transform: scale(0.98);
	}

	.btn--primary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.report-preview {
		padding: 24rpx;
		background: #f0fdf4;
		border-radius: 12rpx;
		border: 1rpx solid #dcfce7;
	}

	.preview-header {
		display: flex;
		align-items: center;
		gap: 8rpx;
		margin-bottom: 16rpx;
	}

	.preview-title {
		font-size: 28rpx;
		color: #166534;
		font-weight: 700;
	}

	.preview-content {
		display: flex;
		flex-direction: column;
		gap: 12rpx;
	}

	.preview-text {
		font-size: 24rpx;
		color: #374151;
	}

	.preview-sections {
		display: flex;
		flex-direction: column;
		gap: 8rpx;
		padding-left: 20rpx;
	}

	.section-item {
		font-size: 24rpx;
		color: #475569;
	}

	/* 响应式设计 */
	@media (max-width: 768px) {
		.generation-actions {
			flex-direction: column;
		}

		.btn {
			width: 100%;
		}
	}
</style>