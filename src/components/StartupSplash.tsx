import React, { useEffect, useState } from 'react';

interface StartupSplashProps {
  isLoading: boolean;
  onFinished?: () => void;
}

export const StartupSplash: React.FC<StartupSplashProps> = ({ isLoading, onFinished }) => {
  const [shouldRender, setShouldRender] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setIsFadingOut(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        onFinished?.();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, onFinished]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0e0d0b] transition-all duration-500 ease-out select-none ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      aria-label="LocTex Loading"
    >
      {/* Background Radial Ambient Glow */}
      <div 
        className="absolute w-[450px] h-[450px] rounded-full blur-[100px] pointer-events-none animate-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.12) 0%, rgba(212, 175, 55, 0.02) 60%, transparent 80%)',
          animationDuration: '3s',
        }}
      />

      {/* Animated LocTex Logo */}
      <div className="relative mb-6 group">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 128 128"
          fill="none"
          className="w-24 h-24 drop-shadow-[0_0_25px_rgba(212,175,55,0.4)] transition-transform duration-700 ease-out animate-[bounce_4s_infinite]"
        >
          <defs>
            <linearGradient id="splashGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fff4c8" />
              <stop offset="35%" stopColor="#eac665" />
              <stop offset="70%" stopColor="#c99f28" />
              <stop offset="100%" stopColor="#805d04" />
            </linearGradient>
            <radialGradient id="splashBgGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#221e17" />
              <stop offset="100%" stopColor="#12110e" />
            </radialGradient>
          </defs>

          {/* Shield Card Base */}
          <rect
            x="6"
            y="6"
            width="116"
            height="116"
            rx="28"
            fill="url(#splashBgGrad)"
            stroke="#473e26"
            strokeWidth="2.5"
            className="transition-colors duration-500"
          />

          {/* Ambient Drafting Coordinate Grid */}
          <path d="M 24 64 L 104 64" stroke="#2c2517" strokeDasharray="3 3" strokeWidth="1.2" />
          <path d="M 64 24 L 64 104" stroke="#2c2517" strokeDasharray="3 3" strokeWidth="1.2" />

          {/* Continuous Mathematical Ribbon: Integral (∫) & Lambda (λ) */}
          <path
            d="M 78 28 C 66 28 58 36 58 50 L 58 74 C 58 84 50 94 36 94"
            stroke="url(#splashGoldGrad)"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <path
            d="M 46 62 L 86 96"
            stroke="url(#splashGoldGrad)"
            strokeWidth="8"
            strokeLinecap="round"
          />

          {/* Golden Vector Pen Tip Accent */}
          <polygon points="78,28 85,22 89,32" fill="#fff4c8" />
          <circle cx="89" cy="98" r="4.5" fill="#fff4c8" />
          <circle cx="36" cy="94" r="3.5" fill="#eac665" />
        </svg>

        {/* Ambient Ring Glow */}
        <div className="absolute inset-0 rounded-[28px] border border-[#d4af37]/30 blur-xs pointer-events-none" />
      </div>

      {/* Typography & Subtitle */}
      <div className="flex flex-col items-center gap-1.5 z-10">
        <h1 className="text-2xl font-serif font-bold tracking-[0.25em] text-[#fbf6e6] drop-shadow-sm pl-1">
          LOCTEX
        </h1>
        <p className="text-[11px] tracking-wider text-[#a89f8a] uppercase font-sans font-medium">
          Personal LaTeX & Research Studio
        </p>
      </div>

      {/* Sleek Minimal Progress Bar */}
      <div className="mt-8 w-44 h-1 bg-[#1e1c17] rounded-full overflow-hidden border border-[#302c22] relative z-10 shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-[#d4af37] via-[#fff0be] to-[#d4af37] rounded-full animate-[shimmer_1.5s_infinite]"
          style={{
            width: '60%',
            animation: 'loctexProgress 1.6s ease-in-out infinite alternate',
          }}
        />
      </div>

      <style>{`
        @keyframes loctexProgress {
          0% { transform: translateX(-60%); width: 30%; }
          50% { width: 70%; }
          100% { transform: translateX(180%); width: 40%; }
        }
      `}</style>
    </div>
  );
};
