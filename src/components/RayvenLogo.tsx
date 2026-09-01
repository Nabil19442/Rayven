import React from 'react';

interface RayvenLogoProps {
  variant?: 'light' | 'dark' | 'purple' | 'minimal';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  subtitleText?: string;
  iconOnly?: boolean;
  className?: string;
}

export const RayvenLogo: React.FC<RayvenLogoProps> = ({
  variant = 'light',
  size = 'md',
  showSubtitle = true,
  subtitleText = 'SPORTSWEAR',
  iconOnly = false,
  className = '',
}) => {
  // Dimensions
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  };

  const subSizes = {
    sm: 'text-[8px] tracking-[0.25em]',
    md: 'text-[9px] tracking-[0.28em]',
    lg: 'text-[10px] tracking-[0.32em]',
    xl: 'text-xs tracking-[0.36em]',
  };

  // Determine colors based on variant
  const isDark = variant === 'dark';
  const isPurple = variant === 'purple';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Geometric Insignia / Crest */}
      <div
        className={`${iconSizes[size]} relative flex items-center justify-center rounded-xl transition-transform group-hover:scale-105 ${
          isDark
            ? 'bg-gradient-to-br from-zinc-900 via-zinc-800 to-[#1F2024] text-white border border-zinc-700/60 shadow-md shadow-black/20'
            : isPurple
            ? 'bg-gradient-to-br from-[#6D35C8] to-[#4B218A] text-white shadow-md shadow-purple-900/20'
            : 'bg-gradient-to-br from-[#1F2024] via-[#2B2D31] to-[#121316] text-white shadow-md shadow-zinc-900/15 ring-1 ring-zinc-900/5'
        }`}
      >
        {/* Futuristic Raven / Geometric Crest Icon */}
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-3/5 h-3/5"
        >
          {/* Angular wing geometric facets */}
          <path
            d="M18 4L5 14L18 20L31 14L18 4Z"
            fill="currentColor"
            fillOpacity="0.9"
          />
          <path
            d="M5 16L18 22L31 16L18 32L5 16Z"
            fill="url(#rayven-purple-grad)"
          />
          <path
            d="M18 10L11 16L18 20L25 16L18 10Z"
            fill="#FFFFFF"
            fillOpacity="0.85"
          />
          <defs>
            <linearGradient id="rayven-purple-grad" x1="5" y1="16" x2="31" y2="32" gradientUnits="userSpaceOnUse">
              <stop stopColor="#8B5AD9" />
              <stop offset="0.6" stopColor="#6D35C8" />
              <stop offset="1" stopColor="#4B218A" />
            </linearGradient>
          </defs>
        </svg>

        {/* Glow corner dot */}
        <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#8B5AD9] ring-2 ring-white"></span>
      </div>

      {!iconOnly && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1 leading-none">
            <span
              className={`font-display font-black tracking-wider uppercase transition-colors ${textSizes[size]} ${
                isDark
                  ? 'text-white'
                  : 'text-[#1F2024] group-hover:text-[#6D35C8]'
              }`}
              style={{ letterSpacing: '0.04em' }}
            >
              RAYVEN
            </span>
          </div>
          {showSubtitle && (
            <span
              className={`font-mono font-bold uppercase ${subSizes[size]} ${
                isDark ? 'text-[#8B5AD9]' : 'text-[#6D35C8]'
              } -mt-0.5`}
            >
              {subtitleText}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
