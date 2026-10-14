import React, { useState } from 'react';
import {
  Gamepad2,
  Trophy,
  Volume2,
  VolumeX,
  Play,
  Users,
  Star,
  ExternalLink,
  Sparkles,
  Maximize2
} from 'lucide-react';
import { GAMES_DATA } from '../data/games';
import { sound } from '../utils/audio';

interface NovaArcadeLivePreviewProps {
  initialGameId?: string;
  onOpenStudioForGame: (gameId: string) => void;
}

export const NovaArcadeLivePreview: React.FC<NovaArcadeLivePreviewProps> = ({
  initialGameId = 'farm',
  onOpenStudioForGame
}) => {
  const [activeGameId, setActiveGameId] = useState<string>(initialGameId);
  const [filter, setFilter] = useState<string>('all');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const activeGame = GAMES_DATA.find((g) => g.id === activeGameId) || GAMES_DATA[0];

  const filteredGames = filter === 'all'
    ? GAMES_DATA
    : GAMES_DATA.filter((g) => g.id === filter);

  const toggleSound = () => {
    sound.setMuted(soundEnabled);
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) sound.playClick();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
      {/* Simulation Browser Bar */}
      <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="ml-3 font-mono text-[11px] text-slate-400 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800 flex items-center gap-1.5 truncate max-w-xs sm:max-w-md">
            <span>🔒</span>
            <span className="text-slate-300">https://web-sitem-xi-ashy.vercel.app/</span>
            <span className="text-amber-400 font-semibold">(Yeni Logolarla Canlı Önizleme)</span>
          </span>
        </div>

        <a
          href="https://web-sitem-xi-ashy.vercel.app/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-amber-400 hover:text-amber-300 text-[11px] font-semibold"
        >
          <span className="hidden sm:inline">Gerçek Siteyi Aç</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Simulated Website Content */}
      <div className="bg-slate-950 p-4 sm:p-6 space-y-6">
        {/* Simulated Site Header */}
        <header className="flex items-center justify-between pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/30">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <div>
              <div className="font-heading font-black text-lg text-white tracking-wider flex items-center gap-1.5">
                NOVA<span className="text-amber-400">ARCADE</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono tracking-tight">
                En Akıcı Web Oyun Platformu
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleSound}
              className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800 transition"
              title={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
            </button>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-amber-400">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Skor: 12,450</span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center font-bold text-xs">
              M
            </div>
          </div>
        </header>

        {/* Top Banner Notice */}
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-orange-500/10 border border-amber-500/30 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="px-2 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-black rounded-md tracking-wider uppercase">
              YENİ LOGOLAR
            </span>
            <span className="text-xs font-bold text-white">
              🔥 5 Oyunun Tüm Yeni Amblem & Kapak Logoları Aktif Edildi!
            </span>
          </div>
          <span className="text-[11px] text-slate-300">
            Hemen dilediğin oyuna tıkla ve logoların sitede nasıl durduğunu gör.
          </span>
        </div>

        {/* Hero Featured Game Section */}
        <div
          className="relative rounded-3xl p-6 sm:p-8 overflow-hidden border border-slate-800 flex flex-col lg:flex-row items-center gap-8 justify-between"
          style={{
            background: `radial-gradient(circle at 70% 50%, ${activeGame.accentColor}20 0%, #090d16 80%)`
          }}
        >
          {/* Left Text */}
          <div className="max-w-md space-y-3 z-10 text-left">
            <div className="flex items-center gap-2">
              <span
                className="px-2.5 py-1 text-[11px] font-black rounded-lg uppercase tracking-wider text-slate-950 font-mono"
                style={{ backgroundColor: activeGame.accentColor }}
              >
                {activeGame.category}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Users className="w-3 h-3" />
                {activeGame.players}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black font-heading text-white leading-tight">
              {activeGame.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {activeGame.description}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => sound.playPowerUp()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-slate-950 font-bold text-xs shadow-lg transition active:scale-95"
                style={{ backgroundColor: activeGame.accentColor }}
              >
                <Play className="w-4 h-4 fill-current" />
                Oyunu Başlat
              </button>

              <button
                onClick={() => onOpenStudioForGame(activeGame.id)}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900/80 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold border border-slate-700 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Logoyu Düzenle
              </button>
            </div>
          </div>

          {/* Right Logo Display */}
          <div className="relative z-10 w-64 h-64 sm:w-72 sm:h-72 shrink-0 flex items-center justify-center">
            <div
              className="absolute inset-0 rounded-3xl blur-2xl opacity-40 transition-all duration-500"
              style={{ backgroundColor: activeGame.accentColor }}
            />
            <img
              src={activeGame.coverImage}
              alt={activeGame.title}
              referrerPolicy="no-referrer"
              className="relative w-full h-full object-contain rounded-2xl drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)] border border-slate-700/50"
            />
          </div>
        </div>

        {/* Filter Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80">
          <button
            onClick={() => {
              sound.playClick();
              setFilter('all');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              filter === 'all'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            Tüm Oyunlar (5)
          </button>
          {GAMES_DATA.map((g) => (
            <button
              key={g.id}
              onClick={() => {
                sound.playClick();
                setFilter(g.id);
                setActiveGameId(g.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                filter === g.id
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white bg-slate-900'
              }`}
            >
              {g.shortName}
            </button>
          ))}
        </div>

        {/* Games Grid inside Simulated Site */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {filteredGames.map((game) => {
            const isSelected = game.id === activeGameId;
            return (
              <div
                key={game.id}
                onClick={() => {
                  sound.playClick();
                  setActiveGameId(game.id);
                }}
                className={`cursor-pointer group relative bg-slate-900 rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col ${
                  isSelected
                    ? 'border-amber-400 shadow-lg shadow-amber-500/20 scale-[1.02]'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="relative aspect-square w-full bg-slate-950 overflow-hidden">
                  <img
                    src={game.coverImage}
                    alt={game.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-slate-950/80 backdrop-blur-md rounded-md text-[9px] font-bold text-amber-400 border border-slate-800">
                    {game.category}
                  </div>
                </div>

                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-heading font-bold text-xs text-white truncate">
                      {game.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                      {game.tagline}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500 font-mono">{game.players}</span>
                    <span
                      className="px-2 py-0.5 rounded font-bold transition text-slate-950"
                      style={{ backgroundColor: game.accentColor }}
                    >
                      Seç
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
