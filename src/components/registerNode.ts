import LogicFlow, {
  BaseNodeModel,
  CircleNode,
  CircleNodeModel,
  ConnectRule,
  PolygonNode,
  PolygonNodeModel,
  RectNode,
  RectNodeModel,
  HtmlNode,
  HtmlNodeModel,
  h,
} from '@logicflow/core';

import GraphModel from "@logicflow/core/types/model/GraphModel";
import { nanoid } from 'nanoid';
import { nodeProperty } from '../utils/type';
import BaseNode from './nodes/BaseNode';
import VueNode from './nodes/VueNode.vue';
import { createApp, ref, h } from 'vue';
type CustomProperties = {
  // 形状属性
  width?: number;
  height?: number;
  radius?: number;
  // 样式属性
  style?: LogicFlow.CommonTheme;
  textStyle?: LogicFlow.TextNodeTheme;
};

export default function RegisteNode(lf: LogicFlow) {

  class ApplyNodeModel extends CircleNodeModel {
    constructor(data: BaseNodeModel, graphModel: GraphModel) {
      super(data, graphModel);
      this.r = 20;
    }
    getConnectedTargetRules(): ConnectRule[] {
      const rules = super.getConnectedTargetRules();
      const geteWayOnlyAsTarget = {
        message: '开始节点只能连出，不能连入！',
        validate: (source: BaseNodeModel, target: BaseNodeModel) => {
          let isValid = true;
          if (target) {
            isValid = false;
          }
          return isValid;
        },
      };
      // @ts-ignore
      rules.push(geteWayOnlyAsTarget);
      return rules;
    }
    createId() {
      return 'nid-' + nanoid(6);
    }
  }
  lf.register({
    type: 'start',
    view: CircleNode,
    model: ApplyNodeModel,
  })

  // class JobNode extends RectNode {
  //   static extendKey = 'UserJobNode';
  //   getLabelShape() {
  //     const {
  //       x,
  //       y,
  //       width,
  //       height,
  //       properties,
  //     } = this.props.model;
  //     const { labelColor, approveTypeLabel } = properties as nodeProperty;
  //     return h(
  //       'text',
  //       {
  //         fill: labelColor,
  //         fontSize: 12,
  //         x: x - width / 2 + 5,
  //         y: y - height / 2 + 15,
  //         width: 50,
  //         height: 25
  //       },
  //       approveTypeLabel,
  //     );
  //   }
  //   getShape() {
  //     const {
  //       x,
  //       y,
  //       width,
  //       height,
  //       radius,
  //     } = this.props.model;
  //     const style = this.props.model.getNodeStyle();
  //     return h(
  //       'g',
  //       {
  //       },
  //       [
  //         h(
  //           'rect',
  //           {
  //             ...style,
  //             x: x - width / 2,
  //             y: y - height / 2,
  //             rx: radius,
  //             ry: radius,
  //             width,
  //             height,
  //           },
  //         ),
  //         this.getLabelShape(),
  //       ],
  //     );
  //   }
  // }

  class JobModel extends RectNodeModel {
    constructor(data: any, graphModel: GraphModel) {
      super(data, graphModel);
      this.width = 100;
      this.height = 50;
      this.radius = 5;
    }
    getNodeStyle() {
      const style = super.getNodeStyle();
      return style;
    }
    createId() {
      return 'nid-' + nanoid(6);
    }
  }

  lf.register({
    type: 'job',
    view: RectNode,
    model: JobModel,
  })

  class judgementModel extends PolygonNodeModel {
    constructor(data: any, graphModel: GraphModel) {
      super(data, graphModel);
      this.graphModel = graphModel
      this.points = [
        [35, 0],
        [70, 35],
        [35, 70],
        [0, 35],
      ];
    }

    getConnectedSourceRules() {
      const rules = super.getConnectedSourceRules()
      const notAsTarget = {
        message: '判断节点最多只能有两个出边',
        validate: (sourceNode) => {
          const edges = this.graphModel.getNodeOutgoingEdge(sourceNode.id)
          if (edges.length > 1) {
            return false
          }
          return true
        }
      }
      rules.push(notAsTarget)
      return rules
    }
    createId() {
      return 'nid-' + nanoid(6);
    }
  }
  lf.register({
    type: 'judgement',
    view: PolygonNode,
    model: judgementModel,
  });

  // class FinshNodeModel extends CircleNodeModel {
  //   constructor(data: BaseNodeModel, graphModel: GraphModel) {
  //     super(data, graphModel);
  //     this.r = 20;
  //   }
  //   getConnectedSourceRules(): ConnectRule[] {
  //     const rules = super.getConnectedSourceRules();
  //     const geteWayOnlyAsTarget = {
  //       message: '结束节点只能连入，不能连出！',
  //       validate: (source:BaseNodeModel) => {
  //         let isValid = true;
  //         if (source) {
  //           isValid = false;
  //         }
  //         return isValid;
  //       },
  //     };
  //     // @ts-ignore
  //     rules.push(geteWayOnlyAsTarget);
  //     return rules;
  //   }
  // }
  // class FinishNode extends CircleNode {
  //   getIconShape () {
  //     const {model} = this.props
  //     const {
  //       x,
  //       y,
  //       width,
  //       height
  //     } = model
  //     const stroke = 'rgb(255, 99, 71)'
  //     return h(
  //       'svg',
  //       {
  //         x: x - width / 2,
  //         y: y - height / 2,
  //         width: 40,
  //         height: 40,
  //         viewBox: '0 0 1024 1024'
  //       },
  //       h(
  //         'path',
  //         {
  //           fill: stroke,
  //           d: 'M212.992 526.336 212.992 526.336 212.992 526.336 215.04 526.336 212.992 526.336Z'
  //         }
  //       ),
  //       h(
  //         'path',
  //         {
  //           fill: stroke,
  //           d: 'M724.992 296.96 724.992 296.96 296.96 296.96 296.96 724.992 724.992 724.992 724.992 296.96Z'
  //         }
  //       )
  //     )
  //   }
  //   getShape () {
  //     const {model} = this.props
  //     const {x, y, r} = model
  //     const {fill, stroke, strokeWidth} = model.getNodeStyle()
  //     return h(
  //       'g',
  //       {
  //       },
  //       [
  //         h(
  //           'circle',
  //           {
  //             cx: x,
  //             cy: y,
  //             r,
  //             fill,
  //             stroke,
  //             strokeWidth
  //           }
  //         ),
  //         this.getIconShape()
  //       ]
  //     )
  //   }
  // }
  class FinishModel extends CircleNodeModel {
    initNodeData(data) {
      data.text = {
        value: (data.text && data.text.value) || '结束',
        x: data.x,
        y: data.y + 35
      }
      super.initNodeData(data)
      this.r = 20
    }
    getConnectedSourceRules() {
      const rules = super.getConnectedSourceRules()
      const notAsTarget = {
        message: '终止节点不能作为连线的起点',
        validate: () => false
      }
      rules.push(notAsTarget)
      return rules
    }
    createId() {
      return 'nid-' + nanoid(6);
    }
  }

  lf.register({
    type: 'end',
    view: CircleNode,
    model: FinishModel,
  })

  class FunctionNode extends BaseNode.view {
    // getIcon () {
    //   const {
    //     width,
    //     height,
    //   } = this.props.model;
    //   return h('image', {
    //     width: 30,
    //     height: 30,
    //     x: - width / 2,
    //     y: - height / 2,
    //     href: 'images/function.svg'
    //   })
    // }
  }

  class FunctionNodeModel extends BaseNode.model {
    initNodeData(data) {
      super.initNodeData(data)
      this.defaultFill = 'rgb(253, 208, 162)'
    }
  }

  lf.register({
    type: 'function-node',
    model: FunctionNodeModel,
    view: FunctionNode
  })

  // 预案处置要点节点
  class PlanNode extends HtmlNode {
    constructor(props) {
      super(props)
      this.isMounted = false
      this.r = h(VueNode, {
        properties: props.model.getProperties(),
        text: props.model.inputData,
        onBtnClick: (i) => {
          this.r.component.props.text = String(Number(this.r.component.props.text) + Number(i))
        }
      })
      this.app = createApp({
        render: () => this.r
      })
    }
    setHtml(rootEl) { // 在节点properties发生变化了后再触发。
      if (!this.isMounted) {
        this.isMounted = true
        const node = document.createElement('div')
        rootEl.appendChild(node)
        this.app.mount(node)
      } else {
        this.r.component.props.properties = this.props.model.getProperties()
      }
    }
    getText() {
      return null
    }
  }

  class PlanNodeModel extends HtmlNodeModel {
    setAttributes() {
      this.width = 300;
      this.height = 200;
      this.text.editable = false;
      this.inputData = this.text.value
    }
    getOutlineStyle() {
      const style = super.getOutlineStyle();
      style.stroke = 'none';
      style.hover.stroke = 'none';
      return style;
    }
    getDefaultAnchor() {
      return []
    }
    getData() {
      const data = super.getData()
      data.text.value = this.inputData
      return data
    }
    // getNodeStyle() {
    //   const style = super.getNodeStyle();

    //   const properties = this.properties;
    //   if (properties.status === 'success') {
    //     // 业务属性statu为‘pass’时 展示边框颜色为green
    //     style.background = 'rgb(101, 221, 165)';
    //   }
    //   return style;
    // }
  }

  lf.register({
    type: 'plan-node',
    view: PlanNode,
    model: PlanNodeModel,
  });
}