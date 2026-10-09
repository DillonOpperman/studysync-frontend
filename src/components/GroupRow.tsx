import React from 'react';
import { View } from 'react-native';

import type { GroupDto } from '../api/types';
import { useTheme } from '../theme';
import { AppText } from './AppText';
import { Glass } from './Glass';
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
    <Glass
      intensity="soft"
      radius={theme.radius.md}
      style={{ marginBottom: last ? 0 : theme.space.sm }}
    >
      <View style={{ paddingVertical: 16, paddingHorizontal: 16 }}>
        <AppText variant="headline" color={theme.colors.onGlass}>
          {group.title}
        </AppText>
        <AppText
          variant="subhead"
          color={theme.colors.onGlassMuted}
          style={{ marginTop: 3 }}
        >
          {group.subject}
        </AppText>
        <AppText
          variant="footnote"
          color={theme.colors.onGlassMuted}
          style={{ marginTop: 4 }}
        >
          {meta}
        </AppText>
        {caption ? (
          <AppText
            variant="footnote"
            color={theme.colors.onGlassMuted}
            style={{ marginTop: 4 }}
          >
            {caption}
          </AppText>
        ) : null}
        {group.description ? (
          <AppText
            variant="subhead"
            color={theme.colors.onGlassMuted}
            numberOfLines={2}
            style={{ marginTop: 6 }}
          >
            {group.description}
          </AppText>
        ) : null}
      </View>
    </Glass>
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
