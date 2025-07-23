# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.5.2](https://github.com/castor4bit/epub-image-extractor/compare/v0.5.1...v0.5.2) (2025-07-23)


### Bug Fixes

* Fix ad-hoc signing issues in GitHub Actions workflow ([#30](https://github.com/castor4bit/epub-image-extractor/issues/30)) ([a33862f](https://github.com/castor4bit/epub-image-extractor/commit/a33862f3d38bbc7faf07d8ffbeb2c8c0536437ff))

## [0.5.1](https://github.com/castor4bit/epub-image-extractor/compare/v0.5.0...v0.5.1) (2025-07-22)


### Features

* Add folder drag-and-drop support ([#28](https://github.com/castor4bit/epub-image-extractor/issues/28)) ([3484805](https://github.com/castor4bit/epub-image-extractor/commit/34848055a52e8ecc1a11bac6a14b8a06067c862a))
* GitHub ActionsビルドにAd-hoc署名を追加 ([#27](https://github.com/castor4bit/epub-image-extractor/issues/27)) ([ba4d897](https://github.com/castor4bit/epub-image-extractor/commit/ba4d897b4dd036a653ac03aec898652a161b9e13))

## [0.5.0](https://github.com/castor4bit/epub-image-extractor/compare/v0.4.2...v0.5.0) (2025-07-22)


### ⚠ BREAKING CHANGES

* XML parsing now uses fast-xml-parser instead of xml2js. This improves performance and reduces bundle size.

### Features

* Implement two-stage manual release workflow ([9fc7db7](https://github.com/castor4bit/epub-image-extractor/commit/9fc7db70a7243089256c04697ed8a14b8c13cb77))
* Implement two-stage manual release workflow ([139a899](https://github.com/castor4bit/epub-image-extractor/commit/139a899fedf97e79bcc15d70e5caec2b081b6f2f))


### Bug Fixes

* ESLintの警告を解決 ([#25](https://github.com/castor4bit/epub-image-extractor/issues/25)) ([2bf5dd1](https://github.com/castor4bit/epub-image-extractor/commit/2bf5dd1eb9ef66c0042d895dee31faa780ca1bb9))
* Resolve pino logger errors in Electron environment ([1f6b988](https://github.com/castor4bit/epub-image-extractor/commit/1f6b9889de793da1b6a2a6721102e51899849feb))


### Documentation

* Update README files to reflect pino logging system ([#21](https://github.com/castor4bit/epub-image-extractor/issues/21)) ([88debe1](https://github.com/castor4bit/epub-image-extractor/commit/88debe1e27e11fb82ee484183f093531b8a2126a))


### Code Refactoring

* Migrate from winston to pino for logging ([5f362c9](https://github.com/castor4bit/epub-image-extractor/commit/5f362c9a11a85291e116df92fda2cb41bbf3fda1))
* Migrate from winston to pino for logging ([1d2c4cb](https://github.com/castor4bit/epub-image-extractor/commit/1d2c4cb5ef6c047a34980835b3ece89e2f6d9f42))
* Migrate from xml2js to fast-xml-parser ([#24](https://github.com/castor4bit/epub-image-extractor/issues/24)) ([56a4a95](https://github.com/castor4bit/epub-image-extractor/commit/56a4a95cbc1c513b9c43204e3529b76903a6db54))

## [0.4.2](https://github.com/castor4bit/epub-image-extractor/compare/v0.4.1...v0.4.2) (2025-07-17)


### Features

* Add resizable window support ([011bef3](https://github.com/castor4bit/epub-image-extractor/commit/011bef329491e9e802db47d69f6fce9bab81c289))
* Add resizable window support with persistent size/position ([9023cbf](https://github.com/castor4bit/epub-image-extractor/commit/9023cbfd4712f3351a145a1454314cc7a5017af1))
* Clear window bounds when resetting settings ([b6f9c3b](https://github.com/castor4bit/epub-image-extractor/commit/b6f9c3bdc811816238fdb6c7962d47f2de54339c))


### Bug Fixes

* Apply default window size immediately when clearing bounds ([f454f5e](https://github.com/castor4bit/epub-image-extractor/commit/f454f5e4371520c8e662850eefcdb218889b16cf))
* Enable automatic release on PR merge ([abaf919](https://github.com/castor4bit/epub-image-extractor/commit/abaf919e8b4ea3d8c7c10582110d24787d2cb753))
* Exclude test files and scripts from ESLint checks ([be0e6d9](https://github.com/castor4bit/epub-image-extractor/commit/be0e6d96373436a83737a5d5d337b73ef6cc891d))
* Exclude test files and scripts from ESLint checks ([79492d7](https://github.com/castor4bit/epub-image-extractor/commit/79492d75a81bef07458f5eda4ecb61e57d916d37))
* Prevent button text wrapping in settings window ([95fd691](https://github.com/castor4bit/epub-image-extractor/commit/95fd691951ada60ae60e87a2df94798fdfe874c8))
* Separate PR checks from release workflow ([729f2a2](https://github.com/castor4bit/epub-image-extractor/commit/729f2a253b0069439bee99e39466383caf5d2dbc))
* Separate PR checks from release workflow ([2bc2534](https://github.com/castor4bit/epub-image-extractor/commit/2bc2534d6583dd5256a5c46937ec1f16431011c9))
* Separate PR creation from release process ([62f56c5](https://github.com/castor4bit/epub-image-extractor/commit/62f56c519b20f2f70806a017a1d619ab8e616a5e))
* Separate PR creation from release process ([85691f4](https://github.com/castor4bit/epub-image-extractor/commit/85691f4ac3a5d275fadaa013cb8979251ebafeb6))
* Use delete method instead of setting undefined for windowBounds ([12038bd](https://github.com/castor4bit/epub-image-extractor/commit/12038bde3cfab92c7fe31e65167d4bb002135cf6))


### Documentation

* Update release documentation for new workflow ([5a447cf](https://github.com/castor4bit/epub-image-extractor/commit/5a447cf471fb754832322b7ecefebf22a7447631))


### Code Refactoring

* Centralize window size constants ([193ea6d](https://github.com/castor4bit/epub-image-extractor/commit/193ea6dd82a722290946e805e6bdca3a900cd5fb))

## [0.4.1](https://github.com/castor4bit/epub-image-extractor/compare/v0.4.0...v0.4.1) (2025-07-17)


### Features

* Change processing status title to be more appropriate ([09c49a5](https://github.com/castor4bit/epub-image-extractor/commit/09c49a51f07c994cd5b1213f098e053f291013c5))
* Remove Linux support - Windows and macOS only ([07188bd](https://github.com/castor4bit/epub-image-extractor/commit/07188bdb4e748cda7ace762a4128d717ef6d5206))


### Bug Fixes

* Adjust initial screen layout to prevent scroll bars ([ce146c4](https://github.com/castor4bit/epub-image-extractor/commit/ce146c41067a8ae2aad172dcfc54c655271d89db))
* Unify hover styles between normal and compact drop zones ([16f5c9a](https://github.com/castor4bit/epub-image-extractor/commit/16f5c9a787fb90f8f13031ac847e2532fc2150cd))


### Code Refactoring

* Migrate from standard-version to release-please ([d14c6c0](https://github.com/castor4bit/epub-image-extractor/commit/d14c6c0d10aeb661304d94b4c02e46e2509e1f6a))
* Remove version badges and recent updates automation ([6ea9084](https://github.com/castor4bit/epub-image-extractor/commit/6ea9084a1fd8e471fff28cfb9895bd93320717de))

## [0.4.0](https://github.com/castor4bit/epub-image-extractor/compare/v0.3.0...v0.4.0) (2025-07-16)


### Features

* Add automated dependency management system ([de49645](https://github.com/castor4bit/epub-image-extractor/commit/de49645631a8655ff713d3aec727874e29a00f03))


### Bug Fixes

* ドラッグ&ドロップでファイルパスが取得できない問題を修正 ([296252b](https://github.com/castor4bit/epub-image-extractor/commit/296252b56c1645bae6302df1abd6c54d1303256a))

## [0.3.0](https://github.com/castor4bit/epub-image-extractor/compare/v0.2.0...v0.3.0) (2025-07-13)


### Features

* Add internationalization (i18n) support with Japanese and English ([43494f5](https://github.com/castor4bit/epub-image-extractor/commit/43494f5920195138d60865d81090544e899e08fc))
* Complete test framework integration for i18n support ([c5d0b60](https://github.com/castor4bit/epub-image-extractor/commit/c5d0b60365fd7ed4b5d5294ead324007bd61a289))
* デザインシステムの統一とモダンなUIの実装 ([93f4086](https://github.com/castor4bit/epub-image-extractor/commit/93f408630119aa29398b856e768eb6bef444f314))
* ワークフローを署名あり/なしに分離 ([c113481](https://github.com/castor4bit/epub-image-extractor/commit/c113481bf6936b03a0cb2c7928b55d0bac976a34))
* 開発版ビルドワークフローを追加 ([d1364d5](https://github.com/castor4bit/epub-image-extractor/commit/d1364d518b9e617e95360249f3a9fb829307bc90))
* 全ワークフローでNode.js 24に統一 ([e794bdc](https://github.com/castor4bit/epub-image-extractor/commit/e794bdcda6e1447c6bba54741ce7a13358ff1b2b))


### Bug Fixes

* CHANGELOG自動生成の改善と構造化 ([f4382a6](https://github.com/castor4bit/epub-image-extractor/commit/f4382a674b2b8bad1c0bd4dcd355cbc9a0eaa2b7))
* Code Signedワークフローでコード署名エラーを修正 ([0fdeb86](https://github.com/castor4bit/epub-image-extractor/commit/0fdeb86ed7a515d6c56f43a161672ff86f03bb78))
* Complete internationalization support for units and app info ([eea323f](https://github.com/castor4bit/epub-image-extractor/commit/eea323fd5b7f5a818ddda4612f81c06e7a72e805))
* Enable manual release workflow execution ([0d5a4ed](https://github.com/castor4bit/epub-image-extractor/commit/0d5a4ede03a0f5eb083045e5272a6172b8ddf9f2))
* Linuxビルド用にauthorの適切なemailを追加 ([a45566d](https://github.com/castor4bit/epub-image-extractor/commit/a45566d36e98c46b5f6ebcc51c406f2868efc833))
* Resolve all ESLint warnings for cleaner codebase ([76c402d](https://github.com/castor4bit/epub-image-extractor/commit/76c402dabdfa6fe05f072bfee03f18f50ba15d10))
* Resolve duplicate file upload error in release workflow ([134fea5](https://github.com/castor4bit/epub-image-extractor/commit/134fea53d14fa4eeb07d1f2d4af4d54e51a1b296))
* Resolve Windows installer naming conflicts and macOS duplicate uploads ([741bdd4](https://github.com/castor4bit/epub-image-extractor/commit/741bdd40ba20978ef79deedf7e347915e953b97e))
* zipHandler.tsのlintエラーを修正 ([3fd9ca1](https://github.com/castor4bit/epub-image-extractor/commit/3fd9ca1d0eb21a8b0c51cd975e3d860aca951526))
* リリースアセットを配布用ファイルのみに限定 ([f0fffd8](https://github.com/castor4bit/epub-image-extractor/commit/f0fffd828ecf60c40f9168023fcdf233220bd9cd))


### Code Refactoring

* CIワークフローを最適化し役割を明確化 ([15f17a2](https://github.com/castor4bit/epub-image-extractor/commit/15f17a2d0c66c9eaf71d5ceaaca904a06238859c))
* Remove AppImage from Linux build targets ([95797cf](https://github.com/castor4bit/epub-image-extractor/commit/95797cf82b5635d4e7e29a06f4be18f52f08d7b5))


### Dependencies

* Update @types/jest from 29.5.14 to 30.0.0 ([774e852](https://github.com/castor4bit/epub-image-extractor/commit/774e852612bf6c783d225143badeb7741b1f8012))
* Update @types/node from 20.19.7 to 24.0.13 ([ad03cf8](https://github.com/castor4bit/epub-image-extractor/commit/ad03cf86c568f4700131bc0196cf0a49a7529b8c))
* Update dependencies to latest versions ([7574235](https://github.com/castor4bit/epub-image-extractor/commit/7574235854b9c01a6bc25086ba9b5141a58711fc))
* Update Jest ecosystem to v30 (jest, jest-environment-jsdom) ([eccfbf4](https://github.com/castor4bit/epub-image-extractor/commit/eccfbf4e3eaca550be22f297684351154ea342d7))
* Update remaining dependencies to latest versions ([9a0c798](https://github.com/castor4bit/epub-image-extractor/commit/9a0c7984cb1c6978a38b3ddb225992ab2cbd17e2))
* Upgrade Electron from 28.0.0 to 37.2.1 ([c94c629](https://github.com/castor4bit/epub-image-extractor/commit/c94c629e3fd80c22d3fc4125a95b11818c00e87a))
* Upgrade ESLint from 8.56.0 to 9.31.0 ([729d33a](https://github.com/castor4bit/epub-image-extractor/commit/729d33a1cf3badc6b945814fa15652c190006a83))
* Upgrade Vite from 5.0.10 to 7.0.4 ([b8249aa](https://github.com/castor4bit/epub-image-extractor/commit/b8249aa924864664d350ee6399200476037aa099))


### Documentation

* Update technical stack versions across documentation and tests ([599ca77](https://github.com/castor4bit/epub-image-extractor/commit/599ca77949138af29ac449b53004f84a4707e60b))
* パッケージマネージャーをnpmに統一 ([8b6daf0](https://github.com/castor4bit/epub-image-extractor/commit/8b6daf08597767a94b37029e564e96d973002de5))

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
