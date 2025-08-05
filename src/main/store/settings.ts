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
  try {
    return path.join(app.getPath('desktop'), 'EPUB_Images');
  } catch {
    // appが初期化されていない場合（テスト環境など）
    return path.join(os.homedir(), 'Desktop', 'EPUB_Images');
  }
};

// electron-store用の型定義
interface StoreOptions {
  defaults: Settings;
}

// 動的インポートのキャッシュ
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let storeInstance: any = null;
let storeInitialized = false;

// In-memoryストアを作成する関数
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createInMemoryStore(): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inMemoryStore: Record<string, any> = {
    outputDirectory: getDefaultOutputDirectory(),
    language: 'ja',
    alwaysOnTop: true,
    includeOriginalFilename: true,
    includePageSpread: true,
    inactiveOpacity: WINDOW_OPACITY.inactive.default,
    enableMouseHoverOpacity: true,
  };

  const store = {
    get: (key?: string) => {
      if (!key) return inMemoryStore;
      return inMemoryStore[key];
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    set: (key: string, value: any) => {
      inMemoryStore[key] = value;
    },
    clear: () => {
      // デフォルト値にリセット
      inMemoryStore.outputDirectory = getDefaultOutputDirectory();
      inMemoryStore.language = 'ja';
      inMemoryStore.alwaysOnTop = true;
      inMemoryStore.includeOriginalFilename = true;
      inMemoryStore.includePageSpread = true;
      inMemoryStore.inactiveOpacity = WINDOW_OPACITY.inactive.default;
      inMemoryStore.enableMouseHoverOpacity = true;
    },
  };

  storeInstance = store;
  storeInitialized = true;
  return store;
}

// electron-storeを動的にインポートする関数
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getStore(): Promise<any> {
  if (storeInitialized && storeInstance) {
    return storeInstance;
  }

  // Jestテスト環境では動的インポートをスキップ
  if (process.env.NODE_ENV === 'test' && typeof jest !== 'undefined') {
    return createInMemoryStore();
  }

  try {
    // electron-store v10はESMモジュールなので動的インポート
    const { default: Store } = await import('electron-store');
    
    const schema = {
      outputDirectory: {
        type: 'string' as const,
      },
      language: {
        type: 'string' as const,
        default: 'ja',
      },
      alwaysOnTop: {
        type: 'boolean' as const,
        default: true,
      },
      includeOriginalFilename: {
        type: 'boolean' as const,
        default: true,
      },
      includePageSpread: {
        type: 'boolean' as const,
        default: true,
      },
      inactiveOpacity: {
        type: 'number' as const,
        minimum: 0.1,
        maximum: 1.0,
        default: WINDOW_OPACITY.inactive.default,
      },
      enableMouseHoverOpacity: {
        type: 'boolean' as const,
        default: true,
      },
      windowBounds: {
        type: 'object' as const,
        properties: {
          width: { type: 'number' as const },
          height: { type: 'number' as const },
          x: { type: 'number' as const },
          y: { type: 'number' as const },
        },
      },
    };

    storeInstance = new Store<Settings>({
      defaults: {
        outputDirectory: getDefaultOutputDirectory(),
        language: 'ja',
        alwaysOnTop: true,
        includeOriginalFilename: true,
        includePageSpread: true,
        inactiveOpacity: WINDOW_OPACITY.inactive.default,
        enableMouseHoverOpacity: true,
      },
      schema,
    } as StoreOptions);

    storeInitialized = true;
    return storeInstance;
  } catch {
    // フォールバック: electron-storeが使えない場合（テスト環境など）
    console.warn('electron-store is not available, using in-memory store');
    return createInMemoryStore();
  }
}

// 同期的なインターフェースを提供するためのプロキシ
class SettingsStoreProxy {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private storePromise: Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private cachedStore: any = null;

  constructor() {
    // 初期化時に非同期でストアを取得
    this.storePromise = getStore().then(store => {
      this.cachedStore = store;
      return store;
    });
  }

  get(): Settings {
    if (this.cachedStore) {
      return this.cachedStore.get();
    }
    // ストアがまだ初期化されていない場合はデフォルト値を返す
    return {
      outputDirectory: getDefaultOutputDirectory(),
      language: 'ja',
      alwaysOnTop: true,
      includeOriginalFilename: true,
      includePageSpread: true,
      inactiveOpacity: WINDOW_OPACITY.inactive.default,
      enableMouseHoverOpacity: true,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  set(keyOrSettings: keyof Settings | Partial<Settings>, value?: any): void {
    // オーバーロード: 単一のキー・値、または設定オブジェクト全体を受け取る
    if (typeof keyOrSettings === 'string') {
      // 単一のキーと値の場合
      if (this.cachedStore) {
        this.cachedStore.set(keyOrSettings, value);
      } else {
        // ストアが初期化されるまで待つ
        this.storePromise.then(store => {
          store.set(keyOrSettings, value);
        });
      }
    } else {
      // 設定オブジェクトの場合（後方互換性のため）
      this.update(keyOrSettings);
    }
  }

  update(settings: Partial<Settings>): void {
    Object.entries(settings).forEach(([key, value]) => {
      this.set(key as keyof Settings, value);
    });
  }

  getOutputDirectory(): string {
    const settings = this.get();
    return settings?.outputDirectory ?? getDefaultOutputDirectory();
  }

  setOutputDirectory(directory: string): void {
    this.set('outputDirectory', directory);
  }

  setLanguage(language: string): void {
    this.set('language', language);
  }

  setAlwaysOnTop(alwaysOnTop: boolean): void {
    this.set('alwaysOnTop', alwaysOnTop);
  }

  setWindowBounds(bounds: Settings['windowBounds']): void {
    this.set('windowBounds', bounds);
  }

  setInactiveOpacity(opacity: number): void {
    this.set('inactiveOpacity', opacity);
  }

  setEnableMouseHoverOpacity(enable: boolean): void {
    this.set('enableMouseHoverOpacity', enable);
  }

  setIncludeOriginalFilename(include: boolean): void {
    this.set('includeOriginalFilename', include);
  }

  setIncludePageSpread(include: boolean): void {
    this.set('includePageSpread', include);
  }

  clear(): void {
    if (this.cachedStore) {
      this.cachedStore.clear();
    } else {
      this.storePromise.then(store => {
        store.clear();
      });
    }
  }

  resetToDefaults(): void {
    // clearと同じ動作（electron-storeではclearするとデフォルトに戻る）
    this.clear();
  }

  // ストアの初期化を待つ
  async waitForInit(): Promise<void> {
    await this.storePromise;
  }
}

export const settingsStore = new SettingsStoreProxy();

export type { Settings, SettingsStoreProxy as SettingsStore };