import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import { useColorScheme } from 'nativewind';
import { BookOpen } from 'lucide-react-native';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const finishedRef = useRef(false);

  const iconOpacity = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0.6)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(20)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineTranslateY = useRef(new Animated.Value(15)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;
  const progress = useRef(new Animated.Value(0)).current;

  const safeFinish = useCallback(() => {
    if (!finishedRef.current) {
      finishedRef.current = true;
      onFinish();
    }
  }, [onFinish]);

  useEffect(() => {
    const timer = setTimeout(safeFinish, 5000);
    return () => clearTimeout(timer);
  }, [safeFinish]);

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 2500,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, []);

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.parallel([
        Animated.timing(iconOpacity, {
          toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: false,
        }),
        Animated.spring(iconScale, {
          toValue: 1, friction: 5, tension: 40, useNativeDriver: false,
        }),
      ]),
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: false,
        }),
        Animated.timing(titleTranslateY, {
          toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: false,
        }),
        Animated.timing(taglineOpacity, {
          toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: false,
        }),
        Animated.timing(taglineTranslateY, {
          toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: false,
        }),
      ]),
      Animated.delay(800),
      Animated.timing(fadeOut, {
        toValue: 0, duration: 500, easing: Easing.in(Easing.cubic), useNativeDriver: false,
      }),
    ]);
    animation.start(() => safeFinish());

    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      className="absolute inset-0 z-50"
      style={{ opacity: fadeOut, backgroundColor: isDark ? '#1C1B1F' : '#FFFBFE' }}
    >
      <View className="flex-1 items-center justify-center">
        <Animated.View
          className="items-center justify-center mb-8"
          style={{ opacity: iconOpacity, transform: [{ scale: iconScale }] }}
        >
          <View
            className="w-20 h-20 rounded-[20px] items-center justify-center"
            style={{ backgroundColor: isDark ? '#4F378B' : '#EADDFF' }}
          >
            <BookOpen size={36} color={isDark ? '#D0BCFF' : '#6750A4'} />
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: titleOpacity, transform: [{ translateY: titleTranslateY }] }}>
          <Text
            className="text-[42px] font-bold tracking-tight"
            style={{ color: isDark ? '#E6E1E5' : '#1C1B1F', fontFamily: 'system-ui', letterSpacing: -1 }}
          >
            Shelve
          </Text>
        </Animated.View>

        <Animated.View style={{ opacity: taglineOpacity, transform: [{ translateY: taglineTranslateY }] }}>
          <Text
            className="text-[15px] mt-2 tracking-wide"
            style={{ color: isDark ? '#CAC4D0' : '#49454F', fontFamily: 'system-ui', fontStyle: 'italic', letterSpacing: 2 }}
          >
            Discover timeless books
          </Text>
        </Animated.View>
      </View>

      <View
        className="absolute bottom-24 left-12 right-12 h-[3px] rounded-full overflow-hidden"
        style={{ backgroundColor: isDark ? 'rgba(208, 188, 255, 0.12)' : 'rgba(103, 80, 164, 0.12)' }}
      >
        <Animated.View
          className="h-full rounded-full"
          style={{
            width: progress.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
            backgroundColor: isDark ? '#D0BCFF' : '#6750A4',
          }}
        />
      </View>
    </Animated.View>
  );
};
