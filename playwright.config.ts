import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright設定
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  
  // グローバルセットアップ/ティアダウン
  globalTeardown: require.resolve('./e2e/global-teardown.ts'),
  
  // テストファイルのパターン
  testMatch: '**/*.spec.ts',
  
  // 並列実行の設定
  fullyParallel: false,
  workers: 1,
  
  // リトライ設定
  retries: process.env.CI ? 2 : 0,
  
  // レポーター設定
  reporter: process.env.CI 
    ? [['github'], ['html', { open: 'never', outputFolder: 'playwright-report' }]]
    : [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  
  // 出力ディレクトリ
  outputDir: './test-results',
  
  // タイムアウト設定
  timeout: 5 * 1000, // 5秒
  globalTimeout: 5 * 60 * 1000, // 5分（全体のタイムアウト）
  
  use: {
    // トレース設定
    trace: 'on-first-retry',
    
    // スクリーンショット設定
    screenshot: 'only-on-failure',
    
    // ビデオ設定
    video: 'retain-on-failure',
    
    // アクションタイムアウト
    actionTimeout: 5 * 1000, // 5秒
  },

  // テスト前のビルド
  webServer: {
    command: 'npm run build',
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
  
  // プロジェクト設定
  projects: [
    {
      name: 'electron',
      testMatch: '**/*.spec.ts',
    },
  ],
});