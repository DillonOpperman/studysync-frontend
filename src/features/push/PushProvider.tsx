import React, { useEffect, useRef } from 'react';

import { AbortedError } from '../../api/errors';
import { useAuth } from '../../auth/AuthProvider';
import { appNavigationRef } from '../../navigation/ref';
import { notificationsApi } from '../notifications/notificationsApi';
import { useNotifications } from '../notifications/NotificationsProvider';
import {
  isFirebaseAppConfigured,
  loadMessaging,
  notificationIdFromMessage,
} from './messaging';
import { openOnAppStack } from './openNotification';
import {
  shouldHandleNotification,
  stashNotificationId,
  takePendingNotificationId,
} from './pendingOpen';
import { registerCurrentDevice } from './registration';

async function consumeOpen(client: ReturnType<typeof useAuth>['client']) {
  const id = takePendingNotificationId();
  if (!id) {
    return;
  }
  if (!appNavigationRef.isReady()) {
    stashNotificationId(id);
    return;
  }
  if (!shouldHandleNotification(id)) {
    return;
  }
  try {
    const note = await notificationsApi(client).get(id);
    openOnAppStack(appNavigationRef, note);
  } catch (error) {
    if (error instanceof AbortedError) {
      stashNotificationId(id);
      return;
    }
    openOnAppStack(appNavigationRef, null);
  }
}

export function PushProvider({ children }: { children: React.ReactNode }) {
  const { client, state } = useAuth();
  const { refreshUnread } = useNotifications();
  const userId = state.status === 'signedIn' ? state.user.id : null;
  const signedIn = state.status === 'signedIn';
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const messaging = loadMessaging();
    if (!messaging || !isFirebaseAppConfigured()) {
      return undefined;
    }
    messaging
      .getInitialNotification()
      .then(message => {
        stashNotificationId(notificationIdFromMessage(message));
      })
      .catch(() => undefined);
    const offOpen = messaging.onNotificationOpenedApp(message => {
      stashNotificationId(notificationIdFromMessage(message));
    });
    const offMessage = messaging.onMessage(async () => {
      await refreshUnread();
    });
    const offToken = messaging.onTokenRefresh(() => {
      if (userId) {
        registerCurrentDevice(client).catch(() => undefined);
      }
    });
    return () => {
      offOpen();
      offMessage();
      offToken();
    };
  }, [client, refreshUnread, userId]);

  useEffect(() => {
    if (!userId) {
      return;
    }
    registerCurrentDevice(client).catch(() => undefined);
  }, [client, userId]);

  useEffect(() => {
    if (state.status === 'signedOut') {
      takePendingNotificationId();
    }
    if (!signedIn) {
      if (timer.current) {
        clearInterval(timer.current);
        timer.current = null;
      }
      return;
    }
    consumeOpen(client).catch(() => undefined);
    timer.current = setInterval(() => {
      consumeOpen(client).catch(() => undefined);
    }, 400);
    const timeout = setTimeout(() => {
      if (timer.current) {
        clearInterval(timer.current);
        timer.current = null;
      }
    }, 8000);
    return () => {
      if (timer.current) {
        clearInterval(timer.current);
        timer.current = null;
      }
      clearTimeout(timeout);
    };
  }, [client, signedIn, state.status]);

  return <>{children}</>;
}
