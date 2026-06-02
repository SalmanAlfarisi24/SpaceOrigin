import React from 'react';
import { motion } from 'motion/react';
import { Play, LogOut, Trophy } from 'lucide-react';

interface DashboardProps {
  onStart: () => void;
  highScore: number;
}

const containerVars = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
};

const itemVars = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
};

export default function Dashboard({ onStart, highScore }: DashboardProps) {
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* Background Image with Blur */}
      <div className="absolute inset-0 z-0">
        <img 
          src="assets/gambar.jpg" 
          alt="Space Background" 
          className="w-full h-full object-cover opacity-40 scale-110 blur-sm"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
      </div>

      {/* Content */}
      <motion.div 
        variants={containerVars}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-center max-w-4xl w-full px-4 sm:px-6"
      >
        <motion.div variants={itemVars} className="mb-8 sm:mb-12 landscape:mb-4 text-center">
          {/* Enhanced Ship Preview */}
          <div className="relative mb-3 sm:mb-4 landscape:mb-1">
            <motion.div
              animate={{ 
                y: [0, -15, 0],
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="relative z-10"
            >
              <img 
                src="assets/preview.png" 
                alt="Ship" 
                className="w-20 h-20 sm:w-32 sm:h-32 landscape:w-16 landscape:h-16 mx-auto drop-shadow-[0_0_20px_rgba(0,255,255,0.4)]"
                referrerPolicy="no-referrer"
              />
              
              {/* Thruster Glow Effect */}
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.4, 0.8, 0.4]
                }}
                transition={{ 
                  duration: 0.5, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-8 h-4 sm:w-12 sm:h-6 bg-cyan-400 blur-xl rounded-full z-0"
              />
              
              {/* Particle Sparks */}
              <motion.div
                animate={{ 
                  y: [0, 10],
                  opacity: [1, 0]
                }}
                transition={{ 
                  duration: 0.8, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
                className="absolute left-1/2 bottom-0 -translate-x-1/2 w-1 h-3 bg-cyan-200 blur-[1px] rounded-full"
              />
            </motion.div>
          </div>

          <motion.h1 
            variants={itemVars}
            className="text-5xl sm:text-8xl landscape:text-4xl font-black tracking-tighter text-white italic drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]"
          >
            SPACE <span className="text-cyan-500 drop-shadow-[0_0_20px_rgba(6,182,212,0.5)]">ORIGIN</span>
          </motion.h1>
          
          <motion.div 
            variants={itemVars}
            className="flex items-center justify-center gap-2 mt-2 landscape:mt-1 text-cyan-400/80 font-mono"
          >
            <Trophy size={14} className="sm:w-4 sm:h-4 landscape:w-3 landscape:h-3" />
            <span className="uppercase tracking-widest text-[10px] sm:text-sm landscape:text-[8px]">High Score: {highScore}</span>
          </motion.div>
        </motion.div>

        <motion.div 
          variants={itemVars}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 landscape:gap-3 w-full max-w-sm sm:max-w-md landscape:max-w-xs"
        >
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "rgba(6, 182, 212, 0.2)" }}
            whileTap={{ scale: 0.95 }}
            onClick={onStart}
            className="group relative flex items-center justify-center gap-3 py-4 sm:py-6 landscape:py-3 px-6 sm:px-8 bg-cyan-500/10 border-2 border-cyan-500/50 rounded-xl sm:rounded-2xl text-cyan-400 font-bold text-lg sm:text-xl landscape:text-base transition-all hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] shadow-[inset_0_0_15px_rgba(6,182,212,0.1)]"
          >
            <Play size={20} className="fill-cyan-400 group-hover:scale-110 transition-transform sm:w-6 sm:h-6 landscape:w-4 landscape:h-4" />
            START MISSION
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "rgba(244, 63, 94, 0.1)" }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-3 py-4 sm:py-6 landscape:py-3 px-6 sm:px-8 bg-rose-500/5 border-2 border-rose-500/30 rounded-xl sm:rounded-2xl text-rose-400 font-bold text-lg sm:text-xl landscape:text-base transition-all hover:border-rose-400"
          >
            <LogOut size={20} className="sm:w-6 sm:h-6 landscape:w-4 landscape:h-4" />
            EXIT
          </motion.button>
        </motion.div>

        {/* Decorative Elements */}
        <motion.div 
          variants={itemVars}
          className="mt-10 sm:mt-16 landscape:mt-6 grid grid-cols-3 gap-6 sm:gap-12 landscape:gap-4 text-white/30 font-mono text-[8px] sm:text-[10px] landscape:text-[7px] uppercase tracking-[0.2em] sm:tracking-[0.3em]"
        >
          <div className="flex flex-col items-center gap-1 sm:gap-2 text-center">
            <div className="w-8 sm:w-12 h-[1px] bg-white/20" />
            SYSTEM READY
          </div>
          <div className="flex flex-col items-center gap-1 sm:gap-2 text-center">
            <div className="w-8 sm:w-12 h-[1px] bg-white/20" />
            SHIELDS AT 100%
          </div>
          <div className="flex flex-col items-center gap-1 sm:gap-2 text-center">
            <div className="w-8 sm:w-12 h-[1px] bg-white/20" />
            ENGINES WARM
          </div>
        </motion.div>
      </motion.div>

      {/* Scanlines Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] z-50 opacity-10" />
    </div>
  );
}
