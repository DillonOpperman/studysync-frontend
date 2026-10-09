import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

import { useReduceMotion, useTheme } from '../theme';
import { AppText } from './AppText';

export function BrandMark({ compact = false }: { compact?: boolean }) {
  const theme = useTheme();
  const reduceMotion = useReduceMotion();
  const opacity = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;

  useEffect(() => {
    if (reduceMotion) {
      return;
    }
    Animated.timing(opacity, {
      toValue: 1,
      duration: theme.motion.normal,
      useNativeDriver: true,
    }).start();
  }, [opacity, reduceMotion, theme.motion.normal]);

  return (
    <Animated.View style={{ opacity }}>
      <AppText
        variant={compact ? 'title' : 'display'}
        color={theme.colors.text}
      >
        StudySync
      </AppText>
      <View
        style={{
          marginTop: theme.space.xs,
          width: compact ? 28 : 36,
          height: 2,
          borderRadius: 1,
          backgroundColor: theme.colors.caramel,
        }}
      />
    </Animated.View>
  );
}
