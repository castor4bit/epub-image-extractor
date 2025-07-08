import os from 'os';
import path from 'path';

// 統合テスト用のElectronモック
// 実際のファイルシステムを使用するが、Electron固有の機能はモック
jest.mock('electron', () => ({
  app: {
    getPath: jest.fn((name: string) => {
      switch (name) {
        case 'temp':
          return os.tmpdir();
        case 'desktop':
          return path.join(os.homedir(), 'Desktop');
        default:
          return os.tmpdir();
      }
    }),
    getVersion: jest.fn(() => '1.0.0-test'),
  },
  ipcMain: {
    handle: jest.fn(),
    on: jest.fn(),
  },
  BrowserWindow: jest.fn(),
  dialog: {
    showOpenDialog: jest.fn(),
  },
  shell: {
    openPath: jest.fn(),
  },
}));

// electron-storeモック（メモリ内ストレージ）
const store = new Map();
jest.mock('electron-store', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn((key: string, defaultValue?: any) => {
      return store.has(key) ? store.get(key) : defaultValue;
    }),
    set: jest.fn((key: string, value: any) => {
      store.set(key, value);
    }),
    delete: jest.fn((key: string) => {
      store.delete(key);
    }),
    clear: jest.fn(() => {
      store.clear();
    }),
  }));
});