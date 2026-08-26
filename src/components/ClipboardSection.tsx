import React, { useState } from 'react';
import {
  Link,
  Phone,
  MapPin,
  Code2,
  MessageSquare,
  Sparkles,
  Copy,
  Check,
  Laptop,
  Smartphone,
  ArrowDown,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { sounds } from '../services/audio';

export const ClipboardSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('links');
  const [isCopied, setIsCopied] = useState(false);
  const [isBeaming, setIsBeaming] = useState(false);

  const categories = [
    {
      id: 'links',
      label: 'Links',
      icon: Link,
      example: 'https://linear.app/design/v2-preview',
      note: 'Instantly opens in mobile browser without typing lengthy URLs',
      type: 'URL',
    },
    {
      id: 'phone',
      label: 'Phone numbers',
      icon: Phone,
      example: '+1 (555) 839-2041',
      note: 'Tap on your phone to call instantly without retyping digits',
      type: 'CONTACT',
    },
    {
      id: 'address',
      label: 'Addresses',
      icon: MapPin,
      example: '742 Evergreen Terrace, Springfield, OR 97477',
      note: 'Directly opens in Apple Maps or Google Maps on mobile',
      type: 'LOCATION',
    },
    {
      id: 'code',
      label: 'Code snippets',
      icon: Code2,
      example: 'ssh -i ~/.ssh/prod_key root@192.168.1.100',
      note: 'Move terminal commands, tokens, or scripts cleanly',
      type: 'CODE',
    },
    {
      id: 'messages',
      label: 'Messages & OTPs',
      icon: MessageSquare,
      example: 'Your verification code is 849-201 (Valid for 5 mins)',
      note: 'Paste 2FA codes directly into desktop login forms',
      type: 'OTP / NOTE',
    },
  ];

  const current = categories.find((c) => c.id === activeCategory) || categories[0];

  const handleCategoryChange = (id: string) => {
    sounds.playClick();
    setIsBeaming(true);
    setActiveCategory(id);
    setTimeout(() => {
      setIsBeaming(false);
    }, 450);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(current.example);
    sounds.playCopy();
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <section id="clipboard" className="py-24 relative overflow-hidden bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-mono font-semibold tracking-widest text-accent uppercase bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
            Universal Clipboard
          </span>
          <h2 className="mt-4 font-display text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Your clipboard, <span className="text-gradient-accent">everywhere.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-400">
            Copy anything on one screen. It’s immediately waiting on your other devices.
          </p>
        </div>

        {/* Category Pills Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto mb-12">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium transition-all duration-200 border ${
                  isActive
                    ? 'bg-accent/15 border-accent/50 text-accent shadow-glow-accent'
                    : 'bg-surface-100 hover:bg-surface-50 border-border-subtle text-zinc-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Live Visual Demonstration Stage */}
        <div className="max-w-4xl mx-auto rounded-3xl p-6 sm:p-10 bg-surface-100 border border-border-medium shadow-card relative overflow-hidden">
          
          {/* Subtle glow background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
            
            {/* SENDER DEVICE (Laptop) */}
            <div className="md:col-span-5 p-5 rounded-2xl bg-surface-200 border border-border-medium shadow-inner">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-border-subtle text-xs font-mono text-zinc-400">
                <div className="flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-accent" />
                  <span>Laptop Clipboard</span>
                </div>
                <span className="text-[10px] text-zinc-500 bg-surface-100 px-2 py-0.5 rounded border border-border-subtle">
                  COPIED (Cmd+C)
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-300 border border-border-subtle font-mono text-xs text-zinc-200 break-all select-all">
                {current.example}
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                <span>Type: {current.type}</span>
                <span className="text-accent font-semibold">Broadcasting</span>
              </div>
            </div>

            {/* ANIMATED CONDUIT (Transfer Stream) */}
            <div className="md:col-span-2 flex flex-col items-center justify-center py-2">
              <div className="hidden md:flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-surface-200 border border-accent/30 flex items-center justify-center">
                  <ArrowRight className={`w-4 h-4 text-accent transition-transform duration-300 ${isBeaming ? 'translate-x-1' : ''}`} />
                </div>
                <span className="text-[10px] font-mono text-zinc-500">Instant</span>
              </div>

              <div className="flex md:hidden flex-col items-center gap-1">
                <ArrowDown className="w-5 h-5 text-accent animate-bounce" />
              </div>
            </div>

            {/* RECEIVER DEVICE (Phone) */}
            <div className="md:col-span-5 p-5 rounded-2xl bg-surface-200 border border-border-medium shadow-inner">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-border-subtle text-xs font-mono text-zinc-400">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-accent" />
                  <span>Phone Clipboard</span>
                </div>
                <span className="text-[10px] text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                  READY (Tap Paste)
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-300 border border-border-subtle font-mono text-xs text-zinc-200 break-all flex items-center justify-between gap-2">
                <span className="truncate">{current.example}</span>
                <button
                  onClick={handleCopy}
                  className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-surface-100 hover:bg-surface-50 text-[11px] font-mono text-zinc-200 hover:text-white border border-border-subtle transition-colors"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3 h-3 text-accent" />
                      <span className="text-accent">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <p className="mt-3 text-[11px] text-zinc-400 font-light italic">
                {current.note}
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
