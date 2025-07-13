# リリースガイド

## 概要

このドキュメントでは、EPUB Image Extractorのリリース手順について説明します。

## 📝 CHANGELOG管理について

### 手動管理（シンプル）
リリース前に手動でCHANGELOG.mdを更新する方法です。初心者におすすめです。

### 自動管理（Conventional Commits）
コミットメッセージの規則に従って自動でCHANGELOGを生成する方法です。チーム開発におすすめです。

詳細は「CHANGELOG管理方法」セクションを参照してください。

## 🚀 リリース方法

### 方法1: 手動CHANGELOG + GitHub Actions（推奨初心者向け）

#### 前提条件
- mainブランチに最新のコードがマージされている
- すべてのテストが通っている

#### 手順

1. **CHANGELOGの手動更新**
   ```bash
   # CHANGELOG.mdを編集
   vim CHANGELOG.md
   ```
   
   ```markdown
   ## [Unreleased]

   ### Added
   - 新しいバッチ処理機能

   ### Fixed
   - 大容量EPUBファイルのメモリ使用量改善

   ## [0.1.1] - 2025-07-10
   
   ### Added
   - 新機能の説明
   
   ### Fixed
   - バグ修正の説明
   ```

2. **CHANGELOGをコミット**
   ```bash
   git add CHANGELOG.md
   git commit -m "docs: v0.1.1のCHANGELOGを更新"
   ```

3. **バージョンの更新**
   ```bash
   # パッチバージョン (0.1.0 → 0.1.1)
   npm version patch -m "chore: release v%s"
   
   # マイナーバージョン (0.1.0 → 0.2.0)
   npm version minor -m "chore: release v%s"
   
   # メジャーバージョン (0.1.0 → 1.0.0)
   npm version major -m "chore: release v%s"
   ```

4. **変更をプッシュ**
   ```bash
   git push origin main --follow-tags
   ```

5. **GitHub Actionsが自動的に実行**
   - テストの実行
   - 各プラットフォーム用のビルド
   - GitHubリリースの作成（CHANGELOGから自動抽出）
   - ビルド成果物のアップロード

### 方法2: 自動CHANGELOG + GitHub Actions（推奨チーム開発）

#### 前提条件
- Conventional Commitsのルールに従ったコミットメッセージ
- mainブランチに最新のコードがマージされている
- すべてのテストが通っている

#### 手順

1. **開発中のコミット（Conventional Commits形式）**
   ```bash
   # 新機能
   git commit -m "feat: バッチ処理機能を追加"
   
   # バグ修正
   git commit -m "fix: 大容量EPUBファイルのメモリリーク修正"
   
   # ドキュメント
   git commit -m "docs: READMEにバッチ処理の説明を追加"
   
   # リファクタリング
   git commit -m "refactor: 画像処理ロジックの最適化"
   
   # テスト
   git commit -m "test: バッチ処理のユニットテストを追加"
   ```

2. **バージョンアップ（CHANGELOG自動生成・更新）**
   ```bash
   # CHANGELOGの自動生成とバージョンアップを一度に実行
   npm version patch -m "chore: release v%s"
   ```
   
   この時、以下が自動的に実行されます：
   - 前回リリース以降のコミットからCHANGELOG差分を生成
   - package.jsonのバージョン更新
   - Gitタグの作成

3. **生成されたCHANGELOGを確認・調整（必要に応じて）**
   ```bash
   # 生成されたCHANGELOGを確認
   cat CHANGELOG.md
   
   # 必要に応じて手動で調整
   vim CHANGELOG.md
   git add CHANGELOG.md
   git commit --amend --no-edit  # 直前のリリースコミットに統合
   ```

4. **変更をプッシュ**
   ```bash
   git push origin main --follow-tags
   ```

#### 📝 手動調整が不要な場合のシンプル手順

```bash
# 開発コミット（Conventional Commits形式）
git commit -m "feat: 新機能を追加"
git commit -m "fix: バグを修正"

# リリース（CHANGELOG自動生成付き）
npm version patch -m "chore: release v%s"

# プッシュ
git push origin main --follow-tags
```

**手動調整が不要であれば手順2と3は省略可能です！**

### 方法3: ローカルビルド + 手動リリース

CI/CDを使わずにローカルでビルドしてリリースする方法です。

#### 手順

1. **各プラットフォーム用にビルド**

   **macOS**
   ```bash
   # Intel Mac用
   npm run dist:mac-x64
   
   # Apple Silicon用
   npm run dist:mac-arm64
   
   # ユニバーサルビルド（両方）
   npm run dist:mac
   ```
   
   **Windows**
   ```bash
   # インストーラー + ポータブル版
   npm run dist:win
   ```
   
   **Linux**
   ```bash
   # AppImage + deb
   npm run dist:linux
   ```

2. **成果物の確認**
   ```bash
   ls -la release/
   ```

3. **GitHubでリリースを作成**
   - GitHubのReleases画面で新規リリース作成
   - `release/`ディレクトリ内のファイルをアップロード
   - CHANGELOGから該当バージョンの内容をコピー&ペースト

