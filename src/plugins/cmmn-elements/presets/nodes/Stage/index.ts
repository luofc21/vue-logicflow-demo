import LogicFlow from '@logicflow/core';
import { Stage } from './NormalStage';

export function registerStageNodes (lf: LogicFlow) {
    lf.register(Stage);
}