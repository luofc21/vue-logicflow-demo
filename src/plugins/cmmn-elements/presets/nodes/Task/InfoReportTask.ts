import { TaskNodeFactory } from './task';

// 信息通报任务节点的图标 (可以使用与基础任务相同的图标或自定义)
const infoReportTaskIcon = 'M 0 0 L 20 0 L 20 20 L 0 20 Z';

// 从logic-flow-1.cmmn.xml中提取的默认属性
const defaultAction = {
  taskType: 'auto',
  requestUrl: 'http://dev-k8s.pcitech.com:30780/nec/plan/get/process?eventCode=dkl03',
  requestHeaders: '{"Authorization": "Basic MTAxOjEyMzQ1Ng==","ID-Token": "32919556-4765-40d9-81f0-f20698dc7381"}',
  requestMethod: 'put',
  topic: 'task',
  massage: '{"code":0,"message":"ok","data":{"pointList":[{"name":"启动线网一级客控","index":0,"active":1,"opsItemList":[{"auto":true,"decision":"2025-03-17 20:47:18 已向集团领导通报","opsItemGroup":"信息通报","index":0,"completeTime":"2025-03-17 20:47:18","showStatus":true,"decisionTemplate":"@time 已向集团领导通报","statusTip":"启动则触发短信通报","delay":2,"name":"总调","buttonContent":"","switchValue":0,"action":"处置信息向集团领导通报（戴*军，158****1486）","decisionType":1,"group":"自动","status":3}],"status":0}]}}',
  taskName: '信息通报',
  taskId: 'task_bryfeoy6'
};

// 创建信息通报任务节点
export const InfoReportTask = TaskNodeFactory('cmmn:InfoReportTask', infoReportTaskIcon, {
  name: '处置信息向集团领导通报',
  width: 100,
  height: 80,
  args: '[]',
  action: defaultAction,
  'flowable:type': 'java',
  'flowable:class': 'com.pci.hjmos.process.engine.planItem.MyPlanItemJavaDelegate',
}); 