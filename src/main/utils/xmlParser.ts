import { XMLParser } from 'fast-xml-parser';

/**
 * xml2js互換のラッパー
 * fast-xml-parserを使用してxml2jsと同じインターフェースを提供
 */
export async function parseStringPromise(xmlString: string): Promise<any> {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    textNodeName: '#text',
    cdataPropName: '__cdata',
    isArray: (_name, _jpath, isLeafNode, isAttribute) => {
      // 属性は配列にしない
      if (isAttribute) return false;
      // リーフノードでない場合は配列として扱う可能性がある
      return !isLeafNode;
    },
  });

  const parsed = parser.parse(xmlString);
  
  // xml2js形式に変換
  return convertToXml2jsFormat(parsed);
}

/**
 * fast-xml-parserの出力をxml2js形式に変換
 */
function convertToXml2jsFormat(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => convertToXml2jsFormat(item));
  }

  const result: any = {};
  
  for (const key in obj) {
    if (key.startsWith('@_')) {
      // 属性を $ オブジェクトに移動
      if (!result.$) result.$ = {};
      result.$[key.substring(2)] = obj[key];
    } else if (key === '#text') {
      // テキストノード
      if (Object.keys(obj).length === 1) {
        // テキストのみの場合は文字列を返す
        return obj[key];
      } else {
        // 混在コンテンツの場合は _ に格納
        result._ = obj[key];
      }
    } else {
      // 通常の要素
      const value = obj[key];
      
      if (Array.isArray(value)) {
        result[key] = value.map(v => convertToXml2jsFormat(v));
      } else if (typeof value === 'object' && value !== null) {
        // オブジェクトを配列でラップ（xml2js互換性のため）
        const converted = convertToXml2jsFormat(value);
        // 文字列に変換された場合は配列にラップ
        if (typeof converted === 'string') {
          result[key] = [converted];
        } else {
          result[key] = [converted];
        }
      } else {
        // プリミティブ値は配列でラップ
        result[key] = [value];
      }
    }
  }
  
  return result;
}