import React from 'react';
import { View, Text } from 'react-native';
import { BookOpen } from 'lucide-react-native';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No books found',
  description = 'Try adjusting your search or filters',
  icon,
}) => {
  return (
    <View className="items-center justify-center py-12 px-6">
      <View className='rounded-full w-24 h-24 bg-md-background-light dark:bg-md-surfaceVariant-dark flex items-center justify-center' style={{
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      }}>
        {icon || <BookOpen size={64} color="#D1D5DB" />}
      </View>
      <Text className="mt-4 text-2xl  text-md-onSurface-light dark:text-md-onSurface-dark">
        {title}
      </Text>
      <Text className="mt-2 text-lg text-wrap text-md-onSurfaceVariant-light dark:text-md-onSurfaceVariant-dark text-center">
        {description}
      </Text>
    </View>
  );
};
