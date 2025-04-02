import { lfJson2Xml, lfXml2Json } from './utils'
import { CmmnElementsType } from '../cmmn-elements'

type ExtraPropsType = Record<string, any>

interface IResult {
  nodes: any[];
  edges: any[];
}

// 添加属性转换配置接口
interface PropertyTransformConfig {
  // 是否转换基本属性（如width、height等）
  transformBasicProps?: boolean;
  // 需要转换的属性列表
  includeProps?: string[];
  // 不需要转换的属性列表
  excludeProps?: string[];
  // 属性名称映射（key为LogicFlow中的属性名，value为CMMN中的属性名）
  propNameMapping?: Record<string, string>;
}

class CmmnBaseAdapter {
  static pluginName = 'cmmn-adapter'
  static shapeConfigMap = new Map()
  private propertyConfig: PropertyTransformConfig;

  constructor(data: any) {
    const { lf, propertyConfig } = data
    this.propertyConfig = propertyConfig || {
      transformBasicProps: false, // 默认不转换基本属性
      includeProps: ['action'],
      excludeProps: ['readOnly'],
      propNameMapping: {'action': 'extensionElements'}
    };
    lf.adapterIn = this.adapterIn
    lf.adapterOut = this.adapterOut
  }

  adapterOut = (data: any, other?: ExtraPropsType) => {
    const { nodes, edges } = data
    // 转换dynamic-group节点为stage节点
    const convertedNodes = this.convertDynamicGroupsToStages(nodes);
    
    const cmmnJson: any = {
      'cmmn:definitions': {
        '-xmlns:cmmn': 'http://www.omg.org/spec/CMMN/20151109/MODEL',
        '-xmlns:cmmndi': 'http://www.omg.org/spec/CMMN/20151109/CMMNDI',
        '-xmlns:flowable': 'http://flowable.org/cmmn',
        '-xmlns:dc': 'http://www.omg.org/spec/CMMN/20151109/DC',
        '-xmlns:di': 'http://www.omg.org/spec/CMMN/20151109/DI',
        '-targetNamespace': 'http://www.flowable.org/casedef',
        'cmmn:case': {
          '-id': `Case_${Date.now()}`,
          '-name': 'CMMN Case',
          'cmmn:casePlanModel': this.convertLf2CmmnProcess(convertedNodes, edges)
        },
        'cmmndi:CMMNDI': this.convertLf2CmmnDiagram({ nodes: convertedNodes, edges })
      }
    }
    return cmmnJson
  }

  adapterIn = (cmmnData: any, other?: ExtraPropsType) => {
    let xml = cmmnData;
    let json;
    
    // 如果输入是XML字符串，先转换为JSON
    if (typeof cmmnData === 'string') {
      json = lfXml2Json(cmmnData);
    } else {
      json = cmmnData;
    }
    
    // 如果没有获取到definitions，返回空对象
    if (!json || !json['cmmn:definitions']) {
      return { nodes: [], edges: [] };
    }
    
    const definitions = json['cmmn:definitions'];
    const caseDef = definitions['cmmn:case'];
    
    if (!caseDef || !caseDef['cmmn:casePlanModel']) {
      return { nodes: [], edges: [] };
    }
    
    const casePlanModel = caseDef['cmmn:casePlanModel'];
    
    // 转换节点和边
    return this.convertCmmn2Lf(casePlanModel, definitions);
  }

