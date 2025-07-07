import path from 'path';
import fs from 'fs/promises';
import { Mutex } from 'async-mutex';

// 並列処理での競合を防ぐためのミューテックス
const outputPathMutex = new Mutex();

/**
 * 出力ディレクトリのパスを生成し、重複を避ける
 * @param baseDir 基本出力ディレクトリ
 * @param bookName 書籍名
 * @returns 重複を避けた出力パス
 */
export async function generateUniqueOutputPath(
  baseDir: string,
  bookName: string
): Promise<string> {
  // ファイル名として使用できない文字を置換
  const safeName = bookName.replace(/[<>:"/\\|?*]/g, '_');
  let outputPath = path.join(baseDir, safeName);
  let counter = 1;
  
  // ディレクトリが既に存在する場合は番号を付ける
  while (await exists(outputPath)) {
    outputPath = path.join(baseDir, `${safeName}_${counter}`);
    counter++;
    
    // 無限ループを防ぐため、上限を設定
    if (counter > 1000) {
      throw new Error('出力ディレクトリの作成に失敗しました: 重複が多すぎます');
    }
  }
  
  return outputPath;
}

/**
 * 既存のディレクトリを保護するオプション付きで出力パスを生成
 * @param baseDir 基本出力ディレクトリ
 * @param bookName 書籍名
 * @param options オプション
 * @returns 出力パス情報
 */
export async function generateOutputPath(
  baseDir: string,
  bookName: string,
  options: {
    overwrite?: boolean;
    appendTimestamp?: boolean;
    askConfirmation?: () => Promise<boolean>;
  } = {}
): Promise<{
  path: string;
  isNew: boolean;
  warning?: string;
}> {
  const safeName = bookName.replace(/[<>:"/\\|?*]/g, '_');
  
  // タイムスタンプを追加する場合
  if (options.appendTimestamp) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const outputPath = path.join(baseDir, `${safeName}_${timestamp}`);
    return { path: outputPath, isNew: true };
  }
  
  const outputPath = path.join(baseDir, safeName);
  const pathExists = await exists(outputPath);
  
  // ディレクトリが存在しない場合
  if (!pathExists) {
    return { path: outputPath, isNew: true };
  }
  
  // 上書きモードの場合
  if (options.overwrite) {
    return {
      path: outputPath,
      isNew: false,
      warning: '既存のファイルが上書きされます'
    };
  }
  
  // 確認を求める場合
  if (options.askConfirmation) {
    const shouldOverwrite = await options.askConfirmation();
    if (shouldOverwrite) {
      return {
        path: outputPath,
        isNew: false,
        warning: '既存のファイルが上書きされます'
      };
    }
  }
  
  // デフォルト: 連番を付けて新しいディレクトリを作成
  // 並列処理での競合を防ぐため、ミューテックスを使用
  const release = await outputPathMutex.acquire();
  try {
    const uniquePath = await generateUniqueOutputPath(baseDir, bookName);
    // ディレクトリを作成して確保
    await fs.mkdir(uniquePath, { recursive: true });
    return {
      path: uniquePath,
      isNew: true,
      warning: `既存のディレクトリが存在するため、新しいディレクトリ「${path.basename(uniquePath)}」を作成します`
    };
  } finally {
    release();
  }
}

/**
 * ファイル/ディレクトリの存在確認
 */
async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}