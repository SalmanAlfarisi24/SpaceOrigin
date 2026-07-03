import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Info, ExternalLink, GraduationCap, User } from 'lucide-react';

interface DeveloperInfoProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DeveloperInfo({ isOpen, onClose }: DeveloperInfoProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-[#0a0f1a] border border-cyan-500/30 rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden"
          >
            {/* Background Decorative Gradient */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
            
            {/* Header */}
            <div className="flex items-center justify-between mb-8 relative">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-500/10 rounded-lg border border-rose-500/20">
                  <Info className="text-rose-400 w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-white font-sans">
                  INFORMASI PENGEMBANG
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/50 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="space-y-6 font-sans relative">
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10 group hover:border-cyan-500/30 transition-all">
                  <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
                    <User size={20} />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-mono mb-1 block">Developer Name</label>
                    <p className="text-white font-medium text-lg italic">3IT_TECH</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10 group hover:border-cyan-500/30 transition-all">
                  <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
                    <GraduationCap size={20} />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-mono mb-1 block">Institution</label>
                    <p className="text-white font-medium">Universitas Hamzanwadi</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-cyan-500/5 rounded-xl border border-cyan-500/10 italic">
                <p className="text-cyan-100/70 text-sm leading-relaxed">
                  "Game ini dikembangkan sebagai submission untuk kompetisi Game Jam GDGOC UNSRI 2026."
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-cyan-500 text-black font-bold rounded-lg text-sm tracking-wide hover:bg-cyan-400 transition-all active:scale-95"
              >
                TUTUP
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
