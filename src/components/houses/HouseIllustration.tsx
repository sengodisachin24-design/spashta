import React from 'react';
import { HouseType, ConstructionStage } from '../../types';

interface HouseIllustrationProps {
  type: HouseType;
  stage?: ConstructionStage; // If provided, shows incremental building stages
  isInteractive?: boolean;
  isSelected?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
  onClick?: () => void;
}

export const HOUSE_DEFINITIONS = [
  {
    id: 'cozy-cottage' as HouseType,
    name: 'Cozy Cottage',
    subtitle: 'Warmth, hearth, and gentle beginnings',
    description: 'A storybook stone cottage with curling chimney smoke, blooming flower boxes, and sunlit bay windows.',
    themeColor: '#FFE39A',
    bricksRequired: 12,
  },
  {
    id: 'modern-glass' as HouseType,
    name: 'Modern Glass Sanctuary',
    subtitle: 'Clarity, perspective, and light',
    description: 'Sleek architectural lines, floor-to-ceiling glass that captures morning sunrise, and ambient courtyard reflections.',
    themeColor: '#A9D8F5',
    bricksRequired: 12,
  },
  {
    id: 'treehouse' as HouseType,
    name: 'Whimsical Treehouse',
    subtitle: 'Imagination, freedom, and higher viewpoints',
    description: 'Perched in the boughs of an ancient oak with rope ladders, swaying lanterns, and starlight canopy.',
    themeColor: '#B9E5C8',
    bricksRequired: 14,
  },
  {
    id: 'castle' as HouseType,
    name: 'Enchanted Spire Castle',
    subtitle: 'Inner strength, wonder, and noble dreams',
    description: 'Majestic stone turrets, golden banners dancing in the wind, and stained-glass windows glowing like gems.',
    themeColor: '#C9B8F2',
    bricksRequired: 14,
  },
  {
    id: 'beach-house' as HouseType,
    name: 'Coastal Haven',
    subtitle: 'Calm tides, open horizons, and peace',
    description: 'A sun-bleached coastal stilt villa with gentle ocean breezes, rhythmic waves, and panoramic sunset decks.',
    themeColor: '#F5A69A',
    bricksRequired: 12,
  },
  {
    id: 'mountain-cabin' as HouseType,
    name: 'Alpine Timber Cabin',
    subtitle: 'Resilience, shelter, and cozy quietude',
    description: 'Rustic cedar A-frame nestled among alpine pine trees, woodsmoke in the crisp air, and string lights on the porch.',
    themeColor: '#FFE39A',
    bricksRequired: 12,
  },
  {
    id: 'contemporary-villa' as HouseType,
    name: 'Starlight Villa',
    subtitle: 'Harmony, balance, and modern serenity',
    description: 'A multi-tiered villa with an infinity reflection pool, lush landscaped garden terraces, and warm recessed lights.',
    themeColor: '#B9E5C8',
    bricksRequired: 14,
  },
];

