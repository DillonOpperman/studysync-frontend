import React from 'react';
import { act, create } from 'react-test-renderer';

import { Button } from '../src/components/Button';
import { EmptyState } from '../src/components/EmptyState';
import { FriendsScreen } from '../src/screens/FriendsScreen';
import { ThemeProvider } from '../src/theme';

const mockFriends = {
  list: jest.fn(),
  listRequests: jest.fn(),
  sendRequest: jest.fn(),
  acceptRequest: jest.fn(),
  rejectRequest: jest.fn(),
  block: jest.fn(),
  unblock: jest.fn(),
};
const mockDm = {
  listMessageRequests: jest.fn(),
  acceptMessageRequest: jest.fn(),
  rejectMessageRequest: jest.fn(),
};

jest.mock('../src/features/social/friendsApi', () => ({
  friendsApi: () => mockFriends,
}));
jest.mock('../src/features/social/dmApi', () => ({
  dmApi: () => mockDm,
}));
jest.mock('../src/auth/AuthProvider', () => {
  const client = {};
  return {
    useAuth: () => ({
      client,
      state: { status: 'signedIn', user: { id: 'me', name: 'Ada' } },
    }),
  };
});
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

async function renderFriends() {
  let tree: ReturnType<typeof create> | undefined;
  await act(async () => {
    tree = create(
      <ThemeProvider>
        <FriendsScreen
          navigation={navigation as never}
          route={{ key: 'f', name: 'Friends' }}
        />
      </ThemeProvider>,
    );
    await Promise.resolve();
    await Promise.resolve();
  });
  return tree!;
}

describe('FriendsScreen (mocked HTTP — not a live Rust server)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFriends.list.mockResolvedValue([]);
    mockFriends.listRequests.mockResolvedValue({ incoming: [], outgoing: [] });
    mockDm.listMessageRequests.mockResolvedValue([]);
  });

  it('shows empty friends and request states', async () => {
    const tree = await renderFriends();
    const titles = tree.root
      .findAllByType(EmptyState)
      .map(node => node.props.title);
    expect(titles).toEqual(
      expect.arrayContaining([
        'No incoming requests',
        'No friends yet',
        'No message requests',
      ]),
    );
  });

  it('accepts an incoming friend request then reloads', async () => {
    mockFriends.listRequests.mockResolvedValue({
      incoming: [
        {
          id: 'r1',
          status: 'pending',
          createdAt: '2026-01-01T00:00:00Z',
          decidedAt: null,
          requester: { id: 'u2', name: 'Grace' },
          recipient: { id: 'me', name: 'Ada' },
        },
      ],
      outgoing: [],
    });
    mockFriends.acceptRequest.mockResolvedValue({
      id: 'r1',
      status: 'accepted',
    });
    const tree = await renderFriends();
    const accept = tree.root
      .findAllByType(Button)
      .find(node => node.props.label === 'Accept');
    expect(accept).toBeTruthy();
    await act(async () => {
      accept?.props.onPress();
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(mockFriends.acceptRequest).toHaveBeenCalledWith('r1');
    expect(mockFriends.list).toHaveBeenCalled();
  });

  it('accepts a message request then opens the direct conversation', async () => {
    mockDm.listMessageRequests.mockResolvedValue([
      {
        id: 'mr1',
        status: 'pending',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
        sender: { id: 'u2', name: 'Grace' },
        receiver: { id: 'me', name: 'Ada' },
      },
    ]);
    mockDm.acceptMessageRequest.mockResolvedValue({
      id: 'mr1',
      status: 'accepted',
    });
    const tree = await renderFriends();
    const accept = tree.root
      .findAllByType(Button)
      .find(node => node.props.label === 'Accept');
    await act(async () => {
      accept?.props.onPress();
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(mockDm.acceptMessageRequest).toHaveBeenCalledWith('mr1');
    expect(navigation.navigate).toHaveBeenCalledWith('DirectChat', {
      userId: 'u2',
      name: 'Grace',
    });
  });
});
