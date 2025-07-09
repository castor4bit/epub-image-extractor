import { app, BrowserWindow } from 'electron';
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
  // 以前のサイズ（1200x800）に対して、幅50%、高さ70%に設定
  const windowWidth = 600; // 1200 * 0.5
  const windowHeight = 560; // 800 * 0.7

  // 設定から最前面表示を取得
  const settings = settingsStore.get();

  mainWindow = new BrowserWindow({
    title: 'EPUB Image Extractor',
    width: windowWidth,
    height: windowHeight,
    alwaysOnTop: settings.alwaysOnTop,
    icon: process.platform === 'darwin' 
      ? undefined  // macOSではアプリケーションバンドルのアイコンを使用
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

  // IPCハンドラーを登録
  registerIpcHandlers(mainWindow);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  // macOSでもウィンドウを閉じたらアプリケーションを終了する
  app.quit();
});
