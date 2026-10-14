import React, { useEffect, useRef, useState } from 'react';
import { Trophy, RotateCcw, Zap, Sparkles, Shield, Heart, Crosshair } from 'lucide-react';
import { sound } from '../utils/audio';

interface Enemy {
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  radius: number;
  color: string;
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  color: string;
  life: number;
}

interface Gem {
  x: number;
  y: number;
  xp: number;
}

interface UpgradeOption {
  id: string;
  title: string;
  desc: string;
  icon: string;
}

export const CyberSurvivorGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [level, setLevel] = useState(1);
  const [kills, setKills] = useState(0);
  const [surviveTime, setSurviveTime] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [upgradeChoices, setUpgradeChoices] = useState<UpgradeOption[] | null>(null);

  const keysPressed = useRef<{ [key: string]: boolean }>({});

  const stateRef = useRef({
    hero: {
      x: 400,
      y: 250,
      hp: 100,
      maxHp: 100,
      speed: 3.8,
      xp: 0,
      nextXp: 10,
      level: 1,
      bulletCount: 1,
      fireRate: 22,
      cooldown: 0,
      orbitalCount: 2,
      orbitalAngle: 0,
      lightningCooldown: 0
    },
    enemies: [] as Enemy[],
    bullets: [] as Bullet[],
    gems: [] as Gem[],
    particles: [] as { x: number; y: number; vx: number; vy: number; color: string; life: number }[],
    shake: 0,
    kills: 0,
    time: 0
  });

  const resetGame = () => {
    const s = stateRef.current;
    s.hero.x = 400;
    s.hero.y = 250;
    s.hero.hp = 100;
    s.hero.xp = 0;
    s.hero.nextXp = 10;
    s.hero.level = 1;
    s.hero.bulletCount = 1;
    s.hero.orbitalCount = 2;
    s.hero.speed = 3.8;
    s.enemies = [];
    s.bullets = [];
    s.gems = [];
    s.particles = [];
    s.kills = 0;
    s.time = 0;
    setLevel(1);
    setKills(0);
    setSurviveTime(0);
    setGameOver(false);
    setUpgradeChoices(null);
  };

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = true;
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
  }, []);

  const triggerLevelUp = () => {
    sound.playPowerUp();
    const options: UpgradeOption[] = [
      { id: 'multishot', title: '+1 Plazma Mermisi', desc: 'Aynı anda ekstra yöne ateş eder', icon: '💥' },
      { id: 'orbital', title: '+1 Dönen Enerji Kalkanı', desc: 'Etrafınızda dönen koruyucu lazer küresi', icon: '🛡️' },
      { id: 'speed', title: '+%25 Hızlandırma', desc: 'Robotlardan daha çevik kaçın', icon: '👟' },
      { id: 'heal', title: 'Tam Can Yenileme', desc: 'Nanitlerle canınızı %100 doldurun', icon: '💚' }
    ];
    // Pick 3 random
    setUpgradeChoices(options.slice(0, 3));
  };

  const applyUpgrade = (id: string) => {
    sound.playClick();
    const h = stateRef.current.hero;
    if (id === 'multishot') h.bulletCount++;
    else if (id === 'orbital') h.orbitalCount++;
    else if (id === 'speed') h.speed *= 1.25;
    else if (id === 'heal') h.hp = h.maxHp;

    setUpgradeChoices(null);
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

    let frame = 0;

    const loop = () => {
      const state = stateRef.current;
      const { hero } = state;

      if (!gameOver && !upgradeChoices) {
        frame++;
        if (frame % 60 === 0) {
          state.time++;
          setSurviveTime(state.time);
        }

        // Hero Movement (WASD or Arrows)
        let dx = 0;
        let dy = 0;
        if (keysPressed.current['KeyW'] || keysPressed.current['ArrowUp']) dy -= 1;
        if (keysPressed.current['KeyS'] || keysPressed.current['ArrowDown']) dy += 1;
        if (keysPressed.current['KeyA'] || keysPressed.current['ArrowLeft']) dx -= 1;
        if (keysPressed.current['KeyD'] || keysPressed.current['ArrowRight']) dx += 1;

        if (dx !== 0 && dy !== 0) {
          dx *= 0.707;
          dy *= 0.707;
        }

        hero.x = Math.max(20, Math.min(width - 20, hero.x + dx * hero.speed));
        hero.y = Math.max(20, Math.min(height - 20, hero.y + dy * hero.speed));

        // Auto-Firing at nearest enemy
        hero.cooldown--;
        if (hero.cooldown <= 0 && state.enemies.length > 0) {
          hero.cooldown = hero.fireRate;
          sound.playLaser(700);

          // Find nearest enemy
          let nearest = state.enemies[0];
          let minDist = 9999;
          state.enemies.forEach((en) => {
            const dist = Math.hypot(en.x - hero.x, en.y - hero.y);
            if (dist < minDist) {
              minDist = dist;
              nearest = en;
            }
          });

          const baseAngle = Math.atan2(nearest.y - hero.y, nearest.x - hero.x);
          for (let b = 0; b < hero.bulletCount; b++) {
            const spread = (b - (hero.bulletCount - 1) / 2) * 0.25;
            state.bullets.push({
              x: hero.x,
              y: hero.y,
              vx: Math.cos(baseAngle + spread) * 8.5,
              vy: Math.sin(baseAngle + spread) * 8.5,
              damage: 25,
              color: '#00f0ff',
              life: 60
            });
          }
        }

        // Orbital Shields rotation
        hero.orbitalAngle += 0.05;

        // Spawn Enemies
        const spawnRate = Math.max(18, 55 - Math.floor(state.time * 0.8));
        if (frame % spawnRate === 0) {
          // Spawn from screen edges
          const edge = Math.floor(Math.random() * 4);
          let ex = 0;
          let ey = 0;
          if (edge === 0) { ex = Math.random() * width; ey = -20; }
          else if (edge === 1) { ex = width + 20; ey = Math.random() * height; }
          else if (edge === 2) { ex = Math.random() * width; ey = height + 20; }
          else { ex = -20; ey = Math.random() * height; }

          state.enemies.push({
            x: ex,
            y: ey,
            hp: 25 + state.time * 0.5,
            maxHp: 25 + state.time * 0.5,
            speed: 1.6 + Math.random() * 0.8,
            radius: 12,
            color: Math.random() > 0.4 ? '#a855f7' : '#ec4899'
          });
        }

        // Move Enemies toward hero
        for (let i = state.enemies.length - 1; i >= 0; i--) {
          const en = state.enemies[i];
          const angle = Math.atan2(hero.y - en.y, hero.x - en.x);
          en.x += Math.cos(angle) * en.speed;
          en.y += Math.sin(angle) * en.speed;

          // Enemy hits hero
          if (Math.hypot(hero.x - en.x, hero.y - en.y) < en.radius + 14) {
            hero.hp -= 0.6;
            state.shake = 3;
            if (hero.hp <= 0) {
              sound.playExplosion();
              setGameOver(true);
            }
          }

          // Orbital collision
          const orbR = 48;
          for (let o = 0; o < hero.orbitalCount; o++) {
            const oAng = hero.orbitalAngle + (o * Math.PI * 2) / hero.orbitalCount;
            const ox = hero.x + Math.cos(oAng) * orbR;
            const oy = hero.y + Math.sin(oAng) * orbR;

            if (Math.hypot(en.x - ox, en.y - oy) < en.radius + 8) {
              en.hp -= 2;
              sound.playBounce(600);
              // Knockback
              en.x -= Math.cos(angle) * 4;
              en.y -= Math.sin(angle) * 4;
            }
          }

          // Check dead enemy
          if (en.hp <= 0) {
            state.kills++;
            setKills(state.kills);
            // Drop XP gem
            state.gems.push({ x: en.x, y: en.y, xp: 2 });
            state.enemies.splice(i, 1);
          }
        }

        // Move Bullets & Hit detection
        for (let bi = state.bullets.length - 1; bi >= 0; bi--) {
          const b = state.bullets[bi];
          b.x += b.vx;
          b.y += b.vy;
          b.life--;

          // Check hit enemies
          for (let ei = state.enemies.length - 1; ei >= 0; ei--) {
            const en = state.enemies[ei];
            if (Math.hypot(b.x - en.x, b.y - en.y) < en.radius + 4) {
              en.hp -= b.damage;
              sound.playLaser(850);
              state.bullets.splice(bi, 1);
              break;
            }
          }

          if (b.life <= 0) state.bullets.splice(bi, 1);
        }

        // Collect Gems
        for (let gi = state.gems.length - 1; gi >= 0; gi--) {
          const gem = state.gems[gi];
          const dist = Math.hypot(hero.x - gem.x, hero.y - gem.y);

          // Magnet pull
          if (dist < 110) {
            gem.x += (hero.x - gem.x) * 0.12;
            gem.y += (hero.y - gem.y) * 0.12;
          }

          if (dist < 20) {
            sound.playCoin();
            hero.xp += gem.xp;
            if (hero.xp >= hero.nextXp) {
              hero.xp = 0;
              hero.level++;
              hero.nextXp = Math.floor(hero.nextXp * 1.5);
              setLevel(hero.level);
              triggerLevelUp();
            }
            state.gems.splice(gi, 1);
          }
        }
      }

      // RENDER
      ctx.save();
      if (stateRef.current.shake > 0) {
        ctx.translate((Math.random() - 0.5) * stateRef.current.shake, (Math.random() - 0.5) * stateRef.current.shake);
        stateRef.current.shake *= 0.85;
      }

      // Deep Dark Grid
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, width, height);

      // Cyber Grid lines
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

      // Draw XP Gems
      stateRef.current.gems.forEach((g) => {
        ctx.save();
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(g.x, g.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Draw Enemies
      stateRef.current.enemies.forEach((en) => {
        ctx.save();
        ctx.fillStyle = en.color;
        ctx.shadowColor = en.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(en.x, en.y, en.radius, 0, Math.PI * 2);
        ctx.fill();

        // Enemy eye
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(en.x, en.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Draw Bullets
      stateRef.current.bullets.forEach((b) => {
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Draw Hero & Orbitals
      ctx.save();
      ctx.translate(hero.x, hero.y);

      // Hero Body
      ctx.fillStyle = '#10b981';
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();

      // Gun Turret
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();

      // Orbitals
      const orbR = 48;
      for (let o = 0; o < hero.orbitalCount; o++) {
        const oAng = hero.orbitalAngle + (o * Math.PI * 2) / hero.orbitalCount;
        const ox = Math.cos(oAng) * orbR;
        const oy = Math.sin(oAng) * orbR;

        ctx.fillStyle = '#f59e0b';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(ox, oy, 7, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      // HP Bar & XP Bar on Top
      // XP Bar
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, width, 8);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(0, 0, (width * hero.xp) / hero.nextXp, 8);

      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameOver, upgradeChoices]);

  return (
    <div className="flex flex-col items-center bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl overflow-hidden relative">
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-lg">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-black text-lg text-white flex items-center gap-2">
              Cyber Survivor: Robot İstilası
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/40 font-bold uppercase">
                Rogue-Lite Aksiyon
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Vampire Survivors tarzı! Otomatik plazma ateşleyin, dönen kalkanlarla ezin ve seviye atlayın!
            </p>
          </div>
        </div>

        {/* Level, Kills & Time */}
        <div className="flex items-center gap-3 font-mono text-sm">
          <div className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-amber-400 font-bold">
            ⭐ Seviye: {level}
          </div>
          <div className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-rose-400 font-bold">
            💀 Avlanan: {kills}
          </div>
          <div className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-cyan-400 font-bold">
            ⏱️ {surviveTime}s
          </div>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="relative mt-4 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner flex items-center justify-center max-w-full">
        <canvas ref={canvasRef} className="block max-w-full h-auto" />

        {/* Upgrade Selection Popup */}
        {upgradeChoices && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 z-20">
            <Sparkles className="w-12 h-12 text-amber-400 mb-2 animate-bounce" />
            <h2 className="text-2xl font-black font-heading text-white mb-1">SEVİYE ATLADIN!</h2>
            <p className="text-xs text-slate-400 mb-4">Bir süper teknoloji güçlendirmesi seçin:</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-md">
              {upgradeChoices.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => applyUpgrade(opt.id)}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-400 p-4 rounded-2xl flex flex-col items-center text-center transition group active:scale-95 shadow-xl"
                >
                  <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">{opt.icon}</span>
                  <span className="font-heading font-bold text-white text-xs">{opt.title}</span>
                  <span className="text-[10px] text-slate-400 mt-1">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Game Over Screen */}
        {gameOver && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 z-20">
            <Trophy className="w-16 h-16 text-rose-500 mb-3 animate-pulse" />
            <h2 className="text-3xl font-black font-heading text-white">SİSTEM ÇÖKTÜ!</h2>
            <p className="text-sm text-slate-300 mt-2 font-mono">
              Hayatta Kalınan Süre: <span className="text-amber-400 font-bold">{surviveTime} saniye</span> | Seviye: {level}
            </p>
            <button
              onClick={() => {
                sound.playPowerUp();
                resetGame();
              }}
              className="mt-6 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-amber-500 text-slate-950 font-black rounded-2xl shadow-xl hover:from-purple-400 hover:to-amber-400 transition active:scale-95 text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Yeniden Hayatta Kal
            </button>
          </div>
        )}
      </div>

      {/* Controls Overlay Guide */}
      <div className="w-full flex items-center justify-between gap-3 mt-5 text-xs bg-slate-950 border border-slate-800 rounded-2xl p-3">
        <div className="flex items-center gap-3 font-mono text-slate-300">
          <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-cyan-300 font-bold">
            W, A, S, D veya YÖN TUŞLARI
          </span>
          <span>Karakteri serbestçe hareket ettir</span>
        </div>
        <div className="text-slate-400 text-[11px] font-mono">
          Ateş etme otomatiktir! Mavi XP taşlarını toplayarak güçlenin.
        </div>
      </div>
    </div>
  );
};
