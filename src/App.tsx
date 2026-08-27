import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { HeaderMinimal } from './components/HeaderMinimal';
import { Composer } from './components/Composer';
import { RecentFeed } from './components/RecentFeed';
import { InfoSection } from './components/InfoSection';
import { InfoModalTab } from './components/InfoModal';
import { peerSync, SharedItem, PeerInfo } from './services/peerSync';

// Lazy load secondary modals for sub-50ms instant initial page load
const DeviceSheet = lazy(() => import('./components/DeviceSheet').then((m) => ({ default: m.DeviceSheet })));
const QRConnectModal = lazy(() => import('./components/QRConnectModal').then((m) => ({ default: m.QRConnectModal })));
const MenuModal = lazy(() => import('./components/MenuModal').then((m) => ({ default: m.MenuModal })));
const SecretNoteModal = lazy(() => import('./components/SecretNoteModal').then((m) => ({ default: m.SecretNoteModal })));
const InfoModal = lazy(() => import('./components/InfoModal').then((m) => ({ default: m.InfoModal })));
const NotFound = lazy(() => import('./components/NotFound').then((m) => ({ default: m.NotFound })));

export const App: React.FC = () => {
  const [items, setItems] = useState<SharedItem[]>([]);
  const [peers, setPeers] = useState<PeerInfo[]>([]);
  const [is404, setIs404] = useState(false);

  // Sheets & Modals state
  const [isDeviceSheetOpen, setIsDeviceSheetOpen] = useState(false);
  const [isQROpen, setIsQROpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSecretNoteOpen, setIsSecretNoteOpen] = useState(false);
  const [infoModalTab, setInfoModalTab] = useState<InfoModalTab | null>(null);

  useEffect(() => {
    // Check initial pathname for clean directory routes
    if (typeof window !== 'undefined') {
      const rawPath = window.location.pathname.toLowerCase().replace(/\/index\.html$/, '').replace(/\/$/, '');
      
      if (rawPath === '' || rawPath === '/') {
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get('tab') as InfoModalTab;
        if (tabParam && ['about', 'privacy', 'terms', 'faq', 'contact'].includes(tabParam)) {
          setInfoModalTab(tabParam);
        }
      } else if (rawPath === '/faq') {
        setInfoModalTab('faq');
      } else if (rawPath === '/privacy') {
        setInfoModalTab('privacy');
      } else if (rawPath === '/terms') {
        setInfoModalTab('terms');
      } else if (rawPath === '/contact') {
        setInfoModalTab('contact');
      } else if (rawPath === '/how-it-works' || rawPath === '/about') {
        setInfoModalTab('about');
      } else {
        setIs404(true);
      }
    }

    const unsubscribe = peerSync.subscribe((newItems, newPeers) => {
      setItems(newItems);
      setPeers(newPeers);
    });
    return unsubscribe;
  }, []);

  const handleOpenInfo = useCallback((tab: InfoModalTab) => {
    if (typeof window !== 'undefined' && window.history) {
      const route = tab === 'about' ? '/how-it-works/' : `/${tab}/`;
      window.history.pushState({}, '', route);
    }
    setInfoModalTab(tab);
  }, []);

  const handleCloseInfo = useCallback(() => {
    if (typeof window !== 'undefined' && window.history) {
      const params = new URLSearchParams(window.location.search);
      const room = params.get('room');
      const rootUrl = room ? `/?room=${room}` : '/';
      window.history.pushState({}, '', rootUrl);
    }
    setInfoModalTab(null);
  }, []);

  const handleGoHome = useCallback(() => {
    if (typeof window !== 'undefined' && window.history) {
      window.history.pushState({}, '', '/');
    }
    setIs404(false);
  }, []);

  if (is404) {
    return (
      <Suspense fallback={null}>
        <NotFound onGoHome={handleGoHome} />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col font-sans selection:bg-[#FF5B37]/15 selection:text-[#FF5B37] antialiased transition-colors relative overflow-x-hidden">
      {/* Ambient Radial Lighting Glow (Smooth hardware-accelerated background) */}
      <div className="ambient-glow-top" />

      {/* 1. Header: Floating Pill Navigation */}
      <HeaderMinimal
        peerCount={peers.length}
        onOpenDevices={() => setIsDeviceSheetOpen(true)}
        onOpenMenu={() => setIsMenuOpen(true)}
        onOpenInfo={handleOpenInfo}
      />

      {/* 2. Main Sharing Tool (Composer + Clean Activity Feed) */}
      <main className="flex-1 w-full flex flex-col relative z-10">
        <Composer
          onOpenDevices={() => setIsDeviceSheetOpen(true)}
          peerCount={peers.length}
        />

        <RecentFeed items={items} />

        <InfoSection onOpenInfo={handleOpenInfo} />
      </main>

      {/* MODALS & BOTTOM SHEETS (Loaded on-demand with zero initial bundle overhead) */}
      <Suspense fallback={null}>
        {isDeviceSheetOpen && (
          <DeviceSheet
            isOpen={isDeviceSheetOpen}
            onClose={() => setIsDeviceSheetOpen(false)}
            onOpenQR={() => setIsQROpen(true)}
            peers={peers}
          />
        )}

        {isQROpen && (
          <QRConnectModal
            isOpen={isQROpen}
            onClose={() => setIsQROpen(false)}
          />
        )}

        {isMenuOpen && (
          <MenuModal
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            onOpenSecretNote={() => setIsSecretNoteOpen(true)}
            onOpenInfo={handleOpenInfo}
          />
        )}

        {isSecretNoteOpen && (
          <SecretNoteModal
            isOpen={isSecretNoteOpen}
            onClose={() => setIsSecretNoteOpen(false)}
          />
        )}

        {infoModalTab !== null && (
          <InfoModal
            isOpen={infoModalTab !== null}
            initialTab={infoModalTab || 'about'}
            onClose={handleCloseInfo}
          />
        )}
      </Suspense>
    </div>
  );
};

export default App;
