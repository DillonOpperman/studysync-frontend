import { ApiClient } from '../src/api/client';
import { ApiError } from '../src/api/errors';
import { notificationsApi } from '../src/features/notifications/notificationsApi';

function jsonResponse(status: number, body?: unknown): Response {
  if (status === 204) {
    return new Response(null, { status });
  }
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function api(fetchImpl: typeof fetch) {
  return notificationsApi(
    new ApiClient(
      {
        getAccessToken: () => 't',
        refreshAccessToken: async () => null,
        onAuthFailure: async () => undefined,
      },
      fetchImpl,
    ),
  );
}

describe('notificationsApi (mocked HTTP — not a live Rust server)', () => {
  it('lists notifications with limit and offset query params', async () => {
    const fetchImpl = jest.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      expect(url).toContain('/notifications?limit=20&offset=20');
      return jsonResponse(200, []);
    });
    await expect(
      api(fetchImpl as unknown as typeof fetch).list({ limit: 20, offset: 20 }),
    ).resolves.toEqual([]);
  });

  it('clamps list limit to the backend maximum of 50', async () => {
    const fetchImpl = jest.fn(async (input: RequestInfo | URL) => {
      expect(String(input)).toContain('limit=50');
      return jsonResponse(200, []);
    });
    await api(fetchImpl as unknown as typeof fetch).list({ limit: 500 });
  });

  it('marks one notification and all notifications as read', async () => {
    const fetchImpl = jest.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        expect(init?.method).toBe('POST');
        if (url.endsWith('/notifications/n1/read')) {
          return jsonResponse(204);
        }
        if (url.endsWith('/notifications/read-all')) {
          return jsonResponse(204);
        }
        return jsonResponse(404, {
          error: { code: 'not_found', message: url },
        });
      },
    );
    const notes = api(fetchImpl as unknown as typeof fetch);
    await expect(notes.markRead('n1')).resolves.toBeUndefined();
    await expect(notes.markAllRead()).resolves.toBeUndefined();
  });

  it('surfaces notification_not_found from mark-read', async () => {
    const fetchImpl = jest.fn(async () =>
      jsonResponse(404, {
        error: {
          code: 'notification_not_found',
          message: 'notification not found',
        },
      }),
    );
    await expect(
      api(fetchImpl as unknown as typeof fetch).markRead('missing'),
    ).rejects.toMatchObject({
      code: 'notification_not_found',
      status: 404,
    } satisfies Partial<ApiError>);
  });
});
