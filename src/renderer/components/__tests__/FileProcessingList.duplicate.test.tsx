import React from 'react';
import { render, screen } from '@testing-library/react';
import { FileProcessingList } from '../FileProcessingList';
import { ProcessingProgress, ExtractionResult } from '@shared/types';

describe('FileProcessingList - 重複表示の防止', () => {
  const mockOnClearAll = jest.fn();
  const mockOnOpenFolder = jest.fn();

  test('progressとresultsに同じファイルがある場合、重複表示されない', () => {
    const progress: Record<string, ProcessingProgress> = {
      'file-1-1000': {
        fileId: 'file-1-1000',
        fileName: 'test.epub',
        status: 'completed',
        totalImages: 100,
        processedImages: 100,
      },
    };

    const results: ExtractionResult[] = [
      {
        fileId: 'file-1-1000',
        fileName: 'test.epub',
        outputPath: '/output/test',
        totalImages: 100,
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

    // ファイル名が1回だけ表示されることを確認
    const fileNameElements = screen.getAllByText('test.epub');
    expect(fileNameElements).toHaveLength(1);
  });

  test('resultsの情報が優先され、outputPathが利用可能', () => {
    const progress: Record<string, ProcessingProgress> = {
      'file-1-1000': {
        fileId: 'file-1-1000',
        fileName: 'test.epub',
        status: 'completed',
        totalImages: 100,
        processedImages: 100,
        // outputPathはない
      },
    };

    const results: ExtractionResult[] = [
      {
        fileId: 'file-1-1000',
        fileName: 'test.epub',
        outputPath: '/output/test',
        totalImages: 100,
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

    // 出力先を開くボタンが表示されることを確認
    expect(screen.getByText('📁 出力先を開く')).toBeInTheDocument();
  });

  test('処理中のファイルはprogressから、完了ファイルはresultsから表示', () => {
    const progress: Record<string, ProcessingProgress> = {
      'file-1-1000': {
        fileId: 'file-1-1000',
        fileName: 'processing.epub',
        status: 'processing',
        totalImages: 100,
        processedImages: 50,
      },
      'file-2-2000': {
        fileId: 'file-2-2000',
        fileName: 'completed.epub',
        status: 'completed',
        totalImages: 200,
        processedImages: 200,
      },
    };

    const results: ExtractionResult[] = [
      {
        fileId: 'file-2-2000',
        fileName: 'completed.epub',
        outputPath: '/output/completed',
        totalImages: 200,
        chapters: 15,
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

    // 処理中のファイルは1つ
    expect(screen.getByText('processing.epub')).toBeInTheDocument();
    expect(screen.getByText('画像を抽出中: 50 / 100')).toBeInTheDocument();

    // 完了ファイルは1つ（重複なし）
    const completedElements = screen.getAllByText('completed.epub');
    expect(completedElements).toHaveLength(1);

    // 完了ファイルには出力先ボタンがある
    const openButtons = screen.getAllByText('📁 出力先を開く');
    expect(openButtons).toHaveLength(1);
  });
});
