import { contextBridge, ipcRenderer } from 'electron';

// レンダラープロセスに公開するAPI
const electronAPI = {
  getVersion: () => ipcRenderer.invoke('app:version'),
  // EPUB処理関連のAPIは後で追加
  processEpubFiles: (filePaths: string[]) => ipcRenderer.invoke('epub:process', filePaths),
  onProgress: (callback: (progress: any) => void) => {
    ipcRenderer.on('epub:progress', (_event, progress) => callback(progress));
  },
  selectOutputDirectory: () => ipcRenderer.invoke('dialog:selectDirectory'),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// TypeScript用の型定義
export type ElectronAPI = typeof electronAPI;