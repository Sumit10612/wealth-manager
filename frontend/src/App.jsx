import React, { useEffect, useState } from 'react';
import TransactionManager from './components/TransactionManager';
import './App.css';

function App() {
  // Default token - no authentication required
  const token = 'admin123';
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Listen for install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleLogout = () => {
    // Just refresh the page on logout
    window.location.reload();
  };

  const handleInstall = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setInstallPrompt(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Install Banner */}
      {installPrompt && !isInstalled && (
        <div className="bg-blue-600 text-white p-3 flex items-center justify-between shadow-lg">
          <span className="text-sm font-medium">Install Wealth Manager app on your device</span>
          <button
            onClick={handleInstall}
            className="bg-white text-blue-600 px-4 py-1 rounded font-semibold text-sm hover:bg-gray-100 transition"
          >
            Install
          </button>
        </div>
      )}
      <TransactionManager token={token} onLogout={handleLogout} />
    </div>
  );
}

export default App;
