<template>
    <!-- 编辑抽屉 -->
    <el-drawer v-model="drawerVisible" title="编辑节点" :size="400" :destroy-on-close="true">
        <el-form v-model="editForm" label-width="100px">
            <el-form-item label="节点名称">
                <el-input v-model="editForm.name" placeholder="请输入节点名称" />
            </el-form-item>
            <!-- 可以添加更多表单项 -->
        </el-form>

        <template #footer>
            <div style="flex: auto; text-align: right">
                <el-button @click="drawerVisible = false">取消</el-button>
                <el-button type="primary" @click="handleSave">确定</el-button>
            </div>
        </template>
    </el-drawer>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
// import { Close } from '@element-plus/icons-vue';

const props = defineProps({
    nodeData: Object,
    visible: Boolean
})

const drawerVisible = computed({
    get() {
        return props.visible
    },
    set(val) {
        emit('update:visible', val)
    }
})

watch(() => props.visible, (newVal) => {
    console.log('props.visible', newVal)
    if (newVal) {
        editForm.value.name = props.nodeData.text?.value || ''
    }
}, { immediate: true })

const editForm = ref({
    name: ''
})

const emit = defineEmits(['hidePropertyPanel', 'updateProperty', 'update:visible'])

const isCmmnTask = computed(() => {
    return ['HumanTask', 'CaseTask', 'ProcessTask'].includes(props.nodeData?.type)
})

const handleSave = () => {
    emit('updateProperty', editForm.value)
    drawerVisible.value = false
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
