import { useState, useEffect, useCallback } from 'react';
import { GameState } from '../types';

export const useTypingGame = (textToType: string) => {
  const [gameState, setGameState] = useState<GameState>(GameState.Ready);
  const [typedText, setTypedText] = useState('');
  const [errorIndices, setErrorIndices] = useState<Set<number>>(new Set());
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [time, setTime] = useState(0);
  const [totalKeyPresses, setTotalKeyPresses] = useState(0);

  const totalChars = textToType.length;
  const currentIndex = typedText.length;

  const resetGame = useCallback(() => {
    setGameState(GameState.Ready);
    setTypedText('');
    setErrorIndices(new Set());
    setStartTime(null);
    setEndTime(null);
    setTime(0);
    setTotalKeyPresses(0);
  }, []);

  useEffect(() => {
    resetGame();
  }, [textToType, resetGame]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === GameState.Typing) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => {
      clearInterval(interval);
    };
  }, [gameState]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Increment total key presses for any key that affects typing or navigation within the text
    if (e.key.length === 1 || e.key === 'Backspace' || e.key === ' ') { // Added space to count all relevant keys
      setTotalKeyPresses(prev => prev + 1);
    }

    if (gameState === GameState.Finished || gameState === GameState.Ready) {
      if (e.key.length === 1 || e.key === 'Backspace') {
        setGameState(GameState.Typing);
      }
    }

    if (e.key === 'Escape') {
      resetGame();
      return;
    }
    
    if (gameState !== GameState.Typing && gameState !== GameState.Ready) return;

    if (!startTime && e.key.length === 1) {
      setStartTime(Date.now());
    }
    
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (currentIndex > 0) {
        const newErrorIndices = new Set(errorIndices);
        newErrorIndices.delete(currentIndex - 1);
        setErrorIndices(newErrorIndices);
        setTypedText(prev => prev.slice(0, -1));
      }
      return;
    }
    
    // Prevent default browser actions for typing keys (e.g., spacebar scrolling)
    // but allow default for modifier keys and function keys.
    if (
        e.key.length === 1 ||
        e.key === 'Spacebar' ||
        e.key === 'Enter' ||
        e.key === 'Tab' ||
        e.key === 'Backspace'
    ) {
        e.preventDefault();
    }
    
    // Ignore function keys, control, alt, etc.
    if (e.key.length > 1 && e.key !== 'Spacebar' && e.key !== 'Enter' && e.key !== 'Tab') {
      return;
    }

    if (e.ctrlKey || e.altKey || e.metaKey) {
        return;
    }

    if (currentIndex < totalChars) {
      // Case-insensitive check. textToType is already lowercase.
      if (e.key.toLowerCase() !== textToType[currentIndex]) {
        setErrorIndices(prev => new Set(prev).add(currentIndex));
      }
      // Store the original case typed by the user
      setTypedText(prev => prev + e.key);
      
      if (currentIndex + 1 === totalChars) {
        setEndTime(Date.now());
        setGameState(GameState.Finished);
      }
    }
  }, [currentIndex, totalChars, gameState, textToType, startTime, errorIndices, resetGame]);

  const correctChars = typedText
    .split('')
    .filter((char, index) => char.toLowerCase() === textToType[index]).length;

  const wpm = time > 0 ? Math.round(correctChars / 5 / (time / 60)) : 0;

  return {
    gameState,
    typedText,
    errorIndices,
    time,
    wpm,
    handleKeyDown,
    resetGame,
    totalChars,
    currentIndex,
    totalKeyPresses,
  };
};