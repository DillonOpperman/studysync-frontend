import { ApiClient } from '../src/api/client';
import { ApiError } from '../src/api/errors';
import { dmApi, parseSendDirectMessage } from '../src/features/social/dmApi';
import { upsertDirectMessages } from '../src/features/social/dmStore';

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function api(fetchImpl: typeof fetch) {
  return dmApi(
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

const message = {
  id: 'm1',
  senderId: 'a',
  receiverId: 'b',
  content: 'hello',
  messageType: 'text',
  createdAt: '2026-01-01T00:00:00Z',
  readAt: null,
  attachments: [],
};

const request = {
  id: 'mr1',
  status: 'pending',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  sender: { id: 'a', name: 'Ada' },
  receiver: { id: 'b', name: 'Grace' },
};

describe('dmApi (mocked HTTP — not a live Rust server)', () => {
  it('treats HTTP 201 as a delivered direct message', () => {
    const result = parseSendDirectMessage(201, {
      outcome: 'directMessage',
      message,
    });
    expect(result).toEqual({
      kind: 'directMessage',
      status: 201,
      message,
    });
  });

  it('treats HTTP 202 as a new message request, not a delivered DM', () => {
    const result = parseSendDirectMessage(202, {
      outcome: 'messageRequest',
      messageRequest: request,
    });
    expect(result.kind).toBe('messageRequest');
    expect(result.status).toBe(202);
  });

  it('treats HTTP 200 existing request as still not a delivered DM', () => {
    const result = parseSendDirectMessage(200, {
      outcome: 'messageRequest',
      messageRequest: request,
    });
    expect(result).toMatchObject({ kind: 'messageRequest', status: 200 });
  });

  it('sends, lists with before cursor, and pages history', async () => {
    const page1 = Array.from({ length: 50 }, (_, index) => ({
      ...message,
      id: `m${index}`,
    }));
    const fetchImpl = jest.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (init?.method === 'POST' && url.endsWith('/direct-messages')) {
          return jsonResponse(201, { outcome: 'directMessage', message });
        }
        if (url.includes('/direct-messages/u2?before=m0&limit=50')) {
          return jsonResponse(200, [{ ...message, id: 'older' }]);
        }
        if (url.includes('/direct-messages/u2?limit=50')) {
          return jsonResponse(200, page1);
        }
        return jsonResponse(404, {
          error: { code: 'not_found', message: url },
        });
      },
    );
    const messages = api(fetchImpl as unknown as typeof fetch);
    const sent = await messages.send({
      recipientId: 'u2',
      content: 'hello',
    });
    expect(sent.kind).toBe('directMessage');
    const withFile = await messages.send({
      recipientId: 'u2',
      content: '',
      messageType: 'image',
      attachmentIds: ['media-1'],
    });
    expect(withFile.kind).toBe('directMessage');
    const first = await messages.list('u2', { limit: 50 });
    expect(first).toHaveLength(50);
    const older = await messages.list('u2', { before: 'm0', limit: 50 });
    expect(older[0].id).toBe('older');
  });

  it('prevents duplicate ids when merging pages', () => {
    const merged = upsertDirectMessages(
      [message],
      [message, { ...message, id: 'm2', content: 'later' }],
    );
    expect(merged.map(row => row.id)).toEqual(['m1', 'm2']);
  });

  it('maps blocked and cannot-message errors', async () => {
    const messages = api(
      jest.fn(async () =>
        jsonResponse(403, {
          error: { code: 'user_blocked', message: 'blocked' },
        }),
      ) as unknown as typeof fetch,
    );
    await expect(messages.list('u2')).rejects.toMatchObject({
      name: 'ApiError',
      code: 'user_blocked',
    } satisfies Partial<ApiError>);
    const cannot = api(
      jest.fn(async () =>
        jsonResponse(403, {
          error: { code: 'cannot_message', message: 'no' },
        }),
      ) as unknown as typeof fetch,
    );
    await expect(
      cannot.send({ recipientId: 'u2', content: 'hi' }),
    ).rejects.toMatchObject({ code: 'cannot_message' });
  });

  it('accepts and rejects message requests', async () => {
    const fetchImpl = jest.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith('/message-requests')) {
        return jsonResponse(200, [request]);
      }
      if (url.endsWith('/message-requests/mr1/accept')) {
        return jsonResponse(200, { ...request, status: 'accepted' });
      }
      if (url.endsWith('/message-requests/mr1/reject')) {
        return jsonResponse(200, { ...request, status: 'rejected' });
      }
      return jsonResponse(404, { error: { code: 'not_found', message: url } });
    });
    const messages = api(fetchImpl as unknown as typeof fetch);
    await expect(messages.listMessageRequests()).resolves.toHaveLength(1);
    await expect(messages.acceptMessageRequest('mr1')).resolves.toMatchObject({
      status: 'accepted',
    });
    await expect(messages.rejectMessageRequest('mr1')).resolves.toMatchObject({
      status: 'rejected',
    });
  });

  it('surfaces expired sessions', async () => {
    const messages = api(
      jest.fn(async () =>
        jsonResponse(401, {
          error: { code: 'token_expired', message: 'expired' },
        }),
      ) as unknown as typeof fetch,
    );
    await expect(messages.list('u2')).rejects.toMatchObject({
      code: 'token_expired',
      status: 401,
    });
  });
});
