import Store from 'electron-store';
import { app } from 'electron';
import path from 'path';

interface Settings {
  outputDirectory: string;
  language: string;
}

const defaults: Settings = {
  outputDirectory: path.join(app.getPath('desktop'), 'EPUB_Images'),
  language: 'ja'
};

// electron-storeインスタンスを作成
const store = new Store<Settings>({
  defaults,
  name: 'epub-extractor-settings',
  // ファイル権限を制限（所有者のみ読み書き可能）
  fileExtension: 'json',
  clearInvalidConfig: true,
  accessPropertiesByDotNotation: false
});

export const settingsStore = {
  get: (): Settings => {
    return {
      outputDirectory: store.get('outputDirectory'),
      language: store.get('language')
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
  }
};