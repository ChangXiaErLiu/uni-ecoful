<template>
	<view class="main-content-tab">
		<view class="section-card">
			<view class="section-header">
				<uni-icons type="list" size="20" color="#166534" />
				<text class="section-title">主要建设内容</text>
			</view>
			<view class="section-body">
				<view class="section-actions">
					<button v-if="selectModeMain" class="btn btn--danger" :disabled="!selectedMainIds.length"
						@tap="removeSelectedMain">
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
								<uni-file-picker v-model="item.value" fileMediatype="image" mode="grid" :limit="9"
									:auto-upload="false" />
							</view>

							<!-- 普通文本字段 -->
							<uni-easyinput v-else class="form-item__input" v-model="item.value" placeholder="请输入具体的值"
								:clearable="true" />

							<view v-if="selectModeMain" class="form-item__select">
								<checkbox :checked="selectedMainIds.includes(item.id)"
									@tap="() => toggleSelectedMain(item.id)" />
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
</template>

<script setup>
import { useFieldSurveyData } from '@/composables/useFieldSurveyData.js'

const {
	mainContentTable,
	selectModeMain,
	selectedMainIds,
	toggleSelectModeMain,
	toggleSelectedMain,
	removeSelectedMain
} = useFieldSurveyData()
</script>

<style scoped>
/* 样式继承自主页面，这里只做必要的调整 */
.main-content-tab {
	width: 100%;
}
</style>
