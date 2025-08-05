import { ipcMain, dialog, app, BrowserWindow, shell } from 'electron';
import { processEpubFiles } from '../epub/processor';
import { ProcessingProgress, Settings } from '@shared/types';
import path from 'path';
import fs from 'fs/promises';
import { settingsStore } from '../store/settings';
import { extractEpubsFromZip, cleanupTempFiles, isZipFile } from '../utils/zipHandler';
import { scanMultipleFoldersForEpubs } from '../utils/folderScanner';
import { logger } from '../utils/logger';
import { WINDOW_SIZES, WINDOW_OPACITY } from '../constants/window';
import { setupWindowOpacityHandlers } from '../utils/windowOpacity';

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

    logger.debug(
      {
        filePaths,
        count: filePaths.length,
        types: filePaths.map((p) => typeof p),
      },
      '受信したファイルパス',
    );

    try {
      // 設定から出力先を取得
      const outputDir = settingsStore.getOutputDirectory();
      await fs.mkdir(outputDir, { recursive: true });

      // ファイルパスを分類
      const epubPaths: string[] = [];
      const zipPaths: string[] = [];
      const folderPaths: string[] = [];

      // 各パスをチェックして分類
      for (const filePath of filePaths) {
        try {
          logger.debug({ filePath }, 'パスを確認中');
          const stats = await fs.stat(filePath);
          if (stats.isDirectory()) {
            logger.debug({ filePath }, 'フォルダとして分類');
            folderPaths.push(filePath);
          } else if (isZipFile(filePath)) {
            logger.debug({ filePath }, 'ZIPファイルとして分類');
            zipPaths.push(filePath);
          } else if (filePath.toLowerCase().endsWith('.epub')) {
            logger.debug({ filePath }, 'EPUBファイルとして分類');
            epubPaths.push(filePath);
          } else {
            logger.debug({ filePath }, '未対応のファイル形式');
          }
        } catch (error) {
          logger.error(
            { err: error instanceof Error ? error : new Error(String(error)), filePath },
            'パスの確認エラー',
          );
        }
      }

      // フォルダ内のEPUBファイルをスキャン
      if (folderPaths.length > 0) {
        logger.debug({ folderPaths }, 'フォルダ内のEPUBファイルをスキャン開始');
        const scannedEpubs = await scanMultipleFoldersForEpubs(folderPaths, 3);
        logger.debug({ scannedCount: scannedEpubs.length }, 'スキャン完了');
        // スキャンされたファイルを分類
        for (const scannedPath of scannedEpubs) {
          if (isZipFile(scannedPath)) {
            zipPaths.push(scannedPath);
          } else {
            epubPaths.push(scannedPath);
          }
        }
      }

      // ZIPファイルからEPUBを展開
      for (const zipPath of zipPaths) {
        try {
          const extractedEpubs = await extractEpubsFromZip(zipPath);
          epubPaths.push(...extractedEpubs);
          tempFiles.push(...extractedEpubs);
        } catch (error) {
          logger.error(
            { err: error instanceof Error ? error : new Error(String(error)), zipPath },
            'ZIP展開エラー',
          );
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

      logger.error(
        {
          err: error instanceof Error ? error : new Error(String(error)),
          stack: error instanceof Error ? error.stack : 'No stack trace',
        },
        'EPUB処理エラー',
      );

      // より詳細なエラー情報を返す
      let errorMessage = '不明なエラーが発生しました';
      if (error instanceof Error) {
        errorMessage = error.message;
        // ファイルパス関連のエラーの場合、より具体的なメッセージを追加
        if (error.message.includes('ENOENT') || error.message.includes('no such file')) {
          errorMessage = `ファイルが見つかりません: ${error.message}`;
        } else if (error.message.includes('EACCES') || error.message.includes('permission')) {
          errorMessage = `ファイルへのアクセス権限がありません: ${error.message}`;
        }
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  });

  // 設定の取得
  ipcMain.handle('settings:get', async () => {
    return settingsStore.get();
  });

  // 設定の保存
  ipcMain.handle('settings:save', async (_event, settings: Partial<Settings>) => {
    settingsStore.update(settings);

    // alwaysOnTopの設定が変更された場合、ウィンドウに反映
    if (settings.alwaysOnTop !== undefined) {
      mainWindow.setAlwaysOnTop(settings.alwaysOnTop);
    }

    // 透明度設定が変更された場合、ウィンドウの透明度ハンドラーを再設定
    if (settings.inactiveOpacity !== undefined || settings.enableMouseHoverOpacity !== undefined) {
      const currentSettings = settingsStore.get();

      // 既存のハンドラーを削除してから新しいハンドラーを設定
      mainWindow.removeAllListeners('blur');
      mainWindow.removeAllListeners('focus');

      setupWindowOpacityHandlers(
        mainWindow,
        currentSettings.inactiveOpacity ?? WINDOW_OPACITY.inactive.default,
        currentSettings.enableMouseHoverOpacity ?? true,
      );
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
