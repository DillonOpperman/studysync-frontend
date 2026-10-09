import type { ApiClient } from '../../api/client';
import { mediaApi, type MediaPurpose } from './mediaApi';
import type { LocalAttachment } from './limits';

export async function uploadPendingAttachments(
  client: ApiClient,
  purpose: MediaPurpose,
  files: LocalAttachment[],
  context: { groupId?: string; recipientId?: string },
  onUpdate?: (files: LocalAttachment[]) => void,
): Promise<LocalAttachment[]> {
  const next = [...files];
  const api = mediaApi(client);
  for (let index = 0; index < next.length; index += 1) {
    if (next[index].mediaId) {
      continue;
    }
    const uploaded = await api.upload(purpose, next[index], context);
    next[index] = { ...next[index], mediaId: uploaded.id };
    onUpdate?.([...next]);
  }
  return next;
}
