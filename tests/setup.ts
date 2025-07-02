import '@testing-library/jest-dom';

// Electronモジュールのモック
jest.mock('electron', () => ({
  app: {
    getPath: jest.fn(),
    getName: jest.fn(),
    getVersion: jest.fn(),
  },
  ipcMain: {
    handle: jest.fn(),
    on: jest.fn(),
  },
  ipcRenderer: {
    invoke: jest.fn(),
    on: jest.fn(),
    send: jest.fn(),
  },
  contextBridge: {
    exposeInMainWorld: jest.fn(),
  },
}));

// グローバルなテストユーティリティ
global.beforeEach(() => {
  jest.clearAllMocks();
});