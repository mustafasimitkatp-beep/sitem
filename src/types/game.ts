export interface GameItem {
  id: string;
  title: string;
  shortName: string;
  tagline: string;
  category: string;
  players: string;
  coverImage: string; // The generated 1:1 image path
  originalVercelPath: string; // The exact filename needed to fix the Vercel app
  description: string;
  controlsHelp: { key: string; action: string }[];
  accentColor: string;
  secondaryColor: string;
  glowColor: string;
  iconName: string;
  badgeShape: 'shield' | 'hexagon' | 'circle' | 'diamond' | 'cyber';
  tags: string[];
  isMultiplayer?: boolean;
  hasGraphicsUpgrade?: boolean;
}

export type LogoViewMode = 'generated' | 'vector' | 'banner' | 'card';

export interface LogoCustomizerState {
  title: string;
  subtitle: string;
  category: string;
  icon: string;
  badgeShape: 'shield' | 'hexagon' | 'circle' | 'diamond' | 'cyber';
  primaryColor: string;
  secondaryColor: string;
  glowColor: string;
  glowIntensity: number;
  showScanlines: boolean;
  showSparkles: boolean;
  showRays: boolean;
  borderWidth: number;
  fontStyle: 'arcade' | 'cyber' | 'cozy' | 'heroic';
}
