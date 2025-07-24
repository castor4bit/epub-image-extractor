import { BrowserWindow, dialog, MessageBoxSyncOptions } from 'electron';

/**
 * E2Eテスト用のヘルパー関数をセットアップする
 * @param mainWindow アプリケーションのメインウィンドウ
 * @param getProcessingState 処理中状態を取得する関数
 */
export function setupE2ETestHelpers(
  mainWindow: BrowserWindow | null,
  getProcessingState: () => boolean,
): void {
  (global as Record<string, unknown>).testHelpers = {
    /**
     * アプリケーション終了時のダイアログをシミュレート
     */
    triggerClose: () => {
      // ダイアログ情報を保存するための変数
      let dialogOptions: MessageBoxSyncOptions | null = null;

      // dialog.showMessageBoxSyncをモック
      const originalShowMessageBoxSync = dialog.showMessageBoxSync;
      (dialog as unknown as Record<string, unknown>).showMessageBoxSync = function (
        ...args: unknown[]
      ) {
        // 引数が1つの場合と2つの場合の両方に対応
        dialogOptions =
          args.length === 1
            ? (args[0] as MessageBoxSyncOptions)
            : (args[1] as MessageBoxSyncOptions);
        // キャンセルを選択（1）
        return 1;
      };

      // closeイベントを発火
      if (mainWindow && !mainWindow.isDestroyed()) {
        const event = { preventDefault: () => {} };
        mainWindow.emit('close', event);
      }

      // モックを元に戻す
      dialog.showMessageBoxSync = originalShowMessageBoxSync;

      return {
        dialogShown: dialogOptions !== null,
        dialogOptions: dialogOptions,
        isProcessing: getProcessingState(),
      };
    },

    /**
     * 現在の処理状態を取得
     */
    getProcessingState: getProcessingState,

    /**
     * localStorageをクリア
     */
    clearLocalStorage: async () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        await mainWindow.webContents.executeJavaScript('localStorage.clear()');
        return { success: true };
      }
      return { success: false, error: 'Window not available' };
    },
  };
}

/**
 * 処理中フラグをグローバルに設定（E2Eテスト用）
 * @param processing 処理中かどうか
 */
export function setGlobalProcessingState(processing: boolean): void {
  (global as Record<string, unknown>).isProcessing = processing;
}
