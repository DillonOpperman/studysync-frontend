import { SessionController } from '../src/auth/session';
import { createMemoryRefreshTokenStore } from '../src/auth/refreshTokenStore';
import type { AuthResponse, UserProfileDto } from '../src/api/types';

function profile(overrides: Partial<UserProfileDto> = {}): UserProfileDto {
  return {
    id: '11111111-1111-7111-8111-111111111111',
    name: 'Ada Lovelace',
    email: 'ada@campus.edu',
    institution: {
      id: 'i1',
      name: 'Example University',
      slug: 'example-university',
      domain: null,
    },
    major: 'Computer Science',
    year: 'Junior',
    learningStyle: '',
    performanceLevel: 3,
    profilePictureKey: null,
    profilePicture: null,
    studyEnvironments: ['Library'],
    studyMethods: ['Practice problems'],
    studyGoals: ['Exam preparation'],
    subjects: [{ id: 'c1', name: 'Algorithms', courseCode: null }],
    availability: [
      {
        dayOfWeek: 0,
        startTime: '17:00:00',
        endTime: '21:00:00',
        timezone: 'America/Chicago',
      },
    ],
    groupPreferences: {
      preferredGroupSizeMin: 3,
      preferredGroupSizeMax: 5,
      sessionDurationMinutes: 90,
    },
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

function auth(refreshToken: string, accessToken = 'access.1'): AuthResponse {
  return { accessToken, refreshToken, user: profile() };
}

function json(status: number, body: unknown): Response {
  const text = status === 204 ? '' : JSON.stringify(body);
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => text,
  } as Response;
}

describe('SessionController', () => {
  it('logs in, stores only the refresh token, and loads /me and /groups/mine', async () => {
    const store = createMemoryRefreshTokenStore();
    const fetchImpl = jest.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith('/auth/login')) {
        return json(200, auth('refresh.login'));
      }
      if (url.endsWith('/me')) {
        return json(200, profile({ name: 'Ada Lovelace' }));
      }
      if (url.endsWith('/groups/mine')) {
        return json(200, []);
      }
      return json(404, { error: { code: 'not_found', message: url } });
    });
    const session = new SessionController(
      store,
      fetchImpl as unknown as typeof fetch,
    );
    await session.login({ email: 'ada@campus.edu', password: 'password12' });
    expect(session.getState().status).toBe('signedIn');
    expect(await store.get()).toBe('refresh.login');
    expect(await session.loadMe()).toMatchObject({ email: 'ada@campus.edu' });
    await expect(session.listMyGroups()).resolves.toEqual([]);
  });

  it('restores a session by rotating the refresh token', async () => {
    const store = createMemoryRefreshTokenStore('refresh.old');
    const fetchImpl = jest.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url.endsWith('/auth/refresh')) {
          const body = JSON.parse(String(init?.body));
          expect(body.refreshToken).toBe('refresh.old');
          return json(200, auth('refresh.new', 'access.2'));
        }
        return json(500, {
          error: { code: 'internal_error', message: 'unexpected' },
        });
      },
    );
    const session = new SessionController(
      store,
      fetchImpl as unknown as typeof fetch,
    );
    const state = await session.restore();
    expect(state.status).toBe('signedIn');
    expect(await store.get()).toBe('refresh.new');
  });

  it('coalesces concurrent refresh calls into one HTTP request', async () => {
    const store = createMemoryRefreshTokenStore('refresh.old');
    let refreshCalls = 0;
    let release: (value: Response) => void = () => undefined;
    const gate = new Promise<Response>(resolve => {
      release = resolve;
    });
    const fetchImpl = jest.fn(async (input: RequestInfo | URL) => {
      if (String(input).endsWith('/auth/refresh')) {
        refreshCalls += 1;
        return gate;
      }
      return json(500, { error: { code: 'internal_error', message: 'nope' } });
    });
    const session = new SessionController(
      store,
      fetchImpl as unknown as typeof fetch,
    );
    const pending = Promise.all([
      session.refreshAccessToken(),
      session.refreshAccessToken(),
      session.refreshAccessToken(),
    ]);
    release(json(200, auth('refresh.rot', 'access.rot')));
    const tokens = await pending;
    expect(refreshCalls).toBe(1);
    expect(tokens).toEqual(['access.rot', 'access.rot', 'access.rot']);
    expect(await store.get()).toBe('refresh.rot');
  });

  it('clears local credentials when refresh is rejected', async () => {
    const store = createMemoryRefreshTokenStore('dead');
    const fetchImpl = jest.fn(async () =>
      json(401, {
        error: {
          code: 'invalid_refresh_token',
          message: 'invalid or expired refresh token',
        },
      }),
    );
    const session = new SessionController(
      store,
      fetchImpl as unknown as typeof fetch,
    );
    await session.restore();
    expect(session.getState().status).toBe('signedOut');
    expect(await store.get()).toBeNull();
  });

  it('revokes the refresh session on logout then forgets local tokens', async () => {
    const store = createMemoryRefreshTokenStore('refresh.keep');
    const fetchImpl = jest.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        if (String(input).endsWith('/auth/login')) {
          return json(200, auth('refresh.keep'));
        }
        if (String(input).endsWith('/auth/logout')) {
          expect(JSON.parse(String(init?.body))).toEqual({
            refreshToken: 'refresh.keep',
          });
          return json(204, null);
        }
        return json(500, {
          error: { code: 'internal_error', message: 'nope' },
        });
      },
    );
    const session = new SessionController(
      store,
      fetchImpl as unknown as typeof fetch,
    );
    await session.login({ email: 'ada@campus.edu', password: 'password12' });
    await session.logout();
    expect(session.getState().status).toBe('signedOut');
    expect(await store.get()).toBeNull();
  });
});
