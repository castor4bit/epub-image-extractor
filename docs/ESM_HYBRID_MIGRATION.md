# ESM・CommonJS混在環境の実現方法

## 概要

「ESM対応ライブラリへ更新しつつ、プロジェクト全体はCommonJSを維持」という混在環境は**実現可能**です。Node.jsとElectronの相互運用機能により、CommonJSプロジェクトからESMライブラリを利用できます。

## なぜ混在が可能か

### Node.jsの相互運用機能

Node.js v12以降では、CommonJSとESMの相互運用が可能：

1. **CommonJS → ESM**: 動的import（`import()`）を使用
2. **ESM → CommonJS**: 直接`import`可能（一部制限あり）

### 現在のプロジェクト構成

```json
// package.json
{
  "type": "commonjs"  // または未指定（デフォルトはCommonJS）
}
```

この状態で、ESMライブラリも利用可能。

## 具体的な実装方法

### 1. 同期的な使用（トップレベル）

```typescript
// ❌ CommonJSでは直接importは使えない
import { XMLParser } from 'fast-xml-parser';  // SyntaxError

// ✅ requireで試みる（ESMライブラリの場合は失敗する可能性）
const { XMLParser } = require('fast-xml-parser');  // ESMの場合エラー
```

### 2. 非同期的な使用（推奨）

```typescript
// src/main/utils/xmlParser.ts (CommonJSファイル)

// 動的importを使用してESMライブラリを読み込む
async function parseXML(xmlString: string) {
  // ESMライブラリを動的import
  const { XMLParser } = await import('fast-xml-parser');
  
  const parser = new XMLParser();
  return parser.parse(xmlString);
}

// キャッシュしてパフォーマンスを改善
let cachedParser: any;

async function getXMLParser() {
  if (!cachedParser) {
    const module = await import('fast-xml-parser');
    cachedParser = module.XMLParser;
  }
  return cachedParser;
}
```

### 3. ラッパーモジュールパターン

```typescript
// src/main/utils/esmWrapper.ts
// ESMライブラリをCommonJS互換でラップ

interface XMLParserWrapper {
  parse: (xml: string) => Promise<any>;
}

class ESMXMLParser implements XMLParserWrapper {
  private parser: any;
  
  async initialize() {
    if (!this.parser) {
      const { XMLParser } = await import('fast-xml-parser');
      this.parser = new XMLParser();
    }
  }
  
  async parse(xml: string): Promise<any> {
    await this.initialize();
    return this.parser.parse(xml);
  }
}

// CommonJSエクスポート
module.exports = { ESMXMLParser };
```

### 4. 実際の使用例

```typescript
// src/main/epub/parser.ts (現在のCommonJSファイル)

// 現在のxml2js（CommonJS）
import { parseStringPromise } from 'xml2js';

// ESMライブラリ（fast-xml-parser）を混在させる場合
async function parseWithFastXML(xml: string) {
  // 動的importで読み込み
  const { XMLParser } = await import('fast-xml-parser');
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '$'
  });
  return parser.parse(xml);
}

// 既存のコードはそのまま維持
export async function parseEpub(epubPath: string): Promise<EpubData> {
  // xml2js（CommonJS）を使用
  const containerData = await parseStringPromise(containerXml);
  
  // 必要に応じてESMライブラリも使用可能
  // const containerData = await parseWithFastXML(containerXml);
}
```

## electron-storeの例

### 現在（v8.2.0 - CommonJS）

```typescript
// 通常のrequire/importが可能
import Store from 'electron-store';
const store = new Store();
```

### v10以降（ESM）に更新した場合

```typescript
// 方法1: 動的import
async function getStore() {
  const { default: Store } = await import('electron-store');
  return new Store();
}

// 方法2: トップレベルawait（TypeScript 4.5+、ES2022）
const { default: Store } = await import('electron-store');
const store = new Store();

// 方法3: 初期化パターン
let store: any;

async function initializeStore() {
  if (!store) {
    const { default: Store } = await import('electron-store');
    store = new Store();
  }
  return store;
}

// 使用時
async function saveSettings(settings: any) {
  const store = await initializeStore();
  store.set('settings', settings);
}
```

## 段階的移行の利点

1. **リスクの最小化**: 一度にすべてを変更する必要がない
2. **動作確認が容易**: 部分的に変更して検証可能
3. **ロールバック可能**: 問題があれば元に戻せる
4. **学習曲線が緩やか**: チームが徐々にESMに慣れることができる

## 注意点

### 1. パフォーマンスへの影響

動的importは非同期処理のため：
- 初回ロード時にわずかな遅延
- キャッシュで軽減可能

### 2. TypeScriptの設定

```json
// tsconfig.json
{
  "compilerOptions": {
    "module": "commonjs",  // CommonJSを維持
    "moduleResolution": "node",
    "esModuleInterop": true,  // 相互運用性を有効化
    "allowSyntheticDefaultImports": true
  }
}
```

### 3. ビルドツールの考慮

Viteやwebpackは自動的に処理してくれることが多い：
- ESM/CommonJSの違いを吸収
- 最適なバンドルを生成

## 推奨される移行戦略

### Phase 1: 混在環境の構築（現在可能）
1. プロジェクトはCommonJSのまま維持
2. 新しいESMライブラリは動的importで使用
3. 既存のCommonJSライブラリはそのまま

### Phase 2: 部分的なESM化（将来）
1. 新規ファイルは`.mjs`または`"type": "module"`で作成
2. 依存関係の少ないモジュールから移行
3. テストで動作確認

### Phase 3: 完全ESM化（長期目標）
1. すべてのファイルをESMに変換
2. package.jsonに`"type": "module"`を追加
3. CommonJSサポートを削除

## まとめ

**「ESM非対応ライブラリへ更新して、他は現状維持」は完全に実現可能**です。動的importを使用することで、CommonJSプロジェクトからESMライブラリを問題なく利用できます。これにより、段階的で安全な移行が可能になります。