  /**
   * 将CMMN XML转换为LogicFlow数据
   */
  private convertCmmn2Lf(casePlanModel: any, definitions: any): IResult {
    const result: IResult = {
      nodes: [],
      edges: []
    };
    
    // 获取CMMNDI信息，用于设置节点和边的位置
    const cmmnDI = definitions['cmmndi:CMMNDI'];
    const shapesMap = new Map();
    const edgesMap = new Map();
    
    // 处理图形位置信息
    if (cmmnDI && cmmnDI['cmmndi:CMMNDiagram']) {
      const diagram = cmmnDI['cmmndi:CMMNDiagram'];
      
      // 处理节点位置
      if (diagram['cmmndi:CMMNShape']) {
        const shapes = Array.isArray(diagram['cmmndi:CMMNShape']) 
          ? diagram['cmmndi:CMMNShape'] 
          : [diagram['cmmndi:CMMNShape']];
        
        shapes.forEach(shape => {
          if (shape['dc:Bounds']) {
            const bounds = shape['dc:Bounds'];
            const id = shape['-cmmnElementRef'];
            shapesMap.set(id, {
              x: parseFloat(bounds['-x']) + parseFloat(bounds['-width']) / 2,
              y: parseFloat(bounds['-y']) + parseFloat(bounds['-height']) / 2,
              width: parseFloat(bounds['-width']),
              height: parseFloat(bounds['-height'])
            });
          }
        });
      }
      
      // 处理边的位置
      if (diagram['cmmndi:CMMNEdge']) {
        const edges = Array.isArray(diagram['cmmndi:CMMNEdge']) 
          ? diagram['cmmndi:CMMNEdge'] 
          : [diagram['cmmndi:CMMNEdge']];
        
        edges.forEach(edge => {
          const id = edge['-cmmnElementRef'];
          const waypoints = Array.isArray(edge['di:waypoint']) 
            ? edge['di:waypoint'] 
            : [edge['di:waypoint']];
          
          edgesMap.set(id, {
            pointsList: waypoints.map((point: any) => ({
              x: parseFloat(point['-x']),
              y: parseFloat(point['-y'])
            }))
          });
        });
      }
    }
    
    // 处理planItem节点
    if (casePlanModel['cmmn:planItem']) {
      const planItems = Array.isArray(casePlanModel['cmmn:planItem']) 
        ? casePlanModel['cmmn:planItem'] 
        : [casePlanModel['cmmn:planItem']];
      
      // 用于存储planItem与其definition的映射关系
      const planItemDefMap = new Map();
      
      // 首先获取所有planItem的定义引用
      planItems.forEach(planItem => {
        const planItemId = planItem['-id'];
        const definitionRef = planItem['-definitionRef'];
        planItemDefMap.set(planItemId, definitionRef);
      });
      
      // 创建任务节点映射，通过类型查找对应的定义
      const taskDefinitionsMap = new Map();
      
      // 处理各种任务类型的定义
      const taskTypes = [
        'cmmn:humanTask', 
        'cmmn:caseTask', 
        'cmmn:processTask', 
        'cmmn:milestone',
        'cmmn:stage'
      ];
      
      taskTypes.forEach(taskType => {
        if (casePlanModel[taskType]) {
          const tasks = Array.isArray(casePlanModel[taskType]) 
            ? casePlanModel[taskType] 
            : [casePlanModel[taskType]];
          
          tasks.forEach(task => {
            taskDefinitionsMap.set(task['-id'], {
              type: taskType.replace('cmmn:', ''),
              ...task
            });
          });
        }
      });
      
      // 处理每个planItem，转换为LogicFlow节点
      planItems.forEach(planItem => {
        const planItemId = planItem['-id'];
        const definitionRef = planItem['-definitionRef'];
        const definition = taskDefinitionsMap.get(definitionRef);
        
        if (definition) {
          const shape = shapesMap.get(planItemId) || { x: 100, y: 100, width: 100, height: 80 };
          
          // 转换为节点类型
          let nodeType;
          switch (definition.type) {
            case 'humanTask':
              nodeType = 'cmmn:humanTask';
              break;
            case 'milestone':
              nodeType = 'cmmn:milestone';
              break;
            case 'stage':
              nodeType = 'cmmn:stage';
              break;
            case 'caseTask':
              nodeType = 'cmmn:caseTask';
              break;
            case 'processTask':
              nodeType = 'cmmn:processTask';
              break;
            default:
              nodeType = 'cmmn:task';
          }
          
          // 创建节点
          const node = {
            id: planItemId,
            type: nodeType,
            x: shape.x,
            y: shape.y,
            width: shape.width,
            height: shape.height,
            text: { 
              x: shape.x, 
              y: shape.y, 
              value: definition['-name'] || ''
            },
            properties: {
              definitionId: definition['-id'],
              ...this.extractProperties(definition)
            }
          };
          
          result.nodes.push(node);
          
          // 处理entryCriterion和exitCriterion
          if (planItem['cmmn:entryCriterion']) {
            this.processCriterion(planItem['cmmn:entryCriterion'], planItemId, 'entry', result);
          }
          
          if (planItem['cmmn:exitCriterion']) {
            this.processCriterion(planItem['cmmn:exitCriterion'], planItemId, 'exit', result);
          }
        }
      });
    }
    
    // 处理连接关系，未实现sentry处理，需进一步完善
    // TODO: 根据sentry处理边的连接关系
    
    return result;
  }
  
  /**
   * 处理条件节点，创建边的连接关系
   */
  private processCriterion(criteria: any, planItemId: string, type: string, result: IResult) {
    // 简单实现，仅记录条件，实际应与sentry结合处理
    const criteriaArray = Array.isArray(criteria) ? criteria : [criteria];
    
    criteriaArray.forEach(criterion => {
      if (criterion['-id']) {
        result.nodes.push({
          id: criterion['-id'],
          type: type === 'entry' ? 'cmmn:entryCriterion' : 'cmmn:exitCriterion',
          x: 0, // 位置需要根据planItem位置计算
          y: 0,
          properties: {
            sentryRef: criterion['-sentryRef'],
            attachedToRef: planItemId
          }
        });
      }
    });
  }
  
