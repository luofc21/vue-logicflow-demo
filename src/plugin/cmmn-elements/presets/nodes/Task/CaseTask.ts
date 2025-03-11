import { RectNode, RectNodeModel } from '@logicflow/core'

export class CaseTaskModel extends RectNodeModel {
  static extendKey = 'CaseTaskModel'
  constructor(data: any) {
    super(data)
    this.width = 100
    this.height = 80
  }
  getNodeStyle() {
    const style = super.getNodeStyle()
    style.fill = '#fff'
    style.stroke = '#000'
    return style
  }
}

export class CaseTask extends RectNode {
  static extendKey = 'CaseTask'
  getShape() {
    const { x, y, width, height } = this.props.model
    return `
      <g>
        <rect x="${x - width/2}" y="${y - height/2}" width="${width}" height="${height}" />
        <use href="//at.alicdn.com/t/c/font_4198442_tglks8888wu.js#icon-case" x="${x - 20}" y="${y - 20}" width="40" height="40"/>
      </g>
    `
  }
}
