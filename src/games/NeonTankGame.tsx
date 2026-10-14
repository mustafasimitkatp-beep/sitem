import React, { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Users, User, Shield, Zap, Sparkles, Trophy } from 'lucide-react';
import { sound } from '../utils/audio';

interface Tank {
  x: number;
  y: number;
  angle: number;
  speed: number;
  color: string;
  glow: string;
  health: number;
  maxHealth: number;
  score: number;
  cooldown: number;
  shield: boolean;
  tripleShot: boolean;
  tripleShotTimer: number;
  shieldTimer: number;
  name: string;
  isAi: boolean;
  trail: { x: number; y: number; angle: number; alpha: number }[];
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  ownerId: number;
  bounces: number;
  color: string;
  life: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
  maxLife: number;
  size: number;
}

interface PowerUp {
  x: number;
  y: number;
  type: 'shield' | 'triple' | 'heal';
  pulse: number;
}

interface Wall {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const NeonTankGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mode, setMode] = useState<'2p' | 'ai'>('2p');
  const [gameOver, setGameOver] = useState<string | null>(null);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [isPaused, setIsPaused] = useState(false);
  const [roundWinner, setRoundWinner] = useState<string | null>(null);

  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const shakeRef = useRef(0);

  // Match State Ref
  const stateRef = useRef<{
    tanks: [Tank, Tank];
    bullets: Bullet[];
    particles: Particle[];
    powerUps: PowerUp[];
    walls: Wall[];
    lastPowerUpTime: number;
  }>({
    tanks: [
      {
        x: 120,
        y: 250,
        angle: 0,
        speed: 0,
        color: '#00f0ff',
        glow: '#00f0ff',
        health: 100,
        maxHealth: 100,
        score: 0,
        cooldown: 0,
        shield: false,
        tripleShot: false,
        tripleShotTimer: 0,
        shieldTimer: 0,
        name: 'OYUNCU 1 (Cyan)',
        isAi: false,
        trail: []
      },
      {
        x: 680,
        y: 250,
        angle: Math.PI,
        speed: 0,
        color: '#ff007f',
        glow: '#ff007f',
        health: 100,
        maxHealth: 100,
        score: 0,
        cooldown: 0,
        shield: false,
        tripleShot: false,
        tripleShotTimer: 0,
        shieldTimer: 0,
        name: mode === '2p' ? 'OYUNCU 2 (Magenta)' : 'YAPAY ZEKA',
        isAi: mode === 'ai',
        trail: []
      }
    ],
    bullets: [],
    particles: [],
    powerUps: [],
    walls: [
      { x: 380, y: 150, w: 40, h: 200 },
      { x: 200, y: 80, w: 100, h: 20 },
      { x: 500, y: 80, w: 100, h: 20 },
      { x: 200, y: 400, w: 100, h: 20 },
      { x: 500, y: 400, w: 100, h: 20 }
    ],
    lastPowerUpTime: Date.now()
  });

  const resetRound = (keepScores = true) => {
    const s = stateRef.current;
    s.tanks[0].x = 120;
    s.tanks[0].y = 250;
    s.tanks[0].angle = 0;
    s.tanks[0].health = 100;
    s.tanks[0].shield = false;
    s.tanks[0].tripleShot = false;
    s.tanks[0].trail = [];

    s.tanks[1].x = 680;
    s.tanks[1].y = 250;
    s.tanks[1].angle = Math.PI;
    s.tanks[1].health = 100;
    s.tanks[1].shield = false;
    s.tanks[1].tripleShot = false;
    s.tanks[1].trail = [];
    s.tanks[1].name = mode === '2p' ? 'OYUNCU 2 (Magenta)' : 'YAPAY ZEKA';
    s.tanks[1].isAi = mode === 'ai';

    if (!keepScores) {
      s.tanks[0].score = 0;
      s.tanks[1].score = 0;
      setScores({ p1: 0, p2: 0 });
    }

    s.bullets = [];
    s.powerUps = [];
    s.lastPowerUpTime = Date.now();
    setRoundWinner(null);
    setGameOver(null);
  };

  useEffect(() => {
    resetRound(false);
  }, [mode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = true;
      // Prevent scrolling when using space or arrow keys in game
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const addExplosion = (x: number, y: number, color: string, count = 25) => {
    sound.playExplosion();
    shakeRef.current = 10;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 1;
      stateRef.current.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        life: 1,
        maxLife: Math.random() * 25 + 15,
        size: Math.random() * 3 + 2
      });
    }
  };

  const shoot = (tankIndex: number) => {
    const tank = stateRef.current.tanks[tankIndex];
    if (tank.cooldown > 0 || tank.health <= 0) return;

    sound.playLaser(tankIndex === 0 ? 700 : 550);
    tank.cooldown = 14;

    const spawnBullet = (offsetAngle: number) => {
      const finalAngle = tank.angle + offsetAngle;
      const barrelLen = 22;
      stateRef.current.bullets.push({
        x: tank.x + Math.cos(tank.angle) * barrelLen,
        y: tank.y + Math.sin(tank.angle) * barrelLen,
        vx: Math.cos(finalAngle) * 7.5,
        vy: Math.sin(finalAngle) * 7.5,
        ownerId: tankIndex,
        bounces: 0,
        color: tank.color,
        life: 200
      });
    };

    spawnBullet(0);
    if (tank.tripleShot) {
      spawnBullet(-0.25);
      spawnBullet(0.25);
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

    const checkWallCollision = (x: number, y: number, r: number) => {
      // Screen edges
      if (x - r < 10 || x + r > width - 10 || y - r < 10 || y + r > height - 10) return true;
      // Walls
      for (const w of stateRef.current.walls) {
        if (x + r > w.x && x - r < w.x + w.w && y + r > w.y && y - r < w.y + w.h) {
          return true;
        }
      }
      return false;
    };

    const loop = () => {
      if (!isPaused && !gameOver) {
        const state = stateRef.current;
        const [p1, p2] = state.tanks;

        // Player 1 Controls (W, A, S, D, Space)
        if (p1.health > 0) {
          if (keysPressed.current['KeyA']) p1.angle -= 0.055;
          if (keysPressed.current['KeyD']) p1.angle += 0.055;
          let move = 0;
          if (keysPressed.current['KeyW']) move = 3.2;
          if (keysPressed.current['KeyS']) move = -2.0;

          if (move !== 0) {
            const nextX = p1.x + Math.cos(p1.angle) * move;
            const nextY = p1.y + Math.sin(p1.angle) * move;
            if (!checkWallCollision(nextX, p1.y, 16)) p1.x = nextX;
            if (!checkWallCollision(p1.x, nextY, 16)) p1.y = nextY;

            // Leave tread trail
            if (Math.random() > 0.4) {
              p1.trail.push({ x: p1.x, y: p1.y, angle: p1.angle, alpha: 0.4 });
              if (p1.trail.length > 25) p1.trail.shift();
            }
          }

          if (keysPressed.current['Space']) {
            shoot(0);
          }
        }

        // Player 2 Controls (Arrows, Enter) or AI
        if (p2.health > 0) {
          if (p2.isAi) {
            // Smart AI
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const targetAngle = Math.atan2(dy, dx);
            let angleDiff = targetAngle - p2.angle;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;

            p2.angle += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), 0.045);

            // Move towards or circle
            const dist = Math.hypot(dx, dy);
            let move = dist > 200 ? 2.4 : dist < 120 ? -1.8 : 1.2;
            const nextX = p2.x + Math.cos(p2.angle) * move;
            const nextY = p2.y + Math.sin(p2.angle) * move;
            if (!checkWallCollision(nextX, p2.y, 16)) p2.x = nextX;
            if (!checkWallCollision(p2.x, nextY, 16)) p2.y = nextY;

            // Shoot when aiming at player
            if (Math.abs(angleDiff) < 0.25 && Math.random() < 0.08) {
              shoot(1);
            }
          } else {
            // Human Player 2
            if (keysPressed.current['ArrowLeft']) p2.angle -= 0.055;
            if (keysPressed.current['ArrowRight']) p2.angle += 0.055;
            let move = 0;
            if (keysPressed.current['ArrowUp']) move = 3.2;
            if (keysPressed.current['ArrowDown']) move = -2.0;

            if (move !== 0) {
              const nextX = p2.x + Math.cos(p2.angle) * move;
              const nextY = p2.y + Math.sin(p2.angle) * move;
              if (!checkWallCollision(nextX, p2.y, 16)) p2.x = nextX;
              if (!checkWallCollision(p2.x, nextY, 16)) p2.y = nextY;

              if (Math.random() > 0.4) {
                p2.trail.push({ x: p2.x, y: p2.y, angle: p2.angle, alpha: 0.4 });
                if (p2.trail.length > 25) p2.trail.shift();
              }
            }

            if (keysPressed.current['Enter'] || keysPressed.current['Numpad0']) {
              shoot(1);
            }
          }
        }

        // Update cooldowns & buff timers
        [p1, p2].forEach((t) => {
          if (t.cooldown > 0) t.cooldown--;
          if (t.tripleShotTimer > 0) {
            t.tripleShotTimer--;
            if (t.tripleShotTimer <= 0) t.tripleShot = false;
          }
          if (t.shieldTimer > 0) {
            t.shieldTimer--;
            if (t.shieldTimer <= 0) t.shield = false;
          }
          // Fade tread trails
          t.trail.forEach((tr) => (tr.alpha -= 0.007));
          t.trail = t.trail.filter((tr) => tr.alpha > 0);
        });

        // Spawn Power-Ups periodically
        if (Date.now() - state.lastPowerUpTime > 9000 && state.powerUps.length < 2) {
          state.lastPowerUpTime = Date.now();
          const types: ('shield' | 'triple' | 'heal')[] = ['shield', 'triple', 'heal'];
          const type = types[Math.floor(Math.random() * types.length)];
          const rx = 150 + Math.random() * 500;
          const ry = 100 + Math.random() * 300;
          if (!checkWallCollision(rx, ry, 25)) {
            state.powerUps.push({ x: rx, y: ry, type, pulse: 0 });
          }
        }

        // Update Bullets
        for (let i = state.bullets.length - 1; i >= 0; i--) {
          const b = state.bullets[i];
          b.x += b.vx;
          b.y += b.vy;
          b.life--;

          // Trail sparks
          if (Math.random() > 0.3) {
            state.particles.push({
              x: b.x,
              y: b.y,
              vx: (Math.random() - 0.5) * 1.5,
              vy: (Math.random() - 0.5) * 1.5,
              color: b.color,
              life: 1,
              maxLife: 8,
              size: 2
            });
          }

          // Wall bounce / collision
          let bounced = false;
          // Bounds
          if (b.x < 15 || b.x > width - 15) {
            b.vx = -b.vx;
            bounced = true;
          }
          if (b.y < 15 || b.y > height - 15) {
            b.vy = -b.vy;
            bounced = true;
          }
          // Walls
          for (const w of state.walls) {
            if (b.x > w.x && b.x < w.x + w.w && b.y > w.y && b.y < w.y + w.h) {
              // Simple bounce reflection
              b.vx = -b.vx;
              b.vy = -b.vy;
              bounced = true;
              break;
            }
          }

          if (bounced) {
            b.bounces++;
            sound.playBounce(500);
            if (b.bounces > 3 || b.life <= 0) {
              state.bullets.splice(i, 1);
              continue;
            }
          }

          // Hit Tanks
          for (let ti = 0; ti < 2; ti++) {
            const target = state.tanks[ti];
            if (target.health <= 0) continue;
            const dist = Math.hypot(b.x - target.x, b.y - target.y);
            if (dist < 18) {
              // If bullet hits own tank before bouncing, ignore
              if (b.ownerId === ti && b.bounces === 0) continue;

              if (target.shield) {
                target.shield = false;
                target.shieldTimer = 0;
                sound.playBounce(700);
                addExplosion(b.x, b.y, '#38bdf8', 12);
              } else {
                target.health -= 25;
                addExplosion(b.x, b.y, target.color, 18);

                if (target.health <= 0) {
                  const winnerIdx = ti === 0 ? 1 : 0;
                  state.tanks[winnerIdx].score++;
                  setScores({
                    p1: state.tanks[0].score,
                    p2: state.tanks[1].score
                  });
                  addExplosion(target.x, target.y, target.color, 45);
                  sound.playSuccess();

                  if (state.tanks[winnerIdx].score >= 3) {
                    setGameOver(`${state.tanks[winnerIdx].name} MAÇI KAZANDI! 🏆`);
                  } else {
                    setRoundWinner(`${state.tanks[winnerIdx].name} Raundu Aldı!`);
                    setTimeout(() => resetRound(true), 2000);
                  }
                }
              }
              state.bullets.splice(i, 1);
              break;
            }
          }
        }

        // Power-Up Pickup
        for (let pi = state.powerUps.length - 1; pi >= 0; pi--) {
          const pu = state.powerUps[pi];
          pu.pulse += 0.05;
          for (const t of state.tanks) {
            if (Math.hypot(t.x - pu.x, t.y - pu.y) < 26) {
              sound.playPowerUp();
              if (pu.type === 'shield') {
                t.shield = true;
                t.shieldTimer = 350;
              } else if (pu.type === 'triple') {
                t.tripleShot = true;
                t.tripleShotTimer = 400;
              } else if (pu.type === 'heal') {
                t.health = Math.min(100, t.health + 40);
              }
              addExplosion(pu.x, pu.y, '#eab308', 20);
              state.powerUps.splice(pi, 1);
              break;
            }
          }
        }

        // Update Particles
        for (let i = state.particles.length - 1; i >= 0; i--) {
          const p = state.particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 1 / p.maxLife;
          if (p.life <= 0) state.particles.splice(i, 1);
        }
      }

      // RENDER
      ctx.save();
      if (shakeRef.current > 0) {
        ctx.translate((Math.random() - 0.5) * shakeRef.current, (Math.random() - 0.5) * shakeRef.current);
        shakeRef.current *= 0.9;
      }

      // Background
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);

      // Neon Arena Grid
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Arena Outer Border
      ctx.strokeStyle = '#38bdf8';
      ctx.shadowColor = '#0284c7';
      ctx.shadowBlur = 10;
      ctx.lineWidth = 3;
      ctx.strokeRect(10, 10, width - 20, height - 20);
      ctx.shadowBlur = 0;

      // Obstacles / Walls
      stateRef.current.walls.forEach((w) => {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(w.x, w.y, w.w, w.h);
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#a855f7';
        ctx.shadowBlur = 8;
        ctx.strokeRect(w.x, w.y, w.w, w.h);
        ctx.shadowBlur = 0;
      });

      // Render Tread Trails
      stateRef.current.tanks.forEach((tank) => {
        tank.trail.forEach((tr) => {
          ctx.save();
          ctx.translate(tr.x, tr.y);
          ctx.rotate(tr.angle);
          ctx.fillStyle = `rgba(148, 163, 184, ${tr.alpha * 0.4})`;
          ctx.fillRect(-12, -10, 24, 4);
          ctx.fillRect(-12, 6, 24, 4);
          ctx.restore();
        });
      });

      // Render Power-Ups
      stateRef.current.powerUps.forEach((pu) => {
        ctx.save();
        ctx.translate(pu.x, pu.y);
        const scale = 1 + Math.sin(pu.pulse) * 0.15;
        ctx.scale(scale, scale);

        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = pu.type === 'shield' ? '#38bdf8' : pu.type === 'triple' ? '#f59e0b' : '#10b981';
        ctx.lineWidth = 2;
        ctx.shadowColor = ctx.strokeStyle;
        ctx.shadowBlur = 12;
        ctx.stroke();

        ctx.fillStyle = ctx.strokeStyle;
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(pu.type === 'shield' ? '🛡️' : pu.type === 'triple' ? '⚡' : '💚', 0, 1);
        ctx.restore();
      });

      // Render Tanks
      stateRef.current.tanks.forEach((tank, idx) => {
        if (tank.health <= 0) return;

        ctx.save();
        ctx.translate(tank.x, tank.y);
        ctx.rotate(tank.angle);

        // Shield Bubble
        if (tank.shield) {
          ctx.strokeStyle = '#38bdf8';
          ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
          ctx.lineWidth = 2;
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.arc(0, 0, 24, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // Treads
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-14, -13, 28, 6);
        ctx.fillRect(-14, 7, 28, 6);

        // Body
        ctx.fillStyle = tank.color;
        ctx.shadowColor = tank.glow;
        ctx.shadowBlur = 12;
        ctx.fillRect(-12, -8, 24, 16);

        // Turret Center
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, 7, 0, Math.PI * 2);
        ctx.fill();

        // Barrel
        ctx.fillStyle = tank.color;
        ctx.fillRect(0, -3, 20, 6);

        ctx.restore();

        // Health bar above tank
        const barW = 34;
        const barH = 5;
        const barX = tank.x - barW / 2;
        const barY = tank.y - 28;

        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(barX, barY, barW, barH);
        ctx.fillStyle = tank.health > 40 ? tank.color : '#ef4444';
        ctx.fillRect(barX, barY, (barW * Math.max(0, tank.health)) / 100, barH);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barW, barH);

        // Player Tag
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(idx === 0 ? 'P1' : mode === '2p' ? 'P2' : 'BOT', tank.x, tank.y - 33);
      });

      // Render Bullets
      stateRef.current.bullets.forEach((b) => {
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(b.x, b.y, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = b.color;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      });

      // Render Particles
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

      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, gameOver, mode]);

  return (
    <div className="flex flex-col items-center bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl overflow-hidden relative">
      {/* Top Header Bar */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-lg">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-black text-lg text-white flex items-center gap-2">
              Neon Tank 1v1: Siber Düello
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-pink-500/20 text-pink-400 border border-pink-500/40 font-bold uppercase">
                {mode === '2p' ? '2 Kişilik (Aynı PC)' : '1P vs Yapay Zeka'}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Aynı klavyede yan yana savaşın veya bota karşı reflekslerinizi test edin!
            </p>
          </div>
        </div>

        {/* Score & Mode Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-sm">
            <span className="text-cyan-400 font-bold">P1: {scores.p1}</span>
            <span className="text-slate-600">:</span>
            <span className="text-pink-400 font-bold">
              {mode === '2p' ? 'P2' : 'BOT'}: {scores.p2}
            </span>
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
              2 Kişi (Aynı PC)
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
              Yapay Zekaya Karşı
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas Container */}
      <div className="relative mt-4 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner flex items-center justify-center max-w-full">
        <canvas ref={canvasRef} className="block max-w-full h-auto" />

        {/* Round Winner Overlay */}
        {roundWinner && !gameOver && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 animate-in fade-in">
            <Sparkles className="w-12 h-12 text-amber-400 animate-bounce mb-2" />
            <div className="text-2xl font-black font-heading text-white">{roundWinner}</div>
            <p className="text-xs text-slate-400 mt-1">Sonraki raunt başlıyor...</p>
          </div>
        )}

        {/* Game Over Modal */}
        {gameOver && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 z-20">
            <Trophy className="w-16 h-16 text-amber-400 mb-3 animate-pulse" />
            <h2 className="text-3xl font-black font-heading text-white">{gameOver}</h2>
            <p className="text-sm text-slate-400 mt-2">
              Skor: <span className="text-cyan-400 font-bold">{scores.p1}</span> -{' '}
              <span className="text-pink-400 font-bold">{scores.p2}</span>
            </p>
            <button
              onClick={() => {
                sound.playPowerUp();
                resetRound(false);
              }}
              className="mt-6 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black rounded-2xl shadow-xl hover:from-amber-400 hover:to-amber-500 transition active:scale-95 text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Yeniden Maç Yap
            </button>
          </div>
        )}
      </div>

      {/* Controls Overlay Guide */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 text-xs">
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
            <span className="font-bold text-white font-heading">1. Oyuncu (Mavi)</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-slate-300">
            <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-cyan-300 font-bold">
              W, A, S, D
            </span>
            <span>Sürüş</span>
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
              {mode === '2p' ? '2. Oyuncu (Pembe)' : 'Yapay Zeka (Oto)'}
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono text-slate-300">
            {mode === '2p' ? (
              <>
                <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-pink-300 font-bold">
                  Yön Tuşları
                </span>
                <span>Sürüş</span>
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
