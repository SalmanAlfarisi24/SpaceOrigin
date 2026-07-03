import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Keyboard, Shield, Zap, Target, Box } from 'lucide-react';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TutorialModal({ isOpen, onClose }: TutorialModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-[#0d1117] border border-cyan-500/30 w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.2)] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-cyan-500/10 to-transparent">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/20 rounded-lg">
                  <Target className="text-cyan-400" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">GAMEPLAY GUIDE</h2>
                  <p className="text-cyan-400/60 text-xs font-mono uppercase tracking-widest">Training Module v2.0</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
              {/* Controls */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase text-sm tracking-wider">
                  <Keyboard size={18} />
                  <span>KONTROL PESAWAT</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <p className="text-white font-medium mb-2">GERAKAN</p>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-white/10 rounded border border-white/20 text-xs text-white/70 font-mono">W/A/S/D</span>
                      <span className="text-white/40">atau</span>
                      <span className="px-2 py-1 bg-white/10 rounded border border-white/20 text-xs text-white/70 font-mono">ARROW KEYS</span>
                    </div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <p className="text-white font-medium mb-2">MENEMBAK & SKILL</p>
                    <div className="flex flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-white/10 rounded border border-white/20 text-xs text-white/70 font-mono">SPACE</span>
                        <span className="text-white/40 text-xs">Laser</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-white/10 rounded border border-white/20 text-xs text-white/70 font-mono">E</span>
                        <span className="text-white/40 text-xs">Shockwave</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-white/10 rounded border border-white/20 text-xs text-white/70 font-mono">Q</span>
                        <span className="text-white/40 text-xs">Overdrive</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Help Features */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase text-sm tracking-wider">
                  <Shield size={18} />
                  <span>FITUR BANTUAN</span>
                </div>
                <div className="space-y-3">
                  <div className="flex gap-4 items-start bg-cyan-500/5 p-4 rounded-xl border border-cyan-500/10">
                    <div className="mt-1"><Shield className="text-cyan-400" size={20} /></div>
                    <div>
                      <p className="text-white font-bold text-sm">ENERGY SHIELD</p>
                      <p className="text-white/60 text-xs leading-relaxed">Melindungi HP utama dari serangan. Akan pulih secara otomatis jika tidak terkena serangan dalam waktu singkat.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start bg-cyan-500/5 p-4 rounded-xl border border-cyan-500/10">
                    <div className="mt-1"><Zap className="text-yellow-400" size={20} /></div>
                    <div>
                      <p className="text-white font-bold text-sm">EMP SHOCKWAVE [E]</p>
                      <p className="text-white/60 text-xs leading-relaxed">Melepaskan gelombang kejut yang menghentikan (stun) semua musuh dan peluru di layar selama beberapa detik.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start bg-cyan-500/5 p-4 rounded-xl border border-cyan-500/10">
                    <div className="mt-1"><Box className="text-green-400" size={20} /></div>
                    <div>
                      <p className="text-white font-bold text-sm">DROP POWER-UP</p>
                      <p className="text-white/60 text-xs leading-relaxed">Hancurkan musuh untuk mendapatkan Rapid Fire, Double Shot, atau instan Shield Restore.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Enemies */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase text-sm tracking-wider">
                  <Target size={18} />
                  <span>MUSUH & ANCAMAN</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-rose-500/5 border border-rose-500/10 p-4 rounded-xl">
                    <p className="text-rose-400 font-bold text-xs uppercase mb-2">ARMADA UFO</p>
                    <ul className="text-white/60 text-xs space-y-2 list-disc list-inside">
                      <li>UFO Standar: Musuh dasar.</li>
                      <li>UFO Zigzag: Bergerak lincah & menembak.</li>
                      <li>Elite Squadron: Nyawa tebal & melacak posisi.</li>
                    </ul>
                  </div>
                  <div className="bg-rose-500/5 border border-rose-500/10 p-4 rounded-xl">
                    <p className="text-rose-400 font-bold text-xs uppercase mb-2">ANOMALY: MINI-BOSS</p>
                    <p className="text-white/60 text-xs leading-relaxed">Muncul setiap 500 skor. Memiliki pola serangan menyebar dan sangat berbahaya. Kalahkan untuk memicu Warp Drive!</p>
                  </div>
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="p-4 bg-white/5 border-t border-white/5 flex justify-center italic text-white/30 text-[10px] font-mono uppercase tracking-widest">
              Establish dominance in the galaxy. Good luck, Commander.
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
