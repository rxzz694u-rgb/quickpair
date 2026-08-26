import React, { useState } from 'react';
import {
  Copy,
  Check,
  Download,
  Trash2,
  ExternalLink,
  Clock,
  Lock,
} from 'lucide-react';
import { sounds } from '../services/audio';
import { peerSync, SharedItem, FIVE_DAYS_MS } from '../services/peerSync';

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
      a.download = item.fileData?.name || 'shared-file.txt';
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

  const formatExpiresIn = (expiresAt?: number, timestamp?: number) => {
    const target = expiresAt || (timestamp ? timestamp + FIVE_DAYS_MS : Date.now() + FIVE_DAYS_MS);
    const diff = target - Date.now();
    if (diff <= 0) return 'Expired';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `Expires in ${days}d ${hours}h`;
    return `Expires in ${hours}h`;
  };

  const getItemTypeBadge = (type: string) => {
    switch (type) {
      case 'link':
        return <span className="text-[11px] font-mono text-text-secondary">↗ Link</span>;
      case 'code':
        return <span className="text-[11px] font-mono text-text-secondary">&lt;&gt; Code</span>;
      case 'file':
        return <span className="text-[11px] font-mono text-text-secondary">□ File</span>;
      default:
        return <span className="text-[11px] font-mono text-text-secondary">Aa Text</span>;
    }
  };

  return (
    <section className="w-full max-w-[760px] mx-auto px-4 pt-4 sm:pt-6 pb-4">
      {/* Header: Recent & Clear */}
      <div className="flex items-center justify-between pb-2 mb-1 border-b border-border text-xs font-medium text-text-secondary">
        <div className="flex items-center gap-2">
          <span className="text-text-primary font-semibold text-sm">Recent</span>
          <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-subtle text-text-secondary border border-border">
            {items.length}
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-text-muted">
            <Clock className="w-3 h-3 text-text-muted" />
            <span>5-day auto-purge</span>
          </span>
        </div>
        {items.length > 0 && (
          <button
            onClick={() => {
              sounds.playClick();
              peerSync.clearAll();
            }}
            className="hover:text-text-primary text-xs transition-colors py-1 px-1 cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Empty State */}
      {items.length === 0 ? (
        <div className="py-10 sm:py-16 text-center space-y-1">
          <p className="text-[15px] font-medium text-text-primary">Nothing here yet.</p>
          <p className="text-xs text-text-secondary">
            Paste something above and send it to your other device.
          </p>
        </div>
      ) : (
        /* List Feed with subtle horizontal dividers & entrance animation */
        <div className="divide-y divide-border">
          {items.map((item, index) => (
            <div
              key={item.id}
              className={`py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 group transition-all duration-200 ${
                index === 0 ? 'animate-item-enter' : ''
              }`}
            >
              {/* Left Details */}
              <div className="flex-1 min-w-0 pr-0 sm:pr-2">
                {/* Meta line: Type / Device / Time / Expiration / E2EE */}
                <div className="flex items-center gap-2 text-[12px] text-text-secondary mb-1 flex-wrap">
                  {getItemTypeBadge(item.type)}
                  <span className="text-border">·</span>
                  <span className="font-medium text-text-primary truncate max-w-[140px] sm:max-w-none">{item.senderDevice}</span>
                  <span className="text-border">·</span>
                  <span className="text-text-muted text-[11px] sm:text-[12px]">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>

                  {/* E2EE Lock Icon */}
                  <span className="inline-flex items-center gap-0.5 text-[10px] text-accent" title="End-to-End Encrypted (AES-256)">
                    <Lock className="w-2.5 h-2.5" />
                    <span>E2EE</span>
                  </span>

                  {/* 5-day expiration tooltip / text */}
                  <span className="text-[10px] text-text-muted" title="Automatically purged after 5 days">
                    ({formatExpiresIn(item.expiresAt, item.timestamp)})
                  </span>

                  {item.isQueued && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                      <Clock className="w-2.5 h-2.5 animate-pulse" />
                      <span>Waiting to send (Queued)</span>
                    </span>
                  )}
                </div>

                {/* Item Content */}
                {item.type === 'file' ? (
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <p className="text-[14px] sm:text-[15px] font-medium text-text-primary truncate max-w-[200px] sm:max-w-none">
                      {item.content}
                    </p>
                    {item.fileData && (
                      <span className="text-xs text-text-secondary flex-shrink-0">
                        ({formatFileSize(item.fileData.size)})
                      </span>
                    )}
                  </div>
                ) : item.type === 'link' ? (
                  <a
                    href={item.content}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[14px] sm:text-[15px] text-text-primary hover:text-accent font-medium hover:underline break-all inline-flex items-center gap-1"
                  >
                    <span className="break-all">{item.content}</span>
                    <ExternalLink className="w-3 h-3 text-text-muted flex-shrink-0" />
                  </a>
                ) : item.type === 'code' ? (
                  <pre className="p-2.5 rounded-md bg-subtle border border-border text-xs font-mono text-text-primary overflow-x-auto select-all max-h-28">
                    <code>{item.content}</code>
                  </pre>
                ) : (
                  <p className="text-[14px] sm:text-[15px] text-text-primary font-normal whitespace-pre-wrap break-words leading-relaxed">
                    {item.content}
                  </p>
                )}
              </div>

              {/* Right Action Button: Copy or Download */}
              <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0 pt-1 sm:pt-0">
                {item.type === 'file' ? (
                  <button
                    onClick={() => handleDownload(item)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 min-h-[36px] sm:min-h-0 rounded-[8px] bg-subtle active:bg-hover hover:bg-hover text-text-primary text-xs font-medium border border-border transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-text-secondary" />
                    <span>Download</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleCopy(item)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 min-h-[36px] sm:min-h-0 rounded-[8px] bg-subtle active:bg-hover hover:bg-hover text-text-primary text-xs font-medium border border-border transition-colors cursor-pointer"
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
                  className="p-2 sm:p-1.5 rounded-[8px] text-text-muted hover:text-red-500 transition-colors cursor-pointer"
                  title="Delete"
                  aria-label="Delete item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
