import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FileProcessingList } from '../FileProcessingList';
import { ProcessingProgress, ExtractionResult } from '@shared/types';

describe('FileProcessingList', () => {
  const mockOnClearAll = jest.fn();
  const mockOnOpenFolder = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('進捗データと結果データを統合して表示する', () => {
    const progress: Record<string, ProcessingProgress> = {
      'file-1-1000': {
        fileId: 'file-1-1000',
        fileName: 'test1.epub',
        status: 'processing',
        totalImages: 100,
        processedImages: 50,
      },
      'file-2-2000': {
        fileId: 'file-2-2000',
        fileName: 'test2.epub',
        status: 'pending',
        totalImages: 0,
        processedImages: 0,
      },
    };

    const results: ExtractionResult[] = [
      {
        fileId: 'file-0-500',
        fileName: 'completed.epub',
        outputPath: '/path/to/output',
        totalImages: 200,
        chapters: 10,
        errors: [],
      },
    ];

    render(
      <FileProcessingList
        progress={progress}
        results={results}
        onClearAll={mockOnClearAll}
        onOpenFolder={mockOnOpenFolder}
      />,
    );

    // ファイル名が表示されている
    expect(screen.getByText('test1.epub')).toBeInTheDocument();
    expect(screen.getByText('test2.epub')).toBeInTheDocument();
    expect(screen.getByText('completed.epub')).toBeInTheDocument();

    // ステータスアイコンが表示されている
    expect(screen.getByText('⋯')).toBeInTheDocument(); // processing
    expect(screen.getByText('○')).toBeInTheDocument(); // pending
    expect(screen.getByText('✓')).toBeInTheDocument(); // completed

    // 処理状況サマリーが正しい
    expect(screen.getByText('1完了')).toBeInTheDocument();
    expect(screen.getByText('1処理中')).toBeInTheDocument();
  });

  test('ステータス優先度でソートされる', () => {
    const progress: Record<string, ProcessingProgress> = {
      'file-3-3000': {
        fileId: 'file-3-3000',
        fileName: 'pending.epub',
        status: 'pending',
        totalImages: 0,
        processedImages: 0,
      },
      'file-2-2000': {
        fileId: 'file-2-2000',
        fileName: 'processing.epub',
        status: 'processing',
        totalImages: 100,
        processedImages: 50,
      },
      'file-4-4000': {
        fileId: 'file-4-4000',
        fileName: 'error.epub',
        status: 'error',
        totalImages: 0,
        processedImages: 0,
        error: 'エラーが発生しました',
      },
    };

    const results: ExtractionResult[] = [
      {
        fileId: 'file-1-1000',
        fileName: 'completed.epub',
        outputPath: '/path/to/output',
        totalImages: 200,
        chapters: 10,
        errors: [],
      },
    ];

    const { container } = render(
      <FileProcessingList
        progress={progress}
        results={results}
        onClearAll={mockOnClearAll}
        onOpenFolder={mockOnOpenFolder}
      />,
    );

    const fileNames = container.querySelectorAll('.file-name');
    expect(fileNames[0]).toHaveTextContent('processing.epub'); // 最優先
    expect(fileNames[1]).toHaveTextContent('pending.epub');
    expect(fileNames[2]).toHaveTextContent('error.epub');
    expect(fileNames[3]).toHaveTextContent('completed.epub'); // 最後
  });

  test('出力先を開くボタンが機能する', () => {
    const results: ExtractionResult[] = [
      {
        fileId: 'file-1-1000',
        fileName: 'test.epub',
        outputPath: '/path/to/output',
        totalImages: 100,
        chapters: 5,
        errors: [],
      },
    ];

    render(
      <FileProcessingList
        progress={{}}
        results={results}
        onClearAll={mockOnClearAll}
        onOpenFolder={mockOnOpenFolder}
      />,
    );

    const openButton = screen.getByText('📁 出力先を開く');
    fireEvent.click(openButton);

    expect(mockOnOpenFolder).toHaveBeenCalledWith('/path/to/output');
  });

  test('クリアボタンが機能する', () => {
    const progress: Record<string, ProcessingProgress> = {
      'file-1-1000': {
        fileId: 'file-1-1000',
        fileName: 'test.epub',
        status: 'completed',
        totalImages: 100,
        processedImages: 100,
      },
    };

    render(
      <FileProcessingList
        progress={progress}
        results={[]}
        onClearAll={mockOnClearAll}
        onOpenFolder={mockOnOpenFolder}
      />,
    );

    const clearButton = screen.getByText('クリア');
    fireEvent.click(clearButton);

    expect(mockOnClearAll).toHaveBeenCalled();
  });

  test('エラーメッセージが表示される', () => {
    const progress: Record<string, ProcessingProgress> = {
      'file-1-1000': {
        fileId: 'file-1-1000',
        fileName: 'error.epub',
        status: 'error',
        totalImages: 0,
        processedImages: 0,
        error: 'ファイルが破損しています',
      },
    };

    render(
      <FileProcessingList
        progress={progress}
        results={[]}
        onClearAll={mockOnClearAll}
        onOpenFolder={mockOnOpenFolder}
      />,
    );

    expect(screen.getByText('エラー: ファイルが破損しています')).toBeInTheDocument();
  });

  test('処理中の進捗バーが表示される', () => {
    const progress: Record<string, ProcessingProgress> = {
      'file-1-1000': {
        fileId: 'file-1-1000',
        fileName: 'processing.epub',
        status: 'processing',
        totalImages: 100,
        processedImages: 75,
      },
    };

    render(
      <FileProcessingList
        progress={progress}
        results={[]}
        onClearAll={mockOnClearAll}
        onOpenFolder={mockOnOpenFolder}
      />,
    );

    expect(screen.getByText('処理中: 75 / 100 画像')).toBeInTheDocument();

    // 進捗バーの幅が75%になっている
    const progressBar = screen
      .getByText('処理中: 75 / 100 画像')
      .previousElementSibling?.querySelector('.progress-fill') as HTMLElement;
    expect(progressBar.style.width).toBe('75%');
  });
});
