#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 移行対象のインポート変換マップ
const importReplacements = [
  {
    from: "import { describe, test, expect, jest, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';",
    to: "import { describe, test, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';"
  },
  {
    from: "import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';",
    to: "import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';"
  },
  {
    from: "import { describe, test, expect, jest, beforeEach } from '@jest/globals';",
    to: "import { describe, test, expect, vi, beforeEach } from 'vitest';"
  },
  {
    from: "import { describe, test, expect, jest } from '@jest/globals';",
    to: "import { describe, test, expect, vi } from 'vitest';"
  },
  {
    from: "import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';",
    to: "import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';"
  },
  {
    from: "import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';",
    to: "import { describe, test, expect, beforeEach, afterEach } from 'vitest';"
  },
  {
    from: "import { describe, test, expect, beforeEach } from '@jest/globals';",
    to: "import { describe, test, expect, beforeEach } from 'vitest';"
  },
  {
    from: "import { describe, test, expect } from '@jest/globals';",
    to: "import { describe, test, expect } from 'vitest';"
  }
];

// Jest API から Vitest API への変換
const apiReplacements = [
  { from: /jest\.fn\(/g, to: 'vi.fn(' },
  { from: /jest\.spyOn\(/g, to: 'vi.spyOn(' },
  { from: /jest\.mock\(/g, to: 'vi.mock(' },
  { from: /jest\.unmock\(/g, to: 'vi.unmock(' },
  { from: /jest\.clearAllMocks\(/g, to: 'vi.clearAllMocks(' },
  { from: /jest\.resetAllMocks\(/g, to: 'vi.resetAllMocks(' },
  { from: /jest\.restoreAllMocks\(/g, to: 'vi.restoreAllMocks(' },
  { from: /jest\.useFakeTimers\(/g, to: 'vi.useFakeTimers(' },
  { from: /jest\.useRealTimers\(/g, to: 'vi.useRealTimers(' },
  { from: /jest\.advanceTimersByTime\(/g, to: 'vi.advanceTimersByTime(' },
  { from: /jest\.runAllTimers\(/g, to: 'vi.runAllTimers(' },
  { from: /jest\.runOnlyPendingTimers\(/g, to: 'vi.runOnlyPendingTimers(' },
  { from: /jest\.clearAllTimers\(/g, to: 'vi.clearAllTimers(' },
  { from: /jest\.resetModules\(/g, to: 'vi.resetModules(' },
  { from: /jest\.SpiedFunction</g, to: 'SpyInstance<' },
  { from: /jest\.Mocked</g, to: 'MockedFunction<' },
  { from: /jest\.MockedFunction</g, to: 'MockedFunction<' },
  { from: /jest\.MockedClass</g, to: 'MockedClass<' },
];

async function migrateTestFile(inputPath, outputPath) {
  try {
    let content = await fs.readFile(inputPath, 'utf-8');
    
    // インポート文の置換
    let importReplaced = false;
    for (const replacement of importReplacements) {
      if (content.includes(replacement.from)) {
        content = content.replace(replacement.from, replacement.to);
        importReplaced = true;
        break;
      }
    }
    
    // Jest API の置換
    for (const replacement of apiReplacements) {
      content = content.replace(replacement.from, replacement.to);
    }
    
    // vi がインポートされていない場合の追加
    if (content.includes('vi.') && !content.includes('vi,') && !content.includes('vi }')) {
      content = content.replace(
        "import { describe, test, expect",
        "import { describe, test, expect, vi"
      );
    }
    
    // ファイルを書き込み
    await fs.writeFile(outputPath, content, 'utf-8');
    
    console.log(`✅ Migrated: ${path.basename(inputPath)} -> ${path.basename(outputPath)}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to migrate ${inputPath}:`, error.message);
    return false;
  }
}

async function findTestFiles(dir, pattern = /\.test\.ts$/) {
  const files = [];
  const items = await fs.readdir(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    
    if (item.isDirectory() && !item.name.includes('node_modules') && !item.name.includes('dist')) {
      files.push(...await findTestFiles(fullPath, pattern));
    } else if (item.isFile() && pattern.test(item.name)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

async function main() {
  const targetDir = process.argv[2];
  
  if (!targetDir) {
    console.log('Usage: node migrate-to-vitest.js <directory>');
    console.log('Example: node migrate-to-vitest.js src/main/utils');
    process.exit(1);
  }
  
  const absoluteDir = path.resolve(process.cwd(), targetDir);
  console.log(`🔍 Searching for test files in: ${absoluteDir}`);
  
  const testFiles = await findTestFiles(absoluteDir);
  console.log(`📝 Found ${testFiles.length} test files`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (const testFile of testFiles) {
    // .vitest.test.ts が既に存在する場合はスキップ
    const outputPath = testFile.replace(/\.test\.ts$/, '.vitest.test.ts');
    
    try {
      await fs.access(outputPath);
      console.log(`⏭️  Skipping (already exists): ${path.basename(outputPath)}`);
      continue;
    } catch {
      // ファイルが存在しない場合は続行
    }
    
    const success = await migrateTestFile(testFile, outputPath);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }
  
  console.log('\n📊 Migration Summary:');
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`⏭️  Skipped: ${testFiles.length - successCount - failCount}`);
}

main().catch(console.error);