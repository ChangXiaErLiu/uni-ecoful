<template>
	<app-layout current="pages/reports/acceptance/index">
		<view class="acceptance-page">
			<!-- 步骤导航 -->
			<view class="acceptance-steps">
				<view class="steps-container">
					<template v-if="isMobile">
						<uni-data-select v-model="currentStep" :localdata="stepSelectOptions" placeholder="选择步骤"
							class="mobile-step-select" />
					</template>
					<template v-else>
						<view class="desktop-steps" role="tablist">
							<view v-for="(step, index) in stepNames" :key="index" class="step-item" :class="{
                  'step-item--active': currentStep === index,
                  'step-item--completed': stepDone(index)
                }" role="tab" :aria-selected="currentStep === index" @tap="currentStep = index">
								<view class="step-indicator">
									<text v-if="stepDone(index)" class="step-check">✓</text>
									<text v-else class="step-number">{{ index + 1 }}</text>
								</view>
								<text class="step-label">{{ step }}</text>
								<view v-if="index < stepNames.length - 1" class="step-connector" />
							</view>
						</view>
					</template>
				</view>
			</view>

			<!-- 主要内容区域 -->
			<view class="acceptance-content">
				<scroll-view class="content-scroll" scroll-y>
					<!-- 步骤1: 资料上传 -->
					<view v-show="currentStep === 0" class="content-section">
						<view class="section-card">
							<view class="section-header">
								<uni-icons type="cloud-upload" size="9" color="#166534" />
								<text class="section-title">资料上传</text>
							</view>
							<view class="section-body">
								<view class="form-group">
									<text class="form-label">请上传环评报告书/报告表/批复文件/其他资料等</text>
									<text class="form-tip">支持 PDF、Word、图片等格式，单次上传最多 9 个文件</text>
									<uni-file-picker v-model="eiaFiles" fileMediatype="all" :auto-upload="false"
										:limit="100" @select="handleFileSelect" @delete="handleFileDelete">
									</uni-file-picker>
								</view>

								<view class="action-row">
									<button class="btn btn--primary" @tap="simulateExtract">
										<uni-icons type="search" size="16" color="#ffffff" />
										<text>提取项目基本信息</text>
									</button>
								</view>

								<!-- 项目信息表 -->
								<view v-if="baseTable.length" class="subsection">
									<view class="subsection-head">
										<uni-icons type="list" size="18" color="#166534" />
										<text class="subsection-title">项目信息表</text>
									</view>

									<view class="section-actions">
										<button class="btn btn--ghost" @tap="openAddField">
											<uni-icons type="plus" size="16" color="#166534" />
											<text>新增</text>
										</button>

										<button v-if="selectMode" class="btn btn--danger"
											:disabled="!selectedIds.length" @tap="removeSelected">
											<uni-icons type="trash" size="16" color="#ffffff" />
											<text>删除选中（{{ selectedIds.length }}）</text>
										</button>

										<button class="btn btn--secondary" @tap="toggleSelectMode">
											<uni-icons :type="selectMode ? 'clear' : 'checkbox'" size="16"
												color="#155e3b" />
											<text>{{ selectMode ? '取消' : '选择删除' }}</text>
										</button>
									</view>

									<!-- 响应式表单：PC 两列，移动端单列 -->
									<view class="form-grid form-grid--base">
										<view class="form-item" v-for="(item, idx) in baseTable" :key="item.id">
											<view class="form-item__row">
												<text class="form-item__label">
													{{ item.label }}
													<!--  如果是提取的数据，显示绿色小标签 -->
													<text v-if="item.source === 'extracted'"
														class="extract-tag">已提取</text>
												</text>

												<uni-easyinput class="form-item__input" v-model="item.value"
													placeholder="请输入具体的值" :clearable="true" />

												<view v-if="selectMode" class="form-item__select">
													<checkbox :checked="selectedIds.includes(item.id)"
														@tap="() => toggleSelected(item.id)" />
												</view>
											</view>
										</view>
									</view>

									<!-- 标识牌生成 -->
									<view class="subsection">
										<view class="subsection-head">
											<uni-icons type="list" size="18" color="#fb923c" />
											<text class="subsection-title">排污标识牌信息（业主确认排污口信息无误）</text>
										</view>

										<view class="section-actions">
											<button class="btn btn--primary"
												@tap="() => { generateSignboard(); showSignboardStep1 = true }">
												<uni-icons type="eye-filled" size="16" color="#ffffff" />
												<text>标识牌信息</text>
											</button>
											<button v-if="showSignboardStep1" class="btn btn--primary"
												@tap="downBiaoShi">
												<uni-icons type="download-filled" size="16" color="#ffffff" />
												<text>下载</text>
											</button>
											<button v-if="showSignboardStep1" class="btn btn--primary"
												@tap="currentStep = 1">
												<uni-icons type="redo-filled" size="16" color="#ffffff" />
												<text>生成检测方案</text>
											</button>
										</view>

										<view v-if="showSignboardStep1" class="data-table">
											<view class="table-body">
												<template v-for="(sec, si) in signboard.sections" :key="'s'+si">
													<view class="table-row table-row--simple">
														<text
															class="table-td table-td--section">{{ sec.block || '未命名' }}

														</text>
														<button class="pw-ico icon-btn" @tap="() => addSignItem(si)">
															<uni-icons type="plus" size="16" color="#166534" />
															<text>新增</text>
														</button>
													</view>
													<view class="form-grid form-grid--base">
														<view class="form-item" v-for="(it, ii) in sec.items"
															:key="'r'+si+'-'+ii">
															<view class="form-item__row">
																<uni-easyinput class="form-item__title"
																	v-model="it.title" placeholder="内容标题" />
																<uni-easyinput class="form-item__input"
																	v-model="it.content" placeholder="请输入具体的值" />
																<view class="form-item__select">
																	<button class="icon-btn icon-btn--danger"
																		@tap="() => removeSignItem(si, ii)">
																		<uni-icons type="trash" size="16"
																			color="#d92d20" />
																	</button>
																</view>
															</view>
														</view>
													</view>
												</template>
											</view>
										</view>
									</view>
								</view>
							</view>
						</view>
					</view>

					<!-- 步骤2: 信息表/提资单 -->
					<view v-show="currentStep === 1" class="content-section">
						<view class="section-card">
							<view class="section-header">
								<uni-icons type="clipboard" size="20" color="#166534" />
								<text class="section-title">提资单比对清单</text>
							</view>
							<view class="section-body">
								<view class="section-actions">
									<button class="btn btn--primary" @tap="generateDatasheet">
										<uni-icons type="gear" size="16" color="#ffffff" />
										<text>生成比对清单</text>
									</button>
									<button class="btn btn--secondary" @tap="exportDatasheet">
										<uni-icons type="download" size="16" color="#155e3b" />
										<text>导出比对清单</text>
									</button>
								</view>

								<view v-if="datasheet.length" class="data-table">
									<view class="table-header table-header--dense">
										<text class="table-th w160">字段</text>
										<text class="table-th">当前值</text>
										<text class="table-th w140">类型</text>
										<text class="table-th w120">状态</text>
										<text class="table-th w80">操作</text>
									</view>
									<view class="table-body">
										<view class="table-row" v-for="(d, i) in datasheet" :key="d.id">
											<uni-easyinput class="table-td w160" v-model="d.label" placeholder="字段名" />
											<uni-easyinput class="table-td" v-model="d.value" placeholder="值" />
											<uni-data-select class="table-td w140" v-model="d.type"
												:localdata="datasheetTypeOptions" placeholder="类型" />
											<uni-data-select class="table-td w120" v-model="d.status"
												:localdata="verifyOptions" placeholder="状态" />
											<view class="table-td w80">
												<button class="icon-btn icon-btn--danger"
													@tap="() => removeDatasheet(i)">
													<uni-icons type="trash" size="16" color="#d92d20" />
												</button>
											</view>
										</view>
									</view>
								</view>

								<view v-else class="empty-state">
									<uni-icons type="document" size="48" color="#cbd5e1" />
									<text class="empty-text">尚未生成提资单</text>
									<text class="empty-tip">点击上方"生成提资单"按钮创建</text>
								</view>
							</view>
						</view>
					</view>

					<!-- 步骤3: 现场踏勘比对 -->
					<view v-show="currentStep === 2" class="content-section">
						<view class="section-card">
							<view class="section-header">
								<uni-icons type="map-pin-ellipse" size="20" color="#166534" />
								<text class="section-title">现场踏勘比对</text>
							</view>
							<view class="section-body">
								<view class="form-group">
									<text class="form-label">现场踏勘记录</text>
									<text class="form-tip">记录现场踏勘发现的问题和差异</text>
									<textarea class="fieldwork-textarea" v-model="fieldworkRecord"
										placeholder="请输入现场踏勘记录..." />
								</view>

								<view class="subsection">
									<view class="subsection-head">
										<uni-icons type="list" size="18" color="#166534" />
										<text class="subsection-title">现场踏勘比对清单</text>
									</view>

									<view class="section-actions">
										<button class="btn btn--primary" @tap="generateFieldworkComparison">
											<uni-icons type="gear" size="16" color="#ffffff" />
											<text>生成详细比对清单</text>
										</button>
										<button class="btn btn--secondary" @tap="addComparisonItem">
											<uni-icons type="plus" size="16" color="#155e3b" />
											<text>新增比对项</text>
										</button>
									</view>

									<view v-if="fieldworkComparison.length" class="data-table">
										<view class="table-header">
											<text class="table-th w120">比对项目</text>
											<text class="table-th">环评要求</text>
											<text class="table-th">现场情况</text>
											<text class="table-th w120">差异说明</text>
											<text class="table-th w80">操作</text>
										</view>
										<view class="table-body">
											<view class="table-row" v-for="(item, index) in fieldworkComparison"
												:key="item.id">
												<uni-easyinput class="table-td w120" v-model="item.project"
													placeholder="项目名称" />
												<uni-easyinput class="table-td" v-model="item.eiaRequirement"
													placeholder="环评要求" />
												<uni-easyinput class="table-td" v-model="item.fieldSituation"
													placeholder="现场情况" />
												<uni-easyinput class="table-td w120" v-model="item.difference"
													placeholder="差异说明" />
												<view class="table-td w80">
													<button class="icon-btn icon-btn--danger"
														@tap="() => removeComparisonItem(index)">
														<uni-icons type="trash" size="16" color="#d92d20" />
													</button>
												</view>
											</view>
										</view>
									</view>

									<view v-else class="empty-state">
										<uni-icons type="map-pin-ellipse" size="48" color="#cbd5e1" />
										<text class="empty-text">尚未生成现场踏勘比对清单</text>
										<text class="empty-tip">点击上方按钮生成或新增比对项</text>
									</view>
								</view>

								<view class="subsection">
									<view class="subsection-head">
										<uni-icons type="refresh" size="18" color="#166534" />
										<text class="subsection-title">基本信息更新确认</text>
									</view>
									<view class="update-confirm">
										<text class="update-label">是否根据现场踏勘结果更新项目基本信息表？</text>
										<view class="update-actions">
											<button class="btn btn--secondary" @tap="updateBaseInfo(false)">
												<text>否，继续下一步</text>
											</button>
											<button class="btn btn--primary" @tap="updateBaseInfo(true)">
												<text>是，更新基本信息</text>
											</button>
										</view>
									</view>
								</view>
							</view>
						</view>
					</view>

					<!-- 步骤4: 监测方案 -->
					<view v-show="currentStep === 3" class="content-section">
						<view class="section-card">
							<view class="section-header">
								<uni-icons type="eye" size="20" color="#166534" />
								<text class="section-title">监测方案</text>
							</view>
							<view class="section-body">
								<view class="section-actions">
									<button class="btn btn--primary" @tap="recommendPlan">
										<uni-icons type="magic" size="16" color="#ffffff" />
										<text>智能推荐方案</text>
									</button>
									<button class="btn btn--secondary" @tap="addPlanItem">
										<uni-icons type="plus" size="16" color="#155e3b" />
										<text>新增监测项</text>
									</button>
									<button class="btn btn--ghost" @tap="downloadMonitorTemplate">
										<uni-icons type="download" size="16" color="#5b6b7b" />
										<text>下载模板</text>
									</button>
								</view>

								<view v-if="plan.length" class="data-table">
									<view class="table-header">
										<text class="table-th w120">监测因子</text>
										<text class="table-th w120">监测点位</text>
										<text class="table-th w140">监测方法</text>
										<text class="table-th w120">监测频次</text>
										<text class="table-th w100">质控要求</text>
										<text class="table-th">备注</text>
										<text class="table-th w120">操作</text>
									</view>
									<view class="table-body">
										<view class="table-row" v-for="(item, index) in plan" :key="item.id">
											<uni-easyinput class="table-td w120" v-model="item.factor"
												placeholder="监测因子" />
											<uni-easyinput class="table-td w120" v-model="item.point"
												placeholder="监测点位" />
											<uni-easyinput class="table-td w140" v-model="item.method"
												placeholder="监测方法" />
											<uni-easyinput class="table-td w120" v-model="item.frequency"
												placeholder="监测频次" />
											<uni-easyinput class="table-td w100" v-model="item.qaqc"
												placeholder="质控要求" />
											<uni-easyinput class="table-td" v-model="item.remark" placeholder="备注" />
											<view class="table-td w120">
												<view class="action-buttons">
													<button class="icon-btn" @tap="() => duplicatePlanItem(index)">
														<uni-icons type="copy" size="16" color="#166534" />
													</button>
													<button class="icon-btn" @tap="() => movePlanItem(index, -1)"
														:disabled="index === 0">
														<uni-icons type="arrow-up" size="16" color="#166534" />
													</button>
													<button class="icon-btn" @tap="() => movePlanItem(index, 1)"
														:disabled="index === plan.length - 1">
														<uni-icons type="arrow-down" size="16" color="#166534" />
													</button>
													<button class="icon-btn icon-btn--danger"
														@tap="() => removePlanItem(index)">
														<uni-icons type="trash" size="16" color="#d92d20" />
													</button>
												</view>
											</view>
										</view>
									</view>
								</view>

								<view v-else class="empty-state">
									<uni-icons type="eye" size="48" color="#cbd5e1" />
									<text class="empty-text">尚未制定监测方案</text>
									<text class="empty-tip">点击上方按钮智能推荐或新增监测项</text>
								</view>

								<view class="action-row">
									<button class="btn btn--primary" @tap="saveMonitorPlan">
										<uni-icons type="checkmark" size="16" color="#ffffff" />
										<text>保存监测方案</text>
									</button>
								</view>
							</view>
						</view>
					</view>

					<!-- 步骤5: 竣工验收报告 -->
					<view v-show="currentStep === 4" class="content-section">
						<view class="section-card">
							<view class="section-header">
								<uni-icons type="document" size="20" color="#166534" />
								<text class="section-title">竣工验收报告</text>
							</view>
							<view class="section-body">
								<view class="report-generation">
									<view class="generation-options">
										<view class="option-group">
											<text class="option-label">报告类型</text>
											<radio-group class="radio-group" @change="onReportTypeChange">
												<label class="radio-item" v-for="type in reportTypes" :key="type.value">
													<radio :value="type.value" :checked="reportType === type.value" />
													<text class="radio-text">{{ type.text }}</text>
												</label>
											</radio-group>
										</view>

										<view class="option-group" v-if="reportType === 'withData'">
											<text class="option-label">上传检测报告</text>
											<uni-file-picker v-model="testReportFiles" fileMediatype="all"
												:auto-upload="false" :limit="3">
											</uni-file-picker>
										</view>
									</view>

									<view class="generation-actions">
										<button class="btn btn--primary" @tap="generateAcceptanceReport">
											<uni-icons type="gear" size="16" color="#ffffff" />
											<text>生成验收报告</text>
										</button>
										<button class="btn btn--secondary" @tap="previewReport"
											:disabled="!reportGenerated">
											<uni-icons type="eye" size="16" color="#155e3b" />
											<text>预览报告</text>
										</button>
										<button class="btn btn--ghost" @tap="exportReport" :disabled="!reportGenerated">
											<uni-icons type="download" size="16" color="#5b6b7b" />
											<text>导出报告</text>
										</button>
									</view>

									<view v-if="reportGenerated" class="report-preview">
										<view class="preview-header">
											<uni-icons type="checkmark-circle" size="18" color="#166534" />
											<text class="preview-title">报告生成完成</text>
										</view>
										<view class="preview-content">
											<text class="preview-text">竣工验收报告已生成，包含以下内容：</text>
											<view class="preview-sections">
												<text class="section-item">• 项目基本情况</text>
												<text class="section-item">• 环保设施建设情况</text>
												<text class="section-item">• 监测结果分析</text>
												<text class="section-item">• 验收结论</text>
												<text v-if="reportType === 'withData'" class="section-item">•
													检测数据附件</text>
											</view>
										</view>
									</view>

									<view v-else class="empty-state">
										<uni-icons type="document" size="48" color="#cbd5e1" />
										<text class="empty-text">尚未生成验收报告</text>
										<text class="empty-tip">点击上方按钮生成报告</text>
									</view>
								</view>
							</view>
						</view>
					</view>
				</scroll-view>
			</view>

			<!-- 底部导航 -->
			<view class="acceptance-navigation">
				<view class="nav-buttons">
					<button class="btn btn--ghost" :disabled="currentStep === 0" @tap="prevStep">
						<uni-icons type="left" size="16" color="#5b6b7b" />
						<text>上一步</text>
					</button>
					<button class="btn btn--primary" :disabled="currentStep === stepNames.length - 1" @tap="nextStep">
						<text>下一步</text>
						<uni-icons type="right" size="16" color="#ffffff" />
					</button>
				</view>
			</view>
		</view>
	</app-layout>

	<!-- 新增信息弹窗 -->
	<uni-popup ref="fieldPopup" type="center">
		<view class="modal">
			<view class="modal-header">
				<text class="modal-title">新增项目基本信息</text>
			</view>
			<view class="modal-body">
				<text class="modal-description">请在下方输入信息名称</text>
				<uni-easyinput v-model="newFieldLabel" placeholder="如：项目名称/单位名称" />
			</view>
			<view class="modal-actions">
				<button class="btn btn--ghost" @tap="closeFieldPopup">取消</button>
				<button class="btn btn--primary" @tap="confirmAddField">确定</button>
			</view>
		</view>
	</uni-popup>
