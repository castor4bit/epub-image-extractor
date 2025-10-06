import { contextBridge, ipcRenderer, IpcRendererEvent, webUtils } from 'electron';
import { ProcessingProgress, Settings, AppVersionInfo } from '../shared/types';

// レンダラープロセスに公開するAPI
const electronAPI = {
  getVersion: (): Promise<AppVersionInfo> => ipcRenderer.invoke('app:version'),
  // EPUB処理関連のAPI
  processEpubFiles: (filePaths: string[]) => ipcRenderer.invoke('epub:process', filePaths),
  // ドロップされたファイルのパスを取得
  getDroppedFilePaths: (fileList: FileList) => {
    return Array.from(fileList).map((file) => {
      let filePath = '';

      // webUtils.getPathForFileを使用してパスを取得
      if (webUtils && webUtils.getPathForFile) {
        try {
          filePath = webUtils.getPathForFile(file);
        } catch (e) {
          console.error('[Preload] ファイルパス取得エラー:', e);
        }
      }

      return {
        path: filePath,
        name: file.name,
        size: file.size,
        type: file.type,
      };
    });
  },
  onProgress: (callback: (progress: ProcessingProgress) => void) => {
    const listener = (_event: IpcRendererEvent, progress: ProcessingProgress) => callback(progress);
    ipcRenderer.on('epub:progress', listener);
    // クリーンアップ関数を返す
    return () => {
      ipcRenderer.removeListener('epub:progress', listener);
    };
  },
  selectOutputDirectory: () => ipcRenderer.invoke('dialog:selectDirectory'),
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (settings: Settings) => ipcRenderer.invoke('settings:save', settings),
  resetSettings: () => ipcRenderer.invoke('settings:reset'),
  clearWindowBounds: () => ipcRenderer.invoke('settings:clearWindowBounds'),
  openFolder: (path: string) => ipcRenderer.invoke('file:openFolder', path),
  // 処理状態の更新
  updateProcessingState: (isProcessing: boolean) => {
    ipcRenderer.send('app:updateProcessingState', isProcessing);
  },
  // ウィンドウマウスイベント
  send: (channel: string, ...args: unknown[]) => {
    const validChannels = ['window:mouseenter', 'window:mouseleave'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, ...args);
    }
  },
  // 更新確認
  checkForUpdates: () => ipcRenderer.invoke('update:check-for-updates'),
  openReleasesPage: () => ipcRenderer.invoke('update:open-releases-page'),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// TypeScript用の型定義
export type ElectronAPI = typeof electronAPI;
