import React from 'react';
import { describe, test, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { render, screen, fireEvent } from '../../__tests__/setup';
import { CompactDropZone } from '../CompactDropZone';

describe('CompactDropZone - Processing State', () => {
  const mockHandlers = {
    onDragEnter: vi.fn(),
    onDragOver: vi.fn(),
    onDragLeave: vi.fn(),
    onDrop: vi.fn(),
    onFileSelect: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should apply disabled class when processing', () => {
    const { rerender } = render(
      <CompactDropZone isDragging={false} isProcessing={false} {...mockHandlers} />,
    );

    // 通常状態
    const dropZone = screen.getByText('追加のEPUBファイルをドロップ').closest('.compact-drop-zone');
    expect(dropZone).not.toHaveClass('disabled');

    // 処理中状態
    rerender(<CompactDropZone isDragging={false} isProcessing={true} {...mockHandlers} />);
    expect(dropZone).toHaveClass('disabled');
  });

  it('should block drag events when processing', () => {
    render(<CompactDropZone isDragging={false} isProcessing={true} {...mockHandlers} />);

    const dropZone = screen
      .getByText('追加のEPUBファイルをドロップ')
      .closest('.compact-drop-zone')!;

    // ドラッグイベントをシミュレート
    fireEvent.dragEnter(dropZone);
    fireEvent.dragOver(dropZone);
    fireEvent.dragLeave(dropZone);
    fireEvent.drop(dropZone);

    // ハンドラーが呼ばれないことを確認
    expect(mockHandlers.onDragEnter).not.toHaveBeenCalled();
    expect(mockHandlers.onDragOver).not.toHaveBeenCalled();
    expect(mockHandlers.onDragLeave).not.toHaveBeenCalled();
    expect(mockHandlers.onDrop).not.toHaveBeenCalled();
  });

  it('should disable file input when processing', () => {
    render(<CompactDropZone isDragging={false} isProcessing={true} {...mockHandlers} />);

    const fileInput = document.getElementById('compact-file-input') as HTMLInputElement;
    expect(fileInput).toBeDisabled();
  });

  it('should disable select button when processing', () => {
    render(<CompactDropZone isDragging={false} isProcessing={true} {...mockHandlers} />);

    const selectButton = screen.getByText('ファイルを選択');
    expect(selectButton).toHaveClass('disabled');
  });

  it('should allow drag events when not processing', () => {
    render(<CompactDropZone isDragging={false} isProcessing={false} {...mockHandlers} />);

    const dropZone = screen
      .getByText('追加のEPUBファイルをドロップ')
      .closest('.compact-drop-zone')!;

    // ドラッグイベントをシミュレート
    fireEvent.dragEnter(dropZone);
    fireEvent.dragOver(dropZone);
    fireEvent.dragLeave(dropZone);
    fireEvent.drop(dropZone);

    // ハンドラーが呼ばれることを確認
    expect(mockHandlers.onDragEnter).toHaveBeenCalled();
    expect(mockHandlers.onDragOver).toHaveBeenCalled();
    expect(mockHandlers.onDragLeave).toHaveBeenCalled();
    expect(mockHandlers.onDrop).toHaveBeenCalled();
  });
});
