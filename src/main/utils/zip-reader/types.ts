/**
 * ZIP読み取り用の抽象インターフェース
 * adm-zipとfflateの実装を切り替え可能にする
 */

/**
 * ZIPエントリの情報
 */
export interface ZipEntry {
  /** エントリ名（ファイルパス） */
  name: string;
  /** ディレクトリかどうか */
  isDirectory: boolean;
  /** 非圧縮サイズ（バイト） */
  size: number;
  /** 圧縮後サイズ（バイト） */
  compressedSize: number;
}

/**
 * ZIP読み取りインターフェース
 */
export interface IZipReader {
  /**
   * ZIPファイルを開く
   * @param filePath ZIPファイルのパス
   */
  open(filePath: string): Promise<void>;
  
  /**
   * 特定のエントリを取得
   * @param path エントリのパス
   * @returns エントリ情報（存在しない場合はnull）
   */
  getEntry(path: string): ZipEntry | null;
  
  /**
   * すべてのエントリを取得
   * @returns エントリのリスト
   */
  getEntries(): ZipEntry[];
  
  /**
   * エントリをテキストとして読み取る
   * @param entry 読み取るエントリ
   * @returns テキスト内容
   */
  readAsText(entry: ZipEntry): string;
  
  /**
   * エントリをバッファとして読み取る
   * @param entry 読み取るエントリ
   * @returns バイナリデータ
   */
  readAsBuffer(entry: ZipEntry): Buffer;
  
  /**
   * エントリをファイルとして展開
   * @param entry 展開するエントリ
   * @param outputPath 出力先パス
   */
  extractTo(entry: ZipEntry, outputPath: string): Promise<void>;
  
  /**
   * リソースをクリーンアップ
   */
  close(): void;
}

/**
 * ZIPリーダーのファクトリー関数
 */
export type ZipReaderFactory = () => IZipReader;