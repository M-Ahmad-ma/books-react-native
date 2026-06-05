import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Sun, Moon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

export const ThemeToggleButton = () => {
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const toggleTheme = () => {
    setColorScheme(isDark ? 'light' : 'dark');
  };

  return (
    <TouchableOpacity
      className="w-10 h-10 rounded-full items-center justify-center"
      style={{
        backgroundColor: isDark ? '#4F378B' : '#EADDFF',
      }}
      onPress={toggleTheme}
    >
      {isDark ? (
        <Sun size={20} color="#D0BCFF" />
      ) : (
        <Moon size={20} color="#6750A4" />
      )}
    </TouchableOpacity>
  );
};
