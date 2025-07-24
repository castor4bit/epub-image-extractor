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
├── fixtures/           # テスト用のEPUBファイル
│   ├── test.epub
│   ├── test1.epub
│   ├── test2.epub
│   └── large-test.epub
├── dragdrop.spec.ts    # ドラッグ&ドロップ機能のテスト
└── processing-controls.spec.ts  # 処理制御機能のテスト
```

## CI/CDでの実行

### GitHub Actions設定

E2EテストはCIパイプラインに統合されています：

1. **PRチェック時**: 基本的なE2Eテストを実行
2. **mainブランチへのマージ時**: すべてのE2Eテストを実行
3. **リリース前**: 完全なE2Eテストスイートを実行

### CI環境での注意点

- ヘッドレスモードで実行される
- タイムアウトは通常より長く設定
- 失敗時は自動的に2回までリトライ
- スクリーンショットとビデオが保存される

## テストの作成

### 新しいテストを追加する場合

1. `e2e/` ディレクトリに `.spec.ts` ファイルを作成
2. 以下のテンプレートを使用：

```typescript
import { test, expect, _electron as electron, Page, ElectronApplication } from '@playwright/test';
import path from 'path';

let electronApp: ElectronApplication;
let page: Page;

test.describe('機能名', () => {
  test.beforeEach(async () => {
    electronApp = await electron.launch({
      args: [path.join(__dirname, '..', 'dist-electron', 'main', 'index.js')],
    });
    page = await electronApp.firstWindow();
  });

  test.afterEach(async () => {
    await electronApp.close();
  });

  test('テストケース', async () => {
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

- `playwright.config.ts` でタイムアウトを調整
- 個別のテストでタイムアウトを設定：
  ```typescript
  test('slow test', async () => {
    test.setTimeout(120000); // 2分
  });
  ```

## ベストプラクティス

1. **セレクターの選択**
   - クラス名やテキストコンテンツを使用
   - data-testid属性を追加することも検討

2. **待機処理**
   - `waitFor` を使用して要素の出現を待つ
   - 固定のsleepは避ける

3. **アサーション**
   - 複数の観点から検証
   - 視覚的な状態とロジックの両方を確認

4. **テストデータ**
   - fixturesディレクトリにテスト用ファイルを配置
   - 各テストで独立したデータを使用