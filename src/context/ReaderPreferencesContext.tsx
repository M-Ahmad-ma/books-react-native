import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

export type ReaderTheme = 'light' | 'dark' | 'sepia';

export type ReaderFont = 'system' | 'georgia' | 'verdana' | 'palatino' | 'opendyslexic' | 'courier';

export interface ReaderPreferences {
  theme: ReaderTheme;
  font: ReaderFont;
  fontSize: number;
  lineHeight: number;
}

const DEFAULT_PREFERENCES: ReaderPreferences = {
  theme: 'light',
  font: 'georgia',
  fontSize: 18,
  lineHeight: 1.8,
};

interface ReaderPreferencesContextType {
  preferences: ReaderPreferences;
  setTheme: (theme: ReaderTheme) => void;
  setFont: (font: ReaderFont) => void;
  setFontSize: (size: number) => void;
  setLineHeight: (height: number) => void;
  getThemeColors: () => { background: string; text: string };
  getFontFamily: () => string;
  isLoaded: boolean;
}

const ReaderPreferencesContext = createContext<ReaderPreferencesContextType | undefined>(undefined);

export const ReaderPreferencesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const db = useSQLiteContext();
  const [preferences, setPreferences] = useState<ReaderPreferences>(DEFAULT_PREFERENCES);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const prefs = await db.getFirstAsync<any>('SELECT * FROM reader_preferences WHERE id = 1');
        if (prefs) {
          setPreferences({
            theme: prefs.theme as ReaderTheme,
            font: prefs.font as ReaderFont,
            fontSize: prefs.fontSize,
            lineHeight: prefs.lineHeight,
          });
        }
      } catch (error) {
      } finally {
        setIsLoaded(true);
      }
    };
    init();
  }, []);

  const savePreferences = useCallback(async (newPrefs: ReaderPreferences) => {
    try {
      await db.runAsync(
        `UPDATE reader_preferences SET theme = ?, font = ?, fontSize = ?, lineHeight = ? WHERE id = 1`,
        [newPrefs.theme, newPrefs.font, newPrefs.fontSize, newPrefs.lineHeight]
      );
    } catch (error) {
    }
  }, [db]);

  const setTheme = useCallback((theme: ReaderTheme) => {
    setPreferences(prev => {
      const newPrefs = { ...prev, theme };
      savePreferences(newPrefs);
      return newPrefs;
    });
  }, [savePreferences]);

  const setFont = useCallback((font: ReaderFont) => {
    setPreferences(prev => {
      const newPrefs = { ...prev, font };
      savePreferences(newPrefs);
      return newPrefs;
    });
  }, [savePreferences]);

  const setFontSize = useCallback((fontSize: number) => {
    setPreferences(prev => {
      const newPrefs = { ...prev, fontSize };
      savePreferences(newPrefs);
      return newPrefs;
    });
  }, [savePreferences]);

  const setLineHeight = useCallback((lineHeight: number) => {
    setPreferences(prev => {
      const newPrefs = { ...prev, lineHeight };
      savePreferences(newPrefs);
      return newPrefs;
    });
  }, [savePreferences]);

  const getThemeColors = useCallback(() => {
    switch (preferences.theme) {
      case 'dark':
        return { background: '#1C1B1F', text: '#E6E1E5' };
      case 'sepia':
        return { background: '#F4ECD8', text: '#5B4636' };
      case 'light':
      default:
        return { background: '#FFFFFF', text: '#1C1B1F' };
    }
  }, [preferences.theme]);

  const getFontFamily = useCallback(() => {
    switch (preferences.font) {
      case 'verdana':
        return 'Verdana, sans-serif';
      case 'palatino':
        return 'Palatino, "Palatino Linotype", serif';
      case 'opendyslexic':
        return '"OpenDyslexic", sans-serif';
      case 'courier':
        return '"Courier New", Courier, monospace';
      case 'georgia':
      default:
        return 'Georgia, serif';
    }
  }, [preferences.font]);

  return (
    <ReaderPreferencesContext.Provider
      value={{
        preferences,
        setTheme,
        setFont,
        setFontSize,
        setLineHeight,
        getThemeColors,
        getFontFamily,
        isLoaded,
      }}
    >
      {children}
    </ReaderPreferencesContext.Provider>
  );
};

export const useReaderPreferences = () => {
  const context = useContext(ReaderPreferencesContext);
  if (!context) {
    throw new Error('useReaderPreferences must be used within ReaderPreferencesProvider');
  }
  return context;
};
