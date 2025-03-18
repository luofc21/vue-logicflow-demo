import { TaskNodeFactory } from './Task/task';
import { stageIcon } from './icons';

export const Stage = TaskNodeFactory('cmmn:stage', stageIcon, {
  width: 200,
  height: 150,
  // stage 特有的属性
  properties: {
    autoComplete: false,
    planningTable: null,
    defaultControl: {
      required: false,
      repetition: false,
      manualActivation: true
    }
  }
});