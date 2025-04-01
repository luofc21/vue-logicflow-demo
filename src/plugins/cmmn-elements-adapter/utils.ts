/* eslint-disable guard-for-in */
/* eslint-disable no-continue */

// 复用XML和JSON转换相关功能

/**
 * 获取对象类型
 */
function type(obj: any) {
    return Object.prototype.toString.call(obj);
}

/**
 * 根据深度添加空格，用于XML格式化
 */
function addSpace(depth: number) {
    return '  '.repeat(depth);
}

/**
 * 处理属性值
 */
function getAttributes(obj: any) {
    if (obj === null || obj === undefined) return '';
    let tmp = obj;
    try {
        if (typeof tmp !== 'string') {
            // 使用 JSON.stringify 将对象转换为字符串
            tmp = JSON.stringify(tmp);
            // 替换双引号为单引号，避免XML解析错误
            tmp = tmp.replace(/"/g, "'");
        }
    } catch (error) {
        tmp = String(obj);
    }
    return tmp;
}

const tn = '\t\n';

/**
 * JSON对象转换为XML字符串
 */
export function toXml(obj: any, name: string, depth: number) {
    if (obj === null || obj === undefined) return '';
    
    const frontSpace = addSpace(depth);
    let str = '';
    const prefix = tn + frontSpace;
    
    // 如果是空字符串且是顶层元素，直接返回内容
    if (name === '') {
        // 处理顶层对象，直接返回第一个子元素的内容
        if (type(obj) === '[object Object]') {
            const keys = Object.keys(obj);
            // 只输出第一个元素
            if (keys.length > 0) {
                return toXml(obj[keys[0]], keys[0], depth);
            }
        }
        return '';
    }
    
    if (name === '-json') return '';
    if (name === '#text') {
        return prefix + obj;
    } if (name === '#cdata-section') {
        return `${prefix}<![CDATA[${obj}]]>`;
    } if (name === '#comment') {
        return `${prefix}<!--${obj}-->`;
    }
    if (`${name}`.charAt(0) === '-') {
        return ` ${name.substring(1)}="${getAttributes(obj)}"`;
    }
    if (Array.isArray(obj)) {
        str += obj.map((item) => toXml(item, name, depth + 1)).join('');
    } else if (type(obj) === '[object Object]') {
        const keys = Object.keys(obj);
        let attributes = '';
        let children = '';

        // 处理属性
        keys.forEach((k) => {
            if (k.charAt(0) === '-') {
                attributes += toXml(obj[k], k, depth + 1);
            }
        });

        // 处理子元素，确保保留结构
        keys.forEach((k) => {
            if (k.charAt(0) !== '-') {
                children += toXml(obj[k], k, depth + 1);
            }
        });

        // 如果是根节点，不添加缩进
        str += `${depth === 0 ? '' : prefix}<${name}`;
        str += attributes;
        str += children !== '' ? `>${children}${prefix}</${name}>` : ' />';
    } else {
        str += `${prefix}<${name}>${String(obj)}</${name}>`;
    }

    return str;
}

// import LogicFlow from '@logicflow/core'

/**
 * 将 LogicFlow 数据 JSON 转换为 XML 字符串
 */
export function lfJson2Xml(json: any): string {
    if (!json) return '';
    
    // 确保使用 cmmn:definitions 作为根节点
    if (json['cmmn:definitions']) {
        return `<?xml version="1.0" encoding="UTF-8"?>\n${toXml(json['cmmn:definitions'], 'cmmn:definitions', 0)}`;
    }
    
    // 如果不存在 cmmn:definitions，直接使用第一层的 JSON
    return `<?xml version="1.0" encoding="UTF-8"?>\n${toXml(json, '', 0)}`;
}

/**
 * XML ObjTree 类，用于解析XML
 */
class ObjTree {
    xmlDecl = '<?xml version="1.0" encoding="UTF-8" ?>\n';
    attr_prefix = '-';
    force_array: string[] = [];
    __force_array: Record<string, number> = {};

    /**
     * 解析XML字符串为JSON对象
     */
    parseXML(xml: string) {
        if (!xml) return null;

        const parser = new DOMParser();
        const dom = parser.parseFromString(xml, 'application/xml');
        if (!dom) return null;

        const root = dom.documentElement;
        if (!root) return null;

        return this.parseDOM(root);
    }

    /**
     * 解析DOM节点为JSON对象
     */
    parseDOM(root: Element) {
        if (!root) return null;

        this.__force_array = {};
        if (this.force_array) {
            for (let i = 0; i < this.force_array.length; i++) {
                this.__force_array[this.force_array[i]] = 1;
            }
        }

        let json = this.parseElement(root);
        if (this.__force_array[root.nodeName]) {
            json = [json];
        }
        if (root.nodeType !== 11) { // DOCUMENT_FRAGMENT_NODE
            const tmp: Record<string, any> = {};
            tmp[root.nodeName] = json;
            json = tmp;
        }

        return json;
    }

    /**
     * 解析单个Element节点
     */
    parseElement(elem: Element | ChildNode) {
        // 处理处理指令节点
        if (elem.nodeType === 7) {
            return;
        }

        // 处理文本节点、CDATA节点和注释节点
        if (elem.nodeType === 3 || elem.nodeType === 4 || elem.nodeType === 8) {
            // 忽略空白文本
            const nodeValue = (elem as Text).nodeValue || '';
            const bool = nodeValue.match(/[^\x00-\x20]/);
            if (bool == null) return;
            return nodeValue;
        }

        let retVal: Record<string, any> | string | null = null;
        const cnt: Record<string, number> = {};

        // 处理元素属性
        if ((elem as Element).attributes && (elem as Element).attributes.length) {
            retVal = {} as Record<string, any>;
            for (let i = 0; i < (elem as Element).attributes.length; i++) {
                const attr = (elem as Element).attributes[i];
                let key = attr.nodeName;
                if (typeof key !== 'string') continue;

                let val = attr.nodeValue;
                if (val === null || val === undefined) continue;

                key = this.attr_prefix + key;
                if (typeof cnt[key] === 'undefined') cnt[key] = 0;
                cnt[key]++;

                this.addNode(retVal as Record<string, any>, key, cnt[key], val);
            }
        }

        // 处理子节点
        if (elem.childNodes && elem.childNodes.length) {
            let textOnly = true;
            if (retVal) textOnly = false; // 有属性，不是纯文本

            // 检查是否只有文本节点
            for (let i = 0; i < elem.childNodes.length && textOnly; i++) {
                const nType = elem.childNodes[i].nodeType;
                if (nType === 3 || nType === 4 || nType === 8) continue;
                textOnly = false;
            }

            if (textOnly) {
                // 只有文本节点，合并所有文本
                if (!retVal) retVal = '';
                for (let i = 0; i < elem.childNodes.length; i++) {
                    retVal += (elem.childNodes[i] as Text).nodeValue || '';
                }
            } else {
                // 解析所有子节点
                if (!retVal) retVal = {} as Record<string, any>;
                for (let i = 0; i < elem.childNodes.length; i++) {
                    const child = elem.childNodes[i];
                    const key = child.nodeName;
                    if (typeof key !== 'string') continue;

                    const val = this.parseElement(child);
                    if (!val) continue;

                    if (typeof cnt[key] === 'undefined') cnt[key] = 0;
                    cnt[key]++;

                    this.addNode(retVal as Record<string, any>, key, cnt[key], val);
                }
            }
        } else if (retVal === null) {
            // 空节点，返回空对象
            retVal = {} as Record<string, any>;
        }

        return retVal;
    }

    /**
     * 添加节点到结果对象
     */
    addNode(hash: Record<string, any>, key: string, count: number, val: any) {
        if (this.__force_array[key]) {
            if (count === 1) hash[key] = [];
            hash[key][hash[key].length] = val;
        } else if (count === 1) {
            hash[key] = val;
        } else if (count === 2) {
            hash[key] = [hash[key], val];
        } else {
            hash[key][hash[key].length] = val;
        }
    }
}

/**
 * 将 XML 字符串转换为 LogicFlow 数据 JSON
 */
export function lfXml2Json(xml: string): any {
    if (!xml) return null;
    const xotree = new ObjTree();
    return xotree.parseXML(xml);
} 