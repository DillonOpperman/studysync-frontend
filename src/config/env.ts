import { Platform } from 'react-native';

import { apiBaseUrlOverride } from './overrides';

export const API_PREFIX = '/api/v1';

export type ApiEnvOverrides = {
  apiBaseUrl?: string;
};

/**
 * Development defaults. Android emulators cannot reach the host via localhost.
 * Physical devices must set `apiBaseUrlOverride` in `overrides.ts`.
 */
export function defaultApiBaseUrl(): string {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8080';
  }
  return 'http://127.0.0.1:8080';
}

export function getApiBaseUrl(): string {
  const override = apiBaseUrlOverride?.trim();
  if (override) {
    return override.replace(/\/+$/, '');
  }
  return defaultApiBaseUrl();
}

export function apiUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${getApiBaseUrl()}${API_PREFIX}${normalized}`;
}

/** WebSocket origin without credentials. Never log a URL that includes a token. */
export function wsBaseUrl(): string {
  return getApiBaseUrl().replace(/^http/i, 'ws') + `${API_PREFIX}/ws`;
}

export function authenticatedWsUrl(accessToken: string): string {
  return `${wsBaseUrl()}?access_token=${encodeURIComponent(accessToken)}`;
}
