import React from 'react';
import { View, Text } from 'react-native';
import { BookOpen } from 'lucide-react-native';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title = 'Shelve',
  subtitle,
  rightElement,
}) => {
  return (
    <View className="py-4 px-4 bg-md-surface-light dark:bg-md-surface-dark flex-row justify-between items-center border-b-[1px] border-md-outline-variant-light dark:border-md-outline-variant-dark">
      <View className="flex-row gap-2 items-center">
        <View>
          <Text className="text-3xl font-display-medium font-bold text-md-onSurface-light dark:text-md-onSurface-dark ml-2">
            {title}
          </Text>
          {subtitle && (
            <Text className="text-md-body-medium text-md-onSurfaceVariant-light dark:text-md-onSurfaceVariant-dark ml-2">
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {rightElement}


    </View>
  );
};
