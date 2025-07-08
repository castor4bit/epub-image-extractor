// EPUB処理関連の型定義
export interface EPUBFile {
  path: string;
  name: string;
}

export interface ProcessingProgress {
  fileId: string;
  fileName: string;
  totalImages: number;
  processedImages: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
  outputPath?: string;
  chapters?: number;
}

export interface ChapterInfo {
  order: number;
  title: string;
  href: string;
}

export interface ImageInfo {
  src: string;
  chapterOrder: number;
  pageOrder: number;
}

export interface ExtractionResult {
  fileId: string;
  fileName: string;
  outputPath: string;
  totalImages: number;
  chapters: number;
  errors: string[];
}
