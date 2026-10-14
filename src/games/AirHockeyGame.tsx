import React, { useEffect, useRef, useState } from 'react';
import { Trophy, RotateCcw, Users, User, Zap, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';

export const AirHockeyGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mode, setMode] = useState<'2p' | 'ai'>('2p');
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [gameOver, setGameOver] = useState<string | null>(null);
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  const stateRef = useRef({
    puck: { x: 400, y: 250, vx: 5, vy: 2, radius: 14, trail: [] as { x: number; y: number; alpha: number }[] },
    p1: { x: 120, y: 250, vx: 0, vy: 0, radius: 26, color: '#00f0ff', glow: '#00f0ff' },
    p2: { x: 680, y: 250, vx: 0, vy: 0, radius: 26, color: '#f59e0b', glow: '#f59e0b' },
    particles: [] as { x: number; y: number; vx: number; vy: number; color: string; life: number; size: number }[],
    shake: 0
  });

  const resetPuck = (towardsP2 = true) => {
    const s = stateRef.current;
    s.puck.x = 400;
    s.puck.y = 250;
    const speed = 6;
    const angle = (Math.random() * 0.8 - 0.4) + (towardsP2 ? 0 : Math.PI);
    s.puck.vx = Math.cos(angle) * speed;
    s.puck.vy = Math.sin(angle) * speed;
    s.puck.trail = [];
  };

  const resetMatch = () => {
    setScores({ p1: 0, p2: 0 });
    setGameOver(null);
    stateRef.current.p1.x = 120;
    stateRef.current.p1.y = 250;
    stateRef.current.p2.x = 680;
    stateRef.current.p2.y = 250;
    resetPuck(Math.random() > 0.5);
  };

  useEffect(() => {
    resetMatch();
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

  const addSparks = (x: number, y: number, color: string, count = 15) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = Math.random() * 4 + 1;
      stateRef.current.particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        color,
        life: 1,
        size: Math.random() * 3 + 2
      });
    }
  };

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

    const goalSize = 160;
    const goalTop = (height - goalSize) / 2;
    const goalBottom = goalTop + goalSize;

    const loop = () => {
      if (!gameOver) {
        const state = stateRef.current;
        const { puck, p1, p2 } = state;

        // Player 1 movement (W, A, S, D) - restricted to left half
        const p1Speed = 6;
        if (keysPressed.current['KeyW']) p1.y -= p1Speed;
        if (keysPressed.current['KeyS']) p1.y += p1Speed;
        if (keysPressed.current['KeyA']) p1.x -= p1Speed;
        if (keysPressed.current['KeyD']) p1.x += p1Speed;

        p1.x = Math.max(p1.radius + 15, Math.min(width / 2 - p1.radius - 10, p1.x));
        p1.y = Math.max(p1.radius + 15, Math.min(height - p1.radius - 15, p1.y));

        // Player 2 movement (Arrow keys) or AI - restricted to right half
        if (mode === '2p') {
          const p2Speed = 6;
          if (keysPressed.current['ArrowUp']) p2.y -= p2Speed;
          if (keysPressed.current['ArrowDown']) p2.y += p2Speed;
          if (keysPressed.current['ArrowLeft']) p2.x -= p2Speed;
          if (keysPressed.current['ArrowRight']) p2.x += p2Speed;
        } else {
          // AI Logic
          const targetY = puck.y;
          const targetX = puck.x > width / 2 ? Math.min(width - 80, puck.x + 30) : 660;
          p2.y += (targetY - p2.y) * 0.085;
          p2.x += (targetX - p2.x) * 0.085;
        }

        p2.x = Math.max(width / 2 + p2.radius + 10, Math.min(width - p2.radius - 15, p2.x));
        p2.y = Math.max(p2.radius + 15, Math.min(height - p2.radius - 15, p2.y));

        // Move Puck
        puck.x += puck.vx;
        puck.y += puck.vy;

        // Comet trail
        puck.trail.push({ x: puck.x, y: puck.y, alpha: 0.6 });
        if (puck.trail.length > 12) puck.trail.shift();
        puck.trail.forEach((t) => (t.alpha -= 0.04));

        // Top and Bottom wall bounce
        if (puck.y - puck.radius < 15) {
          puck.y = 15 + puck.radius;
          puck.vy = -puck.vy;
          sound.playBounce(450);
          addSparks(puck.x, puck.y, '#38bdf8', 8);
        } else if (puck.y + puck.radius > height - 15) {
          puck.y = height - 15 - puck.radius;
          puck.vy = -puck.vy;
          sound.playBounce(450);
          addSparks(puck.x, puck.y, '#38bdf8', 8);
        }

        // Left / Right Walls and Goals
        // Left side
        if (puck.x - puck.radius < 15) {
          if (puck.y >= goalTop && puck.y <= goalBottom) {
            // GOAL for P2!
            sound.playExplosion();
            addSparks(puck.x, puck.y, '#f59e0b', 30);
            state.shake = 12;
            setScores((prev) => {
              const next = { ...prev, p2: prev.p2 + 1 };
              if (next.p2 >= 5) setGameOver(mode === '2p' ? '2. OYUNCU (Sarı) KAZANDI! 🏆' : 'YAPAY ZEKA KAZANDI!');
              return next;
            });
            resetPuck(true);
          } else {
            puck.x = 15 + puck.radius;
            puck.vx = -puck.vx;
            sound.playBounce(450);
            addSparks(puck.x, puck.y, '#38bdf8', 8);
          }
        }

        // Right side
        if (puck.x + puck.radius > width - 15) {
          if (puck.y >= goalTop && puck.y <= goalBottom) {
            // GOAL for P1!
            sound.playExplosion();
            addSparks(puck.x, puck.y, '#00f0ff', 30);
            state.shake = 12;
            setScores((prev) => {
              const next = { ...prev, p1: prev.p1 + 1 };
              if (next.p1 >= 5) setGameOver('1. OYUNCU (Mavi) KAZANDI! 🏆');
              return next;
            });
            resetPuck(false);
          } else {
            puck.x = width - 15 - puck.radius;
            puck.vx = -puck.vx;
            sound.playBounce(450);
            addSparks(puck.x, puck.y, '#38bdf8', 8);
          }
        }

        // Puck & Mallet Collisions
        [p1, p2].forEach((mallet, mIdx) => {
          const dx = puck.x - mallet.x;
          const dy = puck.y - mallet.y;
          const dist = Math.hypot(dx, dy);
          const minDist = puck.radius + mallet.radius;

          if (dist < minDist) {
            const angle = Math.atan2(dy, dx);
            const speed = Math.min(13, Math.hypot(puck.vx, puck.vy) * 1.05 + 1.2);
            puck.vx = Math.cos(angle) * speed;
            puck.vy = Math.sin(angle) * speed;
            puck.x = mallet.x + Math.cos(angle) * minDist;
            puck.y = mallet.y + Math.sin(angle) * minDist;

            sound.playBounce(mIdx === 0 ? 600 : 750);
            addSparks(puck.x, puck.y, mallet.color, 12);
          }
        });

        // Friction on puck
        puck.vx *= 0.994;
        puck.vy *= 0.994;

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
      ctx.save();
      if (stateRef.current.shake > 0) {
        ctx.translate((Math.random() - 0.5) * stateRef.current.shake, (Math.random() - 0.5) * stateRef.current.shake);
        stateRef.current.shake *= 0.88;
      }

      // Dark Neon Table
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);

      // Neon table borders
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 4;
      ctx.strokeRect(15, 15, width - 30, height - 30);

      // Center Divider line & Circle
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(width / 2, 15);
      ctx.lineTo(width / 2, height - 15);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 60, 0, Math.PI * 2);
      ctx.stroke();

      // Left Goal Area
      ctx.strokeStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 12;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(15, goalTop);
      ctx.lineTo(15, goalBottom);
      ctx.stroke();

      // Right Goal Area
      ctx.strokeStyle = '#f59e0b';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(width - 15, goalTop);
      ctx.lineTo(width - 15, goalBottom);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw Puck Trail
      stateRef.current.puck.trail.forEach((t) => {
        ctx.fillStyle = `rgba(255, 255, 255, ${t.alpha * 0.4})`;
        ctx.beginPath();
        ctx.arc(t.x, t.y, stateRef.current.puck.radius * 0.8, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Puck
      const { puck } = stateRef.current;
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(puck.x, puck.y, puck.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();

      // Draw Mallets
      const { p1, p2 } = stateRef.current;
      [p1, p2].forEach((mallet, idx) => {
        ctx.save();
        ctx.fillStyle = mallet.color;
        ctx.shadowColor = mallet.glow;
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(mallet.x, mallet.y, mallet.radius, 0, Math.PI * 2);
        ctx.fill();

        // Inner Handle
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(mallet.x, mallet.y, mallet.radius * 0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(idx === 0 ? 'P1' : mode === '2p' ? 'P2' : 'BOT', mallet.x, mallet.y);
        ctx.restore();
      });

      // Draw Particles
      stateRef.current.particles.forEach((p) => {
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      ctx.restore();
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameOver, mode]);

  return (
    <div className="flex flex-col items-center bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl overflow-hidden relative">
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-black text-lg text-white flex items-center gap-2">
              Siber Hava Hokeyi 1v1
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-bold uppercase">
                {mode === '2p' ? '2 Kişilik (Aynı PC)' : '1P vs Yapay Zeka'}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Yüksek tempolu neon hava hokeyi! Diski rakip kaleye fırlatın, 5 gol atan kazanır!
            </p>
          </div>
        </div>

        {/* Scores & Mode Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-sm">
            <span className="text-cyan-400 font-bold">P1: {scores.p1}</span>
            <span className="text-slate-600">:</span>
            <span className="text-amber-400 font-bold">{mode === '2p' ? 'P2' : 'BOT'}: {scores.p2}</span>
          </div>

          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => {
                sound.playClick();
                setMode('2p');
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition ${
                mode === '2p' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
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
                mode === 'ai' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
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
            <p className="text-sm text-slate-400 mt-2">
              Maç Skoru: <span className="text-cyan-400 font-bold">{scores.p1}</span> - <span className="text-amber-400 font-bold">{scores.p2}</span>
            </p>
            <button
              onClick={() => {
                sound.playPowerUp();
                resetMatch();
              }}
              className="mt-6 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black rounded-2xl shadow-xl hover:from-amber-400 hover:to-amber-500 transition active:scale-95 text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Yeniden Oyna
            </button>
          </div>
        )}
      </div>

      {/* Controls Overlay Guide */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 text-xs">
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
            <span className="font-bold text-white font-heading">1. Oyuncu (Mavi Raket)</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-slate-300">
            <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-cyan-300 font-bold">
              W, A, S, D
            </span>
            <span>Hokey Tokmağını Yönet</span>
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
            <span className="font-bold text-white font-heading">
              {mode === '2p' ? '2. Oyuncu (Sarı Raket)' : 'Yapay Zeka'}
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono text-slate-300">
            {mode === '2p' ? (
              <>
                <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-amber-300 font-bold">
                  Yön Tuşları
                </span>
                <span>Hokey Tokmağını Yönet</span>
              </>
            ) : (
              <span className="text-slate-400">Yapay Zeka Karşı Koyuyor</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
