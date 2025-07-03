import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs/promises';
import { app } from 'electron';

/**
 * ZIPファイル内のEPUBファイルを検出して展開
 */
export async function extractEpubsFromZip(zipPath: string): Promise<string[]> {
  const extractedPaths: string[] = [];
  
  try {
    const zip = new AdmZip(zipPath);
    const zipEntries = zip.getEntries();
    
    // 一時ディレクトリを作成
    const tempDir = path.join(app.getPath('temp'), 'epub-extractor', Date.now().toString());
    await fs.mkdir(tempDir, { recursive: true });
    
    // EPUBファイルを検出して展開
    for (const entry of zipEntries) {
      const entryName = entry.entryName;
      
      // EPUBファイルかどうかチェック
      if (entryName.toLowerCase().endsWith('.epub') && !entry.isDirectory) {
        // ファイル名を取得（パスの最後の部分）
        const fileName = path.basename(entryName);
        const outputPath = path.join(tempDir, fileName);
        
        // EPUBファイルを展開
        zip.extractEntryTo(entry, tempDir, false, true);
        
        // 展開されたファイルのパスを記録
        if (await fileExists(outputPath)) {
          extractedPaths.push(outputPath);
        }
      }
    }
    
    return extractedPaths;
  } catch (error) {
    console.error('ZIP展開エラー:', error);
    throw new Error(`ZIPファイルの展開に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
  }
}

/**
 * 一時ファイルのクリーンアップ
 */
export async function cleanupTempFiles(filePaths: string[]): Promise<void> {
  for (const filePath of filePaths) {
    try {
      // ファイルが一時ディレクトリにある場合のみ削除
      if (filePath.includes(app.getPath('temp'))) {
        await fs.unlink(filePath);
        
        // 親ディレクトリが空の場合は削除
        const parentDir = path.dirname(filePath);
        const files = await fs.readdir(parentDir);
        if (files.length === 0) {
          await fs.rmdir(parentDir);
        }
      }
    } catch (error) {
      console.warn(`一時ファイルの削除に失敗: ${filePath}`, error);
    }
  }
}

/**
 * ファイルがZIPかどうかを判定
 */
export function isZipFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return ext === '.zip';
}

/**
 * ファイルの存在確認
 */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}