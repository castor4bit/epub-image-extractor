import { BrowserWindow } from 'electron';
import { WINDOW_OPACITY } from '../constants/window';

export function setupWindowOpacityHandlers(
  window: BrowserWindow,
  inactiveOpacity: number = WINDOW_OPACITY.inactive.default,
  enableMouseHover: boolean = true,
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

  // マウスオーバー時の透明度制御
  // TODO: 将来的な実装として、レンダラープロセスからのIPCイベントを使用して
  // マウスホバーを検出し、透明度を制御する機能を追加予定
  // 現在は設定UIのみ実装し、実際の機能は保留
  if (enableMouseHover) {
    // 将来の実装のためのプレースホルダー
  }
}
