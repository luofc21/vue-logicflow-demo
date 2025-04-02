import { TaskNodeFactory } from './task';

// 基础任务节点的图标
const baseTaskIcon = 'M 0 0 L 20 0 L 20 20 L 0 20 Z';

// 创建基础任务节点
export const BaseTask = TaskNodeFactory('cmmn:task', baseTaskIcon, {
  properties: {
    name: '基础任务',
    // taskType: 'baseTask',
    // description: 'CMMN基础任务节点'
  },
  'flowable:type': 'java',
  'flowable:class': 'com.pci.hjmos.process.engine.planItem.MyPlanItemJavaDelegate',
}); 