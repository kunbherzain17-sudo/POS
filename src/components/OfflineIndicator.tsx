import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { Wifi, WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  return (
    <div
      className={`offline-indicator${isOnline ? '' : ' is-offline'}`}
      role="status"
      title={
        isOnline
          ? 'Store records are saved on this device only. This indicator does not verify offline app caching.'
          : 'Offline. Locally saved store data remains available on this device.'
      }
    >
      {isOnline ? (
        <><Wifi className="w-3 h-3" aria-hidden="true" /><span>On this device</span></>
      ) : (
        <>
          <WifiOff className="w-3 h-3" aria-hidden="true" />
          <span>Offline</span>
        </>
      )}
    </div>
  );
};
