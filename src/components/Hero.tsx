import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Wifi, Copy, Check, Smartphone, Monitor, ShieldCheck, Zap, CornerDownLeft } from 'lucide-react';
import { sounds } from '../services/audio';

interface HeroProps {
  onOpenApp: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenApp }) => {
  const [laptopInput, setLaptopInput] = useState('Hey, check this link 👀');
  const [phoneContent, setPhoneContent] = useState('Hey, check this link 👀');
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [activePreset, setActivePreset] = useState(0);

  const presets = [
    'Hey, check this link 👀',
    'https://figma.com/@design/v2-preview',
    '4920 1829 0041 (Wi-Fi Passkey)',
    'git rebase origin/main --autostash',
  ];

  // Auto-cycle presets if user is not actively typing
  useEffect(() => {
    const timer = setInterval(() => {
      setActivePreset((prev) => {
        const next = (prev + 1) % presets.length;
        triggerBeam(presets[next]);
        return next;
      });
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const triggerBeam = (text: string) => {
    setLaptopInput(text);
    setIsTransmitting(true);
    sounds.playPop();

    setTimeout(() => {
      setPhoneContent(text);
      setIsTransmitting(false);
    }, 600);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLaptopInput(val);
    setIsTransmitting(true);
    setTimeout(() => {
      setPhoneContent(val);
      setIsTransmitting(false);
    }, 350);
  };

  const handleCopyPhone = () => {
    if (!phoneContent) return;
    navigator.clipboard.writeText(phoneContent);
    sounds.playCopy();
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-grid-pattern">
      {/* Ambient background glow & radial gradient */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[900px] h-[400px] bg-accent/10 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/2 right-10 w-[400px] h-[400px] bg-cyber-blue/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-100/90 border border-border-medium shadow-sm mb-8 animate-in fade-in duration-700">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
          </span>
          <span className="text-xs font-mono font-semibold tracking-wider text-zinc-300 uppercase">
            SIMPLE.SAVR
          </span>
          <span className="text-zinc-600 font-mono">/</span>
          <span className="text-xs font-medium text-accent flex items-center gap-1">
            <Zap className="w-3 h-3" /> Zero-friction sharing
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white max-w-5xl mx-auto leading-[1.05] sm:leading-[1.02]">
          Your devices. <br />
          <span className="text-gradient-accent">One shared space.</span>
        </h1>

        {/* Supporting Line */}
        <p className="mt-6 md:mt-8 text-lg sm:text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed">
          Copy on your laptop. Paste on your phone. <br className="hidden sm:inline" />
          Send files without cables, apps, or accounts.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => {
              sounds.playPop();
              onOpenApp();
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-accent hover:bg-accent-400 text-black font-semibold text-base shadow-glow-accent hover:shadow-glow-accent-lg transition-all duration-300 group"
          >
            <span>Open Simple.Savr</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 duration-200" />
          </button>

          <a
            href="#how-it-works"
            onClick={() => sounds.playClick()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-surface-100 hover:bg-surface-50 text-zinc-300 hover:text-white font-medium text-base border border-border-medium hover:border-zinc-700 transition-all duration-200"
          >
            See how it works
          </a>
        </div>

        {/* Status Indicators Pill */}
        <div className="mt-8 flex items-center justify-center gap-4 text-xs font-mono text-zinc-400">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-200/80 border border-border-subtle">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            Connected
          </span>
          <span className="hidden sm:inline text-zinc-600">·</span>
          <span>Same Wi-Fi</span>
          <span className="text-zinc-600">·</span>
          <span>No account required</span>
        </div>

        {/* INTERACTIVE HERO DEMO VISUALIZATION: Laptop -> Wi-Fi -> Phone */}
        <div className="mt-14 md:mt-20 relative max-w-5xl mx-auto">
          {/* Outer framing glow container */}
          <div className="relative rounded-3xl p-4 sm:p-8 bg-surface-200/50 backdrop-blur-xl border border-border-medium shadow-card overflow-hidden">
            
            {/* Background subtle noise and accent gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

            {/* Quick Interactive Presets Selector */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-8 relative z-10">
              <span className="text-xs font-mono text-zinc-500 mr-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-accent" /> Try sending:
              </span>
              {presets.map((text, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActivePreset(idx);
                    triggerBeam(text);
                  }}
                  className={`text-xs px-3 py-1 rounded-lg border transition-all duration-200 font-mono truncate max-w-[200px] sm:max-w-none ${
                    laptopInput === text
                      ? 'bg-accent/15 border-accent/40 text-accent'
                      : 'bg-surface-100 hover:bg-surface-50 border-border-subtle text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {text}
                </button>
              ))}
            </div>

            {/* Dual Device Stage */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
              
              {/* DEVICE 1: Laptop Screen Mockup */}
              <div className="lg:col-span-5 text-left">
                <div className="rounded-2xl bg-surface-100 border border-border-medium p-4 shadow-xl relative group">
                  {/* Laptop Window Header */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-border-subtle">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400">
                      <Monitor className="w-3.5 h-3.5 text-zinc-500" />
                      <span>MacBook Pro · Office 5G</span>
                    </div>
                    <span className="text-[10px] font-mono text-accent bg-accent/10 px-1.5 py-0.5 rounded border border-accent/20">
                      SENDER
                    </span>
                  </div>

                  {/* Laptop Content Input */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block">
                      Type or paste content on Laptop
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={laptopInput}
                        onChange={handleInputChange}
                        placeholder="Type anything here..."
                        className="w-full bg-surface-200/90 text-white text-sm font-mono px-3.5 py-2.5 rounded-xl border border-border-medium focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                      />
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 text-xs flex items-center gap-1">
                        <CornerDownLeft className="w-3 h-3" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-500">
                      <span>Zero keystroke lag</span>
                      <span className="font-mono text-accent">Auto-streaming</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CENTER CONDUIT: Animated Wi-Fi Data Stream */}
              <div className="lg:col-span-2 flex flex-col items-center justify-center py-2 lg:py-0">
                <div className="flex lg:flex-col items-center gap-3">
                  <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-surface-100 border border-border-medium shadow-inner">
                    <Wifi className={`w-5 h-5 transition-colors duration-300 ${isTransmitting ? 'text-accent scale-110' : 'text-zinc-400'}`} />
                    {isTransmitting && (
                      <span className="absolute inset-0 rounded-2xl border border-accent animate-ping opacity-50" />
                    )}
                  </div>

                  {/* Animated Data Packet Stream */}
                  <div className="relative h-1 w-24 lg:h-16 lg:w-1 bg-surface-300 rounded-full overflow-hidden">
                    <div
                      className={`absolute inset-0 bg-gradient-to-r lg:bg-gradient-to-b from-transparent via-accent to-transparent transition-opacity duration-300 ${
                        isTransmitting ? 'opacity-100' : 'opacity-40'
                      }`}
                      style={{
                        animation: isTransmitting ? 'beam 0.8s linear infinite' : 'beam 2s linear infinite',
                      }}
                    />
                  </div>

                  <span className="text-[10px] font-mono text-zinc-500 tracking-wider">
                    {isTransmitting ? (
                      <span className="text-accent font-semibold animate-pulse">0.2ms P2P</span>
                    ) : (
                      'Direct Wi-Fi'
                    )}
                  </span>
                </div>
              </div>

              {/* DEVICE 2: Phone Screen Mockup */}
              <div className="lg:col-span-5 text-left">
                <div className="rounded-2xl bg-surface-100 border border-border-medium p-4 shadow-xl relative">
                  {/* Phone Notch & Header */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-border-subtle">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400">
                      <Smartphone className="w-3.5 h-3.5 text-zinc-500" />
                      <span>iPhone 16 Pro · Same Wi-Fi</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded border border-emerald-400/20">
                      RECEIVER
                    </span>
                  </div>

                  {/* Phone Synchronized Display */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block">
                      Live Synchronized on Phone
                    </label>
                    <div className="relative flex items-center justify-between bg-surface-200/90 text-white text-sm font-mono px-3.5 py-2.5 rounded-xl border border-border-medium overflow-hidden">
                      <span className="truncate pr-2 text-zinc-200 font-medium">
                        {phoneContent || <span className="text-zinc-600">Waiting for data...</span>}
                      </span>
                      <button
                        onClick={handleCopyPhone}
                        className="flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-100 hover:bg-surface-50 text-xs font-sans text-zinc-300 hover:text-white border border-border-subtle hover:border-accent/40 transition-all"
                        title="Copy to phone clipboard"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-accent" />
                            <span className="text-accent text-[11px]">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span className="text-[11px]">Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-500">
                      <span className="flex items-center gap-1 text-accent">
                        <ShieldCheck className="w-3.5 h-3.5" /> Direct local memory
                      </span>
                      <span className="font-mono">Ready to paste</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
