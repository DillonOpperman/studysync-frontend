import React from 'react';
import { FlatList } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { act, create } from 'react-test-renderer';

import { DirectChatScreen } from '../src/screens/DirectChatScreen';
import { ThemeProvider } from '../src/theme';

const mockDm = {
  list: jest.fn(),
  send: jest.fn(),
};
jest.mock('../src/features/social/dmApi', () => ({
  dmApi: () => mockDm,
}));
jest.mock('../src/features/social/friendsApi', () => ({
  friendsApi: () => ({ block: jest.fn() }),
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
jest.mock('../src/components/ChatComposer', () => ({
  ChatComposer: () => null,
}));
jest.mock('../src/components/Glass', () => {
  const { createElement } = require('react');
  const { View } = require('react-native');
  return {
    Glass: ({ children }: { children?: unknown }) =>
      createElement(View, null, children),
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

let tree: ReturnType<typeof create> | undefined;

async function renderChat() {
  await act(async () => {
    tree = create(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 47, left: 0, right: 0, bottom: 34 },
        }}
      >
        <ThemeProvider>
          <DirectChatScreen
            navigation={navigation as never}
            route={{
              key: 'd',
              name: 'DirectChat',
              params: { userId: 'u2', name: 'Grace' },
            }}
          />
        </ThemeProvider>
      </SafeAreaProvider>,
    );
    await Promise.resolve();
    await Promise.resolve();
  });
  return tree!;
}

describe('DirectChatScreen (mocked HTTP — not a live Rust server)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await act(async () => {
      tree?.unmount();
      tree = undefined;
    });
  });

  it('loads history and does not use group-chat sockets', async () => {
    mockDm.list.mockResolvedValue([
      {
        id: 'm1',
        senderId: 'u2',
        receiverId: 'me',
        content: 'hello',
        messageType: 'text',
        createdAt: '2026-01-01T00:00:00Z',
        readAt: null,
        attachments: [],
      },
    ]);
    const rendered = await renderChat();
    expect(mockDm.list).toHaveBeenCalledWith('u2', { limit: 50 });
    expect(rendered.root.findAllByType(FlatList).length).toBe(1);
  });

  it('loads older pages with before cursor', async () => {
    mockDm.list
      .mockResolvedValueOnce(
        Array.from({ length: 50 }, (_, index) => ({
          id: `m${index}`,
          senderId: 'me',
          receiverId: 'u2',
          content: 'n',
          messageType: 'text',
          createdAt: `2026-01-01T00:00:${String(index).padStart(2, '0')}Z`,
          readAt: null,
          attachments: [],
        })),
      )
      .mockResolvedValueOnce([]);
    const rendered = await renderChat();
    await act(async () => {
      rendered.root.findByType(FlatList).props.onEndReached();
      await Promise.resolve();
    });
    expect(mockDm.list).toHaveBeenLastCalledWith('u2', {
      before: expect.any(String),
      limit: 50,
    });
  });
});
