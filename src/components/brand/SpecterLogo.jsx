import React from 'react';

/**
 * Specter ghost mark — minimalist, geometric, sharp.
 * Intelligence-agency / fintech crossover. No cartoon.
 */
export default function SpecterLogo({ size = 32, className = '', glow = false }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={glow ? { filter: 'drop-shadow(0 0 12px hsl(189 100% 50% / 0.5))' } : undefined}
    >
      {/* Outer geometric ghost silhouette */}
      <path
        d="M16 2 C9.4 2 4 7.4 4 14 V28 L8 25 L12 28 L16 25 L20 28 L24 25 L28 28 V14 C28 7.4 22.6 2 16 2 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Eyes — two precise slits */}
      <rect x="11" y="12" width="3" height="4" rx="0.5" fill="currentColor" />
      <rect x="18" y="12" width="3" height="4" rx="0.5" fill="currentColor" />
    </svg>
  );
}

export function SpecterWordmark({ className = '' }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <SpecterLogo size={26} className="text-specter-primary" />
      <span className="text-[1.05rem] font-bold tracking-[0.18em] text-specter-text">
        SPECTER
      </span>
    </div>
  );
}