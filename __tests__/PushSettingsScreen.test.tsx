import React from 'react';
import { act, create } from 'react-test-renderer';

import { AppText } from '../src/components/AppText';
import { PushSettingsScreen } from '../src/screens/PushSettingsScreen';
import { ThemeProvider } from '../src/theme';

const mockGetPrefs = jest.fn();
const mockUpdatePrefs = jest.fn();

jest.mock('../src/features/push/pushApi', () => ({
  pushApi: () => ({
    getPreferences: (...args: unknown[]) => mockGetPrefs(...args),
    updatePreferences: (...args: unknown[]) => mockUpdatePrefs(...args),
  }),
}));

jest.mock('../src/auth/AuthProvider', () => ({
  useAuth: () => ({ client: {} }),
}));

jest.mock('../src/features/push/messaging', () => ({
  isFirebaseAppConfigured: () => false,
  osPermissionStatus: async () => 'unconfigured',
  requestOsPermission: async () => 'unconfigured',
  openSystemNotificationSettings: jest.fn(),
  loadMessaging: () => null,
}));

jest.mock('../src/features/push/registration', () => ({
  registerCurrentDevice: jest.fn(async () => null),
}));

jest.mock('@react-navigation/native', () => {
  const ReactNative = require('react');
  return {
    useFocusEffect: (effect: () => void | (() => void)) => {
      ReactNative.useEffect(() => {
        const cleanup = effect();
        return typeof cleanup === 'function' ? cleanup : undefined;
      }, [effect]);
    },
  };
});

describe('PushSettingsScreen', () => {
  it('explains development mode when Firebase is not configured', async () => {
    mockGetPrefs.mockResolvedValue({
      pushEnabled: true,
      friends: true,
      groups: true,
      messages: true,
      announcements: true,
      updatedAt: '2026-01-01T00:00:00Z',
    });
    let tree: ReturnType<typeof create> | undefined;
    await act(async () => {
      tree = create(
        <ThemeProvider>
          <PushSettingsScreen
            navigation={{ goBack: jest.fn(), navigate: jest.fn() } as never}
            route={{ key: 's', name: 'NotificationsSettings' }}
          />
        </ThemeProvider>,
      );
      await Promise.resolve();
      await Promise.resolve();
    });
    const copy = tree!.root
      .findAllByType(AppText)
      .map(node => String(node.props.children));
    expect(copy.some(text => text.includes('Firebase is not configured'))).toBe(
      true,
    );
    expect(copy.some(text => text.includes('Development mode'))).toBe(true);
  });
});
