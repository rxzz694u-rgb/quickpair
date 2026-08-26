import React, { useState, useEffect } from 'react';
import { Wifi, Volume2, VolumeX, ArrowRight, Menu, X, Shield, Sparkles, Monitor, Smartphone, Terminal } from 'lucide-react';
import { sounds } from '../services/audio';
import { peerSync, PeerInfo } from '../services/peerSync';

interface NavbarProps {
  onOpenApp: () => void;
  isAppOpen: boolean;
  onToggleApp: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenApp, isAppOpen, onToggleApp }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(sounds.getIsMuted());
  const [peers, setPeers] = useState<PeerInfo[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const unsubscribe = peerSync.subscribe((_, peerList) => {
      setPeers(peerList);
    });
    return unsubscribe;
  }, []);

  const toggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
    if (!muted) sounds.playClick();
  };

  const navLinks = [
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Clipboard', href: '#clipboard' },
    { label: 'File transfer', href: '#files' },
    { label: 'Secret notes', href: '#secret-notes' },
    { label: 'Privacy', href: '#privacy' },
    { label: 'FAQ', href: '#faq' },
  ];

  const handleNavClick = (href: string) => {
    sounds.playClick();
    setMobileMenuOpen(false);
    if (isAppOpen) {
      onToggleApp();
      setTimeout(() => {
        const el = document.querySelector(href);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.querySelector(href);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-background/80 backdrop-blur-xl border-b border-border-subtle py-3 shadow-glass'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Wordmark & Logo */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (isAppOpen) onToggleApp();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-3 group focus:outline-none"
          >
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-surface-100 border border-border-medium group-hover:border-accent/40 transition-all duration-300 shadow-sm overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              {/* Refined Signal / Arc Logo Icon */}
              <svg className="w-5 h-5 text-accent relative z-10 transition-transform group-hover:scale-110 duration-300" viewBox="0 0 24 24" fill="none">
                <path d="M4 8C8.41828 3.58172 15.5817 3.58172 20 8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M7 12C9.76142 9.23858 14.2386 9.23858 17 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeOpacity="0.75" />
                <circle cx="12" cy="17" r="2.2" fill="currentColor" />
              </svg>
            </div>
            
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                Simple<span className="text-accent">.</span>Savr
                <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 hidden sm:inline-block">
                  2026
                </span>
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          {!isAppOpen && (
            <nav className="hidden md:flex items-center gap-1 bg-surface-200/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-border-subtle shadow-inner">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link.href);
                  }}
                  className="px-3.5 py-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors duration-200 rounded-full hover:bg-white/5"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          )}

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            {/* Live Peer Status Pill */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-surface-100/90 border border-border-subtle text-xs font-mono text-zinc-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              <span>
                {peers.length > 0 ? `${peers.length + 1} devices active` : 'Local Wi-Fi mesh ready'}
              </span>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              title={isMuted ? 'Unmute sound effects' : 'Mute sound effects'}
              className="p-2 rounded-xl bg-surface-100 hover:bg-surface-50 text-zinc-400 hover:text-white border border-border-subtle transition-all duration-200"
              aria-label="Toggle sound"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-accent" />}
            </button>

            {/* Primary Action Button */}
            <button
              onClick={() => {
                sounds.playPop();
                onToggleApp();
              }}
              className={`relative group inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300 ${
                isAppOpen
                  ? 'bg-surface-50 text-zinc-300 border border-border-medium hover:text-white'
                  : 'bg-accent hover:bg-accent-400 text-black shadow-glow-accent hover:shadow-glow-accent-lg'
              }`}
            >
              <span>{isAppOpen ? 'Back to Overview' : 'Open Simple.Savr'}</span>
              <ArrowRight className={`w-3.5 h-3.5 transition-transform duration-200 ${isAppOpen ? 'rotate-180' : 'group-hover:translate-x-0.5'}`} />
            </button>

            {/* Mobile Hamburger Menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-surface-100 text-zinc-400 hover:text-white border border-border-subtle"
              aria-label="Open mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 p-4 rounded-2xl bg-surface-100/95 backdrop-blur-2xl border border-border-medium shadow-2xl flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2 pb-3 mb-2 border-b border-border-subtle text-xs font-mono text-zinc-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              <span>Local Wi-Fi Mesh Active</span>
            </div>

            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className="px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-surface-50 transition-colors"
              >
                {link.label}
              </a>
            ))}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onToggleApp();
              }}
              className="mt-2 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-accent text-black font-semibold text-sm shadow-glow-accent"
            >
              <span>{isAppOpen ? 'Back to Overview' : 'Launch Full Web App'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
