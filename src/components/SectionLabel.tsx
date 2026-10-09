import React from 'react';

import { useTheme } from '../theme';
import { AppText } from './AppText';

export function SectionLabel({
  children,
  first,
}: {
  children: string;
  first?: boolean;
}) {
  const theme = useTheme();
  return (
    <AppText
      variant="caption"
      color={theme.colors.textMuted}
      style={{
        marginTop: first ? theme.space.sm : theme.space.xl,
        marginBottom: theme.space.sm,
        textTransform: 'uppercase',
        letterSpacing: 0.9,
      }}
    >
      {children}
    </AppText>
  );
}
