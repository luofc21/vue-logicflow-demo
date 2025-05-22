/* eslint-disable max-len */
/* eslint-disable no-cond-assign */
import LogicFlow from '@logicflow/core';
import { 
  serviceTaskIcon, 
  userTaskIcon, 
  processTaskIcon,
  milestoneIcon, 
  eventListenerIcon, 
  entryCriterionIcon, 
  exitCriterionIcon, 
  casePlanModelIcon
 } from '../icons';
import { TaskNodeFactory } from './task';
// import { Stage } from '../Stage';
import { BaseTask } from './BaseTask';
import { HumanTask } from './HumanTask';
import { Milestone } from './Milestone';
import { InfoReportTask } from './InfoReportTask';
// import { SubProcessFactory } from './subProcess';

function boundaryEvent(lf: any) {
  lf.on('node:drag,node:dnd-drag', checkAppendBoundaryEvent);
  lf.on('node:drop,node:dnd-add', appendBoundaryEvent);
  lf.graphModel.addNodeMoveRules(
    (
      model: { isTaskNode: any; boundaryEvents: any },
      deltaX: any,
      deltaY: any,
    ) => {
      if (model.isTaskNode) {
        // 如果移动的是分组，那么分组的子节点也跟着移动。
        const nodeIds = model.boundaryEvents;
        lf.graphModel.moveNodes(nodeIds, deltaX, deltaY, true);
        return true;
      }
      return true;
    },
  );

  function appendBoundaryEvent(this: any, { data }: any) {
    const { type, id } = data;
    if (type !== 'bpmn:boundaryEvent') {
      return;
    }
    const { nodes } = lf.graphModel;
    for (const node of nodes) {
      if (node.isTaskNode) {
        let nodeId = null;
        if ((nodeId = isBoundaryEventCloseToTask(node, data)) !== null) {
          const eventModel = lf.graphModel.getNodeModelById(id);
          const nodeModel = lf.graphModel.getNodeModelById(nodeId);
          const { attachedToRef } = eventModel.properties;
          if (attachedToRef && attachedToRef !== nodeId) {
            lf.graphModel.getNodeModelById(attachedToRef).deleteBoundaryEvent(id);
          }
          nodeModel.addBoundaryEvent(id);
          return;
        }
      }
    }
  }

  // 判断此节点是否在某个节点的边界上
  // 如果在，且这个节点model存在属性isTaskNode，则调用这个方法
  function checkAppendBoundaryEvent(this: any, { data }: any) {
    const { type } = data;
    if (type !== 'bpmn:boundaryEvent') {
      return;
    }
    const { nodes } = lf.graphModel;
    for (const node of nodes) {
      if (node.isTaskNode) {
        if (isBoundaryEventCloseToTask(node, data)) {
          // 同时只允许在一个节点的边界上
          node.setTouching(true);
        } else {
          node.setTouching(false);
        }
      }
    }
  }

  function isBoundaryEventCloseToTask(task: any, event: any) {
    const offset = 5;
    const { x: tx, y: ty, width: twidth, height: theight, id } = task;
    const bbox = {
      minX: tx - twidth / 2,
      maxX: tx + twidth / 2,
      minY: ty - theight / 2,
      maxY: ty + theight / 2,
    };
    const { x: bx, y: by } = event;
    const outerBBox = {
      minX: bbox.minX - offset,
      maxX: bbox.maxX + offset,
      minY: bbox.minY - offset,
      maxY: bbox.maxY + offset,
    };
    const innerBBox = {
      minX: bbox.minX + offset,
      maxX: bbox.maxX - offset,
      minY: bbox.minY + offset,
      maxY: bbox.maxX - offset,
    };
    if (bx > outerBBox.minX && bx < outerBBox.maxX && by > outerBBox.minY && by < outerBBox.maxY) {
      if (!(bx > innerBBox.minX && bx < innerBBox.maxX && by > innerBBox.minY && by < innerBBox.maxY)) {
        return id;
      }
    }
    return null;
  }
}

// 将图标对象转换为字符串
const userTaskIconStr = 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z';
const milestoneIconStr = 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z';
const processTaskIconStr = 'M5 5h14v14H5V5z M6 12h12';
const caseTaskIconStr = 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm-2 16c-2.05 0-3.71-1.67-3.71-3.71s1.67-3.71 3.71-3.71 3.71 1.67 3.71 3.71-1.67 3.71-3.71 3.71z';
const stageIconStr = 'M3 3h18v18H3V3z M6 6h12M6 12h12M6 18h12';

export function registerTaskNodes(lf: LogicFlow) {
  // const ServiceTask = TaskNodeFactory('bpmn:serviceTask', serviceTaskIcon);
  // const UserTask = TaskNodeFactory('bpmn:userTask', userTaskIcon);
  
  // lf.register(ServiceTask);
  // lf.register(UserTask);
  // lf.register(SubProcessFactory());


  // const CaseTask = TaskNodeFactory('cmmn:caseTask', serviceTaskIcon);
  // const HumanTask = TaskNodeFactory('cmmn:humanTask', userTaskIcon);
  // const ProcessTask = TaskNodeFactory('cmmn:processTask', processTaskIcon);
  // const Milestone = TaskNodeFactory('cmmn:milestone', milestoneIcon);
  // const EventListener = TaskNodeFactory('cmmn:eventListener', eventListenerIcon);
  // const EntryCriterion = TaskNodeFactory('cmmn:entryCriterion', entryCriterionIcon);
  // const ExitCriterion = TaskNodeFactory('cmmn:exitCriterion', exitCriterionIcon);
  // const CasePlanModel = TaskNodeFactory('cmmn:casePlanModel', casePlanModelIcon);
  // lf.register(CaseTask);
  lf.register(HumanTask);
  // lf.register(ProcessTask);
  lf.register(Milestone);
  // lf.register(EventListener);
  // lf.register(EntryCriterion);
  // lf.register(ExitCriterion);
  // lf.register(CasePlanModel);
  // const stage = Stage;
  // lf.register(stage);
  boundaryEvent(lf);

  // 注册基础任务节点
  lf.register(BaseTask);
  
  // 注册信息通报任务节点
  lf.register(InfoReportTask);
}
