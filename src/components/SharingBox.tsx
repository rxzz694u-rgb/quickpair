import React, { useState, useRef } from 'react';
import {
  Plus,
  Paperclip,
  FileText,
  X,
  ArrowRight,
  Check,
  UploadCloud,
  Send,
  Sparkles,
} from 'lucide-react';
import { sounds } from '../services/audio';
import { peerSync, ItemType } from '../services/peerSync';

interface SharingBoxProps {
  onOpenDevices: () => void;
  peerCount: number;
}

export const SharingBox: React.FC<SharingBoxProps> = ({ onOpenDevices, peerCount }) => {
  const [text, setText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileProgress, setFileProgress] = useState<number | null>(null);
  const [isSentSuccess, setIsSentSuccess] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFileSelect = (file: File) => {
    sounds.playPop();
    setSelectedFile(file);
  };

  const handleSend = () => {
    if (!text.trim() && !selectedFile) return;

    sounds.playPop();

    // If file is selected, simulate upload progress
    if (selectedFile) {
      setFileProgress(25);
      const interval = setInterval(() => {
        setFileProgress((prev) => {
          if (prev === null || prev >= 100) {
            clearInterval(interval);
            finalizeSend();
            return 100;
          }
          return prev + 35;
        });
      }, 150);
    } else {
      finalizeSend();
    }
  };

  const finalizeSend = () => {
    // 1. Send file if any
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

    // 2. Send text if any
    if (text.trim()) {
      const trimmed = text.trim();
      let detectedType: ItemType = 'text';
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        detectedType = 'link';
      } else if (
        trimmed.includes('function') ||
        trimmed.includes('const ') ||
        trimmed.includes('npm ') ||
        trimmed.includes('git ')
      ) {
        detectedType = 'code';
      }

      peerSync.addItem({
        type: detectedType,
        content: trimmed,
        title: detectedType === 'link' ? 'Link' : detectedType === 'code' ? 'Code' : 'Note',
      });
    }

    // Visual feedback
    sounds.playSuccess();
    setIsSentSuccess(true);
    setText('');
    setSelectedFile(null);
    setFileProgress(null);

    setTimeout(() => {
      setIsSentSuccess(false);
      textareaRef.current?.focus();
    }, 1800);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <section className="w-full max-w-xl mx-auto px-4 sm:px-0 pt-4 sm:pt-8 pb-4">
      {/* Title & Subtitle */}
      <div className="text-left sm:text-center mb-5 sm:mb-6">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-primary">
          Share anything.
        </h1>
        <p className="text-sm sm:text-base text-primary-muted mt-1.5 font-normal">
          Text, links and files between your devices.
        </p>
      </div>

      {/* Main Sharing Box Card */}
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
        className={`relative bg-surface rounded-2xl border transition-all duration-200 shadow-card overflow-hidden ${
          isDragOver ? 'border-accent ring-2 ring-accent/20 bg-accent-light/30' : 'border-border hover:border-border-dark'
        }`}
      >
        {/* Hidden File Input */}
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

        {/* Text Input Area */}
        <div className="p-4 sm:p-5 pb-2">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleSend();
              }
            }}
            placeholder="Write or paste something…"
            rows={4}
            className="w-full bg-transparent text-primary placeholder:text-primary-subtle text-base font-normal resize-none focus:outline-none leading-relaxed"
          />

          {/* Selected File Chip & Progress Bar */}
          {selectedFile && (
            <div className="mt-2 p-2.5 rounded-xl bg-surface-subtle border border-border flex flex-col gap-1.5 animate-fade-in">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate pr-2">
                  <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="font-medium text-primary truncate">{selectedFile.name}</span>
                  <span className="text-primary-muted flex-shrink-0">({formatFileSize(selectedFile.size)})</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="text-primary-muted hover:text-primary p-1"
                  aria-label="Remove file"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Progress indicator */}
              {fileProgress !== null && (
                <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-accent h-full transition-all duration-150 rounded-full"
                    style={{ width: `${fileProgress}%` }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Bottom Bar */}
        <div className="px-4 sm:px-5 py-3 border-t border-border-subtle bg-surface flex items-center justify-between gap-3">
          {/* Add file button */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              fileInputRef.current?.click();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-subtle hover:bg-surface-muted text-primary text-xs sm:text-sm font-medium border border-border transition-colors touch-target sm:min-h-0"
          >
            <Plus className="w-4 h-4 text-primary-muted" />
            <span>Add file</span>
          </button>

          {/* Send Button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!text.trim() && !selectedFile}
            className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all touch-target ${
              isSentSuccess
                ? 'bg-accent text-white'
                : text.trim() || selectedFile
                ? 'bg-primary hover:bg-black text-white shadow-sm'
                : 'bg-surface-subtle text-primary-subtle border border-border cursor-not-allowed'
            }`}
          >
            {isSentSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Sent</span>
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

      {/* Connection Indicator Below Box */}
      <div className="mt-3 flex items-center justify-between text-xs px-2 text-primary-muted font-normal">
        <button
          onClick={() => {
            sounds.playClick();
            onOpenDevices();
          }}
          className="inline-flex items-center gap-1.5 hover:text-primary transition-colors py-1"
        >
          <span className="w-2 h-2 rounded-full bg-accent" />
          <span>Connected to {peerCount > 0 ? `${peerCount + 1} devices` : '1 device'}</span>
        </button>

        <span className="text-primary-subtle text-[11px]">Same Wi-Fi · No cables</span>
      </div>
    </section>
  );
};
