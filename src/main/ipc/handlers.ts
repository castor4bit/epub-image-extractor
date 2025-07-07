import { ipcMain, dialog, app, BrowserWindow } from 'electron';
import { processEpubFiles } from '../epub/processor';
import { ProcessingProgress } from '@shared/types';
import path from 'path';
import fs from 'fs/promises';
import { settingsStore } from '../store/settings';
import { extractEpubsFromZip, cleanupTempFiles, isZipFile } from '../utils/zipHandler';

// 出力ディレクトリ選択
export function registerIpcHandlers(mainWindow: BrowserWindow) {
  // 出力ディレクトリ選択ダイアログ
  ipcMain.handle('dialog:selectDirectory', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory', 'createDirectory'],
      defaultPath: app.getPath('desktop'),
      title: '出力先フォルダを選択',
    });

    if (result.canceled) {
      return null;
    }

    return result.filePaths[0];
  });

  // EPUBファイル処理
  ipcMain.handle('epub:process', async (_event, filePaths: string[]) => {
    const tempFiles: string[] = [];
    
    try {
      // 設定から出力先を取得
      const outputDir = settingsStore.getOutputDirectory();
      await fs.mkdir(outputDir, { recursive: true });

      // EPUBファイルとZIPファイルを分離
      const epubPaths: string[] = [];
      const zipPaths: string[] = [];
      
      for (const filePath of filePaths) {
        if (isZipFile(filePath)) {
          zipPaths.push(filePath);
        } else {
          epubPaths.push(filePath);
        }
      }
      
      // ZIPファイルからEPUBを展開
      for (const zipPath of zipPaths) {
        try {
          const extractedEpubs = await extractEpubsFromZip(zipPath);
          epubPaths.push(...extractedEpubs);
          tempFiles.push(...extractedEpubs);
        } catch (error) {
          console.error(`ZIP展開エラー (${zipPath}):`, error);
          // ZIPエラーは個別に通知してスキップ
          const progress: ProcessingProgress = {
            fileId: `zip-${Date.now()}`,
            fileName: path.basename(zipPath),
            totalImages: 0,
            processedImages: 0,
            status: 'error',
            error: `ZIPファイルの展開に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`
          };
          mainWindow.webContents.send('epub:progress', progress);
        }
      }

      // 進捗更新コールバック
      const onProgress = (progress: ProcessingProgress) => {
        mainWindow.webContents.send('epub:progress', progress);
      };

      // EPUB処理を実行（並列数は固定で3）
      const results = await processEpubFiles(epubPaths, outputDir, onProgress, 3);
      
      // 一時ファイルをクリーンアップ
      await cleanupTempFiles(tempFiles);
      
      return { success: true, results };
    } catch (error) {
      // エラー時も一時ファイルをクリーンアップ
      await cleanupTempFiles(tempFiles);
      
      console.error('EPUB処理エラー:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '不明なエラーが発生しました' 
      };
    }
  });

  // 設定の取得
  ipcMain.handle('settings:get', async () => {
    return settingsStore.get();
  });

  // 設定の保存
  ipcMain.handle('settings:save', async (_event, settings: any) => {
    settingsStore.set(settings);
    return { success: true };
  });

  // 設定のリセット
  ipcMain.handle('settings:reset', async () => {
    settingsStore.resetToDefaults();
    return settingsStore.get();
  });
}