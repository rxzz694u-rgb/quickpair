import React, { useState, useEffect } from 'react';
import { MoreHorizontal, Sun, Moon } from 'lucide-react';
import { sounds } from '../services/audio';
import { themeManager, Theme } from '../services/theme';

interface HeaderMinimalProps {
  peerCount: number;
  onOpenDevices: () => void;
  onOpenMenu: () => void;
}

export const HeaderMinimal: React.FC<HeaderMinimalProps> = ({
  peerCount,
  onOpenDevices,
  onOpenMenu,
}) => {
  const [theme, setTheme] = useState<Theme>(themeManager.getTheme());
  const totalDevices = peerCount + 1;
  const displayLabel = totalDevices === 1 ? '1 device' : `${totalDevices} devices`;

  useEffect(() => {
    const unsubscribe = themeManager.subscribe((newTheme) => {
      setTheme(newTheme);
    });
    return unsubscribe;
  }, []);

  const handleToggleTheme = () => {
    sounds.playClick();
    themeManager.toggleTheme();
  };

  return (
    <header className="w-full max-w-[760px] mx-auto px-4 pt-5 pb-2.5 flex items-center justify-between">
      {/* Brand Logo & Static QuickPair Wordmark */}
      <div className="flex items-center gap-2.5 sm:gap-3 select-none">
        {/* Custom Vector SVG Logo Icon */}
        <div className="relative w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center">
          {/* Core SVG Icon Badge (Theme Adaptive) */}
          <svg
            viewBox="0 0 36 36"
            className="w-full h-full relative z-10 drop-shadow-sm rounded-xl overflow-hidden"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background container */}
            <rect
              width="36"
              height="36"
              rx="10"
              className="fill-[#111111] dark:fill-[#222226] stroke-black/5 dark:stroke-white/15"
              strokeWidth="1"
            />

            {/* Radiant Outer Pairing Wave (Emerald Accent) */}
            <path
              d="M8.5 13.5C14 8 22 8 27.5 13.5"
              stroke="#10B981"
              strokeWidth="2.4"
              strokeLinecap="round"
            />

            {/* Inner Fast Beam Wave */}
            <path
              d="M12.5 17.5C15.8 14.5 20.2 14.5 23.5 17.5"
              stroke="#E4E4E7"
              strokeWidth="2.2"
              strokeLinecap="round"
            />

            {/* Left Paired Node */}
            <circle
              cx="13"
              cy="24"
              r="2.8"
              fill="#E4E4E7"
            />

            {/* Connecting Bridge */}
            <path
              d="M13 24L23 24"
              stroke="#10B981"
              strokeWidth="2"
              strokeDasharray="2 2"
            />

            {/* Right Active Emerald Node */}
            <circle
              cx="23"
              cy="24"
              r="3.2"
              fill="#10B981"
            />
            <circle
              cx="23"
              cy="24"
              r="1.2"
              fill="#FFFFFF"
            />
          </svg>
        </div>

        {/* Clean Static QuickPair Wordmark */}
        <div className="flex items-center">
          <span className="font-bold text-[20px] sm:text-[23px] tracking-tight text-text-primary">
            Quick<span className="text-accent font-extrabold ml-[1px]">Pair</span>
          </span>
        </div>
      </div>

      {/* Right Controls: ● 1 device, Theme toggle, ••• */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Connection status pill */}
        <button
          onClick={() => {
            sounds.playClick();
            onOpenDevices();
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border text-xs font-medium text-text-primary hover:bg-hover transition-all shadow-sm cursor-pointer hover:border-accent/40 active:scale-95"
          title="View connected devices"
        >
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span>{displayLabel}</span>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={handleToggleTheme}
          className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-hover transition-all cursor-pointer active:scale-90"
          title={theme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}
          aria-label="Toggle dark/light mode"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-text-secondary" />}
        </button>

        {/* More options button */}
        <button
          onClick={() => {
            sounds.playClick();
            onOpenMenu();
          }}
          className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-hover transition-all cursor-pointer active:scale-90"
          title="Options"
          aria-label="Options"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
