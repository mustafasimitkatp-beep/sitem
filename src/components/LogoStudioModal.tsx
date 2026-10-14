import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Download,
  Copy,
  Check,
  Sparkles,
  Sliders,
  Palette,
  Shield,
  Layers,
  Code2
} from 'lucide-react';
import { GameItem, LogoCustomizerState } from '../types/game';
import { VectorBadgeRenderer } from './VectorBadgeRenderer';
import { downloadSvgContent, copySvgToClipboard, copyTextToClipboard } from '../utils/download';
import { sound } from '../utils/audio';

interface LogoStudioModalProps {
  game: GameItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LogoStudioModal: React.FC<LogoStudioModalProps> = ({
  game,
  isOpen,
  onClose
}) => {
  if (!isOpen || !game) return null;

  const [config, setConfig] = useState<LogoCustomizerState>({
    title: game.shortName,
    subtitle: game.tagline,
    category: game.category,
    icon: game.iconName,
    badgeShape: game.badgeShape,
    primaryColor: game.accentColor,
    secondaryColor: game.secondaryColor,
    glowColor: game.glowColor,
    glowIntensity: 70,
    showScanlines: true,
    showSparkles: true,
    showRays: true,
    borderWidth: 4,
    fontStyle: 'arcade'
  });

  const [copiedSvg, setCopiedSvg] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'code'>('editor');

  const handleDownloadSvg = () => {
    sound.playSuccess();
    const svgEl = document.getElementById('studio-badge-svg');
    if (svgEl) {
      const serializer = new XMLSerializer();
      const svgStr = serializer.serializeToString(svgEl);
      downloadSvgContent(svgStr, `${game.id}_vector_logo.svg`);
    }
  };

  const handleCopySvg = async () => {
    sound.playClick();
    const svgEl = document.getElementById('studio-badge-svg');
    if (svgEl) {
      const serializer = new XMLSerializer();
      const svgStr = serializer.serializeToString(svgEl);
      const ok = await copySvgToClipboard(svgStr);
      if (ok) {
        setCopiedSvg(true);
        setTimeout(() => setCopiedSvg(false), 2000);
      }
    }
  };

  const handleCopySnippet = async () => {
    sound.playClick();
    const snippet = `// NovaArcade Oyun Güncellemesi: ${game.title}
{
  id: '${game.id}',
  title: '${game.title}',
  tagline: '${config.subtitle}',
  category: '${config.category}',
  players: '${game.players}',
  coverImage: '${game.coverImage}',
  accentColor: '${config.primaryColor}'
}`;
    const ok = await copyTextToClipboard(snippet);
    if (ok) {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                style={{ backgroundColor: `${config.primaryColor}20`, border: `1px solid ${config.primaryColor}50` }}
              >
                <Sliders className="w-5 h-5" style={{ color: config.primaryColor }} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-heading flex items-center gap-2">
                  {game.shortName} Logo & Amblem Stüdyosu
                </h3>
                <p className="text-xs text-slate-400">
                  Renkleri, şekli, rozet katmanlarını ve tipografiyi özelleştirip SVG veya kod olarak dışa aktarın.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  sound.playClick();
                  setActiveTab(activeTab === 'editor' ? 'code' : 'editor');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                  activeTab === 'code'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                {activeTab === 'code' ? 'Tasarımcıya Dön' : 'Site Kodunu Gör'}
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

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Preview Box */}
            <div className="md:col-span-5 flex flex-col items-center justify-center bg-slate-950/70 border border-slate-800/80 rounded-2xl p-6 relative group overflow-hidden">
              <div
                className="absolute inset-0 opacity-20 pointer-events-none transition-all duration-700"
                style={{
                  background: `radial-gradient(circle at center, ${config.primaryColor} 0%, transparent 70%)`
                }}
              />

              {/* Live Badge Preview */}
              <div className="py-2">
                <VectorBadgeRenderer config={config} size={280} id="studio-badge-svg" />
              </div>

              {/* Action Buttons */}
              <div className="w-full mt-4 grid grid-cols-2 gap-2 z-10">
                <button
                  onClick={handleDownloadSvg}
                  className="flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg transition active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  SVG İndir
                </button>

                <button
                  onClick={handleCopySvg}
                  className="flex items-center justify-center gap-2 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-xl text-xs transition active:scale-95"
                >
                  {copiedSvg ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSvg ? 'Kopyalandı!' : 'SVG Kopyala'}
                </button>
              </div>

              <div className="w-full mt-2 text-center text-[11px] text-slate-500">
                Ölçeklenebilir vektörel logo & yüksek çözünürlüklü çıktı
              </div>
            </div>

            {/* Right Controls Panel */}
            <div className="md:col-span-7 flex flex-col gap-5">
              {activeTab === 'code' ? (
                <div className="flex flex-col h-full bg-slate-950 border border-slate-800 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-semibold text-amber-400">
                      NovaArcade Oyun Nesnesi Kodu
                    </span>
                    <button
                      onClick={handleCopySnippet}
                      className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedCode ? 'Kopyalandı' : 'Kodu Kopyala'}
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-900 rounded-xl text-xs font-mono text-slate-300 overflow-x-auto border border-slate-800 flex-1 leading-relaxed">
{`// ${game.title} - Güncel Logo & Veri Nesnesi
{
  id: "${game.id}",
  title: "${game.title}",
  tagline: "${config.subtitle}",
  category: "${config.category}",
  players: "${game.players}",
  coverImage: "${game.coverImage}",
  originalFile: "${game.originalVercelPath}",
  accentColor: "${config.primaryColor}",
  secondaryColor: "${config.secondaryColor}",
  badgeShape: "${config.badgeShape}"
}`}
                  </pre>
                  <p className="text-[11px] text-slate-400 mt-2">
                    💡 Bu kodu kopyalayıp web sitenizdeki <code className="text-amber-400">games</code> dizisine yapıştırabilirsiniz.
                  </p>
                </div>
              ) : (
                <>
                  {/* Shape Selector */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-amber-400" />
                      Rozet / Amblem Şekli
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {(['shield', 'hexagon', 'circle', 'diamond', 'cyber'] as const).map((shape) => (
                        <button
                          key={shape}
                          onClick={() => {
                            sound.playClick();
                            setConfig({ ...config, badgeShape: shape });
                          }}
                          className={`py-2 px-2 rounded-xl text-xs font-semibold capitalize border transition text-center ${
                            config.badgeShape === shape
                              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-bold'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          {shape === 'shield' && 'Kalkan'}
                          {shape === 'hexagon' && 'Altıgen'}
                          {shape === 'circle' && 'Çember'}
                          {shape === 'diamond' && 'Elmas'}
                          {shape === 'cyber' && 'Siber'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Colors */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-amber-400" />
                      Renk Paleti
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 flex items-center gap-3">
                        <input
                          type="color"
                          value={config.primaryColor}
                          onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                          className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <div className="text-xs">
                          <div className="font-semibold text-slate-200">Ana Renk</div>
                          <div className="font-mono text-slate-400">{config.primaryColor}</div>
                        </div>
                      </div>

                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 flex items-center gap-3">
                        <input
                          type="color"
                          value={config.secondaryColor}
                          onChange={(e) => setConfig({ ...config, secondaryColor: e.target.value })}
                          className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <div className="text-xs">
                          <div className="font-semibold text-slate-200">İkincil Renk</div>
                          <div className="font-mono text-slate-400">{config.secondaryColor}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Text Customization */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-400 mb-1 block">Logo Başlığı</label>
                      <input
                        type="text"
                        value={config.title}
                        onChange={(e) => setConfig({ ...config, title: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-400 mb-1 block">Kategori Başlığı</label>
                      <input
                        type="text"
                        value={config.category}
                        onChange={(e) => setConfig({ ...config, category: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-400 mb-1 block">Slogan / Alt Başlık</label>
                      <input
                        type="text"
                        value={config.subtitle}
                        onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {/* Layer Toggles */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-amber-400" />
                      Efekt ve Katmanlar
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          sound.playClick();
                          setConfig({ ...config, showScanlines: !config.showScanlines });
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                          config.showScanlines
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                            : 'bg-slate-950 text-slate-500 border-slate-800'
                        }`}
                      >
                        ⚡ CRT Tarama Çizgileri
                      </button>

                      <button
                        onClick={() => {
                          sound.playClick();
                          setConfig({ ...config, showRays: !config.showRays });
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                          config.showRays
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                            : 'bg-slate-950 text-slate-500 border-slate-800'
                        }`}
                      >
                        ☀️ Güneş / Işık Işınları
                      </button>

                      <button
                        onClick={() => {
                          sound.playClick();
                          setConfig({
                            ...config,
                            borderWidth: config.borderWidth === 4 ? 8 : 4
                          });
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                          config.borderWidth > 4
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                            : 'bg-slate-950 text-slate-500 border-slate-800'
                        }`}
                      >
                        🛡️ Kalın Neon Kenarlık
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
