<template>
	<view class="outlet-tab">
		<view class="section-card">
			<view class="section-header">
				<uni-icons type="water" size="20" color="#166534" />
				<text class="section-title">排污口情况</text>
			</view>
			<view class="section-body">
				<view class="section-actions">
					<button class="btn btn--primary" @tap="handleShowSignboard">
						<uni-icons type="eye-filled" size="16" color="#ffffff" />
						<text>排污口信息</text>
					</button>
				</view>

				<!-- 排污口标识牌信息列表 -->
				<view v-if="showSignboard && signboard" class="data-table">
					<view class="table-body">
						<template v-for="(sec, si) in signboard.sections" :key="'s'+si">
							<view class="table-row table-row--simple">
								<text class="table-td table-td--section">{{ sec.block }}</text>
								<!-- 只有噪声才可以新增 -->
								<button v-if="sec.block == '噪声'" class="pw-ico icon-btn" @tap="() => handleAddSignItem(si)">
									<uni-icons type="plus" size="16" color="#166534" />
									<text>新增</text>
								</button>
							</view>
							<view class="form-grid form-grid--base">
								<!-- 按组渲染，每组 3 条，除了危废以外 -->
								<template v-for="(group, gi) in groupItems(sec.items, sec.block)" :key="'g'+si+'-'+gi">
									<!-- 普通 3 条 -->
									<view class="form-item" v-for="(it, ii) in group" :key="'r'+si+'-'+gi+'-'+ii">
										<view class="form-item__row">
											<uni-easyinput v-model="it.title" placeholder="内容标题" />
											<uni-easyinput v-model="it.content" placeholder="请输入具体的值" />
										</view>
									</view>

									<!-- 删除按钮：只有「非危险废物」才显示 -->
									<view v-if="sec.block !== '危险废物'" class="form-item" style="margin-bottom:12px;">
										<view class="form-item__row" style="justify-content:flex-end;">
											<button class="icon-btn icon-btn--danger" @tap="() => handleRemoveGroup(sec, gi)">
												<uni-icons type="trash" size="16" color="#d92d20" />
											</button>
										</view>
									</view>
								</template>
							</view>
						</template>
					</view>
				</view>

				<view v-else class="empty-state">
					<uni-icons type="water" size="48" color="#cbd5e1" />
					<text class="empty-text">排污口信息</text>
					<text class="empty-tip">点击生成按钮获取排污口信息</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
	// 从父组件接收signboard数据
	signboard: {
		type: Object,
		required: true
	},
	// 从父组件接收baseTable用于查找基本信息
	baseTable: {
		type: Array,
		default: () => []
	}
})

const emit = defineEmits(['update:signboard'])

const showSignboard = ref(false)

// 显示标识牌
function handleShowSignboard() {
	showSignboard.value = true
	emit('generate-signboard')
}

// 添加一组排污标识牌（只允许噪声新增）
function handleAddSignItem(sectionIdx) {
	const sec = props.signboard.sections[sectionIdx]
	const block = sec.block

	// 只允许噪声新增
	if (block !== '噪声') {
		uni.showToast({
			title: '只有噪声可以手动新增',
			icon: 'none'
		})
		return
	}

	// 从baseTable中提取单位名称
	const unitName = findBaseValue('建设单位名称') || findBaseValue('单位名称') || ''

	// 计算下一个排放口编号
	let maxNum = 0
	for (let i = 0; i < sec.items.length; i += 3) {
		const codeItem = sec.items[i + 1]
		if (codeItem && codeItem.title === '排放口编号') {
			const code = codeItem.content || ''
			const match = code.match(/\d+/)
			if (match) {
				const num = parseInt(match[0], 10)
				if (num > maxNum) maxNum = num
			}
		}
	}

	// 生成新编号
	let code = ''
	if (block === '废水') code = `DW${String(maxNum + 1).padStart(3,'0')}`
	else if (block === '废气') code = `DA${String(maxNum + 1).padStart(3,'0')}`
	else if (block === '噪声') code = `ZS-${String(maxNum + 1).padStart(2,'0')}`

	// 组装一组
	const group = [
		{ title: '单位名称', content: unitName },
		{ title: '排放口编号', content: code },
		{ title: '污染因子', content: '设备噪声' }
	]

	// 追加到当前块
	sec.items.push(...group)

	uni.showToast({
		title: '已添加新排污口',
		icon: 'success'
	})
}

// 按块决定是否 3 条一组
function groupItems(items, block) {
	if (block === '危险废物') return [items]
	const groups = []
	for (let i = 0; i < items.length; i += 3) {
		groups.push(items.slice(i, i + 3))
	}
	return groups
}

// 删除指定组标识牌信息
function handleRemoveGroup(section, groupIndex) {
	const start = groupIndex * 3
	const codeItem = section.items.slice(start, start + 3)
		.find(it => it.title === '排放口编号')
	const code = codeItem?.content || '未知编号'

	uni.showModal({
		title: '永久删除',
		content: `确定删除排污口  ${code}  所有信息吗？`,
		confirmText: '确定',
		cancelText: '取消',
		success: (res) => {
			if (res.confirm) {
				section.items.splice(start, 3)
			}
		}
	})
}

// 从baseTable中提取基本信息
function findBaseValue(label) {
	const r = props.baseTable.find(x => x.label === label)
	return r ? (r.value || '') : ''
}
</script>

<style scoped>
/* 样式继承自主页面 */
.outlet-tab {
	width: 100%;
}
</style>
