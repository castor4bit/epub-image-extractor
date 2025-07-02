// Electron APIの型定義
interface ElectronAPI {
  getVersion: () => Promise<string>;
  processEpubFiles: (filePaths: string[]) => Promise<{
    success: boolean;
    results?: any[];
    error?: string;
  }>;
  onProgress: (callback: (progress: any) => void) => void;
  selectOutputDirectory: () => Promise<string | null>;
}

interface Window {
  electronAPI: ElectronAPI;
}

// Fileインターフェースの拡張（Electronのpathプロパティ）
interface File {
  path?: string;
}