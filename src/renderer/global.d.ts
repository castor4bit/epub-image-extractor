// Electron APIの型定義
interface ElectronAPI {
  getVersion: () => Promise<import('@shared/types').AppVersionInfo>;
  processEpubFiles: (filePaths: string[]) => Promise<{
    success: boolean;
    results?: import('@shared/types').ExtractionResult[];
    error?: string;
  }>;
  getDroppedFilePaths: (fileList: FileList) => Array<{
    path: string;
    name: string;
    size: number;
    type: string;
  }>;
  onProgress: (
    callback: (progress: import('@shared/types').ProcessingProgress) => void,
  ) => () => void;
  selectOutputDirectory: () => Promise<string | null>;
  getSettings: () => Promise<import('@shared/types').Settings>;
  saveSettings: (settings: import('@shared/types').Settings) => Promise<{ success: boolean }>;
  resetSettings: () => Promise<import('@shared/types').Settings>;
  clearWindowBounds: () => Promise<{ success: boolean }>;
  openFolder: (path: string) => Promise<{ success: boolean; error?: string }>;
}

interface Window {
  electronAPI: ElectronAPI;
}

// Fileインターフェースの拡張（Electronのpathプロパティ）
interface File {
  path?: string;
}

// 画像ファイルのimport型定義
declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.jpeg' {
  const value: string;
  export default value;
}