## 📋 CHANGELOG管理方法

### 手動管理

#### テンプレート
CHANGELOG.mdは以下の形式で管理します：

```markdown
# Changelog

## [Unreleased]

### Added
- 新機能の説明

### Changed
- 変更された機能の説明

### Fixed
- 修正されたバグの説明

## [0.1.1] - 2025-07-10

### Added
- 実際にリリースされた新機能

### Fixed
- 実際に修正されたバグ
```

#### 更新手順
1. 開発中は`[Unreleased]`セクションに変更を記録
2. リリース時に`[Unreleased]`を新しいバージョン番号に変更
3. 新しい空の`[Unreleased]`セクションを作成

### 自動管理（Conventional Commits）

#### コミットメッセージのルール
```bash
<type>(<scope>): <subject>

<body>

<footer>
```

#### タイプ一覧
- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント
- `style`: フォーマット（機能に影響しない）
- `refactor`: リファクタリング
- `test`: テスト
- `chore`: その他（ビルド、依存関係更新など）
- `perf`: パフォーマンス改善
- `ci`: CI/CD関連
- `build`: ビルドシステム関連

#### 例
```bash
feat(ui): バッチ処理のプログレスバーを追加

ユーザーが処理の進捗を視覚的に確認できるよう、
プログレスバーコンポーネントを実装しました。

Closes #123
```

#### 自動生成コマンド
```bash
# CHANGELOGを生成
npm run changelog

# 生成されたCHANGELOGを確認
cat CHANGELOG.md
```

## ビルド成果物

ビルドが成功すると、`release/`ディレクトリに以下のファイルが生成されます：

### macOS
- `EPUB-Image-Extractor-{version}-arm64.dmg` - Apple Silicon用
- `EPUB-Image-Extractor-{version}-x64.dmg` - Intel Mac用

### Windows
- `EPUB-Image-Extractor-Setup-{version}.exe` - インストーラー
- `EPUB-Image-Extractor-{version}.exe` - ポータブル版

### Linux
- `EPUB-Image-Extractor-{version}.AppImage` - AppImage形式
- `epub-image-extractor_{version}_amd64.deb` - Debian/Ubuntu用

## コード署名

### macOS
1. Apple Developer Programに登録
2. Developer ID Application証明書を取得
3. GitHub Secretsに以下を設定：
   - `MACOS_CERTIFICATE`: 証明書のBase64エンコード
   - `MACOS_CERTIFICATE_PWD`: 証明書のパスワード
   - `APPLE_ID`: Apple ID
   - `APPLE_ID_PASSWORD`: App用パスワード
   - `APPLE_TEAM_ID`: チームID

### Windows
1. コード署名証明書を取得
2. GitHub Secretsに以下を設定：
   - `WINDOWS_CERTIFICATE`: 証明書のBase64エンコード
   - `WINDOWS_CERTIFICATE_PWD`: 証明書のパスワード

## 🎯 推奨リリース方法の選択指針

### 初回リリース・個人開発
- **方法1（手動CHANGELOG + GitHub Actions）**を推奨
- 理由：シンプルで理解しやすく、自動ビルドの恩恵を受けられる

### チーム開発・継続的なリリース
- **方法2（自動CHANGELOG + GitHub Actions）**を推奨
- 理由：コミットメッセージの統一とCHANGELOGの自動化で品質向上

### 特殊な要件がある場合
- **方法3（ローカルビルド）**を使用
- 理由：特別なビルド環境や署名プロセスが必要な場合

## ✅ リリース前チェックリスト

### 共通項目
- [ ] すべてのテストが通る（`npm test`）
- [ ] Lintエラーがない（`npm run lint`）
- [ ] TypeScriptコンパイルが通る（`npm run typecheck`）
- [ ] ビルドが成功する（`npm run build`）
- [ ] CHANGELOGが更新されている

### GitHub Actions使用時
- [ ] GitHub Actionsの権限が正しく設定されている
- [ ] Secretsが設定されている（コード署名を使う場合）
- [ ] mainブランチが最新状態である

### ローカルビルド時
- [ ] 必要なプラットフォームでビルドテスト済み
- [ ] ビルド成果物の動作確認済み
- [ ] GitHubリリースページの準備完了

## 自動アップデート

electron-updaterを使用した自動アップデートを実装する場合：

1. `package.json`の`publish`設定を更新
2. リリースサーバーまたはGitHub Releasesを使用
3. アプリケーション起動時にアップデートをチェック

## トラブルシューティング

### ビルドが失敗する場合
- Node.jsのバージョンが24.0.0以上であることを確認
- `node_modules`を削除して`npm ci`を実行
- electron-builderのキャッシュをクリア: `npx electron-builder install-app-deps`

### 署名エラー
- 証明書の有効期限を確認
- Keychainアクセス（macOS）で証明書の信頼設定を確認
- Windows: signtoolのパスが正しいことを確認

### GitHub Actions エラー
- Secretsが正しく設定されているか確認
- ワークフローの権限設定を確認
- アーティファクトのアップロード制限（容量）を確認