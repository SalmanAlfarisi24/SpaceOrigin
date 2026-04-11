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
        className="text-center"
      >
        <h2 className="text-8xl font-black text-rose-600 italic tracking-tighter mb-2">
          GAME OVER
        </h2>
        <p className="text-rose-400/60 font-mono tracking-widest uppercase mb-12">
          Mission Failed • Pilot Down
        </p>

        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl mb-12 min-w-[320px]">
          <div className="mb-6">
            <p className="text-white/40 font-mono text-xs uppercase tracking-widest mb-1">Final Score</p>
            <p className="text-5xl font-bold text-white tracking-tight">{score}</p>
          </div>
          
          <div className="flex items-center justify-center gap-2 py-3 px-4 bg-white/5 rounded-xl">
            <Trophy size={16} className={isNewRecord ? "text-yellow-400" : "text-white/30"} />
            <span className="text-white/60 font-mono text-sm uppercase">
              {isNewRecord ? "NEW HIGH SCORE!" : `BEST: ${highScore}`}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRestart}
            className="flex items-center justify-center gap-2 py-4 px-8 bg-white text-black font-bold rounded-2xl hover:bg-cyan-400 transition-colors"
          >
            <RotateCcw size={20} />
            RETRY MISSION
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onMainMenu}
            className="flex items-center justify-center gap-2 py-4 px-8 bg-white/10 text-white font-bold rounded-2xl hover:bg-white/20 transition-colors border border-white/10"
          >
            <Home size={20} />
            MAIN MENU
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
