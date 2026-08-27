import React from 'react';
import { Plus, X, Smartphone, Laptop, Tablet } from 'lucide-react';
import { sounds } from '../services/audio';
import { peerSync, PeerInfo } from '../services/peerSync';

interface DeviceSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenQR: () => void;
  peers: PeerInfo[];
}

export const DeviceSheet: React.FC<DeviceSheetProps> = ({
  isOpen,
  onClose,
  onOpenQR,
  peers,
}) => {
  if (!isOpen) return null;

  const thisDevice = peerSync.getDevice();
  const roomCode = peerSync.getRoomCode();

  const renderDeviceIcon = (type: 'desktop' | 'mobile' | 'tablet') => {
    switch (type) {
      case 'mobile':
        return <Smartphone className="w-4 h-4 text-text-primary" />;
      case 'tablet':
        return <Tablet className="w-4 h-4 text-text-primary" />;
      default:
        return <Laptop className="w-4 h-4 text-text-primary" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-[3px] animate-fade">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-sm bg-card rounded-t-[28px] sm:rounded-3xl border-t sm:border border-border p-5 sm:p-6 shadow-2xl animate-sheet-up z-10 space-y-4">
        
        {/* Mobile Grab Handle */}
        <div className="w-12 h-1.5 bg-border rounded-full mx-auto sm:hidden mb-1" />

        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-border/80">
          <div>
            <h2 className="text-[17px] font-bold text-text-primary">Connected devices</h2>
            <p className="text-[12px] text-text-muted mt-0.5">Session: <span className="font-semibold text-text-primary">#{roomCode}</span></p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-text-muted hover:text-text-primary hover:bg-subtle transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Device List */}
        <div className="space-y-2.5 text-xs">
          {/* This device */}
          <div className="p-3.5 rounded-2xl bg-subtle border border-border flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-card border border-border flex items-center justify-center shadow-xs">
                {renderDeviceIcon(thisDevice.type)}
              </div>
              <div>
                <p className="font-bold text-text-primary text-[13px]">{thisDevice.name}</p>
                <p className="text-[11px] text-text-muted">This device</p>
              </div>
            </div>
            <span className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active
            </span>
          </div>

          {/* Active Connected Peers */}
          {peers.length > 0 ? (
            peers.map((peer) => (
              <div
                key={peer.id}
                className="p-3.5 rounded-2xl bg-subtle border border-border flex items-center justify-between animate-fade shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-card border border-border flex items-center justify-center shadow-xs">
                    {renderDeviceIcon(peer.type)}
                  </div>
                  <div>
                    <p className="font-bold text-text-primary text-[13px]">{peer.name}</p>
                    <p className="text-[11px] text-text-muted">
                      Live sync active
                    </p>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Connected
                </span>
              </div>
            ))
          ) : (
            <div className="p-4 rounded-2xl bg-subtle/60 border border-dashed border-border text-center space-y-1">
              <p className="text-xs text-text-primary font-semibold">No other devices connected yet</p>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Open QuickPair on your phone or scan the QR code to pair instantly.
              </p>
            </div>
          )}
        </div>

        {/* Action Button: Connect / Switch Room */}
        <div className="space-y-2 pt-1">
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
              onOpenQR();
            }}
            className="w-full py-3 rounded-2xl bg-[#0A0A0C] dark:bg-white text-white dark:text-[#0A0A0C] text-xs font-semibold flex items-center justify-center gap-2 shadow-md hover:opacity-90 active:scale-98 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Connect device / Scan QR</span>
          </button>

          {roomCode !== 'MAIN' && (
            <button
              onClick={() => {
                sounds.playClick();
                peerSync.setRoom('MAIN');
                onClose();
              }}
              className="w-full py-2.5 rounded-2xl bg-subtle hover:bg-hover text-text-secondary hover:text-text-primary text-xs font-medium border border-border transition-colors cursor-pointer"
            >
              Reset to default shared room (#MAIN)
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
