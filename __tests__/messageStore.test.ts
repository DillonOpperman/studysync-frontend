import {
  applyReactionState,
  canDeleteMessage,
  canEditMessage,
  upsertMessages,
  validateOutgoingContent,
} from '../src/features/chat/messageStore';
import { chatMessage } from '../src/testSupport/chatFixtures';

describe('messageStore (pure — not a live backend)', () => {
  it('reconciles REST history and websocket events by id and clientMsgId', () => {
    const pending = {
      ...chatMessage({
        id: 'temp',
        clientMsgId: 'c9',
        content: 'Hi',
        createdAt: '2026-01-01T00:01:00.000Z',
      }),
      pending: true,
    };
    const fromWs = chatMessage({
      id: 'server-9',
      clientMsgId: 'c9',
      content: 'Hi',
      createdAt: '2026-01-01T00:01:00.100Z',
    });
    const merged = upsertMessages([pending], [fromWs]);
    expect(merged).toHaveLength(1);
    expect(merged[0]).toMatchObject({
      id: 'server-9',
      pending: false,
      content: 'Hi',
    });
  });

  it('pages older messages without duplicating ids', () => {
    const newer = chatMessage({
      id: 'm2',
      clientMsgId: 'c2',
      createdAt: '2026-01-01T00:02:00.000Z',
    });
    const older = chatMessage({
      id: 'm0',
      clientMsgId: 'c0',
      createdAt: '2026-01-01T00:00:00.000Z',
    });
    const merged = upsertMessages([newer, newer], [older, newer]);
    expect(merged.map(row => row.id)).toEqual(['m0', 'm2']);
  });

  it('validates empty and oversized content the same way as the API', () => {
    expect(validateOutgoingContent('   ')).toBe('content is required');
    expect(validateOutgoingContent('ok')).toBeNull();
    expect(validateOutgoingContent('x'.repeat(4001))).toMatch(/4000/);
  });

  it('limits edits to the sender within 15 minutes and lets leaders delete', () => {
    const mine = chatMessage({
      senderId: 'me',
      createdAt: new Date().toISOString(),
    });
    expect(canEditMessage(mine, 'me')).toBe(true);
    expect(canEditMessage(mine, 'other')).toBe(false);
    expect(
      canEditMessage(
        chatMessage({
          senderId: 'me',
          createdAt: '2020-01-01T00:00:00.000Z',
        }),
        'me',
      ),
    ).toBe(false);
    expect(canDeleteMessage(mine, 'other', true)).toBe(true);
    expect(canDeleteMessage(mine, 'other', false)).toBe(false);
  });

  it('applies reaction updates without inventing extra scores', () => {
    const messages = [chatMessage({ id: 'm1' })];
    const next = applyReactionState(messages, {
      messageId: 'm1',
      groupId: 'g1',
      reactions: [{ emoji: '👍', count: 1, me: true }],
    });
    expect(next[0].reactions).toEqual([{ emoji: '👍', count: 1, me: true }]);
  });
});
