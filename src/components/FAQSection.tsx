import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Search, Sparkles } from 'lucide-react';
import { sounds } from '../services/audio';

export const FAQSection: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does Simple.Savr work?',
      a: 'Simple.Savr operates directly inside your web browser. When multiple devices open Simple.Savr on the same local Wi-Fi, they discover each other via browser-supported local peer channels (or WebRTC DataChannels). Content you type or drop is beamed across your local router without traveling through an external server.',
    },
    {
      q: 'Do I need an account?',
      a: 'No. There is no sign-up, email requirement, or password. You open the website, and you are immediately ready to share.',
    },
    {
      q: 'Does it work on iPhone?',
      a: 'Yes, seamlessly. Open Safari or Chrome on your iPhone, and you can instantly copy text or beam photos to/from your Mac, Windows PC, or iPad.',
    },
    {
      q: 'Does it work on Android?',
      a: 'Yes. Any modern Android browser (Chrome, Samsung Internet, Firefox) works instantly with zero configuration.',
    },
    {
      q: 'Can I transfer files?',
      a: 'Yes. You can drag and drop photos, documents, PDFs, videos, and archives. Transfers move at full Wi-Fi network throughput without arbitrary cloud upload limits.',
    },
    {
      q: 'Does it work without Wi-Fi?',
      a: 'If your devices are on the same mobile hotspot (e.g. sharing your phone’s personal hotspot with your laptop), it works identically without needing external internet access.',
    },
    {
      q: 'Can I use it across different networks?',
      a: 'Yes. If devices are on different networks (e.g. 5G on phone and office Wi-Fi on laptop), use the 6-digit Room Code or QR Code feature to establish an end-to-end encrypted WebRTC channel.',
    },
    {
      q: 'Are my files stored anywhere on the internet?',
      a: 'No. Local network sharing is peer-to-peer and streams directly between device memory. Data is never written to remote persistent disks.',
    },
    {
      q: 'How does Secret Note work?',
      a: 'Secret Notes are encrypted client-side using the Web Crypto API with 256-bit AES-GCM before transmission. Once opened on the receiving device, a burn-after-reading timer zeros the memory, leaving no residual plaintext.',
    },
    {
      q: 'Is Simple.Savr free?',
      a: 'Yes, Simple.Savr is completely free and open for personal and professional cross-device sharing.',
    },
  ];

  const filteredFaqs = faqs.filter(
    (item) =>
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFaq = (index: number) => {
    sounds.playClick();
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 relative overflow-hidden bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-14">
          <span className="text-xs font-mono font-semibold tracking-widest text-accent uppercase bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
            Frequently Asked Questions
          </span>
          <h2 className="mt-4 font-display text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Everything you need <span className="text-gradient-accent">to know.</span>
          </h2>
          <p className="mt-3 text-base text-zinc-400">
            Clear technical details on how Simple.Savr operates.
          </p>

          {/* Quick Search Input */}
          <div className="mt-8 max-w-md mx-auto relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions (e.g., iPhone, Wi-Fi, encryption)..."
              className="w-full bg-surface-100 text-white placeholder-zinc-500 text-xs font-mono pl-11 pr-4 py-3 rounded-2xl border border-border-medium focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
            />
          </div>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.q}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-surface-100 border-accent/30 shadow-sm'
                    : 'bg-surface-100/50 hover:bg-surface-100 border-border-subtle'
                }`}
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 focus:outline-none"
                >
                  <span className="font-display font-bold text-base sm:text-lg text-white">
                    {faq.q}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-xl bg-surface-200 border border-border-subtle flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-accent border-accent/30' : 'text-zinc-400'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-sm text-zinc-400 leading-relaxed font-light border-t border-border-subtle/40 animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}

          {filteredFaqs.length === 0 && (
            <div className="py-12 text-center text-zinc-500 text-xs font-mono">
              No matching questions found for "{searchQuery}".
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
