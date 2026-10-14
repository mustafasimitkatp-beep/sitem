import React, { useState } from 'react';
import {
  Gamepad2,
  Sparkles,
  Download,
  FolderSync,
  ExternalLink,
  CheckCircle2,
  Users,
  Play,
  Zap,
  Flame,
  Search,
  Swords,
  Trophy,
  Rocket
} from 'lucide-react';
import { GAMES_DATA, PLATFORM_INFO } from './data/games';
import { GameItem } from './types/game';
import { Header } from './components/Header';
import { LogoShowcaseCard } from './components/LogoShowcaseCard';
import { LogoStudioModal } from './components/LogoStudioModal';
import { NovaArcadeLivePreview } from './components/NovaArcadeLivePreview';
import { VercelSiteIntegrator } from './components/VercelSiteIntegrator';
import { GameArenaModal } from './components/GameArenaModal';
import { downloadAllGameLogos } from './utils/download';
import { sound } from './utils/audio';

export default function App() {
  const [activeTab, setActiveTab] = useState<'oyunlar' | 'vitrin' | 'onizleme' | 'entegrasyon'>('oyunlar');
  const [selectedStudioGame, setSelectedStudioGame] = useState<GameItem | null>(null);
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  // Playable Game Arena State
  const [activePlayableGame, setActivePlayableGame] = useState<GameItem | null>(null);
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewGameId, setPreviewGameId] = useState<string>('head_soccer');

  const categories = [
    { id: 'all', label: 'Tüm Yepyeni Oyunlar (6)' },
    { id: '2p', label: '🔥 1 PC / 2 Kişi Oyna (5 Oyun)' },
    { id: 'Spor & 2 Kişilik', label: '⚽ Kafa Topu 1v1' },
    { id: 'Dövüş & 2 Kişilik', label: '🥊 Sokak Dövüşü' },
    { id: 'Yarış & 2 Kişilik', label: '🏎️ Drift Yarışı' },
    { id: 'Rogue-Lite & Aksiyon', label: '🧟 Cyber Survivor' }
  ];

  const filteredGames = GAMES_DATA.filter((game) => {
    let matchesCategory = true;
    if (selectedCategory === '2p') {
      matchesCategory = !!game.isMultiplayer;
    } else if (selectedCategory !== 'all') {
      matchesCategory = game.category === selectedCategory;
    }

    const matchesSearch =
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handlePlayGame = (game: GameItem) => {
    sound.playPowerUp();
    setActivePlayableGame(game);
    setIsGameModalOpen(true);
  };

  const handleOpenStudio = (game: GameItem) => {
    sound.playClick();
    setSelectedStudioGame(game);
    setIsStudioOpen(true);
  };

  const handlePreviewInSite = (gameId: string) => {
    sound.playClick();
    setPreviewGameId(gameId);
    setActiveTab('onizleme');
  };

  const handleDownloadAll = async () => {
    sound.playPowerUp();
    await downloadAllGameLogos(GAMES_DATA, true);
  };

  const toggleSound = () => {
    const nextState = !soundEnabled;
    sound.setMuted(!nextState);
    setSoundEnabled(nextState);
    if (nextState) sound.playClick();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenStudio={() => handleOpenStudio(GAMES_DATA[0])}
        onDownloadAll={handleDownloadAll}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        onQuickPlay={() => handlePlayGame(GAMES_DATA[0])}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-10">
        {/* Hero Section */}
        <div className="relative rounded-3xl bg-gradient-to-b from-slate-900/95 to-slate-900/40 border border-slate-800 p-6 sm:p-10 overflow-hidden shadow-2xl">
          {/* Ambient Glows */}
          <div className="absolute top-0 left-1/4 w-80 h-80 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="max-w-2xl space-y-4 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-pink-500/15 border border-pink-500/30 text-xs font-mono font-bold text-pink-400">
                <Users className="w-4 h-4 text-pink-400" />
                <span>1 BİLGİSAYARDA 2 KİŞİ & GELİŞMİŞ GRAFİKLER</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading text-white tracking-tight leading-[1.15]">
                Daha Eğlenceli, Yüksek Grafikli <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-400 to-amber-400">
                  Yepyeni Web & 2 Kişilik Oyunlar
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                Beğenmediğiniz tüm eski oyunlar değiştirildi! Aynı bilgisayarda yan yana <strong className="text-white">2 kişi oynanabilen</strong> Kafa Topu 1v1, Cyber Brawler Sokak Dövüşü, Micro Drift Yarışı, Tron Yılan ve Cyber Survivor (Rogue-Lite) oyunları eklendi.
              </p>

              {/* Quick Feature Badges */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2 text-xs text-slate-300">
                <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-950/80 rounded-lg border border-slate-800 font-medium">
                  <Swords className="w-3.5 h-3.5 text-pink-400" />
                  5 Adet 2 Kişilik (Aynı PC) Oyun
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-950/80 rounded-lg border border-slate-800 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Canlı Parçacıklı 60 FPS Grafikler
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-950/80 rounded-lg border border-slate-800 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Tarayıcıda Doğrudan Oyna
                </span>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <button
                  onClick={() => handlePlayGame(GAMES_DATA[0])}
                  className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-400 hover:to-amber-400 text-slate-950 font-black rounded-2xl shadow-xl shadow-pink-500/25 transition active:scale-95 text-sm"
                >
                  <Play className="w-4 h-4 fill-current" />
                  2 Kişilik Kafa Topu Başlat
                </button>

                <button
                  onClick={() => handlePlayGame(GAMES_DATA[1])}
                  className="flex items-center gap-2 px-5 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl border border-slate-700 transition active:scale-95 text-sm"
                >
                  <Swords className="w-4 h-4 text-pink-400" />
                  Sokak Dövüşü 1v1
                </button>

                <button
                  onClick={() => handlePlayGame(GAMES_DATA[3])}
                  className="flex items-center gap-2 px-4 py-3.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold rounded-2xl border border-slate-700 transition active:scale-95 text-sm"
                >
                  <Flame className="w-4 h-4 text-amber-400" />
                  Cyber Survivor Oyna
                </button>
              </div>
            </div>

            {/* Quick 2-Player Showcase Card */}
            <div className="w-full lg:w-auto flex items-center justify-center">
              <div className="relative group p-1 rounded-3xl bg-gradient-to-tr from-pink-500/40 via-cyan-500/30 to-amber-500/40 shadow-2xl">
                <div className="bg-slate-950 rounded-[22px] p-5 flex flex-col items-center text-center max-w-xs border border-slate-800">
                  <div className="relative w-48 h-36 rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-inner mb-3 flex items-center justify-center">
                    <img
                      src={GAMES_DATA[0].coverImage}
                      alt="Kafa Topu"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 right-2 px-2 py-0.5 bg-pink-500 text-slate-950 font-black text-[10px] rounded uppercase shadow">
                      2 KİŞİLİK MAÇ
                    </span>
                  </div>
                  <div className="font-heading font-black text-white text-sm">
                    Kafa Topu 1v1: Head Soccer
                  </div>
                  <p className="text-[11px] text-cyan-400 font-mono mt-0.5">
                    P1: A/D/W + Boşluk | P2: Yön + Enter
                  </p>
                  <button
                    onClick={() => handlePlayGame(GAMES_DATA[0])}
                    className="mt-3 w-full py-2.5 bg-gradient-to-r from-cyan-500 to-amber-500 hover:from-cyan-400 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Hemen Maça Başla
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab 1: Playable Games Hub */}
        {activeTab === 'oyunlar' && (
          <section className="space-y-6">
            {/* Filter & Category Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-900/70 border border-slate-800 p-3 sm:p-4 rounded-2xl">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      sound.playClick();
                      setSelectedCategory(cat.id);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                      selectedCategory === cat.id
                        ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                        : 'text-slate-400 hover:text-white bg-slate-950/70 border border-slate-800'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative min-w-[220px]">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Oyun veya tür ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Playable Games Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGames.map((game) => (
                <div
                  key={game.id}
                  className="group relative bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-3xl overflow-hidden shadow-xl flex flex-col transition-all duration-300 hover:-translate-y-1"
                  style={{
                    boxShadow: `0 10px 30px -10px ${game.accentColor}25`
                  }}
                >
                  {/* Top Badge */}
                  <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/40">
                    <span className="text-xs font-bold font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block"
                        style={{ backgroundColor: game.accentColor, boxShadow: `0 0 10px ${game.accentColor}` }}
                      />
                      {game.category}
                    </span>

                    {game.isMultiplayer ? (
                      <span className="px-2 py-0.5 bg-pink-500/20 text-pink-300 border border-pink-500/30 text-[10px] font-mono font-bold rounded-md flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        1 PC / 2 Kişi
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">{game.players}</span>
                    )}
                  </div>

                  {/* Game Cover Art */}
                  <div
                    onClick={() => handlePlayGame(game)}
                    className="relative aspect-video w-full bg-slate-950 overflow-hidden cursor-pointer group/thumb"
                  >
                    <img
                      src={game.coverImage}
                      alt={game.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/thumb:scale-105"
                    />

                    {/* Play Overlay */}
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-2xl scale-90 group-hover/thumb:scale-100 transition-transform">
                        <Play className="w-7 h-7 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Game Info */}
                  <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div>
                      <h3 className="font-heading font-bold text-lg text-white">
                        {game.title}
                      </h3>
                      <p className="text-xs text-amber-400/90 font-medium mt-0.5">
                        {game.tagline}
                      </p>
                      <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                        {game.description}
                      </p>

                      {/* Controls summary */}
                      <div className="mt-3 p-2 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center justify-between">
                        <span className="text-slate-500 font-bold">Kontrol:</span>
                        <span className="text-slate-300 truncate max-w-[200px]">
                          {game.controlsHelp[0].key}
                        </span>
                      </div>
                    </div>

                    {/* Action Play Button */}
                    <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                      <button
                        onClick={() => handlePlayGame(game)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-400 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition active:scale-95"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>Hemen Oyna</span>
                      </button>

                      <button
                        onClick={() => handleOpenStudio(game)}
                        className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition"
                        title="Logoyu Düzenle"
                      >
                        <Sparkles className="w-4 h-4 text-amber-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tab 2: Original Logo Showcase & Customizer */}
        {activeTab === 'vitrin' && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold font-heading text-white">
                  Oyun Logoları ve Tasarım Paketi
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Her oyun için özel hazırlanan yüksek çözünürlüklü amblem logolarını inceleyin, indirin ve düzenleyin.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {GAMES_DATA.map((game) => (
                <LogoShowcaseCard
                  key={game.id}
                  game={game}
                  onOpenStudio={handleOpenStudio}
                  onPreviewInSite={handlePreviewInSite}
                  onPlayGame={handlePlayGame}
                />
              ))}
            </div>
          </section>
        )}

        {/* Tab 3: Simulated Live Site Preview */}
        {activeTab === 'onizleme' && (
          <section className="space-y-6">
            <NovaArcadeLivePreview
              initialGameId={previewGameId}
              onOpenStudioForGame={(id) => {
                const target = GAMES_DATA.find((g) => g.id === id) || GAMES_DATA[0];
                handleOpenStudio(target);
              }}
            />
          </section>
        )}

        {/* Tab 4: Vercel Integrator */}
        {activeTab === 'entegrasyon' && (
          <section className="space-y-6">
            <VercelSiteIntegrator />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-800/80 bg-slate-950 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-amber-400" />
            <span className="font-heading font-bold text-slate-300">NovaArcade</span>
            <span>—</span>
            <span>Gelişmiş Grafikli & 2 Kişilik Web Oyun Portalı</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('oyunlar')}
              className="hover:text-slate-300 transition"
            >
              Oyunlar
            </button>
            <button
              onClick={() => setActiveTab('vitrin')}
              className="hover:text-slate-300 transition"
            >
              Logolar
            </button>
            <button
              onClick={() => setActiveTab('entegrasyon')}
              className="hover:text-slate-300 transition"
            >
              Vercel Çözümü
            </button>
            <a
              href="https://web-sitem-xi-ashy.vercel.app/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-amber-400 transition flex items-center gap-1"
            >
              <span>Vercel Sitesi</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>

      {/* Playable Game Arena Modal */}
      <GameArenaModal
        game={activePlayableGame}
        isOpen={isGameModalOpen}
        onClose={() => setIsGameModalOpen(false)}
        onSelectGame={(g) => setActivePlayableGame(g)}
      />

      {/* Interactive Logo Studio Modal */}
      <LogoStudioModal
        game={selectedStudioGame}
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
      />
    </div>
  );
}
