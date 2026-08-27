import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Trash2,
  Lock,
  X,
  Sun,
  Moon,
  Info,
  HelpCircle,
  FileCheck,
  Mail,
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-[3px] animate-fade">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-sm bg-card rounded-t-[28px] sm:rounded-3xl border-t sm:border border-border p-5 sm:p-6 shadow-2xl animate-sheet-up z-10 space-y-3.5">
        <div className="w-12 h-1.5 bg-border rounded-full mx-auto sm:hidden mb-1" />

        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-border/80">
          <h2 className="text-[17px] font-bold text-text-primary">Options</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-text-muted hover:text-text-primary hover:bg-subtle transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action items */}
        <div className="space-y-1.5 text-xs font-semibold">
          
          {/* Secret Note / Self-destruct */}
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
              onOpenSecretNote();
            }}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 hover:from-purple-500/15 hover:to-indigo-500/15 text-text-primary border border-purple-500/20 transition-all cursor-pointer"
          >
            <span className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-xl bg-purple-500 text-white flex items-center justify-center shadow-xs">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <span>Send Encrypted Note</span>
            </span>
            <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
              Burn on read
            </span>
          </button>

          {/* Sound toggle */}
          <button
            onClick={handleToggleSound}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-subtle hover:bg-hover text-text-primary transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-3">
              {isMuted ? <VolumeX className="w-4 h-4 text-text-muted" /> : <Volume2 className="w-4 h-4 text-emerald-500" />}
              <span>Sound feedback</span>
            </span>
            <span className="text-[11px] text-text-muted">{isMuted ? 'Muted' : 'On'}</span>
          </button>

          {/* Theme toggle */}
          <button
            onClick={handleToggleTheme}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-subtle hover:bg-hover text-text-primary transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-3">
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-text-muted" />}
              <span>Theme</span>
            </span>
            <span className="text-[11px] text-text-muted capitalize">{theme}</span>
          </button>

          {/* How it works */}
          <button
            onClick={() => handleOpenTab('about')}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-subtle hover:bg-hover text-text-primary transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-3">
              <Info className="w-4 h-4 text-text-muted" />
              <span>How it works</span>
            </span>
          </button>

          {/* Privacy */}
          <button
            onClick={() => handleOpenTab('privacy')}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-subtle hover:bg-hover text-text-primary transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-3">
              <FileCheck className="w-4 h-4 text-text-muted" />
              <span>Privacy &amp; Data</span>
            </span>
          </button>

          {/* Contact */}
          <button
            onClick={() => handleOpenTab('contact')}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-subtle hover:bg-hover text-text-primary transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-[#FF5B37]" />
              <span>Contact support</span>
            </span>
          </button>

          {/* Clear all */}
          <button
            onClick={handleClearAll}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-red-500/10 hover:bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/20 transition-colors cursor-pointer mt-1"
          >
            <span className="flex items-center gap-3">
              <Trash2 className="w-4 h-4" />
              <span>Clear current session</span>
            </span>
          </button>

        </div>

      </div>
    </div>
  );
};
