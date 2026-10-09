import { ApiClient } from '../src/api/client';
import { AbortedError } from '../src/api/errors';
import {
  isSearchCancelled,
  runGroupSearch,
  searchHasMore,
} from '../src/features/groups/searchSession';

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('searchSession (mocked HTTP — not a live Rust server)', () => {
  it('posts fullText and semantic modes and ignores blank queries', async () => {
    const fetchImpl = jest.fn(async (_input, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      return jsonResponse(200, {
        mode: body.mode,
        query: body.query,
        results: [],
        limit: body.limit,
        offset: body.offset,
      });
    });
    const client = new ApiClient(
      {
        getAccessToken: () => 't',
        refreshAccessToken: async () => null,
        onAuthFailure: async () => undefined,
      },
      fetchImpl as unknown as typeof fetch,
    );
    await expect(
      runGroupSearch(client, { query: '   ', mode: 'fullText' }),
    ).rejects.toThrow('query must not be blank');
    const full = await runGroupSearch(client, {
      query: 'graphs',
      mode: 'fullText',
    });
    expect(full.mode).toBe('fullText');
    const semantic = await runGroupSearch(client, {
      query: 'graphs',
      mode: 'semantic',
      offset: 20,
    });
    expect(semantic.mode).toBe('semantic');
    const bodies = fetchImpl.mock.calls.map(call =>
      JSON.parse(String((call[1] as RequestInit).body)),
    );
    expect(bodies[0].mode).toBe('fullText');
    expect(bodies[1]).toMatchObject({
      mode: 'semantic',
      offset: 20,
    });
  });

  it('treats abort as a cancelled search rather than a failure', () => {
    expect(isSearchCancelled(new AbortedError())).toBe(true);
    expect(isSearchCancelled(new Error('boom'))).toBe(false);
  });

  it('pages only when the last page filled the requested limit', () => {
    expect(searchHasMore(20, 20)).toBe(true);
    expect(searchHasMore(5, 20)).toBe(false);
  });
});
