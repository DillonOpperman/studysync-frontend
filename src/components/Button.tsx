import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useTheme } from '../theme';
import { AppText } from './AppText';
import { PressScale } from './PressScale';

type Tone = 'primary' | 'secondary' | 'ghost' | 'danger';

export function Button({
  label,
  onPress,
  loading,
  disabled,
  tone = 'primary',
  accessibilityHint,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  tone?: Tone;
  accessibilityHint?: string;
}) {
  const theme = useTheme();
  const inactive = disabled || loading;
  const bg =
    tone === 'primary'
      ? theme.colors.accent
      : tone === 'danger'
      ? theme.colors.danger
      : tone === 'secondary'
      ? theme.colors.accentSoft
      : 'transparent';
  const fg =
    tone === 'primary' || tone === 'danger'
      ? theme.colors.textInverse
      : tone === 'secondary'
      ? theme.colors.accent
      : theme.colors.accent;
  const spinner =
    tone === 'primary' || tone === 'danger'
      ? theme.colors.textInverse
      : theme.colors.accent;

  return (
    <PressScale
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: !!loading }}
      onPress={onPress}
      disabled={inactive}
      style={[
        styles.base,
        {
          minHeight: theme.control.minHeight,
          borderRadius: theme.radius.md,
          backgroundColor: bg,
          opacity: inactive ? 0.55 : 1,
          paddingHorizontal: theme.space.lg,
        },
      ]}
    >
      <View style={styles.inner}>
        {loading ? (
          <ActivityIndicator color={spinner} />
        ) : (
          <AppText variant="headline" color={fg}>
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
    minHeight: 48,
  },
});
