// @gxl/epub-parserは使用しない（APIが異なるため）
import { ChapterInfo } from '@shared/types';
import { ManifestItem, SpineItem, ContainerXml, OpfXml, NcxXml, NavPoint } from '@shared/epub-types';
import path from 'path';
import { parseStringPromise } from 'xml2js';
import AdmZip from 'adm-zip';

export interface EpubData {
  manifest: Record<string, ManifestItem>;
  spine: SpineItem[];
  navigation: ChapterInfo[];
  basePath: string;
  contentPath: string;
  parser?: AdmZip; // パーサーインスタンスを保持
}

export async function parseEpub(epubPath: string): Promise<EpubData> {
  try {
    console.log('EPUB解析開始:', epubPath);

    // 手動でEPUBを解析
    const zip = new AdmZip(epubPath);

    // container.xmlを読む
    const containerEntry = zip.getEntry('META-INF/container.xml');
    if (!containerEntry) {
      throw new Error('container.xml not found');
    }

    const containerXml = zip.readAsText(containerEntry);
    const containerData = await parseStringPromise(containerXml) as ContainerXml;

    // OPFファイルのパスを取得
    const rootfiles = containerData.container.rootfiles[0].rootfile;
    const opfPath = rootfiles[0].$['full-path'];
    const contentPath = path.dirname(opfPath);

    // OPFファイルを読む
    const opfEntry = zip.getEntry(opfPath);
    if (!opfEntry) {
      throw new Error('OPF file not found');
    }

    const opfXml = zip.readAsText(opfEntry);
    const opfData = await parseStringPromise(opfXml) as OpfXml;

    // manifestとspineを取得
    const manifest: Record<string, ManifestItem> = {};
    const manifestItems = opfData.package.manifest[0].item || [];

    manifestItems.forEach((item) => {
      const id = item.$.id;
      manifest[id] = {
        id: id,
        href: item.$.href,
        'media-type': item.$['media-type'],
        properties: item.$.properties,
      };
    });

    // spine情報を取得
    const spine: SpineItem[] = [];
    const spineItems = opfData.package.spine[0].itemref || [];

    spineItems.forEach((item) => {
      const spineItem: SpineItem = {
        idref: item.$.idref,
        linear: item.$.linear || 'yes',
      };
      
      // propertiesから page-spread 情報を抽出
      const properties = item.$.properties || '';
      if (properties.includes('page-spread-left')) {
        spineItem.pageSpread = 'left';
      } else if (properties.includes('page-spread-right')) {
        spineItem.pageSpread = 'right';
      }
      
      spine.push(spineItem);
    });

    console.log('パーサー実行完了。取得した情報:', {
      hasManifest: !!manifest,
      hasSpine: !!spine,
      manifestKeys: Object.keys(manifest).length,
      spineLength: spine.length,
    });

    // ナビゲーション情報を取得（目次）
    const navigation = await extractNavigationFromZip(zip, opfPath, manifest);

    return {
      manifest,
      spine,
      navigation,
      basePath: epubPath,
      contentPath,
      parser: zip, // zipインスタンスを保持
    };
  } catch (error) {
    console.error('EPUB解析エラー詳細:', {
      error,
      message: error instanceof Error ? error.message : '不明なエラー',
      stack: error instanceof Error ? error.stack : undefined,
      epubPath,
    });
    throw new Error(
      `EPUBファイルの解析に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`,
    );
  }
}

async function extractNavigationFromZip(
  zip: AdmZip,
  opfPath: string,
  manifest: Record<string, ManifestItem>,
): Promise<ChapterInfo[]> {
  const chapters: ChapterInfo[] = [];

  try {
    // EPUB3のNavigation Documentを探す（properties="nav"）
    let tocItem = Object.values(manifest).find(
      (item) => item.properties && item.properties.includes('nav'),
    );

    // EPUB3のnavigation documentが見つからない場合は、EPUB2のNCXを探す
    if (!tocItem) {
      tocItem = Object.values(manifest).find(
        (item) =>
          item['media-type'] === 'application/x-dtbncx+xml' ||
          item.id === 'ncx' ||
          item.id === 'toc',
      );
    }

    if (tocItem) {
      const contentPath = path.dirname(opfPath);
      const tocPath = path.join(contentPath, tocItem.href).replace(/\\/g, '/');
      const tocEntry = zip.getEntry(tocPath);

      if (tocEntry) {
        const tocContent = zip.readAsText(tocEntry);
        console.log(`ナビゲーションファイル発見: ${tocPath}`);

        if (tocItem['media-type'] === 'application/x-dtbncx+xml') {
          // NCX形式の目次
          return await parseNCX(tocContent);
        } else if (tocItem.properties && tocItem.properties.includes('nav')) {
          // EPUB3 Navigation Document
          return await parseNavigationDocument(tocContent);
        } else if (tocContent.includes('epub:type="toc"')) {
          // EPUB3 Navigation Document（propertiesがない場合）
          return await parseNavigationDocument(tocContent);
        }
      }
    }

    console.log('ナビゲーション情報が見つかりません');
    return chapters;
  } catch (error) {
    console.warn('ナビゲーション抽出エラー:', error);
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
    const parsed = await parseStringPromise(ncxContent) as NcxXml;
    const navMap = parsed.ncx?.navMap?.[0];

    if (navMap?.navPoint) {
      let order = 1;

      const processNavPoint = (navPoint: NavPoint) => {
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

async function parseNavigationDocument(htmlContent: string): Promise<ChapterInfo[]> {
  const chapters: ChapterInfo[] = [];
  let order = 1;

  try {
    // nav要素のtocを探す
    const navMatch = htmlContent.match(/<nav[^>]*epub:type=["']toc["'][^>]*>([\s\S]*?)<\/nav>/i);
    if (!navMatch) {
      console.warn('Navigation Documentにtocが見つかりません');
      return chapters;
    }

    const navContent = navMatch[1];

    // ol/li要素からリンクを抽出
    const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
    let liMatch;

    while ((liMatch = liRegex.exec(navContent)) !== null) {
      const liContent = liMatch[1];

      // a要素を探す
      const aMatch = liContent.match(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i);
      if (aMatch) {
        const href = aMatch[1];
        const titleHtml = aMatch[2];

        // HTMLタグを除去してテキストを取得
        const title = titleHtml.replace(/<[^>]*>/g, '').trim();

        if (title && href) {
          chapters.push({
            order: order++,
            title,
            href,
          });
        }
      }
    }

    console.log(`Navigation Documentから${chapters.length}個の章を抽出しました`);
  } catch (error) {
    console.warn('Navigation Document解析エラー:', error);
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
