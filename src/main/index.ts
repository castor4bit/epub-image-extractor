import { app, BrowserWindow, Menu, MenuItemConstructorOptions, dialog, ipcMain } from 'electron';
import { join } from 'path';
import { registerIpcHandlers } from './ipc/handlers';
import { settingsStore } from './store/settings';
import { WINDOW_SIZES } from './constants/window';
import { getTranslation } from './i18n/translations';
import { LanguageCode } from '../shared/constants/languages';
import { isE2ETestMode } from './utils/testMode';
import { setupE2ETestHelpers, setGlobalProcessingState } from './test-helpers/e2e-helpers';

let mainWindow: BrowserWindow | null = null;
let saveTimer: ReturnType<typeof setTimeout> | null = null;

// CI環境でのサンドボックス対応
if (process.env.CI && process.platform === 'linux') {
  app.commandLine.appendSwitch('no-sandbox');
  app.commandLine.appendSwitch('disable-setuid-sandbox');
  app.commandLine.appendSwitch('disable-dev-shm-usage');
  app.commandLine.appendSwitch('disable-gpu');
  app.commandLine.appendSwitch('disable-software-rasterizer');
  app.commandLine.appendSwitch('disable-features=TranslateUI');
  console.log('[Main] CI Linux environment detected, sandbox disabled');
}

// アプリケーション名を設定
// メニューバーには英語、アプリ内は日本語を使用
app.name = 'EPUB Image Extractor';

// macOSの場合、Dockとメニューバーに正しい名前を表示
if (process.platform === 'darwin' && app.dock) {
  // 開発環境でも正しい名前を表示するための設定
  try {
    // アイコンが存在する場合のみ設定
    const iconPath = join(__dirname, '../../public/icon.png');
    app.dock.setIcon(iconPath);
  } catch {
    // アイコン設定に失敗しても動作に影響ないため、エラーは無視
  }
}

function createWindow() {
  // 設定から最前面表示とウィンドウサイズを取得
  const settings = settingsStore.get();
  const savedBounds = settings.windowBounds;

  mainWindow = new BrowserWindow({
    title: 'EPUB Image Extractor',
    width: savedBounds?.width || WINDOW_SIZES.default.width,
    height: savedBounds?.height || WINDOW_SIZES.default.height,
    x: savedBounds?.x,
    y: savedBounds?.y,
    minWidth: WINDOW_SIZES.minimum.width,
    minHeight: WINDOW_SIZES.minimum.height,
    resizable: true, // リサイズ可能に設定
    alwaysOnTop: settings.alwaysOnTop,
    // CI環境では非表示で起動
    show: !(process.env.CI && process.platform === 'linux'),
    icon:
      process.platform === 'darwin'
        ? undefined // macOSではアプリケーションバンドルのアイコンを使用
        : join(__dirname, '../../build/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, '../preload/index.js'),
    },
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, '../../dist/index.html'));
  }

  // 処理状態を保持する変数
  let isProcessing = false;

  // 処理状態の更新を受信
  ipcMain.on('app:updateProcessingState', (_event, processing: boolean) => {
    isProcessing = processing;
    // E2Eテスト用にグローバル状態を更新
    if (isE2ETestMode()) {
      setGlobalProcessingState(processing);
    }
  });

  // 終了確認ダイアログ
  mainWindow.on('close', (event) => {
    if (isProcessing) {
      event.preventDefault();

      const settings = settingsStore.get();
      const lang = (settings.language || 'ja') as LanguageCode;
      const t = getTranslation(lang);

      const choice = dialog.showMessageBoxSync(mainWindow!, {
        type: 'question',
        buttons: [t.exitDialog.buttons.quit, t.exitDialog.buttons.cancel],
        defaultId: 1,
        title: t.exitDialog.title,
        message: t.exitDialog.message,
        detail: t.exitDialog.detail,
      });

      if (choice === 0) {
        // 終了を選択
        mainWindow?.destroy();
      }
    }
  });

  mainWindow.on('closed', () => {
    // タイマーをクリア
    if (saveTimer) {
      clearTimeout(saveTimer);
      saveTimer = null;
    }
    mainWindow = null;
  });

  // E2Eテスト用のヘルパーを設定
  if (isE2ETestMode()) {
    setupE2ETestHelpers(mainWindow, () => isProcessing);
  }

  // ウィンドウサイズと位置の変更を保存
  const saveBounds = () => {
    if (!mainWindow) return;

    const bounds = mainWindow.getBounds();
    settingsStore.setWindowBounds(bounds);
  };

  // リサイズやムーブが終わったら保存（デバウンス処理）
  const debouncedSave = () => {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(saveBounds, 500);
  };

  mainWindow.on('resize', debouncedSave);
  mainWindow.on('move', debouncedSave);

  // IPCハンドラーを登録
  registerIpcHandlers(mainWindow);
}

app.whenReady().then(() => {
  // カスタムメニューを設定（デフォルトのAboutダイアログを無効化）
  if (process.platform === 'darwin') {
    // macOS用のメニュー
    const template: MenuItemConstructorOptions[] = [
      {
        label: app.getName(),
        submenu: [
          { role: 'hide' },
          { role: 'hideOthers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit' },
        ],
      },
      {
        label: 'Window',
        submenu: [{ role: 'close' }, { role: 'minimize' }],
      },
    ];
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  } else {
    // Windows用のメニュー
    const template: MenuItemConstructorOptions[] = [
      {
        label: 'File',
        submenu: [{ role: 'quit' }],
      },
    ];
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  }

  createWindow();
});

app.on('before-quit', () => {
  // アプリケーション終了前にタイマーをクリア
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
});

app.on('window-all-closed', () => {
  // タイマーをクリア
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  // macOSでもウィンドウを閉じたらアプリケーションを終了する
  app.quit();
});
