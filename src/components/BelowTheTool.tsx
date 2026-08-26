import React, { useState } from 'react';
import {
  FileText,
  Link as LinkIcon,
  HardDrive,
  UserX,
  Globe2,
  Cable,
  Laptop,
  Smartphone,
  Tablet,
  ArrowRight,
  ChevronDown,
  ShieldCheck,
} from 'lucide-react';
import { sounds } from '../services/audio';

export const BelowTheTool: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    sounds.playClick();
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: 'How does Simple.Savr work?',
      a: 'Simple.Savr connects devices on the same Wi-Fi network directly through the browser. Data travels locally from device to device without routing through external cloud servers.',
    },
    {
      q: 'Do I need an account or an app?',
      a: 'No. There is no account, login, or installation. Open the website on your devices and you can start sharing immediately.',
    },
    {
      q: 'Does it work across iOS, Android, Mac and Windows?',
      a: 'Yes. It works in any modern mobile or desktop browser (Safari, Chrome, Firefox, Edge, Arc).',
    },
    {
      q: 'Are my files stored anywhere on the internet?',
      a: 'No. Local network sharing is peer-to-peer in temporary browser memory. When you close the page, nothing remains stored on any server.',
    },
    {
      q: 'Can I use it if my devices are on different networks?',
      a: 'Yes. You can scan the pairing QR code or use a temporary room code to establish an end-to-end encrypted connection.',
    },
  ];

  return (
    <div className="w-full max-w-xl mx-auto px-4 sm:px-0 py-12 sm:py-16 space-y-16 sm:space-y-20 border-t border-border mt-8">
      
      {/* SECTION 1: Move stuff between devices */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-primary">
          Move stuff between devices.
        </h2>

        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          <div className="p-3 sm:p-4 rounded-xl bg-surface border border-border flex flex-col gap-1 text-left">
            <span className="text-xs font-semibold text-primary">Text</span>
            <p className="text-[11px] sm:text-xs text-primary-muted font-normal leading-relaxed">
              Notes, codes, addresses, snippets.
            </p>
          </div>

          <div className="p-3 sm:p-4 rounded-xl bg-surface border border-border flex flex-col gap-1 text-left">
            <span className="text-xs font-semibold text-primary">Links</span>
            <p className="text-[11px] sm:text-xs text-primary-muted font-normal leading-relaxed">
              Instant URLs ready to tap on mobile.
            </p>
          </div>

          <div className="p-3 sm:p-4 rounded-xl bg-surface border border-border flex flex-col gap-1 text-left">
            <span className="text-xs font-semibold text-primary">Files</span>
            <p className="text-[11px] sm:text-xs text-primary-muted font-normal leading-relaxed">
              Photos, PDFs, docs over Wi-Fi.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2: No app. No account. No cable. */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-primary">
          No app. No account. No cable.
        </h2>

        <div className="space-y-2 text-xs sm:text-sm text-primary-muted font-normal pt-1">
          <div className="flex items-center gap-2.5">
            <UserX className="w-4 h-4 text-primary flex-shrink-0" />
            <span>Open the website and start sharing immediately.</span>
          </div>

          <div className="flex items-center gap-2.5">
            <Globe2 className="w-4 h-4 text-primary flex-shrink-0" />
            <span>Works natively inside your browser on any platform.</span>
          </div>

          <div className="flex items-center gap-2.5">
            <Cable className="w-4 h-4 text-primary flex-shrink-0" />
            <span>Transfers wirelessly over local Wi-Fi without cables.</span>
          </div>
        </div>
      </section>

      {/* SECTION 3: Built for quick transfers */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-primary">
          Built for quick transfers.
        </h2>

        <div className="space-y-2">
          <div className="p-3 rounded-xl bg-surface border border-border flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-primary font-medium">
              <Laptop className="w-4 h-4 text-primary-muted" />
              <span>Laptop</span>
              <ArrowRight className="w-3.5 h-3.5 text-primary-muted" />
              <Smartphone className="w-4 h-4 text-primary-muted" />
              <span>Phone</span>
            </div>
            <span className="text-xs text-primary-muted">Send links & phone numbers</span>
          </div>

          <div className="p-3 rounded-xl bg-surface border border-border flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-primary font-medium">
              <Smartphone className="w-4 h-4 text-primary-muted" />
              <span>Phone</span>
              <ArrowRight className="w-3.5 h-3.5 text-primary-muted" />
              <Laptop className="w-4 h-4 text-primary-muted" />
              <span>Laptop</span>
            </div>
            <span className="text-xs text-primary-muted">Move photos & receipts</span>
          </div>

          <div className="p-3 rounded-xl bg-surface border border-border flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-primary font-medium">
              <Tablet className="w-4 h-4 text-primary-muted" />
              <span>Tablet</span>
              <ArrowRight className="w-3.5 h-3.5 text-primary-muted" />
              <Laptop className="w-4 h-4 text-primary-muted" />
              <span>Laptop</span>
            </div>
            <span className="text-xs text-primary-muted">Share sketches & PDFs</span>
          </div>
        </div>
      </section>

      {/* SECTION 4: Privacy */}
      <section className="space-y-3 p-5 rounded-2xl bg-surface border border-border">
        <div className="flex items-center gap-2 text-xs font-semibold text-primary">
          <ShieldCheck className="w-4 h-4 text-accent" />
          <span>Local by design</span>
        </div>
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-primary">
          Your files shouldn't need a tour of the internet.
        </h2>
        <p className="text-xs sm:text-sm text-primary-muted font-normal leading-relaxed">
          Simple.Savr transfers your items directly between device memory over your local Wi-Fi router. No external cloud servers store your data, and nothing remains saved once you close the tab.
        </p>
      </section>

      {/* SECTION 5: FAQ Accordion */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-primary">
          Frequently asked questions
        </h2>

        <div className="space-y-2">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={faq.q}
                className="rounded-xl bg-surface border border-border overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-medium text-primary"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-primary-muted transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-primary' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 text-xs sm:text-sm text-primary-muted font-normal leading-relaxed border-t border-border-subtle pt-2.5 animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};
