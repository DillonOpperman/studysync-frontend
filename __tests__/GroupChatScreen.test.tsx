import React from 'react';
import { FlatList } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { act, create } from 'react-test-renderer';

import { launchImageLibrary } from 'react-native-image-picker';

import { Button } from '../src/components/Button';
import { EmptyState } from '../src/components/EmptyState';
import { TextField } from '../src/components/TextField';
import { TextLink } from '../src/components/TextLink';
import { GroupChatScreen } from '../src/screens/GroupChatScreen';
import { ThemeProvider } from '../src/theme';
import { chatMessage } from '../src/testSupport/chatFixtures';
import { group, member } from '../src/testSupport/groupFixtures';

const mockGroups = {
  get: jest.fn(),
  members: jest.fn(),
};
const mockChat = {
  list: jest.fn(),
  send: jest.fn(),
  edit: jest.fn(),
  remove: jest.fn(),
  toggleReaction: jest.fn(),
};
const mockSocket = {
  connect: jest.fn(),
  disconnect: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  isSubscribed: jest.fn(() => false),
  sendOp: jest.fn(() => false),
};

jest.mock('../src/features/groups/groupsApi', () => ({
  groupsApi: () => mockGroups,
}));

jest.mock('../src/features/chat/chatApi', () => ({
  chatApi: () => mockChat,
}));

jest.mock('../src/features/chat/wsClient', () => ({
  GroupChatSocket: class {
    connect = mockSocket.connect;
    disconnect = mockSocket.disconnect;
    pause = mockSocket.pause;
    resume = mockSocket.resume;
    isSubscribed = mockSocket.isSubscribed;
    sendOp = mockSocket.sendOp;
  },
}));

const mockMedia = {
  upload: jest.fn(),
  get: jest.fn(),
};
jest.mock('../src/features/media/mediaApi', () => ({
  mediaApi: () => mockMedia,
}));

const mockClient = {};
jest.mock('../src/auth/AuthProvider', () => ({
  useAuth: () => ({
    client: mockClient,
    state: { status: 'signedIn', user: { id: 'u-leader', name: 'Ada' } },
    getAccessToken: () => 'jwt',
    refreshAccessToken: async () => 'jwt',
  }),
}));

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
          <GroupChatScreen
            navigation={navigation as never}
            route={{
              key: 'c',
              name: 'GroupChat',
              params: { groupId: 'g1', title: 'Algo night' },
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

describe('GroupChatScreen (mocked HTTP/WS — not a live Rust server)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGroups.get.mockResolvedValue(
      group({ membershipStatus: 'leader', isLeader: true }),
    );
    mockGroups.members.mockResolvedValue([member()]);
    mockChat.list.mockResolvedValue({
      messages: [],
      pagination: {
        limit: 50,
        hasMore: false,
        nextBefore: null,
        nextAfter: null,
      },
    });
    mockMedia.upload.mockResolvedValue({
      id: 'media-1',
      fileName: 'a.png',
      contentType: 'image/png',
      byteSize: 12,
      kind: 'image',
      status: 'uploaded',
      downloadUrl: null,
    });
  });

  afterEach(async () => {
    await act(async () => {
      tree?.unmount();
    });
    tree = undefined;
  });

  it('loads history, connects a socket, and disconnects on unmount', async () => {
    mockChat.list.mockResolvedValue({
      messages: [chatMessage({ content: 'First' })],
      pagination: {
        limit: 50,
        hasMore: true,
        nextBefore: 'm1',
        nextAfter: 'm1',
      },
    });
    const screen = await renderChat();
    expect(mockChat.list).toHaveBeenCalledWith('g1', { limit: 50 });
    expect(mockSocket.connect).toHaveBeenCalled();
    await act(async () => {
      screen.unmount();
    });
    expect(mockSocket.disconnect).toHaveBeenCalled();
  });

  it('does not send blank messages and posts valid ones through REST when offline', async () => {
    mockChat.send.mockResolvedValue(
      chatMessage({ id: 'm9', clientMsgId: 'c9', content: 'Hello' }),
    );
    const screen = await renderChat();
    const send = screen.root
      .findAllByType(Button)
      .find(
        node =>
          node.props.accessibilityLabel === 'Send' ||
          node.props.label === 'Send' ||
          node.props.label === 'Go',
      );
    await act(async () => {
      send?.props.onPress();
    });
    expect(mockChat.send).not.toHaveBeenCalled();
    await act(async () => {
      screen.root.findAllByType(TextField)[0].props.onChangeText('Hello');
    });
    await act(async () => {
      send?.props.onPress();
      await Promise.resolve();
    });
    expect(mockChat.send).toHaveBeenCalledWith(
      'g1',
      expect.objectContaining({ content: 'Hello', messageType: 'text' }),
    );
  });

  it('requests older pages with the before cursor', async () => {
    mockChat.list
      .mockResolvedValueOnce({
        messages: [chatMessage({ id: 'm2' })],
        pagination: {
          limit: 50,
          hasMore: true,
          nextBefore: 'm2',
          nextAfter: 'm2',
        },
      })
      .mockResolvedValueOnce({
        messages: [chatMessage({ id: 'm1' })],
        pagination: {
          limit: 50,
          hasMore: false,
          nextBefore: 'm1',
          nextAfter: 'm1',
        },
      });
    const screen = await renderChat();
    await act(async () => {
      screen.root.findByType(FlatList).props.onEndReached();
      await Promise.resolve();
    });
    expect(mockChat.list).toHaveBeenLastCalledWith('g1', {
      before: 'm2',
      limit: 50,
    });
  });

  it('shows an empty conversation state', async () => {
    const screen = await renderChat();
    expect(
      screen.root
        .findAllByType(EmptyState)
        .some(node => node.props.title === 'No messages yet'),
    ).toBe(true);
  });

  it('blocks chat for archived groups', async () => {
    mockGroups.get.mockResolvedValue(
      group({ membershipStatus: 'leader', isLeader: true, status: 'archived' }),
    );
    const screen = await renderChat();
    expect(mockChat.list).not.toHaveBeenCalled();
    expect(mockSocket.connect).not.toHaveBeenCalled();
    expect(screen.root.findAllByType(Button).length).toBe(0);
  });

  it('uploads then REST-sends an image without claiming a socket payload', async () => {
    (launchImageLibrary as jest.Mock).mockResolvedValueOnce({
      didCancel: false,
      assets: [
        {
          uri: 'file://a.png',
          fileName: 'a.png',
          type: 'image/png',
          fileSize: 12,
        },
      ],
    });
    mockChat.send.mockResolvedValue(
      chatMessage({
        id: 'm-img',
        clientMsgId: 'c-img',
        messageType: 'image',
        content: '',
        attachments: [
          {
            id: 'media-1',
            fileName: 'a.png',
            contentType: 'image/png',
            byteSize: 12,
            kind: 'image',
            status: 'attached',
            downloadUrl: null,
          },
        ],
      }),
    );
    const screen = await renderChat();
    const photo = screen.root
      .findAllByType(TextLink)
      .find(node => node.props.label === 'Photo');
    await act(async () => {
      await photo?.props.onPress();
    });
    const send = screen.root
      .findAllByType(Button)
      .find(node => node.props.accessibilityLabel === 'Send');
    await act(async () => {
      send?.props.onPress();
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(mockMedia.upload).toHaveBeenCalled();
    expect(mockChat.send).toHaveBeenCalledWith(
      'g1',
      expect.objectContaining({
        messageType: 'image',
        attachmentIds: ['media-1'],
      }),
    );
    expect(mockSocket.sendOp).not.toHaveBeenCalled();
  });
});
