<template>
  <div>
    <el-switch v-model="read" active-text="只读模式" inactive-text="编辑模式" inline-prompt :active-value="true"
      :inactive-value="false" />
    <el-button-group>
      <el-button size="small" @click="zoomIn">放大</el-button>
      <el-button size="small" @click="zoomOut">缩小</el-button>
      <el-button size="small" @click="zoomReset">大小适应</el-button>
      <el-button size="small" @click="translateReset">定位还原</el-button>
      <el-button size="small" @click="undo" :disabled="undoDisable">上一步(ctrl+z)</el-button>
      <el-button size="small" @click="redo" :disabled="redoDisable">下一步(ctrl+y)</el-button>
      <el-button type="primary" size="small" @click="execute">执行</el-button>
      <el-button type="primary" size="small" @click="downloadXml">下载BPMN</el-button>
      <!-- <el-button type="primary" size="small" :disabled="submitDisable" @click="submit">提交</el-button> -->
    </el-button-group>
    <el-upload
      v-model:file-list="fileList"
      class="upload-demo"
      action="#"
      :limit="1"
      :http-request="uploadXml"
      :show-file-list="false"
    >
      <el-button type="primary" size="small">导入BPMN</el-button>
    </el-upload>
  </div>
</template>
<script setup>
import { onMounted, ref, computed } from 'vue'
import { ElMessageBox, ElForm, ElFormItem, ElInput } from 'element-plus'

const props = defineProps({
  lf: [Object, String],
  catTurboData: Boolean,
  readOnly: Boolean
})

const emit = defineEmits(['update:readOnly', 'catData', 'catTurboData', 'executePlan'])

const undoDisable = ref(true)
const redoDisable = ref(true)
const submitDisable = ref(true)

const download = (filename, text) => {
  const element = document.createElement('a')
  element.setAttribute(
    'href',
    'data:text/plain;charset=utf-8,' + encodeURIComponent(text),
  )
  element.setAttribute('download', filename)
  element.style.display = 'none'
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
}

const downloadXml = () => {
  const data = props.lf?.getGraphData()

  download('logic-flow.xml', data)
}

const fileList = ref([])
const uploadXml = (ev) => {
  console.log('ev',ev)
  const file = ev.file;
  const reader = new FileReader();
  reader.onload = (event) => {
    if (event.target) {
      const xml = (event.target.result).replace(/bpmn2/g, 'bpmn');
      console.log(xml);
      props.lf?.render(xml);
    }
  };
  reader.readAsText(file); // you could also read images and other binaries
}

onMounted(() => {
  props.lf && props.lf.on('history:change', ({ data: { undoAble, redoAble } }) => {
    undoDisable.value = !undoAble
    redoDisable.value = !redoAble
    const graphData = props.lf.getGraphData()
  })
})

const zoomIn = () => props.lf.zoom(true)
const zoomOut = () => props.lf.zoom(false)
const zoomReset = () => props.lf.resetZoom()
const translateReset = () => props.lf.resetTranslate()
const reset = () => {
  props.lf.resetZoom()
  props.lf.resetTranslate()
}
const undo = () => props.lf.undo()
const redo = () => props.lf.redo()

const catData = () => emit('catData')
const catTurboData = () => emit('catTurboData')

const showMiniMap = () => {
  const { lf } = props
  lf.extension.miniMap.show(lf.graphModel.width - 150, 40)
}

const submit = () => {
  const formRef = ref(null)
  const form = reactive({ name: '', info: '' })
  const rules = {
    name: {
      required: true,
      trigger: 'blur',
      message: '名称为必填项'
    },
    info: {
      required: true,
      trigger: 'blur',
      message: '描述为必填项'
    }
  }
  const data = props.lf.getGraphData()

  ElMessageBox({
    title: '提交信息',
    showCancelButton: true,
    cancelButtonText: '取消',
    confirmButtonText: '确定',
    // message: () =>
    //   <ElForm
    //     ref={formRef}
    //     model={form}
    //     rules={rules}
    //     labelWidth={60}
    //   >
    //     <ElFormItem label="名称" prop="name">
    //       <ElInput v-model={form.name}></ElInput>
    //     </ElFormItem>
    //     <ElFormItem label="描述" prop="info">
    //       <ElInput v-model={form.info}></ElInput>
    //     </ElFormItem>
    //   </ElForm>
    // ,
    beforeClose: (action, instance, done) => {
      formRef.value?.validate(status => {
        if (status || action === 'cancel') done()
        if (status && action === 'confirm') {
          console.log('提交的data:', data)
        }
      })
    }
  })
}

const read = computed({
  get: () => props.readOnly,
  set: (val) => emit('update:readOnly', val)
});

const execute = () => {
  // const data = props.lf.getGraphData()
  // console.log(data)
  emit('executePlan', { status: 'success' })
}

</script>
<style scoped>
.upload-demo {
  display: inline-block;
  /* margin-top: 10px; */
}
</style>