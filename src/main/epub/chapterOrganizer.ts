import { ImageInfo, ChapterInfo } from '@shared/types';
import path from 'path';
import fs from 'fs/promises';
import EpubParser from '@gxl/epub-parser';

export async function organizeByChapters(
  images: ImageInfo[],
  navigation: ChapterInfo[],
  outputDir: string,
  epubPath: string
): Promise<number> {
  const parser = new EpubParser(epubPath);
  const chapterMap = new Map<number, ChapterInfo>();
  
  // ナビゲーション情報がある場合
  if (navigation.length > 0) {
    navigation.forEach((chapter) => {
      chapterMap.set(chapter.order, chapter);
    });
  } else {
    // ナビゲーションがない場合は「未分類」として処理
    chapterMap.set(1, {
      order: 1,
      title: '未分類',
      href: '',
    });
  }

  // 章ごとに画像を整理
  const imagesByChapter = new Map<number, ImageInfo[]>();
  
  images.forEach((image) => {
    const chapterOrder = navigation.length > 0 ? image.chapterOrder : 1;
    if (!imagesByChapter.has(chapterOrder)) {
      imagesByChapter.set(chapterOrder, []);
    }
    imagesByChapter.get(chapterOrder)!.push(image);
  });

  // 各章のディレクトリを作成して画像を保存
  let processedChapters = 0;
  
  for (const [chapterOrder, chapterImages] of imagesByChapter) {
    const chapter = chapterMap.get(chapterOrder) || {
      order: chapterOrder,
      title: `章 ${chapterOrder}`,
      href: '',
    };

    // ディレクトリ名を生成（順序番号を3桁でパディング）
    const dirName = `${String(chapter.order).padStart(3, '0')}_${sanitizeFileName(chapter.title)}`;
    const chapterDir = path.join(outputDir, dirName);
    
    // ディレクトリ作成
    await fs.mkdir(chapterDir, { recursive: true });

    // 画像を保存
    let imageIndex = 1;
    for (const image of chapterImages) {
      try {
        // EPUBから画像データを取得
        const imageBuffer = await parser.getFile(image.src);
        
        // 拡張子を決定
        const ext = getImageExtension(image.src, imageBuffer);
        
        // ファイル名を生成（3桁でパディング）
        const fileName = `${String(imageIndex).padStart(3, '0')}${ext}`;
        const filePath = path.join(chapterDir, fileName);
        
        // 画像を保存
        await fs.writeFile(filePath, imageBuffer);
        
        imageIndex++;
      } catch (error) {
        console.error(`画像保存エラー (${image.src}):`, error);
      }
    }

    processedChapters++;
  }

  return processedChapters;
}

// ファイル名として使用できない文字を置換
function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[<>:"/\\|?*]/g, '_')  // Windowsで使用できない文字
    .replace(/\s+/g, '_')            // 空白をアンダースコアに
    .replace(/_{2,}/g, '_')          // 連続するアンダースコアを1つに
    .replace(/^_|_$/g, '')           // 先頭・末尾のアンダースコアを除去
    .slice(0, 50);                   // 長すぎる場合は切り詰め
}

// 画像の拡張子を決定
function getImageExtension(imagePath: string, imageBuffer: Buffer): string {
  // パスから拡張子を取得
  const pathExt = path.extname(imagePath).toLowerCase();
  
  // 一般的な画像拡張子の場合はそのまま使用
  if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'].includes(pathExt)) {
    return pathExt;
  }
  
  // バッファから画像形式を判定（マジックナンバーをチェック）
  if (imageBuffer.length >= 4) {
    const header = imageBuffer.slice(0, 4);
    
    // PNG
    if (header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4E && header[3] === 0x47) {
      return '.png';
    }
    
    // JPEG
    if (header[0] === 0xFF && header[1] === 0xD8 && header[2] === 0xFF) {
      return '.jpg';
    }
    
    // GIF
    if (header[0] === 0x47 && header[1] === 0x49 && header[2] === 0x46) {
      return '.gif';
    }
    
    // WebP
    if (imageBuffer.length >= 12) {
      const riff = imageBuffer.slice(0, 4).toString('ascii');
      const webp = imageBuffer.slice(8, 12).toString('ascii');
      if (riff === 'RIFF' && webp === 'WEBP') {
        return '.webp';
      }
    }
  }
  
  // デフォルトはJPEG
  return '.jpg';
}