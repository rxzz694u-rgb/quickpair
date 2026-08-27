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
    <footer className="w-full max-w-[840px] mx-auto px-4 pt-12 pb-6 mt-10 border-t border-border/80 relative overflow-hidden select-none">
      
      {/* Top Grid: Brand Statement & Multi-Column Links (Inspired by Image 4) */}
      <div className="grid grid-cols-2 sm:grid-cols-12 gap-8 text-xs relative z-10 pb-8">
        
        {/* Col 1: Brand & Bio */}
        <div className="col-span-2 sm:col-span-5 space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#8B5CF6] to-[#FF5B37] p-1 flex items-center justify-center text-white shadow-sm">
              <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 11l5 5 5-5" />
                <path d="M12 4v12" />
              </svg>
            </div>
            <span className="font-extrabold text-[16px] text-text-primary tracking-tight">
              Quick<span className="text-[#FF5B37]">Pair</span>
            </span>
          </div>
          <p className="text-text-muted text-[12px] leading-relaxed max-w-xs">
            The instant peer-to-peer sharing tool built for modern workflows. Move text, links, notes, and files with zero cloud uploads.
          </p>
        </div>

        {/* Col 2: Features */}
        <div className="col-span-1 sm:col-span-2 space-y-2">
          <p className="font-bold text-text-primary text-[12px]">Features</p>
          <ul className="space-y-1.5 text-text-muted text-[12px]">
            <li><span className="hover:text-text-primary transition-colors">Instant Wi-Fi</span></li>
            <li><span className="hover:text-text-primary transition-colors">P2P WebRTC</span></li>
            <li><span className="hover:text-text-primary transition-colors">E2EE Notes</span></li>
            <li><span className="hover:text-text-primary transition-colors">5-Day Purge</span></li>
          </ul>
        </div>

        {/* Col 3: Company / Legal */}
        <div className="col-span-1 sm:col-span-2 space-y-2">
          <p className="font-bold text-text-primary text-[12px]">Platform</p>
          <ul className="space-y-1.5 text-text-muted text-[12px]">
            <li>
              <button onClick={(e) => handleClick(e, 'about')} className="hover:text-text-primary transition-colors cursor-pointer">
                How it works
              </button>
            </li>
            <li>
              <button onClick={(e) => handleClick(e, 'privacy')} className="hover:text-text-primary transition-colors cursor-pointer">
                Privacy
              </button>
            </li>
            <li>
              <button onClick={(e) => handleClick(e, 'terms')} className="hover:text-text-primary transition-colors cursor-pointer">
                Security
              </button>
            </li>
            <li>
              <button onClick={(e) => handleClick(e, 'faq')} className="hover:text-text-primary transition-colors cursor-pointer">
                FAQ
              </button>
            </li>
          </ul>
        </div>

        {/* Col 4: Contact & Socials */}
        <div className="col-span-2 sm:col-span-3 space-y-2.5">
          <p className="font-bold text-text-primary text-[12px]">Connect</p>
          <p className="text-text-muted text-[12px]">
            Questions or suggestions?
          </p>
          <button
            onClick={(e) => handleClick(e, 'contact')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-subtle hover:bg-hover text-text-primary font-semibold text-xs border border-border transition-colors cursor-pointer"
          >
            <span>Contact Support</span>
          </button>
        </div>

      </div>

      {/* Bottom Bar: Copyright */}
      <div className="pt-4 border-t border-border/50 flex items-center justify-between text-[11px] text-text-muted relative z-10">
        <span>© 2026 QuickPair. Free &amp; Open Web Utility.</span>
        <span>AES-256 E2EE Enabled</span>
      </div>

      {/* Giant Sunset Coral Brand Watermark (Inspired by Image 4) */}
      <div className="w-full text-center mt-6 pt-2 pointer-events-none select-none overflow-hidden">
        <span className="text-[64px] sm:text-[110px] md:text-[140px] font-extrabold text-[#FF5B37]/10 dark:text-[#FF5B37]/15 tracking-tighter leading-none block transform translate-y-4 sm:translate-y-8">
          QuickPair
        </span>
      </div>

    </footer>
  );
};
