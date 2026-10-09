import type { ApiClient } from '../../api/client';
import type { MediaDto } from '../../api/types';
import type { LocalAttachment } from './limits';

export type MediaPurpose = 'group_message' | 'direct_message';

export function buildMediaForm(
  purpose: MediaPurpose,
  file: LocalAttachment,
  context: { groupId?: string; recipientId?: string },
): FormData {
  const form = new FormData();
  form.append('purpose', purpose);
  if (purpose === 'group_message' && context.groupId) {
    form.append('groupId', context.groupId);
  }
  if (purpose === 'direct_message' && context.recipientId) {
    form.append('recipientId', context.recipientId);
  }
  form.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.type,
  } as unknown as Blob);
  return form;
}

export function mediaApi(client: ApiClient) {
  return {
    upload(
      purpose: MediaPurpose,
      file: LocalAttachment,
      context: { groupId?: string; recipientId?: string },
    ) {
      return client.request<MediaDto>('/media', {
        method: 'POST',
        body: buildMediaForm(purpose, file, context),
      });
    },
    get(id: string) {
      return client.request<MediaDto>(`/media/${id}`, { method: 'GET' });
    },
    remove(id: string) {
      return client.request<void>(`/media/${id}`, {
        method: 'DELETE',
        parseJson: false,
      });
    },
  };
}
