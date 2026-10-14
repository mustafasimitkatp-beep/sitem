import React, { useState } from 'react';
import {
  Download,
  Copy,
  Check,
  AlertTriangle,
  FolderSync,
  Terminal,
  ExternalLink,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { GAMES_DATA, PLATFORM_INFO } from '../data/games';
import { downloadAllGameLogos, copyTextToClipboard } from '../utils/download';
import { sound } from '../utils/audio';

export const VercelSiteIntegrator: React.FC = () => {
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [allDownloaded, setAllDownloaded] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleDownloadAll = async () => {
    sound.playPowerUp();
    setDownloadingAll(true);
    await downloadAllGameLogos(GAMES_DATA, true);
    setDownloadingAll(false);
    setAllDownloaded(true);
    setTimeout(() => setAllDownloaded(false), 3000);
  };

  const fullGamesCode = `// web-sitem-xi-ashy.vercel.app için Güncel Oyun Listesi
export const games = [
${GAMES_DATA.map((g) => `  {
    id: "${g.id}",
    title: "${g.title}",
    tagline: "${g.tagline}",
    category: "${g.category}",
    players: "${g.players}",
    coverImage: "/src/assets/images/${g.originalVercelPath}",
    description: "${g.description}"
  }`).join(',\n')}
];`;

  const handleCopyCode = async () => {
    sound.playClick();
    const ok = await copyTextToClipboard(fullGamesCode);
    if (ok) {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      {/* Background glow decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 mb-1">
            <FolderSync className="w-4 h-4" />
            <span>VERCEL ENTEGRASYON & ONARIM REHBERİ</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-white">
            web-sitem-xi-ashy.vercel.app Oyun Logolarını Ekle
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Sitenizdeki 5 oyun için özel tasarlanan logoları projenize 2 farklı yöntemle anında entegre edebilirsiniz.
          </p>
        </div>

        {/* Action Button: Batch Download */}
        <button
          onClick={handleDownloadAll}
          disabled={downloadingAll}
          className="flex items-center justify-center gap-2.5 px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-2xl shadow-xl shadow-amber-500/20 transition active:scale-95 disabled:opacity-50 text-sm whitespace-nowrap"
        >
          {allDownloaded ? (
            <>
              <Check className="w-4 h-4" />
              Tüm Logolar İndirildi!
            </>
          ) : downloadingAll ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              İndiriliyor...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Tüm 5 Logoyu İndir (Vercel İsimli)
            </>
          )}
        </button>
      </div>

      {/* Step by step guide */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Step 1: Direct File Drop */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xs">
                1
              </span>
              <span>Yöntem A: Dosyaları Klasöre Atın (Kod Değişmeden)</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Logoları yukarıdaki butonla indirdiğinizde, tam olarak Vercel sitenizin aradığı isimlerle iner:
            </p>

            <ul className="mt-3 space-y-1.5 font-mono text-[11px] text-slate-300">
              {GAMES_DATA.map((g) => (
                <li key={g.id} className="flex items-center justify-between p-1.5 bg-slate-900/80 rounded-lg border border-slate-800/60">
                  <span className="text-amber-400 font-bold">{g.shortName}</span>
                  <span className="text-slate-400 truncate max-w-[220px]">{g.originalVercelPath}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4 p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Bu 5 dosyayı projenizin <code className="font-bold text-white">src/assets/images/</code> klasörüne yükleyip Vercel'e göndermeniz yeterlidir!
              </span>
            </div>
          </div>
        </div>

        {/* Step 2: Code Snippet */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <span className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-xs">
                  2
                </span>
                <span>Yöntem B: Güncel Kod Nesnesini Kopyalayın</span>
              </div>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition active:scale-95"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCode ? 'Kopyalandı' : 'Kodu Kopyala'}
              </button>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-2">
              Oyun dizinizi ve logolarınızı doğrudan projenizin koduna yapıştırabilirsiniz:
            </p>

            <pre className="p-3 bg-slate-900 rounded-xl text-[11px] font-mono text-slate-300 overflow-x-auto border border-slate-800 max-h-48 leading-relaxed">
              {fullGamesCode}
            </pre>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Terminal className="w-3.5 h-3.5 text-slate-500" />
              <span>Vercel / Next.js / Vite uyumlu</span>
            </span>
            <a
              href="https://web-sitem-xi-ashy.vercel.app/"
              target="_blank"
              rel="noreferrer"
              className="text-amber-400 hover:underline flex items-center gap-1 font-semibold"
            >
              Vercel Sitenizi Ziyaret Edin
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
