<template>
	<app-layout current="pages/reports/acceptance/index">
		<view class="acceptance-page">
			<!-- 顶部工具栏 -->
			<view class="acceptance-toolbar">
				<view class="toolbar-content">
					<view class="toolbar-left">
						<view class="progress-section" aria-label="完成度">
							<text class="progress-label">完成度</text>
							<view class="progress-bar" role="progressbar" :aria-valuenow="completionPercent"
								aria-valuemin="0" aria-valuemax="100">
								<view class="progress-fill" :style="{ width: completionPercent + '%' }"></view>
							</view>
							<text class="progress-text">{{ completionPercent }}%</text>
						</view>
					</view>

					<view class="toolbar-right">
						<view class="toolbar-buttons">
							<button class="btn btn--ghost" @tap="saveDraft">
								<uni-icons type="folder" size="16" color="#5b6b7b" />
								<text>保存草稿</text>
							</button>
							<button class="btn btn--ghost" @tap="openExportDraft">
								<uni-icons type="upload" size="16" color="#5b6b7b" />
								<text>导出草稿</text>
							</button>
							<button class="btn btn--ghost" @tap="openImportDraft">
								<uni-icons type="download" size="16" color="#5b6b7b" />
								<text>导入草稿</text>
							</button>
							<button class="btn btn--danger-ghost" @tap="clearDraft">
								<uni-icons type="trash" size="16" color="#d92d20" />
								<text>清空草稿</text>
							</button>
							<button class="btn btn--secondary" @tap="exportDocx">
								<uni-icons type="file" size="16" color="#155e3b" />
								<text>导出Word</text>
							</button>
							<button class="btn btn--primary" @tap="exportPdf">
								<uni-icons type="pdf" size="16" color="#ffffff" />
								<text>导出PDF</text>
							</button>
						</view>
					</view>
				</view>
			</view>

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
								<uni-icons type="cloud-upload" size="20" color="#166534" />
								<text class="section-title">资料上传</text>
							</view>
							<view class="section-body">
								<view class="form-group">
									<text class="form-label">请上传环评报告书/报告表/批复文件等</text>
									<text class="form-tip">支持 PDF、Word、图片等格式，最多 6 个文件</text>
									<uni-file-picker v-model="eiaFiles" fileMediatype="all" :auto-upload="false"
										:limit="6">
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
										<view class="form-item" v-for="(r, idx) in baseTable" :key="r.id">
											<view class="form-item__row">
												<text class="form-item__label">{{ r.label }}</text>
												<uni-easyinput class="form-item__input" v-model="r.value"
													placeholder="请输入具体的值" />
												<view v-if="selectMode" class="form-item__select">
													<checkbox :checked="selectedIds.includes(r.id)"
														@tap="() => toggleSelected(r.id)" />
												</view>
											</view>
										</view>
									</view>

									<!-- 标识牌文案预生成 -->
									<view class="subsection">
										<view class="subsection-head">
											<uni-icons type="list" size="18" color="#fb923c" />
											<text class="subsection-title">排污标识牌信息（业主确认排污口信息无误）</text>
										</view>

										<view class="section-actions">
											<button class="btn btn--primary"
												@tap="() => { generateSignboard(); showSignboardStep1 = true }">
												<uni-icons type="eye-filled" size="16" color="#ffffff" />
												<text>生成标识牌信息</text>
											</button>
											<button v-if="showSignboardStep1" class="btn btn--primary"
												@tap="currentStep = 2">
												<uni-icons type="redo-filled" size="16" color="#ffffff" />
												<text>生成检测方案</text>
											</button>
										</view>

										<view v-if="showSignboardStep1" class="data-table">
											<view class="table-body">
												<template v-for="(sec, si) in signboard.sections" :key="'s'+si">
													<view class="table-row table-row--simple">
														<text
															class="table-td table-td--section">{{ sec.block || '未命名' }}</text>
														<view class="table-td w80">
															<button class="icon-btn" @tap="() => addSignItem(si)">
																<uni-icons type="plus" size="26" color="#166534" />
															</button>
														</view>
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
									<text class="empty-tip">点击上方“生成提资单”按钮创建</text>
								</view>
							</view>
						</view>
					</view>

					<!-- 其他步骤（结构不变，样式沿用上面规范） -->
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

	<!-- 草稿导入/导出弹窗 -->
	<uni-popup ref="draftPopup" type="center" background-color="rgba(0,0,0,0.5)">
		<view class="modal">
			<view class="modal-header">
				<text class="modal-title">{{ draftMode === 'export' ? '导出草稿' : '导入草稿' }}</text>
				<button class="modal-close" @tap="closeDraftPopup">
					<uni-icons type="close" size="20" color="#5b6b7b" />
				</button>
			</view>
			<view class="modal-body">
				<text class="modal-description">
					{{ draftMode === 'export' ? '复制以下 JSON 数据以保存草稿' : '粘贴 JSON 数据以导入草稿' }}
				</text>
				<textarea class="draft-textarea" v-model="draftText" placeholder="在此处粘贴/查看 JSON 数据..."
					:readonly="draftMode === 'export'" />
			</view>
			<view class="modal-actions">
				<button class="btn btn--ghost" @tap="closeDraftPopup">取消</button>
				<button v-if="draftMode==='import'" class="btn btn--primary" @tap="confirmImportDraft">
					确认导入
				</button>
				<button v-else class="btn btn--primary" @tap="copyExportDraft">
					复制到剪贴板
				</button>
			</view>
		</view>
	</uni-popup>

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

	const navTitle = navTitleStore()
	onShow(() => navTitle.setTitle('验收报告'))

	const {
		isMobile
	} = usePlatformInfo()

	const stepNames = ['项目基本信息', '提资单比对',  '监测方案', '生成竣工验收报告']
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

	// 0. 上传与提取
	const eiaFiles = ref([])

	function simulateExtract() {
		const now = Date.now()
		baseTable.value = [
			// 基本信息
			{
				id: now + 101,
				section: '基本信息',
				label: '建设项目名称',
				value: '',
				unit: '',
				source: 'extract',
				required: true,
				status: 'pending'
			},
			{
				id: now + 102,
				section: '基本信息',
				label: '建设单位名称',
				value: '',
				unit: '',
				source: 'extract',
				required: true,
				status: 'pending'
			},
			{
				id: now + 103,
				section: '基本信息',
				label: '建设项目性质',
				value: '新建 / 改扩建 / 技改 / 迁建（勾选其一）',
				unit: '',
				source: 'extract',
				required: true,
				status: 'pending'
			},
			{
				id: now + 104,
				section: '基本信息',
				label: '建设地点',
				value: 'XX（中心经纬度：）',
				unit: '',
				source: 'extract',
				required: true,
				status: 'pending'
			},
			{
				id: now + 105,
				section: '基本信息',
				label: '经度',
				value: '',
				unit: '°',
				source: 'extract',
				required: false,
				status: 'pending'
			},
			{
				id: now + 106,
				section: '基本信息',
				label: '纬度',
				value: '',
				unit: '°',
				source: 'extract',
				required: false,
				status: 'pending'
			},

			// 产品与能力
			{
				id: now + 201,
				section: '产品及产能',
				label: '产品及产能',
				value: '（可直接使用环评中的产品产能表粘贴）',
				unit: '',
				source: 'extract',
				required: true,
				status: 'pending'
			},

			// 审批及编制信息
			{
				id: now + 301,
				section: '环评信息',
				label: '环评报表审批部门',
				value: '广州市生态环境局',
				unit: '',
				source: 'extract',
				required: true,
				status: 'pending'
			},
			{
				id: now + 302,
				section: '环评信息',
				label: '环评报告表编制单位',
				value: '',
				unit: '',
				source: 'extract',
				required: true,
				status: 'pending'
			},

			// 投资概算
			{
				id: now + 401,
				section: '投资概算',
				label: '投资总概算',
				value: '',
				unit: '万元',
				source: 'extract',
				required: true,
				status: 'pending'
			},
			{
				id: now + 402,
				section: '投资概算',
				label: '环保投资总概算',
				value: '',
				unit: '万元',
				source: 'extract',
				required: true,
				status: 'pending'
			},
			{
				id: now + 403,
				section: '投资概算',
				label: '环保投资比例',
				value: '',
				unit: '%',
				source: 'extract',
				required: false,
				status: 'pending'
			},

			// 建设内容与工艺
			{
				id: now + 501,
				section: '建设内容',
				label: '主要建设内容',
				value: '（可将环评内主要建设内容段落复制粘贴）',
				unit: '',
				source: 'extract',
				required: true,
				status: 'pending'
			},
			{
				id: now + 502,
				section: '建设内容',
				label: '改扩建项目变动情况',
				value: '（改扩建前后工程组成、产能变化的总览）',
				unit: '',
				source: 'extract',
				required: false,
				status: 'pending'
			},
			{
				id: now + 503,
				section: '建设内容',
				label: '生产工艺',
				value: '（可粘贴简化工艺流程/文字说明）',
				unit: '',
				source: 'extract',
				required: true,
				status: 'pending'
			},

			// 污染物产生情况（按你图中提示，允许直接粘贴表格）
			{
				id: now + 601,
				section: '污染物产生情况',
				label: '水污染物（产生环节/污染物名/治理措施/排放去向/执行标准）',
				value: '（可将环评里的水污染物表格粘贴在此）',
				unit: '',
				source: 'extract',
				required: true,
				status: 'pending'
			},
			{
				id: now + 602,
				section: '污染物产生情况',
				label: '大气污染物（产生环节/污染物名/治理措施/排放去向/执行标准）',
				value: '（可将环评里的大气污染物表格粘贴在此）',
				unit: '',
				source: 'extract',
				required: true,
				status: 'pending'
			},

			// 噪声与固废
			{
				id: now + 701,
				section: '环境标准',
				label: '噪声执行标准',
				value: '（填写相应标准，如 GB 12348 等，并注明类别限值）',
				unit: '',
				source: 'extract',
				required: true,
				status: 'pending'
			},
			{
				id: now + 702,
				section: '固体废物',
				label: '固体废物产生情况',
				value: '（可将环评里的固体废物表格粘贴过来）',
				unit: '',
				source: 'extract',
				required: true,
				status: 'pending'
			},
		]
		extractionOk.value = true
		uni.showToast({
			title: `提取完成（示例 ${baseTable.value.length} 项）`,
			icon: 'success'
		})
	}
	const extractionOk = ref(false)
	const showSignboardStep1 = ref(false)

	// 校验与完成度
	function stepDone(i) {
		switch (i) {
			case 0:
				return extractionOk.value;
			default:
				return false
		}
	}

	function saveDraft() {
		uni.showToast({
			title: '草稿已保存',
			icon: 'success'
		})
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

	function confirmImportDraft() {
		try {
			draftPopup.value?.close?.();
			uni.showToast({
				title: '导入完成',
				icon: 'success'
			})
		} catch (e) {
			uni.showToast({
				title: 'JSON 不合法',
				icon: 'none'
			})
		}
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

	// 1. 信息表/提资单
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

	// 选择删除基本详细项
	function removeSelected() {
		if (!selectedIds.value.length) {
			uni.showToast({
				title: '未选择',
				icon: 'none'
			})
			return
		}

		// 找到被选中的字段名（用于展示）
		const names = baseTable.value
			.filter(r => selectedIds.value.includes(r.id))
			.map(r => (r.label || '（未命名）').trim())

		// 预览文案（单项与多项分别处理，长列表做截断）
		const preview =
			names.length === 1 ?
			`确认要删除「${names[0]}」吗？` :
			(() => {
				const max = 8 // 预览最多展示8条，避免弹窗太长
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
					// 执行删除
					baseTable.value = baseTable.value.filter(
						r => !selectedIds.value.includes(r.id)
					)
					// 收尾：退出选择模式并清空选中
					selectedIds.value = []
					selectMode.value = false

					uni.showToast({
						title: `已删除 ${names.length} 项`,
						icon: 'none'
					})
				} else {
					// 取消不做处理，可选给个轻提示
					// uni.showToast({ title: '已取消', icon: 'none' })
				}
			}
		})
	}

	// 2/3/4/5/6（保持原逻辑）
	const ownerFiles = ref([]);
	const missingList = ref([]);
	const conflictList = ref([])

	function simulateOwnerCompare() {
		const missing = baseTable.value.filter(r => r.required && !r.value).map(r => ({
			id: r.id + 'm',
			label: r.label,
			desc: '资料缺失，需业主补充',

		}));
		const conflicts = baseTable.value.filter(r => r.value && r.status !== 'verified').slice(0, 3).map(r => ({
			id: r.id + 'c',
			label: r.label,
			system: r.value,
			owner: '',
			resolution: 'system'
		}));
		missingList.value = missing;
		conflictList.value = conflicts;
		uni.showToast({
			title: '比对完成（示例）',
			icon: 'none'
		})
	}

	const devices = ref([]);
	const outlets = ref([]);
	const diffs = ref([])
	const outletTypes = [{
		value: 'wastewater',
		text: '废水总排口'
	}, {
		value: 'organized',
		text: '有组织废气'
	}, {
		value: 'fugitive',
		text: '无组织废气'
	}]

	function addDevice() {
		devices.value.push({
			id: Date.now() + Math.random(),
			name: '',
			count: '',
			spec: '',
			location: ''
		})
	}

	function removeDevice(i) {
		devices.value.splice(i, 1)
	}

	function addOutlet() {
		outlets.value.push({
			id: Date.now() + Math.random(),
			code: '',
			type: '',
			location: '',
			standard: '',
			permitLimit: ''
		})
	}

	function removeOutlet(i) {
		outlets.value.splice(i, 1)
	}

	function simulateDiff() {
		const d = devices.value[0];
		const list = [];
		if (d) list.push({
			id: d.id + 'd',
			category: '设备',
			field: d.name || '设备',
			fromEia: (d.count || '3'),
			fromSite: String(Number(d.count || '3') + 1),
			fromOwner: '',
			result: '现场较环评+1 台'
		});
		const o = outlets.value[0];
		if (o) list.push({
			id: o.id + 'o',
			category: '排放口',
			field: o.code || '排放口',
			fromEia: o.location,
			fromSite: o.location,
			fromOwner: '',
			result: '一致'
		});
		diffs.value = list;
		uni.showToast({
			title: '差异分析完成（示例）',
			icon: 'none'
		})
	}

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
		}]
	})

	function generateSignboard() {
		const unit = findBaseValue('单位名称') || findBaseValue('项目名称') || '';
		signboard.sections.forEach(sec => {
			const item = sec.items.find(i => i.title.includes('单位名称'));
			if (item) item.content = unit
		});
		uni.showToast({
			title: '已生成文案（示例）',
			icon: 'none'
		})
	}

	// 导出标识牌Word文档
	function exportSignboardWord() {
		// 检查是否有内容
		const hasContent = signboard.sections.some(sec => 
			sec.items.some(it => it.content && it.content.trim())
		);
		
		if (!hasContent) {
			uni.showToast({
				title: '标识牌内容为空，请先填写',
				icon: 'none'
			});
			return;
		}

		// 构建Word文档内容（简化版，实际需要后端支持）
		let content = '排污标识牌文案\n\n';
		signboard.sections.forEach(sec => {
			content += `【${sec.block}】\n`;
			sec.items.forEach(it => {
				if (it.title && it.content) {
					content += `${it.title}：${it.content}\n`;
				}
			});
			content += '\n';
		});

		// 这里需要调用后端API生成Word文档
		// 临时方案：复制到剪贴板或显示提示
		uni.showModal({
			title: '导出标识牌Word',
			content: '此功能需要后端支持。当前可以：\n1. 复制文案到剪贴板\n2. 等待后端接口开发完成',
			confirmText: '复制文案',
			cancelText: '取消',
			success: (res) => {
				if (res.confirm) {
					try {
						/* #ifdef H5 */
						navigator.clipboard?.writeText?.(content);
						/* #endif */
						/* #ifndef H5 */
						uni.setClipboardData({
							data: content
						});
						/* #endif */
						uni.showToast({
							title: '已复制到剪贴板',
							icon: 'success'
						});
					} catch (e) {
						uni.showToast({
							title: '复制失败',
							icon: 'none'
						});
					}
				}
			}
		});
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

	const plan = ref([])

	function recommendPlan() {
		const hasWW = outlets.value.some(o => o.type === 'wastewater');
		const hasWA = outlets.value.some(o => o.type === 'organized' || o.type === 'fugitive');
		const now = Date.now();
		if (hasWW) plan.value.push({
			id: now + 1,
			factor: 'COD',
			point: '废水总排口',
			method: 'GB/T 11914-2020',
			frequency: '3天×2次/天',
			qaqc: '平行/空白',
			remark: ''
		});
		if (hasWA) plan.value.push({
			id: now + 2,
			factor: '颗粒物',
			point: '下风向',
			method: 'HJ 836-2017',
			frequency: '2天×2次/天',
			qaqc: '平行',
			remark: ''
		});
		if (!hasWW && !hasWA) plan.value.push({
			id: now + 3,
			factor: '噪声',
			point: '厂界四角',
			method: 'GB 12348-2008',
			frequency: '昼/夜各1次',
			qaqc: '',
			remark: ''
		});
		uni.showToast({
			title: '已推荐方案（示例）',
			icon: 'none'
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
			title: '待后端提供模板',
			icon: 'none'
		})
	}

	function generateFinal() {
		const issues = validateAllSteps();
		if (!issues.length) {
			uni.showToast({
				title: '可生成（占位）',
				icon: 'none'
			});
			return
		}
		const count = issues.reduce((s, it) => s + it.messages.length, 0);
		uni.showToast({
			title: `仍有 ${count} 项待完善`,
			icon: 'none'
		})
	}

	function preflight(type) {
		const issues = validateAllSteps();
		if (!issues.length) {
			uni.showToast({
				title: `可导出${type}（待后端）`,
				icon: 'none'
			});
			return
		}
		const count = issues.reduce((s, it) => s + it.messages.length, 0);
		const first = issues[0];
		const msg = `共 ${count} 项待补充，涉及：` + issues.map(it => `${stepNames[it.step]}(${it.messages.length})`).join('，');
		uni.showModal({
			title: '预检查提示',
			content: msg,
			confirmText: '去完善',
			cancelText: '继续导出',
			success: (res) => {
				if (res.confirm) {
					currentStep.value = first.step
				} else {
					uni.showToast({
						title: `模拟导出${type}，待对接`,
						icon: 'none'
					})
				}
			}
		})
	}
	const preflightSummary = computed(() => {
		const xs = validateAllSteps();
		if (!xs.length) return '已满足生成条件（示例）。';
		return xs.map(it => `· ${stepNames[it.step]}：${it.messages.join('，')}`).join('\n')
	})

	function validateStep(i) {
		const misses = [];
		if (i === 0) {
			if (!eiaFiles.value.length && !extractionOk.value) misses.push('上传至少1个文件或使用示例提取')
		} else if (i === 1) {
			if (!baseTable.value.length) misses.push('未生成项目信息表')
		} else if (i === 3) {
			if (!devices.value.length && !outlets.value.length) misses.push('请完善设备或排放口')
		} else if (i === 4) {
			if (!signboard.sections.some(sec => sec.items.some(it => it.content))) misses.push('标识牌至少填写一项内容')
		} else if (i === 5) {
			if (!plan.value.length) misses.push('请新增或推荐至少1条方案')
		}
		return misses
	}

	function validateAllSteps() {
		const issues = [];
		for (let i = 0; i < stepNames.length; i++) {
			const m = validateStep(i);
			if (m.length) issues.push({
				step: i,
				messages: m
			})
		}
		return issues
	}

	const completionPercent = computed(() => {
		let total = 0,
			done = 0
		total += 1;
		if (extractionOk.value) done += 1
		total += 1;
		if (baseTable.value.length > 0) done += 1
		total += 1;
		done += 1
		const pct = Math.round((done / Math.max(total, 7)) * 100)
		return Math.min(100, Math.max(0, pct))
	})
	onLoad(() => {})
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

	/* 顶部工具栏 */
	.acceptance-toolbar {
		background: $white;
		border-bottom: 1rpx solid $line;
		box-shadow: $shadow-sm;
		padding: 20rpx 28rpx;
	}

	.toolbar-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 24rpx;
	}

	.toolbar-left {
		display: flex;
		align-items: center;
		gap: 20rpx;
	}

	.progress-section {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.progress-label {
		font-size: 26rpx;
		color: $muted;
	}

	.progress-bar {
		width: 220rpx;
		height: 8rpx;
		background: #edf1f5;
		border-radius: 999rpx;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, $brand, $brand-600);
		transition: width .25s ease;
	}

	.progress-text {
		font-size: 24rpx;
		color: $brand;
		font-weight: 600;
		min-width: 60rpx;
		text-align: right;
	}

	.toolbar-right {
		flex: 1;
		display: flex;
		justify-content: flex-end;
	}

	.toolbar-buttons {
		display: flex;
		align-items: center;
		gap: 12rpx;
		flex-wrap: wrap;
	}

	/* 统一按钮体系 */
	.btn {
		display: flex;
		align-items: center;
		gap: 8rpx;
		padding: 0 22rpx;
		height: 64rpx;
		border-radius: $radius;
		font-size: 24rpx;
		font-weight: 500;
		border: 1rpx solid transparent;
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
		grid-template-columns: 160rpx 1fr 140rpx 120rpx 100rpx;
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
		grid-template-columns: 160rpx 1fr 140rpx 120rpx 100rpx;
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

	/* 标识牌：左侧标题输入，固定宽度以避免与值重叠 */
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

	/* 宽度工具类 */
	.w80 {
		// min-width: 120rpx;
		// max-width: 120rpx;
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