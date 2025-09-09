
import React from 'react';
import { Download, X } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

const PWAInstallPrompt = () => {
  const { isInstallable, installApp, isInstalled } = usePWA();
  const [showPrompt, setShowPrompt] = React.useState(false);

  React.useEffect(() => {
    if (isInstallable && !isInstalled) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 5000); // Show after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled]);

  if (!showPrompt || !isInstallable || isInstalled) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-emerald-600 text-white p-4 rounded-lg shadow-lg z-50 md:left-auto md:right-4 md:w-80">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Download className="w-6 h-6" />
          <div>
            <h3 className="font-semibold">Install Xtracargo</h3>
            <p className="text-sm opacity-90">Install our app for a better experience</p>
          </div>
        </div>
        <button
          onClick={() => setShowPrompt(false)}
          className="text-white hover:text-gray-300"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={installApp}
          className="bg-white text-emerald-600 px-4 py-2 rounded font-medium hover:bg-gray-100 transition-colors"
        >
          Install
        </button>
        <button
          onClick={() => setShowPrompt(false)}
          className="text-white px-4 py-2 rounded hover:bg-emerald-700 transition-colors"
        >
          Not now
        </button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
