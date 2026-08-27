import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Globe, ArrowRight, RotateCw, QrCode } from 'lucide-react';
import QRCode from 'qrcode';
import { sounds } from '../services/audio';
import { peerSync } from '../services/peerSync';

interface QRConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QRConnectModal: React.FC<QRConnectModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'qr' | 'code'>('qr');
  const [inputCode, setInputCode] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [roomCode, setRoomCode] = useState(peerSync.getRoomCode());

  useEffect(() => {
    const unsubscribe = peerSync.subscribe((_items, _peers, code) => {
      setRoomCode(code);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://quickpair.vercel.app';
    const targetUrl = roomCode === 'MAIN' ? origin : `${origin}/?room=${roomCode}`;

    QRCode.toDataURL(targetUrl, {
      width: 280,
      margin: 1.5,
      color: {
        dark: '#0A0A0C',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        setQrDataUrl(url);
      })
      .catch(() => {});
  }, [isOpen, roomCode]);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://quickpair.vercel.app';
  const fullShareUrl = roomCode === 'MAIN' ? currentOrigin : `${currentOrigin}/?room=${roomCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullShareUrl);
    sounds.playCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateNewCode = () => {
    sounds.playPop();
    const newCode = peerSync.generateNewRoomCode();
    setRoomCode(newCode);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    sounds.playSuccess();
    peerSync.setRoom(inputCode.trim().toUpperCase());
    setInputCode('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-[3px] animate-fade">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-sm bg-card rounded-t-[28px] sm:rounded-3xl border-t sm:border border-border p-5 sm:p-6 shadow-2xl animate-sheet-up z-10 text-center space-y-4">
        <div className="w-12 h-1.5 bg-border rounded-full mx-auto sm:hidden mb-1" />

        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-border/80">
          <h2 className="text-[17px] font-bold text-text-primary">Connect devices</h2>
          <button onClick={onClose} className="p-1.5 rounded-full text-text-muted hover:text-text-primary hover:bg-subtle transition-colors" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Segmented Mode Selector */}
        <div className="grid grid-cols-2 gap-1.5 bg-subtle p-1 rounded-2xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setActiveTab('qr');
            }}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'qr'
                ? 'bg-card text-text-primary shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Scan QR Code</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setActiveTab('code');
            }}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'code'
                ? 'bg-card text-text-primary shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-[#FF5B37]" />
            <span>Room Code</span>
          </button>
        </div>

        {/* 1. SCAN QR CODE TAB */}
        {activeTab === 'qr' ? (
          <div className="space-y-3.5 animate-fade pt-1">
            <p className="text-xs text-text-muted leading-relaxed">
              Scan with your phone camera to pair instantly on same Wi-Fi or cellular data (4G/5G).
            </p>

            {/* Real Dynamic QR Code */}
            <div className="p-3.5 bg-white rounded-3xl border border-border inline-block shadow-md mx-auto">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR code for room ${roomCode}`}
                  className="w-40 h-40 sm:w-44 sm:h-44 rounded-2xl aspect-square"
                />
              ) : (
                <div className="w-40 h-40 sm:w-44 sm:h-44 flex items-center justify-center bg-zinc-100 rounded-2xl">
                  <span className="text-xs text-zinc-400 font-medium">Generating QR…</span>
                </div>
              )}
            </div>

            {/* Room Code & Quick Action Bar */}
            <div className="flex items-center justify-center gap-2 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-subtle border border-border text-xs font-mono text-text-primary font-bold">
                <span className="text-text-muted font-normal font-sans text-[11px]">Room:</span>
                <span>#{roomCode}</span>
              </div>

              {/* Refresh / Roll Code */}
              <button
                type="button"
                onClick={handleGenerateNewCode}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-subtle hover:bg-hover active:scale-95 border border-border text-xs font-semibold text-text-secondary hover:text-text-primary transition-all cursor-pointer"
                title="Generate new unique private room"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>New</span>
              </button>

              {/* Copy Link */}
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-subtle hover:bg-hover active:scale-95 border border-border text-xs font-semibold text-text-secondary hover:text-text-primary transition-all cursor-pointer"
                title="Copy share link"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Link'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* 2. ROOM CODE & JOIN TAB */
          <div className="space-y-3.5 pt-1 animate-fade text-left">
            <div className="p-3.5 rounded-2xl bg-subtle border border-border text-xs space-y-1 text-text-muted">
              <p className="font-bold text-text-primary flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-[#FF5B37]" />
                Cross-Network &amp; Remote Sharing
              </p>
              <p className="leading-relaxed">
                Connect from any location or cellular network by entering a shared room code.
              </p>
            </div>

            {/* Room Code Display */}
            <div className="text-center space-y-2 pt-1">
              <div className="flex items-center justify-between text-[11px] text-text-muted px-1">
                <span>Your Active Session:</span>
                <button
                  type="button"
                  onClick={handleGenerateNewCode}
                  className="inline-flex items-center gap-1 text-[#FF5B37] font-semibold hover:underline cursor-pointer"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>Roll new room</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-2">
                <div className="px-6 py-2.5 rounded-2xl bg-subtle border border-border font-mono text-2xl font-black tracking-widest text-text-primary select-all shadow-inner">
                  {roomCode}
                </div>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="p-3 rounded-2xl bg-subtle hover:bg-hover border border-border text-text-secondary hover:text-text-primary transition-all cursor-pointer"
                  title="Copy remote link"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Join Custom Room Form */}
            <form onSubmit={handleJoinRoom} className="space-y-1.5 pt-2">
              <label className="text-[11px] text-text-muted font-medium block">
                Or join someone else's room code:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={10}
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  placeholder="e.g. 7492 or TEAM"
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-subtle text-text-primary placeholder:text-text-muted border border-border text-xs font-mono uppercase focus:outline-none focus:border-[#FF5B37]"
                />
                <button
                  type="submit"
                  disabled={!inputCode.trim()}
                  className="px-4 py-2.5 rounded-xl bg-[#0A0A0C] dark:bg-white text-white dark:text-[#0A0A0C] text-xs font-bold disabled:opacity-40 transition-all flex items-center gap-1 shadow-sm active:scale-95 cursor-pointer"
                >
                  <span>Join</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Connection status line */}
        <div className="pt-1 text-xs flex items-center justify-center gap-1.5 text-text-muted">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Room #{roomCode} active · Ready to pair</span>
        </div>

      </div>
    </div>
  );
};
