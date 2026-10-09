import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

import { useReduceMotion, useTheme } from '../theme';

export function Skeleton({
  width = '100%',
  height = 14,
}: {
  width?: number | `${number}%`;
  height?: number;
}) {
  const theme = useTheme();
  const reduceMotion = useReduceMotion();
  const pulse = useRef(new Animated.Value(0.55)).current;

  useEffect(() => {
    if (reduceMotion) {
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.55,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, reduceMotion]);

  return (
    <Animated.View
      accessible
      accessibilityLabel="Loading"
      style={{
        width,
        height,
        borderRadius: theme.radius.sm,
        backgroundColor: theme.colors.skeleton,
        opacity: pulse,
        marginBottom: theme.space.sm,
      }}
    />
  );
}

export function GroupListSkeleton() {
  const theme = useTheme();
  return (
    <View style={{ paddingTop: theme.space.sm }}>
      <Skeleton width="55%" height={18} />
      <Skeleton width="40%" height={12} />
      <View style={{ height: theme.space.md }} />
      <Skeleton width="70%" height={18} />
      <Skeleton width="35%" height={12} />
    </View>
  );
}
