import React, { useState } from 'react';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  FileCode,
  Download,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  RefreshCw,
  HardDrive,
  Wifi,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { sounds } from '../services/audio';

interface TransferFile {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'image' | 'presentation';
  status: 'idle' | 'transferring' | 'ready';
  progress: number;
}

export const FileTransferSection: React.FC = () => {
  const [files, setFiles] = useState<TransferFile[]>([
    {
      id: 'f1',
      name: 'design-final.pdf',
      size: '14.2 MB',
      type: 'pdf',
      status: 'ready',
      progress: 100,
    },
    {
      id: 'f2',
      name: 'IMG_4821.jpg',
      size: '4.8 MB',
      type: 'image',
      status: 'ready',
      progress: 100,
    },
    {
      id: 'f3',
      name: 'presentation.pptx',
      size: '28.4 MB',
      type: 'presentation',
      status: 'ready',
      progress: 100,
    },
  ]);

  const [activeStepFlow, setActiveStepFlow] = useState<'upload' | 'transfer' | 'download'>('transfer');

  const triggerTransferDemo = (fileId: string) => {
    sounds.playPop();
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, status: 'transferring', progress: 15 } : f))
    );

    let currentProg = 15;
    const interval = setInterval(() => {
      currentProg += 25;
      if (currentProg >= 100) {
        clearInterval(interval);
        sounds.playSuccess();
        setFiles((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, status: 'ready', progress: 100 } : f))
        );
      } else {
        setFiles((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, progress: currentProg } : f))
        );
      }
    }, 200);
  };

  const handleDownloadDemo = (fileName: string) => {
    sounds.playSuccess();
    const blob = new Blob([`Mock transfer of ${fileName} via Simple.Savr`], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <section id="files" className="py-24 relative bg-surface-200/50 border-y border-border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-semibold tracking-widest text-accent uppercase bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
            Local High-Speed Transfer
          </span>
          <h2 className="mt-4 font-display text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Send files without the <br className="hidden sm:inline" />
            <span className="text-gradient-accent">cable drama.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-400">
            Photos, PDFs, videos, documents — send them directly between devices over Wi-Fi at local network speed.
          </p>
        </div>

        {/* 3-Stage Visual Pipeline: Upload -> Transfer -> Download */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mb-12 font-mono text-xs text-zinc-400">
          <div
            onClick={() => setActiveStepFlow('upload')}
            className={`cursor-pointer px-4 py-2 rounded-xl border flex items-center gap-2 transition-all ${
              activeStepFlow === 'upload'
                ? 'bg-accent/15 border-accent text-accent font-semibold'
                : 'bg-surface-100 border-border-subtle hover:text-white'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-surface-200 flex items-center justify-center text-[10px]">1</span>
            <span>Upload</span>
          </div>

          <ArrowRight className="w-4 h-4 text-zinc-600 hidden sm:inline" />

          <div
            onClick={() => setActiveStepFlow('transfer')}
            className={`cursor-pointer px-4 py-2 rounded-xl border flex items-center gap-2 transition-all ${
              activeStepFlow === 'transfer'
                ? 'bg-accent/15 border-accent text-accent font-semibold'
                : 'bg-surface-100 border-border-subtle hover:text-white'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-surface-200 flex items-center justify-center text-[10px]">2</span>
            <span>Transfer (P2P Wi-Fi)</span>
          </div>

          <ArrowRight className="w-4 h-4 text-zinc-600 hidden sm:inline" />

          <div
            onClick={() => setActiveStepFlow('download')}
            className={`cursor-pointer px-4 py-2 rounded-xl border flex items-center gap-2 transition-all ${
              activeStepFlow === 'download'
                ? 'bg-accent/15 border-accent text-accent font-semibold'
                : 'bg-surface-100 border-border-subtle hover:text-white'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-surface-200 flex items-center justify-center text-[10px]">3</span>
            <span>Download</span>
          </div>
        </div>

        {/* Main Drag-and-Drop / File Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left: Drag & Drop Dropzone Simulation */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-3xl p-8 bg-surface-100 border border-dashed border-border-medium hover:border-accent/50 transition-all text-center relative group">
            <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none" />

            <div className="space-y-4 my-auto py-6">
              <div className="w-16 h-16 rounded-2xl bg-surface-200 border border-border-medium flex items-center justify-center mx-auto text-accent group-hover:scale-110 transition-transform">
                <UploadCloud className="w-8 h-8" />
              </div>
              <h3 className="font-display font-bold text-xl text-white">
                Drop files here
              </h3>
              <p className="text-xs font-mono text-zinc-400 max-w-xs mx-auto">
                Drag any photo, video, PDF, or folder into this window to transfer it across your network.
              </p>
              <div className="inline-flex items-center gap-2 text-[11px] font-mono text-accent bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
                <Zap className="w-3.5 h-3.5" /> Direct RAM streaming · Up to 2GB/file
              </div>
            </div>

            <div className="pt-4 border-t border-border-subtle/80 flex items-center justify-between text-xs font-mono text-zinc-500">
              <span>Local Wi-Fi speed (~65 MB/s)</span>
              <span className="text-zinc-300">0 Cloud Storage</span>
            </div>
          </div>

          {/* Right: Active Files List with Status & Download */}
          <div className="lg:col-span-7 flex flex-col justify-between rounded-3xl p-6 sm:p-8 bg-surface-100 border border-border-medium shadow-card space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-300">
                <HardDrive className="w-4 h-4 text-accent" />
                <span>Available on your other device</span>
              </div>
              <span className="text-xs font-mono text-accent bg-accent/10 px-2.5 py-1 rounded-full border border-accent/20">
                3 Files Ready
              </span>
            </div>

            {/* File items */}
            <div className="space-y-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="p-4 rounded-2xl bg-surface-200 border border-border-subtle hover:border-border-medium transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-surface-100 border border-border-subtle flex items-center justify-center flex-shrink-0">
                      {file.type === 'pdf' && <FileText className="w-5 h-5 text-red-400" />}
                      {file.type === 'image' && <ImageIcon className="w-5 h-5 text-blue-400" />}
                      {file.type === 'presentation' && <FileCode className="w-5 h-5 text-amber-400" />}
                    </div>

                    <div>
                      <h4 className="text-sm font-mono font-medium text-white">{file.name}</h4>
                      <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 mt-0.5">
                        <span>{file.size}</span>
                        <span>·</span>
                        {file.status === 'transferring' ? (
                          <span className="text-accent flex items-center gap-1">
                            <RefreshCw className="w-3 h-3 animate-spin" /> Transferring {file.progress}%
                          </span>
                        ) : (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Ready on Phone
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => triggerTransferDemo(file.id)}
                      className="px-3 py-1.5 rounded-xl bg-surface-100 hover:bg-surface-50 text-xs font-mono text-zinc-300 hover:text-white border border-border-subtle transition-colors"
                      title="Simulate re-transfer"
                    >
                      Re-send
                    </button>
                    <button
                      onClick={() => handleDownloadDemo(file.name)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-accent hover:bg-accent-400 text-black text-xs font-mono font-semibold shadow-glow-accent transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom info footer */}
            <div className="pt-3 border-t border-border-subtle/80 flex items-center justify-between text-xs font-mono text-zinc-500">
              <span className="flex items-center gap-1 text-zinc-400">
                <ShieldCheck className="w-3.5 h-3.5 text-accent" /> No file leaves your local network
              </span>
              <span className="text-zinc-500">Automatic byte streaming</span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
