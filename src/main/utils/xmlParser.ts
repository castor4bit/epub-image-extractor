import { XMLParser, XMLValidator } from 'fast-xml-parser';

/**
 * xml2js互換のXMLパーサー
 * fast-xml-parserをxml2jsと同じインターフェースで使用できるようにラップ
 */

// fast-xml-parserの設定（xml2js互換）
const createParser = () => {
  return new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
    attributesGroupName: '$',
    textNodeName: '#text',
    parseAttributeValue: false,
    trimValues: true,
    parseTagValue: false,
    ignoreDeclaration: true,
    ignorePiTags: true,
    processEntities: true,
    htmlEntities: false,
    allowBooleanAttributes: false,
    stopNodes: [],
    // 特定の要素を常に配列として扱う（xml2jsとの互換性のため）
    isArray: (name: string, jpath: string, _isLeafNode: boolean, _isAttribute: boolean) => {
      // container.xml
      if (jpath === 'container.rootfiles' && name === 'rootfiles') return true;
      if (jpath === 'container.rootfiles.rootfile' && name === 'rootfile') return true;
      
      // OPF
      if (jpath === 'package.manifest' && name === 'manifest') return true;
      if (jpath === 'package.manifest.item' && name === 'item') return true;
      if (jpath === 'package.spine' && name === 'spine') return true;
      if (jpath === 'package.spine.itemref' && name === 'itemref') return true;
      
      // NCX
      if (jpath === 'ncx.navMap' && name === 'navMap') return true;
      if (jpath.includes('navMap') && name === 'navPoint') return true;
      if (jpath.includes('navPoint') && name === 'navLabel') return true;
      if (jpath.includes('navLabel') && name === 'text') return true;
      if (jpath.includes('navPoint') && name === 'content') return true;
      
      // その他、xml2jsが配列として扱う要素
      if (name === 'p' || name === 'span' || name === 'a') return true;
      if (name === 'empty' || name === 'withAttr' || name === 'element') return true;
      
      return false;
    }
  });
};

// パーサーインスタンスをキャッシュ
let parserInstance: XMLParser | null = null;

/**
 * xml2js の parseStringPromise と同じインターフェースを提供
 * @param xml XML文字列
 * @returns パース結果のオブジェクト
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function parseStringPromise(xml: string): Promise<any> {
  // 最初にXMLの妥当性を検証
  const validationResult = XMLValidator.validate(xml);
  if (validationResult !== true) {
    // xml2jsと同じような形式でエラーを投げる
    if (typeof validationResult === 'object' && validationResult.err) {
      throw new Error(validationResult.err.msg);
    }
    throw new Error(`Non-whitespace before first tag.\nLine: 0\nColumn: 1\nChar: ${xml.charAt(0)}`);
  }
  
  if (!parserInstance) {
    parserInstance = createParser();
  }
  
  try {
    const result = parserInstance.parse(xml);
    
    // xml2jsとの互換性のための後処理
    // テキストノードの配列化（xml2jsは単一のテキストノードも配列にする）
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const postProcess = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null) {
        return obj;
      }
      
      if (Array.isArray(obj)) {
        return obj.map(postProcess);
      }
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const processed: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (key === '#text' && typeof value === 'string') {
          // xml2jsスタイルでテキストノードを配列化
          processed[key] = [value];
        } else if (key === 'text' && typeof value === 'string') {
          // NCXのtext要素も配列化
          processed[key] = [value];
        } else if (value === '' || (typeof value === 'object' && value !== null && Object.keys(value).length === 0)) {
          // 空要素の処理（xml2jsは空要素を配列[{}]として扱う）
          if (key !== '$') {
            processed[key] = [{}];
          } else {
            processed[key] = value;
          }
        } else {
          processed[key] = postProcess(value);
        }
      }
      
      return processed;
    };
    
    return postProcess(result);
  } catch (error) {
    // xml2jsと同じような形式でエラーを投げる
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Non-whitespace before first tag.\nLine: 0\nColumn: 1\nChar: ${xml.charAt(0)}`);
  }
}

/**
 * xml2jsモジュールとの互換性のためのデフォルトエクスポート
 */
export default {
  parseStringPromise
};