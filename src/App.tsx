import React, { useState, useEffect } from 'react';
import { HeaderMinimal } from './components/HeaderMinimal';
import { Composer } from './components/Composer';
import { RecentFeed } from './components/RecentFeed';
import { DeviceSheet } from './components/DeviceSheet';
import { QRConnectModal } from './components/QRConnectModal';
import { MenuModal } from './components/MenuModal';
import { SecretNoteModal } from './components/SecretNoteModal';
import { InfoModal, InfoModalTab } from './components/InfoModal';
import { InfoSection } from './components/InfoSection';
import { NotFound } from './components/NotFound';
import { peerSync, SharedItem, PeerInfo } from './services/peerSync';

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
        // Root page
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get('tab') as InfoModalTab;
        if (tabParam && ['about', 'privacy', 'terms', 'faq'].includes(tabParam)) {
          setInfoModalTab(tabParam);
        }
      } else if (rawPath === '/faq') {
        setInfoModalTab('faq');
      } else if (rawPath === '/privacy') {
        setInfoModalTab('privacy');
      } else if (rawPath === '/terms') {
        setInfoModalTab('terms');
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

  const handleOpenInfo = (tab: InfoModalTab) => {
    if (typeof window !== 'undefined' && window.history) {
      const route = tab === 'about' ? '/how-it-works/' : `/${tab}/`;
      window.history.pushState({}, '', route);
    }
    setInfoModalTab(tab);
  };

  const handleCloseInfo = () => {
    if (typeof window !== 'undefined' && window.history) {
      const params = new URLSearchParams(window.location.search);
      const room = params.get('room');
      const rootUrl = room ? `/?room=${room}` : '/';
      window.history.pushState({}, '', rootUrl);
    }
    setInfoModalTab(null);
  };

  const handleGoHome = () => {
    if (typeof window !== 'undefined' && window.history) {
      window.history.pushState({}, '', '/');
    }
    setIs404(false);
  };

  if (is404) {
    return <NotFound onGoHome={handleGoHome} />;
  }

  return (
    <div className="min-h-screen bg-background bg-graph-pattern text-text-primary flex flex-col font-sans selection:bg-accent-light selection:text-accent antialiased transition-colors">
      {/* 1. Header: QuickPair ● 1 device [Sun/Moon] ••• */}
      <HeaderMinimal
        peerCount={peers.length}
        onOpenDevices={() => setIsDeviceSheetOpen(true)}
        onOpenMenu={() => setIsMenuOpen(true)}
      />

      {/* 2. Main Sharing Tool (Focused Utility) */}
      <main className="flex-1 w-full flex flex-col">
        {/* Compose Box */}
        <Composer
          onOpenDevices={() => setIsDeviceSheetOpen(true)}
          peerCount={peers.length}
        />

        {/* Recent Activity Feed */}
        <RecentFeed items={items} />

        {/* Minimal Footer with Quick Links */}
        <InfoSection onOpenInfo={handleOpenInfo} />
      </main>

      {/* MODALS & BOTTOM SHEETS */}
      <DeviceSheet
        isOpen={isDeviceSheetOpen}
        onClose={() => setIsDeviceSheetOpen(false)}
        onOpenQR={() => setIsQROpen(true)}
        peers={peers}
      />

      <QRConnectModal
        isOpen={isQROpen}
        onClose={() => setIsQROpen(false)}
      />

      <MenuModal
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onOpenSecretNote={() => setIsSecretNoteOpen(true)}
        onOpenInfo={handleOpenInfo}
      />

      <SecretNoteModal
        isOpen={isSecretNoteOpen}
        onClose={() => setIsSecretNoteOpen(false)}
      />

      <InfoModal
        isOpen={infoModalTab !== null}
        initialTab={infoModalTab || 'about'}
        onClose={handleCloseInfo}
      />
    </div>
  );
};

export default App;
