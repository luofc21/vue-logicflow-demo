import * as icons from '@plugins/cmmn-elements/presets/nodes/icons'

export function registerSvgIcons() {
  // 创建 SVG sprite
  const svgSprite = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svgSprite.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  svgSprite.setAttribute('style', 'display: none')
  
  // 遍历所有图标并注册
  Object.entries(icons).forEach(([iconName, iconContent]) => {
    const symbol = document.createElementNS('http://www.w3.org/2000/svg', 'symbol')
    symbol.setAttribute('id', iconName.replace(/Icon$/, '')) // 移除 "Icon" 后缀
    symbol.setAttribute('viewBox', '0 0 32 32') // 修改 viewBox 以匹配图标尺寸

    if (typeof iconContent === 'object' && iconContent.tagName) {
      // 将虚拟节点转换为实际的 DOM 节点
      const svgElement = document.createElementNS('http://www.w3.org/2000/svg', iconContent.tagName)
      
      // 设置属性
      if (iconContent.attrs) {
        Object.entries(iconContent.attrs).forEach(([key, value]) => {
          svgElement.setAttribute(key, value as string)
        })
      }

      // 处理子节点
      if (iconContent.children) {
        iconContent.children.forEach((child: any) => {
          const childElement = document.createElementNS('http://www.w3.org/2000/svg', child.tagName)
          if (child.attrs) {
            Object.entries(child.attrs).forEach(([key, value]) => {
              childElement.setAttribute(key, value as string)
            })
          }
          svgElement.appendChild(childElement)
        })
      }

      symbol.appendChild(svgElement)
    } else if (typeof iconContent === 'string') {
      // 处理路径字符串类型的图标
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      path.setAttribute('d', iconContent)
      symbol.appendChild(path)
    }
    
    svgSprite.appendChild(symbol)
  })
  
  document.body.appendChild(svgSprite)
}