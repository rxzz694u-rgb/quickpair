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
    <footer className="w-full max-w-[760px] mx-auto px-4 pt-8 pb-10 border-t border-border mt-8 text-xs text-text-secondary flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-text-primary">QuickPair</span>
        <span className="text-text-muted">·</span>
        <span className="text-[11px] text-text-muted">Local &amp; Remote Sharing</span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3.5 text-[12px]">
        <button
          onClick={(e) => handleClick(e, 'about')}
          className="hover:text-text-primary transition-colors py-1 cursor-pointer"
        >
          How it works
        </button>
        <button
          onClick={(e) => handleClick(e, 'privacy')}
          className="hover:text-text-primary transition-colors py-1 cursor-pointer"
        >
          Privacy
        </button>
        <button
          onClick={(e) => handleClick(e, 'terms')}
          className="hover:text-text-primary transition-colors py-1 cursor-pointer"
        >
          Terms
        </button>
        <button
          onClick={(e) => handleClick(e, 'faq')}
          className="hover:text-text-primary transition-colors py-1 cursor-pointer"
        >
          FAQ
        </button>
      </div>

      <span className="text-[11px] text-text-muted">© 2026 QuickPair</span>
    </footer>
  );
};