</template>

<script setup>
	import {
		ref,
		reactive,
		computed
	} from 'vue'
	import {
		usePlatformInfo
	} from '@/utils/platform'
	import AppLayout from '@/components/layout/AppLayout.vue'
	import {
		onShow,
		onLoad
	} from '@dcloudio/uni-app'
	import {
		navTitleStore
	} from '@/stores/navTitle.js'
	import {
		uploadFileToBackend,
		rebuildIndex,
		runTask,
		transformExtractResult,
	} from '@/api/acceptance.js'

	//手机端头部页面标题
	const navTitle = navTitleStore()
	onShow(() => navTitle.setTitle('验收报告'))

	//手机页面规定
	const {
		isMobile
	} = usePlatformInfo()

	// 以下提取项目基本信息模块的方法--------------------------
	// 限制文件格式
	const ALLOWED_EXTS = [
		'pdf', 'doc', 'docx', 'txt', 'md',
		'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'
	]

	// 最大上传个数
	const MAX_FILES = 100

	// 上传文件与提取信息
	const eiaFiles = ref([])
	const uploadedDocuments = ref([]) // 存储已上传的文档ID
	const extracting = ref(false) // 提取状态
	const extractError = ref('') // 提取错误状态

	// 文件类型检查
	function checkFileType(fileName) {
		const ext = (fileName || '').split('.').pop().toLowerCase()
		return {
			isSupported: ALLOWED_EXTS.includes(ext), // 是否支持解析
			ext,
			displayName: fileName
		}
	}

	// 统一提示逻辑
	function showUploadResult({
		successCount,
		failCount,
		supported,
		nonSupported,
		total
	}) {
		const hasSupported = supported > 0
		const hasNonSupported = nonSupported > 0

		if (failCount === 0 && successCount === total) {
			//  修复：根据是否有可解析文件显示不同提示
			let title = `全部上传成功 (${successCount}个)`
			if (hasSupported) {
				title = `上传成功: ${supported}个文档已解析, ${nonSupported}个附件`
			} else if (hasNonSupported) {
				title = `${successCount}个文件已上传（暂不支持自动解析）`
			}

			uni.showToast({
				title,
				icon: hasSupported ? 'success' : 'none',
				duration: 2500
			})
		} else if (failCount === total) {
			uni.showToast({
				title: `全部上传失败 (${failCount}个)`,
				icon: 'none'
			})
		} else {
			uni.showToast({
				title: `完成: 成功${successCount}, 失败${failCount}`,
				icon: 'none'
			})
		}
	}

	// 进度条提示
	let uploadProgressTimer = null
	let currentUploadPercent = 0
	let sprintTimer = null
	let progressDone = false

	/**
	 * 启动假进度条
	 * totalSlowTime: 缓慢增长的总时间（ms）
	 */
	function startUploadFakeProgress(totalSlowTime = 60000) {
		currentUploadPercent = 0
		progressDone = false

		const step = 99 / (totalSlowTime / 200) // 每200ms一步，终点99%

		uploadProgressTimer = setInterval(() => {
			if (progressDone) {
				clearInterval(uploadProgressTimer)
				uploadProgressTimer = null
				return
			}

			currentUploadPercent += step
			if (currentUploadPercent >= 99) {
				currentUploadPercent = 99
				clearInterval(uploadProgressTimer)
				uploadProgressTimer = null
			}

			uni.showLoading({
				title: `正在解析文档… ${Math.floor(currentUploadPercent)}%`,
				mask: true
			})
		}, 200)
	}

	/**
	 * 冲刺到100%并完成
	 */
	function sprintToComplete() {
		progressDone = true

		// 清除之前的假进度计时器
		if (uploadProgressTimer) {
			clearInterval(uploadProgressTimer)
			uploadProgressTimer = null
		}

		// 2秒内从当前进度冲到100%
		const startPercent = currentUploadPercent
		const targetPercent = 100
		const duration = 2000 // 2秒
		const stepTime = 10 // 每10ms更新一次
		const totalSteps = duration / stepTime
		const stepValue = (targetPercent - startPercent) / totalSteps

		let currentStep = 0
		sprintTimer = setInterval(() => {
			currentStep++
			currentUploadPercent = startPercent + (stepValue * currentStep)

			if (currentUploadPercent >= 100) {
				currentUploadPercent = 100
				clearInterval(sprintTimer)
				sprintTimer = null

				// 显示100%并停留1秒
				uni.showLoading({
					title: `文件解析成功，解析进度：100%`,
					mask: true
				})

				setTimeout(() => {
					uni.hideLoading()
					// 可选：显示成功提示
					uni.showToast({
						title: '文档解析完成',
						icon: 'success',
						duration: 1500
					})
				}, 1000)

				return
			}

			uni.showLoading({
				title: `正在解析文档，请稍等：${Math.floor(currentUploadPercent)}%`,
				mask: true
			})
		}, stepTime)
	}


	// 上传文件并解析
	async function handleFileSelect(e) {
		const selectedFiles = e.tempFiles || (e.tempFile ? [e.tempFile] : [])
		if (!selectedFiles?.length) return

		const remaining = MAX_FILES - eiaFiles.value.length
		if (remaining <= 0) {
			uni.showToast({
				title: `最多只能上传${MAX_FILES}个文件`,
				icon: 'none'
			})
			return
		}

		const unsupportedFiles = []
		const supportedFiles = selectedFiles
			.filter(file => {
				const ext = (file.name || file.filename || '').split('.').pop().toLowerCase()
				const isAllowed = ALLOWED_EXTS.includes(ext)
				if (!isAllowed) unsupportedFiles.push(file.name || file.filename)
				return isAllowed
			})
			.slice(0, remaining)

		if (unsupportedFiles.length > 0) {
			const names = unsupportedFiles.slice(0, 3).join(', ')
			const more = unsupportedFiles.length > 3 ? ` 等${unsupportedFiles.length}个` : '文件'
			uni.showModal({
				title: '不支持的文件格式',
				content: `以下${more}不支持上传：\n${names}${unsupportedFiles.length > 3 ? '...' : ''}`,
				showCancel: false,
				confirmText: '知道了'
			})
		}

		if (supportedFiles.length > 0) {
			eiaFiles.value = [...eiaFiles.value, ...supportedFiles]
		}
		if (supportedFiles.length === 0) return

		// ✅ 启动假进度（2.5分钟）
		startUploadFakeProgress(150000)

		const stats = {
			successCount: 0,
			failCount: 0,
			supported: 0,
			nonSupported: 0,
			total: supportedFiles.length
		}

		for (let i = 0; i < supportedFiles.length; i++) {
			const file = supportedFiles[i]
			try {
				const result = await uploadFileToBackend(file)
				uploadedDocuments.value.push(result.document_id)
				stats.successCount++

				const ext = (result.filename || file.name || '').split('.').pop().toLowerCase()
				const parseableExts = ['pdf', 'doc', 'docx', 'txt', 'md',
					'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'
				]
				if (parseableExts.includes(ext)) {
					stats.supported++
					console.log(`文件已上传并支持解析: ${result.filename}`)
				} else {
					stats.nonSupported++
					console.log(`文件已上传（暂不支持解析）: ${result.filename}`)
				}
			} catch (error) {
				stats.failCount++
				console.error(`❌ 文件 ${i + 1} 上传失败:`, error)

				// 失败时清除进度条
				progressDone = true
				if (uploadProgressTimer) {
					clearInterval(uploadProgressTimer)
					uploadProgressTimer = null
				}
				if (sprintTimer) {
					clearInterval(sprintTimer)
					sprintTimer = null
				}
				uni.hideLoading()

				if (supportedFiles.length === 1) {
					uni.showToast({
						title: error.message || '上传失败',
						icon: 'none'
					})
					return
				}
			}
		}

		// 显示上传结果
		showUploadResult(stats)

		// 如果有支持解析的文件，开始自动索引
		if (stats.supported > 0) {
			console.log(`[AutoIndex] 检测到 ${stats.supported} 个可解析文件，开始自动索引...`)
			await handleAutoIndexBuild(stats.supported)
		} else {
			// 没有可解析文件时，直接完成进度
			progressDone = true
			if (uploadProgressTimer) {
				clearInterval(uploadProgressTimer)
				uploadProgressTimer = null
			}
			uni.hideLoading()
		}
	}

	// 抽离的索引构建函数
	async function handleAutoIndexBuild(supportedCount) {
		try {
			const result = await rebuildIndex({
				hideLoading: true
			})

			console.log('[AutoIndex] 成功:', result)

			// ✅ 收到后端成功响应，开始冲刺到100%
			sprintToComplete()

		} catch (error) {
			console.error('[AutoIndex] 失败:', error)

			// 失败时清除所有进度条
			progressDone = true
			if (uploadProgressTimer) {
				clearInterval(uploadProgressTimer)
				uploadProgressTimer = null
			}
			if (sprintTimer) {
				clearInterval(sprintTimer)
				sprintTimer = null
			}
			uni.hideLoading()

			uni.showModal({
				title: '自动解析失败',
				content: '文档已上传，但索引构建失败。\n\n错误：' + (error.message || '未知错误'),
				showCancel: false,
				confirmText: '知道了'
			})
		}
	}

	// 同步删除两个列表
	function handleFileDelete(e) {
		const {
			index,
			tempFile
		} = e // uni-file-picker 会返回 index 和 tempFile

		// 从 uploadedDocuments 删除对应文档ID
		if (uploadedDocuments.value[index]) {
			uploadedDocuments.value.splice(index, 1)
		}

		// 同时从 eiaFiles 删除（保持 v-model 同步）
		if (eiaFiles.value[index]) {
			eiaFiles.value.splice(index, 1)
		}
	}


	/* 提取信息的进度条 */
	// 1. 先声明一个计时器句柄
	let progressTimer = null
	let currentPercent = 0

	// 2. 开始"假进度"
	function startFakeProgress() {
		currentPercent = 0
		progressTimer = setInterval(() => {
			currentPercent += 2 // 每 80ms +2%，50 次后 100%
			if (currentPercent >= 100) {
				clearInterval(progressTimer)
				progressTimer = null
				return
			}
			// ✅ 关键：实时改 loading 文字
			uni.showLoading({
				title: `正在提取项目信息，提取进度： ${currentPercent}%`,
				mask: true
			})
		}, 200)
	}


	// 提取信息到项目基本表
	async function simulateExtract() {
		// 1. 前置检查：没上传文件直接弹窗
		if (uploadedDocuments.value.length === 0) {
			uni.showModal({
				title: '提示',
				content: '请先上传环评报告文件',
				showCancel: false,
				confirmText: '知道了'
			})
			return
		}

		extracting.value = true // 开始提取，按钮显示loading
		startFakeProgress()
		// 2. 显示loading，带预估时间（大文件用户不慌张）
		uni.showLoading({
			title: '请稍作等待，正在提取项目信息，预计2~3分钟哦',
			mask: true
		})

		try {
			// 3. 调用后端，超时设为15分钟（900000毫秒），避免大文件超时
			const result = await runTask('task1', {
				hideLoading: true, // 我们用uni.showLoading，所以这里隐藏
				timeout: 900000 // 15分钟，足够解析100页PDF
			})

			uni.hideLoading()

			// 4. 数据校验：确保后端真的返回了数据
			if (result?.status !== 'success' || !result.result) { // ✅ 修复：用 !==
				throw new Error(result?.message || '提取失败：后端未返回有效数据')
			}

			// 5. 转换数据并填充表格（核心操作）
			baseTable.value = transformExtractResult(result.result)

			// 6. 成功提示
			uni.showToast({
				title: `成功提取 ${Object.keys(result.result).length} 条信息`,
				icon: 'success',
				duration: 2500
			})

			// 7. 缓存到本地（关键！刷新页面不丢失）
			uni.setStorageSync('project_base_info', JSON.stringify(baseTable.value))

			console.log('[Extract] 提取成功:', result)
			console.log('[Debug] baseTable:', baseTable.value) // ✅ 调试日志

		} catch (error) {
			uni.hideLoading()

			// 8. 错误分类处理，给用户看得懂的提示
			console.error('[Extract] 提取失败:', error)

			if (error.message.includes('超时')) {
				uni.showModal({
					title: '提取超时',
					content: '文档过大或网络较慢，建议：\n1. 拆分成多个文件上传\n2. 检查网络连接\n3. 联系管理员',
					showCancel: false,
					confirmText: '知道了'
				})
			} else if (error.message.includes('未提取到')) {
				uni.showModal({
					title: '提取失败',
					content: '文档中未找到项目信息，请检查：\n1. 文件是否为完整的环评报告\n2. 文件内容是否清晰可读',
					showCancel: false,
					confirmText: '知道了'
				})
			} else {
				uni.showModal({
					title: '提取失败',
					content: error.message || '无法从文档中提取项目信息，请稍后重试',
					showCancel: false,
					confirmText: '知道了'
				})
			}
		} finally {
			extracting.value = false // 无论成功失败，都要结束loading状态
		}
	}











	// 步骤定义 - 按照验收流程
	const stepNames = ['资料上传与基本信息', '监测方案', '提资单比对', '现场踏勘比对', '竣工验收报告']
	const currentStep = ref(0)
	const stepNamesDisplay = computed(() => stepNames.map((n, i) => stepDone(i) ? (n + ' ✓') : n))
	const stepSelectOptions = computed(() => stepNames.map((n, i) => ({
		text: stepDone(i) ? (n + ' ✓') : n,
		value: i
	})))

	function onStepChange(e) {
		const idx = Number(e?.currentIndex ?? e?.detail?.currentIndex ?? 0);
		if (!Number.isNaN(idx)) currentStep.value = idx
	}

	function prevStep() {
		if (currentStep.value > 0) currentStep.value -= 1
	}

	function nextStep() {
		if (currentStep.value < stepNames.length - 1) currentStep.value += 1
	}

	const extractionOk = ref(false)
	const showSignboardStep1 = ref(false)

	// 校验与完成度
	function stepDone(i) {
		switch (i) {
			case 0:
				return extractionOk.value;
			case 1:
				return datasheet.value.length > 0;
			case 2:
				return fieldworkComparison.value.length > 0;
			case 3:
				return plan.value.length > 0;
			case 4:
				return reportGenerated.value;
			default:
				return false
		}
	}

	const draftPopup = ref(null)
	const draftMode = ref('export')
	const draftText = ref('')

	const fieldPopup = ref(null)
	const newFieldLabel = ref('')

	function openExportDraft() {
		try {
			draftMode.value = 'export';
			draftText.value = JSON.stringify({
				step: currentStep.value
			}, null, 2);
			draftPopup.value?.open?.()
		} catch (e) {
			uni.showToast({
				title: '导出失败',
				icon: 'none'
			})
		}
	}

	function openImportDraft() {
		draftMode.value = 'import';
		draftText.value = '';
		draftPopup.value?.open?.()
	}

	function closeDraftPopup() {
		draftPopup.value?.close?.()
	}

	function copyExportDraft() {
		try {
			/* #ifdef H5 */
			navigator.clipboard?.writeText?.(draftText.value || '');
			/* #endif */
			/* #ifndef H5 */
			uni.setClipboardData({
				data: draftText.value || ''
			});
			/* #endif */
			uni.showToast({
				title: '已复制',
				icon: 'none'
			});
			draftPopup.value?.close?.()
		} catch (e) {
			uni.showToast({
				title: '复制失败',
				icon: 'none'
			})
		}
	}

	function clearDraft() {
		eiaFiles.value = [];
		extractionOk.value = false;
		currentStep.value = 0;
		uni.showToast({
			title: '已清空',
			icon: 'none'
		})
	}

	function exportDocx() {
		uni.showToast({
			title: '导出Word（占位）',
			icon: 'none'
		})
	}

	function exportPdf() {
		uni.showToast({
			title: '导出PDF（占位）',
			icon: 'none'
		})
	}

	function openAddField() {
		newFieldLabel.value = '';
		fieldPopup.value?.open?.()
	}

	function closeFieldPopup() {
		fieldPopup.value?.close?.()
	}

	function confirmAddField() {
		const label = (newFieldLabel.value || '').trim();
		if (!label) {
			uni.showToast({
				title: '请输入字段名称',
				icon: 'none'
			});
			return
		}
		baseTable.value.push({
			id: Date.now() + Math.random(),
			section: '',
			label,
			value: '',
			source: 'manual',
			required: false,
		});
		fieldPopup.value?.close?.()
	}

	// 1. 信息表/提资单------------
	const verifyOptions = [{
		text: '待核对',
		value: 'pending'
	}, {
		text: '已核对',
		value: 'verified'
	}, {
		text: '需补充',
		value: 'require'
	}]
	const baseTable = ref([])
	const datasheet = ref([])
	const datasheetTypeOptions = [{
		text: '需再次提资',
		value: 'requireMore'
	}, {
		text: '需业主核对',
		value: 'ownerConfirm'
	}]

	function generateDatasheet() {
		const list = baseTable.value.filter(r => (r.required && !r.value) || r.status !== 'verified').map(r => ({
			id: r.id,
			label: r.label || '未命名',
			value: r.value || '',
			type: r.required && !r.value ? 'requireMore' : 'ownerConfirm',
		}));
		datasheet.value = list;
		uni.showToast({
			title: `已生成提资单（${list.length}项）`,
			icon: 'none'
		})
	}

	function removeDatasheet(i) {
		datasheet.value.splice(i, 1)
	}

	function exportDatasheet() {
		uni.showToast({
			title: '待对接：导出提资单',
			icon: 'none'
		})
	}

	// 选择删除模式
	const selectMode = ref(false)
	const selectedIds = ref([])

	function toggleSelectMode() {
		selectMode.value = !selectMode.value;
		if (!selectMode.value) selectedIds.value = []
	}

	function toggleSelected(id) {
		const arr = selectedIds.value;
		const i = arr.indexOf(id);
		if (i >= 0) arr.splice(i, 1);
		else arr.push(id)
	}

	function removeSelected() {
		if (!selectedIds.value.length) {
			uni.showToast({
				title: '未选择',
				icon: 'none'
			})
			return
		}

		const names = baseTable.value
			.filter(r => selectedIds.value.includes(r.id))
			.map(r => (r.label || '（未命名）').trim())

		const preview =
			names.length === 1 ?
			`确认要删除「${names[0]}」吗？` :
			(() => {
				const max = 8
				const head = names.slice(0, max).map(n => `• ${n}`).join('\n')
				const tail = names.length > max ? `\n… 等 ${names.length} 项` : ''
				return `确认要删除以下 ${names.length} 个信息吗？\n${head}${tail}`
			})()

		uni.showModal({
			title: '确认删除',
			content: preview,
			confirmText: '删除',
			cancelText: '取消',
			success: (res) => {
				if (res.confirm) {
					baseTable.value = baseTable.value.filter(
						r => !selectedIds.value.includes(r.id)
					)
					selectedIds.value = []
					selectMode.value = false

					uni.showToast({
						title: `已删除 ${names.length} 项`,
						icon: 'none'
					})
				}
			}
		})
	}

	// 2. 现场踏勘比对------------------------
	const fieldworkRecord = ref('')
	const fieldworkComparison = ref([])

	function generateFieldworkComparison() {
		// 基于提资单和基本信息生成现场踏勘比对清单
		const comparison = datasheet.value.map(item => ({
			id: Date.now() + Math.random(),
			project: item.label,
			eiaRequirement: item.value || '待确认',
			fieldSituation: '',
			difference: '待现场核实'
		}))

		fieldworkComparison.value = comparison
		uni.showToast({
			title: `已生成比对清单（${comparison.length}项）`,
			icon: 'success'
		})
	}

	function addComparisonItem() {
		fieldworkComparison.value.push({
			id: Date.now() + Math.random(),
			project: '',
			eiaRequirement: '',
			fieldSituation: '',
			difference: ''
		})
	}

	function removeComparisonItem(index) {
		fieldworkComparison.value.splice(index, 1)
	}

	function updateBaseInfo(shouldUpdate) {
		if (shouldUpdate) {
			// 根据现场踏勘结果更新基本信息
			fieldworkComparison.value.forEach(comparison => {
				const baseItem = baseTable.value.find(item => item.label === comparison.project)
				if (baseItem && comparison.fieldSituation) {
					baseItem.value = comparison.fieldSituation
					baseItem.status = 'verified'
				}
			})
			uni.showToast({
				title: '基本信息已更新',
				icon: 'success'
			})
		}
		// 进入下一步：监测方案
		currentStep.value = 3
	}

	// 3. 监测方案
	const plan = ref([])

	function recommendPlan() {
		const hasWW = baseTable.value.some(item =>
			item.label.includes('废水') || item.label.includes('污水')
		)
		const hasWA = baseTable.value.some(item =>
			item.label.includes('废气') || item.label.includes('烟气')
		)
		const hasNoise = baseTable.value.some(item =>
			item.label.includes('噪声')
		)

		const now = Date.now();
		plan.value = []

		if (hasWW) {
			plan.value.push({
				id: now + 1,
				factor: 'COD',
				point: '废水总排口',
				method: 'GB/T 11914-2020',
				frequency: '3天×2次/天',
				qaqc: '平行/空白',
				remark: '化学需氧量'
			})
			plan.value.push({
				id: now + 2,
				factor: '氨氮',
				point: '废水总排口',
				method: 'HJ 535-2009',
				frequency: '3天×2次/天',
				qaqc: '平行',
				remark: ''
			})
		}

		if (hasWA) {
			plan.value.push({
				id: now + 3,
				factor: '颗粒物',
				point: '废气排放口',
				method: 'HJ 836-2017',
				frequency: '2天×3次/天',
				qaqc: '平行',
				remark: ''
			})
		}

		if (hasNoise) {
			plan.value.push({
				id: now + 4,
				factor: '噪声',
				point: '厂界四角',
				method: 'GB 12348-2008',
				frequency: '昼/夜各1次',
				qaqc: '',
				remark: '连续2天'
			})
		}

		if (plan.value.length === 0) {
			plan.value.push({
				id: now + 5,
				factor: '常规监测',
				point: '主要产污环节',
				method: '按标准执行',
				frequency: '1天×2次',
				qaqc: '质控样',
				remark: '请根据实际情况调整'
			})
		}

		uni.showToast({
			title: `已推荐${plan.value.length}项监测方案`,
			icon: 'success'
		})
	}

	function addPlanItem() {
		plan.value.push({
			id: Date.now() + Math.random(),
			factor: '',
			point: '',
			method: '',
			frequency: '',
			qaqc: '',
			remark: ''
		})
	}

	function removePlanItem(i) {
		plan.value.splice(i, 1)
	}

	function duplicatePlanItem(i) {
		try {
			const src = plan.value[i];
			plan.value.splice(i + 1, 0, {
				...JSON.parse(JSON.stringify(src)),
				id: Date.now() + Math.random()
			})
		} catch (e) {}
	}

	function movePlanItem(i, dir) {
		if (i + dir < 0 || i + dir >= plan.value.length) return;
		const it = plan.value.splice(i, 1)[0];
		plan.value.splice(i + dir, 0, it)
	}

	function downloadMonitorTemplate() {
		uni.showToast({
			title: '监测方案模板下载成功',
			icon: 'success'
		})
	}

	function saveMonitorPlan() {
		uni.showToast({
			title: '监测方案已保存',
			icon: 'success'
		})
	}

	// 4. 竣工验收报告
	const reportType = ref('withoutData')
	const testReportFiles = ref([])
	const reportGenerated = ref(false)
	const reportTypes = [{
			value: 'withoutData',
			text: '无检测数据报告'
		},
		{
			value: 'withData',
			text: '有检测数据报告'
		}
	]

	function onReportTypeChange(e) {
		reportType.value = e.detail.value
	}

	function generateAcceptanceReport() {
		// 验证必要数据
		if (!baseTable.value.length) {
			uni.showToast({
				title: '请先完成项目基本信息',
				icon: 'none'
			})
			return
		}

		if (reportType.value === 'withData' && !testReportFiles.value.length) {
			uni.showToast({
				title: '请上传检测报告',
				icon: 'none'
			})
			return
		}

		// 模拟生成报告
		setTimeout(() => {
			reportGenerated.value = true
			uni.showToast({
				title: '验收报告生成成功',
				icon: 'success'
			})
		}, 1500)
	}

	function previewReport() {
		uni.showToast({
			title: '报告预览功能待开发',
			icon: 'none'
		})
	}

	function exportReport() {
		const typeText = reportType.value === 'withData' ? '有检测数据' : '无检测数据'
		uni.showToast({
			title: `${typeText}报告导出成功`,
			icon: 'success'
		})
	}

	// 标识牌相关
	const signboard = reactive({
		sections: [{
				block: '废水',
				items: [{
					title: '单位名称',
					content: ''
				}]
			},
			{
				block: '废气',
				items: [{
					title: '单位名称',
					content: ''
				}]
			},
			{
				block: '噪声',
				items: [{
					title: '单位名称',
					content: ''
				}]
			}, {
				block: '危险污染物',
				items: [{
					title: '单位名称',
					content: ''
				}]
			}
		]
	})

	function generateSignboard() {
		const unit = findBaseValue('单位名称') || findBaseValue('项目名称') || '';
		signboard.sections.forEach(sec => {
			const item = sec.items.find(i => i.title.includes('单位名称'));
			if (item) item.content = unit
		});
		uni.showToast({
			title: '已生成标识牌文案',
			icon: 'success'
		})
	}

	function addSignItem(i) {
		signboard.sections[i].items.push({
			title: '',
			content: ''
		})
	}

	function removeSignItem(i, j) {
		signboard.sections[i].items.splice(j, 1)
	}

	function findBaseValue(label) {
		const r = baseTable.value.find(x => x.label === label);
		return r ? (r.value || '') : ''
	}

	// 完成度计算
	const completionPercent = computed(() => {
		let totalSteps = stepNames.length
		let completedSteps = stepNames.reduce((count, _, index) => {
			return count + (stepDone(index) ? 1 : 0)
		}, 0)

		return Math.round((completedSteps / totalSteps) * 100)
	})

	// 在页面加载时，恢复基本信息表缓存
	onLoad(() => {
		const cached = uni.getStorageSync('project_base_info')
		if (cached) {
			try {
				baseTable.value = JSON.parse(cached)
				console.log('[Cache] 恢复缓存的项目信息，共', baseTable.value.length, '条')
			} catch (e) {
				console.warn('[Cache] 缓存数据解析失败:', e)
			}
		}
	})
