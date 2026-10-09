import React from 'react';
import { View } from 'react-native';

import type { GroupDto } from '../api/types';
import { hairlineWidth, useTheme } from '../theme';
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
  const body = (
    <View
      style={{
        paddingVertical: theme.space.md,
        borderBottomWidth: last ? 0 : hairlineWidth(),
        borderBottomColor: theme.colors.divider,
      }}
    >
      <AppText variant="headline">{group.title}</AppText>
      <AppText
        variant="subhead"
        color={theme.colors.textSecondary}
        style={{ marginTop: 2 }}
      >
        {group.subject}
      </AppText>
      <AppText
        variant="footnote"
        color={theme.colors.textMuted}
        style={{ marginTop: theme.space.xxs }}
      >
        {group.memberCount}/{group.maxMembers} members
        {group.status !== 'active' ? ` · ${group.status}` : ''}
        {group.pendingJoinRequest ? ' · request pending' : ''}
      </AppText>
      {caption ? (
        <AppText
          variant="footnote"
          color={theme.colors.textMuted}
          style={{ marginTop: theme.space.xxs }}
        >
          {caption}
        </AppText>
      ) : null}
      {group.description ? (
        <AppText
          variant="subhead"
          color={theme.colors.textMuted}
          numberOfLines={2}
          style={{ marginTop: theme.space.xs }}
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
