import { parseEpub } from '../../src/main/epub/parser';
import { extractImages } from '../../src/main/epub/imageExtractor';
import { organizeByChapters } from '../../src/main/epub/chapterOrganizer';
import path from 'path';
import fs from 'fs/promises';
import * as rimraf from 'rimraf';

describe('チャプターナビゲーション統合テスト', () => {
  const outputDir = path.join(__dirname, 'test-output-chapters');
  
  beforeEach(async () => {
    await rimraf(outputDir);
    await fs.mkdir(outputDir, { recursive: true });
  });
  
  afterEach(async () => {
    await rimraf(outputDir);
  });

  describe('実際のEPUBファイルでのチャプター解析', () => {
    test('/tmp/chapter_test.epubから章情報を正しく抽出できること', async () => {
      const epubPath = '/tmp/chapter_test.epub';
      
      // ファイルの存在確認
      try {
        await fs.access(epubPath);
      } catch {
        console.log('テストファイルが見つかりません: ' + epubPath);
        return;
      }
      
      // EPUB解析
      const epubData = await parseEpub(epubPath);
      
      // チャプター情報の確認
      expect(epubData.navigation.length).toBeGreaterThan(0);
      expect(epubData.navigation.length).toBe(40); // 期待される章数
      
      // 最初の数章を確認
      expect(epubData.navigation[0].title).toBe('表紙');
      expect(epubData.navigation[1].title).toBe('CONTENTS');
      expect(epubData.navigation[2].title).toBe('巻頭特集');
      
      // hrefパスが正しいことを確認
      expect(epubData.navigation[0].href).toContain('xhtml/p-cover.xhtml');
    });

    test('章ごとに画像が正しく整理されること', async () => {
      const epubPath = '/tmp/chapter_test.epub';
      
      try {
        await fs.access(epubPath);
      } catch {
        console.log('テストファイルが見つかりません: ' + epubPath);
        return;
      }
      
      // EPUB解析
      const epubData = await parseEpub(epubPath);
      
      // 画像抽出
      const images = await extractImages(epubData);
      console.log(`抽出された画像数: ${images.length}`);
      
      // 画像を章ごとに整理
      const processedChapters = await organizeByChapters(
        images,
        epubData.navigation,
        outputDir,
        epubPath
      );
      
      // 出力ディレクトリの確認
      const bookDirs = await fs.readdir(outputDir);
      expect(bookDirs.length).toBe(1); // 1冊分のディレクトリ
      
      const bookDir = path.join(outputDir, bookDirs[0]);
      const chapterDirs = await fs.readdir(bookDir);
      
      // 章ディレクトリが作成されていることを確認
      expect(chapterDirs.length).toBeGreaterThan(0);
      
      // 章ディレクトリの命名規則を確認
      const coverDir = chapterDirs.find(dir => dir.includes('表紙'));
      expect(coverDir).toBeDefined();
      expect(coverDir).toMatch(/^\d{3}_表紙$/);
      
      // 章ディレクトリ内に画像があることを確認
      if (coverDir) {
        const coverPath = path.join(bookDir, coverDir);
        const coverImages = await fs.readdir(coverPath);
        expect(coverImages.length).toBeGreaterThan(0);
        
        // 画像ファイル名の命名規則を確認
        expect(coverImages[0]).toMatch(/^\d{3}\.(jpg|jpeg|png|gif|webp)$/i);
      }
    });
  });

  describe('ナビゲーション情報がないEPUBの処理', () => {
    test('ナビゲーションがない場合は「未分類」フォルダに整理されること', async () => {
      const epubPath = '/tmp/isekainonbiri_s01.epub';
      
      try {
        await fs.access(epubPath);
      } catch {
        console.log('テストファイルが見つかりません: ' + epubPath);
        return;
      }
      
      // EPUB解析
      const epubData = await parseEpub(epubPath);
      
      // ナビゲーション情報がないか確認
      if (epubData.navigation.length === 0) {
        // 画像抽出
        const images = await extractImages(epubData);
        
        // 画像を章ごとに整理
        await organizeByChapters(
          images,
          epubData.navigation,
          outputDir,
          epubPath
        );
        
        // 出力ディレクトリの確認
        const bookDirs = await fs.readdir(outputDir);
        const bookDir = path.join(outputDir, bookDirs[0]);
        const chapterDirs = await fs.readdir(bookDir);
        
        // 「未分類」フォルダが作成されていることを確認
        const unclassifiedDir = chapterDirs.find(dir => dir.includes('未分類'));
        expect(unclassifiedDir).toBeDefined();
        expect(unclassifiedDir).toBe('001_未分類');
      }
    });
  });
});