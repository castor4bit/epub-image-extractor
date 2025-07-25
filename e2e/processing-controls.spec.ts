import { test, expect, Page, ElectronApplication } from '@playwright/test';
import path from 'path';
import fs from 'fs/promises';
import {
  clearLocalStorage,
  clearExistingResults,
  waitForProcessingComplete,
  waitForFileInProcessingList,
} from './helpers/test-helpers';
import { launchElectron, closeElectron } from './helpers/electron-launch';

let electronApp: ElectronApplication;
let page: Page;

test.describe('処理制御機能E2Eテスト', () => {
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
      await closeElectron(electronApp, true);
      electronApp = null;
      page = null;
    }
  });

  test('処理中にアプリを終了しようとすると確認ダイアログが表示される', async () => {
    await clearExistingResults(page);

    const testEpubPath = path.join(__dirname, 'fixtures', 'test.epub');

    // ファイルを処理開始
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testEpubPath);

    // 処理が開始されることを確認
    await expect(page.locator('.processing-item.processing').first()).toBeVisible();

    // 処理中の状態を確認してからcloseイベントをトリガー
    const result = await electronApp.evaluate(() => {
      const helpers = (global as any).testHelpers;
      if (!helpers) {
        throw new Error('Test helpers not available. Make sure E2E_TEST_MODE is set.');
      }

      // 処理中であることを確認
      const processingState = helpers.getProcessingState();
      if (!processingState) {
        throw new Error('Expected to be processing, but was not');
      }

      // closeイベントをトリガー
      const closeResult = helpers.triggerClose();
      return {
        ...closeResult,
        wasProcessingBeforeClose: processingState,
      };
    });

    // ダイアログが表示されたことを確認（処理中なので必ず表示されるはず）
    expect(result.dialogShown).toBe(true);
    expect(result.dialogOptions).toBeDefined();
    expect(result.dialogOptions.title).toBe('処理中のファイルがあります');
    expect(result.dialogOptions.message).toBe('処理中のファイルがあります');
    expect(result.dialogOptions.detail).toBe('処理を中断して終了してもよろしいですか？');
    expect(result.dialogOptions.buttons).toEqual(['終了', 'キャンセル']);

    // アプリがまだ開いていることを確認（キャンセルを選択したため）
    await expect(page).toBeDefined();

    // 処理が完了するまで待つ（ダイアログを防ぐため）
    await waitForProcessingComplete(page);
  });

  test('処理完了後はダイアログなしで終了できる', async () => {
    await clearExistingResults(page);

    const testEpubPath = path.join(__dirname, 'fixtures', 'test.epub');

    // ファイルを処理
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testEpubPath);

    // 処理が完了するまで待つ
    await waitForProcessingComplete(page);

    // 処理完了後にcloseイベントをトリガー
    const result = await electronApp.evaluate(() => {
      const helpers = (global as any).testHelpers;
      if (!helpers) {
        throw new Error('Test helpers not available. Make sure E2E_TEST_MODE is set.');
      }

      // 処理中でないことを確認
      const processingState = helpers.getProcessingState();
      if (processingState) {
        throw new Error('Expected not to be processing, but was still processing');
      }

      // closeイベントをトリガー
      const closeResult = helpers.triggerClose();
      return {
        ...closeResult,
        wasProcessingBeforeClose: processingState,
      };
    });

    // ダイアログが表示されないことを確認（処理中ではないため）
    expect(result.dialogShown).toBe(false);
    expect(result.dialogOptions).toBeNull();
  });

  test('処理完了後は通常通りドロップを受け付ける', async () => {
    await clearExistingResults(page);

    const testFile1 = path.join(__dirname, 'fixtures', 'test1.epub');
    const testFile2 = path.join(__dirname, 'fixtures', 'test2.epub');

    // 最初のファイルを処理
    const fileInput1 = page.locator('input[type="file"]');
    await fileInput1.setInputFiles(testFile1);

    // 1つ目のファイルの処理が完了するまで待つ
    await waitForProcessingComplete(page, '1件完了');

    // コンパクトドロップゾーンが有効であることを確認
    const compactDropZone = page.locator('.compact-drop-zone');
    await expect(compactDropZone).not.toHaveClass(/disabled/);

    // 2つ目のファイルを正常にドロップできることを確認
    const fileInput2 = page.locator('.compact-drop-zone input[type="file"]');
    await fileInput2.setInputFiles(testFile2);

    // 2つ目のファイルが処理リストに追加されることを確認
    await expect(page.locator('text=test2.epub')).toBeVisible();

    // 2つ目のファイルの処理も完了するまで待つ（ダイアログを防ぐため）
    await waitForProcessingComplete(page, '2件完了');
  });

  test('処理中の視覚的フィードバックが正しく表示される', async () => {
    await clearExistingResults(page);

    const testEpubPath = path.join(__dirname, 'fixtures', 'test.epub');

    // 初期状態の確認
    const dropZone = page.locator('.drop-zone');
    await expect(dropZone).toBeVisible();
    await expect(dropZone).not.toHaveClass(/disabled/);

    // ファイルを処理開始
    const fileInputVis = page.locator('input[type="file"]');
    await fileInputVis.setInputFiles(testEpubPath);

    // 処理中の視覚的状態を確認（処理開始直後）
    const compactDropZone = page.locator('.compact-drop-zone');
    await expect(compactDropZone).toBeVisible();

    await expect(compactDropZone).toHaveClass(/disabled/, { timeout: 1000 });

    // disabled状態でのスタイルを確認
    const capturedOpacity = await compactDropZone.evaluate(
      (el) => window.getComputedStyle(el).opacity,
    );
    const capturedCursor = await compactDropZone.evaluate(
      (el) => window.getComputedStyle(el).cursor,
    );

    // CSSファイルでは opacity: 0.5 が設定されている
    expect(parseFloat(capturedOpacity)).toBe(0.5);
    expect(capturedCursor).toBe('not-allowed');

    // 処理完了後は通常の表示に戻ることを確認
    await waitForProcessingComplete(page);

    await expect(compactDropZone).not.toHaveClass(/disabled/);

    // CSSトランジションが完了するまで待機（transition: all var(--transition-base)）
    await page.waitForTimeout(500);

    // 通常状態に戻っていることを確認（disabledクラスが外れたらopacity: 1になる）
    const finalState = await compactDropZone.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        opacity: styles.opacity,
        cursor: styles.cursor,
        hasDisabledClass: el.classList.contains('disabled'),
      };
    });

    expect(finalState.hasDisabledClass).toBe(false);
    expect(parseFloat(finalState.opacity)).toBe(1);
    expect(finalState.cursor).toBe('pointer');
  });

  test('複数ファイル処理中も適切に制御される', async () => {
    await clearExistingResults(page);

    const testFiles = [
      path.join(__dirname, 'fixtures', 'test1.epub'),
      path.join(__dirname, 'fixtures', 'test2.epub'),
      path.join(__dirname, 'fixtures', 'test3.epub'),
    ];

    // 複数ファイルを同時に処理開始
    const fileInputMulti = page.locator('input[type="file"]');
    await fileInputMulti.setInputFiles(testFiles);

    // 処理中の表示を確認
    await expect(page.locator('text=処理中')).toBeVisible();

    // ドロップゾーンが無効化されていることを確認
    const compactDropZone = page.locator('.compact-drop-zone');
    await expect(compactDropZone).toHaveClass(/disabled/);

    // すべてのファイルが処理されるまでドロップゾーンは無効
    for (const testFile of testFiles) {
      const fileName = path.basename(testFile);
      await expect(page.locator(`text=${fileName}`)).toBeVisible();
    }

    // すべての処理が完了するまで待つ
    await waitForProcessingComplete(page, '3件完了');

    // 処理完了後はドロップゾーンが有効になることを確認
    await expect(compactDropZone).not.toHaveClass(/disabled/);
  });
});
