import React from 'react';
import { View } from 'react-native';

import type { ChatMessage } from '../features/chat/messageStore';
import { glassSurface, useTheme } from '../theme';
import { AppText } from './AppText';
import { TextLink } from './TextLink';

function formatTime(iso: string): string {
  const date = new Date(iso);
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

export function MessageBubble({
  message,
  mine,
  senderName,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
  onReact,
}: {
  message: ChatMessage;
  mine: boolean;
  senderName: string;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onReact: (emoji: string) => void;
}) {
  const theme = useTheme();
  const announcement = message.messageType === 'announcement';
  const deleted = Boolean(message.deletedAt);
  const outgoing = mine && !announcement && !deleted;
  const bg = deleted
    ? theme.colors.skeleton
    : announcement
    ? theme.colors.brandSoft
    : theme.colors.glassStrong;
  const fg = deleted ? theme.colors.onGlassMuted : theme.colors.onGlass;
  const align = mine ? 'flex-end' : 'flex-start';
  return (
    <View style={{ alignSelf: align, maxWidth: '84%', marginVertical: 5 }}>
      <AppText variant="caption" color={theme.colors.textMuted}>
        {senderName}
        {announcement ? ' · announcement' : ''}
        {message.pending ? ' · sending' : ''}
        {message.failed ? ' · not sent' : ''}
      </AppText>
      <View
        style={[
          deleted ? null : glassSurface(theme, outgoing ? 'action' : 'strong'),
          {
            marginTop: 5,
            paddingVertical: 11,
            paddingHorizontal: 16,
            borderRadius: theme.radius.lg,
            backgroundColor: bg,
            borderWidth: deleted ? 0 : 1,
            borderColor: announcement
              ? 'rgba(196, 92, 50, 0.28)'
              : outgoing
              ? 'rgba(28, 20, 16, 0.22)'
              : theme.colors.glassEdge,
          },
        ]}
      >
        <AppText
          variant="body"
          color={fg}
          style={deleted ? { fontStyle: 'italic' } : undefined}
        >
          {deleted ? 'Message deleted' : message.content}
        </AppText>
      </View>
      <AppText
        variant="caption"
        color={theme.colors.textMuted}
        style={{ marginTop: 4, letterSpacing: 0, fontWeight: '400' }}
      >
        {formatTime(message.createdAt)}
        {message.editedAt ? ' · edited' : ''}
      </AppText>
      {!deleted && message.reactions.length > 0 ? (
        <AppText
          variant="footnote"
          color={theme.colors.textSecondary}
          style={{ marginTop: 4 }}
        >
          {message.reactions.map(row => `${row.emoji} ${row.count}`).join('  ')}
        </AppText>
      ) : null}
      {!deleted && !message.pending ? (
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: theme.space.xs,
            marginTop: 2,
          }}
        >
          {['👍', '❤️', '😂'].map(emoji => (
            <TextLink
              key={emoji}
              label={emoji}
              onPress={() => onReact(emoji)}
            />
          ))}
          {canEdit ? <TextLink label="Edit" onPress={onEdit} /> : null}
          {canDelete ? (
            <TextLink label="Delete" tone="danger" onPress={onDelete} />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
