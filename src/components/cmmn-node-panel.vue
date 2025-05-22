<template>
    <div class="cmmn-node-panel">
        <div class="panel-title">CMMN节点</div>
        <el-collapse v-model="activeNames" accordion>
            <el-collapse-item title="任务节点" name="tasks">
                <div class="node-list">
                    <div class="node-item" v-for="item in taskNodes" :key="item.type"
                        @mousedown="addNode(item.type, { text: item.label })">
                        <div class="node-item-icon">
                            <SvgIcon :iconClass="item.icon" />
                        </div>
                        <div class="node-item-label">{{ item.label }}</div>
                    </div>
                </div>
            </el-collapse-item>
            
            <el-collapse-item title="阶段节点" name="stages">
                <div class="node-list">
                    <div class="node-item" v-for="item in stageNodes" :key="item.type"
                        @mousedown="addNode(item.type, { text: item.label })">
                        <div class="node-item-icon">
                            <SvgIcon :iconClass="item.icon" />
                        </div>
                        <div class="node-item-label">{{ item.label }}</div>
                    </div>
                </div>
            </el-collapse-item>

            <el-collapse-item title="案例节点" name="cases">
                <div class="node-list">
                    <div class="node-item" v-for="item in caseNodes" :key="item.type"
                        @mousedown="addNode(item.type, { text: item.label })">
                        <div class="node-item-icon">
                            <SvgIcon :iconClass="item.icon" />
                        </div>
                        <div class="node-item-label">{{ item.label }}</div>
                    </div>
                </div>
            </el-collapse-item>
            
            <el-collapse-item title="其他节点" name="others">
                <div class="node-list">
                    <div class="node-item" v-for="item in otherNodes" :key="item.type"
                        @mousedown="addNode(item.type, { text: item.label })">
                        <div class="node-item-icon">
                            <SvgIcon :iconClass="item.icon" />
                        </div>
                        <div class="node-item-label">{{ item.label }}</div>
                    </div>
                </div>
            </el-collapse-item>
        </el-collapse>
    </div>
</template>

<script setup lang="ts">
import SvgIcon from './SvgIcon.vue';
import { ref, computed } from 'vue';

const props = defineProps({
    lf: Object
});

// 默认展开的折叠面板
const activeNames = ref(['tasks']);

// 所有节点定义
const allNodes = [
    { type: 'cmmn:task', label: '基础任务', icon: 'bpmn-icon-script-task', category: 'tasks' },
    { type: 'cmmn:humanTask', label: '人工任务', icon: 'bpmn-icon-user-task', category: 'tasks' },
    { type: 'cmmn:InfoReportTask', label: '信息通报任务', icon: 'bpmn-icon-message-throw', category: 'tasks' },
    // { type: 'cmmn:caseTask', label: '案例任务', icon: 'bpmn-icon-service-task', category: 'tasks' },
    { type: 'cmmn:stage', label: '阶段', icon: 'bpmn-icon-subprocess-expanded', category: 'stages' },
    { type: 'cmmn:casePlanModel', label: '案例', icon: 'bpmn-icon-subprocess-expanded', category: 'cases' },
    { type: 'dynamic-group', label: '分组', icon: 'bpmn-icon-group', category: 'others' },
    // { type: 'cmmn:milestone', label: '里程碑', icon: 'bpmn-icon-group', category: 'others' },
    // { type: 'EventListener', label: '事件监听', icon: Bell, category: 'others' },
    // { type: 'EntryCriterion', label: '入口条件', icon: 'Entry', category: 'others' },
    // { type: 'ExitCriterion', label: '出口条件', icon: 'Exit', category: 'others' }
];

// 按分类过滤节点
const taskNodes = computed(() => allNodes.filter(node => node.category === 'tasks'));
const stageNodes = computed(() => allNodes.filter(node => node.category === 'stages'));
const otherNodes = computed(() => allNodes.filter(node => node.category === 'others'));
const caseNodes = computed(() => allNodes.filter(node => node.category === 'cases'));

function addNode(type: string, { text, properties }: any) {
    props.lf!.dnd.startDrag({
        type,
        text: text,
        // width: 200, // 各自默认的宽高在节点模型中设置
        // height: 200,
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
    padding: 10px 0;
}

.node-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 8px;
    cursor: move;
    /* border: 1px solid #ddd; */
    /* border-radius: 4px; */
}

.node-item:hover {
    background: #f5f5f5;
}

.node-item-icon {
    /* margin-right: 8px; */
    margin-bottom: 4px;
}

.node-item-label {
    font-size: 12px;
}

/* Element Plus 样式调整 */
:deep(.el-collapse-item__header) {
    font-weight: bold;
    padding-left: 5px;
}

:deep(.el-collapse-item__content) {
    padding-bottom: 0;
}
</style>
