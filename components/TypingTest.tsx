import React, { useEffect, useMemo, useRef } from 'react';
import { useTypingGame } from '../hooks/useTypingGame';
import { type TestStats, GameState } from '../types';

interface TypingTestProps {
  textToType: string;
  onFinish: (stats: TestStats) => void;
  onReset: () => void;
}

const Character: React.FC<{
  char: string;
  isTyped: boolean;
  isCorrect: boolean;
  isCurrent: boolean;
}> = React.memo(({ char, isTyped, isCorrect, isCurrent }) => {
  const getCharColor = () => {
    if (!isTyped) return 'text-slate-500';
    return isCorrect ? 'text-slate-200' : 'text-red-500';
  };

  return (
    <span
      className={`relative ${getCharColor()} ${isCurrent ? 'bg-slate-700/50 rounded-sm' : ''}`}
    >
      {isCurrent && (
        <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-cyan-400 animate-pulse" />
      )}
      {char === ' ' && isTyped && !isCorrect ? (
        <span className="bg-red-500/50 rounded-sm">&nbsp;</span>
      ) : (
        char
      )}
    </span>
  );
});

const TypingTest: React.FC<TypingTestProps> = ({ textToType, onFinish, onReset }) => {
  const {
    gameState,
    typedText,
    errorIndices,
    elapsedTime,
    wpm,
    accuracy,
    handleKeyDown,
    resetGame,
    currentIndex,
  } = useTypingGame(textToType);

  const inputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const keydownHandler = (e: KeyboardEvent) => handleKeyDown(e);
    const area = inputRef.current;
    if (area) {
       area.focus();
    }
    window.addEventListener('keydown', keydownHandler);
    return () => {
      window.removeEventListener('keydown', keydownHandler);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    if (gameState === GameState.Finished) {
      onFinish({ wpm, accuracy, time: elapsedTime });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  // Reset scroll position and line tracking when the game state is ready
  useEffect(() => {
      if (gameState === GameState.Ready && inputRef.current) {
          inputRef.current.scrollTop = 0;
      }
  }, [gameState]);

  // Corrected auto-scrolling effect that only scrolls on new lines
  useEffect(() => {
    const container = inputRef.current;
    if (!container || gameState !== GameState.Typing || currentIndex < 1) return;

    const currentCharacterEl = container.children[currentIndex] as HTMLElement;
    const previousCharacterEl = container.children[currentIndex - 1] as HTMLElement;
    if (!currentCharacterEl || !previousCharacterEl) return;

    const currentTop = currentCharacterEl.offsetTop;
    const previousTop = previousCharacterEl.offsetTop;

    // If the top position has changed, we've moved to a new line.
    if (currentTop > previousTop) {
        currentCharacterEl.scrollIntoView({
            block: 'nearest',
        });
    }
  }, [currentIndex, gameState]);


  const characters = useMemo(() => {
    return textToType.split('').map((char, index) => {
      const isTyped = index < currentIndex;
      return (
        <Character
          key={index}
          char={char}
          isTyped={isTyped}
          isCorrect={isTyped ? !errorIndices.has(index) : false}
          isCurrent={index === currentIndex}
        />
      );
    });
  }, [textToType, currentIndex, errorIndices]);
  
  const progressPercentage = textToType.length > 0 ? (currentIndex / textToType.length) * 100 : 0;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 items-center">
      <div className="w-full p-4 sm:p-6 bg-slate-800 rounded-lg shadow-lg flex flex-col md:flex-row justify-around items-center gap-4 text-center">
        <div className="text-3xl font-bold text-cyan-400">
          {wpm} <span className="text-base text-slate-400 font-normal">WPM</span>
        </div>
        <div className="text-3xl font-bold text-cyan-400">
          {accuracy}% <span className="text-base text-slate-400 font-normal">Chính xác</span>
        </div>
        <div className="text-3xl font-bold text-cyan-400">
          {elapsedTime.toFixed(1)}s <span className="text-base text-slate-400 font-normal">Thời gian</span>
        </div>
      </div>

      <div className="w-full">
        <div
            ref={inputRef}
            tabIndex={0}
            className="w-full h-72 p-6 bg-slate-800/50 rounded-lg text-2xl/relaxed md:text-3xl/relaxed font-mono tracking-wide overflow-y-auto focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
            {gameState === GameState.Ready && (
            <div className="text-slate-400 animate-pulse">Bắt đầu gõ để bắt đầu...</div>
            )}
            {characters}
        </div>
        
        <div className="w-full bg-slate-700 rounded-full h-2 mt-3">
            <div 
                className="bg-cyan-400 h-2 rounded-full transition-all duration-150 ease-linear" 
                style={{ width: `${progressPercentage}%` }}
            ></div>
        </div>
      </div>

       <div className="flex gap-4 mt-2">
            <button
            onClick={resetGame}
            className="px-6 py-2 bg-slate-700 text-slate-200 font-semibold rounded-lg hover:bg-slate-600 transition-colors"
            >
            Thử lại
            </button>
            <button
            onClick={onReset}
            className="px-6 py-2 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-500 transition-colors"
            >
            Bài hát mới
            </button>
        </div>
    </div>
  );
};

export default TypingTest;
