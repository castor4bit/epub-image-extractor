import { Page } from '@playwright/test';

/**
 * ページの現在の状態をデバッグ出力する
 */
export async function debugPageState(page: Page, label: string): Promise<void> {
  console.log(`\n=== Debug: ${label} ===`);
  
  try {
    // ページが有効か確認
    const isConnected = page.isClosed();
    if (isConnected) {
      console.log('WARNING: Page is closed!');
      return;
    }
    
    // 現在のURL
    console.log(`URL: ${page.url()}`);
    
    // ページタイトル
    const title = await page.title();
    console.log(`Title: ${title}`);
    
    // CI環境では追加のデバッグ情報
    if (process.env.CI) {
      // ビューポートサイズ
      const viewport = page.viewportSize();
      console.log(`Viewport: ${viewport?.width}x${viewport?.height}`);
      
      // ページのHTML構造を一部出力
      const bodyHTML = await page.evaluate(() => {
        const body = document.body;
        if (!body) return 'No body element';
        // 最初の100文字程度
        return body.innerHTML.substring(0, 200) + '...';
      });
      console.log(`Body HTML preview: ${bodyHTML}`);
    }
    
    // 表示されている主要な要素
    const visibleElements = [
      '.settings-window',
      '.compact-drop-zone',
      '.drop-zone',
      '.processing-item',
      'button.close-button',
      'button:has-text("×")',
      'button[title="設定"]',
    ];
    
    for (const selector of visibleElements) {
      const count = await page.locator(selector).count();
      const isVisible = count > 0 ? await page.locator(selector).first().isVisible() : false;
      if (count > 0) {
        console.log(`  ${selector}: count=${count}, visible=${isVisible}`);
      }
    }
    
    // ボタンのテキスト内容を取得
    const buttons = await page.locator('button').all();
    console.log(`\nButtons found: ${buttons.length}`);
    for (let i = 0; i < Math.min(buttons.length, 10); i++) {
      const text = await buttons[i].textContent();
      const isVisible = await buttons[i].isVisible();
      console.log(`  Button[${i}]: "${text?.trim()}" (visible=${isVisible})`);
    }
    
  } catch (error) {
    console.error(`Debug error: ${error}`);
  }
  
  console.log('=== End Debug ===\n');
}

/**
 * エラー発生時の詳細情報を取得
 */
export async function captureErrorDetails(page: Page, testName: string): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  try {
    // スクリーンショットを撮る
    await page.screenshot({
      path: `test-results/error-${testName}-${timestamp}.png`,
      fullPage: true,
    });
    console.log(`Screenshot saved: error-${testName}-${timestamp}.png`);
    
    // HTMLを保存
    const html = await page.content();
    const fs = await import('fs/promises');
    await fs.writeFile(
      `test-results/error-${testName}-${timestamp}.html`,
      html,
      'utf-8'
    );
    console.log(`HTML saved: error-${testName}-${timestamp}.html`);
    
    // コンソールログを表示
    page.on('console', msg => {
      console.log(`Console ${msg.type()}: ${msg.text()}`);
    });
    
  } catch (error) {
    console.error(`Failed to capture error details: ${error}`);
  }
}

/**
 * 要素をクリックする前に詳細を確認
 */
export async function debugClick(page: Page, selector: string, description: string): Promise<void> {
  console.log(`\n--- Attempting to click: ${description} ---`);
  
  const locator = page.locator(selector);
  const count = await locator.count();
  
  if (count === 0) {
    console.error(`No elements found for selector: ${selector}`);
    await debugPageState(page, 'No element found');
    throw new Error(`Element not found: ${selector}`);
  }
  
  if (count > 1) {
    console.warn(`Multiple elements (${count}) found for selector: ${selector}`);
  }
  
  const element = locator.first();
  const isVisible = await element.isVisible();
  const isEnabled = await element.isEnabled();
  const boundingBox = await element.boundingBox();
  
  console.log(`Element state: visible=${isVisible}, enabled=${isEnabled}`);
  if (boundingBox) {
    console.log(`Position: x=${boundingBox.x}, y=${boundingBox.y}, width=${boundingBox.width}, height=${boundingBox.height}`);
  }
  
  if (!isVisible || !isEnabled) {
    await debugPageState(page, 'Element not clickable');
    throw new Error(`Element not clickable: ${selector}`);
  }
  
  try {
    await element.click();
    console.log(`Successfully clicked: ${description}`);
  } catch (error) {
    console.error(`Failed to click: ${error}`);
    await debugPageState(page, 'Click failed');
    throw error;
  }
}