import React, { useEffect, useRef, useState } from 'react';

interface GameProps {
  onGameOver: (score: number) => void;
}

export default function Game({ onGameOver }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Assets
    const shipImg = new Image();
    shipImg.src = 'assets/preview.png';
    
    const alienImg = new Image();
    alienImg.src = 'assets/alien.png';

    const bgImg = new Image();
    bgImg.src = 'assets/gambar.jpg';

    const shootSound = new Audio('assets/spacelaser.wav');
    shootSound.volume = 0.1;

    let bgX = 0;
    const bgSpeed = 2;

    const player = {
      x: 100,
      y: height / 2,
      width: 60,
      height: 60,
      speed: 6,
      shootingSpeed: 10,
    };

    let bullets: any[] = [];
    let enemies: any[] = [];
    let particles: any[] = [];
    let enemyTimer = 0;
    let currentScore = 0;
    let gameover = false;
    let shootCounter = 0;
    const keys: { [key: number]: boolean } = {};

    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.keyCode] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      delete keys[e.keyCode];
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const createExplosion = (x: number, y: number, color: string) => {
      for (let i = 0; i < 15; i++) {
        particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8,
          size: Math.random() * 3 + 1,
          life: Math.random() * 20 + 20,
          color,
        });
      }
    };

    const isColliding = (obj1: any, obj2: any) => {
      const r1 = {
        left: obj1.x - (obj1.width ? 0 : 5),
        top: obj1.y - (obj1.height ? obj1.height / 2 : 5),
        right: obj1.x + (obj1.width || 10),
        bottom: obj1.y + (obj1.height ? obj1.height / 2 : 5),
      };

      const r2 = {
        left: obj2.x - obj2.width / 2,
        top: obj2.y - obj2.height / 2,
        right: obj2.x + obj2.width / 2,
        bottom: obj2.y + obj2.height / 2,
      };

      return !(
        r1.left > r2.right ||
        r1.right < r2.left ||
        r1.top > r2.bottom ||
        r1.bottom < r2.top
      );
    };

    const update = () => {
      if (gameover) return;

      bgX -= bgSpeed;
      if (bgX <= -width) bgX = 0;

      if (keys[87] || keys[38]) player.y -= player.speed; // W or Up
      if (keys[83] || keys[40]) player.y += player.speed; // S or Down
      if (keys[65] || keys[37]) player.x -= player.speed; // A or Left
      if (keys[68] || keys[39]) player.x += player.speed; // D or Right

      player.x = Math.max(0, Math.min(player.x, width - player.width));
      player.y = Math.max(0, Math.min(player.y, height - player.height));

      if (keys[32] && shootCounter % player.shootingSpeed === 0) {
        (shootSound.cloneNode(true) as HTMLAudioElement).play();
        bullets.push({
          x: player.x + player.width / 2,
          y: player.y,
          width: 15,
          height: 4,
          speed: 12,
        });
      }
      shootCounter++;

      bullets.forEach((bullet, i) => {
        bullet.x += bullet.speed;
        if (bullet.x > width) bullets.splice(i, 1);
      });

      enemyTimer++;
      if (enemyTimer > Math.max(15, 40 - Math.floor(currentScore / 200))) {
        const sizeScale = Math.random() * 1.5 + 1;
        enemies.push({
          x: width + 50,
          y: Math.random() * (height - 60) + 30,
          size: sizeScale,
          speed: Math.random() * 2 + 2 + currentScore / 500,
          width: 30 * sizeScale,
          height: 30 * sizeScale,
        });
        enemyTimer = 0;
      }

      enemies.forEach((enemy, i) => {
        enemy.x -= enemy.speed;
        if (enemy.x < -enemy.width) enemies.splice(i, 1);
      });

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        p.size *= 0.96;
        if (p.life <= 0 || p.size < 0.5) particles.splice(i, 1);
      }

      enemies.forEach((enemy, i) => {
        if (isColliding(player, enemy)) {
          gameover = true;
          createExplosion(player.x, player.y, 'white');
          createExplosion(enemy.x, enemy.y, '#ff4444');
          setTimeout(() => onGameOver(currentScore), 1000);
        }

        bullets.forEach((bullet, j) => {
          if (isColliding(bullet, enemy)) {
            createExplosion(enemy.x, enemy.y, '#ffaa00');
            bullets.splice(j, 1);
            enemies.splice(i, 1);
            currentScore += Math.floor(enemy.size * 10);
            setScore(currentScore);
          }
        });
      });
    };

    const draw = () => {
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, width, height);

      if (bgImg.complete) {
        ctx.drawImage(bgImg, bgX, 0, width, height);
        ctx.drawImage(bgImg, bgX + width, 0, width, height);
      }

      particles.forEach((p) => {
        ctx.globalAlpha = p.life / 30;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      bullets.forEach((bullet) => {
        ctx.fillStyle = '#00ffff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00ffff';
        ctx.fillRect(bullet.x, bullet.y - bullet.height / 2, bullet.width, bullet.height);
        ctx.shadowBlur = 0;
      });

      if (shipImg.complete) {
        ctx.save();
        ctx.translate(player.x + player.width / 2, player.y);
        ctx.rotate(Math.PI / 2);
        ctx.drawImage(shipImg, -player.width / 2, -player.height / 2, player.width, player.height);
        ctx.restore();
      }

      enemies.forEach((enemy) => {
        if (alienImg.complete) {
          ctx.drawImage(alienImg, enemy.x - enemy.width / 2, enemy.y - enemy.height / 2, enemy.width, enemy.height);
        }
      });

      // Score UI
      ctx.fillStyle = 'white';
      ctx.font = '24px "Space Grotesk", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`SCORE: ${currentScore}`, 20, 40);
    };

    let animationFrameId: number;
    const loop = () => {
      update();
      draw();
      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [onGameOver]);

  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      <canvas ref={canvasRef} className="block w-full h-full" />
      <div className="absolute bottom-4 left-4 text-white/50 font-mono text-xs">
        WASD to move • SPACE to shoot
      </div>
    </div>
  );
}
