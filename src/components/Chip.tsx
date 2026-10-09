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
  const glass = glassSurface(theme, 'soft');
  return (
    <PressScale
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      onPress={onPress}
      style={[
        selected ? null : glass,
        {
          minHeight: 40,
          paddingHorizontal: theme.space.md,
          paddingVertical: theme.space.xs,
          borderRadius: theme.radius.pill,
          backgroundColor: selected ? theme.colors.accent : theme.colors.glass,
          borderWidth: 1,
          borderColor: selected ? theme.colors.accent : theme.colors.glassEdge,
          justifyContent: 'center',
        },
      ]}
    >
      <AppText
        variant="footnote"
        color={selected ? theme.colors.textInverse : theme.colors.text}
        style={{ fontWeight: '600' }}
      >
        {label}
      </AppText>
    </PressScale>
  );
}