  /**
   * 提取节点属性
   */
  private extractProperties(definition: any) {
    const properties: any = {};
    
    // 提取非标准属性
    Object.keys(definition).forEach(key => {
      if (!key.startsWith('-') && key !== 'type') {
        properties[key] = definition[key];
      }
    });
    
    return properties;
  }

  private convertLf2CmmnProcess(nodes: any[], edges: any[]) {
    const planItems: any[] = [];
    const definitions: Record<string, any[]> = {}; // 使用对象存储不同类型的定义
    const stageNodes = new Map(); // 存储 stage 节点及其子节点的映射
    const processedChildren = new Set(); // 跟踪已处理的子节点
    console.log('node ===>', nodes)

    // 首先处理所有 stage 节点及其子节点关系
    nodes.forEach(node => {
      if (node.type === 'cmmn:stage' && node.children) {
        stageNodes.set(node.id, node.children);
        // 将所有子节点添加到已处理集合中
        node.children.forEach((childId: string) => {
          processedChildren.add(childId);
        });
      }
    });

    // 处理普通节点
    nodes.forEach(node => {
      // 如果节点是某个 stage 的子节点，跳过添加到顶层 planItems
      if (processedChildren.has(node.id)) {
        return; // 跳过已经作为子节点处理的节点
      }

      const planItem = {
        '-id': `PlanItem_${node.id}`,
        '-definitionRef': `Definition_${node.id}`,
        'cmmn:entryCriterion': this.getEntryCriterion(node, edges),
        'cmmn:exitCriterion': this.getExitCriterion(node, edges)
      };
      
      const definition = {
        '-id': `Definition_${node.id}`,
        '-name': node.text?.value || '',
        '-type': this.getNodeType(node.type)
      };

      // 根据配置添加属性
      const properties = this.getDefinitionProperties(node);
      if (Object.keys(properties).length > 0) {
        Object.assign(definition, properties);
      }

      // 如果是 stage 节点且有子节点，则添加子节点
      if (node.type === 'cmmn:stage' && stageNodes.has(node.id)) {
        const childrenIds = stageNodes.get(node.id);
        const childPlanItems: any[] = [];
        const childDefinitions: Record<string, any[]> = {};
        
        // 处理 stage 的子节点
        childrenIds.forEach((childId: string) => {
          const childNode = nodes.find(n => n.id === childId);
          if (!childNode) return;

          const childPlanItem = {
            '-id': `PlanItem_${childId}`,
            '-definitionRef': `Definition_${childId}`,
            'cmmn:entryCriterion': this.getEntryCriterion(childNode, edges),
            'cmmn:exitCriterion': this.getExitCriterion(childNode, edges)
          };

          const childDefinition = {
            '-id': `Definition_${childId}`,
            '-name': childNode.text?.value || '',
            '-type': this.getNodeType(childNode.type)
          };

          // 根据配置添加属性
          const childProperties = this.getDefinitionProperties(childNode);
          if (Object.keys(childProperties).length > 0) {
            Object.assign(childDefinition, childProperties);
          }

          childPlanItems.push(childPlanItem);
          
          // 按类型分组子节点定义
          const nodeType = childNode.type;
          if (!childDefinitions[nodeType]) {
            childDefinitions[nodeType] = [];
          }
          childDefinitions[nodeType].push(childDefinition);
        });

        // 将子节点的 planItem 添加到 stage 定义中
        if (childPlanItems.length > 0) {
          definition['cmmn:planItem'] = childPlanItems;
        }
        
        // 将子节点定义直接添加到 stage 定义中
        Object.entries(childDefinitions).forEach(([type, defs]) => {
          if (defs && defs.length > 0) {
            definition[type] = defs;
          }
        });
      }

      // 添加到顶层 planItems
      planItems.push(planItem);
      
      // 根据节点类型添加到相应的定义集合中
      if (!definitions[node.type]) {
        definitions[node.type] = [];
      }
      definitions[node.type].push(definition);
    });
    
    // 构建最终的 casePlanModel 结构
    const casePlanModel = {
      '-id': `CasePlanModel_${Date.now()}`,
      'cmmn:planItem': planItems.length > 0 ? planItems : undefined,
    };
    
    // 添加各类型的定义到 casePlanModel
    Object.entries(definitions).forEach(([type, defs]) => {
      if (defs && defs.length > 0) {
        casePlanModel[type] = defs;
      }
    });
    
    return casePlanModel;
  }

  private getNodeType(type: string): string {
    const typeMap: any = {
      'cmmn:humanTask': CmmnElementsType.HUMAN_TASK,
      'cmmn:milestone': CmmnElementsType.MILESTONE,
      'cmmn:caseTask': CmmnElementsType.CASE_TASK,
      'cmmn:stage': CmmnElementsType.STAGE,
      'cmmn:processTask': CmmnElementsType.PROCESS_TASK,
      'cmmn:task': CmmnElementsType.TASK
    };
    return typeMap[type] || type;
  }

