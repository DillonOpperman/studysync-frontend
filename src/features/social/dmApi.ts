import type { ApiClient } from '../../api/client';
import { ApiError } from '../../api/errors';
import type {
  DirectMessageDto,
  MessageRequestDto,
  SendDirectMessageRequest,
  SendDirectMessageResult,
} from '../../api/types';

type SendBody =
  | { outcome: 'directMessage'; message: DirectMessageDto }
  | { outcome: 'messageRequest'; messageRequest: MessageRequestDto };

export function parseSendDirectMessage(
  status: number,
  body: SendBody,
): SendDirectMessageResult {
  if (body.outcome === 'directMessage' && body.message) {
    return { kind: 'directMessage', status, message: body.message };
  }
  if (body.outcome === 'messageRequest' && body.messageRequest) {
    return {
      kind: 'messageRequest',
      status,
      messageRequest: body.messageRequest,
    };
  }
  throw new ApiError(
    status,
    'invalid_response',
    'Unexpected direct-message response',
  );
}

export function dmApi(client: ApiClient) {
  return {
    list(
      userId: string,
      query: { before?: string; after?: string; limit?: number } = {},
    ) {
      const params = new URLSearchParams();
      if (query.before) {
        params.set('before', query.before);
      }
      if (query.after) {
        params.set('after', query.after);
      }
      if (query.limit) {
        params.set('limit', String(query.limit));
      }
      const suffix = params.toString() ? `?${params.toString()}` : '';
      return client.request<DirectMessageDto[]>(
        `/direct-messages/${userId}${suffix}`,
        { method: 'GET' },
      );
    },
    async send(body: SendDirectMessageRequest) {
      const { status, data } = await client.requestResult<SendBody>(
        '/direct-messages',
        {
          method: 'POST',
          body: JSON.stringify(body),
        },
      );
      return parseSendDirectMessage(status, data);
    },
    listMessageRequests() {
      return client.request<MessageRequestDto[]>('/message-requests', {
        method: 'GET',
      });
    },
    acceptMessageRequest(requestId: string) {
      return client.request<MessageRequestDto>(
        `/message-requests/${requestId}/accept`,
        { method: 'POST' },
      );
    },
    rejectMessageRequest(requestId: string) {
      return client.request<MessageRequestDto>(
        `/message-requests/${requestId}/reject`,
        { method: 'POST' },
      );
    },
  };
}
