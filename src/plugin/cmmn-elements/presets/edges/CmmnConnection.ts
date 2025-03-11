import { PolylineEdge, PolylineEdgeModel } from '@logicflow/core'

export class CmmnConnectionModel extends PolylineEdgeModel {
  // constructor(props: any) {
  //   super(props);
  // }

  getEdgeStyle() {
    const style = super.getEdgeStyle()
    style.stroke = '#666'
    style.strokeWidth = 2
    style.strokeDasharray = '5,5'
    return style
  }

  getArrowStyle() {
    const style = super.getArrowStyle()
    style.fill = '#666'
    return style
  }
}

export class CmmnConnection extends PolylineEdge {
  static extendKey = 'CmmnConnection'
}
