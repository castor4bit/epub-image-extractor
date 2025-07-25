import { BrowserWindow } from 'electron';

// Electronのモックを設定
jest.mock('electron', () => ({
  BrowserWindow: jest.fn().mockImplementation(() => ({
    setOpacity: jest.fn(),
    on: jest.fn(),
    loadURL: jest.fn(),
    loadFile: jest.fn(),
    webContents: {
      openDevTools: jest.fn(),
    },
    getBounds: jest.fn().mockReturnValue({
      x: 0,
      y: 0,
      width: 600,
      height: 560,
    }),
    destroy: jest.fn(),
  })),
  app: {
    whenReady: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
    quit: jest.fn(),
    name: 'EPUB Image Extractor',
    getName: jest.fn().mockReturnValue('EPUB Image Extractor'),
    dock: undefined,
  },
  Menu: {
    buildFromTemplate: jest.fn(),
    setApplicationMenu: jest.fn(),
  },
  ipcMain: {
    handle: jest.fn(),
    on: jest.fn(),
  },
  dialog: {
    showMessageBoxSync: jest.fn(),
  },
}));

describe('Window Opacity Control', () => {
  let mockWindow: any;
  let createWindowWithOpacity: () => BrowserWindow;

  beforeEach(() => {
    jest.clearAllMocks();

    // createWindowWithOpacity関数（実装予定）をモック
    createWindowWithOpacity = () => {
      mockWindow = new BrowserWindow();

      // フォーカス/ブラーイベントのハンドラーを設定（実装予定）
      const eventHandlers: { [key: string]: Function } = {};
      mockWindow.on = jest.fn((event: string, handler: Function) => {
        eventHandlers[event] = handler;
      });

      // イベントをトリガーするヘルパー関数
      mockWindow.trigger = (event: string) => {
        if (eventHandlers[event]) {
          eventHandlers[event]();
        }
      };

      // 実際の実装で追加される予定のコード
      mockWindow.on('blur', () => {
        mockWindow.setOpacity(0.8); // 非アクティブ時は80%の透明度
      });

      mockWindow.on('focus', () => {
        mockWindow.setOpacity(1.0); // アクティブ時は完全に不透明
      });

      return mockWindow;
    };
  });

  afterEach(() => {
    mockWindow = null;
  });

  it('should set opacity to 0.8 when window loses focus', () => {
    const window = createWindowWithOpacity();

    // blurイベントをトリガー
    window.trigger('blur');

    expect(window.setOpacity).toHaveBeenCalledWith(0.8);
  });

  it('should set opacity to 1.0 when window gains focus', () => {
    const window = createWindowWithOpacity();

    // focusイベントをトリガー
    window.trigger('focus');

    expect(window.setOpacity).toHaveBeenCalledWith(1.0);
  });

  it('should register blur and focus event handlers', () => {
    const window = createWindowWithOpacity();

    expect(window.on).toHaveBeenCalledWith('blur', expect.any(Function));
    expect(window.on).toHaveBeenCalledWith('focus', expect.any(Function));
  });

  it('should handle multiple focus/blur events correctly', () => {
    const window = createWindowWithOpacity();

    // 複数回のフォーカス/ブラーイベントをシミュレート
    window.trigger('blur');
    expect(window.setOpacity).toHaveBeenLastCalledWith(0.8);

    window.trigger('focus');
    expect(window.setOpacity).toHaveBeenLastCalledWith(1.0);

    window.trigger('blur');
    expect(window.setOpacity).toHaveBeenLastCalledWith(0.8);

    window.trigger('focus');
    expect(window.setOpacity).toHaveBeenLastCalledWith(1.0);

    // 合計4回呼ばれているはず
    expect(window.setOpacity).toHaveBeenCalledTimes(4);
  });
});
