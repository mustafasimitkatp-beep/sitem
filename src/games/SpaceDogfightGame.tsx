import React, { useEffect, useRef, useState } from 'react';
import { Rocket, Trophy, RotateCcw, Users, User, Zap, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';

interface Ship {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  color: string;
  glow: string;
  hp: number;
  score: number;
  cooldown: number;
  shield: boolean;
  name: string;
}

interface Torpedo {
  x: number;
  y: number;
  vx: number;
  vy: number;
  owner: number;
  color: string;
  life: number;
}

interface Asteroid {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  rot: number;
  vRot: number;
}

export const SpaceDogfightGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mode, setMode] = useState<'2p' | 'ai'>('2p');
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [gameOver, setGameOver] = useState<string | null>(null);

  const keysPressed = useRef<{ [key: string]: boolean }>({});

  const stateRef = useRef({
    ships: [
      {
        x: 150,
        y: 250,
        vx: 0,
        vy: 0,
        angle: 0,
        color: '#00f0ff',
        glow: '#00f0ff',
        hp: 100,
        score: 0,
        cooldown: 0,
        shield: false,
        name: '1. OYUNCU (Mavi Avcı)'
      },
      {
        x: 650,
        y: 250,
        vx: 0,
        vy: 0,
        angle: Math.PI,
        color: '#ff007f',
        glow: '#ff007f',
        hp: 100,
        score: 0,
        cooldown: 0,
        shield: false,
        name: mode === '2p' ? '2. OYUNCU (Kırmızı Avcı)' : 'YAPAY ZEKA'
      }
    ] as [Ship, Ship],
    torpedoes: [] as Torpedo[],
    asteroids: [] as Asteroid[],
    particles: [] as { x: number; y: number; vx: number; vy: number; color: string; life: number; size: number }[],
    shake: 0
  });

  const resetShips = () => {
    const s = stateRef.current;
    s.ships[0].x = 150;
    s.ships[0].y = 250;
    s.ships[0].vx = 0;
    s.ships[0].vy = 0;
    s.ships[0].angle = 0;
    s.ships[0].hp = 100;

    s.ships[1].x = 650;
    s.ships[1].y = 250;
    s.ships[1].vx = 0;
    s.ships[1].vy = 0;
    s.ships[1].angle = Math.PI;
    s.ships[1].hp = 100;

    s.torpedoes = [];
  };

  const resetMatch = () => {
    setScores({ p1: 0, p2: 0 });
    setGameOver(null);
    stateRef.current.ships[0].score = 0;
    stateRef.current.ships[1].score = 0;
    resetShips();
  };

  useEffect(() => {
    // Generate some asteroids
    const asts: Asteroid[] = [];
    for (let i = 0; i < 5; i++) {
      asts.push({
        x: 300 + Math.random() * 200,
        y: 50 + Math.random() * 400,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: 18 + Math.random() * 14,
        rot: 0,
        vRot: (Math.random() - 0.5) * 0.03
      });
    }
    stateRef.current.asteroids = asts;
    resetMatch();
  }, [mode]);

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = true;
      if (['Space', 'Enter', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
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

  const shoot = (shipIdx: number) => {
    const ship = stateRef.current.ships[shipIdx];
    if (ship.cooldown > 0 || ship.hp <= 0) return;
    ship.cooldown = 12;
    sound.playLaser(shipIdx === 0 ? 800 : 650);

    stateRef.current.torpedoes.push({
      x: ship.x + Math.cos(ship.angle) * 20,
      y: ship.y + Math.sin(ship.angle) * 20,
      vx: ship.vx + Math.cos(ship.angle) * 9,
      vy: ship.vy + Math.sin(ship.angle) * 9,
      owner: shipIdx,
      color: ship.color,
      life: 80
    });
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

    const loop = () => {
      if (!gameOver) {
        const state = stateRef.current;
        const [p1, p2] = state.ships;

        // Player 1 (W, A, S, D, Space)
        if (p1.hp > 0) {
          if (keysPressed.current['KeyA']) p1.angle -= 0.07;
          if (keysPressed.current['KeyD']) p1.angle += 0.07;
          if (keysPressed.current['KeyW']) {
            p1.vx += Math.cos(p1.angle) * 0.22;
            p1.vy += Math.sin(p1.angle) * 0.22;
            // Thruster fire particles
            state.particles.push({
              x: p1.x - Math.cos(p1.angle) * 14,
              y: p1.y - Math.sin(p1.angle) * 14,
              vx: -Math.cos(p1.angle) * 3 + (Math.random() - 0.5),
              vy: -Math.sin(p1.angle) * 3 + (Math.random() - 0.5),
              color: '#00f0ff',
              life: 1,
              size: Math.random() * 3 + 2
            });
          }
          if (keysPressed.current['Space']) {
            shoot(0);
          }
        }

        // Player 2 (Arrows, Enter) or AI
        if (p2.hp > 0) {
          if (mode === '2p') {
            if (keysPressed.current['ArrowLeft']) p2.angle -= 0.07;
            if (keysPressed.current['ArrowRight']) p2.angle += 0.07;
            if (keysPressed.current['ArrowUp']) {
              p2.vx += Math.cos(p2.angle) * 0.22;
              p2.vy += Math.sin(p2.angle) * 0.22;
              state.particles.push({
                x: p2.x - Math.cos(p2.angle) * 14,
                y: p2.y - Math.sin(p2.angle) * 14,
                vx: -Math.cos(p2.angle) * 3 + (Math.random() - 0.5),
                vy: -Math.sin(p2.angle) * 3 + (Math.random() - 0.5),
                color: '#ff007f',
                life: 1,
                size: Math.random() * 3 + 2
              });
            }
            if (keysPressed.current['Enter'] || keysPressed.current['Numpad0']) {
              shoot(1);
            }
          } else {
            // AI
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const targetAngle = Math.atan2(dy, dx);
            let diff = targetAngle - p2.angle;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            p2.angle += Math.sign(diff) * Math.min(Math.abs(diff), 0.05);

            if (Math.hypot(dx, dy) > 220) {
              p2.vx += Math.cos(p2.angle) * 0.18;
              p2.vy += Math.sin(p2.angle) * 0.18;
            }
            if (Math.abs(diff) < 0.3 && Math.random() < 0.08) {
              shoot(1);
            }
          }
        }

        // Apply friction and move ships
        [p1, p2].forEach((s) => {
          s.vx *= 0.985;
          s.vy *= 0.985;
          s.x += s.vx;
          s.y += s.vy;
          if (s.cooldown > 0) s.cooldown--;

          // Screen Wrap
          if (s.x < 0) s.x = width;
          if (s.x > width) s.x = 0;
          if (s.y < 0) s.y = height;
          if (s.y > height) s.y = 0;
        });

        // Asteroids motion
        state.asteroids.forEach((ast) => {
          ast.x += ast.vx;
          ast.y += ast.vy;
          ast.rot += ast.vRot;
          if (ast.x < -30) ast.x = width + 30;
          if (ast.x > width + 30) ast.x = -30;
          if (ast.y < -30) ast.y = height + 30;
          if (ast.y > height + 30) ast.y = -30;
        });

        // Torpedoes
        for (let ti = state.torpedoes.length - 1; ti >= 0; ti--) {
          const t = state.torpedoes[ti];
          t.x += t.vx;
          t.y += t.vy;
          t.life--;

          // Screen Wrap
          if (t.x < 0) t.x = width;
          if (t.x > width) t.x = 0;
          if (t.y < 0) t.y = height;
          if (t.y > height) t.y = 0;

          // Hit opposing ship
          const target = state.ships[t.owner === 0 ? 1 : 0];
          if (target.hp > 0 && Math.hypot(t.x - target.x, t.y - target.y) < 22) {
            target.hp -= 20;
            sound.playExplosion();
            state.shake = 8;

            for (let p = 0; p < 20; p++) {
              state.particles.push({
                x: target.x,
                y: target.y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                color: target.color,
                life: 1,
                size: Math.random() * 3 + 2
              });
            }

            if (target.hp <= 0) {
              const winnerIdx = t.owner;
              state.ships[winnerIdx].score++;
              setScores({
                p1: state.ships[0].score,
                p2: state.ships[1].score
              });
              sound.playSuccess();

              if (state.ships[winnerIdx].score >= 3) {
                setGameOver(`${state.ships[winnerIdx].name} KAZANDI! 🏆`);
              } else {
                setTimeout(resetShips, 1500);
              }
            }

            state.torpedoes.splice(ti, 1);
            continue;
          }

          if (t.life <= 0) {
            state.torpedoes.splice(ti, 1);
          }
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
      ctx.save();
      if (stateRef.current.shake > 0) {
        ctx.translate((Math.random() - 0.5) * stateRef.current.shake, (Math.random() - 0.5) * stateRef.current.shake);
        stateRef.current.shake *= 0.88;
      }

      // Background
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);

      // Starfield
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 45; i++) {
        const sx = ((i * 187) % width);
        const sy = ((i * 341) % height);
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }

      // Draw Asteroids
      stateRef.current.asteroids.forEach((ast) => {
        ctx.save();
        ctx.translate(ast.x, ast.y);
        ctx.rotate(ast.rot);
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
          const r = ast.radius + Math.sin(a * 3) * 3;
          const px = Math.cos(a) * r;
          const py = Math.sin(a) * r;
          if (a === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      });

      // Draw Ships
      stateRef.current.ships.forEach((ship, idx) => {
        if (ship.hp <= 0) return;
        ctx.save();
        ctx.translate(ship.x, ship.y);
        ctx.rotate(ship.angle);

        ctx.fillStyle = ship.color;
        ctx.shadowColor = ship.glow;
        ctx.shadowBlur = 15;

        // Fighter shape
        ctx.beginPath();
        ctx.moveTo(18, 0);
        ctx.lineTo(-14, -12);
        ctx.lineTo(-8, 0);
        ctx.lineTo(-14, 12);
        ctx.closePath();
        ctx.fill();

        // Cockpit
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(2, 0, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Health bar
        const barW = 32;
        const barH = 4;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(ship.x - barW / 2, ship.y - 24, barW, barH);
        ctx.fillStyle = ship.hp > 35 ? ship.color : '#ef4444';
        ctx.fillRect(ship.x - barW / 2, ship.y - 24, (barW * Math.max(0, ship.hp)) / 100, barH);
      });

      // Torpedoes
      stateRef.current.torpedoes.forEach((t) => {
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = t.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(t.x, t.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Particles
      stateRef.current.particles.forEach((p) => {
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
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
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-lg">
            <Rocket className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-black text-lg text-white flex items-center gap-2">
              Galaxy Dogfight: 2 Kişilik Uzay Savaşı
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-bold uppercase">
                {mode === '2p' ? '2 Kişilik (Aynı PC)' : '1P vs AI'}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Aynı klavyede arkadaşınla uzay gemisi it dalaşı yap veya bota karşı savaş!
            </p>
          </div>
        </div>

        {/* Scores & Mode */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-sm">
            <span className="text-cyan-400 font-bold">P1: {scores.p1}</span>
            <span className="text-slate-600">:</span>
            <span className="text-pink-400 font-bold">{mode === '2p' ? 'P2' : 'BOT'}: {scores.p2}</span>
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
            <p className="text-sm text-slate-400 mt-2 font-mono">
              Skor: <span className="text-cyan-400 font-bold">{scores.p1}</span> - <span className="text-pink-400 font-bold">{scores.p2}</span>
            </p>
            <button
              onClick={() => {
                sound.playPowerUp();
                resetMatch();
              }}
              className="mt-6 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black rounded-2xl shadow-xl hover:from-amber-400 hover:to-amber-500 transition active:scale-95 text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Yeniden Savaş
            </button>
          </div>
        )}
      </div>

      {/* Controls Overlay Guide */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 text-xs">
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
            <span className="font-bold text-white font-heading">1. Oyuncu (Mavi Avcı)</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-slate-300">
            <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-cyan-300 font-bold">
              W / A / D
            </span>
            <span>İtici & Yön</span>
            <span className="text-slate-600">|</span>
            <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-cyan-300 font-bold">
              BOŞLUK
            </span>
            <span>Ateş</span>
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-pink-500 shadow-[0_0_8px_#ff007f]" />
            <span className="font-bold text-white font-heading">
              {mode === '2p' ? '2. Oyuncu (Kırmızı Avcı)' : 'Yapay Zeka (Oto)'}
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono text-slate-300">
            {mode === '2p' ? (
              <>
                <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-pink-300 font-bold">
                  Yön Tuşları
                </span>
                <span>İtici & Yön</span>
                <span className="text-slate-600">|</span>
                <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-pink-300 font-bold">
                  ENTER
                </span>
                <span>Ateş</span>
              </>
            ) : (
              <span className="text-slate-400">Yapay Zeka Otomatik Oynuyor</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
