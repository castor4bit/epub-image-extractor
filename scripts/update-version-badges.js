#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// package.jsonからバージョンを取得
const packageJson = require('../package.json');
const version = packageJson.version;

// 更新するファイルのリスト
const filesToUpdate = [
  {
    path: path.join(__dirname, '../README.md'),
    patterns: [
      {
        // バージョンバッジ
        regex: /!\[Version\]\(https:\/\/img\.shields\.io\/badge\/version-[0-9]+\.[0-9]+\.[0-9]+-blue\.svg\)/g,
        replacement: `![Version](https://img.shields.io/badge/version-${version}-blue.svg)`
      },
      {
        // Recent Updates見出し
        regex: /## Recent Updates \(v[0-9]+\.[0-9]+\.[0-9]+\)/g,
        replacement: `## Recent Updates (v${version})`
      }
    ]
  },
  {
    path: path.join(__dirname, '../README.ja.md'),
    patterns: [
      {
        // バージョンバッジ
        regex: /!\[Version\]\(https:\/\/img\.shields\.io\/badge\/version-[0-9]+\.[0-9]+\.[0-9]+-blue\.svg\)/g,
        replacement: `![Version](https://img.shields.io/badge/version-${version}-blue.svg)`
      },
      {
        // 最近の更新見出し
        regex: /## 最近の更新（v[0-9]+\.[0-9]+\.[0-9]+）/g,
        replacement: `## 最近の更新（v${version}）`
      }
    ]
  }
];

// ファイルを更新
filesToUpdate.forEach(file => {
  if (fs.existsSync(file.path)) {
    let content = fs.readFileSync(file.path, 'utf8');
    
    file.patterns.forEach(pattern => {
      content = content.replace(pattern.regex, pattern.replacement);
    });
    
    fs.writeFileSync(file.path, content);
    console.log(`✅ Updated ${path.basename(file.path)}`);
  } else {
    console.warn(`⚠️  File not found: ${file.path}`);
  }
});

console.log(`\n✨ Version badges updated to v${version}`);