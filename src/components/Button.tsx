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
  const glass = glassSurface(theme, 'soft');
  const bg =
    tone === 'primary'
      ? theme.colors.accent
      : tone === 'danger'
      ? theme.colors.danger
      : tone === 'secondary'
      ? glass.backgroundColor
      : 'transparent';
  const fg =
    tone === 'primary' || tone === 'danger'
      ? theme.colors.textInverse
      : tone === 'secondary'
      ? theme.colors.text
      : theme.colors.brand;
  const spinner =
    tone === 'primary' || tone === 'danger'
      ? theme.colors.textInverse
      : theme.colors.brand;
  const size = theme.control.circle;

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
        tone === 'secondary' ? glass : null,
        {
          minHeight: round ? size : theme.control.minHeight,
          width: round ? size : undefined,
          height: round ? size : undefined,
          borderRadius: theme.radius.pill,
          backgroundColor: bg,
          opacity: inactive ? 0.4 : 1,
          paddingHorizontal: round ? 0 : theme.space.lg,
          borderWidth: tone === 'secondary' ? 1 : 0,
          borderColor:
            tone === 'secondary' ? theme.colors.glassEdge : 'transparent',
        },
      ]}
    >
      <View style={[styles.inner, round ? { minHeight: size } : null]}>
        {loading ? (
          <ActivityIndicator color={spinner} />
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
