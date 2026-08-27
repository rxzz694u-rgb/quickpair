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
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: pixelSize, height: pixelSize }}
        className={`flex-shrink-0 ${className}`}
      >
        {/* Connecting Beam */}
        <line
          x1="26"
          y1="50"
          x2="74"
          y2="50"
          stroke="#E052D0"
          strokeWidth="6"
          strokeOpacity="0.55"
          strokeLinecap="round"
        />

        {/* Left Purple Ring */}
        <circle
          cx="26"
          cy="50"
          r="23"
          stroke="#7952F5"
          strokeWidth="7"
        />
        {/* Left Inner Purple Dot */}
        <circle
          cx="26"
          cy="50"
          r="8"
          fill="#7952F5"
        />

        {/* Right Coral Ring */}
        <circle
          cx="74"
          cy="50"
          r="23"
          stroke="#FF5733"
          strokeWidth="7"
        />
        {/* Right Inner Coral Dot */}
        <circle
          cx="74"
          cy="50"
          r="8"
          fill="#FF5733"
        />

        {/* Central White Node */}
        <circle
          cx="50"
          cy="50"
          r="5"
          fill="#FFFFFF"
        />
      </svg>
    );
  }

  return (
    <div
      style={{ width: pixelSize, height: pixelSize }}
      className={`relative inline-flex items-center justify-center rounded-[10px] bg-[#0E0E12] border border-white/10 shadow-sm flex-shrink-0 select-none overflow-hidden ${className}`}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[84%] h-[84%]"
      >
        {/* Connecting Beam */}
        <line
          x1="26"
          y1="50"
          x2="74"
          y2="50"
          stroke="#E052D0"
          strokeWidth="6"
          strokeOpacity="0.55"
          strokeLinecap="round"
        />

        {/* Left Purple Ring */}
        <circle
          cx="26"
          cy="50"
          r="23"
          stroke="#7952F5"
          strokeWidth="7"
        />
        {/* Left Inner Purple Dot */}
        <circle
          cx="26"
          cy="50"
          r="8"
          fill="#7952F5"
        />

        {/* Right Coral Ring */}
        <circle
          cx="74"
          cy="50"
          r="23"
          stroke="#FF5733"
          strokeWidth="7"
        />
        {/* Right Inner Coral Dot */}
        <circle
          cx="74"
          cy="50"
          r="8"
          fill="#FF5733"
        />

        {/* Central White Node */}
        <circle
          cx="50"
          cy="50"
          r="5"
          fill="#FFFFFF"
        />
      </svg>
    </div>
  );
};
