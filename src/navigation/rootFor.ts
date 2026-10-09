import type { SessionState } from '../auth/session';

export type RootView = 'splash' | 'auth' | 'app';

export function rootFor(state: SessionState): RootView {
  if (state.status === 'loading') {
    return 'splash';
  }
  if (state.status === 'signedIn') {
    return 'app';
  }
  return 'auth';
}
