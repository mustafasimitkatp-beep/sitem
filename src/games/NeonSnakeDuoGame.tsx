import React, { useEffect, useRef, useState } from 'react';
import { Trophy, RotateCcw, Users, User, Zap, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';

interface Point {
  x: number;
  y: number;
}

interface Snake {
  body: Point[];
  dir: Point;
  nextDir: Point;
  color: string;
  glow: string;
  score: number;
  dead: boolean;
  name: string;
  boost: boolean;
}

export const NeonSnakeDuoGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mode, setMode] = useState<'2p' | 'ai'>('2p');
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [gameOver, setGameOver] = useState<string | null>(null);

  const keysPressed = useRef<{ [key: string]: boolean }>({});

  const stateRef = useRef({
    gridSize: 20,
    cols: 40,
    rows: 25,
    p1: {
      body: [{ x: 8, y: 12 }, { x: 7, y: 12 }, { x: 6, y: 12 }],
      dir: { x: 1, y: 0 },
      nextDir: { x: 1, y: 0 },
      color: '#00f0ff',
      glow: '#00f0ff',
      score: 0,
      dead: false,
      name: '1. OYUNCU (Cyan Yılan)',
      boost: false
    } as Snake,
    p2: {
      body: [{ x: 31, y: 12 }, { x: 32, y: 12 }, { x: 33, y: 12 }],
      dir: { x: -1, y: 0 },
      nextDir: { x: -1, y: 0 },
      color: '#ff007f',
      glow: '#ff007f',
      score: 0,
      dead: false,
      name: mode === '2p' ? '2. OYUNCU (Pembe Yılan)' : 'YAPAY ZEKA',
      boost: false
    } as Snake,
    food: { x: 20, y: 12 } as Point,
    particles: [] as { x: number; y: number; vx: number; vy: number; color: string; life: number }[]
  });

  const spawnFood = () => {
    const s = stateRef.current;
    s.food = {
      x: Math.floor(Math.random() * (s.cols - 4)) + 2,
      y: Math.floor(Math.random() * (s.rows - 4)) + 2
    };
  };

  const resetRound = (keepScores = true) => {
    const s = stateRef.current;
    s.p1.body = [{ x: 8, y: 12 }, { x: 7, y: 12 }, { x: 6, y: 12 }];
    s.p1.dir = { x: 1, y: 0 };
    s.p1.nextDir = { x: 1, y: 0 };
    s.p1.dead = false;

    s.p2.body = [{ x: 31, y: 12 }, { x: 32, y: 12 }, { x: 33, y: 12 }];
    s.p2.dir = { x: -1, y: 0 };
    s.p2.nextDir = { x: -1, y: 0 };
    s.p2.dead = false;

    spawnFood();
    setGameOver(null);

    if (!keepScores) {
      s.p1.score = 0;
      s.p2.score = 0;
      setScores({ p1: 0, p2: 0 });
    }
  };

  useEffect(() => {
    resetRound(false);
  }, [mode]);

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = true;
      const s = stateRef.current;

      // P1 controls
      if (e.code === 'KeyW' && s.p1.dir.y === 0) s.p1.nextDir = { x: 0, y: -1 };
      if (e.code === 'KeyS' && s.p1.dir.y === 0) s.p1.nextDir = { x: 0, y: 1 };
      if (e.code === 'KeyA' && s.p1.dir.x === 0) s.p1.nextDir = { x: -1, y: 0 };
      if (e.code === 'KeyD' && s.p1.dir.x === 0) s.p1.nextDir = { x: 1, y: 0 };

      // P2 controls
      if (mode === '2p') {
        if (e.code === 'ArrowUp' && s.p2.dir.y === 0) s.p2.nextDir = { x: 0, y: -1 };
        if (e.code === 'ArrowDown' && s.p2.dir.y === 0) s.p2.nextDir = { x: 0, y: 1 };
        if (e.code === 'ArrowLeft' && s.p2.dir.x === 0) s.p2.nextDir = { x: -1, y: 0 };
        if (e.code === 'ArrowRight' && s.p2.dir.x === 0) s.p2.nextDir = { x: 1, y: 0 };
      }

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
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
  }, [mode]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const tick = () => {
      if (gameOver) return;
      const s = stateRef.current;
      const { p1, p2, cols, rows, food } = s;

      // AI Logic for P2
      if (mode === 'ai') {
        const head = p2.body[0];
        const dx = food.x - head.x;
        const dy = food.y - head.y;

        if (Math.abs(dx) > Math.abs(dy)) {
          if (dx > 0 && p2.dir.x !== -1) p2.nextDir = { x: 1, y: 0 };
          else if (dx < 0 && p2.dir.x !== 1) p2.nextDir = { x: -1, y: 0 };
        } else {
          if (dy > 0 && p2.dir.y !== -1) p2.nextDir = { x: 0, y: 1 };
          else if (dy < 0 && p2.dir.y !== 1) p2.nextDir = { x: 0, y: -1 };
        }
      }

      // Apply next direction
      p1.dir = p1.nextDir;
      p2.dir = p2.nextDir;

      // Move P1
      const p1Head = { x: p1.body[0].x + p1.dir.x, y: p1.body[0].y + p1.dir.y };
      const p2Head = { x: p2.body[0].x + p2.dir.x, y: p2.body[0].y + p2.dir.y };

      // Wall collision check
      if (p1Head.x < 0 || p1Head.x >= cols || p1Head.y < 0 || p1Head.y >= rows) p1.dead = true;
      if (p2Head.x < 0 || p2Head.x >= cols || p2Head.y < 0 || p2Head.y >= rows) p2.dead = true;

      // Self & Cross collision check
      p1.body.forEach((seg) => {
        if (p1Head.x === seg.x && p1Head.y === seg.y) p1.dead = true;
        if (p2Head.x === seg.x && p2Head.y === seg.y) p2.dead = true;
      });
      p2.body.forEach((seg) => {
        if (p1Head.x === seg.x && p1Head.y === seg.y) p1.dead = true;
        if (p2Head.x === seg.x && p2Head.y === seg.y) p2.dead = true;
      });

      // Handle Death
      if (p1.dead || p2.dead) {
        sound.playExplosion();
        if (p1.dead && !p2.dead) p2.score++;
        else if (p2.dead && !p1.dead) p1.score++;

        setScores({ p1: p1.score, p2: p2.score });

        if (p1.score >= 3 || p2.score >= 3) {
          const winner = p1.score >= 3 ? p1.name : p2.name;
          setGameOver(`${winner} ŞAMPİYON! 🏆`);
        } else {
          setTimeout(() => resetRound(true), 1200);
        }
        return;
      }

      // Advance heads
      p1.body.unshift(p1Head);
      p2.body.unshift(p2Head);

      // Eat Food check
      let foodEaten = false;
      if (p1Head.x === food.x && p1Head.y === food.y) {
        sound.playCoin();
        foodEaten = true;
      } else {
        p1.body.pop();
      }

      if (p2Head.x === food.x && p2Head.y === food.y) {
        sound.playCoin();
        foodEaten = true;
      } else {
        p2.body.pop();
      }

      if (foodEaten) spawnFood();

      // Render on canvas
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const sz = s.gridSize;
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, 800, 500);

      // Grid
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.3)';
      ctx.lineWidth = 1;
      for (let x = 0; x < 800; x += sz) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 500);
        ctx.stroke();
      }
      for (let y = 0; y < 500; y += sz) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(800, y);
        ctx.stroke();
      }

      // Food
      ctx.save();
      ctx.fillStyle = '#f59e0b';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(food.x * sz + sz / 2, food.y * sz + sz / 2, sz / 2 - 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Draw Snakes
      [p1, p2].forEach((snk) => {
        snk.body.forEach((seg, i) => {
          ctx.save();
          ctx.fillStyle = i === 0 ? '#ffffff' : snk.color;
          ctx.shadowColor = snk.glow;
          ctx.shadowBlur = i === 0 ? 14 : 8;
          ctx.fillRect(seg.x * sz + 1, seg.y * sz + 1, sz - 2, sz - 2);
          ctx.restore();
        });
      });
    };

    interval = setInterval(tick, 90);
    return () => clearInterval(interval);
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
              Tron Yılan Düellosu 1v1
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-bold uppercase">
                {mode === '2p' ? '1 PC / 2 Kişi' : '1P vs Yapay Zeka'}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Işık izleriyle rakibinizi sıkıştırın, yıldızları yiyin ve 3 raund kazanın!
            </p>
          </div>
        </div>

        {/* Scores & Mode */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-sm">
            <span className="text-cyan-400 font-black">{scores.p1}</span>
            <span className="text-slate-600">:</span>
            <span className="text-pink-400 font-black">{scores.p2}</span>
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
        <canvas ref={canvasRef} width={800} height={500} className="block max-w-full h-auto" />

        {gameOver && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 z-20">
            <Trophy className="w-16 h-16 text-amber-400 mb-3 animate-pulse" />
            <h2 className="text-3xl font-black font-heading text-white">{gameOver}</h2>
            <button
              onClick={() => {
                sound.playPowerUp();
                resetRound(false);
              }}
              className="mt-6 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-amber-500 text-slate-950 font-black rounded-2xl shadow-xl hover:from-cyan-400 hover:to-amber-400 transition active:scale-95 text-sm"
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
            <span className="font-bold text-white font-heading">1. Oyuncu (Cyan)</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-slate-300">
            <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-cyan-300 font-bold">
              W, A, S, D
            </span>
            <span>Yönlendir</span>
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
                Yön Tuşları
              </span>
            ) : (
              <span className="text-slate-400">Yapay Zeka Otomatik Oynuyor</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
