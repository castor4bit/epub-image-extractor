import { ImageInfo, ChapterInfo } from '@shared/types';
import path from 'path';
import fs from 'fs/promises';
import AdmZip from 'adm-zip';
import {
  sanitizeFileName as secureSanitizeFileName,
  checkResourceLimits,
  RESOURCE_LIMITS,
} from '../utils/pathSecurity';

export interface FilenamingOptions {
  includeOriginalFilename: boolean;
  includePageSpread: boolean;
}

export async function organizeByChapters(
  images: ImageInfo[],
  navigation: ChapterInfo[],
  outputDir: string,
  epubPath: string,
  options: FilenamingOptions = { includeOriginalFilename: true, includePageSpread: true },
): Promise<number> {
  const zip = new AdmZip(epubPath);
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
    const dirName = `${String(chapter.order).padStart(3, '0')}_${secureSanitizeFileName(chapter.title)}`;
    const chapterDir = path.join(outputDir, dirName);

    // ディレクトリ作成
    await fs.mkdir(chapterDir, { recursive: true });

    // 画像を保存
    let imageIndex = 1;
    for (const image of chapterImages) {
      try {
        // EPUBから画像データを取得
        const imageEntry = zip.getEntry(image.src);
        if (!imageEntry) {
          console.warn(`画像エントリーが見つかりません: ${image.src}`);
          continue;
        }
        const imageBuffer = zip.readFile(imageEntry);
        if (!imageBuffer) {
          console.warn(`画像データが読み取れません: ${image.src}`);
          continue;
        }

        // 画像サイズチェック
        const sizeCheck = checkResourceLimits(
          0,
          imageBuffer.length,
          process.memoryUsage().heapUsed,
        );
        if (!sizeCheck.allowed) {
          console.warn(`画像サイズ制限超過 (${image.src}): ${sizeCheck.reason}`);
          continue;
        }

        // 拡張子を決定
        const ext = getImageExtension(image.src, imageBuffer);

        // ファイル名を生成
        let fileName = String(imageIndex).padStart(4, '0');
        
        // 元のファイル名を含める設定の場合
        if (options.includeOriginalFilename) {
          const originalBaseName = path.basename(image.src, path.extname(image.src));
          const sanitizedOriginalName = secureSanitizeFileName(originalBaseName);
          fileName += `_${sanitizedOriginalName}`;
        }
        
        // pageSpread情報を含める設定の場合
        if (options.includePageSpread && image.pageSpread) {
          fileName += `-${image.pageSpread}`;
        }
        
        fileName += ext;
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

// ファイル名として使用できない文字を置換（互換性のため残す）
function sanitizeFileName(fileName: string): string {
  return secureSanitizeFileName(fileName);
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
    if (header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4e && header[3] === 0x47) {
      return '.png';
    }

    // JPEG
    if (header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff) {
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
