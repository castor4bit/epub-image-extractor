import React from 'react';
import { ProcessingProgress, ExtractionResult } from '@shared/types';

interface FileProcessingListProps {
  progress: Record<string, ProcessingProgress>;
  results: ExtractionResult[];
  onClearAll: () => void;
  onOpenFolder: (path: string) => void;
}

interface ProcessingItem {
  fileId: string;
  fileName: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  totalImages?: number;
  processedImages?: number;
  chapters?: number;
  outputPath?: string;
  error?: string;
  timestamp: number;
}

export const FileProcessingList: React.FC<FileProcessingListProps> = ({
  progress,
  results,
  onClearAll,
  onOpenFolder,
}) => {
  // 進捗データと結果データを統合
  const items: ProcessingItem[] = [];

  // 進捗データを追加
  Object.entries(progress).forEach(([fileId, prog]) => {
    items.push({
      fileId,
      fileName: prog.fileName,
      status: prog.status,
      totalImages: prog.totalImages,
      processedImages: prog.processedImages,
      error: prog.error,
      // fileIdから��イムスタンプを抽出（形式: file-{index}-{timestamp}）
      timestamp: parseInt(prog.fileId.split('-').pop() || '0') || Date.now(),
    });
  });

  // 結果データを追加（進捗にない完了済みのもの）
  results.forEach((result) => {
    if (!progress[result.fileId]) {
      items.push({
        fileId: result.fileId,
        fileName: result.fileName,
        status: result.errors && result.errors.length > 0 ? 'error' : 'completed',
        totalImages: result.totalImages,
        chapters: result.chapters,
        outputPath: result.outputPath,
        error: result.errors?.[0],
        // fileIdからタイムスタンプを抽出
        timestamp: parseInt(result.fileId.split('-').pop() || '0') || Date.now() - 1000000,
      });
    }
  });

  // ステータス優先度でソート
  const statusPriority = {
    processing: 0,
    pending: 1,
    error: 2,
    completed: 3,
  };

  const sortedItems = items.sort((a, b) => {
    // まずステータスでソート
    const statusDiff = statusPriority[a.status] - statusPriority[b.status];
    if (statusDiff !== 0) return statusDiff;
    // 同じステータスなら新しい順
    return b.timestamp - a.timestamp;
  });

  const processingCount = items.filter((item) => item.status === 'processing').length;
  const completedCount = items.filter((item) => item.status === 'completed').length;
  const errorCount = items.filter((item) => item.status === 'error').length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'error':
        return '✗';
      case 'processing':
        return '⋯';
      case 'pending':
        return '○';
      default:
        return '';
    }
  };

  return (
    <div className="file-processing-list">
      <div className="processing-summary">
        <span>処理状況: </span>
        {completedCount > 0 && <span className="summary-completed">{completedCount}完了</span>}
        {processingCount > 0 && <span className="summary-processing">{processingCount}処理中</span>}
        {errorCount > 0 && <span className="summary-error">{errorCount}エラー</span>}
      </div>

      <div className="processing-items">
        {sortedItems.map((item) => (
          <div key={item.fileId} className={`processing-item ${item.status}`}>
            <div className="item-header">
              <span className="status-icon">{getStatusIcon(item.status)}</span>
              <span className="file-name">{item.fileName}</span>
            </div>

            {item.status === 'processing' && item.totalImages && item.totalImages > 0 && (
              <>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${((item.processedImages || 0) / item.totalImages) * 100}%` }}
                  />
                </div>
                <div className="progress-text">
                  処理中: {item.processedImages || 0} / {item.totalImages} 画像
                </div>
              </>
            )}

            {item.status === 'pending' && <div className="status-text">待機中</div>}

            {item.status === 'completed' && (
              <div className="completion-info">
                <div className="result-text">
                  {item.totalImages}画像{item.chapters ? `, ${item.chapters}章` : ''}
                </div>
                {item.outputPath && (
                  <button
                    className="open-folder-button"
                    onClick={() => onOpenFolder(item.outputPath!)}
                    title={item.outputPath}
                  >
                    📁 出力先を開く
                  </button>
                )}
              </div>
            )}

            {item.status === 'error' && item.error && (
              <div className="error-message">エラー: {item.error}</div>
            )}
          </div>
        ))}
      </div>

      {items.length > 0 && (
        <div className="list-actions">
          <button className="clear-button" onClick={onClearAll}>
            クリア
          </button>
        </div>
      )}
    </div>
  );
};
