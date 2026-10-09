import { ApiClient } from '../src/api/client';
import { ApiError } from '../src/api/errors';
import { friendsApi } from '../src/features/social/friendsApi';

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
  return friendsApi(
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

describe('friendsApi (mocked HTTP — not a live Rust server)', () => {
  it('lists friends and empty incoming/outgoing requests', async () => {
    const fetchImpl = jest.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith('/friends')) {
        return jsonResponse(200, []);
      }
      if (url.endsWith('/friends/requests')) {
        return jsonResponse(200, { incoming: [], outgoing: [] });
      }
      return jsonResponse(404, { error: { code: 'not_found', message: url } });
    });
    const social = api(fetchImpl as unknown as typeof fetch);
    await expect(social.list()).resolves.toEqual([]);
    await expect(social.listRequests()).resolves.toEqual({
      incoming: [],
      outgoing: [],
    });
  });

  it('sends, accepts, and rejects friend requests', async () => {
    const fetchImpl = jest.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url.endsWith('/friends/requests') && init?.method === 'POST') {
          expect(JSON.parse(String(init.body))).toEqual({
            userId: '11111111-1111-7111-8111-111111111111',
          });
          return jsonResponse(201, {
            id: 'r1',
            status: 'pending',
            requester: { id: 'me', name: 'Ada' },
            recipient: { id: 'them', name: 'Grace' },
          });
        }
        if (url.endsWith('/friends/requests/r1/accept')) {
          return jsonResponse(200, { id: 'r1', status: 'accepted' });
        }
        if (url.endsWith('/friends/requests/r1/reject')) {
          return jsonResponse(200, { id: 'r1', status: 'rejected' });
        }
        return jsonResponse(404, {
          error: { code: 'not_found', message: url },
        });
      },
    );
    const social = api(fetchImpl as unknown as typeof fetch);
    await expect(
      social.sendRequest('11111111-1111-7111-8111-111111111111'),
    ).resolves.toMatchObject({ status: 'pending' });
    await expect(social.acceptRequest('r1')).resolves.toMatchObject({
      status: 'accepted',
    });
    await expect(social.rejectRequest('r1')).resolves.toMatchObject({
      status: 'rejected',
    });
  });

  it('maps already-friends, pending, blocked, and not-found errors', async () => {
    const cases = [
      ['already_friends', 409],
      ['friend_request_pending', 409],
      ['user_blocked', 403],
      ['user_not_found', 404],
    ] as const;
    for (const [code, status] of cases) {
      const social = api(
        jest.fn(async () =>
          jsonResponse(status, {
            error: { code, message: code },
          }),
        ) as unknown as typeof fetch,
      );
      await expect(social.sendRequest('u')).rejects.toMatchObject({
        name: 'ApiError',
        code,
        status,
      } satisfies Partial<ApiError>);
    }
  });

  it('blocks and unblocks without a JSON body', async () => {
    const fetchImpl = jest.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url.endsWith('/blocks') && init?.method === 'POST') {
          expect(JSON.parse(String(init.body))).toEqual({ userId: 'u2' });
          return jsonResponse(204);
        }
        if (url.endsWith('/blocks/u2') && init?.method === 'DELETE') {
          return jsonResponse(204);
        }
        return jsonResponse(404, {
          error: { code: 'not_found', message: url },
        });
      },
    );
    const social = api(fetchImpl as unknown as typeof fetch);
    await expect(social.block('u2')).resolves.toBeUndefined();
    await expect(social.unblock('u2')).resolves.toBeUndefined();
  });
});
