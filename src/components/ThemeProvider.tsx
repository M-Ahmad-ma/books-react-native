import React, { useEffect } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import { useColorScheme } from 'nativewind';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemScheme = useSystemColorScheme();
  const { colorScheme, setColorScheme } = useColorScheme();

  useEffect(() => {
    if (!colorScheme) {
      setColorScheme(systemScheme === 'dark' ? 'dark' : 'light');
    }
  }, []);

  return <>{children}</>;
};
