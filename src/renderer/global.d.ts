// Electron APIの型定義
interface ElectronAPI {
  getVersion: () => Promise<string>;
  processEpubFiles: (filePaths: string[]) => Promise<{
    success: boolean;
    results?: import('@shared/types').ExtractionResult[];
    error?: string;
  }>;
  onProgress: (callback: (progress: import('@shared/types').ProcessingProgress) => void) => () => void;
  selectOutputDirectory: () => Promise<string | null>;
  getSettings: () => Promise<import('@shared/types').Settings>;
  saveSettings: (settings: import('@shared/types').Settings) => Promise<{ success: boolean }>;
  resetSettings: () => Promise<import('@shared/types').Settings>;
  openFolder: (path: string) => Promise<{ success: boolean; error?: string }>;
}

interface Window {
  electronAPI: ElectronAPI;
}

// Fileインターフェースの拡張（Electronのpathプロパティ）
interface File {
  path?: string;
}
