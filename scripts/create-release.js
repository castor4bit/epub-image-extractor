#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// package.jsonからバージョンを取得
const packageJson = require('../package.json');
const version = packageJson.version;

// CHANGELOGから最新リリースの内容を抽出
function extractLatestChangelog() {
  const changelogPath = path.join(__dirname, '../CHANGELOG.md');
  const changelog = fs.readFileSync(changelogPath, 'utf8');
  
  // バージョンセクションを探す
  const versionRegex = new RegExp(`## \\[${version}\\].*?(?=## \\[|$)`, 's');
  const match = changelog.match(versionRegex);
  
  if (match) {
    return match[0].trim();
  }
  
  return `Release v${version}`;
}

// GitHubリリースを作成
function createGitHubRelease() {
  console.log(`\n📦 Creating GitHub Release for v${version}...\n`);
  
  const releaseNotes = extractLatestChangelog();
  const tag = `v${version}`;
  
  try {
    // リリースノートを一時ファイルに保存
    const tmpFile = path.join(__dirname, '../.release-notes.tmp');
    fs.writeFileSync(tmpFile, releaseNotes);
    
    // GitHub CLIを使用してリリースを作成
    execSync(`gh release create ${tag} --title "v${version}" --notes-file "${tmpFile}"`, {
      stdio: 'inherit'
    });
    
    // 一時ファイルを削除
    fs.unlinkSync(tmpFile);
    
    console.log(`\n✅ GitHub Release created successfully!`);
    console.log(`📎 View release: https://github.com/castor4bit/epub-image-extractor/releases/tag/${tag}`);
  } catch (error) {
    console.error('❌ Failed to create GitHub release:', error.message);
    console.log('\n💡 Make sure you have GitHub CLI installed and authenticated.');
    console.log('   Install: https://cli.github.com/');
    console.log('   Auth: gh auth login');
  }
}

// メイン処理
if (require.main === module) {
  createGitHubRelease();
}