import React, { useState, useEffect, useRef } from 'react';
import {
  Share2,
  Lock,
  QrCode,
  Copy,
  Check,
  Trash2,
  Download,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  Code2,
  Flame,
  Wifi,
  Laptop,
  Smartphone,
  Tablet,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Eye,
  EyeOff,
  Sparkles,
  Command,
  Volume2,
  VolumeX,
  X,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../services/audio';
import { peerSync, SharedItem, PeerInfo, ItemType } from '../../services/peerSync';
import { encryptSecretNote, decryptSecretNote, EncryptedPayload } from '../../services/crypto';

interface AppViewProps {
  onBackToLanding: () => void;
}

export const AppView: React.FC<AppViewProps> = ({ onBackToLanding }) => {
  const [activeTab, setActiveTab] = useState<'shared' | 'secret' | 'radar'>('shared');
  const [items, setItems] = useState<SharedItem[]>([]);
  const [peers, setPeers] = useState<PeerInfo[]>([]);
  const [textInput, setTextInput] = useState('');
  const [itemType, setItemType] = useState<ItemType>('text');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showCmdK, setShowCmdK] = useState(false);
  const [isMuted, setIsMuted] = useState(sounds.getIsMuted());

  // Secret note state
  const [secretText, setSecretText] = useState('');
  const [secretPass, setSecretPass] = useState('');
  const [burnAfterRead, setBurnAfterRead] = useState(true);
  const [secretNotesList, setSecretNotesList] = useState<SharedItem[]>([]);
  const [decryptingId, setDecryptingId] = useState<string | null>(null);
  const [passInput, setPassInput] = useState('');
  const [decryptedText, setDecryptedText] = useState<string | null>(null);
  const [decryptError, setDecryptError] = useState<string | null>(null);
  const [burnCountdown, setBurnCountdown] = useState<number | null>(null);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = peerSync.subscribe((newItems, newPeers) => {
      setItems(newItems.filter((i) => i.type !== 'secret'));
      setSecretNotesList(newItems.filter((i) => i.type === 'secret'));
      setPeers(newPeers);
    });
    return unsubscribe;
  }, []);

  // Keyboard shortcut Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCmdK((prev) => !prev);
      } else if (e.key === 'Escape') {
        setShowCmdK(false);
        setDecryptingId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Countdown for self-destructing active note
  useEffect(() => {
    let interval: number;
    if (burnCountdown !== null && burnCountdown > 0) {
      interval = window.setInterval(() => {
        setBurnCountdown((c) => (c !== null ? c - 1 : null));
      }, 1000);
    } else if (burnCountdown === 0 && decryptingId) {
      sounds.playBurn();
      peerSync.burnItem(decryptingId);
      setDecryptedText(null);
      setDecryptingId(null);
      setBurnCountdown(null);
    }
    return () => clearInterval(interval);
  }, [burnCountdown, decryptingId]);

  const handleShareText = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!textInput.trim()) return;

    let detectedType: ItemType = 'text';
    const trimmed = textInput.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      detectedType = 'link';
    } else if (trimmed.includes('function') || trimmed.includes('const ') || trimmed.includes('npm ') || trimmed.includes('git ')) {
      detectedType = 'code';
    }

    sounds.playPop();
    peerSync.addItem({
      type: detectedType,
      content: trimmed,
      title: detectedType === 'link' ? 'Link' : detectedType === 'code' ? 'Code Snippet' : 'Text Note',
    });

    setTextInput('');
  };

  const handleFileUpload = (file: File) => {
    sounds.playPop();
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      peerSync.addItem({
        type: 'file',
        content: file.name,
        title: file.name,
        fileData: {
          name: file.name,
          size: file.size,
          mimeType: file.type,
          dataUrl: dataUrl,
        },
      });
      sounds.playSuccess();
    };
    reader.readAsDataURL(file);
  };

  const handleCreateSecretNote = async () => {
    if (!secretText.trim()) return;
    sounds.playPop();
    const payload = await encryptSecretNote(secretText.trim(), secretPass.trim() || undefined, burnAfterRead);

    peerSync.addItem({
      type: 'secret',
      content: '[Encrypted Secret Note]',
      title: '🔒 Secret Note',
      secretPayload: payload,
    });

    setSecretText('');
    setSecretPass('');
    setActiveTab('secret');
  };

  const handleDecryptNote = async (item: SharedItem) => {
    if (!item.secretPayload) return;
    setDecryptError(null);
    try {
      const result = await decryptSecretNote(item.secretPayload, passInput.trim() || undefined);
      setDecryptedText(result);
      sounds.playSuccess();

      if (item.secretPayload.burnAfterRead) {
        setBurnCountdown(10); // 10s countdown to burn
      }
    } catch (err) {
      setDecryptError('Invalid passphrase or decryption failed.');
    }
  };

  const handleCopy = (item: SharedItem) => {
    navigator.clipboard.writeText(item.content);
    sounds.playCopy();
    setCopiedId(item.id);
    confetti({
      particleCount: 25,
      spread: 40,
      origin: { y: 0.8 },
      colors: ['#00F59B', '#FFFFFF', '#38bdf8'],
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadFile = (item: SharedItem) => {
    sounds.playClick();
    if (!item.fileData?.dataUrl) {
      // Fallback dummy blob
      const blob = new Blob([item.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.fileData?.name || 'download.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      const a = document.createElement('a');
      a.href = item.fileData.dataUrl;
      a.download = item.fileData.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    sounds.playSuccess();
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const filteredItems = items.filter((item) =>
    item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background text-zinc-100 flex flex-col pt-20 pb-16">
      
      {/* Top Workspace Header Bar */}
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 mb-6">
        <div className="p-4 sm:p-5 rounded-3xl bg-surface-100 border border-border-medium shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Workspace Title & Mesh Status */}
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="w-10 h-10 rounded-2xl bg-surface-200 border border-border-medium flex items-center justify-center text-accent">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-lg text-white">Live Shared Space</h1>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent">
                  ACTIVE
                </span>
              </div>
              <p className="text-xs font-mono text-zinc-400">
                {peers.length > 0
                  ? `${peers.length + 1} connected devices on local Wi-Fi`
                  : 'Listening for other tabs or local devices...'}
              </p>
            </div>
          </div>

          {/* Tab switchers */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-surface-200 border border-border-subtle text-xs font-mono">
            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('shared');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
                activeTab === 'shared'
                  ? 'bg-surface-100 text-white font-semibold shadow-sm border border-border-subtle'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Share2 className="w-3.5 h-3.5 text-accent" />
              <span>Shared Space</span>
              <span className="px-1.5 py-0.2 rounded-full bg-surface-300 text-[10px] text-zinc-400">
                {items.length}
              </span>
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('secret');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
                activeTab === 'secret'
                  ? 'bg-surface-100 text-white font-semibold shadow-sm border border-border-subtle'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-cyber-rose" />
              <span>Secret Notes</span>
              <span className="px-1.5 py-0.2 rounded-full bg-surface-300 text-[10px] text-zinc-400">
                {secretNotesList.length}
              </span>
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('radar');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
                activeTab === 'radar'
                  ? 'bg-surface-100 text-white font-semibold shadow-sm border border-border-subtle'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <QrCode className="w-3.5 h-3.5 text-cyber-blue" />
              <span>Device Radar & QR</span>
            </button>
          </div>

          {/* Quick Actions (Command palette & Back) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCmdK(true)}
              className="p-2.5 rounded-xl bg-surface-200 hover:bg-surface-50 text-zinc-400 hover:text-white border border-border-subtle text-xs font-mono flex items-center gap-1.5 transition-colors"
              title="Command Palette (Cmd+K)"
            >
              <Command className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">⌘K</span>
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                onBackToLanding();
              }}
              className="px-3 py-2 rounded-xl bg-surface-200 hover:bg-surface-50 text-xs font-mono text-zinc-300 hover:text-white border border-border-subtle transition-colors"
            >
              Exit Full App
            </button>
          </div>

        </div>
      </div>

      {/* Main Content Area based on Active Tab */}
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 flex-1">
        
        {/* ================= TAB 1: SHARED SPACE ================= */}
        {activeTab === 'shared' && (
          <div className="space-y-6">
            
            {/* Input / Upload Panel */}
            <div className="rounded-3xl p-5 sm:p-6 bg-surface-100 border border-border-medium shadow-card space-y-4">
              
              {/* Text / Link / Code Form */}
              <form onSubmit={handleShareText} className="space-y-3">
                <div className="relative">
                  <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        handleShareText();
                      }
                    }}
                    rows={3}
                    placeholder="Type or paste text, links, code, or terminal commands... (Press ⌘+Enter to share)"
                    className="w-full bg-surface-200 text-white placeholder-zinc-500 font-mono text-sm p-4 rounded-2xl border border-border-medium focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all resize-none shadow-inner"
                  />
                  <div className="absolute right-3 bottom-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 rounded-xl bg-surface-100 hover:bg-surface-50 text-zinc-400 hover:text-white border border-border-subtle transition-colors"
                      title="Attach file"
                    >
                      <UploadCloud className="w-4 h-4 text-accent" />
                    </button>
                    <button
                      type="submit"
                      disabled={!textInput.trim()}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold font-mono tracking-wide transition-all ${
                        textInput.trim()
                          ? 'bg-accent hover:bg-accent-400 text-black shadow-glow-accent'
                          : 'bg-surface-50 text-zinc-600 cursor-not-allowed'
                      }`}
                    >
                      Share to Mesh →
                    </button>
                  </div>
                </div>
              </form>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />

              {/* Drag and Drop Zone */}
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
                    handleFileUpload(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`cursor-pointer rounded-2xl p-4 border border-dashed text-center transition-all flex items-center justify-center gap-2 text-xs font-mono ${
                  isDragOver
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-border-medium bg-surface-200/50 hover:bg-surface-200 text-zinc-400 hover:text-white'
                }`}
              >
                <UploadCloud className="w-4 h-4 text-accent" />
                <span>Drop any photo, document, video, or archive here to beam to all devices</span>
              </div>

            </div>

            {/* Items Stream Header & Search Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
              <div className="flex items-center gap-3">
                <h2 className="font-display font-bold text-lg text-white">Mesh Feed</h2>
                <span className="text-xs font-mono text-zinc-500">
                  {filteredItems.length} items synced
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search shared items..."
                    className="bg-surface-100 text-xs font-mono text-white pl-8 pr-3 py-1.5 rounded-xl border border-border-subtle focus:outline-none focus:border-accent"
                  />
                </div>

                {items.length > 0 && (
                  <button
                    onClick={() => {
                      sounds.playClick();
                      peerSync.clearAll();
                    }}
                    className="text-xs font-mono text-zinc-500 hover:text-red-400 px-2.5 py-1.5 rounded-xl bg-surface-100 border border-border-subtle transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {/* Items Feed List */}
            {filteredItems.length === 0 ? (
              <div className="py-20 text-center rounded-3xl bg-surface-100/50 border border-dashed border-border-medium space-y-3">
                <Share2 className="w-8 h-8 text-zinc-600 mx-auto" />
                <h3 className="font-display font-bold text-base text-zinc-300">Space is currently empty</h3>
                <p className="text-xs font-mono text-zinc-500 max-w-sm mx-auto">
                  Type a message or drop a file above. Open another tab or browser to see real-time peer syncing in action!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl p-5 bg-surface-100 border border-border-medium hover:border-border-highlight transition-all shadow-card flex flex-col justify-between group relative"
                  >
                    <div>
                      {/* Item Top Bar */}
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-border-subtle text-xs font-mono text-zinc-400">
                        <div className="flex items-center gap-2">
                          {item.type === 'link' && <LinkIcon className="w-3.5 h-3.5 text-cyber-blue" />}
                          {item.type === 'code' && <Code2 className="w-3.5 h-3.5 text-cyber-amber" />}
                          {item.type === 'file' && <FileText className="w-3.5 h-3.5 text-accent" />}
                          {item.type === 'text' && <FileText className="w-3.5 h-3.5 text-zinc-400" />}
                          <span className="uppercase tracking-wider text-[11px] font-semibold text-zinc-300">
                            {item.title || item.type}
                          </span>
                        </div>

                        <span className="text-[10px] text-zinc-500 bg-surface-200 px-2 py-0.5 rounded border border-border-subtle">
                          {item.senderDevice}
                        </span>
                      </div>

                      {/* Item Content Preview */}
                      {item.type === 'file' ? (
                        <div className="space-y-2">
                          <p className="font-mono text-sm font-bold text-white truncate">{item.content}</p>
                          <p className="text-xs font-mono text-zinc-400">
                            Size: {formatSize(item.fileData?.size)} · {item.fileData?.mimeType || 'Binary file'}
                          </p>
                        </div>
                      ) : item.type === 'link' ? (
                        <a
                          href={item.content}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-sm text-cyber-blue hover:underline break-all block"
                        >
                          {item.content}
                        </a>
                      ) : (
                        <p className="font-mono text-sm text-zinc-200 whitespace-pre-wrap break-words leading-relaxed">
                          {item.content}
                        </p>
                      )}
                    </div>

                    {/* Item Bottom Actions */}
                    <div className="pt-4 mt-4 border-t border-border-subtle/80 flex items-center justify-between text-xs font-mono">
                      <span className="text-[10px] text-zinc-500">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>

                      <div className="flex items-center gap-2">
                        {item.type === 'file' ? (
                          <button
                            onClick={() => handleDownloadFile(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent text-black font-semibold text-xs shadow-sm hover:bg-accent-400 transition-all"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleCopy(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-200 hover:bg-surface-50 text-zinc-200 hover:text-white border border-border-subtle transition-all"
                          >
                            {copiedId === item.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-accent" />
                                <span className="text-accent">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        )}

                        <button
                          onClick={() => {
                            sounds.playClick();
                            peerSync.deleteItem(item.id);
                          }}
                          className="p-1.5 rounded-xl bg-surface-200 hover:bg-red-500/20 text-zinc-500 hover:text-red-400 border border-border-subtle transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* ================= TAB 2: SECRET NOTES ================= */}
        {activeTab === 'secret' && (
          <div className="max-w-3xl mx-auto space-y-8">
            
            {/* Note Creator Box */}
            <div className="rounded-3xl p-6 sm:p-8 bg-surface-100 border border-border-medium shadow-card space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-cyber-rose/10 border border-cyber-rose/30 flex items-center justify-center text-cyber-rose">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-white">Create Encrypted Secret Note</h3>
                    <p className="text-xs font-mono text-zinc-400">Client-side 256-bit AES-GCM encryption</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <textarea
                  value={secretText}
                  onChange={(e) => setSecretText(e.target.value)}
                  rows={3}
                  placeholder="Type passwords, recovery seeds, API tokens, or confidential notes..."
                  className="w-full bg-surface-200 text-white placeholder-zinc-500 font-mono text-sm p-4 rounded-2xl border border-border-medium focus:outline-none focus:border-cyber-rose focus:ring-1 focus:ring-cyber-rose transition-all resize-none shadow-inner"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="password"
                    value={secretPass}
                    onChange={(e) => setSecretPass(e.target.value)}
                    placeholder="Optional Passphrase (leave blank for instant key)"
                    className="w-full bg-surface-200 text-white placeholder-zinc-500 font-mono text-xs px-4 py-3 rounded-xl border border-border-medium focus:outline-none focus:border-cyber-rose"
                  />

                  <label className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-surface-200 border border-border-subtle text-xs font-mono text-zinc-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={burnAfterRead}
                      onChange={(e) => setBurnAfterRead(e.target.checked)}
                      className="accent-cyber-rose rounded"
                    />
                    <span>🔥 Burn after reading (Self-destruct)</span>
                  </label>
                </div>

                <button
                  onClick={handleCreateSecretNote}
                  disabled={!secretText.trim()}
                  className={`w-full py-3.5 rounded-2xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                    secretText.trim()
                      ? 'bg-gradient-to-r from-rose-500 to-cyber-rose text-black shadow-lg shadow-cyber-rose/20'
                      : 'bg-surface-200 text-zinc-600 cursor-not-allowed'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  <span>Encrypt & Broadcast Secret Note</span>
                </button>
              </div>
            </div>

            {/* Active Secret Notes List */}
            <div className="space-y-4">
              <h3 className="font-display font-bold text-lg text-white px-1">
                Encrypted Notes in Mesh ({secretNotesList.length})
              </h3>

              {secretNotesList.length === 0 ? (
                <div className="py-12 text-center rounded-2xl bg-surface-100/50 border border-dashed border-border-subtle text-zinc-500 text-xs font-mono">
                  No active secret notes. Create one above to test browser-side encryption and burn cycles.
                </div>
              ) : (
                <div className="space-y-3">
                  {secretNotesList.map((item) => (
                    <div
                      key={item.id}
                      className="p-5 rounded-2xl bg-surface-100 border border-border-medium hover:border-cyber-rose/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-surface-200 border border-cyber-rose/30 flex items-center justify-center text-cyber-rose flex-shrink-0">
                          {item.isBurned ? <Flame className="w-5 h-5 text-red-400" /> : <Lock className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-mono text-sm font-bold text-white">
                            {item.isBurned ? '🔥 Note Vaporized (Burned)' : '🔒 Encrypted Secret Note'}
                          </p>
                          <p className="text-xs font-mono text-zinc-400">
                            {item.isBurned
                              ? 'Memory zeroed from local storage'
                              : `From ${item.senderDevice} · 256-bit AES-GCM Payload`}
                          </p>
                        </div>
                      </div>

                      {!item.isBurned && (
                        <button
                          onClick={() => {
                            sounds.playClick();
                            setDecryptingId(item.id);
                            setPassInput('');
                            setDecryptedText(null);
                            setDecryptError(null);
                          }}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-200 hover:bg-surface-50 text-xs font-mono font-medium text-white border border-border-medium hover:border-cyber-rose/50 transition-colors self-end sm:self-auto"
                        >
                          <Eye className="w-3.5 h-3.5 text-cyber-rose" />
                          <span>Decrypt & Read</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* DECRYPT MODAL */}
            {decryptingId && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
                <div className="relative w-full max-w-md rounded-3xl bg-surface-100 border border-border-medium p-6 shadow-2xl space-y-4">
                  <button
                    onClick={() => {
                      setDecryptingId(null);
                      setBurnCountdown(null);
                      setDecryptedText(null);
                    }}
                    className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-surface-200"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-cyber-rose/10 border border-cyber-rose/30 flex items-center justify-center text-cyber-rose">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-lg text-white">Decrypt Secret Note</h3>
                      <p className="text-xs font-mono text-zinc-400">Decryption happens purely in browser RAM</p>
                    </div>
                  </div>

                  {decryptedText ? (
                    <div className="space-y-4 pt-2">
                      {burnCountdown !== null && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-xs flex items-center justify-between animate-pulse">
                          <span>🔥 Self-destructing in:</span>
                          <span className="font-bold text-sm">{burnCountdown} seconds</span>
                        </div>
                      )}

                      <div className="p-4 rounded-2xl bg-surface-200 border border-border-subtle font-mono text-sm text-zinc-100 whitespace-pre-wrap select-all">
                        {decryptedText}
                      </div>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(decryptedText);
                          sounds.playCopy();
                        }}
                        className="w-full py-2.5 rounded-xl bg-surface-200 hover:bg-surface-50 text-xs font-mono text-white border border-border-medium flex items-center justify-center gap-2"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Decrypted Content</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-2">
                      <input
                        type="password"
                        value={passInput}
                        onChange={(e) => setPassInput(e.target.value)}
                        placeholder="Passphrase (leave empty if none was set)"
                        className="w-full bg-surface-200 text-white placeholder-zinc-500 font-mono text-xs px-4 py-3 rounded-xl border border-border-medium focus:outline-none focus:border-cyber-rose"
                      />

                      {decryptError && (
                        <p className="text-xs font-mono text-red-400">{decryptError}</p>
                      )}

                      <button
                        onClick={() => {
                          const note = secretNotesList.find((i) => i.id === decryptingId);
                          if (note) handleDecryptNote(note);
                        }}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-cyber-rose text-black font-bold text-xs shadow-md"
                      >
                        Unlock Note
                      </button>
                    </div>
                  )}

                </div>
              </div>
            )}

          </div>
        )}

        {/* ================= TAB 3: DEVICE RADAR & QR ================= */}
        {activeTab === 'radar' && (
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            
            {/* Left: Device Discovery Radar */}
            <div className="rounded-3xl p-6 sm:p-8 bg-surface-100 border border-border-medium shadow-card flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-border-subtle">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-cyber-blue/10 border border-cyber-blue/30 flex items-center justify-center text-cyber-blue">
                      <Wifi className="w-4 h-4" />
                    </div>
                    <h3 className="font-display font-bold text-lg text-white">Local Wi-Fi Radar</h3>
                  </div>
                  <span className="text-xs font-mono text-accent bg-accent/10 px-2.5 py-0.5 rounded-full border border-accent/20">
                    Auto-Discovering
                  </span>
                </div>

                {/* Animated Radar Circle */}
                <div className="relative w-40 h-40 mx-auto rounded-full bg-surface-200 border border-border-medium flex items-center justify-center mb-6">
                  <div className="absolute inset-0 rounded-full border border-accent/30 animate-ping opacity-25" />
                  <div className="w-24 h-24 rounded-full bg-surface-300 border border-border-subtle flex items-center justify-center">
                    <Laptop className="w-8 h-8 text-accent" />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl bg-surface-200 border border-accent/30 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2 text-white font-medium">
                      <Laptop className="w-4 h-4 text-accent" />
                      <span>This Device ({peerSync.getDevice().name})</span>
                    </div>
                    <span className="text-accent font-semibold">Host (Active)</span>
                  </div>

                  {peers.map((peer) => (
                    <div
                      key={peer.id}
                      className="p-3 rounded-xl bg-surface-200 border border-border-subtle flex items-center justify-between text-xs font-mono"
                    >
                      <div className="flex items-center gap-2 text-zinc-300">
                        {peer.type === 'mobile' && <Smartphone className="w-4 h-4 text-cyber-blue" />}
                        {peer.type === 'tablet' && <Tablet className="w-4 h-4 text-cyber-purple" />}
                        {peer.type === 'desktop' && <Laptop className="w-4 h-4 text-accent" />}
                        <span>{peer.name}</span>
                      </div>
                      <span className="text-emerald-400 text-[11px]">Online</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-border-subtle text-xs font-mono text-zinc-500">
                Opening Simple.Savr on another browser tab or phone on the same Wi-Fi instantly registers here.
              </div>
            </div>

            {/* Right: QR Code & Direct Pairing */}
            <div className="rounded-3xl p-6 sm:p-8 bg-surface-100 border border-border-medium shadow-card text-center flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-border-subtle">
                  <h3 className="font-display font-bold text-lg text-white">Instant QR Link</h3>
                  <span className="text-xs font-mono text-zinc-400">Scan to Pair</span>
                </div>

                <div className="p-4 bg-white rounded-2xl inline-block shadow-xl mb-4">
                  <svg className="w-44 h-44" viewBox="0 0 100 100" fill="none">
                    <rect x="10" y="10" width="26" height="26" rx="4" fill="black" />
                    <rect x="15" y="15" width="16" height="16" rx="2" fill="white" />
                    <rect x="19" y="19" width="8" height="8" fill="black" />

                    <rect x="64" y="10" width="26" height="26" rx="4" fill="black" />
                    <rect x="69" y="15" width="16" height="16" rx="2" fill="white" />
                    <rect x="73" y="19" width="8" height="8" fill="black" />

                    <rect x="10" y="64" width="26" height="26" rx="4" fill="black" />
                    <rect x="15" y="69" width="16" height="16" rx="2" fill="white" />
                    <rect x="19" y="73" width="8" height="8" fill="black" />

                    <rect x="42" y="14" width="6" height="6" fill="black" />
                    <rect x="50" y="24" width="6" height="6" fill="black" />
                    <rect x="42" y="34" width="8" height="8" fill="black" />
                    <rect x="24" y="44" width="6" height="6" fill="black" />
                    <rect x="36" y="50" width="12" height="6" fill="black" />
                    <rect x="54" y="44" width="6" height="14" fill="black" />
                    <rect x="66" y="42" width="12" height="6" fill="black" />
                    <rect x="80" y="54" width="8" height="8" fill="black" />
                    <rect x="44" y="68" width="8" height="8" fill="black" />
                    <rect x="58" y="74" width="14" height="6" fill="black" />
                    <rect x="78" y="68" width="10" height="10" fill="black" />
                  </svg>
                </div>

                <p className="text-xs font-mono text-zinc-400 max-w-xs mx-auto">
                  Scan this QR code using your iOS Camera or Android Lens to instantly open this shared workspace on your phone.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-surface-200 border border-border-subtle flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-400">Pairing Code:</span>
                <span className="font-bold text-white text-sm tracking-wider">SAVR-9842</span>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* ================= COMMAND PALETTE (Cmd+K) MODAL ================= */}
      {showCmdK && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-3xl bg-surface-100 border border-border-medium p-4 shadow-2xl space-y-3">
            <div className="flex items-center gap-3 px-3 py-2 border-b border-border-subtle">
              <Command className="w-4 h-4 text-accent" />
              <input
                type="text"
                autoFocus
                placeholder="Type a command or action (e.g. share, secret, radar, clear)..."
                className="w-full bg-transparent text-sm font-mono text-white placeholder-zinc-500 focus:outline-none"
              />
              <span className="text-[10px] font-mono text-zinc-500 bg-surface-200 px-2 py-0.5 rounded">ESC</span>
            </div>

            <div className="space-y-1 text-xs font-mono">
              <button
                onClick={() => {
                  setActiveTab('shared');
                  setShowCmdK(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-surface-200 text-zinc-300 hover:text-white transition-colors text-left"
              >
                <span className="flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-accent" />
                  Go to Shared Space
                </span>
                <span className="text-zinc-500">1</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('secret');
                  setShowCmdK(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-surface-200 text-zinc-300 hover:text-white transition-colors text-left"
              >
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-cyber-rose" />
                  Create Secret Note
                </span>
                <span className="text-zinc-500">2</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('radar');
                  setShowCmdK(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-surface-200 text-zinc-300 hover:text-white transition-colors text-left"
              >
                <span className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-cyber-blue" />
                  Open Device Radar & QR
                </span>
                <span className="text-zinc-500">3</span>
              </button>

              <button
                onClick={() => {
                  const m = sounds.toggleMute();
                  setIsMuted(m);
                  setShowCmdK(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-surface-200 text-zinc-300 hover:text-white transition-colors text-left"
              >
                <span className="flex items-center gap-2">
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-accent" />}
                  Toggle Sound Effects
                </span>
                <span className="text-zinc-500">M</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
