# ログシステム

EPUB Image Extractorは、高性能なログライブラリ「pino」を使用しています。

## 概要

- **ライブラリ**: [pino](https://github.com/pinojs/pino) v9.x
- **ログフォーマット**: JSON（本番環境）、Pretty（開発環境）
- **ログファイル**: `app.log`（単一ファイル）

## 環境別設定

### 開発環境
- コンソールにカラー付きで出力（pino-pretty使用）
- ログレベル: `info`（デフォルト）

### 本番環境
- ファイルに JSON 形式で出力
- ログファイルパス:
  - macOS: `~/Library/Application Support/epub-image-extractor/app.log`
  - Windows: `%APPDATA%\epub-image-extractor\app.log`
- ログレベル: `info`（デフォルト）

### テスト環境
- ログレベル: `error`（エラーのみ）
- 出力先: 一時ディレクトリ

## ログレベル

以下のログレベルが利用可能です：

- `trace` (10)
- `debug` (20) - デバッグ情報
- `info` (30) - 一般的な情報
- `warn` (40) - 警告
- `error` (50) - エラー
- `fatal` (60) - 致命的エラー

## 環境変数

### LOG_LEVEL
ログレベルを制御します。

```bash
# デバッグログを有効化
LOG_LEVEL=debug npm run dev

# エラーのみ出力
LOG_LEVEL=error npm start
```

## 使用方法

### 基本的な使用

```typescript
import { logger } from '@main/utils/logger';

// 情報ログ
logger.info('アプリケーションが起動しました');

// デバッグログ（構造化データ付き）
logger.debug({ userId: 123, action: 'processEpub' }, 'EPUB処理開始');

// 警告ログ
logger.warn({ fileSize: 1000000 }, 'ファイルサイズが大きい');

// エラーログ
logger.error({ err: error, filePath: '/path/to/file' }, '処理エラー');
```

### pinoのAPIパターン

pinoは第一引数にオブジェクト、第二引数にメッセージを取ります：

```typescript
// 正しい使用方法
logger.info({ data: value }, 'メッセージ');

// 間違った使用方法（winstonスタイル）
// logger.info('メッセージ', { data: value });  // ❌
```

## ログファイルのローテーション

現在の実装では、ログファイルの自動ローテーションは行われません。
必要に応じて、OSレベルでのログローテーションを設定してください。

### macOS/Linux (logrotate)

`/etc/logrotate.d/epub-image-extractor` を作成：

```
/Users/*/Library/Application Support/epub-image-extractor/app.log {
    daily
    rotate 7
    compress
    missingok
    notifempty
    create 0644
}
```

### Windows (PowerShell)

タスクスケジューラーで以下のスクリプトを実行：

```powershell
$logPath = "$env:APPDATA\epub-image-extractor\app.log"
$date = Get-Date -Format "yyyyMMdd"
$archivePath = "$env:APPDATA\epub-image-extractor\app-$date.log"

if (Test-Path $logPath) {
    Move-Item $logPath $archivePath -Force
    Compress-Archive $archivePath "$archivePath.zip" -Force
    Remove-Item $archivePath
}
```

## 移行ガイド（winston → pino）

### 主な変更点

1. **API の変更**
   ```typescript
   // winston
   getLogger().debug('メッセージ', { data });
   
   // pino
   logger.debug({ data }, 'メッセージ');
   ```

2. **ログファイル構成**
   - 以前: 3つのファイル（error.log, combined.log, debug.log）
   - 現在: 1つのファイル（app.log）

3. **インポートパス**
   ```typescript
   // 以前
   import { getLogger } from '../utils/errorHandler';
   
   // 現在
   import { logger } from '../utils/logger';
   ```

## トラブルシューティング

### ログが出力されない
- 環境変数 `LOG_LEVEL` を確認
- ファイルパスの書き込み権限を確認

### 開発環境でログが見づらい
- pino-pretty が正しくインストールされているか確認
- `NODE_ENV` が `production` に設定されていないか確認

### パフォーマンスの問題
- ログレベルを上げる（debug → info または warn）
- 構造化データのサイズを制限する