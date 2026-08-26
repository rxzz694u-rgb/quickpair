import React from 'react';
import { Plus, X, Smartphone, Laptop, Tablet, Monitor } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-[2px] animate-fade">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sheet Container */}
      <div className="relative w-full max-w-sm bg-card rounded-t-[20px] sm:rounded-[16px] border-t sm:border border-border p-5 pb-8 sm:pb-5 shadow-sheet animate-sheet-up z-10 space-y-4">
        
        {/* Mobile Grab Handle */}
        <div className="w-10 h-1.5 bg-[#D8D8D8] dark:bg-[#38383E] rounded-full mx-auto sm:hidden mb-2" />

        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div>
            <h2 className="text-[16px] font-semibold text-text-primary">Connected devices</h2>
            <p className="text-[11px] text-text-secondary font-mono mt-0.5">Room #{roomCode}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-text-secondary hover:text-text-primary"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Device List */}
        <div className="space-y-2 text-xs">
          {/* This device */}
          <div className="p-3 rounded-[12px] bg-subtle border border-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {renderDeviceIcon(thisDevice.type)}
              <div>
                <p className="font-medium text-text-primary">{thisDevice.name}</p>
                <p className="text-[11px] text-text-secondary">This device</p>
              </div>
            </div>
            <span className="flex items-center gap-1 text-[11px] text-accent font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              Active
            </span>
          </div>

          {/* Active Connected Peers */}
          {peers.length > 0 ? (
            peers.map((peer) => (
              <div
                key={peer.id}
                className="p-3 rounded-[12px] bg-subtle border border-border flex items-center justify-between animate-fade"
              >
                <div className="flex items-center gap-2.5">
                  {renderDeviceIcon(peer.type)}
                  <div>
                    <p className="font-medium text-text-primary">{peer.name}</p>
                    <p className="text-[11px] text-text-secondary">
                      {peer.networkType === 'remote' ? 'Remote / Cellular' : 'Same Wi-Fi'}
                    </p>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-[11px] text-accent font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Connected
                </span>
              </div>
            ))
          ) : (
            <div className="p-3.5 rounded-[12px] bg-subtle/70 border border-dashed border-border text-center space-y-1">
              <p className="text-xs text-text-primary font-medium">No other devices connected yet</p>
              <p className="text-[11px] text-text-secondary">
                Scan QR or share your room code to connect your phone or laptop.
              </p>
            </div>
          )}
        </div>

        {/* Action Button: Connect / Switch Room */}
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
            onOpenQR();
          }}
          className="w-full py-3 sm:py-2.5 min-h-[44px] sm:min-h-0 rounded-[10px] bg-text-primary hover:opacity-90 active:opacity-80 text-background text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Connect device / Scan QR</span>
        </button>

      </div>
    </div>
  );
};
