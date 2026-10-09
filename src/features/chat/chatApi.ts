import type { ApiClient } from '../../api/client';
import type {
  GroupMessageDto,
  GroupMessagePageDto,
  ReactionStateDto,
  SendGroupMessageRequest,
} from '../../api/types';

export function chatApi(client: ApiClient) {
  return {
    list(
      groupId: string,
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
      return client.request<GroupMessagePageDto>(
        `/groups/${groupId}/messages${suffix}`,
        { method: 'GET' },
      );
    },
    send(groupId: string, body: SendGroupMessageRequest) {
      return client.request<GroupMessageDto>(`/groups/${groupId}/messages`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },
    edit(messageId: string, content: string) {
      return client.request<GroupMessageDto>(`/messages/${messageId}`, {
        method: 'PATCH',
        body: JSON.stringify({ content }),
      });
    },
    remove(messageId: string) {
      return client.request<GroupMessageDto>(`/messages/${messageId}`, {
        method: 'DELETE',
      });
    },
    toggleReaction(messageId: string, emoji: string) {
      return client.request<ReactionStateDto>(
        `/messages/${messageId}/reactions`,
        {
          method: 'POST',
          body: JSON.stringify({ emoji }),
        },
      );
    },
  };
}
