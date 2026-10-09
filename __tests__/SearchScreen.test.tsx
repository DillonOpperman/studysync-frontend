import React from 'react';
import { act, create } from 'react-test-renderer';

import { Button } from '../src/components/Button';
import { Chip } from '../src/components/Chip';
import { EmptyState } from '../src/components/EmptyState';
import { GroupRow } from '../src/components/GroupRow';
import { TextField } from '../src/components/TextField';
import { SearchScreen } from '../src/screens/SearchScreen';
import { ThemeProvider } from '../src/theme';
import { group } from '../src/testSupport/groupFixtures';

const mockSearch = jest.fn();

jest.mock('../src/features/groups/searchSession', () => {
  const actual = jest.requireActual('../src/features/groups/searchSession');
  return {
    ...actual,
    runGroupSearch: (...args: unknown[]) => mockSearch(...args),
  };
});

const mockClient = { kind: 'client' };

jest.mock('../src/auth/AuthProvider', () => ({
  useAuth: () => ({ client: mockClient }),
}));

const navigation = {
  goBack: jest.fn(),
  navigate: jest.fn(),
};

describe('SearchScreen (mocked HTTP — not a live Rust server)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('debounces live search, switches modes, and opens group details', async () => {
    mockSearch.mockResolvedValue({
      mode: 'fullText',
      query: 'calc',
      results: [{ group: group({ id: 'hit', title: 'Calc lab' }), score: 0.9 }],
      limit: 20,
      offset: 0,
    });
    let tree: ReturnType<typeof create> | undefined;
    await act(async () => {
      tree = create(
        <ThemeProvider>
          <SearchScreen
            navigation={navigation as never}
            route={{ key: 's', name: 'Search', params: undefined }}
          />
        </ThemeProvider>,
      );
    });
    const field = tree!.root.findAllByType(TextField)[0];
    await act(async () => {
      field.props.onChangeText('c');
      field.props.onChangeText('calc');
    });
    expect(mockSearch).not.toHaveBeenCalled();
    await act(async () => {
      jest.advanceTimersByTime(400);
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(mockSearch).toHaveBeenCalledTimes(1);
    expect(mockSearch.mock.calls[0][1]).toMatchObject({
      query: 'calc',
      mode: 'fullText',
    });

    mockSearch.mockResolvedValue({
      mode: 'semantic',
      query: 'calc',
      results: [{ group: group({ id: 'hit', title: 'Calc lab' }), score: 0.4 }],
      limit: 20,
      offset: 0,
    });
    await act(async () => {
      tree!.root
        .findAllByType(Chip)
        .find(n => n.props.label === 'Semantic')
        ?.props.onPress();
      jest.advanceTimersByTime(400);
      await Promise.resolve();
    });
    expect(mockSearch.mock.calls.at(-1)?.[1]).toMatchObject({
      mode: 'semantic',
    });

    await act(async () => {
      tree!.root.findAllByType(GroupRow)[0].props.onPress();
    });
    expect(navigation.navigate).toHaveBeenCalledWith('GroupDetail', {
      groupId: 'hit',
    });
  });

  it('does not search blank queries and shows an empty-results state', async () => {
    mockSearch.mockResolvedValue({
      mode: 'fullText',
      query: 'zzzz',
      results: [],
      limit: 20,
      offset: 0,
    });
    let tree: ReturnType<typeof create> | undefined;
    await act(async () => {
      tree = create(
        <ThemeProvider>
          <SearchScreen
            navigation={navigation as never}
            route={{ key: 's', name: 'Search', params: undefined }}
          />
        </ThemeProvider>,
      );
    });
    await act(async () => {
      tree!.root.findAllByType(Button)[0].props.onPress();
    });
    expect(mockSearch).not.toHaveBeenCalled();

    await act(async () => {
      tree!.root.findAllByType(TextField)[0].props.onChangeText('zzzz');
    });
    await act(async () => {
      jest.clearAllTimers();
      tree!.root.findAllByType(Button)[0].props.onPress();
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(mockSearch).toHaveBeenCalled();
    expect(
      tree!.root
        .findAllByType(EmptyState)
        .some(n => n.props.title === 'No groups found'),
    ).toBe(true);
  });
});
