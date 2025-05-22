import LogicFlow from '@logicflow/core';
import { CasePlanModel } from './CasePlanModel';

export function registerCaseNodes (lf: LogicFlow) {
    lf.register(CasePlanModel);
}