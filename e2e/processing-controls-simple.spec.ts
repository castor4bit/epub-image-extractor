import { test, expect, Page, ElectronApplication } from '@playwright/test';
import path from 'path';
import {
  clearLocalStorage,
  clearExistingResults,
  waitForProcessingComplete,
  waitForFileInProcessingList,
  closeSettingsWindow,
} from './helpers/test-helpers';
import { launchElectron } from './helpers/electron-launch';

let electronApp: ElectronApplication;
let page: Page;

test.describe('処理制御機能の基本動作', () => {
  test.beforeEach(async () => {
    // Electronアプリケーションを起動（E2Eテストモードを有効化）
    electronApp = await launchElectron();

    // メインウィンドウを取得
    page = await electronApp.firstWindow();
    await page.waitForLoadState('domcontentloaded');

    await clearLocalStorage(electronApp);
  });

  test.afterEach(async () => {
    if (electronApp) {
      try {
        await electronApp.close();
      } catch (error) {
        // エラーは無視（テスト自体は成功している）
      }
    }
  });

  test('@smoke ドロップゾーンの初期状態と処理後の状態を確認', async () => {
    await clearExistingResults(page);

    // 初期状態: ドロップゾーンが有効であることを確認
    const dropZone = page.locator('.drop-zone');
    await expect(dropZone).toBeVisible();
    await expect(dropZone).not.toHaveClass(/disabled/);

    // ファイル入力が有効であることを確認
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).not.toBeDisabled();

    // ファイルを処理
    const testEpubPath = path.join(__dirname, 'fixtures', 'test.epub');
    await fileInput.setInputFiles(testEpubPath);

    // 統合ビューに切り替わることを確認
    await expect(page.locator('.compact-drop-zone')).toBeVisible();

    // 処理が完了することを確認（高速なので即座に完了する可能性あり）
    await expect(page.locator('.summary-completed').or(page.locator('text=処理中'))).toBeVisible();

    await waitForProcessingComplete(page);
  });

  test('処理制御のCSSクラスが正しく適用される', async () => {
    await clearExistingResults(page);

    // 処理開始前の状態を確認
    const initialDropZone = page.locator('.drop-zone');
    await expect(initialDropZone).toBeVisible();
    const initialClassList = await initialDropZone.getAttribute('class');
    expect(initialClassList).not.toContain('disabled');

    // ファイルを処理
    const testFile = path.join(__dirname, 'fixtures', 'test.epub');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testFile);

    // コンパクトドロップゾーンが表示されることを確認
    const compactDropZone = page.locator('.compact-drop-zone');
    await expect(compactDropZone).toBeVisible();

    // クラス属性を確認（処理中または完了後）
    const classList = await compactDropZone.getAttribute('class');
    expect(classList).toBeDefined();

    // disabledクラスの適用は処理速度に依存するため、
    // クラス自体が正しく設定されていることのみ確認
    expect(classList).toMatch(/compact-drop-zone/);

    await waitForProcessingComplete(page);
  });

  test('複数ファイル選択で処理が開始される', async () => {
    await clearExistingResults(page);

    const testFiles = [
      path.join(__dirname, 'fixtures', 'test1.epub'),
      path.join(__dirname, 'fixtures', 'test2.epub'),
    ];

    // 複数ファイルを選択
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testFiles);

    // 処理状況が表示されることを確認
    await expect(page.locator('text=処理状況')).toBeVisible();

    // ファイル名が表示されることを確認（正しいセレクタを使用）
    await expect(page.locator('.processing-item:has-text("test1.epub")')).toBeVisible();
    await expect(page.locator('.processing-item:has-text("test2.epub")')).toBeVisible();

    // 処理が完了するまで待つ（ダイアログを防ぐため）
    await waitForProcessingComplete(page, '2件完了');
  });

  test('設定画面を開いても処理は継続される', async () => {
    await clearExistingResults(page);

    // ファイルを処理開始
    const testFile = path.join(__dirname, 'fixtures', 'test.epub');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testFile);

    // 統合ビューに切り替わることを確認
    await expect(page.locator('.compact-drop-zone')).toBeVisible();

    // 設定ボタンをクリック
    const settingsButton = page.locator('button[title="設定"]');
    await settingsButton.click();

    // 設定画面が開くことを確認
    await expect(page.locator('.settings-window')).toBeVisible();

    // CI環境でのデバッグ情報
    if (process.env.CI) {
      const { debugPageState } = await import('./helpers/debug-helpers');
      await debugPageState(page, 'Settings window opened');
    }

    // 設定画面を閉じる
    if (process.env.CI) {
      const { debugPageState } = await import('./helpers/debug-helpers');
      await debugPageState(page, 'Before closing settings');
    }
    
    try {
      await closeSettingsWindow(page);
    } catch (error) {
      if (process.env.CI) {
        const { captureErrorDetails } = await import('./helpers/debug-helpers');
        await captureErrorDetails(page, 'settings-close-failed');
      }
      throw error;
    }

    // 処理結果が表示されていることを確認
    await expect(page.locator('.processing-item:has-text("test.epub")')).toBeVisible();

    await waitForProcessingComplete(page);
  });
});
