#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// CHANGELOGから最新バージョンの内容を取得
function getLatestChangelog() {
  const changelogPath = path.join(__dirname, '../CHANGELOG.md');
  const changelog = fs.readFileSync(changelogPath, 'utf8');
  
  // 最新バージョンのセクションを抽出（最初の ## [x.x.x] から次の ## まで）
  const versionMatch = changelog.match(/## \[(\d+\.\d+\.\d+)\][^#]*/);
  if (!versionMatch) {
    return null;
  }
  
  const version = versionMatch[1];
  const content = versionMatch[0];
  
  // 各セクションを抽出
  const features = [];
  const fixes = [];
  
  // Features
  const featuresMatch = content.match(/### Features\s*([\s\S]*?)(?=###|$)/);
  if (featuresMatch) {
    const items = featuresMatch[1].match(/\* .+/g) || [];
    features.push(...items.map(item => item.replace(/\* /, '- ').replace(/\(\[[a-f0-9]+\]\(.*?\)\)/, '').trim()));
  }
  
  // Bug Fixes
  const fixesMatch = content.match(/### Bug Fixes\s*([\s\S]*?)(?=###|$)/);
  if (fixesMatch) {
    const items = fixesMatch[1].match(/\* .+/g) || [];
    fixes.push(...items.map(item => item.replace(/\* /, '- ').replace(/\(\[[a-f0-9]+\]\(.*?\)\)/, '').trim()));
  }
  
  return { version, features, fixes };
}

// README更新
function updateReadme(filePath, isJapanese = false) {
  const content = fs.readFileSync(filePath, 'utf8');
  const changelogData = getLatestChangelog();
  
  if (!changelogData) {
    console.warn('⚠️  No changelog data found');
    return;
  }
  
  const { version, features, fixes } = changelogData;
  
  // 最近の更新セクションを生成
  let recentUpdates = '';
  
  if (isJapanese) {
    recentUpdates = `## 最近の更新（v${version}）\n\n`;
    
    if (features.length > 0) {
      recentUpdates += '### 新機能\n';
      features.forEach(feature => {
        recentUpdates += `${feature}\n`;
      });
      recentUpdates += '\n';
    }
    
    if (fixes.length > 0) {
      recentUpdates += '### バグ修正\n';
      fixes.forEach(fix => {
        recentUpdates += `${fix}\n`;
      });
    }
  } else {
    recentUpdates = `## Recent Updates (v${version})\n\n`;
    
    if (features.length > 0) {
      recentUpdates += '### New Features\n';
      features.forEach(feature => {
        recentUpdates += `${feature}\n`;
      });
      recentUpdates += '\n';
    }
    
    if (fixes.length > 0) {
      recentUpdates += '### Bug Fixes\n';
      fixes.forEach(fix => {
        recentUpdates += `${fix}\n`;
      });
    }
  }
  
  // README内の最近の更新セクションを置換
  const pattern = isJapanese 
    ? /## 最近の更新（v[\d.]+）[\s\S]*?(?=## [^#]|$)/
    : /## Recent Updates \(v[\d.]+\)[\s\S]*?(?=## [^#]|$)/;
  
  let updatedContent;
  if (content.match(pattern)) {
    // 既存のセクションを置換
    updatedContent = content.replace(pattern, (match) => {
      // 次のセクションが残っている場合は保持
      const nextSectionMatch = match.match(/(## [^#].*)$/);
      if (nextSectionMatch) {
        return recentUpdates + '\n' + nextSectionMatch[1];
      }
      return recentUpdates + '\n';
    });
  } else {
    console.warn(`⚠️  Recent updates section not found in ${path.basename(filePath)}`);
    updatedContent = content;
  }
  
  fs.writeFileSync(filePath, updatedContent);
  console.log(`✅ Updated ${path.basename(filePath)} with latest changelog`);
}

// メイン処理
const readmePath = path.join(__dirname, '../README.md');
const readmeJaPath = path.join(__dirname, '../README.ja.md');

updateReadme(readmePath, false);
updateReadme(readmeJaPath, true);

console.log('\n✨ README files updated with latest changelog content');