import { BrowserWindow } from 'electron';

export function setupWindowOpacityHandlers(
  window: BrowserWindow,
  inactiveOpacity: number = 0.8,
): void {
  // ウィンドウの透明度制御
  window.on('blur', () => {
    if (!window.isDestroyed()) {
      window.setOpacity(inactiveOpacity);
    }
  });

  window.on('focus', () => {
    if (!window.isDestroyed()) {
      window.setOpacity(1.0);
    }
  });
}
