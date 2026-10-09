import React from 'react';

import { glassSurface, useTheme } from '../theme';
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
  const glass = glassSurface(theme, selected ? 'action' : 'soft');
  return (
    <PressScale
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      onPress={onPress}
      style={[
        glass,
        {
          minHeight: 40,
          paddingHorizontal: theme.space.md,
          paddingVertical: theme.space.xs,
          borderRadius: theme.radius.pill,
          backgroundColor: glass.backgroundColor,
          borderWidth: selected ? 1.5 : 1,
          borderColor: selected
            ? 'rgba(28, 20, 16, 0.35)'
            : theme.colors.glassEdge,
          justifyContent: 'center',
        },
      ]}
    >
      <AppText
        variant="footnote"
        color={theme.colors.onGlass}
        style={{ fontWeight: selected ? '700' : '600' }}
      >
        {label}
      </AppText>
    </PressScale>
  );
}
