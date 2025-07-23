import { unzipSync, strFromU8 } from 'fflate';
import { IZipReader, ZipEntry } from './types';
import fs from 'fs/promises';
import path from 'path';

/**
 * fflateを使用したZIPリーダー実装
 */
export class FflateReader implements IZipReader {
  private unzipped?: Record<string, Uint8Array>;
  private filePath?: string;

  async open(filePath: string): Promise<void> {
    try {
      this.filePath = filePath;
      const fileData = await fs.readFile(filePath);
      this.unzipped = unzipSync(new Uint8Array(fileData));
    } catch (error) {
      throw new Error(
        `Failed to open ZIP file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  getEntry(entryPath: string): ZipEntry | null {
    if (!this.unzipped) {
      throw new Error('ZIP file not opened');
    }

    const data = this.unzipped[entryPath];
    if (!data) {
      return null;
    }

    return {
      name: entryPath,
      isDirectory: entryPath.endsWith('/'),
      size: data.length,
      compressedSize: data.length, // fflateでは圧縮サイズの取得が困難
    };
  }

  getEntries(): ZipEntry[] {
    if (!this.unzipped) {
      throw new Error('ZIP file not opened');
    }

    const entries: ZipEntry[] = [];
    for (const [name, data] of Object.entries(this.unzipped)) {
      entries.push({
        name,
        isDirectory: name.endsWith('/'),
        size: data.length,
        compressedSize: data.length,
      });
    }
    return entries;
  }

  readAsText(entry: ZipEntry): string {
    if (!this.unzipped) {
      throw new Error('ZIP file not opened');
    }

    const data = this.unzipped[entry.name];
    if (!data) {
      throw new Error(`Entry not found: ${entry.name}`);
    }

    return strFromU8(data);
  }

  readAsBuffer(entry: ZipEntry): Buffer {
    if (!this.unzipped) {
      throw new Error('ZIP file not opened');
    }

    const data = this.unzipped[entry.name];
    if (!data) {
      throw new Error(`Entry not found: ${entry.name}`);
    }

    return Buffer.from(data);
  }

  async extractTo(entry: ZipEntry, outputPath: string): Promise<void> {
    if (!this.unzipped) {
      throw new Error('ZIP file not opened');
    }

    const data = this.unzipped[entry.name];
    if (!data) {
      throw new Error(`Entry not found: ${entry.name}`);
    }

    // ディレクトリを作成
    const dir = path.dirname(outputPath);
    await fs.mkdir(dir, { recursive: true });

    // ファイルを書き込み
    await fs.writeFile(outputPath, data);
  }

  close(): void {
    this.unzipped = undefined;
    this.filePath = undefined;
  }
}
