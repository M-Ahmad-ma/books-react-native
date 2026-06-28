import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';

interface SkeletonProps {
  width?: number;
  height?: number;
  borderRadius?: number;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ width, height = 20, borderRadius = 4, className }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.4, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      className={className}
      style={{ width, height, borderRadius, backgroundColor: '#E4E0E8', opacity } as any}
    />
  );
};

export const SkeletonReaderHeader: React.FC = () => (
  <View className="flex-row items-center justify-between px-4 py-3">
    <View className="flex-row items-center flex-1">
      <Skeleton width={24} height={24} borderRadius={12} />
      <Skeleton width={180} height={18} borderRadius={4} className="ml-3" />
    </View>
    <Skeleton width={40} height={40} borderRadius={20} />
  </View>
);

export const SkeletonReaderContent: React.FC = () => (
  <View className="flex-1 px-5 py-4 gap-4">
    {([88, 95, 82, 90, 85, 78, 92, 88, 75, 95, 85, 80] as const).map((pct, i) => (
      <View key={i} style={{ width: `${pct}%` as any }}>
        <Skeleton height={14} borderRadius={4} />
      </View>
    ))}
  </View>
);

export const SkeletonBookCard: React.FC = () => (
  <View className="mr-3">
    <Skeleton width={160} height={224} borderRadius={12} />
    <View className="mt-2 gap-1.5">
      <Skeleton width={180} height={14} borderRadius={4} />
      <Skeleton width={90} height={12} borderRadius={4} />
    </View>
  </View>
);

export const SkeletonGrid: React.FC = () => (
  <View className="flex-row flex-wrap px-5 gap-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <View key={i} style={{ width: '47%' as any }}>
        <Skeleton height={200} borderRadius={12} />
        <View className="mt-2 gap-1.5">
          <View style={{ width: '85%' as any }}>
            <Skeleton height={14} borderRadius={4} />
          </View>
          <View style={{ width: '60%' as any }}>
            <Skeleton height={12} borderRadius={4} />
          </View>
        </View>
      </View>
    ))}
  </View>
);

export const SkeletonHorizontal: React.FC = () => (
  <View className="flex-row px-5 gap-3">
    {Array.from({ length: 4 }).map((_, i) => (
      <View key={i} style={{ width: 140 }}>
        <Skeleton height={200} borderRadius={12} />
        <View className="mt-2 gap-1.5">
          <Skeleton width={120} height={14} borderRadius={4} />
          <Skeleton width={80} height={12} borderRadius={4} />
        </View>
      </View>
    ))}
  </View>
);
