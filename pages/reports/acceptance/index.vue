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
					<!-- 步骤1: 选择项目 -->
					<view v-show="currentStep === 0" class="content-section">
						<view class="section-card">
							<view class="section-header">
								<uni-icons type="folder" size="20" color="#166534" />
								<text class="section-title">选择项目</text>
							</view>
							<view class="section-body">
								<!-- 项目选择 -->
								<view class="form-group">
									<text class="form-label">请选择要进行竣工验收的项目</text>
									<text class="form-tip">项目文件已在项目管理模块上传并自动处理</text>

									<!-- 自定义项目选择器触发按钮 -->
									<view class="project-selector" @tap="openProjectPicker">
										<view class="selector-content">
											<view v-if="selectedProject" class="selected-project">
												<uni-icons type="folder" size="20" color="#166534" />
												<view class="project-info">
													<text class="project-name">{{ selectedProject.name }}</text>
													<text v-if="selectedProject.description" class="project-desc">
														{{ selectedProject.description }}
													</text>
												</view>
											</view>
											<view v-else class="placeholder">
												<uni-icons type="folder-add" size="20" color="#9ca3af" />
												<text class="placeholder-text">请选择项目</text>
											</view>
										</view>
										<uni-icons type="down" size="16" color="#6b7280" />
									</view>
								</view>

								<!-- 项目文件列表（只读） -->
								<view v-if="selectedProjectId && projectFiles.length > 0" class="subsection">
									<view class="subsection-head">
										<uni-icons type="paperclip" size="18" color="#166534" />
										<text class="subsection-title">项目文件列表（{{ projectFiles.length }} 个文件）</text>
									</view>

									<view class="file-list">
										<view v-for="file in projectFiles" :key="file.document_id" class="file-item">
											<view class="file-info">
												<uni-icons :type="getFileIcon(file.file_extension)" size="20"
													color="#166534" />
												<view class="file-details">
													<text class="file-name">{{ file.filename }}</text>
													<text class="file-meta">
														{{ formatFileSize(file.size_bytes) }} ·
														{{ formatFileStatus(file.status) }}
													</text>
												</view>
											</view>
											<view class="file-status">
												<text class="status-badge" :class="getStatusClass(file.status)">
													{{ getStatusText(file.status) }}
												</text>
											</view>
										</view>
									</view>
								</view>

								<!-- 空状态提示 -->
								<view v-else-if="selectedProjectId && projectFiles.length === 0" class="empty-state">
									<uni-icons type="folder-add" size="48" color="#cbd5e1" />
									<text class="empty-text">该项目暂无文件</text>
									<text class="empty-tip">请先在项目管理模块上传文件</text>
								</view>

								<view class="action-row">
									<button class="btn btn--primary" @tap="simulateExtract"
										:disabled="!selectedProjectId || projectFiles.length === 0">
										<uni-icons type="search" size="16" color="#ffffff" />
										<text>提取项目基本信息</text>
									</button>

									<!-- 清除缓存按钮（只在有缓存数据时显示） -->
									<button v-if="baseTable.length > 0" class="btn btn--ghost" @tap="clearProjectCache">
										<uni-icons type="trash" size="16" color="#dc2626" />
										<text>清除缓存</text>
									</button>
								</view>

								<!-- 项目信息表和标识牌信息 -->
								<view v-if="baseTable.length" class="subsection">
									<view class="subsection-head">
										<uni-icons type="list" size="18" color="#166534" />
										<text class="subsection-title">项目信息表</text>
									</view>

									<view class="section-actions">
										<button class="btn btn--ghost" @tap="openAddBase">
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

									<!-- 项目信息表 -->
									<view class="form-grid form-grid--base">
										<view class="form-item" v-for="(item, idx) in baseTable" :key="item.id">
											<!-- 污染物表格特殊渲染 -->
											<view v-if="item.id === 'pollutants_emission' && item.type === 'table'"
												class="pollutants-container">
												<view class="pollutants_baseinfo_row">
													<text class="form-item__label">
														{{ item.label }}
														<text v-if="item.source === 'extracted'"
															class="extract-tag">已提取</text>
													</text>
												</view>

												<!-- 污染物表格 -->
												<view class="pollutants-table">
													<!-- 表格头部 -->
													<view class="pollutants-header">
														<view class="pollutants-col pollutants-col--type">污染物类型</view>
														<!-- <view class="pollutants-col pollutants-col--link">产生时间</view> -->
														<view class="pollutants-col pollutants-col--name">污染物名称</view>
														<view class="pollutants-col pollutants-col--name">污染因子</view>
														<view class="pollutants-col pollutants-col--measure">污染治理措施
														</view>
														<view class="pollutants-col pollutants-col--direction">排放去向
														</view>
														<view class="pollutants-col pollutants-col--standard">执行标准
														</view>
													</view>

													<!-- 表格内容 -->
													<view class="pollutants-body">
														<!-- 水污染物 -->
														<view v-if="item.value.水污染物 && item.value.水污染物.length"
															v-for="(water, index) in item.value.水污染物"
															:key="'water-' + index" class="pollutants-row">
															<view class="pollutants-col pollutants-col--type">水污染物
															</view>
															<!-- <view class="pollutants-col pollutants-col--link">
																{{ water.产生环节 || '未提取到相关信息' }}
															</view> -->
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
															<view class="pollutants-col pollutants-col--type">大气污染物
															</view>
															<!-- <view class="pollutants-col pollutants-col--link">
																{{ air.产生环节 || '未提取到相关信息' }}
															</view> -->
															<view class="pollutants-col pollutants-col--name">
																{{ air.污染物名称 || '未提取到相关信息' }}
															</view>
															<view class="pollutants-col pollutants-col--name">
																{{ air.污染因子 || '未提取到污染因子' }}
															</view>
															<view class="pollutants-col pollutants-col--measure">
																{{ air.污染治理措施 || '未提取到相关信息' }}
															</view>
															<view class="pollutants-col pollutants-col--direction">
																{{ air.排放去向 || '未提取到相关信息' }}
															</view>
															<view class="pollutants-col pollutants-col--standard">
																{{ air.执行标准 || '未提取到相关信息' }}
															</view>
														</view>

														<!-- 噪声 -->
														<view v-if="item.value.噪声 && item.value.噪声.length"
															v-for="(noise, index) in item.value.噪声"
															:key="'noise-' + index" class="pollutants-row">
															<view class="pollutants-col pollutants-col--type">噪声</view>
															<!-- <view class="pollutants-col pollutants-col--link">
																{{ noise.产生环节 || '未提取到相关信息' }}
															</view> -->
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
											<view v-if="item.id === 'pollutants_emission' && item.type === 'table'"
												class="pollutants-container">
												<view class="pollutants_baseinfo_row">
													<text class="form-item__label">
														固体废物产生情况
														<text v-if="item.source === 'extracted'"
															class="extract-tag">已提取</text>
													</text>
												</view>

												<!-- 危废污染物表格 -->
												<view class="pollutants-table">
													<!-- 表格头部 -->
													<view class="pollutants-header">
														<view class="pollutants-col pollutants-col--type">废物类型</view>
														<!-- <view class="pollutants-col pollutants-col--link">产生时间</view> -->
														<view class="pollutants-col pollutants-col--link">废物来源</view>
														<view class="pollutants-col pollutants-col--name">废物名称</view>
														<view class="pollutants-col pollutants-col--measure">危险特性
														</view>
														<view class="pollutants-col pollutants-col--direction">危险废物类别
														</view>
														<view class="pollutants-col pollutants-col--direction">污染治理措施
														</view>
													</view>

													<!-- 表格内容 -->
													<view class="pollutants-body">
														<!-- 固体废物 -->
														<view v-if="item.value.固体废物 && item.value.固体废物.length"
															v-for="(solid, index) in item.value.固体废物"
															:key="'solid-' + index" class="pollutants-row">
															<view class="pollutants-col pollutants-col--type">固体废物
															</view>
															<!-- <view class="pollutants-col pollutants-col--link">
																{{ solid.产生环节 || '无' }}
															</view> -->
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
														<view v-if="item.value.危险废物"
															v-for="(solid, index) in [item.value.危险废物]"
															:key="'hazard-' + index" class="pollutants-row">
															<view class="pollutants-col pollutants-col--type">危险废物
															</view>
															<!-- <view class="pollutants-col pollutants-col--link">
																{{ item.value.危险废物.产生环节 || '无' }}
															</view> -->
															<view class="pollutants-col pollutants-col--link">
																{{ item.value.危险废物.废物来源 || '无' }}
															</view>
															<view class="pollutants-col pollutants-col--name">
																{{ item.value.危险废物.废物名称 || '无' }}
															</view>
															<view class="pollutants-col pollutants-col--measure">
																{{ item.value.危险废物.危险特性 || '无' }}
															</view>
															<view class="pollutants-col pollutants-col--direction">
																{{ item.value.危险废物.危险废物类别 || '无' }}
															</view>
															<view class="pollutants-col pollutants-col--direction">
																{{ item.value.危险废物.污染治理措施 || '无' }}
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

									<!-- 标识牌信息生成 -->
									<view class="subsection">
										<view class="subsection-head">
											<uni-icons type="list" size="18" color="#fb923c" />
											<text class="subsection-title">排污标识牌（下载与业主确认排污口信息）</text>
										</view>

										<view class="section-actions">
											<button class="btn btn--primary"
												@tap="() => { generateSignboard(); showSignboard = true }">
												<uni-icons type="eye-filled" size="16" color="#ffffff" />
												<text>标识牌信息</text>
											</button>
											<button v-if="showSignboard" class="btn btn--primary" @tap="downBiaoShi">
												<uni-icons type="download-filled" size="16" color="#ffffff" />
												<text>下载</text>
											</button>
											<button v-if="showSignboard" class="btn btn--primary"
												@tap="currentStep = 1">
												<uni-icons type="redo-filled" size="16" color="#ffffff" />
												<text>生成监测方案</text>
											</button>
										</view>

										<!-- 标识牌信息列表 -->
										<view v-if="showSignboard" class="data-table">
											<view class="table-body">
												<template v-for="(sec, si) in signboard.sections" :key="'s'+si">
													<view class="table-row table-row--simple">
														<text class="table-td table-td--section">{{ sec.block }}

														</text>
														<!-- 只有噪声才可以新增 -->
														<button v-if="sec.block == '噪声'" class="pw-ico icon-btn"
															@tap="() => addSignItem(si)">
															<uni-icons type="plus" size="16" color="#166534" />
															<text>新增</text>
														</button>
													</view>
													<view class="form-grid form-grid--base">
														<!-- 按组渲染，每组 3 条，除了危废以外 -->
														<template
															v-for="(group, gi) in groupItems(sec.items, sec.block)"
															:key="'g'+si+'-'+gi">
															<!-- 普通 3 条 -->
															<view class="form-item" v-for="(it, ii) in group"
																:key="'r'+si+'-'+gi+'-'+ii">
																<view class="form-item__row">
																	<uni-easyinput v-model="it.title"
																		placeholder="内容标题" />
																	<uni-easyinput v-model="it.content"
																		placeholder="请输入具体的值" />
																</view>
															</view>

															<!-- 删除按钮：只有「非危险废物」才显示 -->
															<view v-if="sec.block !== '危险废物'" class="form-item"
																style="margin-bottom:12px;">
																<view class="form-item__row"
																	style="justify-content:flex-end;">
																	<button class="icon-btn icon-btn--danger"
																		@tap="() => removeGroup(sec, gi)">
																		<uni-icons type="trash" size="16"
																			color="#d92d20" />
																	</button>
																</view>
															</view>
														</template>
													</view>
												</template>
											</view>
										</view>
									</view>
								</view>
							</view>
						</view>
					</view>

					<!-- 步骤1: 监测方案 -->
					<view v-show="currentStep === 1" class="content-section">
						<view class="section-card">
							<view class="section-header">
								<uni-icons type="eye" size="20" color="#166534" />
								<text class="section-title">监测方案</text>
							</view>
							<view class="section-body">
								<view class="empty-state">
									<uni-icons type="eye" size="48" color="#cbd5e1" />
									<text class="empty-text">AI帮您制定监测方案</text>
									<text class="empty-tip">请点击下方按钮为您生成智能检测方案</text>
								</view>

								<view class="action-row">
									<button class="btn btn--primary" @tap="saveMonitorPlan">
										<uni-icons type="cloud-download-filled" size="16" color="#ffffff" />
										<text>生成监测方案</text>
									</button>
								</view>

								<view v-if="plan" class="paln-preview">
									<view class="preview-header">
										<uni-icons type="checkmark-circle" size="18" color="#166534" />
										<text class="preview-title">环保验收监测方案已为您已生成！</text>
									</view>
									<view class="preview-content">
										<text class="preview-text">环保验收监测方案已生成，包含以下内容：</text>
										<view class="preview-sections">
											<text class="section-item">• 项目基本情况</text>
											<text class="section-item">• 环保设施建设情况</text>
											<text class="section-item">• 污染物详细情况</text>
											<text class="section-item">• 方案已下载，到文件保存位置查看</text>
										</view>
									</view>
								</view>

							</view>
						</view>
					</view>


					<!-- 步骤2: 提资单比对 -->
					<view v-show="currentStep === 2" class="content-section">
						<!-- 环保资料提交管理系统界面 -->
						<view class="tizidan-container">
							<view class="tizidan-header">
								<text class="tizidan-title">环保资料提交管理系统</text>
								<text class="tizidan-subtitle">请按要求提交相关环保资料</text>
							</view>

							<!-- 加载失败提示 -->
							<view v-if="tizidanItems.length === 0" class="empty-state">
								<uni-icons type="refresh" size="48" color="#cbd5e1" />
								<text class="empty-text">加载失败，请重新刷新！</text>
								<button class="btn btn--primary" @tap="fetchTizidanData">
									<uni-icons type="refresh" size="16" color="#ffffff" />
									<text>重新加载</text>
								</button>
							</view>

							<!-- 正常内容 -->
							<view v-else class="tizidan-content">
								<view v-for="(item, index) in tizidanItems" :key="index" class="tizidan-item-card">
									<view class="tizidan-item-content">
										<text class="tizidan-item-number">{{ index + 1 }}.</text>
										<text class="tizidan-item-text">{{ item.text }}</text>
									</view>

									<view class="tizidan-item-status">
										<text class="tizidan-status-text"
											:class="item.submitted ? 'tizidan-submitted' : 'tizidan-unsubmitted'">
											{{ item.submitted ? '已提交' : '未提交' }}
										</text>

										<button v-if="!item.submitted" class="tizidan-submit-btn"
											@click="submitTizidanItem(index)">
											提交
										</button>
									</view>
								</view>
							</view>

							<view class="tizidan-footer">
								<text class="tizidan-footer-text">请确保所有资料完整准确</text>
								<button class="btn btn--primary"
									@tap="downloadFile(downloadUrls.acceptance_report, '验收报告提资单.docx')"
									:disabled="!downloadUrls.acceptance_report">
									下载验收报告提资单
								</button>
								<button class="btn btn--secondary"
									@tap="downloadFile(downloadUrls.comparison_list, '建设内容详细对比清单.docx')"
									:disabled="!downloadUrls.comparison_list">
									下载建设内容详细对比清单
								</button>
							</view>

						</view>
					</view>

					<!-- 步骤3: 现场踏勘比对 -->
					<view v-show="currentStep === 3" class="content-section">
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

					<!-- 步骤4: 竣工验收报告 -->
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
											<text class="option-label"> 上传监测报告</text>
											<uni-file-picker v-model="testReportFiles" fileMediatype="all"
												:auto-upload="false" :limit="3">
											</uni-file-picker>
										</view>
									</view>

									<view class="generation-actions">
										<button class="btn btn--primary" @tap="generateAcceptanceReport">
											<uni-icons type="cloud-download-filled" size="16" color="#ffffff" />
											<text>生成验收报告</text>
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
				<button class="btn btn--ghost" @tap="closeBaseInfo">取消</button>
				<button class="btn btn--primary" @tap="confirmAddBaseInfo">确定</button>
			</view>
		</view>
	</uni-popup>

	<!-- 任务进度弹窗 -->
	<TaskProgressModal ref="taskProgressModal" :title="taskProgressTitle" :progress="taskProgress"
		:statusText="taskStatusText" :state="taskState" :cancelable="false" />

	<!-- 项目选择弹窗 -->
	<uni-popup ref="projectPickerPopup" type="center" :mask-click="true">
		<view class="project-picker-modal">
			<view class="picker-header">
				<text class="picker-title">选择项目</text>
				<view class="picker-close" @tap="closeProjectPicker">
					<uni-icons type="close" size="20" color="#6b7280" />
				</view>
			</view>

			<!-- 搜索框 -->
			<view class="picker-search">
				<uni-easyinput v-model="projectSearchKeyword" placeholder="搜索项目名称..." prefixIcon="search"
					:clearable="true" @input="onSearchInput" />
			</view>

			<!-- 项目统计 -->
			<view class="picker-stats">
				<text class="stats-text">
					共 {{ filteredProjects.length }} 个项目
					<text v-if="projectSearchKeyword" class="stats-highlight">
						（搜索结果）
					</text>
				</text>
			</view>

			<!-- 项目列表 -->
			<scroll-view class="picker-list" scroll-y>
				<view v-for="project in filteredProjects" :key="project.id" class="picker-item"
					:class="{ 'picker-item--active': selectedProjectId === project.id }" @tap="selectProject(project)">
					<view class="picker-item-icon">
						<uni-icons type="folder" size="22" :color="selectedProjectId === project.id ? '#166534' : '#6b7280'" />
					</view>
					<view class="picker-item-content">
						<text class="picker-item-name">{{ project.name }}</text>
						<text v-if="project.description" class="picker-item-desc">
							{{ project.description }}
						</text>
						<view v-if="project.folder_name" class="picker-item-meta">
							<uni-icons type="calendar" size="14" color="#9ca3af" />
							<text class="meta-text">{{ project.folder_name }}</text>
						</view>
					</view>
					<view class="picker-item-action">
						<view v-if="selectedProjectId === project.id" class="selected-badge">
							<uni-icons type="checkmarkempty" size="18" color="#ffffff" />
						</view>
						<uni-icons v-else type="right" size="16" color="#d1d5db" />
					</view>
				</view>

				<!-- 空状态 -->
				<view v-if="filteredProjects.length === 0" class="picker-empty">
					<uni-icons type="search" size="48" color="#cbd5e1" />
					<text class="picker-empty-text">
						{{ projectSearchKeyword ? '未找到匹配的项目' : '暂无项目' }}
					</text>
					<text v-if="projectSearchKeyword" class="picker-empty-tip">
						试试其他关键词或清空搜索
					</text>
				</view>
			</scroll-view>
		</view>
	</uni-popup>
