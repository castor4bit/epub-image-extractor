import AdmZip from 'adm-zip';
import { IZipReader, ZipEntry } from './types';
import fs from 'fs/promises';
import path from 'path';

/**
 * adm-zipを使用したZIPリーダー実装
 */
export class AdmZipReader implements IZipReader {
  private zip?: AdmZip;
  private entries: Map<string, AdmZip.IZipEntry> = new Map();
  
  async open(filePath: string): Promise<void> {
    try {
      this.zip = new AdmZip(filePath);
      const allEntries = this.zip.getEntries();
      
      // エントリをマップに保存
      this.entries.clear();
      allEntries.forEach(entry => {
        this.entries.set(entry.entryName, entry);
      });
    } catch (error) {
      throw new Error(`Failed to open ZIP file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  getEntry(entryPath: string): ZipEntry | null {
    const admEntry = this.entries.get(entryPath);
    if (!admEntry) {
      return null;
    }
    
    return this.convertToZipEntry(admEntry);
  }
  
  getEntries(): ZipEntry[] {
    const entries: ZipEntry[] = [];
    this.entries.forEach(admEntry => {
      entries.push(this.convertToZipEntry(admEntry));
    });
    return entries;
  }
  
  readAsText(entry: ZipEntry): string {
    if (!this.zip) {
      throw new Error('ZIP file not opened');
    }
    
    const admEntry = this.entries.get(entry.name);
    if (!admEntry) {
      throw new Error(`Entry not found: ${entry.name}`);
    }
    
    return this.zip.readAsText(admEntry);
  }
  
  readAsBuffer(entry: ZipEntry): Buffer {
    if (!this.zip) {
      throw new Error('ZIP file not opened');
    }
    
    const admEntry = this.entries.get(entry.name);
    if (!admEntry) {
      throw new Error(`Entry not found: ${entry.name}`);
    }
    
    return this.zip.readFile(admEntry);
  }
  
  async extractTo(entry: ZipEntry, outputPath: string): Promise<void> {
    if (!this.zip) {
      throw new Error('ZIP file not opened');
    }
    
    const admEntry = this.entries.get(entry.name);
    if (!admEntry) {
      throw new Error(`Entry not found: ${entry.name}`);
    }
    
    // ディレクトリを作成
    const dir = path.dirname(outputPath);
    await fs.mkdir(dir, { recursive: true });
    
    // ファイルを展開
    const buffer = this.zip.readFile(admEntry);
    await fs.writeFile(outputPath, buffer);
  }
  
  close(): void {
    this.zip = undefined;
    this.entries.clear();
  }
  
  /**
   * adm-zipのエントリをZipEntryに変換
   */
  private convertToZipEntry(admEntry: AdmZip.IZipEntry): ZipEntry {
    return {
      name: admEntry.entryName,
      isDirectory: admEntry.isDirectory,
      size: admEntry.header.size,
      compressedSize: admEntry.header.compressedSize,
    };
  }
}