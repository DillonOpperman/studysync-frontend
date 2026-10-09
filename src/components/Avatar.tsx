import React from 'react';
import { View } from 'react-native';

import { glassSurface, useTheme } from '../theme';
import { AppText } from './AppText';

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '?';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function Avatar({ name, size }: { name: string; size?: number }) {
  const theme = useTheme();
  const dim = size ?? theme.control.avatar;
  const glass = glassSurface(theme, 'strong');
  return (
    <View
      accessibilityLabel={`${name} avatar`}
      style={[
        glass,
        {
          width: dim,
          height: dim,
          borderRadius: dim / 2,
          alignItems: 'center',
          justifyContent: 'center',
        },
      ]}
    >
      <AppText
        variant="footnote"
        color={theme.colors.brandPressed}
        style={{ fontWeight: '700' }}
      >
        {initialsFromName(name)}
      </AppText>
    </View>
  );
}
