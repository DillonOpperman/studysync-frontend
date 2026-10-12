import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useRef, useState } from 'react';
import { RefreshControl, View } from 'react-native';

import { AbortedError, userFacingMessage } from '../api/errors';
import type { NotificationDto } from '../api/types';
import { NOTIFICATION_LIST_DEFAULT_LIMIT } from '../api/types';
import { useAuth } from '../auth/AuthProvider';
import { AppText } from '../components/AppText';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner } from '../components/ErrorBanner';
import { NotificationRow } from '../components/NotificationRow';
import { Screen } from '../components/Screen';
import { ScreenHeader } from '../components/ScreenHeader';
import { GroupListSkeleton } from '../components/Skeleton';
import { TextLink } from '../components/TextLink';
import { notificationDestination } from '../features/notifications/destination';
import { useNotifications } from '../features/notifications/NotificationsProvider';
import { notificationsApi } from '../features/notifications/notificationsApi';
import type { HomeDeskScreenProps } from '../navigation/types';
import { useTheme } from '../theme';

export function NotificationsScreen({
  navigation,
}: HomeDeskScreenProps<'Notifications'>) {
  const theme = useTheme();
  const { client } = useAuth();
  const { badge, refreshUnread } = useNotifications();
  const [items, setItems] = useState<NotificationDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [lastPageCount, setLastPageCount] = useState(0);
  const seq = useRef(0);
  const marking = useRef(new Set<string>());
  const markingAllRef = useRef(false);

  const load = useCallback(
    async (offset: number, mode: 'replace' | 'append') => {
      const token = ++seq.current;
      setError(null);
      if (mode === 'append') {
        setLoadingMore(true);
      }
      try {
        const page = await notificationsApi(client).list({
          limit: NOTIFICATION_LIST_DEFAULT_LIMIT,
          offset,
        });
        if (token !== seq.current) {
          return;
        }
        setLastPageCount(page.length);
        setItems(current =>
          mode === 'append' && current ? [...current, ...page] : page,
        );
        await refreshUnread();
      } catch (caught) {
        if (caught instanceof AbortedError || token !== seq.current) {
          return;
        }
        setError(userFacingMessage(caught));
        if (mode === 'replace') {
          setItems(current => current);
        }
      } finally {
        if (token === seq.current) {
          setLoading(false);
          setRefreshing(false);
          setLoadingMore(false);
        }
      }
    },
    [client, refreshUnread],
  );

  useFocusEffect(
    useCallback(() => {
      load(0, 'replace');
    }, [load]),
  );

  const unreadCount = (items ?? []).filter(note => note.readAt == null).length;
  const canLoadMore = Boolean(
    items && lastPageCount === NOTIFICATION_LIST_DEFAULT_LIMIT && !loading,
  );

  async function markRead(note: NotificationDto) {
    if (note.readAt != null || marking.current.has(note.id)) {
      return;
    }
    marking.current.add(note.id);
    const previous = items;
    setActionError(null);
    setItems(current =>
      (current ?? []).map(row =>
        row.id === note.id ? { ...row, readAt: new Date().toISOString() } : row,
      ),
    );
    try {
      await notificationsApi(client).markRead(note.id);
      await refreshUnread();
    } catch (caught) {
      setItems(previous);
      setActionError(userFacingMessage(caught));
    } finally {
      marking.current.delete(note.id);
    }
  }

  async function markAll() {
    if (markingAllRef.current) {
      return;
    }
    markingAllRef.current = true;
    setMarkingAll(true);
    const previous = items;
    setActionError(null);
    const stamp = new Date().toISOString();
    setItems(current =>
      (current ?? []).map(row =>
        row.readAt == null ? { ...row, readAt: stamp } : row,
      ),
    );
    try {
      await notificationsApi(client).markAllRead();
      await refreshUnread();
    } catch (caught) {
      setItems(previous);
      setActionError(userFacingMessage(caught));
    } finally {
      markingAllRef.current = false;
      setMarkingAll(false);
    }
  }

  async function onOpen(note: NotificationDto) {
    await markRead(note);
    const dest = notificationDestination(note);
    if (dest.kind === 'friends') {
      navigation.navigate('Friends');
      return;
    }
    if (dest.kind === 'groupDetail') {
      navigation.navigate('GroupDetail', { groupId: dest.groupId });
      return;
    }
    if (dest.kind === 'directChat') {
      navigation.navigate('DirectChat', {
        userId: dest.userId,
        name: 'Message',
      });
    }
  }

  return (
    <Screen
      mood="home"
      showPaper={false}
      scroll
      padded
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          tintColor={theme.colors.brand}
          colors={[theme.colors.brand]}
          onRefresh={() => {
            setRefreshing(true);
            load(0, 'replace');
          }}
        />
      }
    >
      <ScreenHeader
        title="Alerts"
        onBack={() => navigation.goBack()}
        action={
          unreadCount > 0 || badge.count > 0 ? (
            <TextLink
              label={markingAll ? 'Updating…' : 'Mark all read'}
              onPress={() => {
                markAll();
              }}
            />
          ) : undefined
        }
      />
      <AppText
        variant="footnote"
        color={theme.colors.textMuted}
        style={{ marginBottom: theme.space.sm }}
      >
        Activity from groups, people, and messages. Opening an item marks it
        read.
      </AppText>
      <TextLink
        label="Notification settings"
        align="start"
        onPress={() => navigation.navigate('NotificationsSettings')}
      />
      <View style={{ height: theme.space.md }} />
      <ErrorBanner message={error} />
      <ErrorBanner message={actionError} />
      {error && !items?.length ? (
        <TextLink
          label="Retry"
          align="start"
          onPress={() => {
            setLoading(true);
            load(0, 'replace');
          }}
        />
      ) : null}

      {loading && !items ? <GroupListSkeleton /> : null}
      {!loading && items && items.length === 0 && !error ? (
        <EmptyState
          title="No alerts yet"
          body="Friend requests, join requests, messages, and group announcements will appear here."
        />
      ) : null}

      <View>
        {(items ?? []).map((note, index, list) => (
          <NotificationRow
            key={note.id}
            note={note}
            last={index === list.length - 1}
            onPress={() => {
              onOpen(note);
            }}
          />
        ))}
      </View>

      {canLoadMore ? (
        <View style={{ marginTop: theme.space.md, alignItems: 'center' }}>
          <TextLink
            label={loadingMore ? 'Loading…' : 'Load more'}
            onPress={() => load(items?.length ?? 0, 'append')}
          />
        </View>
      ) : null}
    </Screen>
  );
}
