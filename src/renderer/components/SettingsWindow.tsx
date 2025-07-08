import React, { useState, useEffect } from 'react';
import './SettingsWindow.css';

interface Settings {
  outputDirectory: string;
  language: string;
}

interface SettingsWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsWindow: React.FC<SettingsWindowProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<Settings>({
    outputDirectory: '',
    language: 'ja',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // 設定を読み込む
      window.electronAPI.getSettings().then((loadedSettings) => {
        setSettings(loadedSettings);
      });
    }
  }, [isOpen]);

  const handleSelectDirectory = async () => {
    const directory = await window.electronAPI.selectOutputDirectory();
    if (directory) {
      setSettings((prev) => ({ ...prev, outputDirectory: directory }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await window.electronAPI.saveSettings(settings);
      onClose();
    } catch (error) {
      console.error('設定の保存に失敗しました:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    const defaultSettings = await window.electronAPI.resetSettings();
    setSettings(defaultSettings);
  };

  if (!isOpen) return null;

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-window" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>設定</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="settings-content">
          <div className="setting-group">
            <label htmlFor="output-directory">出力先ディレクトリ</label>
            <div className="directory-input">
              <input id="output-directory" type="text" value={settings.outputDirectory} readOnly />
              <button onClick={handleSelectDirectory} className="browse-button">
                参照...
              </button>
            </div>
          </div>

          <div className="setting-group">
            <label htmlFor="language">言語</label>
            <select
              id="language"
              value={settings.language}
              onChange={(e) => setSettings((prev) => ({ ...prev, language: e.target.value }))}
            >
              <option value="ja">日本語</option>
              <option value="en" disabled>
                English (今後対応予定)
              </option>
            </select>
          </div>
        </div>

        <div className="settings-footer">
          <button onClick={handleReset} className="reset-button">
            デフォルトに戻す
          </button>
          <div className="footer-buttons">
            <button onClick={onClose} className="cancel-button">
              キャンセル
            </button>
            <button onClick={handleSave} className="save-button" disabled={isSaving}>
              {isSaving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
