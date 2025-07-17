import React, { useState, useCallback } from 'react';
import SongInputForm from './components/SongInputForm';
import CustomTextInput from './components/CustomTextInput';
import TypingTest from './components/TypingTest';
import Results from './components/Results';
import Spinner from './components/Spinner';
import { fetchLyrics } from './services/geminiService';
import { GameState, type GroundingChunk, type TestStats } from './types';
import { VIETNAMESE_WORDS } from './constants/vietnamese-words';
import { ENGLISH_WORDS } from './constants/english-words';
import { generateRandomWords } from './utils/word-generator';

const App: React.FC = () => {
  type Mode = 'song' | 'custom' | 'random-vi' | 'random-en' | 'selection';
  const [mode, setMode] = useState<Mode>('selection');
  const [gameState, setGameState] = useState<GameState>(GameState.Waiting);
  const [textToType, setTextToType] = useState<string | null>(null);
  const [sources, setSources] = useState<GroundingChunk[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [finalStats, setFinalStats] = useState<TestStats | null>(null);

  const handleSongSubmit = useCallback(async (songTitle: string) => {
    setGameState(GameState.Loading);
    setError(null);
    setTextToType(null);
    setSources([]);
    setFinalStats(null);
    try {
      const { lyrics: fetchedLyrics, sources: fetchedSources } = await fetchLyrics(songTitle);
      setTextToType(fetchedLyrics.toLowerCase());
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

  const handleCustomTextStart = useCallback((text: string) => {
    setTextToType(text);
    setGameState(GameState.Ready);
    setSources([]);
    setError(null);
    setFinalStats(null);
  }, []);

  const handleReset = useCallback(() => {
    setGameState(GameState.Waiting);
    setTextToType(null);
    setError(null);
    setFinalStats(null);
    setSources([]);
    setMode('selection');
  }, []);

  const handleRandomWordsStart = (language: 'vi' | 'en') => {
    const wordList = language === 'vi' ? VIETNAMESE_WORDS : ENGLISH_WORDS;
    const words = generateRandomWords(wordList, 50);
    setTextToType(words);
    setGameState(GameState.Ready);
    setSources([]);
    setError(null);
    setFinalStats(null);
  };

  const renderContent = () => {
    if (gameState === GameState.Ready && textToType) {
      return <TypingTest textToType={textToType} onFinish={handleFinish} onReset={handleReset} />;
    }

    if (gameState === GameState.Finished && finalStats) {
      return <Results stats={finalStats} onRestart={handleReset} />;
    }

    if (mode === 'selection') {
      return (
        <div className="w-full max-w-2xl text-center">
            <h1 className="text-6xl md:text-7xl font-extrabold text-white mb-4">
                Type<span className="text-cyan-400">Speed</span>
            </h1>
            <p className="text-slate-400 mb-12 text-xl">
                Cải thiện tốc độ gõ của bạn với các bài kiểm tra thú vị!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                    onClick={() => setMode('song')}
                    className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-cyan-600 to-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                >
                    <span className="text-4xl mb-2">🎤</span>
                    Gõ theo lời bài hát
                </button>
                <button
                    onClick={() => setMode('custom')}
                    className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-purple-600 to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                >
                    <span className="text-4xl mb-2">✍️</span>
                    Nhập văn bản tùy chỉnh
                </button>
                <button
                    onClick={() => handleRandomWordsStart('vi')}
                    className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-emerald-600 to-green-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                >
                    <span className="text-4xl mb-2">🇻🇳</span>
                    Từ ngẫu nhiên (Tiếng Việt)
                </button>
                <button
                    onClick={() => handleRandomWordsStart('en')}
                    className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-orange-600 to-red-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                >
                    <span className="text-4xl mb-2">🇬🇧</span>
                    Từ ngẫu nhiên (Tiếng Anh)
                </button>
            </div>
        </div>
      );
    }

    if (mode === 'song') {
      return (
        <div className="flex flex-col items-center w-full">
          <SongInputForm onSubmit={handleSongSubmit} isLoading={gameState === GameState.Loading} onBack={handleReset} />
          {gameState === GameState.Loading && (
            <div className="flex flex-col items-center gap-4 mt-8">
              <Spinner className="w-12 h-12 text-cyan-400" />
              <p className="text-slate-300 text-lg">Đang tìm lời bài hát...</p>
            </div>
          )}
          {error && <p className="mt-4 p-3 bg-red-500/20 text-red-300 rounded-lg">{error}</p>}
        </div>
      );
    }

    if (mode === 'custom') {
      return <CustomTextInput onStart={handleCustomTextStart} onBack={handleReset} />;
    }

    return null;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <main className="w-full flex-grow flex flex-col items-center justify-center">
        {renderContent()}
      </main>
      {sources.length > 0 && textToType && (gameState === GameState.Ready || gameState === GameState.Finished) && (
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