import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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
        onDragEnter={mockOnDragEnter}
        onDragOver={mockOnDragOver}
        onDragLeave={mockOnDragLeave}
        onDrop={mockOnDrop}
        onFileSelect={mockOnFileSelect}
      />,
    );

    expect(screen.getByText('📁')).toBeInTheDocument();
    expect(screen.getByText('ファイルを追加')).toBeInTheDocument();
    expect(screen.getByText('ドラッグ&ドロップ')).toBeInTheDocument();
    expect(screen.getByText('または選択')).toBeInTheDocument();
  });

  test('ドラッグ中のスタイルが適用される', () => {
    const { container } = render(
      <CompactDropZone
        isDragging={true}
        onDragEnter={mockOnDragEnter}
        onDragOver={mockOnDragOver}
        onDragLeave={mockOnDragLeave}
        onDrop={mockOnDrop}
        onFileSelect={mockOnFileSelect}
      />,
    );

    const dropZone = container.querySelector('.compact-drop-zone');
    expect(dropZone).toHaveClass('dragging');
  });

  test('ドラッグイベントが正しく処理される', () => {
    const { container } = render(
      <CompactDropZone
        isDragging={false}
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
        onDragEnter={mockOnDragEnter}
        onDragOver={mockOnDragOver}
        onDragLeave={mockOnDragLeave}
        onDrop={mockOnDrop}
        onFileSelect={mockOnFileSelect}
      />,
    );

    const input = screen.getByLabelText('または選択') as HTMLInputElement;
    expect(input).toHaveAttribute('type', 'file');
    expect(input).toHaveAttribute('multiple');
    expect(input).toHaveAttribute('accept', '.epub,.zip,application/epub+zip,application/zip');

    // ファイル選択イベント
    const file = new File(['test'], 'test.epub', { type: 'application/epub+zip' });
    fireEvent.change(input, { target: { files: [file] } });
    expect(mockOnFileSelect).toHaveBeenCalled();
  });
});
