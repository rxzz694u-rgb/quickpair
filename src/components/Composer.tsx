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
  WifiOff,
  Clock,
} from 'lucide-react';
import { sounds } from '../services/audio';
import { peerSync, ItemType } from '../services/peerSync';

interface ComposerProps {
  onOpenDevices: () => void;
  peerCount: number;
}

const PLACEHOLDERS = [
  'Start typing…',
  'Paste a link or code snippet…',
  'Drop any file here to share…',
  'Write a note to your other devices…',
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
  const [customHeight, setCustomHeight] = useState<number>(120); // default 120px
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isDraggingHandle, setIsDraggingHandle] = useState<boolean>(false);
  const dragStartYRef = useRef<number>(0);
  const dragStartHeightRef = useRef<number>(120);

  // Animated typewriter placeholder state
  const [placeholderText, setPlaceholderText] = useState('Start typing…');
  const phraseIdxRef = useRef(0);
  const charIdxRef = useRef(0);
  const isDeletingRef = useRef(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimerRef = useRef<number | null>(null);

  const totalDevices = peerCount + 1;

  // Listen to network & offline queue
  useEffect(() => {
    const unsubscribeNetwork = peerSync.subscribeNetwork((online, count) => {
      setIsOnline(online);
      setQueuedCount(count);
    });
    return unsubscribeNetwork;
  }, []);

  // Load saved height preference
  useEffect(() => {
    try {
      const savedHeight = localStorage.getItem('quickpair_composer_height') || localStorage.getItem('simplesavr_composer_height');
      if (savedHeight) {
        const parsed = parseInt(savedHeight, 10);
        if (parsed >= 80 && parsed <= 500) {
          setCustomHeight(parsed);
        }
      }
    } catch {}
  }, []);

  // Handle Drag to Resize Height
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingHandle) return;
      const deltaY = e.clientY - dragStartYRef.current;
      const newHeight = Math.min(Math.max(dragStartHeightRef.current + deltaY, 80), 500);
      setCustomHeight(newHeight);
      setIsExpanded(newHeight > 220);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingHandle || !e.touches[0]) return;
      const deltaY = e.touches[0].clientY - dragStartYRef.current;
      const newHeight = Math.min(Math.max(dragStartHeightRef.current + deltaY, 80), 500);
      setCustomHeight(newHeight);
      setIsExpanded(newHeight > 220);
    };

    const handleMouseUp = () => {
      if (isDraggingHandle) {
        setIsDraggingHandle(false);
        try {
          localStorage.setItem('quickpair_composer_height', customHeight.toString());
        } catch {}
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
  }, [isDraggingHandle, customHeight]);

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
      try {
        localStorage.setItem('quickpair_composer_height', '120');
      } catch {}
    } else {
      setCustomHeight(280);
      setIsExpanded(true);
      try {
        localStorage.setItem('quickpair_composer_height', '280');
      } catch {}
    }
  };

  // Animated typewriter loop
  useEffect(() => {
    let timeout: number;

    const tick = () => {
      const currentPhrase = PLACEHOLDERS[phraseIdxRef.current];

      if (isDeletingRef.current) {
        // Deleting
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
        // Typing forward
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

    return () => {
      unsubscribeTyping();
    };
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setText(val);

    // Broadcast live typing
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

  const handleFileSelect = (file: File) => {
    sounds.playPop();
    setSelectedFile(file);
  };

  const handleSend = () => {
    if ((!text.trim() && !selectedFile) || sendState !== 'idle') return;

    sounds.playPop();
    setSendState(isOnline ? 'sending' : 'queued');
    if (isOnline) setIsSyncing(true);
    peerSync.sendTyping(false);

    setTimeout(() => {
      // 1. Process file if any
      if (selectedFile) {
        const reader = new FileReader();
        reader.onload = (e) => {
          peerSync.addItem({
            type: 'file',
            content: selectedFile.name,
            title: selectedFile.name,
            fileData: {
              name: selectedFile.name,
              size: selectedFile.size,
              mimeType: selectedFile.type,
              dataUrl: e.target?.result as string,
            },
          });
        };
        reader.readAsDataURL(selectedFile);
      }

      // 2. Process text if any
      if (text.trim()) {
        const trimmed = text.trim();
        let detectedType: ItemType = 'text';
        if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
          detectedType = 'link';
        } else if (
          trimmed.includes('function') ||
          trimmed.includes('const ') ||
          trimmed.includes('npm ') ||
          trimmed.includes('git ') ||
          trimmed.includes('import ')
        ) {
          detectedType = 'code';
        }

        peerSync.addItem({
          type: detectedType,
          content: trimmed,
          title: detectedType === 'link' ? 'Link' : detectedType === 'code' ? 'Code' : 'Text',
        });
      }

      sounds.playSuccess();
      setSendState(isOnline ? 'sent' : 'queued');
      setText('');
      setSelectedFile(null);

      setTimeout(() => {
        setIsSyncing(false);
      }, 800);

      setTimeout(() => {
        setSendState('idle');
        textareaRef.current?.focus();
      }, 1500);
    }, 350);
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const hasContent = text.trim().length > 0 || selectedFile !== null;

  return (
    <section className="w-full max-w-[760px] mx-auto px-4 pt-5 sm:pt-8 pb-3">
      {/* Headline & Subtitle */}
      <div className="mb-4 sm:mb-5 flex items-start justify-between">
        <div>
          <h1 className="text-[28px] sm:text-[36px] md:text-[40px] font-bold tracking-tight text-text-primary leading-tight">
            Share anything.
          </h1>
          <p className="text-[14px] sm:text-[16px] text-text-secondary mt-1 font-normal leading-normal">
            Send text, links and files to your other devices.
          </p>
        </div>

        {/* Live Sync / Offline Status Pill */}
        {!isOnline ? (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-600 dark:text-amber-400 font-medium shadow-sm animate-pulse">
            <WifiOff className="w-3 h-3" />
            <span>Offline · {queuedCount} queued</span>
          </div>
        ) : (
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card border border-border text-[11px] text-text-secondary shadow-sm">
            <div className="relative flex items-center justify-center w-2 h-2">
              <span className="absolute w-full h-full rounded-full bg-accent animate-radar-ring" />
              <span className="relative w-1.5 h-1.5 rounded-full bg-accent" />
            </div>
            <span>{isSyncing ? 'Syncing…' : 'Live Sync'}</span>
          </div>
        )}
      </div>

      {/* Main Compose Card */}
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
        className={`relative bg-card rounded-composer border transition-all duration-150 shadow-card overflow-hidden ${
          isDragOver
            ? 'border-accent ring-2 ring-accent/20 bg-accent-light'
            : isFocused
            ? 'border-accent/60 ring-1 ring-accent/20 shadow-md'
            : 'border-border'
        }`}
      >
        {/* Hidden File Picker */}
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
          <div className="absolute inset-0 z-20 bg-card/95 flex flex-col items-center justify-center gap-1.5 text-accent font-medium text-sm pointer-events-none">
            <UploadCloud className="w-6 h-6 animate-bounce" />
            <span>Drop your file here</span>
          </div>
        )}

        {/* Text Input Area & Animated Typewriter Overlay */}
        <div className="relative p-3.5 sm:p-5 pb-1">
          {/* Animated Typewriter Placeholder */}
          {!text && !isFocused && (
            <div
              onClick={() => textareaRef.current?.focus()}
              className="absolute top-3.5 sm:top-5 left-3.5 sm:left-5 right-12 text-text-muted text-[15px] sm:text-[16px] pointer-events-none select-none flex items-center leading-relaxed"
            >
              <span>{placeholderText}</span>
              <span className="inline-block w-0.5 h-4 ml-0.5 bg-accent animate-pulse" />
            </div>
          )}

          {/* Quick Expand/Collapse Icon Button */}
          <button
            type="button"
            onClick={toggleExpand}
            className="absolute top-3 right-3 p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-subtle transition-colors z-20"
            title={isExpanded ? 'Collapse composer (smaller)' : 'Expand composer (bigger)'}
            aria-label="Toggle size"
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Dynamic Height Textarea */}
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
            className="w-full bg-transparent text-text-primary placeholder:text-text-muted text-[15px] sm:text-[16px] font-normal resize-none focus:outline-none leading-relaxed relative z-10 transition-[height] duration-75"
          />

          {/* Attached File Preview */}
          {selectedFile && (
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-subtle border border-border text-xs text-text-primary max-w-full relative z-10">
              <FileText className="w-3.5 h-3.5 text-text-secondary flex-shrink-0" />
              <span className="font-medium truncate max-w-[160px] sm:max-w-[240px]">{selectedFile.name}</span>
              <span className="text-text-secondary flex-shrink-0">({formatFileSize(selectedFile.size)})</span>
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="ml-1 p-0.5 text-text-secondary hover:text-text-primary"
                aria-label="Remove file"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Tactile Drag Handle to Adjust Height */}
        <div
          onMouseDown={(e) => startDragging(e.clientY)}
          onTouchStart={(e) => e.touches[0] && startDragging(e.touches[0].clientY)}
          className="w-full py-1 flex items-center justify-center cursor-ns-resize group hover:bg-subtle/60 transition-colors select-none"
          title="Drag up/down to adjust size"
        >
          <div className="w-10 h-1 bg-border group-hover:bg-accent rounded-full transition-colors" />
        </div>

        {/* Compose Bottom Row: [+ File] [Live typing feedback] [Send →] */}
        <div className="px-3.5 sm:px-5 py-2.5 sm:py-3 border-t border-border-light bg-card flex items-center justify-between gap-2">
          {/* Compact + File Button */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              fileInputRef.current?.click();
            }}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 min-h-[40px] sm:min-h-0 rounded-[10px] bg-subtle active:bg-hover hover:bg-hover text-text-primary text-xs sm:text-sm font-medium border border-border transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-text-secondary" />
            <span>File</span>
          </button>

          {/* Center: Live Peer Typing / Sync Indicator */}
          <div className="flex-1 flex items-center justify-center px-2 min-h-[20px]">
            {peerTyping && peerTyping.isTyping ? (
              <div className="inline-flex items-center gap-1.5 text-xs text-accent font-medium animate-fade">
                <span className="flex items-center gap-0.5">
                  <span className="w-1 h-1 rounded-full bg-accent animate-dot-1" />
                  <span className="w-1 h-1 rounded-full bg-accent animate-dot-2" />
                  <span className="w-1 h-1 rounded-full bg-accent animate-dot-3" />
                </span>
                <span className="truncate max-w-[150px] sm:max-w-none">{peerTyping.deviceName} is typing…</span>
              </div>
            ) : text.length > 0 ? (
              <span className="text-[11px] text-text-muted select-none">
                {text.length} chars · {text.trim().split(/\s+/).filter(Boolean).length} words
              </span>
            ) : !isOnline && queuedCount > 0 ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400">
                <Clock className="w-3 h-3" />
                <span>{queuedCount} waiting for internet</span>
              </span>
            ) : null}
          </div>

          {/* Send Button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!hasContent || (sendState !== 'idle' && sendState !== 'queued')}
            className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 sm:py-1.5 min-h-[40px] sm:min-h-0 rounded-[10px] text-xs sm:text-sm font-semibold transition-all active:scale-[0.98] ${
              sendState === 'sent'
                ? 'bg-accent text-white'
                : sendState === 'queued'
                ? 'bg-amber-500 text-white'
                : sendState === 'sending'
                ? 'bg-text-primary text-card opacity-80 cursor-wait'
                : hasContent
                ? 'bg-text-primary hover:opacity-90 active:opacity-80 text-background shadow-sm'
                : 'bg-subtle text-text-muted cursor-not-allowed border border-border'
            }`}
          >
            {sendState === 'sent' ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Sent</span>
              </>
            ) : sendState === 'queued' ? (
              <>
                <Clock className="w-3.5 h-3.5" />
                <span>Queued</span>
              </>
            ) : sendState === 'sending' ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Sending…</span>
              </>
            ) : !isOnline ? (
              <>
                <span>Queue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>Send</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Connection Info Below Composer */}
      <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-text-secondary gap-1.5 px-1">
        <button
          onClick={() => {
            sounds.playClick();
            onOpenDevices();
          }}
          className="inline-flex items-center gap-2 hover:text-text-primary transition-colors py-1"
        >
          {/* Pulsing Radar Ring */}
          <div className="relative flex items-center justify-center w-2.5 h-2.5">
            <span className={`absolute w-full h-full rounded-full ${isOnline ? 'bg-accent animate-radar-ring' : 'bg-amber-500'}`} />
            <span className={`relative w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-accent' : 'bg-amber-500'}`} />
          </div>
          <span className="font-medium text-text-primary">
            {isOnline ? (totalDevices === 1 ? '1 device active (Ready to pair)' : `Connected to ${totalDevices} devices`) : 'Offline Mode (Local)'}
          </span>
        </button>

        <div className="flex items-center gap-2 text-[11px] sm:text-xs text-text-muted">
          {!isOnline ? (
            <span className="text-amber-600 dark:text-amber-400 font-medium">Auto-send on reconnect</span>
          ) : isSyncing ? (
            <span className="inline-flex items-center gap-1 text-accent font-medium">
              <RefreshCw className="w-3 h-3 animate-spin" />
              Syncing…
            </span>
          ) : (
            <span>Same Wi-Fi · In sync</span>
          )}
        </div>
      </div>
    </section>
  );
};
