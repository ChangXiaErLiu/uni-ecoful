<template>
	<view class="signboard-tab">
		<!-- 标识牌信息生成 -->
		<view class="subsection">
			<view class="subsection-head">
				<uni-icons type="list" size="18" color="#fb923c" />
				<text class="subsection-title">排污标识牌（下载与业主确认排污口信息）</text>
			</view>
			
			<view class="section-actions">
				<button class="btn btn--primary" @tap="handleGenerate">
					<uni-icons type="eye-filled" size="16" color="#ffffff" />
					<text>生成标识牌信息</text>
				</button>
				<button v-if="showSignboard" class="btn btn--primary" @tap="handleDownload">
					<uni-icons type="download-filled" size="16" color="#ffffff" />
					<text>下载</text>
				</button>
				<button v-if="showSignboard" class="btn btn--success" @tap="handleComplete">
					<uni-icons type="redo-filled" size="16" color="#ffffff" />
					<text>生成监测方案</text>
				</button>
			</view>
			
			<!-- 标识牌信息列表 -->
			<view v-if="showSignboard" class="data-table">
				<view class="table-body">
					<template v-for="(sec, si) in signboard.sections" :key="'s'+si">
						<view class="table-row table-row--simple">
							<text class="table-td table-td--section">{{ sec.block }}</text>
							<!-- 只有噪声才可以新增 -->
							<button v-if="sec.block == '噪声'" class="pw-ico icon-btn" @tap="() => addSignItem(si)">
								<uni-icons type="plus" size="16" color="#166534" />
								<text>新增</text>
							</button>
						</view>
						
						<view class="form-grid form-grid--base">
							<!-- 按组渲染 -->
							<template v-for="(group, gi) in groupItems(sec.items, sec.block)" :key="'g'+si+'-'+gi">
								<view class="form-item" v-for="(it, ii) in group" :key="'r'+si+'-'+gi+'-'+ii">
									<view class="form-item__row">
										<uni-easyinput v-model="it.title" placeholder="内容标题" />
										<uni-easyinput v-model="it.content" placeholder="请输入具体的值" />
									</view>
								</view>
								
								<!-- 删除按钮 -->
								<view v-if="sec.block !== '危险废物'" class="form-item" style="margin-bottom:12px;">
									<view class="form-item__row" style="justify-content:flex-end;">
										<button class="icon-btn icon-btn--danger" @tap="() => removeGroup(sec, gi)">
											<uni-icons type="trash" size="20" color="#d92d20" />
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
</template>

<script setup>
import { useProjectInfo } from '@/composables/useProjectInfo.js'

// 从 composable 获取状态和方法
const {
	signboard,
	showSignboard,
	
	// 方法
	generateSignboard,
	addSignItem,
	removeGroup,
	groupItems,
	downloadSignboard
} = useProjectInfo()

// 定义事件
const emit = defineEmits(['complete'])

// 处理生成
function handleGenerate() {
	generateSignboard()
	showSignboard.value = true
}

// 处理下载
function handleDownload() {
	downloadSignboard()
}

// 处理完成（通知父组件可以进入下一步）
function handleComplete() {
	emit('complete')
}
</script>


<style scoped lang="scss">
.signboard-tab {
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
	color: #fb923c;
}

// 操作按钮样式
.section-actions {
	display: flex;
	gap: 16rpx;
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

.btn--primary {
	background: #166534;
	color: #ffffff;
}

.btn--primary:active {
	background: #14532d;
}

.btn--success {
	background: #059669;
	color: #ffffff;
}

.btn--success:active {
	background: #047857;
}

// 数据表格样式
.data-table {
	width: 100%;
}

.table-body {
	display: flex;
	flex-direction: column;
}

.table-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx 24rpx;
	background: #dcfce7;
	border-radius: 12rpx;
	margin-top: 16rpx;
}

.table-td {
	font-size: 28rpx;
	font-weight: 600;
	color: #1e293b;
}

.table-td--section {
	color: #166534;
}

.pw-ico {
	display: flex;
	align-items: center;
	gap: 8rpx;
	height: 55rpx;
}

.icon-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8rpx;
	font-size: 24rpx;
	font-weight: 500;
	background: #ffffff;
	color: #166534;
	border: 2rpx solid #166534;
	border-radius: 8rpx;
	cursor: pointer;
	transition: all 0.3s ease;
}

.icon-btn:active {
	background: #f0fdf4;
}

.icon-btn--danger {
	height: 70rpx;
}

.icon-btn--danger:active {
	background: #fef2f2;
}

// 表单网格样式
.form-grid {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.form-grid--base {
	padding: 24rpx;
	background: #ffffff;
	border-radius: 12rpx;
	border: 1rpx solid #e2e8f0;
}

.form-item {
	width: 100%;
}

.form-item__row {
	display: flex;
	gap: 16rpx;
	align-items: center;
}

.form-item__row .uni-easyinput {
  flex: 1;
}

// 响应式设计
@media (max-width: 768px) {
	.section-actions {
		flex-direction: column;
	}
	
	.btn {
		width: 100%;
	}
	
	.form-item__row .uni-easyinput {
	  flex: 1;
	}
	.form-item__row button {
	  flex-shrink: 0;
	}
}
</style>
