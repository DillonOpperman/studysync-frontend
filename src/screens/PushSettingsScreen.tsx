import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { View } from 'react-native';

import { userFacingMessage } from '../api/errors';
import type { PushPreferencesDto } from '../api/types';
import { useAuth } from '../auth/AuthProvider';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { ErrorBanner } from '../components/ErrorBanner';
import { Screen } from '../components/Screen';
import { ScreenHeader } from '../components/ScreenHeader';
import { GroupListSkeleton } from '../components/Skeleton';
import {
  isFirebaseAppConfigured,
  openSystemNotificationSettings,
  osPermissionStatus,
  requestOsPermission,
  loadMessaging,
  type PermissionStatus,
} from '../features/push/messaging';
import { pushApi } from '../features/push/pushApi';
import { registerCurrentDevice } from '../features/push/registration';
import type { HomeDeskScreenProps } from '../navigation/types';
import { useTheme } from '../theme';

const emptyPrefs: PushPreferencesDto = {
  pushEnabled: true,
  friends: true,
  groups: true,
  messages: true,
  announcements: true,
  updatedAt: '',
};

export function PushSettingsScreen({
  navigation,
}: HomeDeskScreenProps<'NotificationsSettings'>) {
  const theme = useTheme();
  const { client } = useAuth();
  const configured = isFirebaseAppConfigured();
  const [permission, setPermission] = useState<PermissionStatus>(
    configured ? 'denied' : 'unconfigured',
  );
  const [prefs, setPrefs] = useState<PushPreferencesDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const nextPerm = await osPermissionStatus(loadMessaging());
      setPermission(nextPerm);
      const nextPrefs = await pushApi(client).getPreferences();
      setPrefs(nextPrefs);
    } catch (caught) {
      setError(userFacingMessage(caught));
      setPrefs(current => current ?? emptyPrefs);
    }
  }, [client]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  async function save(patch: Partial<PushPreferencesDto>) {
    if (!prefs || busy) {
      return;
    }
    setBusy(true);
    setError(null);
    const previous = prefs;
    setPrefs({ ...prefs, ...patch });
    try {
      const saved = await pushApi(client).updatePreferences({
        pushEnabled: patch.pushEnabled ?? prefs.pushEnabled,
        friends: patch.friends ?? prefs.friends,
        groups: patch.groups ?? prefs.groups,
        messages: patch.messages ?? prefs.messages,
        announcements: patch.announcements ?? prefs.announcements,
      });
      setPrefs(saved);
      if (saved.pushEnabled) {
        await registerCurrentDevice(client);
      }
    } catch (caught) {
      setPrefs(previous);
      setError(userFacingMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  async function enableOs() {
    setBusy(true);
    try {
      const next = await requestOsPermission(loadMessaging());
      setPermission(next);
      if (next === 'granted') {
        await registerCurrentDevice(client);
      }
    } catch (caught) {
      setError(userFacingMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  const permissionLabel =
    permission === 'granted'
      ? 'System permission: allowed'
      : permission === 'denied'
      ? 'System permission: denied'
      : permission === 'unconfigured'
      ? 'Firebase is not configured on this build'
      : 'System permission: unavailable';

  return (
    <Screen mood="home" showPaper={false} scroll padded>
      <ScreenHeader title="Push settings" onBack={() => navigation.goBack()} />
      <AppText
        variant="footnote"
        color={theme.colors.textMuted}
        style={{ marginBottom: theme.space.md }}
      >
        These switches control StudySync push delivery. They do not replace the
        Alerts list, and they cannot grant Android or iOS permission by
        themselves.
      </AppText>
      <ErrorBanner message={error} />
      {!prefs ? <GroupListSkeleton /> : null}

      <AppText variant="body" style={{ marginBottom: theme.space.sm }}>
        {permissionLabel}
      </AppText>
      {permission === 'unconfigured' ? (
        <AppText
          variant="footnote"
          color={theme.colors.textMuted}
          style={{ marginBottom: theme.space.md }}
        >
          Development mode: add android/app/google-services.json from a free
          Firebase project to enable live Android delivery. Until then, Alerts
          still work.
        </AppText>
      ) : null}
      {permission === 'denied' ? (
        <View style={{ marginBottom: theme.space.md, gap: theme.space.sm }}>
          <Button
            label="Allow notifications"
            onPress={() => {
              enableOs();
            }}
            disabled={busy}
          />
          <Button
            label="Open system settings"
            tone="secondary"
            onPress={() => {
              openSystemNotificationSettings();
            }}
          />
        </View>
      ) : null}

      {prefs ? (
        <View style={{ gap: theme.space.sm }}>
          <Chip
            label={prefs.pushEnabled ? 'Push delivery on' : 'Push delivery off'}
            selected={prefs.pushEnabled}
            onPress={() => save({ pushEnabled: !prefs.pushEnabled })}
          />
          <Chip
            label="Friends"
            selected={prefs.friends}
            onPress={() => save({ friends: !prefs.friends })}
          />
          <Chip
            label="Groups"
            selected={prefs.groups}
            onPress={() => save({ groups: !prefs.groups })}
          />
          <Chip
            label="Messages"
            selected={prefs.messages}
            onPress={() => save({ messages: !prefs.messages })}
          />
          <Chip
            label="Announcements"
            selected={prefs.announcements}
            onPress={() => save({ announcements: !prefs.announcements })}
          />
        </View>
      ) : null}
    </Screen>
  );
}
