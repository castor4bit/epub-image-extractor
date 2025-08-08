import { FflateReader } from '../FflateReader';
import { IZipReader } from '../types';
import path from 'path';
import fs from 'fs';

describe('FflateReader', () => {
  const testEpubPath = path.join(__dirname, '../../../../../tests/fixtures/test.epub');
  let reader: IZipReader;

  beforeEach(async () => {
    reader = new FflateReader();
    await reader.open(testEpubPath);
  });

  afterEach(() => {
    reader.close();
  });

  describe('open', () => {
    it('should open a valid ZIP file', async () => {
      const newReader = new FflateReader();
      await expect(newReader.open(testEpubPath)).resolves.not.toThrow();
      newReader.close();
    });

    it('should throw error for non-existent file', async () => {
      const newReader = new FflateReader();
      await expect(newReader.open('/non/existent/file.zip')).rejects.toThrow();
    });
  });

  describe('getEntries', () => {
    it('should return all entries in the ZIP file', () => {
      const entries = reader.getEntries();
      expect(entries).toBeDefined();
      expect(entries.length).toBeGreaterThan(0);

      // test.epubの既知のエントリをチェック
      const entryNames = entries.map((e) => e.name);
      expect(entryNames).toContain('META-INF/container.xml');
      expect(entryNames).toContain('OEBPS/content.opf');
    });

    it('should correctly identify directories', () => {
      const entries = reader.getEntries();
      const metaInfDir = entries.find((e) => e.name === 'META-INF/' || e.name === 'META-INF');

      // ディレクトリの扱いは実装によって異なる可能性がある
      if (metaInfDir) {
        expect(metaInfDir.isDirectory).toBe(true);
      }
    });
  });

  describe('getEntry', () => {
    it('should return specific entry', () => {
      const entry = reader.getEntry('META-INF/container.xml');
      expect(entry).not.toBeNull();
      expect(entry?.name).toBe('META-INF/container.xml');
      expect(entry?.isDirectory).toBe(false);
      expect(entry?.size).toBeGreaterThan(0);
    });

    it('should return null for non-existent entry', () => {
      const entry = reader.getEntry('non/existent/file.txt');
      expect(entry).toBeNull();
    });
  });

  describe('readAsText', () => {
    it('should read text content from entry', () => {
      const entry = reader.getEntry('META-INF/container.xml');
      expect(entry).not.toBeNull();

      const content = reader.readAsText(entry!);
      expect(content).toContain('<?xml');
      expect(content).toContain('container');
      expect(content).toContain('rootfiles');
    });

    it('should throw error for non-existent entry', () => {
      const fakeEntry = { name: 'fake.txt', isDirectory: false, size: 0, compressedSize: 0 };
      expect(() => reader.readAsText(fakeEntry)).toThrow();
    });
  });

  describe('readAsBuffer', () => {
    it('should read binary content from entry', () => {
      const entry = reader.getEntry('OEBPS/images/test1.jpg');
      expect(entry).not.toBeNull();

      const buffer = reader.readAsBuffer(entry!);
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);

      // JPEGマジックナンバーをチェック（FFD8）
      expect(buffer[0]).toBe(0xff);
      expect(buffer[1]).toBe(0xd8);
    });
  });

  describe('extractTo', () => {
    it('should extract file to specified path', async () => {
      const entry = reader.getEntry('META-INF/container.xml');
      expect(entry).not.toBeNull();

      const tempDir = path.join(__dirname, '../../../../../.tmp/test-extract');
      const outputPath = path.join(tempDir, 'extracted-container.xml');

      await reader.extractTo(entry!, outputPath);

      // ファイルが存在することを確認
      expect(fs.existsSync(outputPath)).toBe(true);

      // 内容が正しいことを確認
      const content = fs.readFileSync(outputPath, 'utf-8');
      expect(content).toContain('<?xml');
      expect(content).toContain('container');

      // クリーンアップ
      fs.unlinkSync(outputPath);
      fs.rmSync(tempDir, { recursive: true });
    });
  });
});
