import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  X,
  ArrowRight,
  Check,
  FileText,
  UploadCloud,
  RefreshCw,
  Maximize2,
  Minimize2,
  Clipboard,
  Smartphone,
  QrCode,
} from 'lucide-react';
import { sounds } from '../services/audio';
import { peerSync } from '../services/peerSync';
import { processFileForSync } from '../services/mediaHelper';

interface ComposerProps {
  onOpenDevices: () => void;
  peerCount: number;
}

const PLACEHOLDERS = [
  'Type text, paste links, or drop files…',
  'Write a note to your phone or laptop…',
  'Paste a URL, code snippet, or address…',
  'Drop photos, docs, or PDFs to beam…',
];

export const Composer: React.FC<ComposerProps> = ({ onOpenDevices, peerCount }) => {
  const [text, setText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [sendState, setSendState] = useState<'idle' | 'sending' | 'sent' | 'queued'>('idle');
  const [peerTyping, setPeerTyping] = useState<{ isTyping: boolean; deviceName: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Network & Offline Queue state
  const [isOnline, setIsOnline] = useState(peerSync.getIsOnline());
  const [queuedCount, setQueuedCount] = useState(peerSync.getQueuedCount());

  // Height adjustment state
  const [customHeight, setCustomHeight] = useState<number>(120);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isDraggingHandle, setIsDraggingHandle] = useState<boolean>(false);
  const dragStartYRef = useRef<number>(0);
  const dragStartHeightRef = useRef<number>(120);

  // Animated typewriter placeholder state
  const [placeholderText, setPlaceholderText] = useState('Type text, paste links, or drop files…');
  const phraseIdxRef = useRef(0);
  const charIdxRef = useRef(0);
  const isDeletingRef = useRef(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimerRef = useRef<number | null>(null);

  const totalDevices = peerCount + 1;

  useEffect(() => {
    const unsubscribeNetwork = peerSync.subscribeNetwork((online, count) => {
      setIsOnline(online);
      setQueuedCount(count);
    });
    return unsubscribeNetwork;
  }, []);

  // Handle Drag to Resize Height
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingHandle) return;
      const deltaY = e.clientY - dragStartYRef.current;
      const newHeight = Math.min(Math.max(dragStartHeightRef.current + deltaY, 90), 450);
      setCustomHeight(newHeight);
      setIsExpanded(newHeight > 200);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingHandle || !e.touches[0]) return;
      const deltaY = e.touches[0].clientY - dragStartYRef.current;
      const newHeight = Math.min(Math.max(dragStartHeightRef.current + deltaY, 90), 450);
      setCustomHeight(newHeight);
      setIsExpanded(newHeight > 200);
    };

    const handleMouseUp = () => {
      if (isDraggingHandle) {
        setIsDraggingHandle(false);
      }
    };

    if (isDraggingHandle) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDraggingHandle]);

  const startDragging = (clientY: number) => {
    sounds.playClick();
    setIsDraggingHandle(true);
    dragStartYRef.current = clientY;
    dragStartHeightRef.current = customHeight;
  };

  const toggleExpand = () => {
    sounds.playClick();
    if (isExpanded) {
      setCustomHeight(120);
      setIsExpanded(false);
    } else {
      setCustomHeight(260);
      setIsExpanded(true);
    }
  };

  // Animated typewriter loop
  useEffect(() => {
    let timeout: number;

    const tick = () => {
      const currentPhrase = PLACEHOLDERS[phraseIdxRef.current];

      if (isDeletingRef.current) {
        charIdxRef.current -= 1;
        setPlaceholderText(currentPhrase.substring(0, charIdxRef.current));

        if (charIdxRef.current <= 0) {
          isDeletingRef.current = false;
          phraseIdxRef.current = (phraseIdxRef.current + 1) % PLACEHOLDERS.length;
          timeout = window.setTimeout(tick, 350);
          return;
        }
        timeout = window.setTimeout(tick, 30);
      } else {
        charIdxRef.current += 1;
        setPlaceholderText(currentPhrase.substring(0, charIdxRef.current));

        if (charIdxRef.current >= currentPhrase.length) {
          isDeletingRef.current = true;
          timeout = window.setTimeout(tick, 2200);
          return;
        }
        timeout = window.setTimeout(tick, 60);
      }
    };

    timeout = window.setTimeout(tick, 800);
    return () => clearTimeout(timeout);
  }, []);

  // Listen for peer typing events
  useEffect(() => {
    const unsubscribeTyping = peerSync.subscribeTyping((deviceName, isTyping) => {
      if (isTyping) {
        setPeerTyping({ isTyping: true, deviceName });
      } else {
        setPeerTyping(null);
      }
    });

    return unsubscribeTyping;
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setText(val);

    if (val.trim().length > 0) {
      peerSync.sendTyping(true);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = window.setTimeout(() => {
        peerSync.sendTyping(false);
      }, 1400);
    } else {
      peerSync.sendTyping(false);
    }
  };

  const handlePasteClipboard = async () => {
    try {
      sounds.playClick();
      const textFromClipboard = await navigator.clipboard.readText();
      if (textFromClipboard) {
        setText((prev) => (prev ? `${prev}\n${textFromClipboard}` : textFromClipboard));
        textareaRef.current?.focus();
      }
    } catch {
      textareaRef.current?.focus();
    }
  };

  const handleFileSelect = (file: File) => {
    sounds.playPop();
    setSelectedFile(file);
  };

  const handleSend = async () => {
    if ((!text.trim() && !selectedFile) || sendState !== 'idle') return;

    sounds.playPop();
    setSendState(isOnline ? 'sending' : 'queued');
    if (isOnline) setIsSyncing(true);
    peerSync.sendTyping(false);

    const fileToProcess = selectedFile;
    const textToSend = text.trim();

    setText('');
    setSelectedFile(null);

    try {
      if (fileToProcess) {
        const fileData = await processFileForSync(fileToProcess, peerSync.getRoomCode());
        await peerSync.addItem({
          type: 'file',
          content: fileToProcess.name,
          title: fileToProcess.name,
          fileData,
        });
      }

      if (textToSend) {
        const isUrl = /^https?:\/\/[^\s]+$/i.test(textToSend);
        const isCode = textToSend.includes('\n') && (textToSend.includes('function') || textToSend.includes('const ') || textToSend.includes('{') || textToSend.includes('<'));

        await peerSync.addItem({
          type: isUrl ? 'link' : isCode ? 'code' : 'text',
          content: textToSend,
        });
      }

      setSendState('sent');
      setIsSyncing(false);

      setTimeout(() => {
        setSendState('idle');
      }, 1200);
    } catch {
      setSendState('idle');
      setIsSyncing(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const hasContent = text.trim().length > 0 || selectedFile !== null;

  return (
    <section className="w-full max-w-[760px] mx-auto px-4 pt-4 sm:pt-6 pb-2 relative">
      
      {/* Gentle Pairing Onboarding Hint (If not paired yet) */}
      {peerCount === 0 && (
        <div className="mb-3.5 px-3.5 py-2 rounded-2xl bg-subtle/80 border border-border flex items-center justify-between text-xs text-text-secondary animate-fade">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-[#FF5B37] flex-shrink-0" />
            <span>Open QuickPair on your other device to connect instantly</span>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onOpenDevices();
            }}
            className="inline-flex items-center gap-1 font-semibold text-text-primary hover:text-[#FF5B37] transition-colors cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Scan QR</span>
          </button>
        </div>
      )}

      {/* Main Composer Box with Silky Glowing Outline Beam */}
      <div className={`relative p-[1.5px] rounded-[28px] overflow-hidden transition-all duration-300 ${
        isFocused
          ? 'shadow-[0_0_35px_rgba(255,91,55,0.25)] ring-1 ring-[#FF5B37]/50'
          : 'shadow-card hover:shadow-lg'
      }`}>
        {/* Animated Conic Gradient Border Beam */}
        <div className="absolute -inset-[150%] animate-border-beam bg-[conic-gradient(from_0deg,transparent_0_280deg,#8B5CF6_315deg,#FF5B37_345deg,#F59E0B_360deg)] opacity-75 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Inner Compose Card */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            if (e.dataTransfer.files.length > 0) {
              handleFileSelect(e.dataTransfer.files[0]);
            }
          }}
          className={`relative bg-card rounded-[26.5px] z-10 transition-colors duration-200 overflow-hidden ${
            isDragOver ? 'bg-coral-50/40 dark:bg-coral-950/20' : ''
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelect(e.target.files[0]);
              }
            }}
          />

          {/* Drag Overlay */}
          {isDragOver && (
            <div className="absolute inset-0 z-20 bg-card/95 backdrop-blur-sm flex flex-col items-center justify-center gap-2 text-[#FF5B37] font-semibold text-sm pointer-events-none">
              <UploadCloud className="w-8 h-8 animate-bounce" />
              <span>Drop file to beam instantly</span>
            </div>
          )}

          {/* Text Input Area */}
          <div className="relative p-4 sm:p-5 pb-1">
            {!text && !isFocused && (
              <div
                onClick={() => textareaRef.current?.focus()}
                className="absolute top-4 sm:top-5 left-4 sm:left-5 right-12 text-text-muted text-[15px] sm:text-[16px] pointer-events-none select-none flex items-center leading-relaxed"
              >
                <span>{placeholderText}</span>
                <span className="inline-block w-0.5 h-4 ml-0.5 bg-[#FF5B37] animate-pulse" />
              </div>
            )}

            {/* Quick Expand Toggle */}
            <button
              type="button"
              onClick={toggleExpand}
              className="absolute top-3.5 right-3.5 p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-subtle transition-colors z-20"
              title={isExpanded ? 'Collapse composer' : 'Expand composer'}
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            <textarea
              ref={textareaRef}
              style={{ height: `${customHeight}px` }}
              value={text}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChange={handleTextChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleSend();
                }
              }}
              placeholder={isFocused ? 'Start typing…' : ''}
              className="w-full bg-transparent text-text-primary placeholder:text-text-muted text-[15px] sm:text-[16px] font-normal resize-none focus:outline-none leading-relaxed relative z-10"
            />

            {/* Attached File Preview */}
            {selectedFile && (
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-subtle border border-border text-xs text-text-primary max-w-full relative z-10 shadow-sm">
                <FileText className="w-4 h-4 text-[#FF5B37] flex-shrink-0" />
                <span className="font-medium truncate max-w-[180px] sm:max-w-[280px]">{selectedFile.name}</span>
                <span className="text-text-muted flex-shrink-0">({formatFileSize(selectedFile.size)})</span>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="ml-1 p-0.5 text-text-muted hover:text-red-500"
                  aria-label="Remove"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Drag Handle */}
          <div
            onMouseDown={(e) => startDragging(e.clientY)}
            onTouchStart={(e) => e.touches[0] && startDragging(e.touches[0].clientY)}
            className="w-full py-1 flex items-center justify-center cursor-ns-resize group hover:bg-subtle/50 transition-colors select-none"
          >
            <div className="w-10 h-1 bg-border group-hover:bg-[#FF5B37] rounded-full transition-colors" />
          </div>

          {/* Bottom Control Bar */}
          <div className="px-4 sm:px-5 py-3 border-t border-border-light bg-card flex items-center justify-between gap-2">
            {/* Quick Actions: Attach file + Paste */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  fileInputRef.current?.click();
                }}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-subtle hover:bg-hover active:scale-95 text-text-primary text-xs sm:text-sm font-medium border border-border transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-text-secondary" />
                <span>Attach</span>
              </button>

              <button
                type="button"
                onClick={handlePasteClipboard}
                className="hidden sm:inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-subtle hover:bg-hover active:scale-95 text-text-secondary hover:text-text-primary text-xs font-medium border border-border transition-all cursor-pointer"
                title="Paste from clipboard"
              >
                <Clipboard className="w-3.5 h-3.5" />
                <span>Paste</span>
              </button>
            </div>

            {/* Live Typing Status */}
            <div className="flex-1 flex items-center justify-center px-2 min-h-[20px]">
              {peerTyping && peerTyping.isTyping ? (
                <div className="inline-flex items-center gap-1.5 text-xs text-[#FF5B37] font-semibold animate-fade">
                  <span className="flex items-center gap-0.5">
                    <span className="w-1 h-1 rounded-full bg-[#FF5B37] animate-dot-1" />
                    <span className="w-1 h-1 rounded-full bg-[#FF5B37] animate-dot-2" />
                    <span className="w-1 h-1 rounded-full bg-[#FF5B37] animate-dot-3" />
                  </span>
                  <span className="truncate">{peerTyping.deviceName} is typing…</span>
                </div>
              ) : text.length > 0 ? (
                <span className="text-[11px] text-text-muted select-none">
                  {text.length} chars
                </span>
              ) : null}
            </div>

            {/* Primary Action Send Button (Sunset Coral) */}
            <button
              type="button"
              onClick={handleSend}
              disabled={!hasContent || (sendState !== 'idle' && sendState !== 'queued')}
              className={`inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all active:scale-95 cursor-pointer ${
                sendState === 'sent'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : sendState === 'sending'
                  ? 'bg-[#FF5B37] text-white opacity-80 cursor-wait'
                  : hasContent
                  ? 'bg-[#FF5B37] hover:bg-[#FF451D] text-white shadow-coral-glow'
                  : 'bg-subtle text-text-muted cursor-not-allowed border border-border'
              }`}
            >
              {sendState === 'sent' ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Sent</span>
                </>
              ) : sendState === 'sending' ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Beaming…</span>
                </>
              ) : (
                <>
                  <span>Beam</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Connection & Network Status */}
      <div className="mt-2.5 flex items-center justify-between text-xs text-text-muted px-1.5">
        <button
          onClick={() => {
            sounds.playClick();
            onOpenDevices();
          }}
          className="inline-flex items-center gap-2 hover:text-text-primary transition-colors py-0.5 cursor-pointer"
        >
          <div className="relative flex items-center justify-center w-2 h-2">
            <span className={`absolute w-full h-full rounded-full ${peerCount > 0 ? 'bg-emerald-500 animate-radar-ring' : 'bg-amber-500'}`} />
            <span className={`relative w-1.5 h-1.5 rounded-full ${peerCount > 0 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          </div>
          <span className="font-semibold text-text-primary">
            {peerCount > 0 ? `${totalDevices} devices connected · Real-time sync` : 'Waiting for nearby device to open'}
          </span>
        </button>

        <span className="text-[11px] text-text-muted hidden sm:inline">
          Instant Real-Time Sync · E2E Encrypted
        </span>
      </div>
    </section>
  );
};
