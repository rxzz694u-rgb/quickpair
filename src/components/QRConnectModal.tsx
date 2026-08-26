import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Globe, Wifi, ArrowRight, RotateCw, QrCode } from 'lucide-react';
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

  // Subscribe to room changes
  useEffect(() => {
    const unsubscribe = peerSync.subscribe((_items, _peers, code) => {
      setRoomCode(code);
    });
    return unsubscribe;
  }, []);

  // Generate dynamic QR code image whenever room code changes
  useEffect(() => {
    if (!isOpen) return;

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://quickpair.app';
    const targetUrl = `${origin}/?room=${roomCode}`;

    QRCode.toDataURL(targetUrl, {
      width: 280,
      margin: 1.5,
      color: {
        dark: '#111111',
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

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://quickpair.app';
  const fullShareUrl = `${currentOrigin}/?room=${roomCode}`;

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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-[2px] animate-fade">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-sm bg-card rounded-t-[20px] sm:rounded-[16px] border-t sm:border border-border p-5 pb-8 sm:pb-6 shadow-sheet animate-sheet-up z-10 text-center space-y-3.5">
        <div className="w-10 h-1.5 bg-[#D8D8D8] dark:bg-[#38383E] rounded-full mx-auto sm:hidden mb-1" />

        {/* Header */}
        <div className="flex items-center justify-between pb-1 border-b border-border">
          <h2 className="text-[16px] font-semibold text-text-primary">Connect devices</h2>
          <button onClick={onClose} className="p-1 text-text-secondary hover:text-text-primary" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Segmented Mode Selector: Scan QR vs Room Code */}
        <div className="grid grid-cols-2 gap-1 bg-subtle p-1 rounded-xl text-xs font-medium">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setActiveTab('qr');
            }}
            className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'qr'
                ? 'bg-card text-text-primary shadow-sm font-semibold'
                : 'text-text-secondary hover:text-text-primary'
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
            className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'code'
                ? 'bg-card text-text-primary shadow-sm font-semibold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-accent" />
            <span>Room Code</span>
          </button>
        </div>

        {/* 1. SCAN QR CODE TAB */}
        {activeTab === 'qr' ? (
          <div className="space-y-3 animate-fade pt-1">
            <p className="text-xs text-text-secondary">
              Scan with your phone camera to pair instantly on same Wi-Fi or cellular data (4G/5G).
            </p>

            {/* Real Dynamic QR Code */}
            <div className="p-3 bg-white rounded-2xl border border-border inline-block shadow-sm mx-auto">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR code for room ${roomCode}`}
                  className="w-36 h-36 sm:w-40 sm:h-40 rounded-lg aspect-square"
                />
              ) : (
                <div className="w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center bg-zinc-100 rounded-lg">
                  <span className="text-xs text-zinc-400">Generating QR…</span>
                </div>
              )}
            </div>

            {/* Room Code & Quick Action Bar */}
            <div className="flex items-center justify-center gap-2 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-subtle border border-border text-xs font-mono text-text-primary font-semibold">
                <span className="text-text-secondary font-normal font-sans text-[11px]">Room:</span>
                <span>#{roomCode}</span>
              </div>

              {/* Refresh / Roll Code */}
              <button
                type="button"
                onClick={handleGenerateNewCode}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-subtle hover:bg-hover border border-border text-xs text-text-secondary hover:text-text-primary transition-colors"
                title="Generate new unique room code"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>New</span>
              </button>

              {/* Copy Link */}
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-subtle hover:bg-hover border border-border text-xs text-text-secondary hover:text-text-primary transition-colors"
                title="Copy share link"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-accent" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Link'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* 2. ROOM CODE & JOIN TAB */
          <div className="space-y-3 pt-1 animate-fade text-left">
            <div className="p-3 rounded-xl bg-subtle border border-border text-xs space-y-1 text-text-secondary">
              <p className="font-semibold text-text-primary flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-accent" />
                Cross-Network & Remote Sharing
              </p>
              <p className="leading-relaxed">
                Connect from any location or cellular network by sharing your room code.
              </p>
            </div>

            {/* Room Code Display with Refresh button */}
            <div className="text-center space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px] text-text-secondary px-1">
                <span>Your Unique Room Code:</span>
                <button
                  type="button"
                  onClick={handleGenerateNewCode}
                  className="inline-flex items-center gap-1 text-accent hover:underline"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>Roll new code</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-2">
                <div className="px-5 py-2.5 rounded-xl bg-subtle border border-border font-mono text-2xl font-bold tracking-widest text-text-primary select-all">
                  {roomCode}
                </div>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="p-3 rounded-xl bg-subtle hover:bg-hover border border-border text-text-secondary hover:text-text-primary transition-colors"
                  title="Copy remote link"
                >
                  {copied ? <Check className="w-4 h-4 text-accent" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Join Custom Room Form */}
            <form onSubmit={handleJoinRoom} className="space-y-1.5 pt-2">
              <label className="text-[11px] text-text-secondary block">
                Or join someone else's room code:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={10}
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  placeholder="e.g. 7492 or ROOM"
                  className="flex-1 px-3 py-2 rounded-xl bg-subtle text-text-primary placeholder:text-text-muted border border-border text-xs font-mono uppercase focus:outline-none focus:border-accent"
                />
                <button
                  type="submit"
                  disabled={!inputCode.trim()}
                  className="px-3.5 py-2 rounded-xl bg-text-primary hover:opacity-90 active:opacity-80 text-background text-xs font-semibold disabled:opacity-40 transition-colors flex items-center gap-1"
                >
                  <span>Join</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Connection status line */}
        <div className="pt-1 text-xs flex items-center justify-center gap-1.5 text-text-secondary">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span>Room #{roomCode} active · Ready to pair</span>
        </div>

      </div>
    </div>
  );
};
