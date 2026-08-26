import React from 'react';

export const FooterMinimal: React.FC = () => {
  return (
    <footer className="w-full max-w-xl mx-auto px-4 sm:px-0 py-8 text-center border-t border-border-subtle mt-12 text-xs text-primary-subtle font-normal space-y-1.5">
      <p className="text-primary-muted">Simple.Savr — Move anything between your devices.</p>
      <p className="text-[11px]">No account. No app. No cable.</p>
    </footer>
  );
};
