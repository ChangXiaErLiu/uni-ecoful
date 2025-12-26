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
					<!-- 步骤0: 选择项目、提取基本信息 -->
					<view v-show="currentStep === 0" class="content-section">
						<ProjectInfoContainer @extraction-complete="handleExtractionComplete" />
					</view>

					<!-- 步骤1: 监测方案 -->
					<view v-show="currentStep === 1" class="content-section">
						<MonitorPlanContainer :projectId="selectedProjectId"
							:hasExtracted="projectInfoState.extractionOk.value" @plan-generated="handlePlanGenerated" />
					</view>

					<!-- 步骤2: 提资单比对 -->
					<view v-show="currentStep === 2" class="content-section">
						<view class="section-card">
							<view class="section-header">
								<uni-icons type="list" size="20" color="#166534" />
								<text class="section-title">提资单比对</text>
							</view>

							<view class="section-body">
								<!-- 环保资料提交管理系统界面 -->
								<view class="tizidan-container">
									<!-- 顶部描述 -->
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
										<!-- 将提资单项分组显示 -->

										<!-- 1、项目历史以来环评报告及批复 -->
										<view class="tizidan-section">
											<view class="tizidan-section-header">
												<text class="tizidan-section-number">1.</text>
												<text class="tizidan-section-title">项目历史以来环评报告及批复</text>
											</view>

											<!-- 找到这个组的所有项目 -->
											<template v-for="item in getItemsByLevel1('项目历史以来环评报告及批复')"
												:key="item.record_id">
												<view class="tizidan-item-card">
													<view class="tizidan-item-header">
														<view class="tizidan-item-left">
															<text
																class="tizidan-item-number">{{ getItemNumber(item) }}</text>
															<view class="tizidan-item-content">
																<text
																	class="tizidan-item-title">{{ getItemTitle(item) }}</text>
															</view>
														</view>

														<!-- 复选框：本项目是否需要 -->
														<view class="tizidan-checkbox-group">
															<checkbox-group @change="() => toggleRequired(item)">
																<label class="checkbox-label">
																	<checkbox :checked="item.required" color="#166534"
																		style="transform:scale(0.9)" />
																	<text class="checkbox-text">本项目是否需要</text>
																</label>
															</checkbox-group>
														</view>
													</view>

													<!-- 当项目需要时显示内容 -->
													<view v-if="item.required" class="tizidan-item-body">
														<view class="tizidan-item-actions">
															<view class="tizidan-file-count"
																v-if="getItemFiles(item).length > 0">
																<uni-icons type="paperclip" size="14" color="#166534" />
																<text
																	class="file-count-text">{{ getItemFiles(item).length }}个文件</text>
															</view>
															<button class="btn btn--small"
																@click="uploadTizidanFile(item.record_id, getFileKey(item))">
																<uni-icons type="cloud-upload" size="14"
																	color="#ffffff" />
																<text>{{ item.submitted ? '继续上传' : '上传' }}</text>
															</button>
														</view>

														<!-- 已上传文件列表 -->
														<view v-if="getItemFiles(item).length > 0"
															class="tizidan-file-list">
															<view v-for="(file, fileIndex) in getItemFiles(item)"
																:key="fileIndex" class="tizidan-file-item">
																<view class="tizidan-file-info">
																	<uni-icons type="paperclip" size="16"
																		color="#166534" />
																	<text
																		class="tizidan-file-name">{{ file.name }}</text>
																	<text
																		class="tizidan-file-size">{{ formatFileSize(file.size) }}</text>
																</view>
																<button class="btn btn--icon"
																	@click="deleteTizidanFile(item.record_id, getFileKey(item), fileIndex)">
																	<uni-icons type="trash" size="16" color="#dc2626" />
																</button>
															</view>
														</view>
													</view>

													<!-- 当项目不需要时显示禁用状态 -->
													<view v-else class="tizidan-item-disabled">
														<uni-icons type="minus-circle" size="18" color="#9ca3af" />
														<text class="disabled-text">此项目无需提交</text>
													</view>
												</view>
											</template>
										</view>

										<!-- 2、项目相关环保验收资料 -->
										<view class="tizidan-section">
											<view class="tizidan-section-header">
												<text class="tizidan-section-number">2.</text>
												<text class="tizidan-section-title">项目相关环保验收资料</text>
											</view>

											<!-- 找到这个组的所有项目 -->
											<template v-for="item in getItemsByLevel1('项目相关环保验收资料')"
												:key="item.record_id">
												<view class="tizidan-item-card">
													<view class="tizidan-item-header">
														<view class="tizidan-item-left">
															<text
																class="tizidan-item-number">{{ getItemNumber(item) }}</text>
															<view class="tizidan-item-content">
																<text
																	class="tizidan-item-title">{{ getItemTitle(item) }}</text>
															</view>
														</view>

														<!-- 复选框：本项目是否需要 -->
														<view class="tizidan-checkbox-group">
															<checkbox-group @change="() => toggleRequired(item)">
																<label class="checkbox-label">
																	<checkbox :checked="item.required" color="#166534"
																		style="transform:scale(0.9)" />
																	<text class="checkbox-text">本项目是否需要</text>
																</label>
															</checkbox-group>
														</view>
													</view>

													<!-- 当项目需要时显示内容 -->
													<view v-if="item.required" class="tizidan-item-body">
														<view class="tizidan-item-actions">
															<view class="tizidan-file-count"
																v-if="item.files && item.files.length > 0">
																<uni-icons type="paperclip" size="14" color="#166534" />
																<text
																	class="file-count-text">{{ item.files.length }}个文件</text>
															</view>
															<button class="btn btn--small"
																@click="uploadTizidanFile(item.record_id, null)">
																<uni-icons type="cloud-upload" size="14"
																	color="#ffffff" />
																<text>{{ item.submitted ? '继续上传' : '上传' }}</text>
															</button>
														</view>

														<!-- 已上传文件列表 -->
														<view v-if="item.files && item.files.length > 0"
															class="tizidan-file-list">
															<view v-for="(file, fileIndex) in item.files"
																:key="fileIndex" class="tizidan-file-item">
																<view class="tizidan-file-info">
																	<uni-icons type="paperclip" size="16"
																		color="#166534" />
																	<text
																		class="tizidan-file-name">{{ file.name }}</text>
																	<text
																		class="tizidan-file-size">{{ formatFileSize(file.size) }}</text>
																</view>
																<button class="btn btn--icon"
																	@click="deleteTizidanFile(item.record_id, null, fileIndex)">
																	<uni-icons type="trash" size="16" color="#dc2626" />
																</button>
															</view>
														</view>
													</view>

													<!-- 当项目不需要时显示禁用状态 -->
													<view v-else class="tizidan-item-disabled">
														<uni-icons type="minus-circle" size="18" color="#9ca3af" />
														<text class="disabled-text">此项目无需提交</text>
													</view>
												</view>
											</template>
										</view>

										<!-- 3、（房地产项目提供）房地产相关证件 -->
										<view class="tizidan-section">
											<view class="tizidan-section-header">
												<text class="tizidan-section-number">3.</text>
												<text class="tizidan-section-title">（房地产项目提供）房地产相关证件</text>
											</view>

											<!-- 找到这个组的所有项目 -->
											<template v-for="item in getItemsByLevel1('（房地产项目提供）房地产相关证件')"
												:key="item.record_id">
												<view class="tizidan-item-card">
													<view class="tizidan-item-header">
														<view class="tizidan-item-left">
															<text
																class="tizidan-item-number">{{ getItemNumber(item) }}</text>
															<view class="tizidan-item-content">
																<text
																	class="tizidan-item-title">{{ getItemTitle(item) }}</text>
															</view>
														</view>

														<!-- 复选框：本项目是否需要 -->
														<view class="tizidan-checkbox-group">
															<checkbox-group @change="() => toggleRequired(item)">
																<label class="checkbox-label">
																	<checkbox :checked="item.required" color="#166534"
																		style="transform:scale(0.9)" />
																	<text class="checkbox-text">本项目是否需要</text>
																</label>
															</checkbox-group>
														</view>
													</view>

													<!-- 当项目需要时显示内容 -->
													<view v-if="item.required" class="tizidan-item-body">
														<view class="tizidan-item-actions">
															<view class="tizidan-file-count"
																v-if="getItemFiles(item).length > 0">
																<uni-icons type="paperclip" size="14" color="#166534" />
																<text
																	class="file-count-text">{{ getItemFiles(item).length }}个文件</text>
															</view>
															<button class="btn btn--small"
																@click="uploadTizidanFile(item.record_id, getFileKey(item))">
																<uni-icons type="cloud-upload" size="14"
																	color="#ffffff" />
																<text>{{ getSubmittedStatus(item) ? '继续上传' : '上传' }}</text>
															</button>
														</view>

														<!-- 已上传文件列表 -->
														<view v-if="getItemFiles(item).length > 0"
															class="tizidan-file-list">
															<view v-for="(file, fileIndex) in getItemFiles(item)"
																:key="fileIndex" class="tizidan-file-item">
																<view class="tizidan-file-info">
																	<uni-icons type="paperclip" size="16"
																		color="#166534" />
																	<text
																		class="tizidan-file-name">{{ file.name }}</text>
																	<text
																		class="tizidan-file-size">{{ formatFileSize(file.size) }}</text>
																</view>
																<button class="btn btn--icon"
																	@click="deleteTizidanFile(item.record_id, getFileKey(item), fileIndex)">
																	<uni-icons type="trash" size="16" color="#dc2626" />
																</button>
															</view>
														</view>
													</view>

													<!-- 当项目不需要时显示禁用状态 -->
													<view v-else class="tizidan-item-disabled">
														<uni-icons type="minus-circle" size="18" color="#9ca3af" />
														<text class="disabled-text">此项目无需提交</text>
													</view>
												</view>
											</template>
										</view>

										<!-- 4-9项 - 统一布局的普通项 -->
										<template v-for="level1Name in ['污染治理设施设计方案', '厂区总平面图及各层平面图（CAD版本）', 
					                          '厂区排水设计图（CAD版本）', '排污许可证', '排水许可证', '危废处置协议及相应处置资质']" :key="level1Name">
											<view v-if="hasItemsByLevel1(level1Name)" class="tizidan-section">
												<view class="tizidan-section-header">
													<text
														class="tizidan-section-number">{{ getSectionNumber(level1Name) }}.</text>
													<text class="tizidan-section-title">{{ level1Name }}</text>
												</view>

												<!-- 找到这个组的所有项目 -->
												<template v-for="item in getItemsByLevel1(level1Name)"
													:key="item.record_id">
													<view class="tizidan-item-card">
														<view class="tizidan-item-header">
															<view class="tizidan-item-left">
																<text
																	class="tizidan-item-number">{{ getItemNumber(item) }}</text>
																<view class="tizidan-item-content">
																	<text
																		class="tizidan-item-title">{{ getItemTitle(item) }}</text>
																</view>
															</view>

															<!-- 复选框：本项目是否需要 -->
															<view class="tizidan-checkbox-group">
																<checkbox-group @change="() => toggleRequired(item)">
																	<label class="checkbox-label">
																		<checkbox :checked="item.required"
																			color="#166534"
																			style="transform:scale(0.9)" />
																		<text class="checkbox-text">本项目是否需要</text>
																	</label>
																</checkbox-group>
															</view>
														</view>

														<!-- 当项目需要时显示内容 -->
														<view v-if="item.required" class="tizidan-item-body">
															<view class="tizidan-item-actions">
																<view class="tizidan-file-count"
																	v-if="item.files && item.files.length > 0">
																	<uni-icons type="paperclip" size="14"
																		color="#166534" />
																	<text
																		class="file-count-text">{{ item.files.length }}个文件</text>
																</view>
																<button class="btn btn--small"
																	@click="uploadTizidanFile(item.record_id, null)">
																	<uni-icons type="cloud-upload" size="14"
																		color="#ffffff" />
																	<text>{{ item.submitted ? '继续上传' : '上传' }}</text>
																</button>
															</view>

															<!-- 已上传文件列表 -->
															<view v-if="item.files && item.files.length > 0"
																class="tizidan-file-list">
																<view v-for="(file, fileIndex) in item.files"
																	:key="fileIndex" class="tizidan-file-item">
																	<view class="tizidan-file-info">
																		<uni-icons type="paperclip" size="16"
																			color="#166534" />
																		<text
																			class="tizidan-file-name">{{ file.name }}</text>
																		<text
																			class="tizidan-file-size">{{ formatFileSize(file.size) }}</text>
																	</view>
																	<button class="btn btn--icon"
																		@click="deleteTizidanFile(item.record_id, null, fileIndex)">
																		<uni-icons type="trash" size="16"
																			color="#dc2626" />
																	</button>
																</view>
															</view>
														</view>

														<!-- 当项目不需要时显示禁用状态 -->
														<view v-else class="tizidan-item-disabled">
															<uni-icons type="minus-circle" size="18" color="#9ca3af" />
															<text class="disabled-text">此项目无需提交</text>
														</view>
													</view>
												</template>
											</view>
										</template>

										<!-- 10、其他需要提供的资料 -->
										<view v-if="hasItemsByLevel1('其他需要提供的资料')" class="tizidan-section">
											<view class="tizidan-section-header">
												<text class="tizidan-section-number">10.</text>
												<text class="tizidan-section-title">其他需要提供的资料</text>
											</view>

											<!-- 找到这个组的所有项目 -->
											<template v-for="item in getItemsByLevel1('其他需要提供的资料')"
												:key="item.record_id">
												<view class="tizidan-item-card">
													<view class="tizidan-item-header">
														<view class="tizidan-item-left">
															<text
																class="tizidan-item-number">{{ getItemNumber(item) }}</text>
															<view class="tizidan-item-content">
																<text
																	class="tizidan-item-title">{{ getItemTitle(item) }}</text>
															</view>
														</view>

														<!-- 复选框：本项目是否需要 -->
														<view class="tizidan-checkbox-group">
															<checkbox-group @change="() => toggleRequired(item)">
																<label class="checkbox-label">
																	<checkbox :checked="item.required" color="#166534"
																		style="transform:scale(0.9)" />
																	<text class="checkbox-text">本项目是否需要</text>
																</label>
															</checkbox-group>
														</view>
													</view>

													<view v-if="item.required" class="tizidan-item-body">
														<!-- 输入框 -->
														<view class="tizidan-other-input">
															<uni-easyinput v-model="item.customText"
																placeholder="请输入其他需要提供的资料（以防万一以上资料不满足特殊项目要求）"
																type="textarea" :maxlength="500" :clearable="true"
																:autoHeight="true" class="custom-textarea" />
															<button class="btn btn--primary"
																@click="submitOtherMaterials(item.record_id)">
																提交
															</button>
														</view>

														<view class="tizidan-item-actions">
															<view class="tizidan-file-count"
																v-if="item.files && item.files.length > 0">
																<uni-icons type="paperclip" size="14" color="#166534" />
																<text
																	class="file-count-text">{{ item.files.length }}个文件</text>
															</view>
															<button class="btn btn--small"
																@click="uploadTizidanFile(item.record_id, null)">
																<uni-icons type="cloud-upload" size="14"
																	color="#ffffff" />
																<text>{{ item.submitted ? '继续上传' : '上传' }}</text>
															</button>
														</view>

														<!-- 已上传文件列表 -->
														<view v-if="item.files && item.files.length > 0"
															class="tizidan-file-list">
															<view v-for="(file, fileIndex) in item.files"
																:key="fileIndex" class="tizidan-file-item">
																<view class="tizidan-file-info">
																	<uni-icons type="paperclip" size="16"
																		color="#166534" />
																	<text
																		class="tizidan-file-name">{{ file.name }}</text>
																	<text
																		class="tizidan-file-size">{{ formatFileSize(file.size) }}</text>
																</view>
																<button class="btn btn--icon"
																	@click="deleteTizidanFile(item.record_id, null, fileIndex)">
																	<uni-icons type="trash" size="16" color="#dc2626" />
																</button>
															</view>
														</view>
													</view>

													<view v-else class="tizidan-item-disabled">
														<uni-icons type="minus-circle" size="18" color="#9ca3af" />
														<text class="disabled-text">此项目无需提交</text>
													</view>
												</view>
											</template>
										</view>
									</view>
								</view>

								<tizidan-footer>
									<view class="footer-content">
										<!-- 添加资料接收者信息输入区域 -->
										<view class="contact-info-section">
											<view class="contact-info-header">
												<uni-icons type="phone" size="16" color="#166534" />
												<text class="contact-info-title">资料接收者信息</text>
											</view>

											<view class="contact-info-form">
												<!-- 联系人 -->
												<view class="contact-info-item">
													<text class="contact-info-label">联系人：</text>
													<uni-easyinput v-model="contactPerson" placeholder="请输入联系人姓名"
														:clearable="true" class="contact-info-input" />
												</view>

												<!-- 电话 -->
												<view class="contact-info-item">
													<text class="contact-info-label">电话：</text>
													<uni-easyinput v-model="contactPhone" placeholder="请输入联系电话"
														:clearable="true" class="contact-info-input" />
												</view>

												<!-- 邮箱 -->
												<view class="contact-info-item">
													<text class="contact-info-label">邮箱：</text>
													<uni-easyinput v-model="contactEmail" placeholder="请输入电子邮箱"
														:clearable="true" class="contact-info-input" />
												</view>
											</view>
										</view>

										<text class="footer-text">请确保所有需要的资料完整准确提交</text>
										<button class="btn btn--primary" @tap="generateAndDownloadTizidan">
											<uni-icons type="download-filled" size="16" color="#ffffff" />
											<text>生成并下载验收报告提资单</text>
										</button>
									</view>
								</tizidan-footer>
							</view>
						</view>
					</view>


					<!-- 步骤3: 现场踏勘比对 -->
					<view v-show="currentStep === 3" class="content-section">
						<FieldSurveyContainer :userId="user_id" :projectId="selectedProjectId"
							:signboard="projectInfoState.signboard" :baseTable="projectInfoState.baseTable.value"
							:datasheet="projectInfoState.datasheet"
							@generate-signboard="projectInfoState.generateSignboard" />
					</view>

					<!-- 步骤4: 竣工验收报告 -->
					<view v-show="currentStep === 4" class="content-section">
						<AcceptanceReportContainer :projectId="selectedProjectId"
							:hasExtracted="projectInfoState.extractionOk.value"
							@report-generated="handleReportGenerated" />
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
						<uni-icons type="folder" size="22"
							:color="selectedProjectId === project.id ? '#166534' : '#6b7280'" />
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
	import ProjectInfoContainer from '@/components/acceptance-report/ProjectInfoContainer.vue'
	import FieldSurveyContainer from '@/components/field-survey/FieldSurveyContainer.vue'
	import MonitorPlanContainer from '@/components/monitor-plan/MonitorPlanContainer.vue'
	import AcceptanceReportContainer from '@/components/acceptance-report/AcceptanceReportContainer.vue'
	import {
		useProjectInfo
	} from '@/composables/useProjectInfo.js'
	import {
		useFieldSurveyData
	} from '@/composables/useFieldSurveyData.js'
	import {
		useMonitorPlan
	} from '@/composables/useMonitorPlan.js'
	import {
		useAcceptanceReport
	} from '@/composables/useAcceptanceReport.js'
	import {
		navTitleStore
	} from '@/stores/navTitle.js'

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
	const stepNames = ['选择项目与提取信息', '监测方案', '提资单比对', '现场踏勘比对', '竣工验收报告']

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

	// 从 useProjectInfo composable 获取第一步的状态
	const projectInfoState = useProjectInfo()
	const {
		selectedProjectId,
		filteredProjects,
		projectSearchKeyword
	} = projectInfoState

	// 所有步骤的完成度
	function stepDone(i) {
		switch (i) {
			case 0:
				return projectInfoState.extractionOk.value;
			case 1:
				return monitorPlanState.canDownload.value;
			case 2:
				return tizidanItems.value && tizidanItems.value.some(item => item.submitted);
			case 3:
				return fieldSurveyData.fieldworkComparison && fieldSurveyData.fieldworkComparison.value && fieldSurveyData.fieldworkComparison.value.length > 0;
			case 4:
				return acceptanceReportState.canDownloadReport.value;
			default:
				return false
		}
	}

	// 第一步：项目信息管理（已重构为独立组件）
	// 所有状态和方法已迁移到 composables/useProjectInfo.js
	// 通过 ProjectInfoContainer 组件使用

	// 处理提取完成事件
	function handleExtractionComplete() {
		// console.log('✅ 项目信息提取完成')
	}

	// 初始化和清理
	onLoad(async () => {
		// 初始化项目信息管理
		await projectInfoState.initialize()
	})

	onUnmounted(() => {
		// 清理项目信息管理
		projectInfoState.cleanup()
	})

	// 监测方案生成成功的回调
	// 监测方案状态管理
	const monitorPlanState = useMonitorPlan()


	function handlePlanGenerated() {
		// console.log('✅ 监测方案生成成功')
	}

	// 以下现场踏勘比对的方法-------------------------
	// 现场踏勘模块已拆分到独立组件，使用 useFieldSurveyData composable 管理状态
	const fieldSurveyData = useFieldSurveyData()

	// 以下是竣工验收报告的方法-------------------------
	// 竣工验收报告状态管理
	const acceptanceReportState = useAcceptanceReport()

	// 竣工验收报告生成成功的回调
	function handleReportGenerated() {
		// console.log('✅ 竣工验收报告生成成功')
	}


	// 以下提资单比对的方法-------------------------
	//bywilson 获取user_id和project_id从本地缓存uni.getStorageSync
	// 获取项目ID
	const project_id = uni.getStorageSync('acceptance_project_id')
	const userInfoStr = uni.getStorageSync('userInfo')
	const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null
	// 获取user_id 
	const user_id = userInfo?.id || userInfo?.user_id
	// console.log("test userid",user_id)
	// console.log("test project_id",project_id)
	// 上传提资单文件
	const eco_baseUrl = "http://172.16.1.61:8000"

	// 提资单数据
	const tizidanItems = ref([])
	const tizidanRecordMap = ref({}) // 用于存储 record_id 到前端索引的映射
	// 在 data 部分添加资料接收者信息
	const contactPerson = ref('')
	const contactPhone = ref('')
	const contactEmail = ref('')

	// 修改下载函数为生成并下载提资单
	async function generateAndDownloadTizidan() {
		if (!selectedProjectId.value) {
			uni.showToast({
				title: '请先选择项目',
				icon: 'none'
			})
			return
		}

		// 验证资料接收者信息
		if (!contactPerson.value.trim()) {
			uni.showToast({
				title: '请输入接收资料的联系人',
				icon: 'none'
			})
			return
		}

		if (!contactPhone.value.trim()) {
			uni.showToast({
				title: '请输入电话',
				icon: 'none'
			})
			return
		}

		if (!contactEmail.value.trim()) {
			uni.showToast({
				title: '请输入邮箱',
				icon: 'none'
			})
			return
		}

		// 显示下载中提示
		uni.showLoading({
			title: '正在生成文档…',
			mask: true
		})

		try {
			// 调用生成提资单接口
			const url = eco_baseUrl + '/api/v1/completion/tzdDetail/generate_and_download_tzd_doc'

			const formData = {
				user_id: user_id,
				project_id: project_id,
				contact_person: contactPerson.value,
				contact_phone: contactPhone.value,
				contact_email: contactEmail.value
			}

			// 使用 POST 请求发送数据
			const response = await new Promise((resolve, reject) => {
				uni.request({
					url: url,
					method: 'POST',
					header: {
						'Content-Type': 'application/json'
					},
					data: formData,
					success: (res) => resolve(res),
					fail: (err) => reject(err)
				})
			})

			if (response.statusCode === 200) {
				const data = response.data
				if (data.success) {
					if (data.download_url) {
						// 延迟 1 秒再下载，确保文件已保存
						setTimeout(() => {
							downloadGeneratedFile(data.download_url, data.file_name)
						}, 1000)

						uni.showToast({
							title: '文档生成成功，开始下载',
							icon: 'success'
						})
					} else {
						uni.showToast({
							title: data.message || '生成成功',
							icon: 'success'
						})
					}
				} else {
					throw new Error(data.message || '生成文档失败')
				}
			} else {
				throw new Error(`请求失败，状态码：${response.statusCode}`)
			}
		} catch (error) {
			console.error('生成提资单失败:', error)
			uni.showToast({
				title: '生成失败: ' + (error.message || '未知错误'),
				icon: 'none',
				duration: 3000
			})
		} finally {
			uni.hideLoading()
		}
	}

	// 下载生成的文档
	async function downloadGeneratedFile(downloadUrl, fileName) {
		try {
			// 构建完整的下载 URL
			const fullUrl = eco_baseUrl + downloadUrl

			console.log('开始下载文件:', fullUrl)

			// 显示下载进度
			uni.showLoading({
				title: '正在下载文档…',
				mask: true
			})

			// #ifdef H5
			// H5环境：直接打开链接下载
			window.open(fullUrl, '_blank')
			uni.hideLoading()
			uni.showToast({
				title: '下载已开始',
				icon: 'success'
			})
			// #endif

			// #ifdef MP-WEIXIN
			// 微信小程序环境
			const downloadTask = uni.downloadFile({
				url: fullUrl,
				success: (res) => {
					uni.hideLoading()
					if (res.statusCode === 200) {
						const tempFilePath = res.tempFilePath
						uni.saveFile({
							tempFilePath: tempFilePath,
							success: (saveRes) => {
								console.log('文件保存成功:', saveRes.savedFilePath)
								uni.showToast({
									title: '文件已保存',
									icon: 'success'
								})
							},
							fail: (saveErr) => {
								console.error('保存文件失败:', saveErr)
								uni.showToast({
									title: '保存失败: ' + (saveErr.errMsg || '未知错误'),
									icon: 'none'
								})
							}
						})
					} else {
						uni.showToast({
							title: `下载失败，状态码: ${res.statusCode}`,
							icon: 'none'
						})
					}
				},
				fail: (err) => {
					uni.hideLoading()
					console.error('下载请求失败:', err)
					uni.showToast({
						title: '下载请求失败: ' + (err.errMsg || '未知错误'),
						icon: 'none'
					})
				}
			})

			// 监听下载进度
			downloadTask.onProgressUpdate((res) => {
				console.log('下载进度', res.progress)
				console.log('已经下载的数据长度', res.totalBytesWritten)
				console.log('预期需要下载的数据总长度', res.totalBytesExpectedToWrite)
			})
			// #endif

			// #ifdef APP-PLUS
			// App环境
			uni.downloadFile({
				url: fullUrl,
				success: (res) => {
					uni.hideLoading()
					if (res.statusCode === 200) {
						const tempFilePath = res.tempFilePath
						plus.runtime.openFile(tempFilePath, {}, (e) => {
							if (e.code !== 0) {
								uni.showToast({
									title: '打开文件失败',
									icon: 'none'
								})
							}
						})
					} else {
						uni.showToast({
							title: `下载失败，状态码: ${res.statusCode}`,
							icon: 'none'
						})
					}
				},
				fail: (err) => {
					uni.hideLoading()
					console.error('下载请求失败:', err)
					uni.showToast({
						title: '下载请求失败: ' + (err.errMsg || '未知错误'),
						icon: 'none'
					})
				}
			})
			// #endif

		} catch (error) {
			uni.hideLoading()
			console.error('下载文件失败:', error)
			uni.showToast({
				title: '下载失败: ' + (error.message || '未知错误'),
				icon: 'none'
			})
		}
	}

	// 重置提交状态
	function resetSubmissionStatus(item) {
		// 重置主提交状态
		item.submitted = false

		// 重置各个子提交状态
		const subStatusKeys = ['submitted1_1', 'submitted1_2', 'submitted3_1', 'submitted3_2', 'submitted3_3']
		subStatusKeys.forEach(key => {
			if (item[key] !== undefined) {
				item[key] = false
			}
		})
	}

	// 切换"本项目是否需要"复选框
	async function toggleRequired(item) {
		if (!item || !item.record_id) {
			console.error('切换复选框失败：item或record_id不存在')
			return
		}

		try {
			// 切换状态
			const newRequired = !item.required
			item.required = newRequired

			// 显示加载中
			uni.showLoading({
				title: '保存中...',
				mask: true
			})

			// 调用后端接口更新数据库
			const response = await new Promise((resolve, reject) => {
				uni.request({
					url: eco_baseUrl + '/api/v1/completion/tzdDetail/update_require',
					method: 'POST',
					header: {
						'Content-Type': 'application/json'
					},
					data: {
						record_id: item.record_id,
						is_require: newRequired ? 1 : 0,
						user_id: user_id,
						project_id: project_id
					},
					success: (res) => {
						console.log('更新is_require成功:', res)
						resolve(res)
					},
					fail: (err) => {
						console.error('更新is_require失败:', err)
						reject(err)
					}
				})
			})

			if (response.statusCode === 200 && response.data.success) {
				uni.hideLoading()
				uni.showToast({
					title: newRequired ? '已标记为需要' : '已标记为不需要',
					icon: 'success',
					duration: 1500
				})

				// 如果取消勾选，不需要清空文件，但要隐藏文件上传区域
				// 文件数据保留，只是隐藏显示
			} else {
				throw new Error(response.data?.message || '更新失败')
			}
		} catch (error) {
			console.error('切换复选框失败:', error)
			uni.hideLoading()

			// 恢复原来的状态
			item.required = !item.required

			uni.showToast({
				title: `保存失败: ${error.message}`,
				icon: 'none',
				duration: 2000
			})
		}
	}
	// 辅助函数：获取特定子项的 required 状态
	function getRequiredStatus(items, mainIndex, subType) {
		if (!items[mainIndex]) return false

		const item = items[mainIndex]
		const statusKey = `submitted${subType}`
		return item[statusKey] !== undefined ? item.required : false
	}

	// 辅助函数：获取特定子项的 files
	function getFiles(items, mainIndex, subType) {
		if (!items[mainIndex]) return []

		const item = items[mainIndex]
		const fileKey = `files${subType}`
		return item[fileKey] || []
	}


	// 辅助函数：获取特定子项的 record_id
	function getRecordId(items, mainIndex, subType) {
		if (!items[mainIndex]) return null

		const item = items[mainIndex]
		// 对于子项，我们使用主项的 record_id
		return item.record_id
	}

	// 切换"本项目是否需要"复选框（针对子项）
	async function toggleRequiredForItem(items, mainIndex, subType) {
		const item = items[mainIndex]
		if (!item || !item.record_id) {
			console.error('切换复选框失败：item或record_id不存在')
			return
		}

		try {
			// 切换状态
			const newRequired = !getRequiredStatus(items, mainIndex, subType)

			// 更新本地状态
			const statusKey = `submitted${subType}`
			if (item[statusKey] !== undefined) {
				// 如果有子项状态，保持原有的 submitted 状态
				// 这里我们只更新 required 状态
				console.log(`切换子项 ${mainIndex}-${subType} 的required状态为:`, newRequired)
			}

			// 显示加载中
			uni.showLoading({
				title: '保存中...',
				mask: true
			})

			// 调用后端接口更新数据库
			const response = await new Promise((resolve, reject) => {
				uni.request({
					url: eco_baseUrl + '/api/v1/completion/tzdDetail/update_require',
					method: 'POST',
					header: {
						'Content-Type': 'application/json'
					},
					data: {
						record_id: item.record_id,
						is_require: newRequired ? 1 : 0,
						user_id: user_id,
						project_id: project_id
					},
					success: (res) => {
						console.log('更新is_require成功:', res)
						resolve(res)
					},
					fail: (err) => {
						console.error('更新is_require失败:', err)
						reject(err)
					}
				})
			})

			if (response.statusCode === 200 && response.data.success) {
				uni.hideLoading()
				uni.showToast({
					title: newRequired ? '已标记为需要' : '已标记为不需要',
					icon: 'success',
					duration: 1500
				})

				// 更新本地状态
				// 由于子项的 required 状态存储在同一个记录中，我们需要重新获取数据
				await fetchTizidanData()
			} else {
				throw new Error(response.data?.message || '更新失败')
			}
		} catch (error) {
			console.error('切换复选框失败:', error)
			uni.hideLoading()

			uni.showToast({
				title: `保存失败: ${error.message}`,
				icon: 'none',
				duration: 2000
			})
		}
	}


	// 辅助函数：根据level1_name获取所有项目
	function getItemsByLevel1(level1Name) {
		return tizidanItems.value.filter(item => item.level1_name === level1Name)
	}

	// 辅助函数：检查是否有指定level1_name的项目
	function hasItemsByLevel1(level1Name) {
		return tizidanItems.value.some(item => item.level1_name === level1Name)
	}

	// 辅助函数：获取分组编号
	function getSectionNumber(level1Name) {
		const level1Names = [
			'项目历史以来环评报告及批复',
			'项目相关环保验收资料',
			'（房地产项目提供）房地产相关证件',
			'污染治理设施设计方案',
			'厂区总平面图及各层平面图（CAD版本）',
			'厂区排水设计图（CAD版本）',
			'排污许可证',
			'排水许可证',
			'危废处置协议及相应处置资质',
			'其他需要提供的资料'
		]
		return level1Names.indexOf(level1Name) + 1
	}

	// 辅助函数：获取项目编号
	function getItemNumber(item) {
		const level1Name = item.level1_name
		const level2Name = item.level2_name || ''

		if (level1Name === '项目历史以来环评报告及批复') {
			if (level2Name.includes('环评报告')) return '1-1'
			if (level2Name.includes('批复')) return '1-2'
		} else if (level1Name === '项目相关环保验收资料') {
			return '2'
		} else if (level1Name === '（房地产项目提供）房地产相关证件') {
			if (level2Name.includes('施工证')) return '3-1'
			if (level2Name.includes('规划许可证')) return '3-2'
			if (level2Name.includes('规划验收合格证')) return '3-3'
		} else {
			return getSectionNumber(level1Name)
		}

		return getSectionNumber(level1Name)
	}

	// 辅助函数：获取项目标题
	function getItemTitle(item) {
		if (item.level2_name && item.level2_name.trim()) {
			return item.level2_name
		}
		return item.level1_name
	}

	// 辅助函数：获取项目文件
	function getItemFiles(item) {
		const level1Name = item.level1_name
		const level2Name = item.level2_name || ''

		// 处理特殊子项的文件
		if (level1Name === '项目历史以来环评报告及批复') {
			if (level2Name.includes('环评报告')) {
				return item.files1_1 || []
			}
			if (level2Name.includes('批复')) {
				return item.files1_2 || []
			}
		} else if (level1Name === '（房地产项目提供）房地产相关证件') {
			if (level2Name.includes('施工证')) {
				return item.files3_1 || []
			}
			if (level2Name.includes('规划许可证')) {
				return item.files3_2 || []
			}
			if (level2Name.includes('规划验收合格证')) {
				return item.files3_3 || []
			}
		}

		// 默认返回主文件列表
		return item.files || []
	}

	// 辅助函数：获取文件键名
	function getFileKey(item) {
		const level1Name = item.level1_name
		const level2Name = item.level2_name || ''

		if (level1Name === '项目历史以来环评报告及批复') {
			if (level2Name.includes('环评报告')) return '1_1'
			if (level2Name.includes('批复')) return '1_2'
		} else if (level1Name === '（房地产项目提供）房地产相关证件') {
			if (level2Name.includes('施工证')) return '3_1'
			if (level2Name.includes('规划许可证')) return '3_2'
			if (level2Name.includes('规划验收合格证')) return '3_3'
		}

		return null
	}

	// 辅助函数：获取提交状态
	function getSubmittedStatus(item) {
		const level1Name = item.level1_name
		const level2Name = item.level2_name || ''

		if (level1Name === '项目历史以来环评报告及批复') {
			if (level2Name.includes('环评报告')) {
				return item.submitted1_1 || false
			}
			if (level2Name.includes('批复')) {
				return item.submitted1_2 || false
			}
		} else if (level1Name === '（房地产项目提供）房地产相关证件') {
			if (level2Name.includes('施工证')) {
				return item.submitted3_1 || false
			}
			if (level2Name.includes('规划许可证')) {
				return item.submitted3_2 || false
			}
			if (level2Name.includes('规划验收合格证')) {
				return item.submitted3_3 || false
			}
		}

		return item.submitted || false
	}

	// 修改上传文件函数，支持子项类型
	async function uploadTizidanFile(recordId, subType = null) {
		if (!recordId) {
			uni.showToast({
				title: '记录ID不存在',
				icon: 'none'
			})
			return
		}

		// 选择多个文件
		uni.chooseFile({
			count: 9,
			extension: ['.doc', '.docx', '.pdf', '.xls', '.xlsx', '.png', '.jpg', '.jpeg', '.zip', '.rar',
				'.dwg', '.dxf'
			],
			success: async (chooseRes) => {
				const tempFiles = chooseRes.tempFiles

				// 逐个上传文件
				for (let i = 0; i < tempFiles.length; i++) {
					await uploadSingleFile(recordId, subType, tempFiles[i])
				}

				// 重新加载数据
				await fetchTizidanData()

				uni.showToast({
					title: `已成功上传${tempFiles.length}个文件`,
					icon: 'success',
					duration: 3000
				})
			},
			fail: (err) => {
				console.error('选择文件失败:', err)
				uni.showToast({
					title: '选择文件失败',
					icon: 'none'
				})
			}
		})
	}

	// 修改删除文件函数，支持子项类型
	async function deleteTizidanFile(recordId, subType, fileIndex) {
		// 从当前数据中查找项目
		const item = tizidanItems.value.find(item => item.record_id === recordId)
		if (!item) {
			uni.showToast({
				title: '记录不存在',
				icon: 'none'
			})
			return
		}

		// 获取文件列表
		const files = getItemFiles(item)
		if (fileIndex >= files.length) {
			uni.showToast({
				title: '文件不存在',
				icon: 'none'
			})
			return
		}

		const fileName = files[fileIndex].name

		uni.showModal({
			title: '确认删除',
			content: `确定要删除文件 "${fileName}" 吗？删除后不可恢复。`,
			success: async (res) => {
				if (res.confirm) {
					// 调用后端删除接口
					uni.showLoading({
						title: '删除中...'
					})

					try {
						const response = await new Promise((resolve, reject) => {
							uni.request({
								url: eco_baseUrl +
									'/api/v1/completion/tzdDetail/delete_file_by_id',
								method: 'POST',
								header: {
									'Content-Type': 'application/json'
								},
								data: {
									record_id: recordId,
									file_name: fileName,
									user_id: user_id,
									project_id: project_id
								},
								success: (res) => resolve(res),
								fail: (err) => reject(err)
							})
						})

						if (response.statusCode === 200 && response.data.success) {
							// 重新加载数据
							await fetchTizidanData()

							uni.showToast({
								title: '文件删除成功',
								icon: 'success'
							})
						} else {
							throw new Error(response.data?.message || '删除失败')
						}
					} catch (error) {
						console.error('删除文件失败:', error)
						uni.showToast({
							title: `删除失败: ${error.message}`,
							icon: 'none'
						})
					} finally {
						uni.hideLoading()
					}
				}
			}
		})
	}

	// 获取提资单数据时，确保正确处理子项数据
	async function fetchTizidanData() {
		try {
			uni.showLoading({
				title: '加载中...'
			})

			const response = await new Promise((resolve, reject) => {
				uni.request({
					url: eco_baseUrl + '/api/v1/completion/tzdDetail/datasheet',
					method: 'GET',
					data: {
						user_id: user_id,
						project_id: project_id,
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

				// 直接使用后端返回的数据
				tizidanItems.value = data.items

				console.log('提资单数据加载完成:', tizidanItems.value)

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
		} finally {
			uni.hideLoading()
		}
	}


	// 上传单个文件
	async function uploadSingleFile(recordId, subType, file) {
		uni.showLoading({
			title: '上传文件中...',
			mask: true
		})

		try {
			// 使用 record_id 进行上传
			const response = await new Promise((resolve, reject) => {
				uni.uploadFile({
					url: eco_baseUrl + '/api/v1/completion/tzdDetail/upload_file_by_id',
					filePath: file.path,
					name: 'file',
					formData: {
						record_id: recordId,
						user_id: user_id,
						project_id: project_id,
					},
					success: (uploadRes) => {
						if (uploadRes.statusCode === 200) {
							try {
								const data = JSON.parse(uploadRes.data)
								resolve(data)
							} catch (e) {
								reject(new Error('解析响应失败'))
							}
						} else {
							reject(new Error(`上传失败，状态码：${uploadRes.statusCode}`))
						}
					},
					fail: (err) => {
						reject(new Error('网络请求失败'))
					}
				})
			})

			if (!response.success) {
				throw new Error(response.message || '文件上传失败')
			}

		} catch (error) {
			console.error(`文件上传失败:`, error)
			uni.showToast({
				title: `文件上传失败: ${error.message}`,
				icon: 'none',
				duration: 3000
			})
		} finally {
			uni.hideLoading()
		}
	}

	// 提交其他需要提供的资料
	async function submitOtherMaterials(recordId) {
		// 找到对应的项目
		const itemIndex = tizidanItems.value.findIndex(item => item.record_id === recordId)
		if (itemIndex === -1) {
			uni.showToast({
				title: '项目不存在',
				icon: 'none'
			})
			return
		}

		const item = tizidanItems.value[itemIndex]
		const memoContent = item.customText || ''

		if (!memoContent.trim()) {
			uni.showToast({
				title: '请输入其他需要提供的资料',
				icon: 'none'
			})
			return
		}

		uni.showLoading({
			title: '提交中...',
			mask: true
		})

		try {
			const response = await new Promise((resolve, reject) => {
				uni.request({
					url: eco_baseUrl + '/api/v1/completion/tzdDetail/update_memo',
					method: 'POST',
					header: {
						'Content-Type': 'application/json'
					},
					data: {
						record_id: recordId,
						memo: memoContent,
						user_id: user_id,
						project_id: project_id
					},
					success: (res) => resolve(res),
					fail: (err) => reject(err)
				})
			})

			if (response.statusCode === 200) {
				const data = response.data
				if (data.success) {
					// 更新前端的提交状态
					item.submitted = true

					// 更新memo字段
					item.memo = memoContent

					uni.showToast({
						title: '提交成功',
						icon: 'success',
						duration: 2000
					})

					// 重新加载数据以确保状态同步
					setTimeout(() => {
						fetchTizidanData()
					}, 1000)
				} else {
					throw new Error(data.message || '提交失败')
				}
			} else if (response.statusCode === 422) {
				// 处理422错误
				const errorData = response.data || {}
				let errorMsg = '提交失败: 数据格式错误'
				if (errorData.detail) {
					// FastAPI返回的422错误详情
					if (Array.isArray(errorData.detail)) {
						errorMsg = errorData.detail.map(d => d.msg).join('; ')
					} else if (typeof errorData.detail === 'string') {
						errorMsg = errorData.detail
					}
				}
				throw new Error(errorMsg)
			} else {
				throw new Error(`服务器错误: ${response.statusCode}`)
			}
		} catch (error) {
			console.error('提交失败:', error)
			uni.showToast({
				title: `提交失败: ${error.message}`,
				icon: 'none',
				duration: 3000
			})
		} finally {
			uni.hideLoading()
		}
	}

	// 提资单数据
	const downloadUrls = ref({
		TiZiDan_Doc: '',
		comparison_list: ''
	})


	// 检查所有文件是否为空
	function areAllFilesEmpty(item) {
		// 检查主文件列表
		if (item.files && item.files.length > 0) return false

		// 检查各个子文件列表
		const subFileKeys = ['files1_1', 'files1_2', 'files3_1', 'files3_2', 'files3_3']
		for (const key of subFileKeys) {
			if (item[key] && item[key].length > 0) return false
		}

		return true
	}



	// 生成并下载验收报告提资单
	async function downloadTizidanFile() {
		if (!selectedProjectId.value) {
			uni.showToast({
				title: '请先选择项目',
				icon: 'none'
			})
			return
		}


		// 显示下载中提示
		uni.showLoading({
			title: '正在生成文档…',
			mask: true
		})


		try {
			// 调用后端下载接口
			const url =
				eco_baseUrl +
				`/api/v1/completion/tzdDetail/download_tzd_doc?user_id=${user_id}&project_id=${project_id}`

			// #ifdef H5
			// H5环境：直接打开链接
			window.open(url, '_blank')
			// #endif

			// #ifdef MP-WEIXIN
			// 微信小程序环境：使用uni.downloadFile
			const downloadTask = uni.downloadFile({
				url: url,
				success: (res) => {
					if (res.statusCode === 200) {
						const filePath = res.tempFilePath
						uni.saveFile({
							tempFilePath: filePath,
							success: (saveRes) => {
								console.log('文件保存成功:', saveRes.savedFilePath)
								uni.showToast({
									title: '文件已保存',
									icon: 'success'
								})
							},
							fail: (saveErr) => {
								console.error('保存文件失败:', saveErr)
								uni.showToast({
									title: '保存失败',
									icon: 'none'
								})
							}
						})
					} else {
						throw new Error(`下载失败，状态码: ${res.statusCode}`)
					}
				},
				fail: (err) => {
					throw new Error('下载请求失败: ' + (err.errMsg || '未知错误'))
				}
			})
			// #endif

			// #ifdef APP-PLUS
			// App环境：使用plus.downloader
			const dtask = plus.downloader.createDownload(url, {}, (d, status) => {
				if (status == 200) {
					console.log('下载成功：' + d.filename)
					uni.showToast({
						title: '下载成功',
						icon: 'success'
					})
				} else {
					console.log('下载失败：' + status)
					uni.showToast({
						title: '下载失败',
						icon: 'none'
					})
				}
			})
			dtask.start()
			// #endif

			uni.showToast({
				title: '开始下载',
				icon: 'success'
			})

		} catch (error) {
			console.error('下载失败:', error)
			uni.showToast({
				title: '下载失败: ' + (error.message || '未知错误'),
				icon: 'none',
				duration: 3000
			})
		} finally {
			uni.hideLoading()
		}
	}

	// 添加URL格式化函数，确保URL格式正确
	function formatDownloadUrl(url) {
		if (!url) return ''

		// 如果URL是相对路径，添加基础URL
		if (url.startsWith('/')) {
			return `{eco_baseUrl}${url}`
		}

		// 如果URL已经是完整路径，直接返回
		if (url.startsWith('http://') || url.startsWith('https://')) {
			return url
		}
		return url
	}


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


	// 监听步骤变化
	watch(currentStep, (newVal) => {
		if (newVal === 2) {
			// 进入提资单比对步骤时获取数据
			fetchTizidanData()
		}
	})

	const baseTable = ref([])
	const datasheet = ref([])


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

	//by wilson 提资单代码在这里结束
	
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
	
	// 项目搜索框
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

	.file-name {
		font-size: 28rpx;
		color: #1f2937;
		font-weight: 500;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
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

	.modal-actions {
		display: flex;
		gap: 12rpx;
		padding: 0 24rpx 24rpx;
		justify-content: flex-end;
	}

	/* ==========wilson 提资单样式比对样式 ========== */
	/* ========== 提资单比对模块优化 ========== */
	/* 步骤2容器 */
	.tizidan-container {
		background: $white;
		border-radius: $radius-lg;
		border: 1rpx solid #eef2f6;
		padding: 32rpx;
		margin-bottom: 24rpx;
		box-shadow: $shadow-sm;
	}

	/* 头部区域 */
	.tizidan-header {
		margin-bottom: 32rpx;
		text-align: center;
		padding-bottom: 24rpx;
		border-bottom: 2rpx solid #f1f5f9;
	}

	.tizidan-title {
		display: block;
		font-size: 36rpx;
		color: $ink;
		font-weight: 700;
		margin-bottom: 12rpx;
		line-height: 1.4;
	}

	.tizidan-subtitle {
		display: block;
		font-size: 28rpx;
		color: $muted;
		line-height: 1.5;
	}

	/* 分组容器 */
	.tizidan-section {
		background: #fafbfd;
		border-radius: 16rpx;
		border: 1rpx solid #e9edf2;
		margin-bottom: 32rpx;
		overflow: hidden;
		transition: all 0.3s ease;
	}

	.tizidan-section:hover {
		box-shadow: 0 8rpx 32rpx rgba(22, 101, 52, 0.08);
		border-color: #d1f5ea;
	}

	/* 分组头部 */
	.tizidan-section-header {
		display: flex;
		align-items: center;
		gap: 16rpx;
		padding: 24rpx 32rpx;
		background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
		border-bottom: 1rpx solid #dcfce7;
	}

	.tizidan-section-number {
		font-size: 32rpx;
		font-weight: 700;
		color: $brand;
		min-width: 40rpx;
		text-align: center;
	}

	.tizidan-section-title {
		font-size: 30rpx;
		font-weight: 700;
		color: $ink;
		line-height: 1.4;
		flex: 1;
	}

	/* 项目卡片 */
	.tizidan-item-card {
		background: $white;
		border-bottom: 1rpx solid #f1f5f9;
		padding: 28rpx 32rpx;
		transition: all 0.2s ease;
	}

	.tizidan-item-card:last-child {
		border-bottom: none;
	}

	.tizidan-item-card:hover {
		background: #f8fafc;
	}

	/* 项目头部 */
	.tizidan-item-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 20rpx;
		flex-wrap: wrap;
		gap: 16rpx;
	}

	.tizidan-item-left {
		display: flex;
		align-items: flex-start;
		gap: 16rpx;
		flex: 1;
		min-width: 0;
	}

	.tizidan-item-number {
		font-size: 28rpx;
		font-weight: 700;
		color: $brand;
		min-width: 40rpx;
		background: #f0fdf4;
		border-radius: 8rpx;
		padding: 4rpx 8rpx;
		text-align: center;
		flex-shrink: 0;
	}

	.tizidan-item-content {
		flex: 1;
		min-width: 0;
	}

	.tizidan-item-title {
		font-size: 28rpx;
		font-weight: 600;
		color: $ink;
		line-height: 1.5;
		margin-bottom: 4rpx;
	}

	/* 复选框区域 */
	.tizidan-checkbox-group {
		flex-shrink: 0;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 12rpx;
		cursor: pointer;
		padding: 8rpx 16rpx;
		background: #f8fafc;
		border-radius: 10rpx;
		border: 1rpx solid #e9edf2;
		transition: all 0.2s ease;
	}

	.checkbox-label:active {
		background: #f1f5f9;
		border-color: #d1dbe5;
	}

	.checkbox-text {
		font-size: 26rpx;
		color: $muted;
		font-weight: 500;
	}

	/* 禁用状态 */
	.tizidan-item-disabled {
		display: flex;
		align-items: center;
		gap: 12rpx;
		padding: 24rpx;
		background: #f9fafb;
		border-radius: 12rpx;
		border: 2rpx dashed #d1d5db;
		text-align: center;
		justify-content: center;
		margin-top: 16rpx;
	}

	.disabled-text {
		font-size: 26rpx;
		color: #9ca3af;
		font-weight: 500;
	}

	/* 项目主体 */
	.tizidan-item-body {
		background: #ffffff;
		border-radius: 12rpx;
		border: 1rpx solid #eef2f6;
		padding: 24rpx;
		margin-top: 16rpx;
	}

	/* 操作区域 */
	.tizidan-item-actions {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 20rpx;
		padding-bottom: 20rpx;
		border-bottom: 1rpx solid #f1f5f9;
	}

	.tizidan-file-count {
		display: flex;
		align-items: center;
		gap: 8rpx;
		padding: 8rpx 16rpx;
		background: #ecfdf5;
		border-radius: 20rpx;
		border: 1rpx solid #d1fae5;
	}

	.file-count-text {
		font-size: 24rpx;
		color: $brand;
		font-weight: 500;
	}

	/* 文件列表 */
	.tizidan-file-list {
		display: flex;
		flex-direction: column;
		gap: 12rpx;
		margin-top: 16rpx;
	}

	.tizidan-file-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20rpx;
		background: #f8fafc;
		border-radius: 12rpx;
		border: 1rpx solid #e9edf2;
		transition: all 0.2s ease;
	}

	.tizidan-file-item:hover {
		background: #f1f5f9;
		border-color: #d1dbe5;
	}

	.tizidan-file-info {
		display: flex;
		align-items: center;
		gap: 16rpx;
		flex: 1;
		min-width: 0;
	}

	.tizidan-file-name {
		font-size: 26rpx;
		color: $ink;
		font-weight: 500;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		flex: 1;
	}

	.tizidan-file-size {
		font-size: 24rpx;
		color: $muted;
		flex-shrink: 0;
		margin-left: 8rpx;
	}

	/* 其他资料输入 */
	.tizidan-other-input {
		margin-bottom: 24rpx;
		padding: 20rpx;
		background: #f8fafc;
		border-radius: 12rpx;
		border: 1rpx solid #e9edf2;
	}

	.custom-textarea {
		width: 100%;
		margin-bottom: 16rpx;
		border-radius: 10rpx;
		border: 1rpx solid #e2e8f0;
	}

	/* 底部区域 */
	.tizidan-footer {
		margin-top: 40rpx;
		padding-top: 32rpx;
		border-top: 2rpx solid #eef2f6;
	}

	.footer-content {
		display: flex;
		flex-direction: column;
		gap: 24rpx;
	}

	/* 资料接收者信息*/
	.contact-info-section {
		background: #f0fdf4;
		border-radius: 16rpx;
		border: 1rpx solid #dcfce7;
		padding: 28rpx 32rpx;
		margin-bottom: 20rpx;
	}

	.contact-info-header {
		display: flex;
		align-items: center;
		gap: 12rpx;
		margin-bottom: 24rpx;
	}

	.contact-info-title {
		font-size: 30rpx;
		color: $brand;
		font-weight: 700;
	}

	.contact-info-form {
		display: grid;
		gap: 20rpx;
	}

	.contact-info-item {
		display: flex;
		flex-direction: column;
		gap: 8rpx;
	}

	.contact-info-label {
		font-size: 26rpx;
		color: $ink;
		font-weight: 600;
	}

	.contact-info-input {
		width: 100%;
		border-radius: 10rpx;
		border: 1rpx solid #e2e8f0;
		background: $white;
	}

	.footer-text {
		font-size: 26rpx;
		color: $muted;
		text-align: center;
		line-height: 1.6;
		padding: 16rpx 0;
	}

	/* 小按钮样式 */
	.btn.btn--small {
		height: 60rpx;
		padding: 0 24rpx;
		font-size: 24rpx;
		gap: 8rpx;
		border-radius: 10rpx;
	}

	.btn.btn--icon {
		width: 60rpx;
		height: 60rpx;
		padding: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 10rpx;
		background: #fef2f2;
		border: 1rpx solid #fee2e2;
	}

	.btn.btn--icon:active {
		background: #fee2e2;
		transform: scale(0.95);
	}

	/* ========== 响应式设计 ========== */
	/* 移动端适配 */
	@media (max-width: 768px) {
		.tizidan-container {
			padding: 24rpx 20rpx;
			margin-bottom: 20rpx;
		}

		.tizidan-title {
			font-size: 32rpx;
		}

		.tizidan-subtitle {
			font-size: 26rpx;
		}

		.tizidan-section-header {
			padding: 20rpx 24rpx;
			flex-direction: column;
			align-items: flex-start;
			gap: 12rpx;
		}

		.tizidan-section-number {
			font-size: 30rpx;
		}

		.tizidan-section-title {
			font-size: 28rpx;
		}

		.tizidan-item-card {
			padding: 24rpx;
		}

		.tizidan-item-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 16rpx;
		}

		.tizidan-checkbox-group {
			width: 100%;
		}

		.checkbox-label {
			width: 100%;
			justify-content: center;
		}

		.contact-info-form {
			gap: 16rpx;
		}

		.contact-info-section {
			padding: 24rpx;
		}

		.tizidan-file-item {
			flex-direction: column;
			align-items: flex-start;
			gap: 16rpx;
		}

		.tizidan-file-info {
			width: 100%;
			flex-wrap: wrap;
		}
	}

	/* PC端适配 */
	@media (min-width: 769px) {
		.tizidan-container {
			max-width: 1200rpx;
			margin: 0 auto 32rpx;
		}

		.contact-info-form {
			grid-template-columns: repeat(3, 1fr);
			gap: 24rpx;
		}

		.contact-info-item {
			margin-bottom: 0;
		}

		.footer-content {
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
		}

		.footer-text {
			flex: 1;
			text-align: left;
			padding-right: 32rpx;
		}

		.tizidan-file-item {
			flex-direction: row;
			align-items: center;
		}
	}

	/* 超大屏幕适配 */
	@media (min-width: 1200px) {
		.tizidan-container {
			padding: 48rpx;
		}

		.tizidan-section {
			margin-bottom: 40rpx;
		}

		.tizidan-section-header {
			padding: 32rpx 40rpx;
		}

		.tizidan-section-title {
			font-size: 32rpx;
		}

		.tizidan-item-card {
			padding: 32rpx 40rpx;
		}

		.contact-info-section {
			padding: 32rpx 40rpx;
		}
	}

	/* 加载失败提示 */
	.tizidan-container .empty-state {
		padding: 60rpx 32rpx;
		background: #f8fafc;
		border-radius: 16rpx;
		border: 2rpx dashed #e2e8f0;
		margin: 20rpx 0;
	}

	.tizidan-container .empty-state uni-icons {
		margin-bottom: 16rpx;
	}

	.tizidan-container .empty-state .empty-text {
		font-size: 30rpx;
		margin-bottom: 8rpx;
	}

	.tizidan-container .empty-state .empty-tip {
		font-size: 26rpx;
		margin-bottom: 24rpx;
	}

	/* 悬停效果优化 */
	.tizidan-item-card,
	.tizidan-file-item,
	.tizidan-section {
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.tizidan-item-card:hover {
		transform: translateY(-2rpx);
	}

	/* 边框和阴影优化 */
	.tizidan-container,
	.tizidan-section,
	.tizidan-item-body,
	.tizidan-other-input,
	.contact-info-section {
		box-shadow: 0 2rpx 12rpx rgba(22, 101, 52, 0.05);
	}

	.tizidan-container:active,
	.tizidan-section:active,
	.tizidan-item-body:active {
		box-shadow: 0 4rpx 20rpx rgba(22, 101, 52, 0.08);
	}
</style>