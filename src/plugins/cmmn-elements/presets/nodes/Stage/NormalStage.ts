import LogicFlow, { h } from '@logicflow/core';
import { DynamicGroupNodeModel, DynamicGroupNode } from '@logicflow/extension';

// 定义Stage节点模型
class StageModel extends DynamicGroupNodeModel {
    static extendKey = 'StageModel';

    constructor(data: any, graphModel: any) {
        super({
            ...data,
            isGroup: true,
            width: 400,
            height: 350,
            radius: 5,
            isCollapsed: false,
            collapsible: true,
            collapsedWidth: 400,
            collapsedHeight: 80
        }, graphModel);
    }

    initNodeData(data: any) {
        super.initNodeData(data);
        // 设置默认文本
        this.text = {
            ...this.text,
            value: data.text?.value || 'Stage',
            x: 0, // 水平居中
            y: -this.height / 2 + 20, // 顶部居中
            draggable: false
        };
    }

    // setProperties(properties: Record<string, any>): void {
    //     // 设置默认文本
    //     if (properties.text?.vlaue) {
    //         this.text = {
    //             ...this.text,
    //             value: properties.text?.value,
    //         };
    //     }
    // }

    // 获取折叠状态
    getCollapseState() {
        return this.isCollapsed;
    }

    // 触发编辑事件
    handleEdit() {
        // 触发自定义事件
        console.log('edit data===>', this.getData());
        this.graphModel.eventCenter.emit('stage:edit', { nodeId: this.id, nodeData: this.getData() }); // 父组件的getData方法
    }
}

// 定义Stage节点视图
class StageView extends DynamicGroupNode {
    getShape() {
        const { x, y, width, height, radius } = this.props.model;
        const style = this.getNodeStyle();
        const isCollapsed = this.props.model.getCollapseState();

        return h('g', {}, [
            // 绘制主矩形
            h('rect', {
                ...style,
                x: x - width / 2,
                y: y - height / 2,
                width,
                height,
                rx: radius,
                ry: radius,
                className: 'lf-resizable-node',
            }),

            // 绘制标题背景
            h('rect', {
                x: x - width / 2,
                y: y - height / 2,
                width,
                height: 40,
                rx: radius,
                ry: radius,
                fill: '#f0f0f0',
                stroke: 'none'
            }),

            // 绘制折叠按钮
            h('g', {
                transform: `translate(${x - width / 2 + 10}, ${y - height / 2 + 20})`,
                cursor: 'pointer',
                onClick: () => this.props.model.toggleCollapse(!this.props.model.isCollapsed)
            }, [
                h('circle', {
                    r: 8,
                    fill: '#fff',
                    stroke: '#666',
                    strokeWidth: 1
                }),
                h('path', {
                    d: isCollapsed ? 'M0,-4 L0,4 M-4,0 L4,0' : 'M-4,0 L4,0',
                    stroke: '#666',
                    strokeWidth: 1.5
                })
            ]),

            // 绘制编辑按钮（仅在展开状态显示）
            ...(isCollapsed ? [] : [
                h('g', {
                    transform: `translate(${x + width / 2 - 30}, ${y - height / 2 + 20})`,
                    cursor: 'pointer',
                    onClick: () => this.props.model.handleEdit()
                }, [
                    h('circle', {
                        r: 8,
                        fill: '#fff',
                        stroke: '#666',
                        strokeWidth: 1
                    }),
                    // 三点图标
                    h('g', {}, [
                        h('circle', {
                            cx: -4,
                            cy: 0,
                            r: 1.5,
                            fill: '#666'
                        }),
                        h('circle', {
                            cx: 0,
                            cy: 0,
                            r: 1.5,
                            fill: '#666'
                        }),
                        h('circle', {
                            cx: 4,
                            cy: 0,
                            r: 1.5,
                            fill: '#666'
                        })
                    ])
                ])
            ]),

            // 绘制标题文本
            h('text', {
                x,
                y: y - height / 2 + 20,
                fill: '#333',
                fontSize: 14,
                fontWeight: 'bold',
                textAnchor: 'middle',
                dominantBaseline: 'middle'
            }, this.props.model.text.value || 'Stage')
        ]);
    }

    getNodeStyle() {
        const { model } = this.props;
        return {
            fill: '#f8f8f8',
            stroke: model.isSelected ? '#3a84ff' : '#909399',
            strokeWidth: model.isSelected ? 2 : 1,
            strokeDasharray: '4, 4'
        };
    }
}

export const Stage = {
    type: 'cmmn:stage',
    view: StageView,
    model: StageModel
};
