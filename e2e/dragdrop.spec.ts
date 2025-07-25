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

test.describe('ドラッグ&ドロップE2Eテスト', () => {
  test.beforeEach(async () => {
    // Electronアプリケーションを起動（E2Eテストモードを有効化）
    electronApp = await launchElectron();

    // メインウィンドウを取得
    page = await electronApp.firstWindow();
    await page.waitForLoadState('domcontentloaded');

    await clearLocalStorage(electronApp);
  });

  test.afterEach(async ({}, testInfo) => {
    if (electronApp) {
      try {
        // テストが失敗した場合はスクリーンショットを取得
        if (testInfo.status !== 'passed') {
          try {
            const page = await electronApp.firstWindow();
            if (page) {
              await testInfo.attach('screenshot', {
                body: await page.screenshot(),
                contentType: 'image/png',
              });
            }
          } catch (screenshotError) {
            console.warn('[E2E] Failed to capture screenshot:', screenshotError);
          }
        }
      } catch (error) {
        console.error('[E2E] Error in afterEach:', error);
      } finally {
        // 確実にElectronを終了
        await closeElectron(electronApp, true);
        electronApp = null;
        page = null;
      }
    }
  });

  test('@smoke EPUBファイルをドラッグ&ドロップで処理できる', async () => {
    await clearExistingResults(page);

    // テスト用EPUBファイルのパス
    const testEpubPath = path.join(__dirname, 'fixtures', 'test.epub');

    // ドロップゾーンを確認
    const dropZone = page.locator('.drop-zone');
    await expect(dropZone).toBeVisible();
    await expect(dropZone).toContainText('EPUBファイルをドロップ');

    // ファイル入力要素を直接操作
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testEpubPath);

    // 処理が開始されることを確認
    await expect(page.locator('text=処理中')).toBeVisible();

    await expect(page.locator('text=完了')).toBeVisible();
  });

  test('複数のEPUBファイルを同時に処理できる', async () => {
    await clearExistingResults(page);

    const testFiles = [
      path.join(__dirname, 'fixtures', 'test1.epub'),
      path.join(__dirname, 'fixtures', 'test2.epub'),
    ];

    const dropZone = page.locator('.drop-zone');
    await expect(dropZone).toBeVisible();

    // 複数ファイルを選択
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testFiles);

    // 両方のファイルが処理リストに表示されることを確認
    await expect(page.locator('text=test1.epub')).toBeVisible();
    await expect(page.locator('text=test2.epub')).toBeVisible();

    // 処理が完了することを確認（より具体的なセレクタを使用）
    await expect(page.locator('.summary-completed:has-text("2件完了")')).toBeVisible();
  });

  test('無効なファイルをドロップした場合エラーが表示される', async () => {
    const invalidFilePath = path.join(__dirname, 'fixtures', 'invalid.txt');

    // 無効なファイルを作成
    await fs.writeFile(invalidFilePath, 'This is not an EPUB file');

    // エラーダイアログを監視
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain('無効なファイル');
      await dialog.accept();
    });

    // ファイルを選択
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(invalidFilePath);

    // クリーンアップ
    await fs.unlink(invalidFilePath).catch(() => {});
  });

  test('処理完了後に追加のファイルをドロップできる', async () => {
    await clearExistingResults(page);

    const testFile1 = path.join(__dirname, 'fixtures', 'test1.epub');
    const testFile2 = path.join(__dirname, 'fixtures', 'test2.epub');

    // 最初のファイルを処理
    const fileInput1 = page.locator('input[type="file"]');
    await fileInput1.setInputFiles(testFile1);

    // 処理が開始されることを確認
    await expect(page.locator('text=処理中')).toBeVisible();

    // コンパクトドロップゾーンが表示されることを確認
    const compactDropZone = page.locator('.compact-drop-zone');
    await expect(compactDropZone).toBeVisible();

    // 最初のファイルの処理が完了するまで待つ（「1件完了」という表示を待つ）
    await expect(page.locator('.summary-completed:has-text("1件完了")')).toBeVisible();

    // ドロップゾーンが有効になっていることを確認（処理状態がクリアされている）
    await expect(compactDropZone).not.toHaveClass(/disabled/);

    // 処理完了後、追加のファイルをドロップ
    const fileInput2 = page.locator('.compact-drop-zone input[type="file"]');
    await fileInput2.setInputFiles(testFile2);

    // 両方のファイルが処理リストに表示されることを確認
    await expect(page.locator('text=test1.epub')).toBeVisible();
    await expect(page.locator('text=test2.epub')).toBeVisible();

    // 2つ目のファイルの処理も完了するまで待つ
    await expect(page.locator('.summary-completed:has-text("2件完了")')).toBeVisible();
  });

  test('ドラッグ中はドロップゾーンがハイライトされる', async () => {
    await clearExistingResults(page);

    const dropZone = page.locator('.drop-zone');
    await expect(dropZone).toBeVisible();

    // 初期状態ではactiveクラスがないことを確認
    await expect(dropZone).not.toHaveClass(/active/);

    // ドラッグイベントをシミュレート（実際のドラッグ&ドロップは難しいため、クラスの変更を直接テスト）
    await page.evaluate(() => {
      const dropZone = window.document.querySelector('.drop-zone');
      if (dropZone) {
        const dragEnterEvent = new DragEvent('dragenter', {
          dataTransfer: new DataTransfer(),
          bubbles: true,
        });
        dropZone.dispatchEvent(dragEnterEvent);
      }
    });

    // activeクラスが追加されることを確認
    await expect(dropZone).toHaveClass(/active/);

    // ドラッグ終了
    await page.evaluate(() => {
      const dropZone = window.document.querySelector('.drop-zone');
      if (dropZone) {
        const dragLeaveEvent = new DragEvent('dragleave', {
          dataTransfer: new DataTransfer(),
          bubbles: true,
        });
        dropZone.dispatchEvent(dragLeaveEvent);
      }
    });

    // activeクラスが削除されることを確認
    await expect(dropZone).not.toHaveClass(/active/);
  });
});
