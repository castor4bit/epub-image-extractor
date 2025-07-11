# Changelog

All notable changes to this project will be documented in this file. See [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog) for commit guidelines.

## [0.2.0](https://github.com/castor4bit/epub-image-extractor/compare/v0.1.0...v0.2.0) (2025-07-10)

### Features

* CompactDropZoneのデザインを初期状態と統一 ([ddbad0e](https://github.com/castor4bit/epub-image-extractor/commit/ddbad0e))
* AboutDialogのUI改善とアプリケーションアイコンの統合 ([7d94349](https://github.com/castor4bit/epub-image-extractor/commit/7d94349))
* アプリケーション内でバージョン情報を確認できる機能を追加 ([4bdbf4a](https://github.com/castor4bit/epub-image-extractor/commit/4bdbf4a))
* CHANGELOG自動化とリリースドキュメントの充実 ([24ff892](https://github.com/castor4bit/epub-image-extractor/commit/24ff892))
* Add filename options for original name and page-spread info ([0ecd46d](https://github.com/castor4bit/epub-image-extractor/commit/0ecd46d))
* Add page-spread properties support to image filenames ([623c544](https://github.com/castor4bit/epub-image-extractor/commit/623c544))
* 画像ファイル名に元のファイル名を含める ([ac0bc30](https://github.com/castor4bit/epub-image-extractor/commit/ac0bc30))
* 画像処理の進捗表示を改善 ([7f7955d](https://github.com/castor4bit/epub-image-extractor/commit/7f7955d))
* 個別ファイル完了時に即座に「出力先を開く」ボタンを表示 ([3e3e583](https://github.com/castor4bit/epub-image-extractor/commit/3e3e583))

### Bug Fixes

* ZIPファイルエラーメッセージの階層化と重複解消 ([42233a8](https://github.com/castor4bit/epub-image-extractor/commit/42233a8))
* テスト環境でのバージョン情報API対応とElectron依存関係を修正 ([53b7a07](https://github.com/castor4bit/epub-image-extractor/commit/53b7a07))
* CHANGELOG自動化の重複処理を解消 ([c57744d](https://github.com/castor4bit/epub-image-extractor/commit/c57744d))

### Documentation

* サードパーティライセンス情報を追加 ([d15a7e1](https://github.com/castor4bit/epub-image-extractor/commit/d15a7e1))

## [0.1.0] - 2025-07-09

### Features

* Windowsポータブル版の配布設定を追加 ([4c95535](https://github.com/castor4bit/epub-image-extractor/commit/4c95535))
* アプリケーションアイコンの設定を準備 ([7d62c20](https://github.com/castor4bit/epub-image-extractor/commit/7d62c20))
* Add filename options for original name and page-spread info ([0ecd46d](https://github.com/castor4bit/epub-image-extractor/commit/0ecd46d))
* Add page-spread properties support to image filenames ([623c544](https://github.com/castor4bit/epub-image-extractor/commit/623c544))
* 画像ファイル名に元のファイル名を含める ([ac0bc30](https://github.com/castor4bit/epub-image-extractor/commit/ac0bc30))
* 画像処理の進捗表示を改善 ([7f7955d](https://github.com/castor4bit/epub-image-extractor/commit/7f7955d))
* 個別ファイル完了時に即座に「出力先を開く」ボタンを表示 ([3e3e583](https://github.com/castor4bit/epub-image-extractor/commit/3e3e583))
* 処理状況に待機中の件数を表示 ([2e6f69d](https://github.com/castor4bit/epub-image-extractor/commit/2e6f69d))
* ウィンドウ最前面表示機能を追加 ([ee39e93](https://github.com/castor4bit/epub-image-extractor/commit/ee39e93))
* 処理結果の永続表示と進捗表示の改善 ([620091e](https://github.com/castor4bit/epub-image-extractor/commit/620091e))
* ウィンドウサイズと設定項目の調整 ([37257b5](https://github.com/castor4bit/epub-image-extractor/commit/37257b5))
* 重複出力先の自動回避処理を実装 ([092e422](https://github.com/castor4bit/epub-image-extractor/commit/092e422))

### Bug Fixes

* アプリケーション名の表記を整理 ([2a1a5cd](https://github.com/castor4bit/epub-image-extractor/commit/2a1a5cd))
* macOSでウィンドウを閉じたらアプリケーションを終了するように変更 ([8cc411b](https://github.com/castor4bit/epub-image-extractor/commit/8cc411b))
* EPUBファイル解析エラーが2重に出力される問題を修正 ([5587b14](https://github.com/castor4bit/epub-image-extractor/commit/5587b14))
* テストのモック設定を修正しビルドエラーを解消 ([4b110cd](https://github.com/castor4bit/epub-image-extractor/commit/4b110cd))
* エラーハンドリング統一後のテスト修正 ([614180f](https://github.com/castor4bit/epub-image-extractor/commit/614180f))
* 二重スクロールの問題を解消 ([2565372](https://github.com/castor4bit/epub-image-extractor/commit/2565372))
* 最前面表示をデフォルトで有効に変更 ([759ba02](https://github.com/castor4bit/epub-image-extractor/commit/759ba02))
* fileIdの一貫性を確保して重複表示を解消 ([0f91530](https://github.com/castor4bit/epub-image-extractor/commit/0f91530))
* 進捗表示の重複と出力先ボタン表示の問題を修正 ([41ceff3](https://github.com/castor4bit/epub-image-extractor/commit/41ceff3))
* テストファイルの型エラーを修正 ([f3b5d22](https://github.com/castor4bit/epub-image-extractor/commit/f3b5d22))
* 設定ファイルのセキュリティ強化 ([4e4ac96](https://github.com/castor4bit/epub-image-extractor/commit/4e4ac96))

### Documentation

* ビルド検証の必須化をCLAUDE.mdに記録 ([b7fddfb](https://github.com/castor4bit/epub-image-extractor/commit/b7fddfb))