import { parseServerEvent } from '../src/features/chat/protocol';
import {
  reconnectDelayMs,
  shouldPauseReconnect,
} from '../src/features/chat/reconnect';

describe('chat protocol (mocked — not a live WebSocket)', () => {
  it('parses backend tagged events and ignores unknown ops', () => {
    expect(parseServerEvent('{"op":"subscribed","groupId":"g1"}')).toEqual({
      op: 'subscribed',
      groupId: 'g1',
    });
    expect(
      parseServerEvent(
        '{"op":"message.created","payload":{"id":"m1","groupId":"g1"}}',
      ),
    ).toMatchObject({ op: 'message.created' });
    expect(
      parseServerEvent(
        '{"op":"error","code":"not_group_member","message":"no"}',
      ),
    ).toEqual({
      op: 'error',
      code: 'not_group_member',
      message: 'no',
    });
    expect(parseServerEvent('{"op":"typing"}')).toBeNull();
    expect(parseServerEvent('not-json')).toBeNull();
  });

  it('uses exponential backoff with jitter and pauses after too many attempts', () => {
    expect(reconnectDelayMs(0, () => 0.5)).toBe(1000);
    expect(reconnectDelayMs(3, () => 0.5)).toBe(8000);
    expect(reconnectDelayMs(20, () => 0.5)).toBe(30000);
    expect(shouldPauseReconnect(11)).toBe(false);
    expect(shouldPauseReconnect(12)).toBe(true);
  });
});
