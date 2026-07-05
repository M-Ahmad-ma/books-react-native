import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  useWindowDimensions,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen, Heart, Library, Bookmark, Globe, Sparkles, Quote } from 'lucide-react-native';
import { AppHeader } from '../components';
import { useColorScheme } from 'nativewind';
import { useReading } from '../context/ReadingContext';
import { useWishlist } from '../context/WishlistContext';
import { ThemeToggleButton } from '@/navigation/AppNavigator';
import { isDesktop, isTablet } from '@/utils';

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 500, delay, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(translateY, { toValue: 0, duration: 500, delay, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

function Divider() {
  const isDark = useColorScheme().colorScheme === 'dark';
  return (
    <View className="flex-row items-center px-16 mb-8">
      <View className="flex-1 h-px bg-md-outline-variant-light dark:bg-md-outline-variant-dark" />
      <View className="mx-3 w-1.5 h-1.5 rounded-full bg-md-primary-light dark:bg-md-primary-dark" />
      <View className="flex-1 h-px bg-md-outline-variant-light dark:bg-md-outline-variant-dark" />
    </View>
  );
}

export default function AboutScreen() {
  const { colorScheme } = useColorScheme();
  const { readingBooks } = useReading();
  const { wishlist } = useWishlist();
  const { width } = useWindowDimensions();
  const isDark = colorScheme === 'dark';
  const desktop = isDesktop(width);
  const tablet = isTablet(width);
  const wide = desktop || tablet;

  const primaryColor = isDark ? '#D0BCFF' : '#6750A4';
  const primaryContainer = isDark ? '#4A3263' : '#EADDFF';

  const content = (
    <>
      {/* Hero */}
      <FadeIn>
        <View className={`items-center ${wide ? 'pt-16 pb-10' : 'pt-12 pb-8'} px-6`}>
          <View className="w-16 h-16 rounded-2xl items-center justify-center mb-5 shadow-lg" style={{ backgroundColor: primaryColor }}>
            <BookOpen size={30} color="#FFFFFF" strokeWidth={1.5} />
          </View>
          <Text className="text-[32px] font-bold tracking-tight text-md-onSurface-light dark:text-md-onSurface-dark">
            Shelve
          </Text>
          <Text className="text-md-body-large text-md-onSurfaceVariant-light dark:text-md-onSurfaceVariant-dark mt-2 text-center leading-6 max-w-lg">
            A quiet corner for the books you love and the ones still waiting.
          </Text>
        </View>
      </FadeIn>

      <Divider />

      {/* Stats */}
      <FadeIn delay={100}>
        <View className="flex-row mx-4 gap-3 mb-8">
          <View className="flex-1 rounded-2xl bg-md-surface-light dark:bg-md-surface-dark border border-md-outline-variant-light dark:border-md-outline-variant-dark px-4 py-5 items-center">
            <Bookmark size={20} color={primaryColor} strokeWidth={1.5} />
            <Text className="text-[26px] font-bold text-md-onSurface-light dark:text-md-onSurface-dark mt-2">
              {wishlist.length}
            </Text>
            <Text className="text-md-label-small text-md-onSurfaceVariant-light dark:text-md-onSurfaceVariant-dark mt-0.5">
              Wishlist
            </Text>
          </View>
          <View className="flex-1 rounded-2xl bg-md-surface-light dark:bg-md-surface-dark border border-md-outline-variant-light dark:border-md-outline-variant-dark px-4 py-5 items-center">
            <Library size={20} color={primaryColor} strokeWidth={1.5} />
            <Text className="text-[26px] font-bold text-md-onSurface-light dark:text-md-onSurface-dark mt-2">
              {readingBooks.length}
            </Text>
            <Text className="text-md-label-small text-md-onSurfaceVariant-light dark:text-md-onSurfaceVariant-dark mt-0.5">
              Reading
            </Text>
          </View>
        </View>
      </FadeIn>

      {/* Story */}
      <FadeIn delay={200}>
        <View className="mx-4 mb-6 rounded-2xl bg-md-surface-light dark:bg-md-surface-dark border border-md-outline-variant-light dark:border-md-outline-variant-dark px-5 py-6">
          <View className="flex-row items-center gap-2 mb-3">
            <View className="w-7 h-7 rounded-lg items-center justify-center" style={{ backgroundColor: primaryContainer }}>
              <Sparkles size={14} color={primaryColor} />
            </View>
            <Text className="text-md-title-medium text-md-onSurface-light dark:text-md-onSurface-dark">
              Our Story
            </Text>
          </View>
          <View className="pl-1">
            <Text className="text-md-body-medium text-md-onSurfaceVariant-light dark:text-md-onSurfaceVariant-dark leading-6">
              Shelve was born from a simple idea: that every great book deserves a second life. We bridge timeless public-domain works from Project Gutenberg and Open Library with modern readers who crave discovery without distraction.
            </Text>
            <Text className="text-md-body-medium text-md-onSurfaceVariant-light dark:text-md-onSurfaceVariant-dark leading-6 mt-3">
              Browse trending titles, build your wishlist, track your reading progress, and pick up where you left off — all in one place. No ads. No noise. Just you and the words.
            </Text>
          </View>
        </View>
      </FadeIn>

      {/* Credits */}
      <FadeIn delay={300}>
        <View className="mx-4 mb-6 rounded-2xl bg-md-surface-light dark:bg-md-surface-dark border border-md-outline-variant-light dark:border-md-outline-variant-dark px-5 py-5">
          <Text className="text-md-title-medium text-md-onSurface-light dark:text-md-onSurface-dark mb-4">
            Credits
          </Text>

          <View className={`gap-4 ${wide ? 'flex-row' : ''}`}>
            <View className={`${wide ? 'flex-1' : ''} rounded-xl px-4 py-4`} style={{ backgroundColor: isDark ? '#2B2930' : '#F5F0FA' }}>
              <Globe size={18} color={primaryColor} strokeWidth={1.5} />
              <Text className="text-md-label-medium text-md-onSurface-light dark:text-md-onSurface-dark mt-2 mb-1">
                Data Sources
              </Text>
              <Text className="text-md-body-small text-md-onSurfaceVariant-light dark:text-md-onSurfaceVariant-dark leading-5">
                Project Gutenberg · Open Library
              </Text>
            </View>

            {/* <View className={`${wide ? 'flex-1' : ''} rounded-xl px-4 py-4`} style={{ backgroundColor: isDark ? '#2B2930' : '#F5F0FA' }}> */}
            {/*   <Sparkles size={18} color={primaryColor} strokeWidth={1.5} /> */}
            {/*   <Text className="text-md-label-medium text-md-onSurface-light dark:text-md-onSurface-dark mt-2 mb-1"> */}
            {/*     Built With */}
            {/*   </Text> */}
            {/*   <Text className="text-md-body-small text-md-onSurfaceVariant-light dark:text-md-onSurfaceVariant-dark leading-5"> */}
            {/*     React Native · Expo · TypeScript · NativeWind */}
            {/*   </Text> */}
            {/* </View> */}
            {/**/}
            {/* <View className={`${wide ? 'flex-1' : ''} rounded-xl px-4 py-4`} style={{ backgroundColor: isDark ? '#2B2930' : '#F5F0FA' }}> */}
            {/*   <Quote size={18} color={primaryColor} strokeWidth={1.5} /> */}
            {/*   <Text className="text-md-label-medium text-md-onSurface-light dark:text-md-onSurface-dark mt-2 mb-1"> */}
            {/*     Icons */}
            {/*   </Text> */}
            {/*   <Text className="text-md-body-small text-md-onSurfaceVariant-light dark:text-md-onSurfaceVariant-dark leading-5"> */}
            {/*     Lucide */}
            {/*   </Text> */}
            {/* </View> */}
          </View>
        </View>
      </FadeIn>

      {/* Footer */}
      <FadeIn delay={400}>
        <View className="items-center gap-2 pb-8">
          <View className="flex-row items-center gap-1.5">
            <Text className="text-md-body-small text-md-onSurfaceVariant-light dark:text-md-onSurfaceVariant-dark">
              Made with
            </Text>
            <Heart size={12} color="#B3261E" fill="#B3261E" />
            <Text className="text-md-body-small text-md-onSurfaceVariant-light dark:text-md-onSurfaceVariant-dark">
              for readers everywhere
            </Text>
          </View>
          <Text className="text-md-label-small text-md-onSurfaceVariant-light dark:text-md-onSurfaceVariant-dark">
            Shelve v1.0
          </Text>
        </View>
      </FadeIn>
    </>
  );

  if (wide) {
    return (
      <View className="flex-1 bg-md-background-light dark:bg-md-background-dark">
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={isDark ? '#1C1B1F' : '#FFFBFE'} />
        <AppHeader title="About" rightElement={<ThemeToggleButton />} />
        <ScrollView className="flex-1" contentContainerClassName="pb-16" showsVerticalScrollIndicator={false}>
          <View className="max-w-3xl mx-auto w-full">
            {content}
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-md-background-light dark:bg-md-background-dark">
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={isDark ? '#1C1B1F' : '#FFFBFE'} />
      <AppHeader title="About" rightElement={<ThemeToggleButton />} />
      <ScrollView className="flex-1" contentContainerClassName="pb-16" showsVerticalScrollIndicator={false}>
        {content}
      </ScrollView>
    </SafeAreaView>
  );
}
