import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { Zap } from 'lucide-react';

export default function MobileControls() {
  const joystickRef = useRef<HTMLDivElement>(null);
  const [isShooting, setIsShooting] = useState(false);
  
  const knobX = useMotionValue(0);
  const knobY = useMotionValue(0);

  // Joystick Logic
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!joystickRef.current) return;
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const touch = e.touches[0];
    
    let dx = touch.clientX - centerX;
    let dy = touch.clientY - centerY;
    
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxRadius = rect.width / 2;
    
    if (distance > maxRadius) {
      dx *= maxRadius / distance;
      dy *= maxRadius / distance;
    }
    
    knobX.set(dx);
    knobY.set(dy);

    const normalizedX = dx / maxRadius;
    const normalizedY = dy / maxRadius;
    
    window.dispatchEvent(new CustomEvent('joystickMove', { 
      detail: { x: normalizedX, y: normalizedY } 
    }));
  };

  const handleTouchEnd = () => {
    knobX.set(0);
    knobY.set(0);
    window.dispatchEvent(new CustomEvent('joystickMove', { 
      detail: { x: 0, y: 0 } 
    }));
  };

  // Shooting Logic
  const setShooting = (active: boolean) => {
    setIsShooting(active);
    window.dispatchEvent(new CustomEvent('mobileShoot', { 
      detail: active 
    }));
  };

  return (
    <div className="fixed inset-0 z-[150] pointer-events-none md:hidden">
      {/* Shoot Button - Right Bottom */}
      <div className="absolute bottom-10 right-10 pointer-events-auto touch-none">
        <motion.button
          onPointerDown={() => setShooting(true)}
          onPointerUp={() => setShooting(false)}
          onPointerCancel={() => setShooting(false)}
          className={`w-20 h-20 rounded-full flex items-center justify-center border-4 backdrop-blur-md transition-colors ${
            isShooting 
              ? 'bg-rose-500/40 border-rose-400' 
              : 'bg-white/10 border-white/20'
          }`}
        >
          <Zap size={32} className={isShooting ? 'text-white fill-white' : 'text-white/40'} />
        </motion.button>
      </div>

      {/* Analog Stick - Left Bottom */}
      <div className="absolute bottom-10 left-10 pointer-events-auto">
        <div 
          ref={joystickRef}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="w-28 h-28 rounded-full border-4 border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-center relative touch-none"
        >
          <motion.div 
            style={{ x: knobX, y: knobY }}
            className="w-10 h-10 rounded-full bg-cyan-500 shadow-[0_0_20px_#06b6d4]"
          />
        </div>
      </div>
    </div>
  );
}
