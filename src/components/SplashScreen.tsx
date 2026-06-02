import React, { useEffect } from 'react';
import { motion } from 'motion/react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = React.useState(0);
  const [isFlying, setIsFlying] = React.useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 30);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress === 100) {
      setTimeout(() => setIsFlying(true), 500);
    }
  }, [progress]);

  useEffect(() => {
    if (isFlying) {
      setTimeout(onComplete, 1200);
    }
  }, [isFlying, onComplete]);

  return (
    <div className={`fixed inset-0 bg-black flex flex-col items-center justify-center overflow-hidden transition-opacity duration-1000 ${isFlying ? 'opacity-0' : 'opacity-100'}`}>
      {/* Background Stars Effect */}
      <div className="absolute inset-0 opacity-30">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            initial={{ 
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000), 
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
              opacity: Math.random()
            }}
            animate={{ 
              opacity: [0.2, 1, 0.2],
              scale: [1, 1.5, 1]
            }}
            transition={{ 
              duration: 2 + Math.random() * 3, 
              repeat: Infinity 
            }}
          />
        ))}
      </div>

      {/* Logo/Ship Animation */}
      <motion.div
        animate={isFlying ? { 
          y: -1000, 
          scale: 1.5,
          transition: { duration: 1, ease: "easeIn" } 
        } : { 
          y: [0, -10, 0],
          transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }}
        className="relative z-10"
      >
        <img 
          src="assets/preview.png" 
          alt="Space Origin Ship" 
          className="w-32 h-32 sm:w-48 sm:h-48 object-contain drop-shadow-[0_0_30px_rgba(0,255,255,0.5)]"
          referrerPolicy="no-referrer"
        />

        {/* Thruster Particles (Active during loading) */}
        {!isFlying && progress < 100 && (
          <div className="absolute left-1/2 bottom-0 -translate-x-1/2 flex flex-col items-center">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 0, scale: 1 }}
                animate={{ 
                  opacity: [0.8, 0], 
                  y: [0, 40 + Math.random() * 40],
                  scale: [1, 0.2],
                  x: (Math.random() - 0.5) * 15
                }}
                transition={{ 
                  duration: 0.5 + Math.random() * 0.5, 
                  repeat: Infinity,
                  delay: i * 0.1
                }}
                className="absolute w-2 h-4 sm:w-3 sm:h-6 bg-cyan-400 rounded-full blur-[2px] shadow-[0_0_10px_#22d3ee]"
              />
            ))}
          </div>
        )}

        {/* Powerful Thruster when flying */}
        {isFlying && (
           <motion.div 
             initial={{ opacity: 0, scaleY: 0 }}
             animate={{ opacity: 1, scaleY: 2 }}
             className="absolute left-1/2 top-full -translate-x-1/2 w-8 h-32 bg-gradient-to-b from-cyan-400 to-transparent blur-md origin-top"
           />
        )}
      </motion.div>

      {/* Loading Bar Container */}
      {!isFlying && (
        <div className="absolute bottom-20 w-64 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/10 p-[1px]">
          <motion.div
            animate={{ width: `${progress}%` }}
            className="h-full bg-cyan-500 shadow-[0_0_15px_#06b6d4] rounded-full"
          />
        </div>
      )}

      {/* CRT Overlay Effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.2) _50%)] bg-[length:100%_2px] z-50 opacity-10" />
    </div>
  );
}
