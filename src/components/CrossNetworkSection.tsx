import React from 'react';
import { Globe2, ShieldCheck, Key, ArrowRight, Laptop, Smartphone, Lock, Radio } from 'lucide-react';
import { sounds } from '../services/audio';

export const CrossNetworkSection: React.FC = () => {
  return (
    <section id="cross-network" className="py-24 relative bg-surface-200/30 border-t border-border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-semibold tracking-widest text-cyber-blue uppercase bg-cyber-blue/10 px-3 py-1 rounded-full border border-cyber-blue/20">
            Cross-Network Pairing
          </span>
          <h2 className="mt-4 font-display text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Not on the same network? <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-cyber-blue">
              Still connected.
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-400">
            When you're on different Wi-Fi networks or mobile cellular data, pair instantly via a temporary 6-digit room code with end-to-end encrypted WebRTC.
          </p>
        </div>

        {/* Global Topology Visual Container */}
        <div className="max-w-4xl mx-auto rounded-3xl p-6 sm:p-10 bg-surface-100 border border-border-medium shadow-card relative overflow-hidden">
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-cyber-blue/5 blur-[120px] rounded-full pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
            
            {/* NODE 1: Phone in Dubai / Cellular */}
            <div className="md:col-span-4 p-5 rounded-2xl bg-surface-200 border border-border-medium text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-surface-100 border border-border-subtle flex items-center justify-center mx-auto text-cyber-blue">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-display font-bold text-white text-base">Phone in Dubai</h4>
                <p className="text-xs font-mono text-zinc-400 mt-0.5">5G Cellular Network</p>
              </div>
              <div className="p-2 rounded-xl bg-surface-300 border border-border-subtle font-mono text-xs text-cyber-blue">
                Room Code: #940-281
              </div>
            </div>

            {/* SECURE E2E CHANNEL CONDUIT */}
            <div className="md:col-span-4 flex flex-col items-center justify-center text-center space-y-2 py-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyber-blue/10 border border-cyber-blue/30 text-cyber-blue text-xs font-mono">
                <Lock className="w-3.5 h-3.5" />
                <span>WebRTC E2EE Relay</span>
              </div>
              
              <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-cyber-blue/50 to-transparent relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyber-blue animate-ping" />
              </div>

              <span className="text-[11px] font-mono text-zinc-500">
                Direct browser handshake
              </span>
            </div>

            {/* NODE 2: Laptop Elsewhere (London / Home) */}
            <div className="md:col-span-4 p-5 rounded-2xl bg-surface-200 border border-border-medium text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-surface-100 border border-border-subtle flex items-center justify-center mx-auto text-cyber-blue">
                <Laptop className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-display font-bold text-white text-base">Laptop at Home</h4>
                <p className="text-xs font-mono text-zinc-400 mt-0.5">Home Fiber Wi-Fi</p>
              </div>
              <div className="p-2 rounded-xl bg-surface-300 border border-border-subtle font-mono text-xs text-cyber-blue">
                Matched & Verified
              </div>
            </div>

          </div>

          <div className="mt-8 pt-6 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-zinc-400 gap-4">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyber-blue" />
              Signaling only coordinates connection — zero payload retained
            </span>
            <span className="text-zinc-500">End-to-End Encrypted</span>
          </div>

        </div>

      </div>
    </section>
  );
};
