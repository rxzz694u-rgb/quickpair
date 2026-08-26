import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Wifi,
  CloudOff,
  Database,
  Server,
  Lock,
  ArrowDown,
  UserCheck,
  EyeOff,
  Cpu,
} from 'lucide-react';

export const PrivacySection: React.FC = () => {
  const trustPillars = [
    {
      title: 'No Account Required',
      description: 'We don’t know who you are, what device you use, or what you transfer. Zero identity tracking.',
      icon: UserCheck,
    },
    {
      title: 'Local Wi-Fi Sharing',
      description: 'Files move across your local network hardware. Data packets never touch an external storage bucket.',
      icon: Wifi,
    },
    {
      title: '100% In-Browser Execution',
      description: 'Runs entirely via standard Web APIs (BroadcastChannel, Web Crypto, WebRTC). No background daemons.',
      icon: Cpu,
    },
    {
      title: 'You Control Your Files',
      description: 'Closing the tab or clicking Clear immediately purges session caches from browser memory.',
      icon: EyeOff,
    },
  ];

  return (
    <section id="privacy" className="py-24 relative bg-surface-200/40 border-t border-border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-semibold tracking-widest text-accent uppercase bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
            Security & Trust
          </span>
          <h2 className="mt-4 font-display text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Private by <span className="text-gradient-accent">default.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-400">
            How your data stays in your room, instead of living indefinitely on third-party servers.
          </p>
        </div>

        {/* Visual Architecture Comparison Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          
          {/* ARCHITECTURE A: Simple.Savr Local P2P Model (The Good Way) */}
          <div className="rounded-3xl p-7 sm:p-8 bg-surface-100 border border-accent/40 shadow-glow-accent relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-48 h-48 bg-accent/10 blur-3xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-border-subtle">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-accent/10 border border-accent/30 flex items-center justify-center text-accent">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-white">Simple.Savr Local Architecture</h3>
                </div>
                <span className="text-xs font-mono text-accent bg-accent/10 px-2.5 py-0.5 rounded-full border border-accent/20">
                  Zero Cloud Upload
                </span>
              </div>

              {/* Step Pipeline Visualization */}
              <div className="space-y-4 max-w-md mx-auto py-2">
                <div className="p-3.5 rounded-xl bg-surface-200 border border-border-subtle flex items-center justify-between font-mono text-xs">
                  <span className="text-white font-medium">Device A (Laptop)</span>
                  <span className="text-zinc-500">Source</span>
                </div>

                <div className="flex flex-col items-center">
                  <ArrowDown className="w-4 h-4 text-accent animate-bounce" />
                </div>

                <div className="p-3.5 rounded-xl bg-accent/10 border border-accent/30 flex items-center justify-between font-mono text-xs text-accent">
                  <span className="font-semibold">Local Wi-Fi Network / P2P Tunnel</span>
                  <span>Direct RAM</span>
                </div>

                <div className="flex flex-col items-center">
                  <ArrowDown className="w-4 h-4 text-accent animate-bounce" />
                </div>

                <div className="p-3.5 rounded-xl bg-surface-200 border border-border-subtle flex items-center justify-between font-mono text-xs">
                  <span className="text-white font-medium">Device B (Phone)</span>
                  <span className="text-emerald-400 font-semibold">Instant Receipt</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-border-subtle flex items-center gap-2 text-xs font-mono text-accent">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>0 bytes stored externally · Local hardware bandwidth limit only</span>
            </div>
          </div>


          {/* ARCHITECTURE B: Traditional Cloud Model (The Bloated Way) */}
          <div className="rounded-3xl p-7 sm:p-8 bg-surface-100/50 border border-border-subtle opacity-75 hover:opacity-100 transition-opacity flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-border-subtle">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-surface-200 border border-border-subtle flex items-center justify-center text-zinc-500">
                    <CloudOff className="w-4 h-4" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-zinc-300">Legacy Cloud / Email Sync</h3>
                </div>
                <span className="text-xs font-mono text-zinc-500 bg-surface-200 px-2.5 py-0.5 rounded-full border border-border-subtle">
                  Heavy Overhead
                </span>
              </div>

              {/* Step Pipeline Visualization */}
              <div className="space-y-3 max-w-md mx-auto py-2 font-mono text-xs text-zinc-500">
                <div className="p-3 rounded-xl bg-surface-200/50 border border-border-subtle flex items-center justify-between">
                  <span>Device A (Laptop)</span>
                  <span>Uploads to Internet</span>
                </div>

                <div className="flex flex-col items-center">
                  <ArrowDown className="w-3.5 h-3.5 text-zinc-600" />
                </div>

                <div className="p-3 rounded-xl bg-surface-200/50 border border-border-subtle flex items-center justify-between">
                  <span>Third-Party Cloud Storage (AWS / GCP)</span>
                  <span className="text-amber-500/80">Stored on Disk</span>
                </div>

                <div className="flex flex-col items-center">
                  <ArrowDown className="w-3.5 h-3.5 text-zinc-600" />
                </div>

                <div className="p-3 rounded-xl bg-surface-200/50 border border-border-subtle flex items-center justify-between">
                  <span>Analytics & Account Database</span>
                  <span className="text-amber-500/80">Account Linked</span>
                </div>

                <div className="flex flex-col items-center">
                  <ArrowDown className="w-3.5 h-3.5 text-zinc-600" />
                </div>

                <div className="p-3 rounded-xl bg-surface-200/50 border border-border-subtle flex items-center justify-between">
                  <span>Device B (Phone)</span>
                  <span>Slow Download</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-border-subtle flex items-center gap-2 text-xs font-mono text-zinc-500">
              <XCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>Requires accounts, internet bandwidth, and leaves data footprints</span>
            </div>
          </div>

        </div>

        {/* 4 Trust Pillars Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustPillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="p-6 rounded-2xl bg-surface-100 border border-border-subtle hover:border-border-medium transition-colors space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-surface-200 border border-border-subtle flex items-center justify-center text-accent">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="font-display font-bold text-base text-white">{pillar.title}</h4>
                <p className="text-xs text-zinc-400 leading-relaxed font-light">{pillar.description}</p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
