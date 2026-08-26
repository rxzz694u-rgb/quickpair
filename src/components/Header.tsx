import React from 'react';
import { MoreHorizontal, Wifi, QrCode } from 'lucide-react';
import { sounds } from '../services/audio';

interface HeaderProps {
  peerCount: number;
  onOpenDevices: () => void;
  onOpenMenu: () => void;
  onOpenQR: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  peerCount,
  onOpenDevices,
  onOpenMenu,
  onOpenQR,
}) => {
  return (
    <header className="w-full pt-4 pb-2 sm:pt-6 sm:pb-4 px-4 sm:px-6 flex items-center justify-between border-b border-border/60 sm:border-transparent">
      {/* Wordmark */}
      <div className="flex items-center gap-2">
        <span className="font-semibold text-lg tracking-tight text-primary flex items-center gap-1">
          Simple<span className="text-accent font-bold">.</span>Savr
        </span>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        {/* Connection pill */}
        <button
          onClick={() => {
            sounds.playClick();
            onOpenDevices();
          }}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface hover:bg-surface-subtle border border-border text-xs font-medium text-primary-muted hover:text-primary transition-colors touch-target sm:min-h-0"
          title="View connected devices"
        >
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-primary font-medium text-xs">
            {peerCount > 0 ? `${peerCount + 1} devices` : 'Connected'}
          </span>
        </button>

        {/* QR quick connect button */}
        <button
          onClick={() => {
            sounds.playClick();
            onOpenQR();
          }}
          className="p-2 rounded-xl bg-surface hover:bg-surface-subtle text-primary-muted hover:text-primary border border-border transition-colors touch-target sm:min-h-0"
          title="Connect another device via QR"
          aria-label="Scan QR Code"
        >
          <QrCode className="w-4 h-4" />
        </button>

        {/* More options button */}
        <button
          onClick={() => {
            sounds.playClick();
            onOpenMenu();
          }}
          className="p-2 rounded-xl bg-surface hover:bg-surface-subtle text-primary-muted hover:text-primary border border-border transition-colors touch-target sm:min-h-0"
          title="More options"
          aria-label="Options"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
