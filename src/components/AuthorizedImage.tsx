import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, Modal, Pressable, View } from 'react-native';

import type { ApiClient } from '../api/client';
import { userFacingMessage } from '../api/errors';
import type { MediaDto } from '../api/types';
import { mediaContentRef } from '../features/media/contentUrl';
import { mediaApi } from '../features/media/mediaApi';
import { useTheme } from '../theme';
import { AppText } from './AppText';
import { TextLink } from './TextLink';

export function AuthorizedImage({
  media,
  client,
  getAccessToken,
  height = 180,
}: {
  media: MediaDto;
  client: ApiClient;
  getAccessToken: () => string | null;
  height?: number;
}) {
  const theme = useTheme();
  const [meta, setMeta] = useState(media);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMeta(media);
    setFailed(false);
    setLoading(true);
    setError(null);
  }, [media]);

  const ref = mediaContentRef(meta.id, meta.downloadUrl);
  const headers =
    ref?.needsAuth && getAccessToken()
      ? { Authorization: `Bearer ${getAccessToken() as string}` }
      : undefined;

  const retry = useCallback(async () => {
    setError(null);
    setFailed(false);
    setLoading(true);
    try {
      const fresh = await mediaApi(client).get(media.id);
      setMeta(fresh);
    } catch (caught) {
      setFailed(true);
      setLoading(false);
      setError(userFacingMessage(caught));
    }
  }, [client, media.id]);

  if (!ref || meta.status === 'deleted') {
    return (
      <AppText variant="footnote" color={theme.colors.danger}>
        This image is no longer available.
      </AppText>
    );
  }

  return (
    <View>
      {failed ? (
        <View>
          <AppText variant="footnote" color={theme.colors.danger}>
            {error || 'Could not load this image.'}
          </AppText>
          <TextLink label="Retry" align="start" onPress={() => retry()} />
        </View>
      ) : (
        <Pressable
          onPress={() => setOpen(true)}
          accessibilityRole="imagebutton"
          accessibilityLabel={media.fileName}
        >
          {loading ? (
            <ActivityIndicator
              color={theme.colors.brand}
              style={{ marginVertical: theme.space.sm }}
            />
          ) : null}
          <Image
            source={{ uri: ref.uri, headers }}
            style={{
              width: '100%',
              height,
              borderRadius: theme.radius.sm,
              backgroundColor: 'rgba(255,252,246,0.35)',
            }}
            resizeMode="cover"
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setFailed(true);
            }}
          />
        </Pressable>
      )}
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(28, 18, 12, 0.88)',
            justifyContent: 'center',
            padding: theme.space.lg,
          }}
          onPress={() => setOpen(false)}
        >
          <Image
            source={{ uri: ref.uri, headers }}
            style={{ width: '100%', height: '70%' }}
            resizeMode="contain"
          />
          <AppText
            variant="footnote"
            color="#F7F0E3"
            style={{ textAlign: 'center', marginTop: theme.space.md }}
          >
            Tap to close
          </AppText>
        </Pressable>
      </Modal>
    </View>
  );
}
