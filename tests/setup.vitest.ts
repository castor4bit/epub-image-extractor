import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// @testing-library/reactのクリーンアップ
afterEach(() => {
  cleanup();
});

// グローバルモック設定
vi.mock('electron', () => ({
  app: {
    getPath: vi.fn((name: string) => {
      if (name === 'desktop') return '/mock/desktop';
      if (name === 'userData') return '/mock/userData';
      if (name === 'temp') return '/mock/temp';
      return '/mock/path';
    }),
    getName: vi.fn(() => 'EPUB Image Extractor'),
    getVersion: vi.fn(() => '0.0.0-test'),
    quit: vi.fn(),
    whenReady: vi.fn(() => Promise.resolve()),
    on: vi.fn(),
    dock: undefined,
    name: 'EPUB Image Extractor'
  },
  ipcMain: {
    on: vi.fn(),
    handle: vi.fn(),
    removeHandler: vi.fn(),
    removeAllListeners: vi.fn()
  },
  ipcRenderer: {
    send: vi.fn(),
    on: vi.fn(),
    invoke: vi.fn(),
    removeAllListeners: vi.fn()
  },
  BrowserWindow: vi.fn().mockImplementation(() => ({
    loadURL: vi.fn(),
    loadFile: vi.fn(),
    on: vi.fn(),
    once: vi.fn(),
    close: vi.fn(),
    destroy: vi.fn(),
    isDestroyed: vi.fn(() => false),
    webContents: {
      send: vi.fn(),
      on: vi.fn(),
      openDevTools: vi.fn()
    },
    setAlwaysOnTop: vi.fn(),
    setOpacity: vi.fn(),
    getBounds: vi.fn(() => ({ x: 0, y: 0, width: 800, height: 600 })),
    setBounds: vi.fn()
  })),
  dialog: {
    showOpenDialog: vi.fn(),
    showSaveDialog: vi.fn(),
    showMessageBox: vi.fn(),
    showErrorBox: vi.fn()
  },
  Menu: {
    buildFromTemplate: vi.fn(),
    setApplicationMenu: vi.fn()
  }
}));

// electron-storeのモック
vi.mock('electron-store', () => {
  const Store = vi.fn().mockImplementation(() => ({
    get: vi.fn((key?: string) => {
      if (!key) {
        return {
          outputDirectory: '/mock/desktop/EPUB_Images',
          language: 'ja',
          alwaysOnTop: true,
          includeOriginalFilename: true,
          includePageSpread: true,
          inactiveOpacity: 0.8,
          enableMouseHoverOpacity: true
        };
      }
      return undefined;
    }),
    set: vi.fn(),
    delete: vi.fn(),
    clear: vi.fn(),
    has: vi.fn(() => false),
    onDidChange: vi.fn(),
    onDidAnyChange: vi.fn()
  }));
  return { default: Store };
});

// windowオブジェクトのモック
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'electron', {
    value: {
      processFiles: vi.fn(),
      getSettings: vi.fn(),
      updateSettings: vi.fn(),
      selectFolder: vi.fn(),
      onProgress: vi.fn(),
      onComplete: vi.fn(),
      onError: vi.fn()
    },
    writable: true
  });

  // matchMediaのモック
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))
  });
}

// consoleメソッドのモック（必要に応じて）
global.console = {
  ...console,
  error: vi.fn(console.error),
  warn: vi.fn(console.warn),
  log: vi.fn(console.log)
};