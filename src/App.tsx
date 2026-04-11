/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import SplashScreen from './components/SplashScreen';
import Dashboard from './components/Dashboard';
import Game from './components/Game';
import GameOver from './components/GameOver';

type GameState = 'SPLASH' | 'MENU' | 'PLAYING' | 'GAMEOVER';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('SPLASH');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Load high score
    const saved = localStorage.getItem('spaceOriginHighScore');
    if (saved) setHighScore(parseInt(saved, 10));

    // Initialize background music (placeholder or actual file)
    // Note: Browser might block auto-play until user interaction
    bgMusicRef.current = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'); // Placeholder epic music
    bgMusicRef.current.loop = true;
    bgMusicRef.current.volume = 0.3;

    return () => {
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current = null;
      }
    };
  }, []);

  const startGame = () => {
    setGameState('PLAYING');
    if (bgMusicRef.current) {
      bgMusicRef.current.play().catch(e => console.log("Music play blocked:", e));
    }
  };

  const handleGameOver = (finalScore: number) => {
    setScore(finalScore);
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('spaceOriginHighScore', finalScore.toString());
    }
    setGameState('GAMEOVER');
  };

  const restartGame = () => {
    setGameState('PLAYING');
  };

  const goToMenu = () => {
    setGameState('MENU');
  };

  return (
    <div className="w-full h-screen bg-black text-white selection:bg-cyan-500 selection:text-white">
      {gameState === 'SPLASH' && (
        <SplashScreen onComplete={() => setGameState('MENU')} />
      )}

      {gameState === 'MENU' && (
        <Dashboard onStart={startGame} highScore={highScore} />
      )}

      {gameState === 'PLAYING' && (
        <Game onGameOver={handleGameOver} />
      )}

      {gameState === 'GAMEOVER' && (
        <>
          <Game onGameOver={() => {}} /> {/* Keep game in background but paused/static */}
          <GameOver 
            score={score} 
            highScore={highScore} 
            onRestart={restartGame} 
            onMainMenu={goToMenu} 
          />
        </>
      )}
    </div>
  );
}

