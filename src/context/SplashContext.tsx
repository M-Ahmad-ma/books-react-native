import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';

interface SplashContextType {
  contentReady: boolean;
  setContentReady: () => void;
}

const SplashContext = createContext<SplashContextType | undefined>(undefined);

export const SplashProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [contentReady, setContentReadyState] = useState(false);

  const setContentReady = useCallback(() => {
    setContentReadyState(true);
  }, []);

  const value = useMemo(() => ({ contentReady, setContentReady }), [contentReady, setContentReady]);

  return (
    <SplashContext.Provider value={value}>
      {children}
    </SplashContext.Provider>
  );
};

export const useSplash = () => {
  const context = useContext(SplashContext);
  if (!context) throw new Error('useSplash must be used within SplashProvider');
  return context;
};
