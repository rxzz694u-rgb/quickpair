import React from 'react';
import { InfoModalTab } from './InfoModal';
import { sounds } from '../services/audio';
import { LogoIcon } from './LogoIcon';

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
    <footer className="w-full max-w-[760px] mx-auto px-4 py-8 mt-auto border-t border-border/70 select-none">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
        
        {/* Left: Minimal Brand Statement */}
        <div className="flex items-center gap-2">
          <LogoIcon size={20} variant="badge" />
          <span className="font-bold text-text-primary">QuickPair</span>
          <span>·</span>
          <span>Zero cloud uploads · No account required</span>
        </div>

        {/* Right: Clean Modal Links */}
        <div className="flex items-center gap-4 font-medium">
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
            Security
          </button>
          <button
            onClick={(e) => handleClick(e, 'faq')}
            className="hover:text-text-primary transition-colors cursor-pointer"
          >
            FAQ
          </button>
        </div>

      </div>
    </footer>
  );
};
