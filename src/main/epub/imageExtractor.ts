import { ImageInfo } from '@shared/types';
import { EpubData } from './parser';
import path from 'path';
import EpubParser from '@gxl/epub-parser';

export async function extractImages(
  epubData: EpubData,
  onProgress?: (processed: number, total: number) => void
): Promise<ImageInfo[]> {
  const images: ImageInfo[] = [];
  const parser = epubData.parser || new EpubParser(epubData.basePath);
  
  try {
    // spine内の各ページを処理
    let processedCount = 0;
    const totalPages = epubData.spine.length;

    for (let pageIndex = 0; pageIndex < epubData.spine.length; pageIndex++) {
      const spineItem = epubData.spine[pageIndex];
      const manifestItem = epubData.manifest[spineItem.idref];
      
      if (!manifestItem) {
        console.warn(`Manifest item not found for spine idref: ${spineItem.idref}`);
        continue;
      }

      // HTMLコンテンツを取得
      const contentPath = manifestItem.href;
      const content = await parser.getFile(contentPath);
      const contentString = content.toString('utf-8');

      // HTMLを解析して画像を抽出
      const pageImages = await extractImagesFromHTML(
        contentString,
        contentPath,
        pageIndex,
        epubData.contentPath
      );

      images.push(...pageImages);

      // 進捗を通知
      processedCount++;
      if (onProgress) {
        onProgress(processedCount, totalPages);
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
    console.error('画像抽出エラー:', error);
    throw new Error(`画像の抽出に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
  }
}

async function extractImagesFromHTML(
  htmlContent: string,
  htmlPath: string,
  pageIndex: number,
  _contentBasePath: string
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
        const absoluteSrc = resolveImagePath(src, htmlPath, _contentBasePath);
        images.push({
          src: absoluteSrc,
          chapterOrder: pageIndex + 1,
          pageOrder: pageOrder++,
        });
      }
    }
    
    // SVG内のimage要素を正規表現で抽出
    const svgImageRegex = /<image[^>]+(href|xlink:href)=["']([^"']+)["'][^>]*>/gi;
    
    while ((match = svgImageRegex.exec(htmlContent)) !== null) {
      const href = match[2];
      if (href) {
        const absoluteSrc = resolveImagePath(href, htmlPath, _contentBasePath);
        images.push({
          src: absoluteSrc,
          chapterOrder: pageIndex + 1,
          pageOrder: pageOrder++,
        });
      }
    }
    
    // CSS背景画像を正規表現で抽出
    const bgImageRegex = /background-image:\s*url\(["']?([^"')]+)["']?\)/gi;
    
    while ((match = bgImageRegex.exec(htmlContent)) !== null) {
      const bgSrc = match[1];
      if (bgSrc && !bgSrc.startsWith('data:')) {
        const absoluteSrc = resolveImagePath(bgSrc, htmlPath, _contentBasePath);
        images.push({
          src: absoluteSrc,
          chapterOrder: pageIndex + 1,
          pageOrder: pageOrder++,
        });
      }
    }

  } catch (error) {
    console.warn(`HTML解析エラー (${htmlPath}):`, error);
  }
  
  return images;
}

function resolveImagePath(imageSrc: string, htmlPath: string, _contentBasePath: string): string {
  // 絶対パスの場合はそのまま返す
  if (imageSrc.startsWith('/')) {
    return imageSrc.substring(1); // 先頭の/を除去
  }
  
  // 相対パスの場合は解決
  const htmlDir = path.dirname(htmlPath);
  const resolvedPath = path.join(htmlDir, imageSrc);
  
  // パスを正規化
  return path.normalize(resolvedPath);
}