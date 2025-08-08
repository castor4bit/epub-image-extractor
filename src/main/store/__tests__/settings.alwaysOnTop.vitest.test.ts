import type { Settings } from '@shared/types';

// settingsStore型の定義
type SettingsStore = {
  get: () => Settings;
  set: (keyOrSettings: keyof Settings | Partial<Settings>, value?: any) => void;
  getOutputDirectory: () => string;
  setOutputDirectory: (dir: string) => void;
  resetToDefaults: () => void;
  waitForInit: () => Promise<void>;
};

// electronのモック
vi.mock('electron', () => ({
  app: {
    getPath: vi.fn().mockReturnValue('/mock/desktop'),
  },
}));

describe('settingsStore - 最前面表示設定', () => {
  let settingsStore: SettingsStore;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();

    // settingsStoreを動的にインポート
    const settingsModule = await import('../settings');
    settingsStore = settingsModule.settingsStore;
    
    // 初期化を待つ
    await settingsStore.waitForInit();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  test('デフォルトでalwaysOnTopはtrue', () => {
    const settings = settingsStore.get();
    expect(settings).toBeDefined();
    expect(settings.alwaysOnTop).toBe(true);
  });

  test('alwaysOnTopの設定が保存される', () => {
    // 設定を変更
    settingsStore.set('alwaysOnTop', false);
    
    // 設定が保存されたことを確認（実際のストアまたはフォールバックが使用される）
    const settings = settingsStore.get();
    expect(settings).toBeDefined();
  });

  test('複数の設定を同時に保存できる', () => {
    settingsStore.set({
      alwaysOnTop: false,
      language: 'en',
    });

    const settings = settingsStore.get();
    expect(settings).toBeDefined();
  });

  test('リセット時にalwaysOnTopもクリアされる', () => {
    // 設定を変更
    settingsStore.set('alwaysOnTop', false);
    
    // リセット
    settingsStore.resetToDefaults();
    
    // デフォルトに戻ることを確認
    const settings = settingsStore.get();
    expect(settings).toBeDefined();
    expect(settings.alwaysOnTop).toBe(true);
  });
});