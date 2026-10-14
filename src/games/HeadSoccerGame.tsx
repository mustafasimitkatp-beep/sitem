import React, { useEffect, useRef, useState } from 'react';
import { Trophy, RotateCcw, Users, User, Flame, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';

interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  grounded: boolean;
  score: number;
  color: string;
  shoeColor: string;
  name: string;
  superEnergy: number;
  facing: number; // 1 = right, -1 = left
  kickAngle: number;
  kickActive: boolean;
}

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  rot: number;
  isSuper: boolean;
  trail: { x: number; y: number; alpha: number; color: string }[];
}

export const HeadSoccerGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mode, setMode] = useState<'2p' | 'ai'>('2p');
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [matchTime, setMatchTime] = useState(60);
  const [goalText, setGoalText] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState<string | null>(null);

  const keysPressed = useRef<{ [key: string]: boolean }>({});

  const stateRef = useRef({
    p1: {
      x: 180,
      y: 380,
      vx: 0,
      vy: 0,
      grounded: true,
      score: 0,
      color: '#06b6d4',
      shoeColor: '#f59e0b',
      name: '1. OYUNCU (Mavi)',
      superEnergy: 100,
      facing: 1,
      kickAngle: 0,
      kickActive: false
    } as Player,
    p2: {
      x: 620,
      y: 380,
      vx: 0,
      vy: 0,
      grounded: true,
      score: 0,
      color: '#ef4444',
      shoeColor: '#38bdf8',
      name: mode === '2p' ? '2. OYUNCU (Kırmızı)' : 'YAPAY ZEKA',
      superEnergy: 100,
      facing: -1,
      kickAngle: 0,
      kickActive: false
    } as Player,
    ball: {
      x: 400,
      y: 200,
      vx: 0,
      vy: 2,
      radius: 16,
      rot: 0,
      isSuper: false,
      trail: []
    } as Ball,
    confetti: [] as { x: number; y: number; vx: number; vy: number; color: string; life: number; size: number }[],
    shake: 0,
    groundY: 410,
    goalW: 85,
    goalH: 155,
    frozenUntil: 0
  });

  const resetAfterGoal = (winner: string) => {
    sound.playSuccess();
    setGoalText(winner);
    stateRef.current.shake = 15;
    stateRef.current.frozenUntil = Date.now() + 1800;

    // Confetti explosion
    const colors = ['#f59e0b', '#06b6d4', '#ef4444', '#10b981', '#a855f7'];
    for (let i = 0; i < 60; i++) {
      stateRef.current.confetti.push({
        x: 400,
        y: 200,
        vx: (Math.random() - 0.5) * 12,
        vy: -Math.random() * 10 - 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
        size: Math.random() * 5 + 3
      });
    }

    setTimeout(() => {
      setGoalText(null);
      const s = stateRef.current;
      s.p1.x = 180;
      s.p1.y = s.groundY - 30;
      s.p1.vx = 0;
      s.p1.vy = 0;

      s.p2.x = 620;
      s.p2.y = s.groundY - 30;
      s.p2.vx = 0;
      s.p2.vy = 0;

      s.ball.x = 400;
      s.ball.y = 180;
      s.ball.vx = (Math.random() - 0.5) * 2;
      s.ball.vy = -3;
      s.ball.isSuper = false;
      s.ball.trail = [];
    }, 1800);
  };

  const resetMatch = () => {
    stateRef.current.p1.score = 0;
    stateRef.current.p2.score = 0;
    setScores({ p1: 0, p2: 0 });
    setMatchTime(60);
    setGameOver(null);
    setGoalText(null);
    stateRef.current.p1.x = 180;
    stateRef.current.p2.x = 620;
    stateRef.current.ball.x = 400;
    stateRef.current.ball.y = 200;
    stateRef.current.ball.vx = 0;
    stateRef.current.ball.vy = 2;
  };

  useEffect(() => {
    resetMatch();
  }, [mode]);

  // Match Timer
  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      setMatchTime((t) => {
        if (t <= 1) {
          clearInterval(interval);
          const p1s = stateRef.current.p1.score;
          const p2s = stateRef.current.p2.score;
          if (p1s > p2s) setGameOver('1. OYUNCU (Mavi) ŞAMPİYON! 🏆');
          else if (p2s > p1s) setGameOver(mode === '2p' ? '2. OYUNCU (Kırmızı) ŞAMPİYON! 🏆' : 'YAPAY ZEKA KAZANDI!');
          else setGameOver('BERABERLİK! DOSTLUK KAZANDI ⚽');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameOver, mode]);

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = true;
      if (['Space', 'Enter', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyS'].includes(e.code)) {
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
      const state = stateRef.current;
      const { p1, p2, ball, groundY, goalW, goalH } = state;

      if (!gameOver && Date.now() > state.frozenUntil) {
        // Player 1 Movement (A, D, W jump, S super, Space kick)
        const p1Speed = 4.8;
        if (keysPressed.current['KeyA']) p1.vx = -p1Speed;
        else if (keysPressed.current['KeyD']) p1.vx = p1Speed;
        else p1.vx *= 0.7;

        if (keysPressed.current['KeyW'] && p1.grounded) {
          p1.vy = -13.5;
          p1.grounded = false;
          sound.playBounce(450);
        }

        // P1 Kick
        p1.kickActive = !!keysPressed.current['Space'];
        if (keysPressed.current['KeyS'] && p1.superEnergy >= 100) {
          // Super Shot!
          p1.superEnergy = 0;
          p1.kickActive = true;
          sound.playPowerUp();
          if (Math.hypot(ball.x - p1.x, ball.y - p1.y) < 70) {
            ball.vx = 18;
            ball.vy = -6;
            ball.isSuper = true;
            sound.playLaser(950);
          }
        }

        // Player 2 Movement (Left, Right, Up jump, Down super, Enter kick)
        if (mode === '2p') {
          const p2Speed = 4.8;
          if (keysPressed.current['ArrowLeft']) p2.vx = -p2Speed;
          else if (keysPressed.current['ArrowRight']) p2.vx = p2Speed;
          else p2.vx *= 0.7;

          if (keysPressed.current['ArrowUp'] && p2.grounded) {
            p2.vy = -13.5;
            p2.grounded = false;
            sound.playBounce(450);
          }

          p2.kickActive = !!keysPressed.current['Enter'] || !!keysPressed.current['Numpad0'];
          if (keysPressed.current['ArrowDown'] && p2.superEnergy >= 100) {
            p2.superEnergy = 0;
            p2.kickActive = true;
            sound.playPowerUp();
            if (Math.hypot(ball.x - p2.x, ball.y - p2.y) < 70) {
              ball.vx = -18;
              ball.vy = -6;
              ball.isSuper = true;
              sound.playLaser(950);
            }
          }
        } else {
          // Smart AI
          const distToBall = ball.x - p2.x;
          if (ball.x > 350) {
            if (distToBall > 20) p2.vx = 4.2;
            else if (distToBall < -20) p2.vx = -4.2;
            else p2.vx = 0;

            if (ball.y < p2.y - 20 && p2.grounded && Math.abs(distToBall) < 60) {
              p2.vy = -13.5;
              p2.grounded = false;
            }

            p2.kickActive = Math.abs(distToBall) < 55;
          } else {
            // Defend goal
            const guardX = 640;
            p2.vx = (guardX - p2.x) * 0.08;
            p2.kickActive = false;
          }
        }

        // Gravity & Ground Physics for Players
        [p1, p2].forEach((p, idx) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.65; // gravity

          if (p.y >= groundY - 30) {
            p.y = groundY - 30;
            p.vy = 0;
            p.grounded = true;
          }

          // Bounds
          p.x = Math.max(goalW + 20, Math.min(width - goalW - 20, p.x));

          // Super Energy recharge
          p.superEnergy = Math.min(100, p.superEnergy + 0.15);

          // Foot kick animation
          if (p.kickActive) {
            p.kickAngle = (p.facing === 1 ? -0.8 : 0.8);
          } else {
            p.kickAngle = 0;
          }
        });

        // Ball Physics
        ball.x += ball.vx;
        ball.y += ball.vy;
        ball.vy += 0.38; // ball gravity
        ball.rot += ball.vx * 0.05;

        // Ball trail
        if (Math.abs(ball.vx) > 5 || ball.isSuper) {
          ball.trail.push({
            x: ball.x,
            y: ball.y,
            alpha: 0.7,
            color: ball.isSuper ? '#f59e0b' : '#38bdf8'
          });
          if (ball.trail.length > 12) ball.trail.shift();
        }
        ball.trail.forEach((t) => (t.alpha -= 0.05));

        // Ball Ground bounce
        if (ball.y + ball.radius >= groundY) {
          ball.y = groundY - ball.radius;
          ball.vy = -ball.vy * 0.72;
          ball.vx *= 0.94;
          if (Math.abs(ball.vy) > 1.5) sound.playBounce(300);
          ball.isSuper = false;
        }

        // Ceiling bounce
        if (ball.y - ball.radius < 20) {
          ball.y = 20 + ball.radius;
          ball.vy = -ball.vy * 0.8;
        }

        // Goal Posts Crossbar Collision
        // Left Goal Post
        const goalTopY = groundY - goalH;
        if (ball.x < goalW + 10 && ball.y + ball.radius > goalTopY && ball.y - ball.radius < goalTopY + 14) {
          ball.vy = -Math.abs(ball.vy);
          sound.playBounce(500);
        }
        // Right Goal Post
        if (ball.x > width - goalW - 10 && ball.y + ball.radius > goalTopY && ball.y - ball.radius < goalTopY + 14) {
          ball.vy = -Math.abs(ball.vy);
          sound.playBounce(500);
        }

        // Left Goal Line (Score for P2)
        if (ball.x < goalW && ball.y > goalTopY) {
          p2.score++;
          setScores({ p1: p1.score, p2: p2.score });
          resetAfterGoal(mode === '2p' ? '2. OYUNCU GOL ATTI! ⚽' : 'YAPAY ZEKA GOL ATTI! ⚽');
        }

        // Right Goal Line (Score for P1)
        if (ball.x > width - goalW && ball.y > goalTopY) {
          p1.score++;
          setScores({ p1: p1.score, p2: p2.score });
          resetAfterGoal('1. OYUNCU GOOOOL! ⚽🔥');
        }

        // Outer Side Walls (Above Goal)
        if (ball.x - ball.radius < 10) {
          ball.x = 10 + ball.radius;
          ball.vx = -ball.vx * 0.8;
          sound.playBounce(400);
        }
        if (ball.x + ball.radius > width - 10) {
          ball.x = width - 10 - ball.radius;
          ball.vx = -ball.vx * 0.8;
          sound.playBounce(400);
        }

        // Player & Ball Head Collisions
        [p1, p2].forEach((p, pIdx) => {
          // Head circle
          const headX = p.x;
          const headY = p.y - 25;
          const headR = 26;

          const dx = ball.x - headX;
          const dy = ball.y - headY;
          const dist = Math.hypot(dx, dy);

          if (dist < headR + ball.radius) {
            const angle = Math.atan2(dy, dx);
            const speed = Math.min(16, Math.hypot(ball.vx, ball.vy) + 3.5);
            ball.vx = Math.cos(angle) * speed + p.vx * 0.6;
            ball.vy = Math.sin(angle) * speed - 2.5;

            sound.playBounce(pIdx === 0 ? 550 : 650);
          }

          // Shoe / Kick collision
          const footX = p.x + (p.facing === 1 ? 18 : -18);
          const footY = p.y + 12;
          const fDist = Math.hypot(ball.x - footX, ball.y - footY);

          if (fDist < 26) {
            const power = p.kickActive ? 14 : 7;
            ball.vx = (p.facing === 1 ? power : -power);
            ball.vy = -7;
            sound.playBounce(750);
          }
        });

        // Update Confetti
        for (let i = state.confetti.length - 1; i >= 0; i--) {
          const c = state.confetti[i];
          c.x += c.vx;
          c.y += c.vy;
          c.vy += 0.2;
          c.life -= 0.02;
          if (c.life <= 0) state.confetti.splice(i, 1);
        }
      }

      // RENDER
      ctx.save();
      if (stateRef.current.shake > 0) {
        ctx.translate((Math.random() - 0.5) * stateRef.current.shake, (Math.random() - 0.5) * stateRef.current.shake);
        stateRef.current.shake *= 0.85;
      }

      // Stadium Night Sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#090d16');
      skyGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Stadium Floodlight Beams
      ctx.fillStyle = 'rgba(56, 189, 248, 0.06)';
      ctx.beginPath();
      ctx.moveTo(80, 0);
      ctx.lineTo(0, height);
      ctx.lineTo(260, height);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(width - 80, 0);
      ctx.lineTo(width, height);
      ctx.lineTo(width - 260, height);
      ctx.closePath();
      ctx.fill();

      // Cheering Crowd silhouettes
      ctx.fillStyle = '#0a101d';
      for (let cx = 0; cx < width; cx += 22) {
        const bob = Math.sin((cx + Date.now() * 0.005) * 0.3) * 6;
        ctx.beginPath();
        ctx.arc(cx, 340 + bob, 11, 0, Math.PI * 2);
        ctx.fill();
      }

      // Pitch Grass (Field)
      const pitchGrad = ctx.createLinearGradient(0, groundY, 0, height);
      pitchGrad.addColorStop(0, '#15803d');
      pitchGrad.addColorStop(1, '#14532d');
      ctx.fillStyle = pitchGrad;
      ctx.fillRect(0, groundY, width, height - groundY);

      // White Field Lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 3;
      // Ground touchline
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(width, groundY);
      ctx.stroke();

      // Center Line & Circle
      ctx.beginPath();
      ctx.moveTo(width / 2, groundY);
      ctx.lineTo(width / 2, height);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(width / 2, groundY, 65, Math.PI, 0);
      ctx.stroke();

      // Left Goal Net
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 3;
      ctx.strokeRect(0, groundY - goalH, goalW, goalH);
      // Net mesh
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      for (let gy = groundY - goalH; gy <= groundY; gy += 15) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(goalW, gy);
        ctx.stroke();
      }

      // Right Goal Net
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 3;
      ctx.strokeRect(width - goalW, groundY - goalH, goalW, goalH);
      for (let gy = groundY - goalH; gy <= groundY; gy += 15) {
        ctx.beginPath();
        ctx.moveTo(width - goalW, gy);
        ctx.lineTo(width, gy);
        ctx.stroke();
      }

      // Draw Ball Trail
      ball.trail.forEach((t) => {
        ctx.fillStyle = t.color;
        ctx.globalAlpha = t.alpha * 0.4;
        ctx.beginPath();
        ctx.arc(t.x, t.y, ball.radius * 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // Draw Golden Ball
      ctx.save();
      ctx.translate(ball.x, ball.y);
      ctx.rotate(ball.rot);

      ctx.fillStyle = ball.isSuper ? '#f59e0b' : '#ffffff';
      ctx.shadowColor = ball.isSuper ? '#f59e0b' : '#38bdf8';
      ctx.shadowBlur = ball.isSuper ? 20 : 10;
      ctx.beginPath();
      ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);
      ctx.fill();

      // Soccer pentagon markings
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();
      for (let a = 0; a < 5; a++) {
        const ang = (a * Math.PI * 2) / 5;
        ctx.fillRect(Math.cos(ang) * 9 - 2, Math.sin(ang) * 9 - 2, 4, 4);
      }
      ctx.restore();

      // Draw Players (Big Head Characters!)
      [p1, p2].forEach((p, idx) => {
        ctx.save();
        ctx.translate(p.x, p.y);

        // Body / Jersey
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;
        ctx.fillRect(-10, -5, 20, 22);

        // Head (Big Anime Head!)
        ctx.fillStyle = '#fed7aa'; // Skin
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(0, -25, 26, 0, Math.PI * 2);
        ctx.fill();

        // Hair
        ctx.fillStyle = idx === 0 ? '#1e293b' : '#b45309';
        ctx.beginPath();
        ctx.arc(0, -32, 26, Math.PI, 0);
        ctx.fill();

        // Eye
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(p.facing === 1 ? 8 : -8, -25, 4, 0, Math.PI * 2);
        ctx.fill();

        // Kicking Boot
        ctx.save();
        ctx.translate(p.facing === 1 ? 12 : -12, 14);
        ctx.rotate(p.kickAngle);
        ctx.fillStyle = p.shoeColor;
        ctx.shadowBlur = 10;
        ctx.fillRect(-8, -4, 20, 10);
        ctx.restore();

        ctx.restore();

        // Player Tag & Super Bar above head
        ctx.fillStyle = p.color;
        ctx.font = 'bold 11px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(idx === 0 ? 'P1' : mode === '2p' ? 'P2' : 'BOT', p.x, p.y - 58);

        // Super Bar
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(p.x - 20, p.y - 55, 40, 4);
        ctx.fillStyle = p.superEnergy >= 100 ? '#f59e0b' : '#38bdf8';
        ctx.fillRect(p.x - 20, p.y - 55, (40 * p.superEnergy) / 100, 4);
      });

      // Draw Confetti
      stateRef.current.confetti.forEach((c) => {
        ctx.save();
        ctx.fillStyle = c.color;
        ctx.globalAlpha = c.life;
        ctx.fillRect(c.x, c.y, c.size, c.size);
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
      {/* Top Bar */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-lg">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-black text-lg text-white flex items-center gap-2">
              Kafa Topu 1v1: Head Soccer Arcade
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-bold uppercase">
                {mode === '2p' ? '1 PC / 2 Kişi' : '1P vs Yapay Zeka'}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Dev kafalar, süper şutlar ve tribün coşkusu! Arkadaşınla aynı klavyede gol savaşı yap!
            </p>
          </div>
        </div>

        {/* Score & Time */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-sm">
            <span className="text-cyan-400 font-black text-base">{scores.p1}</span>
            <span className="text-slate-600">:</span>
            <span className="text-rose-400 font-black text-base">{scores.p2}</span>
            <span className="text-slate-500 text-xs ml-2">⏱️ {matchTime}s</span>
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

        {/* GOAL Overlay */}
        {goalText && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 animate-in zoom-in-95">
            <Flame className="w-16 h-16 text-amber-400 animate-bounce mb-2" />
            <h2 className="text-4xl font-black font-heading text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500">
              {goalText}
            </h2>
          </div>
        )}

        {/* Game Over Screen */}
        {gameOver && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 z-20">
            <Trophy className="w-16 h-16 text-amber-400 mb-3 animate-pulse" />
            <h2 className="text-3xl font-black font-heading text-white">{gameOver}</h2>
            <p className="text-sm text-slate-400 mt-2 font-mono">
              Maç Skoru: <span className="text-cyan-400 font-bold text-lg">{scores.p1}</span> -{' '}
              <span className="text-rose-400 font-bold text-lg">{scores.p2}</span>
            </p>
            <button
              onClick={() => {
                sound.playPowerUp();
                resetMatch();
              }}
              className="mt-6 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black rounded-2xl shadow-xl hover:from-amber-400 hover:to-amber-500 transition active:scale-95 text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Rövanş Maçı Yap
            </button>
          </div>
        )}
      </div>

      {/* Controls Overlay Guide */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 text-xs">
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
            <span className="font-bold text-white font-heading">1. Oyuncu (Mavi)</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-slate-300">
            <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-cyan-300 font-bold">
              A / D / W
            </span>
            <span>Koş & Zıpla</span>
            <span className="text-slate-600">|</span>
            <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-cyan-300 font-bold">
              BOŞLUK / S
            </span>
            <span>Şut & Süper</span>
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_8px_#ef4444]" />
            <span className="font-bold text-white font-heading">
              {mode === '2p' ? '2. Oyuncu (Kırmızı)' : 'Yapay Zeka (Oto)'}
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono text-slate-300">
            {mode === '2p' ? (
              <>
                <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-rose-300 font-bold">
                  Sol / Sağ / Yukarı
                </span>
                <span>Koş & Zıpla</span>
                <span className="text-slate-600">|</span>
                <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-rose-300 font-bold">
                  ENTER / Aşağı
                </span>
                <span>Şut</span>
              </>
            ) : (
              <span className="text-slate-400">Yapay Zeka Kaleyi Savunuyor</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
