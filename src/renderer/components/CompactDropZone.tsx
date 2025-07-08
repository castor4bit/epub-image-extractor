import React from 'react';

interface CompactDropZoneProps {
  isDragging: boolean;
  onDragEnter: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const CompactDropZone: React.FC<CompactDropZoneProps> = ({
  isDragging,
  onDragEnter,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileSelect,
}) => {
  return (
    <div
      className={`compact-drop-zone ${isDragging ? 'dragging' : ''}`}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="drop-zone-content">
        <span className="drop-icon">📁</span>
        <span className="drop-text">ファイルを追加</span>
        <span className="drop-subtext">ドラッグ&ドロップ</span>
      </div>
      <input
        type="file"
        id="compact-file-input"
        style={{ display: 'none' }}
        multiple
        accept=".epub,.zip,application/epub+zip,application/zip"
        onChange={onFileSelect}
      />
      <label htmlFor="compact-file-input" className="file-input-label">
        または選択
      </label>
    </div>
  );
};
