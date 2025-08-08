import React from 'react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '../../__tests__/setup';
import { FileProcessingList } from '../FileProcessingList';
import { ProcessingProgress } from '@shared/types';

describe('FileProcessingList - 「0」の表示問題', () => {
  const mockOnClearAll = vi.fn();
  const mockOnOpenFolder = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('pending状態では「待機中」と表示され、「0」は表示されない', () => {
    const progress: Record<string, ProcessingProgress> = {
      'file-1': {
        fileId: 'file-1',
        fileName: 'test.epub',
        totalImages: 0,
        processedImages: 0,
        status: 'pending',
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

    // ファイル名が表示される
    expect(screen.getByText('test.epub')).toBeInTheDocument();

    // 「待機中」と表示される
    expect(screen.getByText('待機中')).toBeInTheDocument();

    // デバッグ情報を出力
    const container = screen.getByText('test.epub').closest('.processing-item');
    console.log('=== pending状態のレンダリング内容 ===');
    console.log(container?.innerHTML);

    // 「0」という文字が表示されないことを確認
    const zeroElements = screen.queryAllByText('0');
    expect(zeroElements.length).toBe(0);

    // 「0画像」や「0 / 0」といった表示もないことを確認
    expect(screen.queryByText(/0.*画像/)).not.toBeInTheDocument();
    expect(screen.queryByText(/0.*\/.*0/)).not.toBeInTheDocument();
  });

  it('processing状態でtotalImages=0の場合は「画像を抽出中...」と表示', () => {
    const progress: Record<string, ProcessingProgress> = {
      'file-1': {
        fileId: 'file-1',
        fileName: 'test.epub',
        totalImages: 0,
        processedImages: 0,
        status: 'processing',
        phase: 'extracting',
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

    // 「画像を抽出中...」と表示される
    expect(screen.getByText('画像を抽出中...')).toBeInTheDocument();

    // 「0」や「0 / 0」といった表示はない
    expect(screen.queryByText(/0.*\/.*0/)).not.toBeInTheDocument();
  });

  it('completed状態でtotalImages=0の場合は「画像なし」と表示', () => {
    const progress: Record<string, ProcessingProgress> = {
      'file-1': {
        fileId: 'file-1',
        fileName: 'test.epub',
        totalImages: 0,
        processedImages: 0,
        status: 'completed',
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

    // 「画像なし」と表示される
    expect(screen.getByText('画像なし')).toBeInTheDocument();

    // 「0」という単独の文字は表示されない
    const zeroElements = screen.queryAllByText('0');
    expect(zeroElements.length).toBe(0);
  });
});
