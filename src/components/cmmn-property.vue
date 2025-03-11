<template>
    <div class="property-panel">
        <div class="header">
            <div class="title">属性面板</div>
            <el-button @click="$emit('hidePropertyPanel')" type="text">
                <el-icon>
                    <Close />
                </el-icon>
            </el-button>
        </div>
        <div class="content">
            <el-form label-width="80px" size="small">
                <el-form-item label="节点名称">
                    <el-input v-model="nodeData.text.value" @change="handleNameChange" />
                </el-form-item>
                <el-form-item label="必填项" v-if="isCmmnTask">
                    <el-switch v-model="nodeData.properties.required" @change="handlePropertyChange" />
                </el-form-item>
                <el-form-item label="重复性" v-if="isCmmnTask">
                    <el-select v-model="nodeData.properties.repetitionRule" @change="handlePropertyChange">
                        <el-option label="无" value="" />
                        <el-option label="可重复" value="repeatable" />
                        <el-option label="必须重复" value="repetitionRequired" />
                    </el-select>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { Close } from '@element-plus/icons-vue';

const props = defineProps({
    nodeData: Object
})

const emit = defineEmits(['hidePropertyPanel', 'updateProperty'])

const isCmmnTask = computed(() => {
    return ['HumanTask', 'CaseTask', 'ProcessTask'].includes(props.nodeData?.type)
})

const handleNameChange = () => {
    emit('updateProperty', {
        text: { value: props.nodeData.text.value }
    })
}

const handlePropertyChange = () => {
    emit('updateProperty', {
        properties: props.nodeData.properties
    })
}
</script>

<style scoped>
.property-panel {
    width: 300px;
    border-left: 1px solid #ddd;
    background: #fff;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    border-bottom: 1px solid #ddd;
}

.content {
    padding: 20px;
}
</style>
