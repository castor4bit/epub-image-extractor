import React, { useState, useCallback, useEffect } from 'react';
import './App.css';
import { ProcessingProgress, ExtractionResult } from '@shared/types';
import { FileDropZone } from './components/FileDropZone';
import { ProgressDisplay } from './components/ProgressDisplay';
import { SettingsWindow } from './components/SettingsWindow';
import { FileProcessingList } from './components/FileProcessingList';
import { CompactDropZone } from './components/CompactDropZone';

function App() {
  const [isDragging, setIsDragging] = useState(false);
  const [_files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<Record<string, ProcessingProgress>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [completedResults, setCompletedResults] = useState<ExtractionResult[]>([]);
  const [hasAnyResults, setHasAnyResults] = useState(false);

  // ファイル処理
  const processFiles = useCallback(
    async (filesToProcess: File[]) => {
      // 既に処理中の場合は処理しない
      if (isProcessing) {
        alert('現在処理中です。完了までお待ちください。');
        return;
      }

      setIsProcessing(true);
      setHasAnyResults(true);
      // 新しい処理時は進捗をリセットしない（追加処理のため）

      try {
        // ファイルパスの配列を作成
        const filePaths = filesToProcess.map((file) => file.path || '').filter((path) => path);

        if (filePaths.length === 0) {
          throw new Error('有効なファイルパスがありません');
        }

        // EPUB処理を実行
        const result = await window.electronAPI.processEpubFiles(filePaths);

        if (result.success) {
          // 結果を保存（進捗リスナーですでに追加されている可能性があるため重複チェック）
          if (result.results) {
            setCompletedResults((prevResults) => {
              const existingIds = new Set(prevResults.map((r) => r.fileId));
              const newUniqueResults =
                result.results?.filter((r) => !existingIds.has(r.fileId)) || [];

              if (newUniqueResults.length > 0) {
                const updatedResults = [...prevResults, ...newUniqueResults];
                localStorage.setItem('epubExtractionResults', JSON.stringify(updatedResults));
                return updatedResults;
              }
              return prevResults;
            });
          }

          // 処理完了したアイテムをprogressから削除
          setProgress((prev) => {
            const newProgress = { ...prev };
            // 完了した結果のfileIdを取得
            const completedFileIds = new Set(result.results?.map((r) => r.fileId) || []);

            Object.keys(newProgress).forEach((key) => {
              // pendingまたは完了済みのアイテムを削除
              if (
                newProgress[key].status === 'pending' ||
                newProgress[key].status === 'completed' ||
                newProgress[key].status === 'error' ||
                completedFileIds.has(key)
              ) {
                delete newProgress[key];
              }
            });
            return newProgress;
          });

          setIsProcessing(false);
        } else {
          alert(`エラーが発生しました: ${result.error}`);
          setIsProcessing(false);
        }
      } catch (error) {
        console.error('処理エラー:', error);
        alert('処理中にエラーが発生しました');
        setIsProcessing(false);
      }
    },
    [isProcessing, completedResults],
  );

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

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const droppedFiles = Array.from(e.dataTransfer.files);
      const validFiles = droppedFiles.filter(
        (file) =>
          file.name.toLowerCase().endsWith('.epub') ||
          file.name.toLowerCase().endsWith('.zip') ||
          file.type === 'application/epub+zip' ||
          file.type === 'application/zip',
      );

      if (validFiles.length > 0) {
        setFiles(validFiles);
        processFiles(validFiles);
      } else {
        alert('EPUBまたはZIPファイルを選択してください');
      }
    },
    [processFiles],
  );

  // ファイル選択ハンドラー
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files;
      if (selectedFiles) {
        const validFiles = Array.from(selectedFiles).filter(
          (file) =>
            file.name.toLowerCase().endsWith('.epub') ||
            file.name.toLowerCase().endsWith('.zip') ||
            file.type === 'application/epub+zip' ||
            file.type === 'application/zip',
        );

        if (validFiles.length > 0) {
          setFiles(validFiles);
          processFiles(validFiles);
        } else {
          alert('EPUBまたはZIPファイルを選択してください');
        }
      }
    },
    [processFiles],
  );

  // フォルダを開く
  const handleOpenFolder = useCallback((path: string) => {
    window.electronAPI.openFolder(path);
  }, []);

  // すべてクリア
  const handleClearAll = useCallback(() => {
    setProgress({});
    setCompletedResults([]);
    setHasAnyResults(false);
    // localStorageからも削除
    localStorage.removeItem('epubExtractionResults');
  }, []);

  // 初回ロード時にlocalStorageから結果を復元
  useEffect(() => {
    const savedResults = localStorage.getItem('epubExtractionResults');
    if (savedResults) {
      try {
        const parsed = JSON.parse(savedResults);
        setCompletedResults(parsed);
        setHasAnyResults(parsed.length > 0);
      } catch (error) {
        console.error('保存された結果の読み込みエラー:', error);
      }
    }
  }, []);

  // 進捗リスナーを設定
  useEffect(() => {
    const cleanup = window.electronAPI.onProgress((progressData: ProcessingProgress) => {
      setProgress((prev) => ({
        ...prev,
        [progressData.fileId]: progressData,
      }));

      // 個別のファイルが完了またはエラーになった場合、即座に結果として扱う
      if (progressData.status === 'completed' || progressData.status === 'error') {
        setCompletedResults((prevResults) => {
          // すでに結果に含まれている場合はスキップ
          if (prevResults.some((r) => r.fileId === progressData.fileId)) {
            return prevResults;
          }

          // 進捗データから結果データを作成
          const newResult: ExtractionResult = {
            fileId: progressData.fileId,
            fileName: progressData.fileName,
            outputPath: progressData.outputPath || '',
            totalImages: progressData.totalImages,
            chapters: progressData.chapters || 0,
            errors: progressData.error ? [progressData.error] : [],
          };

          const newResults = [...prevResults, newResult];
          // localStorageに保存
          localStorage.setItem('epubExtractionResults', JSON.stringify(newResults));
          return newResults;
        });
      }
    });

    // クリーンアップ関数を返す
    return cleanup;
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>EPUB画像抽出ツール</h1>
        <button className="settings-button" onClick={() => setIsSettingsOpen(true)} title="設定">
          ⚙️
        </button>
      </header>
      <main className="app-main">
        {!hasAnyResults ? (
          // 初期状態：大きなドロップゾーン
          <FileDropZone
            isDragging={isDragging}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onFileSelect={handleFileSelect}
          />
        ) : (
          // 処理中または結果表示：統合リスト
          <div className="integrated-view">
            <CompactDropZone
              isDragging={isDragging}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onFileSelect={handleFileSelect}
            />
            <FileProcessingList
              progress={progress}
              results={completedResults}
              onClearAll={handleClearAll}
              onOpenFolder={handleOpenFolder}
            />
          </div>
        )}
      </main>
      <SettingsWindow isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}

export default App;
