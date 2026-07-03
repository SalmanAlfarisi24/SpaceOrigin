/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import SplashScreen from './components/SplashScreen';
import Dashboard from './components/Dashboard';
import Game from './components/Game';
import GameOver from './components/GameOver';
import DeveloperInfo from './components/DeveloperInfo';
import TutorialModal from './components/TutorialModal';
import { HelpCircle, Info } from 'lucide-react';

type GameState = 'SPLASH' | 'MENU' | 'PLAYING' | 'GAMEOVER';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('SPLASH');
  const [isDevInfoOpen, setIsDevInfoOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const appContainerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (bgMusicRef.current) {
      bgMusicRef.current.muted = isMuted;
      if (isDevInfoOpen || isTutorialOpen) {
        bgMusicRef.current.pause();
      } else if (gameState === 'PLAYING' || gameState === 'MENU') {
        bgMusicRef.current.play().catch(() => {});
      }
    }
  }, [isDevInfoOpen, gameState, isMuted]);

  const startGame = () => {
    setGameState('PLAYING');

    // Request Fullscreen on the app container to ensure immersive experience
    const el = appContainerRef.current;
    if (el) {
      const requestFullscreen = el.requestFullscreen || 
                                (el as any).webkitRequestFullscreen || 
                                (el as any).mozRequestFullScreen || 
                                (el as any).msRequestFullscreen;

      if (requestFullscreen) {
        requestFullscreen.call(el, { navigationUI: 'hide' }).catch((err: any) => {
          console.warn(`Error attempting to enable full-screen mode: ${err.message}`);
        });
      }
    }

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
    // Ensure fullscreen is requested/maintained
    const el = appContainerRef.current;
    if (el && !document.fullscreenElement) {
      const requestFullscreen = el.requestFullscreen || 
                                (el as any).webkitRequestFullscreen || 
                                (el as any).mozRequestFullScreen || 
                                (el as any).msRequestFullscreen;
      if (requestFullscreen) {
        requestFullscreen.call(el, { navigationUI: 'hide' }).catch(() => {});
      }
    }
    setGameState('PLAYING');
  };

  const goToMenu = () => {
    setGameState('MENU');
  };

  return (
    <div ref={appContainerRef} className="w-full h-screen bg-black text-white selection:bg-cyan-500 selection:text-white overflow-hidden">
      {gameState === 'SPLASH' && (
        <SplashScreen onComplete={() => setGameState('MENU')} />
      )}

      {gameState === 'MENU' && (
        <Dashboard 
          onStart={startGame} 
          highScore={highScore} 
        />
      )}

      {gameState === 'PLAYING' && (
        <Game onGameOver={handleGameOver} onQuit={goToMenu} isPaused={isDevInfoOpen} />
      )}

      {gameState === 'GAMEOVER' && (
        <>
          <Game onGameOver={() => {}} onQuit={() => {}} isPaused={false} /> {/* Keep game in background but paused/static */}
          <GameOver 
            score={score} 
            highScore={highScore} 
            onRestart={restartGame} 
            onMainMenu={goToMenu} 
          />
        </>
      )}

      {/* Interactive Helper Buttons (Menu Only) */}
      {gameState === 'MENU' && (
        <div className="fixed top-4 right-4 z-[90] flex flex-col gap-3">
          {/* Tutorial Button (?) */}
          <button
            onClick={() => setIsTutorialOpen(true)}
            className="p-2 sm:p-3 bg-cyan-900/40 border border-cyan-500/30 rounded-full text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)] active:scale-90"
            title="Gameplay Guide"
          >
            <HelpCircle size={20} className="sm:w-6 sm:h-6" />
          </button>

          {/* Developer Info Button (!) */}
          <button
            onClick={() => setIsDevInfoOpen(true)}
            className="p-2 sm:p-3 bg-rose-900/40 border border-rose-500/30 rounded-full text-rose-400 hover:bg-rose-500 hover:text-black transition-all shadow-[0_0_15px_rgba(244,63,94,0.2)] active:scale-90"
            title="Developer Info"
          >
            <Info size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>
      )}
      
      {/* Modals */}
      <TutorialModal 
        isOpen={isTutorialOpen} 
        onClose={() => setIsTutorialOpen(false)} 
      />
      
      <DeveloperInfo 
        isOpen={isDevInfoOpen} 
        onClose={() => setIsDevInfoOpen(false)} 
      />
    </div>
  );
}

