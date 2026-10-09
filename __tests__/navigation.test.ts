import { rootFor } from '../src/navigation/rootFor';
import type { UserProfileDto } from '../src/api/types';

const user = { id: '1', name: 'Ada' } as UserProfileDto;

describe('initial navigation', () => {
  it('shows splash while restoring, auth when signed out, home when signed in', () => {
    expect(rootFor({ status: 'loading' })).toBe('splash');
    expect(rootFor({ status: 'signedOut' })).toBe('auth');
    expect(rootFor({ status: 'signedIn', user })).toBe('app');
  });
});
