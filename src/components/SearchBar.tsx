import React from 'react';
import { View, TextInput } from 'react-native';
import { Search } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
}

export const SearchBar: React.FC<SearchInputProps> = ({
  value,
  onChangeText,
  placeholder = 'Search by title or author...',
  onSubmit,
}) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View
      className="flex-row items-center rounded-[16px] px-4 py-1 border"
      style={{
        backgroundColor: isDark
          ? 'rgba(255, 255, 255, 0.08)'
          : 'rgba(0, 0, 0, 0.04)',
        borderColor: isDark ? '#49454F' : '#CAC4D0',
      }}
    >
      <Search
        size={20}
        color={isDark ? '#938F99' : '#79747E'}
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={isDark ? '#938F99' : '#79747E'}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
        className="flex-1 ml-3 text-md-body-large text-md-onSurface-light dark:text-md-onSurface-dark"
      />
    </View>
  );
};
