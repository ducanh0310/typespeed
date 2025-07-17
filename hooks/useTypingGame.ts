import { useState, useEffect, useCallback } from 'react';
import { GameState } from '../types';

export const useTypingGame = (textToType: string) => {
  const [gameState, setGameState] = useState<GameState>(GameState.Ready);
  const [typedText, setTypedText] = useState('');
  const [errorIndices, setErrorIndices] = useState<Set<number>>(new Set());
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);

  const totalChars = textToType.length;
  const currentIndex = typedText.length;

  const resetGame = useCallback(() => {
    setGameState(GameState.Ready);
    setTypedText('');
    setErrorIndices(new Set());
    setStartTime(null);
    setEndTime(null);
  }, []);

  useEffect(() => {
    resetGame();
  }, [textToType, resetGame]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
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
    
    // Ignore function keys, control, alt, etc.
    if (e.key.length > 1 || e.ctrlKey || e.altKey || e.metaKey) {
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

  const elapsedTime = endTime ? (endTime - startTime!) / 1000 : (startTime ? (Date.now() - startTime) / 1000 : 0);
  
  // Case-insensitive accuracy calculation
  const correctChars = typedText.split('').filter((char, index) => {
    if (index >= textToType.length) return false;
    return char.toLowerCase() === textToType[index];
  }).length;

  const wpm = startTime && elapsedTime > 0 ? Math.round((typedText.length / 5) / (elapsedTime / 60)) : 0;
  const accuracy = totalChars > 0 && typedText.length > 0 ? Math.round((correctChars / typedText.length) * 100) : 100;
  
  return {
    gameState,
    typedText,
    errorIndices,
    elapsedTime,
    wpm,
    accuracy,
    handleKeyDown,
    resetGame,
    totalChars,
    currentIndex,
  };
};