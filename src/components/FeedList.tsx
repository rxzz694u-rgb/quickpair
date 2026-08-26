import React, { useState } from 'react';
import {
  Copy,
  Check,
  Download,
  Trash2,
  ExternalLink,
  FileText,
  Link as LinkIcon,
  Code as CodeIcon,
  Smartphone,
  Laptop,
} from 'lucide-react';
import { sounds } from '../services/audio';
import { peerSync, SharedItem } from '../services/peerSync';

interface FeedListProps {
  items: SharedItem[];
}

export const FeedList: React.FC<FeedListProps> = ({ items }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (item: SharedItem) => {
    navigator.clipboard.writeText(item.content);
    sounds.playCopy();
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1800);
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
      a.download = item.fileData?.name || 'shared-item.txt';
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

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="w-full max-w-xl mx-auto px-4 sm:px-0 py-4 space-y-3">
      <div className="flex items-center justify-between px-1 text-xs text-primary-muted font-medium">
        <span>Shared items ({items.length})</span>
        <button
          onClick={() => {
            sounds.playClick();
            peerSync.clearAll();
          }}
          className="hover:text-primary transition-colors"
        >
          Clear
        </button>
      </div>

      <div className="space-y-2.5">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-3.5 sm:p-4 rounded-xl bg-surface border border-border shadow-sm flex flex-col gap-2.5 transition-all hover:border-border-dark"
          >
            {/* Header info */}
            <div className="flex items-center justify-between text-xs text-primary-muted">
              <div className="flex items-center gap-1.5 font-medium">
                {item.type === 'file' && <FileText className="w-3.5 h-3.5 text-primary" />}
                {item.type === 'link' && <LinkIcon className="w-3.5 h-3.5 text-primary" />}
                {item.type === 'code' && <CodeIcon className="w-3.5 h-3.5 text-primary" />}
                {item.type === 'text' && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
                <span className="text-primary">{item.senderDevice}</span>
              </div>
              <span className="text-[11px] text-primary-subtle">
                {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {/* Content view */}
            {item.type === 'file' ? (
              <div className="p-3 rounded-lg bg-surface-subtle border border-border flex items-center justify-between gap-3">
                <div className="truncate">
                  <p className="text-sm font-medium text-primary truncate">{item.content}</p>
                  <p className="text-xs text-primary-muted">{formatFileSize(item.fileData?.size)}</p>
                </div>
                <button
                  onClick={() => handleDownload(item)}
                  className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-black text-white text-xs font-semibold shadow-sm transition-colors touch-target sm:min-h-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            ) : item.type === 'link' ? (
              <div className="space-y-1">
                <a
                  href={item.content}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary font-medium hover:underline break-all inline-flex items-center gap-1"
                >
                  <span>{item.content}</span>
                  <ExternalLink className="w-3 h-3 text-primary-muted flex-shrink-0" />
                </a>
              </div>
            ) : item.type === 'code' ? (
              <pre className="p-3 rounded-lg bg-surface-subtle border border-border text-xs font-mono text-primary overflow-x-auto select-all">
                <code>{item.content}</code>
              </pre>
            ) : (
              <p className="text-sm text-primary font-normal whitespace-pre-wrap break-words leading-relaxed">
                {item.content}
              </p>
            )}

            {/* Bottom Actions */}
            {item.type !== 'file' && (
              <div className="pt-2 border-t border-border-subtle flex items-center justify-between">
                <button
                  onClick={() => handleCopy(item)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-subtle hover:bg-surface-muted text-primary text-xs font-medium border border-border transition-colors touch-target sm:min-h-0"
                >
                  {copiedId === item.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-accent" />
                      <span className="text-accent font-medium">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-primary-muted" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1 rounded-md text-primary-subtle hover:text-red-600 transition-colors"
                  title="Delete item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
