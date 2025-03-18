/* eslint-disable max-len */
/* eslint-disable no-cond-assign */
import LogicFlow from '@logicflow/core';
import { CmmnConnection } from './CmmnConnection';


export function registerEdge(lf: LogicFlow) {
  lf.registerEdge && lf.registerEdge(CmmnConnection);
}
