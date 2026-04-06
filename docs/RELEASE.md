# リリースガイド

## 概要

EPUB Image Extractorは**release-please**を使用した自動リリース システムを採用しています。このドキュメントでは、リリースプロセスの詳細と運用方法について説明します。

## 🚀 リリースプロセスの仕組み

### 2段階手動リリースフロー

1. **開発**: conventional commitsでコードを開発
2. **プッシュ**: `main`ブランチにpush
3. **Stage 1 - リリース準備**: 
   - GitHub Actionsで「Prepare Release PR」ワークフローを**手動実行**
   - Release PRが作成される
   - PR Checksが自動的に実行される（lint、テスト、ビルド）
4. **Release PR確認とマージ**: 
   - 生成されたCHANGELOGとバージョンを確認
   - PR Checksがすべて成功していることを確認
   - PRをマージ
5. **Stage 2 - リリース実行**:
   - GitHub Actionsで「Publish GitHub Release」ワークフローを**手動実行**
   - GitHubリリースが作成される
   - 各プラットフォーム用のビルドが実行される
   - ビルド成果物がGitHub Releaseにアップロードされる

> **重要**: このワークフローではPATは不要です。通常のGITHUB_TOKENで動作し、PR Checksも確実に実行されます。

### 従来のstandard-versionから変更された点

- **✅ 手動リリース作業が不要**: Release PRのマージのみ
- **✅ CHANGELOG自動管理**: コミットから自動生成
- **✅ バージョン管理自動化**: package.jsonの更新も自動
- **✅ ビルド自動化**: リリースと同時にビルド実行
- **✅ 配布自動化**: GitHub Releaseへの自動アップロード

## 📝 コミットメッセージのルール

### Conventional Commits形式

```bash
<type>(<scope>): <description>

<body>

<footer>
```

### 重要なタイプ一覧

| タイプ | 説明 | バージョン影響 | CHANGELOGセクション |
|--------|------|---------------|------------------|
| `feat` | 新機能 | **minor** | Features |
| `fix` | バグ修正 | **patch** | Bug Fixes |
| `docs` | ドキュメント | patch | Documentation |
| `refactor` | リファクタリング | patch | Code Refactoring |
| `perf` | パフォーマンス改善 | patch | Performance Improvements |
| `deps` | 依存関係更新 | patch | Dependencies |
| `ci` | CI/CD関連 | patch | Continuous Integration |
| `chore` | その他 | patch | *非表示* |
| `test` | テスト | patch | *非表示* |
| `build` | ビルド | patch | *非表示* |
| `style` | フォーマット | patch | *非表示* |
| `revert` | リバート | patch | Reverts |

### コミットメッセージの例

```bash
# 新機能（minorバージョンアップ）
feat: Add batch processing support for multiple EPUB files

# バグ修正（patchバージョンアップ）
fix: Fix memory leak in large EPUB file processing

# ドキュメント更新
docs: Update installation instructions for Windows

# 依存関係更新
deps: Update Electron to v37.2.1

# リファクタリング
refactor: Optimize image extraction algorithm

# 破壊的変更（majorバージョンアップ）
feat!: Change API for image extraction settings

BREAKING CHANGE: The setImageOptions method now requires a different parameter structure
```

## 🔄 日常的なリリースフロー

### 1. 開発フェーズ

```bash
# 機能開発
git checkout -b feature/batch-processing
git commit -m "feat: Add batch processing UI components"
git commit -m "feat: Implement parallel file processing"
git commit -m "fix: Handle edge case in file validation"

# mainブランチにマージ
git checkout main
git merge feature/batch-processing
git push origin main
```

Release PRは手動でワークフローを実行した時のみ作成・更新されます。

### 2. Release PRの確認

ワークフローの手動実行後：

1. **Pull Requestsページを確認**: 「chore(main): release X.X.X」というタイトルのDraft PRを探す
2. **Draft PRの確認**: 
   - PRはDraft状態で作成されます
   - CHANGELOGの変更内容を確認
   - package.jsonのバージョンを確認
   - 含まれるコミット一覧を確認
3. **Ready for Reviewに変更**:
   - 内容に問題がなければ「Ready for review」ボタンをクリック
   - この操作により自動的にCIが起動します
4. **自動品質チェック**: Ready for review後、自動的に以下が実行されます
   - ESLintチェック
   - TypeScriptコンパイルチェック
   - ユニットテスト
   - 統合テスト
   - ビルドテスト
5. **マージ準備完了**:
   - 品質チェックの結果がすべて✅になっていることを確認
   - 問題がなければPRをマージ

### 3. 手動でのリリースバージョン指定（オプション）

特定のバージョンでリリースしたい場合：

