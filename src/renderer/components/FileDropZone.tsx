import React from 'react';

interface FileDropZoneProps {
  isDragging: boolean;
  onDragEnter: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FileDropZone: React.FC<FileDropZoneProps> = ({
  isDragging,
  onDragEnter,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileSelect,
}) => {
  return (
    <div
      className={`drop-zone ${isDragging ? 'active' : ''}`}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="drop-zone-content">
        <svg className="drop-icon" width="64" height="64" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2L12 14M12 14L16 10M12 14L8 10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M20 17V19C20 20.1046 19.1046 21 18 21H6C4.89543 21 4 20.1046 4 19V17"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <p className="drop-text">EPUBファイルをここにドラッグ&ドロップ</p>
        <p className="drop-or">または</p>
        <input
          type="file"
          id="file-input"
          multiple
          accept=".epub,application/epub+zip"
          onChange={onFileSelect}
          style={{ display: 'none' }}
        />
        <label htmlFor="file-input" className="select-button">
          ファイルを選択
        </label>
      </div>
    </div>
  );
};