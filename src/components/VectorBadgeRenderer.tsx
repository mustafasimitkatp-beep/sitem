import React from 'react';
import { Sprout, Building2, Swords, Zap, Disc3, Shield, Award, Flame, Sparkles, Gamepad2 } from 'lucide-react';
import { LogoCustomizerState } from '../types/game';

interface VectorBadgeRendererProps {
  config: LogoCustomizerState;
  size?: number;
  id?: string;
}

export const VectorBadgeRenderer: React.FC<VectorBadgeRendererProps> = ({
  config,
  size = 320,
  id = 'game-badge-svg'
}) => {
  const {
    title,
    subtitle,
    category,
    badgeShape,
    primaryColor,
    secondaryColor,
    glowColor,
    showScanlines,
    showRays,
    borderWidth,
    fontStyle
  } = config;

  const renderShapePath = () => {
    switch (badgeShape) {
      case 'shield':
        return 'M 200,30 L 330,65 C 330,210 270,310 200,360 C 130,310 70,210 70,65 Z';
      case 'hexagon':
        return 'M 200,25 L 340,95 L 340,285 L 200,355 L 60,285 L 60,95 Z';
      case 'diamond':
        return 'M 200,20 L 350,190 L 200,360 L 50,190 Z';
      case 'cyber':
        return 'M 90,30 L 310,30 L 360,80 L 360,300 L 310,350 L 90,350 L 40,300 L 40,80 Z';
      case 'circle':
      default:
        return 'M 200,30 A 160,160 0 1 1 199.9,30 Z';
    }
  };

  const renderIcon = () => {
    const iconProps = { className: "w-20 h-20 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.7)]" };
    switch (config.icon) {
      case 'Sprout': return <Sprout {...iconProps} />;
      case 'Building2': return <Building2 {...iconProps} />;
      case 'Swords': return <Swords {...iconProps} />;
      case 'Zap': return <Zap {...iconProps} />;
      case 'Disc3': return <Disc3 {...iconProps} />;
      case 'Shield': return <Shield {...iconProps} />;
      case 'Award': return <Award {...iconProps} />;
      case 'Flame': return <Flame {...iconProps} />;
      default: return <Gamepad2 {...iconProps} />;
    }
  };

  return (
    <div
      style={{ width: size, height: size }}
      className="relative flex items-center justify-center select-none"
    >
      <svg
        id={id}
        viewBox="0 0 400 400"
        className="w-full h-full drop-shadow-2xl overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`grad-primary-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primaryColor} />
            <stop offset="100%" stopColor={secondaryColor} />
          </linearGradient>

          <linearGradient id={`grad-bg-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="50%" stopColor="#020617" />
            <stop offset="100%" stopColor="#000000" />
          </linearGradient>

          <radialGradient id={`glow-${id}`} cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor={glowColor} stopOpacity="0.8" />
            <stop offset="70%" stopColor={primaryColor} stopOpacity="0.2" />
            <stop offset="100%" stopColor="#020617" stopOpacity="0" />
          </radialGradient>

          <filter id={`filter-glow-${id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <pattern id={`scanline-${id}`} width="100" height="4" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="100" y2="0" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          </pattern>
        </defs>

        {/* Outer ambient glow */}
        <path
          d={renderShapePath()}
          fill="none"
          stroke={primaryColor}
          strokeWidth={borderWidth * 2.5}
          filter={`url(#filter-glow-${id})`}
          opacity="0.6"
        />

        {/* Badge Background */}
        <path
          d={renderShapePath()}
          fill={`url(#grad-bg-${id})`}
          stroke={`url(#grad-primary-${id})`}
          strokeWidth={borderWidth}
        />

        {/* Inner Radial Glow */}
        <path d={renderShapePath()} fill={`url(#glow-${id})`} />

        {/* Sunburst / Rays */}
        {showRays && (
          <g opacity="0.15">
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
              <line
                key={i}
                x1="200"
                y1="190"
                x2={200 + 170 * Math.cos((angle * Math.PI) / 180)}
                y2={190 + 170 * Math.sin((angle * Math.PI) / 180)}
                stroke="#ffffff"
                strokeWidth="2"
              />
            ))}
          </g>
        )}

        {/* Scanlines */}
        {showScanlines && (
          <path d={renderShapePath()} fill={`url(#scanline-${id})`} />
        )}

        {/* Category Header Ribbon / Pill */}
        {category && (
          <g>
            <rect
              x="110"
              y="60"
              width="180"
              height="24"
              rx="12"
              fill="rgba(15, 23, 42, 0.9)"
              stroke={primaryColor}
              strokeWidth="1.5"
            />
            <text
              x="200"
              y="76"
              fill={primaryColor}
              fontSize="10"
              fontWeight="bold"
              letterSpacing="2"
              textAnchor="middle"
              className="uppercase tracking-widest font-mono"
            >
              {category}
            </text>
          </g>
        )}

        {/* Center Game Icon placeholder in SVG */}
        <circle cx="200" cy="165" r="50" fill="rgba(255,255,255,0.04)" stroke={primaryColor} strokeWidth="1" strokeDasharray="3 3" />

        {/* Title and Tagline on SVG banner */}
        <g id="badge-typography">
          {/* Main Title Banner */}
          <path
            d="M 60,265 L 340,265 L 320,310 L 80,310 Z"
            fill="rgba(10, 15, 29, 0.95)"
            stroke={primaryColor}
            strokeWidth="1.5"
          />
          <text
            x="200"
            y="295"
            fill="#ffffff"
            fontSize={title.length > 15 ? '16' : '20'}
            fontWeight="900"
            letterSpacing={fontStyle === 'cyber' ? '2' : '1'}
            textAnchor="middle"
            className="font-heading"
            filter="drop-shadow(0 2px 4px rgba(0,0,0,0.8))"
          >
            {title}
          </text>

          {/* Subtitle / Tagline */}
          {subtitle && (
            <text
              x="200"
              y="326"
              fill={secondaryColor}
              fontSize="10"
              fontWeight="700"
              letterSpacing="1"
              textAnchor="middle"
              className="tracking-wider uppercase"
            >
              {subtitle.length > 35 ? subtitle.slice(0, 32) + '...' : subtitle}
            </text>
          )}
        </g>
      </svg>

      {/* Floating Center Icon */}
      <div className="absolute top-[34%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        {renderIcon()}
      </div>
    </div>
  );
};
