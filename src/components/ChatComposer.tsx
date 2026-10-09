import React from 'react';
import { View } from 'react-native';

import { MAX_GROUP_MESSAGE_CHARS } from '../api/types';
import { useTheme } from '../theme';
import { AppText } from './AppText';
import { Button } from './Button';
import { Chip } from './Chip';
import { TextField } from './TextField';

export function ChatComposer({
  value,
  onChangeText,
  onSend,
  sending,
  canAnnounce,
  announce,
  onToggleAnnounce,
  disabled,
}: {
  value: string;
  onChangeText: (value: string) => void;
  onSend: () => void;
  sending: boolean;
  canAnnounce: boolean;
  announce: boolean;
  onToggleAnnounce: () => void;
  disabled?: boolean;
}) {
  const theme = useTheme();
  const count = [...value].length;
  return (
    <View
      style={{
        borderTopWidth: theme.control.hairline,
        borderTopColor: theme.colors.divider,
        paddingTop: theme.space.sm,
        paddingBottom: theme.space.sm,
        backgroundColor: theme.colors.canvas,
      }}
    >
      {canAnnounce ? (
        <View style={{ marginBottom: theme.space.xs }}>
          <Chip
            label={announce ? 'Announcement' : 'Post as announcement'}
            selected={announce}
            onPress={onToggleAnnounce}
          />
        </View>
      ) : null}
      <TextField
        label="Message"
        value={value}
        onChangeText={onChangeText}
        multiline
        editable={!disabled}
        maxLength={MAX_GROUP_MESSAGE_CHARS}
        returnKeyType="send"
        blurOnSubmit={false}
        onSubmitEditing={onSend}
      />
      <View
        style={{
          marginTop: theme.space.sm,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: theme.space.sm,
        }}
      >
        <AppText variant="caption" color={theme.colors.textMuted}>
          {count}/{MAX_GROUP_MESSAGE_CHARS}
        </AppText>
        <View style={{ minWidth: 120 }}>
          <Button
            label="Send"
            onPress={onSend}
            loading={sending}
            disabled={disabled || sending || !value.trim()}
          />
        </View>
      </View>
    </View>
  );
}