</template>

<script setup>
	import {
		ref,
		reactive,
		computed,
		nextTick,
		watch,
		onUnmounted
	} from 'vue'
	import {
		usePlatformInfo
	} from '@/utils/platform'
	import AppLayout from '@/components/layout/AppLayout.vue'
	import {
		onShow,
		onLoad
	} from '@dcloudio/uni-app'
	import TaskProgressModal from '@/components/message-pop-up/TaskProgressModal.vue'
	import {
		navTitleStore
	} from '@/stores/navTitle.js'
	import {
		runTask,
		transformExtractResult,
		downloadSignboardWord,
		generateMonitorPlan,
		downloadMonitorPlan
	} from '@/api/acceptance.js'

	//手机端头部页面标题
	const navTitle = navTitleStore()
	onShow(() => navTitle.setTitle('环评项目竣工验收'))

	//手机页面规定
	const {
		isMobile
	} = usePlatformInfo()

	// 任务进度弹窗相关状态
	const taskProgressModal = ref(null)
	const taskProgressTitle = ref('信息提取中')
	const taskProgress = ref(0)
	const taskStatusText = ref('正在初始化...')
	const taskState = ref('running')


	// 每个步骤定义--------------------------
	// 步骤标题
	const stepNames = ['资料上传与基本信息', '监测方案', '提资单比对', '现场踏勘比对', '竣工验收报告']

	// 默认从第一步开始(0)
	const currentStep = ref(0)

	// 手机端步骤选择
	const stepNamesDisplay = computed(() => stepNames.map((n, i) => stepDone(i) ? (n + ' ✓') : n))
	const stepSelectOptions = computed(() => stepNames.map((n, i) => ({
		text: stepDone(i) ? (n + ' ✓') : n,
		value: i
	})))

	// 步骤更改时
	function onStepChange(e) {
		const idx = Number(e?.currentIndex ?? e?.detail?.currentIndex ?? 0);
		if (!Number.isNaN(idx)) currentStep.value = idx
	}

	// 上一步按钮
	function prevStep() {
		if (currentStep.value > 0) currentStep.value -= 1
	}
	// 下一步按钮
	function nextStep() {
		if (currentStep.value < stepNames.length - 1) currentStep.value += 1
	}

	// 步骤完成值
	const extractionOk = ref(false)

	// 所有步骤的完成度
	function stepDone(i) {
		switch (i) {
			case 0:
				return extractionOk.value;
			case 1:
				return datasheet.value.length > 0;
			case 2:
				return tizidanItems.value.some(item => item.submitted);
			case 3:
				return fieldworkComparison.value.length > 0;
			case 4:
				return reportGenerated.value;
			default:
				return false
		}
	}

	// 以下提取项目基本信息模块的方法--------------------------

	// 项目选择相关
	const selectedProjectId = ref(null) // 选中的项目ID
	const selectedProject = ref(null) // 选中的项目对象
	const projectList = ref([]) // 完整项目列表
	const projectFiles = ref([]) // 项目文件列表
	const projectSearchKeyword = ref('') // 搜索关键词
	const projectPickerPopup = ref(null) // 弹窗引用

	// 文件状态轮询相关
	const pollingTimer = ref(null) // 轮询定时器
	const isPolling = ref(false) // 是否正在轮询
	const pollingCount = ref(0) // 轮询次数
	const MAX_POLLING_COUNT = 100 // 最多轮询100次（约5分钟）
	const POLLING_INTERVAL = 3000 // 轮询间隔（3秒）

	// 过滤后的项目列表（根据搜索关键词）
	const filteredProjects = computed(() => {
		if (!projectSearchKeyword.value) {
			return projectList.value
		}
		const keyword = projectSearchKeyword.value.toLowerCase().trim()
		return projectList.value.filter(project => {
			const name = (project.name || '').toLowerCase()
			const desc = (project.description || '').toLowerCase()
			const folder = (project.folder_name || '').toLowerCase()
			return name.includes(keyword) || desc.includes(keyword) || folder.includes(keyword)
		})
	})

	// 打开项目选择器弹窗
	function openProjectPicker() {
		if (projectList.value.length === 0) {
			uni.showToast({
				title: '暂无项目，请先创建项目',
				icon: 'none'
			})
			return
		}
		projectSearchKeyword.value = '' // 清空搜索
		projectPickerPopup.value?.open()
	}

	// 关闭项目选择器弹窗
	function closeProjectPicker() {
		projectPickerPopup.value?.close()
	}

	// 选择项目
	async function selectProject(project) {
		selectedProjectId.value = project.id
		selectedProject.value = project
		console.log('选择项目:', project.name)

		// 保存到 localStorage，刷新后自动恢复
		try {
			localStorage.setItem('acceptance_selected_project_id', project.id.toString())
			console.log('✅ 已保存项目选择到本地存储')
		} catch (e) {
			console.warn('⚠️ 保存项目选择失败:', e)
		}

		// 关闭弹窗
		closeProjectPicker()

		// 停止之前的轮询（如果有）
		stopPolling()

		// 加载项目文件列表
		await loadProjectFiles(project.id)

		// 加载完成后，检查是否需要启动轮询
		startPollingFileStatus(project.id)

		// 加载该项目的缓存数据
		loadProjectCache(project.id)

		// 显示成功提示
		uni.showToast({
			title: `已选择：${project.name}`,
			icon: 'success',
			duration: 1500
		})
	}

	// 搜索输入处理
	function onSearchInput(e) {
		// 实时搜索，无需额外处理
		console.log('搜索关键词:', projectSearchKeyword.value)
	}

	// ========== 文件状态轮询功能 ==========

	// 检查是否有文件正在处理
	function hasProcessingFiles() {
		return projectFiles.value.some(file =>
			!['indexed', 'failed'].includes(file.status)
		)
	}

	// 开始轮询文件状态
	function startPollingFileStatus(projectId) {
		// 如果没有文件在处理，不需要轮询
		if (!hasProcessingFiles()) {
			console.log('✅ 所有文件已处理完成，无需轮询')
			return
		}

		// 防止重复轮询
		if (isPolling.value) {
			console.log('⚠️ 已在轮询中，跳过')
			return
		}

		isPolling.value = true
		pollingCount.value = 0

		const processingCount = projectFiles.value.filter(f =>
			!['indexed', 'failed'].includes(f.status)
		).length

		console.log(`🔄 开始轮询项目 ${projectId} 的文件状态...`)
		console.log(`   还有 ${processingCount} 个文件正在处理`)

		pollingTimer.value = setInterval(async () => {
			pollingCount.value++

			// 超过最大次数，停止轮询
			if (pollingCount.value > MAX_POLLING_COUNT) {
				console.log('⏰ 达到最大轮询次数，停止轮询')
				stopPolling()
				uni.showToast({
					title: '文件处理超时，请手动刷新',
					icon: 'none',
					duration: 2000
				})
				return
			}

			try {
				// 静默重新加载文件列表（不显示 loading）
				await loadProjectFiles(projectId, true)

				// 检查是否所有文件都处理完成
				if (!hasProcessingFiles()) {
					console.log('✅ 所有文件处理完成，停止轮询')
					stopPolling()

					// 显示成功提示
					uni.showToast({
						title: '文件处理完成',
						icon: 'success',
						duration: 2000
					})
				} else {
					// 统计处理中的文件
					const processing = projectFiles.value.filter(f =>
						!['indexed', 'failed'].includes(f.status)
					)
					console.log(`🔄 [轮询 ${pollingCount.value}] 还有 ${processing.length} 个文件正在处理...`)
				}
			} catch (error) {
				console.error('❌ 轮询文件状态失败:', error)
				// 不停止轮询，继续尝试
			}
		}, POLLING_INTERVAL)
	}

	// 停止轮询
	function stopPolling() {
		if (pollingTimer.value) {
			clearInterval(pollingTimer.value)
			pollingTimer.value = null
		}
		isPolling.value = false
		pollingCount.value = 0
		console.log('⏹️ 轮询已停止')
	}

	// 加载项目列表
	async function loadProjects() {
		try {
			const {
				getProjects
			} = await import('@/api/project.js')
			const response = await getProjects()

			projectList.value = response || []

			console.log('项目列表加载成功:', projectList.value.length, '个项目')
		} catch (error) {
			console.error('加载项目列表失败:', error)
			uni.showToast({
				title: '加载项目列表失败',
				icon: 'none'
			})
		}
	}



	// 加载项目文件列表
	async function loadProjectFiles(projectId, silent = false) {
		try {
			// 非静默模式显示 loading
			if (!silent) {
				uni.showLoading({
					title: '加载文件列表...',
					mask: true
				})
			}

			const {
				getProjectDocuments
			} = await import('@/api/project.js')
			const response = await getProjectDocuments(projectId)

			// 确保 projectFiles 始终是数组
			// 后端可能返回 { documents: [...], total: 10 } 或直接返回数组
			if (Array.isArray(response)) {
				projectFiles.value = response
			} else if (response && Array.isArray(response.documents)) {
				projectFiles.value = response.documents
			} else {
				projectFiles.value = []
			}

			console.log('项目文件列表:', projectFiles.value)

			if (!silent) {
				uni.hideLoading()

				if (projectFiles.value.length === 0) {
					uni.showToast({
						title: '该项目暂无文件',
						icon: 'none'
					})
				}
			}
		} catch (error) {
			console.error('加载项目文件失败:', error)
			if (!silent) {
				uni.hideLoading()
				uni.showToast({
					title: '加载文件列表失败',
					icon: 'none'
				})
			}
			projectFiles.value = [] // 确保出错时也是数组
		}
	}

	// 文件图标映射
	function getFileIcon(extension) {
		const ext = (extension || '').toLowerCase().replace('.', '')
		const iconMap = {
			'pdf': 'paperplane',
			'doc': 'compose',
			'docx': 'compose',
			'xls': 'bars',
			'xlsx': 'bars',
			'ppt': 'image',
			'pptx': 'image',
			'md': 'compose',
			'txt': 'compose',
			'jpg': 'image',
			'jpeg': 'image',
			'png': 'image',
			'gif': 'image'
		}
		return iconMap[ext] || 'paperclip'
	}

	// 格式化文件大小
	function formatFileSize(bytes) {
		if (!bytes) return '0 B'
		const k = 1024
		const sizes = ['B', 'KB', 'MB', 'GB']
		const i = Math.floor(Math.log(bytes) / Math.log(k))
		return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
	}

	// 格式化文件状态
	function formatFileStatus(status) {
		const statusMap = {
			'uploaded': '已上传',
			'converting': '转换中',
			'converted': '已转换',
			'vectorizing': '向量化中',
			'indexed': '已索引',
			'failed': '处理失败'
		}
		return statusMap[status] || status
	}

	// 获取状态文本
	function getStatusText(status) {
		const statusMap = {
			'uploaded': '已上传',
			'converting': '转换中',
			'converted': '已转换',
			'vectorizing': '处理中',
			'indexed': '✓ 已就绪',
			'failed': '失败'
		}
		return statusMap[status] || status
	}

	// 获取状态样式类
	function getStatusClass(status) {
		const classMap = {
			'uploaded': 'status-uploaded',
			'converting': 'status-processing',
			'converted': 'status-processing',
			'vectorizing': 'status-processing',
			'indexed': 'status-success',
			'failed': 'status-error'
		}
		return classMap[status] || ''
	}

	// 加载项目缓存数据
	function loadProjectCache(projectId) {
		if (!projectId) return

		const cacheKey = `project_base_info_${projectId}`
		const cachedData = uni.getStorageSync(cacheKey)

		if (cachedData) {
			try {
				baseTable.value = JSON.parse(cachedData)
				extractionOk.value = true
				console.log(`✅ 已加载项目 ${projectId} 的缓存数据`)

				uni.showToast({
					title: '已加载缓存数据',
					icon: 'success',
					duration: 1500
				})
			} catch (error) {
				console.error('解析缓存数据失败:', error)
				baseTable.value = []
				extractionOk.value = false
			}
		} else {
			// 没有缓存，清空数据
			baseTable.value = []
			extractionOk.value = false
			console.log(`ℹ️ 项目 ${projectId} 暂无缓存数据`)
		}
	}

	// 清除当前项目的缓存
	function clearProjectCache() {
		if (!selectedProjectId.value) {
			uni.showToast({
				title: '请先选择项目',
				icon: 'none'
			})
			return
		}

		uni.showModal({
			title: '清除缓存',
			content: '确定要清除当前项目的缓存数据吗？清除后需要重新提取信息。',
			success: (res) => {
				if (res.confirm) {
					const cacheKey = `project_base_info_${selectedProjectId.value}`
					uni.removeStorageSync(cacheKey)

					// 清空当前显示的数据
					baseTable.value = []
					extractionOk.value = false

					console.log(`🗑️ 已清除项目 ${selectedProjectId.value} 的缓存`)

					uni.showToast({
						title: '缓存已清除',
						icon: 'success'
					})
				}
			}
		})
	}

	// 页面加载时获取项目列表
	onLoad(async () => {
		await loadProjects()
		
		// 尝试恢复上次选择的项目
		try {
			const savedProjectId = localStorage.getItem('acceptance_selected_project_id')
			
			if (savedProjectId) {
				const projectId = parseInt(savedProjectId)
				const project = projectList.value.find(p => p.id === projectId)
				
				if (project) {
					console.log('🔄 恢复上次选择的项目:', project.name)
					// 自动选择该项目（不显示提示，静默恢复）
					selectedProjectId.value = project.id
					selectedProject.value = project
					
					// 加载项目文件列表
					await loadProjectFiles(project.id)
					
					// 启动轮询
					startPollingFileStatus(project.id)
					
					// 加载缓存
					loadProjectCache(project.id)
				} else {
					// 项目不存在，清除保存的ID
					console.log('⚠️ 上次选择的项目已不存在，清除保存的ID')
					localStorage.removeItem('acceptance_selected_project_id')
				}
			}
		} catch (e) {
			console.warn('⚠️ 恢复项目选择失败:', e)
		}
	})

	// 页面卸载时停止轮询
	onUnmounted(() => {
		stopPolling()
		console.log('📄 页面卸载，清理轮询定时器')
	})

	// 监听项目切换，停止旧项目的轮询
	watch(selectedProjectId, (newId, oldId) => {
		if (oldId && newId !== oldId) {
			stopPolling()
			console.log('🔄 切换项目，停止旧项目的轮询')
		}
	})

	const extracting = ref(false) // 提取状态
	const extractError = ref('') // 提取错误状态



	/* 提取信息的进度条 - 智能平滑进度版本（使用自定义弹窗）*/
	// 进度平滑处理
	let smoothProgressTimer = null
	let currentDisplayProgress = 0 // 当前显示的进度
	let targetProgress = 0 // 目标进度（后端返回的真实进度）
	let lastTargetProgress = 0 // 上一次的目标进度（用于检测是否真的更新了）
	let lastUpdateTime = 0 // 上次后端真正更新进度的时间

	// 平滑更新进度条（智能版 - 更新响应式变量）
	function updateProgressSmooth(newProgress, statusText, state = 'running') {
		// 检查进度是否真的变化了
		const progressChanged = newProgress !== lastTargetProgress

		// 更新目标进度和状态
		targetProgress = newProgress
		taskStatusText.value = statusText
		taskState.value = state

		// 只有进度真的变化了，才更新时间戳
		if (progressChanged) {
			lastUpdateTime = Date.now()
			lastTargetProgress = newProgress
			console.log(`[进度真实更新] ${newProgress}% - ${statusText}`)
		}

		// 如果没有平滑计时器，启动一个
		if (!smoothProgressTimer) {
			smoothProgressTimer = setInterval(() => {
				const now = Date.now()
				const timeSinceLastUpdate = now - lastUpdateTime // 距离上次真实更新的时间（毫秒）

				// 🎯 核心逻辑：智能增长
				if (currentDisplayProgress < targetProgress) {
					// 情况1：当前进度小于目标进度，快速追赶
					const diff = targetProgress - currentDisplayProgress
					const step = Math.max(0.5, diff / 10) // 最小0.5%，最大差值的1/10

					currentDisplayProgress = Math.min(
						currentDisplayProgress + step,
						targetProgress
					)
				} else if (currentDisplayProgress >= targetProgress && targetProgress < 100) {
					// 情况2：已经追上目标进度，但任务未完成

					// 如果后端超过5秒没更新（可能卡住了），缓慢增长给用户反馈
					if (timeSinceLastUpdate > 5000) {
						// 缓慢增长，但不超过目标进度+5%
						const maxAllowedProgress = Math.min(targetProgress + 5, 99)

						if (currentDisplayProgress < maxAllowedProgress) {
							// 每次增长0.1%，非常缓慢
							currentDisplayProgress += 0.1
							console.log(
								`[缓慢增长] 后端卡在 ${targetProgress}%，前端显示 ${Math.floor(currentDisplayProgress)}%`)
						}
					}
				}

				// 更新弹窗显示的进度
				taskProgress.value = Math.floor(currentDisplayProgress)

				// 如果已经达到目标且目标是100%，停止计时器
				if (currentDisplayProgress >= 99.9 && targetProgress >= 100) {
					clearInterval(smoothProgressTimer)
					smoothProgressTimer = null
					currentDisplayProgress = 100
					taskProgress.value = 100
					taskState.value = 'success'
					taskStatusText.value = '信息提取完成'

					// 1秒后关闭弹窗并显示成功提示
					setTimeout(() => {
						taskProgressModal.value?.close()
						uni.showToast({
							title: '信息提取完成',
							icon: 'success',
							duration: 2000
						})
					}, 1000)
				}
			}, 50) // 每50ms更新一次，保证平滑
		}
	}

	// 清理进度计时器
	function clearProgressTimer() {
		if (smoothProgressTimer) {
			clearInterval(smoothProgressTimer)
			smoothProgressTimer = null
		}
		currentDisplayProgress = 0
		targetProgress = 0
		lastTargetProgress = 0
		lastUpdateTime = 0
		taskProgress.value = 0
		taskStatusText.value = '正在初始化...'
		taskState.value = 'running'
	}

	// 提取信息到项目基本表（使用自定义进度弹窗）
	async function simulateExtract() {
		// 1. 前置检查：是否选择了项目
		if (!selectedProjectId.value) {
			uni.showModal({
				title: '提示',
				content: '请先选择一个项目',
				showCancel: false,
				confirmText: '知道了'
			})
			return
		}

		// 2. 检查项目是否有文件
		if (projectFiles.value.length === 0) {
			uni.showModal({
				title: '提示',
				content: '该项目暂无文件，请先在项目管理模块上传文件',
				showCancel: false,
				confirmText: '知道了'
			})
			return
		}

		// 3. 检查文件是否已索引（至少有一个文件状态为 indexed）
		const hasIndexedFiles = projectFiles.value.some(file => file.status === 'indexed')
		if (!hasIndexedFiles) {
			uni.showModal({
				title: '提示',
				content: '项目文件正在处理中，请稍后再试',
				showCancel: false,
				confirmText: '知道了'
			})
			return
		}

		extracting.value = true // 开始提取，按钮显示loading

		// 2. 清理之前的进度状态
		clearProgressTimer()

		// 3. 初始化弹窗状态并打开
		taskProgressTitle.value = '信息提取中'
		taskProgress.value = 0
		taskStatusText.value = '正在提交任务...'
		taskState.value = 'pending'
		taskProgressModal.value?.open()

		try {
			// 4. 调用后端异步任务，传入项目信息和进度回调
			console.log('准备提交任务，项目信息:')
			console.log('- projectId:', selectedProjectId.value)
			console.log('- selectedProject:', JSON.stringify(selectedProject.value, null, 2))
			console.log('- folder_name:', selectedProject.value?.folder_name)

			const result = await runTask({
				projectId: selectedProjectId.value,
				projectFolder: selectedProject.value.folder_name,
				// 进度回调函数：每次后端更新进度时调用
				onProgress: (progress, statusText, state) => {
					// 使用平滑进度更新（会自动更新响应式变量）
					updateProgressSmooth(progress, statusText, state)
				},
				pollInterval: 3000, // 每3秒轮询一次
				timeout: 1800000 // 30分钟超时
			})

			// 5. 任务完成，确保进度到100%
			updateProgressSmooth(100, '任务完成', 'success')

			// 6. 数据校验：确保后端真的返回了数据
			if (result?.status !== 'success' || !result.result) {
				throw new Error(result?.message || '提取失败：后端未返回有效数据')
			}

			// 7. 转换数据并填充表格（核心操作）
			baseTable.value = transformExtractResult(result.result)

			// 8. 缓存到本地（关键！使用项目ID作为key，每个项目独立缓存）
			const cacheKey = `project_base_info_${selectedProjectId.value}`
			uni.setStorageSync(cacheKey, JSON.stringify(baseTable.value))
			console.log(`✅ 项目 ${selectedProjectId.value} 的数据已缓存`)

			// 9. 标记提取完成
			extractionOk.value = true

		} catch (error) {
			// 错误时清除进度计时器并关闭弹窗
			clearProgressTimer()
			taskProgressModal.value?.close()

			// 10. 错误分类处理，给用户看得懂的提示
			console.error('[Extract] 提取失败:', error)

			if (error.message.includes('超时') || error.message.includes('timeout')) {
				uni.showModal({
					title: '提取超时了！',
					content: '任务执行时间过长，可能原因：\n1. 文档过大（建议<50MB）\n2. 网络不稳定\n3. 服务器繁忙\n\n建议稍后重试或联系管理员',
					showCancel: false,
					confirmText: '知道了'
				})
			} else if (error.message.includes('未提取到')) {
				uni.showModal({
					title: '提取失败',
					content: '文档中未找到项目信息，请检查：\n1. 文件是否为完整的环评报告\n2. 文件内容是否清晰可读\n3. 文件格式是否正确',
					showCancel: false,
					confirmText: '知道了'
				})
			} else if (error.message.includes('已有任务在运行')) {
				uni.showModal({
					title: '任务进行中',
					content: '您已有一个信息提取任务正在运行，请等待完成后再提交新任务',
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

	// 新增项目基本信息弹窗
	const newBaseInfoPopup = ref(null)

	// 新增项目基本信息的标题
	const newBaseInfoLabel = ref('')

	// 新增项目基本信息
	function openAddBase() {
		newBaseInfoLabel.value = '';
		newBaseInfoPopup.value?.open?.()
	}

	// 确认新增项目基本信息
	function confirmAddBaseInfo() {
		const label = (newBaseInfoLabel.value || '').trim();
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
		newBaseInfoPopup.value?.close?.()
	}

	// 关闭新增项目基本信息弹窗
	function closeBaseInfo() {
		newBaseInfoPopup.value?.close?.()
	}

	// 以下标识牌模块的方法--------------------------
	//展示标识牌列表
	const showSignboard = ref(false)

	// 标识牌模块名称以及列表信息
	const signboard = reactive({
		sections: [{
				block: '废水',
				items: [{
					title: '',
					content: ''
				}]
			},
			{
				block: '废气',
				items: [{
					title: '',
					content: ''
				}]
			},
			{
				block: '噪声',
				items: [{
					title: '',
					content: ''
				}]
			}, {
				block: '危险废物',
				items: [{
					title: '',
					content: ''
				}]
			}
		]
	})

	// 生成标识牌信息(从项目基本信息提取)
	function generateSignboard() {
		const unitName = findBaseValue('建设单位名称') || findBaseValue('单位名称') || '';
		const wfName = findBaseValue('危废名称') || findBaseValue('危废') || '';
		const emissionData = baseTable.value.find(x => x.id === 'pollutants_emission')?.value;

		if (!emissionData || typeof emissionData !== 'object') {
			uni.showToast({
				title: '未提取到污染物信息',
				icon: 'none'
			});
			return;
		}

		// 清空旧数据
		signboard.sections.forEach(sec => (sec.items = []));

		// 辅助函数：拆分排污口编号（处理"DA001、DA002、DA003"这种情况）
		function splitOutletCodes(codeStr) {
			if (!codeStr) return [];

			// 无效的排污口编号列表
			const invalidCodes = ['/', '信息待补充', ''];

			return codeStr
				.split(/[、,，]/) // 按顿号、逗号分隔
				.map(c => c.trim()) // 去除空格
				.filter(c => c && !invalidCodes.includes(c)); // 过滤无效编号
		}

		// 辅助函数：按排污口编号分组并合并污染物
		function groupByOutletCode(list, blockType) {
			const outletMap = new Map(); // key: 排污口编号, value: { pollutants: [], ...otherInfo }

			list.forEach(item => {
				const codes = splitOutletCodes(item['排污口编号']);
				const pollutantName = item['污染物名称'] || '';

				codes.forEach(code => {
					if (!outletMap.has(code)) {
						outletMap.set(code, {
							pollutants: [],
							otherInfo: item // 保存其他信息（如执行标准、排放去向等）
						});
					}
					// 合并污染物名称
					if (pollutantName) {
						outletMap.get(code).pollutants.push(pollutantName);
					}
				});
			});

			return outletMap;
		}

		// 废水
		const waterList = emissionData['水污染物'] || [];
		const waterOutlets = groupByOutletCode(waterList, '废水');
		waterOutlets.forEach((data, code) => {
			const pollutants = [...new Set(data.pollutants)].join('、'); // 去重并合并
			signboard.sections.find(s => s.block === '废水').items.push({
				title: '单位名称',
				content: unitName
			}, {
				title: '排放口编号',
				content: code
			}, {
				title: '污染物种类',
				content: pollutants
			});
		});

		// 废气
		const gasList = emissionData['大气污染物'] || [];
		const gasOutlets = groupByOutletCode(gasList, '废气');
		gasOutlets.forEach((data, code) => {
			const pollutants = [...new Set(data.pollutants)].join('、'); // 去重并合并
			signboard.sections.find(s => s.block === '废气').items.push({
				title: '单位名称',
				content: unitName
			}, {
				title: '排放口编号',
				content: code
			}, {
				title: '污染物种类',
				content: pollutants
			});
		});

		// 噪声
		const noiseList = emissionData['噪声'] || [];
		const noiseOutlets = groupByOutletCode(noiseList, '噪声');
		noiseOutlets.forEach((data, code) => {
			signboard.sections.find(s => s.block === '噪声').items.push({
				title: '单位名称',
				content: unitName
			}, {
				title: '排放口编号',
				content: code
			}, {
				title: '污染物种类',
				content: '设备噪声'
			});
		});

		// 辅助函数：提取危险废物类别代码（如 HW49、HW12）
		function extractHazardCodes(str) {
			if (!str) return '';
			// 提取所有 HW 开头的代码
			const matches = str.match(/HW\d+/g);
			if (!matches) return '';
			// 去重并用顿号连接
			return [...new Set(matches)].join('、');
		}

		// 辅助函数：提取危险特性中文描述（如 毒性、易燃性）
		function extractHazardProperties(str) {
			if (!str) return '';
			// 提取所有括号内的中文
			const matches = str.match(/（([^）]+)）/g);
			if (!matches) return '';
			// 提取括号内容，去重并用顿号连接
			const properties = matches.map(m => m.replace(/[（）]/g, ''));
			return [...new Set(properties)].join('、');
		}

		// 危险废物
		const hazardousWaste = emissionData['危险废物'] || {};
		const WFItems = [{
				title: '主要成分',
				content: extractHazardCodes(hazardousWaste['危险废物类别']) || 'HW49'
			},
			{
				title: '化学名称',
				content: hazardousWaste['废物名称'] || '实验室废弃物、实验室废水污泥、医疗废物、废活性炭'
			},
			{
				title: '危险情况',
				content: extractHazardProperties(hazardousWaste['危险特性']) || '毒性、腐蚀性'
			},
			{
				title: '安全措施',
				content: '接触时佩戴个人防护用品（全面罩/丁晴手套）'
			},
			{
				title: '废物产生单位',
				content: unitName
			},
			{
				title: '地址',
				content: findBaseValue('建设地点')
			},
			{
				title: '电话',
				content: findBaseValue('联系方式')
			},
			{
				title: '联系人',
				content: findBaseValue('单位联系人')
			},
		];
		signboard.sections.find(s => s.block === '危险废物').items = WFItems;

		uni.showToast({
			title: '已生成标识牌',
			icon: 'success'
		});
	}

	// 添加一组（3 项）排污标识牌（只允许噪声新增）
	function addSignItem(sectionIdx) {
		const sec = signboard.sections[sectionIdx];
		const block = sec.block; // 废水 / 废气 / 噪声
		const unitName = findBaseValue('建设单位名称') || findBaseValue('单位名称') || '';

		// 只允许噪声新增
		if (block !== '噪声') {
			uni.showToast({
				title: '只有噪声可以手动新增',
				icon: 'none'
			});
			return;
		}

		/* 计算下一个排放口编号：找到现有编号的最大值 + 1 */
		let maxNum = 0;
		// 每3项为一组，提取所有排放口编号
		for (let i = 0; i < sec.items.length; i += 3) {
			const codeItem = sec.items[i + 1]; // 第2项是排放口编号
			if (codeItem && codeItem.title === '排放口编号') {
				const code = codeItem.content || '';
				// 提取编号中的数字部分（如 ZS-01 -> 1, DW001 -> 1）
				const match = code.match(/\d+/);
				if (match) {
					const num = parseInt(match[0], 10);
					if (num > maxNum) maxNum = num;
				}
			}
		}

		// 生成新编号
		let code = '';
		if (block === '废水') code = `DW${String(maxNum + 1).padStart(3,'0')}`;
		else if (block === '废气') code = `DA${String(maxNum + 1).padStart(3,'0')}`;
		else if (block === '噪声') code = `ZS-${String(maxNum + 1).padStart(2,'0')}`;

		/* 组装一组 */
		const group = [{
				title: '单位名称',
				content: unitName
			},
			{
				title: '排放口编号',
				content: code
			},
			{
				title: '污染物种类',
				content: '设备噪声'
			}
		];

		/* 追加到当前块 */
		sec.items.push(...group);

		uni.showToast({
			title: '已添加新排污口',
			icon: 'success'
		});
	}

	// 按块决定是否 3 条一组
	function groupItems(items, block) {
		if (block === '危险废物') return [items]; // 整包
		const groups = [];
		for (let i = 0; i < items.length; i += 3) {
			groups.push(items.slice(i, i + 3));
		}
		return groups;
	}

	// 删除指定组标识牌信息（3 条）
	function removeGroup(section, groupIndex) {
		// 取本组排放口编号用于提示
		const start = groupIndex * 3;
		const codeItem = section.items.slice(start, start + 3)
			.find(it => it.title === '排放口编号');
		const code = codeItem?.content || '未知编号';

		uni.showModal({
			title: '永久删除',
			content: `确定删除排污口  ${code}  所有信息吗？`,
			confirmText: '确定',
			cancelText: '取消',
			success: (res) => {
				if (res.confirm) {
					section.items.splice(start, 3);
				}
			}
		});
	}

	// 从baseTable中提取基本信息
	function findBaseValue(label) {
		const r = baseTable.value.find(x => x.label === label);
		return r ? (r.value || '') : ''
		console.log("baseinfo", baseTable.value)
	}

	// 标识牌下载(数据json交给后端)
	function downBiaoShi() {
		// 检查是否选择了项目
		if (!selectedProjectId.value) {
			uni.showModal({
				title: '提示',
				content: '请先选择一个项目',
				showCancel: false
			})
			return
		}
		
		uni.showLoading({
			title: '正在生成文档…'
		});
		downloadSignboardWord(signboard, selectedProjectId.value)
			.then(buf => {
				const fileName = '排污标识牌.docx';
				// #ifdef H5
				const blob = new Blob([buf], {
					type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
				});
				const url = URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = '排污标识牌.docx';
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				URL.revokeObjectURL(url);
				// #endif

				// #ifdef MP-WEIXIN
				// 微信小程序：先写临时文件再打开预览
				const filePath = `${wx.env.USER_DATA_PATH}/${fileName}`;
				wx.getFileSystemManager().writeFile({
					filePath,
					data: buf,
					encoding: 'binary',
					success: () => wx.openDocument({
						filePath,
						fileType: 'docx'
					}),
					fail: e => uni.showToast({
						title: '保存失败',
						icon: 'error'
					})
				});
				// #endif

				// #ifdef APP-PLUS
				// App 端：保存到 downloads 目录
				plus.io.requestFileSystem(plus.io.PUBLIC_DOWNLOADS, fs => {
					const fileEntry = fs.root.getFile(fileName, {
						create: true
					}, entry => {
						entry.createWriter(writer => {
							writer.write(buf);
							writer.onwrite = () => uni.showToast({
								title: '已保存到下载目录'
							});
						});
					});
				});
				// #endif
			})
			.catch(err => {
				uni.showModal({
					content: err.message || '生成失败',
					showCancel: false
				});
			})
			.finally(() => uni.hideLoading());
	}


	// 以下监测方案模块的方法--------------------------
	const plan = ref(false)

	// 生成监测方案（异步任务模式）
	async function saveMonitorPlan() {
		// 1. 前置检查：是否选择了项目
		if (!selectedProjectId.value) {
			uni.showModal({
				title: '提示',
				content: '请先选择一个项目',
				showCancel: false,
				confirmText: '知道了'
			})
			return
		}

		// 2. 检查是否已提取项目信息
		if (!extractionOk.value || baseTable.value.length === 0) {
			uni.showModal({
				title: '提示',
				content: '请先提取项目基本信息',
				showCancel: false,
				confirmText: '知道了'
			})
			return
		}

		// 3. 清理之前的进度状态
		clearProgressTimer()

		// 4. 初始化弹窗状态并打开
		taskProgressTitle.value = '监测方案生成中'
		taskProgress.value = 0
		taskStatusText.value = '正在提交任务...'
		taskState.value = 'pending'
		taskProgressModal.value?.open()

		try {
			// 5. 调用后端异步任务
			console.log('提交监测方案生成任务，项目ID:', selectedProjectId.value)

			const result = await generateMonitorPlan({
				projectId: selectedProjectId.value,
				// 进度回调函数
				onProgress: (progress, statusText, state) => {
					updateProgressSmooth(progress, statusText, state)
				},
				pollInterval: 3000,
				timeout: 1800000  // 30分钟超时
			})

			// 6. 任务完成，确保进度到100%
			updateProgressSmooth(100, '生成完成', 'success')

			// 7. 下载文件
			console.log('✅ 监测方案生成完成，开始下载...')
			
			// 延迟1秒后下载，让用户看到100%
			setTimeout(async () => {
				try {
					const arrayBuffer = await downloadMonitorPlan(selectedProjectId.value, 'docx')
					
					// 保存文件
					await saveMonitorPlanFile(arrayBuffer)
					
					// 标记完成
					plan.value = true
					
					// 关闭进度弹窗
					taskProgressModal.value?.close()
					
					// 显示成功提示
					uni.showToast({
						title: '监测方案已下载',
						icon: 'success',
						duration: 2000
					})
				} catch (downloadError) {
					console.error('下载监测方案失败:', downloadError)
					taskProgressModal.value?.close()
					
					uni.showModal({
						title: '下载失败',
						content: downloadError.message || '文件下载失败，请稍后重试',
						showCancel: false
					})
				}
			}, 1000)

		} catch (error) {
			// 错误时清除进度计时器并关闭弹窗
			clearProgressTimer()
			taskProgressModal.value?.close()

			console.error('[MonitorPlan] 生成失败:', error)

			// 错误分类处理
			if (error.message.includes('超时') || error.message.includes('timeout')) {
				uni.showModal({
					title: '生成超时',
					content: '监测方案生成时间过长，可能原因：\n1. 项目数据较多\n2. 网络不稳定\n3. 服务器繁忙\n\n建议稍后重试',
					showCancel: false,
					confirmText: '知道了'
				})
			} else if (error.message.includes('已有一个监测方案生成任务正在运行')) {
				uni.showModal({
					title: '任务进行中',
					content: '您已有一个监测方案生成任务正在运行，请等待完成后再提交新任务',
					showCancel: false,
					confirmText: '知道了'
				})
			} else if (error.message.includes('项目提取结果文件不存在')) {
				uni.showModal({
					title: '生成失败',
					content: '未找到项目提取结果，请先提取项目基本信息',
					showCancel: false,
					confirmText: '知道了'
				})
			} else {
				uni.showModal({
					title: '生成失败',
					content: error.message || '监测方案生成失败，请稍后重试',
					showCancel: false,
					confirmText: '知道了'
				})
			}
		}
	}

	/**
	 * 保存监测方案文件到本地
	 * @param {ArrayBuffer} arrayBuffer - 文件二进制数据
	 */
	async function saveMonitorPlanFile(arrayBuffer) {
		// #ifdef H5
		// H5 环境：使用 Blob + a 标签下载
		const blob = new Blob([arrayBuffer], {
			type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
		})
		const url = window.URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = '监测方案.docx'
		document.body.appendChild(a)
		a.click()
		document.body.removeChild(a)
		window.URL.revokeObjectURL(url)
		// #endif

		// #ifndef H5
		// 小程序、App 环境：保存到本地文件系统
		return new Promise((resolve, reject) => {
			const fs = uni.getFileSystemManager()
			const fileName = '监测方案.docx'
			const filePath = `${wx.env.USER_DATA_PATH}/${fileName}`

			// 写入文件
			fs.writeFile({
				filePath: filePath,
				data: arrayBuffer,
				encoding: 'binary',
				success: () => {
					// 打开文档
					uni.openDocument({
						filePath: filePath,
						fileType: 'docx',
						success: () => resolve(),
						fail: (err) => {
							console.error('打开文档失败:', err)
							reject(new Error('文件已保存，但打开失败'))
						}
					})
				},
				fail: (err) => {
					console.error('保存文件失败:', err)
					reject(new Error('保存文件失败'))
				}
			})
		})
		// #endif
	}

	// 以下提资单比对的方法-modify by wilson-------------------------
	// 提资单数据
	const tizidanItems = ref([])
	const downloadUrls = ref({
		acceptance_report: '',
		comparison_list: ''
	})

	// 获取提资单数据
	// 在 fetchTizidanData 函数中修改下载URL的赋值逻辑
	// 在 fetchTizidanData 函数中修改URL处理逻辑
	async function fetchTizidanData() {

		try {
			uni.showLoading({
				title: '加载中...'
			})

			console.log('开始请求数据...')

			// 使用 Promise 包装 uni.request 以确保正确解析
			const response = await new Promise((resolve, reject) => {
				uni.request({
					url: 'http://172.16.1.61:8000/api/v1/completion/datasheet',
					method: 'GET',
					timeout: 10000,
					data: {
						memberId: 3,
					},
					success: (res) => {
						console.log('请求成功:', res)
						resolve(res)
					},
					fail: (err) => {
						console.log('请求失败:', err)
						reject(err)
					}
				})
			})

			console.log('完整响应对象:', response)
			console.log('响应状态码:', response.statusCode)
			console.log('响应数据:', response.data)

			// 检查返回结果
			if (response && response.statusCode === 200) {
				console.log('状态码为200，开始解析数据')

				// 确保 data 存在
				if (!response.data) {
					throw new Error('响应数据为空')
				}

				const data = response.data
				console.log('解析后的数据:', data)

				// 确保数据结构正确
				if (!data.items || !Array.isArray(data.items)) {
					throw new Error('数据格式不正确: items 不存在或不是数组')
				}

				tizidanItems.value = data.items
				downloadUrls.value = data.download_urls || {}

				console.log('最终设置的数据:', {
					items: tizidanItems.value,
					urls: downloadUrls.value
				})

				uni.showToast({
					title: '数据加载成功',
					icon: 'success'
				})
			} else {
				throw new Error(`请求失败，状态码：${response?.statusCode || '未知'}`)
			}
		} catch (error) {
			console.error('获取提资单数据失败:', error)
			// 显示加载失败提示
			uni.showToast({
				title: '加载失败，请重新刷新！',
				icon: 'none',
				duration: 3000
			})
			// 清空数据，显示加载失败状态
			tizidanItems.value = []
			downloadUrls.value = {
				acceptance_report: '',
				comparison_list: ''
			}
		} finally {
			uni.hideLoading()
		}
		try {
			uni.showLoading({
				title: '加载中...'
			})

			const response = await new Promise((resolve, reject) => {
				uni.request({
					url: 'http://127.0.0.1:8000/api/v1/completion/tzdDetail/datasheet',
					method: 'GET',
					timeout: 10000,
					data: {
						memberId: 3,
					},
					success: (res) => {
						console.log('请求成功:', res)
						resolve(res)
					},
					fail: (err) => {
						console.log('请求失败:', err)
						reject(err)
					}
				})
			})

			if (response && response.statusCode === 200) {
				const data = response.data

				if (!data.items || !Array.isArray(data.items)) {
					throw new Error('数据格式不正确: items 不存在或不是数组')
				}

				tizidanItems.value = data.items
				console.log("test", data.download_urls)
				// 处理下载URL，确保格式正确
				const downloadUrlsData = data.download_urls || {}
				downloadUrls.value = {
					acceptance_report: formatDownloadUrl(downloadUrlsData.tzd_doc),
					comparison_list: formatDownloadUrl(downloadUrlsData.comparison_list)
				}

				console.log('下载URL设置:', downloadUrls.value)

				uni.showToast({
					title: '数据加载成功',
					icon: 'success'
				})
			} else {
				throw new Error(`请求失败，状态码：${response?.statusCode || '未知'}`)
			}
		} catch (error) {
			console.error('获取提资单数据失败:', error)
			uni.showToast({
				title: '加载失败，请重新刷新！',
				icon: 'none',
				duration: 3000
			})
			tizidanItems.value = []
			downloadUrls.value = {
				acceptance_report: '',
				comparison_list: ''
			}
		} finally {
			uni.hideLoading()
		}
	}

	// 添加URL格式化函数，确保URL格式正确
	function formatDownloadUrl(url) {
		if (!url) return ''

		// 如果URL是相对路径，添加基础URL
		if (url.startsWith('/')) {
			return `http://127.0.0.1:8000${url}`
		}

		// 如果URL已经是完整路径，直接返回
		if (url.startsWith('http://') || url.startsWith('https://')) {
			return url
		}
		return url
	}
	// 下载提资对比清单

	// 修改下载文件函数，适配不同平台
	async function downloadFile(url, filename) {
		if (!url) {
			uni.showToast({
				title: '下载链接不存在',
				icon: 'none'
			})
			return
		}

		// 显示下载中提示
		uni.showLoading({
			title: '下载中...',
			mask: true
		})

		try {
			// #ifdef H5
			// H5环境：使用a标签下载
			await downloadFileH5(url, filename)
			// #endif

			// #ifdef MP-WEIXIN
			// 微信小程序环境
			await downloadFileWechat(url, filename)
			// #endif

			// #ifdef APP-PLUS
			// App环境
			await downloadFileApp(url, filename)
			// #endif

			uni.hideLoading()
			uni.showToast({
				title: '下载成功',
				icon: 'success'
			})

		} catch (error) {
			uni.hideLoading()
			console.error('下载失败:', error)
			uni.showToast({
				title: '下载失败: ' + (error.message || '未知错误'),
				icon: 'none',
				duration: 3000
			})
		}
	}

	// H5环境下载
	function downloadFileH5(url, filename) {
		return new Promise((resolve, reject) => {
			try {
				const a = document.createElement('a')
				a.href = url
				a.download = filename || 'download'
				a.style.display = 'none'

				document.body.appendChild(a)
				a.click()
				document.body.removeChild(a)

				// H5下载无法准确判断是否成功，延迟一下再resolve
				setTimeout(resolve, 1000)
			} catch (error) {
				reject(error)
			}
		})
	}

	// 微信小程序环境下载
	function downloadFileWechat(url, filename) {
		return new Promise((resolve, reject) => {
			uni.downloadFile({
				url: url,
				success: (res) => {
					if (res.statusCode === 200) {
						// 下载成功，保存到本地
						const filePath = res.tempFilePath
						uni.saveFile({
							tempFilePath: filePath,
							success: (saveRes) => {
								console.log('文件保存成功:', saveRes.savedFilePath)
								resolve(saveRes)
							},
							fail: (saveErr) => {
								reject(new Error('保存文件失败: ' + (saveErr.errMsg || '未知错误')))
							}
						})
					} else {
						reject(new Error(`下载失败，状态码: ${res.statusCode}`))
					}
				},
				fail: (err) => {
					reject(new Error('下载请求失败: ' + (err.errMsg || '未知错误')))
				}
			})
		})
	}

	// App环境下载
	function downloadFileApp(url, filename) {
		return new Promise((resolve, reject) => {
			uni.downloadFile({
				url: url,
				success: (res) => {
					if (res.statusCode === 200) {
						// 在App中，下载的文件会保存到系统下载目录
						// 可以提示用户查看下载目录
						resolve(res)
					} else {
						reject(new Error(`下载失败，状态码: ${res.statusCode}`))
					}
				},
				fail: (err) => {
					reject(new Error('下载请求失败: ' + (err.errMsg || '未知错误')))
				}
			})
		})
	}

	// 提交提资单项
	async function submitTizidanItem(index) {
		uni.showModal({
			title: '确认提交',
			content: '您确定要提交此项资料吗？',
			success: async (res) => {
				if (res.confirm) {
					try {
						uni.showLoading({
							title: '提交中...'
						})

						console.log('开始提交项目:', index, tizidanItems.value[index].text)

						// 使用 Promise 包装 uni.request
						const response = await new Promise((resolve, reject) => {
							uni.request({
								url: 'http://172.16.1.61:8000/api/v1/completion/submit-item',
								method: 'POST',
								header: {
									'Content-Type': 'application/json'
								},
								data: {
									item_index: index,
									item_text: tizidanItems.value[index].text
								},
								timeout: 10000,
								success: (res) => {
									console.log('提交响应:', res)
									resolve(res)
								},
								fail: (err) => {
									console.log('提交失败:', err)
									reject(err)
								}
							})
						})

						console.log('提交完整响应:', response)

						// 检查返回结果
						if (response && response.statusCode === 200) {
							if (response.data && response.data.success) {
								// 更新前端状态
								tizidanItems.value[index].submitted = true
								uni.showToast({
									title: '提交成功',
									icon: 'success',
									duration: 2000
								})
							} else {
								throw new Error(response.data.message || '提交失败')
							}
						} else {
							throw new Error(`提交失败，状态码：${response?.statusCode || '未知'}`)
						}
					} catch (error) {
						console.error('提交失败:', error)
						uni.showToast({
							title: '提交失败，请重试',
							icon: 'none'
						})
					} finally {
						uni.hideLoading()
					}
				}
			}
		})
	}


	// 监听步骤变化
	watch(currentStep, (newVal) => {
		if (newVal === 2) {
			// 进入提资单比对步骤时获取数据
			fetchTizidanData()
		}
	})








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



	// 4. 竣工验收报告
	const reportType = ref('withoutData')
	const testReportFiles = ref([])



	//选择有无监测方案报告
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

	// 切换报告类型
	function onReportTypeChange(e) {
		reportType.value = e.detail.value
	}

	// 验证有无上传环评报告
	function generateAcceptanceReport() {
		// 验证必要数据
		if (!eiaFiles.value.length) {
			uni.showToast({
				title: '请上传环评报告、批复文件等基本资料',
				icon: 'none'
			})
			return
		}

		if (reportType.value === 'withData' && !testReportFiles.value.length) {
			uni.showToast({
				title: '有监测数据报告，必须要先上传监测报告',
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








	// 在页面加载时，恢复基本信息表缓存
	// onLoad(() => {
	// 	const cached = uni.getStorageSync('project_base_info')
	// 	if (cached) {
	// 		try {
	// 			baseTable.value = JSON.parse(cached)
	// 			console.log('[Cache] 恢复缓存的项目信息，共', baseTable.value.length, '条')
	// 			// console.log('baseTable项目信息，', baseTable.value)
	// 		} catch (e) {
	// 			console.warn('[Cache] 缓存数据解析失败:', e)
	// 		}
	// 	}
	// })
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

	/* 自定义项目选择器触发按钮 */
	.project-selector {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 24rpx;
		background: $white;
		border: 2rpx solid #e5e7eb;
		border-radius: $radius;
		cursor: pointer;
		transition: all 0.2s ease;
		min-height: 100rpx;
	}

	.project-selector:active {
		background: #f9fafb;
		border-color: $brand;
	}

	.selector-content {
		flex: 1;
		min-width: 0;
	}

	.selected-project {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	.project-info {
		display: flex;
		flex-direction: column;
		gap: 6rpx;
		flex: 1;
		min-width: 0;
	}

	.project-name {
		font-size: 28rpx;
		color: $ink;
		font-weight: 600;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.project-desc {
		font-size: 24rpx;
		color: $muted;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.placeholder {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.placeholder-text {
		font-size: 28rpx;
		color: #9ca3af;
	}

	/* 项目选择器弹窗样式 */
	.project-picker-modal {
		width: 90vw;
		max-width: 700rpx;
		max-height: 80vh;
		background: $white;
		border-radius: 24rpx;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.15);
	}

	.picker-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 32rpx 32rpx 24rpx;
		border-bottom: 2rpx solid #f3f4f6;
		background: linear-gradient(135deg, #f8fafb 0%, #ffffff 100%);
	}

	.picker-title {
		font-size: 32rpx;
		color: $ink;
		font-weight: 700;
	}

	.picker-close {
		width: 48rpx;
		height: 48rpx;
		border-radius: 12rpx;
		background: #f3f4f6;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
	}

	.picker-close:active {
		background: #e5e7eb;
		transform: scale(0.95);
	}

	.picker-search {
		padding: 24rpx 32rpx;
		background: $white;
		border-bottom: 2rpx solid #f3f4f6;
	}

	.picker-stats {
		padding: 16rpx 32rpx;
		background: #f9fafb;
		border-bottom: 1rpx solid #e5e7eb;
	}

	.stats-text {
		font-size: 24rpx;
		color: $muted;
	}

	.stats-highlight {
		color: $brand;
		font-weight: 600;
	}

	.picker-list {
		flex: 1;
		min-height: 0;
		max-height: 60vh;
		padding: 16rpx 0;
	}

	.picker-item {
		display: flex;
		align-items: center;
		gap: 20rpx;
		padding: 24rpx 32rpx;
		margin: 0 16rpx 12rpx;
		background: $white;
		border: 2rpx solid #f3f4f6;
		border-radius: 16rpx;
		transition: all 0.2s ease;
		cursor: pointer;
	}

	.picker-item:active {
		transform: translateY(-2rpx);
		box-shadow: 0 8rpx 20rpx rgba(22, 101, 52, 0.08);
	}

	.picker-item--active {
		background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
		border-color: $brand;
		box-shadow: 0 4rpx 16rpx rgba(22, 101, 52, 0.12);
	}

	.picker-item-icon {
		flex-shrink: 0;
		width: 56rpx;
		height: 56rpx;
		border-radius: 12rpx;
		background: #f3f4f6;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.picker-item--active .picker-item-icon {
		background: linear-gradient(135deg, $brand 0%, $brand-600 100%);
	}

	.picker-item--active .picker-item-icon uni-icons {
		color: $white !important;
	}

	.picker-item-content {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 8rpx;
	}

	.picker-item-name {
		font-size: 28rpx;
		color: $ink;
		font-weight: 600;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.picker-item--active .picker-item-name {
		color: $brand;
	}

	.picker-item-desc {
		font-size: 24rpx;
		color: $muted;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.picker-item-meta {
		display: flex;
		align-items: center;
		gap: 8rpx;
		margin-top: 4rpx;
	}

	.meta-text {
		font-size: 22rpx;
		color: #9ca3af;
	}

	.picker-item-action {
		flex-shrink: 0;
	}

	.selected-badge {
		width: 40rpx;
		height: 40rpx;
		border-radius: 50%;
		background: linear-gradient(135deg, $brand 0%, $brand-600 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4rpx 12rpx rgba(22, 101, 52, 0.3);
	}

	.picker-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16rpx;
		padding: 80rpx 32rpx;
		text-align: center;
	}

	.picker-empty-text {
		font-size: 28rpx;
		color: #64748b;
		font-weight: 600;
	}

	.picker-empty-tip {
		font-size: 24rpx;
		color: #9ca3af;
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

	/* 项目文件列表样式 */
	.file-list {
		display: flex;
		flex-direction: column;
		gap: 24rpx;
		margin-top: 24rpx;
	}

	.file-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 24rpx;
		background: #f8fafb;
		border-radius: 16rpx;
		border: 2rpx solid #e5e9ed;
		transition: all 0.2s;
	}

	.file-item:hover {
		background: #f3f6f9;
		border-color: #d1dce5;
	}

	.file-info {
		display: flex;
		align-items: center;
		gap: 20rpx;
		flex: 1;
		min-width: 0;
	}

	.file-details {
		display: flex;
		flex-direction: column;
		gap: 8rpx;
		flex: 1;
		min-width: 0;
	}

	.file-name {
		font-size: 28rpx;
		color: #1f2937;
		font-weight: 500;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.file-meta {
		font-size: 24rpx;
		color: #6b7280;
	}

	.file-status {
		flex-shrink: 0;
		margin-left: 20rpx;
	}

	.status-badge {
		display: inline-block;
		padding: 8rpx 20rpx;
		border-radius: 24rpx;
		font-size: 24rpx;
		font-weight: 500;
		white-space: nowrap;
	}

	.status-uploaded {
		background: #e0f2fe;
		color: #0369a1;
	}

	.status-processing {
		background: #fef3c7;
		color: #d97706;
	}

	.status-success {
		background: #d1fae5;
		color: #065f46;
	}

	.status-error {
		background: #fee2e2;
		color: #dc2626;
	}


	/* 基本信息表：响应式行 */

	.form-grid--base {
		display: grid;
		// grid-template-columns: 1fr 1fr;
		gap: 12rpx 16rpx;
	}

	.pollutants_baseinfo_row {
		padding: 14rpx;
		border-bottom: 1rpx solid #e7ecf2;
	}

	.baseinfo__row {
		display: flex;
		align-items: center;
		gap: 10rpx;
		background: $white;
		border: 1rpx solid #e7ecf2;
		border-radius: $radius;
		padding: 14rpx;
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

	/* 污染物表格样式 */
	.pollutants-container {
		width: 100%;
		margin-bottom: 24rpx;
		border: 1rpx solid #e7ecf2;
		border-radius: $radius;
		overflow: hidden;
		grid-column: 1 / -1;
		/* 让表格占据整行 */
	}

	.pollutants-table {
		width: 100%;
		background: #fff;
		text-align: center;
	}

	/* 表格头部 */
	.pollutants-header {
		display: flex;
		background: #f8fafc;
		border-bottom: 1px solid #e5e7eb;
		font-weight: 600;
		font-size: 26rpx;
		color: #374151;
	}

	/* 表格行 */
	.pollutants-row {
		display: flex;
		border-bottom: 1px solid #f3f4f6;
	}

	.pollutants-row:last-child {
		border-bottom: none;
	}

	/* 表格列 */
	.pollutants-col {
		padding: 20rpx 12rpx;
		word-break: break-word;
		line-height: 1.5;
		font-size: 26rpx;
		border-right: 1px solid #f3f4f6;
	}

	.pollutants-col:last-child {
		border-right: none;
	}

	/* 列宽度分配 */
	.pollutants-col--type {
		flex: 0.8;
		min-width: 120rpx;
		background: #f0f9ff;
		color: #0369a1;
		font-weight: 500;
	}

	.pollutants-col--link {
		flex: 1.2;
		min-width: 150rpx;
	}

	.pollutants-col--name {
		flex: 1;
		min-width: 140rpx;
	}

	.pollutants-col--measure {
		flex: 1.5;
		min-width: 180rpx;
	}

	.pollutants-col--direction {
		flex: 1;
		min-width: 140rpx;
	}

	.pollutants-col--standard {
		flex: 1.2;
		min-width: 160rpx;
	}

	/* 表格选择框 */
	.pollutants-select {
		padding: 20rpx;
		border-top: 1px solid #e5e7eb;
		background: #fafafa;
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

	.paln-preview {
		padding: 24rpx;
		background: #f0fdf4;
		border-radius: $radius;
		border: 1rpx solid #dcfce7;
		margin-top: 20rpx;
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

	/* 提资单界面样式 */
	.tizidan-container {
		display: flex;
		flex-direction: column;
		min-height: 80vh;
		background-color: #ffffff;
		border-radius: 16rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
		overflow: hidden;
	}

	.tizidan-header {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 60rpx 40rpx;
		background: linear-gradient(135deg, #166534 0%, #17834a 100%);
		color: #ffffff;
		text-align: center;
	}

	.tizidan-title {
		font-size: 44rpx;
		font-weight: bold;
		margin-bottom: 16rpx;
	}

	.tizidan-subtitle {
		font-size: 32rpx;
		opacity: 0.9;
	}

	.tizidan-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 24rpx;
		padding: 40rpx;
	}

	.tizidan-item-card {
		display: flex;
		flex-direction: column;
		background-color: #f8fafc;
		border-radius: 16rpx;
		padding: 32rpx;
		border: 1rpx solid #e2e8f0;
		transition: all 0.3s ease;
	}

	.tizidan-item-card:hover {
		transform: translateY(-2rpx);
		box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
	}

	.tizidan-item-content {
		display: flex;
		margin-bottom: 20rpx;
	}

	.tizidan-item-number {
		font-size: 32rpx;
		font-weight: bold;
		color: #166534;
		margin-right: 16rpx;
		min-width: 50rpx;
	}

	.tizidan-item-text {
		font-size: 32rpx;
		color: #2d3748;
		line-height: 1.6;
		flex: 1;
	}

	.tizidan-item-status {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-top: 20rpx;
		border-top: 1rpx solid #e2e8f0;
	}

	.tizidan-status-text {
		font-size: 30rpx;
		font-weight: bold;
	}

	.tizidan-status-text.tizidan-submitted {
		color: #27ae60;
	}

	.tizidan-status-text.tizidan-unsubmitted {
		color: #e74c3c;
	}

	.tizidan-submit-btn {
		background-color: #3498db;
		color: #ffffff;
		border: none;
		border-radius: 10rpx;
		padding: 16rpx 32rpx;
		font-size: 28rpx;
		font-weight: 600;
		box-shadow: 0 2rpx 6rpx rgba(52, 152, 219, 0.3);
		transition: background-color 0.3s;
	}

	.tizidan-submit-btn:active {
		background-color: #2980b9;
	}

	.tizidan-footer {
		display: flex;
		flex-direction: column;
		gap: 24rpx;
		padding: 40rpx;
		background-color: #f8fafc;
		border-top: 1rpx solid #e2e8f0;
	}

	.tizidan-footer-text {
		font-size: 30rpx;
		color: #64748b;
		text-align: center;
		margin-bottom: 10rpx;
		font-weight: 600;
	}

	/* 响应式设计 - 移动端 */
	@media (max-width: 768px) {

		.file-item {
			flex-direction: column;
			align-items: flex-start;
			gap: 16rpx;
		}

		.file-status {
			margin-left: 0;
			align-self: flex-end;
		}

		// 项目基本信息表
		.baseinfo__row {
			display: block;
			width: 54%;
		}

		.pollutants-container {
			margin-bottom: 20rpx;
			width: 56.2%;
		}

		.pollutants-table {
			overflow-x: auto;
		}

		.solid-waste-table {
			overflow-x: auto;
		}


		.pollutants-header,
		.pollutants-row {
			min-width: 1200rpx;
			/* 保证表格有足够宽度可以横向滚动 */
		}

		.pollutants-col {
			padding: 16rpx 10rpx;
			font-size: 24rpx;
		}

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

		.tizidan-container {
			margin: 10rpx;
			border-radius: 12rpx;
		}

		.tizidan-header {
			padding: 30rpx 20rpx;
		}

		.tizidan-title {
			font-size: 32rpx;
		}

		.tizidan-subtitle {
			font-size: 26rpx;
		}

		.tizidan-content {
			padding: 20rpx;
			gap: 16rpx;
		}

		.tizidan-item-card {
			padding: 20rpx;
		}

		.tizidan-item-content {
			flex-direction: column;
		}

		.tizidan-item-number {
			margin-bottom: 8rpx;
			font-size: 28rpx;
		}

		.tizidan-item-text {
			font-size: 26rpx;
		}

		.tizidan-item-status {
			flex-direction: column;
			align-items: flex-start;
			gap: 12rpx;
		}

		.tizidan-status-text {
			font-size: 26rpx;
		}

		.tizidan-submit-btn {
			width: 100%;
			padding: 16rpx;
			font-size: 28rpx;
		}

		.tizidan-footer {
			padding: 24rpx 20rpx;
			gap: 16rpx;
		}

		.tizidan-footer-text {
			font-size: 26rpx;
		}

		.tizidan-footer .btn {
			width: 100%;
			margin: 0;
			justify-content: center;
		}
	}

	/* 平板端适配 */
	@media (min-width: 769px) and (max-width: 960px) {

		// 步骤导航
		.desktop-steps {
			display: block;
		}

		.step-connector {
			width: 0;
		}

		// 项目基本信息表
		.baseinfo__row {
			display: block;
			width: 50%;
		}

		.pollutants-container {
			margin-bottom: 20rpx;
			width: 52.2%;
		}

		.pollutants-table {
			overflow-x: auto;
		}

		.pollutants-header,
		.pollutants-row {
			min-width: 1200rpx;
			/* 保证表格有足够宽度可以横向滚动 */
		}

		.pollutants-col {
			padding: 16rpx 10rpx;
			font-size: 24rpx;
		}

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

		.tizidan-container {
			margin: 20rpx;
		}

		.tizidan-container {
			margin: 20rpx;
			max-width: 90%;
		}

		.tizidan-header {
			padding: 40rpx 30rpx;
		}

		.tizidan-title {
			font-size: 38rpx;
		}

		.tizidan-subtitle {
			font-size: 30rpx;
		}

		.tizidan-content {
			padding: 30rpx;
		}

		.tizidan-item-card {
			flex-direction: row;
			justify-content: space-between;
			align-items: flex-start;
		}

		.tizidan-item-content {
			margin-bottom: 0;
			flex: 1;
			max-width: 70%;
		}

		.tizidan-item-status {
			flex-shrink: 0;
			border-top: none;
			padding-top: 0;
			flex-direction: column;
			align-items: flex-end;
			gap: 12rpx;
			min-width: 180rpx;
		}

		.tizidan-footer {
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
		}

		.tizidan-footer-text {
			margin-bottom: 0;
			flex: 1;
			text-align: left;
			font-size: 28rpx;
		}

		.tizidan-footer .btn {
			flex-shrink: 0;
			margin-left: 20rpx;
		}
	}

	/* 桌面端适配 - 最大化宽度和字体 */
	@media (min-width: 961px) {

		// 全局设置
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

		.tizidan-container {
			max-width: 1400rpx;
			/* 增大最大宽度 */
			margin: 0 auto;
			width: 95%;
			/* 使用百分比宽度，充分利用屏幕空间 */
		}

		.tizidan-header {
			padding: 80rpx 60rpx;
			/* 增大头部内边距 */
		}

		.tizidan-title {
			font-size: 48rpx;
			/* 增大标题字体 */
		}

		.tizidan-subtitle {
			font-size: 36rpx;
			/* 增大副标题字体 */
		}

		.tizidan-content {
			padding: 50rpx 60rpx;
			/* 增大内容区域内边距 */
			gap: 30rpx;
			/* 增大卡片间距 */
		}

		.tizidan-item-card {
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
			padding: 40rpx;
			/* 增大卡片内边距 */
		}

		.tizidan-item-content {
			margin-bottom: 0;
			flex: 1;
			max-width: 80%;
			/* 增大内容区域最大宽度 */
		}

		.tizidan-item-number {
			font-size: 36rpx;
			/* 增大序号字体 */
			min-width: 60rpx;
		}

		.tizidan-item-text {
			font-size: 36rpx;
			/* 增大内容字体 */
			line-height: 1.7;
			/* 增大行高，提高可读性 */
		}

		.tizidan-item-status {
			border-top: none;
			padding-top: 0;
			flex-shrink: 0;
			min-width: 220rpx;
			/* 增大状态区域最小宽度 */
			justify-content: flex-end;
		}

		.tizidan-status-text {
			font-size: 32rpx;
			/* 增大状态字体 */
		}

		.tizidan-submit-btn {
			padding: 18rpx 36rpx;
			/* 增大按钮内边距 */
			font-size: 30rpx;
			/* 增大按钮字体 */
		}

		.tizidan-footer {
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
			padding: 50rpx 60rpx;
			/* 增大底部内边距 */
		}

		.tizidan-footer-text {
			margin-bottom: 0;
			flex: 1;
			text-align: left;
			font-size: 32rpx;
			/* 增大底部文字字体 */
		}

		.tizidan-footer .btn {
			flex-shrink: 0;
			margin-left: 30rpx;
			padding: 20rpx 40rpx;
			/* 增大底部按钮内边距 */
			font-size: 30rpx;
			/* 增大底部按钮字体 */
		}

		.tizidan-submit-btn:hover {
			background-color: #2980b9;
			cursor: pointer;
		}
	}

	/* 超大屏幕适配 */
	@media (min-width: 1200px) {
		.tizidan-container {
			max-width: 1600rpx;
			/* 在超大屏幕上进一步增大宽度 */
		}

		.tizidan-content {
			padding: 60rpx 80rpx;
			/* 进一步增大内边距 */
		}

		.tizidan-item-card {
			padding: 45rpx;
			/* 进一步增大卡片内边距 */
		}

		.tizidan-item-number {
			font-size: 38rpx;
			/* 进一步增大序号字体 */
		}

		.tizidan-item-text {
			font-size: 38rpx;
			/* 进一步增大内容字体 */
		}

		.tizidan-footer {
			padding: 60rpx 80rpx;
			/* 进一步增大底部内边距 */
		}
	}
</style>