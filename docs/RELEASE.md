# リリースガイド

## 概要

EPUB Image Extractorは**release-please**を使用した自動リリース システムを採用しています。このドキュメントでは、リリースプロセスの詳細と運用方法について説明します。

## 🚀 リリースプロセスの仕組み

### 完全自動化されたリリースフロー

1. **開発**: conventional commitsでコードを開発
2. **プッシュ**: `main`ブランチにpush（リリースは自動実行されない）
3. **手動リリース**: GitHub Actionsで「Release Please」ワークフローを手動実行
4. **Release PR作成**: release-pleaseがRelease PRを作成
5. **リリース**: Release PRをマージするとリリース実行
6. **ビルド**: 自動的に各プラットフォーム用のビルド実行
7. **配布**: GitHub Releaseにビルド成果物を自動アップロード

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

### 2. 手動リリース実行

GitHub Actionsで「Release Please」ワークフローを手動実行します：

1. **GitHub Actionsページに移動**: リポジトリの「Actions」タブ
2. **「Release Please」ワークフローを選択**
3. **「Run workflow」をクリック**
4. **リリースタイプを選択**:
   - `auto`: コミット履歴から自動決定（推奨）
   - `patch`: パッチリリース (0.4.0 → 0.4.1)
   - `minor`: マイナーリリース (0.4.0 → 0.5.0)
   - `major`: メジャーリリース (0.4.0 → 1.0.0)
5. **「Run workflow」で実行**

ワークフローが実行されると、release-pleaseが自動的に：

- コミット履歴を分析
- セマンティックバージョニングに基づいてバージョン決定（またはマニュアル指定）
- CHANGELOGを自動生成
- package.jsonのバージョンを更新
- **Release PR**を作成

### 3. リリース実行

**Release PR**をマージすると：

1. **タグ作成**: `v0.4.1`のようなタグが自動作成
2. **ビルド開始**: GitHub Actionsがビルドを開始
3. **成果物生成**: 
   - macOS: `EPUB-Image-Extractor-{version}-arm64.dmg`
   - macOS: `EPUB-Image-Extractor-{version}-x64.dmg`
   - Windows: `EPUB-Image-Extractor-{version}-x64-Setup.exe`
   - Windows: `EPUB-Image-Extractor-{version}-x64-Portable.exe`
4. **リリース作成**: GitHub Releaseが作成され、成果物がアップロード

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

# Release PRが自動作成されるので、すぐにマージ
```

### 特定バージョンでのリリース

通常は自動バージョン決定を使用しますが、特別な場合は手動調整可能：

```bash
# 強制的にメジャーバージョンアップ
git commit -m "feat!: Complete UI redesign

BREAKING CHANGE: All UI components have been redesigned with new API"
```

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

- [ ] すべてのテストが通る（`npm test`）
- [ ] 統合テストが通る（`npm run test:integration`）
- [ ] Lintエラーがない（`npm run lint`）
- [ ] TypeScriptコンパイルが通る（`npm run typecheck`）
- [ ] ビルドが成功する（`npm run build`）
- [ ] Conventional Commitsルールに従っている

### Release PR確認時

- [ ] CHANGELOGの内容が正確
- [ ] バージョン番号が適切
- [ ] 重要な変更が含まれている場合、追加のテストを実行
- [ ] 破壊的変更がある場合、マイグレーションガイドを作成

## 🚨 トラブルシューティング

### Release PRが作成されない場合

1. **コミットメッセージの確認**
   - Conventional Commitsの形式に従っているか確認
   - `feat:`、`fix:`などのタイプが正しく使用されているか確認

2. **GitHub Actionsの確認**
   - `.github/workflows/release-please.yml`が正しく設定されているか確認
   - GitHub Actionsの実行ログを確認

3. **権限の確認**
   - `contents: write`と`pull-requests: write`の権限が設定されているか確認

### ビルドが失敗する場合

1. **ローカルビルドテスト**
   ```bash
   npm run build
   npm run dist:mac  # macOS
   npm run dist:win  # Windows
   ```

2. **依存関係の確認**
   ```bash
   npm ci
   npm run typecheck
   npm test
   ```

3. **Node.jsバージョン**
   - Node.js 24.0.0以上を使用していることを確認

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