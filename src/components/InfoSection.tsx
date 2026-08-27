import React from 'react';
import { InfoModalTab } from './InfoModal';
import { sounds } from '../services/audio';

interface InfoSectionProps {
  onOpenInfo?: (tab: InfoModalTab) => void;
}

export const InfoSection: React.FC<InfoSectionProps> = ({ onOpenInfo }) => {
  const handleClick = (e: React.MouseEvent, tab: InfoModalTab) => {
    e.preventDefault();
    sounds.playClick();
    if (onOpenInfo) {
      onOpenInfo(tab);
    }
  };

  return (
    <footer className="w-full max-w-[760px] mx-auto px-4 pt-3 pb-5 border-t border-border/60 mt-4 text-[11px] text-text-muted flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left select-none">
      {/* Left: Minimal Brand & Tagline */}
      <div className="flex items-center gap-1.5 text-[11px]">
        <span className="font-medium text-text-secondary">QuickPair</span>
        <span>·</span>
        <span className="text-text-muted">Local &amp; Remote Sharing</span>
      </div>

      {/* Center: Sleek Compact Links */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 text-[11px]">
        <button
          onClick={(e) => handleClick(e, 'about')}
          className="hover:text-text-primary transition-colors cursor-pointer"
        >
          How it works
        </button>
        <button
          onClick={(e) => handleClick(e, 'privacy')}
          className="hover:text-text-primary transition-colors cursor-pointer"
        >
          Privacy
        </button>
        <button
          onClick={(e) => handleClick(e, 'terms')}
          className="hover:text-text-primary transition-colors cursor-pointer"
        >
          Terms
        </button>
        <button
          onClick={(e) => handleClick(e, 'faq')}
          className="hover:text-text-primary transition-colors cursor-pointer"
        >
          FAQ
        </button>
        <button
          onClick={(e) => handleClick(e, 'contact')}
          className="text-accent hover:underline transition-colors cursor-pointer font-medium"
        >
          Contact
        </button>
      </div>

      {/* Right: Minimal Copyright */}
      <span className="text-[10px] sm:text-[11px] text-text-muted">© 2026 QuickPair</span>
    </footer>
  );
};
