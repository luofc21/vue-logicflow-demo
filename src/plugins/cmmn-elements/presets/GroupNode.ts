import { RectNodeModel } from '@logicflow/core';

export class GroupNodeModel extends RectNodeModel {
  // 子节点ID列表
  protected childrenIds: string[] = [];

  setAttributes() {
    super.setAttributes();
    this.isTaskNode = true;
    this.resizable = true;
    this.autoToFront = false;
    this.boundaryEvents = [];
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

  getData() {
    const data = super.getData();
    return {
      ...data,
      children: this.childrenIds
    };
  }
} 