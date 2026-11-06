import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running in standalone mode, hide button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white rounded text-xs font-bold shadow transition animate-pulse"
        title="Install Regal POS App on your Desktop / Laptop / Mobile"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1 px-2.5 py-1 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded text-xs font-semibold transition"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Install on iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl text-xs space-y-3">
              <div className="flex justify-between items-center pb-2 border-b">
                <h4 className="font-bold text-sm text-purple-900">Install on iPhone / iPad</h4>
                <button onClick={() => setShowIOSGuide(false)} className="text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-slate-600 leading-relaxed">
                1. Tap the <strong>Share</strong> button at the bottom of Safari.<br />
                2. Scroll down and select <strong>Add to Home Screen</strong>.<br />
                3. Open Regal POS from your home screen for full offline POS register experience!
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2 bg-[#866EC7] text-white rounded font-bold"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Default fallback install guide button if browser doesn't expose prompt yet
  return (
    <button
      onClick={() => {
        alert(
          'Offline PWA Ready: You can install Regal POS by clicking the Install icon in your browser address bar (top right in Chrome/Edge), or by using "Add to Home Screen" on mobile.'
        );
      }}
      className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded text-xs font-semibold transition"
      title="Install Regal POS on PC/Mobile"
    >
      <Download className="w-3.5 h-3.5" />
      <span>Install PWA</span>
    </button>
  );
};
