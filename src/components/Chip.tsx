import React from 'react';

import { useTheme } from '../theme';
import { AppText } from './AppText';
import { Glass } from './Glass';
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
    >
      <Glass
        intensity={selected ? 'action' : 'soft'}
        radius={theme.radius.pill}
        style={{
          minHeight: 40,
          paddingHorizontal: theme.space.md,
          paddingVertical: theme.space.xs,
          justifyContent: 'center',
        }}
      >
        <AppText
          variant="footnote"
          color={theme.colors.onGlass}
          style={{ fontWeight: selected ? '700' : '600', textAlign: 'center' }}
        >
          {label}
        </AppText>
      </Glass>
    </PressScale>
  );
}