</script>

<style lang="scss" scoped>
	/* ========== 设计令牌（统一风格） ========== */
	$brand: #166534; // 主色（深绿）
	$brand-600: #17834a;
	$brand-50: #ecfdf5;
	$ink: #0f172a; // 标题
	$muted: #5b6b7b; // 次文本
	$line: #e6eaf0; // 细线
	$bg: #f6f8fb; // 背景
	$white: #ffffff;
	$danger: #d92d20;
	$warning: #fb923c;

	$radius: 14rpx;
	$radius-lg: 18rpx;
	$shadow-sm: 0 2rpx 10rpx rgba(16, 24, 40, .06);
	$shadow-md: 0 6rpx 24rpx rgba(16, 24, 40, .08);

	/* ========== 页面框架 ========== */
	.acceptance-page {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		background: $bg;
	}


	/* 统一按钮体系 */
	.btn {
		display: flex;
		align-items: center;
		gap: 8rpx;
		padding: 0 22rpx;
		height: 64rpx;
		font-size: 24rpx;
		font-weight: 500;
		background: $white;
		color: #374151;
		transition: transform .12s ease, box-shadow .12s ease, background .12s ease, border-color .12s ease;
	}

	:deep(.uni-button.btn.btn--secondary::after) {
		border-radius: $radius;
	}

	.btn:active {
		transform: translateY(1rpx);
	}

	.btn[disabled] {
		opacity: .6;
		pointer-events: none;
	}

	.btn--primary {
		background: $brand;
		color: $white;
		border-color: $brand;
		box-shadow: 0 4rpx 12rpx rgba(22, 101, 52, .22);
	}

	.btn--secondary {
		background: #f8fafc;
		color: #155e3b;
		border-color: #dbe3ea;
	}

	.btn--ghost {
		background: $white;
		color: $muted;
		border-color: #e9edf2;
	}

	.btn--danger {
		background: $danger;
		color: $white;
		border-color: $danger;
	}

	.btn--danger-ghost {
		background: #fef3f2;
		color: $danger;
		border-color: #fde2e1;
	}

	/* 步骤导航 */
	.acceptance-steps {
		background: $white;
		border-bottom: 1rpx solid #f2f4f7;
		padding: 18rpx 24rpx;
	}

	.steps-container {
		max-width: 1200rpx;
		margin: 0 auto;
	}

	.mobile-step-select {
		width: 100%;
	}

	.desktop-steps {
		display: flex;
		align-items: center;
		gap: 8rpx;
	}

	.step-item {
		position: relative;
		display: flex;
		align-items: center;
		gap: 12rpx;
		padding: 14rpx 18rpx;
		border-radius: $radius;
		border: 1rpx solid transparent;
		transition: background .2s ease, border-color .2s ease;
	}

	.step-item--active {
		background: #f3faf6;
		border-color: #def7ec;
	}

	.step-item--completed .step-indicator {
		background: #10b981;
		color: $white;
	}

	.step-indicator {
		width: 44rpx;
		height: 44rpx;
		border-radius: 50%;
		background: #eef2f6;
		color: $muted;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 20rpx;
		font-weight: 700;
		flex-shrink: 0;
	}

	.step-label {
		font-size: 26rpx;
		color: #344054;
		font-weight: 600;
	}

	.step-connector {
		width: 20rpx;
		height: 2rpx;
		background: #e3e8ef;
		margin-left: 4rpx;
		border-radius: 1rpx;
	}

	/* 主体 */
	.acceptance-content {
		flex: 1;
		padding: 20rpx 24rpx;
		min-height: 0;
	}

	.content-scroll {
		height: 100%;
	}

	.content-section {
		margin-bottom: 20rpx;
	}

	.section-card {
		background: $white;
		border-radius: $radius-lg;
		box-shadow: $shadow-md;
		border: 1rpx solid #eef2f6;
		overflow: hidden;
	}

	.section-header {
		display: flex;
		align-items: center;
		gap: 10rpx;
		padding: 24rpx 24rpx 0;
		margin-bottom: 16rpx;
	}

	.section-title {
		font-size: 32rpx;
		color: $ink;
		font-weight: 700;
		letter-spacing: .2rpx;
	}

	.section-body {
		padding: 0 24rpx 24rpx;
	}

	/* 表单 */
	.form-group {
		display: flex;
		flex-direction: column;
		gap: 12rpx;
		margin-bottom: 24rpx;
	}

	.form-label {
		font-size: 28rpx;
		color: $ink;
		font-weight: 700;
	}

	.form-tip {
		font-size: 24rpx;
		color: $muted;
	}

	.action-row {
		display: flex;
		gap: 12rpx;
		margin-top: 16rpx;
	}

	.section-actions {
		display: flex;
		gap: 12rpx;
		margin: 12rpx 0 18rpx;
		flex-wrap: wrap;
	}

	/* 子块标题 */
	.subsection {
		margin-top: 24rpx;
		padding-top: 24rpx;
		border-top: 1rpx solid #f1f5f9;
	}

	.subsection-head {
		display: flex;
		align-items: center;
		gap: 10rpx;
		margin-bottom: 14rpx;
	}

	.subsection-title {
		font-size: 28rpx;
		color: $ink;
		font-weight: 700;
	}

	/* 表格（桌面网格、移动卡片化） */
	.data-table {
		border: 1rpx solid #e6ebf1;
		border-radius: $radius;
		overflow: hidden;
	}

	.table-header {
		display: grid;
		grid-template-columns: 120rpx 1fr 120rpx 80rpx;
		background: #f8fafc;
		border-bottom: 1rpx solid #e6ebf1;
	}

	.table-header--dense {
		grid-template-columns: 160rpx 1fr 140rpx 120rpx 100rpx;
	}

	.table-th {
		padding: 18rpx 14rpx;
		font-size: 24rpx;
		color: #475569;
		font-weight: 700;
		border-right: 1rpx solid #e6ebf1;
	}

	.table-th:last-child {
		border-right: none;
	}

	.table-body {
		background: $white;
	}

	.table-row {
		display: grid;
		grid-template-columns: 120rpx 1fr 120rpx 80rpx;
		border-bottom: 1rpx solid #f2f4f7;
	}

	.table-row:last-child {
		border-bottom: none;
	}

	.table-row--simple {
		grid-template-columns: 1fr 100rpx;
	}

	.table-td {
		padding: 16rpx 14rpx;
		border-right: 1rpx solid #f7f8fa;
		min-height: 76rpx;
		display: flex;
		align-items: center;
	}

	.table-td:last-child {
		border-right: none;
	}

	.table-td--section {
		font-weight: 700;
		color: #0f172a;
	}

	/* 图标按钮（表格内） */
	.icon-btn {
		width: 44rpx;
		height: 44rpx;
		border-radius: 10rpx;
		border: 1rpx solid #edf1f5;
		display: flex;
		align-items: center;
		justify-content: center;
		background: $white;
	}

	.icon-btn:active {
		background: #f3f6fa;
	}

	/* 基本信息表：响应式行 */
	.form-grid--base {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12rpx 16rpx;
	}

	.form-item__row {
		display: flex;
		align-items: center;
		gap: 10rpx;
		background: $white;
		border: 1rpx solid #e7ecf2;
		border-radius: $radius;
		padding: 14rpx;
	}

	.form-item__label {
		min-width: 180rpx;
		color: #334155;
		font-weight: 700;
	}

	/* 小标签的样式 */
	.extract-tag {
		display: inline-block;
		margin-left: 8px;
		padding: 2px 6px;
		background-color: #52c41a;
		color: #fff;
		font-size: 10px;
		border-radius: 3px;
		vertical-align: middle;
	}

	/* 标识牌：左侧标题输入，固定宽度以避免与值重叠 */
	.pw-ico {
		width: 140rpx;
		height: 64rpx;
		border-radius: 10rpx;
		border: 1rpx solid #edf1f5;
		display: flex;
		align-items: center;
		justify-content: center;
		background: $white;
		margin-left: -100rpx;
		margin-top: 24rpx;
	}

	.pw-ico text {
		font-size: 22rpx;
	}


	.form-item__title {
		width: 180rpx;
	}

	.form-item__input {
		flex: 1;
	}

	.form-item__select {
		width: 56rpx;
		display: flex;
		justify-content: center;
	}

	/* 空状态 */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12rpx;
		padding: 50rpx 24rpx;
		color: #cbd5e1;
		text-align: center;
	}

	.empty-text {
		font-size: 28rpx;
		color: #64748b;
		font-weight: 600;
	}

	.empty-tip {
		font-size: 24rpx;
		color: #9aa8b6;
	}

	/* 底部导航 */
	.acceptance-navigation {
		background: $white;
		border-top: 1rpx solid $line;
		padding: 18rpx 24rpx;
		box-shadow: 0 -2rpx 10rpx rgba(16, 24, 40, .06);
	}

	.nav-buttons {
		display: flex;
		justify-content: space-between;
		align-items: center;
		max-width: 1200rpx;
		margin: 0 auto;
	}

	/* 弹窗 */
	.modal {
		background: $white;
		border-radius: 20rpx;
		width: 86vw;
		max-width: 620rpx;
		overflow: hidden;
		box-shadow: 0 18rpx 52rpx rgba(15, 23, 42, .18);
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 24rpx;
		border-bottom: 1rpx solid #eff3f7;
	}

	.modal-title {
		font-size: 30rpx;
		color: $ink;
		font-weight: 700;
	}

	.modal-close {
		width: 44rpx;
		height: 44rpx;
		border-radius: 10rpx;
		background: transparent;
		border: 1rpx solid #eef2f6;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.modal-body {
		padding: 24rpx;
	}

	.modal-description {
		font-size: 24rpx;
		color: $muted;
		margin-bottom: 14rpx;
		display: block;
	}

	.draft-textarea {
		width: 100%;
		min-height: 360rpx;
		padding: 16rpx;
		border: 1rpx solid #e6ebf1;
		border-radius: $radius;
		font-size: 26rpx;
		line-height: 1.5;
		background: #fafafa;
		box-sizing: border-box;
	}

	.modal-actions {
		display: flex;
		gap: 12rpx;
		padding: 0 24rpx 24rpx;
		justify-content: flex-end;
	}

	.fieldwork-textarea {
		width: 100%;
		min-height: 200rpx;
		padding: 16rpx;
		border: 1rpx solid #e6ebf1;
		border-radius: $radius;
		font-size: 26rpx;
		line-height: 1.5;
		background: $white;
		box-sizing: border-box;
	}

	.update-confirm {
		padding: 20rpx;
		background: #f8fafc;
		border-radius: $radius;
		border: 1rpx solid #e9edf2;
	}

	.update-label {
		font-size: 26rpx;
		color: $ink;
		font-weight: 600;
		margin-bottom: 16rpx;
		display: block;
	}

	.update-actions {
		display: flex;
		gap: 12rpx;
	}

	.action-buttons {
		display: flex;
		gap: 8rpx;
		justify-content: center;
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
		color: $ink;
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
		color: $muted;
	}

	.generation-actions {
		display: flex;
		gap: 12rpx;
		flex-wrap: wrap;
	}

	.report-preview {
		padding: 24rpx;
		background: #f0fdf4;
		border-radius: $radius;
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
		color: $brand;
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

	/* 宽度工具类 */
	.w80 {
		min-width: 120rpx;
		max-width: 120rpx;
	}

	.w100 {
		min-width: 140rpx;
		max-width: 140rpx;
	}

	.w120 {
		min-width: 160rpx;
		max-width: 160rpx;
	}

	.w140 {
		min-width: 200rpx;
		max-width: 200rpx;
	}

	.w160 {
		min-width: 260rpx;
		max-width: 260rpx;
	}

	.w200 {
		min-width: 320rpx;
		max-width: 320rpx;
	}

	/* 响应式（小屏） */
	@media (max-width: 768px) {
		.pw-ico {
			width: 140rpx;
			height: 64rpx;
			border: none;
			display: flex;
			align-items: center;
			justify-content: center;
			background: $white;
			margin: 5rpx 0 0rpx 0;

		}

		.pw-ico text {
			font-size: 22rpx;
		}

		.toolbar-content {
			flex-direction: column;
			gap: 16rpx;
		}

		.toolbar-left,
		.toolbar-right {
			width: 100%;
		}

		.toolbar-buttons {
			width: 100%;
			overflow-x: auto;
			padding-bottom: 6rpx;
		}

		.acceptance-content {
			padding: 16rpx;
		}

		.section-header {
			padding: 20rpx 20rpx 0;
		}

		.section-body {
			padding: 0 20rpx 20rpx;
		}

		.form-grid--base {
			grid-template-columns: 1fr;
			gap: 10rpx;
		}

		.form-item__label {
			width: 160rpx;
			min-width: 140rpx;
			font-weight: 600;
			font-size: 28rpx;
		}

		.form-item__title {
			width: 160rpx;
			min-width: 140rpx;
		}

		/* 表格卡片化：自动加标签（无须改模板） */
		.table-header {
			display: none;
		}

		.table-row {
			display: grid;
			grid-template-columns: 1fr;
			border-bottom: 1rpx solid #f1f5f9;
			padding: 10rpx 8rpx;
			gap: 0;
		}

		.table-td {
			position: relative;
			padding: 14rpx 14rpx 14rpx 120rpx;
			border-right: none;
			border-bottom: 1rpx solid #f7f8fa;
			min-height: 64rpx;
		}

		.table-td:last-child {
			border-bottom: none;
		}

		/* 用 nth-child 给出列标题（与 header 顺序一致） */
		.table-row .table-td:nth-child(1)::before {
			content: '字段';
		}

		.table-row .table-td:nth-child(2)::before {
			content: '当前值';
		}

		.table-row .table-td:nth-child(3)::before {
			content: '类型';
		}

		.table-row .table-td:nth-child(4)::before {
			content: '状态';
		}

		.table-row .table-td:nth-child(5)::before {
			content: '操作';
		}

		.table-td::before {
			position: absolute;
			left: 14rpx;
			top: 50%;
			transform: translateY(-50%);
			font-size: 24rpx;
			color: #6b7a8a;
			font-weight: 600;
			width: 96rpx;
			text-align-last: justify;
		}

		/* 简化型行（标识牌）不需要五列标签 */
		.table-row--simple .table-td {
			padding: 14rpx;
		}

		.table-row--simple .table-td::before {
			content: '';
			display: none;
		}

		.acceptance-navigation {
			padding: 16rpx;
		}

		.modal {
			width: 92vw;
		}

		.update-actions {
			flex-direction: column;
		}

		.generation-actions {
			flex-direction: column;
		}

		.radio-group {
			flex-direction: column;
			gap: 12rpx;
		}

		.action-buttons {
			flex-wrap: wrap;
			justify-content: flex-start;
		}

	}

	/* 桌面端：移除突兀 hover 色，保持轻影与对比 */
	@media (min-width: 769px) {
		.btn--primary:hover {
			box-shadow: 0 6rpx 16rpx rgba(22, 101, 52, .28);
		}

		.btn--secondary:hover {
			background: #eef6f2;
			border-color: #d7efe4;
		}

		.btn--ghost:hover {
			background: #f7f9fb;
		}

		.btn--danger:hover {
			box-shadow: 0 6rpx 16rpx rgba(217, 45, 32, .25);
		}

		.step-item:hover {
			background: #f7fafc;
		}

		.icon-btn:hover {
			background: #f3f6fa;
		}
	}
</style>