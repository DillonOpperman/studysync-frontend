import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useReduceMotion, useTheme } from '../theme';

export function PressScale({
  children,
  style,
  disabled,
  onPressIn,
  onPressOut,
  ...rest
}: PressableProps & { style?: StyleProp<ViewStyle> }) {
  const theme = useTheme();
  const reduceMotion = useReduceMotion();
  const scale = useRef(new Animated.Value(1)).current;

  function animate(value: number) {
    if (reduceMotion) {
      scale.setValue(1);
      return;
    }
    Animated.timing(scale, {
      toValue: value,
      duration: theme.motion.fast,
      useNativeDriver: true,
    }).start();
  }

  return (
    <Pressable
      disabled={disabled}
      {...rest}
      onPressIn={(event: GestureResponderEvent) => {
        animate(theme.motion.pressScale);
        onPressIn?.(event);
      }}
      onPressOut={(event: GestureResponderEvent) => {
        animate(1);
        onPressOut?.(event);
      }}
    >
      {state => (
        <Animated.View style={[{ transform: [{ scale }] }, style]}>
          {typeof children === 'function' ? children(state) : children}
        </Animated.View>
      )}
    </Pressable>
  );
}
