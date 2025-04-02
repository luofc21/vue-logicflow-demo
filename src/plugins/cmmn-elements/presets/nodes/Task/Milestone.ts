import { TaskNodeFactory } from './task';

// 里程碑节点的图标
const milestoneIcon = 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z';

// 创建里程碑节点
export const Milestone = TaskNodeFactory('cmmn:milestone', milestoneIcon, {
  name: '里程碑',
  'flowable:type': 'java',
  'flowable:class': 'com.pci.hjmos.process.engine.planItem.MyPlanItemJavaDelegate',
  // properties: {
  //   taskType: 'milestone',
  //   description: 'CMMN里程碑节点'
  // }
}); 