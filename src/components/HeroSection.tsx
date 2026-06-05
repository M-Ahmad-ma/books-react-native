import React from 'react';
import { View, Text, Image, TouchableOpacity, useWindowDimensions } from 'react-native';
import { isDesktop } from '@/utils';

interface HeroSectionProps {
  coverUrl?: string;
  onPress?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ coverUrl, onPress }) => {
  const { width } = useWindowDimensions();
  const desktop = isDesktop(width);


  if (desktop) {
    // console.log('desktop')
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        className="mx-5 my-4 rounded-2xl overflow-hidden"
        style={{
          elevation: 5,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 4,
          height: 350
        }}
      ><Image
          source={require('../../assets/heroImage.jpg')}
          style={{ width: '100%', height: '100%', position: 'absolute' }}
          resizeMode="cover"
        />

        <View
          className="absolute inset-0"
          style={{ backgroundColor: 'rgba(0,0,0,0.25)' }}
        />

        <View
          className="absolute bottom-0 left-0 right-0"
          style={{ height: '100%', backgroundColor: 'rgba(0,0,0,0.05)' }}
        />

        <View
          className="absolute bottom-0 left-0 right-0"
          style={{ height: '100%', backgroundColor: 'rgba(0,0,0,0.65)' }}
        />

        <View className="absolute bottom-0 left-0 right-0 px-6 pb-6 pt-12">
          <Text className="text-white/70 text-xl font-bold font-display-medium tracking-widest uppercase mb-1">
            Featured Book
          </Text>

          <Text className="text-white text-7xl font-bold font-display-medium leading-[0.99]">
            Your Next
          </Text>

          <Text className="text-white text-7xl font-bold font-display-medium leading-[0.99]">
            <Text className="text-[#D0BCFF] text-7xl font-display-medium">Great Read </Text>
            Awaits
          </Text>

          <Text className="text-white/60 text-sm mt-2 font-display-medium">
            Curated titles handpicked for curious minds.
          </Text>
        </View>
      </TouchableOpacity>);
  }

  return (
    <View className="px-4 py-6">
      <Text className="text-3xl font-bold text-md-onSurface-light dark:text-md-onSurface-dark">
        Your Next
      </Text>
      <Text className="text-3xl font-bold">
        <Text className="text-[#D0BCFF]">Great Read </Text>
        <Text className="text-md-onSurface-light dark:text-md-onSurface-dark">
          Awaits
        </Text>
      </Text>
      <Text className="text-sm text-md-onSurfaceVariant-light dark:text-md-onSurfaceVariant-dark mt-2">
        Curated titles handpicked for curious minds.
      </Text>
    </View>
  );
};
