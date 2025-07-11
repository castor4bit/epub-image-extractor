import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './App.css';
import './i18n';
import { ProcessingProgress, ExtractionResult } from '@shared/types';
import { FileDropZone } from './components/FileDropZone';
import { SettingsWindow } from './components/SettingsWindow';
import { FileProcessingList } from './components/FileProcessingList';
import { CompactDropZone } from './components/CompactDropZone';
import { AboutDialog } from './components/AboutDialog';

function App() {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [_files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<Record<string, ProcessingProgress>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [completedResults, setCompletedResults] = useState<ExtractionResult[]>([]);
  const [hasAnyResults, setHasAnyResults] = useState(false);

  // File processing
  const processFiles = useCallback(
    async (filesToProcess: File[]) => {
      // Do not process if already processing
      if (isProcessing) {
        alert(t('processing.alreadyProcessing'));
        return;
      }

      setIsProcessing(true);
      setHasAnyResults(true);
      // Do not reset progress for new processing (for additional processing)

      try {
        // Create array of file paths
        const filePaths = filesToProcess.map((file) => file.path || '').filter((path) => path);

        if (filePaths.length === 0) {
          throw new Error('有効なファイルパスがありません');
        }

        // Execute EPUB processing
        const result = await window.electronAPI.processEpubFiles(filePaths);

        if (result.success) {
          // Save results (check for duplicates as they may already be added by progress listener)
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

          // Remove completed items from progress
          setProgress((prev) => {
            const newProgress = { ...prev };
            // Get fileId of completed results
            const completedFileIds = new Set(result.results?.map((r) => r.fileId) || []);

            Object.keys(newProgress).forEach((key) => {
              // Remove pending or completed items
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
          alert(`${t('errors.fileProcessing')}: ${result.error}`);
          setIsProcessing(false);
        }
      } catch (error) {
        console.error('Processing error:', error);
        alert(t('errors.fileProcessing'));
        setIsProcessing(false);
      }
    },
    [isProcessing],
  );

  // Drag event handlers
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
        alert(t('errors.invalidFile'));
      }
    },
    [processFiles],
  );

  // File selection handler
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
          alert(t('errors.invalidFile'));
        }
      }
    },
    [processFiles],
  );

  // Open folder
  const handleOpenFolder = useCallback((path: string) => {
    window.electronAPI.openFolder(path);
  }, []);

  // Clear all
  const handleClearAll = useCallback(() => {
    setProgress({});
    setCompletedResults([]);
    setHasAnyResults(false);
    // Also remove from localStorage
    localStorage.removeItem('epubExtractionResults');
  }, []);

  // Show About dialog
  const handleShowAbout = useCallback(() => {
    setIsAboutOpen(true);
  }, []);

  // Restore results from localStorage on initial load
  useEffect(() => {
    const savedResults = localStorage.getItem('epubExtractionResults');
    if (savedResults) {
      try {
        const parsed = JSON.parse(savedResults);
        setCompletedResults(parsed);
        setHasAnyResults(parsed.length > 0);
      } catch (error) {
        console.error('Error loading saved results:', error);
      }
    }
  }, []);

  // Set up progress listener
  useEffect(() => {
    const cleanup = window.electronAPI.onProgress((progressData: ProcessingProgress) => {
      setProgress((prev) => ({
        ...prev,
        [progressData.fileId]: progressData,
      }));

      // When individual files complete or error, treat them as results immediately
      if (progressData.status === 'completed' || progressData.status === 'error') {
        setCompletedResults((prevResults) => {
          // Skip if already included in results
          if (prevResults.some((r) => r.fileId === progressData.fileId)) {
            return prevResults;
          }

          // Create result data from progress data
          const newResult: ExtractionResult = {
            fileId: progressData.fileId,
            fileName: progressData.fileName,
            outputPath: progressData.outputPath || '',
            totalImages: progressData.totalImages,
            chapters: progressData.chapters || 0,
            errors: progressData.error ? [progressData.error] : [],
          };

          const newResults = [...prevResults, newResult];
          // Save to localStorage
          localStorage.setItem('epubExtractionResults', JSON.stringify(newResults));
          return newResults;
        });
      }
    });

    // Return cleanup function
    return cleanup;
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>{t('app.title')}</h1>
        <button className="settings-button" onClick={() => setIsSettingsOpen(true)} title={t('app.settings')}>
          ⚙️
        </button>
      </header>
      <main className="app-main">
        {!hasAnyResults ? (
          // Initial state: large drop zone
          <FileDropZone
            isDragging={isDragging}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onFileSelect={handleFileSelect}
          />
        ) : (
          // Processing or result display: integrated list
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
      <SettingsWindow
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onShowAbout={handleShowAbout}
      />
      <AboutDialog isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </div>
  );
}

export default App;
