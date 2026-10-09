import React from 'react';
import { act, create } from 'react-test-renderer';

import { EmptyState } from '../src/components/EmptyState';
import { GroupRow } from '../src/components/GroupRow';
import { GroupsScreen } from '../src/screens/GroupsScreen';
import { ThemeProvider } from '../src/theme';
import { group, recommended } from '../src/testSupport/groupFixtures';

const mockApi = {
  listMine: jest.fn(),
  recommend: jest.fn(),
};

jest.mock('../src/features/groups/groupsApi', () => ({
  groupsApi: () => mockApi,
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

describe('GroupsScreen (mocked HTTP — not a live Rust server)', () => {
  let tree: ReturnType<typeof create> | undefined;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await act(async () => {
      tree?.unmount();
    });
    tree = undefined;
  });

  it('separates memberships from recommendations and navigates to detail', async () => {
    mockApi.listMine.mockResolvedValue([
      group({ id: 'mine', membershipStatus: 'leader', isLeader: true }),
    ]);
    mockApi.recommend.mockResolvedValue({
      groups: [recommended()],
      createNew: false,
      formula:
        '0.50*group_subject + 0.20*leader_subject + 0.20*schedule + 0.10*size',
      modelId: 'nomic',
      semanticAvailable: true,
    });
    await act(async () => {
      tree = create(
        <ThemeProvider>
          <GroupsScreen
            navigation={navigation as never}
            route={{ key: 'g', name: 'Groups', params: undefined }}
          />
        </ThemeProvider>,
      );
      await Promise.resolve();
      await Promise.resolve();
    });
    const rows = tree!.root.findAllByType(GroupRow);
    expect(rows.map(r => r.props.group.id)).toEqual(['mine', 'g-rec']);
    expect(rows[1].props.caption).toMatch(/subject/);
    await act(async () => {
      rows[0].props.onPress();
    });
    expect(navigation.navigate).toHaveBeenCalledWith('GroupDetail', {
      groupId: 'mine',
    });
  });

  it('shows an honest empty state when the API returns no matches', async () => {
    mockApi.listMine.mockResolvedValue([]);
    mockApi.recommend.mockResolvedValue({
      groups: [],
      createNew: true,
      formula: 'formula',
      modelId: 'nomic',
      semanticAvailable: true,
    });
    await act(async () => {
      tree = create(
        <ThemeProvider>
          <GroupsScreen
            navigation={navigation as never}
            route={{ key: 'g', name: 'Groups', params: undefined }}
          />
        </ThemeProvider>,
      );
      await Promise.resolve();
      await Promise.resolve();
    });
    const empties = tree!.root.findAllByType(EmptyState);
    expect(empties.some(n => n.props.title === 'No memberships yet')).toBe(
      true,
    );
    expect(empties.some(n => n.props.title === 'No strong matches')).toBe(true);
  });

  it('keeps memberships when recommendations fail', async () => {
    mockApi.listMine.mockResolvedValue([
      group({ id: 'mine', membershipStatus: 'member', isLeader: false }),
    ]);
    mockApi.recommend.mockRejectedValue(new Error('recommend down'));
    await act(async () => {
      tree = create(
        <ThemeProvider>
          <GroupsScreen
            navigation={navigation as never}
            route={{ key: 'g', name: 'Groups', params: undefined }}
          />
        </ThemeProvider>,
      );
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(tree!.root.findAllByType(GroupRow)[0].props.group.id).toBe('mine');
  });
});
