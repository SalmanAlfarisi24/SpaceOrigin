import React from 'react';
import { motion } from 'motion/react';
import { Play, LogOut, Trophy, Settings } from 'lucide-react';

interface DashboardProps {
  onStart: () => void;
  highScore: number;
}

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
      <div className="relative z-10 flex flex-col items-center max-w-4xl w-full px-6">
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-12 text-center"
        >
          <img 
            src="assets/preview.png" 
            alt="Ship" 
            className="w-24 h-24 mx-auto mb-4 drop-shadow-[0_0_20px_rgba(0,255,255,0.4)]"
            referrerPolicy="no-referrer"
          />
          <h1 className="text-7xl font-black tracking-tighter text-white italic">
            SPACE <span className="text-cyan-500">ORIGIN</span>
          </h1>
          <div className="flex items-center justify-center gap-2 mt-2 text-cyan-400/80 font-mono">
            <Trophy size={16} />
            <span className="uppercase tracking-widest text-sm">High Score: {highScore}</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-md">
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "rgba(6, 182, 212, 0.2)" }}
            whileTap={{ scale: 0.95 }}
            onClick={onStart}
            className="group relative flex items-center justify-center gap-3 py-6 px-8 bg-cyan-500/10 border-2 border-cyan-500/50 rounded-2xl text-cyan-400 font-bold text-xl transition-all hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]"
          >
            <Play className="fill-cyan-400 group-hover:scale-110 transition-transform" />
            START MISSION
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "rgba(244, 63, 94, 0.1)" }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-3 py-6 px-8 bg-rose-500/5 border-2 border-rose-500/30 rounded-2xl text-rose-400 font-bold text-xl transition-all hover:border-rose-400"
          >
            <LogOut />
            EXIT
          </motion.button>
        </div>

        {/* Decorative Elements */}
        <div className="mt-16 grid grid-cols-3 gap-12 text-white/30 font-mono text-[10px] uppercase tracking-[0.3em]">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-[1px] bg-white/20" />
            SYSTEM READY
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-[1px] bg-white/20" />
            SHIELDS AT 100%
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-[1px] bg-white/20" />
            ENGINES WARM
          </div>
        </div>
      </div>

      {/* Scanlines Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] z-50 opacity-10" />
    </div>
  );
}
