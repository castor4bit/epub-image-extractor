// settingsStore型の定義
type SettingsStore = {
  get: () => any;
  set: (settings: any) => void;
  getOutputDirectory: () => string;
  setOutputDirectory: (dir: string) => void;
  resetToDefaults: () => void;
};

// electron-storeのモック
jest.mock('electron-store');

// electronのモック
jest.mock('electron', () => ({
  app: {
    getPath: jest.fn().mockReturnValue('/mock/desktop'),
  },
}));

describe('settingsStore - 最前面表示設定', () => {
  let mockStoreInstance: any;
  let settingsStore: SettingsStore;

  beforeEach(async () => {
    jest.resetModules();
    jest.clearAllMocks();

    // モックインスタンスの作成
    mockStoreInstance = {
      get: jest.fn(),
      set: jest.fn(),
      clear: jest.fn(),
    };

    // electron-storeモックの設定
    jest.doMock('electron-store', () => {
      return jest.fn().mockImplementation(() => mockStoreInstance);
    });

    // settingsStoreを動的にインポート
    const settingsModule = await import('../settings');
    settingsStore = settingsModule.settingsStore;
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  test('デフォルトでalwaysOnTopはtrue', () => {
    // get()メソッドがキーごとに値を返すようにモック
    mockStoreInstance.get.mockImplementation((key: string) => {
      const defaults: Record<string, any> = {
        outputDirectory: '/mock/desktop/EPUB_Images',
        language: 'ja',
        alwaysOnTop: true,
        includeOriginalFilename: true,
        includePageSpread: true,
      };
      return defaults[key];
    });

    const settings = settingsStore.get();
    expect(settings.alwaysOnTop).toBe(true);
  });

  test('alwaysOnTopの設定が保存される', () => {
    settingsStore.set({ alwaysOnTop: false });

    expect(mockStoreInstance.set).toHaveBeenCalledWith('alwaysOnTop', false);
  });

  test('複数の設定を同時に保存できる', () => {
    settingsStore.set({
      outputDirectory: '/new/path',
      alwaysOnTop: true,
    });

    expect(mockStoreInstance.set).toHaveBeenCalledWith('outputDirectory', '/new/path');
    expect(mockStoreInstance.set).toHaveBeenCalledWith('alwaysOnTop', true);
  });

  test('リセット時にalwaysOnTopもクリアされる', () => {
    settingsStore.resetToDefaults();

    expect(mockStoreInstance.clear).toHaveBeenCalled();
  });
});
