import React from 'react';
import { UserX, Globe2, Cable, Zap, Sparkles, Check, ArrowUpRight } from 'lucide-react';
import { sounds } from '../services/audio';

export const WhySection: React.FC = () => {
  const features = [
    {
      icon: UserX,
      tag: '01',
      title: 'No account',
      description: 'Open the website and start sharing immediately. No emails, no passwords, no onboarding rituals.',
      subtext: 'Zero registration barrier',
      badge: 'Zero setup',
    },
    {
      icon: Globe2,
      tag: '02',
      title: 'No app',
      description: 'Works directly in any modern browser — Chrome, Safari, Firefox, Edge, Arc. Nothing to install.',
      subtext: 'Cross-platform native',
      badge: '100% Web',
    },
    {
      icon: Cable,
      tag: '03',
      title: 'No cables',
      description: 'Everything moves wirelessly over your local Wi-Fi at maximum hardware network throughput.',
      subtext: 'Air-dropped locally',
      badge: 'Local Wi-Fi',
    },
    {
      icon: Zap,
      tag: '04',
      title: 'No friction',
      description: 'Copy on device A, paste on device B. Drag files, click download. Done in milliseconds.',
      subtext: 'Sub-second delivery',
      badge: 'Instant sync',
    },
  ];

  return (
    <section id="why" className="py-24 relative overflow-hidden bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-semibold tracking-widest text-accent uppercase bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
            Why Simple.Savr
          </span>
          <h2 className="mt-4 font-display text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            The easiest way to move stuff <br className="hidden sm:inline" />
            <span className="text-gradient-accent">between devices.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-400">
            Designed to replace AirDrop workarounds, email self-threads, and messaging yourself links.
          </p>
        </div>

        {/* Feature Grid with Linear/Raycast cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                onMouseEnter={() => sounds.playClick()}
                className="group relative rounded-3xl p-7 bg-surface-100/70 hover:bg-surface-100 border border-border-subtle hover:border-accent/40 transition-all duration-300 shadow-card flex flex-col justify-between"
              >
                {/* Subtle Hover Gradient Glow */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <div>
                  {/* Top Bar inside card */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-surface-200 border border-border-medium flex items-center justify-center text-accent group-hover:scale-110 transition-transform duration-300 shadow-sm">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-mono text-zinc-500 font-semibold px-2 py-0.5 rounded bg-surface-200 border border-border-subtle">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="font-display text-xl font-bold text-white mb-2 group-hover:text-accent transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed font-light">
                    {feat.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-border-subtle/80 flex items-center justify-between text-xs font-mono text-zinc-500">
                  <span>{feat.subtext}</span>
                  <Check className="w-3.5 h-3.5 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
