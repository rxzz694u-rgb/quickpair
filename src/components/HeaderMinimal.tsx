import React, { useState, useEffect } from 'react';
import { Sun, Moon, QrCode, MoreHorizontal } from 'lucide-react';
import { sounds } from '../services/audio';
import { themeManager, Theme } from '../services/theme';

interface HeaderMinimalProps {
  peerCount: number;
  onOpenDevices: () => void;
  onOpenMenu: () => void;
  onOpenInfo?: (tab: any) => void;
}

export const HeaderMinimal: React.FC<HeaderMinimalProps> = ({
  peerCount,
  onOpenDevices,
  onOpenMenu,
  onOpenInfo,
}) => {
  const [theme, setTheme] = useState<Theme>(themeManager.getTheme());
  const totalDevices = peerCount + 1;

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
    <header className="w-full max-w-[840px] mx-auto px-4 pt-4 sm:pt-6 pb-2 sticky top-0 z-40">
      {/* Floating Pill Navbar (Inspired by CoreShift Image 1 & 2) */}
      <div className="w-full bg-card/90 dark:bg-[#16161D]/90 backdrop-blur-md border border-border rounded-full shadow-pill px-3.5 sm:px-5 py-2 sm:py-2.5 flex items-center justify-between transition-all">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5 select-none cursor-pointer">
          {/* 3D Tactile Purple Squircle Icon */}
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#8B5CF6] via-[#7C3AED] to-[#A855F7] p-1.5 flex items-center justify-center shadow-md shadow-purple-500/20 ring-2 ring-purple-100 dark:ring-purple-950/40">
            <svg viewBox="0 0 24 24" className="w-full h-full text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 11l5 5 5-5" />
              <path d="M12 4v12" />
            </svg>
          </div>

          <span className="font-extrabold text-[17px] sm:text-[19px] tracking-tight text-text-primary">
            Quick<span className="text-[#FF5B37]">Pair</span>
          </span>
        </div>

        {/* Center Nav Links (Hidden on small mobile) */}
        <nav className="hidden md:flex items-center gap-6 text-[13px] font-medium text-text-secondary">
          <button
            onClick={() => onOpenInfo?.('about')}
            className="hover:text-text-primary transition-colors cursor-pointer"
          >
            How it works
          </button>
          <button
            onClick={() => onOpenInfo?.('privacy')}
            className="hover:text-text-primary transition-colors cursor-pointer"
          >
            Privacy
          </button>
          <button
            onClick={() => onOpenInfo?.('terms')}
            className="hover:text-text-primary transition-colors cursor-pointer"
          >
            Security
          </button>
          <button
            onClick={() => onOpenInfo?.('faq')}
            className="hover:text-text-primary transition-colors cursor-pointer"
          >
            FAQ
          </button>
        </nav>

        {/* Right Controls: Device Pill + Theme + Obsidian Action Button */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Active Device Counter */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenDevices();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-500/15 transition-all cursor-pointer"
            title="Active paired devices"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{totalDevices === 1 ? '1 device' : `${totalDevices} devices`}</span>
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={handleToggleTheme}
            className="p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-hover transition-all cursor-pointer active:scale-90"
            title={theme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-text-secondary" />}
          </button>

          {/* High-Contrast Obsidian Pill Button: "Connect / Scan QR" */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenDevices();
            }}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#0A0A0C] dark:bg-white text-white dark:text-[#0A0A0C] text-xs font-semibold shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Connect</span>
          </button>

          {/* Mobile More Button */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenMenu();
            }}
            className="md:hidden p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-hover transition-all cursor-pointer"
            aria-label="Menu"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
