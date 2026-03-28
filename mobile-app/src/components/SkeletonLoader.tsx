import React, { useEffect } from 'react';
import { View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { COLORS, SIZES } from '../theme/theme';

interface SkeletonBoxProps {
  width?: number | `${number}%`;
  height?: number;
  style?: ViewStyle;
  borderRadius?: number;
}

export function SkeletonBox({
  width = '100%',
  height = 16,
  style,
  borderRadius = SIZES.borderRadiusSmall,
}: SkeletonBoxProps) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        { width: width as any, height, borderRadius, backgroundColor: COLORS.secondary },
        animatedStyle,
        style,
      ]}
    />
  );
}

export function DashboardSkeleton() {
  return (
    <View style={{ padding: SIZES.spacingMD, gap: SIZES.spacingMD }}>
      {/* Hero card */}
      <View style={{
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.borderRadiusLarge,
        padding: SIZES.spacingLG,
        gap: SIZES.spacingSM,
      }}>
        <SkeletonBox width="60%" height={28} borderRadius={SIZES.borderRadius} />
        <SkeletonBox width="40%" height={16} />
        <View style={{ marginTop: SIZES.spacingSM }}>
          <SkeletonBox width="100%" height={8} borderRadius={4} />
        </View>
      </View>

      {/* Section cards */}
      {[0, 1, 2].map((i) => (
        <View key={i} style={{
          backgroundColor: COLORS.surface,
          borderRadius: SIZES.borderRadiusMedium,
          padding: SIZES.spacingMD,
          gap: SIZES.spacingSM,
          borderLeftWidth: 4,
          borderLeftColor: COLORS.secondary,
        }}>
          <SkeletonBox width="50%" height={18} borderRadius={SIZES.borderRadius} />
          <SkeletonBox width="90%" height={14} />
          <SkeletonBox width="70%" height={14} />
        </View>
      ))}
    </View>
  );
}
