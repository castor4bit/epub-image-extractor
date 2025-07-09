import { app, BrowserWindow } from 'electron';
import { join } from 'path';
import { registerIpcHandlers } from './ipc/handlers';
import { settingsStore } from './store/settings';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  // 以前のサイズ（1200x800）に対して、幅50%、高さ70%に設定
  const windowWidth = 600; // 1200 * 0.5
  const windowHeight = 560; // 800 * 0.7

  // 設定から最前面表示を取得
  const settings = settingsStore.get();

  mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    alwaysOnTop: settings.alwaysOnTop,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, '../preload/index.js'),
    },
    // icon: join(__dirname, '../../public/icon.png'),
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
