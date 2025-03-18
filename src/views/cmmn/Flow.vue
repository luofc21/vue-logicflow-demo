<template>
  <div class="approve-container">
    <!-- 辅助工具栏 -->
    <Control class="control" v-if="lf" :lf="lf" v-model:readOnly="readOnly" @executePlan="executePlan" />
    <div class="node-panel">
      <!-- <NodePanel :lf="lf" /> -->
      <cmmn-node-panel :lf="lf" />
    </div>
    <div id="graph" class="viewport" />
    <!-- 属性面板 -->
    <div v-if="showPlanPanel">
      <PlanPropertyPanel :nodeData="nodeData" @updateProperty="updatePlanProperty"
        @hidePropertyPanel="hidePlanPropertyPanel" />
    </div>
    <div v-if="showCommonPanel">
      <PropertyPanel :nodeData="nodeData" @updateProperty="updateProperty" @hidePropertyPanel="hidePropertyPanel" />
    </div>
    <!-- 判断面板 -->
    <div v-if="showJudgementPanel">
      <JudgementPanel :nodeData="nodeData" @updateProperty="updateProperty" @hidePropertyPanel="hideJudgementPanel" />
    </div>
    <div class="flow-container">
      <div id="flow"></div>
      <cmmn-property v-if="showPropertyPanel" :nodeData="selectedNode" @hidePropertyPanel="hidePropertyPanel"
        @updateProperty="updateNodeProperty" />
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import LogicFlow from '@logicflow/core';
import PropertyPanel from '@components/property.vue';
import PlanPropertyPanel from '@components/plan-property.vue';
import JudgementPanel from '@components/judgement-panel.vue';
// import NodePanel from '@components/node-panel.vue';
import Control from '@components/control.vue';
import RegistryNode from '@components/registerNode';
import RegistryMenu from '@components/registerMenu';
import { themeApprove } from '@/config';
import '@/style/index.css';
import '@logicflow/core/dist/index.css';
// import CmmnProperty from '@components/cmmn-property.vue'
import CmmnNodePanel from '@components/cmmn-node-panel.vue'
import { CmmnElements } from "@plugins/cmmn-elements";
import { CmmnAdapter } from "@plugins/cmmn-elements-adapter";

LogicFlow.use(CmmnElements);
LogicFlow.use(CmmnAdapter);

const config = {
  stopScrollGraph: true,
  stopZoomGraph: true,
  // allowResize: true,
  // allowRotate: true,
  grid: {
    size: 10,
    visible: true,
    type: 'mesh',
    config: {
      color: '#DCDCDC',
    }
  },
  edgeType: "bezier",
  keyboard: { enabled: true },
  style: themeApprove,
  // plugins: [BpmnXmlAdapter]
};

const lf = ref(null);
const nodeData = ref();
const showCommonPanel = ref(false);
const showPlanPanel = ref(false);
const readOnly = ref(false);
const showJudgementPanel = ref(false);
const showPropertyPanel = ref(false)
const selectedNode = ref(null)

const initEvent = (lf) => {
  lf.on('element:click', ({ data }) => {
    if (readOnly.value) return;
    if (data.type === 'job') {
      nodeData.value = data;
      showCommonPanel.value = true;
    }
    if (data.type === 'judgement') {
      nodeData.value = data;
      showJudgementPanel.value = true;
    }
    if (data.type === 'bpmn:userTask') {
      nodeData.value = data;
      showPlanPanel.value = true;
    }
  });

  lf.on('connection:not-allowed', (data) => {
    ElMessage.error(data.msg);
  });

  lf.on('node:dnd-add', (data) => {
    const graphData = lf.getGraphData(); // 使用bpmn插件时输出的是xml格式数据
    // console.log(graphData);
    const nodes = graphData.nodes;
    // console.log(nodes);
    const hasStart = false; // nodes.filter(k => k.flow_type === 'start').length > 1;
    const hasEnd = false; // nodes.filter(k => k.flow_type === 'end').length > 1;
    if (hasStart) {
      ElMessage.error('只能有一个开始节点');
      setTimeout(() => {
        lf.undo();
      }, 200);
    }
    if (hasEnd) {
      ElMessage.error('只能有一个结束节点');
      setTimeout(() => {
        lf.undo();
      }, 200);
    }
  });
};

const updatePlanProperty = (id, data) => {
  console.log('updateProperty', id, data);
  const node = lf.value.graphModel.nodesMap[id];
  const edge = lf.value.graphModel.edgesMap[id];
  if (node) {
    node.model.setProperties(data);
    if (data.name) {
      console.log('updateText', data.name);
      node.model.updateText(data.name);
    }
  } else if (edge) {
    edge.model.setProperties(Object.assign(edge.model.properties, data));
  }
};

const updateProperty = (id, data) => {
  console.log('updateProperty', id, data);
  const node = lf.value.graphModel.nodesMap[id];
  const edge = lf.value.graphModel.edgesMap[id];
  if (node) {
    node.model.setProperties(data);
  } else if (edge) {
    edge.model.setProperties(Object.assign(edge.model.properties, data));
  }
};

const executePlan = (data) => {
  ElMessage.success('执行成功');
  console.log('executePlan', data);
  console.log('graphModel', lf.value.graphModel.nodesMap);
  const node = Object.keys(lf.value.graphModel.nodesMap);
  updateProperty(node[0], data);
};

const hidePlanPropertyPanel = () => {
  console.log()
  showPlanPanel.value = false;
};

const hidePropertyPanel = () => {
  showCommonPanel.value = false;
  showPropertyPanel.value = false
  selectedNode.value = null
};

const hideJudgementPanel = () => {
  showJudgementPanel.value = false;
};

const updateNodeProperty = (data) => {
  lf.value.updateProperties(selectedNode.value.id, data)
}

const initDefaultCmmnProcess = () => {
  const data = {
    nodes: [
      {
        id: 'task1',
        type: 'HumanTask',
        x: 200,
        y: 200,
        text: { value: '审核申请' },
        properties: {}
      },
      {
        id: 'milestone1',
        type: 'Milestone',
        x: 400,
        y: 200,
        text: { value: '审核完成' },
        properties: {}
      }
    ],
    edges: [
      {
        id: 'edge1',
        type: 'CmmnConnection',
        sourceNodeId: 'task1',
        targetNodeId: 'milestone1',
        text: { value: '' },
        properties: {}
      }
    ]
  }
  lf.value.render(data)
}

onMounted(() => {
  const logicFlow = new LogicFlow({
    ...config,
    container: document.querySelector('#graph')
  });
  lf.value = logicFlow;
  RegistryNode(logicFlow);
  RegistryMenu(logicFlow);
  initEvent(logicFlow);
  logicFlow.render({});
  lf.value.on('node:click', handleNodeClick)
  initDefaultCmmnProcess()
});

const handleNodeClick = (data) => {
  selectedNode.value = data
  showPropertyPanel.value = true
}
</script>

<style scoped>
.viewport {
  overflow: hidden;
  position: relative;
  height: 100%;
}

.control {
  position: absolute;
  top: 50px;
  right: 50%;
  transform: translateX(50%);
  z-index: 2;
}

.node-panel {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  z-index: 1;
}

.cmmn-panel {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  z-index: 1;
}
</style>