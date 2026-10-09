import React from 'react';

import { useTheme } from '../theme';
import { AppText } from './AppText';
import { PressScale } from './PressScale';

export function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <PressScale
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      onPress={onPress}
      style={{
        minHeight: 36,
        paddingHorizontal: theme.space.sm,
        paddingVertical: theme.space.xs,
        borderRadius: theme.radius.sm,
        backgroundColor: selected ? theme.colors.accent : theme.colors.surface,
        borderWidth: selected ? 0 : theme.control.hairline,
        borderColor: theme.colors.border,
        justifyContent: 'center',
      }}
    >
      <AppText
        variant="footnote"
        color={selected ? theme.colors.textInverse : theme.colors.textSecondary}
        style={{ fontWeight: '600' }}
      >
        {label}
      </AppText>
    </PressScale>
  );
}
