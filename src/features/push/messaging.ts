import { Linking, PermissionsAndroid, Platform } from 'react-native';

export type PermissionStatus =
  | 'granted'
  | 'denied'
  | 'unavailable'
  | 'unconfigured';

export type RemoteOpen = {
  notificationId: string | null;
};

type MessagingModule = {
  getToken(): Promise<string>;
  onTokenRefresh(listener: (token: string) => void): () => void;
  requestPermission(): Promise<number>;
  hasPermission(): Promise<number>;
  onMessage(listener: (message: unknown) => void): () => void;
  onNotificationOpenedApp(listener: (message: unknown) => void): () => void;
  getInitialNotification(): Promise<unknown>;
  setBackgroundMessageHandler?(
    handler: (message: unknown) => Promise<void>,
  ): void;
};

const AUTHORIZED = 1;
const PROVISIONAL = 2;

export function loadMessaging(): MessagingModule | null {
  try {
    const loaded = require('@react-native-firebase/messaging') as {
      default?: () => MessagingModule;
    };
    const factory = loaded?.default;
    if (typeof factory !== 'function') {
      return null;
    }
    return factory();
  } catch {
    return null;
  }
}

export function isFirebaseAppConfigured(): boolean {
  try {
    const appMod = require('@react-native-firebase/app') as {
      default?: { apps?: unknown[] };
    };
    const apps = appMod?.default?.apps;
    return Array.isArray(apps) && apps.length > 0;
  } catch {
    return false;
  }
}

export function notificationIdFromMessage(message: unknown): string | null {
  if (message == null || typeof message !== 'object') {
    return null;
  }
  const data = (message as { data?: unknown }).data;
  if (data == null || typeof data !== 'object' || Array.isArray(data)) {
    return null;
  }
  const value = (data as Record<string, unknown>).notificationId;
  if (typeof value !== 'string' || !/^[0-9a-f-]{36}$/i.test(value)) {
    return null;
  }
  return value;
}

export async function osPermissionStatus(
  messaging: MessagingModule | null,
): Promise<PermissionStatus> {
  if (!messaging || !isFirebaseAppConfigured()) {
    return 'unconfigured';
  }
  if (Platform.OS === 'android' && Number(Platform.Version) >= 33) {
    const result = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    return result ? 'granted' : 'denied';
  }
  try {
    const auth = await messaging.hasPermission();
    return auth === AUTHORIZED || auth === PROVISIONAL ? 'granted' : 'denied';
  } catch {
    return 'unavailable';
  }
}

export async function requestOsPermission(
  messaging: MessagingModule | null,
): Promise<PermissionStatus> {
  if (!messaging || !isFirebaseAppConfigured()) {
    return 'unconfigured';
  }
  if (Platform.OS === 'android' && Number(Platform.Version) >= 33) {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    return result === PermissionsAndroid.RESULTS.GRANTED ? 'granted' : 'denied';
  }
  try {
    const auth = await messaging.requestPermission();
    return auth === AUTHORIZED || auth === PROVISIONAL ? 'granted' : 'denied';
  } catch {
    return 'unavailable';
  }
}

export async function openSystemNotificationSettings(): Promise<void> {
  await Linking.openSettings();
}

export function currentPlatform(): 'android' | 'ios' {
  return Platform.OS === 'ios' ? 'ios' : 'android';
}
