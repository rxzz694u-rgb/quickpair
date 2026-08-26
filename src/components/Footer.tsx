import React from 'react';
import { Wifi, Sparkles, Command, Shield, ArrowUp } from 'lucide-react';
import { sounds } from '../services/audio';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    sounds.playClick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="py-14 bg-background border-t border-border-subtle text-zinc-500 font-mono text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-10 border-b border-border-subtle/80">
          {/* Brand mark */}
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="flex items-center gap-2 text-white font-display font-bold text-base">
              <div className="w-7 h-7 rounded-lg bg-surface-100 border border-border-medium flex items-center justify-center text-accent">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <path d="M4 8C8.41828 3.58172 15.5817 3.58172 20 8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                  <path d="M7 12C9.76142 9.23858 14.2386 9.23858 17 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeOpacity="0.75" />
                  <circle cx="12" cy="17" r="2" fill="currentColor" />
                </svg>
              </div>
              <span>Simple.Savr</span>
            </div>
            <span className="hidden sm:inline text-zinc-700">|</span>
            <p className="text-zinc-400 font-sans text-xs">
              Move anything between your devices. Instantly.
            </p>
          </div>

          {/* Operational Status & Quick Actions */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-surface-100 border border-border-subtle text-zinc-400 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span>Mesh Network Ready</span>
            </div>

            <button
              onClick={scrollToTop}
              className="p-2 rounded-xl bg-surface-100 hover:bg-surface-50 text-zinc-400 hover:text-white border border-border-subtle transition-colors"
              title="Back to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom Sub-footer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-500 text-[11px]">
          <div>
            © {new Date().getFullYear()} Simple.Savr. Designed with precision for Apple × Linear aesthetics.
          </div>

          <div className="flex items-center gap-6">
            <span>Client-side P2P</span>
            <span>Zero Cloud Footprint</span>
            <span>AES-256 GCM</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
