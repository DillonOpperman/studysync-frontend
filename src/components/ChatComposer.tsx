import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();
  const count = [...value].length;
  return (
    <View
      style={{
        paddingTop: theme.space.sm,
        paddingBottom: Math.max(insets.bottom, theme.space.sm),
        backgroundColor: 'transparent',
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
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          gap: theme.space.sm,
        }}
      >
        <View style={{ flex: 1 }}>
          <TextField
            label="Message"
            hideLabel
            placeholder="Message"
            value={value}
            onChangeText={onChangeText}
            multiline
            editable={!disabled}
            maxLength={MAX_GROUP_MESSAGE_CHARS}
            returnKeyType="send"
            blurOnSubmit={false}
            onSubmitEditing={onSend}
          />
        </View>
        <Button
          label="Go"
          round
          onPress={onSend}
          loading={sending}
          disabled={disabled || sending || !value.trim()}
          accessibilityLabel="Send"
        />
      </View>
      <AppText
        variant="caption"
        color={theme.colors.textMuted}
        style={{
          marginTop: theme.space.xs,
          letterSpacing: 0,
          fontWeight: '400',
        }}
      >
        {count}/{MAX_GROUP_MESSAGE_CHARS}
      </AppText>
    </View>
  );
}
