import React from 'react';
import { act, create } from 'react-test-renderer';

import { AppText } from '../src/components/AppText';
import {
  NotificationsProvider,
  useNotifications,
} from '../src/features/notifications/NotificationsProvider';
import { ThemeProvider } from '../src/theme';

const mockList = jest.fn();

jest.mock('../src/features/notifications/notificationsApi', () => ({
  notificationsApi: () => ({
    list: (...args: unknown[]) => mockList(...args),
  }),
}));

jest.mock('../src/auth/AuthProvider', () => {
  const auth = {
    client: {},
    state: { status: 'signedIn' as const, user: { id: 'ada' } },
  };
  return {
    useAuth: () => auth,
    __auth: auth,
  };
});

function Probe() {
  const { badge } = useNotifications();
  return <AppText>{badge.label || 'none'}</AppText>;
}

describe('NotificationsProvider (mocked HTTP — not a live Rust server)', () => {
  const auth = jest.requireMock('../src/auth/AuthProvider').__auth as {
    state: { status: string; user?: { id: string } };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    auth.state = { status: 'signedIn', user: { id: 'ada' } };
    mockList.mockResolvedValue([]);
  });

  it('clears the unread badge after logout', async () => {
    mockList.mockResolvedValue([
      {
        id: 'n1',
        type: 'friend_request',
        title: 'New friend request',
        body: 'Someone sent you a friend request.',
        data: {},
        readAt: null,
        createdAt: '2026-01-01T00:00:00Z',
      },
    ]);
    let tree: ReturnType<typeof create> | undefined;
    await act(async () => {
      tree = create(
        <ThemeProvider>
          <NotificationsProvider>
            <Probe />
          </NotificationsProvider>
        </ThemeProvider>,
      );
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(tree!.root.findByType(AppText).props.children).toBe('1');
    await act(async () => {
      auth.state = { status: 'signedOut' };
      tree!.update(
        <ThemeProvider>
          <NotificationsProvider>
            <Probe />
          </NotificationsProvider>
        </ThemeProvider>,
      );
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(tree!.root.findByType(AppText).props.children).toBe('none');
  });
});
