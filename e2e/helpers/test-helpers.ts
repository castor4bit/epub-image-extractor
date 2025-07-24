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