  private getDefinitionProperties(node: any) {
    const properties: any = {};

    // 处理基本属性，作为 XML 属性
    if (this.propertyConfig.transformBasicProps) {
      if (node.width) properties['-width'] = node.width;
      if (node.height) properties['-height'] = node.height;
    }

    // 处理自定义属性
    if (node.properties) {
      // console.log('node.properties +++===>', node.properties)
      Object.entries(node.properties).forEach(([key, value]) => {
        // 检查是否在排除列表中
        if (this.propertyConfig.excludeProps?.includes(key)) {
          return;
        }

        // 使用属性名称映射
        const mappedKey = this.propertyConfig.propNameMapping?.[key] || key;
        
        // 处理action对象，转换为flowable:field格式
        if (key === 'action' && typeof value === 'object') {
          properties['cmmn:extensionElements'] = this.convertActionToFlowableFields(value);
        } 
        // 检查是否在包含列表中，则属性作为 XML 子标签
        else if ((this.propertyConfig.includeProps || []).length > 0 && (this.propertyConfig.includeProps || []).includes(key)) {
          properties[mappedKey] = value;
        } 
        // 如果没有指定包含列表，则所有属性都作为 XML 属性
        else {
          properties[`-${mappedKey}`] = value;
        }
      });
    }
    // console.log('properties +++===>', properties)

    return properties;
  }

  /**
   * 将action对象转换为flowable:field格式
   * @param actionObj action对象
   * @returns 转换后的flowable:field格式对象
   */
  private convertActionToFlowableFields(actionObj: any) {
    // 创建flowable:field数组
    const flowableFields: any[] = [];
    
    // 遍历action对象的所有属性
    Object.entries(actionObj).forEach(([key, value]) => {
      // 创建flowable:field对象
      const fieldObj = {
        '-name': key,
        'flowable:string': {
          '#cdata-section': String(value)
        }
      };
      
      // 添加到数组
      flowableFields.push(fieldObj);
    });
    
    // 返回包含所有flowable:field的extensionElements对象，使用cmmn:前缀
    return {
      'flowable:field': flowableFields
    };
  }

  private convertLf2CmmnDiagram(data: any) {
    const { nodes, edges } = data;
    
    // 创建所有节点的形状数据
    const shapes = nodes.map((node: any) => ({
      '-id': `Shape_${node.id}`,
      '-cmmnElementRef': `PlanItem_${node.id}`,
      'dc:Bounds': {
        '-x': isNaN(node.x) ? 200 : node.x - (node.width || 100) / 2,
        '-y': isNaN(node.y) ? 200 : node.y - (node.height || 80) / 2,
        '-width': node.width || 100,
        '-height': node.height || 80
      },
      'cmmndi:CMMNLabel': {}
    }));
    
    // 创建所有边的数据
    const edgeShapes = edges.map((edge: any) => ({
      '-id': `Edge_${edge.id}`,
      '-cmmnElementRef': edge.id,
      'di:waypoint': edge.pointsList.map((point: any) => ({
        '-x': point.x,
        '-y': point.y
      }))
    }));
    
    return {
      'cmmndi:CMMNDiagram': {
        '-id': `CMMNDiagram_${Date.now()}`,
        'cmmndi:Size': { '-height': 800, '-width': 1200 },
        'cmmndi:CMMNShape': shapes,
        'cmmndi:CMMNEdge': edgeShapes
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

  /**
   * 将dynamic-group节点转换为stage节点
   */
  private convertDynamicGroupsToStages(nodes: any[]): any[] {
    return nodes.map(node => {
      if (node.type === 'dynamic-group') {
        // 获取节点的所有子节点
        const children = node.children || [];
        
        // 创建新的stage节点
        return {
          ...node,
          type: 'cmmn:stage',
          children: children,
          properties: {
            ...node.properties,
            definitionId: `Definition_${node.id}`,
            name: node.text?.value || 'Stage'
          }
        };
      }
      return node;
    });
  }
}

export class CmmnAdapter extends CmmnBaseAdapter {
  static pluginName = 'CmmnAdapter' 
  
  private props: ExtraPropsType;
  constructor(data: any) {
    super(data);
    const { lf, props } = data;
    lf.adapterIn = this.adapterXmlIn;
    lf.adapterOut = this.adapterXmlOut;
    this.props = props;
  }
  adapterXmlIn = (cmmnData: any) => {
    const json = lfXml2Json(cmmnData);
    return this.adapterIn(json, this.props);
  };
  adapterXmlOut = (data: any) => {
    const outData = this.adapterOut(data, this.props);
    return lfJson2Xml(outData);
  };
}

export default CmmnAdapter
