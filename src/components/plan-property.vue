<template>
  <el-drawer :modelValue="true" @close="hide" title="节点配置" size="50%" destroy-on-close>
    <el-form ref="modelRef" :rules="rules" :key="nodeData.id" :model="model" v-bind="$attrs" label-position="left"
      label-width="80px">
      <el-form-item label="名称" prop="name">
        <el-input type="text" v-model="model.name"></el-input>
      </el-form-item>
      <el-form-item label="类型" prop="job">
        <el-select v-model="model.job" @change="handleJobChange" filterable remote reserve-keyword
          :remote-method="queryJobs" :loading="jobLoading">
          <el-option v-for="k in jobOptions" :key="k.id" :label="k.name" :value="k.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="操作" prop="args">
        <div class="arg-title">
          <el-button link type="primary" @click="handleAddArgs">新增</el-button>
        </div>
        <el-table :data="model.args" style="width: 100%">
          <el-table-column prop="name" label="name">
            <template #default="{ row }">
              <el-input v-model="row.name"></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="val" label="value">
            <template #default="{ row }">
              <el-input v-model="row.val"></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="info" label="info">
            <template #default="{ row }">
              <el-input v-model="row.info"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template #default="scope">
              <el-button link type="danger" @click="handleDelArgs(scope.$index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
    </el-form>
    <template #footer>
      <div>
        <el-button type="primary" @click="makeSure">保存</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script>
import { defineComponent, ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { approveUser } from '../config';
import { nanoid } from 'nanoid'
import { ElMessage } from 'element-plus'

export default defineComponent({
  name: 'PlanPropertyPanel',
  props: {
    lf: Object,
    nodeData: Object,
    updateProperty: Function,
    hidePropertyPanel: Function,
  },
  setup(props, { emit }) {
    const scriptOptions = ref([])
    const showTaskPanel = ref(true)
    const oldProperties = props.nodeData.properties
    oldProperties.bind_ip = oldProperties.bind_ip ? oldProperties.bind_ip.split(',') : []
    const defaultProperties = {
      task_type: '',
      name: '',
      job: '',
      env: [],
      args: [],
      node: [],
      euid: '',
      bind_ip: [],
      command_type: null,
      work_user: '',
      work_dir: '',
      timeout: 0,
      retry: 0,
      code: ''
    }
    const route = useRoute()
    const mode = 'edit'
    const newProperties = mode === 'edit' ? oldProperties : {}

    Object.keys(defaultProperties).forEach(k => {
      newProperties[k] = !!oldProperties[k] ? oldProperties[k] : defaultProperties[k]
    })
    const model = ref(newProperties)

    const modelRef = ref(null)
    const rules = computed(() => {
      if (model.value.task_type === 'job') {
        return {
          name: [{ required: true, message: "不能为空！" }],
          job: [{ required: true, message: "不能为空！" }],
          bind_ip: [{ required: true, message: "不能为空！" }]
        }
      }
      if (model.value.task_type === 'custom') {
        return {
          name: [{ required: true, message: "不能为空！" }],
          command_type: [{ required: true, message: "不能为空！" }],
          code: [{ required: true, message: "不能为空！" }],
          bind_ip: [{ required: true, message: "不能为空！" }]
        }
      }
    })

    const update = () => {
      const result = {
        ...model.value,
        bind_ip: model.value.bind_ip.join(',')
      }
      emit("updateProperty", props.nodeData.id, result)
    }
    const hide = () => {
      emit("hidePropertyPanel")
    }
    const makeSure = () => {
      modelRef.value.validate((valid) => {
        if (valid) {
          update()
          hide()
        }
      })
    }
    const jobOptions = ref([{ name: '手动', id: 1 }, { name: '自动', id: 2 }]);
    const jobLoading = ref(false);

    const nodeOptions = ref([{ key: 1, label: 'test' }])
    const value = ref([])

    onMounted(() => {
      init()
    })

    function init() {

    }

    function queryJobs() {

    }

    function handleAddEnv() {
      model.value.env.push({ name: '', val: '', info: '' })
    }
    function handleDelEnv(index) {
      model.value.env.splice(index, 1)
    }

    function handleAddArgs() {
      model.value.args.push({ name: '', val: '', info: '' })
    }
    function handleDelArgs(index) {
      model.value.args.splice(index, 1)
    }

    function handleJobChange(id) {
      const job = jobOptions.value.find(k => k.id === id)
      model.value.euid = job.euid
      model.value.command_type = id
    }

    function handleTabChange(panel) {
      if (panel === 'job') {
        model.value.job = ''
        model.value.env = []
        model.value.args = []
        model.value.node = []
        model.value.euid = ''
        model.value.bind_ip = []
      }
      if (panel === 'custom') {
        model.value.command_type = ''
        model.value.retry = 0
        model.value.code = ''
        model.value.env = []
        model.value.args = []
        model.value.node = []
        model.value.bind_ip = []
        // 为新增时，生成euid
        if ([mode !== 'edit' && mode !== 'view']) {
          model.value.euid = 'j-' + nanoid(22)
        }
      }
    }

    return {
      modelRef,
      rules,
      approveUser,
      hide,
      showTaskPanel,
      model,
      value,
      handleAddEnv,
      handleDelEnv,
      jobOptions,
      jobLoading,
      handleJobChange,
      nodeOptions,
      handleTabChange,
      handleAddArgs,
      handleDelArgs,
      queryJobs,
      makeSure,
      scriptOptions
    };
  },
});
</script>

<style scoped>
.form-property {
  margin-right: 20px;
  margin-bottom: 20px;
}

.form-property span {
  font-weight: bold;
}

.property-panel-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.property-panel-footer-hide {
  margin-bottom: 20px;
}

.mt {
  margin-top: 20px;
}

.arg-title {
  display: flex;
  align-items: center;
}
</style>