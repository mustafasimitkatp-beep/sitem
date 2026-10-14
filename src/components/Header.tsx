import React from 'react';
import {
  Gamepad2,
  Sparkles,
  Download,
  FolderSync,
  Sliders,
  ExternalLink,
  Volume2,
  VolumeX,
  Layers,
  Play,
  Users
} from 'lucide-react';
import { sound } from '../utils/audio';

interface HeaderProps {
  activeTab: 'oyunlar' | 'vitrin' | 'onizleme' | 'entegrasyon';
  setActiveTab: (tab: 'oyunlar' | 'vitrin' | 'onizleme' | 'entegrasyon') => void;
  onOpenStudio: () => void;
  onDownloadAll: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onQuickPlay: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenStudio,
  onDownloadAll,
  soundEnabled,
  onToggleSound,
  onQuickPlay
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo & Brand */}
          <div
            onClick={() => {
              sound.playClick();
              setActiveTab('oyunlar');
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-500 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/25 group-hover:scale-105 transition-transform">
              <Gamepad2 className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-black text-lg sm:text-xl text-white tracking-wider">
                  NOVA<span className="text-amber-400">ARCADE</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest hidden sm:inline">
                  GELİŞMİŞ OYUNLAR & 2P
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono tracking-tight hidden sm:block">
                web-sitem-xi-ashy.vercel.app Gelişmiş Grafikli Oyun Portalı
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-2xl shadow-inner">
            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('oyunlar');
              }}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'oyunlar'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Oyunları Oyna (6)</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('vitrin');
              }}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'vitrin'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Logolar & Tasarım</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('onizleme');
              }}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap hidden md:flex ${
                activeTab === 'onizleme'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Sitede Canlı Önizleme</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('entegrasyon');
              }}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap hidden sm:flex ${
                activeTab === 'entegrasyon'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <FolderSync className="w-3.5 h-3.5" />
              <span>Vercel Aktarım</span>
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleSound}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
              title={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
            </button>

            <button
              onClick={onQuickPlay}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-pink-500 to-amber-500 hover:from-pink-400 hover:to-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg transition active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">2 Kişilik Oyna</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
