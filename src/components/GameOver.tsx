import React from 'react';
import { motion } from 'motion/react';
import { RotateCcw, Home, Trophy } from 'lucide-react';

interface GameOverProps {
  score: number;
  highScore: number;
  onRestart: () => void;
  onMainMenu: () => void;
}

export default function GameOver({ score, highScore, onRestart, onMainMenu }: GameOverProps) {
  const isNewRecord = score > 0 && score >= highScore;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-[100]">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center w-full max-w-lg px-4 landscape:max-w-md"
      >
        <h2 className="text-4xl sm:text-7xl md:text-8xl landscape:text-3xl font-black text-rose-600 italic tracking-tighter mb-1 sm:mb-2 landscape:mb-0">
          GAME OVER
        </h2>
        <p className="text-rose-400/60 font-mono tracking-widest uppercase mb-6 sm:mb-12 landscape:mb-2 text-[10px] sm:text-sm landscape:text-[8px]">
          Mission Failed • Pilot Down
        </p>

        <div className="bg-white/5 border border-white/10 p-4 sm:p-8 landscape:p-3 rounded-2xl sm:rounded-3xl mb-8 sm:mb-12 landscape:mb-4 mx-auto w-full max-w-xs sm:max-w-md landscape:max-w-[280px]">
          <div className="mb-4 sm:mb-6 landscape:mb-2">
            <p className="text-white/40 font-mono text-[10px] sm:text-xs landscape:text-[8px] uppercase tracking-widest mb-1">Final Score</p>
            <p className="text-3xl sm:text-5xl landscape:text-2xl font-bold text-white tracking-tight">{score}</p>
          </div>
          
          <div className="flex items-center justify-center gap-2 py-2 sm:py-3 px-3 sm:px-4 landscape:py-1.5 bg-white/5 rounded-xl">
            <Trophy size={14} className={isNewRecord ? "text-yellow-400" : "text-white/30"} />
            <span className="text-white/60 font-mono text-[10px] sm:text-sm landscape:text-[9px] uppercase">
              {isNewRecord ? "NEW HIGH SCORE!" : `BEST: ${highScore}`}
            </span>
          </div>
        </div>

        <div className="flex flex-row items-center justify-center gap-3 sm:gap-5 landscape:gap-2 px-4 w-full">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRestart}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 py-3 sm:py-4 px-4 sm:px-8 landscape:py-2 bg-white text-black font-bold rounded-lg sm:rounded-xl transition-all h-[48px] sm:h-[56px] landscape:h-[40px] min-w-[120px] sm:min-w-[200px] landscape:min-w-[140px]"
          >
            <RotateCcw size={18} className="sm:w-5 sm:h-5 landscape:w-4 landscape:h-4" />
            <span className="uppercase whitespace-nowrap text-xs sm:text-base landscape:text-[10px]">RETRY MISSION</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onMainMenu}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 py-3 sm:py-4 px-4 sm:px-8 landscape:py-2 bg-[#0a0a0a] text-white font-bold rounded-lg sm:rounded-xl transition-all border border-white/20 h-[48px] sm:h-[56px] landscape:h-[40px] min-w-[120px] sm:min-w-[200px] landscape:min-w-[140px]"
          >
            <Home size={18} className="sm:w-5 sm:h-5 landscape:w-4 landscape:h-4" />
            <span className="uppercase whitespace-nowrap text-xs sm:text-base landscape:text-[10px]">MAIN MENU</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
