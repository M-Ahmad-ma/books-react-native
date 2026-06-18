import React, { useLayoutEffect, useState, useEffect } from 'react';
import { useColorScheme as useSystemColorScheme, Appearance } from 'react-native';
import { colorScheme as nwColorScheme } from 'nativewind'; // Static API

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useSystemColorScheme();
  const [isReady, setIsReady] = useState(false);

  // 1️⃣ Set the theme synchronously before the first paint
  useLayoutEffect(() => {
    const theme = systemScheme === 'dark' ? 'dark' : 'light';
    nwColorScheme.set(theme);          // ← global, immediate
    setIsReady(true);
  }, []);

  // 2️⃣ Listen to system theme changes while app is running
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      const theme = colorScheme === 'dark' ? 'dark' : 'light';
      nwColorScheme.set(theme);
    });
    return () => subscription.remove();
  }, []);

  // 3️⃣ Only render children after the theme is set
  if (!isReady) {
    return null; // Or a splash/loading view
  }

  return <>{children}</>;
};
