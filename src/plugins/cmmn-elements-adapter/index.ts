import { lfJson2Xml, lfXml2Json } from './utils'
import { CmmnElementsType } from '../cmmn-elements'

type ExtraPropsType = Record<string, any>

class CmmnBaseAdapter {
  static pluginName = 'CmmnAdapter'
  static shapeConfigMap = new Map()

  constructor(data: any) {
    const { lf } = data
    lf.adapterIn = this.adapterIn
    lf.adapterOut = this.adapterOut
  }

  adapterOut = (data: any, other?: ExtraPropsType) => {
    const { nodes, edges } = data
    const cmmnJson: any = {
      'cmmn:definitions': {
        '-xmlns:cmmn': 'http://www.omg.org/spec/CMMN/20151109/MODEL',
        '-xmlns:cmmndi': 'http://www.omg.org/spec/CMMN/20151109/CMMNDI',
        'cmmn:case': {
          '-id': `Case_${Date.now()}`,
          'cmmn:casePlanModel': this.convertLf2CmmnProcess(nodes, edges)
        },
        'cmmndi:CMMNDI': this.convertLf2CmmnDiagram(data)
      }
    }
    return cmmnJson
  }

  adapterIn = (cmmnData: any, other?: ExtraPropsType) => {
    const lfJson = {
      nodes: [],
      edges: []
    }
    // 将CMMN XML转换为LogicFlow数据
    return lfJson
  }

  private convertLf2CmmnProcess(nodes: any[], edges: any[]) {
    const planItems: any[] = [];
    const definitions: any[] = [];

    nodes.forEach(node => {
      const planItem = {
        '-id': `PlanItem_${node.id}`,
        '-definitionRef': `Definition_${node.id}`,
        'cmmn:entryCriterion': this.getEntryCriterion(node, edges),
        'cmmn:exitCriterion': this.getExitCriterion(node, edges)
      };
      
      const definition = {
        '-id': `Definition_${node.id}`,
        '-name': node.text?.value || '',
        ...this.getDefinitionProperties(node)
      };

      planItems.push(planItem);
      definitions.push(definition);
    });

    return {
      '-id': `CasePlanModel_${Date.now()}`,
      'cmmn:planItem': planItems,
      'cmmn:humanTask': definitions.filter(d => d['-type'] === CmmnElementsType.HUMAN_TASK),
      'cmmn:milestone': definitions.filter(d => d['-type'] === CmmnElementsType.MILESTONE),
      'cmmn:caseTask': definitions.filter(d => d['-type'] === CmmnElementsType.CASE_TASK)
    };
  }

  private convertLf2CmmnDiagram(data: any) {
    const { nodes, edges } = data;
    return {
      'cmmndi:CMMNDiagram': {
        'cmmndi:Size': { height: 800, width: 1200 },
        'cmmndi:CMMNShape': nodes.map((node: any) => ({
          '-id': `Shape_${node.id}`,
          '-cmmnElementRef': node.id,
          'dc:Bounds': {
            '-x': node.x - node.width / 2,
            '-y': node.y - node.height / 2,
            '-width': node.width,
            '-height': node.height
          }
        })),
        'cmmndi:CMMNEdge': edges.map((edge: any) => ({
          '-id': `Edge_${edge.id}`,
          '-cmmnElementRef': edge.id,
          'di:waypoint': edge.pointsList.map((point: any) => ({
            '-x': point.x,
            '-y': point.y
          }))
        }))
      }
    };
  }

  private getEntryCriterion(node: any, edges: any[]) {
    const incomingEdges = edges.filter(edge => edge.targetNodeId === node.id);
    return incomingEdges.map(edge => ({
      '-id': `EntryCriterion_${edge.id}`,
      '-sentryRef': `Sentry_${edge.id}`
    }));
  }

  private getExitCriterion(node: any, edges: any[]) {
    const outgoingEdges = edges.filter(edge => edge.sourceNodeId === node.id);
    return outgoingEdges.map(edge => ({
      '-id': `ExitCriterion_${edge.id}`,
      '-sentryRef': `Sentry_${edge.id}`
    }));
  }

  private getDefinitionProperties(node: any) {
    const typeMap: any = {
      CaseTask: CmmnElementsType.CASE_TASK,
      HumanTask: CmmnElementsType.HUMAN_TASK,
      Milestone: CmmnElementsType.MILESTONE,
      EventListener: CmmnElementsType.EVENT_LISTENER
    };

    return {
      '-type': typeMap[node.type] || node.type,
      ...node.properties
    };
  }
}

export class CmmnAdapter extends CmmnBaseAdapter {
  static pluginName = 'CmmnAdapter' 
  
  constructor(data: any) {
    super(data)
  }
}

export default CmmnAdapter
