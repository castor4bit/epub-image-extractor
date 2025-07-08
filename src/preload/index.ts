import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { ProcessingProgress, Settings } from '../shared/types';

// レンダラープロセスに公開するAPI
const electronAPI = {
  getVersion: () => ipcRenderer.invoke('app:version'),
  // EPUB処理関連のAPIは後で追加
  processEpubFiles: (filePaths: string[]) => ipcRenderer.invoke('epub:process', filePaths),
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
  openFolder: (path: string) => ipcRenderer.invoke('file:openFolder', path),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// TypeScript用の型定義
export type ElectronAPI = typeof electronAPI;
