import type { NotificationDto } from '../../api/types';
import { NOTIFICATION_LIST_MAX_LIMIT } from '../../api/types';

/** Scan newest-first pages until a short page, 99 unread, or this cap. */
export const UNREAD_SCAN_MAX_PAGES = 20;

export type UnreadBadge = {
  count: number;
  label: string;
  complete: boolean;
};

export function unreadBadgeFromScan(
  unread: number,
  complete: boolean,
): UnreadBadge {
  if (unread >= 99) {
    return { count: 99, label: '99+', complete: false };
  }
  if (complete) {
    return {
      count: unread,
      label: unread === 0 ? '' : String(unread),
      complete: true,
    };
  }
  return {
    count: unread,
    label: unread === 0 ? '' : `${unread}+`,
    complete: false,
  };
}

export function countUnreadOnPage(page: NotificationDto[]): number {
  return page.filter(note => note.readAt == null).length;
}

export async function scanUnreadBadge(
  list: (query: {
    limit: number;
    offset: number;
  }) => Promise<NotificationDto[]>,
): Promise<UnreadBadge> {
  let offset = 0;
  let unread = 0;
  for (let page = 0; page < UNREAD_SCAN_MAX_PAGES; page += 1) {
    const batch = await list({
      limit: NOTIFICATION_LIST_MAX_LIMIT,
      offset,
    });
    unread += countUnreadOnPage(batch);
    if (unread >= 99) {
      return unreadBadgeFromScan(unread, false);
    }
    if (batch.length < NOTIFICATION_LIST_MAX_LIMIT) {
      return unreadBadgeFromScan(unread, true);
    }
    offset += NOTIFICATION_LIST_MAX_LIMIT;
  }
  return unreadBadgeFromScan(unread, false);
}
