import { test, expect, _electron as electron, Page, ElectronApplication } from '@playwright/test';
import path from 'path';
import { waitForProcessingComplete } from './helpers/test-helpers';

let electronApp: ElectronApplication;
let page: Page;

test.describe('処理制御の最終テスト', () => {
  test('@smoke 処理中の無効化が正しく動作する', async () => {
    // Electronアプリケーションを起動（最小限の遅延でE2Eテストモード）
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

    // ファイルを処理
    const testFile = path.join(__dirname, 'fixtures', 'test.epub');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testFile);

    // 処理状況が表示されることを確認
    await expect(page.locator('text=処理状況')).toBeVisible();

    // コンパクトドロップゾーンの存在と無効化状態を確認
    const compactDropZone = page.locator('.compact-drop-zone');
    await expect(compactDropZone).toBeVisible();

    // 無効化されることを確認（Playwrightの標準機能を使用）
    await expect(compactDropZone).toHaveClass(/disabled/, { timeout: 1000 });
    console.log('Drop zone disabled detected');

    // 処理完了を待つ
    await waitForProcessingComplete(page);

    // 処理完了後は有効になっていることを確認
    await expect(compactDropZone).not.toHaveClass(/disabled/);

    // アプリケーションを終了
    await electronApp.close();
  });
});
