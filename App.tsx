import React, { useState, useCallback } from 'react';
import SongInputForm from './components/SongInputForm';
import TypingTest from './components/TypingTest';
import Results from './components/Results';
import Spinner from './components/Spinner';
import { fetchLyrics } from './services/geminiService';
import { GameState, type GroundingChunk, type TestStats } from './types';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.Waiting);
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [sources, setSources] = useState<GroundingChunk[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [finalStats, setFinalStats] = useState<TestStats | null>(null);

  const handleSongSubmit = useCallback(async (songTitle: string) => {
    setGameState(GameState.Loading);
    setError(null);
    setLyrics(null);
    setSources([]);
    setFinalStats(null);
    try {
      const { lyrics: fetchedLyrics, sources: fetchedSources } = await fetchLyrics(songTitle);
      setLyrics(fetchedLyrics.toLowerCase());
      setSources(fetchedSources);
      setGameState(GameState.Ready);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.');
      setGameState(GameState.Waiting);
    }
  }, []);

  const handleFinish = useCallback((stats: TestStats) => {
    setFinalStats(stats);
    setGameState(GameState.Finished);
  }, []);

  const handleReset = useCallback(() => {
    setGameState(GameState.Waiting);
    setLyrics(null);
    setError(null);
    setFinalStats(null);
    setSources([]);
  }, []);

  const renderContent = () => {
    switch (gameState) {
      case GameState.Ready:
        return lyrics ? <TypingTest textToType={lyrics} onFinish={handleFinish} onReset={handleReset} /> : null;
      case GameState.Finished:
        return finalStats ? <Results stats={finalStats} onRestart={handleReset} /> : null;
      case GameState.Loading:
      case GameState.Waiting:
      default:
        return (
          <div className="flex flex-col items-center w-full">
            <SongInputForm onSubmit={handleSongSubmit} isLoading={gameState === GameState.Loading} />
            {gameState === GameState.Loading && (
              <div className="flex flex-col items-center gap-4 mt-8">
                <Spinner className="w-12 h-12 text-cyan-400" />
                <p className="text-slate-300 text-lg">Đang tìm lời bài hát...</p>
              </div>
            )}
            {error && gameState === GameState.Waiting && <p className="mt-4 p-3 bg-red-500/20 text-red-300 rounded-lg">{error}</p>}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <main className="w-full flex-grow flex flex-col items-center justify-center">
        {renderContent()}
      </main>
      {sources.length > 0 && (gameState === GameState.Ready || gameState === GameState.Finished) && (
        <footer className="w-full max-w-4xl mt-8 text-center">
          <h3 className="text-sm font-semibold text-slate-400 mb-2">Nguồn lời bài hát:</h3>
          <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2">
            {sources.map((source, index) => (
              <li key={index}>
                <a
                  href={source.web.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate-500 hover:text-cyan-400 transition-colors"
                >
                  {source.web.title || new URL(source.web.uri).hostname}
                </a>
              </li>
            ))}
          </ul>
        </footer>
      )}
    </div>
  );
};

export default App;