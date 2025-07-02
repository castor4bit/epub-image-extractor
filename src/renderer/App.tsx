import React from 'react';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>EPUB画像抽出ツール</h1>
      </header>
      <main className="app-main">
        <div className="drop-zone">
          <p>EPUBファイルをここにドラッグ&ドロップ</p>
          <p>または</p>
          <button className="select-button">ファイルを選択</button>
        </div>
      </main>
    </div>
  );
}

export default App;