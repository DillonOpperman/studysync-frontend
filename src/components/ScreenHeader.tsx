import React from 'react';
import { View } from 'react-native';

import { useTheme } from '../theme';
import { AppText } from './AppText';
import { TextLink } from './TextLink';

export function ScreenHeader({
  title,
  onBack,
  action,
}: {
  title: string;
  onBack?: () => void;
  action?: React.ReactNode;
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: theme.space.md,
        minHeight: 44,
      }}
    >
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
        {onBack ? (
          <TextLink label="Back" tone="accent" align="start" onPress={onBack} />
        ) : null}
      </View>
      <AppText
        variant="headline"
        style={{ flexShrink: 1, textAlign: 'center' }}
        numberOfLines={1}
      >
        {title}
      </AppText>
      <View style={{ flex: 1, alignItems: 'flex-end' }}>{action}</View>
    </View>
  );
}