1. **GitHub Actionsページに移動**: リポジトリの「Actions」タブ
2. **「Prepare Release PR」ワークフローを選択**
3. **「Run workflow」をクリック**
4. **リリースタイプを選択**:
   - `auto`: コミット履歴から自動決定（推奨）
   - `patch`: パッチリリース (0.4.0 → 0.4.1)
   - `minor`: マイナーリリース (0.4.0 → 0.5.0)
   - `major`: メジャーリリース (0.4.0 → 1.0.0)
5. **「Run workflow」で実行**

### 4. リリース実行

**Release PR**をマージした後：

1. **GitHub Actionsページに移動**: リポジトリの「Actions」タブ
2. **「Publish GitHub Release」ワークフローを選択**
3. **「Run workflow」をクリック**
4. **オプション設定**:
   - `Skip build process`: テスト時のみチェック（通常は未チェック）
5. **「Run workflow」で実行**

実行されると：
1. **マージされたRelease PRの検証**: 24時間以内にマージされたRelease PRを確認
2. **タグ作成**: `v0.4.1`のようなタグが自動作成
3. **GitHub Release作成**: リリースノートとともに公開
4. **ビルド実行**: 各プラットフォーム向けにビルド
   - macOS: `EPUB-Image-Extractor-{version}-arm64.dmg`
   - macOS: `EPUB-Image-Extractor-{version}-x64.dmg`
   - Windows: `EPUB-Image-Extractor-{version}-x64-Setup.exe`
   - Windows: `EPUB-Image-Extractor-{version}-x64-Portable.exe`
5. **成果物アップロード**: ビルド成果物をGitHub Releaseに自動追加

## 🛠 メンテナンス作業

### Release PRの内容確認

Release PRには以下が含まれています：

- `CHANGELOG.md`の更新
- `package.json`のバージョン更新
- `.release-please-manifest.json`の更新

マージ前に内容を確認し、必要に応じて追加のコミットを行います。

### 緊急修正のリリース

```bash
# 緊急修正
git commit -m "fix: Critical security vulnerability in file parser"
git push origin main

# Stage 1: GitHub Actionsで手動実行してRelease PRを作成
# PR Checksが完了するのを待つ
# 作成されたPRをマージ

# Stage 2: GitHub Actionsで「Publish GitHub Release」を手動実行
```

### 特定バージョンでのリリース

通常は自動バージョン決定を使用しますが、特別な場合は手動調整可能：

```bash
# 強制的にメジャーバージョンアップ
git commit -m "feat!: Complete UI redesign

BREAKING CHANGE: All UI components have been redesigned with new API"
```

## 🔧 GitHub Actionsワークフロー

### 1. prepare-release-pr.yml
**Stage 1: Release PR作成**用のワークフロー
- トリガー: `workflow_dispatch`（手動実行のみ）
- 機能: Release PRの作成（`skip-github-release: true`により、リリースは作成しない）
- 利点: 作成されたPRは通常のPRとして扱われ、PR Checksが自動実行される

### 2. publish-github-release.yml
**Stage 2: リリース実行**用のワークフロー
- トリガー: `workflow_dispatch`（手動実行のみ）
- 前提条件: Release PRがマージ済みであること（24時間以内）
- 機能: 
  - マージされたRelease PRの検証
  - GitHubリリースの作成
  - 各プラットフォーム向けビルド
  - 成果物のアップロード

### 3. pr-checks.yml
すべてのPRに対して品質チェックを実行します。
- トリガー: PRの作成・更新時
- 機能: Lint、TypeScriptチェック、テスト、ビルドテスト
- PR結果コメント: チェック結果を自動でコメント

## 📋 設定ファイル

### release-please-config.json

```json
{
  "release-type": "node",
  "bump-minor-pre-major": true,
  "bump-patch-for-minor-pre-major": true,
  "packages": {
    ".": {
      "release-type": "node",
      "package-name": "epub-image-extractor",
      "changelog-sections": [
        {"type": "feat", "section": "Features"},
        {"type": "fix", "section": "Bug Fixes"},
        {"type": "docs", "section": "Documentation"},
        {"type": "refactor", "section": "Code Refactoring"},
        {"type": "perf", "section": "Performance Improvements"},
        {"type": "deps", "section": "Dependencies"},
        {"type": "ci", "section": "Continuous Integration"},
        {"type": "revert", "section": "Reverts"}
      ]
    }
  }
}
```

### .release-please-manifest.json

```json
{
  ".": "0.4.0"
}
```

現在のバージョンを記録します。release-pleaseが自動更新します。

## 🎯 各種リリースタイプの実行例

### パッチリリース（バグ修正）

```bash
git commit -m "fix: Resolve crash when processing corrupted EPUB files"
git push origin main
# → 0.4.0 → 0.4.1
```

