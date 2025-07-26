import { BrowserWindow, ipcMain } from 'electron';
import { WINDOW_OPACITY } from '../constants/window';

// グローバルに保持するハンドラーのマップ
const windowHandlerMap = new WeakMap<
  BrowserWindow,
  {
    mouseEnterHandler?: () => void;
    mouseLeaveHandler?: () => void;
  }
>();

export function setupWindowOpacityHandlers(
  window: BrowserWindow,
  inactiveOpacity: number = WINDOW_OPACITY.inactive.default,
  enableMouseHover: boolean = true,
): void {
  let isMouseOver = false;

  // 既存のIPCハンドラーをクリーンアップ
  const existingHandlers = windowHandlerMap.get(window);
  if (existingHandlers) {
    if (existingHandlers.mouseEnterHandler) {
      ipcMain.removeListener('window:mouseenter', existingHandlers.mouseEnterHandler);
    }
    if (existingHandlers.mouseLeaveHandler) {
      ipcMain.removeListener('window:mouseleave', existingHandlers.mouseLeaveHandler);
    }
  }

  // ウィンドウの透明度制御
  const blurHandler = () => {
    if (!window.isDestroyed() && (!enableMouseHover || !isMouseOver)) {
      window.setOpacity(inactiveOpacity);
    }
  };

  const focusHandler = () => {
    if (!window.isDestroyed()) {
      window.setOpacity(WINDOW_OPACITY.active);
    }
  };

  window.on('blur', blurHandler);
  window.on('focus', focusHandler);

  // マウスオーバー時の透明度制御
  if (enableMouseHover) {
    // レンダラープロセスからのマウスイベントを処理
    const handleMouseEnter = () => {
      isMouseOver = true;
      if (!window.isDestroyed() && !window.isFocused()) {
        window.setOpacity(WINDOW_OPACITY.active);
      }
    };

    const handleMouseLeave = () => {
      isMouseOver = false;
      if (!window.isDestroyed() && !window.isFocused()) {
        window.setOpacity(inactiveOpacity);
      }
    };

    // IPCイベントハンドラーを登録
    ipcMain.on('window:mouseenter', handleMouseEnter);
    ipcMain.on('window:mouseleave', handleMouseLeave);

    // ハンドラーを保存
    windowHandlerMap.set(window, {
      mouseEnterHandler: handleMouseEnter,
      mouseLeaveHandler: handleMouseLeave,
    });

    // ウィンドウが破棄されたらイベントハンドラーを削除
    window.once('closed', () => {
      ipcMain.removeListener('window:mouseenter', handleMouseEnter);
      ipcMain.removeListener('window:mouseleave', handleMouseLeave);
      windowHandlerMap.delete(window);
    });
  } else {
    // マウスホバーが無効の場合は、ハンドラーを削除
    windowHandlerMap.set(window, {});
  }
}
