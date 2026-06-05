import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';

interface ConnectivityContextType {
  isConnected: boolean;
}

const ConnectivityContext = createContext<ConnectivityContextType>({ isConnected: true });

const CHECK_INTERVAL = 30000;

async function checkConnection(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
    return navigator.onLine;
  }
  return true;
}

export const ConnectivityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const check = async () => {
      const connected = await checkConnection();
      setIsConnected(connected);
    };

    check();
    timerRef.current = setInterval(check, CHECK_INTERVAL);

    const handleOnline = () => setIsConnected(true);
    const handleOffline = () => setIsConnected(false);

    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (typeof window !== 'undefined' && typeof window.removeEventListener === 'function') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, []);

  return (
    <ConnectivityContext.Provider value={{ isConnected }}>
      {children}
    </ConnectivityContext.Provider>
  );
};

export const useConnectivity = () => useContext(ConnectivityContext);
