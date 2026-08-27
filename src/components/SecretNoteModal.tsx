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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-[3px] animate-fade">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-sm bg-card rounded-t-[28px] sm:rounded-3xl border-t sm:border border-border p-5 sm:p-6 shadow-2xl animate-sheet-up z-10 space-y-3.5">
        <div className="w-12 h-1.5 bg-border rounded-full mx-auto sm:hidden mb-1" />

        <div className="flex items-center justify-between pb-2 border-b border-border/80">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-purple-500 text-white flex items-center justify-center shadow-xs">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-[17px] font-bold text-text-primary">Secret note</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-text-muted hover:text-text-primary hover:bg-subtle transition-colors cursor-pointer" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2.5">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            rows={3}
            placeholder="Write secret password, token, or private note…"
            className="w-full bg-subtle text-text-primary placeholder:text-text-muted text-sm p-3.5 rounded-2xl border border-border resize-none focus:outline-none focus:border-purple-500"
          />

          <input
            type="password"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            placeholder="Optional secret passphrase"
            className="w-full bg-subtle text-text-primary placeholder:text-text-muted text-xs p-3 rounded-xl border border-border focus:outline-none focus:border-purple-500"
          />

          <label className="flex items-center gap-2 text-xs text-text-muted cursor-pointer select-none py-1">
            <input
              type="checkbox"
              checked={burnAfterRead}
              onChange={(e) => setBurnAfterRead(e.target.checked)}
              className="accent-[#FF5B37] rounded"
            />
            <span className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-[#FF5B37] flex-shrink-0" />
              <span>Disappear after reading (Burn-on-read)</span>
            </span>
          </label>
        </div>

        <button
          onClick={handleSendSecret}
          disabled={!noteText.trim() || isSending}
          className={`w-full py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-98 ${
            noteText.trim()
              ? 'bg-[#0A0A0C] dark:bg-white text-white dark:text-[#0A0A0C] hover:opacity-90'
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
