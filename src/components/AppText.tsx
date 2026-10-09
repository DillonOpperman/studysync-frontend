import React from 'react';
import { Text, type TextProps, type TextStyle } from 'react-native';

import { useTheme } from '../theme';
import { type } from '../theme/tokens';

type Variant = keyof typeof type;

export function AppText({
  variant = 'body',
  color,
  children,
  style,
  ...rest
}: TextProps & {
  variant?: Variant;
  color?: string;
}) {
  const theme = useTheme();
  const preset = theme.type[variant];
  const textStyle: TextStyle = {
    ...preset,
    color: color ?? theme.colors.text,
  };
  return (
    <Text
      maxFontSizeMultiplier={
        variant === 'display' || variant === 'title' ? 1.35 : 1.6
      }
      style={[textStyle, style]}
      {...rest}
    >
      {children}
    </Text>
  );
}
