import React from 'react';
import { View } from 'react-native';

import { useTheme } from '../theme';
import { AppText } from './AppText';
import { Glass } from './Glass';

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
  return (
    <Glass
      intensity="strong"
      radius={dim / 2}
      style={{ width: dim, height: dim }}
    >
      <View
        accessibilityLabel={`${name} avatar`}
        style={{
          width: dim,
          height: dim,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AppText
          variant="footnote"
          color={theme.colors.onGlass}
          style={{ fontWeight: '700' }}
        >
          {initialsFromName(name)}
        </AppText>
      </View>
    </Glass>
  );
}
