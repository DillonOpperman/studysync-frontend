import {
  resetPendingOpenForTests,
  shouldHandleNotification,
  stashNotificationId,
  takePendingNotificationId,
} from '../src/features/push/pendingOpen';
import { notificationIdFromMessage } from '../src/features/push/messaging';
import { openOnAppStack } from '../src/features/push/openNotification';

describe('push tap helpers', () => {
  beforeEach(() => {
    resetPendingOpenForTests();
  });

  it('accepts only UUID notification ids from FCM data', () => {
    const id = '11111111-1111-4111-8111-111111111111';
    expect(notificationIdFromMessage({ data: { notificationId: id } })).toBe(
      id,
    );
    expect(
      notificationIdFromMessage({
        data: { route: 'Friends', notificationId: 'not-a-uuid' },
      }),
    ).toBeNull();
    expect(notificationIdFromMessage({ data: { userId: id } })).toBeNull();
  });

  it('stashes cold-start ids and drops signed-out leftovers via take', () => {
    stashNotificationId('11111111-1111-4111-8111-111111111111');
    expect(takePendingNotificationId()).toBe(
      '11111111-1111-4111-8111-111111111111',
    );
    expect(takePendingNotificationId()).toBeNull();
  });

  it('ignores duplicate taps on the same id', () => {
    const id = '11111111-1111-4111-8111-111111111111';
    expect(shouldHandleNotification(id, 1000)).toBe(true);
    expect(shouldHandleNotification(id, 1200)).toBe(false);
    expect(shouldHandleNotification(id, 6000)).toBe(true);
  });

  it('opens Alerts when the destination cannot be resolved', () => {
    const navigate = jest.fn();
    const nav = {
      isReady: () => true,
      navigate,
    };
    openOnAppStack(nav as never, {
      type: 'unknown_type',
      data: {},
    });
    expect(navigate).toHaveBeenCalledWith('Home', { screen: 'Notifications' });
    navigate.mockClear();
    openOnAppStack(nav as never, null);
    expect(navigate).toHaveBeenCalledWith('Home', { screen: 'Notifications' });
  });

  it('reuses Phase 8G.1 destinations without trusting payload routes', () => {
    const navigate = jest.fn();
    const nav = { isReady: () => true, navigate };
    const uuid = '11111111-1111-4111-8111-111111111111';
    openOnAppStack(nav as never, {
      type: 'direct_message',
      data: { senderId: uuid, route: 'Evil' },
    });
    expect(navigate).toHaveBeenCalledWith('DirectChat', {
      userId: uuid,
      name: 'Message',
    });
  });
});
