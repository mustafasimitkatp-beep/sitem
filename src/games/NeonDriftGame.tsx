import React, { useEffect, useRef, useState } from 'react';
import { Trophy, RotateCcw, Users, User, Zap, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';

interface Car {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  speed: number;
  color: string;
  glow: string;
  lap: number;
  checkpoint: number;
  score: number;
  name: string;
  trail: { x: number; y: number; alpha: number }[];
}

export const NeonDriftGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mode, setMode] = useState<'2p' | 'ai'>('2p');
  const [laps, setLaps] = useState({ p1: 1, p2: 1 });
  const [gameOver, setGameOver] = useState<string | null>(null);

  const keysPressed = useRef<{ [key: string]: boolean }>({});

  const stateRef = useRef({
    p1: {
      x: 160,
      y: 110,
      vx: 0,
      vy: 0,
      angle: 0,
      speed: 0,
      color: '#00f0ff',
      glow: '#00f0ff',
      lap: 1,
      checkpoint: 0,
      score: 0,
      name: '1. OYUNCU (Cyan Araba)',
      trail: []
    } as Car,
    p2: {
      x: 160,
      y: 145,
      vx: 0,
      vy: 0,
      angle: 0,
      speed: 0,
      color: '#ff007f',
      glow: '#ff007f',
      lap: 1,
      checkpoint: 0,
      score: 0,
      name: mode === '2p' ? '2. OYUNCU (Pembe Araba)' : 'YAPAY ZEKA',
      trail: []
    } as Car,
    particles: [] as { x: number; y: number; vx: number; vy: number; color: string; life: number }[],
    skidmarks: [] as { x: number; y: number; angle: number; alpha: number }[],
    maxLaps: 3
  });

  const resetRace = () => {
    const s = stateRef.current;
    s.p1.x = 160;
    s.p1.y = 110;
    s.p1.angle = 0;
    s.p1.speed = 0;
    s.p1.lap = 1;
    s.p1.checkpoint = 0;
    s.p1.trail = [];

    s.p2.x = 160;
    s.p2.y = 145;
    s.p2.angle = 0;
    s.p2.speed = 0;
    s.p2.lap = 1;
    s.p2.checkpoint = 0;
    s.p2.trail = [];

    setLaps({ p1: 1, p2: 1 });
    setGameOver(null);
  };

  useEffect(() => {
    resetRace();
  }, [mode]);

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = true;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
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

    // Checkpoint line coordinates
    const checkpoints = [
      { x1: 400, y1: 50, x2: 400, y2: 190 }, // Top straight
      { x1: 650, y1: 150, x2: 750, y2: 300 }, // Right turn
      { x1: 400, y1: 310, x2: 400, y2: 450 }, // Bottom straight
      { x1: 100, y1: 200, x2: 240, y2: 200 } // Finish Line (left)
    ];

    const loop = () => {
      const state = stateRef.current;
      const { p1, p2, maxLaps } = state;

      if (!gameOver) {
        // Player 1 Controls (W gas, S brake, A, D steer)
        if (keysPressed.current['KeyW']) p1.speed = Math.min(6.5, p1.speed + 0.18);
        else if (keysPressed.current['KeyS']) p1.speed = Math.max(-2.5, p1.speed - 0.15);
        else p1.speed *= 0.96;

        if (Math.abs(p1.speed) > 0.5) {
          const steerSpeed = 0.055 * (p1.speed > 0 ? 1 : -1);
          if (keysPressed.current['KeyA']) p1.angle -= steerSpeed;
          if (keysPressed.current['KeyD']) p1.angle += steerSpeed;
        }

        // Player 2 Controls (Arrows) or AI
        if (mode === '2p') {
          if (keysPressed.current['ArrowUp']) p2.speed = Math.min(6.5, p2.speed + 0.18);
          else if (keysPressed.current['ArrowDown']) p2.speed = Math.max(-2.5, p2.speed - 0.15);
          else p2.speed *= 0.96;

          if (Math.abs(p2.speed) > 0.5) {
            const steerSpeed = 0.055 * (p2.speed > 0 ? 1 : -1);
            if (keysPressed.current['ArrowLeft']) p2.angle -= steerSpeed;
            if (keysPressed.current['ArrowRight']) p2.angle += steerSpeed;
          }
        } else {
          // AI Driving along track oval
          p2.speed = Math.min(5.8, p2.speed + 0.12);
          // Waypoint following
          const targetCp = checkpoints[(p2.checkpoint) % checkpoints.length];
          const targetX = (targetCp.x1 + targetCp.x2) / 2;
          const targetY = (targetCp.y1 + targetCp.y2) / 2;
          const desiredAngle = Math.atan2(targetY - p2.y, targetX - p2.x);

          let diff = desiredAngle - p2.angle;
          while (diff < -Math.PI) diff += Math.PI * 2;
          while (diff > Math.PI) diff -= Math.PI * 2;
          p2.angle += Math.sign(diff) * Math.min(Math.abs(diff), 0.05);
        }

        // Move Cars & Check Track Collisions
        [p1, p2].forEach((car, cIdx) => {
          car.x += Math.cos(car.angle) * car.speed;
          car.y += Math.sin(car.angle) * car.speed;

          // Drift skidmarks
          if (Math.abs(car.speed) > 4) {
            state.skidmarks.push({ x: car.x, y: car.y, angle: car.angle, alpha: 0.4 });
            if (state.skidmarks.length > 80) state.skidmarks.shift();

            // Tire smoke
            if (Math.random() > 0.4) {
              state.particles.push({
                x: car.x - Math.cos(car.angle) * 12,
                y: car.y - Math.sin(car.angle) * 12,
                vx: (Math.random() - 0.5) * 1.5,
                vy: (Math.random() - 0.5) * 1.5,
                color: car.color,
                life: 1
              });
            }
          }

          // Off-track grass friction penalty
          // Center barrier: x: 250..550, y: 190..310
          if (car.x > 250 && car.x < 550 && car.y > 190 && car.y < 310) {
            car.speed *= 0.88; // grass slow down!
          }
          // Outer bounds
          if (car.x < 60 || car.x > width - 60 || car.y < 50 || car.y > height - 50) {
            car.speed *= 0.88;
          }

          // Checkpoint detection
          const nextCpIdx = car.checkpoint % checkpoints.length;
          const cp = checkpoints[nextCpIdx];
          const dist = Math.hypot(car.x - (cp.x1 + cp.x2) / 2, car.y - (cp.y1 + cp.y2) / 2);

          if (dist < 90) {
            car.checkpoint++;
            if (nextCpIdx === 3) {
              // Finished a lap!
              sound.playCoin();
              car.lap++;
              setLaps({ p1: p1.lap, p2: p2.lap });

              if (car.lap > maxLaps) {
                sound.playSuccess();
                setGameOver(`${car.name} YARIŞI KAZANDI! 🏁🏆`);
              }
            }
          }
        });

        // Update Particles & Skidmarks
        for (let i = state.particles.length - 1; i >= 0; i--) {
          const p = state.particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 0.05;
          if (p.life <= 0) state.particles.splice(i, 1);
        }
        state.skidmarks.forEach((sm) => (sm.alpha -= 0.003));
        state.skidmarks = state.skidmarks.filter((sm) => sm.alpha > 0);
      }

      // RENDER
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);

      // Grass Area
      ctx.fillStyle = '#064e3b';
      ctx.fillRect(0, 0, width, height);

      // Race Track Asphalt (Outer oval and inner island)
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      // Outer track
      ctx.roundRect(60, 50, width - 120, height - 100, 110);
      ctx.fill();

      // Inner Island Grass
      ctx.fillStyle = '#022c22';
      ctx.beginPath();
      ctx.roundRect(240, 180, width - 480, height - 360, 60);
      ctx.fill();

      // Neon Track Borders
      ctx.strokeStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 10;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(60, 50, width - 120, height - 100, 110);
      ctx.stroke();

      ctx.strokeStyle = '#ff007f';
      ctx.shadowColor = '#ff007f';
      ctx.beginPath();
      ctx.roundRect(240, 180, width - 480, height - 360, 60);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Finish Line (Checkerboard)
      const flX = 160;
      for (let fy = 50; fy < 180; fy += 14) {
        ctx.fillStyle = (Math.floor(fy / 14) % 2 === 0) ? '#ffffff' : '#000000';
        ctx.fillRect(flX, fy, 10, 14);
        ctx.fillStyle = (Math.floor(fy / 14) % 2 === 1) ? '#ffffff' : '#000000';
        ctx.fillRect(flX + 10, fy, 10, 14);
      }

      // Skidmarks
      stateRef.current.skidmarks.forEach((sm) => {
        ctx.save();
        ctx.translate(sm.x, sm.y);
        ctx.rotate(sm.angle);
        ctx.fillStyle = `rgba(15, 23, 42, ${sm.alpha})`;
        ctx.fillRect(-6, -7, 12, 3);
        ctx.fillRect(-6, 4, 12, 3);
        ctx.restore();
      });

      // Tire smoke particles
      stateRef.current.particles.forEach((p) => {
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life * 0.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Draw Supercars
      [p1, p2].forEach((car) => {
        ctx.save();
        ctx.translate(car.x, car.y);
        ctx.rotate(car.angle);

        // Wheels
        ctx.fillStyle = '#020617';
        ctx.fillRect(-12, -10, 7, 4);
        ctx.fillRect(6, -10, 7, 4);
        ctx.fillRect(-12, 6, 7, 4);
        ctx.fillRect(6, 6, 7, 4);

        // Body
        ctx.fillStyle = car.color;
        ctx.shadowColor = car.glow;
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.roundRect(-15, -7, 30, 14, 4);
        ctx.fill();

        // Windshield
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-2, -5, 10, 10);

        // Headlights
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(13, -6, 2, 3);
        ctx.fillRect(13, 3, 2, 3);

        ctx.restore();
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameOver, mode]);

  return (
    <div className="flex flex-col items-center bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl overflow-hidden relative">
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-lg">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-black text-lg text-white flex items-center gap-2">
              Micro Drift Racers: Neon Yarış 1v1
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-bold uppercase">
                {mode === '2p' ? '1 PC / 2 Kişi' : '1P vs Yapay Zeka'}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Neon pistte drift yapın, lastik dumanı savurun ve 3 turu ilk tamamlayan siz olun!
            </p>
          </div>
        </div>

        {/* Laps & Mode Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-sm">
            <span className="text-cyan-400 font-bold">P1 Tur: {Math.min(3, laps.p1)}/3</span>
            <span className="text-slate-600">|</span>
            <span className="text-pink-400 font-bold">P2 Tur: {Math.min(3, laps.p2)}/3</span>
          </div>

          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => {
                sound.playClick();
                setMode('2p');
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition ${
                mode === '2p' ? 'bg-amber-500 text-slate-950 shadow font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              2 Kişi
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setMode('ai');
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition ${
                mode === 'ai' ? 'bg-amber-500 text-slate-950 shadow font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Yapay Zeka
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="relative mt-4 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner flex items-center justify-center max-w-full">
        <canvas ref={canvasRef} className="block max-w-full h-auto" />

        {gameOver && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 z-20">
            <Trophy className="w-16 h-16 text-amber-400 mb-3 animate-pulse" />
            <h2 className="text-3xl font-black font-heading text-white">{gameOver}</h2>
            <button
              onClick={() => {
                sound.playPowerUp();
                resetRace();
              }}
              className="mt-6 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-amber-500 text-slate-950 font-black rounded-2xl shadow-xl hover:from-cyan-400 hover:to-amber-400 transition active:scale-95 text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Yeni Yarış Başlat
            </button>
          </div>
        )}
      </div>

      {/* Controls Overlay Guide */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 text-xs">
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
            <span className="font-bold text-white font-heading">1. Oyuncu (Cyan)</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-slate-300">
            <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-cyan-300 font-bold">
              W (Gaz) / S (Fren) / A, D (Direksiyon)
            </span>
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-pink-500 shadow-[0_0_8px_#ff007f]" />
            <span className="font-bold text-white font-heading">
              {mode === '2p' ? '2. Oyuncu (Pembe)' : 'Yapay Zeka (Oto)'}
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono text-slate-300">
            {mode === '2p' ? (
              <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-pink-300 font-bold">
                Yukarı (Gaz) / Aşağı (Fren) / Sol, Sağ
              </span>
            ) : (
              <span className="text-slate-400">Yapay Zeka Otomatik Yarışıyor</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
