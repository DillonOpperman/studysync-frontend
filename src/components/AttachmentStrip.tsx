import React from 'react';
import { View } from 'react-native';

import type { LocalAttachment } from '../features/media/limits';
import { formatByteSize } from '../features/media/validateSelection';
import { useTheme } from '../theme';
import { AppText } from './AppText';
import { Glass } from './Glass';
import { TextLink } from './TextLink';

export function AttachmentStrip({
  files,
  uploading,
  onRemove,
}: {
  files: LocalAttachment[];
  uploading?: boolean;
  onRemove: (localId: string) => void;
}) {
  const theme = useTheme();
  if (files.length === 0) {
    return null;
  }
  return (
    <View style={{ marginBottom: theme.space.sm, gap: theme.space.xs }}>
      {files.map(file => (
        <Glass
          key={file.localId}
          intensity="soft"
          radius={theme.radius.md}
          style={{ paddingHorizontal: 12, paddingVertical: 8 }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: theme.space.sm,
            }}
          >
            <View style={{ flex: 1 }}>
              <AppText variant="callout" color={theme.colors.onGlass}>
                {file.name}
              </AppText>
              <AppText variant="caption" color={theme.colors.onGlassMuted}>
                {file.kind === 'image' ? 'Image' : 'File'} ·{' '}
                {formatByteSize(file.size)}
                {file.mediaId ? ' · ready' : ''}
                {uploading && !file.mediaId ? ' · uploading' : ''}
              </AppText>
            </View>
            <TextLink
              label="Remove"
              tone="danger"
              onPress={() => onRemove(file.localId)}
            />
          </View>
        </Glass>
      ))}
    </View>
  );
}
