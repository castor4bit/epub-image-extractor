import Store from 'electron-store';
import { app } from 'electron';
import path from 'path';
import os from 'os';
import { isE2ETestMode } from '../utils/testMode';
import { WINDOW_OPACITY } from '../constants/window';

interface Settings {
  outputDirectory: string;
  language: string;
  alwaysOnTop: boolean;
  includeOriginalFilename: boolean; // 元のファイル名を含めるか
  includePageSpread: boolean; // 左右情報を含めるか
  inactiveOpacity?: number; // ウィンドウ非アクティブ時の透明度（0.1～1.0）
  enableMouseHoverOpacity?: boolean; // マウスオーバー時に透明度を戻すかどうか
  windowBounds?: {
    // ウィンドウのサイズと位置
    width: number;
    height: number;
    x?: number;
    y?: number;
  };
}

// E2Eテストモードでは一時ディレクトリを使用
const getDefaultOutputDirectory = (): string => {
  if (isE2ETestMode()) {
    return path.join(os.tmpdir(), 'epub-extractor-e2e', 'EPUB_Images');
  }
  return path.join(app.getPath('desktop'), 'EPUB_Images');
};

const defaults: Settings = {
  outputDirectory: getDefaultOutputDirectory(),
  language: 'ja',
  alwaysOnTop: true,
  includeOriginalFilename: true,
  includePageSpread: true,
  inactiveOpacity: WINDOW_OPACITY.inactive.default,
  enableMouseHoverOpacity: true,
};

// electron-storeインスタンスを作成
const store = new Store<Settings>({
  defaults,
  name: 'epub-extractor-settings',
  // ファイル権限を制限（所有者のみ読み書き可能）
  fileExtension: 'json',
  clearInvalidConfig: true,
  accessPropertiesByDotNotation: false,
});

export const settingsStore = {
  get: (): Settings => {
    // E2Eテストモードでは常にデフォルト値を返す
    if (isE2ETestMode()) {
      return {
        ...defaults,
        outputDirectory: getDefaultOutputDirectory(), // 最新のデフォルト値を使用
      };
    }
    return {
      outputDirectory: store.get('outputDirectory'),
      language: store.get('language'),
      alwaysOnTop: store.get('alwaysOnTop'),
      includeOriginalFilename: store.get('includeOriginalFilename'),
      includePageSpread: store.get('includePageSpread'),
      inactiveOpacity: store.get('inactiveOpacity'),
      enableMouseHoverOpacity: store.get('enableMouseHoverOpacity'),
      windowBounds: store.get('windowBounds'),
    };
  },

  set: (settings: Partial<Settings>): void => {
    Object.entries(settings).forEach(([key, value]) => {
      if (value !== undefined) {
        store.set(key as keyof Settings, value);
      }
    });
  },

  getOutputDirectory: (): string => {
    // E2Eテストモードでは常に一時ディレクトリを返す
    if (isE2ETestMode()) {
      return getDefaultOutputDirectory();
    }
    return store.get('outputDirectory');
  },

  setOutputDirectory: (dir: string): void => {
    store.set('outputDirectory', dir);
  },

  resetToDefaults: (): void => {
    store.clear();
  },

  getWindowBounds: () => {
    return store.get('windowBounds');
  },

  setWindowBounds: (bounds: Settings['windowBounds']) => {
    if (bounds === undefined) {
      // windowBoundsを削除（デフォルト値に戻す）
      store.delete('windowBounds');
    } else {
      store.set('windowBounds', bounds);
    }
  },
};
