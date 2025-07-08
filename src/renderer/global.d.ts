// Electron APIの型定義
interface ElectronAPI {
  getVersion: () => Promise<string>;
  processEpubFiles: (filePaths: string[]) => Promise<{
    success: boolean;
    results?: any[];
    error?: string;
  }>;
  onProgress: (callback: (progress: any) => void) => () => void;
  selectOutputDirectory: () => Promise<string | null>;
  getSettings: () => Promise<{
    outputDirectory: string;
    language: string;
    alwaysOnTop: boolean;
    includeOriginalFilename: boolean;
    includePageSpread: boolean;
  }>;
  saveSettings: (settings: {
    outputDirectory: string;
    language: string;
    alwaysOnTop: boolean;
    includeOriginalFilename: boolean;
    includePageSpread: boolean;
  }) => Promise<{ success: boolean }>;
  resetSettings: () => Promise<{
    outputDirectory: string;
    language: string;
    alwaysOnTop: boolean;
    includeOriginalFilename: boolean;
    includePageSpread: boolean;
  }>;
  openFolder: (path: string) => Promise<{ success: boolean; error?: string }>;
}

interface Window {
  electronAPI: ElectronAPI;
}

// Fileインターフェースの拡張（Electronのpathプロパティ）
interface File {
  path?: string;
}
