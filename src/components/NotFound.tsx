import React from 'react';
import { ArrowLeft, Home, WifiOff, Globe } from 'lucide-react';
import { sounds } from '../services/audio';

interface NotFoundProps {
  onGoHome: () => void;
}

export const NotFound: React.FC<NotFoundProps> = ({ onGoHome }) => {
  const handleHome = () => {
    sounds.playClick();
    if (typeof window !== 'undefined' && window.history) {
      window.history.pushState({}, '', '/');
    }
    onGoHome();
  };

  return (
    <div className="min-h-screen bg-background bg-graph-pattern text-text-primary flex flex-col items-center justify-center p-4 font-sans selection:bg-accent-light selection:text-accent antialiased text-center">
      {/* 404 Visual Icon Card */}
      <div className="w-full max-w-md p-8 sm:p-10 bg-card rounded-2xl border border-border shadow-card space-y-5 animate-fade">
        <div className="w-14 h-14 rounded-2xl bg-subtle border border-border flex items-center justify-center mx-auto text-text-secondary">
          <WifiOff className="w-7 h-7" />
        </div>

        <div className="space-y-1.5">
          <span className="text-xs font-mono font-semibold text-accent uppercase tracking-wider">
            Error 404
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
            Page not found
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            The link you followed may be broken, expired, or the sharing room is no longer active.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={handleHome}
            className="w-full py-3 px-4 rounded-xl bg-text-primary hover:opacity-90 active:opacity-80 text-background text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Back to QuickPair</span>
          </button>
        </div>
      </div>

      {/* Footnote */}
      <div className="mt-8 text-xs text-text-muted">
        <span>QuickPair · Local &amp; Remote Device Sharing</span>
      </div>
    </div>
  );
};
