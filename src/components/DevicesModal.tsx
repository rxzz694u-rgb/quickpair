import React from 'react';
import { Smartphone, Laptop, Tablet, Plus, X, Check } from 'lucide-react';
import { sounds } from '../services/audio';
import { peerSync, PeerInfo } from '../services/peerSync';

interface DevicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenQR: () => void;
  peers: PeerInfo[];
}

export const DevicesModal: React.FC<DevicesModalProps> = ({
  isOpen,
  onClose,
  onOpenQR,
  peers,
}) => {
  if (!isOpen) return null;

  const thisDevice = peerSync.getDevice();

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      {/* Backdrop tap to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal / Bottom Sheet Container */}
      <div className="relative w-full max-w-sm bg-surface rounded-t-3xl sm:rounded-2xl border-t sm:border border-border p-5 shadow-sheet sm:shadow-card animate-slide-up z-10 space-y-4">
        
        {/* Mobile top grab handle */}
        <div className="w-10 h-1 bg-border-dark rounded-full mx-auto sm:hidden mb-2" />

        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
          <h2 className="text-base font-semibold text-primary">Connected devices</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-primary-muted hover:text-primary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Device list */}
        <div className="space-y-2">
          {/* Current Device */}
          <div className="p-3 rounded-xl bg-surface-subtle border border-border flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              {thisDevice.type === 'mobile' ? (
                <Smartphone className="w-4 h-4 text-primary" />
              ) : (
                <Laptop className="w-4 h-4 text-primary" />
              )}
              <div>
                <p className="font-medium text-primary">{thisDevice.name}</p>
                <p className="text-[11px] text-primary-muted">This device</p>
              </div>
            </div>
            <span className="flex items-center gap-1 text-[11px] text-accent font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              Connected
            </span>
          </div>

          {/* Active Peers or Empty State */}
          {peers.length > 0 ? (
            peers.map((peer) => (
              <div
                key={peer.id}
                className="p-3 rounded-xl bg-surface-subtle border border-border flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  {peer.type === 'mobile' ? (
                    <Smartphone className="w-4 h-4 text-primary" />
                  ) : peer.type === 'tablet' ? (
                    <Tablet className="w-4 h-4 text-primary" />
                  ) : (
                    <Laptop className="w-4 h-4 text-primary" />
                  )}
                  <span className="font-medium text-primary">{peer.name}</span>
                </div>
                <span className="flex items-center gap-1 text-[11px] text-accent font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Connected
                </span>
              </div>
            ))
          ) : (
            <div className="p-3 rounded-xl bg-surface-subtle border border-border flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-4 h-4 text-primary-muted" />
                <div>
                  <p className="font-medium text-primary">iPhone (Demo Pair)</p>
                  <p className="text-[11px] text-primary-muted">Same Wi-Fi</p>
                </div>
              </div>
              <span className="flex items-center gap-1 text-[11px] text-accent font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                Connected
              </span>
            </div>
          )}
        </div>

        {/* Connect Another Device Action */}
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
            onOpenQR();
          }}
          className="w-full py-2.5 rounded-xl bg-primary hover:bg-black text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors touch-target sm:min-h-0"
        >
          <Plus className="w-4 h-4" />
          <span>Connect another device</span>
        </button>

      </div>
    </div>
  );
};
