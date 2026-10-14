import React, { useEffect, useRef, useState } from 'react';
import { Trophy, RotateCcw, Users, User, Swords, Flame, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';

interface Fighter {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  grounded: boolean;
  facing: number; // 1 = right, -1 = left
  action: 'idle' | 'walk' | 'punch' | 'kick' | 'special' | 'hit';
  actionTimer: number;
  combo: number;
  energy: number;
  score: number;
  color: string;
  name: string;
}

interface Blast {
  x: number;
  y: number;
  vx: number;
  owner: number;
  color: string;
}

export const CyberBrawlerGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mode, setMode] = useState<'2p' | 'ai'>('2p');
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [gameOver, setGameOver] = useState<string | null>(null);
  const [koText, setKoText] = useState<string | null>(null);

  const keysPressed = useRef<{ [key: string]: boolean }>({});

  const stateRef = useRef({
    p1: {
      x: 200,
      y: 380,
      vx: 0,
      vy: 0,
      hp: 100,
      maxHp: 100,
      grounded: true,
      facing: 1,
      action: 'idle',
      actionTimer: 0,
      combo: 0,
      energy: 100,
      score: 0,
      color: '#00f0ff',
      name: '1. OYUNCU (Siber Ninja)'
    } as Fighter,
    p2: {
      x: 600,
      y: 380,
      vx: 0,
      vy: 0,
      hp: 100,
      maxHp: 100,
      grounded: true,
      facing: -1,
      action: 'idle',
      actionTimer: 0,
      combo: 0,
      energy: 100,
      score: 0,
      color: '#ff007f',
      name: mode === '2p' ? '2. OYUNCU (Siber Savaşçı)' : 'YAPAY ZEKA'
    } as Fighter,
    blasts: [] as Blast[],
    sparks: [] as { x: number; y: number; vx: number; vy: number; color: string; life: number }[],
    shake: 0,
    groundY: 400
  });

  const resetRound = (keepScores = true) => {
    const s = stateRef.current;
    s.p1.x = 200;
    s.p1.y = s.groundY;
    s.p1.hp = 100;
    s.p1.vx = 0;
    s.p1.vy = 0;
    s.p1.action = 'idle';
    s.p1.actionTimer = 0;
    s.p1.facing = 1;

    s.p2.x = 600;
    s.p2.y = s.groundY;
    s.p2.hp = 100;
    s.p2.vx = 0;
    s.p2.vy = 0;
    s.p2.action = 'idle';
    s.p2.actionTimer = 0;
    s.p2.facing = -1;

    s.blasts = [];
    setKoText(null);
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

  const addHitSparks = (x: number, y: number, color: string, count = 18) => {
    sound.playBounce(600);
    stateRef.current.shake = 10;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = Math.random() * 6 + 2;
      stateRef.current.sparks.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        color,
        life: 1
      });
    }
  };

  const attack = (attackerIdx: number, type: 'punch' | 'kick' | 'special') => {
    const s = stateRef.current;
    const attacker = attackerIdx === 0 ? s.p1 : s.p2;
    const defender = attackerIdx === 0 ? s.p2 : s.p1;

    if (attacker.action !== 'idle' && attacker.action !== 'walk') return;

    attacker.action = type;
    attacker.actionTimer = type === 'special' ? 25 : 14;

    if (type === 'special') {
      if (attacker.energy < 40) return;
      attacker.energy -= 40;
      sound.playLaser(750);
      s.blasts.push({
        x: attacker.x + attacker.facing * 25,
        y: attacker.y - 30,
        vx: attacker.facing * 9,
        owner: attackerIdx,
        color: attacker.color
      });
      return;
    }

    sound.playLaser(type === 'punch' ? 500 : 400);

    // Hitbox check
    const range = type === 'punch' ? 55 : 68;
    const inRange = Math.abs(attacker.x - defender.x) < range && Math.abs(attacker.y - defender.y) < 50;
    const correctFacing = (defender.x - attacker.x) * attacker.facing > 0;

    if (inRange && correctFacing) {
      const damage = type === 'punch' ? 12 : 18;
      defender.hp = Math.max(0, defender.hp - damage);
      defender.vx = attacker.facing * (type === 'punch' ? 5 : 8);
      defender.action = 'hit';
      defender.actionTimer = 12;
      attacker.combo++;

      addHitSparks(defender.x, defender.y - 30, attacker.color);

      if (defender.hp <= 0) {
        sound.playExplosion();
        attacker.score++;
        setScores({ p1: s.p1.score, p2: s.p2.score });

        if (attacker.score >= 2) {
          setGameOver(`${attacker.name} DÖVÜŞÜ KAZANDI! 🏆`);
        } else {
          setKoText('K.O.! Raund Bitti');
          setTimeout(() => resetRound(true), 1800);
        }
      }
    } else {
      attacker.combo = 0;
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
      const state = stateRef.current;
      const { p1, p2, groundY } = state;

      if (!gameOver && !koText) {
        // Player 1 (A, D move, W jump, F punch, G kick, H special)
        const spd = 4.2;
        if (p1.actionTimer <= 0) {
          if (keysPressed.current['KeyA']) {
            p1.vx = -spd;
            p1.action = 'walk';
          } else if (keysPressed.current['KeyD']) {
            p1.vx = spd;
            p1.action = 'walk';
          } else {
            p1.vx *= 0.6;
            p1.action = 'idle';
          }

          if (keysPressed.current['KeyW'] && p1.grounded) {
            p1.vy = -13;
            p1.grounded = false;
            sound.playBounce(500);
          }

          if (keysPressed.current['KeyF']) attack(0, 'punch');
          else if (keysPressed.current['KeyG']) attack(0, 'kick');
          else if (keysPressed.current['KeyH']) attack(0, 'special');
        }

        // Player 2 (Arrows, K punch, L kick, Enter special) or AI
        if (p2.actionTimer <= 0) {
          if (mode === '2p') {
            if (keysPressed.current['ArrowLeft']) {
              p2.vx = -spd;
              p2.action = 'walk';
            } else if (keysPressed.current['ArrowRight']) {
              p2.vx = spd;
              p2.action = 'walk';
            } else {
              p2.vx *= 0.6;
              p2.action = 'idle';
            }

            if (keysPressed.current['ArrowUp'] && p2.grounded) {
              p2.vy = -13;
              p2.grounded = false;
              sound.playBounce(500);
            }

            if (keysPressed.current['KeyK']) attack(1, 'punch');
            else if (keysPressed.current['KeyL']) attack(1, 'kick');
            else if (keysPressed.current['Enter'] || keysPressed.current['Numpad0']) attack(1, 'special');
          } else {
            // AI Logic
            const dist = p1.x - p2.x;
            if (Math.abs(dist) > 55) {
              p2.vx = Math.sign(dist) * 3.5;
              p2.action = 'walk';
            } else {
              p2.vx = 0;
              p2.action = 'idle';
              if (Math.random() < 0.08) attack(1, Math.random() > 0.4 ? 'punch' : 'kick');
              else if (p2.energy >= 40 && Math.random() < 0.04) attack(1, 'special');
            }
          }
        }

        // Facing direction & action timers
        [p1, p2].forEach((p, idx) => {
          const opponent = idx === 0 ? p2 : p1;
          if (p.action === 'idle' || p.action === 'walk') {
            p.facing = opponent.x > p.x ? 1 : -1;
          }

          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.7; // gravity

          if (p.y >= groundY) {
            p.y = groundY;
            p.vy = 0;
            p.grounded = true;
          }

          p.x = Math.max(40, Math.min(width - 40, p.x));

          if (p.actionTimer > 0) {
            p.actionTimer--;
            if (p.actionTimer <= 0) p.action = 'idle';
          }

          p.energy = Math.min(100, p.energy + 0.12);
        });

        // Update Energy Blasts
        for (let bi = state.blasts.length - 1; bi >= 0; bi--) {
          const b = state.blasts[bi];
          b.x += b.vx;

          const target = b.owner === 0 ? p2 : p1;
          if (Math.abs(b.x - target.x) < 30 && Math.abs(b.y - (target.y - 30)) < 40) {
            target.hp = Math.max(0, target.hp - 25);
            target.vx = Math.sign(b.vx) * 10;
            target.action = 'hit';
            target.actionTimer = 15;
            addHitSparks(target.x, target.y - 30, b.color, 25);

            if (target.hp <= 0) {
              const attacker = b.owner === 0 ? p1 : p2;
              attacker.score++;
              setScores({ p1: p1.score, p2: p2.score });
              sound.playExplosion();

              if (attacker.score >= 2) {
                setGameOver(`${attacker.name} DÖVÜŞÜ KAZANDI! 🏆`);
              } else {
                setKoText('K.O.! Raund Bitti');
                setTimeout(() => resetRound(true), 1800);
              }
            }
            state.blasts.splice(bi, 1);
            continue;
          }

          if (b.x < 0 || b.x > width) {
            state.blasts.splice(bi, 1);
          }
        }

        // Update Sparks
        for (let i = state.sparks.length - 1; i >= 0; i--) {
          const s = state.sparks[i];
          s.x += s.vx;
          s.y += s.vy;
          s.life -= 0.05;
          if (s.life <= 0) state.sparks.splice(i, 1);
        }
      }

      // RENDER
      ctx.save();
      if (stateRef.current.shake > 0) {
        ctx.translate((Math.random() - 0.5) * stateRef.current.shake, (Math.random() - 0.5) * stateRef.current.shake);
        stateRef.current.shake *= 0.85;
      }

      // Cyber Dojo Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#020617');
      bgGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Neon Dojo Pillars
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      ctx.strokeRect(60, 40, 680, 420);

      // Neon Ring in background
      ctx.strokeStyle = 'rgba(236, 72, 153, 0.15)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(400, 220, 110, 0, Math.PI * 2);
      ctx.stroke();

      // Ground Floor
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, groundY, width, height - groundY);
      ctx.strokeStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 8;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(width, groundY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw Energy Blasts
      stateRef.current.blasts.forEach((b) => {
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(b.x, b.y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = b.color;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
      });

      // Draw Fighters
      [p1, p2].forEach((p, idx) => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.scale(p.facing, 1);

        ctx.strokeStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';

        // Head
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(0, -55, 12, 0, Math.PI * 2);
        ctx.fill();

        // Torso
        ctx.beginPath();
        ctx.moveTo(0, -43);
        ctx.lineTo(0, -18);
        ctx.stroke();

        // Arms based on action
        ctx.beginPath();
        if (p.action === 'punch') {
          ctx.moveTo(0, -38);
          ctx.lineTo(15, -38);
          ctx.lineTo(35, -38); // punching fist!
        } else if (p.action === 'special') {
          ctx.moveTo(0, -38);
          ctx.lineTo(18, -32);
          ctx.lineTo(28, -32);
        } else {
          ctx.moveTo(0, -38);
          ctx.lineTo(10, -28);
          ctx.lineTo(16, -18);
        }
        ctx.stroke();

        // Legs based on action
        ctx.beginPath();
        if (p.action === 'kick') {
          // One standing, one kicking forward!
          ctx.moveTo(0, -18);
          ctx.lineTo(-8, 0);
          ctx.moveTo(0, -18);
          ctx.lineTo(25, -25);
          ctx.lineTo(38, -25); // kicking leg!
        } else if (p.action === 'walk') {
          const legSwing = Math.sin(Date.now() * 0.015) * 12;
          ctx.moveTo(0, -18);
          ctx.lineTo(legSwing, 0);
          ctx.moveTo(0, -18);
          ctx.lineTo(-legSwing, 0);
        } else {
          ctx.moveTo(0, -18);
          ctx.lineTo(8, 0);
          ctx.moveTo(0, -18);
          ctx.lineTo(-8, 0);
        }
        ctx.stroke();

        ctx.restore();

        // Health & Energy UI above fighters
        const barW = 180;
        const barX = idx === 0 ? 60 : width - 60 - barW;
        const barY = 30;

        // Name
        ctx.fillStyle = p.color;
        ctx.font = 'bold 12px Outfit, sans-serif';
        ctx.textAlign = idx === 0 ? 'left' : 'right';
        ctx.fillText(`${p.name} (${p.score} Raund)`, idx === 0 ? barX : barX + barW, barY - 8);

        // HP Bar
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(barX, barY, barW, 14);
        ctx.fillStyle = p.hp > 30 ? p.color : '#ef4444';
        ctx.fillRect(barX, barY, (barW * p.hp) / 100, 14);
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barW, 14);

        // Energy Bar
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(barX, barY + 16, barW, 6);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(barX, barY + 16, (barW * p.energy) / 100, 6);
      });

      // Draw Sparks
      stateRef.current.sparks.forEach((s) => {
        ctx.save();
        ctx.fillStyle = s.color;
        ctx.globalAlpha = s.life;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameOver, koText, mode]);

  return (
    <div className="flex flex-col items-center bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl overflow-hidden relative">
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400 shadow-lg">
            <Swords className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-black text-lg text-white flex items-center gap-2">
              Cyber Brawler: Sokak Dövüşü 1v1
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-pink-500/20 text-pink-400 border border-pink-500/40 font-bold uppercase">
                {mode === '2p' ? '1 PC / 2 Kişi' : '1P vs Yapay Zeka'}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Aynı klavyede yumruk, tekme ve enerji dalgalarıyla kombo düellosu yapın!
            </p>
          </div>
        </div>

        {/* Scores & Mode Toggle */}
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
        <canvas ref={canvasRef} className="block max-w-full h-auto" />

        {koText && !gameOver && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 animate-in zoom-in-95">
            <Flame className="w-16 h-16 text-rose-500 animate-bounce mb-2" />
            <h2 className="text-4xl font-black font-heading text-white">{koText}</h2>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 z-20">
            <Trophy className="w-16 h-16 text-amber-400 mb-3 animate-pulse" />
            <h2 className="text-3xl font-black font-heading text-white">{gameOver}</h2>
            <p className="text-sm text-slate-400 mt-2 font-mono">
              Skor: <span className="text-cyan-400 font-bold">{scores.p1}</span> -{' '}
              <span className="text-pink-400 font-bold">{scores.p2}</span>
            </p>
            <button
              onClick={() => {
                sound.playPowerUp();
                resetRound(false);
              }}
              className="mt-6 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-amber-500 text-slate-950 font-black rounded-2xl shadow-xl hover:from-pink-400 hover:to-amber-400 transition active:scale-95 text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Yeniden Dövüş
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
              A / D / W
            </span>
            <span>Gezin</span>
            <span className="text-slate-600">|</span>
            <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-cyan-300 font-bold">
              F (Yumruk) / G (Tekme) / H (Özel)
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
              <>
                <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-pink-300 font-bold">
                  Yön Tuşları
                </span>
                <span>Gezin</span>
                <span className="text-slate-600">|</span>
                <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-pink-300 font-bold">
                  K (Yumruk) / L (Tekme) / ENTER
                </span>
              </>
            ) : (
              <span className="text-slate-400">Yapay Zeka Otomatik Dövüşüyor</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
