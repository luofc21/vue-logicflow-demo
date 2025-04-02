/* eslint-disable @typescript-eslint/naming-convention */
import {
  GraphModel,
  RectNode,
  RectNodeModel,
  h,
} from '@logicflow/core';
// import { parallelMarker, sequentialMarker, loopMarker } from '../icons';
import { genBpmnId, groupRule } from '../../../utils';

// // 使用any替代NodeConfig类型
// type NodeConfig = any;

// export const multiInstanceIcon: any = {
//   parallel: parallelMarker,
//   sequential: sequentialMarker,
//   loop: loopMarker,
// };

type TaskType = {
  multiInstanceType: string;
  [key: string]: any;
};

/**
 * @param type 任务节点的type, 对应其XML定义中的节点名，如<bpmn:userTask /> 其type为bpmn:userTask
 * @param icon 任务节点左上角的图标，可以是svg path，也可以是h函数生成的svg
 * @param props (可选) 任务节点的属性
 * @returns { type: string, model: any, view: any }
 */
export function TaskNodeFactory(type: string, icon: string | any[], props?: any): {
  type: string,
  model: any,
  view: any,
} {
  class view extends RectNode {
    // 获取图标
    getLabelShape() {
      try {
        // @ts-ignore
        const { model } = this.props;
        const { x, y, width, height } = model;
        const style = model.getNodeStyle();
        const i = Array.isArray(icon)
          ? h(
            'g',
            {
              transform: `matrix(1 0 0 1 ${x - width / 2} ${y - height / 2})`,
            },
            ...icon,
          )
          : h('path', {
            fill: style.stroke,
            d: icon,
          });
        return h(
          'svg',
          {
            x: x - width / 2 + 5,
            y: y - height / 2 + 5,
            width: 25,
            height: 25,
            viewBox: '0 0 1274 1024',
          },
          i,
        );
      } catch (error) {
        console.error('Error in getLabelShape:', error);
        return null;
      }
    }

    // 获取编辑按钮
    getEditButton() {
      try {
        // @ts-ignore
        const { model } = this.props;
        const { x, y, width, height } = model;
        
        return h('g', {
          // 将按钮移到右上角，并增加偏移量，避免与文本重叠
          transform: `translate(${x + width / 2 - 12}, ${y - height / 2 + 12})`,
          cursor: 'pointer',
          onClick: () => model.handleEdit()
        }, [
          h('circle', {
            r: 8,
            fill: '#fff',
            stroke: '#666',
            strokeWidth: 1
          }),
          h('g', {}, [
            h('circle', { cx: -4, cy: 0, r: 1.5, fill: '#666' }),
            h('circle', { cx: 0, cy: 0, r: 1.5, fill: '#666' }),
            h('circle', { cx: 4, cy: 0, r: 1.5, fill: '#666' })
          ])
        ]);
      } catch (error) {
        console.error('Error in getEditButton:', error);
        return null;
      }
    }
    
    // 使用getShape方法替代render，保持LogicFlow的拖拽机制
    getShape() {
      try {
        // @ts-ignore
        const { model } = this.props;
        const { x, y, width, height, radius, text, properties } = model;
        const style = model.getNodeStyle();
        // console.log('text', text, properties);
        
        // 文本处理，先获取文本信息
        let textContent = '';
        if (text && text.value) {
          textContent = text.value;
        } else if (properties && properties.name) {
          // 兼容从properties中获取名称
          textContent = properties.name as string;
        }
        
        // 创建基础矩形
        const nodeShape = h('rect', {
          ...style,
          x: x - width / 2,
          y: y - height / 2,
          rx: radius,
          ry: radius,
          width,
          height
        });
        
        // 创建元素集合
        const elements = [nodeShape];
        
        // 处理文本，支持自动换行
        if (textContent) {
          const textStyle = model.getTextStyle();
          const fontSize = textStyle.fontSize || 12;
          
          // 每行最大字符数估计 (考虑中文和英文的宽度差异)
          const charWidth = fontSize * 0.6;  // 英文字符的估计宽度
          const maxWidth = width - 20; // 留出左右边距
          const maxCharsPerLine = Math.floor(maxWidth / charWidth);
          
          // 计算换行
          const lines = [];
          let currentLine = '';
          let currentLineWidth = 0;
          
          // 更智能的换行算法，考虑中英文混合情况
          for (let i = 0; i < textContent.length; i++) {
            const char = textContent[i];
            // 估计字符宽度 (中文字符宽度约为英文的1.7倍)
            const charW = /[\u4e00-\u9fa5]/.test(char) ? charWidth * 1.7 : charWidth;
            
            if (char === '\n') {
              // 遇到换行符直接换行
              lines.push(currentLine);
              currentLine = '';
              currentLineWidth = 0;
            } else if (currentLineWidth + charW > maxWidth) {
              // 当前行宽度超过最大宽度时换行
              lines.push(currentLine);
              currentLine = char;
              currentLineWidth = charW;
            } else {
              // 正常添加字符
              currentLine += char;
              currentLineWidth += charW;
            }
          }
          
          // 添加最后一行
          if (currentLine) {
            lines.push(currentLine);
          }
          
          // 计算文本区域高度和起始位置，垂直居中
          const lineHeight = fontSize * 1.2;
          const textTotalHeight = lines.length * lineHeight;
          
          // 改进垂直居中计算，考虑了编辑按钮的位置，使文本更好地居中
          // 增加了额外的垂直偏移以避免顶部拥挤
          const verticalOffset = 5; // 额外向下偏移，避免与编辑按钮重叠
          const textStartY = y - textTotalHeight / 2 + lineHeight / 2 + verticalOffset;
          
          // 创建文本元素
          const textGroup = h('g', {}, 
            lines.map((line, index) => {
              return h('text', {
                x,
                y: textStartY + index * lineHeight,
                fontSize: fontSize,
                fill: textStyle.fill || '#000',
                textAnchor: 'middle',
              }, line);
            })
          );
          
          elements.push(textGroup);
        }
        
        // 添加图标
        const iconShape = this.getLabelShape();
        if (iconShape) {
          elements.push(iconShape);
        }
        
        // 添加编辑按钮
        const editButton = this.getEditButton();
        if (editButton) {
          elements.push(editButton);
        }
        
        return h('g', {}, elements);
      } catch (error) {
        console.error('Error in getShape:', error);
        return h('g', {});
      }
    }
  }

  class model extends RectNodeModel {
    constructor(data: any, graphModel: GraphModel) {
      if (!data.id) {
        data.id = `Activity_${genBpmnId()}`;
      }
      const properties: TaskType = {
        ...(props || {}),
        ...data.properties,
        // multiInstanceType: '',
        // panels: ['multiInstance'],
      };
      
      // // 如果properties中有name，将其保存起来，同时把text设为空，防止重复渲染
      // console.log('properties', properties.name);
      // if (properties.name) {
      //   // 确保data.text存在且是对象类型
      //   if (!data.text) {
      //     data.text = { value: '' };
      //   } else if (typeof data.text === 'string') {
      //     // 处理data.text是字符串的情况
      //     data.text = { value: data.text };
      //     data.text.value = '';
      //   } else {
      //     // 正常情况，data.text是对象
      //     data.text.value = '';
      //   }
      // }
      
      data.properties = properties;
      // console.log('data.properties', data, data.properties);
      // 调用父类构造函数
      super(data, graphModel);

      // 在 super() 之后再进行其他初始化操作
      // this.width = 150;
      // this.height = 120;
      this.isTaskNode = true;
      this.boundaryEvents = [];

      if (properties?.boundaryEvents?.length) {
        properties.boundaryEvents.forEach((id: string) => {
          this.addBoundaryEvent(id);
        });
        this.deleteProperty('boundaryEvents');
      }

      groupRule.call(this);
    }
    
    // 重写updateText方法，确保文本更新时能够触发重新渲染
    updateText(text: string) {
      // 将文本保存到properties中
      this.setProperty('name', text);
      // 保持text.value为空，防止重复渲染
      super.updateText('');
      // 触发重新渲染
      this.setProperty('needRerender', Date.now());
      return this;
    }
    
    getNodeStyle() {
      const style = super.getNodeStyle();
      // isBoundaryEventTouchingTask属性用于标识拖动边界节点是否靠近此节点
      // 如果靠近，则高亮提示
      // style.fill = 'rgb(255, 230, 204)';
      const { isBoundaryEventTouchingTask } = this.properties;
      if (isBoundaryEventTouchingTask) {
        style.stroke = '#00acff';
        style.strokeWidth = 2;
      }
      return style;
    }
    getOutlineStyle() {
      const style = super.getOutlineStyle();
      style.stroke = 'transparent';
      !style.hover && (style.hover = {});
      style.hover.stroke = 'transparent';
      return style;
    }
    /**
       * 提供方法给插件在判断此节点被拖动边界事件节点靠近时调用，从而触发高亮
       */
    setTouching(flag: boolean) {
      this.setProperty('isBoundaryEventTouchingTask', flag);
    }
    /**
       * 附加后记录被附加的边界事件节点Id
       */
    addBoundaryEvent(nodeId: string) {
      this.setTouching(false);
      if (this.boundaryEvents.find((item: string) => item === nodeId)) {
        return false;
      }
      const boundaryEvent = this.graphModel.getNodeModelById(nodeId);
      boundaryEvent?.setProperties({
        attachedToRef: this.id,
      });
      this.boundaryEvents.push(nodeId);
      return true;
    }
    /**
       * 被附加的边界事件节点被删除时，移除记录
       */
    deleteBoundaryEvent(nodeId: string) {
      this.boundaryEvents = this.boundaryEvents.filter(
        (item: string) => item !== nodeId,
      );
    }
    // 触发编辑事件
    handleEdit() {
      // 触发自定义事件
      console.log('edit data===>', this.getData());
      this.graphModel.eventCenter.emit('task:edit', { nodeId: this.id, nodeData: this.getData() }); // 父组件的getData方法
    }
  }

  // @ts-ignore
  return {
    type,
    view,
    model,
  };
}
