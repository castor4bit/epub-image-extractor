import React from 'react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  return (
    <div
      className={`compact-drop-zone ${isDragging ? 'active' : ''}`}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="compact-drop-zone-content">
        <svg className="compact-drop-icon" width="32" height="32" viewBox="0 0 24 24" fill="none">
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
        <span className="compact-drop-text">{t('compactDropZone.title')}</span>
        <span className="compact-drop-or">{t('compactDropZone.or')}</span>
        <input
          type="file"
          id="compact-file-input"
          style={{ display: 'none' }}
          multiple
          accept=".epub,.zip,application/epub+zip,application/zip"
          onChange={onFileSelect}
        />
        <label htmlFor="compact-file-input" className="compact-select-button">
          {t('compactDropZone.selectFiles')}
        </label>
      </div>
    </div>
  );
};
