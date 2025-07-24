# E2Eテストガイド

## 概要
本プロジェクトでは、Playwright を使用してElectronアプリケーションのE2Eテストを実装しています。

## ローカルでの実行方法

### 前提条件
- Node.js 24.x 以上
- アプリケーションがビルド可能な状態

### テストの実行

```bash
# すべてのE2Eテストを実行
npm run test:e2e

# 特定のテストファイルのみ実行
npm run test:e2e -- processing-controls.spec.ts

# ヘッドレスモードを無効にして実行（デバッグ用）
npm run test:e2e -- --headed

# 特定のテストケースのみ実行
npm run test:e2e -- --grep "処理中はドロップゾーンが無効化される"
```

### デバッグモード

```bash
# Playwrightのデバッグモードで実行
PWDEBUG=1 npm run test:e2e

# VSCodeでのデバッグ
# .vscode/launch.json に設定を追加して使用
```

## テストファイルの構成

```
e2e/
├── fixtures/                    # テスト用のEPUBファイル
│   ├── test.epub
│   ├── test1.epub
│   ├── test2.epub
│   ├── test3.epub
│   └── invalid.txt
├── helpers/                     # テストヘルパー関数
│   ├── electron-launch.ts       # Electron起動ヘルパー
│   └── test-helpers.ts          # 共通テストヘルパー
├── dragdrop.spec.ts            # ドラッグ&ドロップ機能のテスト
├── processing-controls.spec.ts  # 処理制御機能のテスト
├── processing-controls-simple.spec.ts  # 処理制御の基本動作テスト
├── processing-control-final.spec.ts    # 処理制御の最終テスト
└── global-teardown.ts          # グローバルクリーンアップ
```

## CI/CDでの実行

### GitHub Actions設定

E2EテストはCIパイプラインに統合されています：

1. **PRチェック時**: 基本的なE2Eテストを実行
2. **mainブランチへのマージ時**: すべてのE2Eテストを実行
3. **リリース前**: 完全なE2Eテストスイートを実行

### CI環境での注意点

- ヘッドレスモードで実行される
- Linux環境では自動的に `--no-sandbox` オプションが追加される
- 失敗時は自動的に2回までリトライ
- スクリーンショットとビデオが保存される
- E2Eテスト用の画像は一時ディレクトリに出力される

## テストの作成

### 新しいテストを追加する場合

1. `e2e/` ディレクトリに `.spec.ts` ファイルを作成
2. 以下のテンプレートを使用：

```typescript
import { test, expect, Page, ElectronApplication } from '@playwright/test';
import path from 'path';
import { launchElectron } from './helpers/electron-launch';
import { clearLocalStorage, clearExistingResults } from './helpers/test-helpers';

let electronApp: ElectronApplication;
let page: Page;

test.describe('機能名', () => {
  test.beforeEach(async () => {
    // E2Eテストモードで起動（CI環境対応済み）
    electronApp = await launchElectron();
    page = await electronApp.firstWindow();
    await page.waitForLoadState('domcontentloaded');
    
    // 初期化処理
    await clearLocalStorage(electronApp);
  });

  test.afterEach(async () => {
    if (electronApp) {
      try {
        await electronApp.close();
      } catch (error) {
        // エラーは無視
      }
    }
  });

  test('テストケース', async () => {
    await clearExistingResults(page);
    // テストコード
  });
});
```

## トラブルシューティング

### テストが失敗する場合

1. **ビルドエラー**
   ```bash
   npm run build
   ```

2. **Playwrightのインストール**
   ```bash
   npx playwright install
   ```

3. **権限エラー（macOS）**
   ```bash
   xattr -cr ./dist-electron
   ```

### タイムアウトエラー

- デフォルトタイムアウトは5秒に設定されています
- 処理に時間がかかるテストは Playwright の組み込み待機機能を使用：
  ```typescript
  // 良い例: 特定の条件を待つ
  await expect(page.locator('.completed')).toBeVisible();
  
  // 避けるべき例: 固定時間の待機
  await page.waitForTimeout(5000);
  ```

## ベストプラクティス

1. **セレクターの選択**
   - クラス名やテキストコンテンツを使用
   - data-testid属性を追加することも検討

2. **待機処理**
   - Playwright の expect API を使用（toBeVisible, toHaveClass など）
   - ヘルパー関数を活用（waitForProcessingComplete など）
   - 固定の waitForTimeout は避ける

3. **アサーション**
   - 複数の観点から検証
   - 視覚的な状態とロジックの両方を確認

4. **テストデータ**
   - fixturesディレクトリにテスト用ファイルを配置
   - 各テストで独立したデータを使用