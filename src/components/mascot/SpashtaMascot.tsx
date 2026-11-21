import React, { useState } from 'react';

interface MascotProps {
  mood?: 'welcoming' | 'thinking' | 'celebrating' | 'listening' | 'peaceful';
  size?: 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
  showSpeechBubble?: boolean;
  speechText?: string;
}

export const SpashtaMascot: React.FC<MascotProps> = ({
  mood = 'welcoming',
  size = 'md',
  className = '',
  showSpeechBubble = false,
  speechText = 'Welcome, friend! Let’s find a little clarity together.',
}) => {
  const [isWinking, setIsWinking] = useState(false);

  const sizeMap = {
    sm: 'w-12 h-12',
    md: 'w-24 h-24',
    lg: 'w-36 h-36',
    hero: 'w-48 h-48 md:w-56 md:h-56',
  };

  return (
    <div className={`relative inline-flex flex-col items-center justify-center select-none ${className}`}>
      {/* Whimsical Speech Bubble */}
      {showSpeechBubble && (
        <div className="mb-3 px-4 py-2.5 bg-[#FFF0D9] text-[#292B42] text-sm font-medium rounded-2xl shadow-lg border-2 border-[#FFE39A] relative animate-float-slow max-w-xs text-center">
          <span>{speechText}</span>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#FFF0D9]" />
        </div>
      )}

      {/* Mascot Animated Character */}
      <div
        onClick={() => setIsWinking(prev => !prev)}
        className={`relative ${sizeMap[size]} cursor-pointer transition-transform duration-300 hover:scale-110 active:scale-95`}
        title="Spashy, your Clarity Luminary Spirit"
      >
        <svg
          viewBox="0 0 160 160"
          className="w-full h-full overflow-visible drop-shadow-xl"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Outer radial glow */}
            <radialGradient id="mascotGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFE39A" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#C9B8F2" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#A9D8F5" stopOpacity="0" />
            </radialGradient>

            <linearGradient id="bodyGrad" x1="20" y1="20" x2="140" y2="140" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFF0D9" />
              <stop offset="45%" stopColor="#FFE39A" />
              <stop offset="85%" stopColor="#C9B8F2" />
              <stop offset="100%" stopColor="#A9D8F5" />
            </linearGradient>

            <filter id="softShine" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Ambient Glow Aura */}
          <circle cx="80" cy="80" r="75" fill="url(#mascotGlow)" className="animate-pulse-glow" />

          {/* Orbiting Tiny Starlight Fairies */}
          <g className="animate-float-slow">
            <circle cx="28" cy="50" r="4" fill="#FFE39A" />
            <path d="M28 42 L29 48 L35 49 L29 50 L28 56 L27 50 L21 49 L27 48 Z" fill="#FFFFFF" />
            <circle cx="135" cy="110" r="3.5" fill="#C9B8F2" />
            <path d="M135 104 L136 109 L141 110 L136 111 L135 116 L134 111 L129 110 L134 109 Z" fill="#FFE39A" />
          </g>

          {/* Main Floating Spirit Body */}
          <g className="animate-float-slow">
            <path
              d="M80 30 C110 30 130 55 130 85 C130 115 105 135 80 135 C55 135 30 115 30 85 C30 55 50 30 80 30 Z"
              fill="url(#bodyGrad)"
              stroke="#FFFFFF"
              strokeWidth="2.5"
            />

            {/* Pearlescent Belly Highlight */}
            <ellipse cx="80" cy="92" rx="35" ry="26" fill="#FFFFFF" fillOpacity="0.45" />

            {/* Cute Rosy Cheeks */}
            <ellipse cx="54" cy="92" rx="7" ry="4" fill="#F5A69A" opacity="0.8" />
            <ellipse cx="106" cy="92" rx="7" ry="4" fill="#F5A69A" opacity="0.8" />

            {/* Expressive Eyes */}
            {isWinking || mood === 'celebrating' ? (
              // Happy winking eyes
              <g stroke="#292B42" strokeWidth="3" strokeLinecap="round">
                <path d="M52 78 Q58 72 64 78" />
                <path d="M96 78 Q102 72 108 78" />
              </g>
            ) : mood === 'thinking' ? (
              // Thinking curious eyes looking up
              <g>
                <circle cx="58" cy="74" r="5.5" fill="#292B42" />
                <circle cx="60" cy="72" r="2" fill="#FFFFFF" />
                <circle cx="102" cy="74" r="5.5" fill="#292B42" />
                <circle cx="104" cy="72" r="2" fill="#FFFFFF" />
              </g>
            ) : (
              // Big gentle luminous eyes
              <g>
                <circle cx="58" cy="78" r="6" fill="#292B42" />
                <circle cx="60" cy="76" r="2.2" fill="#FFFFFF" />
                <circle cx="56" cy="81" r="1.2" fill="#FFFFFF" />

                <circle cx="102" cy="78" r="6" fill="#292B42" />
                <circle cx="104" cy="76" r="2.2" fill="#FFFFFF" />
                <circle cx="100" cy="81" r="1.2" fill="#FFFFFF" />
              </g>
            )}

            {/* Gentle Warm Smile */}
            <path
              d="M72 90 Q80 97 88 90"
              stroke="#292B42"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />

            {/* Tiny Starlight Antenna Crown */}
            <path d="M80 30 Q80 16 85 14" stroke="#FFE39A" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="86" cy="12" r="4.5" fill="#FFE39A" stroke="#FFFFFF" strokeWidth="1.5" />
            <path d="M86 6 L88 11 L93 12 L88 13 L86 18 L84 13 L79 12 L84 11 Z" fill="#FFFFFF" />

            {/* Tiny Floating Hand Mitts */}
            <ellipse cx="32" cy="94" rx="7" ry="6" fill="#FFF0D9" stroke="#FFE39A" strokeWidth="1.5" />
            <ellipse cx="128" cy="94" rx="7" ry="6" fill="#FFF0D9" stroke="#FFE39A" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    </div>
  );
};
