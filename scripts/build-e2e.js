#!/usr/bin/env node

import fs from 'fs';
import { execSync } from 'child_process';

// E2E用ビルドスクリプト
// 一時的にpackage.jsonから"type": "module"を削除してCommonJSビルドを作成

console.log('Building E2E test version...');

// package.jsonを読み込み
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// "type": "module"を一時的に削除
const originalType = packageJson.type;
delete packageJson.type;

try {
  // 変更を書き込み
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
  
  // ビルド実行
  console.log('Building with CommonJS mode...');
  execSync('tsc && vite build --config vite.config.e2e.ts', { stdio: 'inherit' });
  
} finally {
  // 元に戻す
  if (originalType) {
    packageJson.type = originalType;
    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
  }
  console.log('Build complete.');
}