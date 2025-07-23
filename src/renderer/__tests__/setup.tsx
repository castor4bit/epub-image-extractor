import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// テスト用のi18n設定
const testI18n = i18n.createInstance();
testI18n.use(initReactI18next).init({
  lng: 'ja',
  fallbackLng: 'en',
  debug: false,
  interpolation: {
    escapeValue: false,
  },
  resources: {
    ja: {
      translation: {
        app: {
          title: 'EPUB Image Extractor',
          settings: '設定',
        },
        dropZone: {
          title: 'EPUBファイルをドロップ',
          subtitle: 'または複数のEPUBを含むZIPファイル',
          or: 'または',
          selectFiles: 'ファイルを選択',
        },
        compactDropZone: {
          title: '追加のEPUBファイルをドロップ',
          or: 'または',
          selectFiles: 'ファイルを選択',
        },
        processing: {
          title: '処理中',
          completed: '{{completed}}件完了',
          processing: '{{processing}}件処理中',
          pending: '{{pending}}件待機中',
          error: '{{error}}件エラー',
          extracting: '画像を抽出中...',
          organizing: 'ファイルを整理中...',
          completed_text: '完了',
          error_text: 'エラー',
          pending_text: '待機中',
          openFolder: 'フォルダを開く',
          clear: 'クリア',
          alreadyProcessing: '現在処理中です。完了までお待ちください。',
          no_images: '画像なし',
        },
        settings: {
          title: '設定',
          close: '×',
          outputDirectory: {
            label: '出力ディレクトリ',
            browse: '参照',
            description: '抽出した画像の保存先フォルダ',
          },
          parallelFiles: {
            label: '並列処理ファイル数',
            description: '同時に処理するEPUBファイルの数（1-10）',
          },
          filenameOptions: {
            title: 'ファイル名オプション',
            includeOriginalFilename: '元のファイル名を含める',
            includeOriginalFilenameDesc: '例: 001_cover.jpg（有効時）vs 001.jpg（無効時）',
            includePageSpread: '見開き情報を含める',
            includePageSpreadDesc: '例: 001_left.jpg, 002_right.jpg（見開きページの場合）',
          },
          actions: {
            reset: 'デフォルトに戻す',
            cancel: 'キャンセル',
            save: '保存',
            saving: '保存中...',
          },
          alwaysOnTop: 'ウィンドウを最前面に表示',
        },
        language: {
          label: '言語',
          ja: '日本語',
          en: 'English',
        },
        errors: {
          fileProcessing: 'ファイル処理中にエラーが発生しました',
          invalidFile: '無効なファイル形式です',
          noImages: '画像が見つかりませんでした',
        },
        units: {
          images: '画像',
          chapters: '章',
        },
        about: {
          title: 'アプリケーション情報',
          version: 'バージョン',
          description: 'EPUBファイルから章別に画像を抽出するデスクトップアプリケーション',
          showDetails: '詳細情報を表示...',
          systemInfo: 'システム情報',
          platform: 'プラットフォーム',
          license: 'ライセンス',
          licenseText: 'このソフトウェアはMITライセンスの下で配布されています。',
          close: '閉じる',
        },
      },
    },
    en: {
      translation: {
        app: {
          title: 'EPUB Image Extractor',
          settings: 'Settings',
        },
        dropZone: {
          title: 'Drop EPUB files here',
          subtitle: 'or ZIP files containing multiple EPUBs',
          or: 'or',
          selectFiles: 'Select files',
        },
        compactDropZone: {
          title: 'Drop additional EPUB files',
          or: 'or',
          selectFiles: 'Select files',
        },
        processing: {
          title: 'Processing',
          completed: '{{completed}} completed',
          processing: '{{processing}} processing',
          pending: '{{pending}} pending',
          error: '{{error}} error(s)',
          extracting: 'Extracting images...',
          organizing: 'Organizing files...',
          completed_text: 'Completed',
          error_text: 'Error',
          pending_text: 'Pending',
          openFolder: 'Open Folder',
          clear: 'Clear',
          alreadyProcessing: 'Currently processing. Please wait until completion.',
          no_images: 'No images',
        },
        settings: {
          title: 'Settings',
          close: '×',
          outputDirectory: {
            label: 'Output Directory',
            browse: 'Browse',
            description: 'Destination folder for extracted images',
          },
          parallelFiles: {
            label: 'Parallel Processing Files',
            description: 'Number of EPUB files to process simultaneously (1-10)',
          },
          filenameOptions: {
            title: 'Filename Options',
            includeOriginalFilename: 'Include original filename',
            includeOriginalFilenameDesc: 'e.g., 001_cover.jpg (enabled) vs 001.jpg (disabled)',
            includePageSpread: 'Include page spread info',
            includePageSpreadDesc: 'e.g., 001_left.jpg, 002_right.jpg (for spread pages)',
          },
          actions: {
            reset: 'Reset to Default',
            cancel: 'Cancel',
            save: 'Save',
            saving: 'Saving...',
          },
          alwaysOnTop: 'Keep window on top',
        },
        language: {
          label: 'Language',
          ja: '日本語',
          en: 'English',
        },
        errors: {
          fileProcessing: 'An error occurred while processing the file',
          invalidFile: 'Invalid file format',
          noImages: 'No images found',
        },
        units: {
          images: 'images',
          chapters: 'chapters',
        },
        about: {
          title: 'About Application',
          version: 'Version',
          description: 'Desktop application for extracting images from EPUB files by chapter',
          showDetails: 'Show Details...',
          systemInfo: 'System Information',
          platform: 'Platform',
          license: 'License',
          licenseText: 'This software is distributed under the MIT License.',
          close: 'Close',
        },
      },
    },
  },
});

// カスタムレンダー関数を作成してI18nextProviderでラップ
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <I18nextProvider i18n={testI18n}>{children}</I18nextProvider>;
};

const customRender = (ui: React.ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// re-export everything
export * from '@testing-library/react';

// override render method
export { customRender as render };
