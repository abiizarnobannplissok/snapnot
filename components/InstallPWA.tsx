import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPWA: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Check if user has dismissed the prompt before
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed) {
        setShowInstallPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallPrompt(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('✅ User accepted the install prompt');
    } else {
      console.log('❌ User dismissed the install prompt');
    }

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!showInstallPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-5 left-3 right-3 md:left-auto md:right-5 md:w-80 z-50 animate-scale-in">
      <div className="bg-white rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-3 border border-gray-100">
        <div className="flex items-start gap-2.5">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <Download className="w-5 h-5 text-black" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm mb-0.5">Install SnapNotes</h3>
            <p className="text-xs text-gray-600 mb-2.5">
              Install aplikasi untuk akses lebih cepat dan pengalaman lebih baik!
            </p>
            
            <div className="flex gap-1.5">
              <button
                onClick={handleInstallClick}
                className="flex-1 bg-black text-white px-3 py-1.5 rounded-lg font-semibold text-xs hover:bg-gray-800 transition-colors"
              >
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-1.5 rounded-lg font-semibold text-xs text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Nanti
              </button>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
