import React from 'react';
import { View } from 'react-native';

import { useTheme } from '../theme';
import { AppText } from './AppText';

export function EmptyState({ title, body }: { title: string; body: string }) {
  const theme = useTheme();
  return (
    <View style={{ paddingVertical: theme.space.xl }}>
      <AppText variant="headline">{title}</AppText>
      <AppText
        variant="subhead"
        color={theme.colors.textMuted}
        style={{ marginTop: theme.space.xs, maxWidth: 340 }}
      >
        {body}
      </AppText>
    </View>
  );
}
