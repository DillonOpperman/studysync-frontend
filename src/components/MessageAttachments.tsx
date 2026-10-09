import React, { useState } from 'react';
import { Linking, View } from 'react-native';

import type { ApiClient } from '../api/client';
import { userFacingMessage } from '../api/errors';
import type { MediaDto } from '../api/types';
import { mediaContentRef } from '../features/media/contentUrl';
import { mediaApi } from '../features/media/mediaApi';
import { formatByteSize } from '../features/media/validateSelection';
import { useTheme } from '../theme';
import { AppText } from './AppText';
import { AuthorizedImage } from './AuthorizedImage';
import { TextLink } from './TextLink';

export function MessageAttachments({
  attachments,
  client,
  getAccessToken,
}: {
  attachments: MediaDto[];
  client: ApiClient;
  getAccessToken: () => string | null;
}) {
  const theme = useTheme();
  const [error, setError] = useState<string | null>(null);
  if (attachments.length === 0) {
    return null;
  }

  async function openFile(media: MediaDto) {
    setError(null);
    try {
      const fresh =
        media.downloadUrl &&
        !mediaContentRef(media.id, media.downloadUrl)?.needsAuth
          ? media
          : await mediaApi(client).get(media.id);
      const ref = mediaContentRef(fresh.id, fresh.downloadUrl);
      if (!ref) {
        setError('This file is no longer available.');
        return;
      }
      if (ref.needsAuth) {
        setError('This file needs a refreshed link. Try again.');
        return;
      }
      await Linking.openURL(ref.uri);
    } catch (caught) {
      setError(userFacingMessage(caught));
    }
  }

  return (
    <View style={{ marginTop: theme.space.sm, gap: theme.space.sm }}>
      {attachments.map(item =>
        item.kind === 'image' ? (
          <AuthorizedImage
            key={item.id}
            media={item}
            client={client}
            getAccessToken={getAccessToken}
          />
        ) : (
          <View key={item.id}>
            <AppText variant="callout" color={theme.colors.onGlass}>
              {item.fileName}
            </AppText>
            <AppText variant="caption" color={theme.colors.onGlassMuted}>
              {item.contentType} · {formatByteSize(item.byteSize)}
            </AppText>
            {item.status === 'deleted' ? (
              <AppText variant="footnote" color={theme.colors.danger}>
                This file was removed.
              </AppText>
            ) : (
              <TextLink
                label="Open file"
                align="start"
                onPress={() => openFile(item)}
              />
            )}
          </View>
        ),
      )}
      {error ? (
        <AppText variant="footnote" color={theme.colors.danger}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}
