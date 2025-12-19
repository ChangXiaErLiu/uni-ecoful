<template>
	<view class="field-survey-container">
		<view class="section-card">
			<view class="section-header">
				<uni-icons type="map-pin-ellipse" size="20" color="#166534" />
				<text class="section-title">现场踏勘比对</text>
			</view>
			<view class="section-body">
				<view class="form-group">
					<text class="form-label">现场踏勘记录</text>
					<text class="form-tip">记录现场踏勘发现的问题和差异</text>
				</view>

				<!-- Tab切换 -->
				<view class="reconnoitre-tabs">
					<view class="tabs-container">
						<view v-for="(tab, index) in tabs" :key="index" class="tab-item"
							:class="{ 'tab-item--active': currentTab === index }" @tap="handleTabClick(index)">
							<text class="tab-label">{{ tab }}</text>
						</view>
					</view>
				</view>

				<!-- 现场踏勘四个功能 -->
				<view class="reconnoitre-content">
					<scroll-view class="content-scroll" scroll-y>
						<!-- Tab 0: 主要建设内容 -->
						<view v-show="currentTab === 0" class="content-section">
							<MainContentTab />
						</view>

						<!-- Tab 1: 设备列表情况 -->
						<view v-show="currentTab === 1" class="content-section">
							<EquipmentTab :userId="userId" :projectId="projectId" />
						</view>

						<!-- Tab 2: 污染物设施情况 -->
						<view v-show="currentTab === 2" class="content-section">
							<FacilityTab />
						</view>

						<!-- Tab 3: 排污口情况 -->
						<view v-show="currentTab === 3" class="content-section">
							<OutletTab :signboard="signboard" :baseTable="baseTable"
								@generate-signboard="$emit('generate-signboard')" />
						</view>
					</scroll-view>
				</view>

				<!-- 生成比对清单 -->
				<view class="subsection">
					<view class="subsection-head">
						<uni-icons type="list" size="18" color="#166534" />
						<text class="subsection-title">现场踏勘比对清单</text>
					</view>

					<view class="section-actions">
						<button class="btn btn--primary" @tap="handleGenerateComparison">
							<uni-icons type="gear" size="16" color="#ffffff" />
							<text>生成详细比对清单</text>
						</button>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { useFieldSurveyData } from '@/composables/useFieldSurveyData.js'
import MainContentTab from './tabs/MainContentTab.vue'
import EquipmentTab from './tabs/EquipmentTab.vue'
import FacilityTab from './tabs/FacilityTab.vue'
import OutletTab from './tabs/OutletTab.vue'

const props = defineProps({
	// 用户ID和项目ID，用于设备数据获取
	userId: {
		type: [String, Number],
		required: true
	},
	projectId: {
		type: [String, Number],
		required: true
	},
	// 排污标识牌数据（来自步骤0）
	signboard: {
		type: Object,
		required: true
	},
	// 基本信息表（用于排污口Tab查找数据）
	baseTable: {
		type: Array,
		default: () => []
	},
	// 提资单数据（用于生成比对清单）
	datasheet: {
		type: Array,
		default: () => []
	}
})

const emit = defineEmits(['generate-signboard'])

const {
	tabs,
	currentTab,
	handleTabChange,
	generateFieldworkComparison
} = useFieldSurveyData()

// 处理Tab点击
function handleTabClick(index) {
	handleTabChange(index, props.userId, props.projectId)
}

// 处理生成比对清单
function handleGenerateComparison() {
	generateFieldworkComparison(props.datasheet)
}
</script>

<style scoped lang="scss">
.field-survey-container {
	width: 100%;
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

/* 响应式设计 - 移动端 */
@media (max-width: 768px) {
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
}

/* 平板端适配 */
@media (min-width: 769px) and (max-width: 1024px) {
	.reconnoitre-tabs {
		padding: 0 24rpx;
	}

	.tab-item {
		padding: 22rpx 12rpx;
	}

	.tab-label {
		font-size: 26rpx;
	}
}

/* PC端优化 */
@media (min-width: 1025px) {
	.tab-item:hover {
		background: #f8fafc;
	}

	.tab-item:hover .tab-label {
		color: #166534;
	}
}
</style>
