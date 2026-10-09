import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MAX_GROUP_MESSAGE_CHARS } from '../api/types';
import type { LocalAttachment } from '../features/media/limits';
import { useTheme } from '../theme';
import { AppText } from './AppText';
import { AttachmentStrip } from './AttachmentStrip';
import { Button } from './Button';
import { Chip } from './Chip';
import { TextField } from './TextField';
import { TextLink } from './TextLink';

export function ChatComposer({
  value,
  onChangeText,
  onSend,
  sending,
  canAnnounce,
  announce,
  onToggleAnnounce,
  disabled,
  maxLength = MAX_GROUP_MESSAGE_CHARS,
  attachments = [],
  onPickImage,
  onPickFile,
  onRemoveAttachment,
  allowAttach = false,
}: {
  value: string;
  onChangeText: (value: string) => void;
  onSend: () => void;
  sending: boolean;
  canAnnounce: boolean;
  announce: boolean;
  onToggleAnnounce: () => void;
  disabled?: boolean;
  maxLength?: number;
  attachments?: LocalAttachment[];
  onPickImage?: () => void;
  onPickFile?: () => void;
  onRemoveAttachment?: (localId: string) => void;
  allowAttach?: boolean;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const count = [...value].length;
  const canSend = Boolean(value.trim() || attachments.length > 0);
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
      {allowAttach ? (
        <AttachmentStrip
          files={attachments}
          uploading={sending}
          onRemove={id => onRemoveAttachment?.(id)}
        />
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
            maxLength={maxLength}
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
          disabled={disabled || sending || !canSend}
          accessibilityLabel="Send"
        />
      </View>
      {allowAttach ? (
        <View
          style={{
            flexDirection: 'row',
            gap: theme.space.md,
            marginTop: theme.space.xs,
          }}
        >
          <TextLink
            label="Photo"
            align="start"
            onPress={() => onPickImage?.()}
          />
          <TextLink label="File" align="start" onPress={() => onPickFile?.()} />
        </View>
      ) : null}
      <AppText
        variant="caption"
        color={theme.colors.textMuted}
        style={{
          marginTop: theme.space.xs,
          letterSpacing: 0,
          fontWeight: '400',
        }}
      >
        {count}/{maxLength}
      </AppText>
    </View>
  );
}
