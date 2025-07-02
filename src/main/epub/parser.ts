import EpubParser from '@gxl/epub-parser';
import { ChapterInfo } from '@shared/types';
import path from 'path';
import { parseStringPromise } from 'xml2js';

export interface EpubData {
  manifest: any;
  spine: any[];
  navigation: ChapterInfo[];
  basePath: string;
  contentPath: string;
}

export async function parseEpub(epubPath: string): Promise<EpubData> {
  try {
    // EPUBパーサーインスタンスを作成
    const parser = new EpubParser(epubPath);
    
    // EPUB情報を取得
    const epubInfo = await parser.parse();
    
    // ナビゲーション情報を取得（目次）
    const navigation = await extractNavigation(parser, epubInfo);
    
    // 基本パスを取得
    const basePath = path.dirname(epubPath);
    const contentPath = epubInfo.contentPath || '';

    return {
      manifest: epubInfo.manifest || {},
      spine: epubInfo.spine || [],
      navigation,
      basePath,
      contentPath,
    };
  } catch (error) {
    console.error('EPUB解析エラー:', error);
    throw new Error(`EPUBファイルの解析に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
  }
}

async function extractNavigation(parser: any, epubInfo: any): Promise<ChapterInfo[]> {
  const chapters: ChapterInfo[] = [];
  
  try {
    // navigationプロパティが存在する場合
    if (epubInfo.navigation) {
      return parseNavigationData(epubInfo.navigation);
    }

    // navigationプロパティがない場合の回避策
    // NCXファイルまたはNav Documentから直接取得を試みる
    const tocItem = Object.values(epubInfo.manifest || {}).find(
      (item: any) => item.properties?.includes('nav') || item.id === 'ncx'
    ) as any;

    if (tocItem) {
      const tocContent = await parser.getFile(tocItem.href);
      const tocString = tocContent.toString('utf-8');
      
      if (tocItem.mediaType === 'application/x-dtbncx+xml') {
        // NCX形式の目次
        return await parseNCX(tocString);
      } else {
        // HTML形式のナビゲーション
        return parseHTMLNavigation(tocString);
      }
    }

    // 目次が見つからない場合は、spineの順序で章を作成
    return epubInfo.spine.map((item: any, index: number) => ({
      order: index + 1,
      title: `ページ ${index + 1}`,
      href: item.href || '',
    }));
  } catch (error) {
    console.warn('ナビゲーション抽出エラー:', error);
    // エラーの場合も空配列を返す
    return chapters;
  }
}

function parseNavigationData(navigation: any): ChapterInfo[] {
  const chapters: ChapterInfo[] = [];
  let order = 1;

  function processNavPoint(navPoint: any) {
    if (navPoint.title) {
      chapters.push({
        order: order++,
        title: navPoint.title,
        href: navPoint.href || '',
      });
    }
    
    // 子要素も処理
    if (navPoint.children && Array.isArray(navPoint.children)) {
      navPoint.children.forEach(processNavPoint);
    }
  }

  if (Array.isArray(navigation)) {
    navigation.forEach(processNavPoint);
  } else if (navigation.navMap) {
    navigation.navMap.forEach(processNavPoint);
  }

  return chapters;
}

async function parseNCX(ncxContent: string): Promise<ChapterInfo[]> {
  const chapters: ChapterInfo[] = [];
  
  try {
    const parsed = await parseStringPromise(ncxContent);
    const navMap = parsed.ncx?.navMap?.[0];
    
    if (navMap?.navPoint) {
      let order = 1;
      
      const processNavPoint = (navPoint: any) => {
        const title = navPoint.navLabel?.[0]?.text?.[0];
        const href = navPoint.content?.[0]?.$?.src;
        
        if (title && href) {
          chapters.push({ order: order++, title, href });
        }
        
        // 子navPointも処理
        if (navPoint.navPoint) {
          navPoint.navPoint.forEach(processNavPoint);
        }
      };
      
      navMap.navPoint.forEach(processNavPoint);
    }
  } catch (error) {
    console.warn('NCX解析エラー:', error);
  }
  
  return chapters;
}

function parseHTMLNavigation(htmlContent: string): ChapterInfo[] {
  const chapters: ChapterInfo[] = [];
  let order = 1;
  
  // 簡易的なHTML解析（nav要素内のリンクを抽出）
  const navMatch = htmlContent.match(/<nav[^>]*>([\s\S]*?)<\/nav>/i);
  if (navMatch) {
    const navContent = navMatch[1];
    const linkRegex = /<a[^>]+href="([^"]+)"[^>]*>(.*?)<\/a>/gi;
    let match;
    
    while ((match = linkRegex.exec(navContent)) !== null) {
      const href = match[1];
      const title = match[2].replace(/<[^>]+>/g, '').trim();
      
      if (title && href) {
        chapters.push({ order: order++, title, href });
      }
    }
  }
  
  return chapters;
}