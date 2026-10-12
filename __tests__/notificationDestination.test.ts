import {
  notificationDestination,
  payloadId,
} from '../src/features/notifications/destination';
import {
  unreadBadgeFromScan,
  scanUnreadBadge,
} from '../src/features/notifications/unread';
import { NOTIFICATION_LIST_MAX_LIMIT } from '../src/api/types';
import type { NotificationDto } from '../src/api/types';

const uuid = '11111111-1111-4111-8111-111111111111';
const other = '22222222-2222-4222-8222-222222222222';

function note(
  partial: Partial<NotificationDto> & Pick<NotificationDto, 'type'>,
): NotificationDto {
  return {
    id: 'n1',
    title: 't',
    body: 'b',
    data: {},
    readAt: null,
    createdAt: '2026-01-01T00:00:00Z',
    ...partial,
  };
}

describe('notification destination (unit — not a live Rust server)', () => {
  it('maps supported types to People, group detail, or direct chat', () => {
    expect(
      notificationDestination(
        note({ type: 'friend_request', data: { requestId: uuid } }),
      ),
    ).toEqual({ kind: 'friends' });
    expect(
      notificationDestination(note({ type: 'friend_request_accepted' })),
    ).toEqual({ kind: 'friends' });
    expect(
      notificationDestination(note({ type: 'friend_request_rejected' })),
    ).toEqual({ kind: 'friends' });
    expect(notificationDestination(note({ type: 'message_request' }))).toEqual({
      kind: 'friends',
    });
    expect(
      notificationDestination(
        note({ type: 'join_request', data: { groupId: uuid } }),
      ),
    ).toEqual({ kind: 'groupDetail', groupId: uuid });
    expect(
      notificationDestination(
        note({ type: 'request_approved', data: { groupId: uuid } }),
      ),
    ).toEqual({ kind: 'groupDetail', groupId: uuid });
    expect(
      notificationDestination(
        note({
          type: 'group_announcement',
          data: { groupId: uuid, messageId: other },
        }),
      ),
    ).toEqual({ kind: 'groupDetail', groupId: uuid });
    expect(
      notificationDestination(
        note({ type: 'direct_message', data: { senderId: uuid } }),
      ),
    ).toEqual({ kind: 'directChat', userId: uuid });
    expect(
      notificationDestination(
        note({ type: 'message_request_accepted', data: { userId: uuid } }),
      ),
    ).toEqual({ kind: 'directChat', userId: uuid });
  });

  it('does not invent destinations from missing or malformed payloads', () => {
    expect(
      notificationDestination(note({ type: 'join_request', data: {} })),
    ).toEqual({ kind: 'none' });
    expect(
      notificationDestination(
        note({ type: 'direct_message', data: { senderId: 'not-a-uuid' } }),
      ),
    ).toEqual({ kind: 'none' });
    expect(
      notificationDestination(note({ type: 'direct_message', data: null })),
    ).toEqual({ kind: 'none' });
    expect(
      notificationDestination(
        note({ type: 'unknown_event', data: { groupId: uuid } }),
      ),
    ).toEqual({ kind: 'none' });
    expect(payloadId(['nope'], 'groupId')).toBeNull();
  });
});

describe('unread badge scan (unit — not a live Rust server)', () => {
  it('counts unread across pages and does not treat one full page as the total', async () => {
    const pages: NotificationDto[][] = [
      Array.from({ length: NOTIFICATION_LIST_MAX_LIMIT }, (_, i) =>
        note({
          id: `a${i}`,
          type: 'friend_request',
          readAt: i === 0 ? null : '2026-01-01T00:00:00Z',
        }),
      ),
      [
        note({ id: 'tail', type: 'join_request', readAt: null }),
        note({
          id: 'read',
          type: 'join_request',
          readAt: '2026-01-01T00:00:00Z',
        }),
      ],
    ];
    const badge = await scanUnreadBadge(async ({ offset }) => {
      const index = offset / NOTIFICATION_LIST_MAX_LIMIT;
      return pages[index] ?? [];
    });
    expect(badge).toEqual({ count: 2, label: '2', complete: true });
  });

  it('caps the label at 99+ instead of inventing a larger total', () => {
    expect(unreadBadgeFromScan(120, false)).toEqual({
      count: 99,
      label: '99+',
      complete: false,
    });
    expect(unreadBadgeFromScan(3, false)).toEqual({
      count: 3,
      label: '3+',
      complete: false,
    });
    expect(unreadBadgeFromScan(0, true)).toEqual({
      count: 0,
      label: '',
      complete: true,
    });
  });
});
