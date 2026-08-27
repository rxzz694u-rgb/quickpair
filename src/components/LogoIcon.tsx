import React from 'react';

interface LogoIconProps {
  size?: number | string;
  variant?: 'badge' | 'plain';
  className?: string;
}

export const LogoIcon: React.FC<LogoIconProps> = ({
  size = 32,
  variant = 'badge',
  className = '',
}) => {
  const pixelSize = typeof size === 'number' ? `${size}px` : size;

  if (variant === 'plain') {
    return (
      <svg
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: pixelSize, height: pixelSize }}
        className={`flex-shrink-0 ${className}`}
      >
        <defs>
          <linearGradient id="qpBeamGradPlain" x1="8" y1="18" x2="28" y2="18" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="50%" stopColor="#D946EF" />
            <stop offset="100%" stopColor="#FF5B37" />
          </linearGradient>
        </defs>
        
        {/* Left Node */}
        <circle cx="11" cy="18" r="6" stroke="#8B5CF6" strokeWidth="2.5" />
        <circle cx="11" cy="18" r="2.2" fill="#8B5CF6" />
        
        {/* Fast Connection Bridge Beam */}
        <path d="M11 18 H25" stroke="url(#qpBeamGradPlain)" strokeWidth="2.5" strokeLinecap="round" />
        
        {/* Right Node */}
        <circle cx="25" cy="18" r="6" stroke="#FF5B37" strokeWidth="2.5" />
        <circle cx="25" cy="18" r="2.2" fill="#FF5B37" />
        
        {/* Velocity Pulse Spark */}
        <circle cx="18" cy="18" r="1.3" fill="#FFFFFF" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: pixelSize, height: pixelSize }}
      className={`flex-shrink-0 select-none ${className}`}
    >
      <defs>
        <linearGradient id="qpBgGrad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1C1C24" />
          <stop offset="100%" stopColor="#0B0B0F" />
        </linearGradient>
        <linearGradient id="qpBeamGrad" x1="9" y1="18" x2="27" y2="18" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="50%" stopColor="#D946EF" />
          <stop offset="100%" stopColor="#FF5B37" />
        </linearGradient>
      </defs>

      {/* 3D Tactile Rounded Squircle Badge */}
      <rect
        width="36"
        height="36"
        rx="10"
        fill="url(#qpBgGrad)"
        stroke="rgba(255, 255, 255, 0.12)"
        strokeWidth="1"
      />

      {/* Left Node (Device 1 / Lilac) */}
      <circle cx="11.5" cy="18" r="5.5" stroke="#8B5CF6" strokeWidth="2.2" />
      <circle cx="11.5" cy="18" r="2" fill="#8B5CF6" />

      {/* Direct Speed Connection Beam */}
      <path
        d="M11.5 18 H24.5"
        stroke="url(#qpBeamGrad)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />

      {/* Right Node (Device 2 / Sunset Coral) */}
      <circle cx="24.5" cy="18" r="5.5" stroke="#FF5B37" strokeWidth="2.2" />
      <circle cx="24.5" cy="18" r="2" fill="#FF5B37" />

      {/* High-Speed Data Velocity Spark */}
      <circle cx="18" cy="18" r="1.3" fill="#FFFFFF" />
    </svg>
  );
};
