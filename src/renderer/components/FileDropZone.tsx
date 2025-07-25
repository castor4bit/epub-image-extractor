import React from 'react';
import { useTranslation } from 'react-i18next';

interface FileDropZoneProps {
  isDragging: boolean;
  isProcessing: boolean;
  onDragEnter: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FileDropZone: React.FC<FileDropZoneProps> = ({
  isDragging,
  isProcessing,
  onDragEnter,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileSelect,
}) => {
  const { t } = useTranslation();

  // 処理中はドロップイベントを無効化
  const handleDragEnter = (e: React.DragEvent) => {
    if (isProcessing) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onDragEnter(e);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (isProcessing) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onDragOver(e);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (isProcessing) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onDragLeave(e);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (isProcessing) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onDrop(e);
  };

  return (
    <div
      className={`drop-zone ${isDragging ? 'active' : ''} ${isProcessing ? 'disabled' : ''}`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="drop-zone-content">
        <svg className="drop-icon" width="48" height="48" viewBox="0 0 24 24" fill="none">
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
        <p className="drop-text">{t('dropZone.title')}</p>
        <small className="drop-subtitle">{t('dropZone.subtitle')}</small>
        <p className="drop-or">{t('dropZone.or')}</p>
        <input
          type="file"
          id="file-input"
          multiple
          accept=".epub,application/epub+zip,.zip"
          onChange={onFileSelect}
          disabled={isProcessing}
          style={{ display: 'none' }}
        />
        <label htmlFor="file-input" className={`select-button ${isProcessing ? 'disabled' : ''}`}>
          {t('dropZone.selectFiles')}
        </label>
      </div>
    </div>
  );
};
