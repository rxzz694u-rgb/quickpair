import React, { useState } from 'react';
import { QrCode, X, Copy, Check } from 'lucide-react';
import { sounds } from '../services/audio';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QRModal: React.FC<QRModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const roomLink = 'ssavr.com/mesh-402';

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://${roomLink}`);
    sounds.playCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal / Bottom Sheet Container */}
      <div className="relative w-full max-w-sm bg-surface rounded-t-3xl sm:rounded-2xl border-t sm:border border-border p-6 shadow-sheet sm:shadow-card animate-slide-up z-10 text-center space-y-4">
        
        {/* Mobile top grab handle */}
        <div className="w-10 h-1 bg-border-dark rounded-full mx-auto sm:hidden mb-2" />

        {/* Close Button */}
        <div className="flex items-center justify-between pb-1 border-b border-border-subtle">
          <h2 className="text-base font-semibold text-primary">Scan this code</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-primary-muted hover:text-primary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Clean Large QR Code */}
        <div className="p-4 bg-white rounded-2xl inline-block border border-border shadow-sm mx-auto">
          <svg className="w-44 h-44" viewBox="0 0 100 100" fill="none">
            {/* Corners */}
            <rect x="10" y="10" width="26" height="26" rx="4" fill="#18181B" />
            <rect x="15" y="15" width="16" height="16" rx="2" fill="white" />
            <rect x="19" y="19" width="8" height="8" fill="#18181B" />

            <rect x="64" y="10" width="26" height="26" rx="4" fill="#18181B" />
            <rect x="69" y="15" width="16" height="16" rx="2" fill="white" />
            <rect x="73" y="19" width="8" height="8" fill="#18181B" />

            <rect x="10" y="64" width="26" height="26" rx="4" fill="#18181B" />
            <rect x="15" y="69" width="16" height="16" rx="2" fill="white" />
            <rect x="19" y="73" width="8" height="8" fill="#18181B" />

            {/* Matrix Data Points */}
            <rect x="42" y="14" width="6" height="6" fill="#18181B" />
            <rect x="50" y="24" width="6" height="6" fill="#18181B" />
            <rect x="42" y="34" width="8" height="8" fill="#18181B" />
            <rect x="24" y="44" width="6" height="6" fill="#18181B" />
            <rect x="36" y="50" width="12" height="6" fill="#18181B" />
            <rect x="54" y="44" width="6" height="14" fill="#18181B" />
            <rect x="66" y="42" width="12" height="6" fill="#18181B" />
            <rect x="80" y="54" width="8" height="8" fill="#18181B" />
            <rect x="44" y="68" width="8" height="8" fill="#18181B" />
            <rect x="58" y="74" width="14" height="6" fill="#18181B" />
            <rect x="78" y="68" width="10" height="10" fill="#18181B" />
          </svg>
        </div>

        {/* Or open short URL */}
        <div className="space-y-1 text-xs">
          <p className="text-primary-muted">Or open in your browser:</p>
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-subtle hover:bg-surface-muted border border-border font-mono text-primary font-medium transition-colors"
          >
            <span>{roomLink}</span>
            {copied ? (
              <Check className="w-3.5 h-3.5 text-accent" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-primary-muted" />
            )}
          </button>
        </div>

        {/* Waiting for device status */}
        <div className="pt-2 text-xs flex items-center justify-center gap-1.5 text-primary-muted">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span>Waiting for device…</span>
        </div>

      </div>
    </div>
  );
};
