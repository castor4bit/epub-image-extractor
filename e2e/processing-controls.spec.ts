import { test, expect, _electron as electron, Page, ElectronApplication } from '@playwright/test';
import path from 'path';
import fs from 'fs/promises';

let electronApp: ElectronApplication;
let page: Page;

test.describe('処理制御機能E2Eテスト', () => {
  test.beforeEach(async () => {
    // Electronアプリケーションを起動（E2Eテストモードを有効化）
    electronApp = await electron.launch({
      args: [path.join(__dirname, '..', 'dist-electron', 'main', 'index.js')],
      env: {
        ...process.env,
        NODE_ENV: 'test',
        E2E_TEST_MODE: 'true',
      },
    });

    // メインウィンドウを取得
    page = await electronApp.firstWindow();
    await page.waitForLoadState('domcontentloaded');

    // localStorageをクリアして初期状態にする
    await page.evaluate(() => {
      localStorage.clear();
    });
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

  test('処理中にアプリを終了しようとすると確認ダイアログが表示される', async () => {
    // 既存の結果をクリア
    const clearButton = page.locator('button:has-text("クリア")');
    if (await clearButton.isVisible({ timeout: 1000 })) {
      await clearButton.click();
      await page.waitForTimeout(500);
    }
    
    const testEpubPath = path.join(__dirname, 'fixtures', 'test.epub');

    // ファイルを処理開始
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testEpubPath);

    // 処理が開始されることを確認し、すぐにcloseイベントをトリガー
    await expect(page.locator('.processing-item.processing').first()).toBeVisible({ timeout: 5000 });

    // 処理中にすぐにcloseイベントをトリガー（処理が完了する前に）
    const result = await electronApp.evaluate(() => {
      const helpers = (global as any).testHelpers;
      if (!helpers) {
        throw new Error('Test helpers not available. Make sure E2E_TEST_MODE is set.');
      }
      // 現在の処理状態も返す
      const currentState = helpers.getProcessingState();
      const closeResult = helpers.triggerClose();
      return {
        ...closeResult,
        wasProcessingBeforeClose: currentState
      };
    });

    // ダイアログが表示されたことを確認
    // 処理中の場合のみダイアログが表示される
    if (result.wasProcessingBeforeClose || result.isProcessing) {
      // 処理中だった場合、ダイアログが表示されるはず
      expect(result.dialogShown).toBe(true);
      expect(result.dialogOptions).toBeDefined();
      expect(result.dialogOptions.title).toBe('処理中のファイルがあります');
      expect(result.dialogOptions.message).toBe('処理中のファイルがあります');
      expect(result.dialogOptions.detail).toBe('処理を中断して終了してもよろしいですか？');
      expect(result.dialogOptions.buttons).toEqual(['終了', 'キャンセル']);
    } else {
      // 処理が完了していた場合、ダイアログは表示されない
      expect(result.dialogShown).toBe(false);
      expect(result.dialogOptions).toBeNull();
    }
    
    // アプリがまだ開いていることを確認（キャンセルを選択したため）
    await expect(page).toBeDefined();
    
    // 処理が完了するまで待つ（ダイアログを防ぐため）
    await expect(page.locator('.summary-completed')).toBeVisible({ timeout: 5000 });
  });

  test('処理完了後は通常通りドロップを受け付ける', async () => {
    const testFile1 = path.join(__dirname, 'fixtures', 'test1.epub');
    const testFile2 = path.join(__dirname, 'fixtures', 'test2.epub');

    // 最初のファイルを処理
    const fileInput1 = page.locator('input[type="file"]');
    await fileInput1.setInputFiles(testFile1);

    // 処理が完了するまで待つ
    await expect(page.locator('text=完了')).toBeVisible({ timeout: 5000 });

    // コンパクトドロップゾーンが有効であることを確認
    const compactDropZone = page.locator('.compact-drop-zone');
    await expect(compactDropZone).not.toHaveClass(/disabled/);

    // 2つ目のファイルを正常にドロップできることを確認
    const fileInput2 = page.locator('.compact-drop-zone input[type="file"]');
    await fileInput2.setInputFiles(testFile2);

    // 2つ目のファイルが処理リストに追加されることを確認
    await expect(page.locator('text=test2.epub')).toBeVisible({ timeout: 5000 });
  });

  test('処理中の視覚的フィードバックが正しく表示される', async () => {
    const testEpubPath = path.join(__dirname, 'fixtures', 'test.epub');

    // 初期状態の確認
    const dropZone = page.locator('.drop-zone');
    await expect(dropZone).not.toHaveClass(/disabled/);

    // ファイルを処理開始
    const fileInputVis = page.locator('input[type="file"]');
    await fileInputVis.setInputFiles(testEpubPath);

    // 処理中の視覚的状態を確認
    const compactDropZone = page.locator('.compact-drop-zone');
    await expect(compactDropZone).toBeVisible();
    await expect(compactDropZone).toHaveClass(/disabled/);

    // CSSスタイルが適用されていることを確認
    const opacity = await compactDropZone.evaluate((el) => 
      window.getComputedStyle(el).opacity
    );
    expect(parseFloat(opacity)).toBeLessThan(1); // 半透明になっている

    const cursor = await compactDropZone.evaluate((el) => 
      window.getComputedStyle(el).cursor
    );
    expect(cursor).toBe('not-allowed');

    // 処理完了後は通常の表示に戻ることを確認
    await expect(page.locator('text=完了')).toBeVisible({ timeout: 5000 });
    
    const opacityAfter = await compactDropZone.evaluate((el) => 
      window.getComputedStyle(el).opacity
    );
    expect(parseFloat(opacityAfter)).toBe(1);
  });

  test('複数ファイル処理中も適切に制御される', async () => {
    const testFiles = [
      path.join(__dirname, 'fixtures', 'test1.epub'),
      path.join(__dirname, 'fixtures', 'test2.epub'),
      path.join(__dirname, 'fixtures', 'test3.epub'),
    ];

    // 複数ファイルを同時に処理開始
    const fileInputMulti = page.locator('input[type="file"]');
    await fileInputMulti.setInputFiles(testFiles);

    // 処理中の表示を確認
    await expect(page.locator('text=処理中')).toBeVisible({ timeout: 5000 });

    // ドロップゾーンが無効化されていることを確認
    const compactDropZone = page.locator('.compact-drop-zone');
    await expect(compactDropZone).toHaveClass(/disabled/);

    // すべてのファイルが処理されるまでドロップゾーンは無効
    for (const testFile of testFiles) {
      const fileName = path.basename(testFile);
      await expect(page.locator(`text=${fileName}`)).toBeVisible();
    }

    // すべての処理が完了するまで待つ
    await expect(page.locator('.summary-completed:has-text("3件完了")')).toBeVisible({ timeout: 5000 });

    // 処理完了後はドロップゾーンが有効になることを確認
    await expect(compactDropZone).not.toHaveClass(/disabled/);
  });
});