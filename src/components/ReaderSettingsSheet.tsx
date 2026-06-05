import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Sun, Moon, BookOpen, Minus, Plus, Check, X } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { useReaderPreferences, ReaderTheme, ReaderFont } from '../context/ReaderPreferencesContext';
import { isTablet, isDesktop } from '../utils';

interface ReaderSettingsSheetProps {
  visible: boolean;
  onClose: () => void;
}

const DRAWER_WIDTH = 400;

const THEMES: { id: ReaderTheme; label: string; icon: React.ReactNode; bg: string; text: string }[] = [
  { id: 'light', label: 'Light', icon: <Sun size={20} color="#1C1B1F" />, bg: '#FFFFFF', text: '#1C1B1F' },
  { id: 'dark', label: 'Dark', icon: <Moon size={20} color="#E6E1E5" />, bg: '#1C1B1F', text: '#E6E1E5' },
  { id: 'sepia', label: 'Sepia', icon: <BookOpen size={20} color="#5B4636" />, bg: '#F4ECD8', text: '#5B4636' },
];

const FONTS: { id: ReaderFont; label: string; family: string }[] = [
  { id: 'system', label: 'System', family: 'System' },
  { id: 'georgia', label: 'Georgia', family: 'Georgia' },
  { id: 'verdana', label: 'Verdana', family: 'Verdana' },
  { id: 'palatino', label: 'Palatino', family: 'Palatino' },
  { id: 'courier', label: 'Courier', family: 'Courier' },
];

