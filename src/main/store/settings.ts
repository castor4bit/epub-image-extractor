import Store from 'electron-store';
import { app } from 'electron';
import path from 'path';

interface Settings {
  outputDirectory: string;
  language: string;
  alwaysOnTop: boolean;
  includeOriginalFilename: boolean; // 元のファイル名を含めるか
  includePageSpread: boolean; // 左右情報を含めるか
  windowBounds?: {
    // ウィンドウのサイズと位置
    width: number;
    height: number;
    x?: number;
    y?: number;
  };
}

const defaults: Settings = {
  outputDirectory: path.join(app.getPath('desktop'), 'EPUB_Images'),
  language: 'ja',
  alwaysOnTop: true,
  includeOriginalFilename: true,
  includePageSpread: true,
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
    return {
      outputDirectory: store.get('outputDirectory'),
      language: store.get('language'),
      alwaysOnTop: store.get('alwaysOnTop'),
      includeOriginalFilename: store.get('includeOriginalFilename'),
      includePageSpread: store.get('includePageSpread'),
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
