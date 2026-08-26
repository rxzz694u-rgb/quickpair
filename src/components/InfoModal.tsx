import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronDown,
  ShieldCheck,
  UserX,
  Globe2,
  Cable,
  Info,
  HardDriveDownload,
  Cpu,
  KeyRound,
  FileCheck,
  Clock,
  Lock,
} from 'lucide-react';
import { sounds } from '../services/audio';

export type InfoModalTab = 'about' | 'privacy' | 'terms' | 'faq';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: InfoModalTab;
}

export const InfoModal: React.FC<InfoModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'about',
}) => {
  const [activeTab, setActiveTab] = useState<InfoModalTab>(initialTab);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const toggleFaq = (idx: number) => {
    sounds.playClick();
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const faqs = [
    {
      q: 'How does End-to-End Encryption (E2EE) work?',
      a: 'Every room uses client-side AES-GCM 256-bit cryptography derived with PBKDF2 (100,000 rounds). All text, links, code, and files are encrypted in your browser before broadcast and decrypted only on authorized peer devices.',
    },
    {
      q: 'How does 5-day auto-expiration work?',
      a: 'All shared items, cached files, images, and temporary folders have a strict 5-day time-to-live (120 hours). Once 5 days pass from creation, they are permanently purged from all device memory and local storage.',
    },
    {
      q: 'How does QuickPair work across devices?',
      a: 'QuickPair connects devices on the same Wi-Fi network directly through the browser. Data moves locally in device memory without traveling through third-party servers.',
    },
    {
      q: 'How do I share if devices are on DIFFERENT Wi-Fi or mobile cellular (4G/5G)?',
      a: 'Tap the device status pill or open Connect Devices. Share the 4-digit Room Code or scan the dynamic QR code. Enter that code on your other device to connect instantly over encrypted WebRTC.',
    },
    {
      q: 'Do I need an account or an app?',
      a: 'No. Open the website or install it as a PWA ("Add to Home Screen") on your devices and you are immediately ready to share.',
    },
    {
      q: 'Are my files stored on cloud servers?',
      a: 'No. Sharing is peer-to-peer and encrypted. Closing a tab or reaching the 5-day expiration window completely destroys all data.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-[2px] animate-fade">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal / Bottom Sheet */}
      <div className="relative w-full max-w-lg bg-card rounded-t-[20px] sm:rounded-[16px] border-t sm:border border-border p-5 pb-8 sm:pb-6 shadow-sheet animate-sheet-up z-10 max-h-[88vh] flex flex-col">
        
        {/* Mobile handle */}
        <div className="w-10 h-1.5 bg-[#D8D8D8] dark:bg-[#38383E] rounded-full mx-auto sm:hidden mb-2" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border flex-shrink-0">
          {/* Segmented Tabs */}
          <div className="flex items-center gap-1 bg-subtle p-1 rounded-xl overflow-x-auto max-w-[85%]">
            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('about');
              }}
              className={`px-2.5 sm:px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'about'
                  ? 'bg-card text-text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              How it works
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('privacy');
              }}
              className={`px-2.5 sm:px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'privacy'
                  ? 'bg-card text-text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Privacy &amp; E2EE
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('terms');
              }}
              className={`px-2.5 sm:px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'terms'
                  ? 'bg-card text-text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Terms
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('faq');
              }}
              className={`px-2.5 sm:px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'faq'
                  ? 'bg-card text-text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              FAQ
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-text-secondary hover:text-text-primary transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Contents (Scrollable) */}
        <div className="overflow-y-auto pt-4 space-y-4 flex-1 pr-0.5">
          
          {/* 1. ABOUT / HOW IT WORKS */}
          {activeTab === 'about' && (
            <div className="space-y-4 animate-fade">
              <div>
                <h3 className="text-[18px] font-bold text-text-primary tracking-tight">
                  Move things. Not friction.
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary mt-1 leading-relaxed">
                  Send text, links, photos and files between your devices without cables, apps or accounts.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div className="p-3 rounded-xl bg-subtle border border-border flex items-center gap-2.5">
                  <UserX className="w-4 h-4 text-text-secondary flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-text-primary">No account</p>
                    <p className="text-[11px] text-text-secondary">Instant anonymous sharing</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-subtle border border-border flex items-center gap-2.5">
                  <Lock className="w-4 h-4 text-accent flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-text-primary">E2EE Built-in</p>
                    <p className="text-[11px] text-text-secondary">AES-GCM 256-bit</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-subtle border border-border flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-text-secondary flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-text-primary">5-Day Auto-Purge</p>
                    <p className="text-[11px] text-text-secondary">Zero permanent traces</p>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-subtle border border-border text-xs text-text-secondary space-y-1.5">
                <p className="font-semibold text-text-primary flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-accent" />
                  Two ways to connect
                </p>
                <p className="leading-relaxed">
                  • <strong>Same Wi-Fi</strong>: Open the website on both devices — they automatically discover each other.<br />
                  • <strong>Different Networks / 4G/5G</strong>: Share or enter your 4-digit Room Code to pair over encrypted WebRTC.
                </p>
              </div>
            </div>
          )}

          {/* 2. PRIVACY & E2EE */}
          {activeTab === 'privacy' && (
            <div className="space-y-3.5 animate-fade">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-accent" />
                <h3 className="text-[18px] font-bold text-text-primary tracking-tight">
                  Private by design &amp; E2EE
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                Your transfers are protected by client-side End-to-End Encryption and automatically expire after 5 days.
              </p>

              <div className="space-y-2 text-xs text-text-secondary">
                <div className="p-3 rounded-xl bg-subtle border border-border">
                  <div className="flex items-center gap-1.5 font-semibold text-text-primary mb-1">
                    <KeyRound className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                    <span>End-to-End Encryption (AES-GCM 256-Bit)</span>
                  </div>
                  <p>All transmitted text, code, files, and images are encrypted in your browser before leaving your device using 256-bit keys derived via PBKDF2.</p>
                </div>

                <div className="p-3 rounded-xl bg-subtle border border-border">
                  <div className="flex items-center gap-1.5 font-semibold text-text-primary mb-1">
                    <Clock className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                    <span>5-Day Auto-Expiring Sessions</span>
                  </div>
                  <p>All shared files, images, links, and text automatically expire after 5 days (120 hours). Once expired, they are completely wiped and cannot be recovered.</p>
                </div>

                <div className="p-3 rounded-xl bg-subtle border border-border">
                  <div className="flex items-center gap-1.5 font-semibold text-text-primary mb-1">
                    <HardDriveDownload className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                    <span>Zero External Storage</span>
                  </div>
                  <p>No files, clipboard content, or messages are ever uploaded to cloud servers or databases.</p>
                </div>

                <div className="p-3 rounded-xl bg-subtle border border-border">
                  <div className="flex items-center gap-1.5 font-semibold text-text-primary mb-1">
                    <Cpu className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                    <span>RAM Only &amp; Auto-Clear</span>
                  </div>
                  <p>All shared items live exclusively in browser memory. Closing the tab or room immediately purges all transient data.</p>
                </div>
              </div>
            </div>
          )}

          {/* 3. TERMS OF SERVICE */}
          {activeTab === 'terms' && (
            <div className="space-y-3.5 animate-fade">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-accent" />
                <h3 className="text-[18px] font-bold text-text-primary tracking-tight">
                  Terms of Service
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                QuickPair is designed as a lightweight, privacy-first peer-to-peer sharing utility. By using the service, you agree to these simple terms:
              </p>

              <div className="space-y-2 text-xs text-text-secondary">
                <div className="p-3 rounded-xl bg-subtle border border-border space-y-1">
                  <p className="font-semibold text-text-primary">1. Service Purpose & Scope</p>
                  <p className="leading-relaxed">
                    QuickPair is a client-side browser utility for transmitting data directly between your own devices. We do not store, host, inspect, or manage any transferred content.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-subtle border border-border space-y-1">
                  <p className="font-semibold text-text-primary">2. Lawful & Responsible Use</p>
                  <p className="leading-relaxed">
                    You agree to use QuickPair only for lawful purposes. You must not transfer malicious software, unauthorized copyrighted files, or illegal material.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-subtle border border-border space-y-1">
                  <p className="font-semibold text-text-primary">3. Auto-Purge & Ephemeral Architecture</p>
                  <p className="leading-relaxed">
                    All items automatically expire after 5 days. We do not maintain server-side backups or archives. Once deleted, data cannot be recovered.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-subtle border border-border space-y-1">
                  <p className="font-semibold text-text-primary">4. "As Is" Disclaimer</p>
                  <p className="leading-relaxed">
                    The tool is provided free of charge on an "as is" basis without warranties of uninterrupted availability.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 4. FAQ */}
          {activeTab === 'faq' && (
            <div className="space-y-2 animate-fade">
              <h3 className="text-[18px] font-bold text-text-primary tracking-tight pb-1">
                Frequently asked questions
              </h3>

              <div className="space-y-1.5">
                {faqs.map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div
                      key={faq.q}
                      className="rounded-xl bg-subtle border border-border overflow-hidden transition-colors"
                    >
                      <button
                        onClick={() => toggleFaq(idx)}
                        className="w-full p-3 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-medium text-text-primary min-h-[42px]"
                      >
                        <span className="pr-1 leading-snug">{faq.q}</span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 text-text-secondary flex-shrink-0 transition-transform duration-200 ${
                            isOpen ? 'rotate-180 text-text-primary' : ''
                          }`}
                        />
                      </button>

                      {isOpen && (
                        <div className="px-3 pb-3 text-xs text-text-secondary font-normal leading-relaxed border-t border-border-light pt-2 animate-fade">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
