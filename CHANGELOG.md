## 0.2.0 (2025-07-10)

* feat: AboutDialogのUI改善とアプリケーションアイコンの統合 ([7d94349](https://github.com/castor4bit/epub-image-extractor/commit/7d94349))
* feat: Add filename options for original name and page-spread info ([0ecd46d](https://github.com/castor4bit/epub-image-extractor/commit/0ecd46d))
* feat: Add page-spread properties support to image filenames ([623c544](https://github.com/castor4bit/epub-image-extractor/commit/623c544))
* feat: CHANGELOG自動化とリリースドキュメントの充実 ([24ff892](https://github.com/castor4bit/epub-image-extractor/commit/24ff892))
* feat: CompactDropZoneのデザインを初期状態と統一 ([ddbad0e](https://github.com/castor4bit/epub-image-extractor/commit/ddbad0e))
* feat: Windowsポータブル版の配布設定を追加 ([4c95535](https://github.com/castor4bit/epub-image-extractor/commit/4c95535))
* feat: アプリケーションアイコンの設定を準備 ([7d62c20](https://github.com/castor4bit/epub-image-extractor/commit/7d62c20))
* feat: アプリケーション内でバージョン情報を確認できる機能を追加 ([4bdbf4a](https://github.com/castor4bit/epub-image-extractor/commit/4bdbf4a))
* feat: ウィンドウサイズと設定項目の調整 ([37257b5](https://github.com/castor4bit/epub-image-extractor/commit/37257b5))
* feat: ウィンドウ最前面表示機能を追加 ([ee39e93](https://github.com/castor4bit/epub-image-extractor/commit/ee39e93))
* feat: 画像ファイル名に元のファイル名を含める ([ac0bc30](https://github.com/castor4bit/epub-image-extractor/commit/ac0bc30))
* feat: 画像処理の進捗表示を改善 ([7f7955d](https://github.com/castor4bit/epub-image-extractor/commit/7f7955d))
* feat: 個別ファイル完了時に即座に「出力先を開く」ボタンを表示 ([3e3e583](https://github.com/castor4bit/epub-image-extractor/commit/3e3e583))
* feat: 重複出力先の自動回避処理を実装 ([092e422](https://github.com/castor4bit/epub-image-extractor/commit/092e422))
* feat: 処理結果の永続表示と進捗表示の改善 ([620091e](https://github.com/castor4bit/epub-image-extractor/commit/620091e))
* feat: 処理状況に待機中の件数を表示 ([2e6f69d](https://github.com/castor4bit/epub-image-extractor/commit/2e6f69d))
* fix: @gxl/epub-parserの代わりにAdmZipを使用した手動EPUB解析実装 ([69b15b5](https://github.com/castor4bit/epub-image-extractor/commit/69b15b5))
* fix: @typescript-eslintをv8.36.0にアップデートしてTypeScript 5.8.3サポートを追加 ([3316297](https://github.com/castor4bit/epub-image-extractor/commit/3316297))
* fix: AdmZipを使用した画像抽出ロジックの修正 ([85789ce](https://github.com/castor4bit/epub-image-extractor/commit/85789ce))
* fix: CHANGELOG自動化の重複処理を解消 ([c57744d](https://github.com/castor4bit/epub-image-extractor/commit/c57744d))
* fix: EPUB3 Navigation Documentからのチャプター情報抽出を実装 ([b952f1a](https://github.com/castor4bit/epub-image-extractor/commit/b952f1a))
* fix: EPUBファイル解析エラーが2重に出力される問題を修正 ([5587b14](https://github.com/castor4bit/epub-image-extractor/commit/5587b14))
* fix: ESLintエラーをすべて修正し、コード品質を改善 ([f4aadf4](https://github.com/castor4bit/epub-image-extractor/commit/f4aadf4))
* fix: ESLintエラーを修正（未使用インポートの削除） ([369cd9c](https://github.com/castor4bit/epub-image-extractor/commit/369cd9c))
* fix: ESLintのDeprecationWarningを解消 ([c32f293](https://github.com/castor4bit/epub-image-extractor/commit/c32f293))
* fix: ESLintの警告を修正 ([0df8882](https://github.com/castor4bit/epub-image-extractor/commit/0df8882))
* fix: fileIdの一貫性を確保して重複表示を解消 ([0f91530](https://github.com/castor4bit/epub-image-extractor/commit/0f91530))
* fix: macOSでウィンドウを閉じたらアプリケーションを終了するように変更 ([8cc411b](https://github.com/castor4bit/epub-image-extractor/commit/8cc411b))
* fix: package-lock.jsonを更新してnpm ciエラーを解消 ([fd16ac0](https://github.com/castor4bit/epub-image-extractor/commit/fd16ac0))
* fix: ZIPファイルエラーメッセージの階層化と重複解消 ([42233a8](https://github.com/castor4bit/epub-image-extractor/commit/42233a8))
* fix: アプリケーション名の表記を整理 ([2a1a5cd](https://github.com/castor4bit/epub-image-extractor/commit/2a1a5cd))
* fix: エラーハンドリング統一後のテスト修正 ([614180f](https://github.com/castor4bit/epub-image-extractor/commit/614180f))
* fix: チャプターごとの画像分類を正しく実装 ([819b44a](https://github.com/castor4bit/epub-image-extractor/commit/819b44a))
* fix: テストのモック設定を修正しビルドエラーを解消 ([4b110cd](https://github.com/castor4bit/epub-image-extractor/commit/4b110cd))
* fix: テストファイルの型エラーを修正 ([f3b5d22](https://github.com/castor4bit/epub-image-extractor/commit/f3b5d22))
* fix: テスト環境でのバージョン情報API対応とElectron依存関係を修正 ([53b7a07](https://github.com/castor4bit/epub-image-extractor/commit/53b7a07))
* fix: ビルドスクリプトの重複実行を修正 ([0c086b3](https://github.com/castor4bit/epub-image-extractor/commit/0c086b3))
* fix: 最前面表示をデフォルトで有効に変更 ([759ba02](https://github.com/castor4bit/epub-image-extractor/commit/759ba02))
* fix: 進捗表示の重複と出力先ボタン表示の問題を修正 ([41ceff3](https://github.com/castor4bit/epub-image-extractor/commit/41ceff3))
* fix: 設定ファイルのセキュリティ強化 ([4e4ac96](https://github.com/castor4bit/epub-image-extractor/commit/4e4ac96))
* fix: 二重スクロールの問題を解消 ([2565372](https://github.com/castor4bit/epub-image-extractor/commit/2565372))
* docs: CLAUDE.md の開発ルールを整理し、TDDとコミット粒度のルールを追加 ([2ae6ceb](https://github.com/castor4bit/epub-image-extractor/commit/2ae6ceb))
* docs: CLAUDE.md をプロジェクト仕様書として再構成 ([1a9077e](https://github.com/castor4bit/epub-image-extractor/commit/1a9077e))
* docs: README.md と README.ja.md を v0.1.0 の内容に更新 ([a30899a](https://github.com/castor4bit/epub-image-extractor/commit/a30899a))
* docs: サードパーティライセンス情報を追加 ([d15a7e1](https://github.com/castor4bit/epub-image-extractor/commit/d15a7e1))
* docs: ビルド検証の必須化をCLAUDE.mdに記録 ([b7fddfb](https://github.com/castor4bit/epub-image-extractor/commit/b7fddfb))
* test: 実ファイルに依存しない動的テストデータ生成を実装 ([a92d655](https://github.com/castor4bit/epub-image-extractor/commit/a92d655))
* test: 重要モジュールのテストを追加 ([935a8be](https://github.com/castor4bit/epub-image-extractor/commit/935a8be))
* test: 落ちているテストを修正し、すべてのテストを成功させる ([e5a3e34](https://github.com/castor4bit/epub-image-extractor/commit/e5a3e34))
* chore: .nvmrc を削除し、pnpm サポートを追加 ([1e96269](https://github.com/castor4bit/epub-image-extractor/commit/1e96269))
* chore: Node.js の最小要件を 20.0.0 に更新 ([9c6a9d3](https://github.com/castor4bit/epub-image-extractor/commit/9c6a9d3))
* chore: release v0.1.0 with application icon ([3cf17be](https://github.com/castor4bit/epub-image-extractor/commit/3cf17be))
* chore: 不要なテストファイルを削除し.gitignoreを更新 ([7cefd51](https://github.com/castor4bit/epub-image-extractor/commit/7cefd51))
* ci: GitHub Actions のアクションを最新版に更新 ([4a61a7e](https://github.com/castor4bit/epub-image-extractor/commit/4a61a7e))
* refactor: エラーハンドリングの統一 ([3bd36ad](https://github.com/castor4bit/epub-image-extractor/commit/3bd36ad))
* refactor: 型定義の改善とany型の排除 ([14f323d](https://github.com/castor4bit/epub-image-extractor/commit/14f323d))
* refactor: 不要な依存関係の削除とメモリリークの修正 ([ae5c5ba](https://github.com/castor4bit/epub-image-extractor/commit/ae5c5ba))
* jsdomモジュールエラーを修正し、アプリケーションの起動を確認 ([df4f967](https://github.com/castor4bit/epub-image-extractor/commit/df4f967))
* JSDOMを削除して正規表現ベースの画像抽出に変更 ([9608e24](https://github.com/castor4bit/epub-image-extractor/commit/9608e24))
* UI改善とエラーハンドリング強化 ([221beb8](https://github.com/castor4bit/epub-image-extractor/commit/221beb8))
* コア機能とUI実装 ([84572bf](https://github.com/castor4bit/epub-image-extractor/commit/84572bf))
* セキュリティ対策とドキュメント整備を完了 ([a8d959e](https://github.com/castor4bit/epub-image-extractor/commit/a8d959e))
* テストとLintエラー修正 ([1b9c5c3](https://github.com/castor4bit/epub-image-extractor/commit/1b9c5c3))
* 最終リリース準備 ([3dc3c41](https://github.com/castor4bit/epub-image-extractor/commit/3dc3c41))
* 初期プロジェクト設定 ([ce20360](https://github.com/castor4bit/epub-image-extractor/commit/ce20360))
* 部分的実装項目を完了 ([ba1fd5c](https://github.com/castor4bit/epub-image-extractor/commit/ba1fd5c))



# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- 新機能の説明

### Changed
- 変更された機能の説明

### Deprecated
- 廃止予定の機能

### Removed
- 削除された機能

### Fixed
- 修正されたバグ

### Security
- セキュリティ関連の修正

## [0.1.0] - 2025-07-09

### Added
- EPUB画像抽出の基本機能
- 章別画像整理機能
- ドラッグ&ドロップインターフェース
- 並列処理による複数ファイル対応
- 設定ウィンドウ（出力先、言語、ウィンドウ設定）
- 画像ファイル名オプション（元ファイル名、見開き情報）
- クロスプラットフォーム対応（Windows/macOS）
- Windows ポータブル版配布
- 包括的テストスイート
- TypeScript型安全性
- ESLintコード品質チェック
- 動的テストデータ生成

### Fixed
- EPUBパース処理の安定性向上
- メモリリーク対策
- エラーハンドリングの統一
- TypeScript 5.8.3対応

[Unreleased]: https://github.com/yourusername/epub-image-extractor/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/yourusername/epub-image-extractor/releases/tag/v0.1.0