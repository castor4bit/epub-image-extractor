import { ProcessingProgress, ExtractionResult } from '@shared/types';
import { parseEpub } from './parser';
import { extractImages } from './imageExtractor';
import { organizeByChapters } from './chapterOrganizer';
import path from 'path';
import fs from 'fs/promises';
import pLimit from 'p-limit';

// 並列処理の制限（同時に処理するEPUBファイル数）
const limit = pLimit(3);

export async function processEpubFiles(
  filePaths: string[],
  outputDir: string,
  onProgress: (progress: ProcessingProgress) => void
): Promise<ExtractionResult[]> {
  const results: ExtractionResult[] = [];

  // 各EPUBファイルを並列処理
  const promises = filePaths.map((filePath) =>
    limit(() => processEpubFile(filePath, outputDir, onProgress))
  );

  const processResults = await Promise.allSettled(promises);

  // 結果を整理
  processResults.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      results.push(result.value);
    } else {
      // エラーの場合も結果に含める
      const filePath = filePaths[index];
      const fileName = path.basename(filePath);
      results.push({
        fileId: `file-${index}`,
        fileName,
        outputPath: '',
        totalImages: 0,
        chapters: 0,
        errors: [result.reason?.message || '処理中にエラーが発生しました'],
      });
    }
  });

  return results;
}

async function processEpubFile(
  filePath: string,
  outputDir: string,
  onProgress: (progress: ProcessingProgress) => void
): Promise<ExtractionResult> {
  const fileName = path.basename(filePath);
  const fileId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const errors: string[] = [];

  try {
    // 進捗通知：処理開始
    onProgress({
      fileId,
      fileName,
      totalImages: 0,
      processedImages: 0,
      status: 'processing',
    });

    // EPUB解析
    const epubData = await parseEpub(filePath);
    
    // 画像抽出
    const images = await extractImages(epubData, (processed, total) => {
      onProgress({
        fileId,
        fileName,
        totalImages: total,
        processedImages: processed,
        status: 'processing',
      });
    });

    // 出力先ディレクトリ作成
    const fileOutputDir = path.join(outputDir, path.basename(fileName, '.epub'));
    await fs.mkdir(fileOutputDir, { recursive: true });

    // 章ごとに整理して保存
    const chapterCount = await organizeByChapters(
      images,
      epubData.navigation,
      fileOutputDir,
      epubData.basePath
    );

    // 進捗通知：完了
    onProgress({
      fileId,
      fileName,
      totalImages: images.length,
      processedImages: images.length,
      status: 'completed',
    });

    return {
      fileId,
      fileName,
      outputPath: fileOutputDir,
      totalImages: images.length,
      chapters: chapterCount,
      errors,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '不明なエラー';
    errors.push(errorMessage);

    // 進捗通知：エラー
    onProgress({
      fileId,
      fileName,
      totalImages: 0,
      processedImages: 0,
      status: 'error',
      error: errorMessage,
    });

    throw error;
  }
}