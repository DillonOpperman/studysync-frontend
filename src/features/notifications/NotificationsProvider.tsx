import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { AbortedError } from '../../api/errors';
import { useAuth } from '../../auth/AuthProvider';
import { notificationsApi } from './notificationsApi';
import { scanUnreadBadge, type UnreadBadge } from './unread';

const emptyBadge: UnreadBadge = { count: 0, label: '', complete: true };

type NotificationsContextValue = {
  badge: UnreadBadge;
  refreshUnread: () => Promise<void>;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null,
);

export function NotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { client, state } = useAuth();
  const userId = state.status === 'signedIn' ? state.user.id : null;
  const [badge, setBadge] = useState<UnreadBadge>(emptyBadge);
  const seq = useRef(0);

  const refreshUnread = useCallback(async () => {
    if (!userId) {
      setBadge(emptyBadge);
      return;
    }
    const token = ++seq.current;
    try {
      const next = await scanUnreadBadge(query =>
        notificationsApi(client).list(query),
      );
      if (token !== seq.current) {
        return;
      }
      setBadge(next);
    } catch (caught) {
      if (caught instanceof AbortedError || token !== seq.current) {
        return;
      }
    }
  }, [client, userId]);

  useEffect(() => {
    seq.current += 1;
    if (!userId) {
      setBadge(emptyBadge);
      return;
    }
    refreshUnread();
  }, [refreshUnread, userId]);

  useEffect(() => {
    const onChange = (status: AppStateStatus) => {
      if (status === 'active') {
        refreshUnread();
      }
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, [refreshUnread]);

  const value = useMemo(
    () => ({ badge, refreshUnread }),
    [badge, refreshUnread],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsContextValue {
  const value = useContext(NotificationsContext);
  if (!value) {
    throw new Error(
      'useNotifications must be used within NotificationsProvider',
    );
  }
  return value;
}
