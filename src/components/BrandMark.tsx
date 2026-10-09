import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

import { useReduceMotion, useTheme } from '../theme';
import { AppText } from './AppText';
import { Glass } from './Glass';

export function BrandMark({
  compact = false,
  align = 'start',
}: {
  compact?: boolean;
  align?: 'start' | 'center';
}) {
  const theme = useTheme();
  const reduceMotion = useReduceMotion();
  const opacity = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  const size = compact ? 64 : 76;

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
    <Animated.View
      style={{
        opacity,
        alignItems: align === 'center' ? 'center' : 'flex-start',
      }}
    >
      <Glass
        intensity="strong"
        radius={size / 2}
        style={{
          width: size,
          height: size,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            width: size,
            height: size,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              width: 16,
              height: 16,
              borderRadius: 8,
              backgroundColor: theme.colors.brand,
            }}
          />
        </View>
      </Glass>
      <AppText
        variant={compact ? 'title' : 'display'}
        color={theme.colors.text}
        style={{ marginTop: theme.space.lg }}
      >
        StudySync
      </AppText>
    </Animated.View>
  );
}
