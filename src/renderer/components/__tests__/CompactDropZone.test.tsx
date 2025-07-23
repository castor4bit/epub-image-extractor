import React from 'react';
import { render, screen, fireEvent } from '../../__tests__/setup';
import { CompactDropZone } from '../CompactDropZone';

describe('CompactDropZone', () => {
  const mockOnDragEnter = jest.fn();
  const mockOnDragOver = jest.fn();
  const mockOnDragLeave = jest.fn();
  const mockOnDrop = jest.fn();
  const mockOnFileSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('コンパクトなドロップゾーンが表示される', () => {
    render(
      <CompactDropZone
        isDragging={false}
        isProcessing={false}
        onDragEnter={mockOnDragEnter}
        onDragOver={mockOnDragOver}
        onDragLeave={mockOnDragLeave}
        onDrop={mockOnDrop}
        onFileSelect={mockOnFileSelect}
      />,
    );

    expect(screen.getByText('追加のEPUBファイルをドロップ')).toBeInTheDocument();
    expect(screen.getByText('または')).toBeInTheDocument();
    expect(screen.getByText('ファイルを選択')).toBeInTheDocument();
    // SVGアイコンが存在することを確認
    const svgIcon = document.querySelector('.compact-drop-icon');
    expect(svgIcon).toBeInTheDocument();
  });

  test('ドラッグ中のスタイルが適用される', () => {
    const { container } = render(
      <CompactDropZone
        isDragging={true}
        isProcessing={false}
        onDragEnter={mockOnDragEnter}
        onDragOver={mockOnDragOver}
        onDragLeave={mockOnDragLeave}
        onDrop={mockOnDrop}
        onFileSelect={mockOnFileSelect}
      />,
    );

    const dropZone = container.querySelector('.compact-drop-zone');
    expect(dropZone).toHaveClass('active');
  });

  test('ドラッグイベントが正しく処理される', () => {
    const { container } = render(
      <CompactDropZone
        isDragging={false}
        isProcessing={false}
        onDragEnter={mockOnDragEnter}
        onDragOver={mockOnDragOver}
        onDragLeave={mockOnDragLeave}
        onDrop={mockOnDrop}
        onFileSelect={mockOnFileSelect}
      />,
    );

    const dropZone = container.querySelector('.compact-drop-zone')!;

    // dragEnterイベント
    fireEvent.dragEnter(dropZone);
    expect(mockOnDragEnter).toHaveBeenCalled();

    // dragOverイベント
    fireEvent.dragOver(dropZone);
    expect(mockOnDragOver).toHaveBeenCalled();

    // dragLeaveイベント
    fireEvent.dragLeave(dropZone);
    expect(mockOnDragLeave).toHaveBeenCalled();

    // dropイベント
    fireEvent.drop(dropZone);
    expect(mockOnDrop).toHaveBeenCalled();
  });

  test('ファイル選択が機能する', () => {
    render(
      <CompactDropZone
        isDragging={false}
        isProcessing={false}
        onDragEnter={mockOnDragEnter}
        onDragOver={mockOnDragOver}
        onDragLeave={mockOnDragLeave}
        onDrop={mockOnDrop}
        onFileSelect={mockOnFileSelect}
      />,
    );

    const input = screen.getByLabelText('ファイルを選択') as HTMLInputElement;
    expect(input).toHaveAttribute('type', 'file');
    expect(input).toHaveAttribute('multiple');
    expect(input).toHaveAttribute('accept', '.epub,.zip,application/epub+zip,application/zip');

    // ファイル選択イベント
    const file = new File(['test'], 'test.epub', { type: 'application/epub+zip' });
    fireEvent.change(input, { target: { files: [file] } });
    expect(mockOnFileSelect).toHaveBeenCalled();
  });
});
