import { BrowserWindow } from 'electron';
import { WINDOW_OPACITY } from '../constants/window';

export function setupWindowOpacityHandlers(
  window: BrowserWindow,
  inactiveOpacity: number = WINDOW_OPACITY.inactive.default,
): void {
  // ウィンドウの透明度制御
  window.on('blur', () => {
    if (!window.isDestroyed()) {
      window.setOpacity(inactiveOpacity);
    }
  });

  window.on('focus', () => {
    if (!window.isDestroyed()) {
      window.setOpacity(WINDOW_OPACITY.active);
    }
  });
}
