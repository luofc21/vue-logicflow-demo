export default class BpmnExporter {
    static pluginName = "bpmnExporter";
    
    // 生成Flowable兼容的BPMN XML
    exportBpmnXml(data: any) {
      const { nodes, edges } = data;
      
      // 构建XML骨架
      let xml = `<?xml version="1.0" encoding="UTF-8"?>
  <definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL"
               xmlns:flowable="http://flowable.org/bpmn"
               targetNamespace="http://flowable.org/bpmn">
    <process id="${data.processId}" name="${data.processName}" isExecutable="true">`;
  
      // 转换节点
      nodes.forEach(node => {
        switch(node.type) {
          case 'UserTask':
            xml += `
      <userTask id="${node.id}" name="${node.text}" 
                flowable:assignee="${node.properties.assignee}"
                flowable:candidateGroups="${node.properties.candidateGroups}"/>`;
            break;
          case 'ExclusiveGateway':
            xml += `
      <exclusiveGateway id="${node.id}" name="${node.text}"/>`;
            break;
          // 处理其他节点类型...
        }
      });
  
      // 转换边（顺序流及条件）
      edges.forEach(edge => {
        xml += `
      <sequenceFlow id="${edge.id}" sourceRef="${edge.sourceNodeId}" 
                    targetRef="${edge.targetNodeId}">`;
        if(edge.properties?.condition) {
          xml += `
        <conditionExpression xsi:type="tFormalExpression">
          ${edge.properties.condition}
        </conditionExpression>`;
        }
        xml += `
      </sequenceFlow>`;
      });
  
      xml += `
    </process>
  </definitions>`;
      return xml;
    }
  }
  
  // 注册插件
//   LogicFlow.use(BpmnExporter);