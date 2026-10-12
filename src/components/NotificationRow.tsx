import React from 'react';
import { View } from 'react-native';

import type { NotificationDto } from '../api/types';
import {
  notificationDestination,
  notificationMark,
} from '../features/notifications/destination';
import { hairlineWidth, useTheme } from '../theme';
import { AppText } from './AppText';
import { PressScale } from './PressScale';

function formatStamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function NotificationRow({
  note,
  last,
  onPress,
}: {
  note: NotificationDto;
  last?: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const unread = note.readAt == null;
  const dest = notificationDestination(note);
  const interactive = dest.kind !== 'none';

  return (
    <PressScale
      accessibilityRole={interactive ? 'button' : 'text'}
      accessibilityLabel={`${note.title}. ${note.body}`}
      accessibilityState={{ selected: unread }}
      disabled={!interactive && !unread}
      onPress={onPress}
      style={{
        marginBottom: last ? 0 : theme.space.sm,
        borderBottomWidth: last ? 0 : hairlineWidth(),
        borderBottomColor: theme.colors.divider,
        paddingBottom: theme.space.sm,
      }}
    >
      <View style={{ flexDirection: 'row', gap: theme.space.sm }}>
        <View
          style={{
            width: 3,
            borderRadius: 2,
            backgroundColor: unread ? theme.colors.accent : 'transparent',
            marginTop: 4,
            marginBottom: 4,
          }}
        />
        <AppText
          variant="caption"
          color={unread ? theme.colors.accent : theme.colors.textMuted}
          style={{ width: 18, marginTop: 2 }}
        >
          {notificationMark(note.type)}
        </AppText>
        <View style={{ flex: 1 }}>
          <AppText
            variant="callout"
            color={unread ? theme.colors.text : theme.colors.textSecondary}
            style={{ fontWeight: unread ? '600' : '400' }}
          >
            {note.title}
          </AppText>
          <AppText
            variant="footnote"
            color={theme.colors.textMuted}
            style={{ marginTop: 2 }}
          >
            {note.body}
          </AppText>
          <AppText
            variant="caption"
            color={theme.colors.textMuted}
            style={{ marginTop: 4 }}
          >
            {formatStamp(note.createdAt)}
            {unread ? ' · Unread' : ''}
          </AppText>
        </View>
      </View>
    </PressScale>
  );
}
