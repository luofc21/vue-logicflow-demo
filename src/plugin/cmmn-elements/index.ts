// import { App } from '@logicflow/core'
import { CaseTask } from './presets/nodes/Task/CaseTask'
import { HumanTask } from './presets/nodes/HumanTask'
// import { ProcessTask } from './presets/nodes/ProcessTask'
// import { Milestone } from './presets/nodes/Milestone'
// import { EventListener } from './presets/nodes/EventListener'
// import { CasePlanModel } from './presets/nodes/CasePlanModel'
import { CmmnConnection } from './presets/edges/CmmnConnection'
import { EntryCriterion } from './presets/nodes/EntryCriterion'
import { ExitCriterion } from './presets/nodes/ExitCriterion'
import { registerTaskNodes } from './presets/nodes/Task';
import { registerEdge } from './presets/edges';

// CMMN规范中的节点类型枚举
export const CmmnElementsType = {
  CASE_PLAN_MODEL: 'cmmn:casePlanModel',
  CASE_TASK: 'cmmn:caseTask',
  HUMAN_TASK: 'cmmn:humanTask', 
  PROCESS_TASK: 'cmmn:processTask',
  MILESTONE: 'cmmn:milestone',
  EVENT_LISTENER: 'cmmn:eventListener',
  CONNECTOR: 'cmmn:planItemOnPart',
  ENTRY_CRITERION: 'cmmn:entryCriterion',
  EXIT_CRITERION: 'cmmn:exitCriterion'
}

export class CmmnElements {
  static pluginName = 'CmmnElementsPlugin'

  constructor({ lf }: any) {
    registerTaskNodes(lf);
    registerEdge(lf);
  }
}
