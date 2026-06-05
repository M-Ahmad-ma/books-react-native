import React from 'react';
import { View } from 'react-native';
import { Skeleton } from './Skeleton';

export const LoadingSpinner: React.FC = () => {
  return (
    <View className="flex-1 w-full gap-3 px-5 py-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} height={16} borderRadius={4} />
      ))}
    </View>
  );
};
