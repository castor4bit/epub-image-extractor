# リポジトリ設定ガイド

## 推奨されるGitHubリポジトリ設定

### Pull Requestのマージ設定

CHANGELOGを整理された状態に保つため、以下の設定を推奨します：

1. **GitHubリポジトリのSettings → Generalに移動**

2. **「Pull Requests」セクションで以下を設定**：
   - ✅ Allow squash merging（必須）
   - ⬜ Allow merge commits（非推奨）
   - ⬜ Allow rebase merging（オプション）

3. **デフォルトのコミットメッセージ設定**：
   - Squash merging: "Pull request title and description"を選択

### なぜこの設定が重要か

- **Squash mergingのみ許可**することで、PR内の個別コミットがCHANGELOGに含まれません
- 各PRが1つのコミットとして記録され、CHANGELOGも1つのエントリーになります
- コミット履歴がクリーンに保たれます

### 設定後の効果

#### Before（通常のマージ）
```
## [0.4.2] - 2025-07-17

### Bug Fixes
- fix: Exclude test files from ESLint
- fix: Update ESLint config  
- fix: Fix remaining warnings
- fix: typo
```

#### After（Squash merge）
```
## [0.4.2] - 2025-07-17

### Bug Fixes
- fix: Resolve ESLint warnings across the codebase (#8)
```

### 移行期の対応

既存のPRがある場合：
1. 新しいPRから Squash merge を使用開始
2. 既存のPRもマージ時に Squash merge を選択
3. 必要に応じて手動でCHANGELOGを整理