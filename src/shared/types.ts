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
  phase?: 'extracting' | 'organizing'; // 処理フェーズ
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
  pageSpread?: 'left' | 'right'; // ページの左右配置情報
}

export interface ExtractionResult {
  fileId: string;
  fileName: string;
  outputPath: string;
  totalImages: number;
  chapters: number;
  errors: string[];
}

export interface Settings {
  outputDirectory: string;
  language: string;
  alwaysOnTop: boolean;
  includeOriginalFilename: boolean;
  includePageSpread: boolean;
  inactiveOpacity?: number; // ウィンドウ非アクティブ時の透明度（0.1～1.0）
  enableMouseHoverOpacity?: boolean; // マウスオーバー時に透明度を戻すかどうか
}

export interface AppVersionInfo {
  version: string;
  name: string;
  electronVersion: string;
  nodeVersion: string;
  chromiumVersion: string;
  platform: string;
  arch: string;
}
