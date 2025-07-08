import { ImageInfo } from '@shared/types';
import { EpubData } from './parser';
import { AppError, ErrorCode } from '../../shared/error-types';
import { getLogger } from '../utils/errorHandler';
import path from 'path';
import AdmZip from 'adm-zip';
import { resolveSecurePath, checkResourceLimits, RESOURCE_LIMITS } from '../utils/pathSecurity';

export async function extractImages(
  epubData: EpubData,
  onProgress?: (processed: number, total: number) => void,
): Promise<ImageInfo[]> {
  const images: ImageInfo[] = [];
  const zip = (epubData.parser as AdmZip) || new AdmZip(epubData.basePath);
  let totalImageCount = 0;

  try {
    getLogger().debug('画像抽出開始', {
      spineLength: epubData.spine.length,
      manifestSize: Object.keys(epubData.manifest).length,
      hasParser: !!epubData.parser,
    });

    // チャプターとページのマッピングを作成
    const chapterPageMapping = createChapterPageMapping(epubData);

    // spine内の各ページを処理
    let processedCount = 0;
    const totalPages = epubData.spine.length;

    for (let pageIndex = 0; pageIndex < epubData.spine.length; pageIndex++) {
      const spineItem = epubData.spine[pageIndex];
      getLogger().debug(`ページ ${pageIndex + 1}/${totalPages} 処理中`, spineItem);

      const manifestItem = epubData.manifest[spineItem.idref];

      if (!manifestItem) {
        getLogger().warn(`Manifest item not found for spine idref: ${spineItem.idref}`);
        continue;
      }

      // このページが属するチャプターを取得
      const chapterOrder = chapterPageMapping.get(pageIndex) || 1;

      // HTMLコンテンツを取得
      const contentPath = path.join(epubData.contentPath, manifestItem.href).replace(/\\/g, '/');
      getLogger().debug(`コンテンツ取得: ${contentPath}`);

      try {
        const contentEntry = zip.getEntry(contentPath);
        if (!contentEntry) {
          getLogger().warn(`エントリーが見つかりません: ${contentPath}`);
          continue;
        }

        const contentString = zip.readAsText(contentEntry);
        getLogger().debug(`コンテンツサイズ: ${contentString.length} 文字`);

        // HTMLを解析して画像を抽出
        const pageImages = await extractImagesFromHTML(
          contentString,
          contentPath,
          chapterOrder,
          epubData.contentPath,
          spineItem.pageSpread, // page-spread情報を渡す
        );

        // リソース制限チェック
        totalImageCount += pageImages.length;
        const limitCheck = checkResourceLimits(
          totalImageCount,
          0, // 個別の画像サイズは後でチェック
          process.memoryUsage().heapUsed,
        );

        if (!limitCheck.allowed) {
          getLogger().warn(`リソース制限: ${limitCheck.reason}`);
          // 制限に達した場合は警告を出して処理を継続（これまでの画像は保持）
          break;
        }

        images.push(...pageImages);

        // 進捗を通知
        processedCount++;
        if (onProgress) {
          onProgress(processedCount, totalPages);
        }
      } catch (contentError) {
        getLogger().error(`コンテンツ取得エラー (${contentPath})`, contentError instanceof Error ? contentError : new Error(String(contentError)));
        continue;
      }
    }

    // 画像をページ順でソート
    images.sort((a, b) => {
      if (a.chapterOrder !== b.chapterOrder) {
        return a.chapterOrder - b.chapterOrder;
      }
      return a.pageOrder - b.pageOrder;
    });

    return images;
  } catch (error) {
    const appError = error instanceof AppError ? error : new AppError(
      ErrorCode.UNKNOWN_ERROR,
      error instanceof Error ? error.message : '不明なエラー',
      '画像の抽出に失敗しました',
      {
        filePath: epubData.basePath,
        totalImages: images.length,
        operation: 'extractImages'
      },
      error instanceof Error ? error : undefined
    );
    
    getLogger().error('画像抽出エラー', appError);
    throw appError;
  }
}

async function extractImagesFromHTML(
  htmlContent: string,
  htmlPath: string,
  chapterOrder: number,
  contentBasePath: string,
  pageSpread?: 'left' | 'right',
): Promise<ImageInfo[]> {
  const images: ImageInfo[] = [];
  let pageOrder = 0;

  try {
    // img要素を正規表現で抽出
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    let match;

    while ((match = imgRegex.exec(htmlContent)) !== null) {
      const src = match[1];
      if (src && !src.startsWith('data:')) {
        const absoluteSrc = resolveImagePath(src, htmlPath, contentBasePath);
        if (absoluteSrc) {
          images.push({
            src: absoluteSrc,
            chapterOrder: chapterOrder,
            pageOrder: pageOrder++,
            pageSpread: pageSpread,
          });
        }
      }
    }

    // SVG内のimage要素を正規表現で抽出
    const svgImageRegex = /<image[^>]+(href|xlink:href)=["']([^"']+)["'][^>]*>/gi;

    while ((match = svgImageRegex.exec(htmlContent)) !== null) {
      const href = match[2];
      if (href && !href.startsWith('data:')) {
        const absoluteSrc = resolveImagePath(href, htmlPath, contentBasePath);
        if (absoluteSrc) {
          images.push({
            src: absoluteSrc,
            chapterOrder: chapterOrder,
            pageOrder: pageOrder++,
            pageSpread: pageSpread,
          });
        }
      }
    }

    // CSSの背景画像を正規表現で抽出
    const bgImageRegex = /background-image\s*:\s*url\(["']?([^"')]+)["']?\)/gi;

    while ((match = bgImageRegex.exec(htmlContent)) !== null) {
      const url = match[1];
      if (url && !url.startsWith('data:')) {
        const absoluteSrc = resolveImagePath(url, htmlPath, contentBasePath);
        if (absoluteSrc) {
          images.push({
            src: absoluteSrc,
            chapterOrder: chapterOrder,
            pageOrder: pageOrder++,
            pageSpread: pageSpread,
          });
        }
      }
    }
  } catch (error) {
    getLogger().error('HTML解析エラー', error instanceof Error ? error : new Error(String(error)));
  }

  return images;
}

