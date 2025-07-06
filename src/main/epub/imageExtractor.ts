import { ImageInfo } from '@shared/types';
import { EpubData } from './parser';
import path from 'path';
import AdmZip from 'adm-zip';
import { resolveSecurePath, checkResourceLimits, RESOURCE_LIMITS } from '../utils/pathSecurity';

export async function extractImages(
  epubData: EpubData,
  onProgress?: (processed: number, total: number) => void
): Promise<ImageInfo[]> {
  const images: ImageInfo[] = [];
  const zip = epubData.parser as AdmZip || new AdmZip(epubData.basePath);
  let totalImageCount = 0;
  
  try {
    console.log('画像抽出開始:', {
      spineLength: epubData.spine.length,
      manifestSize: Object.keys(epubData.manifest).length,
      hasParser: !!epubData.parser
    });
    
    // spine内の各ページを処理
    let processedCount = 0;
    const totalPages = epubData.spine.length;

    for (let pageIndex = 0; pageIndex < epubData.spine.length; pageIndex++) {
      const spineItem = epubData.spine[pageIndex];
      console.log(`ページ ${pageIndex + 1}/${totalPages} 処理中:`, spineItem);
      
      const manifestItem = epubData.manifest[spineItem.idref];
      
      if (!manifestItem) {
        console.warn(`Manifest item not found for spine idref: ${spineItem.idref}`);
        continue;
      }

      // HTMLコンテンツを取得
      const contentPath = path.join(epubData.contentPath, manifestItem.href).replace(/\\/g, '/');
      console.log(`コンテンツ取得: ${contentPath}`);
      
      try {
        const contentEntry = zip.getEntry(contentPath);
        if (!contentEntry) {
          console.warn(`エントリーが見つかりません: ${contentPath}`);
          continue;
        }
        
        const contentString = zip.readAsText(contentEntry);
        console.log(`コンテンツサイズ: ${contentString.length} 文字`);

        // HTMLを解析して画像を抽出
        const pageImages = await extractImagesFromHTML(
          contentString,
          contentPath,
          pageIndex,
          epubData.contentPath
        );

        // リソース制限チェック
        totalImageCount += pageImages.length;
        const limitCheck = checkResourceLimits(
          totalImageCount,
          0, // 個別の画像サイズは後でチェック
          process.memoryUsage().heapUsed
        );
        
        if (!limitCheck.allowed) {
          console.warn(`リソース制限: ${limitCheck.reason}`);
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
        console.error(`コンテンツ取得エラー (${contentPath}):`, contentError);
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
    console.error('画像抽出エラー詳細:', {
      error,
      message: error instanceof Error ? error.message : '不明なエラー',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw new Error(`画像の抽出に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
  }
}

async function extractImagesFromHTML(
  htmlContent: string,
  htmlPath: string,
  pageIndex: number,
  contentBasePath: string
): Promise<ImageInfo[]> {
  const images: ImageInfo[] = [];
  let pageOrder = 0;
  
  try {
    // img要素を正規表現で抽出
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    let match;
    
    while ((match = imgRegex.exec(htmlContent)) !== null) {
      const src = match[1];
      if (src) {
        const absoluteSrc = resolveImagePath(src, htmlPath, contentBasePath);
        if (absoluteSrc) {
          images.push({
            src: absoluteSrc,
            chapterOrder: pageIndex + 1,
            pageOrder: pageOrder++,
          });
        }
      }
    }
    
    // SVG内のimage要素を正規表現で抽出
    const svgImageRegex = /<image[^>]+(href|xlink:href)=["']([^"']+)["'][^>]*>/gi;
    
    while ((match = svgImageRegex.exec(htmlContent)) !== null) {
      const href = match[2];
      if (href) {
        const absoluteSrc = resolveImagePath(href, htmlPath, contentBasePath);
        if (absoluteSrc) {
          images.push({
            src: absoluteSrc,
            chapterOrder: pageIndex + 1,
            pageOrder: pageOrder++,
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
            chapterOrder: pageIndex + 1,
            pageOrder: pageOrder++,
          });
        }
      }
    }
  } catch (error) {
    console.error('HTML解析エラー:', error);
  }
  
  return images;
}

function resolveImagePath(imageSrc: string, htmlPath: string, contentBasePath: string): string {
  // dataURLの場合はそのまま返す
  if (imageSrc.startsWith('data:')) {
    return imageSrc;
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