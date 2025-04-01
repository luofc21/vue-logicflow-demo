import LogicFlow, { BaseNodeModel } from '@logicflow/core';
import { DynamicGroup } from '@logicflow/extension';

/**
 * Stage 节点组合插件
 * 基于 LogicFlow 的 DynamicGroup 插件实现
 */
export class StageGroupPlugin {
  static pluginName = 'stageGroup';
  private dynamicGroup: DynamicGroup | null = null;
  private lf: LogicFlow | null = null;
  private stageNodes: BaseNodeModel[] = [];

  constructor({ lf }: any) {
    if (!lf) {
      throw new Error('LogicFlow instance is required');
    }
    try {
      this.lf = lf;
      this.dynamicGroup = new DynamicGroup({
        lf,
        LogicFlow,
        options: {
          isCollapsed: false
        }
      });
      this.initEventListeners();
    } catch (error) {
      console.error('Failed to initialize StageGroupPlugin:', error);
      throw error;
    }
  }

  /**
   * 初始化事件监听
   */
  initEventListeners() {
    if (!this.lf) return;
    const { eventCenter } = this.lf;
    if (!eventCenter) return;

    // 定义事件数据类型
    interface NodeDropEvent {
      data: {
        id: string;
        type: string;
        x: number;
        y: number;
      };
    }

    // 监听节点拖拽结束
    eventCenter.on('node:drop', ({ data }: NodeDropEvent) => {
      if (!data || !this.lf) return;
      
      // 获取拖拽节点的位置
      const { x, y } = data;
      
      // 获取所有 Stage 和 dynamic-group 节点
      const groupNodes = this.lf.getNodes().filter(node => 
        node.type === 'cmmn:stage' || node.type === 'dynamic-group'
      );
      
      // 查找包含该点的组节点
      const containGroup = groupNodes.find(node => {
        if (!node || node.id === data.id) return false;
        
        return this.isPointInNode({ x, y }, node);
      });

      // 如果节点在组内，使用 DynamicGroup 处理分组
      if (containGroup && this.dynamicGroup) {
        console.debug('Adding node to group:', {
          nodeId: data.id,
          groupId: containGroup.id,
          groupType: containGroup.type,
          position: { x, y }
        });
        
        // 确保组节点有children数组
        if (!containGroup.children) {
          containGroup.children = [];
        }
        
        // 添加子节点ID
        if (!containGroup.children.includes(data.id)) {
          containGroup.children.push(data.id);
        }
        
        this.dynamicGroup.addNodeToGroup({
          data: {
            id: data.id,
            type: data.type,
            x,
            y
          }
        });
      }
    });

    // 监听节点删除
    eventCenter.on('node:delete', ({ data }: any) => {
      if (!data || !this.lf || !this.dynamicGroup) return;
      const model = this.lf.getNodeModelById(data.id);
      if (!model) return;
      
      // 从所有组中移除该节点
      const groupNodes = this.lf.getNodes().filter(node => 
        node.type === 'cmmn:stage' || node.type === 'dynamic-group'
      );
      
      groupNodes.forEach(groupNode => {
        if (groupNode.children && groupNode.children.includes(data.id)) {
          groupNode.children = groupNode.children.filter(id => id !== data.id);
        }
      });
      
      this.dynamicGroup.removeNodeFromGroup({
        data,
        model
      });
    });

    // 在节点添加/删除时更新缓存
    eventCenter.on('node:add', () => this.updateStageNodes());
    eventCenter.on('node:delete', () => this.updateStageNodes());
  }

  private isPointInNode(point: { x: number; y: number }, node: BaseNodeModel): boolean {
    const { x: nodeX, y: nodeY, width, height } = node;
    const minX = nodeX - width / 2;
    const minY = nodeY - height / 2;
    const maxX = nodeX + width / 2;
    const maxY = nodeY + height / 2;
    
    return point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY;
  }

  private updateStageNodes() {
    if (!this.lf) return;
    this.stageNodes = this.lf.getNodes().filter(node => 
      node.type === 'cmmn:stage' || node.type === 'dynamic-group'
    );
  }

  render(lf: LogicFlow, domContainer: HTMLElement) {
    // DynamicGroup 插件会自动处理渲染
  }

  destroy() {
    if (!this.lf) return;
    const { eventCenter } = this.lf;
    if (eventCenter) {
      eventCenter.off('node:drop');
      eventCenter.off('node:delete');
      eventCenter.off('node:add');
    }
    this.stageNodes = [];
    this.dynamicGroup = null;
    this.lf = null;
  }
} 