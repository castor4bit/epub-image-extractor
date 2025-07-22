import fs from 'fs/promises';
import path from 'path';
import { logger } from './logger';

/**
 * フォルダを再帰的にスキャンしてEPUBファイルを検索
 * @param folderPath スキャンするフォルダのパス
 * @param maxDepth 最大探索深度（デフォルト: 3）
 * @returns EPUBファイルのパスの配列
 */
export async function scanFolderForEpubs(
  folderPath: string,
  maxDepth: number = 3,
): Promise<string[]> {
  const epubFiles: string[] = [];

  async function scanRecursive(currentPath: string, currentDepth: number): Promise<void> {
    if (currentDepth > maxDepth) {
      logger.debug({ path: currentPath, depth: currentDepth }, 'Maximum depth reached, skipping');
      return;
    }

    try {
      const entries = await fs.readdir(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);

        if (entry.isDirectory()) {
          // 隠しフォルダとシステムフォルダをスキップ
          if (entry.name.startsWith('.') || entry.name === 'node_modules') {
            logger.debug({ folder: entry.name }, 'Skipping hidden/system folder');
            continue;
          }

          // サブフォルダを再帰的にスキャン
          await scanRecursive(fullPath, currentDepth + 1);
        } else if (entry.isFile()) {
          // EPUBファイルまたはZIPファイルをチェック
          const ext = path.extname(entry.name).toLowerCase();
          if (ext === '.epub' || ext === '.zip') {
            epubFiles.push(fullPath);
            logger.debug({ file: fullPath }, 'Found EPUB/ZIP file');
          }
        }
      }
    } catch (error) {
      logger.error(
        { err: error instanceof Error ? error : new Error(String(error)), path: currentPath },
        'Error scanning folder',
      );
    }
  }

  await scanRecursive(folderPath, 0);

  logger.debug({ folderPath, foundFiles: epubFiles.length, maxDepth }, 'Folder scan completed');

  return epubFiles;
}

/**
 * 複数のフォルダをスキャンしてEPUBファイルを検索
 * @param folderPaths スキャンするフォルダのパスの配列
 * @param maxDepth 最大探索深度
 * @returns EPUBファイルのパスの配列
 */
export async function scanMultipleFoldersForEpubs(
  folderPaths: string[],
  maxDepth: number = 3,
): Promise<string[]> {
  const allEpubFiles: string[] = [];

  for (const folderPath of folderPaths) {
    const epubFiles = await scanFolderForEpubs(folderPath, maxDepth);
    allEpubFiles.push(...epubFiles);
  }

  // 重複を除去
  return [...new Set(allEpubFiles)];
}
