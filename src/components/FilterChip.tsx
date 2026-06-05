import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

interface FilterChipProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
  icon?: React.ReactNode;
}

export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  isActive,
  onPress,
  icon,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`mr-3 px-3 py-1.5 rounded-full flex-row items-center ${isActive
        ? 'bg-md-primary-light dark:bg-md-primary-dark'
        : 'bg-transparent border border-md-outline-light dark:border-md-outline-dark'
        }`}
      activeOpacity={0.7}
    >
      {icon && <>{icon}</>}
      <Text
      className={`text-sm font-medium ${icon ? 'ml-1.5' : ''
        } ${isActive
          ? 'text-white dark:text-gray-900'
          : 'text-md-onSurface-light dark:text-md-onSurface-dark'
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};
