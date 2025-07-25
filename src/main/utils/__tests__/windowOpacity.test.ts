import { BrowserWindow } from 'electron';
import { setupWindowOpacityHandlers } from '../windowOpacity';
import { WINDOW_OPACITY } from '../../constants/window';

// Electronのモック
jest.mock('electron', () => ({
  BrowserWindow: jest.fn(),
  app: {
    getPath: jest.fn().mockReturnValue('/mock/desktop'),
  },
}));

describe('Window Opacity Control', () => {
  let mockWindow: any;
  let eventHandlers: { [key: string]: Function };

  beforeEach(() => {
    jest.clearAllMocks();
    eventHandlers = {};

    // BrowserWindowのモックインスタンスを作成
    mockWindow = {
      on: jest.fn((event: string, handler: Function) => {
        eventHandlers[event] = handler;
      }),
      setOpacity: jest.fn(),
      isDestroyed: jest.fn().mockReturnValue(false),
    };
  });

  afterEach(() => {
    mockWindow = null;
    eventHandlers = {};
  });

  describe('setupWindowOpacityHandlers', () => {
    it('should register blur and focus event handlers', () => {
      setupWindowOpacityHandlers(mockWindow as any);

      expect(mockWindow.on).toHaveBeenCalledWith('blur', expect.any(Function));
      expect(mockWindow.on).toHaveBeenCalledWith('focus', expect.any(Function));
      expect(mockWindow.on).toHaveBeenCalledTimes(2);
    });

    it('should set opacity to default inactive opacity when window loses focus', () => {
      setupWindowOpacityHandlers(mockWindow as any);

      // blurイベントをトリガー
      eventHandlers['blur']();

      expect(mockWindow.setOpacity).toHaveBeenCalledWith(WINDOW_OPACITY.inactive.default);
    });

    it('should set opacity to active opacity when window gains focus', () => {
      setupWindowOpacityHandlers(mockWindow as any);

      // focusイベントをトリガー
      eventHandlers['focus']();

      expect(mockWindow.setOpacity).toHaveBeenCalledWith(WINDOW_OPACITY.active);
    });

    it('should use custom opacity value when provided', () => {
      const customOpacity = 0.5;
      setupWindowOpacityHandlers(mockWindow as any, customOpacity);

      // blurイベントをトリガー
      eventHandlers['blur']();

      expect(mockWindow.setOpacity).toHaveBeenCalledWith(customOpacity);
    });

    it('should handle multiple focus/blur events correctly', () => {
      setupWindowOpacityHandlers(mockWindow as any, 0.7);

      // 複数回のフォーカス/ブラーイベントをシミュレート
      eventHandlers['blur']();
      expect(mockWindow.setOpacity).toHaveBeenLastCalledWith(0.7);

      eventHandlers['focus']();
      expect(mockWindow.setOpacity).toHaveBeenLastCalledWith(WINDOW_OPACITY.active);

      eventHandlers['blur']();
      expect(mockWindow.setOpacity).toHaveBeenLastCalledWith(0.7);

      eventHandlers['focus']();
      expect(mockWindow.setOpacity).toHaveBeenLastCalledWith(WINDOW_OPACITY.active);

      // 合計4回呼ばれているはず
      expect(mockWindow.setOpacity).toHaveBeenCalledTimes(4);
    });

    it('should not set opacity if window is destroyed', () => {
      mockWindow.isDestroyed.mockReturnValue(true);
      setupWindowOpacityHandlers(mockWindow as any);

      // blurイベントをトリガー
      eventHandlers['blur']();

      expect(mockWindow.setOpacity).not.toHaveBeenCalled();

      // focusイベントをトリガー
      eventHandlers['focus']();

      expect(mockWindow.setOpacity).not.toHaveBeenCalled();
    });

    it('should check window destroyed state before each opacity change', () => {
      setupWindowOpacityHandlers(mockWindow as any);

      // 最初は正常
      mockWindow.isDestroyed.mockReturnValue(false);
      eventHandlers['blur']();
      expect(mockWindow.isDestroyed).toHaveBeenCalled();
      expect(mockWindow.setOpacity).toHaveBeenCalledWith(WINDOW_OPACITY.inactive.default);

      // ウィンドウが破棄された後
      mockWindow.isDestroyed.mockReturnValue(true);
      eventHandlers['focus']();
      expect(mockWindow.isDestroyed).toHaveBeenCalledTimes(2);
      expect(mockWindow.setOpacity).toHaveBeenCalledTimes(1); // 前回の1回のみ
    });
  });
});
