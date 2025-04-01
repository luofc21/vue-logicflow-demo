import { h } from '@logicflow/core';
import { RectNode, RectNodeModel } from '@logicflow/core';
import { stageIcon } from './icons';
import { DynamicGroupNodeModel } from '@logicflow/extension';

// 定义Stage节点模型，使用 DynamicGroupNodeModel
class StageModel extends DynamicGroupNodeModel {
  static extendKey = 'StageModel';

  constructor(data: any, graphModel: any) {
    super({
      ...data,
      isGroup: true
    }, graphModel);
    this.isTaskNode = true;
    this.resizable = true;
    this.autoToFront = false;
    this.radius = 5;
    
    // 如果数据中包含children属性，使用它初始化childrenIds
    if (data.children && Array.isArray(data.children)) {
      this.childrenIds = [...data.children];
    }
    this.boundaryEvents = [];
  }

  initNodeData(data) {
    super.initNodeData(data);
    this.text = {
      ...this.text,
      value: data.text?.value || 'Stage',
    };
    this.width = data.width || 400;
    this.height = data.height || 350;
  }

  // 重写getData方法，确保返回childrenIds
  getData() {
    const data = super.getData();
    return {
      ...data,
      children: this.childrenIds,
    };
  }

  // 重写setProperties方法，确保正确恢复子节点关系
  setProperties(properties: any) {
    super.setProperties(properties);
    if (properties.children) {
      this.childrenIds = [...properties.children];
    }
  }

  getNodeStyle() {
    const style = super.getNodeStyle();
    return {
      ...style,
      fill: '#f5f5f5',
      stroke: this.isSelected ? '#3a84ff' : '#666',
      strokeWidth: this.isSelected ? 2 : 1,
      strokeDasharray: '4 4',
    };
  }

  // 添加子节点
  addChild(nodeId: string) {
    if (!this.childrenIds.includes(nodeId)) {
      this.childrenIds.push(nodeId);
    }
  }

  // 移除子节点
  removeChild(nodeId: string) {
    const index = this.childrenIds.indexOf(nodeId);
    if (index !== -1) {
      this.childrenIds.splice(index, 1);
    }
  }

  // 获取所有子节点ID
  getChildren() {
    return this.childrenIds;
  }

  // 判断是否包含指定节点
  isChild(nodeId: string) {
    return this.childrenIds.includes(nodeId);
  }

  // 添加边界事件节点
  addBoundaryEvent(nodeId: string) {
    if (!this.boundaryEvents.includes(nodeId)) {
      this.boundaryEvents.push(nodeId);
    }
  }

  // 删除边界事件节点
  deleteBoundaryEvent(nodeId: string) {
    const index = this.boundaryEvents.indexOf(nodeId);
    if (index !== -1) {
      this.boundaryEvents.splice(index, 1);
    }
  }

  // 设置是否处于触摸状态（用于拖拽时的样式提示）
  setTouching(isTouching: boolean) {
    this.isTouching = isTouching;
  }
}

// 定义Stage节点视图
class StageView extends RectNode {
  getShape() {
    const { x, y, width, height } = this.props.model;
    const style = this.getNodeStyle();
    
    return h('g', {}, [
      h('rect', {
        ...style,
        x: x - width / 2,
        y: y - height / 2,
        width,
        height,
        className: 'lf-resizable-node',
      }),
      h('text', {
        x: x - width / 2 + 10,
        y: y - height / 2 + 20,
        fill: '#333',
        textAnchor: 'start',
        dominantBaseline: 'middle',
        fontSize: 14,
      }, this.props.model.text.value || '阶段'),
    ]);
  }

  getNodeStyle() {
    const { model } = this.props;
    const isTouching = model.isTouching;
    return { 
      fill: '#f8f8f8', 
      stroke: isTouching ? '#3a84ff' : '#909399',
      strokeWidth: isTouching ? 2 : 1,
      strokeDasharray: '4, 4'
    };
  }
}

export const Stage = {
  type: 'cmmn:stage',
  view: StageView,
  model: StageModel,
  // // 默认配置
  // options: {
  //   width: 400,
  //   height: 350,
  //   // resizable: true, // 单独设置节点可调整大小
  //   properties: {
  //     collapsible: false, // 是否可折叠
  //     isCollapsed: false, // 是否默认折叠
  //     // stage 特有的属性
  //     autoComplete: false,
  //     planningTable: null,
  //     defaultControl: {
  //       required: false,
  //       repetition: false,
  //       manualActivation: true
  //     }
  //   }
  // }
};