import { ApiClient } from '../src/api/client';
import { ApiError, NetworkError } from '../src/api/errors';

function jsonResponse(status: number, body: unknown): Response {
  return new Response(body === undefined ? '' : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('ApiClient', () => {
  it('attaches a bearer token and parses camelCase JSON', async () => {
    const fetchImpl = jest.fn(async () =>
      jsonResponse(200, { id: 'u1', name: 'Ada' }),
    );
    const client = new ApiClient(
      {
        getAccessToken: () => 'access.jwt',
        refreshAccessToken: async () => null,
        onAuthFailure: async () => undefined,
      },
      fetchImpl as unknown as typeof fetch,
    );
    const profile = await client.request<{ id: string; name: string }>('/me');
    expect(profile.name).toBe('Ada');
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [
      string,
      { headers?: Headers },
    ];
    const headers = new Headers(init.headers);
    expect(headers.get('Authorization')).toBe('Bearer access.jwt');
    expect(String(url)).toContain('/api/v1/me');
  });

  it('retries once after token_expired using a new access token', async () => {
    let access = 'old';
    const fetchImpl = jest.fn(async () => {
      if (access === 'old') {
        return jsonResponse(401, {
          error: { code: 'token_expired', message: 'access token has expired' },
        });
      }
      return jsonResponse(200, { ok: true });
    });
    const refreshAccessToken = jest.fn(async () => {
      access = 'new';
      return access;
    });
    const client = new ApiClient(
      {
        getAccessToken: () => access,
        refreshAccessToken,
        onAuthFailure: async () => undefined,
      },
      fetchImpl as unknown as typeof fetch,
    );
    await expect(client.request('/groups/mine')).resolves.toEqual({ ok: true });
    expect(refreshAccessToken).toHaveBeenCalledTimes(1);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('maps HTTP error bodies to ApiError codes', async () => {
    const fetchImpl = jest.fn(async () =>
      jsonResponse(409, {
        error: {
          code: 'duplicate_email',
          message: 'email is already registered',
        },
      }),
    );
    const client = new ApiClient(
      {
        getAccessToken: () => null,
        refreshAccessToken: async () => null,
        onAuthFailure: async () => undefined,
      },
      fetchImpl as unknown as typeof fetch,
    );
    await expect(
      client.request('/auth/register', {
        method: 'POST',
        skipAuth: true,
        body: '{}',
      }),
    ).rejects.toMatchObject({
      name: 'ApiError',
      code: 'duplicate_email',
      status: 409,
    } satisfies Partial<ApiError>);
  });

  it('wraps transport failures', async () => {
    const fetchImpl = jest.fn(async () => {
      throw new TypeError('Network request failed');
    });
    const client = new ApiClient(
      {
        getAccessToken: () => 'x',
        refreshAccessToken: async () => null,
        onAuthFailure: async () => undefined,
      },
      fetchImpl as unknown as typeof fetch,
    );
    await expect(client.request('/me')).rejects.toBeInstanceOf(NetworkError);
  });
});
