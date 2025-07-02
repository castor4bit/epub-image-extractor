import React, { useState, useCallback } from 'react';
import './App.css';
import { ProcessingProgress } from '@shared/types';

function App() {
  const [isDragging, setIsDragging] = useState(false);
  const [_files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<Record<string, ProcessingProgress>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // ドラッグイベントハンドラー
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const epubFiles = droppedFiles.filter(file => 
      file.name.toLowerCase().endsWith('.epub') || 
      file.type === 'application/epub+zip'
    );

    if (epubFiles.length > 0) {
      setFiles(epubFiles);
      processFiles(epubFiles);
    } else {
      alert('EPUBファイルを選択してください');
    }
  }, []);

  // ファイル選択ハンドラー
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      const epubFiles = Array.from(selectedFiles).filter(file => 
        file.name.toLowerCase().endsWith('.epub') || 
        file.type === 'application/epub+zip'
      );
      
      if (epubFiles.length > 0) {
        setFiles(epubFiles);
        processFiles(epubFiles);
      } else {
        alert('EPUBファイルを選択してください');
      }
    }
  }, []);

  // ファイル処理
  const processFiles = async (filesToProcess: File[]) => {
    setIsProcessing(true);
    
    try {
      // Electronに進捗リスナーを登録
      window.electronAPI.onProgress((progressData: ProcessingProgress) => {
        setProgress(prev => ({
          ...prev,
          [progressData.fileId]: progressData
        }));
      });

      // ファイルパスの配列を作成
      const filePaths = filesToProcess.map(file => file.path);
      
      // EPUB処理を実行
      const result = await window.electronAPI.processEpubFiles(filePaths);
      
      if (result.success) {
        alert('処理が完了しました！');
      } else {
        alert(`エラーが発生しました: ${result.error}`);
      }
    } catch (error) {
      console.error('処理エラー:', error);
      alert('処理中にエラーが発生しました');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>EPUB画像抽出ツール</h1>
      </header>
      <main className="app-main">
        {!isProcessing ? (
          <div
            className={`drop-zone ${isDragging ? 'active' : ''}`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <p>EPUBファイルをここにドラッグ&ドロップ</p>
            <p>または</p>
            <input
              type="file"
              id="file-input"
              multiple
              accept=".epub,application/epub+zip"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <label htmlFor="file-input" className="select-button">
              ファイルを選択
            </label>
          </div>
        ) : (
          <div className="progress-container">
            <h2>処理中...</h2>
            {Object.values(progress).map((p) => (
              <div key={p.fileId} className="progress-item">
                <div className="progress-header">
                  <span className="file-name">{p.fileName}</span>
                  <span className="progress-status">
                    {p.status === 'completed' ? '✓' : 
                     p.status === 'error' ? '✗' : '...'}
                  </span>
                </div>
                {p.totalImages > 0 && (
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${(p.processedImages / p.totalImages) * 100}%` }}
                    />
                  </div>
                )}
                <div className="progress-text">
                  {p.processedImages} / {p.totalImages} 画像
                </div>
                {p.error && (
                  <div className="error-message">{p.error}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;