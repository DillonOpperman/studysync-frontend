import type { ApiClient } from '../../api/client';
import type {
  CreateGroupRequest,
  GroupDto,
  GroupMemberDto,
  GroupSearchRequest,
  GroupSearchResponse,
  JoinRequestDto,
  RecommendResponse,
} from '../../api/types';

export function groupsApi(client: ApiClient) {
  return {
    listMine() {
      return client.request<GroupDto[]>('/groups/mine', { method: 'GET' });
    },
    get(id: string) {
      return client.request<GroupDto>(`/groups/${id}`, { method: 'GET' });
    },
    create(body: CreateGroupRequest) {
      return client.request<GroupDto>('/groups', {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },
    members(id: string) {
      return client.request<GroupMemberDto[]>(`/groups/${id}/members`, {
        method: 'GET',
      });
    },
    requestJoin(id: string) {
      return client.request<JoinRequestDto>(`/groups/${id}/join-requests`, {
        method: 'POST',
      });
    },
    listJoinRequests(id: string) {
      return client.request<JoinRequestDto[]>(`/groups/${id}/join-requests`, {
        method: 'GET',
      });
    },
    approveJoin(groupId: string, requestId: string) {
      return client.request<JoinRequestDto>(
        `/groups/${groupId}/join-requests/${requestId}/approve`,
        { method: 'POST' },
      );
    },
    rejectJoin(groupId: string, requestId: string) {
      return client.request<JoinRequestDto>(
        `/groups/${groupId}/join-requests/${requestId}/reject`,
        { method: 'POST' },
      );
    },
    leave(id: string) {
      return client.request<void>(`/groups/${id}/leave`, {
        method: 'POST',
        parseJson: false,
      });
    },
    search(body: GroupSearchRequest, signal?: AbortSignal) {
      return client.request<GroupSearchResponse>('/search/groups', {
        method: 'POST',
        body: JSON.stringify(body),
        signal,
      });
    },
    recommend() {
      return client.request<RecommendResponse>('/recommend', {
        method: 'POST',
      });
    },
  };
}