export const ReaderSettingsSheet: React.FC<ReaderSettingsSheetProps> = ({
  visible,
  onClose,
}) => {
  const { colorScheme } = useColorScheme();
  const { width, height } = useWindowDimensions();
  const {
    preferences,
    setTheme,
    setFont,
    setFontSize,
    getFontFamily,
  } = useReaderPreferences();

  const [localVisible, setLocalVisible] = React.useState(false);
  const translateY = useSharedValue(height);
  const translateX = useSharedValue(DRAWER_WIDTH);
  const backdropOpacity = useSharedValue(0);

  const tablet = isTablet(width);
  const desktop = isDesktop(width);

  const isLargeScreen = tablet || desktop;

  useEffect(() => {
    if (isLargeScreen) {
      if (visible) {
        setLocalVisible(true);
        translateX.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) });
        backdropOpacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) });
      } else {
        translateX.value = withTiming(DRAWER_WIDTH, { duration: 250, easing: Easing.in(Easing.cubic) }, () => {
          runOnJS(setLocalVisible)(false);
        });
        backdropOpacity.value = withTiming(0, { duration: 250 });
      }
    } else {
      if (visible) {
        setLocalVisible(true);
        translateY.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) });
      } else {
        translateY.value = withTiming(height, { duration: 250, easing: Easing.in(Easing.cubic) }, () => {
          runOnJS(setLocalVisible)(false);
        });
      }
    }
  }, [visible, height, width, isLargeScreen, translateY, translateX, backdropOpacity]);

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const drawerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const currentFontFamily = getFontFamily();
  const isDark = colorScheme === 'dark';
  const surfaceColor = isDark ? '#1C1B1F' : '#FFFBFE';
  const scrimColor = 'rgba(0, 0, 0, 0.4)';

  const handleFontSizeChange = (delta: number) => {
    const newSize = Math.max(14, Math.min(32, preferences.fontSize + delta));
    setFontSize(newSize);
  };

  const SettingsContent = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      bounces={true}
      className="px-6 pb-8"
    >
      {!isLargeScreen && (
        <View className="items-center pt-3 pb-1">
          <View className="w-12 h-1.5 bg-md-outline-variant-light dark:bg-md-outline-variant-dark rounded-full" />
        </View>
      )}

      <Text className="text-md-title-large text-md-onSurface-light dark:text-md-onSurface-dark font-semibold mb-5">
        Reading Settings
      </Text>

      <View className="gap-6">
        <View>
          <Text className="text-md-label-large text-md-onSurfaceVariant-light dark:text-md-onSurfaceVariant-dark mb-3">
            Theme
          </Text>
          <View className="flex-row gap-3">
            {THEMES.map((theme) => (
              <TouchableOpacity
                key={theme.id}
                onPress={() => setTheme(theme.id)}
                className={`flex-1 py-3 px-2 rounded-[16px] items-center border-2 ${
                  preferences.theme === theme.id
                    ? 'border-md-primary-light dark:border-md-primary-dark'
                    : 'border-md-outline-variant-light dark:border-md-outline-variant-dark'
                }`}
                style={{ backgroundColor: theme.bg }}
              >
                <View className="mb-2">{theme.icon}</View>
                <Text
                  className="text-md-label-medium font-medium"
                  style={{ color: theme.text }}
                >
                  {theme.label}
                </Text>
                {preferences.theme === theme.id && (
                  <View className="mt-2 w-5 h-5 rounded-full bg-md-primary-light dark:bg-md-primary-dark items-center justify-center">
                    <Check size={12} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View>
          <Text className="text-md-label-large text-md-onSurfaceVariant-light dark:text-md-onSurfaceVariant-dark mb-3">
            Font
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {FONTS.map((font) => (
              <TouchableOpacity
                key={font.id}
                onPress={() => setFont(font.id)}
                className={`px-4 py-3 rounded-[12px] border-2 ${
                  preferences.font === font.id
                    ? 'bg-md-primaryContainer-light dark:bg-md-primaryContainer-dark border-md-primary-light dark:border-md-primary-dark'
                    : 'bg-md-surfaceVariant-light dark:bg-md-surfaceVariant-dark border-md-outline-variant-light dark:border-md-outline-variant-dark'
                }`}
              >
                <Text
                  className={`text-md-label-large ${
                    preferences.font === font.id
                      ? 'text-md-onPrimaryContainer-light dark:text-md-onPrimaryContainer-dark'
                      : 'text-md-onSurfaceVariant-light dark:text-md-onSurfaceVariant-dark'
                  }`}
                  style={{
                    fontFamily: font.family === 'System' ? undefined : font.family,
                  }}
                >
                  {font.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View>
          <Text className="text-md-label-large text-md-onSurfaceVariant-light dark:text-md-onSurfaceVariant-dark mb-3">
            Font Size
          </Text>
          <View className="flex-row items-center justify-between bg-md-surfaceVariant-light dark:bg-md-surfaceVariant-dark rounded-[16px] p-2">
            <TouchableOpacity
              onPress={() => handleFontSizeChange(-2)}
              className="w-12 h-12 rounded-[12px] bg-md-surface-light dark:bg-md-surface-dark items-center justify-center"
            >
              <Minus size={24} color="#6750A4" />
            </TouchableOpacity>

            <View className="flex-1 items-center">
              <Text
                className="text-2xl font-medium text-md-onSurface-light dark:text-md-onSurface-dark"
                style={{ fontFamily: currentFontFamily }}
              >
                Aa
              </Text>
              <Text className="text-md-label-small text-md-onSurfaceVariant-light dark:text-md-onSurfaceVariant-dark">
                {preferences.fontSize}px
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => handleFontSizeChange(2)}
              className="w-12 h-12 rounded-[12px] bg-md-surface-light dark:bg-md-surface-dark items-center justify-center"
            >
              <Plus size={24} color="#6750A4" />
            </TouchableOpacity>
          </View>

          <View className="mt-3 flex-row justify-between">
            <Text className="text-md-label-small text-md-onSurfaceVariant-light dark:text-md-onSurfaceVariant-dark">Small</Text>
            <Text className="text-md-label-small text-md-onSurfaceVariant-light dark:text-md-onSurfaceVariant-dark">Large</Text>
          </View>
        </View>

        <View className="h-4" />
      </View>
    </ScrollView>
  );

  // Tablet & Desktop: Right-side Drawer
  if (isLargeScreen) {
    return (
      <Modal
        visible={localVisible}
        transparent
        animationType="none"
        onRequestClose={onClose}
      >
        <View className="flex-1 flex-row">
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={onClose}
          >
            <Animated.View
              style={[
                { flex: 1, backgroundColor: scrimColor },
                backdropAnimatedStyle,
              ]}
            />
          </TouchableOpacity>

          <Animated.View
            style={[
              {
                width: Math.min(DRAWER_WIDTH, width * 0.85),
                height: '100%',
                backgroundColor: surfaceColor,
                shadowColor: '#000',
                shadowOffset: { width: -4, height: 0 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
                elevation: 16,
              },
              drawerAnimatedStyle,
            ]}
          >
            <View
              className="flex-row items-center justify-between px-6 pt-6 pb-3"
              style={{
                backgroundColor: surfaceColor,
                borderBottomWidth: 1,
                borderBottomColor: isDark ? '#2E2A30' : '#E7E0EC',
              }}
            >
              <Text className="text-md-title-large text-md-onSurface-light dark:text-md-onSurface-dark font-semibold">
                Reading Settings
              </Text>
              <TouchableOpacity
                onPress={onClose}
                className="w-10 h-10 rounded-full items-center justify-center bg-md-surfaceVariant-light dark:bg-md-surfaceVariant-dark"
              >
                <X size={20} color={isDark ? '#E6E1E5' : '#1C1B1F'} />
              </TouchableOpacity>
            </View>

            <View style={{ flex: 1 }}>
              <SettingsContent />
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  }

  // Mobile: Bottom Sheet
  return (
    <Modal
      visible={localVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        <TouchableOpacity
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          activeOpacity={1}
          onPress={onClose}
        >
          <Animated.View
            className="flex-1"
            style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          />
        </TouchableOpacity>

        <Animated.View
          style={[
            {
              backgroundColor: surfaceColor,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              maxHeight: '80%',
            },
            sheetAnimatedStyle,
          ]}
        >
          <SettingsContent />
        </Animated.View>
      </View>
    </Modal>
  );
};
