import { app, BrowserWindow, Menu, MenuItemConstructorOptions } from 'electron';
import { join } from 'path';
import { registerIpcHandlers } from './ipc/handlers';
import { settingsStore } from './store/settings';

let mainWindow: BrowserWindow | null = null;

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
    // アイコンファイルが存在しない場合は無視
  }
}

function createWindow() {
  // デフォルトサイズ
  const defaultWidth = 600;
  const defaultHeight = 560;

  // 設定から最前面表示とウィンドウサイズを取得
  const settings = settingsStore.get();
  const savedBounds = settings.windowBounds;

  mainWindow = new BrowserWindow({
    title: 'EPUB Image Extractor',
    width: savedBounds?.width || defaultWidth,
    height: savedBounds?.height || defaultHeight,
    x: savedBounds?.x,
    y: savedBounds?.y,
    minWidth: 500, // 最小幅
    minHeight: 400, // 最小高さ
    resizable: true, // リサイズ可能に設定
    alwaysOnTop: settings.alwaysOnTop,
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

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // ウィンドウサイズと位置の変更を保存
  let saveTimer: ReturnType<typeof setTimeout> | null = null;
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

app.on('window-all-closed', () => {
  // macOSでもウィンドウを閉じたらアプリケーションを終了する
  app.quit();
});
