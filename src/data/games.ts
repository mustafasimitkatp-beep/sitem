import { GameItem } from '../types/game';

export const GAMES_DATA: GameItem[] = [
  {
    id: 'head_soccer',
    title: 'Kafa Topu 1v1: Head Soccer Arcade',
    shortName: 'Kafa Topu 1v1',
    tagline: 'Aynı klavyede 2 kişi dev kafalarla gol savaşı, şut ve süper vuruşlar!',
    category: 'Spor & 2 Kişilik',
    players: '2 Kişi (Aynı PC) / VS AI',
    coverImage: '/src/assets/images/game_head_soccer_1791967095844.jpg',
    originalVercelPath: 'game_cover_head_soccer.jpg',
    description: 'Dev anime kafalar, zıplama ve kafa vuruşları, alevli süper şutlar, kale direkleri ve tribün coşkusu! Arkadaşınla aynı bilgisayarda 60 saniyelik efsane maçlar yap!',
    controlsHelp: [
      { key: '1. OYUNCU (Mavi): A, D (Koş) | W (Zıpla)', action: 'Karakteri yönet' },
      { key: '1. OYUNCU: BOŞLUK (Şut) | S (Süper Şut)', action: 'Topa vur' },
      { key: '2. OYUNCU (Kırmızı): Sol, Sağ, Yukarı', action: 'Karakteri yönet' },
      { key: '2. OYUNCU: ENTER / Aşağı (Şut & Süper)', action: 'Topa vur' }
    ],
    accentColor: '#06b6d4',
    secondaryColor: '#f59e0b',
    glowColor: 'rgba(6, 182, 212, 0.45)',
    iconName: 'Trophy',
    badgeShape: 'shield',
    tags: ['2 Kişilik', 'Aynı PC', 'Kafa Topu', 'Fizik & Gol'],
    isMultiplayer: true,
    hasGraphicsUpgrade: true
  },
  {
    id: 'cyber_brawler',
    title: 'Cyber Brawler: Sokak Dövüşü 1v1',
    shortName: 'Sokak Dövüşü 1v1',
    tagline: 'Aynı klavyede yumruk, tekme, kombo ve enerji dalgası düellosu!',
    category: 'Dövüş & 2 Kişilik',
    players: '2 Kişi (Aynı PC) / VS AI',
    coverImage: '/src/assets/images/game_cyber_brawler_1791967096535.jpg',
    originalVercelPath: 'game_cover_cyber_brawler.jpg',
    description: 'Neon siber dojo arenasında kıran kırana sokak dövüşü! Yumruk ve tekmelerle kombo serisi yakalayın, enerji küresi fırlatarak rakibi K.O. edin!',
    controlsHelp: [
      { key: '1. OYUNCU: A, D (Gezin) | W (Zıpla)', action: 'Dövüşçüyü hareket ettir' },
      { key: '1. OYUNCU: F (Yumruk) | G (Tekme) | H (Özel)', action: 'Saldırı kombosu' },
      { key: '2. OYUNCU: Yön Tuşları', action: 'Dövüşçüyü hareket ettir' },
      { key: '2. OYUNCU: K (Yumruk) | L (Tekme) | ENTER (Özel)', action: 'Saldırı kombosu' }
    ],
    accentColor: '#ff007f',
    secondaryColor: '#00f0ff',
    glowColor: 'rgba(255, 0, 127, 0.45)',
    iconName: 'Swords',
    badgeShape: 'diamond',
    tags: ['2 Kişilik', 'Aynı PC', 'Sokak Dövüşü', 'Kombat'],
    isMultiplayer: true,
    hasGraphicsUpgrade: true
  },
  {
    id: 'neon_drift',
    title: 'Micro Drift Racers: Neon Yarış 1v1',
    shortName: 'Neon Drift Yarış',
    tagline: 'Aynı PC üzerinde virajlarda drift yap, lastik dumanı savur ve kazan!',
    category: 'Yarış & 2 Kişilik',
    players: '2 Kişi (Aynı PC) / VS AI',
    coverImage: '/src/assets/images/game_neon_drift_1791967096137.jpg',
    originalVercelPath: 'game_cover_neon_drift.jpg',
    description: 'Üstten bakışlı retro arcade yarış! Neon asfaltta lastik izleri bırakın, virajları yanlayarak alın ve 3 turu ilk tamamlayarak kupa kaldırın!',
    controlsHelp: [
      { key: '1. OYUNCU (Cyan): W (Gaz) | S (Fren) | A, D (Drift)', action: 'Arabayı sür' },
      { key: '2. OYUNCU (Pembe): Yukarı (Gaz) | Aşağı | Sol, Sağ', action: 'Arabayı sür' }
    ],
    accentColor: '#00f0ff',
    secondaryColor: '#ec4899',
    glowColor: 'rgba(0, 240, 255, 0.45)',
    iconName: 'Zap',
    badgeShape: 'cyber',
    tags: ['2 Kişilik', 'Aynı PC', 'Drift Yarış', 'Hızlı'],
    isMultiplayer: true,
    hasGraphicsUpgrade: true
  },
  {
    id: 'cyber_survivor',
    title: 'Cyber Survivor: Robot İstilası',
    shortName: 'Cyber Survivor',
    tagline: 'Vampire Survivors tarzı rogue-lite! Robot sürülerini yok et, güçlen!',
    category: 'Rogue-Lite & Aksiyon',
    players: '1 Oyuncu',
    coverImage: '/src/assets/images/game_cyber_survivor_1791967097852.jpg',
    originalVercelPath: 'game_cover_cyber_survivor.jpg',
    description: 'Etrafınızı saran binlerce robotik uzaylı böceğe karşı hayatta kalın! Otomatik plazma atışları, dönen orbital kalkanlar, XP taşları ve her seviyede seçtiğiniz süper güçlendirmeler!',
    controlsHelp: [
      { key: 'W, A, S, D veya Yön Tuşları', action: 'Karakteri serbestçe hareket ettir' },
      { key: 'Otomatik Atış', action: 'En yakın düşmana plazma ateşler' }
    ],
    accentColor: '#a855f7',
    secondaryColor: '#38bdf8',
    glowColor: 'rgba(168, 85, 247, 0.45)',
    iconName: 'Flame',
    badgeShape: 'shield',
    tags: ['Rogue-Lite', 'Bullet Heaven', 'Seviye Atlama', 'Bağımlılık Yapan'],
    isMultiplayer: false,
    hasGraphicsUpgrade: true
  },
  {
    id: 'neon_snake',
    title: 'Tron Yılan Düellosu 1v1',
    shortName: 'Tron Yılan 1v1',
    tagline: 'Aynı PC üzerinde ışık iziyle rakibi tuzağa düşür, yıldızları topla!',
    category: 'Arcade & 2 Kişilik',
    players: '2 Kişi (Aynı PC) / VS AI',
    coverImage: '/src/assets/images/game_logo_runner_1791964781858.jpg',
    originalVercelPath: 'game_cover_tron_snake.jpg',
    description: 'Hızlı tempolu 2 kişilik retro yılan savaşı! Rakibinizin önünü kesip duvara çarptırın, altın yıldızları yutarak boyunuzu uzatın!',
    controlsHelp: [
      { key: '1. OYUNCU (Cyan): W, A, S, D', action: 'Yılanı yönlendir' },
      { key: '2. OYUNCU (Pembe): Yön Tuşları', action: 'Yılanı yönlendir' }
    ],
    accentColor: '#00f0ff',
    secondaryColor: '#ff007f',
    glowColor: 'rgba(0, 240, 255, 0.45)',
    iconName: 'Zap',
    badgeShape: 'circle',
    tags: ['2 Kişilik', 'Aynı PC', 'Yılan Düellosu', 'Hızlı Raund'],
    isMultiplayer: true,
    hasGraphicsUpgrade: true
  },
  {
    id: 'tank',
    title: 'Neon Tank 1v1: Siber Düello',
    shortName: 'Neon Tank 1v1',
    tagline: 'Aynı klavyede arkadaşınla veya bota karşı seken mermi savaşı!',
    category: '2 Kişilik & Versus',
    players: '2 Kişi (Aynı PC) / VS AI',
    coverImage: '/src/assets/images/game_logo_tank_1791964781660.jpg',
    originalVercelPath: 'game_cover_tank_duo_1791450562286.jpg',
    description: 'Tek bir bilgisayar üzerinden iki kişinin yan yana oynayabileceği tempolu neon tank savaşı! Seken mermiler, kalkan, üçlü atış ve patlamalar!',
    controlsHelp: [
      { key: '1. OYUNCU: W, A, S, D (Sür) | BOŞLUK (Ateş)', action: 'Tankı sür ve ateş et' },
      { key: '2. OYUNCU: Yön Tuşları (Sür) | ENTER (Ateş)', action: 'Tankı sür ve ateş et' }
    ],
    accentColor: '#00f0ff',
    secondaryColor: '#ff007f',
    glowColor: 'rgba(255, 0, 127, 0.45)',
    iconName: 'Swords',
    badgeShape: 'diamond',
    tags: ['2 Kişilik', 'Aynı PC', 'Tank Savaşı', 'PvP'],
    isMultiplayer: true,
    hasGraphicsUpgrade: true
  }
];

export const PLATFORM_INFO = {
  name: 'NovaArcade',
  siteUrl: 'https://web-sitem-xi-ashy.vercel.app/',
  tagline: 'Yeni Nesil Web & 2 Kişilik Oyun Platformu',
  totalGames: 6,
  badgeText: 'YEPYENİ OYUNLAR & 2 KİŞİLİK MODLAR'
};
