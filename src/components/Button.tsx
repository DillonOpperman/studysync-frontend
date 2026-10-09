import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { glassSurface, useTheme } from '../theme';
import { AppText } from './AppText';
import { PressScale } from './PressScale';

type Tone = 'primary' | 'secondary' | 'ghost' | 'danger';

export function Button({
  label,
  onPress,
  loading,
  disabled,
  tone = 'primary',
  round = false,
  accessibilityHint,
  accessibilityLabel,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  tone?: Tone;
  round?: boolean;
  accessibilityHint?: string;
  accessibilityLabel?: string;
}) {
  const theme = useTheme();
  const inactive = disabled || loading;
  const glass = glassSurface(
    theme,
    tone === 'primary' ? 'action' : tone === 'secondary' ? 'soft' : 'strong',
  );
  const fg =
    tone === 'danger'
      ? theme.colors.danger
      : tone === 'ghost'
      ? theme.colors.brand
      : theme.colors.onGlass;
  const size = theme.control.circle;
  const frosted = tone !== 'ghost';

  return (
    <PressScale
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: !!loading }}
      onPress={onPress}
      disabled={inactive}
      style={[
        styles.base,
        frosted ? glass : null,
        {
          minHeight: round ? size : theme.control.minHeight,
          width: round ? size : undefined,
          height: round ? size : undefined,
          borderRadius: theme.radius.pill,
          backgroundColor: frosted
            ? (glass.backgroundColor as string)
            : 'transparent',
          opacity: inactive ? 0.4 : 1,
          paddingHorizontal: round ? 0 : theme.space.lg,
          borderWidth: frosted ? 1 : 0,
          borderColor:
            tone === 'danger'
              ? 'rgba(180, 35, 24, 0.28)'
              : frosted
              ? (glass.borderColor as string)
              : 'transparent',
        },
      ]}
    >
      <View style={[styles.inner, round ? { minHeight: size } : null]}>
        {loading ? (
          <ActivityIndicator color={fg} />
        ) : (
          <AppText
            variant="headline"
            color={fg}
            style={{ letterSpacing: -0.2 }}
          >
            {label}
          </AppText>
        )}
      </View>
    </PressScale>
  );
}

const styles = StyleSheet.create({
  base: {
    justifyContent: 'center',
  },
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
});
