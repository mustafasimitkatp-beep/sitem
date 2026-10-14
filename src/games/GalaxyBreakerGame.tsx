import React, { useEffect, useRef, useState } from 'react';
import { Disc3, Trophy, RotateCcw, Zap, Sparkles, Shield } from 'lucide-react';
import { sound } from '../utils/audio';

interface Brick {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  glow: string;
  hp: number;
  maxHp: number;
}

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  trail: { x: number; y: number; alpha: number }[];
}

interface Capsule {
  x: number;
  y: number;
  vy: number;
  type: 'multi' | 'laser' | 'wide' | 'shield';
}

interface Shard {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
  size: number;
}

export const GalaxyBreakerGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState<string | null>(null);
  const [level, setLevel] = useState(1);

  const keysPressed = useRef<{ [key: string]: boolean }>({});

  const stateRef = useRef({
    paddle: { x: 350, y: 460, w: 100, h: 14, color: '#38bdf8', wideTimer: 0, laserTimer: 0, shield: false },
    balls: [] as Ball[],
    bricks: [] as Brick[],
    capsules: [] as Capsule[],
    shards: [] as Shard[],
    shake: 0,
    score: 0,
    lives: 3
  });

  const initLevel = () => {
    const bricks: Brick[] = [];
    const colors = [
      { c: '#f43f5e', g: '#e11d48' },
      { c: '#f59e0b', g: '#d97706' },
      { c: '#10b981', g: '#059669' },
      { c: '#06b6d4', g: '#0891b2' },
      { c: '#a855f7', g: '#9333ea' }
    ];

    const rows = 5;
    const cols = 9;
    const bW = 72;
    const bH = 22;
    const startX = 64;
    const startY = 60;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        bricks.push({
          x: startX + c * (bW + 8),
          y: startY + r * (bH + 8),
          w: bW,
          h: bH,
          color: colors[r].c,
          glow: colors[r].g,
          hp: r === 0 ? 2 : 1,
          maxHp: r === 0 ? 2 : 1
        });
      }
    }

    stateRef.current.bricks = bricks;
    stateRef.current.balls = [
      {
        x: 400,
        y: 430,
        vx: 4.5 * (Math.random() > 0.5 ? 1 : -1),
        vy: -5.5,
        radius: 7,
        trail: []
      }
    ];
    stateRef.current.capsules = [];
    stateRef.current.shards = [];
  };

  const resetGame = () => {
    stateRef.current.score = 0;
    stateRef.current.lives = 3;
    setScore(0);
    setLives(3);
    setGameOver(null);
    initLevel();
  };

  useEffect(() => {
    initLevel();
  }, []);

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = true;
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

  const addShards = (x: number, y: number, color: string, count = 16) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 1;
      stateRef.current.shards.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
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

    const loop = () => {
      if (!gameOver) {
        const state = stateRef.current;
        const { paddle, balls } = state;

        // Paddle Movement
        const pSpeed = 8;
        if (keysPressed.current['ArrowLeft'] || keysPressed.current['KeyA']) paddle.x -= pSpeed;
        if (keysPressed.current['ArrowRight'] || keysPressed.current['KeyD']) paddle.x += pSpeed;

        paddle.w = paddle.wideTimer > 0 ? 150 : 100;
        if (paddle.wideTimer > 0) paddle.wideTimer--;

        paddle.x = Math.max(10, Math.min(width - paddle.w - 10, paddle.x));

        // Update Balls
        for (let bi = balls.length - 1; bi >= 0; bi--) {
          const ball = balls[bi];
          ball.x += ball.vx;
          ball.y += ball.vy;

          // Trail
          ball.trail.push({ x: ball.x, y: ball.y, alpha: 0.6 });
          if (ball.trail.length > 10) ball.trail.shift();
          ball.trail.forEach((t) => (t.alpha -= 0.05));

          // Wall bounces
          if (ball.x - ball.radius < 10) {
            ball.x = 10 + ball.radius;
            ball.vx = -ball.vx;
            sound.playBounce(550);
          }
          if (ball.x + ball.radius > width - 10) {
            ball.x = width - 10 - ball.radius;
            ball.vx = -ball.vx;
            sound.playBounce(550);
          }
          if (ball.y - ball.radius < 10) {
            ball.y = 10 + ball.radius;
            ball.vy = -ball.vy;
            sound.playBounce(550);
          }

          // Paddle collision
          if (
            ball.y + ball.radius >= paddle.y &&
            ball.y - ball.radius <= paddle.y + paddle.h &&
            ball.x >= paddle.x &&
            ball.x <= paddle.x + paddle.w &&
            ball.vy > 0
          ) {
            // Angle deflection based on hit position
            const hitOffset = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
            const speed = Math.hypot(ball.vx, ball.vy);
            const maxAngle = Math.PI * 0.4;
            const angle = hitOffset * maxAngle - Math.PI / 2;

            ball.vx = Math.cos(angle) * speed;
            ball.vy = Math.sin(angle) * speed;
            ball.y = paddle.y - ball.radius;

            sound.playBounce(700);
            addShards(ball.x, ball.y, '#38bdf8', 6);
          }

          // Brick collisions
          for (let bri = state.bricks.length - 1; bri >= 0; bri--) {
            const br = state.bricks[bri];
            if (
              ball.x + ball.radius > br.x &&
              ball.x - ball.radius < br.x + br.w &&
              ball.y + ball.radius > br.y &&
              ball.y - ball.radius < br.y + br.h
            ) {
              // Simple reflection
              ball.vy = -ball.vy;
              br.hp--;
              sound.playLaser(900);
              addShards(ball.x, ball.y, br.color, 12);
              state.shake = 5;

              if (br.hp <= 0) {
                state.score += 100;
                setScore(state.score);
                // Drop powerup
                if (Math.random() < 0.25) {
                  const types: ('multi' | 'wide' | 'shield')[] = ['multi', 'wide', 'shield'];
                  state.capsules.push({
                    x: br.x + br.w / 2,
                    y: br.y + br.h,
                    vy: 2.2,
                    type: types[Math.floor(Math.random() * types.length)]
                  });
                }
                state.bricks.splice(bri, 1);
              }
              break;
            }
          }

          // Ball falls below screen
          if (ball.y > height + 20) {
            balls.splice(bi, 1);
          }
        }

        // Check if all balls lost
        if (balls.length === 0) {
          state.lives--;
          setLives(state.lives);
          sound.playExplosion();

          if (state.lives <= 0) {
            setGameOver('OYUN BİTTİ! KOZMİK ENERJİ TÜKENDİ');
          } else {
            // Respawn ball
            balls.push({
              x: 400,
              y: 430,
              vx: 4.5 * (Math.random() > 0.5 ? 1 : -1),
              vy: -5.5,
              radius: 7,
              trail: []
            });
          }
        }

        // Check Victory
        if (state.bricks.length === 0) {
          sound.playSuccess();
          setGameOver('TEBRİKLER! TÜM KRİSTALLERİ YOK ETTİNİZ 🏆');
        }

        // Update Capsules
        for (let ci = state.capsules.length - 1; ci >= 0; ci--) {
          const cap = state.capsules[ci];
          cap.y += cap.vy;

          // Catch with paddle
          if (
            cap.y >= paddle.y &&
            cap.y <= paddle.y + paddle.h &&
            cap.x >= paddle.x &&
            cap.x <= paddle.x + paddle.w
          ) {
            sound.playPowerUp();
            if (cap.type === 'multi') {
              // Spawn 2 extra balls
              if (balls.length > 0) {
                const b = balls[0];
                balls.push({ x: b.x, y: b.y, vx: -b.vx, vy: b.vy, radius: 7, trail: [] });
                balls.push({ x: b.x, y: b.y, vx: b.vy, vy: -b.vx, radius: 7, trail: [] });
              }
            } else if (cap.type === 'wide') {
              paddle.wideTimer = 450;
            } else if (cap.type === 'shield') {
              state.lives = Math.min(5, state.lives + 1);
              setLives(state.lives);
            }
            state.capsules.splice(ci, 1);
          } else if (cap.y > height + 20) {
            state.capsules.splice(ci, 1);
          }
        }

        // Update Shards
        for (let i = state.shards.length - 1; i >= 0; i--) {
          const s = state.shards[i];
          s.x += s.vx;
          s.y += s.vy;
          s.life -= 0.035;
          if (s.life <= 0) state.shards.splice(i, 1);
        }
      }

      // RENDER
      ctx.save();
      if (stateRef.current.shake > 0) {
        ctx.translate((Math.random() - 0.5) * stateRef.current.shake, (Math.random() - 0.5) * stateRef.current.shake);
        stateRef.current.shake *= 0.88;
      }

      // Cosmic Deep Space
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, width, height);

      // Starfield dots
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 40; i++) {
        const sx = ((i * 137) % width);
        const sy = ((i * 263) % height);
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }

      // Nebula glow
      const nebGrad = ctx.createRadialGradient(400, 150, 20, 400, 150, 300);
      nebGrad.addColorStop(0, 'rgba(168, 85, 247, 0.15)');
      nebGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = nebGrad;
      ctx.fillRect(0, 0, width, height);

      // Outer border
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2;
      ctx.strokeRect(10, 10, width - 20, height - 20);

      // Draw Bricks
      stateRef.current.bricks.forEach((br) => {
        ctx.save();
        ctx.fillStyle = br.color;
        ctx.shadowColor = br.glow;
        ctx.shadowBlur = 10;
        ctx.fillRect(br.x, br.y, br.w, br.h);

        // Highlight line
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillRect(br.x + 2, br.y + 2, br.w - 4, 3);
        ctx.restore();
      });

      // Draw Capsules
      stateRef.current.capsules.forEach((cap) => {
        ctx.save();
        ctx.fillStyle = cap.type === 'multi' ? '#f43f5e' : cap.type === 'wide' ? '#06b6d4' : '#10b981';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(cap.x, cap.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(cap.type === 'multi' ? '3x' : cap.type === 'wide' ? 'W' : '+1', cap.x, cap.y);
        ctx.restore();
      });

      // Draw Paddle
      const { paddle } = stateRef.current;
      ctx.save();
      ctx.fillStyle = paddle.color;
      ctx.shadowColor = paddle.color;
      ctx.shadowBlur = 14;
      ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(paddle.x + paddle.w / 2 - 12, paddle.y + 2, 24, paddle.h - 4);
      ctx.restore();

      // Draw Balls & Trails
      stateRef.current.balls.forEach((ball) => {
        // Trail
        ball.trail.forEach((t) => {
          ctx.fillStyle = `rgba(236, 72, 153, ${t.alpha * 0.4})`;
          ctx.beginPath();
          ctx.arc(t.x, t.y, ball.radius * 0.8, 0, Math.PI * 2);
          ctx.fill();
        });

        // Ball
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ec4899';
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      });

      // Draw Shards
      stateRef.current.shards.forEach((s) => {
        ctx.save();
        ctx.fillStyle = s.color;
        ctx.globalAlpha = s.life;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameOver]);

  return (
    <div className="flex flex-col items-center bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl overflow-hidden relative">
      {/* Top Header */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-lg">
            <Disc3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-black text-lg text-white flex items-center gap-2">
              Galaksi Tuğla Kırıcı: Cosmic Nova
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/40 font-bold uppercase">
                Kozmik Parçacık
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Plazma toplarıyla kristalleri parçalayın, güç kapsüllerini yakalayın!
            </p>
          </div>
        </div>

        {/* Score & Lives */}
        <div className="flex items-center gap-3 font-mono text-sm">
          <div className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-amber-400 font-bold flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Skor: {score}</span>
          </div>

          <div className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-rose-400 font-bold flex items-center gap-1">
            <span>Can: {'❤️'.repeat(lives)}</span>
          </div>
        </div>
      </div>

      {/* Main Canvas */}
      <div
        className="relative mt-4 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner flex items-center justify-center max-w-full cursor-none"
        onMouseMove={(e) => {
          const rect = canvasRef.current?.getBoundingClientRect();
          if (!rect) return;
          const mouseX = ((e.clientX - rect.left) / rect.width) * 800;
          stateRef.current.paddle.x = mouseX - stateRef.current.paddle.w / 2;
        }}
      >
        <canvas ref={canvasRef} className="block max-w-full h-auto" />

        {/* Game Over Screen */}
        {gameOver && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 z-20 cursor-default">
            <Trophy className="w-16 h-16 text-amber-400 mb-3 animate-pulse" />
            <h2 className="text-2xl sm:text-3xl font-black font-heading text-white">{gameOver}</h2>
            <p className="text-sm text-slate-300 mt-2 font-mono">
              Toplam Skorunuz: <span className="text-amber-400 font-bold text-lg">{score}</span>
            </p>
            <button
              onClick={() => {
                sound.playPowerUp();
                resetGame();
              }}
              className="mt-6 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-amber-500 text-slate-950 font-black rounded-2xl shadow-xl hover:from-purple-400 hover:to-amber-400 transition active:scale-95 text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Yeniden Başlat
            </button>
          </div>
        )}
      </div>

      {/* Controls Guide */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 mt-5 text-xs bg-slate-950 border border-slate-800 rounded-2xl p-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-mono text-slate-300">
            <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-cyan-300 font-bold">
              FARE / DOKUNMATİK
            </span>
            <span>Uzay Raketini Yönet</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-slate-300">
            <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-pink-300 font-bold">
              A / D veya SOL / SAĞ OK
            </span>
            <span>Alternatif Klavye Kontrolü</span>
          </div>
        </div>

        <div className="text-slate-400 text-[11px] font-mono">
          Bonuslar: 3x Çoklu Top | W Geniş Raket | +1 Ekstra Can
        </div>
      </div>
    </div>
  );
};
