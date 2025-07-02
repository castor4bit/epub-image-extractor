import React, { useState, useCallback, useEffect } from 'react';
import './App.css';
import { ProcessingProgress } from '@shared/types';
import { FileDropZone } from './components/FileDropZone';
import { ProgressDisplay } from './components/ProgressDisplay';

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

  // 進捗リスナーを設定
  useEffect(() => {
    window.electronAPI.onProgress((progressData: ProcessingProgress) => {
      setProgress(prev => ({
        ...prev,
        [progressData.fileId]: progressData
      }));
    });
  }, []);

  // ファイル処理
  const processFiles = async (filesToProcess: File[]) => {
    setIsProcessing(true);
    setProgress({}); // 進捗をリセット
    
    try {
      // ファイルパスの配列を作成
      const filePaths = filesToProcess.map(file => file.path || '').filter(path => path);
      
      if (filePaths.length === 0) {
        throw new Error('有効なファイルパスがありません');
      }
      
      // EPUB処理を実行
      const result = await window.electronAPI.processEpubFiles(filePaths);
      
      if (result.success) {
        setTimeout(() => {
          alert('処理が完了しました！');
          setIsProcessing(false);
          setProgress({});
        }, 1000);
      } else {
        alert(`エラーが発生しました: ${result.error}`);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('処理エラー:', error);
      alert('処理中にエラーが発生しました');
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
          <FileDropZone
            isDragging={isDragging}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onFileSelect={handleFileSelect}
          />
        ) : (
          <ProgressDisplay progress={progress} />
        )}
      </main>
    </div>
  );
}

export default App;