import { ProcessingProgress, ExtractionResult } from '@shared/types';
import { parseEpub } from './parser';
import { extractImages } from './imageExtractor';
import { organizeByChapters, FilenamingOptions } from './chapterOrganizer';
import { handleError } from '../utils/errorHandler';
import { generateOutputPath } from '../utils/outputPath';
import { settingsStore } from '../store/settings';
import { addE2EDelayByType } from '../utils/testMode';
import path from 'path';
import fs from 'fs/promises';

// p-limitの動的インポート
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pLimitModule: any = null;

async function getPLimit() {
  if (!pLimitModule) {
    try {
      const module = await import('p-limit');
      pLimitModule = module.default;
    } catch {
      // フォールバック: p-limitが使えない場合は単純な制限なし関数を返す
      pLimitModule = () => <T>(fn: () => Promise<T>) => fn();
    }
  }
  return pLimitModule;
}

export async function processEpubFiles(
  filePaths: string[],
  outputDir: string,
  onProgress: (progress: ProcessingProgress) => void,
  parallelLimit: number = 3,
): Promise<ExtractionResult[]> {
  // 並列処理の制限（同時に処理するEPUBファイル数）
  const pLimit = await getPLimit();
  const limit = pLimit(parallelLimit);
  const results: ExtractionResult[] = [];

  // 各ファイルのfileIdを事前に生成
  const fileIdMap = new Map<string, string>();
  const timestamp = Date.now();

  filePaths.forEach((filePath, index) => {
    const fileId = `file-${index}-${timestamp}`;
    fileIdMap.set(filePath, fileId);
  });

  // すべてのファイルの進捗を初期化（pending状態）
  filePaths.forEach((filePath) => {
    const fileName = path.basename(filePath);
    const fileId = fileIdMap.get(filePath)!;
    onProgress({
      fileId,
      fileName,
      totalImages: 0,
      processedImages: 0,
      status: 'pending',
    });
  });

  // 各EPUBファイルを並列処理
  const promises = filePaths.map((filePath) =>
    limit(() => processEpubFile(filePath, outputDir, onProgress, fileIdMap.get(filePath)!)),
  );

  const processResults = await Promise.allSettled(promises);

  // 結果を整理
  processResults.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      results.push(result.value);
    } else {
      // エラーの場合も結果に含める（通常は発生しないが、念のため）
      const filePath = filePaths[index];
      const fileName = path.basename(filePath);
      const fileId = fileIdMap.get(filePath)!;
      results.push({
        fileId,
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
  onProgress: (progress: ProcessingProgress) => void,
  fileId?: string,
): Promise<ExtractionResult> {
  const fileName = path.basename(filePath);
  const actualFileId = fileId || `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const errors: string[] = [];

  try {
    // 進捗通知：処理開始
    onProgress({
      fileId: actualFileId,
      fileName,
      totalImages: 0,
      processedImages: 0,
      status: 'processing',
    });

    // E2Eテストモードの場合は処理開始時に遅延を追加
    await addE2EDelayByType('FILE_PROCESSING_START');

    // EPUB解析
    const epubData = await parseEpub(filePath);

    // 画像抽出
    const images = await extractImages(epubData, (processed, total) => {
      onProgress({
        fileId: actualFileId,
        fileName,
        totalImages: total,
        processedImages: processed,
        status: 'processing',
        phase: 'extracting',
      });
    });

    // 重複を避けた出力先ディレクトリを生成
    const bookName = path.basename(fileName, '.epub');
    const outputPathInfo = await generateOutputPath(outputDir, bookName);
    const fileOutputDir = outputPathInfo.path;

    // 警告メッセージがある場合はエラーリストに追加
    if (outputPathInfo.warning) {
      console.warn(`出力先警告 (${fileName}): ${outputPathInfo.warning}`);
    }

    // generateOutputPathが既にディレクトリを作成している場合があるため、
    // エラーを無視して作成を試みる
    await fs.mkdir(fileOutputDir, { recursive: true }).catch(() => {});

    // 画像保存フェーズの開始を通知
    onProgress({
      fileId: actualFileId,
      fileName,
      totalImages: images.length,
      processedImages: images.length,
      status: 'processing',
      phase: 'organizing',
    });

    // 設定からファイル名オプションを取得
    const settings = settingsStore.get();
    const filenamingOptions: FilenamingOptions = {
      includeOriginalFilename: settings.includeOriginalFilename,
      includePageSpread: settings.includePageSpread,
    };

    // 章ごとに整理して保存
    const chapterCount = await organizeByChapters(
      images,
      epubData.navigation,
      fileOutputDir,
      epubData.basePath,
      filenamingOptions,
    );

    // E2Eテストモードの場合は処理完了時に遅延を追加
    await addE2EDelayByType('FILE_PROCESSING_END');

    // 進捗通知：完了
    onProgress({
      fileId: actualFileId,
      fileName,
      totalImages: images.length,
      processedImages: images.length,
      status: 'completed',
      outputPath: fileOutputDir,
      chapters: chapterCount,
    });

    return {
      fileId: actualFileId,
      fileName,
      outputPath: fileOutputDir,
      totalImages: images.length,
      chapters: chapterCount,
      errors,
    };
  } catch (error) {
    const errorMessage = handleError(error, `EPUB処理: ${fileName}`);
    errors.push(errorMessage);

    // 進捗通知：エラー
    onProgress({
      fileId: actualFileId,
      fileName,
      totalImages: 0,
      processedImages: 0,
      status: 'error',
      error: errorMessage,
    });

    // エラーをthrowする代わりに、エラー状態の結果を返す
    // これにより、onProgressで既に通知されたエラーが重複して処理されることを防ぐ
    return {
      fileId: actualFileId,
      fileName,
      outputPath: '',
      totalImages: 0,
      chapters: 0,
      errors: [errorMessage],
    };
  }
}
