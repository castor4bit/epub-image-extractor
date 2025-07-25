import { Page, ElectronApplication } from '@playwright/test';

/**
 * E2Eテスト用の共通ヘルパー関数
 */

/**
 * 既存の処理結果をクリアする
 * @param page Playwrightのページオブジェクト
 * @param waitTime クリア後の待機時間（ミリ秒）
 */
export async function clearExistingResults(page: Page, waitTime = 500): Promise<void> {
  const clearButton = page.locator('button:has-text("クリア")');
  if (await clearButton.isVisible({ timeout: 1000 })) {
    await clearButton.click();
    await page.waitForTimeout(waitTime);
  }
}

/**
 * localStorageをクリアして初期状態にする
 * @param electronApp Electronアプリケーションオブジェクト
 */
export async function clearLocalStorage(electronApp: ElectronApplication): Promise<void> {
  await electronApp.evaluate(() => {
    const helpers = (global as any).testHelpers;
    if (helpers && helpers.clearLocalStorage) {
      return helpers.clearLocalStorage();
    }
    return { success: false, error: 'Test helpers not available' };
  });
}

/**
 * 処理が完了するまで待つ
 * @param page Playwrightのページオブジェクト
 * @param expectedCount 期待される完了数（例: "1件完了"）
 */
export async function waitForProcessingComplete(page: Page, expectedCount?: string): Promise<void> {
  if (expectedCount) {
    await page
      .locator(`.summary-completed:has-text("${expectedCount}")`)
      .waitFor({ state: 'visible' });
  } else {
    await page.locator('.summary-completed').waitFor({ state: 'visible' });
  }
}

/**
 * ファイルが処理リストに表示されるまで待つ
 * @param page Playwrightのページオブジェクト
 * @param fileName ファイル名
 */
export async function waitForFileInProcessingList(page: Page, fileName: string): Promise<void> {
  await page.locator(`.processing-item:has-text("${fileName}")`).waitFor({ state: 'visible' });
}

/**
 * 設定ウィンドウを閉じる
 * @param page Playwrightのページオブジェクト
 */
export async function closeSettingsWindow(page: Page): Promise<void> {
  // 設定ウィンドウが表示されていることを確認
  await page.locator('.settings-window').waitFor({ state: 'visible', timeout: 5000 });
  
  // ウィンドウを閉じるための複数の方法を試行
  const closeActions = [
    // キャンセルボタンをクリック（最も確実な方法）
    async () => {
      const cancelButton = page.locator('.cancel-button');
      if (await cancelButton.isVisible()) {
        await cancelButton.click();
        return true;
      }
      return false;
    },
    // 閉じるボタン（×）をクリック
    async () => {
      const closeButton = page.locator('.close-button');
      if (await closeButton.isVisible()) {
        await closeButton.click();
        return true;
      }
      return false;
    },
    // オーバーレイをクリック
    async () => {
      const overlay = page.locator('.settings-overlay');
      if (await overlay.isVisible()) {
        // 設定ウィンドウの外側の位置をクリック
        const box = await overlay.boundingBox();
        if (box) {
          await page.mouse.click(box.x + 10, box.y + 10);
          return true;
        }
      }
      return false;
    },
    // ESCキーを押す
    async () => {
      await page.keyboard.press('Escape');
      return true;
    },
  ];
  
  let closed = false;
  for (const action of closeActions) {
    try {
      if (await action()) {
        closed = true;
        break;
      }
    } catch (error) {
      // エラーは無視して次の方法を試す
    }
  }
  
  if (!closed) {
    throw new Error('Failed to close settings window with any method');
  }
  
  // 設定ウィンドウが閉じたことを確認
  await page.locator('.settings-window').waitFor({ state: 'hidden', timeout: 5000 });
}
