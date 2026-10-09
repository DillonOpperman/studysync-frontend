import React from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import { Button } from '../src/components/Button';
import { GroupDetailScreen } from '../src/screens/GroupDetailScreen';
import { ThemeProvider } from '../src/theme';
import { group, joinRequest, member } from '../src/testSupport/groupFixtures';

const mockApi = {
  get: jest.fn(),
  members: jest.fn(),
  listJoinRequests: jest.fn(),
  requestJoin: jest.fn(),
  approveJoin: jest.fn(),
  rejectJoin: jest.fn(),
  leave: jest.fn(),
};

jest.mock('../src/features/groups/groupsApi', () => ({
  groupsApi: () => mockApi,
}));

jest.mock('../src/features/social/friendsApi', () => ({
  friendsApi: () => ({
    sendRequest: jest.fn(),
    block: jest.fn(),
  }),
}));

const mockClient = {};

jest.mock('../src/auth/AuthProvider', () => ({
  useAuth: () => ({ client: mockClient }),
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

const navigation = {
  goBack: jest.fn(),
  navigate: jest.fn(),
};

async function renderDetail() {
  let tree: ReactTestRenderer | undefined;
  await act(async () => {
    tree = create(
      <ThemeProvider>
        <GroupDetailScreen
          navigation={navigation as never}
          route={{ key: 'd', name: 'GroupDetail', params: { groupId: 'g1' } }}
        />
      </ThemeProvider>,
    );
    await Promise.resolve();
    await Promise.resolve();
  });
  return tree!;
}

function labels(tree: ReactTestRenderer): string[] {
  return tree.root.findAllByType(Button).map(node => String(node.props.label));
}

describe('GroupDetailScreen (mocked HTTP — not a live Rust server)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows request-to-join for outsiders and skips member/request fetches', async () => {
    mockApi.get.mockResolvedValue(group());
    const tree = await renderDetail();
    expect(mockApi.members).not.toHaveBeenCalled();
    expect(mockApi.listJoinRequests).not.toHaveBeenCalled();
    expect(labels(tree)).toContain('Request to join');
    expect(labels(tree)).not.toContain('Open group chat');
    expect(labels(tree)).not.toContain('Approve');
  });

  it('hides approval controls from ordinary members', async () => {
    mockApi.get.mockResolvedValue(
      group({ membershipStatus: 'member', isLeader: false, memberCount: 3 }),
    );
    mockApi.members.mockResolvedValue([
      member(),
      member({ userId: 'u2', name: 'Grace', role: 'member' }),
    ]);
    const tree = await renderDetail();
    expect(mockApi.members).toHaveBeenCalledWith('g1');
    expect(mockApi.listJoinRequests).not.toHaveBeenCalled();
    expect(labels(tree)).toContain('Leave group');
    expect(labels(tree)).toContain('Open group chat');
    expect(labels(tree)).not.toContain('Approve');
    expect(labels(tree)).not.toContain('Request to join');
  });

  it('lets leaders approve pending requests', async () => {
    mockApi.get.mockResolvedValue(
      group({
        membershipStatus: 'leader',
        isLeader: true,
        memberCount: 2,
      }),
    );
    mockApi.members.mockResolvedValue([member()]);
    mockApi.listJoinRequests.mockResolvedValue([joinRequest()]);
    mockApi.approveJoin.mockResolvedValue(joinRequest({ status: 'approved' }));
    const tree = await renderDetail();
    expect(labels(tree)).toEqual(
      expect.arrayContaining(['Approve', 'Decline']),
    );
    expect(labels(tree)).not.toContain('Leave group');
    await act(async () => {
      tree.root
        .findAllByType(Button)
        .find(node => node.props.label === 'Approve')
        ?.props.onPress();
      await Promise.resolve();
    });
    expect(mockApi.approveJoin).toHaveBeenCalledWith('g1', 'jr1');
  });

  it('lets a sole leader leave (archive) and navigates back to Groups', async () => {
    mockApi.get.mockResolvedValue(
      group({
        membershipStatus: 'leader',
        isLeader: true,
        memberCount: 1,
      }),
    );
    mockApi.members.mockResolvedValue([member()]);
    mockApi.listJoinRequests.mockResolvedValue([]);
    mockApi.leave.mockResolvedValue(undefined);
    const tree = await renderDetail();
    await act(async () => {
      tree.root
        .findAllByType(Button)
        .find(node => node.props.label === 'Leave and archive')
        ?.props.onPress();
      await Promise.resolve();
    });
    expect(mockApi.leave).toHaveBeenCalledWith('g1');
    expect(navigation.navigate).toHaveBeenCalledWith('Home', {
      screen: 'Groups',
    });
  });
});
