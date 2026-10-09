import React from 'react';
import { act, create } from 'react-test-renderer';

import { Button } from '../src/components/Button';
import { TextField } from '../src/components/TextField';
import { CreateGroupScreen } from '../src/screens/CreateGroupScreen';
import { ThemeProvider } from '../src/theme';

const mockApi = {
  create: jest.fn(),
};

jest.mock('../src/features/groups/groupsApi', () => ({
  groupsApi: () => mockApi,
}));

jest.mock('../src/auth/AuthProvider', () => ({
  useAuth: () => ({
    client: {},
    state: {
      status: 'signedIn',
      user: { availability: [{ timezone: 'America/Chicago' }] },
    },
  }),
}));

const navigation = {
  goBack: jest.fn(),
  replace: jest.fn(),
};

describe('CreateGroupScreen (mocked HTTP — not a live Rust server)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('blocks submit until required fields are valid, then navigates with the created id', async () => {
    mockApi.create.mockResolvedValue({ id: 'g-created' });
    let tree: ReturnType<typeof create> | undefined;
    await act(async () => {
      tree = create(
        <ThemeProvider>
          <CreateGroupScreen
            navigation={navigation as never}
            route={{ key: 'c', name: 'CreateGroup', params: undefined }}
          />
        </ThemeProvider>,
      );
    });
    const submit = () =>
      tree!.root
        .findAllByType(Button)
        .find(n => n.props.label === 'Create group');

    await act(async () => {
      submit()?.props.onPress();
    });
    expect(mockApi.create).not.toHaveBeenCalled();

    const fields = tree!.root.findAllByType(TextField);
    await act(async () => {
      fields
        .find(f => f.props.label === 'Title')
        ?.props.onChangeText('Algo night');
      fields
        .find(f => f.props.label === 'Subject')
        ?.props.onChangeText('Algorithms');
    });
    await act(async () => {
      submit()?.props.onPress();
      await Promise.resolve();
    });
    expect(mockApi.create).toHaveBeenCalledTimes(1);
    expect(mockApi.create.mock.calls[0][0]).toMatchObject({
      title: 'Algo night',
      subject: 'Algorithms',
      maxMembers: 6,
    });
    expect(navigation.replace).toHaveBeenCalledWith('GroupDetail', {
      groupId: 'g-created',
    });
  });

  it('does not submit twice while the request is in flight', async () => {
    let resolveCreate: (value: { id: string }) => void = () => undefined;
    mockApi.create.mockImplementation(
      () =>
        new Promise(resolve => {
          resolveCreate = resolve;
        }),
    );
    let tree: ReturnType<typeof create> | undefined;
    await act(async () => {
      tree = create(
        <ThemeProvider>
          <CreateGroupScreen
            navigation={navigation as never}
            route={{ key: 'c', name: 'CreateGroup', params: undefined }}
          />
        </ThemeProvider>,
      );
    });
    const fields = tree!.root.findAllByType(TextField);
    await act(async () => {
      fields
        .find(f => f.props.label === 'Title')
        ?.props.onChangeText('Algo night');
      fields
        .find(f => f.props.label === 'Subject')
        ?.props.onChangeText('Algorithms');
    });
    const submit = tree!.root
      .findAllByType(Button)
      .find(n => n.props.label === 'Create group');
    await act(async () => {
      submit?.props.onPress();
      submit?.props.onPress();
    });
    expect(mockApi.create).toHaveBeenCalledTimes(1);
    await act(async () => {
      resolveCreate({ id: 'g-created' });
      await Promise.resolve();
    });
  });
});
