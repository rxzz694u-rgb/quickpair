import React, { useState } from 'react';
import {
  Copy,
  Check,
  Download,
  Trash2,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Lock,
  X,
  Share2,
} from 'lucide-react';
import { sounds } from '../services/audio';
import { peerSync, SharedItem } from '../services/peerSync';

interface RecentFeedProps {
  items: SharedItem[];
}

export const RecentFeed: React.FC<RecentFeedProps> = ({ items }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activePreviewImage, setActivePreviewImage] = useState<{ url: string; name: string; item: SharedItem } | null>(null);

  const handleCopy = (item: SharedItem) => {
    navigator.clipboard.writeText(item.content);
    sounds.playCopy();
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1600);
  };

  const handleDownload = async (item: SharedItem) => {
    sounds.playSuccess();
    const downloadUrl = item.fileData?.dataUrl || item.fileData?.previewUrl;
    const fileName = item.fileData?.name || item.content || 'quickpair-file';

    // 1. iOS Safari / Mobile Native Share (Saves directly to Photos / Files / AirDrop)
    if (typeof navigator !== 'undefined' && navigator.share && downloadUrl) {
      try {
        const response = await fetch(downloadUrl);
        const blob = await response.blob();
        const mime = blob.type || item.fileData?.mimeType || 'image/jpeg';
        const file = new File([blob], fileName, { type: mime });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: fileName,
          });
          return;
        }
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
      }
    }

    // 2. Direct browser download for Desktop / Android
    if (downloadUrl) {
      if (downloadUrl.startsWith('http')) {
        try {
          const res = await fetch(downloadUrl);
          const blob = await res.blob();
          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);
        } catch {
          window.open(downloadUrl, '_blank');
        }
      } else {
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } else {
      const blob = new Blob([item.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName.endsWith('.txt') ? fileName : `${fileName}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 3000);
    }
  };

  const handleDelete = (id: string) => {
    sounds.playClick();
    peerSync.deleteItem(id);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const isImageFile = (item: SharedItem) => {
    if (item.type !== 'file') return false;
    const name = (item.fileData?.name || item.content).toLowerCase();
    return (
      /\.(jpg|jpeg|png|gif|webp|svg|bmp|heic|avif)$/i.test(name) ||
      Boolean(item.fileData?.mimeType?.startsWith('image/')) ||
      Boolean(item.fileData?.previewUrl?.startsWith('data:image/')) ||
      Boolean(item.fileData?.dataUrl?.startsWith('data:image/'))
    );
  };

  return (
    <section className="w-full max-w-[760px] mx-auto px-4 pt-5 pb-6">
      {/* Header: Clean title & Clear all */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/80 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-text-primary font-bold text-[14px]">Shared Items</span>
          {items.length > 0 && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-subtle text-text-muted border border-border font-semibold">
              {items.length}
            </span>
          )}
        </div>
        {items.length > 0 && (
          <button
            onClick={() => {
              sounds.playClick();
              peerSync.clearAll();
            }}
            className="hover:text-red-500 text-text-muted text-xs transition-colors py-1 px-1 cursor-pointer font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Empty State */}
      {items.length === 0 ? (
        <div className="py-12 sm:py-16 text-center space-y-1.5 select-none">
          <div className="w-12 h-12 rounded-2xl bg-subtle border border-border mx-auto flex items-center justify-center text-text-muted mb-2 shadow-xs">
            <FileText className="w-5 h-5 opacity-60" />
          </div>
          <p className="text-sm font-semibold text-text-primary">No items shared yet</p>
          <p className="text-xs text-text-muted max-w-xs mx-auto">
            Open QuickPair on another phone or laptop to start beaming instantly.
          </p>
        </div>
      ) : (
        /* Clean List of Sent & Received Items */
        <div className="divide-y divide-border/60">
          {items.map((item, index) => {
            const isImage = isImageFile(item);
            const fileName = item.fileData?.name || item.content;
            const fileSize = item.fileData?.size;
            const imgSrc = item.fileData?.previewUrl || item.fileData?.dataUrl;

            return (
              <div
                key={item.id}
                className={`py-3 sm:py-3.5 flex items-start justify-between gap-3 group transition-all duration-150 ${
                  index === 0 ? 'animate-item-enter' : ''
                }`}
              >
                {/* Left: Pure Content (File, Link, Text) */}
                <div className="flex-1 min-w-0 space-y-1">
                  {/* 1. FILE ITEM */}
                  {item.type === 'file' ? (
                    <div className="flex items-center gap-3">
                      {isImage && imgSrc ? (
                        <div
                          onClick={() => {
                            sounds.playPop();
                            setActivePreviewImage({ url: imgSrc, name: fileName, item });
                          }}
                          className="relative w-12 h-12 rounded-xl overflow-hidden border border-border flex-shrink-0 bg-subtle shadow-xs cursor-pointer group/img active:scale-95 transition-transform"
                        >
                          <img
                            src={imgSrc}
                            alt={fileName}
                            loading="eager"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-subtle border border-border flex items-center justify-center flex-shrink-0 text-text-secondary shadow-xs">
                          {isImage ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p
                          onClick={() => {
                            if (isImage && imgSrc) {
                              sounds.playPop();
                              setActivePreviewImage({ url: imgSrc, name: fileName, item });
                            }
                          }}
                          className={`text-[14px] sm:text-[15px] font-semibold text-text-primary truncate ${isImage && imgSrc ? 'cursor-pointer hover:underline' : ''}`}
                          title={fileName}
                        >
                          {fileName}
                        </p>
                        {fileSize ? (
                          <p className="text-[12px] text-text-muted mt-0.5">{formatFileSize(fileSize)}</p>
                        ) : null}
                      </div>
                    </div>
                  ) : item.type === 'link' ? (
                    /* 2. LINK ITEM */
                    <a
                      href={item.content}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[14px] sm:text-[15px] text-[#FF5B37] hover:underline font-medium break-all inline-flex items-center gap-1.5"
                    >
                      <span className="break-all">{item.content}</span>
                      <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 opacity-70" />
                    </a>
                  ) : item.type === 'code' ? (
                    /* 3. CODE SNIPPET */
                    <pre className="text-xs font-mono bg-subtle p-3 rounded-xl border border-border overflow-x-auto whitespace-pre-wrap leading-relaxed text-text-primary">
                      {item.content}
                    </pre>
                  ) : item.type === 'secret' ? (
                    /* 4. SECRET ENCRYPTED NOTE */
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-600 dark:text-purple-400">
                      <Lock className="w-3.5 h-3.5" />
                      <span>{item.content}</span>
                    </div>
                  ) : (
                    /* 5. TEXT / PLAIN MESSAGE */
                    <p className="text-[14px] sm:text-[15px] text-text-primary font-normal whitespace-pre-wrap leading-relaxed select-text">
                      {item.content}
                    </p>
                  )}

                  {/* Subtle Timestamp & Sender Device */}
                  <div className="flex items-center gap-2 text-[11px] text-text-muted select-none pt-0.5">
                    <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {item.senderDevice && (
                      <>
                        <span>·</span>
                        <span>{item.senderDevice}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Right: Quick Action Buttons (Copy / Download / Delete) */}
                <div className="flex items-center gap-1 flex-shrink-0 pt-0.5">
                  {/* Download Button (for files) */}
                  {item.type === 'file' && (
                    <button
                      onClick={() => handleDownload(item)}
                      className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-subtle active:scale-95 transition-all cursor-pointer"
                      title="Download or Save to Photos"
                      aria-label="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}

                  {/* Copy Button (for text, links, code) */}
                  {item.type !== 'file' && (
                    <button
                      onClick={() => handleCopy(item)}
                      className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-subtle active:scale-95 transition-all cursor-pointer"
                      title="Copy to clipboard"
                      aria-label="Copy"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  )}

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-xl text-text-muted hover:text-red-500 hover:bg-red-500/10 active:scale-95 transition-all cursor-pointer opacity-70 hover:opacity-100"
                    title="Delete item"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* FULLSCREEN IMAGE LIGHTBOX MODAL (Optimized for iPhone / iOS Photos Save) */}
      {activePreviewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade">
          <div
            className="absolute inset-0"
            onClick={() => setActivePreviewImage(null)}
          />

          <div className="relative max-w-lg w-full bg-card rounded-3xl border border-border p-4 shadow-2xl z-10 space-y-3.5 animate-sheet-up">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-border/80">
              <p className="text-xs font-semibold text-text-primary truncate max-w-[240px]">
                {activePreviewImage.name}
              </p>
              <button
                onClick={() => setActivePreviewImage(null)}
                className="p-1.5 rounded-full text-text-muted hover:text-text-primary hover:bg-subtle transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Image Box */}
            <div className="max-h-[60vh] rounded-2xl overflow-hidden bg-black/40 flex items-center justify-center border border-border/50">
              <img
                src={activePreviewImage.url}
                alt={activePreviewImage.name}
                className="max-h-[60vh] max-w-full object-contain rounded-xl"
              />
            </div>

            {/* Actions: Save to Photos / Share */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  handleDownload(activePreviewImage.item);
                }}
                className="flex-1 py-3 rounded-2xl bg-[#0A0A0C] dark:bg-white text-white dark:text-[#0A0A0C] text-xs font-semibold flex items-center justify-center gap-2 shadow-md hover:opacity-90 active:scale-98 transition-all cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Save Image / Share</span>
              </button>

              <button
                onClick={() => setActivePreviewImage(null)}
                className="px-4 py-3 rounded-2xl bg-subtle hover:bg-hover text-text-primary text-xs font-medium border border-border transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

            <p className="text-[10px] text-text-muted text-center">
              On iPhone: Tap &quot;Save Image / Share&quot; or press and hold the image to save to Photos.
            </p>
          </div>
        </div>
      )}
    </section>
  );
};
