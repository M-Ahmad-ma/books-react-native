import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { WifiOff, Library } from 'lucide-react-native';

export const NoInternetScreen: React.FC = () => {
  const handleGoToLibrary = () => {
    if (Platform.OS === 'web') {
      window.location.href = '/reading-list';
    }
  };

  return (
    <View className="flex-1 bg-md-background-light dark:bg-md-background-dark items-center justify-center px-8">
      <View className="w-24 h-24 rounded-full bg-md-errorContainer-light dark:bg-md-errorContainer-dark items-center justify-center mb-6">
        <WifiOff size={48} color="#B3261E" />
      </View>

      <Text className="text-md-headline-medium text-md-onSurface-light dark:text-md-onSurface-dark font-semibold text-center">
        No Internet Connection
      </Text>

      <Text className="text-md-body-medium text-md-onSurfaceVariant-light dark:text-md-onSurfaceVariant-dark text-center mt-3 max-w-[300px]">
        You're offline. You can still read your downloaded books from the Library.
      </Text>

      <TouchableOpacity
        onPress={handleGoToLibrary}
        className="mt-8 flex-row items-center px-6 py-4 bg-md-primary-light dark:bg-md-primary-dark rounded-[20px]"
      >
        <Library size={20} color="#FFFFFF" />
        <Text className="text-md-label-large text-white dark:text-md-onPrimary-dark font-semibold ml-2">
          Go to Library
        </Text>
      </TouchableOpacity>
    </View>
  );
};
