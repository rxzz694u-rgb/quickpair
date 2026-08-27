import React, { useState } from 'react';
import { Globe, Wifi, Share2, Sparkles, CheckCircle2, ArrowRight, Laptop, Smartphone, FileUp, Copy } from 'lucide-react';
import { sounds } from '../services/audio';

export const HowItWorks: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: '01',
      title: 'Open',
      headline: 'Open Simple.Savr on your devices.',
      description:
        'Navigate to Simple.Savr in your browser on your laptop, phone, iPad, or desktop. No sign-in or installation required.',
      icon: Globe,
      highlight: 'Zero install',
    },
    {
      num: '02',
      title: 'Connect',
      headline: "Make sure they're connected to the same Wi-Fi.",
      description:
        'Devices on the same local network automatically handshake over browser peer discovery, or connect via instantaneous camera QR scan.',
      icon: Wifi,
      highlight: 'Auto-discovery',
    },
    {
      num: '03',
      title: 'Share',
      headline: 'Type, paste, upload or download.',
      description:
        'Everything you write, paste, or drop appears instantly on your other screen. Fast, encrypted, and completely private.',
      icon: Share2,
      highlight: 'Instant transfer',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 relative bg-surface-200/40 border-t border-border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-semibold tracking-widest text-accent uppercase bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
            How It Works
          </span>
          <h2 className="mt-4 font-display text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Three steps. <span className="text-gradient-accent">Zero setup.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-400">
            Sharing files across different operating systems has never been this effortless.
          </p>
        </div>

        {/* 3 Step Interactive Navigator & Visual Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Interactive Step Selectors */}
          <div className="lg:col-span-5 space-y-4">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = activeStep === idx;
              return (
                <div
                  key={step.num}
                  onClick={() => {
                    sounds.playClick();
                    setActiveStep(idx);
                  }}
                  className={`cursor-pointer rounded-2xl p-6 border transition-all duration-300 relative overflow-hidden ${
                    isActive
                      ? 'bg-surface-100 border-accent/40 shadow-glow-accent'
                      : 'bg-surface-200/50 hover:bg-surface-100/80 border-border-subtle hover:border-border-medium'
                  }`}
                >
                  {/* Active Indicator Bar */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent" />
                  )}

                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-sm border transition-colors ${
                        isActive
                          ? 'bg-accent text-black border-accent'
                          : 'bg-surface-200 text-zinc-400 border-border-subtle'
                      }`}
                    >
                      {step.num}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-display text-lg font-bold ${isActive ? 'text-white' : 'text-zinc-300'}`}>
                          {step.title}
                        </h3>
                        <span className="text-[11px] font-mono text-zinc-500 bg-surface-200 px-2 py-0.5 rounded border border-border-subtle">
                          {step.highlight}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-400 leading-relaxed font-light">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Dynamic Stage Mockup representing Active Step */}
          <div className="lg:col-span-7 flex items-center justify-center">
            <div className="w-full max-w-xl rounded-3xl p-6 sm:p-8 bg-surface-100 border border-border-medium shadow-card relative overflow-hidden min-h-[380px] flex flex-col justify-between">
              
              {/* Background ambient lighting */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-3xl pointer-events-none" />

              {/* Stage Top Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-border-subtle text-xs font-mono text-zinc-400">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  Step {steps[activeStep].num} Simulation
                </span>
                <span className="text-accent font-semibold">{steps[activeStep].title.toUpperCase()}</span>
              </div>

              {/* Dynamic Visual Content according to Step */}
              <div className="py-6 flex items-center justify-center">
                
                {/* STEP 1 VISUAL: Both browsers open */}
                {activeStep === 0 && (
                  <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in zoom-in-95 duration-300">
                    <div className="w-48 p-4 rounded-2xl bg-surface-200 border border-border-medium text-center space-y-2">
                      <Laptop className="w-8 h-8 text-accent mx-auto" />
                      <p className="text-xs font-mono text-zinc-200 font-medium">simplesavr.app</p>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                        Ready on macOS
                      </span>
                    </div>

                    <ArrowRight className="w-5 h-5 text-zinc-600 rotate-90 sm:rotate-0" />

                    <div className="w-48 p-4 rounded-2xl bg-surface-200 border border-border-medium text-center space-y-2">
                      <Smartphone className="w-8 h-8 text-cyber-blue mx-auto" />
                      <p className="text-xs font-mono text-zinc-200 font-medium">simplesavr.app</p>
                      <span className="text-[10px] font-mono text-cyber-blue bg-cyber-blue/10 px-2 py-0.5 rounded-full">
                        Ready on iOS/Android
                      </span>
                    </div>
                  </div>
                )}

                {/* STEP 2 VISUAL: Wi-Fi handshake */}
                {activeStep === 1 && (
                  <div className="w-full flex flex-col items-center justify-center gap-4 text-center animate-in fade-in zoom-in-95 duration-300">
                    <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-surface-200 border border-accent/40 shadow-glow-accent">
                      <Wifi className="w-10 h-10 text-accent animate-pulse" />
                      <span className="absolute inset-0 rounded-full border border-accent/60 animate-ping opacity-30" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">Local Wi-Fi Handshake Established</h4>
                      <p className="text-xs font-mono text-zinc-400 mt-1">
                        SSID: "Studio_5GHz" · 2 peers paired via zero-config MDNS
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono text-accent bg-accent/10 px-3 py-1.5 rounded-full border border-accent/20">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Encrypted Peer-to-Peer Tunnel Ready</span>
                    </div>
                  </div>
                )}

                {/* STEP 3 VISUAL: Sharing animated items */}
                {activeStep === 2 && (
                  <div className="w-full space-y-3 animate-in fade-in zoom-in-95 duration-300">
                    <div className="p-3.5 rounded-xl bg-surface-200 border border-accent/30 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileUp className="w-4 h-4 text-accent" />
                        <span className="text-xs font-mono text-zinc-200">financial-forecast-2026.xlsx</span>
                      </div>
                      <span className="text-xs font-mono text-accent">Sent (0.12s)</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-surface-200 border border-border-subtle flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Copy className="w-4 h-4 text-cyber-blue" />
                        <span className="text-xs font-mono text-zinc-200">https://linear.app/issue/SAV-842</span>
                      </div>
                      <span className="text-xs font-mono text-cyber-blue">Synced on Phone</span>
                    </div>
                  </div>
                )}

              </div>

              {/* Bottom Quick Step Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-border-subtle text-xs font-mono text-zinc-500">
                <span>Navigate steps:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setActiveStep((prev) => (prev > 0 ? prev - 1 : 2));
                    }}
                    className="px-3 py-1 rounded-lg bg-surface-200 hover:bg-surface-50 text-zinc-300 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setActiveStep((prev) => (prev < 2 ? prev + 1 : 0));
                    }}
                    className="px-3 py-1 rounded-lg bg-accent text-black font-semibold transition-colors"
                  >
                    Next Step →
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
