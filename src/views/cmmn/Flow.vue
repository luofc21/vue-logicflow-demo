<template>
  <div class="approve-container">
    <!-- 辅助工具栏 -->
    <CmmnControl class="control" v-if="lf" :lf="lf" v-model:readOnly="readOnly" @executePlan="executePlan" />
    <div class="node-panel">
      <!-- <NodePanel :lf="lf" /> -->
      <CmmnNodePanel :lf="lf" />
    </div>
    <div id="graph" class="viewport" />
    <!-- 属性面板 -->
    <div v-if="showCommonPanel">
      <CmmnTaskProperty :nodeData="nodeData" @updateProperty="updateProperty" @hidePropertyPanel="hidePropertyPanel" />
    </div>
    <CmmnProperty v-model:visible="showPropertyPanel" :nodeData="currentNode" @hidePropertyPanel="hidePropertyPanel"
      @updateProperty="handleSave" />
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import LogicFlow from '@logicflow/core';
import { DynamicGroup } from '@logicflow/extension';
import CmmnTaskProperty from '@components/cmmn-task-property.vue';
// import PlanPropertyPanel from '@components/plan-property.vue';
// import JudgementPanel from '@components/judgement-panel.vue';
import { themeApprove } from '@/config';
import '@/style/index.css';
import '@logicflow/core/dist/index.css';
// import CmmnProperty from '@components/cmmn-property.vue'
import CmmnNodePanel from '@components/cmmn-node-panel.vue'
import CmmnControl from '@components/cmmn-control.vue';
import CmmnProperty from '@components/cmmn-property.vue';
import { CmmnElements } from "@plugins/cmmn-elements";
import { CmmnAdapter } from "@plugins/cmmn-elements-adapter";
// import { StageGroupPlugin } from '../../plugins/cmmn-elements/StageGroupPlugin';

LogicFlow.use(CmmnElements);
LogicFlow.use(CmmnAdapter);
LogicFlow.use(DynamicGroup);
// LogicFlow.use(StageGroupPlugin);

const config = {
  stopScrollGraph: true,
  stopZoomGraph: true,
  allowResize: true, // 节点可调整大小（如Stage节点）
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
const nodeData = ref(null);
const showCommonPanel = ref(false);
const readOnly = ref(false);
const showPropertyPanel = ref(false)

const currentNode = ref(null)

const initEvent = (lf) => {
  lf.on('element:click', ({ data }) => {
    // if (readOnly.value) return;s
    // if (data.type === 'job') {
    //   nodeData.value = data;
    //   showCommonPanel.value = true;
    // }
    // if (data.type === 'judgement') {
    //   nodeData.value = data;
    //   showJudgementPanel.value = true;
    // }
    // if (data.type === 'bpmn:userTask') {
    //   nodeData.value = data;
    //   showPlanPanel.value = true;
    // }
  });

  lf.on('connection:not-allowed', (data) => {
    ElMessage.error(data.msg);
  });

  lf.on('node:dnd-add', (data) => {
    // const graphData = lf.getGraphData(); // 使用bpmn插件时输出的是xml格式数据
    // // console.log(graphData);
    // const nodes = graphData.nodes;
    // // console.log(nodes);
    // const hasStart = false; // nodes.filter(k => k.flow_type === 'start').length > 1;
    // const hasEnd = false; // nodes.filter(k => k.flow_type === 'end').length > 1;
    // if (hasStart) {
    //   ElMessage.error('只能有一个开始节点');
    //   setTimeout(() => {
    //     lf.undo();
    //   }, 200);
    // }
    // if (hasEnd) {
    //   ElMessage.error('只能有一个结束节点');
    //   setTimeout(() => {
    //     lf.undo();
    //   }, 200);
    // }
  });

  // 监听stage:edit事件，当用户编辑stage节点时触发
  lf.on('stage:edit', ({ nodeId, nodeData: stageData }) => {
    // 获取当前被编辑的stage节点模型
    currentNode.value = lf.getNodeModelById(nodeId);
    console.log('event edit ===>', nodeId, stageData, currentNode.value);
    // 显示属性面板
    showPropertyPanel.value = true;
  })

  // 监听task:edit事件，当用户编辑任务节点时触发
  lf.on('task:edit', ({ nodeId, nodeData: taskData }) => {
    console.log('edit taskData', nodeId, taskData);
    // 更新当前编辑的任务节点数据
    nodeData.value = taskData;
    // 显示任务属性面板
    showCommonPanel.value = true;
  })
};

// const updatePlanProperty = (id, data) => {
//   console.log('updateProperty', id, data);
//   const node = lf.value.graphModel.nodesMap[id];
//   const edge = lf.value.graphModel.edgesMap[id];
//   if (node) {
//     node.model.setProperties(data);
//     if (data.name) {
//       console.log('updateText', data.name);
//       node.model.updateText(data.name);
//     }
//   } else if (edge) {
//     edge.model.setProperties(Object.assign(edge.model.properties, data));
//   }
// };

const updateProperty = (id, data) => {
  console.log('updateProperty', id, data);
  const node = lf.value.graphModel.nodesMap[id];
  const edge = lf.value.graphModel.edgesMap[id];
  if (node) {
    // 先设置新的属性
    node.model.setProperties(data);
    
    // 如果有名称更新，则更新文本
    if (data.name) {
      console.log('updateText', data.name);
      node.model.updateText(data.name);
      
      // 不再需要强制刷新，因为model.updateText已经触发了必要的重绘
    }
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

// const hidePlanPropertyPanel = () => {
//   console.log()
//   showPlanPanel.value = false;
// };

const hidePropertyPanel = () => {
  showCommonPanel.value = false;
  showPropertyPanel.value = false
  currentNode.value = null
};

// const hideJudgementPanel = () => {
//   showJudgementPanel.value = false;
// };

// const updateNodeProperty = (data) => {
//   lf.value.updateProperties(currentNode.value.id, data)
// }

// const initDefaultCmmnProcess = () => {
//   const data = {
//     nodes: [
//       {
//         id: 'task1',
//         type: 'HumanTask',
//         x: 200,
//         y: 200,
//         text: { value: '审核申请' },
//         properties: {}
//       },
//       {
//         id: 'milestone1',
//         type: 'Milestone',
//         x: 400,
//         y: 200,
//         text: { value: '审核完成' },
//         properties: {}
//       }
//     ],
//     edges: [
//       {
//         id: 'edge1',
//         type: 'CmmnConnection',
//         sourceNodeId: 'task1',
//         targetNodeId: 'milestone1',
//         text: { value: '' },
//         properties: {}
//       }
//     ]
//   }
//   lf.value.render(data)
// }

onMounted(() => {
  const logicFlow = new LogicFlow({
    ...config,
    container: document.querySelector('#graph')
  });
  lf.value = logicFlow;
  initEvent(logicFlow);
  logicFlow.render({});
  // lf.value.on('node:click', handleNodeClick)
  // initDefaultCmmnProcess()
});

// const handleNodeClick = (data) => {
//   console.log('handleNodeClick', data)
//   currentNode.value = data
//   showPropertyPanel.value = true
// }

// 保存节点属性
const handleSave = (newNodeData) => {
  if (currentNode.value && !!newNodeData.name) {
    currentNode.value.updateText(newNodeData.name);
  }
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