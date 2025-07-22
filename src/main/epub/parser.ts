// @gxl/epub-parserは使用しない（APIが異なるため）
import { ChapterInfo } from '@shared/types';
import {
  ManifestItem,
  SpineItem,
  ContainerXml,
  OpfXml,
  NcxXml,
  NavPoint,
} from '@shared/epub-types';
import { AppError, ErrorCode } from '../../shared/error-types';
import { logger } from '../utils/logger';
import path from 'path';
import { XMLParser } from 'fast-xml-parser';
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
    logger.debug({ epubPath }, 'EPUB解析開始');

    // 手動でEPUBを解析
    const zip = new AdmZip(epubPath);

    // container.xmlを読む
    const containerEntry = zip.getEntry('META-INF/container.xml');
    if (!containerEntry) {
      throw new AppError(
        ErrorCode.EPUB_INVALID_FORMAT,
        'container.xml not found',
        'EPUBファイルの形式が無効です（container.xmlが見つかりません）',
        { filePath: epubPath },
      );
    }

    const containerXml = zip.readAsText(containerEntry);
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
      textNodeName: '#text'
    });
    const containerData = parser.parse(containerXml) as ContainerXml;

    // OPFファイルのパスを取得
    const rootfiles = containerData.container.rootfiles.rootfile;
    const opfPath = Array.isArray(rootfiles) ? rootfiles[0]['full-path'] : rootfiles['full-path'];
    const contentPath = path.dirname(opfPath);

    // OPFファイルを読む
    const opfEntry = zip.getEntry(opfPath);
    if (!opfEntry) {
      throw new AppError(
        ErrorCode.EPUB_INVALID_FORMAT,
        'OPF file not found',
        'EPUBファイルの形式が無効です（OPFファイルが見つかりません）',
        { filePath: epubPath, opfPath },
      );
    }

    const opfXml = zip.readAsText(opfEntry);
    const opfData = parser.parse(opfXml) as OpfXml;

    // manifestとspineを取得
    const manifest: Record<string, ManifestItem> = {};
    const manifestItems = opfData.package.manifest.item || [];
    const itemArray = Array.isArray(manifestItems) ? manifestItems : [manifestItems];

    itemArray.forEach((item) => {
      const id = item.id;
      manifest[id] = {
        id: id,
        href: item.href,
        'media-type': item['media-type'],
        properties: item.properties,
      };
    });

    // spine情報を取得
    const spine: SpineItem[] = [];
    const spineItems = opfData.package.spine.itemref || [];
    const spineArray = Array.isArray(spineItems) ? spineItems : [spineItems];

    spineArray.forEach((item) => {
      const spineItem: SpineItem = {
        idref: item.idref,
        linear: item.linear || 'yes',
      };

      // propertiesから page-spread 情報を抽出
      const properties = item.properties || '';
      if (properties.includes('page-spread-left')) {
        spineItem.pageSpread = 'left';
      } else if (properties.includes('page-spread-right')) {
        spineItem.pageSpread = 'right';
      }

      spine.push(spineItem);
    });

    // デバッグ情報をログに記録
    logger.debug({
      hasManifest: !!manifest,
      hasSpine: !!spine,
      manifestKeys: Object.keys(manifest).length,
      spineLength: spine.length,
    }, 'パーサー実行完了');

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
    throw new AppError(
      ErrorCode.EPUB_PARSE_ERROR,
      error instanceof Error ? error.message : '不明なエラー',
      'EPUBファイルの解析に失敗しました',
      { filePath: epubPath },
      error instanceof Error ? error : undefined,
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
        logger.debug({ tocPath }, 'ナビゲーションファイル発見');

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

    logger.debug('ナビゲーション情報が見つかりません');
    return chapters;
  } catch (error) {
    logger.warn({ err: error }, 'ナビゲーション抽出エラー');
    return chapters;
  }
}

async function parseNCX(ncxContent: string): Promise<ChapterInfo[]> {
  const chapters: ChapterInfo[] = [];

  try {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
      textNodeName: '#text'
    });
    const parsed = parser.parse(ncxContent) as NcxXml;
    const navMap = parsed.ncx?.navMap;

    if (navMap?.navPoint) {
      let order = 1;
      const navPoints = Array.isArray(navMap.navPoint) ? navMap.navPoint : [navMap.navPoint];

      const processNavPoint = (navPoint: NavPoint) => {
        const navLabel = navPoint.navLabel;
        let title = '';
        if (typeof navLabel === 'string') {
          title = navLabel;
        } else if (navLabel && typeof navLabel === 'object') {
          title = navLabel.text || navLabel['#text'] || '';
        }
        const href = navPoint.content?.src;

        if (title && href) {
          chapters.push({ order: order++, title, href });
        }

        // 子navPointも処理
        if (navPoint.navPoint) {
          const childPoints = Array.isArray(navPoint.navPoint) ? navPoint.navPoint : [navPoint.navPoint];
          childPoints.forEach(processNavPoint);
        }
      };

      navPoints.forEach(processNavPoint);
    }
  } catch (error) {
    logger.warn({ err: error }, 'NCX解析エラー');
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
      logger.warn('Navigation Documentにtocが見つかりません');
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

    logger.debug({ chapterCount: chapters.length }, 'Navigation Documentから章を抽出');
  } catch (error) {
    logger.warn({ err: error }, 'Navigation Document解析エラー');
  }

  return chapters;
}
