import React, { useState, useEffect } from 'react';
import { Sun, Moon, QrCode, MoreHorizontal, Sparkles } from 'lucide-react';
import { sounds } from '../services/audio';
import { themeManager, Theme } from '../services/theme';
import { LogoIcon } from './LogoIcon';

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
    <header className="w-full max-w-[760px] mx-auto px-4 pt-4 sm:pt-6 pb-2 sticky top-0 z-40">
      {/* Floating Pill Navbar — Ultra Clean & Focused */}
      <div className="w-full bg-card/90 dark:bg-[#16161D]/90 backdrop-blur-md border border-border rounded-full shadow-pill px-4 py-2 sm:py-2.5 flex items-center justify-between transition-all">
        
        {/* Brand Logo & Name */}
        <div 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2.5 select-none cursor-pointer group"
        >
          <LogoIcon size={30} variant="badge" className="transition-transform group-hover:scale-105" />

          <span className="font-extrabold text-[17px] sm:text-[18px] tracking-tight text-text-primary">
            Quick<span className="text-[#FF5B37]">Pair</span>
          </span>
        </div>

        {/* Right Controls: Device Status Pill + Theme + More */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Active Device Pairing Status Pill */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenDevices();
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              peerCount > 0
                ? 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15'
                : 'bg-[#FF5B37]/10 border border-[#FF5B37]/20 text-[#FF5B37] hover:bg-[#FF5B37]/15'
            }`}
            title="Manage connected devices"
          >
            <span className={`w-2 h-2 rounded-full ${peerCount > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-[#FF5B37]'}`} />
            <span>{peerCount > 0 ? `${totalDevices} devices in sync` : 'Pair phone / laptop'}</span>
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

          {/* Quick Connect / QR Scan Trigger */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenDevices();
            }}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0A0A0C] dark:bg-white text-white dark:text-[#0A0A0C] text-xs font-semibold shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Scan QR</span>
          </button>

          {/* Options Menu Button */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenMenu();
            }}
            className="p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-hover transition-all cursor-pointer"
            aria-label="Options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
