import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

import { glassSurface, useReduceMotion, useTheme } from '../theme';
import { AppText } from './AppText';

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
  const size = compact ? 64 : 88;
  const glass = glassSurface(theme, 'strong');

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
      <View
        style={[
          glass,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            alignItems: 'center',
            justifyContent: 'center',
          },
        ]}
      >
        <View
          style={{
            width: 18,
            height: 18,
            borderRadius: 9,
            backgroundColor: theme.colors.brand,
          }}
        />
      </View>
      <AppText
        variant={compact ? 'title' : 'display'}
        color={theme.colors.text}
        style={{ marginTop: theme.space.md }}
      >
        StudySync
      </AppText>
    </Animated.View>
  );
}
