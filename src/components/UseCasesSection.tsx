import React, { useRef } from 'react';
import {
  Laptop,
  Smartphone,
  Briefcase,
  Code,
  Plane,
  Palette,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { sounds } from '../services/audio';

export const UseCasesSection: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const useCases = [
    {
      icon: Laptop,
      badge: 'Mac ↔ iPhone',
      title: 'Laptop → Phone',
      description: 'Send a link, long address, phone number or 2FA message to your mobile in one click.',
      snippet: 'maps.apple.com/?q=Hotel+Astoria',
      accentColor: 'text-accent border-accent/20 bg-accent/10',
    },
    {
      icon: Smartphone,
      badge: 'Phone ↔ Mac',
      title: 'Phone → Laptop',
      description: 'Move camera photos, receipts, voice notes or downloaded PDFs to your workstation.',
      snippet: 'IMG_4920_Receipt_Scan.jpg (3.2MB)',
      accentColor: 'text-cyber-blue border-cyber-blue/20 bg-cyber-blue/10',
    },
    {
      icon: Briefcase,
      badge: 'Enterprise',
      title: 'Work & Specs',
      description: 'Move sensitive pitch decks, spreadsheets, and specs between work machines without cloud trails.',
      snippet: 'Q3_Financial_Forecast.xlsx',
      accentColor: 'text-cyber-purple border-cyber-purple/20 bg-cyber-purple/10',
    },
    {
      icon: Code,
      badge: 'Developer',
      title: 'Code & Tokens',
      description: 'Send API keys, terminal scripts, curl snippets, and git hashes without Slack pollution.',
      snippet: 'export OPENAI_API_KEY="sk-..."',
      accentColor: 'text-cyber-amber border-cyber-amber/20 bg-cyber-amber/10',
    },
    {
      icon: Plane,
      badge: 'On The Go',
      title: 'Travel & Bookings',
      description: 'Move flight boarding passes, hotel confirmation PDFs, and subway maps directly.',
      snippet: 'LH-492-BoardingPass.pdf',
      accentColor: 'text-cyber-rose border-cyber-rose/20 bg-cyber-rose/10',
    },
    {
      icon: Palette,
      badge: 'Design',
      title: 'Creative Assets',
      description: 'Move Figma vectors, color palette hex codes, PNG cutouts, and font files instantly.',
      snippet: 'Hero-Asset-Layer-2026.svg',
      accentColor: 'text-accent border-accent/20 bg-accent/10',
    },
  ];

  const handleScroll = (direction: 'left' | 'right') => {
    sounds.playClick();
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section id="use-cases" className="py-24 relative overflow-hidden bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with Navigation Arrows */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <span className="text-xs font-mono font-semibold tracking-widest text-accent uppercase bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
              Versatile Workflows
            </span>
            <h2 className="mt-4 font-display text-3xl sm:text-5xl font-bold tracking-tight text-white">
              Built for how you <span className="text-gradient-accent">actually work.</span>
            </h2>
            <p className="mt-3 text-base text-zinc-400">
              One shared space for every day-to-day cross-device interaction.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleScroll('left')}
              className="p-3 rounded-2xl bg-surface-100 hover:bg-surface-50 text-zinc-400 hover:text-white border border-border-medium transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="p-3 rounded-2xl bg-surface-100 hover:bg-surface-50 text-zinc-400 hover:text-white border border-border-medium transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Horizontal Scrollable Carousel Container */}
        <div
          ref={scrollRef}
          className="flex items-stretch gap-6 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {useCases.map((uc) => {
            const Icon = uc.icon;
            return (
              <div
                key={uc.title}
                className="w-[300px] sm:w-[360px] flex-shrink-0 snap-start rounded-3xl p-7 bg-surface-100 border border-border-subtle hover:border-border-medium transition-all duration-300 shadow-card flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-surface-200 border border-border-medium flex items-center justify-center text-zinc-300 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full border ${uc.accentColor}`}>
                      {uc.badge}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-xl text-white mb-2 group-hover:text-accent transition-colors">
                    {uc.title}
                  </h3>
                  <p className="text-sm text-zinc-400 font-light leading-relaxed mb-6">
                    {uc.description}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-surface-200 border border-border-subtle font-mono text-xs text-zinc-300 truncate">
                  <span className="text-zinc-500 mr-2">$</span>
                  {uc.snippet}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
