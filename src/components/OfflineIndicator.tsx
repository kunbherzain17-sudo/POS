import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { Wifi, WifiOff } from 'lucide-react';
import { usePos } from '../context/PosContext';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const { saveState, demoMode } = usePos();

  return (
    <div
      className={`offline-indicator${!isOnline || saveState === 'error' ? ' is-offline' : ''}`}
      role="status"
      title={
        demoMode
          ? 'Interactive demo sandbox. Changes are temporary and are not saved to the cloud.'
          : !isOnline
          ? 'Offline. Cloud changes cannot be saved and checkout is unavailable.'
          : saveState === 'error'
            ? 'A cloud save failed. Resolve the sync warning before checking out.'
            : saveState === 'saving'
              ? 'Saving store changes to the cloud.'
              : 'Store data is synchronized with the cloud.'
      }
    >
      {demoMode ? (
        <><Wifi className="w-3 h-3" aria-hidden="true" /><span>Demo mode</span></>
      ) : isOnline ? (
        <><Wifi className="w-3 h-3" aria-hidden="true" /><span>{saveState === 'saving' ? 'Syncing' : saveState === 'error' ? 'Sync issue' : 'Cloud synced'}</span></>
      ) : (
        <>
          <WifiOff className="w-3 h-3" aria-hidden="true" />
          <span>Offline</span>
        </>
      )}
    </div>
  );
};
