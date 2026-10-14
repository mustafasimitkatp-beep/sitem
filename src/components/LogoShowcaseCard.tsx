import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Download,
  Sliders,
  ExternalLink,
  Users,
  Gamepad,
  Sparkles,
  Check,
  Copy,
  Info,
  Maximize2
} from 'lucide-react';
import { GameItem, LogoViewMode } from '../types/game';
import { VectorBadgeRenderer } from './VectorBadgeRenderer';
import { downloadImageByUrl, copyTextToClipboard } from '../utils/download';
import { sound } from '../utils/audio';

interface LogoShowcaseCardProps {
  game: GameItem;
  onOpenStudio: (game: GameItem) => void;
  onPreviewInSite: (gameId: string) => void;
  onPlayGame: (game: GameItem) => void;
}

export const LogoShowcaseCard: React.FC<LogoShowcaseCardProps> = ({
  game,
  onOpenStudio,
  onPreviewInSite,
  onPlayGame
}) => {
  const [viewMode, setViewMode] = useState<LogoViewMode>('generated');
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Download high-res image
  const handleDownloadImage = async (useOriginalVercelName: boolean = true) => {
    sound.playPowerUp();
    setDownloading(true);
    const filename = useOriginalVercelName
      ? game.originalVercelPath
      : `${game.id}_official_logo.jpg`;
    await downloadImageByUrl(game.coverImage, filename);
    setDownloading(false);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  const handleCopyCode = async () => {
    sound.playClick();
    const code = `coverImage: "${game.coverImage}"`;
    const ok = await copyTextToClipboard(code);
    if (ok) {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-3xl overflow-hidden shadow-xl flex flex-col"
      style={{
        boxShadow: `0 10px 30px -10px ${game.accentColor}25`
      }}
    >
      {/* Top Banner & Category Bar */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between gap-3 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: game.accentColor, boxShadow: `0 0 10px ${game.accentColor}` }}
          />
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
            {game.category}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Users className="w-3.5 h-3.5 text-slate-500" />
          <span>{game.players}</span>
        </div>
      </div>

      {/* Main Logo Display Canvas */}
      <div className="relative aspect-square w-full bg-slate-950 flex items-center justify-center p-4 overflow-hidden">
        {/* Subtle background ambient mesh */}
        <div
          className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, ${game.accentColor} 0%, transparent 70%)`
          }}
        />

        {/* View mode switcher pills */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-800 shadow-md">
          <button
            onClick={() => {
              sound.playClick();
              setViewMode('generated');
            }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
              viewMode === 'generated'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Resmi Amblem
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setViewMode('vector');
            }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
              viewMode === 'vector'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Vektörel
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setViewMode('card');
            }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
              viewMode === 'card'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Site Kartı
          </button>
        </div>

        {/* Quick action button top right: Open studio */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenStudio(game);
          }}
          className="absolute top-3 right-3 z-20 p-2 bg-slate-900/90 hover:bg-slate-800 text-amber-400 border border-slate-800 rounded-xl shadow-md transition active:scale-95 flex items-center gap-1.5 text-xs font-semibold"
          title="Tasarımcıda Düzenle"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Özelleştir</span>
        </button>

        {/* Mode 1: Generated Master High-Res Logo */}
        {viewMode === 'generated' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full h-full flex items-center justify-center relative group/img cursor-pointer"
            onClick={() => onOpenStudio(game)}
          >
            <img
              src={game.coverImage}
              alt={game.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain rounded-2xl drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)] transition-transform duration-500 group-hover/img:scale-105"
            />
            <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover/img:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
              <span className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-bold text-amber-400 flex items-center gap-1.5 shadow-xl">
                <Maximize2 className="w-3.5 h-3.5" />
                Amblemi İncele & Düzenle
              </span>
            </div>
          </motion.div>
        )}

        {/* Mode 2: Vector Scalable Badge */}
        {viewMode === 'vector' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full h-full flex items-center justify-center"
          >
            <VectorBadgeRenderer
              config={{
                title: game.shortName,
                subtitle: game.tagline,
                category: game.category,
                icon: game.iconName,
                badgeShape: game.badgeShape,
                primaryColor: game.accentColor,
                secondaryColor: game.secondaryColor,
                glowColor: game.glowColor,
                glowIntensity: 80,
                showScanlines: true,
                showSparkles: true,
                showRays: true,
                borderWidth: 4,
                fontStyle: 'arcade'
              }}
              size={290}
            />
          </motion.div>
        )}

        {/* Mode 3: NovaArcade Site Card Mockup */}
        {viewMode === 'card' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-[300px] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col text-left"
          >
            <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
              <img
                src={game.coverImage}
                alt={game.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-slate-950/80 backdrop-blur-md text-[10px] font-bold text-amber-400 rounded-md border border-slate-800">
                {game.category}
              </span>
            </div>
            <div className="p-3">
              <div className="font-bold text-white text-xs truncate">{game.title}</div>
              <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{game.tagline}</p>
              <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-mono">1.2k Oyuncu</span>
                <span className="px-2 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-bold rounded">
                  Hemen Oyna
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Info & Details Section */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-heading text-lg font-bold text-white leading-snug">
                {game.title}
              </h3>
              <p className="text-xs text-amber-400/90 font-medium mt-0.5">
                {game.tagline}
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed mt-2.5 line-clamp-2">
            {game.description}
          </p>

          {/* Controls list */}
          <div className="mt-3 bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5">
            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Gamepad className="w-3 h-3 text-amber-400" />
              Kontrol Rehberi
            </div>
            <div className="space-y-1">
              {game.controlsHelp.slice(0, 2).map((ctrl, i) => (
                <div key={i} className="flex items-center justify-between text-[11px]">
                  <code className="text-slate-300 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 font-mono text-[10px]">
                    {ctrl.key}
                  </code>
                  <span className="text-slate-400 text-right truncate max-w-[170px]">
                    {ctrl.action}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
          {/* Main Play Game Button */}
          <button
            onClick={() => {
              sound.playPowerUp();
              onPlayGame(game);
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-400 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-pink-500/20 transition active:scale-95"
          >
            <Gamepad className="w-4 h-4 fill-current" />
            <span>Hemen Oyna {game.isMultiplayer ? '(2 Kişi / 1 PC)' : ''}</span>
          </button>

          {/* Download & Customize Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDownloadImage(true)}
              disabled={downloading}
              className="flex items-center justify-center gap-2 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-xl text-xs transition active:scale-95 disabled:opacity-50"
              title={`Vercel için '${game.originalVercelPath}' adıyla indir`}
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  İndirildi!
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  Logoyu İndir
                </>
              )}
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onOpenStudio(game);
              }}
              className="flex items-center justify-center gap-2 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 font-semibold rounded-xl text-xs transition active:scale-95"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              Özelleştir
            </button>
          </div>

          {/* Secondary Helpers */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <button
              onClick={handleCopyCode}
              className="hover:text-amber-400 transition flex items-center gap-1"
              title="coverImage kodunu kopyala"
            >
              {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copiedCode ? 'Kopyalandı' : 'Kodu Kopyala'}
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onPreviewInSite(game.id);
              }}
              className="hover:text-amber-400 transition flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3 text-slate-500" />
              Sitede Gör
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
