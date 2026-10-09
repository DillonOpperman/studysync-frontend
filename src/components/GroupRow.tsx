import React from 'react';
import { View } from 'react-native';

import type { GroupDto } from '../api/types';
import { glassSurface, useTheme } from '../theme';
import { AppText } from './AppText';
import { PressScale } from './PressScale';

export function GroupRow({
  group,
  last,
  onPress,
  caption,
}: {
  group: GroupDto;
  last?: boolean;
  onPress?: () => void;
  caption?: string;
}) {
  const theme = useTheme();
  const meta = [
    `${group.memberCount}/${group.maxMembers}`,
    group.status !== 'active' ? group.status : null,
    group.pendingJoinRequest ? 'request pending' : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const body = (
    <View
      style={[
        glassSurface(theme, 'soft'),
        {
          paddingVertical: 16,
          paddingHorizontal: 16,
          borderRadius: theme.radius.lg,
          marginBottom: last ? 0 : theme.space.sm,
        },
      ]}
    >
      <AppText variant="headline">{group.title}</AppText>
      <AppText
        variant="subhead"
        color={theme.colors.textSecondary}
        style={{ marginTop: 3 }}
      >
        {group.subject}
      </AppText>
      <AppText
        variant="footnote"
        color={theme.colors.textMuted}
        style={{ marginTop: 4 }}
      >
        {meta}
      </AppText>
      {caption ? (
        <AppText
          variant="footnote"
          color={theme.colors.textMuted}
          style={{ marginTop: 4 }}
        >
          {caption}
        </AppText>
      ) : null}
      {group.description ? (
        <AppText
          variant="subhead"
          color={theme.colors.textMuted}
          numberOfLines={2}
          style={{ marginTop: 6 }}
        >
          {group.description}
        </AppText>
      ) : null}
    </View>
  );

  if (!onPress) {
    return body;
  }

  return (
    <PressScale
      accessibilityRole="button"
      accessibilityLabel={group.title}
      onPress={onPress}
    >
      {body}
    </PressScale>
  );
}
