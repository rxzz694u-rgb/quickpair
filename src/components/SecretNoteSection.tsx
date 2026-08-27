import React, { useState, useEffect } from 'react';
import {
  Lock,
  Flame,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
  Shield,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCcw,
} from 'lucide-react';
import { sounds } from '../services/audio';
import { encryptSecretNote } from '../services/crypto';

export const SecretNoteSection: React.FC = () => {
  const [noteContent, setNoteContent] = useState('WiFi Master Key: $uperSecur3-2026!');
  const [stage, setStage] = useState<'create' | 'encrypted' | 'opened' | 'destroyed'>('create');
  const [ciphertextPreview, setCiphertextPreview] = useState('AES256:GCM:a7b8c9d0...f1e2');
  const [countdown, setCountdown] = useState(5);
  const [isVaporizing, setIsVaporizing] = useState(false);

  const handleCreateSecretNote = async () => {
    sounds.playPop();
    const payload = await encryptSecretNote(noteContent);
    setCiphertextPreview(payload.ciphertext.substring(0, 32) + '... (256-bit AES-GCM)');
    setStage('encrypted');
  };

  const handleOpenSecretNote = () => {
    sounds.playClick();
    setStage('opened');
    setCountdown(5);
  };

  useEffect(() => {
    let timer: number;
    if (stage === 'opened' && countdown > 0) {
      timer = window.setInterval(() => {
        setCountdown((c) => c - 1);
      }, 1000);
    } else if (stage === 'opened' && countdown === 0) {
      setIsVaporizing(true);
      sounds.playBurn();
      setTimeout(() => {
        setIsVaporizing(false);
        setStage('destroyed');
      }, 800);
    }
    return () => clearInterval(timer);
  }, [stage, countdown]);

  const handleReset = () => {
    sounds.playClick();
    setStage('create');
    setCountdown(5);
    setNoteContent('WiFi Master Key: $uperSecur3-2026!');
  };

  return (
    <section id="secret-notes" className="py-24 relative overflow-hidden bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-semibold tracking-widest text-cyber-rose uppercase bg-cyber-rose/10 px-3 py-1 rounded-full border border-cyber-rose/20">
            Ephemeral Privacy
          </span>
          <h2 className="mt-4 font-display text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Some things should <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-rose-300 to-cyber-rose">disappear.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-400">
            Create a secret note that is encrypted in your browser and disappears after it's read.
          </p>
        </div>

        {/* Life-cycle Visual Step Bar: Sent -> Opened -> Destroyed */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 mb-12 font-mono text-xs text-zinc-400">
          <span
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
              stage === 'encrypted' || stage === 'opened' || stage === 'destroyed'
                ? 'bg-cyber-rose/15 border-cyber-rose/40 text-cyber-rose font-semibold'
                : 'bg-surface-100 border-border-subtle'
            }`}
          >
            <Lock className="w-3.5 h-3.5" /> 1. Encrypted & Sent
          </span>
          <ArrowRight className="w-4 h-4 text-zinc-600" />
          <span
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
              stage === 'opened' || stage === 'destroyed'
                ? 'bg-cyber-amber/15 border-cyber-amber/40 text-cyber-amber font-semibold'
                : 'bg-surface-100 border-border-subtle'
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> 2. Opened on Device
          </span>
          <ArrowRight className="w-4 h-4 text-zinc-600" />
          <span
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
              stage === 'destroyed'
                ? 'bg-red-500/20 border-red-500/50 text-red-400 font-semibold'
                : 'bg-surface-100 border-border-subtle'
            }`}
          >
            <Flame className="w-3.5 h-3.5" /> 3. Destroyed Forever
          </span>
        </div>

        {/* Interactive Encrypted Note Card Box */}
        <div className="max-w-2xl mx-auto rounded-3xl p-6 sm:p-10 bg-surface-100 border border-border-medium shadow-card relative overflow-hidden">
          
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyber-rose/5 blur-3xl pointer-events-none" />

          {/* STAGE 1: CREATE NOTE */}
          {stage === 'create' && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-cyber-rose/10 border border-cyber-rose/30 flex items-center justify-center text-cyber-rose">
                    <Lock className="w-4 h-4" />
                  </div>
                  <span className="font-display font-bold text-white text-base">New Secret Note</span>
                </div>
                <span className="text-[11px] font-mono text-zinc-400 bg-surface-200 px-2.5 py-1 rounded-full border border-border-subtle">
                  Client AES-GCM
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                  Secret Note Content
                </label>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  rows={3}
                  placeholder="Type sensitive passwords, tokens, or private notes..."
                  className="w-full bg-surface-200 text-white font-mono text-sm p-4 rounded-2xl border border-border-medium focus:outline-none focus:border-cyber-rose focus:ring-1 focus:ring-cyber-rose transition-all resize-none shadow-inner"
                />
              </div>

              <button
                onClick={handleCreateSecretNote}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-cyber-rose hover:from-rose-400 hover:to-cyber-rose text-black font-semibold text-sm shadow-lg shadow-cyber-rose/20 transition-all flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>Create Secret Note (Encrypt & Send)</span>
              </button>
            </div>
          )}

          {/* STAGE 2: ENCRYPTED & WAITING */}
          {stage === 'encrypted' && (
            <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-2xl bg-cyber-rose/10 border border-cyber-rose/30 flex items-center justify-center mx-auto text-cyber-rose">
                <Lock className="w-7 h-7" />
              </div>

              <div>
                <h3 className="font-display font-bold text-xl text-white">🔒 Secret Note Encrypted</h3>
                <p className="text-xs text-zinc-400 mt-1 font-mono">
                  Payload is locked with AES-256 in local RAM.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-surface-200 border border-border-subtle font-mono text-xs text-zinc-400 break-all select-none">
                {ciphertextPreview}
              </div>

              <button
                onClick={handleOpenSecretNote}
                className="w-full py-3.5 rounded-2xl bg-surface-200 hover:bg-surface-50 text-white font-semibold text-sm border border-border-medium hover:border-cyber-amber/50 transition-all flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4 text-cyber-amber" />
                <span>Open & Read on Secondary Device</span>
              </button>
            </div>
          )}

          {/* STAGE 3: OPENED & COUNTDOWN TO DESTRUCTION */}
          {stage === 'opened' && (
            <div
              className={`space-y-6 text-center transition-all duration-300 ${
                isVaporizing ? 'opacity-0 scale-95 blur-md' : 'opacity-100 scale-100'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                <div className="flex items-center gap-2 text-xs font-mono text-cyber-amber">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Decrypted in Browser Memory</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-xs font-bold animate-pulse">
                  <Flame className="w-3.5 h-3.5" /> Self-destruct in {countdown}s
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-surface-200 border border-cyber-amber/30 text-left">
                <p className="font-mono text-sm text-zinc-100 font-medium">
                  {noteContent}
                </p>
              </div>

              <p className="text-xs font-mono text-zinc-500">
                This note will be automatically zeroed from memory in {countdown} seconds.
              </p>
            </div>
          )}

          {/* STAGE 4: DESTROYED */}
          {stage === 'destroyed' && (
            <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
                <Flame className="w-7 h-7 animate-bounce" />
              </div>

              <div>
                <h3 className="font-display font-bold text-xl text-white">Vaporized & Destroyed</h3>
                <p className="text-xs text-zinc-400 mt-1 font-mono">
                  Zero plain text remains in memory or on the network.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-surface-200 border border-dashed border-red-500/30 font-mono text-xs text-red-400/80">
                [Content Zeroed: Memory Overwritten with 0x00]
              </div>

              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-surface-200 hover:bg-surface-50 text-xs font-mono text-zinc-200 hover:text-white border border-border-medium transition-colors"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                <span>Create Another Secret Note</span>
              </button>
            </div>
          )}

        </div>

      </div>
    </section>
  );
};
