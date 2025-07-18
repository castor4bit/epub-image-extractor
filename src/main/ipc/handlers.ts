import { ipcMain, dialog, app, BrowserWindow, shell } from 'electron';
import { processEpubFiles } from '../epub/processor';
import { ProcessingProgress, Settings } from '@shared/types';
import path from 'path';
import fs from 'fs/promises';
import { settingsStore } from '../store/settings';
import { extractEpubsFromZip, cleanupTempFiles, isZipFile } from '../utils/zipHandler';
import { WINDOW_SIZES } from '../constants/window';

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
            error: error instanceof Error ? error.message : '不明なエラー',
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
        error: error instanceof Error ? error.message : '不明なエラーが発生しました',
      };
    }
  });

  // 設定の取得
  ipcMain.handle('settings:get', async () => {
    return settingsStore.get();
  });

  // 設定の保存
  ipcMain.handle('settings:save', async (_event, settings: Partial<Settings>) => {
    settingsStore.set(settings);

    // alwaysOnTopの設定が変更された場合、ウィンドウに反映
    if (settings.alwaysOnTop !== undefined) {
      mainWindow.setAlwaysOnTop(settings.alwaysOnTop);
    }

    return { success: true };
  });

  // 設定のリセット
  ipcMain.handle('settings:reset', async () => {
    settingsStore.resetToDefaults();
    const defaultSettings = settingsStore.get();
    // デフォルトのalwaysOnTopを即座に適用
    if (mainWindow) {
      mainWindow.setAlwaysOnTop(defaultSettings.alwaysOnTop);
    }
    return defaultSettings;
  });

  // ウィンドウサイズのクリア
  ipcMain.handle('settings:clearWindowBounds', async () => {
    settingsStore.setWindowBounds(undefined);
    
    // デフォルトサイズに即座にリサイズ
    if (mainWindow) {
      mainWindow.setSize(WINDOW_SIZES.default.width, WINDOW_SIZES.default.height);
      mainWindow.center(); // 画面中央に配置
    }
    
    return { success: true };
  });

  // フォルダを開く
  ipcMain.handle('file:openFolder', async (_event, folderPath: string) => {
    try {
      await shell.openPath(folderPath);
      return { success: true };
    } catch (error) {
      console.error('フォルダを開けませんでした:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '不明なエラー',
      };
    }
  });

  // アプリケーションバージョン情報の取得
  ipcMain.handle('app:version', async () => {
    return {
      version: app.getVersion(),
      name: app.getName(),
      electronVersion: process.versions.electron,
      nodeVersion: process.versions.node,
      chromiumVersion: process.versions.chrome,
      platform: process.platform,
      arch: process.arch,
    };
  });
}
