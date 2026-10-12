import type { ApiClient } from '../../api/client';
import type { NotificationDto } from '../../api/types';
import { NOTIFICATION_LIST_MAX_LIMIT } from '../../api/types';

export function notificationsApi(client: ApiClient) {
  return {
    list(
      query: { limit?: number; offset?: number } = {},
      signal?: AbortSignal,
    ) {
      const params = new URLSearchParams();
      if (query.limit != null) {
        params.set(
          'limit',
          String(
            Math.min(NOTIFICATION_LIST_MAX_LIMIT, Math.max(1, query.limit)),
          ),
        );
      }
      if (query.offset != null) {
        params.set('offset', String(Math.max(0, query.offset)));
      }
      const suffix = params.toString() ? `?${params.toString()}` : '';
      return client.request<NotificationDto[]>(`/notifications${suffix}`, {
        method: 'GET',
        signal,
      });
    },
    markRead(id: string) {
      return client.request<void>(`/notifications/${id}/read`, {
        method: 'POST',
        parseJson: false,
      });
    },
    markAllRead() {
      return client.request<void>('/notifications/read-all', {
        method: 'POST',
        parseJson: false,
      });
    },
  };
}
