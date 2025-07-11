import React from 'react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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
        <p className="drop-text">{t('dropZone.title')}</p>
        <small className="drop-subtitle">{t('dropZone.subtitle')}</small>
        <p className="drop-or">{t('dropZone.or')}</p>
        <input
          type="file"
          id="file-input"
          multiple
          accept=".epub,application/epub+zip,.zip"
          onChange={onFileSelect}
          style={{ display: 'none' }}
        />
        <label htmlFor="file-input" className="select-button">
          {t('dropZone.selectFiles')}
        </label>
      </div>
    </div>
  );
};
