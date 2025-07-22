import { test, expect, _electron as electron, Page, ElectronApplication } from '@playwright/test';
import path from 'path';
import fs from 'fs/promises';

let electronApp: ElectronApplication;
let page: Page;

test.describe('ドラッグ&ドロップE2Eテスト', () => {
  test.beforeEach(async () => {
    // Electronアプリケーションを起動
    electronApp = await electron.launch({
      args: [path.join(__dirname, '..', 'dist-electron', 'main', 'index.js')],
      env: {
        ...process.env,
        NODE_ENV: 'test',
      },
    });

    // メインウィンドウを取得
    page = await electronApp.firstWindow();
    await page.waitForLoadState('domcontentloaded');
  });

  test.afterEach(async () => {
    await electronApp.close();
  });

  test('EPUBファイルをドラッグ&ドロップで処理できる', async () => {
    // テスト用EPUBファイルのパス
    const testEpubPath = path.join(__dirname, 'fixtures', 'test.epub');

    // ドロップゾーンを確認
    const dropZone = page.locator('.drop-zone');
    await expect(dropZone).toBeVisible();
    await expect(dropZone).toContainText('EPUBファイルをドロップ');

    // ファイルをドロップ（Playwrightのファイルチューザーを使用）
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.locator('input[type="file"]').click(),
    ]);
    await fileChooser.setFiles(testEpubPath);

    // 処理が開始されることを確認
    await expect(page.locator('text=処理中')).toBeVisible({ timeout: 5000 });

    // 処理が完了することを確認
    await expect(page.locator('text=完了')).toBeVisible({ timeout: 30000 });
  });

  test('複数のEPUBファイルを同時に処理できる', async () => {
    const testFiles = [
      path.join(__dirname, 'fixtures', 'test1.epub'),
      path.join(__dirname, 'fixtures', 'test2.epub'),
    ];

    const dropZone = page.locator('.drop-zone');
    await expect(dropZone).toBeVisible();

    // 複数ファイルを選択
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.locator('input[type="file"]').click(),
    ]);
    await fileChooser.setFiles(testFiles);

    // 両方のファイルが処理リストに表示されることを確認
    await expect(page.locator('text=test1.epub')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=test2.epub')).toBeVisible({ timeout: 5000 });

    // 処理が完了することを確認
    await expect(page.locator('text=2件完了')).toBeVisible({ timeout: 30000 });
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
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.locator('input[type="file"]').click(),
    ]);
    await fileChooser.setFiles(invalidFilePath);

    // クリーンアップ
    await fs.unlink(invalidFilePath).catch(() => {});
  });

  test('処理中に追加のファイルをドロップできる', async () => {
    const testFile1 = path.join(__dirname, 'fixtures', 'test1.epub');
    const testFile2 = path.join(__dirname, 'fixtures', 'test2.epub');

    // 最初のファイルを処理
    const [fileChooser1] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.locator('input[type="file"]').click(),
    ]);
    await fileChooser1.setFiles(testFile1);

    // 処理が開始されることを確認
    await expect(page.locator('text=処理中')).toBeVisible({ timeout: 5000 });

    // コンパクトドロップゾーンが表示されることを確認
    await expect(page.locator('.compact-drop-zone')).toBeVisible();

    // 追加のファイルをドロップ
    const [fileChooser2] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.locator('.compact-drop-zone input[type="file"]').click(),
    ]);
    await fileChooser2.setFiles(testFile2);

    // 両方のファイルが処理リストに表示されることを確認
    await expect(page.locator('text=test1.epub')).toBeVisible();
    await expect(page.locator('text=test2.epub')).toBeVisible();
  });

  test('ドラッグ中はドロップゾーンがハイライトされる', async () => {
    const dropZone = page.locator('.drop-zone');

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
