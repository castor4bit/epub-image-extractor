# リリースプロセス

## 自動リリースフロー

v0.4.0のような新しいバージョンをリリースする際の手順です。

### 1. 事前準備

- [ ] すべてのコードがmainブランチにマージされている
- [ ] テストがすべて通過している（`npm test`）
- [ ] ビルドが成功する（`npm run build`）
- [ ] 必要に応じてドキュメントが更新されている

### 2. リリース実行

#### 完全自動化リリース（推奨）

```bash
# マイナーバージョンアップ（例: 0.3.0 → 0.4.0）
npm run release:complete
```

このコマンドは以下を自動実行します：
1. standard-versionでCHANGELOGを更新
2. package.jsonのバージョンを更新
3. バージョンバッジを自動更新（README.md, README.ja.md）
4. gitタグを作成
5. 変更をリモートにプッシュ
6. GitHub Releaseを作成

#### 手動リリース

個別にステップを実行したい場合：

```bash
# 1. ドライラン（変更内容を確認）
npm run release:dry

# 2. リリース実行
npm run release:minor    # マイナーバージョン（0.x.0）
# または
npm run release:patch    # パッチバージョン（0.0.x）
# または
npm run release:major    # メジャーバージョン（x.0.0）

# 3. 変更をプッシュ
git push --follow-tags origin main

# 4. GitHub Releaseを作成
node scripts/create-release.js
```

### 3. リリース後の確認

- [ ] GitHubでリリースが作成されている
- [ ] CHANGELOGが正しく更新されている
- [ ] README.mdのバージョンバッジが更新されている
- [ ] README.ja.mdのバージョンバッジが更新されている

### 4. ビルド配布物の作成

リリースタグが作成されたら、各プラットフォーム用のビルドを作成：

```bash
# Windows用
npm run dist:win

# macOS用
npm run dist:mac

```

ビルド成果物は`release/`ディレクトリに作成されます。

### トラブルシューティング

#### GitHub CLIがインストールされていない場合

```bash
# macOS
brew install gh

# Windows (Scoop)
scoop install gh

# 認証
gh auth login
```

#### バージョンバッジが更新されない場合

手動で更新：
```bash
npm run version:update-badges
```

## カスタマイズ

### CHANGELOGのフォーマット

`.versionrc.json`でコミットタイプとセクションをカスタマイズできます。

### リリースノートのテンプレート

`scripts/create-release.js`でGitHub Releaseのフォーマットをカスタマイズできます。