function resolveImagePath(imageSrc: string, htmlPath: string, contentBasePath: string): string {
  // dataURLの場合は空文字を返す（スキップ）
  if (imageSrc.startsWith('data:')) {
    return '';
  }

  // 絶対パスの場合
  if (imageSrc.startsWith('/')) {
    // ルートからの相対パスとして解決
    return imageSrc.substring(1);
  }

  // 相対パスの場合
  const htmlDir = path.dirname(htmlPath);
  const resolvedPath = path.join(htmlDir, imageSrc).replace(/\\/g, '/');

  // パスを正規化（..を解決）
  const normalizedPath = path.normalize(resolvedPath).replace(/\\/g, '/');

  return normalizedPath;
}

/**
 * チャプターとページのマッピングを作成
 * @param epubData EPUBデータ
 * @returns ページインデックスからチャプター番号へのマッピング
 */
function createChapterPageMapping(epubData: EpubData): Map<number, number> {
  const mapping = new Map<number, number>();

  if (!epubData.navigation || epubData.navigation.length === 0) {
    // ナビゲーションがない場合はすべてチャプター1
    for (let i = 0; i < epubData.spine.length; i++) {
      mapping.set(i, 1);
    }
    return mapping;
  }

  // spineの各アイテムのhrefを事前に取得
  const spineHrefs: string[] = [];
  for (const spineItem of epubData.spine) {
    const manifestItem = epubData.manifest[spineItem.idref];
    if (manifestItem) {
      spineHrefs.push(manifestItem.href);
    } else {
      spineHrefs.push('');
    }
  }

  // 各チャプターの開始位置を検索
  const chapterStartIndices: { chapterOrder: number; spineIndex: number }[] = [];

  for (const chapter of epubData.navigation) {
    // hrefからフラグメントを除去
    const chapterHref = chapter.href.split('#')[0];

    // spine内での位置を検索
    const spineIndex = spineHrefs.findIndex((href) => href === chapterHref);

    if (spineIndex !== -1) {
      chapterStartIndices.push({
        chapterOrder: chapter.order,
        spineIndex: spineIndex,
      });
    }
  }

  // チャプター開始位置をspine順でソート
  chapterStartIndices.sort((a, b) => a.spineIndex - b.spineIndex);

  // 各ページがどのチャプターに属するかを決定
  let currentChapterIndex = 0;

  for (let spineIndex = 0; spineIndex < epubData.spine.length; spineIndex++) {
    // 次のチャプターの開始位置に達したか確認
    if (
      currentChapterIndex < chapterStartIndices.length - 1 &&
      spineIndex >= chapterStartIndices[currentChapterIndex + 1].spineIndex
    ) {
      currentChapterIndex++;
    }

    // 現在のチャプター番号を設定
    if (currentChapterIndex < chapterStartIndices.length) {
      mapping.set(spineIndex, chapterStartIndices[currentChapterIndex].chapterOrder);
    } else {
      // チャプター情報がないページは最後のチャプターに属する
      mapping.set(spineIndex, chapterStartIndices[chapterStartIndices.length - 1].chapterOrder);
    }
  }

  // デバッグ情報を出力
  getLogger().debug('チャプターページマッピング', {
    ナビゲーション数: epubData.navigation.length,
    spine数: epubData.spine.length,
    チャプター開始位置: chapterStartIndices.slice(0, 10),
    マッピングサンプル: Array.from(mapping.entries()).slice(0, 10),
  });

  // 特定チャプターの詳細情報
  const chapter3Info = chapterStartIndices.find((c) => c.chapterOrder === 3);
  const chapter4Info = chapterStartIndices.find((c) => c.chapterOrder === 4);
  const chapter6Info = chapterStartIndices.find((c) => c.chapterOrder === 6);
  const chapter7Info = chapterStartIndices.find((c) => c.chapterOrder === 7);

  if (chapter3Info && chapter4Info) {
    getLogger().debug(
      `チャプター3（巻頭特集）: spine ${chapter3Info.spineIndex} から ${chapter4Info.spineIndex - 1} まで（${chapter4Info.spineIndex - chapter3Info.spineIndex}ページ）`,
    );
  }
  if (chapter6Info && chapter7Info) {
    getLogger().debug(
      `チャプター6（勇者は魔王が好きらしい）: spine ${chapter6Info.spineIndex} から ${chapter7Info.spineIndex - 1} まで（${chapter7Info.spineIndex - chapter6Info.spineIndex}ページ）`,
    );
  }

  return mapping;
}
