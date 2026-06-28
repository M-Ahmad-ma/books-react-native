import React from 'react';
import { View, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Tabs } from 'expo-router';
import { Search, Library, Info, Sun, Moon, Bookmark, User } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { isDesktop } from '@/utils';
import { DesktopSidebar } from '../../src/components/DesktopSidebar';

const TabIcon = ({ icon: Icon, focused }: { icon: any; focused: boolean }) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const activeColor = isDark ? '#D0BCFF' : '#6750A4';
  const inactiveColor = isDark ? '#938F99' : '#79747E';

  return (
    <View className="p-1">
      <Icon size={24} color={focused ? activeColor : inactiveColor} />
    </View>
  );
};

export const ThemeToggleButton = () => {
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const toggleTheme = () => {
    setColorScheme(isDark ? 'light' : 'dark');
  };

  return (
    <TouchableOpacity
      className="w-10 h-10 rounded-full items-center justify-center"
      style={{
        backgroundColor: isDark ? '#4F378B' : '#EADDFF',
      }}
      onPress={toggleTheme}
    >
      {isDark ? (
        <Sun size={20} color="#D0BCFF" />
      ) : (
        <Moon size={20} color="#6750A4" />
      )}
    </TouchableOpacity>
  );
};

function DesktopTabLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View className="flex-1 flex-row" style={{ backgroundColor: isDark ? '#1C1B1F' : '#FFFBFE' }}>
      <DesktopSidebar />
      <View className="flex-1">
        <Tabs
          screenOptions={{
            headerShown: false,
            sceneStyle: {
              backgroundColor: isDark ? '#1C1B1F' : '#FFFBFE',
            },
            tabBarStyle: { display: 'none' },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Discover',
            }}
          />
          <Tabs.Screen
            name="wishlist"
            options={{
              title: 'Wishlist',
            }}
          />
          <Tabs.Screen
            name="reading-list"
            options={{
              title: 'Library',
            }}
          />
          <Tabs.Screen
            name="about"
            options={{
              title: 'About',
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profile',
            }}
          />
        </Tabs>
      </View>
    </View>
  );
}

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const desktop = isDesktop(width);

  if (desktop) {
    return <DesktopTabLayout />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          backgroundColor: isDark ? '#1C1B1F' : '#FFFBFE',
        },
        tabBarStyle: {
          backgroundColor: isDark ? '#2B2930' : '#F3EDF7',
          borderTopColor: isDark ? '#49454F' : '#CAC4D0',
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: isDark ? '#D0BCFF' : '#6750A4',
        tabBarInactiveTintColor: isDark ? '#938F99' : '#79747E',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Discover',
          tabBarLabel: 'Discover',
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={Search} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: 'Wishlist',
          tabBarLabel: 'Wishlist',
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={Bookmark} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="reading-list"
        options={{
          title: 'Library',
          tabBarLabel: 'Library',
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={Library} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: 'About',
          tabBarLabel: 'About',
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={Info} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={User} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
