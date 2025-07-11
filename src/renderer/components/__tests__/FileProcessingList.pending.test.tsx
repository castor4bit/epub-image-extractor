import React from 'react';
import { render, screen } from '../../__tests__/setup';
import { FileProcessingList } from '../FileProcessingList';
import { ProcessingProgress, ExtractionResult } from '@shared/types';

describe('FileProcessingList - 待機中の表示', () => {
  const mockOnClearAll = jest.fn();
  const mockOnOpenFolder = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('待機中のファイル数が表示される', () => {
    const progress: Record<string, ProcessingProgress> = {
      'file-1': {
        fileId: 'file-1',
        fileName: 'test1.epub',
        totalImages: 0,
        processedImages: 0,
        status: 'pending',
      },
      'file-2': {
        fileId: 'file-2',
        fileName: 'test2.epub',
        totalImages: 0,
        processedImages: 0,
        status: 'pending',
      },
      'file-3': {
        fileId: 'file-3',
        fileName: 'test3.epub',
        totalImages: 10,
        processedImages: 5,
        status: 'processing',
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

    // 待機中の件数が表示されることを確認
    expect(screen.getByText('2件待機中')).toBeInTheDocument();
    expect(screen.getByText('1件処理中')).toBeInTheDocument();
  });

  test('複数のステータスが混在する場合の表示', () => {
    const progress: Record<string, ProcessingProgress> = {
      'file-1': {
        fileId: 'file-1',
        fileName: 'test1.epub',
        totalImages: 0,
        processedImages: 0,
        status: 'pending',
      },
      'file-2': {
        fileId: 'file-2',
        fileName: 'test2.epub',
        totalImages: 10,
        processedImages: 5,
        status: 'processing',
      },
    };

    const results: ExtractionResult[] = [
      {
        fileId: 'file-3',
        fileName: 'test3.epub',
        outputPath: '/output/test3',
        totalImages: 20,
        chapters: 5,
        errors: [],
      },
      {
        fileId: 'file-4',
        fileName: 'test4.epub',
        outputPath: '/output/test4',
        totalImages: 0,
        chapters: 0,
        errors: ['エラーが発生しました'],
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

    // すべてのステータスが表示されることを確認
    expect(screen.getByText('1件完了')).toBeInTheDocument();
    expect(screen.getByText('1件処理中')).toBeInTheDocument();
    expect(screen.getByText('1件待機中')).toBeInTheDocument();
    expect(screen.getByText('1件エラー')).toBeInTheDocument();
  });

  test('待機中のファイルがない場合は表示されない', () => {
    const results: ExtractionResult[] = [
      {
        fileId: 'file-1',
        fileName: 'test1.epub',
        outputPath: '/output/test1',
        totalImages: 20,
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

    // 待機中の表示がないことを確認
    expect(screen.queryByText(/待機中/)).not.toBeInTheDocument();
    expect(screen.getByText('1件完了')).toBeInTheDocument();
  });
});
