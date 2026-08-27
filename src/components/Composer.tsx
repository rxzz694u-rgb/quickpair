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
  Shield,
  Zap,
  Sparkles,
  Smartphone,
  Laptop,
} from 'lucide-react';
import { sounds } from '../services/audio';
import { peerSync } from '../services/peerSync';

interface ComposerProps {
  onOpenDevices: () => void;
  peerCount: number;
}

const PLACEHOLDERS = [
  'Start typing to beam across devices…',
  'Paste a link, URL, or code snippet…',
  'Drop any file or photo here to share…',
  'Write a note to your phone or laptop…',
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
  const [customHeight, setCustomHeight] = useState<number>(130);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isDraggingHandle, setIsDraggingHandle] = useState<boolean>(false);
  const dragStartYRef = useRef<number>(0);
  const dragStartHeightRef = useRef<number>(130);

  // Animated typewriter placeholder state
  const [placeholderText, setPlaceholderText] = useState('Start typing to beam across devices…');
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
      const newHeight = Math.min(Math.max(dragStartHeightRef.current + deltaY, 90), 500);
      setCustomHeight(newHeight);
      setIsExpanded(newHeight > 220);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingHandle || !e.touches[0]) return;
      const deltaY = e.touches[0].clientY - dragStartYRef.current;
      const newHeight = Math.min(Math.max(dragStartHeightRef.current + deltaY, 90), 500);
      setCustomHeight(newHeight);
      setIsExpanded(newHeight > 220);
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
      setCustomHeight(130);
      setIsExpanded(false);
    } else {
      setCustomHeight(280);
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

      if (text.trim()) {
        const trimmed = text.trim();
        const isUrl = /^https?:\/\/[^\s]+$/i.test(trimmed);
        const isCode = trimmed.includes('\n') && (trimmed.includes('function') || trimmed.includes('const ') || trimmed.includes('{') || trimmed.includes('<'));

        peerSync.addItem({
          type: isUrl ? 'link' : isCode ? 'code' : 'text',
          content: trimmed,
        });
      }

      setText('');
      setSelectedFile(null);
      setSendState('sent');
      setIsSyncing(false);

      setTimeout(() => {
        setSendState('idle');
      }, 1200);
    }, 100);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const hasContent = text.trim().length > 0 || selectedFile !== null;

  return (
    <section className="w-full max-w-[840px] mx-auto px-4 pt-4 sm:pt-6 pb-2 relative">
      
      {/* 1. MESH GRAPHIC & HERO (Inspired by CoreShift Image 1 & 2) */}
      <div className="text-center pt-2 pb-6 sm:pb-8 relative select-none">
        
        {/* Visual Node Diagram */}
        <div className="relative w-full max-w-[540px] mx-auto h-[120px] sm:h-[140px] flex items-center justify-center mb-2">
          {/* Subtle SVG Connection Network Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none text-border/80 dark:text-border" fill="none">
            {/* Left Branches */}
            <path d="M120 40 L220 70" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
            <path d="M130 110 L220 70" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
            {/* Right Branches */}
            <path d="M420 40 L320 70" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
            <path d="M410 110 L320 70" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
            {/* Connection Dots */}
            <circle cx="120" cy="40" r="3" className="fill-[#8B5CF6]" />
            <circle cx="130" cy="110" r="3" className="fill-[#0EA5E9]" />
            <circle cx="420" cy="40" r="3" className="fill-[#FF5B37]" />
            <circle cx="410" cy="110" r="3" className="fill-[#F59E0B]" />
          </svg>

          {/* Left Squircles */}
          <div className="absolute left-6 sm:left-14 top-2 animate-soft-float">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-[#F59E0B] to-[#FCD34D] text-white flex items-center justify-center shadow-lg shadow-amber-500/20 ring-2 ring-white dark:ring-[#16161D]">
              <Zap className="w-5 h-5" />
            </div>
          </div>

          <div className="absolute left-10 sm:left-20 bottom-1 animate-soft-float-delayed">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-[#0EA5E9] to-[#38BDF8] text-white flex items-center justify-center shadow-lg shadow-sky-500/20 ring-2 ring-white dark:ring-[#16161D]">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>

          {/* Central Core Tactile Purple Squircle */}
          <div className="relative z-10 animate-soft-float">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-[#8B5CF6] via-[#7C3AED] to-[#A855F7] text-white flex items-center justify-center shadow-2xl shadow-purple-500/30 ring-4 ring-purple-100 dark:ring-purple-950/60 transition-transform hover:scale-105 cursor-pointer"
                 onClick={() => onOpenDevices()}
                 title="View paired devices"
            >
              <svg viewBox="0 0 24 24" className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
          </div>

          {/* Right Squircles */}
          <div className="absolute right-6 sm:right-14 top-2 animate-soft-float-delayed">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-[#FF5B37] to-[#FB923C] text-white flex items-center justify-center shadow-lg shadow-orange-500/20 ring-2 ring-white dark:ring-[#16161D]">
              <Shield className="w-5 h-5" />
            </div>
          </div>

          <div className="absolute right-10 sm:right-20 bottom-1 animate-soft-float">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-card border border-border text-text-primary flex items-center justify-center shadow-md ring-2 ring-white dark:ring-[#16161D]">
              {totalDevices > 1 ? <Smartphone className="w-5 h-5 text-emerald-500" /> : <Laptop className="w-5 h-5 text-text-muted" />}
            </div>
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <h1 className="text-[32px] sm:text-[46px] md:text-[52px] font-extrabold tracking-tight text-text-primary leading-[1.1] max-w-xl mx-auto">
          Instant cross-device <span className="text-[#FF5B37]">sharing.</span>
        </h1>
        <p className="text-[14px] sm:text-[16px] text-text-secondary mt-2.5 max-w-md mx-auto font-normal leading-relaxed">
          Beam text, links, notes, and files to all your nearby devices in real time with zero cloud storage.
        </p>
      </div>

      {/* 2. MAIN COMPOSER CARD (Tactile, High-Contrast & Sleek) */}
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
        className={`relative bg-card rounded-3xl border transition-all duration-200 shadow-card overflow-hidden ${
          isDragOver
            ? 'border-[#FF5B37] ring-4 ring-[#FF5B37]/15 bg-coral-50/30'
            : isFocused
            ? 'border-[#8B5CF6]/50 ring-2 ring-[#8B5CF6]/15 shadow-lg'
            : 'border-border hover:border-border/80'
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

        {/* Textarea Area */}
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
          {/* + File Button */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              fileInputRef.current?.click();
            }}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-subtle hover:bg-hover active:scale-95 text-text-primary text-xs sm:text-sm font-medium border border-border transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-text-secondary" />
            <span>Attach file</span>
          </button>

          {/* Typing Indicator / Word count */}
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
                {text.length} chars · {text.trim().split(/\s+/).filter(Boolean).length} words
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

      {/* 3. SUBTLE STATUS BAR */}
      <div className="mt-3 flex items-center justify-between text-xs text-text-secondary px-1.5">
        <button
          onClick={() => {
            sounds.playClick();
            onOpenDevices();
          }}
          className="inline-flex items-center gap-2 hover:text-text-primary transition-colors py-0.5 cursor-pointer"
        >
          <div className="relative flex items-center justify-center w-2 h-2">
            <span className="absolute w-full h-full rounded-full bg-emerald-500 animate-radar-ring" />
            <span className="relative w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </div>
          <span className="font-semibold text-text-primary">
            {totalDevices === 1 ? 'Ready to pair' : `Paired with ${totalDevices} devices`}
          </span>
        </button>

        <span className="text-[11px] text-text-muted">
          P2P Local Wi-Fi Mesh · Sub-5ms
        </span>
      </div>
    </section>
  );
};
