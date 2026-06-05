import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

interface SectionHeaderProps {
  title: string;
  onSeeAllPress?: () => void;
  showSeeAll?: boolean;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  onSeeAllPress,
  showSeeAll = true,
}) => {
  return (
    <View className="flex-row justify-between items-center mb-4 px-4">
      <Text className="text-[20px] font-semibold text-md-onSurfaceVariant-light dark:text-md-onSurfaceVariant-dark  tracking-wider">
        {title}
      </Text>
      {showSeeAll && onSeeAllPress && (
        <TouchableOpacity
          onPress={onSeeAllPress}
          className="flex-row items-center"
          activeOpacity={0.7}
        >
          <Text className="text-xs text-accent-green font-medium">
            See all
          </Text>
          <ChevronRight size={14} color="#22C55E" />
        </TouchableOpacity>
      )}
    </View>
  );
};
