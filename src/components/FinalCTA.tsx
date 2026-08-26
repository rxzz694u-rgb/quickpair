import React from 'react';
import { ArrowRight, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import { sounds } from '../services/audio';

interface FinalCTAProps {
  onOpenApp: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onOpenApp }) => {
  return (
    <section className="py-28 relative overflow-hidden bg-surface-200/50 border-t border-border-subtle text-center">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-accent/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent font-mono text-xs font-semibold mb-6">
          <Zap className="w-3.5 h-3.5" /> Instant Local Mesh
        </div>

        <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-tight">
          Stop emailing <br />
          <span className="text-gradient-accent">yourself files.</span>
        </h2>

        <p className="mt-6 text-lg sm:text-xl text-zinc-400 font-light max-w-xl mx-auto">
          Open Simple.Savr and start moving things between your devices immediately.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => {
              sounds.playPop();
              onOpenApp();
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-9 py-4 rounded-2xl bg-accent hover:bg-accent-400 text-black font-bold text-base shadow-glow-accent hover:shadow-glow-accent-lg transition-all duration-300 group"
          >
            <span>Open Simple.Savr</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 duration-200" />
          </button>
        </div>

        <p className="mt-6 text-xs font-mono text-zinc-500">
          No account. No app. Just your browser.
        </p>

      </div>
    </section>
  );
};
