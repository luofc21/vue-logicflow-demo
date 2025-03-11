<template>
    <div class="cmmn-node-panel">
        <div class="panel-title">CMMN节点</div>
        <div class="node-list">
            <div class="node-item" v-for="(item, index) in nodeList" :key="index"
                @mousedown="addNode(item.type, { text: item.label })">
                <div class="node-item-icon">
                    <component :is="item.icon" />
                </div>
                <div class="node-item-label">{{ item.label }}</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { UserFilled, Flag, Bell, Document } from '@element-plus/icons-vue'

const props = defineProps({
    lf: Object
})

const nodeList = [
    { type: 'cmmn:humanTask', label: '人工任务', icon: UserFilled },
    { type: 'cmmn:caseTask', label: '案例任务', icon: Document },
    // { type: 'Milestone', label: '里程碑', icon: Flag },
    // { type: 'EventListener', label: '事件监听', icon: Bell },
    // { type: 'EntryCriterion', label: '入口条件', icon: 'Entry' },
    // { type: 'ExitCriterion', label: '出口条件', icon: 'Exit' }
]

function addNode(type: string, { text, properties }: any) {
    props.lf!.dnd.startDrag({
        type,
        text: text,
        properties,
    });
}
</script>

<style scoped>
.cmmn-node-panel {
    width: 200px;
    padding: 20px;
    border-left: 1px solid #ddd;
    height: 100%;
    background: #fff;
}

.panel-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 20px;
}

.node-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.node-item {
    display: flex;
    align-items: center;
    padding: 8px;
    cursor: move;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.node-item:hover {
    background: #f5f5f5;
}

.node-item-icon {
    margin-right: 8px;
}
</style>
