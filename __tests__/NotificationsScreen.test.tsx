import React from 'react';
import { act, create } from 'react-test-renderer';

import { ApiError } from '../src/api/errors';
import type { NotificationDto } from '../src/api/types';
import { EmptyState } from '../src/components/EmptyState';
import { ErrorBanner } from '../src/components/ErrorBanner';
import { NotificationRow } from '../src/components/NotificationRow';
import { TextLink } from '../src/components/TextLink';
import { NotificationsScreen } from '../src/screens/NotificationsScreen';
import { ThemeProvider } from '../src/theme';

const mockList = jest.fn();
const mockMarkRead = jest.fn();
const mockMarkAll = jest.fn();
const mockRefreshUnread = jest.fn(async () => undefined);

jest.mock('../src/features/notifications/notificationsApi', () => ({
  notificationsApi: () => ({
    list: (...args: unknown[]) => mockList(...args),
    markRead: (...args: unknown[]) => mockMarkRead(...args),
    markAllRead: (...args: unknown[]) => mockMarkAll(...args),
  }),
}));

const mockClient = {};

jest.mock('../src/auth/AuthProvider', () => ({
  useAuth: () => ({ client: mockClient }),
}));

jest.mock('../src/features/notifications/NotificationsProvider', () => ({
  useNotifications: () => ({
    badge: { count: 1, label: '1', complete: true },
    refreshUnread: mockRefreshUnread,
  }),
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

const navigation = { goBack: jest.fn(), navigate: jest.fn() };
const uuid = '11111111-1111-4111-8111-111111111111';

function note(partial: Partial<NotificationDto> = {}): NotificationDto {
  return {
    id: 'n1',
    type: 'friend_request',
    title: 'New friend request',
    body: 'Someone sent you a friend request.',
    data: { requestId: uuid, requesterId: uuid },
    readAt: null,
    createdAt: '2026-01-01T12:00:00Z',
    ...partial,
  };
}

async function renderScreen() {
  let tree: ReturnType<typeof create> | undefined;
  await act(async () => {
    tree = create(
      <ThemeProvider>
        <NotificationsScreen
          navigation={navigation as never}
          route={{ key: 'n', name: 'Notifications' }}
        />
      </ThemeProvider>,
    );
    await Promise.resolve();
    await Promise.resolve();
  });
  return tree!;
}

describe('NotificationsScreen (mocked HTTP — not a live Rust server)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockList.mockResolvedValue([]);
    mockMarkRead.mockResolvedValue(undefined);
    mockMarkAll.mockResolvedValue(undefined);
  });

  it('links to notification settings from Alerts', async () => {
    const tree = await renderScreen();
    const settings = tree.root
      .findAllByType(TextLink)
      .find(node => node.props.label === 'Notification settings');
    expect(settings).toBeTruthy();
    settings?.props.onPress();
    expect(navigation.navigate).toHaveBeenCalledWith('NotificationsSettings');
  });

  it('shows an empty state when the API returns no notifications', async () => {
    const tree = await renderScreen();
    expect(tree.root.findByType(EmptyState).props.title).toBe('No alerts yet');
  });

  it('shows an error state with retry after a failed list', async () => {
    mockList.mockRejectedValueOnce(
      new ApiError(401, 'token_expired', 'Session expired'),
    );
    const tree = await renderScreen();
    const banners = tree.root
      .findAllByType(ErrorBanner)
      .map(node => node.props.message);
    expect(banners).toContain('Session expired');
    const retry = tree.root
      .findAllByType(TextLink)
      .find(node => node.props.label === 'Retry');
    expect(retry).toBeTruthy();
    mockList.mockResolvedValueOnce([]);
    await act(async () => {
      retry?.props.onPress();
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(mockList).toHaveBeenCalledTimes(2);
  });

  it('paginates with Load more using offset from the loaded length', async () => {
    mockList.mockResolvedValueOnce(
      Array.from({ length: 20 }, (_, i) => note({ id: `p${i}` })),
    );
    const tree = await renderScreen();
    const more = tree.root
      .findAllByType(TextLink)
      .find(node => node.props.label === 'Load more');
    expect(more).toBeTruthy();
    mockList.mockResolvedValueOnce([note({ id: 'tail' })]);
    await act(async () => {
      more?.props.onPress();
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(mockList.mock.calls[1][0]).toMatchObject({ limit: 20, offset: 20 });
  });

  it('marks a notification read then opens People for a friend request', async () => {
    mockList.mockResolvedValue([note()]);
    const tree = await renderScreen();
    const row = tree.root.findByType(NotificationRow);
    await act(async () => {
      row.props.onPress();
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(mockMarkRead).toHaveBeenCalledWith('n1');
    expect(navigation.navigate).toHaveBeenCalledWith('Friends');
    expect(mockRefreshUnread).toHaveBeenCalled();
  });

  it('rolls back optimistic read state when mark-read fails', async () => {
    mockList.mockResolvedValue([note()]);
    mockMarkRead.mockRejectedValueOnce(
      new ApiError(404, 'notification_not_found', 'notification not found'),
    );
    const tree = await renderScreen();
    await act(async () => {
      tree.root.findByType(NotificationRow).props.onPress();
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(tree.root.findByType(NotificationRow).props.note.readAt).toBeNull();
    const banners = tree.root
      .findAllByType(ErrorBanner)
      .map(node => node.props.message);
    expect(banners).toContain('notification not found');
    expect(navigation.navigate).toHaveBeenCalledWith('Friends');
  });

  it('marks all read and ignores a second tap while in flight', async () => {
    mockList.mockResolvedValue([note(), note({ id: 'n2' })]);
    let release: () => void = () => undefined;
    mockMarkAll.mockImplementation(
      () =>
        new Promise(resolve => {
          release = () => resolve(undefined);
        }),
    );
    const tree = await renderScreen();
    const markAll = tree.root
      .findAllByType(TextLink)
      .find(node => node.props.label === 'Mark all read');
    await act(async () => {
      markAll?.props.onPress();
      markAll?.props.onPress();
      await Promise.resolve();
    });
    expect(mockMarkAll).toHaveBeenCalledTimes(1);
    await act(async () => {
      release();
      await Promise.resolve();
      await Promise.resolve();
    });
  });

  it('opens group detail for join requests and skips navigation when ids are missing', async () => {
    mockList.mockResolvedValue([
      note({
        id: 'join',
        type: 'join_request',
        title: 'New join request',
        data: { groupId: uuid },
      }),
      note({
        id: 'bad',
        type: 'direct_message',
        title: 'New message',
        data: {},
      }),
    ]);
    const tree = await renderScreen();
    const rows = tree.root.findAllByType(NotificationRow);
    await act(async () => {
      rows[0].props.onPress();
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(navigation.navigate).toHaveBeenCalledWith('GroupDetail', {
      groupId: uuid,
    });
    navigation.navigate.mockClear();
    await act(async () => {
      rows[1].props.onPress();
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(mockMarkRead).toHaveBeenCalledWith('bad');
    expect(navigation.navigate).not.toHaveBeenCalled();
  });
});
