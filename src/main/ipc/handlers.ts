import { ipcMain, dialog, app, BrowserWindow } from 'electron';
import { processEpubFiles } from '../epub/processor';
import { ProcessingProgress } from '@shared/types';
import path from 'path';
import fs from 'fs/promises';

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
    try {
      // デフォルト出力先の設定
      const outputDir = path.join(app.getPath('desktop'), 'EPUB_Images');
      await fs.mkdir(outputDir, { recursive: true });

      // 進捗更新コールバック
      const onProgress = (progress: ProcessingProgress) => {
        mainWindow.webContents.send('epub:progress', progress);
      };

      // EPUB処理を実行
      const results = await processEpubFiles(filePaths, outputDir, onProgress);
      return { success: true, results };
    } catch (error) {
      console.error('EPUB処理エラー:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '不明なエラーが発生しました' 
      };
    }
  });

  // 設定の取得
  ipcMain.handle('settings:get', async () => {
    // 後で electron-store を使って実装
    return {
      outputDirectory: app.getPath('desktop'),
      language: 'ja',
    };
  });

  // 設定の保存
  ipcMain.handle('settings:save', async (_event, _settings: any) => {
    // 後で electron-store を使って実装
    return { success: true };
  });
}