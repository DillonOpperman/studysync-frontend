import { rootFor } from '../src/navigation/rootFor';
import { APP_STACK_ROUTES, HOME_DESK_ROUTES } from '../src/navigation/types';
import type { UserProfileDto } from '../src/api/types';

const user = { id: '1', name: 'Ada' } as UserProfileDto;

describe('initial navigation', () => {
  it('shows splash while restoring, auth when signed out, home when signed in', () => {
    expect(rootFor({ status: 'loading' })).toBe('splash');
    expect(rootFor({ status: 'signedOut' })).toBe('auth');
    expect(rootFor({ status: 'signedIn', user })).toBe('app');
  });

  it('exposes Groups, Search, Create, Detail, Friends, Alerts, and DirectChat without dummy tabs', () => {
    expect(HOME_DESK_ROUTES).toEqual([
      'Desk',
      'Groups',
      'Friends',
      'CreateGroup',
      'Search',
      'GroupDetail',
      'Notifications',
    ]);
    expect(APP_STACK_ROUTES).toEqual(['Home', 'GroupChat', 'DirectChat']);
    expect(APP_STACK_ROUTES).not.toContain('Chat');
    expect(APP_STACK_ROUTES).not.toContain('Profile');
  });
});
