# Contributing to EPUB Image Extractor

## Pull Request のマージ方法

このリポジトリでは、CHANGELOGを整理された状態に保つため、**Squash and merge**を使用してください。

### なぜSquash Mergeを使うのか

- PR内の個別コミットがCHANGELOGに含まれることを防ぎます
- 1つのPRが1つのCHANGELOGエントリーになります
- PR内の細かい修正コミット（typo修正など）が省略されます

### マージ時の手順

1. PRレビューが完了したら「Merge pull request」ボタンのドロップダウンから「Squash and merge」を選択
2. コミットメッセージを確認・編集（Conventional Commits形式に従う）
   - `feat:` - 新機能
   - `fix:` - バグ修正
   - `docs:` - ドキュメントのみの変更
   - `refactor:` - 機能に影響しないコードの変更
   - `perf:` - パフォーマンス改善
   - `test:` - テストの追加・修正
   - `chore:` - ビルドプロセスやツールの変更
3. PRの主要な変更を適切に表現するメッセージにする

### 例

PR「ESLintの警告を修正」に以下のコミットが含まれている場合：
```
- fix: Exclude test files from ESLint
- fix: Update ESLint config  
- fix: Fix remaining warnings
- fix: typo
```

Squash merge時のコミットメッセージ：
```
fix: Resolve ESLint warnings across the codebase (#8)

- Exclude test files from ESLint checks
- Update ESLint configuration
- Fix all remaining warnings
```

これにより、CHANGELOGには1つのエントリーとして記載されます。