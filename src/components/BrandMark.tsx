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
          marginTop: compact ? 6 : 8,
          width: compact ? 36 : 48,
          height: 3,
          borderRadius: 2,
          backgroundColor: theme.colors.brand,
        }}
      />
    </Animated.View>
  );
}
