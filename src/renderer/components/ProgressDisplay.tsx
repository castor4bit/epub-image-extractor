import React from 'react';
import { ProcessingProgress } from '@shared/types';

interface ProgressDisplayProps {
  progress: Record<string, ProcessingProgress>;
}

export const ProgressDisplay: React.FC<ProgressDisplayProps> = ({ progress }) => {
  const progressItems = Object.values(progress);
  const totalFiles = progressItems.length;
  const completedFiles = progressItems.filter(p => p.status === 'completed').length;
  const hasErrors = progressItems.some(p => p.status === 'error');

  return (
    <div className="progress-container">
      <div className="progress-header">
        <h2>処理中...</h2>
        <div className="progress-summary">
          {completedFiles} / {totalFiles} ファイル完了
        </div>
      </div>
      
      <div className="progress-items">
        {progressItems.map((p) => (
          <div key={p.fileId} className={`progress-item ${p.status}`}>
            <div className="progress-item-header">
              <span className="file-name">{p.fileName}</span>
              <span className="progress-status">
                {p.status === 'completed' && <span className="status-icon">✓</span>}
                {p.status === 'error' && <span className="status-icon">✗</span>}
                {p.status === 'processing' && <span className="status-icon">⋯</span>}
              </span>
            </div>
            
            {p.totalImages > 0 && p.status === 'processing' && (
              <>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${(p.processedImages / p.totalImages) * 100}%` }}
                  />
                </div>
                <div className="progress-text">
                  {p.processedImages} / {p.totalImages} 画像
                </div>
              </>
            )}
            
            {p.status === 'completed' && (
              <div className="progress-text success">
                {p.totalImages} 画像を抽出しました
              </div>
            )}
            
            {p.error && (
              <div className="error-message">{p.error}</div>
            )}
          </div>
        ))}
      </div>
      
      {hasErrors && (
        <div className="progress-footer error">
          エラーが発生したファイルがあります
        </div>
      )}
    </div>
  );
};