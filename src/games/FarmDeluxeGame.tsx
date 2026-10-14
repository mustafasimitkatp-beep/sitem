import React, { useEffect, useRef, useState } from 'react';
import {
  Sprout,
  Coins,
  Sun,
  Moon,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  Award
} from 'lucide-react';
import { sound } from '../utils/audio';

type CropType = 'wheat' | 'carrot' | 'strawberry' | 'pumpkin';

interface Tile {
  x: number;
  y: number;
  tilled: boolean;
  watered: boolean;
  crop: {
    type: CropType;
    stage: number; // 0 to 3 (3 = ready)
    timer: number;
  } | null;
}

interface Animal {
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'chicken' | 'sheep';
  timer: number;
}

export const FarmDeluxeGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [gold, setGold] = useState(150);
  const [selectedTool, setSelectedTool] = useState<'hoe' | 'water' | 'seed' | 'harvest'>('seed');
  const [selectedSeed, setSelectedSeed] = useState<CropType>('wheat');
  const [dayNight, setDayNight] = useState<'day' | 'sunset' | 'night'>('day');
  const [inventory, setInventory] = useState<{ [key in CropType]: number }>({
    wheat: 5,
    carrot: 3,
    strawberry: 2,
    pumpkin: 1
  });

  const keysPressed = useRef<{ [key: string]: boolean }>({});

  const stateRef = useRef<{
    player: { x: number; y: number; dir: string; walking: boolean; frame: number };
    tiles: Tile[];
    animals: Animal[];
    particles: { x: number; y: number; vx: number; vy: number; color: string; life: number }[];
    gold: number;
    inventory: { [key in CropType]: number };
  }>({
    player: { x: 380, y: 250, dir: 'down', walking: false, frame: 0 },
    tiles: [],
    animals: [
      { x: 140, y: 120, vx: 0.3, vy: 0.1, type: 'chicken', timer: 100 },
      { x: 180, y: 150, vx: -0.2, vy: 0.2, type: 'chicken', timer: 120 },
      { x: 150, y: 350, vx: 0.1, vy: -0.2, type: 'sheep', timer: 90 },
      { x: 220, y: 380, vx: -0.15, vy: 0.1, type: 'sheep', timer: 140 }
    ],
    particles: [],
    gold: 150,
    inventory: { wheat: 5, carrot: 3, strawberry: 2, pumpkin: 1 }
  });

  // Initialize Farm Grid (center field: 6x5 plots)
  useEffect(() => {
    const tiles: Tile[] = [];
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 7; c++) {
        tiles.push({
          x: 280 + c * 48,
          y: 140 + r * 48,
          tilled: true,
          watered: Math.random() > 0.5,
          crop: r === 1 ? { type: 'wheat', stage: 3, timer: 0 } : null
        });
      }
    }
    stateRef.current.tiles = tiles;
  }, []);

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = true;
      if (['Digit1', 'Digit2', 'Digit3', 'Digit4'].includes(e.code)) {
        if (e.code === 'Digit1') setSelectedTool('hoe');
        if (e.code === 'Digit2') setSelectedTool('water');
        if (e.code === 'Digit3') setSelectedTool('seed');
        if (e.code === 'Digit4') setSelectedTool('harvest');
        sound.playClick();
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

  const interactPlot = (tile: Tile) => {
    const state = stateRef.current;
    if (selectedTool === 'hoe') {
      tile.tilled = true;
      sound.playBounce(300);
      for (let i = 0; i < 8; i++) {
        state.particles.push({
          x: tile.x + 24,
          y: tile.y + 24,
          vx: (Math.random() - 0.5) * 3,
          vy: -Math.random() * 3,
          color: '#854d0e',
          life: 1
        });
      }
    } else if (selectedTool === 'water') {
      if (tile.tilled) {
        tile.watered = true;
        sound.playBounce(600);
        for (let i = 0; i < 12; i++) {
          state.particles.push({
            x: tile.x + 24,
            y: tile.y + 24,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            color: '#38bdf8',
            life: 1
          });
        }
      }
    } else if (selectedTool === 'seed') {
      if (tile.tilled && !tile.crop) {
        const seedCost = selectedSeed === 'wheat' ? 5 : selectedSeed === 'carrot' ? 10 : selectedSeed === 'strawberry' ? 15 : 25;
        if (state.gold >= seedCost) {
          state.gold -= seedCost;
          setGold(state.gold);
          tile.crop = { type: selectedSeed, stage: 0, timer: 0 };
          sound.playBounce(700);
        }
      }
    } else if (selectedTool === 'harvest') {
      if (tile.crop && tile.crop.stage >= 3) {
        const cType = tile.crop.type;
        tile.crop = null;
        tile.watered = false;
        state.inventory[cType] = (state.inventory[cType] || 0) + 1;
        setInventory({ ...state.inventory });

        sound.playCoin();
        for (let i = 0; i < 15; i++) {
          state.particles.push({
            x: tile.x + 24,
            y: tile.y + 24,
            vx: (Math.random() - 0.5) * 4,
            vy: -Math.random() * 4,
            color: '#f59e0b',
            life: 1
          });
        }
      }
    }
  };

  const sellAllHarvest = () => {
    const s = stateRef.current;
    let earned = 0;
    earned += (s.inventory.wheat || 0) * 15;
    earned += (s.inventory.carrot || 0) * 28;
    earned += (s.inventory.strawberry || 0) * 45;
    earned += (s.inventory.pumpkin || 0) * 80;

    if (earned > 0) {
      sound.playPowerUp();
      s.gold += earned;
      s.inventory = { wheat: 0, carrot: 0, strawberry: 0, pumpkin: 0 };
      setGold(s.gold);
      setInventory({ ...s.inventory });
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

    let tick = 0;

    const loop = () => {
      tick++;
      const state = stateRef.current;
      const { player } = state;

      // Player Movement
      let dx = 0;
      let dy = 0;
      const spd = 3.2;

      if (keysPressed.current['KeyW'] || keysPressed.current['ArrowUp']) dy -= spd;
      if (keysPressed.current['KeyS'] || keysPressed.current['ArrowDown']) dy += spd;
      if (keysPressed.current['KeyA'] || keysPressed.current['ArrowLeft']) dx -= spd;
      if (keysPressed.current['KeyD'] || keysPressed.current['ArrowRight']) dx += spd;

      player.walking = dx !== 0 || dy !== 0;
      if (player.walking) {
        player.x = Math.max(30, Math.min(width - 30, player.x + dx));
        player.y = Math.max(30, Math.min(height - 30, player.y + dy));
        player.frame += 0.15;
        if (Math.abs(dx) > Math.abs(dy)) {
          player.dir = dx > 0 ? 'right' : 'left';
        } else {
          player.dir = dy > 0 ? 'down' : 'up';
        }
      }

      // Space key interact with nearest tile
      if (keysPressed.current['Space'] && tick % 15 === 0) {
        for (const tile of state.tiles) {
          if (Math.hypot(tile.x + 24 - player.x, tile.y + 24 - player.y) < 38) {
            interactPlot(tile);
            break;
          }
        }
      }

      // Crop Growth Simulation
      if (tick % 60 === 0) {
        state.tiles.forEach((t) => {
          if (t.crop && t.crop.stage < 3 && t.watered) {
            t.crop.timer++;
            if (t.crop.timer > 4) {
              t.crop.stage++;
              t.crop.timer = 0;
              // soil dries up when growing
              if (Math.random() > 0.5) t.watered = false;
            }
          }
        });
      }

      // Animals roam
      state.animals.forEach((an) => {
        an.timer--;
        if (an.timer <= 0) {
          an.timer = 60 + Math.random() * 80;
          an.vx = (Math.random() - 0.5) * 0.8;
          an.vy = (Math.random() - 0.5) * 0.8;
        }
        an.x += an.vx;
        an.y += an.vy;
        // Keep inside bounds
        an.x = Math.max(80, Math.min(260, an.x));
        an.y = Math.max(80, Math.min(420, an.y));
      });

      // Update Particles
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.04;
        if (p.life <= 0) state.particles.splice(i, 1);
      }

      // RENDER
      // 1. Lush Green Field
      ctx.fillStyle = '#14532d'; // Deep forest meadow
      ctx.fillRect(0, 0, width, height);

      // Grass texture dots
      ctx.fillStyle = '#166534';
      for (let x = 10; x < width; x += 32) {
        for (let y = 10; y < height; y += 32) {
          ctx.fillRect(x, y, 4, 4);
        }
      }

      // Wooden Fence around Animal Pen (left)
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 4;
      ctx.strokeRect(60, 60, 210, 380);

      // Fence Posts
      ctx.fillStyle = '#92400e';
      for (let fx = 60; fx <= 270; fx += 35) {
        ctx.fillRect(fx - 4, 54, 8, 14);
        ctx.fillRect(fx - 4, 434, 8, 14);
      }

      // Draw Barn / Shed (Top Right)
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(660, 40, 110, 80);
      ctx.fillStyle = '#7f1d1d';
      ctx.beginPath();
      ctx.moveTo(650, 40);
      ctx.lineTo(715, 10);
      ctx.lineTo(780, 40);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(700, 75, 30, 45); // Barn door

      // Market Stall (Bottom Right)
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(660, 360, 110, 80);
      ctx.fillStyle = '#e0f2fe';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('PAZARCI', 685, 395);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('🏪 SAT', 695, 415);

      // Draw Tiles (Farm plots)
      state.tiles.forEach((t) => {
        // Soil
        ctx.fillStyle = t.watered ? '#451a03' : '#78350f';
        ctx.fillRect(t.x, t.y, 44, 44);
        ctx.strokeStyle = t.watered ? '#78350f' : '#92400e';
        ctx.lineWidth = 1;
        ctx.strokeRect(t.x, t.y, 44, 44);

        // Crop rendering
        if (t.crop) {
          const cx = t.x + 22;
          const cy = t.y + 22;
          const st = t.crop.stage; // 0, 1, 2, 3

          if (st === 0) {
            // Tiny sprout
            ctx.fillStyle = '#86efac';
            ctx.beginPath();
            ctx.arc(cx, cy, 3, 0, Math.PI * 2);
            ctx.fill();
          } else if (st === 1) {
            // Young leaves
            ctx.fillStyle = '#22c55e';
            ctx.fillRect(cx - 3, cy - 6, 6, 12);
          } else if (st === 2) {
            // Flowering
            ctx.fillStyle = '#16a34a';
            ctx.fillRect(cx - 5, cy - 10, 10, 18);
          } else {
            // Full grown fruit/crop!
            ctx.save();
            ctx.font = '22px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const icon =
              t.crop.type === 'wheat'
                ? '🌾'
                : t.crop.type === 'carrot'
                ? '🥕'
                : t.crop.type === 'strawberry'
                ? '🍓'
                : '🎃';
            ctx.fillText(icon, cx, cy);
            ctx.restore();
          }
        }
      });

      // Draw Animals
      state.animals.forEach((an) => {
        ctx.save();
        ctx.font = an.type === 'chicken' ? '18px sans-serif' : '26px sans-serif';
        ctx.fillText(an.type === 'chicken' ? '🐔' : '🐑', an.x, an.y);
        ctx.restore();
      });

      // Draw Player Character
      const bob = Math.sin(player.frame) * 2;
      ctx.save();
      ctx.translate(player.x, player.y + bob);

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(0, 14, 12, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Body (Overalls & Straw Hat)
      ctx.fillStyle = '#0284c7'; // Denim overalls
      ctx.fillRect(-7, 0, 14, 14);

      // Shirt
      ctx.fillStyle = '#ef4444'; // Red plaid shirt
      ctx.fillRect(-8, -6, 16, 8);

      // Head
      ctx.fillStyle = '#fed7aa'; // Skin
      ctx.beginPath();
      ctx.arc(0, -10, 7, 0, Math.PI * 2);
      ctx.fill();

      // Straw Hat
      ctx.fillStyle = '#fde047';
      ctx.fillRect(-12, -16, 24, 4);
      ctx.fillRect(-6, -21, 12, 6);

      ctx.restore();

      // Draw Particles
      state.particles.forEach((p) => {
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Atmosphere Lighting (Sunset / Night glow)
      if (dayNight === 'sunset') {
        ctx.fillStyle = 'rgba(249, 115, 22, 0.15)';
        ctx.fillRect(0, 0, width, height);
      } else if (dayNight === 'night') {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
        ctx.fillRect(0, 0, width, height);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [selectedTool, selectedSeed, dayNight]);

  return (
    <div className="flex flex-col items-center bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl overflow-hidden relative">
      {/* Top Header Bar */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-black text-lg text-white flex items-center gap-2">
              Yeşil Vadi Çiftliği: Deluxe Açık Dünya
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold uppercase">
                Gelişmiş Grafikler
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Tarlayı sür, sula, ürünleri hasat et, hayvanları sev ve pazarcıda satarak zenginleş!
            </p>
          </div>
        </div>

        {/* Gold & Atmosphere toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-sm text-amber-400 font-bold">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>{gold} Altın</span>
          </div>

          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => {
                sound.playClick();
                setDayNight(dayNight === 'day' ? 'sunset' : dayNight === 'sunset' ? 'night' : 'day');
              }}
              className="flex items-center gap-1.5 px-3 py-1 text-slate-300 hover:text-white font-semibold transition"
            >
              {dayNight === 'day' && <Sun className="w-3.5 h-3.5 text-amber-400" />}
              {dayNight === 'sunset' && <Sun className="w-3.5 h-3.5 text-orange-400" />}
              {dayNight === 'night' && <Moon className="w-3.5 h-3.5 text-indigo-400" />}
              <span>{dayNight === 'day' ? 'Gündüz' : dayNight === 'sunset' ? 'Gün Batımı' : 'Gece'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="relative mt-4 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner flex items-center justify-center max-w-full">
        <canvas
          ref={canvasRef}
          onClick={(e) => {
            const rect = canvasRef.current?.getBoundingClientRect();
            if (!rect) return;
            const clickX = ((e.clientX - rect.left) / rect.width) * 800;
            const clickY = ((e.clientY - rect.top) / rect.height) * 500;

            // Check if clicked market stall
            if (clickX >= 660 && clickX <= 770 && clickY >= 360 && clickY <= 440) {
              sellAllHarvest();
              return;
            }

            // Check if clicked any tile
            for (const tile of stateRef.current.tiles) {
              if (clickX >= tile.x && clickX <= tile.x + 44 && clickY >= tile.y && clickY <= tile.y + 44) {
                interactPlot(tile);
                break;
              }
            }
          }}
          className="block max-w-full h-auto cursor-pointer"
        />
      </div>

      {/* Toolbar & Inventory Bar */}
      <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-4 mt-5 text-xs">
        {/* Tools (1-4) */}
        <div className="md:col-span-6 bg-slate-950 border border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-2">
          <span className="font-bold text-slate-400 font-mono text-[11px] uppercase">
            Aletler (1-4):
          </span>
          <div className="flex items-center gap-1.5">
            {[
              { id: 'hoe', name: 'Çapa (1)', icon: '⛏️' },
              { id: 'water', name: 'Suluk (2)', icon: '💧' },
              { id: 'seed', name: 'Tohum (3)', icon: '🌱' },
              { id: 'harvest', name: 'Hasat (4)', icon: '🧺' }
            ].map((tool) => (
              <button
                key={tool.id}
                onClick={() => {
                  sound.playClick();
                  setSelectedTool(tool.id as any);
                }}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold transition text-xs ${
                  selectedTool === tool.id
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>{tool.icon}</span>
                <span>{tool.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Seed Choice if Seed tool selected */}
        <div className="md:col-span-3 bg-slate-950 border border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-1">
          {[
            { id: 'wheat', name: 'Buğday (5g)', icon: '🌾' },
            { id: 'carrot', name: 'Havuç (10g)', icon: '🥕' },
            { id: 'strawberry', name: 'Çilek (15g)', icon: '🍓' },
            { id: 'pumpkin', name: 'Kabak (25g)', icon: '🎃' }
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => {
                sound.playClick();
                setSelectedSeed(s.id as any);
              }}
              title={s.name}
              className={`p-2 rounded-xl text-base transition ${
                selectedSeed === s.id
                  ? 'bg-emerald-500/30 border border-emerald-400 scale-110'
                  : 'bg-slate-900 hover:bg-slate-800'
              }`}
            >
              {s.icon}
            </button>
          ))}
        </div>

        {/* Sell Market Button */}
        <div className="md:col-span-3 bg-slate-950 border border-slate-800 rounded-2xl p-3 flex items-center justify-between">
          <div className="text-[11px] font-mono text-slate-300">
            Sepet: 🌾{inventory.wheat} 🥕{inventory.carrot} 🍓{inventory.strawberry}
          </div>
          <button
            onClick={sellAllHarvest}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold rounded-xl text-xs transition active:scale-95 shadow"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Pazarda Sat
          </button>
        </div>
      </div>
    </div>
  );
};
