import React, { useEffect, useRef, useState } from 'react';
import { Zap, Trophy, RotateCcw, Play, Sparkles, Flame } from 'lucide-react';
import { sound } from '../utils/audio';

interface Obstacle {
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'spike' | 'high_laser' | 'drone';
  passed: boolean;
}

interface Coin {
  x: number;
  y: number;
  collected: boolean;
}

export const CyberRunnerGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [speed, setSpeed] = useState(7);

  const keysPressed = useRef<{ [key: string]: boolean }>({});

  const stateRef = useRef({
    runner: {
      x: 140,
      y: 360,
      vy: 0,
      jumping: false,
      doubleJump: true,
      sliding: false,
      slideTimer: 0,
      frame: 0
    },
    obstacles: [] as Obstacle[],
    coins: [] as Coin[],
    particles: [] as { x: number; y: number; vx: number; vy: number; color: string; life: number; size: number }[],
    speed: 7,
    score: 0,
    multiplier: 1,
    groundY: 360,
    bgOffset: 0
  });

  const jump = () => {
    const { runner } = stateRef.current;
    if (!runner.jumping) {
      runner.vy = -14.5;
      runner.jumping = true;
      runner.sliding = false;
      sound.playBounce(500);
    } else if (runner.doubleJump) {
      runner.vy = -13;
      runner.doubleJump = false;
      sound.playLaser(850);
      // Double jump sparks
      for (let i = 0; i < 15; i++) {
        stateRef.current.particles.push({
          x: runner.x,
          y: runner.y + 15,
          vx: (Math.random() - 0.5) * 4,
          vy: Math.random() * 3 + 2,
          color: '#00f0ff',
          life: 1,
          size: 3
        });
      }
    }
  };

  const slide = () => {
    const { runner } = stateRef.current;
    if (!runner.jumping) {
      runner.sliding = true;
      runner.slideTimer = 35;
      sound.playBounce(350);
    }
  };

  const resetGame = () => {
    const s = stateRef.current;
    s.runner.y = s.groundY;
    s.runner.vy = 0;
    s.runner.jumping = false;
    s.runner.doubleJump = true;
    s.runner.sliding = false;
    s.obstacles = [];
    s.coins = [];
    s.particles = [];
    s.speed = 7;
    s.score = 0;
    s.multiplier = 1;
    setScore(0);
    setMultiplier(1);
    setGameOver(false);
  };

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = true;
      if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        jump();
      }
      if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        slide();
      }
    };
    const onUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, []);

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 800;
    const height = 500;
    canvas.width = width;
    canvas.height = height;

    let frameCount = 0;

    const loop = () => {
      if (!gameOver) {
        frameCount++;
        const state = stateRef.current;
        const { runner } = state;

        // Speed ramp
        state.speed = Math.min(15, 7 + state.score * 0.003);
        setSpeed(Math.round(state.speed * 10) / 10);
        state.bgOffset += state.speed;

        // Runner physics
        runner.y += runner.vy;
        runner.vy += 0.75; // gravity

        if (runner.y >= state.groundY) {
          runner.y = state.groundY;
          runner.vy = 0;
          runner.jumping = false;
          runner.doubleJump = true;
        }

        if (runner.sliding) {
          runner.slideTimer--;
          if (runner.slideTimer <= 0) runner.sliding = false;
        }

        runner.frame += 0.2;

        // Score increase
        if (frameCount % 6 === 0) {
          state.score += state.multiplier;
          setScore(state.score);
          if (state.score > highScore) setHighScore(state.score);
        }

        // Spawn obstacles
        if (frameCount % Math.max(50, Math.floor(110 - state.speed * 4)) === 0) {
          const rand = Math.random();
          if (rand < 0.45) {
            // Low spike to jump
            state.obstacles.push({
              x: width + 50,
              y: state.groundY - 30,
              w: 30,
              h: 30,
              type: 'spike',
              passed: false
            });
          } else if (rand < 0.75) {
            // High Laser to slide under!
            state.obstacles.push({
              x: width + 50,
              y: state.groundY - 75,
              w: 45,
              h: 40,
              type: 'high_laser',
              passed: false
            });
          } else {
            // Drone hovering
            state.obstacles.push({
              x: width + 50,
              y: state.groundY - 38,
              w: 36,
              h: 36,
              type: 'drone',
              passed: false
            });
          }

          // Spawn Data Chip / Coin above or below
          if (Math.random() > 0.4) {
            state.coins.push({
              x: width + 120,
              y: rand < 0.5 ? state.groundY - 70 : state.groundY - 20,
              collected: false
            });
          }
        }

        // Move obstacles
        for (let i = state.obstacles.length - 1; i >= 0; i--) {
          const obs = state.obstacles[i];
          obs.x -= state.speed;

          // Runner hitbox
          const rx = runner.x;
          const ry = runner.sliding ? runner.y - 18 : runner.y - 40;
          const rw = 26;
          const rh = runner.sliding ? 18 : 40;

          // Check collision
          if (
            rx + rw > obs.x &&
            rx < obs.x + obs.w &&
            ry + rh > obs.y &&
            ry < obs.y + obs.h
          ) {
            // CRASH!
            sound.playExplosion();
            setGameOver(true);
            for (let p = 0; p < 35; p++) {
              state.particles.push({
                x: runner.x,
                y: runner.y - 20,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                color: '#ec4899',
                life: 1,
                size: Math.random() * 4 + 2
              });
            }
          }

          if (obs.x + obs.w < 0) {
            state.obstacles.splice(i, 1);
          }
        }

        // Move coins
        for (let i = state.coins.length - 1; i >= 0; i--) {
          const coin = state.coins[i];
          coin.x -= state.speed;

          // Check collect
          if (!coin.collected && Math.hypot(runner.x - coin.x, (runner.y - 25) - coin.y) < 28) {
            coin.collected = true;
            sound.playCoin();
            state.score += 50;
            state.multiplier = Math.min(8, state.multiplier + 1);
            setMultiplier(state.multiplier);
            setScore(state.score);

            for (let p = 0; p < 12; p++) {
              state.particles.push({
                x: coin.x,
                y: coin.y,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5,
                color: '#f59e0b',
                life: 1,
                size: 3
              });
            }
          }

          if (coin.x < -30 || coin.collected) {
            state.coins.splice(i, 1);
          }
        }

        // Speed particles
        if (Math.random() > 0.3) {
          state.particles.push({
            x: width,
            y: 200 + Math.random() * 250,
            vx: -state.speed * 1.5 - Math.random() * 5,
            vy: 0,
            color: '#a855f7',
            life: 1,
            size: Math.random() * 2 + 1
          });
        }

        // Update particles
        for (let i = state.particles.length - 1; i >= 0; i--) {
          const p = state.particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 0.04;
          if (p.life <= 0) state.particles.splice(i, 1);
        }
      }

      // RENDER
      // 1. Synthwave Horizon Background
      ctx.fillStyle = '#090514';
      ctx.fillRect(0, 0, width, height);

      // Neon Outrun Sun
      const sunGrad = ctx.createLinearGradient(0, 40, 0, 220);
      sunGrad.addColorStop(0, '#fef08a');
      sunGrad.addColorStop(0.5, '#f43f5e');
      sunGrad.addColorStop(1, '#7e22ce');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(400, 190, 85, 0, Math.PI * 2);
      ctx.fill();

      // Sun stripes
      ctx.fillStyle = '#090514';
      for (let sy = 160; sy < 270; sy += 12) {
        ctx.fillRect(300, sy, 200, 4);
      }

      // Cyber City Skyline in distance
      ctx.fillStyle = '#1e1035';
      ctx.fillRect(50, 160, 60, 140);
      ctx.fillRect(130, 120, 80, 180);
      ctx.fillRect(230, 170, 70, 130);
      ctx.fillRect(480, 130, 90, 170);
      ctx.fillRect(600, 150, 70, 150);
      ctx.fillRect(690, 110, 80, 190);

      // Synthwave Perspective Grid Road (Bottom half)
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = '#ec4899';
      ctx.shadowBlur = 8;

      // Horizon line
      ctx.beginPath();
      ctx.moveTo(0, stateRef.current.groundY);
      ctx.lineTo(width, stateRef.current.groundY);
      ctx.stroke();

      // Perspective vertical grid lines
      for (let x = -width; x < width * 2; x += 120) {
        ctx.beginPath();
        ctx.moveTo(400 + (x - 400) * 0.1, stateRef.current.groundY);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Scrolling horizontal road lines
      const speedOffset = (stateRef.current.bgOffset % 40);
      for (let y = stateRef.current.groundY; y < height; y += (y - stateRef.current.groundY) * 0.3 + 12) {
        const drawY = y + speedOffset * 0.3;
        if (drawY > stateRef.current.groundY && drawY < height) {
          ctx.beginPath();
          ctx.moveTo(0, drawY);
          ctx.lineTo(width, drawY);
          ctx.stroke();
        }
      }
      ctx.shadowBlur = 0;

      // Draw Coins (Energy data chips)
      stateRef.current.coins.forEach((c) => {
        ctx.save();
        ctx.fillStyle = '#fbbf24';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(c.x, c.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 8px sans-serif';
        ctx.fillText('⚡', c.x - 4, c.y + 3);
        ctx.restore();
      });

      // Draw Obstacles
      stateRef.current.obstacles.forEach((obs) => {
        ctx.save();
        if (obs.type === 'spike') {
          ctx.fillStyle = '#ef4444';
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.moveTo(obs.x, obs.y + obs.h);
          ctx.lineTo(obs.x + obs.w / 2, obs.y);
          ctx.lineTo(obs.x + obs.w, obs.y + obs.h);
          ctx.closePath();
          ctx.fill();
        } else if (obs.type === 'high_laser') {
          // Overhead laser barrier (must slide under!)
          ctx.fillStyle = '#00f0ff';
          ctx.shadowColor = '#00f0ff';
          ctx.shadowBlur = 14;
          ctx.fillRect(obs.x, obs.y, obs.w, obs.h);

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px monospace';
          ctx.fillText('KAY!', obs.x + 8, obs.y + 24);
        } else {
          // Drone
          ctx.fillStyle = '#a855f7';
          ctx.shadowColor = '#a855f7';
          ctx.shadowBlur = 12;
          ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
          ctx.fillStyle = '#ff007f';
          ctx.beginPath();
          ctx.arc(obs.x + obs.w / 2, obs.y + obs.h / 2, 6, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // Draw Cyber Runner
      const { runner } = stateRef.current;
      ctx.save();
      ctx.translate(runner.x, runner.y);

      // Glow behind runner
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 16;
      ctx.fillStyle = '#00f0ff';

      if (runner.sliding) {
        // Sliding posture
        ctx.fillRect(-15, -16, 34, 14);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(8, -14, 8, 8); // helmet visor
      } else {
        // Running / Jumping posture
        ctx.fillRect(-7, -36, 14, 20); // torso
        // Head / Visor
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, -42, 7, 0, Math.PI * 2);
        ctx.fill();
        // Legs
        const legBob = Math.sin(runner.frame) * 8;
        ctx.fillStyle = '#00f0ff';
        ctx.fillRect(-6, -16, 4, 16 + (runner.jumping ? 0 : legBob));
        ctx.fillRect(2, -16, 4, 16 - (runner.jumping ? 0 : legBob));
      }
      ctx.restore();

      // Draw Particles
      stateRef.current.particles.forEach((p) => {
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameOver, highScore]);

  return (
    <div className="flex flex-col items-center bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl overflow-hidden relative">
      {/* Top Header */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400 shadow-lg">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-black text-lg text-white flex items-center gap-2">
              Siber Koşucu: Hyper Dash
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-pink-500/20 text-pink-400 border border-pink-500/40 font-bold uppercase">
                Synthwave 3D Hız
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Lazerlerin altından kayın, engellerin üzerinden çift zıplayın ve çipleri toplayın!
            </p>
          </div>
        </div>

        {/* Score & Multiplier */}
        <div className="flex items-center gap-3 font-mono text-sm">
          <div className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-amber-400 font-bold flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Skor: {score}</span>
          </div>

          <div className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-cyan-400 font-bold flex items-center gap-1">
            <Flame className="w-4 h-4 text-pink-400" />
            <span>{multiplier}x Kombo</span>
          </div>

          <div className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 text-xs">
            Hız: {speed}x
          </div>
        </div>
      </div>

      {/* Main Canvas */}
      <div
        className="relative mt-4 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner flex items-center justify-center max-w-full cursor-pointer select-none"
        onClick={() => {
          if (!gameOver) jump();
        }}
      >
        <canvas ref={canvasRef} className="block max-w-full h-auto" />

        {/* Game Over Screen */}
        {gameOver && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 z-20">
            <Trophy className="w-16 h-16 text-pink-400 mb-3 animate-pulse" />
            <h2 className="text-3xl font-black font-heading text-white">SİBER KAZA!</h2>
            <p className="text-sm text-slate-300 mt-2">
              Ulaşılan Skor: <span className="text-amber-400 font-bold font-mono text-lg">{score}</span>
            </p>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">
              En Yüksek Skor: {highScore}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                sound.playPowerUp();
                resetGame();
              }}
              className="mt-6 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-amber-500 text-slate-950 font-black rounded-2xl shadow-xl hover:from-pink-400 hover:to-amber-400 transition active:scale-95 text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Yeniden Koş
            </button>
          </div>
        )}
      </div>

      {/* Controls Overlay Guide */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 mt-5 text-xs bg-slate-950 border border-slate-800 rounded-2xl p-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-mono text-slate-300">
            <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-cyan-300 font-bold">
              BOŞLUK / YUKARI OK
            </span>
            <span>Zıpla (Havada basarak Çift Zıpla)</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-slate-300">
            <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-pink-300 font-bold">
              AŞAĞI OK / S
            </span>
            <span>Lazer Altından Kay</span>
          </div>
        </div>

        <div className="text-slate-400 text-[11px] font-mono">
          Mobil veya Fare: Ekrana tıklayarak zıplayabilirsiniz
        </div>
      </div>
    </div>
  );
};
