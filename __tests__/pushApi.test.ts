import { ApiClient } from '../src/api/client';
import { notificationsApi } from '../src/features/notifications/notificationsApi';
import { pushApi } from '../src/features/push/pushApi';

function jsonResponse(status: number, body?: unknown): Response {
  if (status === 204) {
    return new Response(null, { status });
  }
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function wrap(fetchImpl: typeof fetch) {
  return new ApiClient(
    {
      getAccessToken: () => 't',
      refreshAccessToken: async () => null,
      onAuthFailure: async () => undefined,
    },
    fetchImpl,
  );
}

describe('push and notification get APIs', () => {
  it('loads and updates preferences without sending tokens', async () => {
    const fetchImpl = jest.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url.endsWith('/push/preferences') && init?.method === 'GET') {
          return jsonResponse(200, {
            pushEnabled: true,
            friends: true,
            groups: true,
            messages: true,
            announcements: true,
            updatedAt: '2026-01-01T00:00:00Z',
          });
        }
        if (url.endsWith('/push/preferences') && init?.method === 'PUT') {
          expect(JSON.parse(String(init.body))).toEqual({ pushEnabled: false });
          return jsonResponse(200, {
            pushEnabled: false,
            friends: true,
            groups: true,
            messages: true,
            announcements: true,
            updatedAt: '2026-01-01T00:00:01Z',
          });
        }
        return jsonResponse(404);
      },
    );
    const api = pushApi(wrap(fetchImpl as unknown as typeof fetch));
    await expect(api.getPreferences()).resolves.toMatchObject({
      pushEnabled: true,
    });
    await expect(
      api.updatePreferences({ pushEnabled: false }),
    ).resolves.toMatchObject({
      pushEnabled: false,
    });
  });

  it('fetches one notification by id for tap navigation', async () => {
    const fetchImpl = jest.fn(async (input: RequestInfo | URL) => {
      expect(String(input)).toContain('/notifications/n1');
      return jsonResponse(200, {
        id: 'n1',
        type: 'friend_request',
        title: 'New friend request',
        body: 'Someone sent you a friend request.',
        data: {},
        readAt: null,
        createdAt: '2026-01-01T00:00:00Z',
      });
    });
    await expect(
      notificationsApi(wrap(fetchImpl as unknown as typeof fetch)).get('n1'),
    ).resolves.toMatchObject({ id: 'n1', type: 'friend_request' });
  });
});
