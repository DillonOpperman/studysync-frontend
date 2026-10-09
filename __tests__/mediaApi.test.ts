import { ApiClient } from '../src/api/client';
import { ApiError } from '../src/api/errors';
import { buildMediaForm, mediaApi } from '../src/features/media/mediaApi';
import { uploadPendingAttachments } from '../src/features/media/uploadAll';
import type { LocalAttachment } from '../src/features/media/limits';

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const file: LocalAttachment = {
  localId: 'l1',
  uri: 'file://pic.png',
  name: 'pic.png',
  type: 'image/png',
  size: 12,
  kind: 'image',
};

const media = {
  id: 'media-1',
  fileName: 'pic.png',
  contentType: 'image/png',
  byteSize: 12,
  kind: 'image',
  status: 'uploaded',
  downloadUrl: 'memory://k?exp=1&sig=x',
};

describe('mediaApi (mocked HTTP — not a live Rust server)', () => {
  it('posts multipart fields the backend reads', async () => {
    expect(
      buildMediaForm('group_message', file, { groupId: 'g1' }),
    ).toBeInstanceOf(FormData);
    const fetchImpl = jest.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        expect(String(input)).toContain('/api/v1/media');
        expect(init?.method).toBe('POST');
        expect(init?.body).toBeInstanceOf(FormData);
        const headers = new Headers(init?.headers);
        expect(headers.get('Content-Type')).toBeNull();
        expect(headers.get('Authorization')).toBe('Bearer t');
        return jsonResponse(201, media);
      },
    );
    const client = new ApiClient(
      {
        getAccessToken: () => 't',
        refreshAccessToken: async () => null,
        onAuthFailure: async () => undefined,
      },
      fetchImpl as unknown as typeof fetch,
    );
    await expect(
      mediaApi(client).upload('group_message', file, { groupId: 'g1' }),
    ).resolves.toMatchObject({ id: 'media-1' });
  });

  it('looks up media, maps forbidden/expired, and skips re-upload of known ids', async () => {
    const fetchImpl = jest.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith('/media/media-1')) {
        return jsonResponse(200, { ...media, status: 'attached' });
      }
      return jsonResponse(403, {
        error: { code: 'media_forbidden', message: 'no' },
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
    await expect(mediaApi(client).get('media-1')).resolves.toMatchObject({
      status: 'attached',
    });
    await expect(mediaApi(client).get('other')).rejects.toMatchObject({
      name: 'ApiError',
      code: 'media_forbidden',
    } satisfies Partial<ApiError>);

    const uploaded = { ...file, mediaId: 'already' };
    const next = await uploadPendingAttachments(
      client,
      'direct_message',
      [uploaded],
      { recipientId: 'u2' },
    );
    expect(next[0].mediaId).toBe('already');
    expect(fetchImpl).not.toHaveBeenCalledWith(
      expect.stringMatching(/\/media$/),
      expect.anything(),
    );
  });

  it('maps expired sessions on upload', async () => {
    const client = new ApiClient(
      {
        getAccessToken: () => 't',
        refreshAccessToken: async () => null,
        onAuthFailure: async () => undefined,
      },
      jest.fn(async () =>
        jsonResponse(401, {
          error: { code: 'token_expired', message: 'expired' },
        }),
      ) as unknown as typeof fetch,
    );
    await expect(
      mediaApi(client).upload('direct_message', file, { recipientId: 'u2' }),
    ).rejects.toMatchObject({ code: 'token_expired', status: 401 });
  });
});
