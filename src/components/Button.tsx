import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useTheme } from '../theme';
import { AppText } from './AppText';
import { Glass } from './Glass';
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
  const fg =
    tone === 'danger'
      ? theme.colors.danger
      : tone === 'ghost'
      ? theme.colors.brand
      : theme.colors.onGlass;
  const size = theme.control.circle;
  const intensity = tone === 'primary' ? 'action' : 'soft';

  const body = (
    <View
      style={[
        styles.inner,
        round ? { minHeight: size, width: size, paddingHorizontal: 0 } : null,
        tone === 'ghost' ? { minHeight: 44, paddingHorizontal: 0 } : null,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <AppText variant="headline" color={fg}>
          {label}
        </AppText>
      )}
    </View>
  );

  return (
    <PressScale
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: !!loading }}
      onPress={onPress}
      disabled={inactive}
      style={{ opacity: inactive ? 0.45 : 1 }}
    >
      {tone === 'ghost' ? (
        body
      ) : (
        <Glass
          intensity={intensity}
          radius={round ? theme.radius.pill : theme.radius.md}
          style={{
            minHeight: round ? size : theme.control.minHeight,
            width: round ? size : undefined,
            height: round ? size : 54,
          }}
        >
          {body}
        </Glass>
      )}
    </PressScale>
  );
}

const styles = StyleSheet.create({
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 20,
  },
});
