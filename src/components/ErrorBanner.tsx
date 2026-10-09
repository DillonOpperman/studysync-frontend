import React from 'react';
import { View } from 'react-native';

import { useTheme } from '../theme';
import { AppText } from './AppText';

export function ErrorBanner({ message }: { message: string | null }) {
  const theme = useTheme();
  if (!message) {
    return null;
  }
  return (
    <View
      accessibilityRole="alert"
      style={{
        backgroundColor: theme.colors.dangerSoft,
        borderRadius: theme.radius.md,
        padding: theme.space.md,
        marginBottom: theme.space.md,
      }}
    >
      <AppText variant="footnote" color={theme.colors.danger}>
        {message}
      </AppText>
    </View>
  );
}
