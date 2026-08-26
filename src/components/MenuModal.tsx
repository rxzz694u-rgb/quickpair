import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Trash2,
  Lock,
  ShieldCheck,
  X,
  Sun,
  Moon,
  Info,
  HelpCircle,
  FileCheck,
} from 'lucide-react';
import { sounds } from '../services/audio';
import { peerSync } from '../services/peerSync';
import { themeManager, Theme } from '../services/theme';
import { InfoModalTab } from './InfoModal';

interface MenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSecretNote: () => void;
  onOpenInfo: (tab: InfoModalTab) => void;
}

export const MenuModal: React.FC<MenuModalProps> = ({
  isOpen,
  onClose,
  onOpenSecretNote,
  onOpenInfo,
}) => {
  const [isMuted, setIsMuted] = useState(sounds.getIsMuted());
  const [theme, setTheme] = useState<Theme>(themeManager.getTheme());

  useEffect(() => {
    const unsubscribe = themeManager.subscribe((newTheme) => {
      setTheme(newTheme);
    });
    return unsubscribe;
  }, []);

  if (!isOpen) return null;

  const handleToggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
    if (!muted) sounds.playClick();
  };

  const handleToggleTheme = () => {
    sounds.playClick();
    themeManager.toggleTheme();
  };

  const handleClearAll = () => {
    sounds.playClick();
    peerSync.clearAll();
    onClose();
  };

  const handleOpenTab = (tab: InfoModalTab) => {
    sounds.playClick();
    onClose();
    onOpenInfo(tab);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-[2px] animate-fade">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal / Bottom Sheet */}
      <div className="relative w-full max-w-sm bg-card rounded-t-[20px] sm:rounded-[16px] border-t sm:border border-border p-5 pb-8 sm:pb-5 shadow-sheet animate-sheet-up z-10 space-y-3">
        
        {/* Mobile handle */}
        <div className="w-10 h-1.5 bg-[#D8D8D8] dark:bg-[#38383E] rounded-full mx-auto sm:hidden mb-1" />

        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <h2 className="text-[16px] font-semibold text-text-primary">Menu</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action items */}
        <div className="space-y-1.5 text-xs font-medium">
          
          {/* How it works */}
          <button
            onClick={() => handleOpenTab('about')}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-subtle hover:bg-hover text-text-primary transition-colors"
          >
            <span className="flex items-center gap-2.5">
              <Info className="w-4 h-4 text-text-secondary" />
              <span>How it works</span>
            </span>
            <span className="text-[11px] text-text-secondary">No app · No cable</span>
          </button>

          {/* Privacy */}
          <button
            onClick={() => handleOpenTab('privacy')}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-subtle hover:bg-hover text-text-primary transition-colors"
          >
            <span className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-accent" />
              <span>Privacy &amp; Security</span>
            </span>
            <span className="text-[11px] text-accent">Zero cloud</span>
          </button>

          {/* Terms of Service */}
          <button
            onClick={() => handleOpenTab('terms')}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-subtle hover:bg-hover text-text-primary transition-colors"
          >
            <span className="flex items-center gap-2.5">
              <FileCheck className="w-4 h-4 text-text-secondary" />
              <span>Terms of Service</span>
            </span>
          </button>

          {/* FAQ */}
          <button
            onClick={() => handleOpenTab('faq')}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-subtle hover:bg-hover text-text-primary transition-colors"
          >
            <span className="flex items-center gap-2.5">
              <HelpCircle className="w-4 h-4 text-text-secondary" />
              <span>FAQ</span>
            </span>
          </button>

          <div className="border-t border-border-light my-1" />

          {/* Theme switcher */}
          <button
            onClick={handleToggleTheme}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-subtle hover:bg-hover text-text-primary transition-colors"
          >
            <span className="flex items-center gap-2.5">
              {theme === 'dark' ? <Moon className="w-4 h-4 text-text-primary" /> : <Sun className="w-4 h-4 text-amber-500" />}
              <span>Appearance</span>
            </span>
            <span className="text-text-secondary font-normal capitalize">{theme} mode</span>
          </button>

          {/* Audio toggle */}
          <button
            onClick={handleToggleSound}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-subtle hover:bg-hover text-text-primary transition-colors"
          >
            <span className="flex items-center gap-2.5">
              {isMuted ? <VolumeX className="w-4 h-4 text-text-secondary" /> : <Volume2 className="w-4 h-4 text-text-primary" />}
              <span>Sound feedback</span>
            </span>
            <span className="text-text-secondary font-normal">{isMuted ? 'Off' : 'On'}</span>
          </button>

          {/* Secret Note action */}
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
              onOpenSecretNote();
            }}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-subtle hover:bg-hover text-text-primary transition-colors"
          >
            <span className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-text-primary" />
              <span>Create encrypted secret note</span>
            </span>
          </button>

          {/* Clear space */}
          <button
            onClick={handleClearAll}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-subtle hover:bg-red-500/10 text-red-500 transition-colors"
          >
            <span className="flex items-center gap-2.5">
              <Trash2 className="w-4 h-4" />
              <span>Clear shared space</span>
            </span>
          </button>
        </div>

        {/* Footnote */}
        <div className="pt-2 text-[11px] text-text-secondary flex items-center justify-center gap-1.5 border-t border-border">
          <ShieldCheck className="w-3.5 h-3.5 text-accent" />
          <span>Local Wi-Fi P2P · Zero cloud footprint</span>
        </div>

      </div>
    </div>
  );
};
