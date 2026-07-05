import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Search, Bookmark, Library, Info, BookOpen, User } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { ThemeToggleButton } from '../navigation/AppNavigator';

const NAV_ITEMS = [
  { label: 'Discover', icon: Search, route: '/' },
  { label: 'Wishlist', icon: Bookmark, route: '/wishlist' },
  { label: 'Library', icon: Library, route: '/reading-list' },
  { label: 'Profile', icon: User, route: '/profile' },
  { label: 'About', icon: Info, route: '/about' },
];

export const DesktopSidebar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const isActive = (route: string) => {
    if (route === '/') return pathname === '/' || pathname === '';
    return pathname.startsWith(route);
  };

  return (
    <View
      className="w-[340px] border-r border-md-surfaceVariant-light dark:border-md-surfaceVariant-dark"
      style={{
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        backgroundColor: isDark ? '#1C1B1F' : '#FFFBFE',
      }}>

      <View className="flex-1 px-4 pt-8 pb-6">
        <View className="flex-row items-center gap-2 mb-10 px-2">
          <View className="w-9 h-9 rounded-xl bg-md-primary-light dark:bg-md-primary-dark items-center justify-center">
            <BookOpen size={20} color="#FFFFFF" />
          </View>
          <Text className="text-xl font-bold text-md-onSurface-light dark:text-md-onSurface-dark tracking-tight">
            Shelve
          </Text>
        </View>

        <View className="gap-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.route);
            return (
              <TouchableOpacity
                key={item.route}
                onPress={() => router.navigate(item.route as any)}
                className={`flex-row items-center gap-3 px-4 py-3 rounded-xl ${active
                  ? 'bg-md-secondaryContainer-light dark:bg-md-secondaryContainer-dark'
                  : ''
                  }`}
              >
                <item.icon
                  size={20}
                  color={
                    active
                      ? isDark ? '#D0BCFF' : '#6750A4'
                      : isDark ? '#938F99' : '#79747E'
                  }
                />
                <Text
                  className={`text-md-label-large font-medium ${active
                    ? 'text-md-onSecondaryContainer-light dark:text-md-onSecondaryContainer-dark'
                    : 'text-md-onSurfaceVariant-light dark:text-md-onSurfaceVariant-dark'
                    }`}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View className="px-4 pb-8 pt-4 border-t border-md-outline-variant-light dark:border-md-outline-variant-dark">
        <View className="flex-row items-center justify-between px-2">
          <Text className="text-md-label-small text-md-onSurfaceVariant-light dark:text-md-onSurfaceVariant-dark">
            Theme
          </Text>
          <ThemeToggleButton />
        </View>
      </View>
    </View>
  );
};
