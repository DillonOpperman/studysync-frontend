import type { NotificationDto } from '../../api/types';
import { isUserId } from '../social/userId';

export type NotificationDestination =
  | { kind: 'friends' }
  | { kind: 'groupDetail'; groupId: string }
  | { kind: 'directChat'; userId: string }
  | { kind: 'none' };

function payloadObject(data: unknown): Record<string, unknown> | null {
  if (data == null || typeof data !== 'object' || Array.isArray(data)) {
    return null;
  }
  return data as Record<string, unknown>;
}

export function payloadId(data: unknown, key: string): string | null {
  const object = payloadObject(data);
  if (!object) {
    return null;
  }
  const value = object[key];
  if (typeof value !== 'string' || !isUserId(value)) {
    return null;
  }
  return value;
}

export function notificationDestination(
  note: Pick<NotificationDto, 'type' | 'data'>,
): NotificationDestination {
  switch (note.type) {
    case 'friend_request':
    case 'friend_request_accepted':
    case 'friend_request_rejected':
    case 'message_request':
      return { kind: 'friends' };
    case 'join_request':
    case 'request_approved':
    case 'request_rejected':
    case 'group_announcement': {
      const groupId = payloadId(note.data, 'groupId');
      return groupId ? { kind: 'groupDetail', groupId } : { kind: 'none' };
    }
    case 'direct_message': {
      const userId = payloadId(note.data, 'senderId');
      return userId ? { kind: 'directChat', userId } : { kind: 'none' };
    }
    case 'message_request_accepted': {
      const userId = payloadId(note.data, 'userId');
      return userId ? { kind: 'directChat', userId } : { kind: 'none' };
    }
    default:
      return { kind: 'none' };
  }
}

export function notificationMark(type: string): string {
  switch (type) {
    case 'friend_request':
    case 'friend_request_accepted':
    case 'friend_request_rejected':
      return '✦';
    case 'join_request':
    case 'request_approved':
    case 'request_rejected':
    case 'group_announcement':
      return '▣';
    case 'direct_message':
    case 'message_request':
    case 'message_request_accepted':
      return '✉';
    default:
      return '·';
  }
}
