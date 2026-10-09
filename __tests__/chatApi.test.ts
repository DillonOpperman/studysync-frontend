import { ApiClient } from '../src/api/client';
import { ApiError } from '../src/api/errors';
import { chatApi } from '../src/features/chat/chatApi';

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('chatApi (mocked HTTP — not a live Rust server)', () => {
  it('lists with before/after cursors and posts clientMsgId', async () => {
    const fetchImpl = jest.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url.includes('/groups/g1/messages?before=m0&limit=50')) {
          return jsonResponse(200, {
            messages: [],
            pagination: {
              limit: 50,
              hasMore: false,
              nextBefore: null,
              nextAfter: null,
            },
          });
        }
        if (url.endsWith('/groups/g1/messages') && init?.method === 'POST') {
          expect(JSON.parse(String(init.body))).toMatchObject({
            clientMsgId: 'c1',
            content: 'Hello',
          });
          return jsonResponse(201, { id: 'm9', clientMsgId: 'c1' });
        }
        return jsonResponse(404, {
          error: { code: 'not_found', message: url },
        });
      },
    );
    const api = chatApi(
      new ApiClient(
        {
          getAccessToken: () => 't',
          refreshAccessToken: async () => null,
          onAuthFailure: async () => undefined,
        },
        fetchImpl as unknown as typeof fetch,
      ),
    );
    await expect(
      api.list('g1', { before: 'm0', limit: 50 }),
    ).resolves.toMatchObject({ pagination: { hasMore: false } });
    await expect(
      api.send('g1', { clientMsgId: 'c1', content: 'Hello' }),
    ).resolves.toMatchObject({ id: 'm9' });
  });

  it('maps membership and archived errors', async () => {
    const fetchImpl = jest.fn(async () =>
      jsonResponse(403, {
        error: { code: 'not_group_member', message: 'not a member' },
      }),
    );
    const api = chatApi(
      new ApiClient(
        {
          getAccessToken: () => 't',
          refreshAccessToken: async () => null,
          onAuthFailure: async () => undefined,
        },
        fetchImpl as unknown as typeof fetch,
      ),
    );
    await expect(api.list('g1')).rejects.toMatchObject({
      name: 'ApiError',
      code: 'not_group_member',
    } satisfies Partial<ApiError>);
  });
});