### マイナーリリース（新機能）

```bash
git commit -m "feat: Add dark mode support"
git push origin main
# → 0.4.0 → 0.5.0
```

### メジャーリリース（破壊的変更）

```bash
git commit -m "feat!: Redesign settings API

BREAKING CHANGE: Settings configuration format has changed"
git push origin main
# → 0.4.0 → 1.0.0
```

## ✅ リリース前チェックリスト

### 開発者向け

- [ ] すべてのテストが通る（`pnpm test`）
- [ ] 統合テストが通る（`pnpm test:integration`）
- [ ] Lintエラーがない（`pnpm lint`）
- [ ] TypeScriptコンパイルが通る（`pnpm typecheck`）
- [ ] ビルドが成功する（`pnpm build`）
- [ ] Conventional Commitsルールに従っている

### Release PR確認時

- [ ] CHANGELOGの内容が正確
- [ ] バージョン番号が適切
- [ ] PR Checksがすべて成功している（✅マークを確認）
- [ ] 重要な変更が含まれている場合、追加のテストを実行
- [ ] 破壊的変更がある場合、マイグレーションガイドを作成

### リリース実行前

- [ ] Release PRがマージ済みである
- [ ] mainブランチが最新の状態である
- [ ] 前回のリリースから24時間以内である（Publish GitHub Releaseの制限）

## 🚨 トラブルシューティング

### Release PRが作成されない場合

1. **コミットメッセージの確認**
   - Conventional Commitsの形式に従っているか確認
   - `feat:`、`fix:`などのタイプが正しく使用されているか確認

2. **GitHub Actionsの確認**
   - `.github/workflows/prepare-release-pr.yml`が正しく設定されているか確認
   - GitHub Actionsの実行ログを確認

3. **権限の確認**
   - `contents: write`と`pull-requests: write`の権限が設定されているか確認

### ビルドが失敗する場合

1. **ローカルビルドテスト**
   ```bash
   pnpm build
   pnpm dist:mac  # macOS
   pnpm dist:win  # Windows
   ```

2. **依存関係の確認**
   ```bash
   pnpm install --frozen-lockfile
   pnpm typecheck
   pnpm test
   ```

3. **Node.jsバージョン**
   - Node.js 24.0.0以上を使用していることを確認

### Publish GitHub Releaseが失敗する場合

1. **「No recently merged release PR found」エラー**
   - Release PRがマージされているか確認
   - マージから24時間以内であるか確認
   - PRタイトルが「chore(main): release」で始まっているか確認

2. **ビルドが失敗する場合**
   - `skip_build`オプションをチェックしてリリースのみ実行
   - 後で手動でビルドを実行

### 緊急時の手動リリース

release-pleaseが機能しない場合の手動リリース方法：

```bash
# 1. バージョンを手動更新
npm version patch  # または minor, major

# 2. 手動でCHANGELOGを更新
vim CHANGELOG.md

# 3. コミットとプッシュ
git add .
git commit -m "chore: Release v0.4.1"
git push origin main --follow-tags

# 4. GitHub Releaseを手動作成
gh release create v0.4.1 --title "v0.4.1" --notes "$(cat CHANGELOG.md | sed -n '/## \[0.4.1\]/,/## \[/p' | head -n -1)"
```

## 📚 参考資料

- [release-please公式ドキュメント](https://github.com/googleapis/release-please)
- [Conventional Commits](https://www.conventionalcommits.org/ja/)
- [セマンティックバージョニング](https://semver.org/lang/ja/)
- [GitHub Actions Documentation](https://docs.github.com/ja/actions)

## 🔧 カスタマイズ

### CHANGELOGセクションの追加

新しいコミットタイプを追加する場合：

```json
{
  "changelog-sections": [
    {"type": "feat", "section": "Features"},
    {"type": "security", "section": "Security"},
    {"type": "deprecated", "section": "Deprecated"}
  ]
}
```

### リリースノートのカスタマイズ

release-please-config.jsonで以下を設定可能：

```json
{
  "release-notes-header": "## What's Changed",
  "pull-request-title-pattern": "chore${scope}: release${component} ${version}",
  "pull-request-header": "This PR was generated by release-please."
}
```

## 🎉 まとめ

release-pleaseの導入により、リリースプロセスは大幅に自動化され、以下のメリットがあります：

- **⚡ 迅速なリリース**: コミットから数分でリリース可能
- **🔒 一貫性**: 標準化されたリリースプロセス
- **📖 自動ドキュメント**: CHANGELOGの自動生成
- **🚀 継続的デリバリー**: プッシュからリリースまで完全自動化
- **🛡️ 安全性**: Pull Requestベースのレビュー可能なリリース

conventional commitsを採用することで、チーム全体でのリリース品質向上も実現されています。