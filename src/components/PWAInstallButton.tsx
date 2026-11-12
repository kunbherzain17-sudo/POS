import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [installError, setInstallError] = useState('');

  if (isInstalled) return null;

  const handleInstall = async () => {
    try {
      const installed = await install();
      if (!installed) setShowGuide(true);
    } catch (error) {
      setInstallError(error instanceof Error ? error.message : 'The browser could not start installation.');
      setShowGuide(true);
    }
  };

  const platformTitle = isIOS
    ? 'Install on iPhone or iPad'
    : isAndroid
      ? 'Install on Android'
      : 'Install on desktop';

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setInstallError('');
          if (isInstallable) void handleInstall();
          else setShowGuide(true);
        }}
        className="app-install-button"
        aria-label="Install Asaan POS app"
        title="Install Asaan POS on this device"
      >
        {isIOS || isAndroid
          ? <Smartphone className="w-3.5 h-3.5" aria-hidden="true" />
          : <Download className="w-3.5 h-3.5" aria-hidden="true" />}
        <span>Install App</span>
      </button>

      {showGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowGuide(false);
          }}
        >
          <section
            className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl text-sm space-y-3"
            role="dialog"
            aria-modal="true"
            aria-labelledby="install-guide-title"
          >
            <div className="flex justify-between items-center pb-2 border-b">
              <h2 id="install-guide-title" className="font-bold text-base text-purple-900">
                {platformTitle}
              </h2>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="text-slate-400"
                aria-label="Close install instructions"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {installError && <p className="text-rose-700" role="alert">{installError}</p>}

            {isIOS ? (
              <ol className="list-decimal pl-5 text-slate-600 leading-relaxed space-y-1">
                <li>Open this page in Safari while online.</li>
                <li>Tap <strong>Share</strong>, then <strong>Add to Home Screen</strong>.</li>
                <li>Open Asaan POS from the Home Screen once to finish caching it.</li>
              </ol>
            ) : isAndroid ? (
              <ol className="list-decimal pl-5 text-slate-600 leading-relaxed space-y-1">
                <li>Open this page in Chrome while online.</li>
                <li>Tap the browser menu, then <strong>Install app</strong> or <strong>Add to Home Screen</strong>.</li>
                <li>Open Asaan POS once while online to finish caching it.</li>
              </ol>
            ) : (
              <ol className="list-decimal pl-5 text-slate-600 leading-relaxed space-y-1">
                <li>Open this page in Chrome or Edge over HTTPS while online.</li>
                <li>Use the install icon in the address bar, or the browser menu’s <strong>Install Asaan POS</strong> option.</li>
                <li>Launch the installed app once online to finish caching it.</li>
              </ol>
            )}

            <p className="text-xs text-slate-500">
              After the first online visit and cache setup, the installed app can run offline.
              Local store data stays on this device and does not sync.
            </p>
            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="w-full py-2 bg-[#6750A4] text-white rounded font-bold"
            >
              Done
            </button>
          </section>
        </div>
      )}
    </>
  );
};
