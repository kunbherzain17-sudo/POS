import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { Wifi, WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
        isOnline
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
          : 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
      }`}
      title={
        isOnline
          ? 'Connected to Network (Data cached locally)'
          : 'Offline Mode Active. System works 100% offline with zero data loss.'
      }
    >
      {isOnline ? (
        <>
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          <span className="hidden sm:inline">Online / Offline Ready</span>
          <span className="sm:hidden">Online</span>
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3 text-amber-700 shrink-0" />
          <span>Offline Mode (Local Storage)</span>
        </>
      )}
    </div>
  );
};
