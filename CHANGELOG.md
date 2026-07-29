# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.7.0](https://github.com/castor4bit/epub-image-extractor/compare/v0.7.1...v0.7.0) (2026-07-29)


### ⚠ BREAKING CHANGES

* Default ZIP implementation changed to fflate. Use USE_ADM_ZIP=true environment variable for compatibility.
* XML parsing now uses fast-xml-parser instead of xml2js. This improves performance and reduces bundle size.

### Features

* AboutDialogのUI改善とアプリケーションアイコンの統合 ([7d94349](https://github.com/castor4bit/epub-image-extractor/commit/7d94349235d2be41ee3ec17ac6721f1bd2ede522))
* Add automated dependency management system ([de49645](https://github.com/castor4bit/epub-image-extractor/commit/de49645631a8655ff713d3aec727874e29a00f03))
* Add filename options for original name and page-spread info ([0ecd46d](https://github.com/castor4bit/epub-image-extractor/commit/0ecd46db7e40e6e656cc97f507b77afe2a44b028))
* Add folder drag-and-drop support ([#28](https://github.com/castor4bit/epub-image-extractor/issues/28)) ([3484805](https://github.com/castor4bit/epub-image-extractor/commit/34848055a52e8ecc1a11bac6a14b8a06067c862a))
* Add internationalization (i18n) support with Japanese and English ([43494f5](https://github.com/castor4bit/epub-image-extractor/commit/43494f5920195138d60865d81090544e899e08fc))
* Add page-spread properties support to image filenames ([623c544](https://github.com/castor4bit/epub-image-extractor/commit/623c544d22497d9b180f8c57179a3b8d879c2169))
* Add processing controls for file drop and app exit confirmation ([#34](https://github.com/castor4bit/epub-image-extractor/issues/34)) ([3175042](https://github.com/castor4bit/epub-image-extractor/commit/3175042ed553fc2ee517807a689dfc65f7e49ef3))
* Add resizable window support ([011bef3](https://github.com/castor4bit/epub-image-extractor/commit/011bef329491e9e802db47d69f6fce9bab81c289))
* Add resizable window support with persistent size/position ([9023cbf](https://github.com/castor4bit/epub-image-extractor/commit/9023cbfd4712f3351a145a1454314cc7a5017af1))
* Add window opacity control with mouse hover support ([#35](https://github.com/castor4bit/epub-image-extractor/issues/35)) ([b2e211f](https://github.com/castor4bit/epub-image-extractor/commit/b2e211fb290ba745f6f483876050d5d582966ecb))
* Change processing status title to be more appropriate ([09c49a5](https://github.com/castor4bit/epub-image-extractor/commit/09c49a51f07c994cd5b1213f098e053f291013c5))
* CHANGELOG自動化とリリースドキュメントの充実 ([24ff892](https://github.com/castor4bit/epub-image-extractor/commit/24ff892283ea8363260dd32537f8d6caa04c9d8b))
* Clear window bounds when resetting settings ([b6f9c3b](https://github.com/castor4bit/epub-image-extractor/commit/b6f9c3bdc811816238fdb6c7962d47f2de54339c))
* CompactDropZoneのデザインを初期状態と統一 ([ddbad0e](https://github.com/castor4bit/epub-image-extractor/commit/ddbad0e78aca5736edef85aa8bdd9c6ca54dfb06))
* Complete test framework integration for i18n support ([c5d0b60](https://github.com/castor4bit/epub-image-extractor/commit/c5d0b60365fd7ed4b5d5294ead324007bd61a289))
* **esm:** Enable ESM with type:module in package.json (Phase 7) ([#57](https://github.com/castor4bit/epub-image-extractor/issues/57)) ([c2d779e](https://github.com/castor4bit/epub-image-extractor/commit/c2d779eb61e8f7134af2334593905949a4b8a301))
* **esm:** ESM migration phase 1 - test infrastructure ([#45](https://github.com/castor4bit/epub-image-extractor/issues/45)) ([128959a](https://github.com/castor4bit/epub-image-extractor/commit/128959a3a1c496316ed423c2aadb2835432bccdf))
* **esm:** ESM migration phase 2 - utility module tests ([#46](https://github.com/castor4bit/epub-image-extractor/issues/46)) ([b9ae1bb](https://github.com/castor4bit/epub-image-extractor/commit/b9ae1bbe172508ec501297f1c92af3943d2f4c31))
* **esm:** ESM migration phase 3 - additional utility tests ([#47](https://github.com/castor4bit/epub-image-extractor/issues/47)) ([0f3024a](https://github.com/castor4bit/epub-image-extractor/commit/0f3024a292e41cccaa226a0b74f758c10604e36c))
* GitHub ActionsビルドにAd-hoc署名を追加 ([#27](https://github.com/castor4bit/epub-image-extractor/issues/27)) ([ba4d897](https://github.com/castor4bit/epub-image-extractor/commit/ba4d897b4dd036a653ac03aec898652a161b9e13))
* implement auto-update functionality ([#115](https://github.com/castor4bit/epub-image-extractor/issues/115)) ([c0ff512](https://github.com/castor4bit/epub-image-extractor/commit/c0ff512b25433e99b10b8db9572d6b54d3e4b9a5))
* Implement two-stage manual release workflow ([9fc7db7](https://github.com/castor4bit/epub-image-extractor/commit/9fc7db70a7243089256c04697ed8a14b8c13cb77))
* Implement two-stage manual release workflow ([139a899](https://github.com/castor4bit/epub-image-extractor/commit/139a899fedf97e79bcc15d70e5caec2b081b6f2f))
* Migrate from adm-zip to fflate for improved performance ([#32](https://github.com/castor4bit/epub-image-extractor/issues/32)) ([cb5f9b0](https://github.com/castor4bit/epub-image-extractor/commit/cb5f9b0db5f611f506ffc08e3be7a99848fdb6df))
* migrate from npm to pnpm ([#234](https://github.com/castor4bit/epub-image-extractor/issues/234)) ([c15c893](https://github.com/castor4bit/epub-image-extractor/commit/c15c893993b812fb285106e7468894b498a7b74f))
* Remove Linux support - Windows and macOS only ([07188bd](https://github.com/castor4bit/epub-image-extractor/commit/07188bdb4e748cda7ace762a4128d717ef6d5206))
* **security:** implement security measures for sandbox-disabled environment ([#72](https://github.com/castor4bit/epub-image-extractor/issues/72)) ([f13d4a5](https://github.com/castor4bit/epub-image-extractor/commit/f13d4a5a66e4019ad27f3ebc097c06305a0c0d3c))
* **security:** implement supply chain attack mitigations ([#236](https://github.com/castor4bit/epub-image-extractor/issues/236)) ([45e64e1](https://github.com/castor4bit/epub-image-extractor/commit/45e64e1f46c76c3fa9c2101b929660179ae98f8c))
* **settings:** update opacity settings to 5% increments with 85% default ([#43](https://github.com/castor4bit/epub-image-extractor/issues/43)) ([d9b306a](https://github.com/castor4bit/epub-image-extractor/commit/d9b306a6974bad614504a0c85598e3f1abedddad))
* Windowsポータブル版の配布設定を追加 ([4c95535](https://github.com/castor4bit/epub-image-extractor/commit/4c95535421b6d3f24840f9e150023fff013436fe))
* アプリケーションアイコンの設定を準備 ([7d62c20](https://github.com/castor4bit/epub-image-extractor/commit/7d62c20b53a017fc21ba89300a83fa6b37cd2cfe))
* アプリケーション内でバージョン情報を確認できる機能を追加 ([4bdbf4a](https://github.com/castor4bit/epub-image-extractor/commit/4bdbf4a2ab1e71e8feecc84b1f8b6867dd6c30c0))
* ウィンドウサイズと設定項目の調整 ([37257b5](https://github.com/castor4bit/epub-image-extractor/commit/37257b595c01145e372df96128ac737ec9a2277a))
* ウィンドウ最前面表示機能を追加 ([ee39e93](https://github.com/castor4bit/epub-image-extractor/commit/ee39e9379ac14e01670960a08dd0f84bd6c2ce9f))
* デザインシステムの統一とモダンなUIの実装 ([93f4086](https://github.com/castor4bit/epub-image-extractor/commit/93f408630119aa29398b856e768eb6bef444f314))
* ワークフローを署名あり/なしに分離 ([c113481](https://github.com/castor4bit/epub-image-extractor/commit/c113481bf6936b03a0cb2c7928b55d0bac976a34))
* 個別ファイル完了時に即座に「出力先を開く」ボタンを表示 ([3e3e583](https://github.com/castor4bit/epub-image-extractor/commit/3e3e583e65f0cb8a97da91caad26d30408db0951))
* 全ワークフローでNode.js 24に統一 ([e794bdc](https://github.com/castor4bit/epub-image-extractor/commit/e794bdcda6e1447c6bba54741ce7a13358ff1b2b))
* 処理状況に待機中の件数を表示 ([2e6f69d](https://github.com/castor4bit/epub-image-extractor/commit/2e6f69de2bf3756670259ae48f730641c46b94ec))
* 処理結果の永続表示と進捗表示の改善 ([620091e](https://github.com/castor4bit/epub-image-extractor/commit/620091ea4386b9eb179553271105fba3eece73c8))
* 画像ファイル名に元のファイル名を含める ([ac0bc30](https://github.com/castor4bit/epub-image-extractor/commit/ac0bc309ffb50c2aa76a438526a0f932cb82f046))
* 画像処理の進捗表示を改善 ([7f7955d](https://github.com/castor4bit/epub-image-extractor/commit/7f7955d2d01443fc0fc26bbf1af049b56a74e4e8))
* 重複出力先の自動回避処理を実装 ([092e422](https://github.com/castor4bit/epub-image-extractor/commit/092e422ce1966d7be7b2297e3451c089453a7b67))
* 開発版ビルドワークフローを追加 ([d1364d5](https://github.com/castor4bit/epub-image-extractor/commit/d1364d518b9e617e95360249f3a9fb829307bc90))


### Bug Fixes

* [@typescript-eslint](https://github.com/typescript-eslint)をv8.36.0にアップデートしてTypeScript 5.8.3サポートを追加 ([3316297](https://github.com/castor4bit/epub-image-extractor/commit/3316297b640fb63c29ff3793359a6d952ee96dfc))
* @gxl/epub-parserの代わりにAdmZipを使用した手動EPUB解析実装 ([69b15b5](https://github.com/castor4bit/epub-image-extractor/commit/69b15b5894ba2dacba370a2a2e50b8eb79ee4bcd))
* Adjust initial screen layout to prevent scroll bars ([ce146c4](https://github.com/castor4bit/epub-image-extractor/commit/ce146c41067a8ae2aad172dcfc54c655271d89db))
* AdmZipを使用した画像抽出ロジックの修正 ([85789ce](https://github.com/castor4bit/epub-image-extractor/commit/85789ce6bf26965442a041a2fdb44f31196a2633))
* Apply default window size immediately when clearing bounds ([f454f5e](https://github.com/castor4bit/epub-image-extractor/commit/f454f5e4371520c8e662850eefcdb218889b16cf))
* CHANGELOG自動化の重複処理を解消 ([c57744d](https://github.com/castor4bit/epub-image-extractor/commit/c57744db374e24e34e82913ea331d8386b9113c9))
* CHANGELOG自動生成の改善と構造化 ([f4382a6](https://github.com/castor4bit/epub-image-extractor/commit/f4382a674b2b8bad1c0bd4dcd355cbc9a0eaa2b7))
* **ci:** accept an exact version for the release_as input ([#301](https://github.com/castor4bit/epub-image-extractor/issues/301)) ([8434caf](https://github.com/castor4bit/epub-image-extractor/commit/8434cafdbfda2e1b21ecde1e625fadb44ccfa1b8))
* **ci:** publish releases only after the assets are attached ([#305](https://github.com/castor4bit/epub-image-extractor/issues/305)) ([da8314c](https://github.com/castor4bit/epub-image-extractor/commit/da8314c2804f90371aef9b62eca27896e151f2c2))
* Code Signedワークフローでコード署名エラーを修正 ([0fdeb86](https://github.com/castor4bit/epub-image-extractor/commit/0fdeb86ed7a515d6c56f43a161672ff86f03bb78))
* complete i18n support for error messages ([#68](https://github.com/castor4bit/epub-image-extractor/issues/68)) ([9f94545](https://github.com/castor4bit/epub-image-extractor/commit/9f945456b5ff05d2e30fc6fc1a8d4f66083f38bb))
* Complete internationalization support for units and app info ([eea323f](https://github.com/castor4bit/epub-image-extractor/commit/eea323fd5b7f5a818ddda4612f81c06e7a72e805))
* **deps:** bump electron-store from 10.1.0 to 11.0.2 ([#145](https://github.com/castor4bit/epub-image-extractor/issues/145)) ([6ac464a](https://github.com/castor4bit/epub-image-extractor/commit/6ac464a16a3ba08d382a6eaba3ef8958fc44f7d1))
* **deps:** bump fast-xml-parser from 5.2.5 to 5.3.0 ([#142](https://github.com/castor4bit/epub-image-extractor/issues/142)) ([2c5ec38](https://github.com/castor4bit/epub-image-extractor/commit/2c5ec384900fd02ae08880186b3cefecfc73f87c))
* **deps:** Bump fast-xml-parser from 5.5.11 to 5.7.0 ([#270](https://github.com/castor4bit/epub-image-extractor/issues/270)) ([2a3db19](https://github.com/castor4bit/epub-image-extractor/commit/2a3db19a1aca41d3ce6e753c2b8cc75cd32499d7))
* **deps:** Bump fast-xml-parser from 5.7.0 to 5.10.1 ([#288](https://github.com/castor4bit/epub-image-extractor/issues/288)) ([6f8ce6c](https://github.com/castor4bit/epub-image-extractor/commit/6f8ce6cb944b64d8db91d6194b03e9edf27d7f79))
* **deps:** bump i18next from 25.5.2 to 25.6.0 ([#140](https://github.com/castor4bit/epub-image-extractor/issues/140)) ([88f6ea4](https://github.com/castor4bit/epub-image-extractor/commit/88f6ea40aa944cc1eceebeef2b96842d2ac47b5a))
* **deps:** bump i18next from 25.6.2 to 25.7.4 ([#188](https://github.com/castor4bit/epub-image-extractor/issues/188)) ([544d614](https://github.com/castor4bit/epub-image-extractor/commit/544d6148d899571f90603757273a95d3fab93414))
* **deps:** bump p-limit from 7.1.1 to 7.2.0 ([#158](https://github.com/castor4bit/epub-image-extractor/issues/158)) ([7bcf94f](https://github.com/castor4bit/epub-image-extractor/commit/7bcf94f1539a0f288b92b537186c83b0c62094c5))
* **deps:** Bump pino from 10.0.0 to 10.3.1 ([#259](https://github.com/castor4bit/epub-image-extractor/issues/259)) ([1b51b9c](https://github.com/castor4bit/epub-image-extractor/commit/1b51b9cb3dbc998520c2d8db2d0c4751f50766cc))
* **deps:** bump pino from 9.11.0 to 9.12.0 ([#121](https://github.com/castor4bit/epub-image-extractor/issues/121)) ([43251ec](https://github.com/castor4bit/epub-image-extractor/commit/43251ecf9907617d42518e1f3dfac7d40040a69c))
* **deps:** bump pino from 9.12.0 to 10.0.0 ([#139](https://github.com/castor4bit/epub-image-extractor/issues/139)) ([3f4e90e](https://github.com/castor4bit/epub-image-extractor/commit/3f4e90e651d6fdf6fad9c5a8f6130a2886deac45))
* **deps:** bump pino from 9.9.5 to 9.11.0 ([#114](https://github.com/castor4bit/epub-image-extractor/issues/114)) ([b4ed34f](https://github.com/castor4bit/epub-image-extractor/commit/b4ed34f2cb0d1d0527d44f3df7e07f9352f1cb69))
* **deps:** bump react-i18next from 15.7.3 to 16.0.0 ([#137](https://github.com/castor4bit/epub-image-extractor/issues/137)) ([34bff3c](https://github.com/castor4bit/epub-image-extractor/commit/34bff3c6e150c9bf4b29760467e5ff6085c04755))
* **deps:** bump react-i18next from 16.0.0 to 16.5.2 ([#187](https://github.com/castor4bit/epub-image-extractor/issues/187)) ([0443d49](https://github.com/castor4bit/epub-image-extractor/commit/0443d498b8a563e5e4b4fa4f29c2db31b9d306ec))
* **deps:** bump secure-json-parse from 4.0.0 to 4.1.0 ([#138](https://github.com/castor4bit/epub-image-extractor/issues/138)) ([54a1e65](https://github.com/castor4bit/epub-image-extractor/commit/54a1e658ac369a775559d329eb5afdd0bdd506fc))
* **deps:** bump the production-dependencies group across 1 directory with 14 updates ([#245](https://github.com/castor4bit/epub-image-extractor/issues/245)) ([ecaf602](https://github.com/castor4bit/epub-image-extractor/commit/ecaf6023be99e320012d4b87788d3fdfdc1c866d))
* **deps:** bump the production-dependencies group across 1 directory with 2 updates ([#110](https://github.com/castor4bit/epub-image-extractor/issues/110)) ([94cc181](https://github.com/castor4bit/epub-image-extractor/commit/94cc181e848d44ae2c9bdd87c49358b87c10561a))
* **deps:** bump the production-dependencies group across 1 directory with 2 updates ([#126](https://github.com/castor4bit/epub-image-extractor/issues/126)) ([82a05d3](https://github.com/castor4bit/epub-image-extractor/commit/82a05d3695628121d666ed56deba79ea6648cac1))
* **deps:** bump the production-dependencies group across 1 directory with 4 updates ([#171](https://github.com/castor4bit/epub-image-extractor/issues/171)) ([517b5f4](https://github.com/castor4bit/epub-image-extractor/commit/517b5f49201e0435bcdaa4f397c7b5f5e4667832))
* **deps:** Bump the production-dependencies group with 9 updates ([#253](https://github.com/castor4bit/epub-image-extractor/issues/253)) ([7a70165](https://github.com/castor4bit/epub-image-extractor/commit/7a701650e03d071ef9efd80a83638074f6885900))
* **deps:** bump the react group with 4 updates ([#162](https://github.com/castor4bit/epub-image-extractor/issues/162)) ([19e0672](https://github.com/castor4bit/epub-image-extractor/commit/19e0672a13d8c31dacf765fc7d4869e1534703b5))
* **deps:** configure Dependabot to use fix prefix for production dependencies ([#107](https://github.com/castor4bit/epub-image-extractor/issues/107)) ([88a35aa](https://github.com/castor4bit/epub-image-extractor/commit/88a35aa2ff8c10a05f6b0966a349f61f80b3b433))
* Enable automatic release on PR merge ([abaf919](https://github.com/castor4bit/epub-image-extractor/commit/abaf919e8b4ea3d8c7c10582110d24787d2cb753))
* enable CI for release PRs using draft PR workflow ([#92](https://github.com/castor4bit/epub-image-extractor/issues/92)) ([7545dbc](https://github.com/castor4bit/epub-image-extractor/commit/7545dbcf788df0b61b01fc925643ad19825c91b6))
* Enable manual release workflow execution ([0d5a4ed](https://github.com/castor4bit/epub-image-extractor/commit/0d5a4ede03a0f5eb083045e5272a6172b8ddf9f2))
* EPUB3 Navigation Documentからのチャプター情報抽出を実装 ([b952f1a](https://github.com/castor4bit/epub-image-extractor/commit/b952f1aed4d03813d0b576a30d2e4d50955fada3))
* EPUBファイル解析エラーが2重に出力される問題を修正 ([5587b14](https://github.com/castor4bit/epub-image-extractor/commit/5587b146e7df3ec60dbb176a3d4f47687dc83a31))
* ESLintエラーをすべて修正し、コード品質を改善 ([f4aadf4](https://github.com/castor4bit/epub-image-extractor/commit/f4aadf4412d997f4bee7b1c2af9fd2ca297255c3))
* ESLintエラーを修正（未使用インポートの削除） ([369cd9c](https://github.com/castor4bit/epub-image-extractor/commit/369cd9c03722be15da75c8934ed5cc9ce4a9fba4))
* ESLintのDeprecationWarningを解消 ([c32f293](https://github.com/castor4bit/epub-image-extractor/commit/c32f29381a0eb9ff4070ab5153045d3ac802158d))
* ESLintの警告を修正 ([0df8882](https://github.com/castor4bit/epub-image-extractor/commit/0df88829a370a0ad0faf9865c01ccacc61d4c584))
* ESLintの警告を解決 ([#25](https://github.com/castor4bit/epub-image-extractor/issues/25)) ([2bf5dd1](https://github.com/castor4bit/epub-image-extractor/commit/2bf5dd1eb9ef66c0042d895dee31faa780ca1bb9))
* Exclude test files and scripts from ESLint checks ([be0e6d9](https://github.com/castor4bit/epub-image-extractor/commit/be0e6d96373436a83737a5d5d337b73ef6cc891d))
* Exclude test files and scripts from ESLint checks ([79492d7](https://github.com/castor4bit/epub-image-extractor/commit/79492d75a81bef07458f5eda4ecb61e57d916d37))
* fileIdの一貫性を確保して重複表示を解消 ([0f91530](https://github.com/castor4bit/epub-image-extractor/commit/0f915308dd78656a903610d9b1d7b3723cfc912b))
* Fix ad-hoc signing issues in GitHub Actions workflow ([#30](https://github.com/castor4bit/epub-image-extractor/issues/30)) ([a33862f](https://github.com/castor4bit/epub-image-extractor/commit/a33862f3d38bbc7faf07d8ffbeb2c8c0536437ff))
* Fix issue where '0' is displayed when files are dropped ([#33](https://github.com/castor4bit/epub-image-extractor/issues/33)) ([30bf0d9](https://github.com/castor4bit/epub-image-extractor/commit/30bf0d9c95a6f89c3c830b8ce67dc29dccfdbe4e))
* handle clearWindowBounds errors gracefully in settings save ([#73](https://github.com/castor4bit/epub-image-extractor/issues/73)) ([ed3f012](https://github.com/castor4bit/epub-image-extractor/commit/ed3f012b0179e18c72c905dcf414bc79bdfa0932))
* Linuxビルド用にauthorの適切なemailを追加 ([a45566d](https://github.com/castor4bit/epub-image-extractor/commit/a45566d36e98c46b5f6ebcc51c406f2868efc833))
* **logger:** restore file logging in packaged builds ([#304](https://github.com/castor4bit/epub-image-extractor/issues/304)) ([12d474c](https://github.com/castor4bit/epub-image-extractor/commit/12d474c5f50fdf8fbb84ed4265c121ba66a3194b))
* macOSでウィンドウを閉じたらアプリケーションを終了するように変更 ([8cc411b](https://github.com/castor4bit/epub-image-extractor/commit/8cc411b88496110455cb088b82b7738fea07752d))
* package-lock.jsonを更新してnpm ciエラーを解消 ([fd16ac0](https://github.com/castor4bit/epub-image-extractor/commit/fd16ac01c858aff0a196785841a2c97d13e55fe9))
* Prevent button text wrapping in settings window ([95fd691](https://github.com/castor4bit/epub-image-extractor/commit/95fd691951ada60ae60e87a2df94798fdfe874c8))
* prevent white screen on startup and reduce asar bundle size ([#241](https://github.com/castor4bit/epub-image-extractor/issues/241)) ([4560309](https://github.com/castor4bit/epub-image-extractor/commit/45603098cd60e0310eb33913032e2c5ec024e682))
* remove duplicated tinyglobby entries from pnpm-lock.yaml ([#260](https://github.com/castor4bit/epub-image-extractor/issues/260)) ([a85cb25](https://github.com/castor4bit/epub-image-extractor/commit/a85cb2523bc280af6947c2c26264c154b7439b2b))
* remove unsupported minimum-version-age from dependabot config ([#239](https://github.com/castor4bit/epub-image-extractor/issues/239)) ([935643f](https://github.com/castor4bit/epub-image-extractor/commit/935643faffd865c7ae8edaa8f8c611b8cf5f109b))
* Replace deprecated fs.rmdir with fs.rm to fix Node.js warning ([#38](https://github.com/castor4bit/epub-image-extractor/issues/38)) ([724cf7c](https://github.com/castor4bit/epub-image-extractor/commit/724cf7ce3e5e4ab5e86aef5c82dc5a7b3d99c1c5))
* Resolve all ESLint warnings for cleaner codebase ([76c402d](https://github.com/castor4bit/epub-image-extractor/commit/76c402dabdfa6fe05f072bfee03f18f50ba15d10))
* Resolve duplicate file upload error in release workflow ([134fea5](https://github.com/castor4bit/epub-image-extractor/commit/134fea53d14fa4eeb07d1f2d4af4d54e51a1b296))
* Resolve pino logger errors in Electron environment ([1f6b988](https://github.com/castor4bit/epub-image-extractor/commit/1f6b9889de793da1b6a2a6721102e51899849feb))
* Resolve Windows installer naming conflicts and macOS duplicate uploads ([741bdd4](https://github.com/castor4bit/epub-image-extractor/commit/741bdd40ba20978ef79deedf7e347915e953b97e))
* **security:** replace regex HTML sanitization with sanitize-html library ([#109](https://github.com/castor4bit/epub-image-extractor/issues/109)) ([949ffb5](https://github.com/castor4bit/epub-image-extractor/commit/949ffb5f255101bb7e28865fb8f1f1a66d4c2f60))
* Separate PR checks from release workflow ([729f2a2](https://github.com/castor4bit/epub-image-extractor/commit/729f2a253b0069439bee99e39466383caf5d2dbc))
* Separate PR checks from release workflow ([2bc2534](https://github.com/castor4bit/epub-image-extractor/commit/2bc2534d6583dd5256a5c46937ec1f16431011c9))
* Separate PR creation from release process ([62f56c5](https://github.com/castor4bit/epub-image-extractor/commit/62f56c519b20f2f70806a017a1d619ab8e616a5e))
* Separate PR creation from release process ([85691f4](https://github.com/castor4bit/epub-image-extractor/commit/85691f4ac3a5d275fadaa013cb8979251ebafeb6))
* **test:** restore settings integration test after ESM migration ([#58](https://github.com/castor4bit/epub-image-extractor/issues/58)) ([199e617](https://github.com/castor4bit/epub-image-extractor/commit/199e617ac8c9ede8bd964b463cb7146e7c98f641))
* Unify hover styles between normal and compact drop zones ([16f5c9a](https://github.com/castor4bit/epub-image-extractor/commit/16f5c9a787fb90f8f13031ac847e2532fc2150cd))
* update TypeScript moduleResolution for @vitejs/plugin-react v5 compatibility ([#82](https://github.com/castor4bit/epub-image-extractor/issues/82)) ([8a0ad3c](https://github.com/castor4bit/epub-image-extractor/commit/8a0ad3c8a949a9ecf76e130ae9980c2c52149df4))
* use .mjs extension for ESM preload script ([#71](https://github.com/castor4bit/epub-image-extractor/issues/71)) ([795743a](https://github.com/castor4bit/epub-image-extractor/commit/795743ac74acb0533f55bc5ea676b55a2cd796f0))
* Use delete method instead of setting undefined for windowBounds ([12038bd](https://github.com/castor4bit/epub-image-extractor/commit/12038bde3cfab92c7fe31e65167d4bb002135cf6))
* use npm ecosystem in dependabot config for pnpm project ([#238](https://github.com/castor4bit/epub-image-extractor/issues/238)) ([e4cb8c4](https://github.com/castor4bit/epub-image-extractor/commit/e4cb8c4c2f77e0cd80c991d195478133d809b518))
* zipHandler.tsのlintエラーを修正 ([3fd9ca1](https://github.com/castor4bit/epub-image-extractor/commit/3fd9ca1d0eb21a8b0c51cd975e3d860aca951526))
* ZIPファイルエラーメッセージの階層化と重複解消 ([42233a8](https://github.com/castor4bit/epub-image-extractor/commit/42233a81f0e5ffc11116dd637940f6801bc5ca72))
* アプリケーション名の表記を整理 ([2a1a5cd](https://github.com/castor4bit/epub-image-extractor/commit/2a1a5cda87dc0b8e9cdc0dd5401d6aa13d136910))
* エラーハンドリング統一後のテスト修正 ([614180f](https://github.com/castor4bit/epub-image-extractor/commit/614180f81c6f5e6e045853f8d2aeb60058ca8ca4))
* チャプターごとの画像分類を正しく実装 ([819b44a](https://github.com/castor4bit/epub-image-extractor/commit/819b44a96133cbc447ad462e653792978ba92b14))
* テストのモック設定を修正しビルドエラーを解消 ([4b110cd](https://github.com/castor4bit/epub-image-extractor/commit/4b110cdda73653ba9b56ce84bb9f202d6f4d85ad))
* テストファイルの型エラーを修正 ([f3b5d22](https://github.com/castor4bit/epub-image-extractor/commit/f3b5d22c46acbfc0bf90013a838f8fc6d1c9cc59))
* テスト環境でのバージョン情報API対応とElectron依存関係を修正 ([53b7a07](https://github.com/castor4bit/epub-image-extractor/commit/53b7a07f64d0d6d9391e8b2366dfa93ec05b2da7))
* ドラッグ&ドロップでファイルパスが取得できない問題を修正 ([296252b](https://github.com/castor4bit/epub-image-extractor/commit/296252b56c1645bae6302df1abd6c54d1303256a))
* ビルドスクリプトの重複実行を修正 ([0c086b3](https://github.com/castor4bit/epub-image-extractor/commit/0c086b38b691de33b2948a86daa1a1e4b96faa6f))
* リリースアセットを配布用ファイルのみに限定 ([f0fffd8](https://github.com/castor4bit/epub-image-extractor/commit/f0fffd828ecf60c40f9168023fcdf233220bd9cd))
* 二重スクロールの問題を解消 ([2565372](https://github.com/castor4bit/epub-image-extractor/commit/2565372f71b4a43bad0d719d0f95bc3822a1b1d7))
* 最前面表示をデフォルトで有効に変更 ([759ba02](https://github.com/castor4bit/epub-image-extractor/commit/759ba02db38859f1ed2da2a8e756d6a82d5f2c11))
* 設定ファイルのセキュリティ強化 ([4e4ac96](https://github.com/castor4bit/epub-image-extractor/commit/4e4ac96996b8cef4f21ec9e9e393081d4a42dff6))
* 進捗表示の重複と出力先ボタン表示の問題を修正 ([41ceff3](https://github.com/castor4bit/epub-image-extractor/commit/41ceff37eccbf2e0939e9bcad263317ac17b2336))


### Documentation

* CLAUDE.md の開発ルールを整理し、TDDとコミット粒度のルールを追加 ([2ae6ceb](https://github.com/castor4bit/epub-image-extractor/commit/2ae6cebe628e17235bcf9d2ab5ed3ecc9d04a777))
* CLAUDE.md をプロジェクト仕様書として再構成 ([1a9077e](https://github.com/castor4bit/epub-image-extractor/commit/1a9077ecf6c2d92da8859ece9a5563f16b4f34f9))
* README.md と README.ja.md を v0.1.0 の内容に更新 ([a30899a](https://github.com/castor4bit/epub-image-extractor/commit/a30899aec0091361d06eae48da7c234b803447e7))
* Update README files to reflect pino logging system ([#21](https://github.com/castor4bit/epub-image-extractor/issues/21)) ([88debe1](https://github.com/castor4bit/epub-image-extractor/commit/88debe1e27e11fb82ee484183f093531b8a2126a))
* Update release documentation for new workflow ([5a447cf](https://github.com/castor4bit/epub-image-extractor/commit/5a447cf471fb754832322b7ecefebf22a7447631))
* Update technical stack versions across documentation and tests ([599ca77](https://github.com/castor4bit/epub-image-extractor/commit/599ca77949138af29ac449b53004f84a4707e60b))
* サードパーティライセンス情報を追加 ([d15a7e1](https://github.com/castor4bit/epub-image-extractor/commit/d15a7e139a9ac8c3799d7a273bb8e96ef1916547))
* パッケージマネージャーをnpmに統一 ([8b6daf0](https://github.com/castor4bit/epub-image-extractor/commit/8b6daf08597767a94b37029e564e96d973002de5))
* ビルド検証の必須化をCLAUDE.mdに記録 ([b7fddfb](https://github.com/castor4bit/epub-image-extractor/commit/b7fddfbf1cff416a3a3c9ebbff03c4ba596665d1))


### Code Refactoring

* Centralize window size constants ([193ea6d](https://github.com/castor4bit/epub-image-extractor/commit/193ea6dd82a722290946e805e6bdca3a900cd5fb))
* **ci:** consolidate CI workflows to reduce redundancy ([#56](https://github.com/castor4bit/epub-image-extractor/issues/56)) ([db3b666](https://github.com/castor4bit/epub-image-extractor/commit/db3b6664d37628289f9519d8d2b6a23ab06101ca))
* CIワークフローを最適化し役割を明確化 ([15f17a2](https://github.com/castor4bit/epub-image-extractor/commit/15f17a2d0c66c9eaf71d5ceaaca904a06238859c))
* cleanup ESM migration artifacts ([#62](https://github.com/castor4bit/epub-image-extractor/issues/62)) ([4ca9aa7](https://github.com/castor4bit/epub-image-extractor/commit/4ca9aa7c334d8de72a815686f6a8c8b4159dce97))
* consolidate test environment detection to simplify codebase ([#75](https://github.com/castor4bit/epub-image-extractor/issues/75)) ([5d4e777](https://github.com/castor4bit/epub-image-extractor/commit/5d4e777ed2b051ca3216917d4f7c478765b79e05))
* **logger:** remove require() usage for ESM compatibility ([#50](https://github.com/castor4bit/epub-image-extractor/issues/50)) ([06622f2](https://github.com/castor4bit/epub-image-extractor/commit/06622f2186b4be35420ddf6c15a0e790b5294470))
* Migrate from standard-version to release-please ([d14c6c0](https://github.com/castor4bit/epub-image-extractor/commit/d14c6c0d10aeb661304d94b4c02e46e2509e1f6a))
* Migrate from winston to pino for logging ([5f362c9](https://github.com/castor4bit/epub-image-extractor/commit/5f362c9a11a85291e116df92fda2cb41bbf3fda1))
* Migrate from winston to pino for logging ([1d2c4cb](https://github.com/castor4bit/epub-image-extractor/commit/1d2c4cb5ef6c047a34980835b3ece89e2f6d9f42))
* Migrate from xml2js to fast-xml-parser ([#24](https://github.com/castor4bit/epub-image-extractor/issues/24)) ([56a4a95](https://github.com/castor4bit/epub-image-extractor/commit/56a4a95cbc1c513b9c43204e3529b76903a6db54))
* Remove AppImage from Linux build targets ([95797cf](https://github.com/castor4bit/epub-image-extractor/commit/95797cf82b5635d4e7e29a06f4be18f52f08d7b5))
* Remove version badges and recent updates automation ([6ea9084](https://github.com/castor4bit/epub-image-extractor/commit/6ea9084a1fd8e471fff28cfb9895bd93320717de))
* replace async-mutex with custom SimpleMutex implementation ([#42](https://github.com/castor4bit/epub-image-extractor/issues/42)) ([a067631](https://github.com/castor4bit/epub-image-extractor/commit/a067631ab7c8bf6a17a32efad99fdb6fe4305a7a))
* エラーハンドリングの統一 ([3bd36ad](https://github.com/castor4bit/epub-image-extractor/commit/3bd36ad6e036dc3b78c6985112977bb71b96f654))
* 不要な依存関係の削除とメモリリークの修正 ([ae5c5ba](https://github.com/castor4bit/epub-image-extractor/commit/ae5c5ba8410abd78cb2330685aed59dc68ab30f7))
* 型定義の改善とany型の排除 ([14f323d](https://github.com/castor4bit/epub-image-extractor/commit/14f323d4b5510bf025ca0732909b9b11aa89cee5))


### Continuous Integration

* GitHub Actions のアクションを最新版に更新 ([4a61a7e](https://github.com/castor4bit/epub-image-extractor/commit/4a61a7ebcf177a5402b4f9c9a4e564f851dafa4f))
* run the dependency audit as its own job ([#306](https://github.com/castor4bit/epub-image-extractor/issues/306)) ([ff72ac3](https://github.com/castor4bit/epub-image-extractor/commit/ff72ac394aaa13f9bd11f7face0465d6e86b8ccb))


### Chores

* release 0.7.0 ([#299](https://github.com/castor4bit/epub-image-extractor/issues/299)) ([2056309](https://github.com/castor4bit/epub-image-extractor/commit/20563091a44463e96f4c6d0c86439c385d7f7408))


### Dependencies

* Update @types/jest from 29.5.14 to 30.0.0 ([774e852](https://github.com/castor4bit/epub-image-extractor/commit/774e852612bf6c783d225143badeb7741b1f8012))
* Update @types/node from 20.19.7 to 24.0.13 ([ad03cf8](https://github.com/castor4bit/epub-image-extractor/commit/ad03cf86c568f4700131bc0196cf0a49a7529b8c))
* Update dependencies to latest versions ([7574235](https://github.com/castor4bit/epub-image-extractor/commit/7574235854b9c01a6bc25086ba9b5141a58711fc))
* Update Jest ecosystem to v30 (jest, jest-environment-jsdom) ([eccfbf4](https://github.com/castor4bit/epub-image-extractor/commit/eccfbf4e3eaca550be22f297684351154ea342d7))
* Update remaining dependencies to latest versions ([9a0c798](https://github.com/castor4bit/epub-image-extractor/commit/9a0c7984cb1c6978a38b3ddb225992ab2cbd17e2))
* Upgrade Electron from 28.0.0 to 37.2.1 ([c94c629](https://github.com/castor4bit/epub-image-extractor/commit/c94c629e3fd80c22d3fc4125a95b11818c00e87a))
* Upgrade ESLint from 8.56.0 to 9.31.0 ([729d33a](https://github.com/castor4bit/epub-image-extractor/commit/729d33a1cf3badc6b945814fa15652c190006a83))
* Upgrade Vite from 5.0.10 to 7.0.4 ([b8249aa](https://github.com/castor4bit/epub-image-extractor/commit/b8249aa924864664d350ee6399200476037aa099))

## [0.7.1](https://github.com/castor4bit/epub-image-extractor/compare/v0.7.0...v0.7.1) (2026-07-29)


### Bug Fixes

* **ci:** accept an exact version for the release_as input ([#301](https://github.com/castor4bit/epub-image-extractor/issues/301)) ([8434caf](https://github.com/castor4bit/epub-image-extractor/commit/8434cafdbfda2e1b21ecde1e625fadb44ccfa1b8))
* **ci:** publish releases only after the assets are attached ([#305](https://github.com/castor4bit/epub-image-extractor/issues/305)) ([da8314c](https://github.com/castor4bit/epub-image-extractor/commit/da8314c2804f90371aef9b62eca27896e151f2c2))
* **logger:** restore file logging in packaged builds ([#304](https://github.com/castor4bit/epub-image-extractor/issues/304)) ([12d474c](https://github.com/castor4bit/epub-image-extractor/commit/12d474c5f50fdf8fbb84ed4265c121ba66a3194b))


### Continuous Integration

* run the dependency audit as its own job ([#306](https://github.com/castor4bit/epub-image-extractor/issues/306)) ([ff72ac3](https://github.com/castor4bit/epub-image-extractor/commit/ff72ac394aaa13f9bd11f7face0465d6e86b8ccb))

## [0.7.0](https://github.com/castor4bit/epub-image-extractor/compare/v0.6.3...v0.7.0) (2026-07-26)


### Features

* migrate from npm to pnpm ([#234](https://github.com/castor4bit/epub-image-extractor/issues/234)) ([c15c893](https://github.com/castor4bit/epub-image-extractor/commit/c15c893993b812fb285106e7468894b498a7b74f))
* **security:** implement supply chain attack mitigations ([#236](https://github.com/castor4bit/epub-image-extractor/issues/236)) ([45e64e1](https://github.com/castor4bit/epub-image-extractor/commit/45e64e1f46c76c3fa9c2101b929660179ae98f8c))


### Bug Fixes

* **deps:** Bump fast-xml-parser from 5.5.11 to 5.7.0 ([#270](https://github.com/castor4bit/epub-image-extractor/issues/270)) ([2a3db19](https://github.com/castor4bit/epub-image-extractor/commit/2a3db19a1aca41d3ce6e753c2b8cc75cd32499d7))
* **deps:** Bump fast-xml-parser from 5.7.0 to 5.10.1 ([#288](https://github.com/castor4bit/epub-image-extractor/issues/288)) ([6f8ce6c](https://github.com/castor4bit/epub-image-extractor/commit/6f8ce6cb944b64d8db91d6194b03e9edf27d7f79))
* **deps:** bump i18next from 25.6.2 to 25.7.4 ([#188](https://github.com/castor4bit/epub-image-extractor/issues/188)) ([544d614](https://github.com/castor4bit/epub-image-extractor/commit/544d6148d899571f90603757273a95d3fab93414))
* **deps:** Bump pino from 10.0.0 to 10.3.1 ([#259](https://github.com/castor4bit/epub-image-extractor/issues/259)) ([1b51b9c](https://github.com/castor4bit/epub-image-extractor/commit/1b51b9cb3dbc998520c2d8db2d0c4751f50766cc))
* **deps:** bump the production-dependencies group across 1 directory with 14 updates ([#245](https://github.com/castor4bit/epub-image-extractor/issues/245)) ([ecaf602](https://github.com/castor4bit/epub-image-extractor/commit/ecaf6023be99e320012d4b87788d3fdfdc1c866d))
* **deps:** Bump the production-dependencies group with 9 updates ([#253](https://github.com/castor4bit/epub-image-extractor/issues/253)) ([7a70165](https://github.com/castor4bit/epub-image-extractor/commit/7a701650e03d071ef9efd80a83638074f6885900))
* **deps:** bump the react group with 4 updates ([#162](https://github.com/castor4bit/epub-image-extractor/issues/162)) ([19e0672](https://github.com/castor4bit/epub-image-extractor/commit/19e0672a13d8c31dacf765fc7d4869e1534703b5))
* prevent white screen on startup and reduce asar bundle size ([#241](https://github.com/castor4bit/epub-image-extractor/issues/241)) ([4560309](https://github.com/castor4bit/epub-image-extractor/commit/45603098cd60e0310eb33913032e2c5ec024e682))
* remove duplicated tinyglobby entries from pnpm-lock.yaml ([#260](https://github.com/castor4bit/epub-image-extractor/issues/260)) ([a85cb25](https://github.com/castor4bit/epub-image-extractor/commit/a85cb2523bc280af6947c2c26264c154b7439b2b))
* remove unsupported minimum-version-age from dependabot config ([#239](https://github.com/castor4bit/epub-image-extractor/issues/239)) ([935643f](https://github.com/castor4bit/epub-image-extractor/commit/935643faffd865c7ae8edaa8f8c611b8cf5f109b))
* use npm ecosystem in dependabot config for pnpm project ([#238](https://github.com/castor4bit/epub-image-extractor/issues/238)) ([e4cb8c4](https://github.com/castor4bit/epub-image-extractor/commit/e4cb8c4c2f77e0cd80c991d195478133d809b518))


### Chores

* release 0.7.0 ([#299](https://github.com/castor4bit/epub-image-extractor/issues/299)) ([2056309](https://github.com/castor4bit/epub-image-extractor/commit/20563091a44463e96f4c6d0c86439c385d7f7408))

## [0.6.3](https://github.com/castor4bit/epub-image-extractor/compare/v0.6.2...v0.6.3) (2026-04-05)


### Features

* implement auto-update functionality ([#115](https://github.com/castor4bit/epub-image-extractor/issues/115)) ([c0ff512](https://github.com/castor4bit/epub-image-extractor/commit/c0ff512b25433e99b10b8db9572d6b54d3e4b9a5))


### Bug Fixes

* **deps:** bump electron-store from 10.1.0 to 11.0.2 ([#145](https://github.com/castor4bit/epub-image-extractor/issues/145)) ([6ac464a](https://github.com/castor4bit/epub-image-extractor/commit/6ac464a16a3ba08d382a6eaba3ef8958fc44f7d1))
* **deps:** bump fast-xml-parser from 5.2.5 to 5.3.0 ([#142](https://github.com/castor4bit/epub-image-extractor/issues/142)) ([2c5ec38](https://github.com/castor4bit/epub-image-extractor/commit/2c5ec384900fd02ae08880186b3cefecfc73f87c))
* **deps:** bump i18next from 25.5.2 to 25.6.0 ([#140](https://github.com/castor4bit/epub-image-extractor/issues/140)) ([88f6ea4](https://github.com/castor4bit/epub-image-extractor/commit/88f6ea40aa944cc1eceebeef2b96842d2ac47b5a))
* **deps:** bump p-limit from 7.1.1 to 7.2.0 ([#158](https://github.com/castor4bit/epub-image-extractor/issues/158)) ([7bcf94f](https://github.com/castor4bit/epub-image-extractor/commit/7bcf94f1539a0f288b92b537186c83b0c62094c5))
* **deps:** bump pino from 9.11.0 to 9.12.0 ([#121](https://github.com/castor4bit/epub-image-extractor/issues/121)) ([43251ec](https://github.com/castor4bit/epub-image-extractor/commit/43251ecf9907617d42518e1f3dfac7d40040a69c))
* **deps:** bump pino from 9.12.0 to 10.0.0 ([#139](https://github.com/castor4bit/epub-image-extractor/issues/139)) ([3f4e90e](https://github.com/castor4bit/epub-image-extractor/commit/3f4e90e651d6fdf6fad9c5a8f6130a2886deac45))
* **deps:** bump pino from 9.9.5 to 9.11.0 ([#114](https://github.com/castor4bit/epub-image-extractor/issues/114)) ([b4ed34f](https://github.com/castor4bit/epub-image-extractor/commit/b4ed34f2cb0d1d0527d44f3df7e07f9352f1cb69))
* **deps:** bump react-i18next from 15.7.3 to 16.0.0 ([#137](https://github.com/castor4bit/epub-image-extractor/issues/137)) ([34bff3c](https://github.com/castor4bit/epub-image-extractor/commit/34bff3c6e150c9bf4b29760467e5ff6085c04755))
* **deps:** bump react-i18next from 16.0.0 to 16.5.2 ([#187](https://github.com/castor4bit/epub-image-extractor/issues/187)) ([0443d49](https://github.com/castor4bit/epub-image-extractor/commit/0443d498b8a563e5e4b4fa4f29c2db31b9d306ec))
* **deps:** bump secure-json-parse from 4.0.0 to 4.1.0 ([#138](https://github.com/castor4bit/epub-image-extractor/issues/138)) ([54a1e65](https://github.com/castor4bit/epub-image-extractor/commit/54a1e658ac369a775559d329eb5afdd0bdd506fc))
* **deps:** bump the production-dependencies group across 1 directory with 2 updates ([#110](https://github.com/castor4bit/epub-image-extractor/issues/110)) ([94cc181](https://github.com/castor4bit/epub-image-extractor/commit/94cc181e848d44ae2c9bdd87c49358b87c10561a))
* **deps:** bump the production-dependencies group across 1 directory with 2 updates ([#126](https://github.com/castor4bit/epub-image-extractor/issues/126)) ([82a05d3](https://github.com/castor4bit/epub-image-extractor/commit/82a05d3695628121d666ed56deba79ea6648cac1))
* **deps:** bump the production-dependencies group across 1 directory with 4 updates ([#171](https://github.com/castor4bit/epub-image-extractor/issues/171)) ([517b5f4](https://github.com/castor4bit/epub-image-extractor/commit/517b5f49201e0435bcdaa4f397c7b5f5e4667832))
* **deps:** configure Dependabot to use fix prefix for production dependencies ([#107](https://github.com/castor4bit/epub-image-extractor/issues/107)) ([88a35aa](https://github.com/castor4bit/epub-image-extractor/commit/88a35aa2ff8c10a05f6b0966a349f61f80b3b433))
* **security:** replace regex HTML sanitization with sanitize-html library ([#109](https://github.com/castor4bit/epub-image-extractor/issues/109)) ([949ffb5](https://github.com/castor4bit/epub-image-extractor/commit/949ffb5f255101bb7e28865fb8f1f1a66d4c2f60))

## [0.6.2](https://github.com/castor4bit/epub-image-extractor/compare/v0.6.1...v0.6.2) (2025-08-28)


### Features

* **esm:** Enable ESM with type:module in package.json (Phase 7) ([#57](https://github.com/castor4bit/epub-image-extractor/issues/57)) ([c2d779e](https://github.com/castor4bit/epub-image-extractor/commit/c2d779eb61e8f7134af2334593905949a4b8a301))
* **esm:** ESM migration phase 1 - test infrastructure ([#45](https://github.com/castor4bit/epub-image-extractor/issues/45)) ([128959a](https://github.com/castor4bit/epub-image-extractor/commit/128959a3a1c496316ed423c2aadb2835432bccdf))
* **esm:** ESM migration phase 2 - utility module tests ([#46](https://github.com/castor4bit/epub-image-extractor/issues/46)) ([b9ae1bb](https://github.com/castor4bit/epub-image-extractor/commit/b9ae1bbe172508ec501297f1c92af3943d2f4c31))
* **esm:** ESM migration phase 3 - additional utility tests ([#47](https://github.com/castor4bit/epub-image-extractor/issues/47)) ([0f3024a](https://github.com/castor4bit/epub-image-extractor/commit/0f3024a292e41cccaa226a0b74f758c10604e36c))
* **security:** implement security measures for sandbox-disabled environment ([#72](https://github.com/castor4bit/epub-image-extractor/issues/72)) ([f13d4a5](https://github.com/castor4bit/epub-image-extractor/commit/f13d4a5a66e4019ad27f3ebc097c06305a0c0d3c))


### Bug Fixes

* complete i18n support for error messages ([#68](https://github.com/castor4bit/epub-image-extractor/issues/68)) ([9f94545](https://github.com/castor4bit/epub-image-extractor/commit/9f945456b5ff05d2e30fc6fc1a8d4f66083f38bb))
* enable CI for release PRs using draft PR workflow ([#92](https://github.com/castor4bit/epub-image-extractor/issues/92)) ([7545dbc](https://github.com/castor4bit/epub-image-extractor/commit/7545dbcf788df0b61b01fc925643ad19825c91b6))
* handle clearWindowBounds errors gracefully in settings save ([#73](https://github.com/castor4bit/epub-image-extractor/issues/73)) ([ed3f012](https://github.com/castor4bit/epub-image-extractor/commit/ed3f012b0179e18c72c905dcf414bc79bdfa0932))
* **test:** restore settings integration test after ESM migration ([#58](https://github.com/castor4bit/epub-image-extractor/issues/58)) ([199e617](https://github.com/castor4bit/epub-image-extractor/commit/199e617ac8c9ede8bd964b463cb7146e7c98f641))
* update TypeScript moduleResolution for @vitejs/plugin-react v5 compatibility ([#82](https://github.com/castor4bit/epub-image-extractor/issues/82)) ([8a0ad3c](https://github.com/castor4bit/epub-image-extractor/commit/8a0ad3c8a949a9ecf76e130ae9980c2c52149df4))
* use .mjs extension for ESM preload script ([#71](https://github.com/castor4bit/epub-image-extractor/issues/71)) ([795743a](https://github.com/castor4bit/epub-image-extractor/commit/795743ac74acb0533f55bc5ea676b55a2cd796f0))


### Code Refactoring

* **ci:** consolidate CI workflows to reduce redundancy ([#56](https://github.com/castor4bit/epub-image-extractor/issues/56)) ([db3b666](https://github.com/castor4bit/epub-image-extractor/commit/db3b6664d37628289f9519d8d2b6a23ab06101ca))
* cleanup ESM migration artifacts ([#62](https://github.com/castor4bit/epub-image-extractor/issues/62)) ([4ca9aa7](https://github.com/castor4bit/epub-image-extractor/commit/4ca9aa7c334d8de72a815686f6a8c8b4159dce97))
* consolidate test environment detection to simplify codebase ([#75](https://github.com/castor4bit/epub-image-extractor/issues/75)) ([5d4e777](https://github.com/castor4bit/epub-image-extractor/commit/5d4e777ed2b051ca3216917d4f7c478765b79e05))
* **logger:** remove require() usage for ESM compatibility ([#50](https://github.com/castor4bit/epub-image-extractor/issues/50)) ([06622f2](https://github.com/castor4bit/epub-image-extractor/commit/06622f2186b4be35420ddf6c15a0e790b5294470))

## [0.6.1](https://github.com/castor4bit/epub-image-extractor/compare/v0.6.0...v0.6.1) (2025-07-30)


### Features

* **settings:** update opacity settings to 5% increments with 85% default ([#43](https://github.com/castor4bit/epub-image-extractor/issues/43)) ([d9b306a](https://github.com/castor4bit/epub-image-extractor/commit/d9b306a6974bad614504a0c85598e3f1abedddad))


### Bug Fixes

* Replace deprecated fs.rmdir with fs.rm to fix Node.js warning ([#38](https://github.com/castor4bit/epub-image-extractor/issues/38)) ([724cf7c](https://github.com/castor4bit/epub-image-extractor/commit/724cf7ce3e5e4ab5e86aef5c82dc5a7b3d99c1c5))


### Code Refactoring

* replace async-mutex with custom SimpleMutex implementation ([#42](https://github.com/castor4bit/epub-image-extractor/issues/42)) ([a067631](https://github.com/castor4bit/epub-image-extractor/commit/a067631ab7c8bf6a17a32efad99fdb6fe4305a7a))

## [0.6.0](https://github.com/castor4bit/epub-image-extractor/compare/v0.5.2...v0.6.0) (2025-07-26)


### ⚠ BREAKING CHANGES

* Default ZIP implementation changed to fflate. Use USE_ADM_ZIP=true environment variable for compatibility.

### Features

* Add processing controls for file drop and app exit confirmation ([#34](https://github.com/castor4bit/epub-image-extractor/issues/34)) ([3175042](https://github.com/castor4bit/epub-image-extractor/commit/3175042ed553fc2ee517807a689dfc65f7e49ef3))
* Add window opacity control with mouse hover support ([#35](https://github.com/castor4bit/epub-image-extractor/issues/35)) ([b2e211f](https://github.com/castor4bit/epub-image-extractor/commit/b2e211fb290ba745f6f483876050d5d582966ecb))
* Migrate from adm-zip to fflate for improved performance ([#32](https://github.com/castor4bit/epub-image-extractor/issues/32)) ([cb5f9b0](https://github.com/castor4bit/epub-image-extractor/commit/cb5f9b0db5f611f506ffc08e3be7a99848fdb6df))


### Bug Fixes

* Fix issue where '0' is displayed when files are dropped ([#33](https://github.com/castor4bit/epub-image-extractor/issues/33)) ([30bf0d9](https://github.com/castor4bit/epub-image-extractor/commit/30bf0d9c95a6f89c3c830b8ce67dc29dccfdbe4e))

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
