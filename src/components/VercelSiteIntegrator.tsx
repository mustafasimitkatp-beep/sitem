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
  ShieldCheck,
  FileCode,
  Settings,
  CheckCircle2
} from 'lucide-react';
import { GAMES_DATA, PLATFORM_INFO } from '../data/games';
import { downloadAllGameLogos, copyTextToClipboard } from '../utils/download';
import { sound } from '../utils/audio';

export const VercelSiteIntegrator: React.FC = () => {
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [allDownloaded, setAllDownloaded] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedNpmrc, setCopiedNpmrc] = useState(false);
  const [copiedVercelJson, setCopiedVercelJson] = useState(false);
  const [copiedInstallCmd, setCopiedInstallCmd] = useState(false);

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

  const npmrcContent = `legacy-peer-deps=true`;

  const vercelJsonContent = `{
  "installCommand": "npm install --legacy-peer-deps",
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}`;

  return (
    <div className="space-y-8">
      {/* Vercel Error Fix Card (Direct Solution for User) */}
      <div className="bg-gradient-to-r from-rose-950/40 via-slate-900 to-amber-950/30 border-2 border-rose-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-rose-500/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 shadow-lg">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold uppercase tracking-wider">
                  VERCEL DERLEME HATASI ÇÖZÜMÜ
                </span>
                <span className="text-xs text-amber-400 font-mono font-bold">
                  (ERESOLVE peer vite conflict)
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-heading text-white mt-1">
                Vercel "npm error peer vite" Hatası Nasıl Çözülür?
              </h2>
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed mt-4">
          Vercel varsayılan olarak <code className="text-rose-400 font-mono">npm install</code> çalıştırırken yeni npm 7+ sürümünün katı eşbağımlılık (peer dependency) kontrolü nedeniyle Vite 8 ve Tailwind eklentileri arasında çakışma uyarısı verip duruyor. 
          Aşağıdaki <strong className="text-white">2 kolay yöntemden birini</strong> uygulayarak 10 saniyede derlemeyi başarıyla tamamlayabilirsiniz:
        </p>

        {/* 2 Quick Solutions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
          {/* Solution 1: .npmrc */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <span className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xs">
                    1
                  </span>
                  <span>En Kolay: Projeye .npmrc Dosyası Ekleyin</span>
                </div>
                <button
                  onClick={async () => {
                    sound.playClick();
                    await copyTextToClipboard(npmrcContent);
                    setCopiedNpmrc(true);
                    setTimeout(() => setCopiedNpmrc(false), 2000);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition"
                >
                  {copiedNpmrc ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedNpmrc ? 'Kopyalandı' : 'Kopyala'}
                </button>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                Projenizin en üst ana dizininde (package.json yanına) <code className="text-emerald-400 font-mono font-bold">.npmrc</code> isimli bir dosya oluşturun ve içine şunu yazın:
              </p>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs text-emerald-300">
                legacy-peer-deps=true
              </div>

              <p className="text-[11px] text-slate-500 mt-2">
                ✅ Projenizde bu dosya hazır oluşturuldu. GitHub'a push ettiğinizde Vercel otomatik olarak hatasız derler!
              </p>
            </div>
          </div>

          {/* Solution 2: Vercel Dashboard Override */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                  <span className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-xs">
                    2
                  </span>
                  <span>Vercel Panelinden Install Komutunu Değiştirin</span>
                </div>
                <button
                  onClick={async () => {
                    sound.playClick();
                    await copyTextToClipboard('npm install --legacy-peer-deps');
                    setCopiedInstallCmd(true);
                    setTimeout(() => setCopiedInstallCmd(false), 2000);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition"
                >
                  {copiedInstallCmd ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedInstallCmd ? 'Kopyalandı' : 'Komutu Kopyala'}
                </button>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                Kod değiştirmeden Vercel panelinden anında düzeltmek için:
              </p>

              <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside font-sans">
                <li><a href="https://vercel.com/dashboard" target="_blank" rel="noreferrer" className="text-amber-400 hover:underline">Vercel Dashboard</a>'a gidin ve projenizi açın.</li>
                <li><strong>Settings</strong> &gt; <strong>Build & Development Settings</strong> sekmesine tıklayın.</li>
                <li><strong>Install Command</strong> seçeneğini bulun ve yanındaki <strong>OVERRIDE</strong> anahtarını açın.</li>
                <li>Kutuya şunu yapıştırın: <code className="bg-slate-900 px-2 py-0.5 rounded text-cyan-300 font-mono text-[11px]">npm install --legacy-peer-deps</code></li>
                <li><strong>Save</strong> butonuna basın ve sol üstten <strong>Redeploy</strong> deyin!</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Main Asset & Game Integrator */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 mb-1">
              <FolderSync className="w-4 h-4" />
              <span>OYUN LOGOLARI VE DOSYA ENTEGRASYONU</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-white">
              Yeni Oyun Logolarını Sitenize Ekleyin
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Hazırlanan tüm amblem logolarını projenize tek tıkla indirip ekleyin.
            </p>
          </div>

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
                Tüm Logoları İndir (.JPG)
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* File list */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-5">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Oyun Logoları Dosya İsimleri</span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Logolar indirildiğinde projenizin <code className="text-white font-mono">src/assets/images/</code> klasörüne atılabilir:
            </p>
            <ul className="space-y-1.5 font-mono text-[11px] text-slate-300">
              {GAMES_DATA.map((g) => (
                <li key={g.id} className="flex items-center justify-between p-2 bg-slate-900/80 rounded-xl border border-slate-800/60">
                  <span className="text-amber-400 font-bold">{g.shortName}</span>
                  <span className="text-slate-400 truncate max-w-[220px]">{g.originalVercelPath}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Code Object */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-cyan-400">
                  Güncel games.ts Kodu
                </span>
                <button
                  onClick={async () => {
                    sound.playClick();
                    await copyTextToClipboard(fullGamesCode);
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode ? 'Kopyalandı' : 'Kodu Kopyala'}
                </button>
              </div>
              <pre className="p-3 bg-slate-900 rounded-xl text-[11px] font-mono text-slate-300 overflow-x-auto border border-slate-800 max-h-48 leading-relaxed">
                {fullGamesCode}
              </pre>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
              <span>Next.js / Vite / Vercel Tam Uyumlu</span>
              <a
                href="https://web-sitem-xi-ashy.vercel.app/"
                target="_blank"
                rel="noreferrer"
                className="text-amber-400 hover:underline flex items-center gap-1 font-semibold"
              >
                Sitenizi Açın
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
