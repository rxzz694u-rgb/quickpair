import React, { useState } from 'react';
import { Lock, X, Flame } from 'lucide-react';
import { sounds } from '../services/audio';
import { encryptSecretNote } from '../services/crypto';
import { peerSync } from '../services/peerSync';

interface SecretNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecretNoteModal: React.FC<SecretNoteModalProps> = ({ isOpen, onClose }) => {
  const [noteText, setNoteText] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [burnAfterRead, setBurnAfterRead] = useState(true);
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleSendSecret = async () => {
    if (!noteText.trim()) return;
    setIsSending(true);
    sounds.playPop();

    const payload = await encryptSecretNote(noteText.trim(), passphrase.trim() || undefined, burnAfterRead);

    peerSync.addItem({
      type: 'secret',
      content: '[Encrypted Secret Note - Tap to decrypt]',
      title: 'Secret Note',
      secretPayload: payload,
    });

    sounds.playSuccess();
    setIsSending(false);
    setNoteText('');
    setPassphrase('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-[2px] animate-fade">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-sm bg-card rounded-t-[20px] sm:rounded-[16px] border-t sm:border border-border p-5 pb-8 sm:pb-5 shadow-sheet animate-sheet-up z-10 space-y-3">
        <div className="w-10 h-1.5 bg-[#D8D8D8] dark:bg-[#38383E] rounded-full mx-auto sm:hidden mb-1" />

        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-text-primary" />
            <h2 className="text-[16px] font-semibold text-text-primary">Secret note</h2>
          </div>
          <button onClick={onClose} className="p-1 text-text-secondary hover:text-text-primary" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2.5">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            rows={3}
            placeholder="Write secret password, token, or private note…"
            className="w-full bg-subtle text-text-primary placeholder:text-text-muted text-sm p-3 rounded-xl border border-border resize-none focus:outline-none"
          />

          <input
            type="password"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            placeholder="Optional password"
            className="w-full bg-subtle text-text-primary placeholder:text-text-muted text-xs p-2.5 rounded-xl border border-border focus:outline-none"
          />

          <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer select-none py-1">
            <input
              type="checkbox"
              checked={burnAfterRead}
              onChange={(e) => setBurnAfterRead(e.target.checked)}
              className="accent-accent rounded"
            />
            <span className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              <span>Disappear after reading (Burn-on-read)</span>
            </span>
          </label>
        </div>

        <button
          onClick={handleSendSecret}
          disabled={!noteText.trim() || isSending}
          className={`w-full py-2.5 rounded-[10px] text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
            noteText.trim()
              ? 'bg-text-primary hover:opacity-90 active:opacity-80 text-background'
              : 'bg-subtle text-text-muted cursor-not-allowed border border-border'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Send encrypted note</span>
        </button>
      </div>
    </div>
  );
};
