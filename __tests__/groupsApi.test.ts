import { ApiClient } from '../src/api/client';
import { ApiError } from '../src/api/errors';
import { groupsApi } from '../src/features/groups/groupsApi';

function jsonResponse(status: number, body: unknown): Response {
  if (status === 204) {
    return {
      ok: true,
      status: 204,
      text: async () => '',
    } as Response;
  }
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function client(fetchImpl: typeof fetch) {
  return new ApiClient(
    {
      getAccessToken: () => 'access.jwt',
      refreshAccessToken: async () => null,
      onAuthFailure: async () => undefined,
    },
    fetchImpl,
  );
}

describe('groupsApi (mocked HTTP — not a live Rust server)', () => {
  it('lists mine, creates, loads detail, and posts join/leave on the real routes', async () => {
    const fetchImpl = jest.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        const method = init?.method ?? 'GET';
        if (url.endsWith('/groups/mine') && method === 'GET') {
          return jsonResponse(200, []);
        }
        if (url.endsWith('/groups') && method === 'POST') {
          const body = JSON.parse(String(init?.body));
          expect(body).toMatchObject({
            title: 'Algo night',
            subject: 'Algorithms',
            maxMembers: 6,
          });
          return jsonResponse(201, { id: 'g-new', title: body.title });
        }
        if (url.endsWith('/groups/g-new') && method === 'GET') {
          return jsonResponse(200, { id: 'g-new', membershipStatus: 'leader' });
        }
        if (url.endsWith('/groups/g1/join-requests') && method === 'POST') {
          return jsonResponse(201, { id: 'jr1', status: 'pending' });
        }
        if (url.endsWith('/groups/g1/leave') && method === 'POST') {
          return jsonResponse(204, undefined);
        }
        return jsonResponse(404, {
          error: { code: 'not_found', message: url },
        });
      },
    );
    const api = groupsApi(client(fetchImpl as unknown as typeof fetch));
    await expect(api.listMine()).resolves.toEqual([]);
    await expect(
      api.create({
        title: 'Algo night',
        subject: 'Algorithms',
        maxMembers: 6,
      }),
    ).resolves.toMatchObject({ id: 'g-new' });
    await expect(api.get('g-new')).resolves.toMatchObject({
      membershipStatus: 'leader',
    });
    await expect(api.requestJoin('g1')).resolves.toMatchObject({
      status: 'pending',
    });
    await expect(api.leave('g1')).resolves.toBeUndefined();
  });

  it('searches with POST /search/groups and recommends with POST /recommend', async () => {
    const fetchImpl = jest.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url.endsWith('/search/groups')) {
          expect(init?.method).toBe('POST');
          expect(JSON.parse(String(init?.body))).toEqual({
            query: 'calculus',
            mode: 'semantic',
            limit: 20,
            offset: 0,
          });
          return jsonResponse(200, {
            mode: 'semantic',
            query: 'calculus',
            results: [],
            limit: 20,
            offset: 0,
          });
        }
        if (url.endsWith('/recommend')) {
          expect(init?.method).toBe('POST');
          return jsonResponse(200, {
            groups: [],
            createNew: true,
            formula:
              '0.50*group_subject + 0.20*leader_subject + 0.20*schedule + 0.10*size',
            modelId: 'nomic',
            semanticAvailable: true,
          });
        }
        return jsonResponse(404, {
          error: { code: 'not_found', message: url },
        });
      },
    );
    const api = groupsApi(client(fetchImpl as unknown as typeof fetch));
    await expect(
      api.search({
        query: 'calculus',
        mode: 'semantic',
        limit: 20,
        offset: 0,
      }),
    ).resolves.toMatchObject({ mode: 'semantic', results: [] });
    await expect(api.recommend()).resolves.toMatchObject({
      createNew: true,
      groups: [],
    });
  });

  it('surfaces session expiration from group routes', async () => {
    const onAuthFailure = jest.fn(async () => undefined);
    const fetchImpl = jest.fn(async () =>
      jsonResponse(401, {
        error: { code: 'token_expired', message: 'access token has expired' },
      }),
    );
    const api = groupsApi(
      new ApiClient(
        {
          getAccessToken: () => 'stale',
          refreshAccessToken: async () => null,
          onAuthFailure,
        },
        fetchImpl as unknown as typeof fetch,
      ),
    );
    await expect(api.listMine()).rejects.toBeInstanceOf(ApiError);
    expect(onAuthFailure).toHaveBeenCalled();
  });

  it('maps semantic search unavailability', async () => {
    const fetchImpl = jest.fn(async () =>
      jsonResponse(503, {
        error: {
          code: 'semantic_unavailable',
          message: 'semantic search is unavailable',
        },
      }),
    );
    const api = groupsApi(client(fetchImpl as unknown as typeof fetch));
    await expect(
      api.search({ query: 'graphs', mode: 'semantic' }),
    ).rejects.toMatchObject({
      code: 'semantic_unavailable',
      status: 503,
    });
  });
});
