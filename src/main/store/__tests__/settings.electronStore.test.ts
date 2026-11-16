// @vitest-environment node
import fs from 'fs';
import os from 'os';
import path from 'path';

// Exercise the real electron-store instead of the global mock in
// tests/setup.vitest.ts, so API changes in electron-store/conf surface here.
vi.unmock('electron-store');

describe('settingsStore - 実際のelectron-store', () => {
  let cwd: string;

  beforeEach(() => {
    vi.resetModules();
    cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'epub-settings-store-'));
  });

  afterEach(() => {
    fs.rmSync(cwd, { recursive: true, force: true });
  });

  const createProxy = async () => {
    const { SettingsStoreProxy, createElectronStore } = await import('../settings');
    const store = new SettingsStoreProxy(() => createElectronStore({ cwd }));
    await store.waitForInit();
    return store;
  };

  test('get()がすべての設定を返す', async () => {
    const store = await createProxy();

    expect(store.get()).toMatchObject({
      language: 'ja',
      alwaysOnTop: true,
      includeOriginalFilename: true,
      includePageSpread: true,
      enableMouseHoverOpacity: true,
    });
  });

  test('保存した設定がファイルに永続化され、再読み込みで取得できる', async () => {
    const store = await createProxy();
    store.set('language', 'en');
    store.setAlwaysOnTop(false);

    const reloaded = await createProxy();

    expect(reloaded.get()).toMatchObject({ language: 'en', alwaysOnTop: false });
    expect(reloaded.getOutputDirectory()).toBe(store.getOutputDirectory());
  });

  test('resetToDefaults()でデフォルト値に戻る', async () => {
    const store = await createProxy();
    store.set('language', 'en');

    store.resetToDefaults();

    expect(store.get().language).toBe('ja');
  });
});
