import type { ApiClient } from '../../api/client';
import type {
  FriendListDto,
  FriendRequestDto,
  FriendRequestListDto,
} from '../../api/types';

export function friendsApi(client: ApiClient) {
  return {
    list() {
      return client.request<FriendListDto[]>('/friends', { method: 'GET' });
    },
    listRequests() {
      return client.request<FriendRequestListDto>('/friends/requests', {
        method: 'GET',
      });
    },
    sendRequest(userId: string) {
      return client.request<FriendRequestDto>('/friends/requests', {
        method: 'POST',
        body: JSON.stringify({ userId }),
      });
    },
    acceptRequest(requestId: string) {
      return client.request<FriendRequestDto>(
        `/friends/requests/${requestId}/accept`,
        { method: 'POST' },
      );
    },
    rejectRequest(requestId: string) {
      return client.request<FriendRequestDto>(
        `/friends/requests/${requestId}/reject`,
        { method: 'POST' },
      );
    },
    block(userId: string) {
      return client.request<void>('/blocks', {
        method: 'POST',
        body: JSON.stringify({ userId }),
        parseJson: false,
      });
    },
    unblock(userId: string) {
      return client.request<void>(`/blocks/${userId}`, {
        method: 'DELETE',
        parseJson: false,
      });
    },
  };
}
