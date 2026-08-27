import React, { useState } from 'react';
import {
  Copy,
  Check,
  Download,
  Trash2,
  ExternalLink,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import { sounds } from '../services/audio';
import { peerSync, SharedItem } from '../services/peerSync';

interface RecentFeedProps {
  items: SharedItem[];
}

export const RecentFeed: React.FC<RecentFeedProps> = ({ items }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (item: SharedItem) => {
    navigator.clipboard.writeText(item.content);
    sounds.playCopy();
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1600);
  };

  const handleDownload = (item: SharedItem) => {
    sounds.playSuccess();
    if (item.fileData?.dataUrl) {
      const a = document.createElement('a');
      a.href = item.fileData.dataUrl;
      a.download = item.fileData.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      const blob = new Blob([item.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.fileData?.name || 'file.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
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
    return /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(name) || item.fileData?.mimeType?.startsWith('image/');
  };

  return (
    <section className="w-full max-w-[760px] mx-auto px-4 pt-4 sm:pt-6 pb-6">
      {/* Header: Clean Recent count & Clear button */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-border text-xs text-text-secondary">
        <div className="flex items-center gap-2">
          <span className="text-text-primary font-semibold text-sm">Recent</span>
          {items.length > 0 && (
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-subtle text-text-muted border border-border font-mono">
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
            className="hover:text-red-500 text-xs transition-colors py-1 px-1 cursor-pointer font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Empty State */}
      {items.length === 0 ? (
        <div className="py-10 sm:py-14 text-center space-y-1">
          <p className="text-sm font-medium text-text-primary">Nothing here yet.</p>
          <p className="text-xs text-text-muted">
            Paste text or drop a file above to send instantly.
          </p>
        </div>
      ) : (
        /* Clean List of Messages & Files */
        <div className="divide-y divide-border/70">
          {items.map((item, index) => {
            const isImage = isImageFile(item);
            const fileName = item.fileData?.name || item.content;
            const fileSize = item.fileData?.size;

            return (
              <div
                key={item.id}
                className={`py-3 sm:py-3.5 flex items-start justify-between gap-3 group transition-all duration-200 ${
                  index === 0 ? 'animate-item-enter' : ''
                }`}
              >
                {/* Left: Pure Content (File or Message) + subtle device/time footer */}
                <div className="flex-1 min-w-0 space-y-1">
                  {/* FILE ITEM */}
                  {item.type === 'file' ? (
                    <div className="flex items-center gap-3">
                      {isImage && item.fileData?.dataUrl ? (
                        <img
                          src={item.fileData.dataUrl}
                          alt={fileName}
                          className="w-11 h-11 object-cover rounded-lg border border-border flex-shrink-0 bg-subtle"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-subtle border border-border flex items-center justify-center flex-shrink-0 text-text-secondary">
                          {isImage ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] sm:text-[15px] font-medium text-text-primary truncate" title={fileName}>
                          {fileName}
                        </p>
                        {fileSize ? (
                          <p className="text-[12px] text-text-muted mt-0.5">{formatFileSize(fileSize)}</p>
                        ) : null}
                      </div>
                    </div>
                  ) : item.type === 'link' ? (
                    /* LINK ITEM */
                    <a
                      href={item.content}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[14px] sm:text-[15px] text-accent hover:underline font-normal break-all inline-flex items-center gap-1.5"
                    >
                      <span className="break-all">{item.content}</span>
                      <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 opacity-70" />
                    </a>
                  ) : item.type === 'code' ? (
                    /* CODE ITEM */
                    <pre className="p-3 rounded-lg bg-subtle border border-border text-xs font-mono text-text-primary overflow-x-auto select-all max-h-36 leading-relaxed">
                      <code>{item.content}</code>
                    </pre>
                  ) : (
                    /* TEXT MESSAGE ITEM */
                    <p className="text-[14px] sm:text-[15px] text-text-primary font-normal whitespace-pre-wrap break-words leading-relaxed">
                      {item.content}
                    </p>
                  )}

                  {/* Clean, subtle metadata: "Windows PC · 12:15 PM" */}
                  <div className="flex items-center gap-1.5 text-[11px] text-text-muted pt-0.5">
                    <span>{item.senderDevice}</span>
                    <span>·</span>
                    <span>
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Right: Clean Actions (Download / Copy + Delete) */}
                <div className="flex items-center gap-1.5 flex-shrink-0 pt-0.5">
                  {item.type === 'file' ? (
                    <button
                      onClick={() => handleDownload(item)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-subtle hover:bg-hover active:bg-hover border border-border text-text-primary text-xs font-medium transition-colors cursor-pointer"
                      title="Download file"
                    >
                      <Download className="w-3.5 h-3.5 text-text-secondary" />
                      <span>Download</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleCopy(item)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-subtle hover:bg-hover active:bg-hover border border-border text-text-primary text-xs font-medium transition-colors cursor-pointer"
                      title="Copy text"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-accent" />
                          <span className="text-accent font-medium">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-text-secondary" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg text-text-muted hover:text-red-500 hover:bg-subtle transition-colors cursor-pointer"
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
    </section>
  );
};
