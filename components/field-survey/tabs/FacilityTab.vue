<template>
	<view class="facility-tab">
		<view class="section-card">
			<view class="section-header">
				<uni-icons type="flag" size="20" color="#166534" />
				<text class="section-title">污染物治理设施情况</text>
			</view>
			<view class="section-body">
				<view class="section-actions">
					<button class="btn btn--ghost" @tap="addPollutionFacility">
						<uni-icons type="plus" size="16" color="#166534" />
						<text>新增设施</text>
					</button>
				</view>

				<!-- 设施卡片列表 -->
				<view v-if="pollutionFacilityList.length" class="facility-list">
					<view v-for="(item, index) in pollutionFacilityList" :key="item.id" class="facility-card">
						<!-- 卡片内容 -->
						<view class="facility-card__body">
							<!-- 设施名称 -->
							<view class="facility-field">
								<text class="facility-field__label">设施名称</text>
								<uni-easyinput v-model="item.name" placeholder="请输入设施名称" :clearable="true"
									class="facility-field__input" />
							</view>

							<!-- 数量和备注（横向布局） -->
							<view class="facility-field-row">
								<view class="facility-field facility-field--half">
									<text class="facility-field__label">数量</text>
									<uni-easyinput v-model="item.quantity" placeholder="数量" :clearable="true"
										class="facility-field__input" />
								</view>
								<view class="facility-field facility-field--half">
									<text class="facility-field__label">备注</text>
									<uni-easyinput v-model="item.remark" placeholder="备注信息" :clearable="true"
										class="facility-field__input" />
								</view>
							</view>

							<!-- 图片上传 -->
							<view class="facility-field">
								<text class="facility-field__label">设施图片（最多3张）</text>
								<uni-file-picker v-model="item.images" fileMediatype="image" mode="grid" :limit="3"
									:auto-upload="false" class="facility-field__picker" />
							</view>
						</view>
						<!-- 卡片头部 -->
						<view class="facility-card__header">
							<view class="facility-card__number">
								<text class="facility-card__number-text">#{{ index + 1 }}</text>
							</view>
							<button class="facility-card__delete" @tap="() => removePollutionFacility(index)">
								<uni-icons type="trash" size="16" color="#ef4444" />
							</button>
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
</template>

<script setup>
import { useFieldSurveyData } from '@/composables/useFieldSurveyData.js'

const {
	pollutionFacilityList,
	addPollutionFacility,
	removePollutionFacility
} = useFieldSurveyData()
</script>

<style scoped>
/* 样式继承自主页面 */
.facility-tab {
	width: 100%;
}
</style>
