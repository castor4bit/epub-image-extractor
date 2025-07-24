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

  test.skip('処理中にアプリを終了しようとすると確認ダイアログが表示される', async () => {
    // このテストは以下の理由でスキップ:
    // 1. Electronのevaluate内でrequireが使えない制約
    // 2. 実際のダイアログが表示されるとテストがブロックされる
    // 3. E2Eテストモードでの特別な処理は実装済みだが、
    //    Playwrightからのアクセスに技術的制約がある
    //
    // 手動テストで以下を確認すること:
    // - 処理中にウィンドウを閉じようとすると確認ダイアログが表示される
    // - 「キャンセル」を選択すると処理が継続される
    // - 「終了」を選択するとアプリが終了する
  });

  test('処理完了後は通常通りドロップを受け付ける', async () => {
    const testFile1 = path.join(__dirname, 'fixtures', 'test1.epub');
    const testFile2 = path.join(__dirname, 'fixtures', 'test2.epub');

    // 最初のファイルを処理
    const fileInput1 = page.locator('input[type="file"]');
    await fileInput1.setInputFiles(testFile1);

    // 処理が完了するまで待つ
    await expect(page.locator('text=完了')).toBeVisible({ timeout: 30000 });

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
    await expect(page.locator('text=完了')).toBeVisible({ timeout: 30000 });
    
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
    await expect(page.locator('.summary-completed:has-text("3件完了")')).toBeVisible({ timeout: 15000 });

    // 処理完了後はドロップゾーンが有効になることを確認
    await expect(compactDropZone).not.toHaveClass(/disabled/);
  });
});