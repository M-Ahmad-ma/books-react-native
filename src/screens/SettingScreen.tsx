import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen, Heart, Library, Bookmark } from 'lucide-react-native';
import { AppHeader } from '../components';
import { useColorScheme } from 'nativewind';
import { useReading } from '../context/ReadingContext';
import { useWishlist } from '../context/WishlistContext';
import { ThemeToggleButton } from '@/navigation/AppNavigator';
import { isDesktop, isTablet } from '@/utils';

const AboutContent: React.FC<{
  wishlist: any[];
  readingBooks: any[];
  darkMode: boolean;
}> = ({ wishlist, readingBooks, darkMode }) => (
  <>
    {/* ── Brand ── */}
    <View className="items-center pt-12 pb-8 px-6">
      <View className="w-16 h-16 rounded-2xl bg-md-primary-light dark:bg-md-primary-dark items-center justify-center mb-5 shadow-sm">
        <BookOpen size={30} color="#FFFFFF" strokeWidth={1.5} />
      </View>
      <Text className="text-[32px] font-bold tracking-tight text-md-onSurface-light dark:text-md-onSurface-dark">
        Bibliothèque
      </Text>
      <Text className="text-md-body-large text-md-onSurfaceVariant-light dark:text-md-onSurfaceVariant-dark mt-2 text-center leading-6">
        A quiet corner for the books you love and the ones still waiting.
      </Text>
    </View>

    {/* ── Divider ── */}
    <View className="flex-row items-center px-16 mb-8">
      <View className="flex-1 h-px bg-md-outline-variant-light dark:bg-md-outline-variant-dark" />
      <View className="mx-3 w-1.5 h-1.5 rounded-full bg-md-primary-light dark:bg-md-primary-dark" />
      <View className="flex-1 h-px bg-md-outline-variant-light dark:bg-md-outline-variant-dark" />
    </View>

    {/* ── Reading Stats ── */}
    <View className="flex-row mx-4 gap-3 mb-8">
      <View className="flex-1 rounded-xl bg-md-surface-light dark:bg-md-surface-dark border border-md-outline-variant-light dark:border-md-outline-variant-dark px-4 py-5 items-center">
        <Bookmark size={20} color={darkMode ? '#D0BCFF' : '#6750A4'} strokeWidth={1.5} />
        <Text className="text-[26px] font-bold text-md-onSurface-light dark:text-md-onSurface-dark mt-2">
          {wishlist.length}
        </Text>
        <Text className="text-md-label-small text-md-onSurfaceVariant-light dark:text-md-onSurfaceVariant-dark mt-0.5">
          Wishlist
        </Text>
      </View>
      <View className="flex-1 rounded-xl bg-md-surface-light dark:bg-md-surface-dark border border-md-outline-variant-light dark:border-md-outline-variant-dark px-4 py-5 items-center">
        <Library size={20} color={darkMode ? '#D0BCFF' : '#6750A4'} strokeWidth={1.5} />
        <Text className="text-[26px] font-bold text-md-onSurface-light dark:text-md-onSurface-dark mt-2">
          {readingBooks.length}
        </Text>
        <Text className="text-md-label-small text-md-onSurfaceVariant-light dark:text-md-onSurfaceVariant-dark mt-0.5">
          Reading
        </Text>
      </View>
    </View>

    {/* ── Description ── */}
    <View className="mx-4 mb-6 rounded-xl bg-md-surface-light dark:bg-md-surface-dark border border-md-outline-variant-light dark:border-md-outline-variant-dark px-5 py-5">
      <Text className="text-md-title-medium text-md-onSurface-light dark:text-md-onSurface-dark mb-2">
        About
      </Text>
      <Text className="text-md-body-medium text-md-onSurfaceVariant-light dark:text-md-onSurfaceVariant-dark leading-5">
        Bibliothèque helps you discover, save, and read public-domain books from
        Project Gutenberg and Open Library. Browse trending titles, build your
        wishlist, track your reading progress, and pick up where you left off —
        all in one place.
      </Text>
    </View>

    {/* ── Credits ── */}
    <View className="mx-4 mb-8 rounded-xl bg-md-surface-light dark:bg-md-surface-dark border border-md-outline-variant-light dark:border-md-outline-variant-dark px-5 py-5">
      <Text className="text-md-title-medium text-md-onSurface-light dark:text-md-onSurface-dark mb-3">
        Credits
      </Text>

      <View className="gap-3">
        <View>
          <Text className="text-md-label-medium text-md-onSurface-light dark:text-md-onSurface-dark">
            Data Sources
          </Text>
          <Text className="text-md-body-small text-md-onSurfaceVariant-light dark:text-md-onSurfaceVariant-dark mt-0.5 leading-5">
            Project Gutenberg · Open Library
          </Text>
        </View>
        <View className="h-px bg-md-outline-variant-light dark:bg-md-outline-variant-dark" />
        <View>
          <Text className="text-md-label-medium text-md-onSurface-light dark:text-md-onSurface-dark">
            Built With
          </Text>
          <Text className="text-md-body-small text-md-onSurfaceVariant-light dark:text-md-onSurfaceVariant-dark mt-0.5 leading-5">
            React Native · Expo · TypeScript · NativeWind
          </Text>
        </View>
        <View className="h-px bg-md-outline-variant-light dark:bg-md-outline-variant-dark" />
        <View>
          <Text className="text-md-label-medium text-md-onSurface-light dark:text-md-onSurface-dark">
            Icons
          </Text>
          <Text className="text-md-body-small text-md-onSurfaceVariant-light dark:text-md-onSurfaceVariant-dark mt-0.5 leading-5">
            Lucide
          </Text>
        </View>
      </View>
    </View>

    {/* ── Footer ── */}
    <View className="items-center gap-2">
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
        Bibliothèque v1.0
      </Text>
    </View>
  </>
);

export default function AboutScreen() {
  const { colorScheme } = useColorScheme();
  const { readingBooks } = useReading();
  const { wishlist } = useWishlist();
  const { width } = useWindowDimensions();
  const darkMode = colorScheme === 'dark';
  const desktop = isDesktop(width);
  const tablet = isTablet(width);

  const content = (
    <AboutContent wishlist={wishlist} readingBooks={readingBooks} darkMode={darkMode} />
  );

  if (desktop || tablet) {
    return (
      <View className="flex-1 bg-md-background-light dark:bg-md-background-dark">
        <StatusBar
          barStyle={darkMode ? 'light-content' : 'dark-content'}
          backgroundColor={darkMode ? '#1C1B1F' : '#FFFBFE'}
        />
        <AppHeader title="About" rightElement={<ThemeToggleButton />} />
        <ScrollView
          className="flex-1"
          contentContainerClassName="pb-16"
          showsVerticalScrollIndicator={false}
        >
          <View className="max-w-xl mx-auto w-full">
            {content}
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-md-background-light dark:bg-md-background-dark">
      <StatusBar
        barStyle={darkMode ? 'light-content' : 'dark-content'}
        backgroundColor={darkMode ? '#1C1B1F' : '#FFFBFE'}
      />
      <AppHeader title="About" rightElement={<ThemeToggleButton />} />
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-16"
        showsVerticalScrollIndicator={false}
      >
        {content}
      </ScrollView>
    </SafeAreaView>
  );
}
