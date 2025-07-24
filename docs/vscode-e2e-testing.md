# VSCodeでE2Eテストを実行する方法

## 1. Playwright拡張機能のインストール

VSCodeで以下の拡張機能をインストールしてください：
- **Playwright Test for VSCode** (ms-playwright.playwright)

インストール方法：
1. VSCodeの拡張機能タブを開く（Cmd+Shift+X）
2. "Playwright" で検索
3. Microsoft製の "Playwright Test for VSCode" をインストール

## 2. テストの実行方法

### 方法1: Playwright拡張機能のテストエクスプローラー（推奨）

1. 左サイドバーのテストアイコン（フラスコ型）をクリック
2. E2Eテストが一覧表示される
3. 実行したいテストの横の再生ボタンをクリック

**特徴：**
- 個別のテストを選択して実行可能
- デバッグモードで実行可能（ブレークポイントが使える）
- テスト結果がUIで確認できる

### 方法2: タスクランナーを使用

1. `Cmd+Shift+P` でコマンドパレットを開く
2. "Tasks: Run Task" を選択
3. 以下のタスクから選択：
   - **Run All E2E Tests**: すべてのE2Eテストを実行
   - **Run Current E2E Test**: 現在開いているファイルのテストを実行
   - **Run E2E Tests with UI**: Playwright UIモードで実行

### 方法3: デバッグ構成を使用

1. デバッグビュー（Cmd+Shift+D）を開く
2. "Debug E2E Test" を選択
3. テストファイルを開いた状態でF5を押す

**特徴：**
- ブレークポイントを設定してデバッグ可能
- 変数の値を確認しながらテストを実行できる

### 方法4: ターミナルから直接実行

VSCodeの統合ターミナルで以下のコマンドを実行：

```bash
# すべてのE2Eテストを実行
npm run test:e2e

# 特定のテストファイルを実行
npm run test:e2e -- e2e/dragdrop.spec.ts

# UIモードで実行（視覚的にテストを確認）
npx playwright test --ui

# デバッグモードで実行
npx playwright test --debug
```

## 3. テスト結果の確認

### Playwright拡張機能使用時
- テストエクスプローラーで結果を確認
- 失敗したテストは赤く表示される
- クリックすると詳細なエラー情報が表示される

### HTMLレポートの表示
```bash
npx playwright show-report
```

### トレースファイルの確認
失敗したテストのトレースファイルを確認：
```bash
npx playwright show-trace test-results/[test-name]/trace.zip
```

## 4. 便利な機能

### ヘッドレスモードの切り替え
`playwright.config.ts`で設定するか、環境変数で制御：
```bash
HEADED=true npm run test:e2e
```

### 特定のテストのみ実行
```bash
# grepパターンでフィルタ
npm run test:e2e -- -g "ドラッグ"

# @smokeタグ付きテストのみ
npm run test:e2e -- -g "@smoke"
```

### テストのデバッグ
1. テストファイルにブレークポイントを設定
2. Playwright拡張機能のデバッグボタンをクリック
3. または、デバッグビューから "Debug E2E Test" を実行

## 5. トラブルシューティング

### テストが表示されない場合
1. Playwright拡張機能を再読み込み（Cmd+Shift+P → "Developer: Reload Window"）
2. `npm install` を実行して依存関係を確認
3. `npm run build` でアプリケーションをビルド

### タイムアウトエラーが発生する場合
- テスト実行前に必ず `npm run build` を実行
- `playwright.config.ts` でタイムアウト時間を調整

### Electronアプリが起動しない場合
- `dist-electron` ディレクトリが存在することを確認
- ビルドエラーがないか確認