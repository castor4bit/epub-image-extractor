# Release-Please用ラベル作成

以下のコマンドでリポジトリに必要なラベルを作成できます：

```bash
# GitHub CLI を使用してラベルを作成
gh label create "autorelease: pending" --description "Release PR created by release-please" --color "FFD700"
gh label create "autorelease: tagged" --description "Release tagged by release-please" --color "32CD32"
gh label create "autorelease: snapshot" --description "Snapshot release" --color "FF4500"
```

または、GitHub UIで手動作成：

1. リポジトリの「Issues」タブ
2. 「Labels」をクリック
3. 「New label」で以下を作成：
   - Name: `autorelease: pending`
   - Description: `Release PR created by release-please`
   - Color: `#FFD700`

## 注意

現在のワークフローでは `skip-labeling: true` を設定しているため、ラベル作成は不要です。