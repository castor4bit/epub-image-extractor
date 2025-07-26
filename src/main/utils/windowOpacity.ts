import { BrowserWindow, ipcMain } from 'electron';
import { WINDOW_OPACITY } from '../constants/window';

export function setupWindowOpacityHandlers(
  window: BrowserWindow,
  inactiveOpacity: number = WINDOW_OPACITY.inactive.default,
  enableMouseHover: boolean = true,
): void {
  let isMouseOver = false;

  // ウィンドウの透明度制御
  window.on('blur', () => {
    if (!window.isDestroyed() && (!enableMouseHover || !isMouseOver)) {
      window.setOpacity(inactiveOpacity);
    }
  });

  window.on('focus', () => {
    if (!window.isDestroyed()) {
      window.setOpacity(WINDOW_OPACITY.active);
    }
  });

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

    // ウィンドウが破棄されたらイベントハンドラーを削除
    window.on('closed', () => {
      ipcMain.removeListener('window:mouseenter', handleMouseEnter);
      ipcMain.removeListener('window:mouseleave', handleMouseLeave);
    });
  }
}
