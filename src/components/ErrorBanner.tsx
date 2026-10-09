import React from 'react';
import { View } from 'react-native';

import { useTheme } from '../theme';
import { AppText } from './AppText';
import { Glass } from './Glass';

export function ErrorBanner({ message }: { message: string | null }) {
  const theme = useTheme();
  if (!message) {
    return null;
  }
  return (
    <Glass
      intensity="strong"
      radius={theme.radius.md}
      style={{ marginBottom: theme.space.md }}
    >
      <View style={{ padding: theme.space.md }}>
        <AppText variant="footnote" color={theme.colors.danger}>
          {message}
        </AppText>
      </View>
    </Glass>
  );
}
