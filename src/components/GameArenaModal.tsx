import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Maximize2,
  Minimize2,
  Users,
  Sparkles,
  Gamepad2,
  Trophy,
  Flame,
  Zap,
  Swords
} from 'lucide-react';
import { GameItem } from '../types/game';
import { HeadSoccerGame } from '../games/HeadSoccerGame';
import { CyberBrawlerGame } from '../games/CyberBrawlerGame';
import { NeonDriftGame } from '../games/NeonDriftGame';
import { CyberSurvivorGame } from '../games/CyberSurvivorGame';
import { NeonSnakeDuoGame } from '../games/NeonSnakeDuoGame';
import { NeonTankGame } from '../games/NeonTankGame';
import { GAMES_DATA } from '../data/games';
import { sound } from '../utils/audio';

interface GameArenaModalProps {
  game: GameItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectGame: (game: GameItem) => void;
}

export const GameArenaModal: React.FC<GameArenaModalProps> = ({
  game,
  isOpen,
  onClose,
  onSelectGame
}) => {
  if (!isOpen || !game) return null;

  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    sound.playClick();
    setIsFullscreen(!isFullscreen);
  };

  const renderActiveGameComponent = () => {
    switch (game.id) {
      case 'head_soccer':
        return <HeadSoccerGame />;
      case 'cyber_brawler':
        return <CyberBrawlerGame />;
      case 'neon_drift':
        return <NeonDriftGame />;
      case 'cyber_survivor':
        return <CyberSurvivorGame />;
      case 'neon_snake':
        return <NeonSnakeDuoGame />;
      case 'tank':
        return <NeonTankGame />;
      default:
        return <HeadSoccerGame />;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/90 backdrop-blur-xl overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className={`relative w-full ${
            isFullscreen ? 'max-w-none h-full' : 'max-w-5xl'
          } bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col`}
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-950/70">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                style={{ backgroundColor: `${game.accentColor}20`, border: `1px solid ${game.accentColor}50` }}
              >
                <Gamepad2 className="w-5 h-5" style={{ color: game.accentColor }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-white font-heading">
                    {game.title}
                  </h3>
                  {game.isMultiplayer && (
                    <span className="px-2 py-0.5 rounded-md bg-pink-500/20 text-pink-300 border border-pink-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      1 PC / 2 Kişi
                    </span>
                  )}
                  {game.hasGraphicsUpgrade && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold flex items-center gap-1 hidden sm:flex">
                      <Sparkles className="w-3 h-3" />
                      Yüksek Grafikli
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 hidden sm:block">{game.tagline}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleFullscreen}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
                title={isFullscreen ? 'Tam Ekrandan Çık' : 'Tam Ekran'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  onClose();
                }}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
                aria-label="Kapat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Game Switcher Bar */}
          <div className="px-4 py-2 bg-slate-950/40 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[11px] font-mono font-bold text-slate-500 uppercase px-2 hidden sm:inline">
              Oyun Değiştir:
            </span>
            {GAMES_DATA.map((g) => (
              <button
                key={g.id}
                onClick={() => {
                  sound.playClick();
                  onSelectGame(g);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  g.id === game.id
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {g.id === 'head_soccer' && '⚽ Kafa Topu 1v1 (2P)'}
                {g.id === 'cyber_brawler' && '🥊 Sokak Dövüşü 1v1 (2P)'}
                {g.id === 'neon_drift' && '🏎️ Neon Drift (2P)'}
                {g.id === 'cyber_survivor' && '🧟 Cyber Survivor'}
                {g.id === 'neon_snake' && '🐍 Tron Yılan (2P)'}
                {g.id === 'tank' && '⚔️ Neon Tank (2P)'}
              </button>
            ))}
          </div>

          {/* Game Canvas Area */}
          <div className="p-3 sm:p-5 flex-1 overflow-y-auto flex items-center justify-center bg-slate-950/50">
            <div className="w-full flex justify-center">
              {renderActiveGameComponent()}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
