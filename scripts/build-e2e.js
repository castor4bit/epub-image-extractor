#!/usr/bin/env node

import fs from 'fs';
import { execSync } from 'child_process';

// E2E用ビルドスクリプト
// 一時的にpackage.jsonから"type": "module"を削除してCommonJSビルドを作成

console.log('Building E2E test version...');

// package.jsonの元の内容を保持（復元用）
const originalContent = fs.readFileSync('package.json', 'utf8');
const packageJson = JSON.parse(originalContent);

// "type": "module"を一時的に削除
delete packageJson.type;

try {
  // 変更を書き込み
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));

  // ビルド実行
  console.log('Building with CommonJS mode...');
  execSync('tsc && vite build --config vite.config.e2e.ts', { stdio: 'inherit' });

} finally {
  // 元の内容をそのまま復元
  fs.writeFileSync('package.json', originalContent);
  console.log('Build complete.');
}