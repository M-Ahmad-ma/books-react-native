import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  X,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
} from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NotificationData } from '../context/NotificationContext';

const TYPE_CONFIG = {
  success: {
    icon: CheckCircle,
    light: '#2E7D32',
    dark: '#66BB6A',
  },
  error: {
    icon: AlertCircle,
    light: '#B3261E',
    dark: '#F2B8B5',
  },
  info: {
    icon: Info,
    light: '#1565C0',
    dark: '#42A5F5',
  },
  warning: {
    icon: AlertTriangle,
    light: '#E65100',
    dark: '#FFA726',
  },
};

interface NotificationToastProps {
  notification: NotificationData;
  onRemove: (id: string) => void;
  index: number;
  isDesktop: boolean;
}

function ToastInner({
  notification,
  accentColor,
  isDark,
  onDismiss,
}: {
  notification: NotificationData;
  accentColor: string;
  isDark: boolean;
  onDismiss: () => void;
}) {
  const config = TYPE_CONFIG[notification.type];
  const IconComponent = config.icon;

  return (
    <>
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          backgroundColor: accentColor,
          borderTopLeftRadius: 16,
          borderBottomLeftRadius: 16,
        }}
      />
      <View className="pl-[18] pr-3 py-3.5">
        <View className="flex-row items-start justify-between">
          <View className="flex-row items-start flex-1 mr-2" style={{ gap: 10 }}>
            <IconComponent size={18} color={accentColor} style={{ marginTop: 1 }} />
            <View className="flex-1" style={{ gap: 2 }}>
              <Text className="text-sm font-semibold text-md-onSurface-light dark:text-md-onSurface-dark leading-5">
                {notification.title}
              </Text>
              {notification.message && (
                <Text className="text-[13px] text-md-onSurfaceVariant-light dark:text-md-onSurfaceVariant-dark leading-[18px]">
                  {notification.message}
                </Text>
              )}
              {notification.action && (
                <TouchableOpacity
                  onPress={() => {
                    notification.action?.onPress();
                    onDismiss();
                  }}
                  className="mt-1.5"
                  hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                >
                  <Text style={{ color: accentColor }} className="text-xs font-bold">
                    {notification.action.label}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          <TouchableOpacity
            onPress={onDismiss}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            className="p-1 -m-1"
          >
            <X size={14} color={isDark ? '#CAC4D0' : '#49454F'} />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

function WebNotificationToast({
  notification,
  onRemove,
  index,
  isDesktop,
}: NotificationToastProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const dismissingRef = useRef(false);

  const config = TYPE_CONFIG[notification.type];
  const accentColor = isDark ? config.dark : config.light;

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleDismiss = useCallback(() => {
    if (dismissingRef.current) return;
    dismissingRef.current = true;
    onRemove(notification.id);
  }, [notification.id, onRemove]);

  useEffect(() => {
    const dur = notification.duration ?? 4000;
    if (dur <= 0) return;
    const timer = setTimeout(() => handleDismiss(), dur);
    return () => clearTimeout(timer);
  }, [notification.duration, handleDismiss]);

  const containerStyle = {
    position: 'absolute' as const,
    top: insets.top + 8 + index * 84,
    left: isDesktop ? undefined : 16,
    right: 16,
    width: isDesktop ? 384 : undefined,
    alignSelf: isDesktop ? ('flex-end' as const) : undefined,
    zIndex: 9999 - index,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: isDark ? 0.45 : 0.1,
    shadowRadius: 16,
  };

  return (
    <View
      style={[containerStyle, { opacity: visible ? 1 : 0, transition: 'opacity 250ms ease-in-out' }]}
      className="bg-md-surfaceContainer-high-light dark:bg-md-surfaceContainer-high-dark rounded-2xl overflow-hidden"
    >
      <ToastInner
        notification={notification}
        accentColor={accentColor}
        isDark={isDark}
        onDismiss={handleDismiss}
      />
    </View>
  );
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onRemove,
  index,
  isDesktop,
}) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  if (Platform.OS === 'web') {
    return (
      <WebNotificationToast
        notification={notification}
        onRemove={onRemove}
        index={index}
        isDesktop={isDesktop}
      />
    );
  }

  const translateY = useSharedValue(100);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const translateX = useSharedValue(0);

  const dismissing = useRef(false);

  const config = TYPE_CONFIG[notification.type];
  const accentColor = isDark ? config.dark : config.light;

  const handleDismiss = useCallback(() => {
    if (dismissing.current) return;
    dismissing.current = true;
    scale.value = withTiming(0.92, { duration: 150 });
    translateY.value = withTiming(-16, { duration: 180, easing: Easing.in(Easing.cubic) });
    opacity.value = withTiming(0, { duration: 200 }, (finished) => {
      if (finished) {
        runOnJS(onRemove)(notification.id);
      }
    });
  }, [notification.id, onRemove]);

  useEffect(() => {
    translateY.value = withSpring(0, {
      damping: 15,
      stiffness: 200,
      mass: 0.85,
    });
    opacity.value = withTiming(1, { duration: 250 });
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 200,
      mass: 0.85,
    });
  }, []);

  useEffect(() => {
    const dur = notification.duration ?? 4000;
    if (dur <= 0) return;
    const timer = setTimeout(() => handleDismiss(), dur);
    return () => clearTimeout(timer);
  }, [notification.duration, handleDismiss]);

  const gesture = useMemo(() => Gesture.Pan()
    .onUpdate((e) => {
      if (dismissing.current) return;
      translateX.value = e.translationX;
      opacity.value = 1 - Math.min(Math.abs(e.translationX) / 300, 0.4);
      scale.value = 1 - Math.min(Math.abs(e.translationX) / 600, 0.08);
    })
    .onEnd((e) => {
      if (Math.abs(e.translationX) > 100 && !dismissing.current) {
        translateX.value = withTiming(
          e.translationX > 0 ? 400 : -400,
          { duration: 200 },
          () => runOnJS(handleDismiss)(),
        );
      } else {
        translateX.value = withSpring(0, { damping: 20, stiffness: 300 });
        opacity.value = withTiming(1, { duration: 150 });
        scale.value = withTiming(1, { duration: 150 });
      }
    }), [handleDismiss]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  const containerStyle = {
    position: 'absolute' as const,
    bottom: insets.top + 2 + index * 70,
    left: isDesktop ? undefined : 16,
    right: 16,
    width: isDesktop ? 384 : undefined,
    alignSelf: isDesktop ? ('flex-end' as const) : undefined,
    zIndex: 9999 - index,
    elevation: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: isDark ? 0.45 : 0.1,
    shadowRadius: 16,
  };

  return (
    <GestureDetector gesture={gesture}>
      <Reanimated.View
        style={[animatedStyle, containerStyle]}
        className="bg-md-surfaceContainer-high-light dark:bg-md-surfaceContainer-high-dark rounded-lg overflow-hidden"
      >
        <ToastInner
          notification={notification}
          accentColor={accentColor}
          isDark={isDark}
          onDismiss={handleDismiss}
        />
      </Reanimated.View>
    </GestureDetector>
  );
};
