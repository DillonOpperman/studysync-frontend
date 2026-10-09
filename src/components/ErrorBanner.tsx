import React from 'react';
import { View } from 'react-native';

import { glassSurface, useTheme } from '../theme';
import { AppText } from './AppText';

export function ErrorBanner({ message }: { message: string | null }) {
  const theme = useTheme();
  if (!message) {
    return null;
  }
  return (
    <View
      accessibilityRole="alert"
      style={[
        glassSurface(theme, 'strong'),
        {
          backgroundColor: theme.colors.dangerSoft,
          borderRadius: theme.radius.lg,
          padding: theme.space.md,
          marginBottom: theme.space.md,
          borderColor: 'rgba(180, 35, 24, 0.2)',
        },
      ]}
    >
      <AppText variant="footnote" color={theme.colors.danger}>
        {message}
      </AppText>
    </View>
  );
}
