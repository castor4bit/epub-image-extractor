import { settingsStore } from '../settings';
import Store from 'electron-store';

// electron-storeのモック
jest.mock('electron-store');
const MockedStore = Store as jest.MockedClass<typeof Store>;

// electronのモック
jest.mock('electron', () => ({
  app: {
    getPath: jest.fn().mockReturnValue('/mock/desktop'),
  },
}));

describe('settingsStore - 最前面表示設定', () => {
  let mockStoreInstance: any;

  beforeEach(() => {
    mockStoreInstance = {
      get: jest.fn(),
      set: jest.fn(),
      clear: jest.fn(),
    };
    MockedStore.mockImplementation(() => mockStoreInstance);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('デフォルトでalwaysOnTopはtrue', () => {
    mockStoreInstance.get.mockImplementation((key: string) => {
      const defaults = {
        outputDirectory: '/mock/desktop/EPUB_Images',
        language: 'ja',
        alwaysOnTop: true,
      };
      return defaults[key as keyof typeof defaults];
    });

    const settings = settingsStore.get();
    expect(settings.alwaysOnTop).toBe(true);
  });

  test('alwaysOnTopの設定が保存される', () => {
    settingsStore.set({ alwaysOnTop: true });

    expect(mockStoreInstance.set).toHaveBeenCalledWith('alwaysOnTop', true);
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
