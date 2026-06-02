import React, { useEffect, useRef, useState } from 'react';
import MobileControls from './MobileControls';

interface GameProps {
  onGameOver: (score: number) => void;
  onQuit: () => void;
  isPaused: boolean;
}

export default function Game({ onGameOver, onQuit, isPaused }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [internalPaused, setInternalPaused] = useState(false);
  const isPausedRef = useRef(isPaused);
  const isInternalPausedRef = useRef(false);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    isInternalPausedRef.current = internalPaused;
  }, [internalPaused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    const isMobileSize = width < 768;
    const gameScale = isMobileSize ? 0.7 : 1;

    canvas.width = width;
    canvas.height = height;

    // --- 1. Audio Setup (Web Audio API) ---
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Master routing: Effects -> masterGain -> lowPassFilter -> destination
    const masterGain = audioCtx.createGain();
    const lowPassFilter = audioCtx.createBiquadFilter();
    lowPassFilter.type = 'lowpass';
    lowPassFilter.frequency.value = 20000; // Start fully open
    
    masterGain.connect(lowPassFilter);
    lowPassFilter.connect(audioCtx.destination);

    const laserBufferRef: { buffer: AudioBuffer | null } = { buffer: null };

    const loadSound = async (url: string) => {
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        laserBufferRef.buffer = await audioCtx.decodeAudioData(arrayBuffer);
      } catch (err) {
        console.error("Error loading laser sound:", err);
      }
    };
    loadSound('assets/spacelaser.wav');

    const playLaser = () => {
      if (!laserBufferRef.buffer) return;
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const source = audioCtx.createBufferSource();
      source.buffer = laserBufferRef.buffer;
      const gainNode = audioCtx.createGain();
      gainNode.gain.value = 0.1;
      source.connect(gainNode);
      gainNode.connect(masterGain);
      source.start();
    };

    const playExplosionSound = () => {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      
      osc.connect(gain);
      gain.connect(masterGain);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    };

    const playPowerupSound = () => {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.2);
      
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
      
      osc.connect(gain);
      gain.connect(masterGain);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.2);
    };

    const playHeartbeat = (intensity: number) => {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(50, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(20, audioCtx.currentTime + 0.1);
      
      gain.gain.setValueAtTime(0.3 * intensity, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    };

    // Assets
    const shipImg = new Image();
    shipImg.src = 'assets/preview.png';
    
    const alienImg = new Image();
    alienImg.src = 'assets/alien.png';

    const bgImg = new Image();
    bgImg.src = 'assets/gambar.jpg';

    let bgX = 0;
    const bgSpeed = 2;

    const player = {
      x: 100,
      y: height / 2,
      width: 60 * gameScale,
      height: 60 * gameScale,
      speed: 7 * (isMobileSize ? 0.8 : 1),
      shootingSpeed: 10,
      hp: 100,
      maxHp: 100,
      shieldHp: 50,
      maxShieldHp: 50,
      lastDamageTime: 0,
      empCooldown: 0,
      shield: 0,
      doubleShot: 0,
    };

    const SHIELD_REGEN_DELAY = 300; // 5 seconds
    const EMP_COOLDOWN_MAX = 1800; // 30 seconds
    const STUN_DURATION = 180; // 3 seconds
    const BOSS_CHARGE_DURATION = 90; // 1.5 seconds

    const ORIGINAL_SHOOTING_SPEED = 10;
    const BUFFED_SHOOTING_SPEED = 5;

    let bullets: any[] = [];
    let enemyBullets: any[] = [];
    let enemies: any[] = [];
    let powerUps: any[] = [];
    let empShockwaves: any[] = [];
    let particles: any[] = [];
    let enemyTimer = 0;
    let powerUpSpawnTimer = 0;
    let buffTimers = {
      rapidFire: 0,
      doubleShot: 0,
      shield: 0
    };

    // Mini Boss State
    let miniBoss: any = null;
    let lastBossScore = 0;

    // --- New States for mechanics ---
    // 1. Warp Drive
    let warpActive = false;
    let warpTimer = 0;
    const WARP_DURATION = 180; // 3 seconds
    
    // 2. Drone Companion (Scrap)
    let scrapCount = 0;
    let droneActive = false;
    let droneTimer = 0;
    const DRONE_DURATION = 900; // 15 seconds
    
    // 3. Black Hole
    let blackHoles: any[] = [];
    let blackHoleTimer = 0;
    
    // 4. Combo System
    let combo = 1;
    let comboTimer = 0;
    const COMBO_DURATION = 90; // 1.5 seconds

    // 5. Bounty & Risk-Reward
    let bountyTimer = 0;
    let bountyTarget: any = null;
    let multiplier = 1;
    let multiplierFlash = 0;

    // 6. Performance Tracking
    let lastTime = performance.now();
    let frameTimes: number[] = [];
    let fps = 60;
    let latency = 20;

    // 7. Emergency Repair Drone
    let repairDrone = {
      active: false,
      timer: 0,
      used: false,
      healTick: 0,
    };
    const REPAIR_DRONE_DURATION = 600; // 10 seconds

    // 8. Overdrive Blast
    let overdrive = {
      meter: 0, // 0 to 20 kills
      active: false,
      timer: 0,
    };
    const OVERDRIVE_DURATION = 300; // 5 seconds
    const OVERDRIVE_KILL_REQ = 20;

    let currentScore = 0;
    let scraps: any[] = [];
    let gameover = false;
    let isDying = false;
    let deathTimer = 0;
    let screenShake = 0;
    let shootCounter = 0;
    let heartbeatTimer = 0;
    const keys: { [key: number]: boolean } = {};

    // Mobile Control States
    let joystickData = { x: 0, y: 0 };
    let isMobileShooting = false;

    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.keyCode] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      delete keys[e.keyCode];
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Global listeners for mobile controls via custom events or direct access
    const handleJoystickMove = (e: any) => {
      joystickData = e.detail;
    };
    const handleMobileShoot = (e: any) => {
      isMobileShooting = e.detail;
    };

    window.addEventListener('joystickMove', handleJoystickMove as any);
    window.addEventListener('mobileShoot', handleMobileShoot as any);

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

    const stars = Array.from({ length: 100 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 2,
    }));

    const update = () => {
      // Performance calculation
      const now = performance.now();
      const dt = now - lastTime;
      lastTime = now;
      frameTimes.push(dt);
      if (frameTimes.length > 60) frameTimes.shift();
      const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
      fps = Math.round(1000 / avgFrameTime);
      latency = Math.round(dt);

      // Handle Pause Toggle
      if (keys[27]) { // ESC
        delete keys[27];
        setInternalPaused(prev => !prev);
      }

      if (gameover || isPausedRef.current || isInternalPausedRef.current) return;

      if (isDying) {
        deathTimer++;
        screenShake = Math.random() * 10;
        
        // Muffled audio effect on Game Over
        const freqValue = Math.max(200, 20000 - (deathTimer * 300));
        lowPassFilter.frequency.setValueAtTime(freqValue, audioCtx.currentTime);

        if (deathTimer % 5 === 0) {
          createExplosion(
            player.x + (Math.random() - 0.5) * player.width, 
            player.y + (Math.random() - 0.5) * player.height, 
            'rgba(255, 100, 0, 0.8)'
          );
        }
        if (deathTimer > 60) {
          gameover = true;
          onGameOver(currentScore);
        }
        return;
      }

      // Heartbeat system for low HP (< 20%)
      if (player.hp < player.maxHp * 0.2) {
        heartbeatTimer++;
        const beatRate = player.hp < 10 ? 30 : 50;
        if (heartbeatTimer % beatRate === 0) {
          playHeartbeat(1.0);
        }
      }

      // Energy Shield Management: Regeneration
      if (Date.now() - player.lastDamageTime > SHIELD_REGEN_DELAY * 16.6) {
        if (player.shieldHp < player.maxShieldHp) {
          player.shieldHp += 0.2;
        }
      }

      // EMP Shockwave Logic (E key)
      if (keys[69] && player.empCooldown <= 0) {
        player.empCooldown = EMP_COOLDOWN_MAX;
        empShockwaves.push({
          x: player.x + player.width / 2,
          y: player.y,
          radius: 10,
          maxRadius: Math.max(width, height)
        });
        playPowerupSound(); 
      }
      if (player.empCooldown > 0) player.empCooldown--;

      // Update EMP Shockwaves
      empShockwaves.forEach((sw, i) => {
        sw.radius += 20;
        if (sw.radius > sw.maxRadius) empShockwaves.splice(i, 1);
        
        // Stun entities
        enemies.forEach(e => {
          const dx = sw.x - e.x;
          const dy = sw.y - e.y;
          const d = Math.sqrt(dx*dx + dy*dy);
          if (Math.abs(d - sw.radius) < 40) { e.stunTimer = STUN_DURATION; }
        });
        enemyBullets.forEach(eb => {
          const dx = sw.x - eb.x;
          const dy = sw.y - eb.y;
          const d = Math.sqrt(dx*dx + dy*dy);
          if (Math.abs(d - sw.radius) < 40) { eb.stunTimer = STUN_DURATION; }
        });
      });

      bgX -= bgSpeed;
      if (bgX <= -width) bgX = 0;

      // Handle Movement (Keyboard)
      const moveX = (keys[68] || keys[39] ? 1 : 0) - (keys[65] || keys[37] ? 1 : 0);
      const moveY = (keys[83] || keys[40] ? 1 : 0) - (keys[87] || keys[38] ? 1 : 0);
      
      player.x += (moveX + joystickData.x) * player.speed;
      player.y += (moveY + joystickData.y) * player.speed;

      player.x = Math.max(10, Math.min(player.x, width - player.width));
      player.y = Math.max(10, Math.min(player.y, height - player.height));

      // Shooting Logic (Standard + Double Shot)
      if ((keys[32] || isMobileShooting) && shootCounter % player.shootingSpeed === 0) {
        playLaser();
        if (buffTimers.doubleShot > 0) {
          bullets.push({ x: player.x + player.width / 2, y: player.y - 15, width: 12, height: 4, speed: 14 });
          bullets.push({ x: player.x + player.width / 2, y: player.y + 15, width: 12, height: 4, speed: 14 });
        } else {
          bullets.push({ x: player.x + player.width / 2, y: player.y, width: 15, height: 4, speed: 12 });
        }
      }
      shootCounter++;

      bullets.forEach((bullet, i) => {
        bullet.x += bullet.speed;
        if (bullet.x > width) bullets.splice(i, 1);
      });

      enemyBullets.forEach((eb, i) => {
        if (eb.stunTimer > 0) {
          eb.stunTimer--;
          return;
        }
        eb.x -= eb.speed;
        if (eb.x < -10) enemyBullets.splice(i, 1);
      });

      // Boss Spawn Trigger (Every 500 points)
      if (currentScore > 0 && currentScore % 500 === 0 && currentScore !== lastBossScore && !miniBoss) {
        miniBoss = {
          x: width + 200,
          y: height / 2,
          width: 180 * gameScale,
          height: 180 * gameScale,
          hp: 20,
          maxHp: 20,
          speed: 1.5,
          shootTimer: 0,
          isCharging: false,
          chargeTimer: 0,
          chargeTarget: { x: 0, y: 0 },
          phase: 0
        };
        lastBossScore = currentScore;
      }

      // Spawning enemies (if no boss)
      if (!miniBoss) {
        enemyTimer++;
        const spawnRate = Math.max(15, 60 - Math.floor(currentScore / 100));
        if (enemyTimer > spawnRate) {
          const typeRoll = Math.random();
          let enemyType = 'standard';
          let hp = 1;
          
          // Wave Logic
          if (currentScore > 500) { // Wave 3: Elite + Zigzag
            enemyType = typeRoll > 0.6 ? 'elite' : (typeRoll > 0.3 ? 'zigzag' : 'standard');
            hp = enemyType === 'elite' ? 3 : 1;
          } else if (currentScore > 200) { // Wave 2: Zigzag
            enemyType = typeRoll > 0.4 ? 'zigzag' : 'standard';
          }

          const sizeScale = (Math.random() * 0.8 + 0.8) * (enemyType === 'elite' ? 1.5 : 1) * gameScale;
          enemies.push({
            x: width + 50,
            y: Math.random() * (height - 100) + 50,
            type: enemyType,
            hp: hp,
            maxHp: hp,
            size: sizeScale,
            speed: (Math.random() * 2 + 3) * (enemyType === 'elite' ? 0.6 : 1),
            width: 30 * sizeScale,
            height: 30 * sizeScale,
            zigzagOffset: Math.random() * Math.PI * 2,
            shootTimer: 0,
            stunTimer: 0
          });
          enemyTimer = 0;
        }
      } else {
        // Boss Update
        miniBoss.x = Math.max(width - 250, miniBoss.x - miniBoss.speed);
        miniBoss.y += Math.sin(Date.now() / 1000) * 2;
        
        if (miniBoss.isCharging) {
           miniBoss.chargeTimer++;
           if (miniBoss.chargeTimer >= BOSS_CHARGE_DURATION) {
              miniBoss.isCharging = false;
              miniBoss.chargeTimer = 0;
              // Release Spread shot after telegraph
              [0.3, 0, -0.3].forEach(angle => {
                enemyBullets.push({
                  x: miniBoss.x - miniBoss.width / 2,
                  y: miniBoss.y,
                  vx: -8 * Math.cos(angle),
                  vy: 8 * Math.sin(angle),
                  speed: 8,
                  width: 20,
                  height: 10,
                  isBoss: true,
                  stunTimer: 0
                });
              });
           }
        } else {
          miniBoss.shootTimer++;
          if (miniBoss.shootTimer % 120 === 0) {
             miniBoss.isCharging = true;
             miniBoss.chargeTimer = 0;
             miniBoss.chargeTarget = { x: player.x, y: player.y };
          }
        }
      }

      enemies.forEach((enemy, i) => {
        if (enemy.stunTimer > 0) {
          enemy.stunTimer--;
          return;
        }

        if (enemy.type === 'zigzag') {
          enemy.x -= enemy.speed;
          enemy.y += Math.sin(Date.now() / 200 + enemy.zigzagOffset) * 4;
          
          enemy.shootTimer++;
          if (enemy.shootTimer % 120 === 0) {
             enemyBullets.push({ x: enemy.x, y: enemy.y, speed: 5, width: 8, height: 8 });
          }
        } else if (enemy.type === 'elite') {
          enemy.x -= enemy.speed;
          // Slowly track player Y
          const dy = player.y - enemy.y;
          enemy.y += Math.sign(dy) * 1.5;
        } else {
          enemy.x -= enemy.speed;
        }

        if (enemy.x < -enemy.width) enemies.splice(i, 1);
      });

      // Update Power-ups
      powerUps.forEach((pu, i) => {
        pu.x -= 3;
        pu.pulse += 0.1;
        if (pu.x < -pu.width) powerUps.splice(i, 1);
        if (isColliding(player, pu)) {
          powerUps.splice(i, 1);
          playPowerupSound();
          
          const types = ['rapidFire', 'doubleShot', 'shield'];
          const picked = types[Math.floor(Math.random() * types.length)];
          (buffTimers as any)[picked] = 420; // ~7 seconds
          
          if (picked === 'rapidFire') player.shootingSpeed = BUFFED_SHOOTING_SPEED;
          
          for (let k = 0; k < 12; k++) {
            particles.push({ x: pu.x, y: pu.y, vx: (Math.random() - 0.5) * 12, vy: (Math.random() - 0.5) * 12, size: Math.random() * 6 + 2, life: 30, color: '#4ade80' });
          }
        }
      });

      // Buff Handling
      Object.keys(buffTimers).forEach(key => {
        if ((buffTimers as any)[key] > 0) {
          (buffTimers as any)[key]--;
          if (key === 'rapidFire' && (buffTimers as any)[key] === 0) player.shootingSpeed = ORIGINAL_SHOOTING_SPEED;
        }
      });

      // Collision Detection: Bullet hits Enemy/Boss
      bullets.forEach((bullet, j) => {
        // Hit Boss
        if (miniBoss && isColliding(bullet, miniBoss)) {
          bullets.splice(j, 1);
          miniBoss.hp--;
          createExplosion(bullet.x, bullet.y, '#00ffff');
          if (miniBoss.hp <= 0) {
            playExplosionSound();
            createExplosion(miniBoss.x, miniBoss.y, 'white');
            currentScore += 100 * combo;
            miniBoss = null;
            // Overdrive meter increment
            if (!overdrive.active) {
              overdrive.meter = Math.min(OVERDRIVE_KILL_REQ, overdrive.meter + 5);
            }
            // Trigger Warp Drive
            warpActive = true;
            warpTimer = WARP_DURATION;
          }
          return;
        }

        // Hit Enemy
        enemies.forEach((enemy, i) => {
          if (isColliding(bullet, enemy)) {
            bullets.splice(j, 1);
            enemy.hp--;
            createExplosion(bullet.x, bullet.y, '#ffaa00');
            if (enemy.hp <= 0) {
              playExplosionSound();
              // Overdrive meter increment
              if (!overdrive.active) {
                overdrive.meter = Math.min(OVERDRIVE_KILL_REQ, overdrive.meter + 1);
              }
              // Combo Logic
              combo++;
              comboTimer = COMBO_DURATION;
              
              // Scrap Drop (25% chance for demo, or as requested)
              if (Math.random() < 0.3) {
                scraps.push({ x: enemy.x, y: enemy.y, width: 20, height: 20 });
              }

              // Power-up Drop Chance (15%)
              if (Math.random() < 0.15) {
                powerUps.push({ x: enemy.x, y: enemy.y, width: 30 * gameScale, height: 30 * gameScale, pulse: 0 });
              }

              // Bounty Reward
              if (enemy.isBounty) {
                currentScore += 500 * combo;
                player.shieldHp = player.maxShieldHp; // Instant refill
                playPowerupSound();
                for (let k = 0; k < 20; k++) {
                  particles.push({ 
                    x: enemy.x, 
                    y: enemy.y, 
                    vx: (Math.random() - 0.5) * 20, 
                    vy: (Math.random() - 0.5) * 20, 
                    size: Math.random() * 8 + 4, 
                    life: 50, 
                    color: '#ef4444' 
                  });
                }
              }

              enemies.splice(i, 1);
              currentScore += 25 * combo * multiplier;
              setScore(currentScore);
              
              // Wave Transition Trigger
              if (currentScore % 250 === 0 && currentScore > 0 && !miniBoss) {
                 warpActive = true;
                 warpTimer = WARP_DURATION;
              }
            }
          }
        });
      });

      // Player Collision with Enemy or Enemy Bullet
      const handlePlayerHit = () => {
        // Invulnerable during Overdrive
        if (overdrive.active) return;

        // Reset Combo
        combo = 1;
        comboTimer = 0;

        // Damage tracking for shield regen
        player.lastDamageTime = Date.now();

        // 1. Tactical Energy Shield
        if (player.shieldHp > 0) {
          player.shieldHp -= 20;
          if (player.shieldHp < 0) player.shieldHp = 0;
          screenShake = 5;
          playPowerupSound(); // Feedback
          return;
        }

        // 2. Powerup Shield
        if (buffTimers.shield > 0) {
          buffTimers.shield = 0;
          playPowerupSound();
          screenShake = 5;
          return;
        }
        
        player.hp -= 20;
        screenShake = 10;
        playExplosionSound();
        if (player.hp <= 0 && !isDying) {
          isDying = true;
          createExplosion(player.x, player.y, 'white');
        }
      };

      enemies.forEach(enemy => {
        if (isColliding(player, enemy) && !isDying) handlePlayerHit();
      });

      enemyBullets.forEach((eb, i) => {
        if (isColliding(player, eb)) {
          enemyBullets.splice(i, 1);
          handlePlayerHit();
        }
      });

      if (miniBoss && isColliding(player, miniBoss) && !isDying) handlePlayerHit();

      // Particle update
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        p.life--; p.size *= 0.96;
        if (p.life <= 0 || p.size < 0.5) particles.splice(i, 1);
      }

      // --- New Mechanics Updates ---
      
      // 1. Warp Drive Logic
      if (warpActive) {
        warpTimer--;
        // Auto-move player to top-center
        const targetX = width / 2 - player.width / 2;
        const targetY = height / 4;
        player.x += (targetX - player.x) * 0.1;
        player.y += (targetY - player.y) * 0.1;
        
        if (warpTimer <= 0) {
          warpActive = false;
        }
        return; // Skip rest of update during warp
      }

      // 1.1 Overdrive Logic (Trigger with Q key = 81)
      if (keys[81] && overdrive.meter >= OVERDRIVE_KILL_REQ && !overdrive.active) {
        overdrive.active = true;
        overdrive.timer = OVERDRIVE_DURATION;
        overdrive.meter = 0;
        playPowerupSound();
        screenShake = 15;
      }

      if (overdrive.active) {
        overdrive.timer--;
        if (overdrive.timer <= 0) {
          overdrive.active = false;
        }
        // Hyper fire rate
        if (shootCounter % Math.floor(player.shootingSpeed / 3) === 0 && (keys[32] || isMobileShooting)) {
          playLaser();
          bullets.push({ x: player.x + player.width / 2, y: player.y, width: 25, height: 6, speed: 18, color: '#f87171' });
        }
      }

      // 1.2 Emergency Repair Drone Logic
      if (player.hp < player.maxHp * 0.25 && !repairDrone.used && !repairDrone.active && !isDying) {
        repairDrone.active = true;
        repairDrone.timer = REPAIR_DRONE_DURATION;
        repairDrone.used = true;
        repairDrone.healTick = 0;
        playPowerupSound();
      }

      if (repairDrone.active) {
        repairDrone.timer--;
        repairDrone.healTick++;
        
        // Restore 5% HP/Shield every 2 seconds (120 frames)
        if (repairDrone.healTick >= 120) {
          player.hp = Math.min(player.maxHp, player.hp + player.maxHp * 0.05);
          player.shieldHp = Math.min(player.maxShieldHp, player.shieldHp + player.maxShieldHp * 0.05);
          repairDrone.healTick = 0;
          createExplosion(player.x, player.y, '#4ade80');
        }

        // Protective Shooting at nearby projectiles
        enemyBullets.forEach(eb => {
          const dx = eb.x - player.x;
          const dy = eb.y - player.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 200 && repairDrone.timer % 60 === 0) {
             bullets.push({ 
               x: player.x, 
               y: player.y, 
               vx: eb.x - player.x, 
               vy: eb.y - player.y,
               speed: 10,
               width: 8, 
               height: 3, 
               isRepairDroneBullet: true 
             });
          }
        });

        if (repairDrone.timer <= 0) repairDrone.active = false;
      }

      // 2. Combo Timer
      if (comboTimer > 0) {
        comboTimer--;
        if (comboTimer === 0) combo = 1;
      }

      // 3. Black Hole Spawning & Logic
      blackHoleTimer++;
      if (blackHoleTimer > 600) { // Every ~10s
        blackHoles.push({
          x: Math.random() * (width - 400) + 200,
          y: Math.random() * (height - 200) + 100,
          radius: 150,
          life: 300, // 5 seconds
          pulse: 0
        });
        blackHoleTimer = 0;
      }

      blackHoles.forEach((bh, i) => {
        bh.life--;
        bh.pulse += 0.1;
        if (bh.life <= 0) blackHoles.splice(i, 1);
        
        // Gravity effect
        const dx = bh.x - (player.x + player.width / 2);
        const dy = bh.y - player.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < bh.radius) {
          const force = (1 - dist / bh.radius) * 2;
          player.x += (dx / dist) * force;
          player.y += (dy / dist) * force;
        }
      });

      // 4. Drone Companion logic
      if (droneActive) {
        droneTimer--;
        if (droneTimer <= 0) droneActive = false;
        
        // Drone shooting
        if (droneTimer % 60 === 0) {
           bullets.push({ 
             x: player.x + player.width / 2, 
             y: player.y + 40, 
             width: 10, 
             height: 3, 
             speed: 15,
             isDroneBullet: true 
           });
           playLaser();
        }
      }

      // 5. Scrap update
      scraps.forEach((s, i) => {
        s.x -= 2;
        if (s.x < -20) scraps.splice(i, 1);
        if (isColliding(player, s)) {
          scraps.splice(i, 1);
          scrapCount++;
          if (scrapCount >= 10 && !droneActive) {
            droneActive = true;
            droneTimer = DRONE_DURATION;
            scrapCount = 0;
          }
          playPowerupSound();
        }
      });

      // 6. Risk-Reward Multiplier Calculation
      let isRisking = player.x > width * 0.7;
      
      // Near Miss Check
      enemyBullets.forEach(eb => {
        const dx = eb.x - player.x;
        const dy = eb.y - player.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < player.width + 30 && dist > player.width / 2) {
           isRisking = true;
        }
      });
      enemies.forEach(e => {
        const dx = e.x - player.x;
        const dy = e.y - player.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < player.width + 50 && dist > player.width / 2) {
           isRisking = true;
        }
      });

      if (isRisking) {
        if (multiplier === 1) multiplierFlash = 30;
        multiplier = 2;
      } else {
        multiplier = 1;
      }
      if (multiplierFlash > 0) multiplierFlash--;

      // 7. Bounty System Logic
      bountyTimer++;
      if (bountyTimer > 1800) { // Every 30 seconds
        const potentialTargets = enemies.filter(e => !e.isBounty);
        if (potentialTargets.length > 0) {
          const target = potentialTargets[Math.floor(Math.random() * potentialTargets.length)];
          target.isBounty = true;
          target.bountyTimeLeft = 300; // 5 seconds
          bountyTimer = 0;
        }
      }

      enemies.forEach((enemy, i) => {
        if (enemy.isBounty) {
          enemy.bountyTimeLeft--;
          if (enemy.bountyTimeLeft <= 0) {
            // Failure: Shoot fast bullets and leave
            for (let k = 0; k < 5; k++) {
              enemyBullets.push({
                x: enemy.x,
                y: enemy.y,
                vx: -10,
                vy: (Math.random() - 0.5) * 10,
                speed: 10,
                width: 10,
                height: 10,
                stunTimer: 0
              });
            }
            enemy.isBounty = false;
            enemy.speed = 15; // Escape speed
          }
        }
      });
    };

    const draw = () => {
      ctx.save();
      
      // Handle Pause Overlay Drawing
      if (isPausedRef.current || isInternalPausedRef.current) {
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, 0, width, height);
        ctx.globalAlpha = 1;
        
        // We handle UI buttons in the React return part for better click handling
        ctx.fillStyle = 'white';
        ctx.font = 'bold 40px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', width / 2, height / 2 - 40);
        ctx.restore();
        return;
      }

      if (screenShake > 0) {
        ctx.translate((Math.random() - 0.5) * screenShake, (Math.random() - 0.5) * screenShake);
        screenShake *= 0.9;
        if (screenShake < 0.1) screenShake = 0;
      }

      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, width, height);

      if (bgImg.complete && bgImg.naturalWidth !== 0) {
        const speedMult = warpActive ? 15 : 1;
        bgX -= bgSpeed * speedMult;
        if (bgX <= -width) bgX = 0;
        ctx.drawImage(bgImg, bgX, 0, width, height);
        ctx.drawImage(bgImg, bgX + width, 0, width, height);
      } else {
        const speedMult = warpActive ? 10 : 1;
        // Fallback: Starry background with stable stars
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = 'white';
        stars.forEach(star => {
          let sx = (star.x * width + bgX) % width;
          if (sx < 0) sx += width;
          if (warpActive) {
            ctx.fillRect(sx, star.y * height, star.size * 20, star.size);
          } else {
            ctx.fillRect(sx, star.y * height, star.size, star.size);
          }
        });
      }

      particles.forEach((p) => {
        ctx.globalAlpha = p.life / 30;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Performance Overlay (Top Left)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(10, 10, 80, 40);
      ctx.fillStyle = fps < 30 ? '#ef4444' : '#22c55e';
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`FPS: ${fps}`, 15, 25);
      ctx.fillStyle = '#60a5fa';
      ctx.fillText(`LAT: ${latency}ms`, 15, 40);

      // Draw EMP Shockwaves
      empShockwaves.forEach(sw => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(100, 200, 255, ${0.5 * (1 - sw.radius/sw.maxRadius)})`;
        ctx.lineWidth = 10;
        ctx.stroke();
        ctx.restore();
      });

      bullets.forEach((bullet) => {
        ctx.fillStyle = (bullet as any).isDroneBullet ? '#fbbf24' : ((bullet as any).isRepairDroneBullet ? '#4ade80' : '#00ffff');
        if (overdrive.active) ctx.fillStyle = '#f87171';
        ctx.shadowBlur = 10;
        ctx.shadowColor = ctx.fillStyle;
        if ((bullet as any).vx) {
           ctx.beginPath();
           ctx.arc(bullet.x, bullet.y, bullet.width/2, 0, Math.PI * 2);
           ctx.fill();
           bullet.x += (bullet as any).vx;
           bullet.y += (bullet as any).vy;
        } else {
           ctx.fillRect(bullet.x, bullet.y - bullet.height / 2, bullet.width, bullet.height);
        }
        ctx.shadowBlur = 0;
      });

      enemyBullets.forEach((eb) => {
        ctx.fillStyle = (eb as any).isBoss ? '#ff00ff' : '#ffaa00';
        ctx.shadowBlur = 10;
        ctx.shadowColor = ctx.fillStyle;
        if ((eb as any).vx) {
           ctx.beginPath();
           ctx.arc(eb.x, eb.y, eb.width/2, 0, Math.PI * 2);
           ctx.fill();
           eb.x += (eb as any).vx;
           eb.y += (eb as any).vy;
        } else {
           ctx.fillRect(eb.x, eb.y - eb.height / 2, eb.width, eb.height);
        }
        
        if (eb.stunTimer > 0) {
           ctx.strokeStyle = '#60a5fa';
           ctx.lineWidth = 2;
           ctx.beginPath();
           ctx.arc(eb.x, eb.y, 10, 0, Math.PI * 2);
           ctx.stroke();
        }
        ctx.shadowBlur = 0;
      });

      if (shipImg.complete && shipImg.naturalWidth !== 0) {
        if (!isDying || Math.floor(Date.now() / 100) % 2 === 0) {
          ctx.save();
          ctx.translate(player.x + player.width / 2, player.y);
          ctx.rotate(Math.PI / 2);
          if (overdrive.active) {
            ctx.shadowBlur = 30;
            ctx.shadowColor = '#f87171';
            ctx.globalAlpha = 0.8 + Math.sin(Date.now() / 50) * 0.2;
          }

          ctx.drawImage(shipImg, -player.width / 2, -player.height / 2, player.width, player.height);
          
          // Shield Visual Effect
          if (buffTimers.shield > 0 || overdrive.active) {
            ctx.strokeStyle = overdrive.active ? '#f87171' : '#60a5fa';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, player.width * 0.8, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = overdrive.active ? 'rgba(248, 113, 113, 0.2)' : 'rgba(96, 165, 250, 0.2)';
            ctx.fill();
          }
          ctx.restore();
        }
      } else {
        if (!isDying || Math.floor(Date.now() / 100) % 2 === 0) {
          // Fallback ship (triangle)
          ctx.save();
          ctx.translate(player.x + player.width / 2, player.y);
          ctx.fillStyle = 'white';
          ctx.beginPath();
          ctx.moveTo(20 * gameScale, 0);
          ctx.lineTo(-20 * gameScale, -15 * gameScale);
          ctx.lineTo(-20 * gameScale, 15 * gameScale);
          ctx.closePath();
          ctx.fill();
          
          if (buffTimers.shield > 0) {
            ctx.strokeStyle = '#60a5fa';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, 30 * gameScale, 0, Math.PI * 2);
            ctx.stroke();
          }
          ctx.restore();
        }
      }

      // Draw Drone
      if (droneActive) {
        ctx.save();
        ctx.translate(player.x - 20, player.y + 40);
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(Math.sin(Date.now() / 200) * 10, Math.cos(Date.now() / 200) * 5, 8, 0, Math.PI * 2);
        ctx.fill();
        // Eye
        ctx.fillStyle = 'red';
        ctx.fillRect(2, -2, 4, 4);
        ctx.restore();
      }

      // Draw Repair Drone
      if (repairDrone.active) {
        ctx.save();
        ctx.translate(player.x - 30, player.y - 40);
        ctx.fillStyle = '#4ade80';
        ctx.beginPath();
        ctx.arc(Math.sin(Date.now() / 150) * 15, Math.cos(Date.now() / 150) * 8, 10, 0, Math.PI * 2);
        ctx.fill();
        // Cross
        ctx.fillStyle = 'white';
        ctx.fillRect(-2, -5, 4, 10);
        ctx.fillRect(-5, -2, 10, 4);
        ctx.restore();
      }

      // Draw Scraps
      scraps.forEach(s => {
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(Date.now() / 500);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(-5, -5, 10, 10);
        ctx.strokeStyle = '#fbbf24';
        ctx.strokeRect(-5, -5, 10, 10);
        ctx.restore();
      });

      // Draw Black Holes
      blackHoles.forEach(bh => {
        const pulse = 1 + Math.sin(bh.pulse) * 0.1;
        ctx.save();
        ctx.translate(bh.x, bh.y);
        
        // Outer glow
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, bh.radius * pulse);
        grad.addColorStop(0, 'rgba(0, 0, 0, 1)');
        grad.addColorStop(0.3, 'rgba(100, 0, 255, 0.4)');
        grad.addColorStop(1, 'transparent');
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, bh.radius * pulse, 0, Math.PI * 2);
        ctx.fill();
        
        // Event horizon
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(0, 0, 40 * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#4f46e5';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.restore();
      });

      // Draw Mini Boss
      if (miniBoss) {
        ctx.save();
        ctx.translate(miniBoss.x, miniBoss.y);
        ctx.rotate(-Math.PI / 2);
        
        // Glow effect
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ff0055';
        
        if (alienImg.complete) {
          ctx.drawImage(alienImg, -miniBoss.width / 2, -miniBoss.height / 2, miniBoss.width, miniBoss.height);
        } else {
          ctx.fillStyle = '#ff0055';
          ctx.fillRect(-miniBoss.width / 2, -miniBoss.height / 2, miniBoss.width, miniBoss.height);
        }
        ctx.restore();

        // Boss Health Bar UI
        const barWidth = 400 * gameScale;
        const barHeight = 12 * gameScale;
        const bx = (width - barWidth) / 2;
        const by = 40;
        
        ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
        ctx.fillRect(bx, by, barWidth, barHeight);
        ctx.fillStyle = '#ff0055';
        ctx.fillRect(bx, by, (miniBoss.hp / miniBoss.maxHp) * barWidth, barHeight);
        ctx.strokeStyle = 'white';
        ctx.strokeRect(bx, by, barWidth, barHeight);

        // Boss Telegraphing / Charging Visuals
        if (miniBoss.isCharging) {
           ctx.save();
           ctx.setLineDash([5, 5]);
           ctx.strokeStyle = 'rgba(255, 0, 0, 0.4)';
           ctx.lineWidth = 1;
           ctx.beginPath();
           ctx.moveTo(miniBoss.x, miniBoss.y);
           // Representative of spread shot angles
           [0.3, 0, -0.3].forEach(angle => {
              ctx.moveTo(miniBoss.x, miniBoss.y);
              ctx.lineTo(miniBoss.x - 1000, miniBoss.y + 1000 * Math.sin(angle));
           });
           ctx.stroke();
           ctx.restore();

           const chargeRatio = miniBoss.chargeTimer / BOSS_CHARGE_DURATION;
           ctx.fillStyle = `rgba(255, 0, 0, ${chargeRatio * 0.6})`;
           ctx.beginPath();
           ctx.arc(miniBoss.x - miniBoss.width / 3, miniBoss.y, 30 * chargeRatio, 0, Math.PI * 2);
           ctx.fill();
        }
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText("ANOMALY DETECTED: MINI-BOSS", width / 2, by - 10);
      }

      enemies.forEach((enemy) => {
        ctx.save();
        if (enemy.type === 'elite') {
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#ffcc00';
          // Health dots for elite
          for (let d = 0; d < enemy.hp; d++) {
            ctx.fillStyle = '#ffcc00';
            ctx.fillRect(enemy.x - 10 + d * 8, enemy.y - enemy.height / 2 - 10, 5, 5);
          }
        }
        
        if (alienImg.complete && alienImg.naturalWidth !== 0) {
          ctx.drawImage(alienImg, enemy.x - enemy.width / 2, enemy.y - enemy.height / 2, enemy.width, enemy.height);
        } else {
          ctx.fillStyle = enemy.type === 'elite' ? '#ffcc00' : (enemy.type === 'zigzag' ? '#00ffcc' : '#ff4444');
          ctx.beginPath();
          ctx.arc(enemy.x, enemy.y, enemy.width / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Bounty Indicator (Red Flashing)
        if (enemy.isBounty) {
          const flash = Math.sin(Date.now() / 50) > 0;
          ctx.strokeStyle = flash ? '#ef4444' : 'white';
          ctx.lineWidth = 4;
          ctx.strokeRect(enemy.x - enemy.width / 2 - 5, enemy.y - enemy.height / 2 - 5, enemy.width + 10, enemy.height + 10);
          
          // Timer circle
          ctx.beginPath();
          ctx.strokeStyle = '#ef4444';
          ctx.arc(enemy.x, enemy.y, enemy.width, -Math.PI / 2, -Math.PI / 2 + (enemy.bountyTimeLeft / 300) * Math.PI * 2);
          ctx.stroke();
          
          ctx.fillStyle = '#ef4444';
          ctx.font = 'bold 12px monospace';
          ctx.textAlign = 'center';
          ctx.fillText("BOUNTY", enemy.x, enemy.y - enemy.height - 10);
        }
        
        // Stun indicator for enemies
        if (enemy.stunTimer > 0) {
           ctx.strokeStyle = '#60a5fa';
           ctx.lineWidth = 3;
           ctx.beginPath();
           ctx.arc(enemy.x, enemy.y, enemy.width * 0.7, 0, Math.PI * 2);
           ctx.stroke();
        }

        ctx.restore();
      });

      // Draw Power-ups
      powerUps.forEach((pu) => {
        const pulseScale = 1 + Math.sin(pu.pulse) * 0.2;
        ctx.fillStyle = '#4ade80';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#4ade80';
        ctx.beginPath();
        ctx.arc(pu.x, pu.y, (pu.width / 2) * pulseScale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'white';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText("?", pu.x, pu.y + 4);
      });

      // Enhanced Player HUD (Score & Health)
      const isSmall = width < 640;
      ctx.textAlign = 'left';
      
      // Score (Top Center - Number Only)
      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = 'white';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00ffff';
      ctx.font = 'bold 32px "Space Grotesk", sans-serif';
      ctx.fillText(currentScore.toString(), width / 2, 40);
      
      ctx.font = 'bold 8px monospace';
      ctx.fillStyle = 'rgba(0, 255, 255, 0.4)';
      ctx.fillText("TAP TO PAUSE", width / 2, 55);
      ctx.restore();

      // Player Health Bar
      const hpWidth = 150 * gameScale;
      const hpHeight = 10 * gameScale;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(20, isSmall ? 40 : 55, hpWidth, hpHeight);
      const hpColor = player.hp < 30 ? '#ef4444' : '#22c55e';
      ctx.fillStyle = hpColor;
      ctx.fillRect(20, isSmall ? 40 : 55, (player.hp / player.maxHp) * hpWidth, hpHeight);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.strokeRect(20, isSmall ? 40 : 55, hpWidth, hpHeight);

      // Player Energy Shield Bar
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(20, isSmall ? 52 : 70, hpWidth, hpHeight / 2);
      ctx.fillStyle = '#60a5fa';
      ctx.fillRect(20, isSmall ? 52 : 70, (player.shieldHp / player.maxShieldHp) * hpWidth, hpHeight / 2);
      
      // Wave Indicator
      let waveName = "WAVE 1: SCOUT";
      if (currentScore > 500) waveName = "WAVE 3: ELITE SQUAD";
      else if (currentScore > 200) waveName = "WAVE 2: INTERCEPTORS";
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(waveName, 20, isSmall ? 75 : 95);

      // Active Buffs
      let buffY = isSmall ? 90 : 115;
      
      // Multiplier Indicator
      if (multiplier > 1 || multiplierFlash > 0) {
        ctx.save();
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 24px "Space Grotesk"';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#fbbf24';
        const pulse = 1 + Math.sin(Date.now() / 100) * 0.1;
        ctx.scale(pulse, pulse);
        ctx.fillText("X2 MULTIPLIER", (player.x + 40) / pulse, (player.y - 40) / pulse);
        ctx.restore();
      }
      
      // Combo Text
      if (combo > 1) {
        ctx.save();
        ctx.fillStyle = '#f87171';
        ctx.font = `italic bold ${isSmall ? 14 : 20}px monospace`;
        const pulseCount = 1 + Math.sin(Date.now() / 100) * 0.1;
        ctx.scale(pulseCount, pulseCount);
        ctx.fillText(`X${combo} COMBO`, 20 / pulseCount, (isSmall ? 250 : 300) / pulseCount);
        ctx.restore();
      }

      // Scrap Counter
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(`SCRAP: ${scrapCount}/10`, width - 120, 40);

      // EMP Cooldown Indicator
      if (player.empCooldown > 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(width - 120, 55, 100, 5);
        ctx.fillStyle = '#60a5fa';
        ctx.fillRect(width - 120, 55, (1 - player.empCooldown / EMP_COOLDOWN_MAX) * 100, 5);
        ctx.font = 'bold 8px monospace';
        ctx.fillText("EMP READY IN " + Math.ceil(player.empCooldown/60) + "S", width - 120, 70);
      } else {
        ctx.fillStyle = '#60a5fa';
        ctx.font = 'bold 10px monospace';
        ctx.fillText("EMP READY [E]", width - 120, 65);
      }

      // Overdrive Meter
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(width - 120, 80, 100, 10);
      const overdriveColor = overdrive.meter >= OVERDRIVE_KILL_REQ ? (Math.sin(Date.now() / 100) > 0 ? '#f87171' : 'white') : '#f87171';
      ctx.fillStyle = overdriveColor;
      ctx.fillRect(width - 120, 80, (overdrive.meter / OVERDRIVE_KILL_REQ) * 100, 10);
      ctx.font = 'bold 8px monospace';
      ctx.fillText(overdrive.active ? "OVERDRIVE ACTIVE!" : (overdrive.meter >= OVERDRIVE_KILL_REQ ? "OVERDRIVE READY [Q]" : "OVERDRIVE METER"), width - 120, 105);

      Object.entries(buffTimers).forEach(([name, time]) => {
        if (time > 0) {
          const label = name.replace(/([A-Z])/g, ' $1').toUpperCase();
          ctx.fillStyle = name === 'shield' ? '#60a5fa' : (name === 'doubleShot' ? '#fbbf24' : '#4ade80');
          ctx.font = 'bold 10px monospace';
          ctx.fillText(`${label}: ${Math.ceil(time/60)}s`, 20, buffY);
          buffY += 15;
        }
      });

      ctx.restore();
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
      window.removeEventListener('joystickMove', handleJoystickMove as any);
      window.removeEventListener('mobileShoot', handleMobileShoot as any);
      cancelAnimationFrame(animationFrameId);
    };
  }, [onGameOver]);

  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      <canvas ref={canvasRef} className="block w-full h-full" />
      
      {/* Clickable Score Area to Pause */}
      <div 
        onClick={() => setInternalPaused(true)}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-16 cursor-pointer z-[150] group"
        title="Click to Pause"
      />

      {/* Desktop Hints */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/30 font-mono text-[10px] uppercase tracking-widest pointer-events-none hidden md:block">
        WASD to fly • SPACE to fire • E: EMP • Q: Overdrive • ESC: Pause
      </div>

      {/* Internal Pause Overlay */}
      {internalPaused && (
        <div className="absolute inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#0a0f1a] border border-cyan-500/30 p-8 rounded-2xl flex flex-col items-center gap-6 shadow-[0_0_50px_rgba(6,182,212,0.2)]">
            <h2 className="text-3xl font-black italic text-white tracking-widest">MISSION PAUSED</h2>
            <div className="flex flex-col gap-3 w-56">
              <button 
                onClick={() => setInternalPaused(false)}
                className="w-full py-3 bg-cyan-500 text-black font-bold rounded-lg hover:bg-cyan-400 transition-all active:scale-95 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
              >
                RESUME MISSION
              </button>
              <button 
                onClick={onQuit}
                className="w-full py-3 bg-white/5 text-white font-bold rounded-lg hover:bg-white/10 transition-all active:scale-95 border border-white/10"
              >
                BACK TO MAIN MENU
              </button>
            </div>
            <p className="text-white/40 font-mono text-[10px] uppercase">Space Origin Systems Online</p>
          </div>
        </div>
      )}

      {/* Mobile Controls */}
      <MobileControls />
    </div>
  );
}

// Sub-components
// Components are now imported at the top
