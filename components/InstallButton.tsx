
import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

const InstallButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  if (!isVisible) return null;

  return (
    <button 
      onClick={handleInstall}
      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-full text-xs font-bold shadow-lg shadow-emerald-200 animate-bounce"
    >
      <Download size={14} />
      Baixar App
    </button>
  );
};

export default InstallButton;