export const HouseIllustration: React.FC<HouseIllustrationProps> = ({
  type,
  stage = 'completed',
  isInteractive = false,
  isSelected = false,
  size = 'md',
  className = '',
  onClick,
}) => {
  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-48 h-40',
    lg: 'w-64 h-52',
    hero: 'w-full max-w-lg h-72 md:h-80',
  }[size];

  // Stage visibility logic
  const stageWeights: Record<ConstructionStage, number> = {
    foundation: 1,
    walls: 2,
    'windows-doors': 3,
    roof: 4,
    interior: 5,
    landscaping: 6,
    completed: 7,
  };

  const currentLevel = stageWeights[stage] || 7;
  const showFoundation = currentLevel >= 1;
  const showWalls = currentLevel >= 2;
  const showWindows = currentLevel >= 3;
  const showRoof = currentLevel >= 4;
  const showInterior = currentLevel >= 5;
  const showLandscaping = currentLevel >= 6;

  return (
    <div
      onClick={onClick}
      className={`relative flex items-center justify-center transition-all duration-300 ${sizeClasses} ${
        isInteractive ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
      } ${isSelected ? 'ring-3 ring-[#FFE39A] shadow-xl shadow-[#FFE39A]/20 scale-102' : ''} ${className}`}
    >
      <svg
        viewBox="0 0 320 260"
        className="w-full h-full drop-shadow-md select-none overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`skyGrad-${type}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#292B42" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#3B3F63" stopOpacity="0.4" />
          </linearGradient>

          <linearGradient id={`goldGlow-${type}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE39A" />
            <stop offset="100%" stopColor="#F5A69A" />
          </linearGradient>

          <filter id={`softGlow-${type}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient background aura */}
        <circle cx="160" cy="130" r="100" fill="url(#goldGlow)" opacity="0.08" />

        {/* Floating clouds in sky */}
        <g className="animate-drift opacity-60">
          <ellipse cx="60" cy="40" rx="24" ry="10" fill="#FFFFFF" opacity="0.4" />
          <ellipse cx="80" cy="36" rx="18" ry="12" fill="#FFFFFF" opacity="0.5" />
          <ellipse cx="250" cy="50" rx="30" ry="12" fill="#FFFFFF" opacity="0.3" />
        </g>

        {/* 1. COZY COTTAGE */}
        {type === 'cozy-cottage' && (
          <g id="cottage">
            {/* Ground / Foundation */}
            {showFoundation && (
              <g id="foundation-cottage">
                <ellipse cx="160" cy="225" rx="120" ry="24" fill="#B9E5C8" opacity="0.5" />
                <rect x="80" y="210" width="160" height="15" rx="4" fill="#6A6E88" />
                <path d="M85 218h150" stroke="#8D92AE" strokeWidth="2" strokeDasharray="6 4" />
              </g>
            )}

            {/* Walls */}
            {showWalls && (
              <g id="walls-cottage">
                <rect x="95" y="140" width="130" height="72" rx="4" fill="#FFF0D9" stroke="#343753" strokeWidth="2.5" />
                {/* Brick texture lines */}
                <path d="M100 160h120 M110 180h100 M100 200h120" stroke="#E6DAC4" strokeWidth="1.5" />
              </g>
            )}

            {/* Chimney with animated smoke */}
            {showRoof && (
              <g id="chimney-cottage">
                <rect x="195" y="80" width="22" height="45" rx="2" fill="#E28E82" stroke="#343753" strokeWidth="2" />
                <rect x="192" y="76" width="28" height="6" rx="2" fill="#C76F64" />
                {/* Rising smoke puffs */}
                <g className="animate-float-slow">
                  <circle cx="206" cy="65" r="5" fill="#FFFFFF" opacity="0.6" />
                  <circle cx="210" cy="50" r="8" fill="#FFFFFF" opacity="0.4" />
                  <circle cx="216" cy="32" r="11" fill="#FFFFFF" opacity="0.25" />
                </g>
              </g>
            )}

            {/* Roof */}
            {showRoof && (
              <g id="roof-cottage">
                <path d="M80 142 L160 85 L240 142 Z" fill="#8C6F9C" stroke="#292B42" strokeWidth="2.5" />
                <path d="M90 142 L160 92 L230 142" stroke="#A68BB6" strokeWidth="3" />
                <path d="M160 85 L160 140" stroke="#755B85" strokeWidth="1.5" strokeDasharray="3 3" />
              </g>
            )}

            {/* Windows & Doors */}
            {showWindows && (
              <g id="openings-cottage">
                {/* Door */}
                <path d="M145 168 Q160 160 175 168 V212 H145 Z" fill="#9C6B53" stroke="#292B42" strokeWidth="2" />
                <circle cx="168" cy="192" r="2" fill="#FFE39A" />
                {/* Windows with warm glow */}
                <rect x="108" y="155" width="26" height="28" rx="4" fill={showInterior ? '#FFE39A' : '#A9D8F5'} stroke="#292B42" strokeWidth="2" />
                <line x1="121" y1="155" x2="121" y2="183" stroke="#292B42" strokeWidth="1.5" />
                <line x1="108" y1="169" x2="134" y2="169" stroke="#292B42" strokeWidth="1.5" />

                <rect x="186" y="155" width="26" height="28" rx="4" fill={showInterior ? '#FFE39A' : '#A9D8F5'} stroke="#292B42" strokeWidth="2" />
                <line x1="199" y1="155" x2="199" y2="183" stroke="#292B42" strokeWidth="1.5" />
                <line x1="186" y1="169" x2="212" y2="169" stroke="#292B42" strokeWidth="1.5" />
              </g>
            )}

            {/* Landscaping */}
            {showLandscaping && (
              <g id="garden-cottage">
                {/* Cobblestone path */}
                <path d="M148 212 Q140 230 135 242 M172 212 Q180 230 185 242" stroke="#FFE39A" strokeWidth="2" strokeDasharray="4 3" />
                {/* Flower bushes */}
                <circle cx="85" cy="215" r="9" fill="#B9E5C8" />
                <circle cx="88" cy="211" r="5" fill="#F5A69A" />
                <circle cx="235" cy="215" r="9" fill="#B9E5C8" />
                <circle cx="232" cy="210" r="5" fill="#FFE39A" />
                {/* Swaying Oak Tree */}
                <g className="animate-float-slow">
                  <path d="M52 170 Q56 200 62 225 H45 Q48 190 44 170 Z" fill="#75523C" />
                  <ellipse cx="50" cy="155" rx="24" ry="22" fill="#58A878" opacity="0.9" />
                  <ellipse cx="55" cy="145" rx="18" ry="16" fill="#8CD6A4" opacity="0.9" />
                </g>
              </g>
            )}
          </g>
        )}

        {/* 2. MODERN GLASS SANCTUARY */}
        {type === 'modern-glass' && (
          <g id="modern">
            {showFoundation && (
              <g>
                <ellipse cx="160" cy="230" rx="125" ry="18" fill="#A9D8F5" opacity="0.3" />
                <rect x="70" y="215" width="180" height="12" rx="2" fill="#3D425E" />
              </g>
            )}
            {showWalls && (
              <g>
                <rect x="85" y="125" width="150" height="90" rx="4" fill="#24273E" stroke="#A9D8F5" strokeWidth="2" />
                <rect x="90" y="130" width="140" height="80" rx="2" fill="#1C1E32" />
              </g>
            )}
            {showWindows && (
              <g>
                {/* Massive glass facade panels */}
                <rect x="96" y="136" width="60" height="70" fill={showInterior ? '#FFE39A' : '#A9D8F5'} fillOpacity={showInterior ? '0.4' : '0.2'} stroke="#A9D8F5" strokeWidth="1.5" />
                <rect x="164" y="136" width="60" height="70" fill={showInterior ? '#FFE39A' : '#A9D8F5'} fillOpacity={showInterior ? '0.4' : '0.2'} stroke="#A9D8F5" strokeWidth="1.5" />
                {/* Interior warm silhouette */}
                {showInterior && (
                  <path d="M120 180h18v26h-18z M180 188h24v18h-24z" fill="#FFE39A" opacity="0.7" />
                )}
              </g>
            )}
            {showRoof && (
              <g>
                {/* Cantilever roof slab */}
                <rect x="75" y="116" width="170" height="12" rx="3" fill="#D3DCF5" stroke="#292B42" strokeWidth="1.5" />
                <line x1="75" y1="122" x2="245" y2="122" stroke="#A9D8F5" strokeWidth="2" />
              </g>
            )}
            {showLandscaping && (
              <g>
                {/* Modern water feature */}
                <ellipse cx="230" cy="226" rx="36" ry="12" fill="#A9D8F5" opacity="0.7" />
                <path d="M205 226 Q230 220 255 226" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
                {/* Minimalist tall cypress trees */}
                <ellipse cx="60" cy="180" rx="9" ry="38" fill="#4B9A76" />
                <ellipse cx="73" cy="190" rx="7" ry="28" fill="#71BE98" />
              </g>
            )}
          </g>
        )}

        {/* 3. WHIMSICAL TREEHOUSE */}
        {type === 'treehouse' && (
          <g id="treehouse">
            {showFoundation && (
              <g>
                <ellipse cx="160" cy="235" rx="110" ry="18" fill="#B9E5C8" opacity="0.5" />
                {/* Giant ancient trunk */}
                <path d="M130 235 C135 180 120 140 100 90 L180 90 C165 140 180 180 190 235 Z" fill="#6E4A35" stroke="#292B42" strokeWidth="2.5" />
              </g>
            )}
            {showWalls && (
              <g>
                {/* Wooden platform and cabin */}
                <rect x="90" y="115" width="140" height="14" rx="3" fill="#9C6B53" stroke="#292B42" strokeWidth="2" />
                <rect x="115" y="65" width="90" height="52" rx="3" fill="#DEB887" stroke="#292B42" strokeWidth="2" />
                {/* Wood slats */}
                <line x1="115" y1="80" x2="205" y2="80" stroke="#BA9265" strokeWidth="1.5" />
                <line x1="115" y1="95" x2="205" y2="95" stroke="#BA9265" strokeWidth="1.5" />
              </g>
            )}
            {showRoof && (
              <g>
                <path d="M105 67 L160 25 L215 67 Z" fill="#4A7C59" stroke="#292B42" strokeWidth="2.5" />
                {/* Lush leafy canopy surrounding */}
                <ellipse cx="80" cy="70" rx="36" ry="30" fill="#68B684" opacity="0.9" />
                <ellipse cx="240" cy="70" rx="36" ry="30" fill="#68B684" opacity="0.9" />
                <ellipse cx="160" cy="20" rx="45" ry="22" fill="#8CD6A4" opacity="0.8" />
              </g>
            )}
            {showWindows && (
              <g>
                <circle cx="140" cy="90" r="10" fill={showInterior ? '#FFE39A' : '#A9D8F5'} stroke="#292B42" strokeWidth="1.5" />
                <rect x="165" y="80" width="18" height="35" rx="3" fill="#8B4513" stroke="#292B42" strokeWidth="1.5" />
              </g>
            )}
            {showLandscaping && (
              <g>
                {/* Rope ladder */}
                <path d="M102 129 V220 M114 129 V220" stroke="#BA9265" strokeWidth="1.5" />
                <line x1="102" y1="145" x2="114" y2="145" stroke="#6E4A35" strokeWidth="1.5" />
                <line x1="102" y1="165" x2="114" y2="165" stroke="#6E4A35" strokeWidth="1.5" />
                <line x1="102" y1="185" x2="114" y2="185" stroke="#6E4A35" strokeWidth="1.5" />
                <line x1="102" y1="205" x2="114" y2="205" stroke="#6E4A35" strokeWidth="1.5" />
                {/* Swaying lantern */}
                <g className="animate-float-slow">
                  <line x1="218" y1="126" x2="218" y2="145" stroke="#FFE39A" strokeWidth="1.5" />
                  <rect x="212" y="145" width="12" height="16" rx="2" fill="#FFE39A" stroke="#292B42" strokeWidth="1.5" />
                  <circle cx="218" cy="153" r="10" fill="#FFE39A" opacity="0.3" />
                </g>
              </g>
            )}
          </g>
        )}

        {/* 4. ENCHANTED CASTLE */}
        {type === 'castle' && (
          <g id="castle">
            {showFoundation && (
              <g>
                <ellipse cx="160" cy="235" rx="125" ry="18" fill="#C9B8F2" opacity="0.4" />
                <rect x="75" y="215" width="170" height="15" rx="2" fill="#585A75" stroke="#292B42" strokeWidth="2" />
              </g>
            )}
            {showWalls && (
              <g>
                {/* Main central keep & side towers */}
                <rect x="110" y="130" width="100" height="85" fill="#D4D0E3" stroke="#292B42" strokeWidth="2.5" />
                <rect x="80" y="95" width="40" height="120" fill="#BAB4CE" stroke="#292B42" strokeWidth="2.5" />
                <rect x="200" y="95" width="40" height="120" fill="#BAB4CE" stroke="#292B42" strokeWidth="2.5" />
                {/* Crenellations / Battlement */}
                <path d="M110 130 h10 v-6 h10 v6 h10 v-6 h10 v6 h10 v-6 h10 v6 h10 v-6 h10 v6 h10 v-6 h10 v6" stroke="#292B42" strokeWidth="2" fill="none" />
              </g>
            )}
            {showRoof && (
              <g>
                {/* Tower spires */}
                <path d="M80 95 L100 35 L120 95 Z" fill="#7E6BA8" stroke="#292B42" strokeWidth="2" />
                <path d="M200 95 L220 35 L240 95 Z" fill="#7E6BA8" stroke="#292B42" strokeWidth="2" />
                <path d="M130 130 L160 70 L190 130 Z" fill="#9A83C7" stroke="#292B42" strokeWidth="2" />
                {/* Flying flags */}
                <path d="M100 35 V20 L115 27 L100 32" fill="#FFE39A" />
                <path d="M220 35 V20 L235 27 L220 32" fill="#FFE39A" />
              </g>
            )}
            {showWindows && (
              <g>
                {/* Arched portcullis gate */}
                <path d="M142 165 Q160 150 178 165 V215 H142 Z" fill="#3D3050" stroke="#292B42" strokeWidth="2" />
                <path d="M148 165v50 M154 165v50 M160 160v55 M166 165v50 M172 165v50" stroke="#9A83C7" strokeWidth="1" />
                {/* Rose / arched window */}
                <circle cx="160" cy="110" r="12" fill={showInterior ? '#FFE39A' : '#A9D8F5'} stroke="#292B42" strokeWidth="2" />
                {/* Side tower slits */}
                <rect x="96" y="125" width="8" height="18" rx="3" fill={showInterior ? '#FFE39A' : '#292B42'} />
                <rect x="216" y="125" width="8" height="18" rx="3" fill={showInterior ? '#FFE39A' : '#292B42'} />
              </g>
            )}
            {showLandscaping && (
              <g>
                {/* Shimmering Moat */}
                <path d="M50 236 C100 248 220 248 270 236" stroke="#A9D8F5" strokeWidth="5" strokeLinecap="round" />
                <path d="M90 240 C140 246 180 246 230 240" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
              </g>
            )}
          </g>
        )}

        {/* 5. COASTAL HAVEN (Beach House) */}
        {type === 'beach-house' && (
          <g id="beach-house">
            {showFoundation && (
              <g>
                {/* Sandy dune & wooden stilts */}
                <ellipse cx="160" cy="235" rx="125" ry="18" fill="#FCE5B8" />
                <rect x="95" y="175" width="8" height="55" fill="#B38656" stroke="#292B42" strokeWidth="1.5" />
                <rect x="135" y="175" width="8" height="55" fill="#B38656" stroke="#292B42" strokeWidth="1.5" />
                <rect x="175" y="175" width="8" height="55" fill="#B38656" stroke="#292B42" strokeWidth="1.5" />
                <rect x="215" y="175" width="8" height="55" fill="#B38656" stroke="#292B42" strokeWidth="1.5" />
              </g>
            )}
            {showWalls && (
              <g>
                <rect x="85" y="110" width="150" height="70" rx="3" fill="#FFFFFF" stroke="#292B42" strokeWidth="2" />
                {/* White weatherboard planks */}
                <line x1="85" y1="125" x2="235" y2="125" stroke="#E2E7ED" strokeWidth="1.5" />
                <line x1="85" y1="140" x2="235" y2="140" stroke="#E2E7ED" strokeWidth="1.5" />
                <line x1="85" y1="155" x2="235" y2="155" stroke="#E2E7ED" strokeWidth="1.5" />
              </g>
            )}
            {showRoof && (
              <g>
                <path d="M75 112 L160 55 L245 112 Z" fill="#F5A69A" stroke="#292B42" strokeWidth="2.5" />
              </g>
            )}
            {showWindows && (
              <g>
                {/* Coastal double glass french doors */}
                <rect x="140" y="125" width="40" height="55" fill={showInterior ? '#FFE39A' : '#A9D8F5'} stroke="#292B42" strokeWidth="2" />
                <line x1="160" y1="125" x2="160" y2="180" stroke="#292B42" strokeWidth="2" />
                {/* Porch railing */}
                <rect x="80" y="170" width="160" height="10" fill="#DEB887" stroke="#292B42" strokeWidth="1.5" />
              </g>
            )}
            {showLandscaping && (
              <g>
                {/* Gentle ocean waves */}
                <path d="M40 245 Q90 238 140 245 T240 245 T280 245" stroke="#A9D8F5" strokeWidth="3" strokeLinecap="round" />
                <path d="M60 250 Q110 244 160 250 T260 250" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
                {/* Swaying coconut palm */}
                <g className="animate-float-slow">
                  <path d="M260 235 Q250 180 270 140" stroke="#9E6E45" strokeWidth="5" strokeLinecap="round" />
                  <path d="M270 140 Q240 120 225 140 M270 140 Q280 110 300 125 M270 140 Q300 145 305 160" stroke="#58A878" strokeWidth="3.5" strokeLinecap="round" />
                </g>
              </g>
            )}
          </g>
        )}

        {/* 6. ALPINE CABIN */}
        {type === 'mountain-cabin' && (
          <g id="alpine-cabin">
            {showFoundation && (
              <g>
                <ellipse cx="160" cy="235" rx="120" ry="18" fill="#A8B2C4" opacity="0.4" />
                <rect x="90" y="212" width="140" height="15" rx="2" fill="#5A4738" stroke="#292B42" strokeWidth="2" />
              </g>
            )}
            {showRoof && (
              <g>
                {/* Iconic A-Frame steep pitch */}
                <path d="M80 215 L160 60 L240 215 Z" fill="#6B4423" stroke="#292B42" strokeWidth="2.5" />
                <path d="M92 215 L160 78 L228 215 Z" fill="#FFF0D9" />
                {/* Chimney & smoke */}
                <rect x="180" y="80" width="18" height="40" fill="#7D7068" stroke="#292B42" strokeWidth="2" />
                <g className="animate-float-slow">
                  <circle cx="189" cy="65" r="4" fill="#FFFFFF" opacity="0.6" />
                  <circle cx="193" cy="50" r="7" fill="#FFFFFF" opacity="0.4" />
                </g>
              </g>
            )}
            {showWindows && (
              <g>
                {/* Giant triangular facade glass */}
                <path d="M125 180 L160 110 L195 180 Z" fill={showInterior ? '#FFE39A' : '#A9D8F5'} stroke="#292B42" strokeWidth="2" />
                {/* Wooden rustic door */}
                <rect x="148" y="180" width="24" height="34" fill="#422517" stroke="#292B42" strokeWidth="1.5" />
                <circle cx="166" cy="198" r="2" fill="#FFE39A" />
              </g>
            )}
            {showLandscaping && (
              <g>
                {/* Evergreen pine trees */}
                <path d="M50 220 L65 170 L80 220 Z M55 190 L65 150 L75 190 Z" fill="#2E5339" stroke="#1B3323" strokeWidth="1.5" />
                <path d="M245 225 L260 175 L275 225 Z" fill="#3D6B4B" />
                {/* Warm string fairy lights on eaves */}
                <circle cx="115" cy="155" r="2.5" fill="#FFE39A" />
                <circle cx="135" cy="120" r="2.5" fill="#FFE39A" />
                <circle cx="160" cy="75" r="3" fill="#FFE39A" />
                <circle cx="185" cy="120" r="2.5" fill="#FFE39A" />
                <circle cx="205" cy="155" r="2.5" fill="#FFE39A" />
              </g>
            )}
          </g>
        )}

        {/* 7. CONTEMPORARY VILLA */}
        {type === 'contemporary-villa' && (
          <g id="villa">
            {showFoundation && (
              <g>
                <ellipse cx="160" cy="235" rx="130" ry="20" fill="#B9E5C8" opacity="0.4" />
                <rect x="70" y="210" width="180" height="15" rx="3" fill="#3E435E" />
              </g>
            )}
            {showWalls && (
              <g>
                {/* Tier 1 */}
                <rect x="80" y="150" width="160" height="60" rx="3" fill="#F4F2F7" stroke="#292B42" strokeWidth="2" />
                {/* Tier 2 offset cantilever */}
                <rect x="110" y="100" width="115" height="55" rx="3" fill="#FFFFFF" stroke="#292B42" strokeWidth="2" />
              </g>
            )}
            {showWindows && (
              <g>
                <rect x="120" y="110" width="40" height="35" fill={showInterior ? '#FFE39A' : '#A9D8F5'} stroke="#292B42" strokeWidth="1.5" />
                <rect x="170" y="110" width="45" height="35" fill={showInterior ? '#FFE39A' : '#A9D8F5'} stroke="#292B42" strokeWidth="1.5" />
                <rect x="95" y="160" width="70" height="40" fill={showInterior ? '#FFE39A' : '#A9D8F5'} stroke="#292B42" strokeWidth="1.5" />
              </g>
            )}
            {showRoof && (
              <g>
                <rect x="100" y="94" width="135" height="8" rx="2" fill="#292B42" />
                <rect x="70" y="145" width="180" height="8" rx="2" fill="#292B42" />
              </g>
            )}
            {showLandscaping && (
              <g>
                {/* Infinity Pool */}
                <rect x="175" y="185" width="65" height="28" rx="4" fill="#A9D8F5" stroke="#292B42" strokeWidth="1.5" />
                <path d="M180 195 Q205 190 235 195" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.7" />
                {/* Palm and terrace planters */}
                <circle cx="65" cy="210" r="12" fill="#58A878" />
                <circle cx="70" cy="205" r="7" fill="#8CD6A4" />
              </g>
            )}
          </g>
        )}
      </svg>
    </div>
  );
};
