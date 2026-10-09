import React from 'react';

import { useTheme } from '../theme';
import { AppText } from './AppText';
import { PressScale } from './PressScale';

export function TextLink({
  label,
  onPress,
  tone = 'accent',
  align = 'end',
}: {
  label: string;
  onPress: () => void;
  tone?: 'accent' | 'danger' | 'muted';
  align?: 'end' | 'start';
}) {
  const theme = useTheme();
  const color =
    tone === 'danger'
      ? theme.colors.danger
      : tone === 'muted'
      ? theme.colors.textMuted
      : theme.colors.accent;
  return (
    <PressScale
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={theme.control.hitSlop}
      onPress={onPress}
      style={{
        minHeight: 44,
        minWidth: 44,
        justifyContent: 'center',
        alignItems: align === 'start' ? 'flex-start' : 'flex-end',
      }}
    >
      <AppText variant="callout" color={color} style={{ fontWeight: '600' }}>
        {label}
      </AppText>
    </PressScale>
  );
}
